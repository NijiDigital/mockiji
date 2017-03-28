<p align="center">
  <img alt="Mockiji" src="https://raw.githubusercontent.com/NijiDigital/mockiji/master/docs/images/logo-mockiji.png">
</p>

<p align="center">
  Simple, Fast and powerful file-based Node.js mock server
</p>

---

# What is Mockiji?
Mockiji is a generic Node.js REST API server.  
Provided a JSON/HTML file, named along rules, it will create a REST route which will serve the file as the response.  
Plus, you can also provide a JavaScript file to generate a response according to the request context.

## Basic examples
```json
{
	"title": "The response to GET /api/of/mine (HTTP 200 OK)",
	"description": "This filepath is /api/of/get.json"
}
```

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

## How to change the returned HTTP code?
You can set the return code in the mock filename using the following naming convention: `basename`.`returnCode`.`format`

The `returnCode` is optional and defaults to `200`.

As an example, if you want to return a 403 HTTP code you can use the following path: `/api/books/BK8.403.json`

## Configuration
Mockiji always loads the following configuration file: `api/config/default.json`.  
You can edit this file or override it (totally or partially) with a custom configuration file.  
In this case, you have to point this custom configuration file into the `api/config/env.json` file.

## Log
Log files are located in the `logs/` folder and can be configured in a configuration file (`api/config/default.json`).  
The configuration system is described in the [Bunyan repository](https://github.com/trentm/node-bunyan#stream-type-rotating-file).

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

# Docker Usage
Mockiji is not yet available on Docker hub, however you can build an image easily.  
You must have docker installed along with the `docker` command.

## Docker build image
From the `api/` folder:  
```sh
docker build -t mockiji .
```

## Docker run
From the `api/` folder:  
```sh
docker run -p 8080:8080 mockiji
```

You should now be able to load `http://localhost:8080` in your browser or REST client now.

# Classic Usage
No docker? Use directly your favorite package manager and node process manager.

## Requirements 
You MUST have `Node >= 4` and `NPM >= 2`.  
You MAY have `yarn` and `pm2`.

## Install Mockiji
Please choose one of the following install option:

### Install with npm
From the `api/` folder:  
```sh
npm install
```

### Install with yarn
From the `api/` folder:
```sh
yarn
```

## Launch Mockiji
Once launched, you should be able to load `http://localhost:8080` in your browser or REST client.  
But first, you should choose on the following launch option:

### Launch with Node
From the `api/` folder:  
```sh
node app
```

### Launch with pm2
From the `api/` folder:  
```sh
pm2 start processes.json
```

