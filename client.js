define([
    "heroku",
    "views/panel"
], function(heroku, PanelHerokuView) {
    var Q = codebox.require("q");
    var hr = codebox.require("hr/hr");
    var _ = codebox.require("underscore");
    var commands = codebox.require("core/commands");
    var settings = codebox.require("core/settings");
    var dialogs = codebox.require("utils/dialogs");
    var api = codebox.require("core/api");
    var search = codebox.require("core/search");
    var user = codebox.require("core/user");
    var commands = codebox.require("core/commands");
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
                    return api.rpc("/heroku/update");
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

    // Add search panel
    var panel = panels.register("heroku", PanelHerokuView);
    
    // Add opening command
    var command = commands.register("deploy.heroku.open", {
        title: "Heroku",
        icon: "cloud-upload",
        position: 1,
        shortcuts: [
            "d h"
        ]
    });
    panel.connectCommand(command);
});