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

            initControls: function () {
                $('select').select2();
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

            findAvailabilityDates: function(activityOptions) {
                return _.uniq(_.pluck(activityOptions, 'AvailableFromDate'));
            },

            groupActivityCategory: function (activities) {
                var self = this, activityOption = {};
                activities = activities.Results;
                var activityGroupColection = [], toJsonModel = { ActivityGroup: [] }, activity = {}, i;
                for (i = 0; i < activities.length; i++) {
                    var isExist = $.grep(activityGroupColection,
                        function(group) {
                            return group.CategoryName === activities[i].ActivityInfo.CategoryName;
                        });
                    if (isExist.length === 0) {
                        activity = {};
                        if (activities[i].ActivityInfo.ActivityOptions &&
                            activities[i].ActivityInfo.ActivityOptions.length > 0) {
                            activityOption = activities[i].ActivityInfo.ActivityOptions[0];
                        }
                        activity.CategoryName = activities[i].ActivityInfo.CategoryName;
                        activity.ActivityInfo = [];
                        activity.ShowAdultPrice = activityOption && activityOption.OptionType !== 1;
                        activity.ShowUnitPrice = activityOption && activityOption.OptionType === 1;
                        activity.ShowDiscount = activities[i].ActivityInfo.SpecialOffer ? true : false;
                        activity.ShowChildPrice = activityOption && activityOption.OptionType !== 1;
                        activity.AvailabilityDates = self.findAvailabilityDates(activities[i].ActivityInfo.ActivityOptions);
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
                    "pageSize": 100,
                    "pageNumber": 1,
                    "ActivityType": [0],
                    "ApplyFiltering": true
                };

                $.ajax({
                    url: "../api/catalog/activity/availability/" + self.getParameterByName('CriteriaToken'),
                    type: "POST",
                    data: dataInput,
                    success: function(e) {
                        if (e != null) {
                            var htm = Mustache.render(template, self.groupActivityCategory(e));
                            self.$("#activityholder").html(htm);
                            self.applyActivityOptionsAlternateRowColor();
                            self.initControls();
                        }
                           
                    },
                    error: function (e, o, t) {
                        e.ActivityGroup = {};
                        e.ErrorCoccured = true;
                        e.errorDto = JSON.parse(e.responseText);
                        var errorDetails = { errorData: e };
                        var htm = Mustache.render(template, errorDetails);
                        self.$("#activityholder").html(htm);
                        console.log(e + "\n" + o + "\n" + t);
                    }
                });
                return true;

            },

            applyActivityOptionsAlternateRowColor: function () {
                this.$('.activityOptionstbody').each(function() {
                    $(this).find('tr:even').addClass('Activities_line_color');
                });
                
            },

            // Backbone View events ...

            events: {
                "click #registerbtn": "doAvailabilitySearch"
            }

        });

        var appview = new AppView();
    });