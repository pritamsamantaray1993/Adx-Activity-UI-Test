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
                this.doAvailabilitySearch();
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

            groupActivityCategory: function (activities) {
                activities = activities.Results;
                var activityGroupColection = [], toJsonModel = { ActivityGroup: [] }, activity = {}, i;
                for (i = 0; i < activities.length; i++) {
                    var isExist = $.grep(activityGroupColection,
                        function(group) {
                            return group.CategoryName === activities[i].ActivityInfo.CategoryName;
                        });
                    if (isExist.length === 0) {
                        activity.CategoryName = activities[i].ActivityInfo.CategoryName;
                        activity.ActivityInfo = [];
                        activity.ShowAdultPrice = activities[i].ActivityInfo.AdultPrice &&
                            activities[i].ActivityInfo.AdultPrice.Amount > 0;
                        activity.ShowDiscount = activities[i].ActivityInfo.SpecialOffer ? true : false;
                        activity.ShowChildPrice = activities[i].ActivityInfo.ChildPrice &&
                            activities[i].ActivityInfo.ChildPrice.Amount > 0;
                        activity.ActivityInfo.push(activities[i].ActivityInfo);
                        activityGroupColection.push(activity);
                    } else {
                        isExist[0].ActivityInfo.push(activities[i].ActivityInfo);
                    }
                }
                toJsonModel.ActivityGroup = activityGroupColection;
                return toJsonModel;
            },

            doAvailabilitySearch: function(e) {
                var template,
                    self = this;
                template = $("#tmpl-activity").html();
                var dataInput = {
                    "MinPrice": null,
                    "MaxPrice": null,
                    "MinRating": 0,
                    "MaxRating": 5,
                    "MinDistance": null,
                    "MaxDistance": null,
                    "ActivityName": "",
                    "pageSize": 30,
                    "pageNumber": 1,
                    "ActivityType": [602],
                    "ApplyFiltering": true
                };

                $.ajax({
                    url: "../api/catalog/activity/availability/" + self.getParameterByName('CriteriaToken'),
                    type: "POST",
                    data: dataInput,
                    success: function(e) {
                        if (e != null) {
                            console.log(e);
                            var htm = Mustache.render(template, self.groupActivityCategory(e));
                            self.$("#activityholder").html(htm);
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
                "click #registerbtn": "doAvailabilitySearch"
            }

        });

        var appview = new AppView();
    });