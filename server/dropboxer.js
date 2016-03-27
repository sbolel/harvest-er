'use strict';

var debug = require('debug')('Dropboxer');
var Dropbox = require('dropbox');
var DateString = require('./DateString');
var Q = require('q');

// Server-side applications use both the API key and secret.
var client = new Dropbox.Client({
  key: process.env.HARVESTER_DROPBOX_KEY,
  secret: process.env.HARVESTER_DROPBOX_SECRET,
  token: process.env.HARVESTER_DROPBOX_TOKEN
});

var getRandomString = function() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

function writeJsonToTodaysFile(data) {
  var deferred = Q.defer();
  debug('Writing new file to Dropbox...');
  var date = new Date();
  var filePath = '/harvest-data/' + DateString.today() + '.json';
  var writeData = JSON.stringify(data);
  client.writeFile(filePath, writeData, function(error, stat) {
    if (error) {
      deferred.reject(error);
    }
    deferred.resolve(filePath);
  });
  return deferred.promise;
}

module.exports = {
  writeTodaysFile: writeJsonToTodaysFile
};