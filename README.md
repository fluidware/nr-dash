# nr-dash

## Introduction
***nr-dash*** is a [NewRelic](http://newrelic.com) dashboard by [Fluidware](http://fluidware.com) that can be installed, configured and running in under 2 minutes.

## Requirements
- [NewRelic](http://newrelic.com) account with 'Integrations' enabled

## Installation
nr-dash can be installed from node/npm, or by cloning this repository.

### npm
- Type `npm install nr-dash`
- Edit `config.json` and set your API key in `key`
- Create a symlink to the app: `ln -s node_modules/nr-dash/app.js app.js`
- Type `node app.js` (`stdout` & `stderr` are supported)

### git
- Clone this project
- Edit `config.json` and set your API key in `key`
- Configure your webserver to use the `/dist` folder
- Configure a route at `/config` to respond with `config.json`
- Optional (if you have node.js installed): skip the step above & type `npm install` followed by `node app.js`

## How do I get charts?
- Edit `config.json` and populate either `Applications.metrics.instances[]` or `Servers.metrics.instances[]` with names, e.g. "MyServer-01"
- `Servers.metrics.names[]` comes pre-populated, but `Applications` requires you to fill in metric names; use the [NewRelic](http://newrelic.com) API explorer to get the metric names

## How can I customize the "look & feel"?
- The static files are found in `/dist`; css & javascript files are generated!
- Install node.js & grunt-cli (globally): `sudo npm install grunt-cli -g`
- Install ruby sass gem: `gem install sass`
- Install development dependencies: `npm install`
- Edit `/sass/style.scss` or any file in `/src`, save your changes and type `grunt` to build new assets in `/dist`
- Optional: type `grunt watch` for automatic building upon saving changes to any file used to generate assets

## How do I change (name it)?
- The UI is generated entirely from `config.json`
- You can create new dashboard 'pills' by duplicating the `Applications` or `Transactions` objects

## What can I run this on?
nr-dash has a RWD which allows it to run on practically any device, such as:

- tablets
- smartphones
- laptops / desktops
- TVs

## License
Copyright (c) 2014 Fluidware
Licensed under the MIT license.
