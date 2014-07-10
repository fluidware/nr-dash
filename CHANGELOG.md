# Change Log

## 1.1.1
- Fixing 'Apdex Score' creep on the DataGrid backed charts (Applications, etc.)

## 1.1.0
- Adding `chartGrid` (boolean, default `false`) to `pills` in `config.json`
- Adding `chartGrid()` & `chartGridTransform()` provide reactive charts of DataGrids, by config

## 1.0.4
- Upgrading keigai to 0.5.1 to leverage ES6 Promises
- Loading Promise polyfill for IE & mobile devices
- Fixing `hashchange()` for IE
- Updating node deps

## 1.0.3
- Removing unwanted `text` nodes from DOM due to erroneous Array.join()s.

## 1.0.2
- Added `fields` & `order` Arrays to pills in `config.json`
- Refactored `view()` to utilize new pill properties, & generalize view creation
- Added & moved keys in `config.json`
- Compressing `nr-dash.js` with UglifyJS via Grunt

## 1.0.1
- Fixed a path issue in `app.js` when installed from `npm`

## 1.0.0
- Public release of nr-dash
