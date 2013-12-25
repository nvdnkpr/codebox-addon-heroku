define([
    "heroku"
], function(heroku) {
    var Q = codebox.require("q");
    var hr = codebox.require("hr/hr");
    var _ = codebox.require("underscore");
    var commands = codebox.require("core/commands/toolbar");
    var settings = codebox.require("core/settings");
    var dialogs = codebox.require("utils/dialogs");
    var rpc = codebox.require("core/backends/rpc");
    var search = codebox.require("core/search");
    var menu = codebox.require("core/commands/menu");
    var user = codebox.require("core/user");
    var panels = codebox.require("core/panels");

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
                    return rpc.execute("heroku/update");
                }
            }
        }
    });

    // Add apps to search
    search.handler({
        'id': "heroku",
        'title': "Deploy to heroku"
    }, function(query) {
        return heroku.search(query).then(function(apps) {
            return _.map(apps, function(app) {
                return {
                    "text": app.name,
                    "callback": function() {
                        heroku.deploy(app); 
                    }
                };
            });
        });
    });

    // Add menu
    menu.register("heroku", {
        title: "Heroku"
    }).menuSection([
        {
            'type': "action",
            'title': "Settings",
            'action': function() {
                settings.open("heroku");
            }
        }
    ]).menuSection([
        {
            'type': "action",
            'title': "Refresh Applications",
            'offline': false,
            'action': _.partial(heroku.apps, true)
        },
        heroku.commands
    ]);

    heroku.apps();
});