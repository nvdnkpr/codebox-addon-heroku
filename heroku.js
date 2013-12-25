define([], function() {
    var Q = codebox.require("q");
    var hr = codebox.require("hr/hr");
    var user = codebox.require("core/user");
    var dialogs = codebox.require("utils/dialogs");
    var rpc = codebox.require("core/backends/rpc");
    var Command = codebox.require("models/command");
    var cache = hr.Cache.namespace("heroku");

    var appsCmds = Command.register("heroku.applications", {
        'title': "Applications",
        'offline': false,
        'type': "menu"
    });

    // List apps
    var listApps = function(force) {
        if (!user.settings("heroku").get("key") && force != true) {
            return Q([]);
        }

        var _apps = cache.get("apps");
        if (_apps) {
            return Q(_apps);
        } else {
            return rpc.execute("heroku/apps").then(function(apps) {
                // Set cache
                cache.set("apps", apps, 3600);

                // Update list of applications
                appsCmds.menu.reset(_.map(apps, function(app) {
                    return {
                        'title': app.name,
                        'label': app.buildpack_provided_description,
                        'action': function() {
                            deployApp(app);
                        }
                    }
                }));

               return apps;
            });
        }
    };

    // Search for an app
    var searchApps = function(query) {
        return listApps().then(function(apps) {
            return _.filter(apps, function(app) {
                return (app.name.toLowerCase().indexOf(query) != -1);
            });
        });
    };

    // Deploy an application
    var deployApp = function(app) {
        var gitUrl = app.git_url;
        dialogs.confirm("Deploy code to application <b>"+_.escape(app.name)+"</b>?").then(function() {
            commands.run("monitor.open");
            rpc.execute("heroku/deploy", {
                'git': app.git_url
            });
        });
    };

    return {
        'search': searchApps,
        'deploy': deployApp,
        'apps': listApps,
        'commands': appsCmds
    }
});