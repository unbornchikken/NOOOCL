var util = require('util');
var defs = require('./defs');
var _ = require('lodash');

function CLError(code) {
    Error.call(this);
    Error.captureStackTrace(this, arguments.callee);
    var typeKey = _.first(_.where(_.keys(defs), function(defKey) {
        return defs[defKey] === code;
    }));
    var type = typeKey || 'UNKNOWN';
    this.name = 'CLError';
    this.message = 'OpenCL Error Code: ' + code + ' Type: ' + type;
    this.code = code;
    this._type = type;
}

util.inherits(CLError, Error);

module.exports = CLError;
