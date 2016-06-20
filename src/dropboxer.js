'use strict';

const debug = require('debug')('Dropboxer');
const dateString = require('./dateString');
const Dropbox = require('dropbox');
const Q = require('q');

// Server-side applications use both the API key and secret.
const client = new Dropbox.Client({
  key: process.env.HARVESTER_DROPBOX_KEY,
  secret: process.env.HARVESTER_DROPBOX_SECRET,
  token: process.env.HARVESTER_DROPBOX_TOKEN
});

const getRandomString = () => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text;
  for (let i = 0; i < 5; i++)
    text = `${text}${possible.charAt(Math.floor(Math.random() * possible.length))}`;
  return text;
};

const writeJsonToTodaysFile = (data) => {
  debug('Writing new file to Dropbox...');
  const date = new Date();
  const filePath = '/harvest-data/' + dateString.today() + '.json';
  const writeData = JSON.stringify(data);
  return new Promise((resolve, reject) => {
    client.writeFile(filePath, writeData, (error, stat) => {
      if (error) {
        reject(error);
      } else {
        resolve(filePath);
      }
    });
  });
};

module.exports = {
  writeTodaysFile: writeJsonToTodaysFile
};
