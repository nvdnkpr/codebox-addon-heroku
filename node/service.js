// Requires
var Q = require('q');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var spawn = require('child_process').spawn;
var Heroku = require('heroku-client');

function HerokuRPCService(workspace, logger, shells) {
    this.workspace = workspace;
    this.logger = logger;
    this.shells = shells;

    _.bindAll(this);
}

// Get heroku client
HerokuRPCService.prototype._client = function(user) {
    if (!user.settings.heroku || !user.settings.heroku.key) {
        return Q.reject(new Error("User need to configure heroku with its api key"));
    }
    var client = new Heroku({
        token: user.settings.heroku.key
    });
    return Q(client)
};

// List user applications
HerokuRPCService.prototype.apps = function(args, meta) {
    return this._client(meta.user).then(function(client) {
        return client.apps().list();
    }).then(function(apps) {
        return Q(apps);
    });
};

// Deploy an application
HerokuRPCService.prototype.deploy = function(args, meta) {
    var git, that = this;
    if (!args.git) {
        return Q.reject(new Error("Need 'git' to deploy an heroku apps"));
    }

    this.logger.log("Start deploying to Heroku ("+args.git+")");

    // Spawn the new shell
    var shellId = "heroku-deploy";
    var shell = this.shells.createShellCommand(shellId, 'git', ['push', args.git, 'master']);

    return Q({
        shellId: shellId
    });
};

// Send key to heroku
HerokuRPCService.prototype.update = function(args, meta) {
    var publickey = null;
    var that = this;
    var publickey_file = path.join(process.env.HOME, '.ssh/id_rsa.pub');
    return Q.nfcall(fs.readFile, publickey_file, 'utf8').then(function(content) {
        publickey = content;
        return that._client(meta.user);
    }).then(function(client) {
        return client.account().keys().create({
            'public_key': publickey
        });
    }).then(function(key) {
        return Q(key);
    });
};

// Exports
exports.HerokuRPCService = HerokuRPCService;
