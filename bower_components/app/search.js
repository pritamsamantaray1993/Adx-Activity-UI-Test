/**
 * @file 
 * Provides main Backbone view events and models.
 *
 * all te backbone events and models are presence here
 *
 * Author: Viniston Fernando
 */
$(document).ready(function () {

    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    /**
    * Backbone view model.
    **/
    var searchModel = Backbone.Model.extend({
        defaults: {
            ArrivalDate: moment().format(),
            Duration: 1,
            MinStarRating: 1,
            Adults: 1,
            Children: 0,
            Infants: 0,
            RegionId: 72
        }
    });

    /**
     * Backbone view.
     **/

    window.AppView = Backbone.View.extend({

        el: $(".totalstaybooking"),

        // Main initialization entry point...

        initialize: function () {
            this.initInputForm();
            this.findAddress();
        },

        initInputForm: function () {
            $('select').select2();
            $('.activitydate').datepicker({
                format: "mm/dd/yyyy",
                language: 'en',
                autoclose: true,
                defaultDate: moment().toDate()
            }).on('changeDate', function (ev) {
                $('.activitydate').datepicker('hide');
            });
            $("#startdate").datepicker('setDate', moment().toDate());
            $("#enddate").datepicker('setDate', moment().add(2, 'days').toDate());
        },

        findAddress: function () {
            var map = {};
            $('[id*=destination]')
                .typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 3,
                    source: function (request, response) {
                        var items = [];
                        var data = $.grep(airports,
                            function (airport) {
                                if (request.length === 3)
                                    return airport.code.toLowerCase() === request.toLowerCase();
                                else {
                                    var spaceterm = request;
                                    return airport.name.toLowerCase().startsWith(spaceterm.toLowerCase()) ||
                                        airport.name.toLowerCase().indexOf(spaceterm.toLowerCase()) !== -1 ||
                                        airport.code.toLowerCase().startsWith(spaceterm.toLowerCase());
                                }
                            });
                        $.each(data,
                            function (i, item) {
                                var id = item.code;
                                var name = id + " - " + item.name;
                                map[name] = { id: id, name: id + " " + name, lat: item.lat, lon: item.lon };
                                items.push(name);
                            });
                        response(items);
                        $(".dropdown-menu").css("height", "auto");
                    },
                    updater: function (item) {
                        $('[id*=IATACode]').val(map[item].id);
                        $('[id*=Latitude]').val(map[item].lat);
                        $('[id*=Longitude]').val(map[item].lon);
                        return item;
                    }
                });
        },

        doAvailabilitySearch: function (e) {
            var template,
                dataObj,
                self = this;
            dataObj = this.$('#RegMetadata').serializeObject();
            var dataInput = {
                "Destination":
                {
                    "IATACode": dataObj.IATACode,
                    "DestinationType": "1",
                    "Description": $("#destination").val(),
                    "Latitude": dataObj.Latitude,
                    "Longitude": dataObj.Longitude
                },
                "ActivityType": "0",
                "StartDate": dataObj.StartDate,
                "EndDate": dataObj.EndDate,
                "MinRating": dataObj.MinRating,
                "MaxRating": dataObj.MaxRating,
                "AgentId": 1347,
                "Currency": dataObj.Currency,
                "ProviderType": "1",
                "QuoteOwners": [
                    {
                        "DelegatorFirstName": "System",
                        "DelegatorLastName": "Kensingtontours ",
                        "DelegateAgentId": 1347,
                        "IsUser": true,
                        "Selected": true
                    }
                ]
            };

            $.ajax({
                url: "../api/catalog/activity/availabilitycriteria",
                type: "POST",
                data: dataInput,
                success: function(e) {
                    if (e.Response != null) {
                        var htm = Mustache.render(template, e.Response.PropertyResults);
                        self.$("#tbdyHistory").html(htm);
                        console.log(e.Response);
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
            "change #select2-state": "stateSelected",
            "change #select2-city": "populateStationCode",
            "change input.speedTrack": "calculateVariance",
            "click #btnCaptchaRfresh": "generateCaptchaImage",
            "click #registerbtn": "doAvailabilitySearch",
            "click #historicalData": "historicalData",
            "click #expandcollapse": "expandcollpasehistoryblock",

        }

    });

    var appview = new AppView();
});