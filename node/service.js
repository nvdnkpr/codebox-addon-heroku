// Requires
var Q = require('q');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var spawn = require('child_process').spawn;
var Heroku = require('heroku-client');

function HerokuRPCService(workspace, logger) {
    this.workspace = workspace;
    this.logger = logger;

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
    var git, d, that = this;
    if (!args.git) {
        return Q.reject(new Error("Need 'git' to deploy an heroku apps"));
    }
    d = Q.defer();

    this.logger.log("Start deploying to Heroku ("+args.git+")");

    git  = spawn('git', ['push', args.git, 'master'], {
        'cwd': this.workspace.root
    });

    git.stdout.setEncoding('utf8');
    git.stdout.on('data', function(data) {
        that.logger.log(data);
    });
    git.stderr.setEncoding('utf8');
    git.stderr.on('data', function(data) {
        that.logger.log(data);
    })
    git.on('exit', function (code, signal) {
        that.logger.log('Deployment to Heroku is finished with code', code);
        d.resolve();
    });

    return d.promise;
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
