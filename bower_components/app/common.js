$(document)
    .ready(function() {
		
		Storage.prototype.setObject = function(key, value) {
			window.localStorage.setItem(key, JSON.stringify(value));
		},

		Storage.prototype.getObject = function(key) {
					var value = window.localStorage.getItem(key);
					return value && JSON.parse(value);
		}
	});