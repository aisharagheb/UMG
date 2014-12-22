four51.app.filter('onproperty', ['$451', function($451) {
	var defaults = {
		'OrderStats': 'Type',
		'Message': 'Box'
	};

	return function(input, query) {
		if (!input || input.length === 0) return;
		if (!query) return input;
		query.Property = query.Property || defaults[query.Model];
		return $451.filter(input, query);
	}
}]);

four51.app.filter('kb', function() {
	return function(value) {
		return isNaN(value) ? value : parseFloat(value) / 1024;
	}
});

four51.app.filter('r', ['$sce', 'WhiteLabel', function($sce, WhiteLabel) {
	return function(value) {
		var result = value, found = false;
		angular.forEach(WhiteLabel.replacements, function(c) {
			if (found) return;
			if (c.key == value) {
				result = $sce.trustAsHtml(c.value);
				found = true;
			}
		});
		return result;
	}
}]);

four51.app.filter('rc', ['$sce', 'WhiteLabel', function($sce, WhiteLabel) {
	return function(value) {
		var result = value, found = false;
		angular.forEach(WhiteLabel.replacements, function(c) {
			if (found) return;
			if (c.key.toLowerCase() == value.toLowerCase()) {
				result = $sce.trustAsHtml(c.value);
				found = true;
			}
		});
		return result;
	}
}]);

four51.app.filter('rl', ['$sce', 'WhiteLabel', function($sce, WhiteLabel) {
	return function(value) {
		var result = value, found = false;
		angular.forEach(WhiteLabel.replacements, function(c) {
			if (found) return;
			if (c.key.toLowerCase() == value.toLowerCase()) {
				result = $sce.trustAsHtml(c.value.toLowerCase());
				found = true;
			}
		});
		return result;
	}
}]);

four51.app.filter('noliverates', function() {
	return function(value) {
		var output = [];
		angular.forEach(value, function(v) {
			if (v.ShipperRateType != 'ActualRates')
				output.push(v);
		});
		return output;
	}
});

four51.app.filter('paginate', function() {
	return function(input, start) {
		if (typeof input != 'object' || !input) return;
		start = +start; //parse to int
		return input.slice(start);
	}
});

four51.app.filter('HideAddToOrderSpecs', function() {
	return function(value) {
		var output = [];
		angular.forEach(value, function(v) {
			if (v.Name != 'Download' && v.Name != 'Preview')
				output.push(v);
		});
		return output;
	}
});

four51.app.filter('HideOrderField', function() {
	return function(value) {
		var output = [];
		angular.forEach(value, function(v) {
			if (v.Name != 'Payment Method')
				output.push(v);
		});
		return output;
	}
});

four51.app.filter('awaitingApprovalFilter', function() {
	return function(value) {
		var output = [];
		angular.forEach(value, function(v) {
			if (v.Status == 'AwaitingApproval')
				output.push(v);
		});
		return output;
	}
});

four51.app.filter('orderFilter', function() {
	return function(value) {
		var output = [];
		angular.forEach(value, function(v) {
			if (v.Status != 'AwaitingApproval')
				output.push(v);
		});
		return output;
	}
});

four51.app.filter('groupfilter', function() {
	return function(input) {
		var validGroups = ['Universal Music Distribution',
			'Universal Music Enterprises',
			'Universal Music Group',
			'Universal Music Group International',
			'Universal Music Group Latin Entertainment',
			'Verve Music Group',
			'VP'];
		for (var i in validGroups) {
			if (input.Name == validGroups[i])
				return input.Name;
		}
		return '';
	}
});