/*! UIkit 2.26.4 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(core) {

    if (typeof define == "function" && define.amd) { // AMD

        define("uikit", function(){

            var uikit = window.UIkit || core(window, window.jQuery, window.document);

            uikit.load = function(res, req, onload, config) {

                var resources = res.split(','), load = [], i, base = (config.config && config.config.uikit && config.config.uikit.base ? config.config.uikit.base : "").replace(/\/+$/g, "");

                if (!base) {
                    throw new Error( "Please define base path to UIkit in the requirejs config." );
                }

                for (i = 0; i < resources.length; i += 1) {
                    var resource = resources[i].replace(/\./g, '/');
                    load.push(base+'/components/'+resource);
                }

                req(load, function() {
                    onload(uikit);
                });
            };

            return uikit;
        });
    }

    if (!window.jQuery) {
        throw new Error( "UIkit requires jQuery" );
    }

    if (window && window.jQuery) {
        core(window, window.jQuery, window.document);
    }


})(function(global, $, doc) {

    "use strict";

    var UI = {}, _UI = global.UIkit ? Object.create(global.UIkit) : undefined;

    UI.version = '2.26.4';

    UI.noConflict = function() {
        // restore UIkit version
        if (_UI) {
            global.UIkit = _UI;
            $.UIkit      = _UI;
            $.fn.uk      = _UI.fn;
        }

        return UI;
    };

    UI.prefix = function(str) {
        return str;
    };

    // cache jQuery
    UI.$ = $;

    UI.$doc  = UI.$(document);
    UI.$win  = UI.$(window);
    UI.$html = UI.$('html');

    UI.support = {};
    UI.support.transition = (function() {

        var transitionEnd = (function() {

            var element = doc.body || doc.documentElement,
                transEndEventNames = {
                    WebkitTransition : 'webkitTransitionEnd',
                    MozTransition    : 'transitionend',
                    OTransition      : 'oTransitionEnd otransitionend',
                    transition       : 'transitionend'
                }, name;

            for (name in transEndEventNames) {
                if (element.style[name] !== undefined) return transEndEventNames[name];
            }
        }());

        return transitionEnd && { end: transitionEnd };
    })();

    UI.support.animation = (function() {

        var animationEnd = (function() {

            var element = doc.body || doc.documentElement,
                animEndEventNames = {
                    WebkitAnimation : 'webkitAnimationEnd',
                    MozAnimation    : 'animationend',
                    OAnimation      : 'oAnimationEnd oanimationend',
                    animation       : 'animationend'
                }, name;

            for (name in animEndEventNames) {
                if (element.style[name] !== undefined) return animEndEventNames[name];
            }
        }());

        return animationEnd && { end: animationEnd };
    })();

    // requestAnimationFrame polyfill
    //https://github.com/darius/requestAnimationFrame
    (function() {

        Date.now = Date.now || function() { return new Date().getTime(); };

        var vendors = ['webkit', 'moz'];
        for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
            var vp = vendors[i];
            window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
            window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                       || window[vp+'CancelRequestAnimationFrame']);
        }
        if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
            || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
            var lastTime = 0;
            window.requestAnimationFrame = function(callback) {
                var now = Date.now();
                var nextTime = Math.max(lastTime + 16, now);
                return setTimeout(function() { callback(lastTime = nextTime); },
                                  nextTime - now);
            };
            window.cancelAnimationFrame = clearTimeout;
        }
    }());

    UI.support.touch = (
        ('ontouchstart' in document) ||
        (global.DocumentTouch && document instanceof global.DocumentTouch)  ||
        (global.navigator.msPointerEnabled && global.navigator.msMaxTouchPoints > 0) || //IE 10
        (global.navigator.pointerEnabled && global.navigator.maxTouchPoints > 0) || //IE >=11
        false
    );

    UI.support.mutationobserver = (global.MutationObserver || global.WebKitMutationObserver || null);

    UI.Utils = {};

    UI.Utils.isFullscreen = function() {
        return document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.fullscreenElement || false;
    };

    UI.Utils.str2json = function(str, notevil) {
        try {
            if (notevil) {
                return JSON.parse(str
                    // wrap keys without quote with valid double quote
                    .replace(/([\$\w]+)\s*:/g, function(_, $1){return '"'+$1+'":';})
                    // replacing single quote wrapped ones to double quote
                    .replace(/'([^']+)'/g, function(_, $1){return '"'+$1+'"';})
                );
            } else {
                return (new Function("", "var json = " + str + "; return JSON.parse(JSON.stringify(json));"))();
            }
        } catch(e) { return false; }
    };

    UI.Utils.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    UI.Utils.throttle = function (func, limit) {
        var wait = false;
        return function () {
            if (!wait) {
                func.call();
                wait = true;
                setTimeout(function () {
                    wait = false;
                }, limit);
            }
        }
    };

    UI.Utils.removeCssRules = function(selectorRegEx) {
        var idx, idxs, stylesheet, _i, _j, _k, _len, _len1, _len2, _ref;

        if(!selectorRegEx) return;

        setTimeout(function(){
            try {
              _ref = document.styleSheets;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                stylesheet = _ref[_i];
                idxs = [];
                stylesheet.cssRules = stylesheet.cssRules;
                for (idx = _j = 0, _len1 = stylesheet.cssRules.length; _j < _len1; idx = ++_j) {
                  if (stylesheet.cssRules[idx].type === CSSRule.STYLE_RULE && selectorRegEx.test(stylesheet.cssRules[idx].selectorText)) {
                    idxs.unshift(idx);
                  }
                }
                for (_k = 0, _len2 = idxs.length; _k < _len2; _k++) {
                  stylesheet.deleteRule(idxs[_k]);
                }
              }
            } catch (_error) {}
        }, 0);
    };

    UI.Utils.isInView = function(element, options) {

        var $element = $(element);

        if (!$element.is(':visible')) {
            return false;
        }

        var window_left = UI.$win.scrollLeft(), window_top = UI.$win.scrollTop(), offset = $element.offset(), left = offset.left, top = offset.top;

        options = $.extend({topoffset:0, leftoffset:0}, options);

        if (top + $element.height() >= window_top && top - options.topoffset <= window_top + UI.$win.height() &&
            left + $element.width() >= window_left && left - options.leftoffset <= window_left + UI.$win.width()) {
          return true;
        } else {
          return false;
        }
    };

    UI.Utils.checkDisplay = function(context, initanimation) {

        var elements = UI.$('[data-uk-margin], [data-uk-grid-match], [data-uk-grid-margin], [data-uk-check-display]', context || document), animated;

        if (context && !elements.length) {
            elements = $(context);
        }

        elements.trigger('display.uk.check');

        // fix firefox / IE animations
        if (initanimation) {

            if (typeof(initanimation)!='string') {
                initanimation = '[class*="uk-animation-"]';
            }

            elements.find(initanimation).each(function(){

                var ele  = UI.$(this),
                    cls  = ele.attr('class'),
                    anim = cls.match(/uk-animation-(.+)/);

                ele.removeClass(anim[0]).width();

                ele.addClass(anim[0]);
            });
        }

        return elements;
    };

    UI.Utils.options = function(string) {

        if ($.type(string)!='string') return string;

        if (string.indexOf(':') != -1 && string.trim().substr(-1) != '}') {
            string = '{'+string+'}';
        }

        var start = (string ? string.indexOf("{") : -1), options = {};

        if (start != -1) {
            try {
                options = UI.Utils.str2json(string.substr(start));
            } catch (e) {}
        }

        return options;
    };

    UI.Utils.animate = function(element, cls) {

        var d = $.Deferred();

        element = UI.$(element);

        element.css('display', 'none').addClass(cls).one(UI.support.animation.end, function() {
            element.removeClass(cls);
            d.resolve();
        });

        element.css('display', '');

        return d.promise();
    };

    UI.Utils.uid = function(prefix) {
        return (prefix || 'id') + (new Date().getTime())+"RAND"+(Math.ceil(Math.random() * 100000));
    };

    UI.Utils.template = function(str, data) {

        var tokens = str.replace(/\n/g, '\\n').replace(/\{\{\{\s*(.+?)\s*\}\}\}/g, "{{!$1}}").split(/(\{\{\s*(.+?)\s*\}\})/g),
            i=0, toc, cmd, prop, val, fn, output = [], openblocks = 0;

        while(i < tokens.length) {

            toc = tokens[i];

            if(toc.match(/\{\{\s*(.+?)\s*\}\}/)) {
                i = i + 1;
                toc  = tokens[i];
                cmd  = toc[0];
                prop = toc.substring(toc.match(/^(\^|\#|\!|\~|\:)/) ? 1:0);

                switch(cmd) {
                    case '~':
                        output.push("for(var $i=0;$i<"+prop+".length;$i++) { var $item = "+prop+"[$i];");
                        openblocks++;
                        break;
                    case ':':
                        output.push("for(var $key in "+prop+") { var $val = "+prop+"[$key];");
                        openblocks++;
                        break;
                    case '#':
                        output.push("if("+prop+") {");
                        openblocks++;
                        break;
                    case '^':
                        output.push("if(!"+prop+") {");
                        openblocks++;
                        break;
                    case '/':
                        output.push("}");
                        openblocks--;
                        break;
                    case '!':
                        output.push("__ret.push("+prop+");");
                        break;
                    default:
                        output.push("__ret.push(escape("+prop+"));");
                        break;
                }
            } else {
                output.push("__ret.push('"+toc.replace(/\'/g, "\\'")+"');");
            }
            i = i + 1;
        }

        fn  = new Function('$data', [
            'var __ret = [];',
            'try {',
            'with($data){', (!openblocks ? output.join('') : '__ret = ["Not all blocks are closed correctly."]'), '};',
            '}catch(e){__ret = [e.message];}',
            'return __ret.join("").replace(/\\n\\n/g, "\\n");',
            "function escape(html) { return String(html).replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');}"
        ].join("\n"));

        return data ? fn(data) : fn;
    };

    UI.Utils.events       = {};
    UI.Utils.events.click = UI.support.touch ? 'tap' : 'click';

    global.UIkit = UI;

    // deprecated

    UI.fn = function(command, options) {

        var args = arguments, cmd = command.match(/^([a-z\-]+)(?:\.([a-z]+))?/i), component = cmd[1], method = cmd[2];

        if (!UI[component]) {
            $.error("UIkit component [" + component + "] does not exist.");
            return this;
        }

        return this.each(function() {
            var $this = $(this), data = $this.data(component);
            if (!data) $this.data(component, (data = UI[component](this, method ? undefined : options)));
            if (method) data[method].apply(data, Array.prototype.slice.call(args, 1));
        });
    };

    $.UIkit          = UI;
    $.fn.uk          = UI.fn;

    UI.langdirection = UI.$html.attr("dir") == "rtl" ? "right" : "left";

    UI.components    = {};

    UI.component = function(name, def) {

        var fn = function(element, options) {

            var $this = this;

            this.UIkit   = UI;
            this.element = element ? UI.$(element) : null;
            this.options = $.extend(true, {}, this.defaults, options);
            this.plugins = {};

            if (this.element) {
                this.element.data(name, this);
            }

            this.init();

            (this.options.plugins.length ? this.options.plugins : Object.keys(fn.plugins)).forEach(function(plugin) {

                if (fn.plugins[plugin].init) {
                    fn.plugins[plugin].init($this);
                    $this.plugins[plugin] = true;
                }

            });

            this.trigger('init.uk.component', [name, this]);

            return this;
        };

        fn.plugins = {};

        $.extend(true, fn.prototype, {

            defaults : {plugins: []},

            boot: function(){},
            init: function(){},

            on: function(a1,a2,a3){
                return UI.$(this.element || this).on(a1,a2,a3);
            },

            one: function(a1,a2,a3){
                return UI.$(this.element || this).one(a1,a2,a3);
            },

            off: function(evt){
                return UI.$(this.element || this).off(evt);
            },

            trigger: function(evt, params) {
                return UI.$(this.element || this).trigger(evt, params);
            },

            find: function(selector) {
                return UI.$(this.element ? this.element: []).find(selector);
            },

            proxy: function(obj, methods) {

                var $this = this;

                methods.split(' ').forEach(function(method) {
                    if (!$this[method]) $this[method] = function() { return obj[method].apply(obj, arguments); };
                });
            },

            mixin: function(obj, methods) {

                var $this = this;

                methods.split(' ').forEach(function(method) {
                    if (!$this[method]) $this[method] = obj[method].bind($this);
                });
            },

            option: function() {

                if (arguments.length == 1) {
                    return this.options[arguments[0]] || undefined;
                } else if (arguments.length == 2) {
                    this.options[arguments[0]] = arguments[1];
                }
            }

        }, def);

        this.components[name] = fn;

        this[name] = function() {

            var element, options;

            if (arguments.length) {

                switch(arguments.length) {
                    case 1:

                        if (typeof arguments[0] === "string" || arguments[0].nodeType || arguments[0] instanceof jQuery) {
                            element = $(arguments[0]);
                        } else {
                            options = arguments[0];
                        }

                        break;
                    case 2:

                        element = $(arguments[0]);
                        options = arguments[1];
                        break;
                }
            }

            if (element && element.data(name)) {
                return element.data(name);
            }

            return (new UI.components[name](element, options));
        };

        if (UI.domready) {
            UI.component.boot(name);
        }

        return fn;
    };

    UI.plugin = function(component, name, def) {
        this.components[component].plugins[name] = def;
    };

    UI.component.boot = function(name) {

        if (UI.components[name].prototype && UI.components[name].prototype.boot && !UI.components[name].booted) {
            UI.components[name].prototype.boot.apply(UI, []);
            UI.components[name].booted = true;
        }
    };

    UI.component.bootComponents = function() {

        for (var component in UI.components) {
            UI.component.boot(component);
        }
    };


    // DOM mutation save ready helper function

    UI.domObservers = [];
    UI.domready     = false;

    UI.ready = function(fn) {

        UI.domObservers.push(fn);

        if (UI.domready) {
            fn(document);
        }
    };

    UI.on = function(a1,a2,a3){

        if (a1 && a1.indexOf('ready.uk.dom') > -1 && UI.domready) {
            a2.apply(UI.$doc);
        }

        return UI.$doc.on(a1,a2,a3);
    };

    UI.one = function(a1,a2,a3){

        if (a1 && a1.indexOf('ready.uk.dom') > -1 && UI.domready) {
            a2.apply(UI.$doc);
            return UI.$doc;
        }

        return UI.$doc.one(a1,a2,a3);
    };

    UI.trigger = function(evt, params) {
        return UI.$doc.trigger(evt, params);
    };

    UI.domObserve = function(selector, fn) {

        if(!UI.support.mutationobserver) return;

        fn = fn || function() {};

        UI.$(selector).each(function() {

            var element  = this,
                $element = UI.$(element);

            if ($element.data('observer')) {
                return;
            }

            try {

                var observer = new UI.support.mutationobserver(UI.Utils.debounce(function(mutations) {
                    fn.apply(element, []);
                    $element.trigger('changed.uk.dom');
                }, 50), {childList: true, subtree: true});

                // pass in the target node, as well as the observer options
                observer.observe(element, { childList: true, subtree: true });

                $element.data('observer', observer);

            } catch(e) {}
        });
    };

    UI.init = function(root) {

        root = root || document;

        UI.domObservers.forEach(function(fn){
            fn(root);
        });
    };

    UI.on('domready.uk.dom', function(){

        UI.init();

        if (UI.domready) UI.Utils.checkDisplay();
    });

    document.addEventListener('DOMContentLoaded', function(){

        var domReady = function() {

            UI.$body = UI.$('body');

            UI.trigger('beforeready.uk.dom');

            UI.component.bootComponents();

            // custom scroll observer
            var rafToken = requestAnimationFrame((function(){

                var memory = {dir: {x:0, y:0}, x: window.pageXOffset, y:window.pageYOffset};

                var fn = function(){
                    // reading this (window.page[X|Y]Offset) causes a full page recalc of the layout in Chrome,
                    // so we only want to do this once
                    var wpxo = window.pageXOffset;
                    var wpyo = window.pageYOffset;

                    // Did the scroll position change since the last time we were here?
                    if (memory.x != wpxo || memory.y != wpyo) {

                        // Set the direction of the scroll and store the new position
                        if (wpxo != memory.x) {memory.dir.x = wpxo > memory.x ? 1:-1; } else { memory.dir.x = 0; }
                        if (wpyo != memory.y) {memory.dir.y = wpyo > memory.y ? 1:-1; } else { memory.dir.y = 0; }

                        memory.x = wpxo;
                        memory.y = wpyo;

                        // Trigger the scroll event, this could probably be sent using memory.clone() but this is
                        // more explicit and easier to see exactly what is being sent in the event.
                        UI.$doc.trigger('scrolling.uk.document', [{
                            "dir": {"x": memory.dir.x, "y": memory.dir.y}, "x": wpxo, "y": wpyo
                        }]);
                    }

                    cancelAnimationFrame(rafToken);
                    rafToken = requestAnimationFrame(fn);
                };

                if (UI.support.touch) {
                    UI.$html.on('touchmove touchend MSPointerMove MSPointerUp pointermove pointerup', fn);
                }

                if (memory.x || memory.y) fn();

                return fn;

            })());

            // run component init functions on dom
            UI.trigger('domready.uk.dom');

            if (UI.support.touch) {

                // remove css hover rules for touch devices
                // UI.Utils.removeCssRules(/\.uk-(?!navbar).*:hover/);

                // viewport unit fix for uk-height-viewport - should be fixed in iOS 8
                if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {

                    UI.$win.on('load orientationchange resize', UI.Utils.debounce((function(){

                        var fn = function() {
                            $('.uk-height-viewport').css('height', window.innerHeight);
                            return fn;
                        };

                        return fn();

                    })(), 100));
                }
            }

            UI.trigger('afterready.uk.dom');

            // mark that domready is left behind
            UI.domready = true;

            // auto init js components
            if (UI.support.mutationobserver) {

                var initFn = UI.Utils.debounce(function(){
                    requestAnimationFrame(function(){ UI.init(document.body);});
                }, 10);

                (new UI.support.mutationobserver(function(mutations) {

                    var init = false;

                    mutations.every(function(mutation){

                        if (mutation.type != 'childList') return true;

                        for (var i = 0, node; i < mutation.addedNodes.length; ++i) {

                            node = mutation.addedNodes[i];

                            if (node.outerHTML && node.outerHTML.indexOf('data-uk-') !== -1) {
                                return (init = true) && false;
                            }
                        }
                        return true;
                    });

                    if (init) initFn();

                })).observe(document.body, {childList: true, subtree: true});
            }
        };

        if (document.readyState == 'complete' || document.readyState == 'interactive') {
            setTimeout(domReady);
        }

        return domReady;

    }());

    // add touch identifier class
    UI.$html.addClass(UI.support.touch ? "uk-touch" : "uk-notouch");

    // add uk-hover class on tap to support overlays on touch devices
    if (UI.support.touch) {

        var hoverset = false,
            exclude,
            hovercls = 'uk-hover',
            selector = '.uk-overlay, .uk-overlay-hover, .uk-overlay-toggle, .uk-animation-hover, .uk-has-hover';

        UI.$html.on('mouseenter touchstart MSPointerDown pointerdown', selector, function() {

            if (hoverset) $('.'+hovercls).removeClass(hovercls);

            hoverset = $(this).addClass(hovercls);

        }).on('mouseleave touchend MSPointerUp pointerup', function(e) {

            exclude = $(e.target).parents(selector);

            if (hoverset) {
                hoverset.not(exclude).removeClass(hovercls);
            }
        });
    }

    return UI;
});

/*! UIkit 2.26.4 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(UI) {

    "use strict";

    var grids = [];

    UI.component('gridMatchHeight', {

        defaults: {
            "target"        : false,
            "row"           : true,
            "ignorestacked" : false,
            "observe"       : false
        },

        boot: function() {

            // init code
            UI.ready(function(context) {

                UI.$("[data-uk-grid-match]", context).each(function() {
                    var grid = UI.$(this), obj;

                    if (!grid.data("gridMatchHeight")) {
                        obj = UI.gridMatchHeight(grid, UI.Utils.options(grid.attr("data-uk-grid-match")));
                    }
                });
            });
        },

        init: function() {

            var $this = this;

            this.columns  = this.element.children();
            this.elements = this.options.target ? this.find(this.options.target) : this.columns;

            if (!this.columns.length) return;

            UI.$win.on('load resize orientationchange', (function() {

                var fn = function() {
                    if ($this.element.is(":visible")) $this.match();
                };

                UI.$(function() { fn(); });

                return UI.Utils.debounce(fn, 50);
            })());

            if (this.options.observe) {

                UI.domObserve(this.element, function(e) {
                    if ($this.element.is(":visible")) $this.match();
                });
            }

            this.on("display.uk.check", function(e) {
                if(this.element.is(":visible")) this.match();
            }.bind(this));

            grids.push(this);
        },

        match: function() {

            var firstvisible = this.columns.filter(":visible:first");

            if (!firstvisible.length) return;

            var stacked = Math.ceil(100 * parseFloat(firstvisible.css('width')) / parseFloat(firstvisible.parent().css('width'))) >= 100;

            if (stacked && !this.options.ignorestacked) {
                this.revert();
            } else {
                UI.Utils.matchHeights(this.elements, this.options);
            }

            return this;
        },

        revert: function() {
            this.elements.css('min-height', '');
            return this;
        }
    });

    UI.component('gridMargin', {

        defaults: {
            cls      : 'uk-grid-margin',
            rowfirst : 'uk-row-first'
        },

        boot: function() {

            // init code
            UI.ready(function(context) {

                UI.$("[data-uk-grid-margin]", context).each(function() {
                    var grid = UI.$(this), obj;

                    if (!grid.data("gridMargin")) {
                        obj = UI.gridMargin(grid, UI.Utils.options(grid.attr("data-uk-grid-margin")));
                    }
                });
            });
        },

        init: function() {

            var stackMargin = UI.stackMargin(this.element, this.options);
        }
    });

})(UIkit);

/*! UIkit 2.26.4 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(UI) {

    "use strict";

    var active = false, activeCount = 0, $html = UI.$html, body;

    UI.$win.on("resize orientationchange", UI.Utils.debounce(function(){
        UI.$('.uk-modal.uk-open').each(function(){
            UI.$(this).data('modal').resize();
        });
    }, 150));

    UI.component('modal', {

        defaults: {
            keyboard: true,
            bgclose: true,
            minScrollHeight: 150,
            center: false,
            modal: true
        },

        scrollable: false,
        transition: false,
        hasTransitioned: true,

        init: function() {

            if (!body) body = UI.$('body');

            if (!this.element.length) return;

            var $this = this;

            this.paddingdir = "padding-" + (UI.langdirection == 'left' ? "right":"left");
            this.dialog     = this.find(".uk-modal-dialog");

            this.active     = false;

            // Update ARIA
            this.element.attr('aria-hidden', this.element.hasClass("uk-open"));

            this.on("click", ".uk-modal-close", function(e) {
                e.preventDefault();
                $this.hide();
            }).on("click", function(e) {

                var target = UI.$(e.target);

                if (target[0] == $this.element[0] && $this.options.bgclose) {
                    $this.hide();
                }
            });

            UI.domObserve(this.element, function(e) { $this.resize(); });
        },

        toggle: function() {
            return this[this.isActive() ? "hide" : "show"]();
        },

        show: function() {

            if (!this.element.length) return;

            var $this = this;

            if (this.isActive()) return;

            if (this.options.modal && active) {
                active.hide(true);
            }

            this.element.removeClass("uk-open").show();
            this.resize(true);

            if (this.options.modal) {
                active = this;
            }

            this.active = true;

            activeCount++;

            if (UI.support.transition) {
                this.hasTransitioned = false;
                this.element.one(UI.support.transition.end, function(){
                    $this.hasTransitioned = true;
                }).addClass("uk-open");
            } else {
                this.element.addClass("uk-open");
            }

            $html.addClass("uk-modal-page").height(); // force browser engine redraw

            // Update ARIA
            this.element.attr('aria-hidden', 'false');

            this.element.trigger("show.uk.modal");

            UI.Utils.checkDisplay(this.dialog, true);

            return this;
        },

        hide: function(force) {

            if (!force && UI.support.transition && this.hasTransitioned) {

                var $this = this;

                this.one(UI.support.transition.end, function() {
                    $this._hide();
                }).removeClass("uk-open");

            } else {

                this._hide();
            }

            return this;
        },

        resize: function(force) {

            if (!this.isActive() && !force) return;

            var bodywidth  = body.width();

            this.scrollbarwidth = window.innerWidth - bodywidth;

            body.css(this.paddingdir, this.scrollbarwidth);

            this.element.css('overflow-y', this.scrollbarwidth ? 'scroll' : 'auto');

            if (!this.updateScrollable() && this.options.center) {

                var dh  = this.dialog.outerHeight(),
                pad = parseInt(this.dialog.css('margin-top'), 10) + parseInt(this.dialog.css('margin-bottom'), 10);

                if ((dh + pad) < window.innerHeight) {
                    this.dialog.css({'top': (window.innerHeight/2 - dh/2) - pad });
                } else {
                    this.dialog.css({'top': ''});
                }
            }
        },

        updateScrollable: function() {

            // has scrollable?
            var scrollable = this.dialog.find('.uk-overflow-container:visible:first');

            if (scrollable.length) {

                scrollable.css('height', 0);

                var offset = Math.abs(parseInt(this.dialog.css('margin-top'), 10)),
                dh     = this.dialog.outerHeight(),
                wh     = window.innerHeight,
                h      = wh - 2*(offset < 20 ? 20:offset) - dh;

                scrollable.css({
                    'max-height': (h < this.options.minScrollHeight ? '':h),
                    'height':''
                });

                return true;
            }

            return false;
        },

        _hide: function() {

            this.active = false;
            if (activeCount > 0) activeCount--;
            else activeCount = 0;

            this.element.hide().removeClass('uk-open');

            // Update ARIA
            this.element.attr('aria-hidden', 'true');

            if (!activeCount) {
                $html.removeClass('uk-modal-page');
                body.css(this.paddingdir, "");
            }

            if (active===this) active = false;

            this.trigger('hide.uk.modal');
        },

        isActive: function() {
            return this.element.hasClass('uk-open');
        }

    });

    UI.component('modalTrigger', {

        boot: function() {

            // init code
            UI.$html.on("click.modal.uikit", "[data-uk-modal]", function(e) {

                var ele = UI.$(this);

                if (ele.is("a")) {
                    e.preventDefault();
                }

                if (!ele.data("modalTrigger")) {
                    var modal = UI.modalTrigger(ele, UI.Utils.options(ele.attr("data-uk-modal")));
                    modal.show();
                }

            });

            // close modal on esc button
            UI.$html.on('keydown.modal.uikit', function (e) {

                if (active && e.keyCode === 27 && active.options.keyboard) { // ESC
                    e.preventDefault();
                    active.hide();
                }
            });
        },

        init: function() {

            var $this = this;

            this.options = UI.$.extend({
                "target": $this.element.is("a") ? $this.element.attr("href") : false
            }, this.options);

            this.modal = UI.modal(this.options.target, this.options);

            this.on("click", function(e) {
                e.preventDefault();
                $this.show();
            });

            //methods
            this.proxy(this.modal, "show hide isActive");
        }
    });

    UI.modal.dialog = function(content, options) {

        var modal = UI.modal(UI.$(UI.modal.dialog.template).appendTo("body"), options);

        modal.on("hide.uk.modal", function(){
            if (modal.persist) {
                modal.persist.appendTo(modal.persist.data("modalPersistParent"));
                modal.persist = false;
            }
            modal.element.remove();
        });

        setContent(content, modal);

        return modal;
    };

    UI.modal.dialog.template = '<div class="uk-modal"><div class="uk-modal-dialog" style="min-height:0;"></div></div>';

    UI.modal.alert = function(content, options) {

        options = UI.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:UI.modal.labels}, options);

        var modal = UI.modal.dialog(([
            '<div class="uk-margin uk-modal-content">'+String(content)+'</div>',
            '<div class="uk-modal-footer uk-text-right"><button class="uk-button uk-button-primary uk-modal-close">'+options.labels.Ok+'</button></div>'
        ]).join(""), options);

        modal.on('show.uk.modal', function(){
            setTimeout(function(){
                modal.element.find('button:first').focus();
            }, 50);
        });

        return modal.show();
    };

    UI.modal.confirm = function(content, onconfirm, oncancel) {

        var options = arguments.length > 1 && arguments[arguments.length-1] ? arguments[arguments.length-1] : {};

        onconfirm = UI.$.isFunction(onconfirm) ? onconfirm : function(){};
        oncancel  = UI.$.isFunction(oncancel) ? oncancel : function(){};
        options   = UI.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:UI.modal.labels}, UI.$.isFunction(options) ? {}:options);

        var modal = UI.modal.dialog(([
            '<div class="uk-margin uk-modal-content">'+String(content)+'</div>',
            '<div class="uk-modal-footer uk-text-right"><button class="uk-button js-modal-confirm-cancel">'+options.labels.Cancel+'</button> <button class="uk-button uk-button-primary js-modal-confirm">'+options.labels.Ok+'</button></div>'
        ]).join(""), options);

        modal.element.find(".js-modal-confirm, .js-modal-confirm-cancel").on("click", function(){
            UI.$(this).is('.js-modal-confirm') ? onconfirm() : oncancel();
            modal.hide();
        });

        modal.on('show.uk.modal', function(){
            setTimeout(function(){
                modal.element.find('.js-modal-confirm').focus();
            }, 50);
        });

        return modal.show();
    };

    UI.modal.prompt = function(text, value, onsubmit, options) {

        onsubmit = UI.$.isFunction(onsubmit) ? onsubmit : function(value){};
        options  = UI.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:UI.modal.labels}, options);

        var modal = UI.modal.dialog(([
            text ? '<div class="uk-modal-content uk-form">'+String(text)+'</div>':'',
            '<div class="uk-margin-small-top uk-modal-content uk-form"><p><input type="text" class="uk-width-1-1"></p></div>',
            '<div class="uk-modal-footer uk-text-right"><button class="uk-button uk-modal-close">'+options.labels.Cancel+'</button> <button class="uk-button uk-button-primary js-modal-ok">'+options.labels.Ok+'</button></div>'
        ]).join(""), options),

        input = modal.element.find("input[type='text']").val(value || '').on('keyup', function(e){
            if (e.keyCode == 13) {
                modal.element.find(".js-modal-ok").trigger('click');
            }
        });

        modal.element.find(".js-modal-ok").on("click", function(){
            if (onsubmit(input.val())!==false){
                modal.hide();
            }
        });

        modal.on('show.uk.modal', function(){
            setTimeout(function(){
                input.focus();
            }, 50);
        });

        return modal.show();
    };

    UI.modal.blockUI = function(content, options) {

        var modal = UI.modal.dialog(([
            '<div class="uk-margin uk-modal-content">'+String(content || '<div class="uk-text-center">...</div>')+'</div>'
        ]).join(""), UI.$.extend({bgclose:false, keyboard:false, modal:false}, options));

        modal.content = modal.element.find('.uk-modal-content:first');

        return modal.show();
    };


    UI.modal.labels = {
        'Ok': 'Ok',
        'Cancel': 'Cancel'
    };


    // helper functions
    function setContent(content, modal){

        if(!modal) return;

        if (typeof content === 'object') {

            // convert DOM object to a jQuery object
            content = content instanceof jQuery ? content : UI.$(content);

            if(content.parent().length) {
                modal.persist = content;
                modal.persist.data("modalPersistParent", content.parent());
            }
        }else if (typeof content === 'string' || typeof content === 'number') {
                // just insert the data as innerHTML
                content = UI.$('<div></div>').html(content);
        }else {
                // unsupported data type!
                content = UI.$('<div></div>').html('UIkit.modal Error: Unsupported data type: ' + typeof content);
        }

        content.appendTo(modal.element.find('.uk-modal-dialog'));

        return modal;
    }

})(UIkit);

/*! UIkit 2.26.4 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(UI) {

    "use strict";

    var scrollpos = {x: window.scrollX, y: window.scrollY},
        $win      = UI.$win,
        $doc      = UI.$doc,
        $html     = UI.$html,
        Offcanvas = {

        show: function(element) {

            element = UI.$(element);

            if (!element.length) return;

            var $body     = UI.$('body'),
                bar       = element.find(".uk-offcanvas-bar:first"),
                rtl       = (UI.langdirection == "right"),
                flip      = bar.hasClass("uk-offcanvas-bar-flip") ? -1:1,
                dir       = flip * (rtl ? -1 : 1),

                scrollbarwidth =  window.innerWidth - $body.width();

            scrollpos = {x: window.pageXOffset, y: window.pageYOffset};

            element.addClass("uk-active");

            $body.css({"width": window.innerWidth - scrollbarwidth, "height": window.innerHeight}).addClass("uk-offcanvas-page");
            $body.css((rtl ? "margin-right" : "margin-left"), (rtl ? -1 : 1) * (bar.outerWidth() * dir)).width(); // .width() - force redraw

            $html.css('margin-top', scrollpos.y * -1);

            bar.addClass("uk-offcanvas-bar-show");

            this._initElement(element);

            bar.trigger('show.uk.offcanvas', [element, bar]);

            // Update ARIA
            element.attr('aria-hidden', 'false');
        },

        hide: function(force) {

            var $body = UI.$('body'),
                panel = UI.$(".uk-offcanvas.uk-active"),
                rtl   = (UI.langdirection == "right"),
                bar   = panel.find(".uk-offcanvas-bar:first"),
                finalize = function() {
                    $body.removeClass("uk-offcanvas-page").css({"width": "", "height": "", "margin-left": "", "margin-right": ""});
                    panel.removeClass("uk-active");

                    bar.removeClass("uk-offcanvas-bar-show");
                    $html.css('margin-top', '');
                    window.scrollTo(scrollpos.x, scrollpos.y);
                    bar.trigger('hide.uk.offcanvas', [panel, bar]);

                    // Update ARIA
                    panel.attr('aria-hidden', 'true');
                };

            if (!panel.length) return;

            if (UI.support.transition && !force) {

                $body.one(UI.support.transition.end, function() {
                    finalize();
                }).css((rtl ? "margin-right" : "margin-left"), "");

                setTimeout(function(){
                    bar.removeClass("uk-offcanvas-bar-show");
                }, 0);

            } else {
                finalize();
            }
        },

        _initElement: function(element) {

            if (element.data("OffcanvasInit")) return;

            element.on("click.uk.offcanvas swipeRight.uk.offcanvas swipeLeft.uk.offcanvas", function(e) {

                var target = UI.$(e.target);

                if (!e.type.match(/swipe/)) {

                    if (!target.hasClass("uk-offcanvas-close")) {
                        if (target.hasClass("uk-offcanvas-bar")) return;
                        if (target.parents(".uk-offcanvas-bar:first").length) return;
                    }
                }

                e.stopImmediatePropagation();
                Offcanvas.hide();
            });

            element.on("click", "a[href*='#']", function(e){

                var link = UI.$(this),
                    href = link.attr("href");

                if (href == "#") {
                    return;
                }

                UI.$doc.one('hide.uk.offcanvas', function() {

                    var target;

                    try {
                        target = UI.$(link[0].hash);
                    } catch (e){
                        target = '';
                    }

                    if (!target.length) {
                        target = UI.$('[name="'+link[0].hash.replace('#','')+'"]');
                    }

                    if (target.length && UI.Utils.scrollToElement) {
                        UI.Utils.scrollToElement(target, UI.Utils.options(link.attr('data-uk-smooth-scroll') || '{}'));
                    } else {
                        window.location.href = href;
                    }
                });

                Offcanvas.hide();
            });

            element.data("OffcanvasInit", true);
        }
    };

    UI.component('offcanvasTrigger', {

        boot: function() {

            // init code
            $html.on("click.offcanvas.uikit", "[data-uk-offcanvas]", function(e) {

                e.preventDefault();

                var ele = UI.$(this);

                if (!ele.data("offcanvasTrigger")) {
                    var obj = UI.offcanvasTrigger(ele, UI.Utils.options(ele.attr("data-uk-offcanvas")));
                    ele.trigger("click");
                }
            });

            $html.on('keydown.uk.offcanvas', function(e) {

                if (e.keyCode === 27) { // ESC
                    Offcanvas.hide();
                }
            });
        },

        init: function() {

            var $this = this;

            this.options = UI.$.extend({
                "target": $this.element.is("a") ? $this.element.attr("href") : false
            }, this.options);

            this.on("click", function(e) {
                e.preventDefault();
                Offcanvas.show($this.options.target);
            });
        }
    });

    UI.offcanvas = Offcanvas;

})(UIkit);

/*! UIkit 2.26.4 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(UI) {

    "use strict";

    var $win           = UI.$win,
        $doc           = UI.$doc,
        scrollspies    = [],
        checkScrollSpy = function() {
            for(var i=0; i < scrollspies.length; i++) {
                window.requestAnimationFrame.apply(window, [scrollspies[i].check]);
            }
        };

    UI.component('scrollspy', {

        defaults: {
            "target"     : false,
            "cls"        : "uk-scrollspy-inview",
            "initcls"    : "uk-scrollspy-init-inview",
            "topoffset"  : 0,
            "leftoffset" : 0,
            "repeat"     : false,
            "delay"      : 0
        },

        boot: function() {

            // listen to scroll and resize
            $doc.on("scrolling.uk.document", checkScrollSpy);
            $win.on("load resize orientationchange", UI.Utils.debounce(checkScrollSpy, 50));

            // init code
            UI.ready(function(context) {

                UI.$("[data-uk-scrollspy]", context).each(function() {

                    var element = UI.$(this);

                    if (!element.data("scrollspy")) {
                        var obj = UI.scrollspy(element, UI.Utils.options(element.attr("data-uk-scrollspy")));
                    }
                });
            });
        },

        init: function() {

            var $this = this, inviewstate, initinview, togglecls = this.options.cls.split(/,/), fn = function(){

                var elements     = $this.options.target ? $this.element.find($this.options.target) : $this.element,
                    delayIdx     = elements.length === 1 ? 1 : 0,
                    toggleclsIdx = 0;

                elements.each(function(idx){

                    var element     = UI.$(this),
                        inviewstate = element.data('inviewstate'),
                        inview      = UI.Utils.isInView(element, $this.options),
                        toggle      = element.data('ukScrollspyCls') || togglecls[toggleclsIdx].trim();

                    if (inview && !inviewstate && !element.data('scrollspy-idle')) {

                        if (!initinview) {
                            element.addClass($this.options.initcls);
                            $this.offset = element.offset();
                            initinview = true;

                            element.trigger("init.uk.scrollspy");
                        }

                        element.data('scrollspy-idle', setTimeout(function(){

                            element.addClass("uk-scrollspy-inview").toggleClass(toggle).width();
                            element.trigger("inview.uk.scrollspy");

                            element.data('scrollspy-idle', false);
                            element.data('inviewstate', true);

                        }, $this.options.delay * delayIdx));

                        delayIdx++;
                    }

                    if (!inview && inviewstate && $this.options.repeat) {

                        if (element.data('scrollspy-idle')) {
                            clearTimeout(element.data('scrollspy-idle'));
                            element.data('scrollspy-idle', false);
                        }

                        element.removeClass("uk-scrollspy-inview").toggleClass(toggle);
                        element.data('inviewstate', false);

                        element.trigger("outview.uk.scrollspy");
                    }

                    toggleclsIdx = togglecls[toggleclsIdx + 1] ? (toggleclsIdx + 1) : 0;

                });
            };

            fn();

            this.check = fn;

            scrollspies.push(this);
        }
    });


    var scrollspynavs = [],
        checkScrollSpyNavs = function() {
            for(var i=0; i < scrollspynavs.length; i++) {
                window.requestAnimationFrame.apply(window, [scrollspynavs[i].check]);
            }
        };

    UI.component('scrollspynav', {

        defaults: {
            "cls"          : 'uk-active',
            "closest"      : false,
            "topoffset"    : 0,
            "leftoffset"   : 0,
            "smoothscroll" : false
        },

        boot: function() {

            // listen to scroll and resize
            $doc.on("scrolling.uk.document", checkScrollSpyNavs);
            $win.on("resize orientationchange", UI.Utils.debounce(checkScrollSpyNavs, 50));

            // init code
            UI.ready(function(context) {

                UI.$("[data-uk-scrollspy-nav]", context).each(function() {

                    var element = UI.$(this);

                    if (!element.data("scrollspynav")) {
                        var obj = UI.scrollspynav(element, UI.Utils.options(element.attr("data-uk-scrollspy-nav")));
                    }
                });
            });
        },

        init: function() {

            var ids     = [],
                links   = this.find("a[href^='#']").each(function(){ if(this.getAttribute("href").trim()!=='#') ids.push(this.getAttribute("href")); }),
                targets = UI.$(ids.join(",")),

                clsActive  = this.options.cls,
                clsClosest = this.options.closest || this.options.closest;

            var $this = this, inviews, fn = function(){

                inviews = [];

                for (var i=0 ; i < targets.length ; i++) {
                    if (UI.Utils.isInView(targets.eq(i), $this.options)) {
                        inviews.push(targets.eq(i));
                    }
                }

                if (inviews.length) {

                    var navitems,
                        scrollTop = $win.scrollTop(),
                        target = (function(){
                            for(var i=0; i< inviews.length;i++){
                                if (inviews[i].offset().top - $this.options.topoffset >= scrollTop){
                                    return inviews[i];
                                }
                            }
                        })();

                    if (!target) return;

                    if ($this.options.closest) {
                        links.blur().closest(clsClosest).removeClass(clsActive);
                        navitems = links.filter("a[href='#"+target.attr("id")+"']").closest(clsClosest).addClass(clsActive);
                    } else {
                        navitems = links.removeClass(clsActive).filter("a[href='#"+target.attr("id")+"']").addClass(clsActive);
                    }

                    $this.element.trigger("inview.uk.scrollspynav", [target, navitems]);
                }
            };

            if (this.options.smoothscroll && UI.smoothScroll) {
                links.each(function(){
                    UI.smoothScroll(this, $this.options.smoothscroll);
                });
            }

            fn();

            this.element.data("scrollspynav", this);

            this.check = fn;
            scrollspynavs.push(this);

        }
    });

})(UIkit);

/*! UIkit 2.26.4 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(UI) {

    "use strict";

    UI.component('smoothScroll', {

        boot: function() {

            // init code
            UI.$html.on("click.smooth-scroll.uikit", "[data-uk-smooth-scroll]", function(e) {
                var ele = UI.$(this);

                if (!ele.data("smoothScroll")) {
                    var obj = UI.smoothScroll(ele, UI.Utils.options(ele.attr("data-uk-smooth-scroll")));
                    ele.trigger("click");
                }

                return false;
            });
        },

        init: function() {

            var $this = this;

            this.on("click", function(e) {
                e.preventDefault();
                scrollToElement(UI.$(this.hash).length ? UI.$(this.hash) : UI.$("body"), $this.options);
            });
        }
    });

    function scrollToElement(ele, options) {

        options = UI.$.extend({
            duration: 1000,
            transition: 'easeOutExpo',
            offset: 0,
            complete: function(){}
        }, options);

        // get / set parameters
        var target    = ele.offset().top - options.offset,
            docheight = UI.$doc.height(),
            winheight = window.innerHeight;

        if ((target + winheight) > docheight) {
            target = docheight - winheight;
        }

        // animate to target, fire callback when done
        UI.$("html,body").stop().animate({scrollTop: target}, options.duration, options.transition).promise().done(options.complete);
    }

    UI.Utils.scrollToElement = scrollToElement;

    if (!UI.$.easing.easeOutExpo) {
        UI.$.easing.easeOutExpo = function(x, t, b, c, d) { return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b; };
    }

})(UIkit);

/*! UIkit 2.26.4 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
//  Based on Zeptos touch.js
//  https://raw.github.com/madrobby/zepto/master/src/touch.js
//  Zepto.js may be freely distributed under the MIT license.

;(function($){

  if ($.fn.swipeLeft) {
    return;
  }


  var touch = {}, touchTimeout, tapTimeout, swipeTimeout, longTapTimeout, longTapDelay = 750, gesture;

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
  }

  function longTap() {
    longTapTimeout = null;
    if (touch.last) {
      if ( touch.el !== undefined ) touch.el.trigger('longTap');
      touch = {};
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout);
    longTapTimeout = null;
  }

  function cancelAll() {
    if (touchTimeout)   clearTimeout(touchTimeout);
    if (tapTimeout)     clearTimeout(tapTimeout);
    if (swipeTimeout)   clearTimeout(swipeTimeout);
    if (longTapTimeout) clearTimeout(longTapTimeout);
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null;
    touch = {};
  }

  function isPrimaryTouch(event){
    return event.pointerType == event.MSPOINTER_TYPE_TOUCH && event.isPrimary;
  }

  $(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch;

    if ('MSGesture' in window) {
      gesture = new MSGesture();
      gesture.target = document.body;
    }

    $(document)
      .on('MSGestureEnd gestureend', function(e){

        var swipeDirectionFromVelocity = e.originalEvent.velocityX > 1 ? 'Right' : e.originalEvent.velocityX < -1 ? 'Left' : e.originalEvent.velocityY > 1 ? 'Down' : e.originalEvent.velocityY < -1 ? 'Up' : null;

        if (swipeDirectionFromVelocity && touch.el !== undefined) {
          touch.el.trigger('swipe');
          touch.el.trigger('swipe'+ swipeDirectionFromVelocity);
        }
      })
      // MSPointerDown: for IE10
      // pointerdown: for IE11
      .on('touchstart MSPointerDown pointerdown', function(e){

        if(e.type == 'MSPointerDown' && !isPrimaryTouch(e.originalEvent)) return;

        firstTouch = (e.type == 'MSPointerDown' || e.type == 'pointerdown') ? e : e.originalEvent.touches[0];

        now      = Date.now();
        delta    = now - (touch.last || now);
        touch.el = $('tagName' in firstTouch.target ? firstTouch.target : firstTouch.target.parentNode);

        if(touchTimeout) clearTimeout(touchTimeout);

        touch.x1 = firstTouch.pageX;
        touch.y1 = firstTouch.pageY;

        if (delta > 0 && delta <= 250) touch.isDoubleTap = true;

        touch.last = now;
        longTapTimeout = setTimeout(longTap, longTapDelay);

        // adds the current touch contact for IE gesture recognition
        if (gesture && ( e.type == 'MSPointerDown' || e.type == 'pointerdown' || e.type == 'touchstart' ) ) {
          gesture.addPointer(e.originalEvent.pointerId);
        }

      })
      // MSPointerMove: for IE10
      // pointermove: for IE11
      .on('touchmove MSPointerMove pointermove', function(e){

        if (e.type == 'MSPointerMove' && !isPrimaryTouch(e.originalEvent)) return;

        firstTouch = (e.type == 'MSPointerMove' || e.type == 'pointermove') ? e : e.originalEvent.touches[0];

        cancelLongTap();
        touch.x2 = firstTouch.pageX;
        touch.y2 = firstTouch.pageY;

        deltaX += Math.abs(touch.x1 - touch.x2);
        deltaY += Math.abs(touch.y1 - touch.y2);
      })
      // MSPointerUp: for IE10
      // pointerup: for IE11
      .on('touchend MSPointerUp pointerup', function(e){

        if (e.type == 'MSPointerUp' && !isPrimaryTouch(e.originalEvent)) return;

        cancelLongTap();

        // swipe
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) || (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)){

          swipeTimeout = setTimeout(function() {
            if ( touch.el !== undefined ) {
              touch.el.trigger('swipe');
              touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
            }
            touch = {};
          }, 0);

        // normal tap
        } else if ('last' in touch) {

          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
          if (isNaN(deltaX) || (deltaX < 30 && deltaY < 30)) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function() {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap');
              event.cancelTouch = cancelAll;
              if ( touch.el !== undefined ) touch.el.trigger(event);

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if ( touch.el !== undefined ) touch.el.trigger('doubleTap');
                touch = {};
              }

              // trigger single tap after 250ms of inactivity
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null;
                  if ( touch.el !== undefined ) touch.el.trigger('singleTap');
                  touch = {};
                }, 250);
              }
            }, 0);
          } else {
            touch = {};
          }
          deltaX = deltaY = 0;
        }
      })
      // when the browser window loses focus,
      // for example when a modal dialog is shown,
      // cancel all ongoing events
      .on('touchcancel MSPointerCancel pointercancel', cancelAll);

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll);
  });

  ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return $(this).on(eventName, callback); };
  });
})(jQuery);

/*! UIkit 2.26.4 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(UI) {

    "use strict";

    var stacks = [];

    UI.component('stackMargin', {

        defaults: {
            cls: 'uk-margin-small-top',
            rowfirst: false,
            observe: false
        },

        boot: function() {

            // init code
            UI.ready(function(context) {

                UI.$("[data-uk-margin]", context).each(function() {

                    var ele = UI.$(this);

                    if (!ele.data("stackMargin")) {
                        UI.stackMargin(ele, UI.Utils.options(ele.attr("data-uk-margin")));
                    }
                });
            });
        },

        init: function() {

            var $this = this;

            UI.$win.on('resize orientationchange', (function() {

                var fn = function() {
                    $this.process();
                };

                UI.$(function() {
                    fn();
                    UI.$win.on("load", fn);
                });

                return UI.Utils.debounce(fn, 20);
            })());

            this.on("display.uk.check", function(e) {
                if (this.element.is(":visible")) this.process();
            }.bind(this));

            if (this.options.observe) {

                UI.domObserve(this.element, function(e) {
                    if ($this.element.is(":visible")) $this.process();
                });
            }

            stacks.push(this);
        },

        process: function() {

            var $this = this, columns = this.element.children();

            UI.Utils.stackMargin(columns, this.options);

            if (!this.options.rowfirst || !columns.length) {
                return this;
            }

            // Mark first column elements
            var group = {}, minleft = false;

            columns.removeClass(this.options.rowfirst).each(function(offset, $ele){

                $ele = UI.$(this);

                if (this.style.display != 'none') {
                    offset = $ele.offset().left;
                    ((group[offset] = group[offset] || []) && group[offset]).push(this);
                    minleft = minleft === false ? offset : Math.min(minleft, offset);
                }
            });

            UI.$(group[minleft]).addClass(this.options.rowfirst);

            return this;
        }

    });


    // responsive element e.g. iframes

    (function(){

        var elements = [], check = function(ele) {

            if (!ele.is(':visible')) return;

            var width  = ele.parent().width(),
                iwidth = ele.data('width'),
                ratio  = (width / iwidth),
                height = Math.floor(ratio * ele.data('height'));

            ele.css({'height': (width < iwidth) ? height : ele.data('height')});
        };

        UI.component('responsiveElement', {

            defaults: {},

            boot: function() {

                // init code
                UI.ready(function(context) {

                    UI.$("iframe.uk-responsive-width, [data-uk-responsive]", context).each(function() {

                        var ele = UI.$(this), obj;

                        if (!ele.data("responsiveElement")) {
                            obj = UI.responsiveElement(ele, {});
                        }
                    });
                });
            },

            init: function() {

                var ele = this.element;

                if (ele.attr('width') && ele.attr('height')) {

                    ele.data({

                        'width' : ele.attr('width'),
                        'height': ele.attr('height')

                    }).on('display.uk.check', function(){
                        check(ele);
                    });

                    check(ele);

                    elements.push(ele);
                }
            }
        });

        UI.$win.on('resize load', UI.Utils.debounce(function(){

            elements.forEach(function(ele){
                check(ele);
            });

        }, 15));

    })();



    // helper

    UI.Utils.stackMargin = function(elements, options) {

        options = UI.$.extend({
            'cls': 'uk-margin-small-top'
        }, options);

        elements = UI.$(elements).removeClass(options.cls);

        var min = false;

        elements.each(function(offset, height, pos, $ele){

            $ele   = UI.$(this);

            if ($ele.css('display') != 'none') {

                offset = $ele.offset();
                height = $ele.outerHeight();
                pos    = offset.top + height;

                $ele.data({
                    'ukMarginPos': pos,
                    'ukMarginTop': offset.top
                });

                if (min === false || (offset.top < min.top) ) {

                    min = {
                        top  : offset.top,
                        left : offset.left,
                        pos  : pos
                    };
                }
            }

        }).each(function($ele) {

            $ele   = UI.$(this);

            if ($ele.css('display') != 'none' && $ele.data('ukMarginTop') > min.top && $ele.data('ukMarginPos') > min.pos) {
                $ele.addClass(options.cls);
            }
        });
    };

    UI.Utils.matchHeights = function(elements, options) {

        elements = UI.$(elements).css('min-height', '');
        options  = UI.$.extend({ row : true }, options);

        var matchHeights = function(group){

            if (group.length < 2) return;

            var max = 0;

            group.each(function() {
                max = Math.max(max, UI.$(this).outerHeight());
            }).each(function() {

                var element = UI.$(this),
                    height  = max - (element.css('box-sizing') == 'border-box' ? 0 : (element.outerHeight() - element.height()));

                element.css('min-height', height + 'px');
            });
        };

        if (options.row) {

            elements.first().width(); // force redraw

            setTimeout(function(){

                var lastoffset = false, group = [];

                elements.each(function() {

                    var ele = UI.$(this), offset = ele.offset().top;

                    if (offset != lastoffset && group.length) {

                        matchHeights(UI.$(group));
                        group  = [];
                        offset = ele.offset().top;
                    }

                    group.push(ele);
                    lastoffset = offset;
                });

                if (group.length) {
                    matchHeights(UI.$(group));
                }

            }, 0);

        } else {
            matchHeights(elements);
        }
    };

    (function(cacheSvgs){

        UI.Utils.inlineSvg = function(selector, root) {

            var images = UI.$(selector || 'img[src$=".svg"]', root || document).each(function(){

                var img = UI.$(this),
                    src = img.attr('src');

                if (!cacheSvgs[src]) {

                    var d = UI.$.Deferred();

                    UI.$.get(src, {nc: Math.random()}, function(data){
                        d.resolve(UI.$(data).find('svg'));
                    });

                    cacheSvgs[src] = d.promise();
                }

                cacheSvgs[src].then(function(svg) {

                    var $svg = UI.$(svg).clone();

                    if (img.attr('id')) $svg.attr('id', img.attr('id'));
                    if (img.attr('class')) $svg.attr('class', img.attr('class'));
                    if (img.attr('style')) $svg.attr('style', img.attr('style'));

                    if (img.attr('width')) {
                        $svg.attr('width', img.attr('width'));
                        if (!img.attr('height'))  $svg.removeAttr('height');
                    }

                    if (img.attr('height')){
                        $svg.attr('height', img.attr('height'));
                        if (!img.attr('width')) $svg.removeAttr('width');
                    }

                    img.replaceWith($svg);
                });
            });
        };

        // init code
        UI.ready(function(context) {
            UI.Utils.inlineSvg('[data-uk-svg]', context);
        });

    })({});

})(UIkit);
