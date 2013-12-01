define([
    "heroku",
    "less!stylesheets/panel.less"
], function(heroku) {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var PanelBaseView = codebox.require("views/panels/base");

    var PanelHerokuView = PanelBaseView.extend({
        className: "cb-panel-heroku",
        templateLoader: "addon.heroku.templates",
        template: "panel.html",
        events: {
            "click .heroku-refresh-app": "refreshApps",
            "click li[data-heroku-app]": "deployApp"
        },

        initialize: function() {
            PanelHerokuView.__super__.initialize.apply(this, arguments);
            this.apps = [];
            this.refreshApps();
        },

        templateContext: function() {
            return {
                apps: this.apps
            }
        },

        refreshApps: function(e) {
            var that = this;
            if (e) e.preventDefault();
            heroku.apps(true).then(function(apps) {
                that.apps = apps;
                that.update();
            });
        },

        deployApp: function(e) {
            if (!e) return;
            var gitUrl = $(e.currentTarget).data("heroku-app");
            heroku.deploy(gitUrl);
        }
    });

    return PanelHerokuView;
});