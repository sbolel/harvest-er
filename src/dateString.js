'use strict'

const moment = require('moment')

module.exports = {
  today: () => {
    const m = moment()
    const result = m.format('YYYYMMDD')
    return result
  },
  tomorrow: () => {
    const m = moment()
    const result = m.add(1, 'days').format('YYYYMMDD')
    return result
  },
  startOfWeek: () => {
    const m = moment()
    const n = m.subtract(m.day() - 1, 'days')
    const result = n.startOf('day').format('YYYYMMDD')
    return result
  }
}
