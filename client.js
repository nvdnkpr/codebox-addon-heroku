define([], function() {
    var Q = require("q");
    var hr = require("hr/hr");
    var _ = require("underscore");
    var commands = require("core/commands");
    var settings = require("utils/settings");
    var dialogs = require("utils/dialogs");
    var api = require("core/api");
    var search = require("core/search");
    var user = require("core/user");
    var cache = hr.Cache.namespace("heroku");

    // Add settings page
    settings.add({
        'namespace': "heroku",
        'title': "Heroku",
        'defaults': {
            'key': ""
        },
        'fields': {
            'key': {
                'label': "Key",
                'type': "text",
                'help': "You can find your api key in your settings Heroku.",
            },
            'regenerate': {
                'label': "",
                'type': "action",
                'content': "Authorize SSH key on Heroku",
                'help': "Save your settings before authorizing to Heroku.",
                'trigger': function() {
                    return api.rpc("/heroku/update");
                }
            }
        }
    });

    // Search for an app
    var searchApps = function(query) {
        var filter = function(apps) {
            return _.filter(apps, function(app) {
                return (app.name.toLowerCase().indexOf(query) != -1);
            });
        };

        if (!user.settings("heroku").get("key")) {
            return Q([]);
        }

        var _apps = cache.get("apps");
        if (_apps) {
            return Q(filter(_apps));
        } else {
            return api.rpc("/heroku/apps").then(function(apps) {
                cache.set("apps", apps, 3600);
               return filter(apps);
            });
        }
    };

    // Deploy an application
    var deployApp = function(app) {
        dialogs.confirm("Deploy code to application <b>"+_.escape(app.name)+"</b>?").then(function() {
            commands.run("monitor.open");
            api.rpc("/heroku/deploy", {
                'git': app.git_url
            });
        });
    };

    // Add apps to search
    search.handler({
        'id': "heroku",
        'title': "Deploy to heroku"
    }, function(query) {
        return searchApps(query).then(function(apps) {
            return _.map(apps, function(app) {
                return {
                    "text": app.name,
                    "callback": function() {
                        deployApp(app); 
                    }
                };
            });
        });
    });
});