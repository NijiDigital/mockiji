<p align="center">
  <img alt="Mockiji" src="https://raw.githubusercontent.com/NijiDigital/mockiji/master/docs/images/logo-mockiji.png">
</p>

<p align="center">
  Simple, Fast and Powerful file-based Node.js mock server
</p>

---

# What is Mockiji?
Mockiji is a generic Node.js REST API server.  
Provided a JSON/HTML file, named along rules, it will create a REST route which will serve the file as the response.  
Plus, you can also provide a JavaScript file to generate a response according to the request context.

## Basic examples

**Request:** `GET /api/of/mine`  
**Response:**  `HTTP 200 OK`

```json
{
	"title": "The response to GET /api/of/mine (HTTP 200 OK)",
	"description": "This filepath is /api/of/mine/get.json"
}
```

**Request:** `POST /api/books/`  
**Response:**  `HTTP 503 Service Unavailable`

```json
{
	"title": "This is a 503 HTTP Error to the request POST /api/books/",
	"description": "This filepath is /api/books/post.503.json"
}
```

## How does it work? (How can I use it?)
When Mockiji receives a request, it looks at the HTTP verb (`GET`, `POST`, etc.) and its path (`/api/elem1/elem2`) before looking for a mock file matching it.

As an example:

![Naming convention](docs/images/naming-convention.png)

The first file matching one of these patterns is served.

As you can see, Mockiji will try to match specific requests first, 
then it will try to get more generic thanks to the `@default` token 
which may fit a folder name in the mocks folder hierarchy.


## Get Started with the default configuration
Mockiji contains some mocks to start playing with and help you understand how it works.
This first API is a library (the ones with books) where users kate and tom has borrowed some books.
Please install and launch Mockiji without editing the default configuration and let's get started.

### A simple request
Start by loading `http://localhost:8080/api-simple-library/users/tom/books` in your browser or REST Client (`GET` verb).
These are the books borrowed by tom.  

If you look at the **Response Headers** you will see a `X-Mockiji-File` like this:  
`X-Mockiji-File: /srv/www/mockiji/mocks/api-simple-library/users/tom/books/get.json`

It means the response content has been served from this file.
You can verify this by yourself by checking the content of this local file defined by `X-Mockiji-File`.  

### Mockiji's @default token
If you replace "tom" by "alex" in the URL, you will receive another response.  
`X-Mockiji-File: /srv/www/mockiji/mocks/api-simple-library/users/@default/get_books.json`  

What is this `@default` part in the path? It is a special token used by Mockiji.
Mockiji has tried to load a file with an "alex" in the path but he has not found any.
Then it tried to replace some parts from the URL with this special token `@default`.
That's why this file has been served. Look at the file hierarchy in the `api-simple-library` to understand.  

### Mockiji's 404 page
Now we will request a non-existing request for this api.  
Try this one: `http://localhost:8080/api-simple-library/users/kate/comics`  
You should get a page looking like this one:

```json
{
  "errorCode": 404,
  "errorDescription": "No mock file was found",
  "evaluatedMockFilePaths": [
    "/srv/www/mockiji/mocks/api-simple-library/users/kate/comics/get.*",
    "/srv/www/mockiji/mocks/api-simple-library/users/kate/get_comics.*",
    "/srv/www/mockiji/mocks/api-simple-library/users/get_kate_comics.*",
    "/srv/www/mockiji/mocks/api-simple-library/get_users_kate_comics.*",
    "/srv/www/mockiji/mocks/api-simple-library/users/kate/@default/get.*",
    "/srv/www/mockiji/mocks/api-simple-library/users/@default/comics/get.*",
    "/srv/www/mockiji/mocks/api-simple-library/@default/kate/comics/get.*",
    "/srv/www/mockiji/mocks/@default/users/kate/comics/get.*",
    "/srv/www/mockiji/mocks/api-simple-library/users/@default/get_comics.*",
    "/srv/www/mockiji/mocks/api-simple-library/@default/kate/get_comics.*",
    "/srv/www/mockiji/mocks/@default/users/kate/get_comics.*",
    "/srv/www/mockiji/mocks/api-simple-library/@default/get_kate_comics.*",
    "/srv/www/mockiji/mocks/@default/users/get_kate_comics.*",
    "/srv/www/mockiji/mocks/@default/get_users_kate_comics.*"
  ]
}
```

No mock file was found and Mockiji tells you where it searched for mock files.
This page is useful to understand why your mock file has not been found.
You can also use theses paths to choose where to create your files for improving the API.  

If you create one file and put it on one of these paths, you will be able to refresh your URL and see it served.

### Mockiji's 500 page
What happens if you create one JSON mock file but screwed up and put XML in it?  
Try it by yourself you will get:

```json
{
  "error": "The mock file contains invalid JSON"
}
```

As usual, you can locate the served file with the `X-Mockiji-File` response header and fix it with nice and valid JSON.

# Install and launch
## Using npm
You can install Mockiji using npm, either globally or as a dev dependency of your project:

```sh
# Globally
npm install -g mockiji

# As a dev dependency
npm install --save-dev mockiji
```

Then to run it, just execute the `mockiji` binary:

```sh
mockiji
```

Note: By default Mockiji will expect a `mocks/` directory where the command is executed. You can use the one at the root of this repository as an example.

## By cloning this repository
<details>
<summary>With Docker</summary>
Mockiji is not yet available on Docker hub, however you can build an image easily.  
You must have docker installed along with the `docker` command.

### Docker build image
From the app root folder:

```sh
docker build -t mockiji .
```

### Docker run
From the app root folder:

```sh
docker run -p 8080:8080 mockiji
```

</details>
<details>
<summary>Without Docker</summary>
You can use your favorite package manager and node process manager.

### Requirements
You MUST have `Node >= 6` and `NPM >= 3`.  
You MAY have `yarn` and `pm2`.

### Install Mockiji
Please choose one of the following install option:

<details open="1">
<summary>Install with yarn</summary>
From the root folder:

```sh
yarn
```
</details>
<details>
<summary>Install with npm</summary>
From the root folder:

```sh
npm install
```
</details>

### Launch Mockiji

<details open="1">
<summary>Launch with pm2</summary>
From the root folder:

```sh
pm2 start src/index.js --name="mockiji-api"
```
</details>
<details>
<summary>Launch with Node</summary>
From the root folder:

```sh
./bin/mockiji
```
</details>
</details>

You should now be able to load `http://localhost:8080` in your browser or REST client now.

## Configuration
Mockiji embeds a default configuration that works out of the box and loads mocks from the `mocks/` folder.  
You can override it using the following methods.

Note: All path are relative to the directory Mockiji is started from.

### Environment variables
Usage: `PORT=8001 API_BASE_PATH=./my-mocks/ mockiji`

| Name          | Type    | Default                 | Description                            |
|---------------|---------|-------------------------|----------------------------------------|
| PORT          | port    | 8080                    | Listening port                         |
| NODE_ENV      | string  | dev                     | Environment name                       |
| API_BASE_PATH | path    | ./mocks                 | Path to the folder containg mock files |

### CLI parameters
Usage: `mockiji --port 8001 --api-base-path ./my-mocks/`

| Name          | Type    | Default                 | Description                                         |
|---------------|-------- |-------------------------|-----------------------------------------------------|
| config-file   | string  |                         | Path to a configuration file                        |
| port          | port    | 8080                    | Listening port                                      |
| env           | string  | dev                     | Environment name                                    |
| api-base-path | path    | ./mocks                 | Path to the folder containg mock files              |
| silent        |         |                         | If specified, disable the default stdout log stream |

### Configuration file
The whole [node-convict configuration schema](https://github.com/mozilla/node-convict#the-schema) can be found in the `src/utils/configuration.js` file.

You can override the default values by specifying a JSON configuration file when running Mockiji, e.g. `mockiji --config-file mockiji.json`.

You will have to restart Mockiji if you want the configuration to change.  
If you use pm2, you can do it with `pm2 restart 0` (provided 0 is your mockiji pm2-process id)

## API
You can also start a mockiji server directly from your code by using its API:

```js
const Mockiji = require('mockiji');
const server = new Mockiji({
  configuration: {
    port: 8001,
    api_base_path: './my-mocks',
  }
});

server.start().then(
  () => { console.log('Mockiji started'); },
  (error) => { console.error('Could not start Mockiji: ', error); }
);
```

The `Mockiji` constructor takes an option object as a parameter that can have the following attributes:
* `configuration`: a configuration object as described by the [node-convict configuration schema](https://github.com/mozilla/node-convict#the-schema) that can be found in the `src/utils/configuration.js` file;
* `configFile`: a path to a JSON configuration file.

An instance of `Mockiji` provides two methods `start` and `stop` both returning a `Promise` object.

## Log
Log files are generated by [Bunyan](https://github.com/trentm/node-bunyan) and are saved by default in the `logs/` folder.

This behavior can by adding [Bunyan](https://github.com/trentm/node-bunyan) streams to the `logs` attribute of the configuration file described previously.

A default `stdout` stream with the `debug` or `info` level (based on whether or not your are using the `dev` environment) is also automatically added and can be disabled using the `--silent` argument.

As an example, using the configuration file:

```json
{
  "logs": [{
    "filepath": "./logs/api-mockiji.log",
    "level": "warn",
    "type": "rotating-file",
    "period": "1d",
    "count": 3
  }]
}
```

Available parameters for each stream can be found in the [Bunyan documentation](https://github.com/trentm/node-bunyan#stream-type-rotating-file).
