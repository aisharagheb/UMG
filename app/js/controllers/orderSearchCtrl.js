four51.app.controller('OrderSearchCtrl', ['$scope', '$location', 'OrderSearchCriteria', 'OrderSearch', 'Order',
	function ($scope,  $location, OrderSearchCriteria, OrderSearch, Order) {
		$scope.settings = {
			currentPage: 1,
			pageSize: 10
		};

		//URL logic to direct user straight to awaiting approval order
		function getOrdersAwaitingApproval() {
			var criteria = {Type: "Standard", Status: "AwaitingApproval", DisplayName: "Awaiting Approval", LastN: 0, OrderID: null};
			$scope.orderLoadingIndicator = true;
			OrderSearch.search(criteria, function(list, count) {
				$scope.orderLoadingIndicator = true;
				$scope.orders = list;
				$scope.settings.listCount = count;
				$scope.showNoResults = list.length == 0;
				$scope.orderLoadingIndicator = false;
			}, $scope.settings.currentPage, $scope.settings.pageSize);
		}

		getOrdersAwaitingApproval();
		$scope.$watch("orders", function(){
			angular.forEach($scope.orders, function(o){
				if($scope.URL.indexOf(o.ExternalID) > -1){
					$location.path("/order/" + o.ID);
					$scope.$parent.URL = null;
				}
			});
		},true);

		OrderSearchCriteria.query(function(data) {
			$scope.OrderSearchCriteria = data;
			$scope.hasStandardTypes = _hasType(data, 'Standard');
			$scope.hasReplenishmentTypes = _hasType(data, 'Replenishment');
			$scope.hasPriceRequestTypes = _hasType(data, 'PriceRequest');
			var path = $location.$$path;
			angular.forEach($scope.OrderSearchCriteria, function(c){
				if(c.Status == 'AwaitingApproval' && path =='/approval'){
					$scope.currentCriteria = c;
					Query(c);
				}
			});
		});

		$scope.$watch('settings.currentPage', function() {
			Query($scope.currentCriteria);
			getOrdersAwaitingApproval();
		});

		$scope.OrderSearch = function($event, criteria) {
			$event.preventDefault();
			$scope.currentCriteria = criteria;
			Query(criteria);
		};
		function _hasType(data, type) {
			var hasType = false;
			angular.forEach(data, function(o) {
				if (hasType || o.Type == type && o.Count > 0)
					hasType = true;
			});
			return hasType;
		}

		function getOrder(o) {
			Order.get(o.ID, function (data) {
				o.Approvals = data.Approvals;
				//Hide approval tab for non-approvers
				$scope.isApprover = false;
				if($scope.orders){
					angular.forEach($scope.orders, function(o){
						if(o.Status == 'AwaitingApproval'){
							$scope.isApprover = true;
						}
					});
				}
			});
		}

		function Query(criteria) {
			if (!criteria) return;
			$scope.showNoResults = false;
			$scope.pagedIndicator = true;
			OrderSearch.search(criteria, function (list, count) {
				$scope.orders = list;
				angular.forEach($scope.orders, function(order) {
					getOrder(order);
				});
				$scope.settings.listCount = count;
				$scope.showNoResults = list.length == 0;
				$scope.pagedIndicator = false;
			}, $scope.settings.currentPage, $scope.settings.pageSize);
			$scope.orderSearchStat = criteria;
		}


		/*$scope.$watch("orders", function(){
		 if($scope.orders){
		 angular.forEach($scope.orders, function(o) {
		 Order.get(o.ID, function (data) {
		 o = data;
		 });
		 });
		 }
		 })*/
	}]);