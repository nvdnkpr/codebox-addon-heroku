// Requires
var Q = require('q');
var _ = require('underscore');
var heroku = require("heroku");

function HerokuRPCService(workspace) {
    this.workspace = workspace;

    _.bindAll(this);
}

// Get heroku client
HerokuRPCService.prototype._client = function(user) {
    if (!user.settings.heroku || !user.settings.heroku.key) {
        return Q.reject(new Error("User need to configure heroku with its api key"));
    }
    var client = new heroku.Heroku({
        key: user.settings.heroku.key
    });
    return Q(client)
};

// List user applications
HerokuRPCService.prototype.apps = function(args, meta) {
    return this._client(meta.user).then(function(client) {
        return Q.nfcall(client.get_apps);
    }).then(function(apps) {
        console.log(apps);
        return Q(apps);
    });
};

// Exports
exports.HerokuRPCService = HerokuRPCService;
