'use strict';

var Moment = require('moment');

module.exports = {
  today: function(){
    var m = Moment();
    var result = m.format('YYYYMMDD');
    return result;
  },
  tomorrow: function(){
    var m = Moment();
    var result = m.add(1, 'days').format('YYYYMMDD');
    return result;
  },
  startOfWeek: function(){
    var m = Moment();
    var n = m.subtract(m.day()-1, 'days');
    var result = n.startOf('day').format('YYYYMMDD');
    return result;
  }
};
