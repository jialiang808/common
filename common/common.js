//'s1as1'.replaceAll('s1','s2'),可以将s1全部替换为s2
String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
};
// 两种调用方式
// var result1="我是{0}，今年{1}了".format("Jack",22);
// var result2="我是{name}，今年{age}了".format({name:"Jack",age:22});
// 这两句得到的结果都是"我是Jack，今年22了"
String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof(args) == "object") {
            for (var key in args) {
                if (args[key] !== undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] !== undefined) {
                    var reg1 = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg1, arguments[i]);
                }
            }
        }
    }
    return result;
};
var myCommon = {
    singleNumber: 1,
    requestingUrls: [],
    //获取不重复的唯一值
    getSingleNumber: function() {
        return this.singleNumber++;
    },
    //获取url中问号后面的参数值
    getQueryString: function(name) {
        return myCommon.getUrlParam(name);
    },
    //获取url中问号后面的参数值
    getUrlParam: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = location.search.substr(1).match(reg);
        return r !== null ? unescape(r[2]) : null;
    },
    //将对象转成url的参数，如{a:1,b:2}转成'a=1&b=2'
    toUrlParams: function(params) {
        var paramStr = '';
        for (var name in params) {
            if (paramStr) {
                paramStr += '&';
            }
            paramStr += name + '=' + params[name];
        }
        return paramStr;
    },
    //删除指定参数,多个参数可以传数组
    delUrlParam: function(names) {
        if (typeof(names) == 'string') {
            names = [names];
        }
        var url = location.href;
        if (location.search) {
            for (var i = 0; i < names.length; i++) {
                var item = names[i];
                var param = item + '=' + myCommon.getUrlParam(item)
                url = url.replace('&' + param, '').replace(param + '&', '').replace('?' + param, '');
            }
        }
        return url;
    },
    //html编码转回字符
    htmlDecode: function(str, noHtmlTag) {
        if (!str) {
            return '';
        }
        if (noHtmlTag) { //str中没有html标签
            var div = document.createElement('div');
            div.innerHTML = str;
            return div.innerText || div.textContent;
        }
        return str.replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&nbsp;/g, " ")
            .replace(/&#39;/g, "\'")
            .replace(/&quot;/g, "\"");
    },
    //获取ie版本，0表示非ie
    getIEVersion: function() {
        var ua = window.navigator.userAgent;
        if (ua.indexOf("Edge") > -1) {
            return 100;
        }
        var idx = ua.indexOf("MSIE");
        if (idx > 0) {
            return parseInt(ua.substring(idx + 5, ua.indexOf(".", idx)));
        } else if (!!ua.match(/Trident\/7\./)) {
            return 11;
        } else {
            return 0; //It is not IE
        }
    },
    //判断是否是安卓手机
    isAndroid: function() {
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf('android') > -1;
    },
    //判断是否是苹果手机
    isIOS: function() {
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipod') > -1;
    },
    //判断是否是手机设备
    isMobile: function() {
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf('android') > -1 || userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipod') > -1 || userAgent.indexOf('windows phone') > -1 || userAgent.indexOf('symbianos') > -1;
    },
    //判断是否是微信浏览器
    isWechat: function() {
        var userAgent = window.navigator.userAgent.toLowerCase();
        if (userAgent.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        } else {
            return false;
        }
    },
    //判断是否支持flash
    isSupportFlash: function() {
        try {
            if (myCommon.getIEVersion()) { //ie
                new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            } else if (navigator.plugins['Shockwave Flash'] == undefined) { //not ie
                return false;
            }
        } catch (e) {
            // myCommon.showMessage('您的浏览器尚未安装Flash插件，网页的部分功能可能无法使用，请安装后重新启动浏览器');
            return false;
        }
        return true;
    },
    getSessionStorage: function(name) {
        if (window.isSupportStorage) {
            return sessionStorage[name] || '';
        } else {
            return myCommon.getCookie(name);
        }
    },
    setSessionStorage: function(name, value) {
        if (window.isSupportStorage) {
            sessionStorage[name] = value;
        } else {
            myCommon.setCookie(name, value);
        }
    },
    getLocalStorage: function(name) {
        if (window.isSupportStorage) {
            var storeData = localStorage[name];
            if (!storeData) {
                return '';
            }
            var value = storeData.split('&&&')[0];
            var expires = storeData.split('&&&')[1];
            if (expires) {
                var now = new Date().getTime();
                if (expires < now) {
                    localStorage.removeItem(name);
                    return '';
                }
            }
            return value;
        } else {
            return myCommon.getCookie(name);
        }
    },
    setLocalStorage: function(name, value, expires) { //expires单位是毫秒
        if (window.isSupportStorage) {
            if (expires) {
                var now = new Date();
                now = now.getTime();
                var totalExpires = now;
                totalExpires = totalExpires + expires; // 24 * 3600 * 1000;
                localStorage[name] = value + '&&&' + totalExpires;
            } else {
                localStorage[name] = value;
            }
        } else {
            myCommon.setCookie(name, value, expires);
        }
    },
    getCookie: function(name) {
        var start = document.cookie.indexOf(name + "=");
        var len = start + name.length + 1;
        if ((!start) && (name != document.cookie.substring(0, name.length))) {
            return '';
        }
        if (start == -1) return '';
        var end = document.cookie.indexOf(';', len);
        if (end == -1) end = document.cookie.length;
        return unescape(document.cookie.substring(len, end));
    },
    setCookie: function(name, value, expires, path, domain, secure) {
        var today = new Date();
        today.setTime(today.getTime());
        var expiresDate = new Date(today.getTime() + (expires));
        document.cookie = encodeURIComponent(name) + '=' + escape(value) + ((expires) ? ';expires=' + expiresDate.toGMTString() : '') + ((path) ? ';path=' + path : '') + ((domain) ? ';domain=' + domain : '') + ((secure) ? ';secure' : '');
    },
    //格式化日期
    formatDate: function(date, format) {
        if (!date) {
            return '—';
        }
        format = format || 'yyyy-MM-dd';
        if (typeof date == 'number') {
            date = new Date(date);
        }
        var map = {
            "M": date.getMonth() + 1, //月份
            "d": date.getDate(), //日
            "h": date.getHours(), //小时
            "m": date.getMinutes(), //分
            "s": date.getSeconds(), //秒
            "q": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
            var v = map[t];
            if (v !== undefined) {
                if (all.length > 1) {
                    v = '0' + v;
                    v = v.substr(v.length - 2);
                }
                return v;
            } else if (t === 'y') {
                return (date.getFullYear() + '').substr(4 - all.length);
            }
            return all;
        });
        return format;
    },
    //通过字段key,查找数据的某条数据
    getItem: function(array, value, key) {
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            if (item[key] == value) {
                return item;
            }
        }
        return null;
    },
    findIndex: function(array, callback) {
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            if (callback(item)) {
                return i;
            };
        }
        return -1;
    },
    removeItem: function(array, value, key) {
        if (key) {
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                if (item[key] == value) {
                    array.splice(i, 1);
                    break;
                }
            }
        } else {
            var start = $.inArray(value, array);
            if (start > -1) {
                array.splice(start, 1);
            }
        }
    },
    //显示加载状态，container不传时，全局遮罩
    showLoading: function(container, loadingClass) {
        var maskBody = container ? $(container) : $(window.document.body);
        if (maskBody.length == 0 || !maskBody.is(':visible')) {
            return;
        }
        var singleNumber = maskBody.data('singleNumber');
        if (!singleNumber) {
            singleNumber = myCommon.getSingleNumber();
            maskBody.data('singleNumber', singleNumber);
        }
        var loadingId = 'my-loading-' + singleNumber;
        var loading = $('#' + loadingId);
        if (loading.length == 0) {
            var htmlTemplate = '<div id="{0}" class="my-mask"><div class="my-loading"></div></div>';
            $('body').append(htmlTemplate.format(loadingId));
            loading = $('#' + loadingId);
        }
        loadingClass = loadingClass ? 'my-mask ' + loadingClass : 'my-mask';
        loading.removeAttr('style').attr('class', loadingClass).show();
        if (container && maskBody.get(0) !== document.body) {
            var maskWidth = maskBody.innerWidth();
            var maskHeight = maskBody.innerHeight();
            if (isFixedElement(maskBody)) {
                loading.css({
                    'z-index': 3000 + singleNumber * 2,
                    'top': getPx('top'),
                    'left': getPx('left'),
                    'right': getPx('right'),
                    'bottom': getPx('bottom'),
                    'width': maskWidth,
                    'height': maskHeight,
                    'margin-top': maskBody.css('margin-top'),
                    'margin-left': maskBody.css('margin-left'),
                    'margin-right': maskBody.css('margin-right'),
                    'margin-bottom': maskBody.css('margin-bottom')
                });
            } else {
                loading.css({
                    'position': 'absolute',
                    'z-index': 3000 + singleNumber * 2,
                    'top': maskBody.offset().top,
                    'left': maskBody.offset().left,
                    'width': maskWidth,
                    'height': maskHeight
                });
            }
        }

        function isFixedElement(ele) {
            if (ele.length == 0 || ele.get(0) == document.body) {
                return false;
            }
            return ele.css('position') == 'fixed' ? true : isFixedElement(ele.parent());
        }

        function getPx(dire) {
            var px = maskBody.css(dire).split('px')[0];
            px = px == 'auto' ? 'auto' : parseInt(px);
            return px;
        }
    },
    //隐藏加载状态
    hideLoading: function(container) {
        var maskBody = null;
        if (container) {
            maskBody = $(container);
        } else {
            maskBody = $(window.document.body);
        }
        if (maskBody.length == 0) {
            return;
        }
        var singleNumber = maskBody.data('singleNumber');
        $('#my-loading-' + singleNumber).hide();
    },
    //显示确认弹框
    showConfirm: function(args) {
        args.type = 'confirm';
        args.isFixed = true;
        args.width = args.width || 364;
        if (args.title == undefined) {
            args.title = '信息提示';
        }
        args.buttonText = args.okButtonText || args.buttonText || '确定';
        args.content = args.content ? '<div class="message-content">{0}</div>'.format(args.content) : '';
        if (args.caption) {
            args.content = '<div class="message-title">{0}</div>'.format(args.caption) + args.content;
        }
        myCommon.showPopup(args);
    },
    //显示消息弹框
    showMessage: function(args) {
        if (!args) {
            return;
        }
        if (typeof args !== 'object') {
            args = {
                content: args
            };
        }
        args.type = 'info';
        args.isFixed = true;
        args.width = args.width || 364;
        if (args.title == undefined) {
            args.title = '信息提示';
        }
        args.buttonText = args.okButtonText || args.buttonText || '我知道了';
        args.content = args.content ? '<div class="message-content">{0}</div>'.format(args.content) : '';
        if (args.caption) {
            args.content = '<div class="message-title">{0}</div>'.format(args.caption) + args.content;
        }
        myCommon.showPopup(args);
    },
    //显示弹框
    showPopup: function(args) {
        if ($('#popup-mask').length == 0) {
            var builder = '<div id="popup-mask" class="my-mask"></div>';
            builder += '<div id="popup-area" class="popup-area">';
            builder += '<div id="popup-header" class="popup-header">';
            builder += '<div id="popup-title" class="popup-title"></div>';
            builder += '<a id="popup-close-button" class="close-button">X</a></div>';
            builder += '<div id="popup-content" class="popup-content"></div>';
            builder += '<div id="popup-buttonArea" class="popup-buttons"><div class="popup-flex">';
            builder += '<a id="popup-ok-button" class="btn btn-info">确定</a>&nbsp;&nbsp;';
            builder += '<a id="popup-cancel-button" class="btn btn-default">取消</a></div></div></div>';
            $(document.body).append(builder);
        }
        $('#popup-close-button').unbind().click(function() {
            myCommon.hidePopup();
            if (args.onClose) {
                args.onClose.call(window);
            }
        });
        if (args.type == 'info' || args.type == 'confirm') {
            var okButton = $('#popup-ok-button');
            var cancelButton = $('#popup-cancel-button');
            cancelButton.hide();
            $('#popup-buttonArea').show();
            args.buttonText = args.okButtonText || args.buttonText || '确定';
            if (args.okButtonClass) {
                okButton.addClass(args.okButtonClass);
            }
            okButton.text(args.buttonText);
            okButton.unbind().click(function() {
                myCommon.hidePopup();
                if (args.onOKClick) {
                    args.onOKClick.call(window);
                }
                if (args.onClose) {
                    args.onClose.call(window);
                }
            });
            if (args.type == 'confirm') {
                cancelButton.show();
                if (args.cancelButtonClass) {
                    cancelButton.addClass(args.cancelButtonClass);
                }
                args.cancelButtonText = args.cancelButtonText || '取消';
                cancelButton.text(args.cancelButtonText);
                cancelButton.unbind().click(function() {
                    myCommon.hidePopup();
                    if (args.onCancelClick) {
                        args.onCancelClick.call(window);
                    }
                    if (args.onClose) {
                        args.onClose.call(window);
                    }
                });
            }
        } else {
            $('#popup-buttonArea').hide();
        }
        var popup = $('#popup-area');
        popup.removeAttr('style');
        popup.attr('class', 'popup-area');
        if (args.className) {
            popup.addClass(args.className);
        }
        if (args.width) {
            popup.width(args.width);
        }
        var popupHeader = $('#popup-header');
        if (args.hasHeader === false) {
            popupHeader.hide();
        } else {
            popupHeader.show();
            $('#popup-title').html(args.title || '');
        }
        if (args.content) {
            $('#popup-content').html(args.content);
        }
        popup.show();
        $('#popup-mask').show();
        var screenHeight = $(window).height(); //当前浏览器窗口的 宽高
        var scrolltop = $(document.body).scrollTop(); //获取当前窗口距离页面顶部高度
        var popupTop = (screenHeight - popup.height()) / 2 + scrolltop;
        var popupLeft = ($(window).width() - popup.width()) / 2;
        var positionval = "absolute";
        if (args.isFixed) {
            popupTop = (screenHeight - popup.height()) / 2;
            positionval = "fixed";
        }
        popup.css({
            position: positionval,
            top: popupTop + 'px',
            left: popupLeft + 'px'
        });
        if (args.closeTimeout) {
            setTimeout(function() {
                myCommon.hidePopup();
            }, args.closeTimeout);
        }
    },
    //隐藏弹框
    hidePopup: function() {
        $('#popup-mask').hide();
        $('#popup-area').hide();
    },
    //ajax封装：传http使用angular的ajax，否则使用jquery的ajax
    ajax: function(http, args) {
        var isAngular = !!args;
        args = args || http;
        addAjaxLoading();

        if (args.data !== null && typeof args.data !== 'undefined' && typeof args.data === 'object') {
            args.data.v = Math.random();
        } else {
            args.data = { v: Math.random() };
        }

        if (myCommon.getIEVersion() === 100) {
            setTimeout(function() {
                return isAngular ? ngAjax() : jqAjax();
            }, 10);
        } else {
            return isAngular ? ngAjax() : jqAjax();
        }

        function jqAjax() {
            $.ajaxSetup({
                headers: {
                    'Authorization': 'Bearer' + myCommon.getLocalStorage(window.tokenKey),
                    'X-Superxz-Key': myCommon.getSuperxzKey()
                }
            });
            var options = {
                type: args.type || 'get',
                dataType: args.dataType || 'json',
                async: args.async == false ? false : true,
                data: args.data,
                url: args.url,
                success: successCallback,
                error: errorCallback
            };
            if (args.args) {
                options.url += "/" + JSON.stringify(args.args) + "/";
            }
            return $.ajax(options);
        }

        function ngAjax() {
            var ngConfig = {
                headers: {
                    'X-Superxz-Key': myCommon.getSuperxzKey(),
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                transformRequest: transFn
            };
            if (myCommon.getLocalStorage(window.tokenKey)) {
                ngConfig.headers.Authorization = 'Bearer' + myCommon.getLocalStorage(window.tokenKey);
            }
            args.type = args.type ? args.type.toLowerCase() : 'get';
            if (args.type == 'get' || args.type == 'delete') {
                if (args.data) {
                    ngConfig.params = args.data;
                }
                http[args.type](args.url, ngConfig).success(successCallback).error(errorCallback);
            } else {
                http[args.type](args.url, args.data, ngConfig).success(successCallback).error(errorCallback);
            }
        }

        function transFn(data) {
            // If this is not an object, defer to native stringification.
            if (!angular.isObject(data)) {
                return ((data == null) ? "" : data.toString());
            }
            var buffer = [];
            // Serialize each key in the object.
            for (var name in data) {
                if (!data.hasOwnProperty(name)) {
                    continue;
                }
                var value = data[name];
                buffer.push(encodeURIComponent(name) + "=" + encodeURIComponent((value == null) ? "" : value));
            }
            // Serialize the buffer and clean it up for transportation.
            var source = buffer.join("&").replace(/%20/g, "+");
            return (source);
        }

        function successCallback(result) {
            if (!args.ignoreLogin && result.code == 401) {
                myCommon.setSessionStorage('backUrl', location.href);
                location.href = window.loginUrl;
                return;
            };
            //处理成功的响应
            removeAjaxLoading();
            if (result.code == 200 || $.inArray(result.code, args.ignoreCodes) > -1) {
                if (args.success) {
                    args.success(result.data, result);
                }
            } else if (result.message) {
                myCommon.showMessage(result.message);
            } else if (!args.complete) {
                var log = { args: args, response: result };
                _czc.push(["_trackEvent", 'js日志', 'code error', JSON.stringify(log)]);
            }
            if (args.complete) {
                args.complete(result);
            }
        }

        function errorCallback(result, textStatus) {
            if (!args.ignoreLogin && (result.status == 401 || textStatus == 401)) {
                myCommon.setSessionStorage('backUrl', location.href);
                location.href = window.loginUrl;
                return;
            }
            //处理失败后的响应
            removeAjaxLoading();
            if (args.error) {
                args.error(result);
            } else if (result.message) {
                myCommon.showMessage(result.message);
            } else if (result.responseJSON && result.responseJSON.message) {
                myCommon.showMessage(result.responseJSON.message);
            } else if (!args.complete && result && result.status != 0) {
                var log = { args: args, response: result || '' };
                _czc.push(["_trackEvent", 'js日志', 'ajax error', JSON.stringify(log)]);
            }
            if (args.complete) {
                args.complete(result);
            }
        }

        function addAjaxLoading() {
            if (args.loading === true) {
                myCommon.removeItem(myCommon.requestingUrls, args.url);
                myCommon.requestingUrls.push(args.url);
                myCommon.showLoading(null, args.loadingClass);
            } else if (args.loading) {
                myCommon.showLoading(args.loading, args.loadingClass);
            }
        }

        function removeAjaxLoading() {
            if (args.loading === true) {
                myCommon.removeItem(myCommon.requestingUrls, args.url);
                if (myCommon.requestingUrls.length == 0) {
                    myCommon.hideLoading();
                }
            } else if (args.loading) {
                myCommon.hideLoading(args.loading);
            }
        }
    },
    //vue:加载js,css,html文件
    render: function(args) {
        var depends = ['text!' + args.template, args.js];
        if (args.css) {
            depends.push('css!' + args.css);
        }
        var container = args.container || '#my-view';
        $(container).html('');
        require(depends, function(html, model) {
            $(container).html(html);
            new Vue(new model(args.params));
        });
    },
    //加载js,css,html文件
    load: function(srcs) {
        return {
            deps: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                srcs = angular.isArray(srcs) ? srcs : [srcs];
                var deferred = $q.defer();
                var promise = deferred.promise;
                angular.forEach(srcs, function(src) {
                    promise = promise.then(function() {
                        var files = myConfig.getFiles(src);
                        return $ocLazyLoad.load(files);
                    });
                });
                deferred.resolve();
                return promise;
            }]
        }
    },
    //初始化Angular
    initApp: function(deps) {
        if (window.myApp) {
            return;
        }
        window.myApp = angular.module('my-app', deps || []);
        myApp.run(['$rootScope', '$templateCache', function(rootScope, templateCache) { //添加公共变量
            rootScope.formatDate = myCommon.formatDate; //日期转化
            rootScope.apiServer = window.apiServer; //api接口
            rootScope.currentUser = window.currentUser; //用户信息
            rootScope.webConfig = window.webConfig; //网站配置
            rootScope.$on('$routeChangeStart', function(event, next, current) {
                if (next && next.templateUrl) { //解决单页情况下模板缓存问题
                    if (window.libVersion === '?v=1.0') {
                        templateCache.remove(next.templateUrl);
                    } else {
                        next.templateUrl = next.templateUrl + window.libVersion;
                    }
                }
            });
            rootScope.checkEqual = function(actual, expected) {
                if (!expected || expected == 'all' || expected == '-1') {
                    return true;
                }
                return actual == expected;
            };
        }]);
        myApp.config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
            function($controllerProvider, $compileProvider, $filterProvider, $provide) {
                myApp.controller = $controllerProvider.register;
                myApp.directive = $compileProvider.directive;
                myApp.filter = $filterProvider.register;
                myApp.factory = $provide.factory;
                myApp.service = $provide.service;
                myApp.value = $provide.value;
                myApp.constant = $provide.constant;
                //记录angular错误日志
                $provide.decorator("$exceptionHandler", function($delegate) {
                    return function(ex, cause) {
                        $delegate(ex, cause);
                        var log = {
                            href: location.href,
                            message: ex.message,
                            stack: ex.stack
                        };
                        _czc.push(["_trackEvent", 'js日志', 'AngularJS error', JSON.stringify(log)]);
                    };
                });
            }
        ]);
        //渲染完成后执行的事件
        myApp.directive('ngFinished', ['$timeout', function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    if (!scope[attr.ngFinished]) {
                        return;
                    }
                    if (scope.$last === true) {
                        setTimeout(scope[attr.ngFinished], 100); //Calling a scoped method
                    } else if (scope.$last === undefined) {
                        setTimeout(scope[attr.ngFinished], 100); //Calling a scoped method
                    }
                }
            };
        }]);
        //限制输入
        myApp.directive('ngInput', [function() {
            return {
                restrict: 'A',
                // require: '?ngModel',
                link: function(scope, element, attrs) {
                    element.on('input', function() {
                        var ele = $(this);
                        var type = attrs['ngInput'];
                        var val = ele.val();
                        if (type == 'int') {
                            val = val.replace(/\D/gm, '');
                            if (val !== '') {
                                val = Number(val);
                            }
                            ele.val(val);
                            ele.val(val).trigger('change');
                            scope.$apply();
                        }
                    });
                }
            }
        }]);
        //渲染html出错时使用，如ng-html
        myApp.filter('trustHtml', ['$sce', function($sce) {
            return function(input) {
                return $sce.trustAsHtml(input);
            }
        }]);
        //string转int
        myApp.filter('parseInt', function() {
            return function(text) {
                return parseInt(text);
            };
        });
        //保留几位小数点
        myApp.filter('toFixed', function() {
            return function(text, num) {
                text = text || 0;
                if (typeof text == "string") {
                    text = text * 1
                }
                return text.toFixed(num || 2);
            };
        });
    },
    //检查用户是否登录，没登录跳转到登录页
    checkLogin: function() {
        if (window.noLogin) {
            myCommon.setSessionStorage('backUrl', location.href);
            location.href = window.loginUrl;
        } else if (!window.currentUser) {
            myCommon.getCurrentUser(true);
        }
    },
    //退出登录
    logout: function() {
        myCommon.setCookie('web_refresh_token', ''); //M站自动登录使用
        myCommon.setLocalStorage('role', ''); //用户角色，超人商城使用
        myCommon.setLocalStorage(window.tokenKey, '');
        location.href = window.loginUrl;
    },
    //获取当前用户信息
    getCurrentUser: function(needLogin) {
        var token = myCommon.getUrlParam('token') || myCommon.getCookie('web_refresh_token');
        if (token) {
            myCommon.setCookie('web_refresh_token', ''); //M站自动登录使用
            myCommon.setLocalStorage(window.tokenKey, token);
        }
        if (!myCommon.getLocalStorage(window.tokenKey)) {
            window.noLogin = true;
            if (needLogin) {
                location.href = window.loginUrl;
            }
            return;
        }
        $.ajaxSetup({
            headers: {
                'Authorization': 'Bearer' + myCommon.getLocalStorage(window.tokenKey),
                'X-Superxz-Key': myCommon.getSuperxzKey()
            }
        });
        $.ajax({
            type: 'get',
            async: false,
            dataType: 'json',
            url: window.apiServer + window.loginApi,
            success: function(res) {
                window.noLogin = res.code == 401;
                if (res.code == 401) {
                    myCommon.setLocalStorage(window.tokenKey, '');
                    if (needLogin) {
                        myCommon.setSessionStorage('backUrl', location.href);
                        location.href = window.loginUrl;
                    }
                } else {
                    window.currentUser = res.data;
                }
            },
            error: function(result, textStatus) {
                if (result.status == 401 || textStatus == 401) {
                    myCommon.setLocalStorage(window.tokenKey, '');
                    window.noLogin = true;
                    if (needLogin) {
                        myCommon.setSessionStorage('backUrl', location.href);
                        location.href = window.loginUrl;
                    }
                }
            }
        });
    },
    getSuperxzKey: function() {
        if (!myCommon.getLocalStorage('Superxz-User-Key')) {
            myCommon.setLocalStorage('Superxz-User-Key', Date.now() + Math.random());
        }
        var superKey = {
            userKey: myCommon.getLocalStorage('Superxz-User-Key'),
            href: location.href
        };
        if (window.timeDifference) {
            superKey.timestamp = timeDifference + Date.now() + '';
            superKey.nonce = myCommon.md5(superKey.timestamp + 'superxz2017');
        }
        return JSON.stringify(superKey);
    },
    //初始化在线服务聊天窗口，groupId客服组ID
    initOnlineService: function(groupId) {
        if (!myCommon.hasInitOnlineService) {
            myCommon.hasInitOnlineService = true;
            (function(m, ei, q, i, a, j, s) {
                m[i] = m[i] || function() {
                    (m[i].a = m[i].a || []).push(arguments)
                };
                j = ei.createElement(q),
                    s = ei.getElementsByTagName(q)[0];
                j.async = true;
                j.charset = 'UTF-8';
                j.src = 'https://static.meiqia.com/dist/meiqia.js?_=t';
                s.parentNode.insertBefore(j, s);
            })(window, document, 'script', '_MEIQIA');
            _MEIQIA('entId', 71393);
            _MEIQIA('withoutBtn');
            _MEIQIA('fallback', 2); //转接到客服所属于的组
        }
        _MEIQIA('assign', { groupToken: groupId || '9add93471326bf61b7daad5856fd2396' });
    },
    //初始化微信分享,args={title:'标题',link:'链接',imgUrl:'图片',desc:'描述'}
    initWechatShare: function(args) {
        args = args || window.shareArgs || {};
        args.link = args.link || location.href;
        myCommon.ajax({
            type: 'post',
            url: args.apiConfigUrl || window.apiServer + '/api/service/wechat/getJsSdkConfig',
            data: {
                url: location.href.split('#')[0],
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage']
            },
            success: function(data) {
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: data.appId, // 必填，公众号的唯一标识
                    timestamp: data.timestamp, // 必填，生成签名的时间戳
                    nonceStr: data.nonceStr, // 必填，生成签名的随机串
                    signature: data.signature, // 必填，签名，见附录1
                    jsApiList: data.jsApiList // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
                wx.ready(function() {
                    wx.onMenuShareTimeline({
                        title: args.title,
                        link: args.link,
                        imgUrl: args.imgUrl
                    });
                    wx.onMenuShareAppMessage({
                        title: args.title,
                        desc: args.desc,
                        link: args.link, // 分享链接
                        imgUrl: args.imgUrl, // 分享图标
                    });
                });
            }
        });
    }
};

(function() { //md5加密
    var rotateLeft = function(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    var addUnsigned = function(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4) {
            if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }
    var F = function(x, y, z) {
        return (x & y) | ((~x) & z);
    }
    var G = function(x, y, z) {
        return (x & z) | (y & (~z));
    }
    var H = function(x, y, z) {
        return (x ^ y ^ z);
    }
    var I = function(x, y, z) {
        return (y ^ (x | (~z)));
    }
    var FF = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var GG = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var HH = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var II = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var convertToWordArray = function(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWordsTempOne = lMessageLength + 8;
        var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
        var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };
    var wordToHex = function(lValue) {
        var WordToHexValue = "",
            WordToHexValueTemp = "",
            lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValueTemp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
        }
        return WordToHexValue;
    };
    var uTF8Encode = function(string) {
        string = string.replace(/\x0d\x0a/g, "\x0a");
        var output = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                output += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                output += String.fromCharCode((c >> 6) | 192);
                output += String.fromCharCode((c & 63) | 128);
            } else {
                output += String.fromCharCode((c >> 12) | 224);
                output += String.fromCharCode(((c >> 6) & 63) | 128);
                output += String.fromCharCode((c & 63) | 128);
            }
        }
        return output;
    };
    myCommon.md5 = function(string) {
        var x = Array();
        var k, AA, BB, CC, DD, a, b, c, d;
        var S11 = 7,
            S12 = 12,
            S13 = 17,
            S14 = 22;
        var S21 = 5,
            S22 = 9,
            S23 = 14,
            S24 = 20;
        var S31 = 4,
            S32 = 11,
            S33 = 16,
            S34 = 23;
        var S41 = 6,
            S42 = 10,
            S43 = 15,
            S44 = 21;
        string = uTF8Encode(string);
        x = convertToWordArray(string);
        a = 0x67452301;
        b = 0xEFCDAB89;
        c = 0x98BADCFE;
        d = 0x10325476;
        for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = addUnsigned(a, AA);
            b = addUnsigned(b, BB);
            c = addUnsigned(c, CC);
            d = addUnsigned(d, DD);
        }
        var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
        return tempValue.toLowerCase();
    };
})();

(function($) { //初始化设置
    try {
        window.isSupportStorage = !!localStorage;
        localStorage.setItem('localStorage', 1);
        localStorage.removeItem('localStorage');
    } catch (e) { //safari无痕浏览模式
        window.isSupportStorage = false;
    }
    window.apiServer = window.apiServer || ''; //api服务器地址
    window.tokenKey = window.tokenKey || 'token'; //token的名字
    window.loginUrl = window.loginUrl || '/login'; //登录页地址
    window.loginApi = window.loginApi || '/api/check/login'; //检查登录的api地址
    window.libServer = window.libServer || 'https://js.superxz.com'; //js服务器地址
    window.libVersion = window.libVersion || '?v=1.0'; //js版本号，解决缓存
    if (!location.origin) { //兼容IE8
        location.origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port : '');
    }
    //Angular文件路径配置
    window.myConfig = {
        baseUrl: window.libServer + '/',
        urlArgs: window.libVersion || '?v=1.0',
        paths: {
            'md5': 'md5.js',
            'base64': 'jquery.base64.js',
            'pages': 'common/my-pages.js',
            'validator': 'common/my-validator.js',
            'datatable': 'common/my-data-table.js',
            'uploader': ['webuploader/webuploader.min.js', 'common/my-upload.js'],
            'datepicker': ['laydate/laydate.dev.js', 'laydate/laydate.css'],
            'tagator': ['tagator/fm.tagator.jquery.js', 'tagator/fm.tagator.jquery.css'],
            'tree': ['zTree/jquery.ztree.all.min.js', 'zTree/zTreeStyle.css'],
            'unslider': ['unslider/unslider.js', 'unslider/unslider.css'],
            'superslide': 'superslide/jquery.SuperSlide.js',
            'echarts': 'echarts.min.js',
            'chinamap': 'mapdata/china.js',
            'lazyload': 'lazyload.js',
            'addToCart': 'addToCart.js',
            'fresco': ['fresco/fresco.js', 'fresco/fresco.css']
        },
        getFiles: function(name) {
            var files = this.paths[name];
            if (!files) {
                return name + this.urlArgs;
            }
            if (!$.isArray(files)) {
                files = files.indexOf('http') == -1 ? (this.baseUrl + files) : files;
                return files.indexOf('common/') === 0 ? [files + this.urlArgs] : [files + '?v=1.0'];
            }
            var result = [];
            for (var i = 0; i < files.length; i++) {
                var filePath = files[i].indexOf('http') == -1 ? (this.baseUrl + files[i]) : files[i];
                result.push(filePath + this.urlArgs);
            }
            return result;
        }
    };
    //require配置
    window.require = {
        baseUrl: window.libServer + '/',
        urlArgs: window.libVersion && window.libVersion.substr(1), //'v=1.0'
        paths: {
            'md5': 'md5',
            'base64': 'jquery.base64',
            'text': 'text',
            'jquery': 'jquery.min',
            'validator': 'common/my-validator',
            'swiper': 'swiper/swiper.jquery.min',
            'swipercss': 'swiper/swiper.min',
            'select-city': 'common/my-select-city',
            'infinite': 'infinite',
            'picker': 'picker',
            'calendar': 'calendar',
            'addToCart': 'addToCart',
            'weuicss': 'css/jquery-weui'
        },
        map: { '*': { 'css': 'css.min' } },
        shim: { 'jquery': { exports: '$' }, 'swiper': ['css!swipercss'], 'picker': ['css!weuicss'], 'calendar': ['css!weuicss', 'picker'] }
    };
    if (!myCommon.getCookie('superxz_cookie_id')) {
        myCommon.setCookie('superxz_cookie_id', Date.now() + Math.random());
    }
    if ($) { //判断是否存在jquery
        $.fn.trimVal = function() { //去除text的前后空格
            var val = this.val();
            return val ? $.trim(val) : val;
        };
        $.ajaxSetup({
            headers: {
                'Authorization': 'Bearer' + myCommon.getLocalStorage(window.tokenKey),
                'X-Superxz-Key': myCommon.getSuperxzKey()
            }
        });
    }
    //记录js错误日志
    window._czc = window._czc || [];
    window.onerror = function(msg, url, line, col, error) {
        if (msg.indexOf('Script error') == 0 || msg.indexOf('WeixinJSBridge') > -1) {
            return;
        }
        // 不一定所有浏览器都支持col参数
        col = col || (window.event && window.event.errorCharacter) || 0;
        var log = {
            message: msg,
            url: url,
            line: line,
            col: col,
            href: location.href,
            stack: error && error.stack
        };
        _czc.push(["_trackEvent", 'js日志', 'js error', JSON.stringify(log)]);
        return true;
    };
})(jQuery);