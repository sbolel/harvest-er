'use strict';

const debug = require('debug')('Harvester');
const prettyjson = require('prettyjson');
const DateString = require('./dateString');

String.prototype.toTitleCase = () =>
  this.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

class Harvester {
  constructor(harvest) {
    this._deferred = Q.defer();
    this._ready = this._deferred.promise;
    this._harvest = harvest;
    this._people = {};
    this._projects =  {};
    this._expenses = {};
    this._entries =  {};
    this._startAt = null;
    this._endAt = null;
    return this.updateData();
  }
  list(action, options) {
    const deferred = Q.defer();
    this._harvest[action.toTitleCase()].list(options || {}, (error, result) => {
      if(error) {
        deferred.reject(error, result);
      } else {
        deferred.resolve(result);
      }
    });
    return deferred.promise;
  }
  updateData() {
    const self = this;
    const promises = [];
    promises.push(self.list('people'));
    promises.push(self.list('projects'));
    Q.all(promises).then((results) => {
      self._people[results[0][0].user.id] = results[0][0].user;
      self._projects[results[1][0].project.id] = results[1][0].project;
      self._deferred.resolve(self);
      return self;
    });
  }
  loaded() {
    return this._ready;
  }
  endAt(endAt) {
    this._endAt = endAt;
    return this;
  }
  startAt(startAt) {
    this._startAt = startAt;
    return this;
  }
  val() {
    return {
      people: this._people,
      projects: this._projects,
      entries: this._entries,
      expenses: this._expenses,
    };
  }
  getExpensesForProject(projectId) {
    const deferred = Q.defer();
    const options = {
      'project_id': projectId,
      'from': this._startAt || DateString.today(),
      'to': this._endAt || DateString.tomorrow()
    };
    this._harvest.Reports.expensesByProject(options, (error, data) => {
      if(error) {
        deferred.reject(error);
      } else {
        deferred.resolve(data);
      }
    });
    return deferred.promise;
  }
  getExpenses() {
    const self = this;
    const deferred = Q.defer();
    const tasks = [];
    let key;
    let i;
    let j;
    for(key in this._projects){
      tasks.push(this.getExpensesForProject(this._projects[key].id));
    }
    Q.all(tasks).then((result) => {
      for(i in result[0]){
        self._expenses[result[0][i].expense.id] = result[0][i].expense;
      }
      deferred.resolve(self._expenses);
    }).catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }
  getTimeEntriesForPerson(personId) {
    const deferred = Q.defer();
    const options = {
      'user_id': personId,
      'from': this._startAt || DateString.today(),
      'to': this._endAt || DateString.tomorrow(),
    };
    this._harvest.Reports.timeEntriesByUser(options, (error, data) => {
      if(error) {
        deferred.reject(error);
      } else {
        deferred.resolve(data);
      }
    });
    return deferred.promise;
  }
  getTimesheets() {
    const deferred = Q.defer();
    const tasks = [];
    let key;
    let i;
    let j;
    for(key in this._people){
      tasks.push(this.getTimeEntriesForPerson(this._people[key].id));
    }
    Q.all(tasks).then((result) => {
      for(i in result){
        self._entries[result[0][i].day_entry.id] = result[0][i].day_entry;
      }
      deferred.resolve(self._entries);
    }).catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }
};

module.exports = Harvester;
