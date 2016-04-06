'use strict';

let util = require('util');
let fs = require('fs');
let glob = require('glob-all');

// Configuration
let env = require('../../config/env.json');
let config = require('../../config/'+ env.name +'.json');

// Logger
let bunyan = require('bunyan');
let log = bunyan.createLogger({name: config.logger.name});

/**
 * This service is for loading the right file
 */
let FileLoaderService = function() {

    /**
     * Find the right file to load
     */
    function _findTheFileToLoad(paths) {

        let files = [];

        let fileMatch = false;
        paths.forEach(function(element) {
            if(fileMatch) {
                return;
            }

            let rootPath = __dirname + "/" + config.listen_to_these_api_base_urls.api + element;
            files = glob.sync(rootPath);
            if(files.length > 0) {
                log.info("FILE MATCH! : " + rootPath + " - " + util.inspect(files));
                fileMatch = true;
            }
        });

        if(files.length > 0) {
            log.warn("Multiple files found, selecting the first one: " + files);
            let file = files[0];
            return file;
        }

        return null;
    }

    /**
     * Load the file located at the path
     */
    function _load(path) {

        var contents = fs.readFileSync(path, 'utf8');
        let jsonContent = null;
        let httpCode = 0;
        let notices = [];

        httpCode = _extractHttpCodeFromFileName(path);

        try {
            if(contents.length > 0) {
                jsonContent = JSON.parse(contents);
            } else {
                notices.push('The mock file is empty');
            }
        } catch(e) {
            // Log (not valid JSON)
            httpCode = config.mock_file_invalid_http_code;
            let message = 'The mock file contains invalid JSON';
            jsonContent =  {'error':message};
            notices.push(message);
        }

        let data = {
            rawContent: jsonContent,
            httpCode: httpCode,
            notices: notices
        }
        return data;
    }

    /**
     * Extract the HTTP Code from the filename (just before the final extension)
     */
    function _extractHttpCodeFromFileName(filename) {
        let httpCode = 200;

        let matches = filename.match(/\.([0-9]{3})\.[a-z0-9]+$/i);
        console.log(matches);
        if(matches != null) {
            httpCode = matches[1];
        }

        return httpCode;
    }

    // Expose
    return {
        find: _findTheFileToLoad,
        load: _load
    }

}

module.exports = FileLoaderService;
