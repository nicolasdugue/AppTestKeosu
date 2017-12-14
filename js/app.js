var importedPackages = ["keosu-base","angularJs","jQuery","keosu-push","keosu-menu","keosu-last-article","keosu-comments","keosu-share","keosu-article","keosu-calendar","lib-js","keosu-picture-gallery","keosu-map"];
var app = angular.module('keosuApp', ['angularSpinner','angular-carousel','ngSanitize', 'ngTouch', 'ngRoute','angular-inview','LocalStorageModule','CacheManagerModule','ui.bootstrap']);

app.config(function( $compileProvider ) {
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);

	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|ms-appx|x-wmapp0):|data:image\//);
});



app.controller('main_Controller', function($http, $rootScope, $scope) {

	/**
	 * Init Buttons
	 */
    $rootScope.initButton = function() {
        // $rootScope;previousButton : used to display a return button in the header
        // to show the button you should set the value true to the boolean
        // when you click on the button, the method $rootScope.prev is called
        $rootScope.previousButton = true;
        $rootScope.closeButton = false;
    };

	/**
	 * Manage buttons when calling previous page
	 */
	$rootScope.back = function() {
        $rootScope.previousButton = true;
        if ($rootScope.closeButton) {
            $rootScope.closeButton = false;
        }
        else {
            window.history.back();
        }
        $scope.$broadcast('back',null);
    };

	/**
	 * Manage buttons when opening an list element
	 * @param arg
	 */
	$rootScope.open = function (arg) {
        $rootScope.previousButton = false;
        $rootScope.closeButton = true;

        $scope.$broadcast('open', arg);
    };

    $http.get('data/globalParam.json').success(function(data) {
		$rootScope.appName = data.name;
	});
	$rootScope.initButton();
	$rootScope.offline = false;
	document.addEventListener("offline", function() {
		$rootScope.offline = true;
		alert("Network unreachable. The page will be reload soon as possible.");
		document.addEventListener("online", function() {
			$rootScope.offline = false;
			alert("Reconnection !");
			document.removeEventListener("online", function(){}, false);
			location.reload();
		}, false);
	}, false);

	$scope.alert = function(title, message) {
		if (typeof navigator.notification === 'undefined') {
			alert(message);
		} else {
			navigator.notification.alert(
				message,
				function(){},
				title,
				'OK'
			);
		}
	};
});

/************************************************************************
 Keosu is an open source CMS for mobile app
 Copyright (C) 2013  Vincent Le Borgne

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 ************************************************************************/
// Don't forget to take a look at exportListener.php before edit this file

app.directive('keosuPush', function () {
    return {
        restrict: 'E',
        templateUrl: 'plugins/keosu-push/templates/default.html',
        controller: ['$scope', '$http', function ($scope, $http) {

            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

            console.log('function init');
            $scope.init = function () {
                document.addEventListener('deviceready', function () {
                    console.log('i\'m ready');

                    $http.get('data/globalParam.json').success(function (data) {
                        console.log(data);
                    });

                    if (typeof(device) != 'undefined' && typeof(PushNotification) != 'undefined') {
                        $http.get('data/globalParam.json').success(function (data) {
                            $scope.host = data.host;
                            var push = PushNotification.init({
                                android: {
                                    senderID: pushNotificationData.senderID + "", 'ecb': "appAndroid.onNotification"
                                },
                                ios: {
                                    alert: "true",
                                    badge: "true",
                                    sound: "true"
                                },
                                windows: {}
                            });

                            push.on('registration', function (data) {
                                var deviceId = (device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos") ? 2 : 1;
                                $http.post($scope.host + 'service/push/plugin/addDevice/' + deviceId, 'token=' + data.registrationId);
                            });

                            push.on('notification', function (data) {
                                function onConfirm(buttonIndex) {
                                }

                                navigator.notification.confirm(
                                    data.message,   // message
                                    onConfirm,      // callback to invoke with index of button pressed
                                    'Notification', // title
                                    ['OK']          // buttonLabels
                                );
                            });

                            push.on('error', function (e) {
                            });
                        });
                    }

                });
            };
        }]
    };
});


app.config(function($routeProvider,$locationProvider){
	$routeProvider.when("/Page/:pageName",{
		templateUrl: function(params) {
			return params.pageName+".html";
		}
	})
	.otherwise({redirectTo:"/Page/5"});
});/************************************************************************
	Keosu is an open source CMS for mobile app
	Copyright (C) 2013  Vincent Le Borgne

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 ************************************************************************/
app.controller('keosu-menuController', function ($rootScope, $scope, $http,$location) {
	$scope.init = function(params) {
		$rootScope.initButton();
		$scope.pages = params.gadgetParam.pages;
		$http.get('data/'+params.gadgetId+".json").success(function(data) {
			console.log(data);
			$scope.pages = data;
		});
	};

    $scope.getPath = function(icon,iconActive, page) {

        return $location.path() == '/Page/'+page ? 'data/menu/'+iconActive : 'data/menu/'+icon;
    }

	// @see https://stackoverflow.com/questions/12592472/how-to-highlight-a-current-menu-item-in-angularjs
	$scope.getClass = function(page) {
		return $location.path() == '/Page/'+page ? 'active' : ''
	}
});
app.directive('keosuComments', function(){
	return {
		restrict : 'E',
		scope : {
			objectId: '=objectId',
			objectName: '=objectName',
			enableComments: '=enableComments'
		},
		templateUrl : 'plugins/keosu-comments/templates/default.html',
		controller : ['$scope','$http', function ($scope, $http) {
		
			$scope.$watch('objectId', function() {
				$scope.myinit();
        	});
			
			$scope.myinit = function() {
				$http.get('data/globalParam.json').success(function(data){
					$scope.host = data.host;
					$scope.commentListAction();
				});
			}

			$scope.commentListAction = function() {
				if ($scope.objectId) {
					$http.get($scope.host + 'service/gadget/myaccount/info').success(function(data) {
						if(data.connect) {
							$http.get($scope.host+'service/gadget/comment/'+$scope.objectName+'/'+$scope.objectId).success(function(data){
								$scope.comments = data.comments;
								$scope.connect = data.connect;
							});
						}

					});

				}
			};

			$scope.commentAddAction = function() {
				var data = "message="+$scope.messageComment;
				$scope.messageComment = "";
				if (data != "message=") {//check if the commentaire is not empty
					$http.post($scope.host+'service/gadget/comment/'+$scope.objectName+'/'+$scope.objectId,data).success(function(data){
						$scope.comments = data.comments;
						$scope.connect = data.connect;
					});
				};
			};
		}]
	};
});
//https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin/blob/master/README.md

app.directive('keosuShare', function(){
	return {
		restrict : 'E',
		scope : {
			object: '=object',
			url: '=url'
		},
		templateUrl : 'plugins/keosu-share/templates/default.html',
		controller : ['$scope','$http', function ($scope, $http) {

			$scope.share = function () {
				//window.plugins.socialsharing.share('Message, subject, image and link',
				// 'The subject',
				// 'https://www.google.nl/images/srpr/logo4w.png',
				// 'http://www.x-services.nl');
				window.plugins.socialsharing.share($scope.object.title, null, null, $scope.url);
			};
			$scope.$watch('objectId', function() {
        	});
		}]
	};
});
/************************************************************************
 Pockeit is an open source CMS for mobile app
 Copyright (C) 2013  Vincent Le Borgne

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 ************************************************************************/



//Main function
app.controller('keosu-last-articleController', function ($rootScope, $scope, $http, $sce, $timeout, $location, usSpinnerService, cacheManagerService) {

    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

    $scope.parts = function (isList, isArticle) {
        $scope.isList = isList;
        $scope.isArticle = isArticle;
    }
    /**
     * specific action when the 'back' or 'close' button is called
     */
    $scope.$on('back', function () {
        $scope.slide = "fadeIn";
        $scope.parts(true, false);
    });
    /**
     * specific action when the 'open' button is called
     */
    $scope.$on('open', function (event, page) {
        $scope.article = page;
        $scope.parts(false, true);
    });

    $scope.next = function () {
        if (!$scope.isLastPage) {
            $scope.isFirstPage = true;
            $scope.isLastPage = true;
            $scope.slide = "slideInRight";
            $scope.activePage++;
            $scope.getPage($scope.activePage, true);
        }

    };
    $scope.previous = function () {
        if (!$scope.isFirstPage) {
            $scope.isFirstPage = true;
            $scope.isLastPage = true;
            $scope.slide = "slideInLeft";
            $scope.activePage--;
            $scope.getPage($scope.activePage, true);
        }
    };
    $scope.more = function () {
        $scope.activePage++;
        $scope.getPage($scope.activePage, false);
    }
    /**
     * @pageNum : page number requested.
     * @resetPages : if true, clean the array pages.
     */
    $scope.getPage = function (pageNum, resetPages) {
        if (resetPages) {
            $scope.pages = [];
        }
        usSpinnerService.spin('spinner'); // While loading, there will be a spinner
        cacheManagerService.get($scope.param.host + 'service/gadget/lastarticle/' + $scope.param.gadgetId + '/' + pageNum + '/json', $scope.param.gadgetParam.cache, $scope.param.gadgetParam.timeout).success(function (data) {
            usSpinnerService.stop('spinner');
            $scope.isFirstPage = data.isFirst;
            $scope.isLastPage = data.isLast;
            start = $scope.pages.length;
            for (i = 0; i < data.data.length; i++) {
                $scope.pages[start + i] = data.data[i];
                $scope.pages[start + i].content = $sce.trustAsHtml(decodedContent(data.data[i].content));
                $scope.pages[start + i].title = decodedContent(data.data[i].title);
            }
        }).error(function (error) {
            $scope.error = (error);
            usSpinnerService.stop('spinner');
        });
    }
    $scope.init = function (params) {
        $rootScope.previousButton = false;
        $scope.slide = "fadeIn";
        $scope.param = params;
        $scope.pages = new Array();
        $scope.parts(true, false);
        $scope.activePage = 0;
        $scope.isFirstPage = true;
        $scope.isLastPage = true;
        $scope.infiniteList = false;
        $scope.getPage($scope.activePage, true);
        $scope.max = parseInt($(document).height()) - parseInt($(window).height());
    };

    $scope.setInfiniteList = function () {
        $scope.infiniteList = true;
    };

    $(window).on('scroll', function () {
        if ($scope.isList && !$scope.isLastPage && $scope.infiniteList) {
            $scope.max = parseInt($(document).height()) - parseInt($(window).height()) - 2;
            if ($(window).scrollTop() >= $scope.max) {
                $scope.more();
            }
        }
    });
});/************************************************************************
 Keosu is an open source CMS for mobile app
 Copyright (C) 2014  Vincent Le Borgne

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 ************************************************************************/
app.controller('keosu-articleController', function ($scope, $http, $sce, usSpinnerService, cacheManagerService) {

    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";


    /////////////////////////
    // Init part
    /////////////////////////
    $scope.init = function (params) {
        $scope.param = params;
        $scope.articleInit();
    };

    /////////////////////////
    // Article part
    /////////////////////////
    $scope.articleInit = function () {
        if ($scope.param.gadgetParam.offline == true) {
            $http.get('data/article' + $scope.param.gadgetParam['article-id'] + '.json').success(function (data) {
                $scope.article = data;
                $scope.article.content = $sce.trustAsHtml(data.content);
            });
        } else {
            usSpinnerService.spin('spinner'); // While loading, there will be a spinner
            cacheManagerService.get($scope.param.host + 'service/gadget/article/' + $scope.param.gadgetId + '/json', $scope.param.gadgetParam.cache, $scope.param.gadgetParam.timeout).success(function (data) {
                usSpinnerService.stop('spinner');
                $scope.article = data;
                $scope.article.content = $sce.trustAsHtml(data.content);
            }).error(function (error) {
                $scope.error = (error);
                usSpinnerService.stop('spinner');
            });
        }
    };

});
/************************************************************************
 Pockeit is an open source CMS for mobile app
 Copyright (C) 2013  Vincent Le Borgne

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 ************************************************************************/



//Main function
app.controller('keosu-calendarController', function ($rootScope, $scope, $http, $sce, usSpinnerService, cacheManagerService) {

    var map = null;

    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

    $scope.parts = function (isList, isEvent) {
        $scope.isList = isList;
        $scope.isEvent = isEvent;
    };
    /**
     * specific action when the 'back' or 'close' button is called
     */
    $scope.$on('back', function () {
        $scope.slide = "fadeIn";
        $scope.parts(true, false);

    });
    $scope.next = function () {
        if (!$scope.isLastPage) {
            $scope.isFirstPage = true;
            $scope.isLastPage = true;
            $scope.slide = "slideInRight";
            $scope.activePage++;
            $scope.getPage($scope.activePage, true);
        }
    };
    $scope.previous = function () {
        if (!$scope.isFirstPage) {
            $scope.isFirstPage = true;
            $scope.isLastPage = true;
            $scope.slide = "slideInLeft";
            $scope.activePage--;
            $scope.getPage($scope.activePage, true);
        }
    };
    /**
     * specific action when the 'open' button is called
     */
    $scope.$on('open', function (event, page) {
        $scope.event = page;
        $scope.parts(false, true);

        // edit Map
        map.editMarker("marker", [$scope.event.lat, $scope.event.lng]);
        map.setZoom($scope.param.gadgetParam.zoom);

        window.setTimeout(function () {
            google.maps.event.trigger($("#map_canvas")[0], 'resize');
            map.setCenter([$scope.event.lat, $scope.event.lng]);
        }, 100);

        $scope.parts(false, true, $scope);
    });

    $scope.addToCalendar = function (eventObj) {
        if (window.plugins.calendar == null) {
            alert("not available on desktop")
        } else {
            startDate = new Date(parseInt(eventObj.datems));
            startDate = new Date(parseInt(eventObj.datems) + 25000);
            //TODO Fix this
            $scope.successCal = function () {
                alert("Success: " + JSON.stringify("Event Added!"));
            };
            $scope.errorCal = function (message) {
                alert("Error: " + JSON.stringify(message));
            };

            window.plugins.calendar.createEvent(eventObj.name, eventObj.place, eventObj.name, startDate, startDate, $scope.successCal, $scope.errorCal);
        }
    }

    $scope.more = function () {
        $scope.activePage++;
        $scope.getPage($scope.activePage, false);
    }
    /*
     * @pageNum : page number requested.
     * @resetPages : if true, clean the array pages.
     */
    $scope.getPage = function (pageNum, resetPages) {
        if (resetPages) {
            $scope.pages = [];
        }
        usSpinnerService.spin('spinner'); // While loading, there will be a spinner
        cacheManagerService.get($scope.param.host + 'service/gadget/calendar/' + $scope.param.gadgetId + '/' + pageNum + '/json', $scope.param.gadgetParam.cache, $scope.param.gadgetParam.timeout).success(function (data) {
            usSpinnerService.stop('spinner');
            $scope.isFirstPage = (pageNum == 0);
            $scope.isLastPage = data.isLast;
            start = $scope.pages.length;
            for (i = 0; i < data.data.length; i++) {
                $scope.pages[start + i] = data.data[i];
                $scope.pages[start + i].id = $sce.trustAsHtml(decodedContent(data.data[i].id));
                $scope.pages[start + i].name = $sce.trustAsHtml(decodedContent(data.data[i].name));
                $scope.pages[start + i].date = $sce.trustAsHtml(decodedContent(data.data[i].date));
            }
        }).error(function (error) {
            $scope.error = (error);
            usSpinnerService.stop('spinner');
        });
    }
    $scope.init = function (params) {
        console.log("init calendar gadget");
        $scope.slide = "fadeIn";
        $scope.param = params;
        $scope.pages = new Array();
        $scope.parts(true, false);
        $scope.activePage = 0;
        $scope.isFirstPage = true;
        $scope.isLastPage = true;
        $scope.getPage($scope.activePage, true);
        //init Map
        map = new MapElement({name : "map_canvas"});
        map.addMarker("marker", [0, 0]);
    };
});

/************************************************************************
	Keosu is an open source CMS for mobile app
	Copyright (C) 2013  Vincent Le Borgne

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 ************************************************************************/	



//Main function

app.controller('keosu-picture-galleryController', function ($rootScope, $scope, $http, usSpinnerService, cacheManagerService) {
	$scope.parts = function (isGallery, isPicture, $scope) {
		$scope.isGallery = isGallery;
		$scope.isPicture = isPicture;
	}
	$scope.parts(true, false, $scope);
	$scope.index = 0;
	$scope.next = function(){
		if($scope.isLastPage()){
			$scope.slidePage="slideInRight";
			$scope.activePage.page = $scope.activePage.page+1;
		}
	};
	$scope.previous = function(){
		if($scope.activePage.page-1 >=0){
			$scope.slidePage="slideInLeft";
			$scope.activePage.page = $scope.activePage.page-1;
		}
	};
	$scope.$on('back', function () {
		$scope.slideElement="zoomIn";
		$scope.slide="fadeIn";
		$scope.parts(true, false, $scope);
	});
	$scope.$on('open', function (event, page) {
		$scope.indexSlide= page.id-1;
		$scope.slidePage="fadeIn";
		$scope.image = page;
		$scope.index = page.id - 1;
		$scope.parts(false, true, $scope);
	});
	$scope.swipeLeft = function() {
		$scope.slideElement="slideInRight";
		if ($scope.index == $scope.imageLength - 1)
			$scope.index = 0;
		else
			$scope.index++;
	};
	$scope.swipeRight = function() {
		$scope.slideElement="slideInLeft";
		if ($scope.index == 0)
			$scope.index = $scope.imageLength - 1;
		else
			$scope.index--;
	};
	$scope.isLastPage = function() {
		return ($scope.activePage.page+1 < $scope.pages.length);
	};
	$scope.init = function (params) {
		$rootScope.previousButton = false;
		$scope.indexSlide=0;
		$scope.slideElement="zoomIn";
		$scope.slidePage="fadeIn";
		$scope.param = params;
		$scope.activePage = {
				page:0
		};
		$scope.imgClass = [];
		$scope.infiniteList = false;
		usSpinnerService.spin('spinner');
		cacheManagerService.get( $scope.param.host + 'service/gadget/picturesgallery/'+$scope.param.gadgetId+'/0/json', $scope.param.gadgetParam.cache, $scope.param.gadgetParam.timeout).success(function (data) {
					usSpinnerService.stop('spinner');
					$tmp = [];
					for (i = 0; i < data.data.length; i++) {
						$tmp[i] = data.data[i];

						if (data.data[i].orientation == 'landscape')
							$scope.imgClass[$tmp[i].id] = "picture-horizontal";
						else
							$scope.imgClass[$tmp[i].id] = "picture-vertical";

					}
					$scope.images = $tmp;
					$scope.imageLength = $tmp.length;
					nb = 0;
					pages = [];
					for (i = 0; i < $tmp.length; i++) {
						tmpPage = [];
						for (j = 0; j < data.picturesperpage; j++) {
							if (!$tmp[i])
								break;
							tmpPage[j] = $tmp[i];
							i++;
						}
						i--;
						pages[nb] = tmpPage;
						nb++;
					}
					$scope.pages = pages;
                    // For the template gallery-thumbs-navigation, we need to set the first image to get the comments
                    if (pages[0] && pages[0][0])
                        $scope.image = pages[0][0];
				}).error(function (error) {
			$scope.error = (error);
			usSpinnerService.stop('spinner');
		});
	};

	$scope.setInfiniteList = function(){
		$scope.infiniteList = true;
	};

	$(window).on('scroll', function() {
		if ($scope.isGallery && !$scope.isLastPage() && $scope.infiniteList){
			$scope.max = parseInt($(document).height()) - parseInt($(window).height()) - 2;
			if ($(window).scrollTop() >= $scope.max) {
				$scope.next();
			}
		}
	});
});
/************************************************************************
 Keosu is an open source CMS for mobile app
 Copyright (C) 2013  Vincent Le Borgne

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 ************************************************************************/

//Main function

app.controller('keosu-mapController', function ($scope, $http, $sce, usSpinnerService, cacheManagerService) {

	////////////////////////////
	// init part
	////////////////////////////
	$scope.init = function (params) {
		$scope.param = params;
		$scope.showMapAction();
	};

	/////////////////////////////
	// Map part
	/////////////////////////////
	$scope.showMapAction = function () {
		usSpinnerService.spin('spinner'); // While loading, there will be a spinner

		cacheManagerService.get($scope.param.host + 'service/gadget/mapgadget/' + $scope.param.gadgetId + '/json', $scope.param.gadgetParam.cache, $scope.param.gadgetParam.timeout).success(function (data) {
			usSpinnerService.stop('spinner');
			$scope.map = data[0];
			
			$scope.title = $('<div/>').html(data[0].name).text();
			$scope.content = $sce.trustAsHtml(data[0].description);

			//init map
			var map = new MapElement({name : "map_canvas"});
			map.addMarker("marker", [data[0].lat, data[0].lng]);
			map.setCenter([data[0].lat, data[0].lng]);
			map.setZoom($scope.param.gadgetParam.zoom);
			google.maps.event.trigger($("#map_canvas")[0], 'resize');

		}).error(function (error) {
			$scope.error = (error);
			usSpinnerService.stop('spinner');
		});
	};
});
