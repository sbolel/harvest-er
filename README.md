# harvest-er: Harvest Automation Server

[![NPM version][npm-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![License][license-image]][license-url]

## Getting Started

Harvester requires [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.org/), which can both be installed by following the instructions on https://nodejs.org/. Installing Node.js also installs npm.

#### Installing with npm

`npm install harvest-er`

#### Installing from source

`git clone https://github.com/sbolel/harvest-er` - clone the source code

`npm install` - install node dependencies

`npm run debug` - start the application using Supervisor with debug messages enabled

## Usage

Start the application using Supervisor with `npm run debug`. The Harvest data will be downloaded and saved to Dropbox each time the server runs. To re-run this download, execute `rs` in Supervisor.

#### Setting up Harvest

2. Add the admin users email/password to your environment

    ```bash
    export HARVESTER_ADMIN_EMAIL="admin@thinkcrazy.co"
    export HARVESTER_ADMIN_TOKEN="abc-def-123-456"
    ```

2. Set your Harvest subdomain in [`server/harvester.js`](server/harvester.js) and the email/password for the admin user:

    ```js
    var harvester = new Harvest({
        subdomain: process.env.HARVESTER_SUBDOMAIN,  // your harvest subdomain
        email: process.env.HARVESTER_ADMIN_EMAIL,
        password: process.env.HARVESTER_ADMIN_TOKEN
    }),
    ```


## Getting Today's Expense and Time Entries data from Harvest (see [`app.js`](server/app.js))

3. Require `harvest` and `harvester`

```js
var Harvest = require('harvest');
var Harvester = require('./harvester');
```

3. Initialize Harvester and download the data using a promise array

```js
function getTodaysData(){
  var harvest = new Harvest({
    subdomain: process.env.HARVESTER_SUBDOMAIN, 
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
```

## Future work

#### Setting up Dropbox

2. Create a new Dropbox app at https://www.dropbox.com/developers/apps/create

    - Go to the settings for your new Dropbox app
    - Take note of the _App key_ and _App secret_
    - Click "Generate" to get a _Generated access token_

2. Add the admin users email/password to your environment

    ```bash
    export HARVESTER_DROPBOX_KEY=2abcdef1234t53e
    export HARVESTER_DROPBOX_SECRET=vn5aaf3bb5dd3qt
    export HARVESTER_DROPBOX_TOKEN=rUY9dxaAABBCCDDeeXJctUSUA_c8SuvABfzNwDAdFmTACAa6mUrpAAmcc7Gg7Qch
    ```

2. Set your Dropbox credentials in [`server/dropboxer.js`](server/dropboxer.js):

```js
var client = new Dropbox.Client({
  key: process.env.HARVESTER_DROPBOX_KEY,
  secret: process.env.HARVESTER_DROPBOX_SECRET,
  token: process.env.HARVESTER_DROPBOX_TOKEN
});
```


[npm-image]: https://img.shields.io/npm/v/harvest-er.svg?style=flat-square
[npm-url]: https://npmjs.org/package/harvest-er
[npm-downloads-image]: https://img.shields.io/npm/dm/harvest-er.svg?style=flat-square
[travis-image]: https://img.shields.io/travis/sbolel/harvest-er/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/sbolel/harvest-er
[daviddm-image]: https://img.shields.io/david/sbolel/harvest-er.svg?style=flat-square
[daviddm-url]: https://david-dm.org/sbolel/harvest-er
[climate-image]: https://img.shields.io/codeclimate/github/sbolel/harvest-er.svg?style=flat-square
[climate-url]: https://img.shields.io/codeclimate/github/sbolel/harvest-er.svg?style=flat-square
[coverage-image]: https://img.shields.io/codeclimate/coverage/github/sbolel/harvest-er.svg?style=flat-square
[coverage-url]: https://img.shields.io/codeclimate/coverage/github/sbolel/harvest-er.svg?style=flat-square
[license-image]: https://img.shields.io/npm/l/harvest-er.svg?style=flat-square
[license-url]: https://github.com/sbolel/harvest-er/blob/master/LICENSE
[code-style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[code-style-url]: http://standardjs.com/