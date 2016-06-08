'use strict';

const debug = require('debug')('Application');
const express = require('express');
const Q = require('q');
const routes = require('./routes');
const Harvest = require('harvest');
const packageInfo = require('./../package.json');
const Harvester = require('./harvester');

const app = express();

app.use('/', routes);

app.package = packageInfo;

const getTodaysData = () => {
  const harvest = new Harvest({
    subdomain: process.env.HARVEST_SUBDOMAIN,
    email: process.env.HARVEST_ADMIN_EMAIL,
    password: process.env.HARVEST_ADMIN_TOKEN
  });
  const harvester = new Harvester(harvest);
  const tasks = [];
  harvester.loaded().then((teamData) => {
    tasks.push(harvester.getExpenses());
    tasks.push(harvester.getTimesheets());
    Q.all(tasks).then((results) => {
      debug(harvester.val());
    });
  });
};

getTodaysData();

module.exports = app;
