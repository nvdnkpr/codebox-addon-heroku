define([], function() {
    var Q = codebox.require("q");
    var hr = codebox.require("hr/hr");
    var user = codebox.require("core/user");
    var dialogs = codebox.require("utils/dialogs");
    var api = codebox.require("core/api");
    var cache = hr.Cache.namespace("heroku");

    // List apps
    var listApps = function(force) {
        if (!user.settings("heroku").get("key") && force != true) {
            return Q([]);
        }

        var _apps = cache.get("apps");
        if (_apps) {
            return Q(_apps);
        } else {
            return api.rpc("/heroku/apps").then(function(apps) {
                cache.set("apps", apps, 3600);
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
    var deployApp = function(gitUrl) {
        gitUrl = gitUrl || app.git_url;
        dialogs.confirm("Deploy code to application <b>"+_.escape(gitUrl)+"</b>?").then(function() {
            commands.run("monitor.open");
            api.rpc("/heroku/deploy", {
                'git': app.git_url
            });
        });
    };

    return {
        'search': searchApps,
        'deploy': deployApp,
        'apps': listApps
    }
});