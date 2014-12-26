four51.app.controller('CheckOutViewCtrl', ['$scope', '$routeParams', '$location', '$filter', '$rootScope', '$451', 'Analytics', 'User', 'Order', 'OrderConfig', 'FavoriteOrder', 'AddressList',
	function ($scope, $routeParams, $location, $filter, $rootScope, $451, Analytics, User, Order, OrderConfig, FavoriteOrder, AddressList) {
		$scope.errorSection = 'open';

		$scope.isEditforApproval = $routeParams.id != null && $scope.user.Permissions.contains('EditApprovalOrder');
		if ($scope.isEditforApproval) {
			Order.get($routeParams.id, function(order) {
				$scope.currentOrder = order;
			});
		}
		else $scope.currentOrder.ExternalID = $scope.currentOrder.autoID ? null : 'auto';

		//Less Than 10 Days should default to a default Rush Order
		$scope.currentDate = new Date();
		$scope.rushOrder = false;
		angular.forEach($scope.currentOrder.LineItems, function(li){
			var rushOrderDate = new Date();
			rushOrderDate.setDate($scope.currentDate.getDate()+ 10);
			if(Date.parse(li.DateNeeded) < rushOrderDate){
				$scope.rushOrder = true;
			}
		});
		angular.forEach($scope.currentOrder.OrderFields, function(of){
			angular.forEach(of.Options, function(op){
				if(op.Value == 'Standard – Delivery Time is 10-15 business days after final approval'){
					$scope.noRush = op.Value;
				}
				if(op.Value == 'Rush – will ship 3-5 work days from final approval, based on date request and production time. Additional fee may be incurred.'){
					$scope.yesRush = op.Value;
				}
			});
			if(of.Name == 'Rush Order'){
				if($scope.rushOrder){
					of.Value = $scope.yesRush;
				}
				else{of.Value = $scope.noRush}
			}
		});

		if (!$scope.currentOrder) {
			$location.path('catalog');
		}

		AddressList.query(function(list) {
			$scope.addresses = list;
		});

		$scope.hasOrderConfig = OrderConfig.hasConfig($scope.currentOrder, $scope.user);
		$scope.checkOutSection = $scope.hasOrderConfig ? 'order' : 'shipping';

		$scope.shipaddress = { Country: 'US', IsShipping: true, IsBilling: false };
		$scope.billaddress = { Country: 'US', IsShipping: false, IsBilling: true };

		$scope.$on('event:AddressSaved', function(event, address) {
			if (address.IsShipping) {
				$scope.currentOrder.ShipAddressID = address.ID;
				if (!$scope.shipToMultipleAddresses)
					$scope.setShipAddressAtOrderLevel();
				$scope.addressform = false;
			}
			if (address.IsBilling) {
				$scope.currentOrder.BillAddressID = address.ID;
				$scope.billaddressform = false;
			}
			AddressList.query(function(list) {
				$scope.addresses = list;
			});
			$scope.shipaddress = { Country: 'US', IsShipping: true, IsBilling: false };
			$scope.billaddress = { Country: 'US', IsShipping: false, IsBilling: true };
		});

		function submitOrder() {
			$scope.displayLoadingIndicator = true;
			$scope.errorMessage = null;
			Order.submit($scope.currentOrder,
				function(data) {
					$scope.user.CurrentOrderID = null;
					User.save($scope.user, function(data) {
						$scope.user = data;
						$scope.displayLoadingIndicator = false;
					});
					$scope.currentOrder = null;
					$location.path('/order/' + data.ID);
				},
				function(ex) {
					$scope.errorMessage = ex.Message;
					$scope.displayLoadingIndicator = false;
					$scope.shippingUpdatingIndicator = false;
					$scope.shippingFetchIndicator = false;
				}
			);
		};

		$scope.$watch('currentOrder.CostCenter', function() {
			OrderConfig.address($scope.currentOrder, $scope.user);
		});

		function saveChanges(callback) {
			$scope.displayLoadingIndicator = true;
			$scope.errorMessage = null;
			$scope.actionMessage = null;
			var auto = true;
			$scope.currentOrder.ExternalID = 'auto';
			Order.save($scope.currentOrder,
				function(data) {
					$scope.currentOrder = data;
					if (auto) {
						$scope.currentOrder.autoID = true;
						$scope.currentOrder.ExternalID = 'auto';
					}
					$scope.displayLoadingIndicator = false;
					if (callback) callback($scope.currentOrder);
					$scope.actionMessage = "Your changes have been saved";
				},
				function(ex) {
					//$scope.currentOrder.ExternalID = null;
					$scope.errorMessage = ex.Message;
					$scope.displayLoadingIndicator = false;
					$scope.shippingUpdatingIndicator = false;
					$scope.shippingFetchIndicator = false;
				}
			);
		};

		$scope.continueShopping = function() {
			if (confirm('Do you want to save changes to your order before continuing?') == true)
				saveChanges(function() { $location.path('catalog') });
			else
				$location.path('catalog');
		};

		$scope.cancelOrder = function() {
			if (confirm('Are you sure you wish to cancel your order?') == true) {
				$scope.displayLoadingIndicator = true;
				Order.delete($scope.currentOrder,
					function() {
						$scope.user.CurrentOrderID = null;
						$scope.currentOrder = null;
						User.save($scope.user, function(data) {
							$scope.user = data;
							$scope.displayLoadingIndicator = false;
							$location.path('catalog');
						});
					},
					function(ex) {
						$scope.actionMessage = ex.Message;
						$scope.displayLoadingIndicator = false;
					}
				);
			}
		};

		$scope.saveChanges = function() {
			saveChanges();
		};

		$scope.submitOrder = function() {
			submitOrder();
		};

		$scope.saveFavorite = function() {
			FavoriteOrder.save($scope.currentOrder);
		};
	}]);