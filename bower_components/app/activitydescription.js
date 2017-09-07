/**
 * @file 
 * Provides main Backbone view events and models.
 *
 * all te backbone events and models are presence here
 *
 * Author: Viniston Fernando
 */
$(document)
    .ready(function() {

        /**
         * Backbone view.
         **/

        window.AppView = Backbone.View.extend({
            el: $(".totalstaybooking"),

            // Main initialization entry point...

            initialize: function() {
                this.getActivityDescription();
            },

            getParameterByName:function(name, url) {
                if (!url) url = window.location.href;
                name = name.replace(/[\[\]]/g, "\\$&");
                var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                    results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            },


            getActivityDescription: function(e) {
                var template,
				    searchTemplate,
                    self = this,
                    model = {};
                template = $("#tmpl-activity-description").html();
				searchTemplate = $("#tmpl-search-criteria").html();
                $.ajax({
                    url: "../api/catalog/activity/details/" + self.getParameterByName('SearchQualifier'),
                    type: "Get",
                    success: function(e) {
                        if (e != null) {
                            
							var searchCriteria = Storage.prototype.getObject("searchCriteria");
							 var htmSearch = Mustache.render(searchTemplate, searchCriteria);
							 self.$("#SearchCriteriaPlaceHolder").html(htmSearch);
							
							model.activityDetail = e;							
                            var htm = Mustache.render(template, model);
                            self.$(".historical-wrapper").html(htm);
                        }
                           
                    },
                    error: function(e, o, t) {
                        console.log(e + "\n" + o + "\n" + t);
                    }
                });
                return true;

            },

            // Backbone View events ...

            events: {
            }

        });

        var appview = new AppView();
    });