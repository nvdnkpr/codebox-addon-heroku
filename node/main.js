var HerokuRPCService = require('./service').HerokuRPCService;

function setup(options, imports, register) {
    // Import
    var httpRPC = imports.httpRPC;
    var workspace = imports.workspace;
    var logger = imports.logger.namespace("heroku", true);

    var service = new HerokuRPCService(workspace, logger);

    // Register RPC
    httpRPC.register('/heroku', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
