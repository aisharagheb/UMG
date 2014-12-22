four51.app.directive('customemailfield', function() {
    var obj = {
        scope: {
            customfield : '=',
            changed: '=',
            hidesuffix: '@',
            hideprefix: '@'

        },
        restrict: 'E',
        transclude: true,
        templateUrl: 'partials/controls/customemailfield.html'
    }

    return obj;
    this.value = this.value.toLowerCase();
});