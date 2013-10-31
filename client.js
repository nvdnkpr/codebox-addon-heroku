define([], function() {
    var commands = require("core/commands");

    // Add opening command
    commands.register("deploy.heroku", {
        title: "Deploy to Heroku",
        icon: "cloud"
    }, function(args) {
        
    });
});