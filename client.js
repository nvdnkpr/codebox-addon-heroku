define([], function() {
    var hr = require("hr/hr");
    var _ = require("Underscore");
    var commands = require("core/commands");
    var settings = require("utils/settings");
    var dialogs = require("utils/dialogs");
    var api = require("core/api");
    var search = require("core/search");
    var cache = hr.Cache.namespace("heroku");

    // Add settings page
    settings.add({
        'namespace': "heroku",
        'section': "deployment",
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
        var d = new hr.Deferred();

        var _results = function(apps) {
            d.resolve(_.filter(apps, function(app) {
                return (app.name.toLowerCase().indexOf(query) != -1);
            }));
        };

        var _apps = cache.get("apps");
        if (_apps) {
            _results(_apps);
        } else {
            api.rpc("/heroku/apps").then(function(apps) {
                cache.set("apps", apps, 3600);
                _results(apps);
            });
        }
        return d;
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
        var d = new hr.Deferred();

        searchApps(query).then(function(apps) {
            d.resolve(_.map(apps, _.bind(function(app) {
                return {
                    "text": app.name,
                    "callback": function() {
                        deployApp(app); 
                    }
                };
            })));
        });
        return d;
    });
});