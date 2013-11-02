var HerokuRPCService = require('./service').HerokuRPCService;

function setup(options, imports, register) {
    // Import
    var httpRPC = imports.httpRPC;
    var workspace = imports.workspace;

    var service = new HerokuRPCService(workspace);

    // Register RPC
    httpRPC.register('/heroku', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
