(function(global, factory) {
    global.MVVM = factory();
}(this, function() {
    var uidCounter = 1;
    var common = {
        proxy: function(target, sourceKey, key) {
            Object.defineProperty(target, key, {
                enumerable: true,
                configurable: true,
                get: function() { return this[sourceKey][key]; },
                set: function(val) { this[sourceKey][key] = val; }
            });
        },
        isObject: function(obj) {
            return obj !== null && typeof obj === 'object'
        },
        isArray: function(obj) { //判断数组通用方法，兼容ie6
            return Object.prototype.toString.call(obj) == '[object Array]';
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
        hasProto: function() {
            return '__proto__' in {};
        }
    };
    Object.defineProperty(common, 'uid', {
        get: function() {
            return uidCounter++;
        }
    });
    //观察者
    var Observer = function(value) {
        this.value = value;
        this.dep = new Dep();
        this.vmCount = 0;
        Object.defineProperty(value, '__ob__', {
            value: this,
            enumerable: false,
            writable: true,
            configurable: true
        });
        if (Array.isArray(value)) {
            console.log('监控数组');
            this.observeArray(value);
        } else {
            console.log('监控普通对象');
            this.observeObject(value);
        }
    };
    Observer.prototype = {
        //数组观察者
        observeArray: function(arr) {
            //重写数组方法，用以实现监控push,unshift等方法
            if (common.hasProto()) { //如果实例有__proto__属性，直接覆盖
                arr.__proto__ = arrayMethods;
            } else {
                var arrayKeys = Object.getOwnPropertyNames(arrayMethods);
                for (var i = 0, l = arrayKeys.length; i < l; i++) {
                    var key = arrayKeys[i];
                    Object.defineProperty(arr, key, {
                        value: arrayMethods[key],
                        enumerable: false,
                        writable: true,
                        configurable: true
                    });
                }
            }
            arr.forEach(function(value, index, ar) {
                observe(value);
            });
        },
        //普通对象观察者
        observeObject: function(obj) {
            var keys = Object.keys(obj);
            for (var i = 0; i < keys.length; i++) {
                defineReactive(obj, keys[i], obj[keys[i]]);
            }
        }
    };
    //观察value, 实例化一个观察者
    function observe(value) {
        if (!common.isObject(value)) {
            return;
        }
        return value.__ob__ || new Observer(value);
    }
    //定义data属性,显示mvvm模式
    function defineReactive(obj, key, val) {
        var property = Object.getOwnPropertyDescriptor(obj, key);
        if (property && property.configurable === false) {
            return
        }
        var getter = property && property.get;
        var setter = property && property.set;
        var dep = new Dep();
        var child = observe(val);
        //数据发生变化，更新视图
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function() {
                var value = getter ? getter.call(obj) : val;
                console.log('获取数据：' + value);
                return value
            },
            set: function(newVal) {
                var value = getter ? getter.call(obj) : val;
                if (newVal === value) {
                    return
                }
                if (setter) {
                    setter.call(obj, newVal);
                } else {
                    val = newVal;
                }
                console.log('更新视图：' + newVal);
                // childOb = !shallow && observe(newVal);
                dep.notify();
            }
        });
    }
    //Subject主题对象、通知者
    var Dep = function() {
        this.id = common.uid;
        this.subs = []; //观察者
    };
    Dep.prototype = {
        add: function(sub) {
            this.subs.push(sub);
        },
        remove: function(sub) {
            common.removeItem(this.subs, sub.id, 'id');
        },
        notify: function() { //通知所有观察者对象更新
            var subs = this.subs.slice();
            for (var i = 0, l = subs.length; i < l; i++) {
                subs[i].update();
            }
        }
    };

    var Watcher = function(vm, key, handler, isRenderWatcher) {
        this.vm = vm;
        if (isRenderWatcher) {
            vm._watcher = this;
        }
        vm._watchers.push(this);
        this.handler = handler;
        this.id = common.uid;
        this.active = true;
        this.deps = [];
        this.value = this.getter.call(vm, vm);
    };

    Watcher.prototype = {
        addDep: function(dep) {
            if (!common.getItem(this.deps, dep.id, 'id')) {
                this.deps.push(dep);
                dep.add(this);
            }
        },
        cleanupDeps: function() {
            this.deps = [];
        },
        update: function() {
            console.log('watcher update');
            var vm = this.vm;
            var value = this.getter.call(vm, vm);
            // Deep watchers and watchers on Object/Arrays should fire even
            // when the value is the same, because the value may
            // have mutated.
            if (value !== this.value || common.isObject(value) || this.deep) {
                // set new value
                var oldValue = this.value;
                this.value = value;
                this.handler.call(this.vm, value, oldValue);
            }
        }
    };

    function initProps(vm, props) {

    }

    function initMethods(vm, methods) {

    }

    function initWatch(vm, watch) {
        vm._watchers = [];
        for (var key in watch) {
            var handler = watch[key];
            if (Array.isArray(handler)) {
                for (var i = 0; i < handler.length; i++) {
                    createWatcher(vm, key, handler[i]);
                }
            } else {
                createWatcher(vm, key, handler);
            }
        }
    }

    function createWatcher(vm, key, handler) {
        var watcher = new Watcher(vm, key, handler);
    }

    function initData(vm) {
        var data = vm._data = vm._options.data;
        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            // 添加代理，将data的所有属性同步到MVVM实例下
            common.proxy(vm, '_data', key);
        }
        // 监控数据
        observe(data);
    }
    // 重写数组的方法
    const rewriteMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
    var arrayMethods = Object.create(Array.prototype); //复制数组原型，避免影响原本的Array.prototype
    rewriteMethods.forEach(function(method) {
        // 原始方法
        var original = Array.prototype[method];
        Object.defineProperty(arrayMethods, method, {
            value: function() {
                //将arguments转成数组
                var args = Array.prototype.slice.apply(arguments);
                var result = original.apply(this, args);
                var ob = this.__ob__;
                //如果数组新增了内容，需要为其添加观察者
                if (method == 'push' || method == 'unshift') {
                    ob.observeArray(args);
                } else if (method == 'splice') {
                    ob.observeArray(args.slice(2));
                }
                console.log('通知更新视图');
                // 通知更新视图
                ob.dep.notify();
                return result
            },
            enumerable: false,
            writable: true,
            configurable: true
        });
    });

    var mv = function(options) {
        this._init(options);
    }
    mv.prototype = {
        _init(options) {
            var self = this;
            self.uid = common.uid;
            console.log(options);
            //data不能是空
            options.data = options.data || {};
            self._options = options;
            //初始化props
            if (options.props) {
                initProps(self);
            }
            //初始化方法methods
            if (options.methods) {
                initMethods(self);
            }
            //初始化数据data
            initData(self);
        }
    };
    return mv;
}));