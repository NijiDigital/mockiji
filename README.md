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
When Mockiji receives a request, it looks at the HTTP verb (`GET`, `POST`, etc.) and its path (`/api/elem1/elem2`).  
With these, Mockiji will search for files that match the name rules.

For example, when it receives the request `GET api/user/tom/books/8`, Mockiji will search for files from its `mocks` folder in the following order:
* mocks/api/user/tom/books/8/get.*
* mocks/api/user/tom/books/get_8.*
* mocks/api/user/tom/get_books_8.*
* mocks/api/user/get_tom_books_8.*
* mocks/api/get_user_tom_books_8.*
* mocks/api/user/tom/books/@default/get.*
* mocks/api/user/tom/@default/8/get.*
* mocks/api/user/@default/books/8/get.*
* mocks/api/@default/tom/books/8/get.*
* mocks/@default/user/tom/books/8/get.*
* mocks/api/user/tom/@default/get_8.*
* mocks/api/user/@default/books/get_8.*
* mocks/api/@default/tom/books/get_8.*
* mocks/@default/user/tom/books/get_8.*
* mocks/api/user/@default/get_books_8.*
* mocks/api/@default/tom/get_books_8.*
* mocks/@default/user/tom/get_books_8.*
* mocks/api/@default/get_tom_books_8.*
* mocks/@default/user/get_tom_books_8.*
* mocks/@default/get_user_tom_books_8.*

As soon as it finds a file matching one of these patterns, it will serve it.

As you can see, Mockiji will try to match specific requests first, 
then it will try to get more generic thanks to the `@default` token 
which may fit a folder name in the mocks folder hierarchy.

## How to change the returned HTTP code?
You can set the return code in the mock filename using the following naming: 
`basename`.`returnCode`.`format`  

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

# Docker usage
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