'use strict';

const helpers = exports;

helpers.toVersionNum = function (versionString) {
    const result = /(\d+)\.(\d+)/.exec(versionString);
    return +result[1] + (+result[2]) / 10;
}