process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import * as config from 'config';
import * as request from 'supertest';
import { expect } from 'chai';
import * as fs from 'fs-extra';
import { describe, before, afterEach, beforeEach, after } from 'mocha';
import { Client } from 'pg';


function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    },         milliseconds);
  });
}



describe('Integeration tests logging', () => {

  let client: Client;

  before(async () => {
    client = new Client({
      host: config.get('DB.HOST'),
      port: config.get('DB.PORT'),
      user: config.get('LOGGER.DB.USERNAME'),
      password: config.get('LOGGER.DB.PASSWORD'),
      database: config.get('LOGGER.DB.DATABASE'),
    });

    await client.connect();
  });

  after(async () => {
    await client.end();
  });


  describe('POST /v1/service/(:service)/logger', () => {

    beforeEach(async () => {
      await fs.emptyDir('./data/logs');
    });

    it('should create log file for service and return status 204', (done) => {
      request('https://appl')
        .post('/v1/service/service1/logger')
        .expect(204)
        .end(async (err) => {
          if (err) return done(err);

          await wait(1000);

          const stats = await fs.stat('./data/logs/services/service1.log');

          expect(stats.isFile()).to.be.true;
          done();
        }).timeout(5000);
    });
  });

  describe('DELETE /v1/service/(:service/logger', () => {

    beforeEach(async () => {
      await fs.emptyDir('./data/logs');
    });

    it('should return 204, after closing logger', (done) => {
      request('https://appl')
        .post('/v1/service/service1/logger')
        .end((err, data) => {
          if (err) return done(err);

          request('https://appl')
            .delete('/v1/service/service1/logger')
            .expect(204)
            .end((err, data) => {
              if (err) return done(err);
              done();
            });
        });
    });
  });

  describe('POST /v1/request/(:request)/logger', () => {

    beforeEach(async () => {
      await fs.emptyDir('./data/logs');
    });

    it('should create log file for request an return status 204', (done) => {
      request('https://appl')
        .post('/v1/request/101/logger')
        .expect(204)
        .end(async (err, data) => {
          if (err) return done(err);

          await wait(1000);

          const stats = await fs.stat('./data/logs/requests/101.log');

          expect(stats.isFile()).to.be.true;
          done();
        });
    }).timeout(5000);

  });

  describe('DELETE /v1/request/(:request)/logger', () => {

    beforeEach(async () => {
      await fs.emptyDir('./data/logs');
    });

    it('should return status 204', (done) => {
      request('https://appl')
        .delete('/v1/request/101/logger')
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });

  });

  describe('POST /v1/logs', () => {

    beforeEach(async () => {
      await fs.emptyDir('./data/logs');
      await client.query("insert into log_level(service, level) values('service1', 'info')");
      await client.query("insert into log_level(service, level) values('__REQUEST__', 'debug')");
    });

    afterEach(async () => {
      await fs.emptyDir('./data/logs');
      await client.query('delete from log_level');

      await request('https://appl').delete('/v1/service/service1/logger');
      await request('https://appl').delete('/v1/request/123/logger');
    });

    it('should return status code 204', (done) => {
      request('https://appl')
        .post('/v1/logs')
        .send({ service: 'service1', request: 123, message: 'message', level: 'debug' })
        .expect(204)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });

    it('should create the log file for the service, even when logger was not initialized before', (done) => {
      request('https://appl')
        .post('/v1/logs')
        .send({ service: 'service1', request: 123, message: 'message', level: 'debug' })
        .expect(204)
        .end(async (err) => {
          if (err) return done(err);

          await wait(1000);

          try {
            const stats = await fs.stat('./data/logs/services/service1.log');
            expect(stats.isFile()).to.be.true;

            done();
          } catch (err) {
            done(err);
          }
        });
    }).timeout(5000);

    it('should create the log file for the request, even when the logger was not initialized before', (done) => {
      request('https://appl')
        .post('/v1/logs')
        .send({ service: 'service1', request: 123, message: 'message', level: 'debug' })
        .expect(204)
        .end(async (err) => {
          if (err) return done(err);

          await wait(1000);

          try {
            const stats = await fs.stat('./data/logs/requests/123.log');
            expect(stats.isFile()).to.be.true;

            done();
          } catch (err) {
            done(err);
          }
        });
    }).timeout(5000);

    it('should log the message in service log file', (done) => {
      request('https://appl')
        .post('/v1/logs')
        .send({ service: 'service1', request: 123, message: 'message', level: 'info' })
        .expect(204)
        .end(async (err) => {
          if (err) return done(err);

          await wait(1000);

          try {
            const content = await fs.readFile('./data/logs/services/service1.log');
            expect(content.toString()).to.have.string('message');

            done();
          } catch (err) {
            done(err);
          }
        });
    }).timeout(5000);

    it('should log the message in the request log file', (done) => {
      request('https://appl')
        .post('/v1/logs')
        .send({ service: 'service1', request: 123, message: 'message', level: 'debug' })
        .expect(204)
        .end(async (err) => {
          if (err) return done(err);

          await wait(1000);

          try {
            const content = await fs.readFile('./data/logs/requests/123.log');
            expect(content.toString()).to.have.string('message');

            done();
          } catch (err) {
            done(err);
          }
        });
    }).timeout(5000);

    it('should not log the message for the service, if the log level of the message is not high enough', (done) => {
      request('https://appl')
        .post('/v1/logs')
        .send({ service: 'service1', request: 123, message: 'message', level: 'debug' })
        .expect(204)
        .end(async (err) => {
          if (err) return done(err);

          await wait(1000);

          try {
            const content = await fs.readFile('./data/logs/services/service1.log');
            expect(content.toString()).not.to.have.string('message');

            done();
          } catch (err) {
            done(err);
          }
        });
    }).timeout(5000);

    it('should not log the message for the request, if the log level of the message is not high enough', (done) => {
      request('https://appl')
        .post('/v1/logs')
        .send({ service: 'service1', request: 123, message: 'message', level: 'silly' })
        .expect(204)
        .end(async (err) => {
          if (err) return done(err);

          await wait(1000);

          try {
            const content = await fs.readFile('./data/logs/requests/123.log');
            expect(content.toString()).not.to.have.string('message');

            done();
          } catch (err) {
            done(err);
          }
        });
    }).timeout(5000);

  });

});
