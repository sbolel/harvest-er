'use strict';

String.prototype.toTitleCase = function(){
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

var debug = require('debug')('Harvester');
var prettyjson = require('prettyjson');
var Q = require('q');
var DateString = require('./dateString');

function Harvester(harvest){
  this._deferred = Q.defer();
  this._ready = this._deferred.promise;
  this._harvest = harvest;
  this._people = {};
  this._projects =  {};
  this._expenses = {};
  this._entries =  {};
  this._startAt = null;
  this._endAt = null;
  return this._updateData();
}

Harvester.prototype = {
  _list: function(action, options){
    var deferred = Q.defer();
    action = action.toTitleCase();
    this._harvest[action].list(options || {}, function(error, result){
      if(error)
        deferred.reject(error, result);
      deferred.resolve(result);
    });
    return deferred.promise;
  },
  _updateData: function(){
    var self = this;
    var promises = [];
    promises.push(self._list('people'));
    promises.push(self._list('projects'));
    Q.all(promises).then(function(results){
      self._people[results[0][0].user.id] = results[0][0].user;
      self._projects[results[1][0].project.id] = results[1][0].project;
      self._deferred.resolve(self);
      return self;
    });
  },
}

Harvester.prototype.loaded = function(){
  return this._ready;
};

Harvester.prototype.endAt = function(endAt){
  this._endAt = endAt;
  return this;
};

Harvester.prototype.startAt = function(startAt){
  this._startAt = startAt;
  return this;
};

Harvester.prototype.val = function(){
  var self = this;
  return {people: self._people, projects: self._projects, entries: self._entries, expenses: self._expenses};
};

// getExpensesByProject(project).startAt(YYYYMMDD).endAt();
Harvester.prototype.getExpensesForProject = function(projectId){
  var self = this, deferred = Q.defer();
  var options = {
    'project_id': projectId,
    'from': self._startAt || DateString.today(),
    'to': self._endAt || DateString.tomorrow()
  };
  self._harvest.Reports.expensesByProject(options, function(error, data){
    if(error) deferred.reject(error);
    deferred.resolve(data);
  });
  return deferred.promise;
};

Harvester.prototype.getExpenses = function(){
  var self = this, deferred = Q.defer(), tasks = [], key, i, j;
  for(key in self._projects){
    tasks.push(self.getExpensesForProject(self._projects[key].id));
  }
  Q.all(tasks).then(function(result){
    for(i in result[0]){
      self._expenses[result[0][i].expense.id] = result[0][i].expense;
    }
    deferred.resolve(self._expenses);
  });
  return deferred.promise;
}

Harvester.prototype.getTimeEntriesForPerson = function(personId){
  var self = this;
  var deferred = Q.defer();
  var options = {
    'user_id': personId,
    'from': self._startAt || DateString.today(),
    'to': self._endAt || DateString.tomorrow()
  };
  self._harvest.Reports.timeEntriesByUser(options, function(error, data){
    if(error) deferred.reject(error);
    deferred.resolve(data);
  });
  return deferred.promise;
}

Harvester.prototype.getTimesheets = function(){
  var self = this, deferred = Q.defer(), tasks = [], key, i, j;
  for(key in self._people){
    tasks.push(self.getTimeEntriesForPerson(self._people[key].id));
  }
  Q.all(tasks).then(function(result){
    for(i in result){
      self._entries[result[0][i].day_entry.id] = result[0][i].day_entry;
    }
    deferred.resolve(self._entries);
  });
  return deferred.promise;
};

module.exports = Harvester;

