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

## How to change the returned HTTP code?
You can set the return code in the mock filename using the following naming convention: `basename`.`returnCode`.`format`  
The `returnCode` is optional and defaults to `200`.

As an example, if you want to return a `403` HTTP code you can use the following path: `/api/books/get_BK8.403.json`

## Configuration
Mockiji always loads the following configuration file: `api/config/default.json`.  
You can edit this default file or override it (totally or partially) with a custom configuration file.  
In this case, you have to point this custom configuration file into the `api/config/env.json` file.

Example of `env.json` file:  
```json
{
  "name": "dev",
  "path": "/srv/www/my-frontend-app/mocks/"
}
```
This file tells Mockiji to load a `dev.json` file from the `/srv/www/my-frontend-app/mocks/` folder.  
Mockiji will throw an explicit error on boot if this custom configuration has not been found.  

You will have to restart Mockiji if you want the configuration to change.  
If you use pm2, you can do it with `pm2 restart 0` (provided 0 is your mockiji pm2-process id)

## Log
Log files are located in the `logs/` folder and can be configured in a configuration file (eg. `api/config/default.json`).  
If you use pm2, you can view them with `pm2 logs 0` (provided 0 is your mockiji pm2-process id)

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
From the app root folder:  
```sh
docker build -t mockiji .
```

## Docker run
From the app root folder:  
```sh
docker run -p 8080:8080 mockiji
```

You should now be able to load `http://localhost:8080` in your browser or REST client now.

# Classic Usage
No docker? Use directly your favorite package manager and node process manager.

## Requirements 
You MUST have `Node >= 6` and `NPM >= 3`.  
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

