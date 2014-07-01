# nr-dash

## Introduction
***nr-dash*** is a [NewRelic](http://newrelic.com) dashboard by [Fluidware](http://fluidware.com) that can be installed, configured and running in under 2 minutes.

## Requirements
- [NewRelic](http://newrelic.com) account with 'Integrations' enabled

## Installation
nr-dash can be installed from node/npm, or by cloning this repository.

#### npm
- Type `npm install nr-dash`
- Edit `config.json` and set your API key in `key`
- Create a symlink to the app: `ln -s node_modules/nr-dash/app.js app.js`
- Type `node app.js` (`stdout` & `stderr` are supported)

#### git
- Clone this repository
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

## Configuration

#### api (string) _null_
NewRelic API key

#### colors (array)
Array of chart legend colors

#### cycle (boolean) _false_
Cycles dashboard pills

#### default (string) _null_
Default pill to load (defaults to first pill if _null_)

#### expire (number) _30_
DataStore expiration in seconds

#### hostname (string) _localhost_
Hostname for the `app.js` server

#### pageSize (number) _15_
Page size for DataGrids, `null` to disable pagination

#### pause (number) _21_
Pause between cycles (do not use the same value as _expire_)

#### port (number) _8000_
Port for the `app.js` server

#### si (string) _Disk|Memory|Network_
Parsed metric names that should be formatted as _SI_, this is used to generate a `RegExp`

#### transition (number) _2_
Seconds to animate chart redraw

#### xformat (string) _hh:mm A_
X axis tick format, via `moment.js`

## How to make a "pill"
Pills are the name of the dashboard "views", it's just a data abstraction of the interface. nr-dash comes with three predefined pills, but those might not suit your needs, so
we made it very easy for you to generate the UI from the data!

To generate a new "pill", follow this template:

```json
{
	"name": "Name in UI",
	"slug": "Slug/Route",
	"source": "Data source in NewRelic API response, usually matches 'name'",
	"uri": "NewRelic API end point",
	"fields": ["keys in API response to display in DataGrid"],
	"order": "SQL like ORDER BY statement of keys in DataGrid"
}
```

If you want charts, add a `metrics` Object to the pill:

```json
"metrics": {
	"uri": "NewRelic API end point",
	"instances": ["Name of instances to chart"],
	"names": ["Names of metrics to chart"]
}
```

## License
Copyright (c) 2014 Fluidware
Licensed under the MIT license.
