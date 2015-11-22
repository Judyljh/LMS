(function ($)
{
    Function.prototype.jqueryExtend = function (parent, overrides)
    {
        if (typeof parent != 'function') return this;
       
        this.base = parent.prototype;
        this.base.constructor = parent;
       
        var f = function () { };
        f.prototype = parent.prototype;
        this.prototype = new f();
        this.prototype.constructor = this;
       
        if (overrides) $.extend(this.prototype, overrides);
    };
   
    Function.prototype.jqueryDefer = function (o, defer, args)
    {
        var fn = this;
        return setTimeout(function () { fn.apply(o, args || []); }, defer);
    };

   
    window.jquery = $.jqueryui = {
        version: 'V1.2.0',
        managerCount: 0,
       
        managers: {},
        managerIdPrev: 'jqueryui',
       
        autoNewId: true,
       
        error: {
            managerIsExist: 'ManageId Duplicated'
        },
        pluginPrev: 'jquery',
        getId: function (prev)
        {
            prev = prev || this.managerIdPrev;
            var id = prev + (1000 + this.managerCount);
            this.managerCount++;
            return id;
        },
        add: function (manager)
        {
            if (arguments.length == 2)
            {
                var m = arguments[1];
                m.id = m.id || m.options.id || arguments[0].id;
                this.addManager(m);
                return;
            }
            if (!manager.id) manager.id = this.getId(manager.__idPrev());
           
           
           
           
           
            this.managers[manager.id] = manager;
        },
        remove: function (arg)
        {
            if (typeof arg == "string" || typeof arg == "number")
            {
                delete jquery.managers[arg];
            }
            else if (typeof arg == "object")
            {
                if (arg instanceof jquery.core.Component)
                {
                    delete jquery.managers[arg.id];
                }
                else
                {
                    if (!$(arg).attr(this.idAttrName)) return false;
                    delete jquery.managers[$(arg).attr(this.idAttrName)];
                }
            }
        },
       
       
       
        get: function (arg, idAttrName)
        {
            idAttrName = idAttrName || "jqueryuiid";
            if (typeof arg == "string" || typeof arg == "number")
            {
                return jquery.managers[arg];
            }
            else if (typeof arg == "object")
            {
                var domObj = arg.length ? arg[0] : arg;
                var id = domObj[idAttrName] || $(domObj).attr(idAttrName);
                if (!id) return null;
                return jquery.managers[id];
            }
            return null;
        },
       
        find: function (type)
        {
            var arr = [];
            for (var id in this.managers)
            {
                var manager = this.managers[id];
                if (type instanceof Function)
                {
                    if (manager instanceof type)
                    {
                        arr.push(manager);
                    }
                }
                else if (type instanceof Array)
                {
                    if ($.inArray(manager.__getType(), type) != -1)
                    {
                        arr.push(manager);
                    }
                }
                else
                {
                    if (manager.__getType() == type)
                    {
                        arr.push(manager);
                    }
                }
            }
            return arr;
        },
       
       
       
       
       
        run: function (plugin, args, ext)
        {
            if (!plugin) return;
            ext = $.extend({
                defaultsNamespace: 'jqueryDefaults',
                methodsNamespace: 'jqueryMethods',
                controlNamespace: 'controls',
                idAttrName: 'jqueryuiid',
                isStatic: false,
                hasElement: true,          
                propertyToElemnt: null     
            }, ext || {});
            plugin = plugin.replace(/^jqueryGet/, '');
            plugin = plugin.replace(/^jquery/, '');
            if (this == null || this == window || ext.isStatic)
            {
                if (!jquery.plugins[plugin])
                {
                    jquery.plugins[plugin] = {
                        fn: $[jquery.pluginPrev + plugin],
                        isStatic: true
                    };
                }
                return new $.jqueryui[ext.controlNamespace][plugin]($.extend({}, $[ext.defaultsNamespace][plugin] || {}, $[ext.defaultsNamespace][plugin + 'String'] || {}, args.length > 0 ? args[0] : {}));
            }
            if (!jquery.plugins[plugin])
            {
                jquery.plugins[plugin] = {
                    fn: $.fn[jquery.pluginPrev + plugin],
                    isStatic: false
                };
            }
            if (/Manager$/.test(plugin)) return jquery.get(this, ext.idAttrName);
            this.each(function ()
            {
                if (this[ext.idAttrName] || $(this).attr(ext.idAttrName))
                {
                    var manager = jquery.get(this[ext.idAttrName] || $(this).attr(ext.idAttrName));
                    if (manager && args.length > 0) manager.set(args[0]);
                   
                    return;
                }
                if (args.length >= 1 && typeof args[0] == 'string') return;
               
                var options = args.length > 0 ? args[0] : null;
                var p = $.extend({}, $[ext.defaultsNamespace][plugin], $[ext.defaultsNamespace][plugin + 'String'], options);
                if (ext.propertyToElemnt) p[ext.propertyToElemnt] = this;
                if (ext.hasElement)
                {
                    new $.jqueryui[ext.controlNamespace][plugin](this, p);
                }
                else
                {
                    new $.jqueryui[ext.controlNamespace][plugin](p);
                }
            });
            if (this.length == 0) return null;
            if (args.length == 0) return jquery.get(this, ext.idAttrName);
            if (typeof args[0] == 'object') return jquery.get(this, ext.idAttrName);
            if (typeof args[0] == 'string')
            {
                var manager = jquery.get(this, ext.idAttrName);
                if (manager == null) return;
                if (args[0] == "option")
                {
                    if (args.length == 2)
                        return manager.get(args[1]); 
                    else if (args.length >= 3)
                        return manager.set(args[1], args[2]); 
                }
                else
                {
                    var method = args[0];
                    if (!manager[method]) return;
                    var parms = Array.apply(null, args);
                    parms.shift();
                    return manager[method].apply(manager, parms); 
                }
            }
            return null;
        },

       
       
       
        defaults: {},
       
        methods: {},
       
       
        core: {},
       
       
        controls: {},
       
        plugins: {}
    };


   
    $.jqueryDefaults = {};

   
    $.jqueryMethos = {};

   
    jquery.defaults = $.jqueryDefaults;
    jquery.methods = $.jqueryMethos;

   
   
    $.fn.jquery = function (plugin)
    {
        if (plugin)
        {
            return jquery.run.call(this, plugin, arguments);
        }
        else
        {
            return jquery.get(this);
        }
    };


   
   
   
    jquery.core.Component = function (options)
    {
       
        this.events = this.events || {};
       
        this.options = options || {};
       
        this.children = {};
    };
    $.extend(jquery.core.Component.prototype, {
        __getType: function ()
        {
            return 'jquery.core.Component';
        },
        __idPrev: function ()
        {
            return 'jqueryui';
        },

       
       
       
        set: function (arg, value)
        {
            if (!arg) return;
            if (typeof arg == 'object')
            {
                var tmp;
                if (this.options != arg)
                {
                    $.extend(this.options, arg);
                    tmp = arg;
                }
                else
                {
                    tmp = $.extend({}, arg);
                }
                if (value == undefined || value == true)
                {
                    for (var p in tmp)
                    {
                        if (p.indexOf('on') == 0)
                            this.set(p, tmp[p]);
                    }
                }
                if (value == undefined || value == false)
                {
                    for (var p in tmp)
                    {
                        if (p.indexOf('on') != 0)
                            this.set(p, tmp[p]);
                    }
                }
                return;
            }
            var name = arg;
           
            if (name.indexOf('on') == 0)
            {
                if (typeof value == 'function')
                    this.bind(name.substr(2), value);
                return;
            }
            if (!this.options) this.options = {};
            if (this.trigger('propertychange', [arg, value]) == false) return;
            this.options[name] = value;
            var pn = '_set' + name.substr(0, 1).toUpperCase() + name.substr(1);
            if (this[pn])
            {
                this[pn].call(this, value);
            }
            this.trigger('propertychanged', [arg, value]);
        },

       
        get: function (name)
        {
            var pn = '_get' + name.substr(0, 1).toUpperCase() + name.substr(1);
            if (this[pn])
            {
                return this[pn].call(this, name);
            }
            return this.options[name];
        },

        hasBind: function (arg)
        {
            var name = arg.toLowerCase();
            var event = this.events[name];
            if (event && event.length) return true;
            return false;
        },

       
       
        trigger: function (arg, data)
        {
            if (!arg) return;
            var name = arg.toLowerCase();
            var event = this.events[name];
            if (!event) return;
            data = data || [];
            if ((data instanceof Array) == false)
            {
                data = [data];
            }
            for (var i = 0; i < event.length; i++)
            {
                var ev = event[i];
                if (ev.handler.apply(ev.context, data) == false)
                    return false;
            }
        },

       
        bind: function (arg, handler, context)
        {
            if (typeof arg == 'object')
            {
                for (var p in arg)
                {
                    this.bind(p, arg[p]);
                }
                return;
            }
            if (typeof handler != 'function') return false;
            var name = arg.toLowerCase();
            var event = this.events[name] || [];
            context = context || this;
            event.push({ handler: handler, context: context });
            this.events[name] = event;
        },

       
        unbind: function (arg, handler)
        {
            if (!arg)
            {
                this.events = {};
                return;
            }
            var name = arg.toLowerCase();
            var event = this.events[name];
            if (!event || !event.length) return;
            if (!handler)
            {
                delete this.events[name];
            }
            else
            {
                for (var i = 0, l = event.length; i < l; i++)
                {
                    if (event[i].handler == handler)
                    {
                        event.splice(i, 1);
                        break;
                    }
                }
            }
        },
        destroy: function ()
        {
            jquery.remove(this);
        }
    });


   
   
   
   
   
    jquery.core.UIComponent = function (element, options)
    {
        jquery.core.UIComponent.base.constructor.call(this, options);
        var extendMethods = this._extendMethods();
        if (extendMethods) $.extend(this, extendMethods);
        this.element = element;
        this._init();
        this._preRender();
        this.trigger('render');
        this._render();
        this.trigger('rendered');
        this._rendered();
    };
    jquery.core.UIComponent.jqueryExtend(jquery.core.Component, {
        __getType: function ()
        {
            return 'jquery.core.UIComponent';
        },
       
        _extendMethods: function ()
        {

        },
        _init: function ()
        {
            this.type = this.__getType();
            if (!this.element)
            {
                this.id = this.options.id || jquery.getId(this.__idPrev());
            }
            else
            {
                this.id = this.options.id || this.element.id || jquery.getId(this.__idPrev());
            }
           
            jquery.add(this);

            if (!this.element) return;

           
            var attributes = this.attr();
            if (attributes && attributes instanceof Array)
            {
                for (var i = 0; i < attributes.length; i++)
                {
                    var name = attributes[i];
                    this.options[name] = $(this.element).attr(name);
                }
            }
           
            var p = this.options;
            if ($(this.element).attr("jqueryui"))
            {
                try
                {
                    var attroptions = $(this.element).attr("jqueryui");
                    if (attroptions.indexOf('{') != 0) attroptions = "{" + attroptions + "}";
                    eval("attroptions = " + attroptions + ";");
                    if (attroptions) $.extend(p, attroptions);
                }
                catch (e) { }
            }
        },
       
        _preRender: function ()
        {

        },
        _render: function ()
        {

        },
        _rendered: function ()
        {
            if (this.element)
            {
                $(this.element).attr("jqueryuiid", this.id);
            }
        },
        _setCls: function (value)
        {
            if (this.element && value)
            {
                $(this.element).addClass(value);
            }
        },
       
        attr: function ()
        {
            return [];
        },
        destroy: function ()
        {
            if (this.element)
            {
                $(this.element).remove();
            }
            this.options = null;
            jquery.remove(this);
        }
    });


   
    jquery.controls.Input = function (element, options)
    {
        jquery.controls.Input.base.constructor.call(this, element, options);
    };

    jquery.controls.Input.jqueryExtend(jquery.core.UIComponent, {
        __getType: function ()
        {
            return 'jquery.controls.Input';
        },
        attr: function ()
        {
            return ['nullText'];
        },
        setValue: function (value)
        {
            return this.set('value', value);
        },
        getValue: function ()
        {
            return this.get('value');
        },
       
        _setReadonly: function (readonly)
        {
            var wrapper = this.wrapper || this.text;
            if (!wrapper || !wrapper.hasClass("l-text")) return;
            var inputText = this.inputText;
            if (readonly)
            {
                if (inputText) inputText.attr("readonly", "readonly");
                wrapper.addClass("l-text-readonly");
            } else
            {
                if (inputText) inputText.removeAttr("readonly");
                wrapper.removeClass("l-text-readonly");
            }
        },
        setReadonly: function (readonly)
        {
            return this.set('readonly', readonly);
        },
        setEnabled: function ()
        {
            return this.set('disabled', false);
        },
        setDisabled: function ()
        {
            return this.set('disabled', true);
        },
        updateStyle: function ()
        {

        },
        resize: function (width, height)
        {
            this.set({ width: width, height: height + 2 });
        }
    });

   
    jquery.win = {
       
        top: false,

       
        mask: function (win)
        {
            function setHeight()
            {
                if (!jquery.win.windowMask) return;
                var h = $(window).height() + $(window).scrollTop();
                jquery.win.windowMask.height(h);
            }
            if (!this.windowMask)
            {
                this.windowMask = $("<div class='l-window-mask' style='display: block;'></div>").appendTo('body');
                $(window).bind('resize.jqueryuiwin', setHeight);
                $(window).bind('scroll', setHeight);
            }
            this.windowMask.show();
            setHeight();
            this.masking = true;
        },

       
        unmask: function (win)
        {
            var jwins = $("body > .l-dialog:visible,body > .l-window:visible");
            for (var i = 0, l = jwins.length; i < l; i++)
            {
                var winid = jwins.eq(i).attr("jqueryuiid");
                if (win && win.id == winid) continue;
               
                var winmanager = jquery.get(winid);
                if (!winmanager) continue;
               
                var modal = winmanager.get('modal');
               
                if (modal) return;
            }
            if (this.windowMask)
                this.windowMask.hide();
            this.masking = false;
        },

       
        createTaskbar: function ()
        {
            if (!this.taskbar)
            {
                this.taskbar = $('<div class="l-taskbar"><div class="l-taskbar-tasks"></div><div class="l-clear"></div></div>').appendTo('body');
                if (this.top) this.taskbar.addClass("l-taskbar-top");
                this.taskbar.tasks = $(".l-taskbar-tasks:first", this.taskbar);
                this.tasks = {};
            }
            this.taskbar.show();
            this.taskbar.animate({ bottom: 0 });
            return this.taskbar;
        },

       
        removeTaskbar: function ()
        {
            var self = this;
            self.taskbar.animate({ bottom: -32 }, function ()
            {
                self.taskbar.remove();
                self.taskbar = null;
            });
        },
        activeTask: function (win)
        {
            for (var winid in this.tasks)
            {
                var t = this.tasks[winid];
                if (winid == win.id)
                {
                    t.addClass("l-taskbar-task-active");
                }
                else
                {
                    t.removeClass("l-taskbar-task-active");
                }
            }
        },

       
        getTask: function (win)
        {
            var self = this;
            if (!self.taskbar) return;
            if (self.tasks[win.id]) return self.tasks[win.id];
            return null;
        },


       
        addTask: function (win)
        {
            var self = this;
            if (!self.taskbar) self.createTaskbar();
            if (self.tasks[win.id]) return self.tasks[win.id];
            var title = win.get('title');
            var task = self.tasks[win.id] = $('<div class="l-taskbar-task"><div class="l-taskbar-task-icon"></div><div class="l-taskbar-task-content">' + title + '</div></div>');
            self.taskbar.tasks.append(task);
            self.activeTask(win);
            task.bind('click', function ()
            {
                self.activeTask(win);
                if (win.actived)
                    win.min();
                else
                    win.active();
            }).hover(function ()
            {
                $(this).addClass("l-taskbar-task-over");
            }, function ()
            {
                $(this).removeClass("l-taskbar-task-over");
            });
            return task;
        },

        hasTask: function ()
        {
            for (var p in this.tasks)
            {
                if (this.tasks[p])
                    return true;
            }
            return false;
        },

       
        removeTask: function (win)
        {
            var self = this;
            if (!self.taskbar) return;
            if (self.tasks[win.id])
            {
                self.tasks[win.id].unbind();
                self.tasks[win.id].remove();
                delete self.tasks[win.id];
            }
            if (!self.hasTask())
            {
                self.removeTaskbar();
            }
        },

       
        setFront: function (win)
        {
            var wins = jquery.find(jquery.core.Win);
            for (var i in wins)
            {
                var w = wins[i];
                if (w == win)
                {
                    $(w.element).css("z-index", "9200");
                    this.activeTask(w);
                }
                else
                {
                    $(w.element).css("z-index", "9100");
                }
            }
        }
    };


   
    jquery.core.Win = function (element, options)
    {
        jquery.core.Win.base.constructor.call(this, element, options);
    };

    jquery.core.Win.jqueryExtend(jquery.core.UIComponent, {
        __getType: function ()
        {
            return 'jquery.controls.Win';
        },
        mask: function ()
        {
            if (this.options.modal)
                jquery.win.mask(this);
        },
        unmask: function ()
        {
            if (this.options.modal)
                jquery.win.unmask(this);
        },
        min: function ()
        {
        },
        max: function ()
        {
        },
        active: function ()
        {
        }
    });


    jquery.draggable = {
        dragging: false
    };

    jquery.resizable = {
        reszing: false
    };


    jquery.toJSON = typeof JSON === 'object' && JSON.stringify ? JSON.stringify : function (o)
    {
        var f = function (n)
        {
            return n < 10 ? '0' + n : n;
        },
		escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
		quote = function (value)
		{
		    escapable.lastIndex = 0;
		    return escapable.test(value) ?
				'"' + value.replace(escapable, function (a)
				{
				    var c = meta[a];
				    return typeof c === 'string' ? c :
						'\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				}) + '"' :
				'"' + value + '"';
		};
        if (o === null) return 'null';
        var type = typeof o;
        if (type === 'undefined') return undefined;
        if (type === 'string') return quote(o);
        if (type === 'number' || type === 'boolean') return '' + o;
        if (type === 'object')
        {
            if (typeof o.toJSON === 'function')
            {
                return jquery.toJSON(o.toJSON());
            }
            if (o.constructor === Date)
            {
                return isFinite(this.valueOf()) ?
                   this.getUTCFullYear() + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate()) + 'T' +
                 f(this.getUTCHours()) + ':' +
                 f(this.getUTCMinutes()) + ':' +
                 f(this.getUTCSeconds()) + 'Z' : null;
            }
            var pairs = [];
            if (o.constructor === Array)
            {
                for (var i = 0, l = o.length; i < l; i++)
                {
                    pairs.push(jquery.toJSON(o[i]) || 'null');
                }
                return '[' + pairs.join(',') + ']';
            }
            var name, val;
            for (var k in o)
            {
                type = typeof k;
                if (type === 'number')
                {
                    name = '"' + k + '"';
                } else if (type === 'string')
                {
                    name = quote(k);
                } else
                {
                    continue;
                }
                type = typeof o[k];
                if (type === 'function' || type === 'undefined')
                {
                    continue;
                }
                val = jquery.toJSON(o[k]);
                pairs.push(name + ':' + val);
            }
            return '{' + pairs.join(',') + '}';
        }
    };

   
    jquery.getEditor = function (e)
    {
        var type = e.type, control = e.control, master = e.master;
        if (!type) return null;
        var inputTag = 0;
        if (control) control = control.substr(0, 1).toUpperCase() + control.substr(1);
        return $.extend({
            create: function (container, editParm, controlOptions)
            {
               
                var field = editParm.field || editParm.column, options = controlOptions || {};
                var isInGrid = editParm.column ? true : false;
                var p = $.extend({}, e.options);
                var inputType = "text";
                if ($.inArray(type, ["password", "file"]) != -1) inputType = type;
                if (e.password) inputType = "password";
                var inputBody = $("<input type='" + inputType + "'/>");
                if (e.body)
                {
                    inputBody = e.body.clone();
                }
                inputBody.appendTo(container);
                if (editParm.field)
                {
                    var txtInputName = field.name;
                    var prefixID = $.isFunction(options.prefixID) ? options.prefixID(master) : (options.prefixID || "");
                    p.id = field.id || (prefixID + field.name);
                    if ($.inArray(type, ["select", "combobox", "autocomplete", "popup"]) != -1)
                    {
                        txtInputName = field.textField || field.comboboxName;
                        if (field.comboboxName && !field.id)
                            p.id = (options.prefixID || "") + field.comboboxName;
                    }
                    if ($.inArray(type, ["select", "combobox", "autocomplete", "popup", "radiolist", "checkboxlist", "listbox"]) != -1)
                    {
                        p.valueFieldID = prefixID + field.name;
                    }
                    if (!e.body)
                    {
                        var inputName = prefixID + txtInputName;
                        var inputId = new Date().getTime() + "_" + ++inputTag;
                        inputBody.attr($.extend({
                            id: inputId,
                            name: inputName
                        }, field.attr));
                        if (field.cssClass)
                        {
                            inputBody.addClass(field.cssClass);
                        }
                        if (field.validate && !master.options.unSetValidateAttr)
                        {
                            inputBody.attr('validate', jquery.toJSON(field.validate));
                        }
                    }
                    $.extend(p, field.options);
                }
                if (field.dictionary)
                {
                    field.editor = field.editor || {};
                    if (!field.editor.data)
                    {
                        var dicEditorData = [], dicItems = field.dictionary.split('|');
                        $(dicItems).each(function (i, dicItem)
                        {
                            var dics = dicItem.split(',');
                            var dicItemId = dics[0], dicItemText = dics.length >= 2 ? dics[1] : dics[0];
                            dicEditorData.push({
                                id: dicItemId,
                                value: dicItemId,
                                text: dicItemText
                            });
                        });
                        field.editor.data = dicEditorData;
                    }
                }
                if (field.editor)
                {
                    $.extend(p, field.editor.options);
                    if (field.editor.valueColumnName) p.valueField = field.editor.valueColumnName;
                    if (field.editor.displayColumnName) p.textField = field.editor.displayColumnName;
                    if (control)
                    {
                        var defaults = jquery.defaults[control];
                        for (var proName in defaults)
                        {
                            if (proName in field.editor)
                            {
                                p[proName] = field.editor[proName];
                            }
                        }
                    }
                   
                    var ext = field.editor.p || field.editor.ext;
                    ext = typeof (ext) == 'function' ? ext(editParm) : ext;
                    $.extend(p, ext);
                }
               
                var lobj = inputBody['jquery' + control](p);
                if (isInGrid)
                {
                    setTimeout(function () { inputBody.focus(); }, 100);
                }
                return lobj;
            },
            getValue: function (editor, editParm)
            {
                var field = editParm.field || editParm.column;
                if (editor.getValue)
                {
                    var value = editor.getValue();
                    if (field && field.editor && field.editor.isArrayValue && value)
                    {
                        value = value.split(';');
                    }
                    return value;
                }
            },
            setValue: function (editor, value, editParm)
            {
                var field = editParm.field || editParm.column;
                if (editor.setValue)
                {
                    if (field && field.editor && field.editor.isArrayValue && value)
                    {
                        value = value.join(';');
                    }
                    editor.setValue(value);
                }
            },
            getText: function (editor, editParm)
            {
                if (editor.getText)
                {
                    return editor.getText();
                }
            },
            setText: function (editor, value, editParm)
            {
                if (editor.setText)
                {
                    editor.setText(value);
                }
            },
            getSelected: function (editor, editParm)
            {
                if (editor.getSelected)
                {
                    return editor.getSelected();
                }
            },
            resize: function (editor, width, height, editParm)
            {
                if (editParm.field) width = width - 2;
                if (editor.resize) editor.resize(width, height);
            },
            setEnabled: function (editor, isEnabled)
            {
                if (isEnabled)
                {
                    if (editor.setEnabled) editor.setEnabled();
                }
                else
                {
                    if (editor.setDisabled) editor.setDisabled();
                }
            },
            destroy: function (editor, editParm)
            {
                if (editor.destroy) editor.destroy();
            }
        }, e);
    }
   
    jquery.editors = {
        "text": {
            control: 'TextBox'
        },
        "date": {
            control: 'DateEditor',
            setValue: function (editor, value, editParm)
            {
               
                if (typeof value == "string" && /^\/Date/.test(value))
                {
                    value = value.replace(/^\//, "new ").replace(/\/$/, "");
                    eval("value = " + value);
                }
                editor.setValue(value);
            }
        },
        "combobox": {
            control: 'ComboBox'
        },
        "spinner": {
            control: 'Spinner'
        },
        "checkbox": {
            control: 'CheckBox'
        },
        "checkboxlist": {
            control: 'CheckBoxList',
            body: $('<div></div>'),
            resize: function (editor, width, height, editParm)
            {
                editor.set('width', width - 2);
            }
        },
        "radiolist": {
            control: 'RadioList',
            body: $('<div></div>'),
            resize: function (editor, width, height, editParm)
            {
                editor.set('width', width - 2);
            }
        },
        "listbox": {
            control: 'ListBox',
            body: $('<div></div>'),
            resize: function (editor, width, height, editParm)
            {
                editor.set('width', width - 2);
            }
        },
        "popup": {
            control: 'PopupEdit'
        },
        "number": {
            control: 'TextBox',
            options: { number: true }
        },
        "currency": {
            control: 'TextBox',
            options: { currency: true }
        },
        "digits": {
            control: 'TextBox',
            options: { digits: true }
        },
        "password": {
            control: 'TextBox',
            password: true
        }
    };
    jquery.editors["string"] = jquery.editors["text"];
    jquery.editors["select"] = jquery.editors["combobox"];
    jquery.editors["int"] = jquery.editors["digits"];
    jquery.editors["float"] = jquery.editors["number"];
    jquery.editors["chk"] = jquery.editors["checkbox"];
    jquery.editors["popupedit"] = jquery.editors["popup"];

   
    $.fn.live = $.fn.on ? $.fn.on : $.fn.live;
    if (!$.browser)
    {
        var userAgent = navigator.userAgent.toLowerCase();
        $.browser = {
            version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [0, '0'])[1],
            safari: /webkit/.test(userAgent),
            opera: /opera/.test(userAgent),
            msie: /msie/.test(userAgent) && !/opera/.test(userAgent),
            mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent)
        };
    }
})(jQuery);