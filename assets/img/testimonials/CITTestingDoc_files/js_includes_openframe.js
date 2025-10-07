/*! RESOURCE: /scripts/com.sn_openframe/_snOpenFrame.js */
angular.module('sn.openFrame', ['sn.base', 'ng.common']);
;
/*! RESOURCE: /scripts/com.sn_openframe/root/controller.OpenFrame.js */
angular.module('sn.openFrame')
	.controller('OpenFrame', function ($scope, openFrameAjax, $window, amb) {
		var EVENTS = {
			GET_CONFIG: 'openframe_get_config',
			REQUEST: 'openframe_request',
			RESPONSE: 'openframe_response',
			SET_TOP_FRAME_URL: 'openframe_set_top_frame_url',
			INIT: 'openframe_init',
			VISIBLE: 'openframe_visible',
			CALL_EVENT: 'openframe_communication',
			OPENFRAME_BEFORE_DESTROY: 'openframe_before_destroy',
			OPENFRAME_SET_PRESENCE_INDICATOR: 'openframe_set_presence_indicator',
			OPEN_FORM_WITH_SUBTAB: 'openframe_open_form_with_subtab'
		};
		var existingOnbeforeunload = $window.onbeforeunload;
		$scope.config = {};
		$scope.whitelist = {};
		$scope.config.showMainFrame = false;
		$scope.config.overlayFrame = false;
		$scope.config.defaultConfigurationExists = false;
		$scope.$watch(function () {
			return $window.frames["gsft_openframe"];
		}, function () {
			$scope.config.partnerFrame = $window.frames["gsft_openframe"];
		});
		function showOpenFrameIcon(iconClass) {
			var ofButton = jQuery('#openframe-button');
			if (ofButton.length > 0) {
				jQuery('#openframe-button').removeClass('openframe-hidden');
				jQuery('#openframe-button').addClass(iconClass);
			}
		}
		function setOpenFrameConfiguration(config) {
			$scope.config.width = config.width || $scope.config.width;
			$scope.config.height = config.height || $scope.config.height;
			$scope.config.titleIcon = config.titleIcon || $scope.config.titleIcon;
			$scope.config.title1 = config.title || $scope.config.title1;
			$scope.config.title2 = config.subTitle || $scope.config.title2;
			$scope.config.allow = config.allow || $scope.config.allow;
			$scope.config.collapsedViewEnabled = (config.collapsedViewEnabled == 'true') || $scope.config.collapsedViewEnabled;
		}
		function fetchOpenFrameConfiguration(payload, scb, fcb, fullSettings) {
			if (!jQuery.isEmptyObject(payload))
				setOpenFrameConfiguration(payload);
			openFrameAjax.openFrameConfiguration().then(function (settings) {
				if (fullSettings)
					scb(settings);
				else
					scb(settings["config"]);
			}, function (result) {
				fcb(result);
			}
			);
		}
		fetchOpenFrameConfiguration({}, function (settings) {
			var index;
			var openFrameSet;
			openFrameSet = settings["config"];
			if (openFrameSet && openFrameSet.url) {
				$scope.config.defaultConfigurationExists = true;
amb.getChannel("/openframe/agent_status");
				amb.connect();
				showOpenFrameIcon(openFrameSet.navIconClass || 'icon-phone');
				setOpenFrameConfiguration(openFrameSet);
				$scope.config.url = openFrameSet.url;
				$scope.config.partnerDomain = '';
				$scope.config.partnerFrame = $window.frames["gsft_openframe"];
				if (openFrameSet.url) {
var isAbsUrl = /^(?:\/|[a-z]+:\/\/)/;
					if (isAbsUrl.test(openFrameSet.url)) {
						var url = parseURL($scope.config.url);
						$scope.config.partnerDomain = url.origin;
					} else {
$scope.config.partnerDomain = $window.location.protocol + "//" + $window.location.host;
					}
				}
			} else {
				if (!openFrameSet)
					console.log("No Configuration found");
				else
					console.log("The url to be loaded in openFrame is empty");
			}
		},
			function (result) {
				console.log("No Configuration found");
			}, true);
		function parseURL(url) {
			var parser = document.createElement('a');
			parser.href = url;
			return parser;
		}
		function callEvent(context) {
			$window.CustomEvent.fireToWindow($scope.config.partnerFrame, context.method, context.payload, true, $scope.config.partnerDomain);
		}
		$window.CustomEvent.observe(EVENTS.SET_TOP_FRAME_URL, function (context) {
			var url = '';
			if (context.form && context.form.entity) {
				url = context.form.entity + ".do";
				if (context.form.query)
					url += "?" + context.form.query;
			}
			if (context.list && context.list.entity) {
				url = context.list.entity + "_list.do";
				if (context.list.query)
					url += "?sysparm_query=" + context.list.query;
			}
			if (context.url)
				url = context.url.url;
			var mainFrame = jQuery("#gsft_main");
			if (mainFrame && mainFrame[0])
				mainFrame[0].src = url;
			else
$window.open($window.location.origin + "/" + url, '_blank');
		});
		$window.CustomEvent.observe(EVENTS.OPEN_FORM_WITH_SUBTAB, function (context) {
			var url = '';
			if (context.form && context.form.entity) {
				url = context.form.entity + ".do";
				url += "?sys_id=" + context.form.sys_id;
			}
			var mainFrame = jQuery("#gsft_main");
			if (mainFrame && mainFrame[0])
				mainFrame[0].src = url;
			else
$window.open($window.location.origin + "/" + url, '_blank');
		});
		$window.CustomEvent.observe(EVENTS.OPENFRAME_SET_PRESENCE_INDICATOR, function (context) {
			openFrameAjax.updateAgentPresence(context.state);
		});
		$window.CustomEvent.observe(EVENTS.REQUEST, function (context) {
			switch (context.method) {
case EVENTS.INIT: scb({ topDomain: $window.location.protocol + "//" + $window.location.host }); break;
				case EVENTS.GET_CONFIG: fetchOpenFrameConfiguration(context.payload, scb, fcb); break;
				case EVENTS.CALL_EVENT: callEvent(context); break;
				case EVENTS.VISIBLE: scb($scope.config.showMainFrame); break;
			}
			function scb(result) {
				$window.CustomEvent.fireToWindow($scope.config.partnerFrame, EVENTS.RESPONSE, { isSuccess: true, context: { id: context.id, result: result } }, true, $scope.config.partnerDomain);
			}
			function fcb(result) {
				$window.CustomEvent.fireToWindow($scope.config.partnerFrame, EVENTS.RESPONSE, { isSuccess: false, context: { id: context.id, result: result["data"] ? result["data"] : "error" } }, true, $scope.config.partnerDomain);
			}
		});
		$window.onbeforeunload = function () {
			$window.CustomEvent.fireToWindow($scope.config.partnerFrame, EVENTS.OPENFRAME_BEFORE_DESTROY, "", true, $scope.config.partnerDomain);
			if (existingOnbeforeunload)
				existingOnbeforeunload.apply(null, arguments);
		}
		$scope.$on('dragEvent', function (event, drag) {
			$scope.config.overlayFrame = drag;
			$scope.$apply();
		});
	});
;
/*! RESOURCE: /scripts/com.sn_openframe/root/factory.openFrameAjax.js */
angular.module('sn.openFrame')
	.factory('openFrameAjax', function ($http, $q) {
		function processAjaxRequest(method, params) {
			var deffered = $q.defer();
			var postData = {
				sysparm_processor: "OpenFrameAjaxUtility",
				sysparm_name: method
			};
			if (params)
				angular.extend(postData, params);
			$http({
				method: "post",
url: "/sn_openframe_openFrameAjaxProcessor.do",
				data: jQuery.param(postData),
headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).success(function (data) { deffered.resolve(data) })
				.error(function (data) { deffered.reject(data) });
			return deffered.promise;
		}
		return {
			openFrameConfiguration: function () {
				return processAjaxRequest("getOpenFrameConfiguration");
			},
			openFrameGetUserPreference: function (name) {
				return processAjaxRequest("getUserPreference", { name: name });
			},
			openFrameSetUserPreference: function (name, value) {
				return processAjaxRequest("setUserPreference", { name: name, value: value });
			},
			updateAgentPresence: function (state) {
				return processAjaxRequest("updateAgentPresence", { state: state });
			}
		};
	});
;
/*! RESOURCE: /scripts/com.sn_openframe/ui/directive.ofMainFrame.js */
angular.module('sn.openFrame')
	.directive('ofMainFrame', function ($window, openFrameAjax) {
		return {
templateUrl: 'scripts/com.sn_openframe/ui/template/ofMainFrame.html',
			restrict: 'E',
			replace: true,
			scope: {
				config: '=data'
			},
			link: function (scope, elem, attr) {
				var EVENTS = {
					OPENFRAME_HIDDEN: 'openframe_hidden',
					OPENFRAME_SHOWN: 'openframe_shown',
					SHOW: 'openframe_show',
					HIDE: 'openframe_hide',
					SET_SIZE: 'openframe_set_size',
					SET_WIDTH: 'openframe_set_width',
					SET_HEIGHT: 'openframe_set_height'
				};
				var FRAME_POSITION = "20%";
				var MAX_SIZE = 0.75;
				var USER_PREFERENCE_FRAME_POSITION = "openframe_user_frame_position";
				scope.iframeheight = {};
				scope.frameStyle = {};
				scope.framewidth = {};
				scope.showMinimize = {};
				
				function setFramePosition(framePosition) {
					var aW = jQuery(window).width();
					var aH = jQuery(window).height();
					var sW;
					var sH;
					var fStyle;
					if (framePosition) {
						fStyle = JSON.parse(framePosition);
						sW = parseFloat(fStyle.left) + (parseFloat(scope.config.width) || 0);
						sH = parseFloat(fStyle.top) + (parseFloat(scope.config.height) || 0);
						fStyle.width = scope.framewidth.width;
						if (sW < aW && sH < aH) {
							scope.frameStyle = fStyle;
							return;
						}
					}
					scope.frameStyle.top = FRAME_POSITION;
					scope.frameStyle.left = FRAME_POSITION;
				}
				function setSize(width, height) {
					width ? setWidth(width) : '';
					height ? setHeight(height) : '';
				}
				function setWidth(width) {
					width = Math.min(width, jQuery($window).width() * MAX_SIZE);
					scope.frameStyle.width = (width + 2) + "px";
					scope.framewidth.width = (width + 2);
				}
				function setHeight(height) {
					height = Math.min(height, jQuery($window).height() * MAX_SIZE);
					scope.iframeheight.height = height + "px";
				}
				$window.CustomEvent.observe(EVENTS.SHOW, function () {
					if (scope.config.defaultConfigurationExists) {
						if (!scope.config.showMainFrame) {
							scope.config.showMainFrame = true;
							scope.$apply();
						}
						$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.OPENFRAME_SHOWN, scope.titleIcon, true, scope.config.partnerDomain);
					}
				});
				$window.CustomEvent.observe(EVENTS.HIDE, function () {
					scope.config.showMainFrame = false;
					scope.$apply();
					$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.OPENFRAME_HIDDEN, scope.titleIcon, true, scope.config.partnerDomain);
				});
				$window.CustomEvent.observe(EVENTS.SET_SIZE, function (data) {
					if (data.width && data.height)
						setSize(data.width, data.height);
					scope.$apply();
				});
				scope.$watch(function () {
					return scope.config.width;
				}, function () {
					setSize(parseInt(scope.config.width), parseInt(scope.config.height));
				});
				scope.$watch(function () {
					return scope.config.height;
				}, function () {
					setSize(parseInt(scope.config.width), parseInt(scope.config.height));
				});
				openFrameAjax.openFrameGetUserPreference(USER_PREFERENCE_FRAME_POSITION).then(function (result) {
					setFramePosition(result[USER_PREFERENCE_FRAME_POSITION]);
					scope.showMinimize = true;
				}, function (result) {
					console.log("Failed to get user preference frame position", result);
				});
				$window.CustomEvent.observe(EVENTS.SET_HEIGHT, function (data) {
					if (data.height)
						setHeight(data.height);
					scope.$apply();
				});
				$window.CustomEvent.observe(EVENTS.SET_WIDTH, function (data) {
					if (data.width)
						setWidth(data.width);
					scope.$apply();
				});
			}
		};
	});
;
/*! RESOURCE: /scripts/com.sn_openframe/ui/directive.ofMainFrameHeader.js */
angular.module('sn.openFrame')
	.directive('ofMainFrameHeader', function ($window) {
		return {
templateUrl: 'scripts/com.sn_openframe/ui/template/ofMainFrameHeader.html',
			restrict: 'E',
			replace: true,
			scope: {
				config: '=data',
				framewidth: '=',
				iframeheight: '='
			},
			
			link: function (scope, elem, attr) {
				var EVENTS = {
					OPENFRAME_HIDDEN: 'openframe_hidden',
					SET_HEADER_TITLE: 'openframe_set_header_title',
					SET_HEADER_ICONS: 'openframe_set_header_icons',
					HEADER_ICON_CLICKED: 'openframe_header_icon_clicked',
					ICON_CLICKED: 'openframe_icon_clicked',
					TITLE_ICON_CLICKED: 'openframe_title_icon_clicked',
					SET_HEADER_TITLE_ICON: 'openframe_set_header_title_icon',
					SET_SIZE: 'openframe_set_size',
					SET_FRAME_MODE: 'openframe_set_frame_mode',
					EXPAND: 'openframe_expand',
					COLLAPSE: 'openframe_collapse',
				};
				var FRAME_MODE = {
					EXPAND: "expand",
					COLLAPSE: "collapse"
				};
				var titleElement = jQuery("#headerMainFrame .title1");
				var subTitleElement = jQuery("#headerMainFrame .title2");
				function getFrameWidth(element, width) {
					var availabeWidth = element.width();
					if (availabeWidth <= 0)
availabeWidth = parseInt(width) * 0.5 - 10;
					return availabeWidth;
				}
				function createTextElement(styleObj) {
var span = jQuery('<span>.</span>');
					span.css('visibility', 'hidden');
					span.css('position', 'absolute');
					span.css('display', 'inline');
					for (index in styleObj) {
						if (!styleObj.hasOwnProperty(index))
							continue;
						span.css(index, styleObj[index]);
					}
					jQuery('body').append(span);
					return span;
				}
				function truncateStrings(inString, element, availabeWidth) {
					var styleObj = { 'font-family': element.css('font-family'), 'font-size': element.css('font-size') };
					var span = createTextElement(styleObj);
					var dotWidth;
					var dataWidth;
					var newDataLen;
					var truncatedString;
					var index;
					dotWidth = 3 * span.width();
					span.text(inString);
					dataWidth = span.width();
					if (dataWidth > availabeWidth) {
						dataWidth = dataWidth + dotWidth;
newDataLen = parseInt((inString.length * availabeWidth) / dataWidth) - 3;
						if (newDataLen > 0)
							truncatedString = (inString.substring(0, newDataLen) + '...');
						else truncatedString = "";
					}
					else
						truncatedString = inString;
					span.remove();
					return truncatedString;
				}
				function truncateTitle(str, width) {
					if (str)
						return truncateStrings(str, titleElement, width);
					return str;
				}
				function truncateSubTitle(str, width) {
					if (str)
						return truncateStrings(str, subTitleElement, width);
					return str;
				}
				scope.titleIcon = {};
				$window.CustomEvent.observe(EVENTS.SET_HEADER_TITLE, function (data) {
					if (data.title != undefined) {
						scope.originalTitle = data.title;
						scope.title1 = truncateTitle(data.title, getFrameWidth(titleElement, scope.framewidth.width));
					} else if (data.subtitle != undefined) {
						scope.originalSubtitle = data.subtitle;
						scope.title2 = truncateSubTitle(data.subtitle, getFrameWidth(subTitleElement, scope.framewidth.width));
					}
					scope.$apply();
				});
				scope.$watch(function () {
					return scope.config.title1;
				}, function () {
					scope.originalTitle = scope.config.title1;
					scope.title1 = truncateTitle(scope.config.title1, getFrameWidth(titleElement, scope.framewidth.width)) || '';
				});
				scope.$watch(function () {
					return scope.config.title2;
				}, function () {
					scope.originalSubtitle = scope.config.title2;
					scope.title2 = truncateSubTitle(scope.config.title2, getFrameWidth(subTitleElement, scope.framewidth.width)) || '';
				});
				scope.$watch(function () {
					return scope.config.titleIcon;
				}, function () {
					scope.titleIcon.imageURL = scope.config.titleIcon;
				});
				$window.CustomEvent.observe(EVENTS.SET_HEADER_TITLE_ICON, function (icon) {
					scope.titleIcon = icon;
					scope.$apply();
				});
				scope.clickIcon = function (icon) {
					$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.HEADER_ICON_CLICKED, icon, true, scope.config.partnerDomain);
					$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.ICON_CLICKED, icon, true, scope.config.partnerDomain);
				};
				scope.titleIconClicked = function () {
					$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.HEADER_ICON_CLICKED, scope.titleIcon, true, scope.config.partnerDomain);
					$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.TITLE_ICON_CLICKED, scope.titleIcon, true, scope.config.partnerDomain);
				};
				scope.getBackgroundStyle = function (img) {
					var imagepath;
					if (img == "titleIcon")
						imagepath = scope.titleIcon.imageURL;
					else
						imagepath = img;
					if (scope.titleIcon.imageTitle === undefined)
						scope.titleIcon.imageTitle = "Phone"
					return {
						'background-image': 'url(' + imagepath + ')'
					}
				};
				scope.hideFrame = function () {
					scope.config.showMainFrame = false;
					$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.OPENFRAME_HIDDEN, "", true, scope.config.partnerDomain);
				};
				$window.CustomEvent.observe(EVENTS.SET_SIZE, function (data) {
					if (data.width) {
						scope.title1 = truncateTitle(scope.originalTitle, getFrameWidth(titleElement, data.width + 2));
						scope.title2 = truncateSubTitle(scope.originalSubtitle, getFrameWidth(subTitleElement, data.width + 2));
						scope.$apply();
					}
				});
				$window.CustomEvent.observe(EVENTS.SET_FRAME_MODE, function (mode) {
					if (mode && mode === "expand") {
						$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.EXPAND, "", true, scope.config.partnerDomain);
						scope.showMinimize = false;
					} else if (mode && mode === "collapse") {
						$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.COLLAPSE, "", true, scope.config.partnerDomain);
						scope.showMinimize = true;
					}
				});
				scope.collpseInfo = "Minimize";
				scope.changeFrameMode = function () {
					var frameMode = !scope.showMinimize ? "collapse" : "expand";
					if (frameMode === "collapse") {
						$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.COLLAPSE, "", true, scope.config.partnerDomain);
						scope.showMinimize = true;
						scope.collpseInfo = "Maximize";
					} else if (frameMode === "expand") {
						$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.EXPAND, "", true, scope.config.partnerDomain);
						scope.showMinimize = false;
						scope.collpseInfo = "Minimize";
					}
				};
				scope.$watch(function () {
					return scope.showMinimize;
				});
			}
		};
	});
;
/*! RESOURCE: /scripts/com.sn_openframe/ui/directive.ofMainFrameFooter.js */
angular.module('sn.openFrame')
	.directive('ofMainFrameFooter', function ($window) {
		return {
templateUrl: 'scripts/com.sn_openframe/ui/template/ofMainFrameFooter.html',
			restrict: 'E',
			replace: true,
			scope: {
				config: '=data',
				framewidth: '=',
				iframeheight: '='
			},
			link: function (scope, elem, attr) {
				var EVENTS = {
					OPENFRAME_HIDDEN: 'openframe_hidden',
					SET_HEADER_TITLE: 'openframe_set_header_title',
					SET_HEADER_ICONS: 'openframe_set_header_icons',
					HEADER_ICON_CLICKED: 'openframe_header_icon_clicked',
					ICON_CLICKED: 'openframe_icon_clicked',
					SET_HEADER_TITLE_ICON: 'openframe_set_header_title_icon',
					SET_SIZE: 'openframe_set_size'
				};
				scope.frameStyle = {};
				function getFrameWidth(element, width) {
					var availabeWidth = element.width();
					if (availabeWidth <= 0) {
						availabeWidth = parseInt(width) * 0.5 - 10;
					}
					return availabeWidth;
				}
				$window.CustomEvent.observe(EVENTS.SET_HEADER_ICONS, function (newIcons) {
					scope.icons = newIcons;
scope.iconWidth = parseInt(100 / newIcons.length);
scope.frameStyle.height = Math.ceil(newIcons.length / 3) * 47;
					scope.$apply();
				});
				scope.clickIcon = function (icon) {
					$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.HEADER_ICON_CLICKED, icon, true, scope.config.partnerDomain);
					$window.CustomEvent.fireToWindow(scope.config.partnerFrame, EVENTS.ICON_CLICKED, icon, true, scope.config.partnerDomain);
				}
				scope.getBackgroundStyle = function (img, iconWidth) {
					var imagepath = img;
					return {
						'background-image': 'url(' + imagepath + ')',
						'width': iconWidth + '%'
					}
				};
				$window.CustomEvent.observe(EVENTS.SET_SIZE, function (data) {
					if (data.width) {
						scope.$apply();
					}
				});
			}
		};
	});
;
/*! RESOURCE: /scripts/com.sn_openframe/ui/directive.ofMainFrameBody.js */
angular.module('sn.openFrame')
	.directive('ofMainFrameBody', function ($window, $sce) {
		return {
templateUrl: 'scripts/com.sn_openframe/ui/template/ofMainFrameBody.html',
			restrict: 'E',
			replace: true,
			scope: {
				config: '=data',
				iframeheight: '='
			},
			link: function (scope) {
				scope.$watch("config.url", function (url) {
					if (!url)
						return;
					scope.iframeUrl = $sce.trustAsResourceUrl(url);
				});
				
				scope.$watch("config.allow", function (allow) {
					if (!allow)
						return;
					scope.iframeAllow = allow;
				});
			}
		};
	});
;
/*! RESOURCE: /scripts/com.sn_openframe/ui/directive.ofMakeDraggable.js */
angular.module('sn.openFrame')
	.directive('ofMakeDraggable', function ($window, $timeout, openFrameAjax) {
		return {
			restrict: 'A',
			link: function (scope, elem, attr) {
				var USER_PREFERENCE_FRAME_POSITION = "openframe_user_frame_position";
				var headerElement;
				var parentContainer;
				function initializeDrag($) {
					$(function () {
						var startPosX;
						var startPosY;
						var divTop;
						var divLeft;
						var dragging = false;
						headerElement.on('mousedown', function (e) {
							var elem = parentContainer;
							startPosX = e.pageX;
							startPosY = e.pageY;
							divTop = elem.offset().top;
							divLeft = elem.offset().left;
							dragging = true;
							scope.$emit('dragEvent', true);
							e.preventDefault();
							e.stopPropagation();
						});
						
						$(document).on('mousemove', function (e) {
							if (!dragging) return;
							e.preventDefault();
							var elem = parentContainer;
							var posX = e.pageX;
							var posY = e.pageY;
							var eWi = elem.width();
							var eHe = elem.height();
							var cWi = $(window).width();;
							var cHe = $(window).height();;
							var diffX = posX - startPosX;
							var diffY = posY - startPosY;
							var aX = divLeft + diffX;
							var aY = divTop + diffY;
							if (aX + eWi > cWi) aX = cWi - eWi;
							if (aY + eHe > cHe) aY = cHe - eHe;
							if (aX < 0) aX = 0;
							if (aY < 0) aY = 0;
							headerElement.addClass('draggable');
							elem.offset({
								top: aY,
								left: aX
							});
							e.preventDefault();
							e.stopPropagation();
						});
						$(document).on('mouseup', function (e) {
							if (!dragging) return;
							e.preventDefault();
							$('.draggable').removeClass('draggable');
							dragging = false;
							scope.$emit('dragEvent', false);
							setUserPreferenceFramePosition();
						});
					});
				}
				function attachMouseMovetoIframes() {
					jQuery('iframe').each(
						function (index, value) {
							try {
								jQuery(value).load(function () {
									var frameWindow = this.contentWindow;
									jQuery(frameWindow.document).on('mousemove', function (e) {
										var frameElement = frameWindow.frameElement;
										e.pageX = e.pageX + jQuery(frameElement).offset().left;
										e.pageY = e.pageY + jQuery(frameElement).offset().top;
										top.jQuery(top.document).trigger(e);
									});
								});
							} catch (e) {
							}
						}
					);
				}
				function setUserPreferenceFramePosition() {
					var elem = parentContainer;
					var styleObj = {};
					if (elem[0].style.top)
						styleObj.top = elem[0].style.top;
					if (elem[0].style.left)
						styleObj.left = elem[0].style.left;
					if (styleObj.top || styleObj.left) {
						openFrameAjax.openFrameSetUserPreference(USER_PREFERENCE_FRAME_POSITION, JSON.stringify(styleObj)).then(function (result) {
						}, function (result) {
							console.log("Failed to set user preference frame position", result);
						});
					}
				}
				attachMouseMovetoIframes();
				headerElement = jQuery(attr.draggableElem);
				parentContainer = jQuery(attr.draggableContainer);
				initializeDrag(jQuery);
			}
		};
	});
;
;
/*! RESOURCE: /scripts/js_includes_openframe.js */
