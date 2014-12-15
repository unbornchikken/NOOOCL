var _ = require('lodash');

var clHelpers = {
    importFunctions: function(prototype, lib) {
        _.keys(lib).forEach(
            function(name) {
                var newName = name.substr(2);
                newName = newName[0].toLowerCase() + newName.substr(1);
                prototype[newName] = lib[name];
            }
        );
    }
};

module.exports = clHelpers;