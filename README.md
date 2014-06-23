# FluidSurveys API wrapper
***node.js wrapper for the FluidSurveys V3 API***

## Introduction
This library provides a pure node.js interface for the [FluidSurveys API](http://docs.fluidsurveys.com). It requires node.js 0.8.x and newer.

## Documentation
View the lastest release API documentation [FluidSurveys API](http://docs.fluidsurveys.com).

## Example
```javascript
var fluidsurveys = require("fluidsurveys"),
    api          = fluidsurveys("username|apikey", "password");

api.list("surveys", {group: "testing"}, function(err, arg) {
	if (err) {
		// Handle the error
	}
	else {
		// `arg` is a list of surveys in the "testing" group
	}
});
```

## API
Entity types are puralized to match collections. You can interact with `templates`, `surveys`, `collectors`, `contacts`, `embeds`, `contact-lists`, & `webhooks`.

### create( type, data, cb )
Creates a new entity, such as `surveys`.

### createChild ( parentType, parentId, childType, data, cb )
Creates a child entity under a parent, such as `collectors` under `surveys`.

### delete ( type, id, cb )
Deletes an entity.

### get ( type, id, cb )
Gets an entity.

### getChild ( parentType, parentId, childType, childId, cb )
Gets a child entity under a parent, such as `collectors` under `surveys`.

### list ( type, args, cb )
Gets a paginated list of entities.

### listChildren ( parentType, parentId, childType, args, cb )
Gets a paginated list of children under a parent.

### update ( type, id, data, cb )
Updates an entity.

## Caveats
- Getting a 'survey' will retrieve the 'entity', and it's 'structure'
- Updating a 'survey' supports modifying the 'entity', and/or the 'structure'

## Issues
The V3 API, and this wrapper are 'beta'. Please report issues you find!

- Using `create()` for a `template` will result in an error (API bug)


## License
Copyright (c) 2014 Fluidware
Licensed under the MIT license.
