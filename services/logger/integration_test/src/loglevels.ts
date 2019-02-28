process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import * as config from 'config';
import * as request from 'supertest';
import { expect } from 'chai';
import { describe, before, afterEach, beforeEach, after } from 'mocha';
import { Client } from 'pg';


describe('Integration tests log level configuration', () => {

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


  describe('GET /v1/config/levels/service', () => {

    before(async () => {
      // Insert default test data
      await client.query("insert into log_level(service, level) values('service1', 'warn')");
      await client.query("insert into log_level(service, level) values('service2', 'info')");
    });

    after(async () => {
      await client.query('delete from log_level');
    });


    it('should return the complete data with an status code 200', (done) => {
      request('https://appl')
        .get('/v1/config/levels/service')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(0);

          expect(data.body.data).to.be.an('array');
          expect(data.body.data).to.have.lengthOf(2);

          expect(data.body.data[0].service).to.equal('service1');
          expect(data.body.data[0].level).to.equal('warn');

          expect(data.body.data[1].service).to.equal('service2');
          expect(data.body.data[1].level).to.equal('info');

          done();
        });
    });


  });

  describe('POST /v1/config/levels/service', () => {

    afterEach(async () => {
      await client.query('delete from log_level');
    });

    it('should insert the log level, if service is not defined', (done) => {
      request('https://appl')
        .post('/v1/config/levels/service')
        .send({ service: 'service1', level: 'warn' })
        .set('Accept', 'application/json')
        .expect(200)
        .end(async (err, data) => {
          if (err) return done(err);

          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(0);

          expect(data.body.data).to.be.an('object');
          expect(data.body.data.logLevel).to.be.an('object');

          expect(data.body.data.logLevel.service).to.equal('service1');
          expect(data.body.data.logLevel.level).to.equal('warn');


          const dbData = await client.query("select * from log_level where service = 'service1'");

          expect(dbData.rows).to.have.lengthOf(1);
          expect(dbData.rows[0].level).to.equal('warn');
          expect(dbData.rows[0].created).not.to.be.null;
          expect(dbData.rows[0].updated).not.to.be.null;

          done();
        });
    });

    it('should update the log level, if service is already defined', (done) => {
      client.query("insert into log_level values('service1', 'info')")
        .then(() => {
          request('https://appl')
            .post('/v1/config/levels/service')
            .send({ service: 'service1', level: 'warn' })
            .set('Accept', 'application/json')
            .expect(200)
            .end(async (err, data) => {
              if (err) return done(err);

              expect(data.body.errors).to.be.an('array');
              expect(data.body.errors).to.have.lengthOf(0);

              expect(data.body.data).to.be.an('object');
              expect(data.body.data.logLevel).to.be.an('object');

              expect(data.body.data.logLevel.service).to.equal('service1');
              expect(data.body.data.logLevel.level).to.equal('warn');
              expect(data.body.data.logLevel.create).not.to.equal(data.body.data.logLevel.updated);

              const dbData = await client.query("select * from log_level where service = 'service1'");

              expect(dbData.rows).to.have.lengthOf(1);
              expect(dbData.rows[0].level).to.equal('warn');
              expect(dbData.rows[0].created).not.to.equal(dbData.rows[0].updated);

              done();
            });
        });
    });

    it('should return 400 with correct error, if invalid log level is passed to api', (done) => {
      request('https://appl')
        .post('/v1/config/levels/service')
        .send({ service: 'service1', level: 'invalid' })
        .set('Accept', 'application/json')
        .expect(400)
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data).to.be.null;
          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(1);

          expect(data.body.errors[0].type).to.equal('InvalidParameterValueError');

          done();
        });
    });

    it('should return 400 with correct error, if a too long service name is passed', (done) => {
      request('https://appl')
        .post('/v1/config/levels/service')
        .send({ service: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789', level: 'info' })
        .set('Accept', 'application/json')
        .expect(400)
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data).to.be.null;
          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(1);
          expect(data.body.errors[0].type).to.equal('ParameterTooLongError');

          done();
        });
    });

    it('should return 400 with correct error, if parameter service is not passed to the api', (done) => {
      request('https://appl')
        .post('/v1/config/levels/service')
        .send({ level: 'info' })
        .set('Accept', 'application/json')
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data).to.be.null;
          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(1);
          expect(data.body.errors[0].type).to.equal('RequiredParameterNotSetError');

          done();
        });
    });

    it('should return 400 with correct error, if parameter level is not passed to api', (done) => {
      request('https://appl')
        .post('/v1/config/levels/service')
        .send({ service: 'service1' })
        .set('Accept', 'application/json')
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data).to.be.null;
          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(1);
          expect(data.body.errors[0].type).to.equal('RequiredParameterNotSetError');

          done();
        });
    });
  });

  describe('GET /v1/config/levels/service/(:service)', () => {

    before(async () => {
      await client.query("insert into log_level(service, level) values('service1', 'info')");
      await client.query("insert into log_level(service, level) values('service2', 'warn')");
    });

    after(async () => {
      await client.query('delete from log_level');
    });

    it('should return 404 with correct error, if service is not found', (done) => {
      request('https://appl')
        .get('/v1/config/levels/service/service3')
        .set('Accept', 'application/json')
        .expect(404)
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data).to.be.null;
          expect(data.body.errors).to.be.an('array');

          expect(data.body.errors).to.have.lengthOf(1);
          expect(data.body.errors[0].type).to.equal('EntityNotFoundError');

          done();
        });
    });

    it('should return 200 with the data of the service', (done) => {
      request('https://appl')
        .get('/v1/config/levels/service/service1')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(0);

          expect(data.body.data).to.be.an('object');
          expect(data.body.data.logLevel).to.be.an('object');
          expect(data.body.data.logLevel.service).to.equal('service1');
          expect(data.body.data.logLevel.level).to.equal('info');

          done();
        });
    });

  });

  describe('PUT /v1/config/levels/service/(:service)', () => {

    afterEach(async () => {
      await client.query('delete from log_level');
    });

    it('should insert the log level, if service is not defined', (done) => {
      request('https://appl')
        .put('/v1/config/levels/service/service1')
        .send({ service: 'service1', level: 'warn' })
        .set('Accept', 'application/json')
        .expect(200)
        .end(async (err, data) => {
          if (err) return done(err);

          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(0);

          expect(data.body.data).to.be.an('object');
          expect(data.body.data.logLevel).to.be.an('object');

          expect(data.body.data.logLevel.service).to.equal('service1');
          expect(data.body.data.logLevel.level).to.equal('warn');


          const dbData = await client.query("select * from log_level where service = 'service1'");

          expect(dbData.rows).to.have.lengthOf(1);
          expect(dbData.rows[0].level).to.equal('warn');
          expect(dbData.rows[0].created).not.to.be.null;
          expect(dbData.rows[0].updated).not.to.be.null;

          done();
        });
    });

    it('should update the log level, if service is already defined', (done) => {
      client.query("insert into log_level values('service1', 'info')")
        .then(() => {
          request('https://appl')
            .put('/v1/config/levels/service/service1')
            .send({ service: 'service1', level: 'warn' })
            .set('Accept', 'application/json')
            .expect(200)
            .end(async (err, data) => {
              if (err) return done(err);

              expect(data.body.errors).to.be.an('array');
              expect(data.body.errors).to.have.lengthOf(0);

              expect(data.body.data).to.be.an('object');
              expect(data.body.data.logLevel).to.be.an('object');

              expect(data.body.data.logLevel.service).to.equal('service1');
              expect(data.body.data.logLevel.level).to.equal('warn');
              expect(data.body.data.logLevel.create).not.to.equal(data.body.data.logLevel.updated);

              const dbData = await client.query("select * from log_level where service = 'service1'");

              expect(dbData.rows).to.have.lengthOf(1);
              expect(dbData.rows[0].level).to.equal('warn');
              expect(dbData.rows[0].created).not.to.equal(dbData.rows[0].updated);

              done();
            });
        });
    });

    it('should return 400 with correct error, if invalid log level is passed to api', (done) => {
      request('https://appl')
        .put('/v1/config/levels/service/service1')
        .send({ service: 'service1', level: 'invalid' })
        .set('Accept', 'application/json')
        .expect(400)
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data).to.be.null;
          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(1);

          expect(data.body.errors[0].type).to.equal('InvalidParameterValueError');

          done();
        });
    });

    it('should return 400 with correct error, if a too long service name is passed', (done) => {
      request('https://appl')
        .put('/v1/config/levels/service/service1')
        .send({ service: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789', level: 'info' })
        .set('Accept', 'application/json')
        .expect(400)
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data).to.be.null;
          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(1);
          expect(data.body.errors[0].type).to.equal('ParameterTooLongError');

          done();
        });
    });

    it('should return 400 with correct error, if parameter service is not passed to the api', (done) => {
      request('https://appl')
        .put('/v1/config/levels/service/service1')
        .send({ level: 'info' })
        .set('Accept', 'application/json')
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data).to.be.null;
          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(1);
          expect(data.body.errors[0].type).to.equal('RequiredParameterNotSetError');

          done();
        });
    });

    it('should return 400 with correct error, if parameter level is not passed to api', (done) => {
      request('https://appl')
        .put('/v1/config/levels/service/service1')
        .send({ service: 'service1' })
        .set('Accept', 'application/json')
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data).to.be.null;
          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(1);
          expect(data.body.errors[0].type).to.equal('RequiredParameterNotSetError');

          done();
        });
    });
  });

  describe('DELETE /v1/config/levels/service/(:service)', () => {

    beforeEach(async () => {
      await client.query("insert into log_level(service, level) values('service1', 'warn')");
      await client.query("insert into log_level(service, level) values('service2', 'info')");
    });

    afterEach(async () => {
      await client.query('delete from log_level');
    });

    it('should return 200 and deletes the service from the database', (done) => {
      request('https://appl')
        .delete('/v1/config/levels/service/service1')
        .set('Accept', 'application/json')
        .expect(200)
        .end(async (err, data) => {
          if (err) return done(err);

          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors).to.have.lengthOf(0);

          expect(data.body.data).to.be.an('object');
          expect(data.body.data.logLevel).to.be.an('object');

          expect(data.body.data.logLevel.service).to.equal('service1');
          expect(data.body.data.logLevel.level).to.equal('warn');

          const dbData = await client.query('select * from log_level');

          expect(dbData.rows).to.have.lengthOf(1);
          expect(dbData.rows[0].service).to.equal('service2');

          done();
        });
    });

    it('should return 404, if service could not be found', (done) => {
      request('https://appl')
        .delete('/v1/config/levels/service/service3')
        .set('Accept', 'application/json')
        .expect(404)
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data).to.be.null;
          expect(data.body.errors).to.be.an('array');
          expect(data.body.errors[0].type).to.equal('EntityNotFoundError');

          done();
        });
    });

  });

});
