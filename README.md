Mockiji
=======

Mockiji is a generic Node.js REST API server

Provided a JSON or XML file, named with rules, it will create a REST route which will serve the file as the response.


Configuration
====

Mockiji load by default the configuration file in "/api/config/default.json".

Default configuration can be override with env configuration file from information set in "/api/config/env.json".


Examples
====

```json
{
	"title": "The Response to GET /api/of/mine",
	"description": "This filepath is /api/of/mine/get.json"
}
```

```json
{
	"title": "Error 404 to GET /api/of/mine",
	"description": "This filepath is /api/of/mine/get.404.json"
}
```

```json
{
	"title": "Error 500 to GET /api/of/mine",
	"description": "This filepath is /api/of/mine/get.500.json"
}
```

Logs
=====

Logs file are located in "/logs/" and can be configure in configuration file.

More information about rotating file configuration [https://github.com/trentm/node-bunyan](https://github.com/trentm/node-bunyan#stream-type-rotating-file).


```json
{
    "name": "api-mockiji",
    "filepath": "../logs/api-mockiji.log",
    "level": "info",
    "type": "rotating-file",
    "period": "1d",
    "count": 10
}
```
