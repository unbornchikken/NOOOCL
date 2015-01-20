var util = require('util');
var defs = require('./defs');
var _ = require('lodash');

function CLError(code) {
    /*INHERITANCE*/
    Error.call(this); //super constructor
    Error.captureStackTrace(this, CLError); //super helper method to include stack trace in error object

    //Set the name for the ERROR
    var type = _.first(_.where(defs, function(d) {
        var dks = _.keys(d);
        if (dks.length === 1) {
            return d[dks[0]] === code;
        }
        return false;
    }));
    if (_.isPlainObject(type)) {
        type = type[_.keys(type)[0]];
    }
    else {
        type = 'UNKNOWN';
    }
    this.name = 'OpenCL Error. Code: ' + code + ' Type: ' + type;
    this.code = code;
    this.type = type;
}

util.inherits(CLError, Error);

module.exports = CLError;
