process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import * as config from 'config';
import * as request from 'supertest';
import { expect } from 'chai';
import * as fs from 'fs-extra';
import { describe, before, afterEach, beforeEach, after } from 'mocha';
import { Client } from 'pg';


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

          const stats = await fs.stat('./data/logs/services/service1.log');

          expect(stats.isFile()).to.be.true;
          done();
        });
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

          const stats = await fs.stat('./data/logs/requests/101.log');

          expect(stats.isFile()).to.be.true;
          done();
        });
    });

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

});
