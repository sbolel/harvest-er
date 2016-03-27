#!/usr/bin/env node
'use strict';

var debug = require('debug')('Application'),
    express = require('express'),
    Q = require('q'),
    _package = require('./../package.json'),
    _routes = require('./routes'),
    Harvest = require('harvest'),
    Harvester = require('./harvester');

var app = express();
app.use('/', _routes);
app.packageInfo = _package;

module.exports = app;

getTodaysData();

function getTodaysData(){
  var harvest = new Harvest({
    subdomain: process.env.HARVEST_SUBDOMAIN,
    email: process.env.HARVEST_ADMIN_EMAIL,
    password: process.env.HARVEST_ADMIN_TOKEN
  });
  var harvester = new Harvester(harvest);
  var tasks = [];
  harvester.loaded().then(function(teamData){
    tasks.push(harvester.getExpenses());
    tasks.push(harvester.getTimesheets());
    Q.all(tasks).then(function(results){
      debug(harvester.val());
    });
  });
}
