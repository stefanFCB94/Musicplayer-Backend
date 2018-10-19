#!/usr/bin/env node

const promiseShim = require('promise.prototype.finally');
promiseShim.shim();

const Jasmine = require('jasmine');
const jasmine = new Jasmine();
jasmine.loadConfig({
  spec_dir: 'dist-test',
  spec_files: [ '**/*.[sS]pec.js' ],
  helpers: [],
  random: false,
  seed: null,
  stopSpecOnExpectationFailure: false
});


const JasmineConsoleReporter = require('jasmine-console-reporter');
const reporter = new JasmineConsoleReporter({
  colors: 1,
  cleanStack: 1,
  verbosity: 4,
  listStyle: 'indent',
  activity: true,
  emoji: false,
  beep: false
});

jasmine.env.clearReporters();
jasmine.addReporter(reporter);
jasmine.execute();