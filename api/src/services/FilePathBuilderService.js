'use strict';

let util = require('util');

/**
 * This Controller is for building the response
 */
let FilePathBuilderService = function() {

    /**
     *
     */
    function _generatePaths(method, url, queryString) {
        let urls = [];

        let allParts = url.split('/');

        // method.json
        {
            let url1 = allParts.join('/') + '/' + method + '\\.*';
            urls.push(url1);
        }

        // ../method_lastElement.json
        // ../../method_beforeLastElement_lastElement.json
        // etc.
        let partsCount = allParts.length;
        for(let p=1; p <= (partsCount-1); ++p) {
            let pathParts = [];
            let fileBodyName = [method];
            let fileExtensionName = '\\.*';
            for(let i=0; i<allParts.length; ++i) {
                if(i < allParts.length - (p)) {
                    pathParts.push(allParts[i]);
                } else {
                    fileBodyName.push(allParts[i]);
                }
            }
            let url = pathParts.join('/') + '/' + fileBodyName.join('_') + fileExtensionName;
            urls.push(url);
        }

        // ../@default/method.json
        // ../../@default/method_lastElement.json
        // ../../../@default/method_beforeLastElement_lastElement.json
        // etc.
        for(let p=1; p <= (partsCount-1); ++p) {
            let pathParts = [];
            let fileBodyName = [method];
            let fileExtensionName = '\\.*';
            for(let i=0; i<allParts.length; ++i) {
                if(i < allParts.length - (p)) {
                    pathParts.push(allParts[i]);
                }
                else if(i == allParts.length - (p)) {
                    pathParts.push('@default');
                }
                else {
                    fileBodyName.push(allParts[i]);
                }
            }
            let url = pathParts.join('/') + '/' + fileBodyName.join('_') + fileExtensionName;
            urls.push(url);
        }

        return urls;
    }

    return {
        generatePaths: _generatePaths
    }

}

module.exports = FilePathBuilderService;
