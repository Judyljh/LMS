(function($) {

	Function.prototype.jqueryExtend = function(parent, overrides) {
		if (typeof parent != 'function')
			return this;

		this.base = parent.prototype;
		this.base.constructor = parent;

		var f = function() {
		};
		f.prototype = parent.prototype;
		this.prototype = new f();
		this.prototype.constructor = this;

		if (overrides)
			$.extend(this.prototype, overrides);
	};

	Function.prototype.jqueryDefer = function(o, defer, args) {
		var fn = this;
		return setTimeout(function() {
			fn.apply(o, args || []);
		}, defer);
	};

	window.jquery = $.jqueryui = {
		version : 'V1.2.0',
		managerCount : 0,

		managers : {},
		managerIdPrev : 'jqueryui',

		autoNewId : true,

		error : {
			managerIsExist : 'Manager id duplicated'
		},
		pluginPrev : 'jquery',
		getId : function(prev) {
			prev = prev || this.managerIdPrev;
			var id = prev + (1000 + this.managerCount);
			this.managerCount++;
			return id;
		},
		add : function(manager) {
			if (arguments.length == 2) {
				var m = arguments[1];
				m.id = m.id || m.options.id || arguments[0].id;
				this.addManager(m);
				return;
			}
			if (!manager.id)
				manager.id = this.getId(manager.__idPrev());

			this.managers[manager.id] = manager;
		},
		remove : function(arg) {
			if (typeof arg == "string" || typeof arg == "number") {
				delete jquery.managers[arg];
			} else if (typeof arg == "object") {
				if (arg instanceof jquery.core.Component) {
					delete jquery.managers[arg.id];
				} else {
					if (!$(arg).attr(this.idAttrName))
						return false;
					delete jquery.managers[$(arg).attr(this.idAttrName)];
				}
			}
		},

		get : function(arg, idAttrName) {
			idAttrName = idAttrName || "jqueryuiid";
			if (typeof arg == "string" || typeof arg == "number") {
				return jquery.managers[arg];
			} else if (typeof arg == "object") {
				var domObj = arg.length ? arg[0] : arg;
				var id = domObj[idAttrName] || $(domObj).attr(idAttrName);
				if (!id)
					return null;
				return jquery.managers[id];
			}
			return null;
		},

		find : function(type) {
			var arr = [];
			for ( var id in this.managers) {
				var manager = this.managers[id];
				if (type instanceof Function) {
					if (manager instanceof type) {
						arr.push(manager);
					}
				} else if (type instanceof Array) {
					if ($.inArray(manager.__getType(), type) != -1) {
						arr.push(manager);
					}
				} else {
					if (manager.__getType() == type) {
						arr.push(manager);
					}
				}
			}
			return arr;
		},

		run : function(plugin, args, ext) {
			if (!plugin)
				return;
			ext = $.extend({
				defaultsNamespace : 'jqueryDefaults',
				methodsNamespace : 'jqueryMethods',
				controlNamespace : 'controls',
				idAttrName : 'jqueryuiid',
				isStatic : false,
				hasElement : true,
				propertyToElemnt : null
			}, ext || {});
			plugin = plugin.replace(/^jqueryGet/, '');
			plugin = plugin.replace(/^jquery/, '');
			if (this == null || this == window || ext.isStatic) {
				if (!jquery.plugins[plugin]) {
					jquery.plugins[plugin] = {
						fn : $[jquery.pluginPrev + plugin],
						isStatic : true
					};
				}
				return new $.jqueryui[ext.controlNamespace][plugin]($.extend(
						{}, $[ext.defaultsNamespace][plugin] || {},
						$[ext.defaultsNamespace][plugin + 'String'] || {},
						args.length > 0 ? args[0] : {}));
			}
			if (!jquery.plugins[plugin]) {
				jquery.plugins[plugin] = {
					fn : $.fn[jquery.pluginPrev + plugin],
					isStatic : false
				};
			}
			if (/Manager$/.test(plugin))
				return jquery.get(this, ext.idAttrName);
			this.each(function() {
				if (this[ext.idAttrName] || $(this).attr(ext.idAttrName)) {
					var manager = jquery.get(this[ext.idAttrName]
							|| $(this).attr(ext.idAttrName));
					if (manager && args.length > 0)
						manager.set(args[0]);

					return;
				}
				if (args.length >= 1 && typeof args[0] == 'string')
					return;

				var options = args.length > 0 ? args[0] : null;
				var p = $.extend({}, $[ext.defaultsNamespace][plugin],
						$[ext.defaultsNamespace][plugin + 'String'], options);
				if (ext.propertyToElemnt)
					p[ext.propertyToElemnt] = this;
				if (ext.hasElement) {
					new $.jqueryui[ext.controlNamespace][plugin](this, p);
				} else {
					new $.jqueryui[ext.controlNamespace][plugin](p);
				}
			});
			if (this.length == 0)
				return null;
			if (args.length == 0)
				return jquery.get(this, ext.idAttrName);
			if (typeof args[0] == 'object')
				return jquery.get(this, ext.idAttrName);
			if (typeof args[0] == 'string') {
				var manager = jquery.get(this, ext.idAttrName);
				if (manager == null)
					return;
				if (args[0] == "option") {
					if (args.length == 2)
						return manager.get(args[1]);
					else if (args.length >= 3)
						return manager.set(args[1], args[2]);
				} else {
					var method = args[0];
					if (!manager[method])
						return;
					var parms = Array.apply(null, args);
					parms.shift();
					return manager[method].apply(manager, parms);
				}
			}
			return null;
		},

		defaults : {},

		methods : {},

		core : {},

		controls : {},

		plugins : {}
	};

	$.jqueryDefaults = {};

	$.jqueryMethos = {};

	jquery.defaults = $.jqueryDefaults;
	jquery.methods = $.jqueryMethos;

	$.fn.jquery = function(plugin) {
		if (plugin) {
			return jquery.run.call(this, plugin, arguments);
		} else {
			return jquery.get(this);
		}
	};

	jquery.core.Component = function(options) {

		this.events = this.events || {};

		this.options = options || {};

		this.children = {};
	};
	$.extend(jquery.core.Component.prototype, {
		__getType : function() {
			return 'jquery.core.Component';
		},
		__idPrev : function() {
			return 'jqueryui';
		},

		set : function(arg, value) {
			if (!arg)
				return;
			if (typeof arg == 'object') {
				var tmp;
				if (this.options != arg) {
					$.extend(this.options, arg);
					tmp = arg;
				} else {
					tmp = $.extend({}, arg);
				}
				if (value == undefined || value == true) {
					for ( var p in tmp) {
						if (p.indexOf('on') == 0)
							this.set(p, tmp[p]);
					}
				}
				if (value == undefined || value == false) {
					for ( var p in tmp) {
						if (p.indexOf('on') != 0)
							this.set(p, tmp[p]);
					}
				}
				return;
			}
			var name = arg;

			if (name.indexOf('on') == 0) {
				if (typeof value == 'function')
					this.bind(name.substr(2), value);
				return;
			}
			if (!this.options)
				this.options = {};
			if (this.trigger('propertychange', [ arg, value ]) == false)
				return;
			this.options[name] = value;
			var pn = '_set' + name.substr(0, 1).toUpperCase() + name.substr(1);
			if (this[pn]) {
				this[pn].call(this, value);
			}
			this.trigger('propertychanged', [ arg, value ]);
		},

		get : function(name) {
			var pn = '_get' + name.substr(0, 1).toUpperCase() + name.substr(1);
			if (this[pn]) {
				return this[pn].call(this, name);
			}
			return this.options[name];
		},

		hasBind : function(arg) {
			var name = arg.toLowerCase();
			var event = this.events[name];
			if (event && event.length)
				return true;
			return false;
		},

		trigger : function(arg, data) {
			if (!arg)
				return;
			var name = arg.toLowerCase();
			var event = this.events[name];
			if (!event)
				return;
			data = data || [];
			if ((data instanceof Array) == false) {
				data = [ data ];
			}
			for (var i = 0; i < event.length; i++) {
				var ev = event[i];
				if (ev.handler.apply(ev.context, data) == false)
					return false;
			}
		},

		bind : function(arg, handler, context) {
			if (typeof arg == 'object') {
				for ( var p in arg) {
					this.bind(p, arg[p]);
				}
				return;
			}
			if (typeof handler != 'function')
				return false;
			var name = arg.toLowerCase();
			var event = this.events[name] || [];
			context = context || this;
			event.push({
				handler : handler,
				context : context
			});
			this.events[name] = event;
		},

		unbind : function(arg, handler) {
			if (!arg) {
				this.events = {};
				return;
			}
			var name = arg.toLowerCase();
			var event = this.events[name];
			if (!event || !event.length)
				return;
			if (!handler) {
				delete this.events[name];
			} else {
				for (var i = 0, l = event.length; i < l; i++) {
					if (event[i].handler == handler) {
						event.splice(i, 1);
						break;
					}
				}
			}
		},
		destroy : function() {
			jquery.remove(this);
		}
	});

	jquery.core.UIComponent = function(element, options) {
		jquery.core.UIComponent.base.constructor.call(this, options);
		var extendMethods = this._extendMethods();
		if (extendMethods)
			$.extend(this, extendMethods);
		this.element = element;
		this._init();
		this._preRender();
		this.trigger('render');
		this._render();
		this.trigger('rendered');
		this._rendered();
	};
	jquery.core.UIComponent.jqueryExtend(jquery.core.Component, {
		__getType : function() {
			return 'jquery.core.UIComponent';
		},

		_extendMethods : function() {

		},
		_init : function() {
			this.type = this.__getType();
			if (!this.element) {
				this.id = this.options.id || jquery.getId(this.__idPrev());
			} else {
				this.id = this.options.id || this.element.id
						|| jquery.getId(this.__idPrev());
			}

			jquery.add(this);

			if (!this.element)
				return;

			var attributes = this.attr();
			if (attributes && attributes instanceof Array) {
				for (var i = 0; i < attributes.length; i++) {
					var name = attributes[i];
					this.options[name] = $(this.element).attr(name);
				}
			}

			var p = this.options;
			if ($(this.element).attr("jqueryui")) {
				try {
					var attroptions = $(this.element).attr("jqueryui");
					if (attroptions.indexOf('{') != 0)
						attroptions = "{" + attroptions + "}";
					eval("attroptions = " + attroptions + ";");
					if (attroptions)
						$.extend(p, attroptions);
				} catch (e) {
				}
			}
		},

		_preRender : function() {

		},
		_render : function() {

		},
		_rendered : function() {
			if (this.element) {
				$(this.element).attr("jqueryuiid", this.id);
			}
		},
		_setCls : function(value) {
			if (this.element && value) {
				$(this.element).addClass(value);
			}
		},

		attr : function() {
			return [];
		},
		destroy : function() {
			if (this.element) {
				$(this.element).remove();
			}
			this.options = null;
			jquery.remove(this);
		}
	});

	jquery.controls.Input = function(element, options) {
		jquery.controls.Input.base.constructor.call(this, element, options);
	};

	jquery.controls.Input.jqueryExtend(jquery.core.UIComponent, {
		__getType : function() {
			return 'jquery.controls.Input';
		},
		attr : function() {
			return [ 'nullText' ];
		},
		setValue : function(value) {
			return this.set('value', value);
		},
		getValue : function() {
			return this.get('value');
		},

		_setReadonly : function(readonly) {
			var wrapper = this.wrapper || this.text;
			if (!wrapper || !wrapper.hasClass("l-text"))
				return;
			var inputText = this.inputText;
			if (readonly) {
				if (inputText)
					inputText.attr("readonly", "readonly");
				wrapper.addClass("l-text-readonly");
			} else {
				if (inputText)
					inputText.removeAttr("readonly");
				wrapper.removeClass("l-text-readonly");
			}
		},
		setReadonly : function(readonly) {
			return this.set('readonly', readonly);
		},
		setEnabled : function() {
			return this.set('disabled', false);
		},
		setDisabled : function() {
			return this.set('disabled', true);
		},
		updateStyle : function() {

		},
		resize : function(width, height) {
			this.set({
				width : width,
				height : height + 2
			});
		}
	});

	jquery.win = {

		top : false,

		mask : function(win) {
			function setHeight() {
				if (!jquery.win.windowMask)
					return;
				var h = $(window).height() + $(window).scrollTop();
				jquery.win.windowMask.height(h);
			}
			if (!this.windowMask) {
				this.windowMask = $(
						"<div class='l-window-mask' style='display: block;'></div>")
						.appendTo('body');
				$(window).bind('resize.jqueryuiwin', setHeight);
				$(window).bind('scroll', setHeight);
			}
			this.windowMask.show();
			setHeight();
			this.masking = true;
		},

		unmask : function(win) {
			var jwins = $("body > .l-dialog:visible,body > .l-window:visible");
			for (var i = 0, l = jwins.length; i < l; i++) {
				var winid = jwins.eq(i).attr("jqueryuiid");
				if (win && win.id == winid)
					continue;

				var winmanager = jquery.get(winid);
				if (!winmanager)
					continue;

				var modal = winmanager.get('modal');

				if (modal)
					return;
			}
			if (this.windowMask)
				this.windowMask.hide();
			this.masking = false;
		},

		createTaskbar : function() {
			if (!this.taskbar) {
				this.taskbar = $(
						'<div class="l-taskbar"><div class="l-taskbar-tasks"></div><div class="l-clear"></div></div>')
						.appendTo('body');
				if (this.top)
					this.taskbar.addClass("l-taskbar-top");
				this.taskbar.tasks = $(".l-taskbar-tasks:first", this.taskbar);
				this.tasks = {};
			}
			this.taskbar.show();
			this.taskbar.animate({
				bottom : 0
			});
			return this.taskbar;
		},

		removeTaskbar : function() {
			var self = this;
			self.taskbar.animate({
				bottom : -32
			}, function() {
				self.taskbar.remove();
				self.taskbar = null;
			});
		},
		activeTask : function(win) {
			for ( var winid in this.tasks) {
				var t = this.tasks[winid];
				if (winid == win.id) {
					t.addClass("l-taskbar-task-active");
				} else {
					t.removeClass("l-taskbar-task-active");
				}
			}
		},

		getTask : function(win) {
			var self = this;
			if (!self.taskbar)
				return;
			if (self.tasks[win.id])
				return self.tasks[win.id];
			return null;
		},

		addTask : function(win) {
			var self = this;
			if (!self.taskbar)
				self.createTaskbar();
			if (self.tasks[win.id])
				return self.tasks[win.id];
			var title = win.get('title');
			var task = self.tasks[win.id] = $('<div class="l-taskbar-task"><div class="l-taskbar-task-icon"></div><div class="l-taskbar-task-content">'
					+ title + '</div></div>');
			self.taskbar.tasks.append(task);
			self.activeTask(win);
			task.bind('click', function() {
				self.activeTask(win);
				if (win.actived)
					win.min();
				else
					win.active();
			}).hover(function() {
				$(this).addClass("l-taskbar-task-over");
			}, function() {
				$(this).removeClass("l-taskbar-task-over");
			});
			return task;
		},

		hasTask : function() {
			for ( var p in this.tasks) {
				if (this.tasks[p])
					return true;
			}
			return false;
		},

		removeTask : function(win) {
			var self = this;
			if (!self.taskbar)
				return;
			if (self.tasks[win.id]) {
				self.tasks[win.id].unbind();
				self.tasks[win.id].remove();
				delete self.tasks[win.id];
			}
			if (!self.hasTask()) {
				self.removeTaskbar();
			}
		},

		setFront : function(win) {
			var wins = jquery.find(jquery.core.Win);
			for ( var i in wins) {
				var w = wins[i];
				if (w == win) {
					$(w.element).css("z-index", "9200");
					this.activeTask(w);
				} else {
					$(w.element).css("z-index", "9100");
				}
			}
		}
	};

	jquery.core.Win = function(element, options) {
		jquery.core.Win.base.constructor.call(this, element, options);
	};

	jquery.core.Win.jqueryExtend(jquery.core.UIComponent, {
		__getType : function() {
			return 'jquery.controls.Win';
		},
		mask : function() {
			if (this.options.modal)
				jquery.win.mask(this);
		},
		unmask : function() {
			if (this.options.modal)
				jquery.win.unmask(this);
		},
		min : function() {
		},
		max : function() {
		},
		active : function() {
		}
	});

	jquery.draggable = {
		dragging : false
	};

	jquery.resizable = {
		reszing : false
	};

	jquery.toJSON = typeof JSON === 'object' && JSON.stringify ? JSON.stringify
			: function(o) {
				var f = function(n) {
					return n < 10 ? '0' + n : n;
				}, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, quote = function(
						value) {
					escapable.lastIndex = 0;
					return escapable.test(value) ? '"'
							+ value.replace(escapable, function(a) {
								var c = meta[a];
								return typeof c === 'string' ? c : '\\u'
										+ ('0000' + a.charCodeAt(0)
												.toString(16)).slice(-4);
							}) + '"' : '"' + value + '"';
				};
				if (o === null)
					return 'null';
				var type = typeof o;
				if (type === 'undefined')
					return undefined;
				if (type === 'string')
					return quote(o);
				if (type === 'number' || type === 'boolean')
					return '' + o;
				if (type === 'object') {
					if (typeof o.toJSON === 'function') {
						return jquery.toJSON(o.toJSON());
					}
					if (o.constructor === Date) {
						return isFinite(this.valueOf()) ? this.getUTCFullYear()
								+ '-' + f(this.getUTCMonth() + 1) + '-'
								+ f(this.getUTCDate()) + 'T'
								+ f(this.getUTCHours()) + ':'
								+ f(this.getUTCMinutes()) + ':'
								+ f(this.getUTCSeconds()) + 'Z' : null;
					}
					var pairs = [];
					if (o.constructor === Array) {
						for (var i = 0, l = o.length; i < l; i++) {
							pairs.push(jquery.toJSON(o[i]) || 'null');
						}
						return '[' + pairs.join(',') + ']';
					}
					var name, val;
					for ( var k in o) {
						type = typeof k;
						if (type === 'number') {
							name = '"' + k + '"';
						} else if (type === 'string') {
							name = quote(k);
						} else {
							continue;
						}
						type = typeof o[k];
						if (type === 'function' || type === 'undefined') {
							continue;
						}
						val = jquery.toJSON(o[k]);
						pairs.push(name + ':' + val);
					}
					return '{' + pairs.join(',') + '}';
				}
			};

	jquery.getEditor = function(e) {
		var type = e.type, control = e.control, master = e.master;
		if (!type)
			return null;
		var inputTag = 0;
		if (control)
			control = control.substr(0, 1).toUpperCase() + control.substr(1);
		return $
				.extend(
						{
							create : function(container, editParm,
									controlOptions) {

								var field = editParm.field || editParm.column, options = controlOptions
										|| {};
								var isInGrid = editParm.column ? true : false;
								var p = $.extend({}, e.options);
								var inputType = "text";
								if ($.inArray(type, [ "password", "file" ]) != -1)
									inputType = type;
								if (e.password)
									inputType = "password";
								var inputBody = $("<input type='" + inputType
										+ "'/>");
								if (e.body) {
									inputBody = e.body.clone();
								}
								inputBody.appendTo(container);
								if (editParm.field) {
									var txtInputName = field.name;
									var prefixID = $
											.isFunction(options.prefixID) ? options
											.prefixID(master)
											: (options.prefixID || "");
									p.id = field.id || (prefixID + field.name);
									if ($.inArray(type, [ "select", "combobox",
											"autocomplete", "popup" ]) != -1) {
										txtInputName = field.textField
												|| field.comboboxName;
										if (field.comboboxName && !field.id)
											p.id = (options.prefixID || "")
													+ field.comboboxName;
									}
									if ($.inArray(type, [ "select", "combobox",
											"autocomplete", "popup",
											"radiolist", "checkboxlist",
											"listbox" ]) != -1) {
										p.valueFieldID = prefixID + field.name;
									}
									if (!e.body) {
										var inputName = prefixID + txtInputName;
										var inputId = new Date().getTime()
												+ "_" + ++inputTag;
										inputBody.attr($.extend({
											id : inputId,
											name : inputName
										}, field.attr));
										if (field.cssClass) {
											inputBody.addClass(field.cssClass);
										}
										if (field.validate
												&& !master.options.unSetValidateAttr) {
											inputBody.attr('validate', jquery
													.toJSON(field.validate));
										}
									}
									$.extend(p, field.options);
								}
								if (field.dictionary) {
									field.editor = field.editor || {};
									if (!field.editor.data) {
										var dicEditorData = [], dicItems = field.dictionary
												.split('|');
										$(dicItems)
												.each(
														function(i, dicItem) {
															var dics = dicItem
																	.split(',');
															var dicItemId = dics[0], dicItemText = dics.length >= 2 ? dics[1]
																	: dics[0];
															dicEditorData
																	.push({
																		id : dicItemId,
																		value : dicItemId,
																		text : dicItemText
																	});
														});
										field.editor.data = dicEditorData;
									}
								}
								if (field.editor) {
									$.extend(p, field.editor.options);
									if (field.editor.valueColumnName)
										p.valueField = field.editor.valueColumnName;
									if (field.editor.displayColumnName)
										p.textField = field.editor.displayColumnName;
									if (control) {
										var defaults = jquery.defaults[control];
										for ( var proName in defaults) {
											if (proName in field.editor) {
												p[proName] = field.editor[proName];
											}
										}
									}

									var ext = field.editor.p
											|| field.editor.ext;
									ext = typeof (ext) == 'function' ? ext(editParm)
											: ext;
									$.extend(p, ext);
								}

								var lobj = inputBody['jquery' + control](p);
								if (isInGrid) {
									setTimeout(function() {
										inputBody.focus();
									}, 100);
								}
								return lobj;
							},
							getValue : function(editor, editParm) {
								var field = editParm.field || editParm.column;
								if (editor.getValue) {
									var value = editor.getValue();
									if (field && field.editor
											&& field.editor.isArrayValue
											&& value) {
										value = value.split(';');
									}
									return value;
								}
							},
							setValue : function(editor, value, editParm) {
								var field = editParm.field || editParm.column;
								if (editor.setValue) {
									if (field && field.editor
											&& field.editor.isArrayValue
											&& value) {
										value = value.join(';');
									}
									editor.setValue(value);
								}
							},
							getText : function(editor, editParm) {
								if (editor.getText) {
									return editor.getText();
								}
							},
							setText : function(editor, value, editParm) {
								if (editor.setText) {
									editor.setText(value);
								}
							},
							getSelected : function(editor, editParm) {
								if (editor.getSelected) {
									return editor.getSelected();
								}
							},
							resize : function(editor, width, height, editParm) {
								if (editParm.field)
									width = width - 2;
								if (editor.resize)
									editor.resize(width, height);
							},
							setEnabled : function(editor, isEnabled) {
								if (isEnabled) {
									if (editor.setEnabled)
										editor.setEnabled();
								} else {
									if (editor.setDisabled)
										editor.setDisabled();
								}
							},
							destroy : function(editor, editParm) {
								if (editor.destroy)
									editor.destroy();
							}
						}, e);
	}

	jquery.editors = {
		"text" : {
			control : 'TextBox'
		},
		"date" : {
			control : 'DateEditor',
			setValue : function(editor, value, editParm) {

				if (typeof value == "string" && /^\/Date/.test(value)) {
					value = value.replace(/^\//, "new ").replace(/\/$/, "");
					eval("value = " + value);
				}
				editor.setValue(value);
			}
		},
		"combobox" : {
			control : 'ComboBox'
		},
		"spinner" : {
			control : 'Spinner'
		},
		"checkbox" : {
			control : 'CheckBox'
		},
		"checkboxlist" : {
			control : 'CheckBoxList',
			body : $('<div></div>'),
			resize : function(editor, width, height, editParm) {
				editor.set('width', width - 2);
			}
		},
		"radiolist" : {
			control : 'RadioList',
			body : $('<div></div>'),
			resize : function(editor, width, height, editParm) {
				editor.set('width', width - 2);
			}
		},
		"listbox" : {
			control : 'ListBox',
			body : $('<div></div>'),
			resize : function(editor, width, height, editParm) {
				editor.set('width', width - 2);
				editor.set('height', height - 2);
			}
		},
		"popup" : {
			control : 'PopupEdit'
		},
		"number" : {
			control : 'TextBox',
			options : {
				number : true
			}
		},
		"currency" : {
			control : 'TextBox',
			options : {
				currency : true
			}
		},
		"digits" : {
			control : 'TextBox',
			options : {
				digits : true
			}
		},
		"password" : {
			control : 'TextBox',
			password : true
		}
	};
	jquery.editors["string"] = jquery.editors["text"];
	jquery.editors["select"] = jquery.editors["combobox"];
	jquery.editors["int"] = jquery.editors["digits"];
	jquery.editors["float"] = jquery.editors["number"];
	jquery.editors["chk"] = jquery.editors["checkbox"];
	jquery.editors["popupedit"] = jquery.editors["popup"];

	$.fn.live = $.fn.on ? $.fn.on : $.fn.live;
	if (!$.browser) {
		var userAgent = navigator.userAgent.toLowerCase();
		$.browser = {
			version : (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [
					0, '0' ])[1],
			safari : /webkit/.test(userAgent),
			opera : /opera/.test(userAgent),
			msie : /msie/.test(userAgent) && !/opera/.test(userAgent),
			mozilla : /mozilla/.test(userAgent)
					&& !/(compatible|webkit)/.test(userAgent)
		};
	}
})(jQuery);
(function($) {

	jquery.inject = {

		prev : 'jquery-',

		defaults : {
			Grid_detail : {
				height : null,
				onShowDetail : null
			},
			Grid_editor : 'ComboBox,DateEditor,Spinner,TextBox,PopupEdit,CheckBoxList,RadioList,Grid_editor',
			Grid_popup : 'PopupEdit',
			Grid_grid : 'Grid',
			Grid_condition : 'Form',
			Grid_toolbar : 'Toolbar',
			Grid_fields : 'Form_fields',
			Form_editor : 'ComboBox,DateEditor,Spinner,TextBox,PopupEdit,CheckBoxList,RadioList,Form_editor',
			Form_grid : 'Grid',
			Form_columns : 'Grid_columns',
			Form_condition : 'Form',
			Form_popup : 'PopupEdit',
			Form_buttons : 'Button',
			Portal_panel : 'Panel'
		},

		config : {
			Grid : {

				dynamics : 'data,isChecked,detail,rowDraggingRender,toolbar,columns',

				arrays : 'columns',

				columns : {
					dynamics : 'render,totalSummary,headerRender,columns,editor,columns',
					arrays : 'columns',
					textProperty : 'display',
					columns : 'jquery.inject.config.Grid.columns',
					editor : {
						dynamics : 'data,columns,render,renderItem,grid,condition,ext',
						grid : 'jquery.inject.config.Grid',
						condition : 'jquery.inject.config.Form'
					}
				},
				toolbar : {
					arrays : 'items'
				}
			},
			Form : {
				dynamics : 'validate,fields,buttons',
				arrays : 'fields,buttons',
				fields : {
					textProperty : 'label',
					dynamics : 'validate,editor',
					editor : {
						dynamics : 'data,columns,render,renderItem,grid,condition,attr',
						grid : 'jquery.inject.config.Grid',
						condition : 'jquery.inject.config.Form'
					}
				},
				buttons : 'jquery.inject.config.Button'
			},
			PopupEdit : {
				dynamics : 'grid,condition'
			},
			Button : {
				textProperty : 'text',
				dynamics : 'click'
			},
			ComboBox : {
				dynamics : 'columns,data,tree,grid,condition,render,parms,renderItem'
			},
			ListBox : {
				dynamics : 'columns,data,render,parms'
			},
			RadioList : {
				dynamics : 'data,parms'
			},
			CheckBoxList : {
				dynamics : 'data,parms'
			},
			Panel : {},
			Portal : {

				dynamics : 'rows,columns',

				arrays : 'rows,columns',

				columns : {
					dynamics : 'panels',
					arrays : 'panels'
				},

				rows : {
					dynamics : 'panels',
					arrays : 'panels'
				},
				toolbar : {
					arrays : 'items'
				}
			}
		},

		parse : function(code) {
			try {
				if (code == null)
					return null;
				return new Function("return " + code + ";")();
			} catch (e) {
				return null;
			}
		},

		parseDefault : function(value) {
			var g = this;
			if (!value)
				return value;
			var result = {};
			$(value.split(',')).each(function(index, name) {
				if (!name)
					return;
				name = name.substr(0, 1).toUpperCase() + name.substr(1);
				$.extend(result, g.parse("jquery.defaults." + name));
			});
			return result;
		},

		fotmatValue : function(value, type) {
			if (type == "boolean")
				return value == "true" || value == "1";
			if (type == "number" && value)
				return parseFloat(value.toString());
			return value;
		},

		getOptions : function(e) {
			var jelement = e.jelement, defaults = e.defaults, config = e.config;
			config = $.extend({
				ignores : "",
				dynamics : "",
				arrays : ""
			}, config);
			var g = this, options = {}, value;
			if (config.textProperty)
				options[config.textProperty] = jelement.text();
			for ( var proName in defaults) {
				var className = proName.toLowerCase();
				var subElement = $("> ." + className, jelement);

				if ($.inArray(proName, config.ignores.split(',')) != -1)
					continue;

				if (subElement.length) {
					var defaultName = e.controlName + "_" + proName;
					var subDefaults = g.defaults[defaultName]
							|| jquery.defaults[defaultName], subConfig = config[proName];
					if (typeof (subDefaults) == "string")
						subDefaults = g.parseDefault(subDefaults);
					else if (typeof (subDefaults) == "funcion")
						subDefaults = subDefaults();
					if (typeof (subConfig) == "string")
						subConfig = g.parse(subConfig);
					else if (typeof (subConfig) == "funcion")
						subConfig = subConfig();
					if (subDefaults) {
						if ($.inArray(proName, config.arrays.split(',')) != -1) {
							value = [];
							$(">div,>li,>input", subElement).each(function() {
								value.push(g.getOptions({
									defaults : subDefaults,
									controlName : e.controlName,
									config : subConfig,
									jelement : $(this)
								}));
							});
							options[proName] = value;
						} else {
							options[proName] = g.getOptions({
								defaults : subDefaults,
								controlName : e.controlName,
								config : subConfig,
								jelement : subElement
							});
						}
					}
					subElement.remove();
				}

				else if ($.inArray(proName, config.dynamics.split(',')) != -1
						|| proName.indexOf('on') == 0) {
					value = g.parse(jelement.attr("data-" + proName)
							|| jelement.attr(proName));
					if (value) {
						options[proName] = g.fotmatValue(value,
								typeof (defaults[proName]));
					}
				}

				else {
					value = jelement.attr("data-" + proName)
							|| jelement.attr(proName);
					if (value) {
						options[proName] = g.fotmatValue(value,
								typeof (defaults[proName]));
					}
				}
			}
			var dataOptions = jelement.attr("data-options")
					|| jelement.attr("data-property");
			if (dataOptions)
				dataOptions = g.parse("{" + dataOptions + "}");
			if (dataOptions)
				$.extend(options, dataOptions);
			return options;
		},

		init : function() {
			var g = this, configs = this.config;
			for ( var name in g.defaults) {
				if (typeof (g.defaults[name]) == "string") {
					g.defaults[name] = g.parseDefault(g.defaults[name]);
				}
			}
			for ( var controlName in jquery.controls) {
				var config = configs[controlName] || {};
				var className = g.prev + controlName.toLowerCase();
				$("." + className).each(function() {
					var jelement = $(this), value;
					var defaults = $.extend({
						onrender : null,
						onrendered : null
					}, jquery.defaults[controlName]);
					var options = g.getOptions({
						defaults : defaults,
						controlName : controlName,
						config : config,
						jelement : jelement
					});
					jelement[jquery.pluginPrev + controlName](options);
				});
			}
		}

	}

	$(function() {
		jquery.inject.init();
	});

})(jQuery);

		(function($) {
			$.fn.jqueryAccordion = function(options) {
				return $.jqueryui.run.call(this, "jqueryAccordion", arguments);
			};

			$.fn.jqueryGetAccordionManager = function() {
				return $.jqueryui.get(this);
			};

			$.jqueryDefaults.Accordion = {
				height : null,
				speed : "normal",
				changeHeightOnResize : false,
				heightDiff : 0
			};
			$.jqueryMethos.Accordion = {};

			$.jqueryui.controls.Accordion = function(element, options) {
				$.jqueryui.controls.Accordion.base.constructor.call(this,
						element, options);
			};
			$.jqueryui.controls.Accordion
					.jqueryExtend(
							$.jqueryui.core.UIComponent,
							{
								__getType : function() {
									return 'Accordion';
								},
								__idPrev : function() {
									return 'Accordion';
								},
								_extendMethods : function() {
									return $.jqueryMethos.Accordion;
								},
								_render : function() {
									var g = this, p = this.options;
									g.accordion = $(g.element);
									if (!g.accordion
											.hasClass("l-accordion-panel"))
										g.accordion
												.addClass("l-accordion-panel");
									var selectedIndex = 0;
									if ($("> div[lselected=true]", g.accordion).length > 0)
										selectedIndex = $("> div", g.accordion)
												.index(
														$(
																"> div[lselected=true]",
																g.accordion));

									$("> div", g.accordion)
											.each(
													function(i, box) {
														var header = $('<div class="l-accordion-header"><div class="l-accordion-toggle"></div><div class="l-accordion-header-inner"></div></div>');
														if (i == selectedIndex)
															$(
																	".l-accordion-toggle",
																	header)
																	.addClass(
																			"l-accordion-toggle-open");
														if ($(box)
																.attr("title")) {
															$(
																	".l-accordion-header-inner",
																	header)
																	.html(
																			$(
																					box)
																					.attr(
																							"title"));
															$(box)
																	.attr(
																			"title",
																			"");
														}
														$(box).before(header);
														if (!$(box)
																.hasClass(
																		"l-accordion-content"))
															$(box)
																	.addClass(
																			"l-accordion-content");
													});
									$(".l-accordion-header", g.accordion)
											.removeClass(
													"l-accordion-header-downfirst");
									$(".l-accordion-content:visible",
											g.accordion)
											.next(".l-accordion-header:first")
											.addClass(
													"l-accordion-header-downfirst");

									$(".l-accordion-toggle", g.accordion)
											.each(
													function() {
														if (!$(this)
																.hasClass(
																		"l-accordion-toggle-open")
																&& !$(this)
																		.hasClass(
																				"l-accordion-toggle-close")) {
															$(this)
																	.addClass(
																			"l-accordion-toggle-close");
														}
														if ($(this)
																.hasClass(
																		"l-accordion-toggle-close")) {
															$(this)
																	.parent()
																	.next(
																			".l-accordion-content:visible")
																	.hide();
														}
													});
									$(".l-accordion-header", g.accordion)
											.hover(
													function() {
														$(this)
																.addClass(
																		"l-accordion-header-over");
													},
													function() {
														$(this)
																.removeClass(
																		"l-accordion-header-over");
													});
									$(".l-accordion-toggle", g.accordion)
											.hover(
													function() {
														if ($(this)
																.hasClass(
																		"l-accordion-toggle-open"))
															$(this)
																	.addClass(
																			"l-accordion-toggle-open-over");
														else if ($(this)
																.hasClass(
																		"l-accordion-toggle-close"))
															$(this)
																	.addClass(
																			"l-accordion-toggle-close-over");
													},
													function() {
														if ($(this)
																.hasClass(
																		"l-accordion-toggle-open"))
															$(this)
																	.removeClass(
																			"l-accordion-toggle-open-over");
														else if ($(this)
																.hasClass(
																		"l-accordion-toggle-close"))
															$(this)
																	.removeClass(
																			"l-accordion-toggle-close-over");
													});
									$(">.l-accordion-header", g.accordion)
											.click(
													function() {
														var togglebtn = $(
																".l-accordion-toggle:first",
																this);
														if (togglebtn
																.hasClass("l-accordion-toggle-close")) {
															togglebtn
																	.removeClass(
																			"l-accordion-toggle-close")
																	.removeClass(
																			"l-accordion-toggle-close-over l-accordion-toggle-open-over")
															togglebtn
																	.addClass("l-accordion-toggle-open");
															$(this)
																	.next(
																			".l-accordion-content")
																	.show(
																			p.speed)
																	.siblings(
																			".l-accordion-content:visible")
																	.hide(
																			p.speed);
															$(this)
																	.siblings(
																			".l-accordion-header")
																	.find(
																			".l-accordion-toggle")
																	.removeClass(
																			"l-accordion-toggle-open")
																	.addClass(
																			"l-accordion-toggle-close");
														} else {
															togglebtn
																	.removeClass(
																			"l-accordion-toggle-open")
																	.removeClass(
																			"l-accordion-toggle-close-over l-accordion-toggle-open-over")
																	.addClass(
																			"l-accordion-toggle-close");
															$(this)
																	.next(
																			".l-accordion-content")
																	.hide(
																			p.speed);
														}
														$(
																".l-accordion-header",
																g.accordion)
																.removeClass(
																		"l-accordion-header-downfirst");
														$(
																".l-accordion-content:visible",
																g.accordion)
																.next(
																		".l-accordion-header:first")
																.addClass(
																		"l-accordion-header-downfirst");
													});

									g.headerHoldHeight = 0;
									$("> .l-accordion-header", g.accordion)
											.each(
													function() {
														g.headerHoldHeight += $(
																this).height();
													});
									if (p.height
											&& typeof (p.height) == 'string'
											&& p.height.indexOf('%') > 0) {
										g.onResize();
										if (p.changeHeightOnResize) {
											$(window).resize(function() {
												g.onResize();
											});
										}
									} else {
										if (p.height) {
											g.height = p.heightDiff + p.height;
											g.accordion.height(g.height);
											g.setHeight(p.height);
										} else {
											g.header = g.accordion.height();
										}
									}

									g.set(p);
								},
								onResize : function() {
									var g = this, p = this.options;
									if (!p.height
											|| typeof (p.height) != 'string'
											|| p.height.indexOf('%') == -1)
										return false;

									if (g.accordion.parent()[0].tagName
											.toLowerCase() == "body") {
										var windowHeight = $(window).height();
										windowHeight -= parseInt(g.layout
												.parent().css('paddingTop'));
										windowHeight -= parseInt(g.layout
												.parent().css('paddingBottom'));
										g.height = p.heightDiff + windowHeight
												* parseFloat(g.height) * 0.01;
									} else {
										g.height = p.heightDiff
												+ (g.accordion.parent()
														.height()
														* parseFloat(p.height) * 0.01);
									}
									g.accordion.height(g.height);
									g.setContentHeight(g.height
											- g.headerHoldHeight);
								},
								setHeight : function(height) {
									var g = this, p = this.options;
									g.accordion.height(height);
									height -= g.headerHoldHeight;
									$("> .l-accordion-content", g.accordion)
											.height(height);
								}
							});

		})(jQuery),

		(function($) {

			$.fn.jqueryButton = function(options) {
				return $.jqueryui.run.call(this, "jqueryButton", arguments);
			};
			$.fn.jqueryGetButtonManager = function() {
				return $.jqueryui.run.call(this, "jqueryGetButtonManager",
						arguments);
			};

			$.jqueryDefaults.Button = {
				width : 60,
				text : 'Button',
				disabled : false,
				click : null,
				icon : null
			};

			$.jqueryMethos.Button = {};

			$.jqueryui.controls.Button = function(element, options) {
				$.jqueryui.controls.Button.base.constructor.call(this, element,
						options);
			};
			$.jqueryui.controls.Button
					.jqueryExtend(
							$.jqueryui.controls.Input,
							{
								__getType : function() {
									return 'Button';
								},
								__idPrev : function() {
									return 'Button';
								},
								_extendMethods : function() {
									return $.jqueryMethos.Button;
								},
								_render : function() {
									var g = this, p = this.options;
									g.button = $(g.element);
									g.button.addClass("l-button");
									g.button
											.append('<div class="l-button-l"></div><div class="l-button-r"></div><span></span>');
									g.button.hover(function() {
										if (p.disabled)
											return;
										g.button.addClass("l-button-over");
									}, function() {
										if (p.disabled)
											return;
										g.button.removeClass("l-button-over");
									});
									p.click && g.button.click(function() {
										if (!p.disabled)
											p.click();
									});
									g.set(p);
								},
								_setIcon : function(url) {
									var g = this;
									if (!url) {
										g.button
												.removeClass("l-button-hasicon");
										g.button.find('img').remove();
									} else {
										g.button.addClass("l-button-hasicon");
										g.button.append('<img src="' + url
												+ '" />');
									}
								},
								_setEnabled : function(value) {
									if (value)
										this.button
												.removeClass("l-button-disabled");
								},
								_setDisabled : function(value) {
									if (value) {
										this.button
												.addClass("l-button-disabled");
										this.options.disabled = true;
									} else {
										this.button
												.removeClass("l-button-disabled");
										this.options.disabled = false;
									}
								},
								_setWidth : function(value) {
									this.button.width(value);
								},
								_setText : function(value) {
									$("span", this.button).html(value);
								},
								setValue : function(value) {
									this.set('text', value);
								},
								getValue : function() {
									return this.options.text;
								},
								setEnabled : function() {
									this.set('disabled', false);
								},
								setDisabled : function() {
									this.set('disabled', true);
								}
							});

		})(jQuery);
(function($) {
	$.fn.jqueryCheckBox = function(options) {
		return $.jqueryui.run.call(this, "jqueryCheckBox", arguments);
	};
	$.fn.jqueryGetCheckBoxManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetCheckBoxManager", arguments);
	};
	$.jqueryDefaults.CheckBox = {
		disabled : false,
		readonly : false
	};

	$.jqueryMethos.CheckBox = {};

	$.jqueryui.controls.CheckBox = function(element, options) {
		$.jqueryui.controls.CheckBox.base.constructor.call(this, element,
				options);
	};
	$.jqueryui.controls.CheckBox.jqueryExtend($.jqueryui.controls.Input, {
		__getType : function() {
			return 'CheckBox';
		},
		__idPrev : function() {
			return 'CheckBox';
		},
		_extendMethods : function() {
			return $.jqueryMethos.CheckBox;
		},
		_render : function() {
			var g = this, p = this.options;
			g.input = $(g.element);
			g.link = $('<a class="l-checkbox"></a>');
			g.wrapper = g.input.addClass('l-hidden').wrap(
					'<div class="l-checkbox-wrapper"></div>').parent();
			g.wrapper.prepend(g.link);
			g.link.click(function() {
				if (g.input.attr('disabled') || g.input.attr('readonly')) {
					return false;
				}
				if (p.disabled || p.readonly)
					return false;
				if (g.trigger('beforeClick', [ g.element ]) == false)
					return false;
				if ($(this).hasClass("l-checkbox-checked")) {
					g._setValue(false);
				} else {
					g._setValue(true);
				}
				g.input.trigger("change");
			});
			g.wrapper.hover(function() {
				if (!p.disabled)
					$(this).addClass("l-over");
			}, function() {
				$(this).removeClass("l-over");
			});
			this.set(p);
			this.updateStyle();
		},
		_setCss : function(value) {
			this.wrapper.css(value);
		},
		_setValue : function(value) {
			var g = this, p = this.options;
			if (!value) {
				g.input[0].checked = false;
				g.link.removeClass('l-checkbox-checked');
			} else {
				g.input[0].checked = true;
				g.link.addClass('l-checkbox-checked');
			}
		},
		_setDisabled : function(value) {
			if (value) {
				this.input.attr('disabled', true);
				this.wrapper.addClass("l-disabled");
			} else {
				this.input.attr('disabled', false);
				this.wrapper.removeClass("l-disabled");
			}
		},
		_getValue : function() {
			return this.element.checked;
		},
		updateStyle : function() {
			if (this.input.attr('disabled')) {
				this.wrapper.addClass("l-disabled");
				this.options.disabled = true;
			}
			if (this.input[0].checked) {
				this.link.addClass('l-checkbox-checked');
			} else {
				this.link.removeClass('l-checkbox-checked');
			}
		}
	});
})(jQuery);
(function($) {

	$.fn.jqueryCheckBoxList = function(options) {
		return $.jqueryui.run.call(this, "jqueryCheckBoxList", arguments);
	};

	$.jqueryDefaults.CheckBoxList = {
		rowSize : 3,
		valueField : 'id',
		textField : 'text',
		valueFieldID : null,
		name : null,
		split : ";",
		data : null,
		parms : null,
		url : null,
		onSuccess : null,
		onError : null,
		css : null,
		value : null,
		valueFieldCssClass : null
	};

	$.jqueryMethos.CheckBoxList = $.jqueryMethos.CheckBoxList || {};

	$.jqueryui.controls.CheckBoxList = function(element, options) {
		$.jqueryui.controls.CheckBoxList.base.constructor.call(this, element,
				options);
	};
	$.jqueryui.controls.CheckBoxList
			.jqueryExtend(
					$.jqueryui.controls.Input,
					{
						__getType : function() {
							return 'CheckBoxList';
						},
						_extendMethods : function() {
							return $.jqueryMethos.CheckBoxList;
						},
						_init : function() {
							$.jqueryui.controls.CheckBoxList.base._init
									.call(this);
						},
						_render : function() {
							var g = this, p = this.options;
							g.data = p.data;
							g.valueField = null;

							if (p.valueFieldID) {
								g.valueField = $("#" + p.valueFieldID
										+ ":input,[name=" + p.valueFieldID
										+ "]:input");
								if (g.valueField.length == 0)
									g.valueField = $('<input type="hidden"/>');
								g.valueField[0].id = g.valueField[0].name = p.valueFieldID;
							} else {
								g.valueField = $('<input type="hidden"/>');
								g.valueField[0].id = g.valueField[0].name = g.id
										+ "_val";
							}
							if (g.valueField[0].name == null)
								g.valueField[0].name = g.valueField[0].id;
							if (p.valueFieldCssClass) {
								g.valueField.addClass(p.valueFieldCssClass);
							}
							g.valueField.attr("data-jqueryid", g.id);
							g.checkboxList = $(this.element);
							g.checkboxList
									.html(
											'<div class="l-checkboxlist-inner"><table cellpadding="0" cellspacing="0" border="0" class="l-checkboxlist-table"></table></div>')
									.addClass("l-checkboxlist").append(
											g.valueField);
							g.checkboxList.table = $("table:first",
									g.checkboxList);

							g.set(p);

							g._addClickEven();
						},
						destroy : function() {
							if (this.checkboxList)
								this.checkboxList.remove();
							this.options = null;
							$.jqueryui.remove(this);
						},
						clear : function() {
							this._changeValue("");
							this.trigger('clear');
						},
						_setCss : function(css) {
							if (css) {
								this.checkboxList.addClass(css);
							}
						},
						_setDisabled : function(value) {

							if (value) {
								this.checkboxList
										.addClass('l-checkboxlist-disabled');
								$("input:checkbox", this.radioList).attr(
										"disabled", true);

							} else {
								this.checkboxList
										.removeClass('l-checkboxlist-disabled');
								$("input:checkbox", this.radioList).removeAttr(
										"disabled");
							}
						},
						_setWidth : function(value) {
							this.checkboxList.width(value);
						},
						_setHeight : function(value) {
							this.checkboxList.height(value);
						},
						indexOf : function(item) {
							var g = this, p = this.options;
							if (!g.data)
								return -1;
							for (var i = 0, l = g.data.length; i < l; i++) {
								if (typeof (item) == "object") {
									if (g.data[i] == item)
										return i;
								} else {
									if (g.data[i][p.valueField].toString() == item
											.toString())
										return i;
								}
							}
							return -1;
						},
						removeItems : function(items) {
							var g = this;
							if (!g.data)
								return;
							$(items).each(function(i, item) {
								var index = g.indexOf(item);
								if (index == -1)
									return;
								g.data.splice(index, 1);
							});
							g.refresh();
						},
						removeItem : function(item) {
							if (!this.data)
								return;
							var index = this.indexOf(item);
							if (index == -1)
								return;
							this.data.splice(index, 1);
							this.refresh();
						},
						insertItem : function(item, index) {
							var g = this;
							if (!g.data)
								g.data = [];
							g.data.splice(index, 0, item);
							g.refresh();
						},
						addItems : function(items) {
							var g = this;
							if (!g.data)
								g.data = [];
							$(items).each(function(i, item) {
								g.data.push(item);
							});
							g.refresh();
						},
						addItem : function(item) {
							var g = this;
							if (!g.data)
								g.data = [];
							g.data.push(item);
							g.refresh();
						},
						_setValue : function(value) {
							var g = this, p = this.options;
							p.value = value;
							g.valueField.val(p.value);
							this._dataInit();
						},
						setValue : function(value) {
							this._setValue(value);
						},
						_setUrl : function(url) {
							if (!url)
								return;
							var g = this, p = this.options;
							var parms = $.isFunction(p.parms) ? p.parms()
									: p.parms;
							$.ajax({
								type : 'post',
								url : url,
								data : parms,
								cache : false,
								dataType : 'json',
								success : function(data) {
									g.setData(data);
									g.trigger('success', [ data ]);
								},
								error : function(XMLHttpRequest, textStatus) {
									g.trigger('error', [ XMLHttpRequest,
											textStatus ]);
								}
							});
						},
						setUrl : function(url) {
							return this._setUrl(url);
						},
						setParm : function(name, value) {
							if (!name)
								return;
							var g = this;
							var parms = g.get('parms');
							if (!parms)
								parms = {};
							parms[name] = value;
							g.set('parms', parms);
						},
						clearContent : function() {
							var g = this, p = this.options;
							$("table", g.checkboxList).html("");
						},
						_setData : function(data) {
							this.setData(data);
						},
						setData : function(data) {
							var g = this, p = this.options;
							if (!data || !data.length)
								return;
							g.data = data;
							g.refresh();
							g.updateStyle();
						},
						refresh : function() {
							var g = this, p = this.options, data = this.data;
							this.clearContent();
							if (!data)
								return;
							var out = [], rowSize = p.rowSize, appendRowStart = false, name = p.name
									|| g.id;
							for (var i = 0; i < data.length; i++) {
								var val = data[i][p.valueField], txt = data[i][p.textField], id = g.id
										+ "-" + i;
								var newRow = i % rowSize == 0;

								if (newRow) {
									if (appendRowStart)
										out.push('</tr>');
									out.push("<tr>");
									appendRowStart = true;
								}
								out.push("<td><input type='checkbox' name='"
										+ name + "' value='" + val + "' id='"
										+ id + "'/><label for='" + id + "'>"
										+ txt + "</label></td>");
							}
							if (appendRowStart)
								out.push('</tr>');
							g.checkboxList.table.append(out.join(''));
						},
						_getValue : function() {
							var g = this, p = this.options, name = p.name
									|| g.id;
							var values = [];
							$('input:checkbox[name="' + name + '"]:checked')
									.each(function() {
										values.push(this.value);
									});
							if (!values.length)
								return null;
							return values.join(p.split);
						},
						getValue : function() {

							return this._getValue();
						},
						updateStyle : function() {
							this._dataInit();
						},
						_dataInit : function() {
							var g = this, p = this.options;
							var value = g.valueField.val();
							g._changeValue(value);
						},

						_changeValue : function(value) {
							var g = this, p = this.options, name = p.name
									|| g.id;
							var valueArr = value ? value.split(p.split) : [];
							$("input:checkbox[name='" + name + "']",
									g.checkboxList).each(
									function() {
										this.checked = $.inArray(this.value,
												valueArr) > -1;
									});
							g.valueField.val(value);
							g.selectedValue = value;
						},
						_addClickEven : function() {
							var g = this, p = this.options;

							g.checkboxList.click(function(e) {
								var value = g.getValue();
								if (value)
									g.valueField.val(value);
							});
						}
					});

})(jQuery);
(function($) {

	$.fn.jqueryComboBox = function(options) {
		return $.jqueryui.run.call(this, "jqueryComboBox", arguments);
	};

	$.fn.jqueryGetComboBoxManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetComboBoxManager", arguments);
	};

	$.jqueryDefaults.ComboBox = {
		resize : true,
		isMultiSelect : false,
		isShowCheckBox : false,
		columns : null,
		selectBoxWidth : null,
		selectBoxHeight : 120,
		selectIndex : 0,
		onBeforeSelect : false,
		onSelected : false,
		initValue : null,
		initText : null,
		valueField : 'id',
		textField : 'text',
		valueFieldID : null,
		slide : false,
		split : ";",
		data : null,
		tree : null,
		treeLeafOnly : true,
		condition : null,
		grid : null,
		onStartResize : null,
		onEndResize : null,
		hideOnLoseFocus : true,
		hideGridOnLoseFocus : false,
		url : null,
		emptyText : null,
		addRowButton : 'Add',
		addRowButtonClick : null,
		triggerIcon : null,
		onSuccess : null,
		onError : null,
		onBeforeOpen : null,
		onButtonClick : null,
		render : null,
		absolute : true,
		cancelable : true,
		css : null,
		parms : null,
		renderItem : null,
		autocomplete : false,
		highLight : false,
		readonly : false,
		ajaxType : 'post',
		alwayShowInTop : false,
		valueFieldCssClass : null
	};

	$.jqueryDefaults.ComboBoxString = {
		Search : "Search"
	};

	$.jqueryMethos.ComboBox = $.jqueryMethos.ComboBox || {};

	$.jqueryui.controls.ComboBox = function(element, options) {
		$.jqueryui.controls.ComboBox.base.constructor.call(this, element,
				options);
	};
	$.jqueryui.controls.ComboBox
			.jqueryExtend(
					$.jqueryui.controls.Input,
					{
						__getType : function() {
							return 'ComboBox';
						},
						_extendMethods : function() {
							return $.jqueryMethos.ComboBox;
						},
						_init : function() {
							$.jqueryui.controls.ComboBox.base._init.call(this);
							var p = this.options;
							if (p.columns) {
								p.isShowCheckBox = true;
							}
							if (p.isMultiSelect) {
								p.isShowCheckBox = true;
							}
						},
						_render : function() {
							var g = this, p = this.options;
							g.data = p.data;
							g.inputText = null;
							g.select = null;
							g.textFieldID = "";
							g.valueFieldID = "";
							g.valueField = null;

							if (this.element.tagName.toLowerCase() == "input") {
								this.element.readOnly = true;
								g.inputText = $(this.element);
								g.textFieldID = this.element.id;
							} else if (this.element.tagName.toLowerCase() == "select") {
								$(this.element).hide();
								g.select = $(this.element);
								p.isMultiSelect = false;
								p.isShowCheckBox = false;
								p.cancelable = false;
								g.textFieldID = this.element.id + "_txt";
								g.inputText = $('<input type="text" readonly="true"/>');
								g.inputText.attr("id", g.textFieldID)
										.insertAfter($(this.element));
							}
							if (g.inputText[0].name == undefined)
								g.inputText[0].name = g.textFieldID;

							g.valueField = null;
							if (p.valueFieldID) {
								g.valueField = $(
										"#" + p.valueFieldID + ":input,[name="
												+ p.valueFieldID + "]:input")
										.filter("input:hidden");
								if (g.valueField.length == 0)
									g.valueField = $('<input type="hidden"/>');
								g.valueField[0].id = g.valueField[0].name = p.valueFieldID;
							} else {
								g.valueField = $('<input type="hidden"/>');
								g.valueField[0].id = g.valueField[0].name = g.textFieldID
										+ "_val";
							}
							if (p.valueFieldCssClass) {
								g.valueField.addClass(p.valueFieldCssClass);
							}
							if (g.valueField[0].name == undefined)
								g.valueField[0].name = g.valueField[0].id;

							if (p.initValue != null)
								g.valueField[0].value = p.initValue;
							g.valueField.attr("data-jqueryid", g.id);

							g.link = $('<div class="l-trigger"><div class="l-trigger-icon"></div></div>');
							if (p.triggerIcon)
								g.link.find("div:first")
										.addClass(p.triggerIcon);

							g.selectBox = $('<div class="l-box-select" style="display:none"><div class="l-box-select-inner"><table cellpadding="0" cellspacing="0" border="0" class="l-box-select-table"></table></div></div>');
							g.selectBox.table = $("table:first", g.selectBox);
							g.selectBoxInner = g.selectBox
									.find(".l-box-select-inner:first");

							g.wrapper = g.inputText
									.wrap(
											'<div class="l-text l-text-combobox"></div>')
									.parent();
							g.wrapper
									.append('<div class="l-text-l"></div><div class="l-text-r"></div>');
							g.wrapper.append(g.link);

							g.textwrapper = g.wrapper.wrap(
									'<div class="l-text-wrapper"></div>')
									.parent();

							if (p.absolute)
								g.selectBox.appendTo('body').addClass(
										"l-box-select-absolute");
							else
								g.textwrapper.append(g.selectBox);

							g.textwrapper.append(g.valueField);
							g.inputText.addClass("l-text-field");
							if (p.isShowCheckBox && !g.select) {
								$("table", g.selectBox).addClass(
										"l-table-checkbox");
							} else {
								p.isShowCheckBox = false;
								$("table", g.selectBox).addClass(
										"l-table-nocheckbox");
							}

							g.link.hover(function() {
								if (p.disabled || p.readonly)
									return;
								this.className = "l-trigger-hover";
							}, function() {
								if (p.disabled || p.readonly)
									return;
								this.className = "l-trigger";
							}).mousedown(function() {
								if (p.disabled || p.readonly)
									return;
								this.className = "l-trigger-pressed";
							}).mouseup(function() {
								if (p.disabled || p.readonly)
									return;
								this.className = "l-trigger-hover";
							}).click(function() {
								if (p.disabled || p.readonly)
									return;
								if (g.trigger('buttonClick') == false)
									return false;
								if (g.trigger('beforeOpen') == false)
									return false;
								g._toggleSelectBox(g.selectBox.is(":visible"));
							});
							g.inputText.click(function() {
								if (p.disabled || p.readonly)
									return;
								if (g.trigger('beforeOpen') == false)
									return false;
								g._toggleSelectBox(g.selectBox.is(":visible"));
							}).blur(function() {
								if (p.disabled)
									return;
								g.wrapper.removeClass("l-text-focus");
							}).focus(function() {
								if (p.disabled || p.readonly)
									return;
								g.wrapper.addClass("l-text-focus");
							});
							g.wrapper.hover(function() {
								if (p.disabled || p.readonly)
									return;
								g.wrapper.addClass("l-text-over");
							}, function() {
								if (p.disabled || p.readonly)
									return;
								g.wrapper.removeClass("l-text-over");
							});
							g.resizing = false;
							g.selectBox.hover(null, function(e) {
								if (p.hideOnLoseFocus
										&& g.selectBox.is(":visible")
										&& !g.boxToggling && !g.resizing) {
									g._toggleSelectBox(true);
								}
							});

							g.bulidContent();

							g.set(p);

							if (p.selectBoxWidth) {
								g.selectBox.width(p.selectBoxWidth);
							} else {
								g.selectBox
										.css('width', g.wrapper.css('width'));
							}
							if (p.grid) {
								g.bind('show', function() {
									if (!g.grid) {
										g.setGrid(p.grid);
										g.set('SelectBoxHeight',
												p.selectBoxHeight);
									}
								});
							}
							g.updateSelectBoxPosition();
							$(document)
									.bind(
											"click.combobox",
											function(e) {

												if (g.selectBox.is(":visible")
														&& $(
																(e.target || e.srcElement))
																.closest(
																		".l-box-select, .l-text-combobox").length == 0) {
													g._toggleSelectBox(true);
												}
											});
						},
						destroy : function() {
							if (this.wrapper)
								this.wrapper.remove();
							if (this.selectBox)
								this.selectBox.remove();
							this.options = null;
							$.jqueryui.remove(this);
						},
						clear : function() {
							this._changeValue("", "");
							$("a.l-checkbox-checked", this.selectBox)
									.removeClass("l-checkbox-checked");
							$("td.l-selected", this.selectBox).removeClass(
									"l-selected");
							$(":checkbox", this.selectBox).each(function() {
								this.checked = false;
							});
							this.trigger('clear');
						},
						_setSelectBoxHeight : function(height) {
							if (!height)
								return;
							var g = this, p = this.options;
							if (p.grid) {
								g.grid
										&& g.grid.set('height', g
												.getGridHeight(height));
							} else if (!p.tree) {
								var itemsleng = $("tr", g.selectBox.table).length;
								if (!p.selectBoxHeight && itemsleng < 8)
									p.selectBoxHeight = itemsleng * 30;
								if (p.selectBoxHeight) {
									if (itemsleng < 8) {
										g.selectBoxInner.height('auto');
									} else {
										g.selectBoxInner
												.height(p.selectBoxHeight);
									}
								}
							}
						},
						_setCss : function(css) {
							if (css) {
								this.wrapper.addClass(css);
							}
						},

						_setCancelable : function(value) {
							var g = this, p = this.options;
							if (!value && g.unselect) {
								g.unselect.remove();
								g.unselect = null;
							}
							if (!value && !g.unselect)
								return;
							g.unselect = $(
									'<div class="l-trigger l-trigger-cancel"><div class="l-trigger-icon"></div></div>')
									.hide();
							g.wrapper.hover(function() {
								g.unselect.show();
							}, function() {
								g.unselect.hide();
							})
							if (!p.disabled && !p.readonly && p.cancelable) {
								g.wrapper.append(g.unselect);
							}
							g.unselect
									.hover(
											function() {
												this.className = "l-trigger-hover l-trigger-cancel";
											},
											function() {
												this.className = "l-trigger l-trigger-cancel";
											}).click(function() {
										g.clear();
									});
						},
						_setDisabled : function(value) {

							if (value) {
								this.wrapper.addClass('l-text-disabled');
							} else {
								this.wrapper.removeClass('l-text-disabled');
							}
						},
						_setReadonly : function(readonly) {
							if (readonly) {
								this.wrapper.addClass("l-text-readonly");
							} else {
								this.wrapper.removeClass("l-text-readonly");
							}
						},
						_setLable : function(label) {
							var g = this, p = this.options;
							if (label) {
								if (g.labelwrapper) {
									g.labelwrapper.find(".l-text-label:first")
											.html(label + ':&nbsp');
								} else {
									g.labelwrapper = g.textwrapper.wrap(
											'<div class="l-labeltext"></div>')
											.parent();
									g.labelwrapper
											.prepend('<div class="l-text-label" style="float:left;display:inline;">'
													+ label + ':&nbsp</div>');
									g.textwrapper.css('float', 'left');
								}
								if (!p.labelWidth) {
									p.labelWidth = $('.l-text-label',
											g.labelwrapper).outerWidth();
								} else {
									$('.l-text-label', g.labelwrapper)
											.outerWidth(p.labelWidth);
								}
								$('.l-text-label', g.labelwrapper).width(
										p.labelWidth);
								$('.l-text-label', g.labelwrapper).height(
										g.wrapper.height());
								g.labelwrapper
										.append('<br style="clear:both;" />');
								if (p.labelAlign) {
									$('.l-text-label', g.labelwrapper).css(
											'text-align', p.labelAlign);
								}
								g.textwrapper.css({
									display : 'inline'
								});
								g.labelwrapper.width(g.wrapper.outerWidth()
										+ p.labelWidth + 2);
							}
						},
						_setWidth : function(value) {
							var g = this, p = this.options;

							if (value > 20) {
								g.wrapper.css({
									width : value
								});
								g.inputText.css({
									width : value - 20
								});
								if (!p.selectBoxWidth) {
									g.selectBox.css({
										width : value
									});
								}
							}
						},
						_setHeight : function(value) {
							var g = this;
							if (value > 10) {
								g.wrapper.height(value);
								g.inputText.height(value - 2);
							}
						},
						_setResize : function(resize) {
							var g = this, p = this.options;
							if (p.columns) {
								return;
							}

							if (resize && $.fn.jqueryResizable) {
								var handles = p.selectBoxHeight ? 'e'
										: 'se,s,e';
								g.selectBox
										.jqueryResizable({
											handles : handles,
											onStartResize : function() {
												g.resizing = true;
												g.trigger('startResize');
											},
											onEndResize : function() {
												g.resizing = false;
												if (g.trigger('endResize') == false)
													return false;
											},
											onStopResize : function(current, e) {
												if (g.grid) {
													if (current.newWidth) {
														g.selectBox
																.width(current.newWidth);
													}
													if (current.newHeight) {
														g
																.set({
																	selectBoxHeight : current.newHeight
																});
													}
													g.grid.refreshSize();
													g.trigger('endResize');
													return false;
												}
												return true;
											}
										});
								g.selectBox
										.append("<div class='l-btn-nw-drop'></div>");
							}
						},

						findTextByValue : function(value) {
							var g = this, p = this.options;
							if (value == null)
								return "";
							var texts = "";
							var contain = function(checkvalue) {
								var targetdata = value.toString()
										.split(p.split);
								for (var i = 0; i < targetdata.length; i++) {
									if (targetdata[i] == checkvalue)
										return true;
								}
								return false;
							};

							var d;
							if (g.options.grid && g.options.grid.data)
								d = g.options.grid.data.Rows;
							else
								d = g.data;
							$(d).each(function(i, item) {
								var val = item[p.valueField];
								var txt = item[p.textField];
								if (contain(val)) {
									texts += txt + p.split;
								}
							});
							if (texts.length > 0)
								texts = texts.substr(0, texts.length - 1);
							return texts;
						},

						findValueByText : function(text) {
							var g = this, p = this.options;
							if (!text && text == "")
								return "";
							var contain = function(checkvalue) {
								var targetdata = text.toString().split(p.split);
								for (var i = 0; i < targetdata.length; i++) {
									if (targetdata[i] == checkvalue)
										return true;
								}
								return false;
							};
							var values = "";
							$(g.data).each(function(i, item) {
								var val = item[p.valueField];
								var txt = item[p.textField];
								if (contain(txt)) {
									values += val + p.split;
								}
							});
							if (values.length > 0)
								values = values.substr(0, values.length - 1);
							return values;
						},
						insertItem : function(data, index) {
							var g = this, p = this.options;
							g.data = g.data || [];
							g.data.splice(index, 0, data);
							g.setData(g.data);
						},
						addItem : function(data) {
							var g = this, p = this.options;
							g.insertItem(data, (g.data || []).length);
						},
						_setValue : function(value, text) {
							var g = this, p = this.options;
							text = g.findTextByValue(value);
							if (p.tree) {
								g.selectValueByTree(value);
							} else if (!p.isMultiSelect) {
								g._changeValue(value, text);
								$("tr[value='" + value + "'] td", g.selectBox)
										.addClass("l-selected");
								$("tr[value!='" + value + "'] td", g.selectBox)
										.removeClass("l-selected");
							} else {
								g._changeValue(value, text);
								if (value != null) {
									var targetdata = value.toString().split(
											p.split);
									$("table.l-table-checkbox :checkbox",
											g.selectBox).each(function() {
										this.checked = false;
									});
									for (var i = 0; i < targetdata.length; i++) {
										$(
												"table.l-table-checkbox tr[value="
														+ targetdata[i]
														+ "] :checkbox",
												g.selectBox).each(function() {
											this.checked = true;
										});
									}
								}
							}
						},
						selectValue : function(value) {
							this._setValue(value);
						},
						bulidContent : function() {
							var g = this, p = this.options;
							this.clearContent();
							if (g.select) {
								g.setSelect();
							} else if (p.tree) {
								g.setTree(p.tree);
							}
						},
						reload : function() {
							var g = this, p = this.options;
							if (p.url) {
								g.set('url', p.url);
							} else if (g.grid) {
								g.grid.reload();
							}
						},
						_setUrl : function(url) {
							if (!url)
								return;
							var g = this, p = this.options;
							var parms = $.isFunction(p.parms) ? p.parms()
									: p.parms;
							$.ajax({
								type : p.ajaxType,
								url : url,
								data : parms,
								cache : false,
								dataType : 'json',
								success : function(data) {
									g.setData(data);
									g.trigger('success', [ data ]);
								},
								error : function(XMLHttpRequest, textStatus) {
									g.trigger('error', [ XMLHttpRequest,
											textStatus ]);
								}
							});
						},
						setUrl : function(url) {
							return this._setUrl(url);
						},
						setParm : function(name, value) {
							if (!name)
								return;
							var g = this;
							var parms = g.get('parms');
							if (!parms)
								parms = {};
							parms[name] = value;
							g.set('parms', parms);
						},
						clearContent : function() {
							var g = this, p = this.options;
							$("table", g.selectBox).html("");

							g._setSelectBoxHeight(p.selectBoxHeight);

						},
						setSelect : function() {
							var g = this, p = this.options;
							this.clearContent();
							$('option', g.select).each(
									function(i) {
										var val = $(this).val();
										var txt = $(this).html();
										var tr = $("<tr><td index='" + i
												+ "' value='" + val
												+ "' text='" + txt + "'>" + txt
												+ "</td>");
										
										$("table.l-table-nocheckbox",
												g.selectBox).append(tr);
										$("td", tr).hover(function() {
											$(this).addClass("l-over");
										}, function() {
											$(this).removeClass("l-over");
										});
									});
							$('td:eq(' + g.select[0].selectedIndex + ')',
									g.selectBox)
									.each(
											function() {
												if ($(this).hasClass(
														"l-selected")) {
													g.selectBox.hide();
													return;
												}
												$(".l-selected", g.selectBox)
														.removeClass(
																"l-selected");
												$(this).addClass("l-selected");
												if (g.select[0].selectedIndex != $(
														this).attr('index')
														&& g.select[0].onchange) {
													g.select[0].selectedIndex = $(
															this).attr('index');
													g.select[0].onchange();
												}
												var newIndex = parseInt($(this)
														.attr('index'));
												g.select[0].selectedIndex = newIndex;
												g.select.trigger("change");
												g.selectBox.hide();
												var value = $(this).attr(
														"value");
												var text = $(this).html();
												if (p.render) {
													g.inputText.val(p.render(
															value, text));
												} else {
													g.inputText.val(text);
												}
											});
							g._addClickEven();
						},
						_setData : function(data) {
							this.setData(data);
						},
						setData : function(data) {
							var g = this, p = this.options;
							if (g.select)
								return;
							if (!data || !data.length)
								data = [];
							if (g.data != data)
								g.data = data;
							this.clearContent();
							if (p.columns) {
								g.selectBox.table.headrow = $("<tr class='l-table-headerow'><td width='18px'></td></tr>");
								g.selectBox.table
										.append(g.selectBox.table.headrow);
								g.selectBox.table.addClass("l-box-select-grid");
								for (var j = 0; j < p.columns.length; j++) {
									var headrow = $("<td columnindex='" + j
											+ "' columnname='"
											+ p.columns[j].name + "'>"
											+ p.columns[j].header + "</td>");
									if (p.columns[j].width) {
										headrow.width(p.columns[j].width);
									}
									g.selectBox.table.headrow.append(headrow);

								}
							}
							var out = [];
							if (p.emptyText
									&& !g.emptyRow
									&& (data.length == 0 || data[0][p.textField] != p.emptyText)) {
								g.emptyRow = {};
								g.emptyRow[p.textField] = p.emptyText;
								g.emptyRow[p.valueField] = null;
								data.splice(0, 0, g.emptyRow);
							}
							for (var i = 0; i < data.length; i++) {
								var val = data[i][p.valueField];
								var txt = data[i][p.textField];
								if (!p.columns) {
									out.push("<tr value='" + val + "'>");
									if (p.isShowCheckBox) {
										out
												.push("<td style='width:18px;'  index='"
														+ i
														+ "' value='"
														+ val
														+ "' text='"
														+ txt
														+ "' ><input type='checkbox' /></td>");
									}
									var itemHtml = txt;
									if (p.renderItem) {
										itemHtml = p.renderItem.call(g, {
											data : data[i],
											value : val,
											text : txt,
											key : g.inputText.val()
										});
									} else if (p.autocomplete && p.highLight) {
										itemHtml = g._highLight(txt,
												g.inputText.val());
									}
									out.push("<td index='" + i + "' value='"
											+ val + "' text='" + txt
											+ "' align='left'>" + itemHtml
											+ "</td></tr>");
								} else {
									out
											.push("<tr value='"
													+ val
													+ "'><td style='width:18px;'  index='"
													+ i
													+ "' value='"
													+ val
													+ "' text='"
													+ txt
													+ "' ><input type='checkbox' /></td>");
									for (var j = 0; j < p.columns.length; j++) {
										var columnname = p.columns[j].name;
										out.push("<td>" + data[i][columnname]
												+ "</td>");
									}
									out.push('</tr>');
								}
							}
							if (!p.columns) {
								if (p.isShowCheckBox) {
									$("table.l-table-checkbox", g.selectBox)
											.append(out.join(''));
								} else {
									$("table.l-table-nocheckbox", g.selectBox)
											.append(out.join(''));
								}
							} else {
								g.selectBox.table.append(out.join(''));
							}
							if (p.addRowButton && p.addRowButtonClick
									&& !g.addRowButton) {
								g.addRowButton = $('<div class="l-box-select-add"><a href="javascript:void(0)" class="link"><div class="icon"></div></a></div>');
								g.addRowButton.find(".link").append(
										p.addRowButton).click(
										p.addRowButtonClick);
								g.selectBoxInner.after(g.addRowButton);
							}
							g.set('selectBoxHeight', p.selectBoxHeight);

							if (p.isShowCheckBox && $.fn.jqueryCheckBox) {
								$("table input:checkbox", g.selectBox)
										.jqueryCheckBox();
							}
							$(".l-table-checkbox input:checkbox", g.selectBox)
									.change(
											function() {
												if (this.checked
														&& g
																.hasBind('beforeSelect')) {
													var parentTD = null;
													if ($(this).parent().get(0).tagName
															.toLowerCase() == "div") {
														parentTD = $(this)
																.parent()
																.parent();
													} else {
														parentTD = $(this)
																.parent();
													}
													if (parentTD != null
															&& g
																	.trigger(
																			'beforeSelect',
																			[
																					parentTD
																							.attr("value"),
																					parentTD
																							.attr("text") ]) == false) {
														g.selectBox
																.slideToggle("fast");
														return false;
													}
												}
												if (!p.isMultiSelect) {
													if (this.checked) {
														$("input:checked",
																g.selectBox)
																.not(this)
																.each(
																		function() {
																			this.checked = false;
																			$(
																					".l-checkbox-checked",
																					$(
																							this)
																							.parent())
																					.removeClass(
																							"l-checkbox-checked");
																		});
														g.selectBox
																.slideToggle("fast");
													}
												}
												g._checkboxUpdateValue();
											});
							$("table.l-table-nocheckbox td", g.selectBox)
									.hover(function() {
										$(this).addClass("l-over");
									}, function() {
										$(this).removeClass("l-over");
									});
							g._addClickEven();

							if (!p.autocomplete) {
								g.updateStyle();
							}
						},

						setTree : function(tree) {
							var g = this, p = this.options;
							this.clearContent();
							g.selectBox.table.remove();
							if (tree.checkbox != false) {
								tree.onCheck = function() {
									var nodes = g.treeManager.getChecked();
									var value = [];
									var text = [];
									$(nodes)
											.each(
													function(i, node) {
														if (p.treeLeafOnly
																&& node.data.children)
															return;
														value
																.push(node.data[p.valueField]);
														text
																.push(node.data[p.textField]);
													});
									g._changeValue(value.join(p.split), text
											.join(p.split));
								};
							} else {
								tree.onSelect = function(node) {
									if (g.trigger('BeforeSelect'[node]) == false)
										return;
									if (p.treeLeafOnly && node.data.children)
										return;
									var value = node.data[p.valueField];
									var text = node.data[p.textField];
									g._changeValue(value, text);
								};
								tree.onCancelSelect = function(node) {
									g._changeValue("", "");
								};
							}
							tree.onAfterAppend = function(domnode, nodedata) {
								if (!g.treeManager)
									return;
								var value = null;
								if (p.initValue)
									value = p.initValue;
								else if (g.valueField.val() != "")
									value = g.valueField.val();
								g.selectValueByTree(value);
							};
							g.tree = $("<ul></ul>");
							$("div:first", g.selectBox).append(g.tree);

							g.innerTree = g.tree.jqueryTree(tree);
							g.treeManager = g.tree.jqueryGetTreeManager();
						},

						getTree : function() {
							return this.innerTree;
						},
						selectValueByTree : function(value) {
							var g = this, p = this.options;
							if (value != null) {
								var text = "";
								var valuelist = value.toString().split(p.split);
								$(valuelist).each(function(i, item) {
									g.treeManager.selectNode(item.toString());
									text += g.treeManager.getTextByID(item);
									if (i < valuelist.length - 1)
										text += p.split;
								});
								g._changeValue(value, text);
							}
						},

						setGrid : function(grid) {
							var g = this, p = this.options;
							if (g.grid)
								return;
							p.hideOnLoseFocus = p.hideGridOnLoseFocus ? true
									: false;
							this.clearContent();
							g.selectBox.addClass("l-box-select-lookup");
							g.selectBox.table.remove();
							var panel = $("div:first", g.selectBox);
							var conditionPanel = $("<div></div>").appendTo(
									panel);
							var gridPanel = $("<div></div>").appendTo(panel);
							g.conditionPanel = conditionPanel;

							if (p.condition) {
								var conditionParm = $.extend({
									labelWidth : 60,
									space : 20,
									width : p.selectBoxWidth
								}, p.condition);
								g.condition = conditionPanel
										.jqueryForm(conditionParm);
							} else {
								conditionPanel.remove();
							}

							grid = $
									.extend(
											{
												columnWidth : 120,
												alternatingRow : false,
												frozen : true,
												rownumbers : true,
												allowUnSelectRow : true
											},
											grid,
											{
												width : "100%",
												height : g.getGridHeight(),
												inWindow : false,
												parms : p.parms,
												isChecked : function(rowdata) {
													var value = g.getValue();
													if (!value)
														return false;
													if (!p.valueField
															|| !rowdata[p.valueField])
														return false;
													return $
															.inArray(
																	rowdata[p.valueField]
																			.toString(),
																	value
																			.split(p.split)) != -1;
												}
											});
							g.grid = g.gridManager = gridPanel.jqueryGrid(grid);
							g.grid.bind('afterShowData', function() {
								g.updateSelectBoxPosition();
							});
							var selecteds = [], onGridSelect = function() {
								var value = [], text = [];
								$(selecteds).each(function(i, rowdata) {
									value.push(rowdata[p.valueField]);
									text.push(rowdata[p.textField]);
								});
								if (grid.checkbox)
									g.selected = selecteds;
								else if (selecteds.length)
									g.selected = selecteds[0];
								else
									g.selected = null;
								g._changeValue(value.join(p.split), text
										.join(p.split));
								g.trigger('gridSelect', {
									value : value.join(p.split),
									text : text.join(p.split),
									data : selecteds
								});
							}, removeSelected = function(rowdata) {
								for (var i = selecteds.length - 1; i >= 0; i--) {
									if (selecteds[i][p.valueField] == rowdata[p.valueField]) {
										selecteds.splice(i, 1);
									}
								}
							}, addSelected = function(rowdata) {
								for (var i = selecteds.length - 1; i >= 0; i--) {
									if (selecteds[i][p.valueField] == rowdata[p.valueField]) {
										return;
									}
								}
								selecteds.push(rowdata);
							};
							if (grid.checkbox) {
								var onCheckRow = function(checked, rowdata) {
									checked && addSelected(rowdata);
									!checked && removeSelected(rowdata);
								};
								g.grid.bind('CheckAllRow', function(checked) {
									$(g.grid.rows).each(function(i, rowdata) {
										onCheckRow(checked, rowdata);
									});
									onGridSelect();
								});
								g.grid.bind('CheckRow', function(checked,
										rowdata) {
									onCheckRow(checked, rowdata);
									onGridSelect();
								});
							} else {
								g.grid.bind('SelectRow', function(rowdata) {
									selecteds = [ rowdata ];
									onGridSelect();
									g._toggleSelectBox(true);
								});
								g.grid.bind('UnSelectRow', function() {
									selecteds = [];
									onGridSelect();
								});
							}
							g.bind('show', function() {
								g.grid.refreshSize();
							});
							g.bind("clear", function() {
								selecteds = [];
								g.grid.selecteds = [];
								g.grid._showData();
							});
							if (p.condition) {
								var containerBtn1 = $('<li style="margin-right:9px"><div></div></li>');
								var containerBtn2 = $('<li style="margin-right:9px;float:right"><div></div></li>');
								$("ul:first", conditionPanel).append(
										containerBtn1).append(containerBtn2)
										.after('<div class="l-clear"></div>');
								$("div", containerBtn1)
										.jqueryButton(
												{
													text : p.Search,
													width : 40,
													click : function() {
														var rules = g.condition
																.toConditions();
														g.grid
																.setParm(
																		grid.conditionParmName
																				|| 'condition',
																		$.jqueryui
																				.toJSON(rules));
														g.grid.reload();
													}
												});
								$("div", containerBtn2).jqueryButton({
									text : 'Close',
									width : 40,
									click : function() {
										g.selectBox.hide();
									}
								});
							}
							g.grid.refreshSize();
						},
						getGridHeight : function(height) {
							var g = this, p = this.options;
							height = height || g.selectBox.height();
							height -= g.conditionPanel.height();
							return height;
						},
						_getValue : function() {
							return $(this.valueField).val();
						},
						getValue : function() {

							return this._getValue();
						},
						getSelected : function() {
							return this.selected;
						},
						getText : function() {
							return this.inputText.val();
						},
						setText : function(value) {
							this.inputText.val(value);
						},
						updateStyle : function() {
							var g = this, p = this.options;
							p.initValue = g._getValue();
							g._dataInit();
						},
						_dataInit : function() {
							var g = this, p = this.options;
							var value = null;
							if (p.initValue != null && p.initText != null) {
								g._changeValue(p.initValue, p.initText);
							}

							if (p.initValue != null) {
								value = p.initValue;
								if (p.tree) {
									if (value)
										g.selectValueByTree(value);
								} else if (g.data) {
									var text = g.findTextByValue(value);
									g._changeValue(value, text);
								}
							} else if (g.valueField.val() != "") {
								value = g.valueField.val();
								if (p.tree) {
									if (value)
										g.selectValueByTree(value);
								} else if (g.data) {
									var text = g.findTextByValue(value);
									g._changeValue(value, text);
								}
							}
							if (!p.isShowCheckBox) {
								$("table tr", g.selectBox)
										.find("td:first")
										.each(
												function() {
													if (value != null
															&& value == $(this)
																	.attr(
																			"value")) {
														$(this).addClass(
																"l-selected");
													} else {
														$(this).removeClass(
																"l-selected");
													}
												});
							} else {
								$(":checkbox", g.selectBox)
										.each(
												function() {
													var parentTD = null;
													var checkbox = $(this);
													if (checkbox.parent()
															.get(0).tagName
															.toLowerCase() == "div") {
														parentTD = checkbox
																.parent()
																.parent();
													} else {
														parentTD = checkbox
																.parent();
													}
													if (parentTD == null)
														return;
													$(".l-checkbox", parentTD)
															.removeClass(
																	"l-checkbox-checked");
													checkbox[0].checked = false;
													var valuearr = (value || "")
															.toString().split(
																	p.split);
													$(valuearr)
															.each(
																	function(i,
																			item) {
																		if (value != null
																				&& item == parentTD
																						.attr("value")) {
																			$(
																					".l-checkbox",
																					parentTD)
																					.addClass(
																							"l-checkbox-checked");
																			checkbox[0].checked = true;
																		}
																	});
												});
							}
						},

						_changeValue : function(newValue, newText) {
							var g = this, p = this.options;
							g.valueField.val(newValue);
							if (p && p.render) {
								g.inputText.val(p.render(newValue, newText));
							} else {
								g.inputText.val(newText);
							}
							g.selectedValue = newValue;
							g.selectedText = newText;
							g.inputText.trigger("change").focus();
							g.trigger('selected', [ newValue, newText ]);
						},

						_checkboxUpdateValue : function() {
							var g = this, p = this.options;
							var valueStr = "";
							var textStr = "";
							$("input:checked", g.selectBox).each(
									function() {
										var parentTD = null;
										if ($(this).parent().get(0).tagName
												.toLowerCase() == "div") {
											parentTD = $(this).parent()
													.parent();
										} else {
											parentTD = $(this).parent();
										}
										if (!parentTD)
											return;
										valueStr += parentTD.attr("value")
												+ p.split;
										textStr += parentTD.attr("text")
												+ p.split;
									});
							if (valueStr.length > 0)
								valueStr = valueStr.substr(0,
										valueStr.length - 1);
							if (textStr.length > 0)
								textStr = textStr.substr(0, textStr.length - 1);
							g._changeValue(valueStr, textStr);
						},
						_addClickEven : function() {
							var g = this, p = this.options;

							$(".l-table-nocheckbox td", g.selectBox)
									.click(
											function() {
												var value = $(this).attr(
														"value");
												
												var index = parseInt($(this)
														.attr('index'));
												var text = $(this).attr("text");
												if (g.hasBind('beforeSelect')
														&& g
																.trigger(
																		'beforeSelect',
																		[
																				value,
																				text ]) == false) {
													if (p.slide)
														g.selectBox
																.slideToggle("fast");
													else
														g.selectBox.hide();
													return false;
												}
												if ($(this).hasClass(
														"l-selected")) {
													if (p.slide)
														g.selectBox
																.slideToggle("fast");
													else
														g.selectBox.hide();
													return;
												}
												$(".l-selected", g.selectBox)
														.removeClass(
																"l-selected");
												$(this).addClass("l-selected");
												if (g.select) {
													if (g.select[0].selectedIndex != index) {
														g.select[0].selectedIndex = index;
														g.select
																.trigger("change");
													}
												}
												if (p.slide) {
													g.boxToggling = true;
													g.selectBox
															.hide(
																	"fast",
																	function() {
																		g.boxToggling = false;
																	})
												} else
													g.selectBox.hide();
												g._changeValue(value, text);
											});
						},
						setSelectState : function(index, newdata) { 
							var g = this, p = this.options;
							if (g.grid) {
								if (newdata) {
									var rowobj = g.grid
											.getRowObj(newdata.Rows[p.selectIndex]['__id']);
									$(rowobj).addClass("l-selected");
									return

								}
								var rowobj = g.grid
										.getRowObj(p.grid.data.Rows[p.selectIndex]['__id']);
								$(rowobj).addClass("l-selected");
							}

						},
						clearSelectState : function(index, newdata) {
							var g = this, p = this.options;
							if (newdata) {
								for ( var o in newdata.Rows) {
									var rowobj1 = g.grid
											.getRowObj(newdata.Rows[o]['__id']);
									if ($(rowobj1).hasClass('l-selected')) {
										$(rowobj1).removeClass('l-selected');
									}
								}
								return

							}
							for ( var o in p.grid.data.Rows) {
								var rowobj1 = g.grid
										.getRowObj(p.grid.data.Rows[o]['__id']);
								if ($(rowobj1).hasClass('l-selected')) {
									$(rowobj1).removeClass('l-selected');
								}
							}
						},
						updateSelectBoxPosition : function() {
							var g = this, p = this.options;
							if (p && p.absolute) {
								var contentHeight = $(document).height();
								if (p.alwayShowInTop
										|| Number(g.wrapper.offset().top + 1
												+ g.wrapper.outerHeight()
												+ g.selectBox.height()) > contentHeight
										&& contentHeight > Number(g.selectBox
												.height() + 1)) {

									g.selectBox.css({
										left : g.wrapper.offset().left,
										top : g.wrapper.offset().top - 1
												- g.selectBox.height()
									});
								} else {
									g.selectBox.css({
										left : g.wrapper.offset().left,
										top : g.wrapper.offset().top + 1
												+ g.wrapper.outerHeight()
									});
								}
							} else {
								var topheight = g.wrapper.offset().top
										- $(window).scrollTop();
								var selfheight = g.selectBox.height()
										+ textHeight + 4;
								if (topheight + selfheight > $(window).height()
										&& topheight > selfheight) {
									g.selectBox.css("marginTop", -1
											* (g.selectBox.height()
													+ textHeight + 5));
								}
							}
						},
						_toggleSelectBox : function(isHide) {
							var g = this, p = this.options;
							if (!g || !p)
								return;

							var managers = $.jqueryui
									.find($.jqueryui.controls.ComboBox);
							for (var i = 0, l = managers.length; i < l; i++) {
								var o = managers[i];
								if (o.id != g.id) {
									if (o.selectBox.is(":visible") != null
											&& o.selectBox.is(":visible")) {
										o.selectBox.hide();
									}
								}
							}
							managers = $.jqueryui
									.find($.jqueryui.controls.DateEditor);
							for (var i = 0, l = managers.length; i < l; i++) {
								var o = managers[i];
								if (o.id != g.id) {
									if (o.dateeditor.is(":visible") != null
											&& o.dateeditor.is(":visible")) {
										o.dateeditor.hide();
									}
								}
							}
							var textHeight = g.wrapper.height();
							g.boxToggling = true;
							if (isHide) {
								if (p.slide) {
									g.selectBox.slideToggle('fast', function() {
										g.boxToggling = false;
									});
								} else {
									g.selectBox.hide();
									g.boxToggling = false;
								}
							} else {
								g.updateSelectBoxPosition();
								if (p.slide) {
									g.selectBox
											.slideToggle(
													'fast',
													function() {
														g.boxToggling = false;
														if (!p.isShowCheckBox
																&& $(
																		'td.l-selected',
																		g.selectBox).length > 0) {
															var offSet = ($(
																	'td.l-selected',
																	g.selectBox)
																	.offset().top - g.selectBox
																	.offset().top);
															$(
																	".l-box-select-inner",
																	g.selectBox)
																	.animate(
																			{
																				scrollTop : offSet
																			});
														}
													});
								} else {
									g.selectBox.show();
									g.boxToggling = false;
									if (!g.tree
											&& !g.grid
											&& !p.isShowCheckBox
											&& $('td.l-selected', g.selectBox).length > 0) {
										var offSet = ($('td.l-selected',
												g.selectBox).offset().top - g.selectBox
												.offset().top);
										$(".l-box-select-inner", g.selectBox)
												.animate({
													scrollTop : offSet
												});
									}
								}
							}
							if (isHide)
				            {
				                g.clearSelectState(p.selectIndex); 
				                p.selectIndex = 0; 
				                if (p.slide)
				                {
				                    g.selectBox.slideToggle('fast', function ()
				                    {
				                        g.boxToggling = false;
				                    });
				                }
				                else
				                {
				                    g.selectBox.hide();
				                    g.boxToggling = false;
				                }
				            }
				            else
				            {
				                g.setSelectState(p.selectIndex); 
				                g.updateSelectBoxPosition();
				                if (p.slide)
				                {
				                    g.selectBox.slideToggle('fast', function ()
				                    {
				                        g.boxToggling = false;
				                        if (!p.isShowCheckBox && $('td.l-selected', g.selectBox).length > 0)
				                        {
				                            var offSet = ($('td.l-selected', g.selectBox).offset().top - g.selectBox.offset().top);
				                            $(".l-box-select-inner", g.selectBox).animate({ scrollTop: offSet });
				                        }
				                    });
				                }
				                else
				                {
				                    g.selectBox.show();
				                    g.boxToggling = false;
				                    if (!g.tree && !g.grid && !p.isShowCheckBox && $('td.l-selected', g.selectBox).length > 0)
				                    {
				                        var offSet = ($('td.l-selected', g.selectBox).offset().top - g.selectBox.offset().top);
				                        $(".l-box-select-inner", g.selectBox).animate({ scrollTop: offSet });
				                    }
				                }
				                 
				            }
							g.isShowed = g.selectBox.is(":visible");
							g.trigger('toggle', [ isHide ]);
							g.trigger(isHide ? 'hide' : 'show');
						},
						_highLight : function(str, key) {
							if (!str)
								return str;
							var index = str.indexOf(key);
							if (index == -1)
								return str;
							return str.substring(0, index)
									+ "<span class='l-highLight'>" + key
									+ "</span>"
									+ str.substring(key.length + index);
						},
						_setAutocomplete : function(value) {
							var g = this, p = this.options;
							if (!value)
								return;
							g.inputText.removeAttr("readonly");
							var lastText = g.inputText.val();
							g.inputText.keyup(
									/*function() {
								if (this._acto)
									clearTimeout(this._acto);
								this._acto = setTimeout(function() {
									if (lastText == g.inputText.val())
										return;
									p.initValue = "";
									g.valueField.val("");
									if (p.url) {
										g.setParm('key', g.inputText.val());
										g.set('url', p.url);
										g.selectBox.show();
									} else if (p.grid) {
										g.grid
												.setParm('key', g.inputText
														.val());
										g.grid.reload();
									}
									lastText = g.inputText.val();
									this._acto = null;
								}, 300);
							},*/
							
							function (event)
				            {
				                setTimeout(function ()
				                {
				                      if(g.isShowed) 
				                      {
				                        var e = (e||event);
				                        if(e.keyCode == 13){
				                            if(lastText != ""){

				                                if(p.data[0] != undefined){
				                                	if(p.selectIndex == 0 && p.data[p.selectIndex][p.textField] != lastText)
				                                	{
				                                		for(var i=0; i<g.data.length; i++)
				                                		{
				                                			if(g.data[i][p.textField] == lastText)
				                                			{
				                                				p.selectIndex = i;
				                                				break;
				                                			}
				                                		}
				                                	}
				                                	
				                                    g.inputText.val(p.data[p.selectIndex][p.textField]);
				                                    
				                                    g.selectBox.hide();
				                                    lastText = "";
				                                    g._changeValue(p.data[p.selectIndex][p.valueField], p.data[p.selectIndex][p.textField]);
				                                    
				                                }
				                            }else{
				                                    g.inputText.val("");
				                                    g.selectBox.hide();
				                            }
				                            return;
				                        }
				                        if(e.keyCode == 40){
				                        	if (p.disabled || p.readonly) return;
				                            if (g.trigger('beforeOpen') == false) return false;
				                        	var $selectboxs=g.selectBox;
				                        	var $nextSiblingTr = $selectboxs.find(".l-box-select-table").find(".l-over").parent("tr");
				                        	if($nextSiblingTr.length <= 0){
				                        	$nextSiblingTr = $selectboxs.find(".l-box-select-table").find("tr:first");
				                        	}else{
				                        	$nextSiblingTr = $nextSiblingTr.next();
				                        	}
				                        	$selectboxs.find(".l-box-select-table").find("tr td").removeClass("l-over");
				                        	$selectboxs.find(".l-box-select-table").find("tr td").removeClass("l-selected");
				                        	if($nextSiblingTr.length > 0)
				                        	$nextSiblingTr.find("td").addClass("l-over");
				                           	$nextSiblingTr.find("td").addClass("l-selected");
				                        	var value = $nextSiblingTr.find(".l-over").attr("value");
				                        	var text = $nextSiblingTr.find(".l-over").attr("text");
				                        	 //g._changeValue(value, text);
				                        	g.inputText.val(text);
				                        	lastText = text;
				                             return;
				                        }
				                        if(e.keyCode == 38){//up
				                        	if (p.disabled || p.readonly) return;
				                            if (g.trigger('beforeOpen') == false) return false;
				         
									        var $selectboxs=g.selectBox;
									        var $nextSiblingTr = $selectboxs.find(".l-box-select-table").find(".l-over").parent("tr");
									        var $previousSiblingTr =  $selectboxs.find(".l-box-select-table").find(".l-over").parent("tr");
									        if($previousSiblingTr.length <= 0){
									        $previousSiblingTr = $selectboxs.find(".l-box-select-table").find("tr:last");
									        }else{
									        $previousSiblingTr = $previousSiblingTr.prev();
									        }
									        $selectboxs.find(".l-box-select-table").find("tr td").removeClass("l-over");
									        $selectboxs.find(".l-box-select-table").find("tr td").removeClass("l-selected");
									        if($previousSiblingTr.length > 0)
									        $previousSiblingTr.find("td").addClass("l-over");
									        $previousSiblingTr.find("td").addClass("l-selected");
									        var value = $previousSiblingTr.find(".l-over").attr("value");
									        var text = $previousSiblingTr.find(".l-over").attr("text");
									         //g._changeValue(value, text);
									        g.inputText.val(text);
									        lastText = text;
									         return;
				                        }
				                         
				                        if (lastText == g.inputText.val()) return;
				                        lastText = g.inputText.val();

				                        var newrows = [];
				                        for(var i=0; i<g.data.length; i++)
                                		{
				                                var index = g.data[i][p.textField].toString();
				                                if(index.indexOf(lastText) >= 0)
				                                {
				                                    newrows.push(g.data[i]);
				                                }

	                                	}
			                            g.set('data',newrows);
			                            g.reload();
				                      }
				                     
				                }, 1);
				            });
						}
					});

	$.jqueryui.controls.ComboBox.prototype.setValue = $.jqueryui.controls.ComboBox.prototype.selectValue;

	$.jqueryui.controls.ComboBox.prototype.setInputValue = $.jqueryui.controls.ComboBox.prototype._changeValue;

})(jQuery);
(function($) {
	$.fn.jqueryDateEditor = function() {
		return $.jqueryui.run.call(this, "jqueryDateEditor", arguments);
	};

	$.fn.jqueryGetDateEditorManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetDateEditorManager",
				arguments);
	};

	$.jqueryDefaults.DateEditor = {
		format : "yyyy-MM-dd hh:mm:ss",
		width : 380,
		showTime : false,
		onChangeDate : false,
		absolute : true,
		cancelable : true,
		readonly : false
	};
	$.jqueryDefaults.DateEditorString = {
		dayMessage : [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
		monthMessage : [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
				"Aug", "Sep", "Oct", "Nov", "Dec" ],
		todayMessage : "Today",
		closeMessage : "Close"
	};
	$.jqueryMethos.DateEditor = {};

	$.jqueryui.controls.DateEditor = function(element, options) {
		$.jqueryui.controls.DateEditor.base.constructor.call(this, element,
				options);
	};
	$.jqueryui.controls.DateEditor
			.jqueryExtend(
					$.jqueryui.controls.Input,
					{
						__getType : function() {
							return 'DateEditor';
						},
						__idPrev : function() {
							return 'DateEditor';
						},
						_extendMethods : function() {
							return $.jqueryMethos.DateEditor;
						},
						_render : function() {
							var g = this, p = this.options;
							if (!p.showTime && p.format.indexOf(" hh:mm") > -1)
								p.format = p.format.replace(" hh:mm", "");
							if (this.element.tagName.toLowerCase() != "input"
									|| this.element.type != "text")
								return;
							g.inputText = $(this.element);
							if (!g.inputText.hasClass("l-text-field"))
								g.inputText.addClass("l-text-field");
							g.link = $('<div class="l-trigger"><div class="l-trigger-icon"></div></div>');
							g.text = g.inputText.wrap(
									'<div class="l-text l-text-date"></div>')
									.parent();
							g.text
									.append('<div class="l-text-l"></div><div class="l-text-r"></div>');
							g.text.append(g.link);

							g.textwrapper = g.text.wrap(
									'<div class="l-text-wrapper"></div>')
									.parent();
							var dateeditorHTML = "";
							dateeditorHTML += "<div class='l-box-dateeditor' style='display:none'>";
							dateeditorHTML += "    <div class='l-box-dateeditor-header'>";
							dateeditorHTML += "        <div class='l-box-dateeditor-header-btn l-box-dateeditor-header-prevyear'><span></span></div>";
							dateeditorHTML += "        <div class='l-box-dateeditor-header-btn l-box-dateeditor-header-prevmonth'><span></span></div>";
							dateeditorHTML += "        <div class='l-box-dateeditor-header-text'><a class='l-box-dateeditor-header-month'></a> , <a  class='l-box-dateeditor-header-year'></a></div>";
							dateeditorHTML += "        <div class='l-box-dateeditor-header-btn l-box-dateeditor-header-nextmonth'><span></span></div>";
							dateeditorHTML += "        <div class='l-box-dateeditor-header-btn l-box-dateeditor-header-nextyear'><span></span></div>";
							dateeditorHTML += "    </div>";
							dateeditorHTML += "    <div class='l-box-dateeditor-body'>";
							dateeditorHTML += "        <table cellpadding='0' cellspacing='0' border='0' class='l-box-dateeditor-calendar'>";
							dateeditorHTML += "            <thead>";
							dateeditorHTML += "                <tr><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>";
							dateeditorHTML += "            </thead>";
							dateeditorHTML += "            <tbody>";
							dateeditorHTML += "                <tr class='l-first'><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr><tr><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr><tr><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr><tr><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr><tr><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr><tr><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td></tr>";
							dateeditorHTML += "            </tbody>";
							dateeditorHTML += "        </table>";
							dateeditorHTML += "        <ul class='l-box-dateeditor-monthselector'><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>";
							dateeditorHTML += "        <ul class='l-box-dateeditor-yearselector'><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>";
							dateeditorHTML += "        <ul class='l-box-dateeditor-hourselector'><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>";
							dateeditorHTML += "        <ul class='l-box-dateeditor-minuteselector'><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>";
							dateeditorHTML += "    </div>";
							dateeditorHTML += "    <div class='l-box-dateeditor-toolbar'>";
							dateeditorHTML += "        <div class='l-box-dateeditor-time'></div>";
							dateeditorHTML += "        <div class='l-button l-button-today'></div>";
							dateeditorHTML += "        <div class='l-button l-button-close'></div>";
							dateeditorHTML += "        <div class='l-clear'></div>";
							dateeditorHTML += "    </div>";
							dateeditorHTML += "</div>";
							g.dateeditor = $(dateeditorHTML);
							if (p.absolute)
								g.dateeditor.appendTo('body').addClass(
										"l-box-dateeditor-absolute");
							else
								g.textwrapper.append(g.dateeditor);
							g.header = $(".l-box-dateeditor-header",
									g.dateeditor);
							g.body = $(".l-box-dateeditor-body", g.dateeditor);
							g.toolbar = $(".l-box-dateeditor-toolbar",
									g.dateeditor);

							g.body.thead = $("thead", g.body);
							g.body.tbody = $("tbody", g.body);
							g.body.monthselector = $(
									".l-box-dateeditor-monthselector", g.body);
							g.body.yearselector = $(
									".l-box-dateeditor-yearselector", g.body);
							g.body.hourselector = $(
									".l-box-dateeditor-hourselector", g.body);
							g.body.minuteselector = $(
									".l-box-dateeditor-minuteselector", g.body);

							g.toolbar.time = $(".l-box-dateeditor-time",
									g.toolbar);
							g.toolbar.time.hour = $("<a></a>");
							g.toolbar.time.minute = $("<a></a>");
							g.buttons = {
								btnPrevYear : $(
										".l-box-dateeditor-header-prevyear",
										g.header),
								btnNextYear : $(
										".l-box-dateeditor-header-nextyear",
										g.header),
								btnPrevMonth : $(
										".l-box-dateeditor-header-prevmonth",
										g.header),
								btnNextMonth : $(
										".l-box-dateeditor-header-nextmonth",
										g.header),
								btnYear : $(".l-box-dateeditor-header-year",
										g.header),
								btnMonth : $(".l-box-dateeditor-header-month",
										g.header),
								btnToday : $(".l-button-today", g.toolbar),
								btnClose : $(".l-button-close", g.toolbar)
							};
							var nowDate = new Date();
							g.now = {
								year : nowDate.getFullYear(),
								month : nowDate.getMonth() + 1,
								day : nowDate.getDay(),
								date : nowDate.getDate(),
								hour : nowDate.getHours(),
								minute : nowDate.getMinutes()
							};

							g.currentDate = {
								year : nowDate.getFullYear(),
								month : nowDate.getMonth() + 1,
								day : nowDate.getDay(),
								date : nowDate.getDate(),
								hour : nowDate.getHours(),
								minute : nowDate.getMinutes()
							};

							g.selectedDate = null;

							g.usedDate = null;

							$("td", g.body.thead).each(function(i, td) {
								$(td).html(p.dayMessage[i]);
							});

							$("li", g.body.monthselector).each(function(i, li) {
								$(li).html(p.monthMessage[i]);
							});

							g.buttons.btnToday.html(p.todayMessage);
							g.buttons.btnClose.html(p.closeMessage);

							if (p.showTime) {
								g.toolbar.time.show();
								g.toolbar.time.append(g.toolbar.time.hour)
										.append(":").append(
												g.toolbar.time.minute);
								$("li", g.body.hourselector).each(
										function(i, item) {
											var str = i;
											if (i < 10)
												str = "0" + i.toString();
											$(this).html(str);
										});
								$("li", g.body.minuteselector).each(
										function(i, item) {
											var str = i;
											if (i < 10)
												str = "0" + i.toString();
											$(this).html(str);
										});
							}

							g.bulidContent();

							if (p.initValue) {
								g.inputText.val(p.initValue);
							}
							if (g.inputText.val() != "") {
								g.onTextChange();
							}

							g.dateeditor.hover(null, function(e) {
								if (g.dateeditor.is(":visible")
										&& !g.editorToggling) {
									g.toggleDateEditor(true);
								}
							});

							g.link.hover(function() {
								if (p.disabled)
									return;
								this.className = "l-trigger-hover";
							}, function() {
								if (p.disabled)
									return;
								this.className = "l-trigger";
							}).mousedown(function() {
								if (p.disabled)
									return;
								this.className = "l-trigger-pressed";
							}).mouseup(function() {
								if (p.disabled)
									return;
								this.className = "l-trigger-hover";
							}).click(
									function() {
										if (p.disabled)
											return;
										g.bulidContent();
										g.toggleDateEditor(g.dateeditor
												.is(":visible"));
									});

							if (p.disabled) {
								g.inputText.attr("readonly", "readonly");
								g.text.addClass('l-text-disabled');
							}
							g.buttons.btnClose.click(function() {
								g.toggleDateEditor(true);
							});

							$("td", g.body.tbody)
									.hover(
											function() {
												if ($(this)
														.hasClass(
																"l-box-dateeditor-today"))
													return;
												$(this)
														.addClass(
																"l-box-dateeditor-over");
											},
											function() {
												$(this)
														.removeClass(
																"l-box-dateeditor-over");
											})
									.click(
											function() {
												$(".l-box-dateeditor-selected",
														g.body.tbody)
														.removeClass(
																"l-box-dateeditor-selected");
												if (!$(this)
														.hasClass(
																"l-box-dateeditor-today"))
													$(this)
															.addClass(
																	"l-box-dateeditor-selected");
												g.currentDate.date = parseInt($(
														this).html());
												g.currentDate.day = new Date(
														g.currentDate.year,
														g.currentDate.month - 1,
														1).getDay();
												if ($(this).hasClass(
														"l-box-dateeditor-out")) {
													if ($("tr", g.body.tbody)
															.index(
																	$(this)
																			.parent()) == 0) {
														if (--g.currentDate.month == 0) {
															g.currentDate.month = 12;
															g.currentDate.year--;
														}
													} else {
														if (++g.currentDate.month == 13) {
															g.currentDate.month = 1;
															g.currentDate.year++;
														}
													}
												}
												g.selectedDate = {
													year : g.currentDate.year,
													month : g.currentDate.month,
													date : g.currentDate.date
												};
												g.showDate();
												g.editorToggling = true;
												g.dateeditor
														.slideToggle(
																'fast',
																function() {
																	g.editorToggling = false;
																});
											});

							$(".l-box-dateeditor-header-btn", g.header)
									.hover(
											function() {
												$(this)
														.addClass(
																"l-box-dateeditor-header-btn-over");
											},
											function() {
												$(this)
														.removeClass(
																"l-box-dateeditor-header-btn-over");
											});

							g.buttons.btnYear
									.click(function() {

										if (!g.body.yearselector.is(":visible")) {
											$("li", g.body.yearselector)
													.each(
															function(i, item) {
																var currentYear = g.currentDate.year
																		+ (i - 4);
																if (currentYear == g.currentDate.year)
																	$(this)
																			.addClass(
																					"l-selected");
																else
																	$(this)
																			.removeClass(
																					"l-selected");
																$(this)
																		.html(
																				currentYear);
															});
										}

										g.body.yearselector.slideToggle();
									});
							g.body.yearselector.hover(function() {
							}, function() {
								$(this).slideUp();
							});
							$("li", g.body.yearselector).click(function() {
								g.currentDate.year = parseInt($(this).html());
								g.body.yearselector.slideToggle();
								g.bulidContent();
							});

							g.buttons.btnMonth.click(function() {
								$("li", g.body.monthselector).each(
										function(i, item) {

											if (g.currentDate.month == i + 1)
												$(this).addClass("l-selected");
											else
												$(this).removeClass(
														"l-selected");
										});
								g.body.monthselector.slideToggle();
							});
							g.body.monthselector.hover(function() {
							}, function() {
								$(this).slideUp("fast");
							});
							$("li", g.body.monthselector).click(
									function() {
										var index = $("li",
												g.body.monthselector).index(
												this);
										g.currentDate.month = index + 1;
										g.body.monthselector.slideToggle();
										g.bulidContent();
									});

							g.toolbar.time.hour.click(function() {
								$("li", g.body.hourselector).each(
										function(i, item) {

											if (g.currentDate.hour == i)
												$(this).addClass("l-selected");
											else
												$(this).removeClass(
														"l-selected");
										});
								g.body.hourselector.slideToggle();
							});
							g.body.hourselector.hover(function() {
							}, function() {
								$(this).slideUp("fast");
							});
							$("li", g.body.hourselector)
									.click(
											function() {
												var index = $("li",
														g.body.hourselector)
														.index(this);
												g.currentDate.hour = index;
												g.body.hourselector
														.slideToggle();
												g.bulidContent();
												g.showDate();
											});

							g.toolbar.time.minute.click(function() {
								$("li", g.body.minuteselector).each(
										function(i, item) {

											if (g.currentDate.minute == i)
												$(this).addClass("l-selected");
											else
												$(this).removeClass(
														"l-selected");
										});
								g.body.minuteselector.slideToggle("fast",
										function() {
											var index = $("li", this).index(
													$('li.l-selected', this));
											if (index > 29) {
												var offSet = ($(
														'li.l-selected', this)
														.offset().top - $(this)
														.offset().top);
												$(this).animate({
													scrollTop : offSet
												});
											}
										});
							});
							g.body.minuteselector.hover(function() {
							}, function() {
								$(this).slideUp("fast");
							});
							$("li", g.body.minuteselector).click(
									function() {
										var index = $("li",
												g.body.minuteselector).index(
												this);
										g.currentDate.minute = index;
										g.body.minuteselector
												.slideToggle("fast");
										g.bulidContent();
										g.showDate();
									});

							g.buttons.btnPrevMonth.click(function() {
								if (--g.currentDate.month == 0) {
									g.currentDate.month = 12;
									g.currentDate.year--;
								}
								g.bulidContent();
							});

							g.buttons.btnNextMonth.click(function() {
								if (++g.currentDate.month == 13) {
									g.currentDate.month = 1;
									g.currentDate.year++;
								}
								g.bulidContent();
							});

							g.buttons.btnPrevYear.click(function() {
								g.currentDate.year--;
								g.bulidContent();
							});

							g.buttons.btnNextYear.click(function() {
								g.currentDate.year++;
								g.bulidContent();
							});

							g.buttons.btnToday.click(function() {
								g.currentDate = {
									year : g.now.year,
									month : g.now.month,
									day : g.now.day,
									date : g.now.date
								};
								g.selectedDate = {
									year : g.now.year,
									month : g.now.month,
									day : g.now.day,
									date : g.now.date
								};
								g.showDate();
								g.dateeditor.slideToggle("fast");
							});

							g.inputText.change(function() {
								g.onTextChange();
							}).blur(function() {
								g.text.removeClass("l-text-focus");
							}).focus(function() {
								g.text.addClass("l-text-focus");
							});
							g.text.hover(function() {
								g.text.addClass("l-text-over");
							}, function() {
								g.text.removeClass("l-text-over");
							});

							if (p.label) {
								g.labelwrapper = g.textwrapper.wrap(
										'<div class="l-labeltext"></div>')
										.parent();
								g.labelwrapper
										.prepend('<div class="l-text-label" style="float:left;display:inline;">'
												+ p.label + ':&nbsp</div>');
								g.textwrapper.css('float', 'left');
								if (!p.labelWidth) {
									p.labelWidth = $('.l-text-label',
											g.labelwrapper).outerWidth();
								} else {
									$('.l-text-label', g.labelwrapper)
											.outerWidth(p.labelWidth);
								}
								$('.l-text-label', g.labelwrapper).width(
										p.labelWidth);
								$('.l-text-label', g.labelwrapper).height(
										g.text.height());
								g.labelwrapper
										.append('<br style="clear:both;" />');
								if (p.labelAlign) {
									$('.l-text-label', g.labelwrapper).css(
											'text-align', p.labelAlign);
								}
								g.textwrapper.css({
									display : 'inline'
								});
								g.labelwrapper.width(g.text.outerWidth()
										+ p.labelWidth + 2);
							}

							g.set(p);

							$(document)
									.bind(
											"click.dateeditor",
											function(e) {
												if (g.dateeditor.is(":visible")
														&& $(
																(e.target || e.srcElement))
																.closest(
																		".l-box-dateeditor, .l-text-date").length == 0) {
													g.toggleDateEditor(true);
												}
											});
						},
						destroy : function() {
							if (this.textwrapper)
								this.textwrapper.remove();
							if (this.dateeditor)
								this.dateeditor.remove();
							this.options = null;
							$.jqueryui.remove(this);
						},
						bulidContent : function() {
							var g = this, p = this.options;

							var thismonthFirstDay = new Date(
									g.currentDate.year,
									g.currentDate.month - 1, 1).getDay();

							var nextMonth = g.currentDate.month;
							var nextYear = g.currentDate.year;
							if (++nextMonth == 13) {
								nextMonth = 1;
								nextYear++;
							}
							var monthDayNum = new Date(nextYear, nextMonth - 1,
									0).getDate();

							var prevMonthDayNum = new Date(g.currentDate.year,
									g.currentDate.month - 1, 0).getDate();

							g.buttons.btnMonth
									.html(p.monthMessage[g.currentDate.month - 1]);
							g.buttons.btnYear.html(g.currentDate.year);
							g.toolbar.time.hour.html(g.currentDate.hour);
							g.toolbar.time.minute.html(g.currentDate.minute);
							if (g.toolbar.time.hour.html().length == 1)
								g.toolbar.time.hour.html("0"
										+ g.toolbar.time.hour.html());
							if (g.toolbar.time.minute.html().length == 1)
								g.toolbar.time.minute.html("0"
										+ g.toolbar.time.minute.html());
							$("td", this.body.tbody).each(function() {
								this.className = ""
							});
							$("tr", this.body.tbody)
									.each(
											function(i, tr) {
												$("td", tr)
														.each(
																function(j, td) {
																	var id = i
																			* 7
																			+ (j - thismonthFirstDay);
																	var showDay = id + 1;
																	if (g.selectedDate
																			&& g.currentDate.year == g.selectedDate.year
																			&& g.currentDate.month == g.selectedDate.month
																			&& id + 1 == g.selectedDate.date) {
																		if (j == 0
																				|| j == 6) {
																			$(
																					td)
																					.addClass(
																							"l-box-dateeditor-holiday")
																		}
																		$(td)
																				.addClass(
																						"l-box-dateeditor-selected");
																		$(td)
																				.siblings()
																				.removeClass(
																						"l-box-dateeditor-selected");
																	} else if (g.currentDate.year == g.now.year
																			&& g.currentDate.month == g.now.month
																			&& id + 1 == g.now.date) {
																		if (j == 0
																				|| j == 6) {
																			$(
																					td)
																					.addClass(
																							"l-box-dateeditor-holiday")
																		}
																		$(td)
																				.addClass(
																						"l-box-dateeditor-today");
																	} else if (id < 0) {
																		showDay = prevMonthDayNum
																				+ showDay;
																		$(td)
																				.addClass(
																						"l-box-dateeditor-out")
																				.removeClass(
																						"l-box-dateeditor-selected");
																	} else if (id > monthDayNum - 1) {
																		showDay = showDay
																				- monthDayNum;
																		$(td)
																				.addClass(
																						"l-box-dateeditor-out")
																				.removeClass(
																						"l-box-dateeditor-selected");
																	} else if (j == 0
																			|| j == 6) {
																		$(td)
																				.addClass(
																						"l-box-dateeditor-holiday")
																				.removeClass(
																						"l-box-dateeditor-selected");
																	} else {
																		td.className = "";
																	}

																	$(td)
																			.html(
																					showDay);
																});
											});
						},
						updateSelectBoxPosition : function() {
							var g = this, p = this.options;
							if (p.absolute) {
								var contentHeight = $(document).height();
								if (Number(g.text.offset().top + 1
										+ g.text.outerHeight()
										+ g.dateeditor.height()) > contentHeight
										&& contentHeight > Number(g.dateeditor
												.height() + 1)) {

									g.dateeditor.css({
										left : g.text.offset().left,
										top : g.text.offset().top - 1
												- g.dateeditor.height()
									});
								} else {
									g.dateeditor.css({
										left : g.text.offset().left,
										top : g.text.offset().top + 1
												+ g.text.outerHeight()
									});
								}
							} else {
								if (g.text.offset().top + 4 > g.dateeditor
										.height()
										&& g.text.offset().top
												+ g.dateeditor.height()
												+ textHeight + 4
												- $(window).scrollTop() > $(
												window).height()) {
									g.dateeditor.css("marginTop", -1
											* (g.dateeditor.height()
													+ textHeight + 5));
									g.showOnTop = true;
								} else {
									g.showOnTop = false;
								}
							}
						},
						toggleDateEditor : function(isHide) {
							var g = this, p = this.options;

							var managers = $.jqueryui
									.find($.jqueryui.controls.ComboBox);
							for (var i = 0, l = managers.length; i < l; i++) {
								var o = managers[i];
								if (o.id != g.id) {
									if (o.selectBox.is(":visible") != null
											&& o.selectBox.is(":visible")) {
										o.selectBox.hide();
									}
								}
							}
							managers = $.jqueryui
									.find($.jqueryui.controls.DateEditor);
							for (var i = 0, l = managers.length; i < l; i++) {
								var o = managers[i];
								if (o.id != g.id) {
									if (o.dateeditor.is(":visible") != null
											&& o.dateeditor.is(":visible")) {
										o.dateeditor.hide();
									}
								}
							}
							var textHeight = g.text.height();
							g.editorToggling = true;
							if (isHide) {
								g.dateeditor.hide('fast', function() {
									g.editorToggling = false;
								});
							} else {
								g.updateSelectBoxPosition();
								g.dateeditor.slideDown('fast', function() {
									g.editorToggling = false;
								});
							}
						},
						showDate : function() {
							var g = this, p = this.options;
							if (!this.currentDate)
								return;
							this.currentDate.hour = parseInt(
									g.toolbar.time.hour.html(), 10);
							this.currentDate.minute = parseInt(
									g.toolbar.time.minute.html(), 10);
							var dateStr = this.currentDate.year + '/'
									+ this.currentDate.month + '/'
									+ this.currentDate.date + ' '
									+ this.currentDate.hour + ':'
									+ this.currentDate.minute;
							var myDate = new Date(dateStr);
							dateStr = g.getFormatDate(myDate);
							this.inputText.val(dateStr);
							this.onTextChange();
						},
						isDateTime : function(dateStr) {
							var g = this, p = this.options;
							var r = dateStr
									.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
							if (r == null)
								return false;
							var d = new Date(r[1], r[3] - 1, r[4]);
							if (d == "NaN")
								return false;
							return (d.getFullYear() == r[1]
									&& (d.getMonth() + 1) == r[3] && d
									.getDate() == r[4]);
						},
						isLongDateTime : function(dateStr) {
							var g = this, p = this.options;
							var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2})$/;
							var r = dateStr.match(reg);
							if (r == null)
								return false;
							var d = new Date(r[1], r[3] - 1, r[4], r[5], r[6]);
							if (d == "NaN")
								return false;
							return (d.getFullYear() == r[1]
									&& (d.getMonth() + 1) == r[3]
									&& d.getDate() == r[4]
									&& d.getHours() == r[5] && d.getMinutes() == r[6]);
						},
						getFormatDate : function(date) {
							var g = this, p = this.options;
							if (date == "NaN")
								return null;
							var format = p.format;
							var o = {
								"M+" : date.getMonth() + 1,
								"d+" : date.getDate(),
								"h+" : date.getHours(),
								"m+" : date.getMinutes(),
								"s+" : date.getSeconds(),
								"q+" : Math.floor((date.getMonth() + 3) / 3),
								"S" : date.getMilliseconds()
							}
							if (/(y+)/.test(format)) {
								format = format.replace(RegExp.$1, (date
										.getFullYear() + "")
										.substr(4 - RegExp.$1.length));
							}
							for ( var k in o) {
								if (new RegExp("(" + k + ")").test(format)) {
									format = format
											.replace(
													RegExp.$1,
													RegExp.$1.length == 1 ? o[k]
															: ("00" + o[k])
																	.substr(("" + o[k]).length));
								}
							}
							return format;
						},
						clear : function() {
							this.set('value', '');
							this.usedDate = null;
						},

						_setCancelable : function(value) {
							var g = this, p = this.options;
							if (!value && g.unselect) {
								g.unselect.remove();
								g.unselect = null;
							}
							if (!value && !g.unselect)
								return;
							g.unselect = $(
									'<div class="l-trigger l-trigger-cancel"><div class="l-trigger-icon"></div></div>')
									.hide();
							g.text.hover(function() {
								g.unselect.show();
							}, function() {
								g.unselect.hide();
							})
							if (!p.disabled && p.cancelable) {
								g.text.append(g.unselect);
							}
							g.unselect
									.hover(
											function() {
												this.className = "l-trigger-hover l-trigger-cancel";
											},
											function() {
												this.className = "l-trigger l-trigger-cancel";
											}).click(function() {
										if (p.readonly)
											return;
										g.clear();
									});
						},

						_rever : function() {
							var g = this, p = this.options;
							if (!g.usedDate) {
								g.inputText.val("");
							} else {
								g.inputText.val(g.getFormatDate(g.usedDate));
							}
						},
						_getMatch : function(format) {
							var r = [ -1, -1, -1, -1, -1, -1 ], groupIndex = 0, regStr = "^", str = format
									|| this.options.format;
							while (true) {
								var tmp_r = str
										.match(/^yyyy|MM|dd|mm|hh|HH|ss|-|\/|:|\s/);
								if (tmp_r) {
									var c = tmp_r[0].charAt(0);
									var mathLength = tmp_r[0].length;
									var index = 'yMdhms'.indexOf(c);
									if (index != -1) {
										r[index] = groupIndex + 1;
										regStr += "(\\d{1," + mathLength + "})";
									} else {
										var st = c == ' ' ? '\\s' : c;
										regStr += "(" + st + ")";
									}
									groupIndex++;
									if (mathLength == str.length) {
										regStr += "$";
										break;
									}
									str = str.substring(mathLength);
								} else {
									return null;
								}
							}
							return {
								reg : new RegExp(regStr),
								position : r
							};
						},
						_bulidDate : function(dateStr) {
							var g = this, p = this.options;
							var r = this._getMatch();
							if (!r)
								return null;
							var t = dateStr.match(r.reg);
							if (!t)
								return null;
							var tt = {
								y : r.position[0] == -1 ? 1900
										: t[r.position[0]],
								M : r.position[1] == -1 ? 0 : parseInt(
										t[r.position[1]], 10) - 1,
								d : r.position[2] == -1 ? 1 : parseInt(
										t[r.position[2]], 10),
								h : r.position[3] == -1 ? 0 : parseInt(
										t[r.position[3]], 10),
								m : r.position[4] == -1 ? 0 : parseInt(
										t[r.position[4]], 10),
								s : r.position[5] == -1 ? 0 : parseInt(
										t[r.position[5]], 10)
							};
							if (tt.M < 0 || tt.M > 11 || tt.d < 0 || tt.d > 31)
								return null;
							var d = new Date(tt.y, tt.M, tt.d);
							if (p.showTime) {
								if (tt.m < 0 || tt.m > 59 || tt.h < 0
										|| tt.h > 23 || tt.s < 0 || tt.s > 59)
									return null;
								d.setHours(tt.h);
								d.setMinutes(tt.m);
								d.setSeconds(tt.s);
							}
							return d;
						},
						updateStyle : function() {
							this.onTextChange();
						},
						onTextChange : function() {
							var g = this, p = this.options;
							var val = g.inputText.val();
							if (!val) {
								g.selectedDate = null;
								return true;
							}
							var newDate = g._bulidDate(val);
							if (!newDate) {
								g._rever();
								return;
							} else {
								g.usedDate = newDate;
							}
							g.selectedDate = {
								year : g.usedDate.getFullYear(),
								month : g.usedDate.getMonth() + 1,
								day : g.usedDate.getDay(),
								date : g.usedDate.getDate(),
								hour : g.usedDate.getHours(),
								minute : g.usedDate.getMinutes()
							};
							g.currentDate = {
								year : g.usedDate.getFullYear(),
								month : g.usedDate.getMonth() + 1,
								day : g.usedDate.getDay(),
								date : g.usedDate.getDate(),
								hour : g.usedDate.getHours(),
								minute : g.usedDate.getMinutes()
							};
							var formatVal = g.getFormatDate(newDate);
							g.inputText.val(formatVal);
							g.trigger('changeDate', [ formatVal ]);
							if ($(g.dateeditor).is(":visible"))
								g.bulidContent();
						},
						_setHeight : function(value) {
							var g = this;
							if (value > 4) {
								g.text.css({
									height : value
								});
								g.inputText.css({
									height : value
								});
								g.textwrapper.css({
									height : value
								});
							}
						},
						_setWidth : function(value) {
							var g = this;
							if (value > 20) {
								g.text.css({
									width : value
								});
								g.inputText.css({
									width : value - 20
								});
								g.textwrapper.css({
									width : value
								});
							}
						},
						_setValue : function(value) {
							var g = this;
							if (!value)
								g.inputText.val('');
							if (typeof value == "string") {
								if (/^\/Date/.test(value)) {
									value = value.replace(/^\//, "new ")
											.replace(/\/$/, "");
									eval("value = " + value);
								} else {
									g.inputText.val(value);
								}
							}
							if (typeof value == "object") {
								if (value instanceof Date) {
									g.inputText.val(g.getFormatDate(value));
									g.onTextChange();
								}
							}
						},
						_getValue : function() {
							return this.usedDate;
						},
						setEnabled : function() {
							var g = this, p = this.options;
							this.inputText.removeAttr("readonly");
							this.text.removeClass('l-text-disabled');
							p.disabled = false;
						},
						setDisabled : function() {
							var g = this, p = this.options;
							this.inputText.attr("readonly", "readonly");
							this.text.addClass('l-text-disabled');
							p.disabled = true;
						}
					});

})(jQuery);

(function($) {
	var l = $.jqueryui;

	$(".l-dialog-btn").live('mouseover', function() {
		$(this).addClass("l-dialog-btn-over");
	}).live('mouseout', function() {
		$(this).removeClass("l-dialog-btn-over");
	});
	$(".l-dialog-tc .l-dialog-close").live('mouseover', function() {
		$(this).addClass("l-dialog-close-over");
	}).live('mouseout', function() {
		$(this).removeClass("l-dialog-close-over");
	});

	$.jqueryDialog = function() {
		return l.run.call(null, "jqueryDialog", arguments, {
			isStatic : true
		});
	};

	$.jqueryui.DialogImagePath = "../../lib/jqueryUI/skins/Aqua/images/win/";

	function prevImage(paths) {
		for ( var i in paths) {
			$('<img />').attr('src', l.DialogImagePath + paths[i]);
		}
	}

	$.jqueryDefaults.Dialog = {
		cls : null,
		contentCls : null,
		id : null,
		buttons : null,
		isDrag : true,
		width : 280,
		height : null,
		content : '',
		target : null,
		url : null,
		load : false,
		type : 'none',
		left : null,
		top : null,
		modal : true,
		data : null,
		name : null,
		isResize : false,
		allowClose : true,
		opener : null,
		timeParmName : null,
		closeWhenEnter : null,
		isHidden : true,
		show : true,
		title : 'Information',
		showMax : false,
		showToggle : false,
		showMin : false,
		slide : $.browser.msie ? false : true,
		fixedType : null,
		showType : null,
		onLoaded : null,
		onExtend : null,
		onExtended : null,
		onCollapse : null,
		onCollapseed : null,
		onContentHeightChange : null,
		onClose : null,
		onClosed : null,
		onStopResize : null
	};
	$.jqueryDefaults.DialogString = {
		titleMessage : 'Information',
		ok : 'OK',
		yes : 'Yes',
		no : 'No',
		cancel : 'Cancel',
		waittingMessage : 'Please wait...'
	};

	$.jqueryMethos.Dialog = $.jqueryMethos.Dialog || {};

	l.controls.Dialog = function(options) {
		l.controls.Dialog.base.constructor.call(this, null, options);
	};
	l.controls.Dialog
			.jqueryExtend(
					l.core.Win,
					{
						__getType : function() {
							return 'Dialog';
						},
						__idPrev : function() {
							return 'Dialog';
						},
						_extendMethods : function() {
							return $.jqueryMethos.Dialog;
						},
						_render : function() {
							var g = this, p = this.options;
							var tmpId = "";
							g.set(p, true);
							var dialog = $('<div class="l-dialog"><table class="l-dialog-table" cellpadding="0" cellspacing="0" border="0"><tbody><tr><td class="l-dialog-tl"></td><td class="l-dialog-tc"><div class="l-dialog-tc-inner"><div class="l-dialog-icon"></div><div class="l-dialog-title"></div><div class="l-dialog-winbtns"><div class="l-dialog-winbtn l-dialog-close"></div></div></div></td><td class="l-dialog-tr"></td></tr><tr><td class="l-dialog-cl"></td><td class="l-dialog-cc"><div class="l-dialog-body"><div class="l-dialog-image"></div> <div class="l-dialog-content"></div><div class="l-dialog-buttons"><div class="l-dialog-buttons-inner"></div></td><td class="l-dialog-cr"></td></tr><tr><td class="l-dialog-bl"></td><td class="l-dialog-bc"></td><td class="l-dialog-br"></td></tr></tbody></table></div>');
							$('body').append(dialog);
							g.dialog = dialog;
							g.element = dialog[0];
							g.dialog.body = $(".l-dialog-body:first", g.dialog);
							g.dialog.header = $(".l-dialog-tc-inner:first",
									g.dialog);
							g.dialog.winbtns = $(".l-dialog-winbtns:first",
									g.dialog.header);
							g.dialog.buttons = $(".l-dialog-buttons:first",
									g.dialog);
							g.dialog.content = $(".l-dialog-content:first",
									g.dialog);
							g.set(p, false);

							if (p.allowClose == false)
								$(".l-dialog-close", g.dialog).remove();
							if (p.target || p.url || p.type == "none") {
								p.type = null;
								g.dialog.addClass("l-dialog-win");

							}
							if (p.cls)
								g.dialog.addClass(p.cls);
							if (p.id)
								g.dialog.attr("id", p.id);

							g.mask();
							if (p.isDrag)
								g._applyDrag();
							if (p.isResize)
								g._applyResize();
							if (p.type)
								g._setImage();
							else {
								$(".l-dialog-image", g.dialog).remove();
								g.dialog.content
										.addClass("l-dialog-content-noimage");
							}
							if (p.contentCls)
								g.dialog.content.addClass(p.contentCls);
							if (!p.show) {
								g.unmask();
								g.dialog.hide();
							}

							if (p.target) {
								g.dialog.content.prepend(p.target);
								$(p.target).show();
							} else if (p.url) {
								if (p.timeParmName) {
									p.url += p.url.indexOf('?') == -1 ? "?"
											: "&";
									p.url += p.timeParmName + "="
											+ new Date().getTime();
								}
								if (p.load) {
									g.dialog.body.load(p.url, function() {
										g._saveStatus();
										g.trigger('loaded');
									});
								} else {
									g.jiframe = $("<iframe frameborder='0'></iframe>");
									var framename = p.name ? p.name
											: "jquerywindow"
													+ new Date().getTime();
									g.jiframe.attr("name", framename);
									g.jiframe.attr("id", framename);
									g.dialog.content.prepend(g.jiframe);
									g.dialog.content
											.addClass("l-dialog-content-nopadding l-dialog-content-frame");

									setTimeout(
											function() {
												if (g.dialog.body
														.find(".l-dialog-loading:first").length == 0)
													g.dialog.body
															.append("<div class='l-dialog-loading' style='display:block;'></div>");
												var iframeloading = $(
														".l-dialog-loading:first",
														g.dialog.body);
												g.jiframe[0].dialog = g;

												g.jiframe
														.attr("src", p.url)
														.bind(
																'load.dialog',
																function() {
																	iframeloading
																			.hide();
																	g
																			.trigger('loaded');
																});
												g.frame = window.frames[g.jiframe
														.attr("name")];
											}, 0);

									tmpId = 'jquery_jqueryui_'
											+ new Date().getTime();
									g.tmpInput = $("<input></input>");
									g.tmpInput.attr("id", tmpId);
									g.dialog.content.prepend(g.tmpInput);
								}
							}
							if (p.opener)
								g.dialog.opener = p.opener;

							if (p.buttons) {
								$(p.buttons)
										.each(
												function(i, item) {
													var btn = $('<div class="l-dialog-btn"><div class="l-dialog-btn-l"></div><div class="l-dialog-btn-r"></div><div class="l-dialog-btn-inner"></div></div>');
													$(".l-dialog-btn-inner",
															btn)
															.html(item.text);
													$(
															".l-dialog-buttons-inner",
															g.dialog.buttons)
															.prepend(btn);
													item.width
															&& btn
																	.width(item.width);
													item.onclick
															&& btn
																	.click(function() {
																		item
																				.onclick(
																						item,
																						g,
																						i)
																	});
													item.cls
															&& btn
																	.addClass(item.cls);
												});
							} else {
								g.dialog.buttons.remove();
							}
							$(".l-dialog-buttons-inner", g.dialog.buttons)
									.append("<div class='l-clear'></div>");

							$(".l-dialog-title", g.dialog).bind("selectstart",
									function() {
										return false;
									});
							g.dialog.click(function() {
								l.win.setFront(g);
							});

							$(".l-dialog-tc .l-dialog-close", g.dialog).click(
									function() {
										if (p.isHidden)
											g.hide();
										else
											g.close();
									});
							if (!p.fixedType) {
								if (p.width == 'auto') {
									setTimeout(function() {
										resetPos()
									}, 100);
								} else {
									resetPos();
								}
							}
							function resetPos() {

								var left = 0;
								var top = 0;
								var width = p.width || g.dialog.width();
								if (p.slide == true)
									p.slide = 'fast';
								if (p.left != null)
									left = p.left;
								else
									p.left = left = 0.5 * ($(window).width() - width);
								if (p.top != null)
									top = p.top;
								else
									p.top = top = 0.5
											* ($(window).height() - g.dialog
													.height())
											+ $(window).scrollTop() - 10;
								if (left < 0)
									p.left = left = 0;
								if (top < 0)
									p.top = top = 0;
								g.dialog.css({
									left : left,
									top : top
								});
							}
							g.show();
							$('body').bind('keydown.dialog', function(e) {
								var key = e.which;
								if (key == 13) {
									g.enter();
								} else if (key == 27) {
									g.esc();
								}
							});

							g._updateBtnsWidth();
							g._saveStatus();
							g._onReisze();
							if (tmpId != "") {
								$("#" + tmpId).focus();
								$("#" + tmpId).remove();
							}
						},
						_borderX : 12,
						_borderY : 32,
						doMax : function(slide) {
							var g = this, p = this.options;
							var width = $(window).width(), height = $(window)
									.height(), left = 0, top = 0;
							if (l.win.taskbar) {
								height -= l.win.taskbar.outerHeight();
								if (l.win.top)
									top += l.win.taskbar.outerHeight();
							}
							if (slide) {
								g.dialog.body.animate({
									width : width - g._borderX
								}, p.slide);
								g.dialog.animate({
									left : left,
									top : top
								}, p.slide);
								g.dialog.content.animate({
									height : height - g._borderY
											- g.dialog.buttons.outerHeight()
								}, p.slide, function() {
									g._onReisze();
								});
							} else {
								g.set({
									width : width,
									height : height,
									left : left,
									top : top
								});
								g._onReisze();
							}
						},

						max : function() {
							var g = this, p = this.options;
							if (g.winmax) {
								g.winmax.addClass("l-dialog-recover");
								g.doMax(p.slide);
								if (g.wintoggle) {
									if (g.wintoggle.hasClass("l-dialog-extend"))
										g.wintoggle
												.addClass("l-dialog-toggle-disabled l-dialog-extend-disabled");
									else
										g.wintoggle
												.addClass("l-dialog-toggle-disabled l-dialog-collapse-disabled");
								}
								if (g.resizable)
									g.resizable.set({
										disabled : true
									});
								if (g.draggable)
									g.draggable.set({
										disabled : true
									});
								g.maximum = true;

								$(window).bind('resize.dialogmax', function() {
									g.doMax(false);
								});
							}
						},

						recover : function() {
							var g = this, p = this.options;
							if (g.winmax) {
								g.winmax.removeClass("l-dialog-recover");
								if (p.slide) {
									g.dialog.body.animate({
										width : g._width - g._borderX
									}, p.slide);
									g.dialog.animate({
										left : g._left,
										top : g._top
									}, p.slide);
									g.dialog.content.animate({
										height : g._height
												- g._borderY
												- g.dialog.buttons
														.outerHeight()
									}, p.slide, function() {
										g._onReisze();
									});
								} else {
									g.set({
										width : g._width,
										height : g._height,
										left : g._left,
										top : g._top
									});
									g._onReisze();
								}
								if (g.wintoggle) {
									g.wintoggle
											.removeClass("l-dialog-toggle-disabled l-dialog-extend-disabled l-dialog-collapse-disabled");
								}

								$(window).unbind('resize.dialogmax');
							}
							if (this.resizable)
								this.resizable.set({
									disabled : false
								});
							if (g.draggable)
								g.draggable.set({
									disabled : false
								});
							g.maximum = false;
						},

						min : function() {
							var g = this, p = this.options;
							var task = l.win.getTask(this);
							if (p.slide) {
								g.dialog.body.animate({
									width : 1
								}, p.slide);
								task.y = task.offset().top + task.height();
								task.x = task.offset().left + task.width() / 2;
								g.dialog.animate({
									left : task.x,
									top : task.y
								}, p.slide, function() {
									g.dialog.hide();
								});
							} else {
								g.dialog.hide();
							}
							g.unmask();
							g.minimize = true;
							g.actived = false;
						},

						active : function() {
							var g = this, p = this.options;
							if (g.minimize) {
								var width = g._width, height = g._height, left = g._left, top = g._top;
								if (g.maximum) {
									width = $(window).width();
									height = $(window).height();
									left = top = 0;
									if (l.win.taskbar) {
										height -= l.win.taskbar.outerHeight();
										if (l.win.top)
											top += l.win.taskbar.outerHeight();
									}
								}
								if (p.slide) {
									g.dialog.body.animate({
										width : width - g._borderX
									}, p.slide);
									g.dialog.animate({
										left : left,
										top : top
									}, p.slide);
								} else {
									g.set({
										width : width,
										height : height,
										left : left,
										top : top
									});
								}
							}
							g.actived = true;
							g.minimize = false;
							l.win.setFront(g);
							g.show();
						},

						toggle : function() {

							var g = this, p = this.options;
							if (!g.wintoggle)
								return;
							if (g.wintoggle.hasClass("l-dialog-extend"))
								g.extend();
							else
								g.collapse();
						},

						collapse : function() {
							var g = this, p = this.options;
							if (!g.wintoggle)
								return;
							if (p.slide)
								g.dialog.content.animate({
									height : 1
								}, p.slide);
							else
								g.dialog.content.height(1);
							if (this.resizable)
								this.resizable.set({
									disabled : true
								});
						},

						extend : function() {
							var g = this, p = this.options;
							if (!g.wintoggle)
								return;
							var contentHeight = g._height - g._borderY
									- g.dialog.buttons.outerHeight();
							if (p.slide)
								g.dialog.content.animate({
									height : contentHeight
								}, p.slide);
							else
								g.dialog.content.height(contentHeight);
							if (this.resizable)
								this.resizable.set({
									disabled : false
								});
						},
						_updateBtnsWidth : function() {
							var g = this;
							var btnscount = $(">div", g.dialog.winbtns).length;
							g.dialog.winbtns.width(22 * btnscount);
						},
						_setLeft : function(value) {
							if (!this.dialog)
								return;
							if (value != null)
								this.dialog.css({
									left : value
								});
						},
						_setTop : function(value) {
							if (!this.dialog)
								return;
							if (value != null)
								this.dialog.css({
									top : value
								});
						},
						_setWidth : function(value) {
							if (!this.dialog)
								return;
							if (value >= this._borderX) {
								this.dialog.body.width(value - this._borderX);
							}
						},
						_setHeight : function(value) {
							var g = this, p = this.options;
							if (!this.dialog)
								return;
							if (value == "auto") {
								g.dialog.content.height('auto');
							} else if (value >= this._borderY) {
								var height = value - this._borderY
										- g.dialog.buttons.outerHeight();
								if (g
										.trigger('ContentHeightChange',
												[ height ]) == false)
									return;
								g.dialog.content.height(height);
								g.trigger('ContentHeightChanged', [ height ]);
							}
						},
						_setShowMax : function(value) {
							var g = this, p = this.options;
							if (value) {
								if (!g.winmax) {
									g.winmax = $(
											'<div class="l-dialog-winbtn l-dialog-max"></div>')
											.appendTo(g.dialog.winbtns)
											.hover(
													function() {
														if ($(this)
																.hasClass(
																		"l-dialog-recover"))
															$(this)
																	.addClass(
																			"l-dialog-recover-over");
														else
															$(this)
																	.addClass(
																			"l-dialog-max-over");
													},
													function() {
														$(this)
																.removeClass(
																		"l-dialog-max-over l-dialog-recover-over");
													})
											.click(
													function() {
														if ($(this)
																.hasClass(
																		"l-dialog-recover"))
															g.recover();
														else
															g.max();
													});
								}
							} else if (g.winmax) {
								g.winmax.remove();
								g.winmax = null;
							}
							g._updateBtnsWidth();
						},
						_setShowMin : function(value) {
							var g = this, p = this.options;
							if (value) {
								if (!g.winmin) {
									g.winmin = $(
											'<div class="l-dialog-winbtn l-dialog-min"></div>')
											.appendTo(g.dialog.winbtns)
											.hover(
													function() {
														$(this)
																.addClass(
																		"l-dialog-min-over");
													},
													function() {
														$(this)
																.removeClass(
																		"l-dialog-min-over");
													}).click(function() {
												g.min();
											});
									l.win.addTask(g);
								}
							} else if (g.winmin) {
								g.winmin.remove();
								g.winmin = null;
							}
							g._updateBtnsWidth();
						},
						_setShowToggle : function(value) {
							var g = this, p = this.options;
							if (value) {
								if (!g.wintoggle) {
									g.wintoggle = $(
											'<div class="l-dialog-winbtn l-dialog-collapse"></div>')
											.appendTo(g.dialog.winbtns)
											.hover(
													function() {
														if ($(this)
																.hasClass(
																		"l-dialog-toggle-disabled"))
															return;
														if ($(this)
																.hasClass(
																		"l-dialog-extend"))
															$(this)
																	.addClass(
																			"l-dialog-extend-over");
														else
															$(this)
																	.addClass(
																			"l-dialog-collapse-over");
													},
													function() {
														$(this)
																.removeClass(
																		"l-dialog-extend-over l-dialog-collapse-over");
													})
											.click(
													function() {
														if ($(this)
																.hasClass(
																		"l-dialog-toggle-disabled"))
															return;
														if (g.wintoggle
																.hasClass("l-dialog-extend")) {
															if (g
																	.trigger('extend') == false)
																return;
															g.wintoggle
																	.removeClass("l-dialog-extend");
															g.extend();
															g
																	.trigger('extended');
														} else {
															if (g
																	.trigger('collapse') == false)
																return;
															g.wintoggle
																	.addClass("l-dialog-extend");
															g.collapse();
															g
																	.trigger('collapseed')
														}
													});
								}
							} else if (g.wintoggle) {
								g.wintoggle.remove();
								g.wintoggle = null;
							}
						},

						enter : function() {
							var g = this, p = this.options;
							var isClose;
							if (p.closeWhenEnter != undefined) {
								isClose = p.closeWhenEnter;
							} else if (p.type == "warn" || p.type == "error"
									|| p.type == "success"
									|| p.type == "question") {
								isClose = true;
							}
							if (isClose) {
								g.close();
							}
						},
						esc : function() {

						},
						_removeDialog : function() {
							var g = this, p = this.options;
							if (p.showType && p.fixedType) {
								g.dialog.animate({
									bottom : -1 * p.height
								}, function() {
									remove();
								});
							} else {
								remove();
							}
							function remove() {
								var jframe = $('iframe', g.dialog);
								if (jframe.length) {
									var frame = jframe[0];
									frame.src = "about:blank";
									if (frame.contentWindow
											&& frame.contentWindow.document) {
										try {
											frame.contentWindow.document
													.write('');
										} catch (e) {
										}
									}
									$.browser.msie && CollectGarbage();
									jframe.remove();
								}
								g.dialog.remove();
							}
						},
						close : function() {
							var g = this, p = this.options;
							if (g.trigger('Close') == false)
								return;
							g.doClose();
							if (g.trigger('Closed') == false)
								return;
						},
						doClose : function() {
							var g = this;
							l.win.removeTask(this);
							$.jqueryui.remove(this);
							g.unmask();
							g._removeDialog();
							$('body').unbind('keydown.dialog');
						},
						_getVisible : function() {
							return this.dialog.is(":visible");
						},
						_setUrl : function(url) {
							var g = this, p = this.options;
							p.url = url;
							if (p.load) {
								g.dialog.body.html("").load(p.url, function() {
									g.trigger('loaded');
								});
							} else if (g.jiframe) {
								g.jiframe.attr("src", p.url);
							}
						},
						_setContent : function(content) {
							this.dialog.content.html(content);
						},
						_setTitle : function(value) {
							var g = this;
							var p = this.options;
							if (value) {
								$(".l-dialog-title", g.dialog).html(value);
							}
						},
						_hideDialog : function() {
							var g = this, p = this.options;
							if (p.showType && p.fixedType) {
								g.dialog.animate({
									bottom : -1 * p.height
								}, function() {
									g.dialog.hide();
								});
							} else {
								g.dialog.hide();
							}
						},
						hidden : function() {
							var g = this;
							l.win.removeTask(g);
							g.dialog.hide();
							g.unmask();
						},
						show : function() {
							var g = this, p = this.options;
							g.mask();
							if (p.fixedType) {
								if (p.showType) {
									g.dialog.css({
										bottom : -1 * p.height
									}).addClass("l-dialog-fixed");
									g.dialog.show().animate({
										bottom : 0
									});
								} else {
									g.dialog.show().css({
										bottom : 0
									});
								}
							} else {
								g.dialog.show();
							}

							$.jqueryui.win.setFront.jqueryDefer($.jqueryui.win,
									100, [ g ]);
						},
						setUrl : function(url) {
							this._setUrl(url);
						},
						_saveStatus : function() {
							var g = this;
							g._width = g.dialog.body.width();
							g._height = g.dialog.body.height();
							var top = 0;
							var left = 0;
							if (!isNaN(parseInt(g.dialog.css('top'))))
								top = parseInt(g.dialog.css('top'));
							if (!isNaN(parseInt(g.dialog.css('left'))))
								left = parseInt(g.dialog.css('left'));
							g._top = top;
							g._left = left;
						},
						_applyDrag : function() {
							var g = this, p = this.options;
							if ($.fn.jqueryDrag) {
								g.draggable = g.dialog
										.jqueryDrag({
											handler : '.l-dialog-title',
											animate : false,
											onStartDrag : function() {
												l.win.setFront(g);
												var mask = $(
														"<div class='l-dragging-mask' style='display:block'></div>")
														.height(
																g.dialog
																		.height());
												g.dialog.append(mask);
												g.dialog.content
														.addClass('l-dialog-content-dragging');
											},
											onDrag : function(current, e) {
												var pageY = e.pageY
														|| e.screenY;
												if (pageY < 0)
													return false;
											},
											onStopDrag : function() {
												g.dialog
														.find(
																"div.l-dragging-mask:first")
														.remove();
												g.dialog.content
														.removeClass('l-dialog-content-dragging');
												if (p.target) {
													var triggers1 = l
															.find($.jqueryui.controls.DateEditor);
													var triggers2 = l
															.find($.jqueryui.controls.ComboBox);

													$(
															$.merge(triggers1,
																	triggers2))
															.each(
																	function() {
																		if (this.updateSelectBoxPosition)
																			this
																					.updateSelectBoxPosition();
																	});
												}
												g._saveStatus();
											}
										});
							}
						},
						_onReisze : function() {
							var g = this, p = this.options;
							if (p.target) {
								var manager = $(p.target).jquery();
								if (!manager)
									manager = $(p.target).find(":first")
											.jquery();
								if (!manager)
									return;
								var contentHeight = g.dialog.content.height();
								var contentWidth = g.dialog.content.width();
								manager.trigger('resize', [ {
									width : contentWidth,
									height : contentHeight
								} ]);
							}
						},
						_applyResize : function() {
							var g = this, p = this.options;
							if ($.fn.jqueryResizable) {
								g.resizable = g.dialog
										.jqueryResizable({
											onStopResize : function(current, e) {
												var top = 0;
												var left = 0;
												if (!isNaN(parseInt(g.dialog
														.css('top'))))
													top = parseInt(g.dialog
															.css('top'));
												if (!isNaN(parseInt(g.dialog
														.css('left'))))
													left = parseInt(g.dialog
															.css('left'));
												if (current.diffLeft) {
													g
															.set({
																left : left
																		+ current.diffLeft
															});
												}
												if (current.diffTop) {
													g
															.set({
																top : top
																		+ current.diffTop
															});
												}
												if (current.newWidth) {
													g
															.set({
																width : current.newWidth
															});
													g.dialog.body
															.css({
																width : current.newWidth
																		- g._borderX
															});
												}
												if (current.newHeight) {
													g
															.set({
																height : current.newHeight
															});
												}
												g._onReisze();
												g._saveStatus();
												g.trigger('stopResize');
												return false;
											},
											animate : false
										});
							}
						},
						_setImage : function() {
							var g = this, p = this.options;
							if (p.type) {
								if (p.type == 'success' || p.type == 'donne'
										|| p.type == 'ok') {
									$(".l-dialog-image", g.dialog).addClass(
											"l-dialog-image-donne").show();
									g.dialog.content.css({
										paddingLeft : 64,
										paddingBottom : 30
									});
								} else if (p.type == 'error') {
									$(".l-dialog-image", g.dialog).addClass(
											"l-dialog-image-error").show();
									g.dialog.content.css({
										paddingLeft : 64,
										paddingBottom : 30
									});
								} else if (p.type == 'warn') {
									$(".l-dialog-image", g.dialog).addClass(
											"l-dialog-image-warn").show();
									g.dialog.content.css({
										paddingLeft : 64,
										paddingBottom : 30
									});
								} else if (p.type == 'question') {
									$(".l-dialog-image", g.dialog).addClass(
											"l-dialog-image-question").show();
									g.dialog.content.css({
										paddingLeft : 64,
										paddingBottom : 40
									});
								}
							}
						}
					});
	l.controls.Dialog.prototype.hide = l.controls.Dialog.prototype.hidden;

	$.jqueryDialog.open = function(p) {
		return $.jqueryDialog(p);
	};
	$.jqueryDialog.close = function() {
		var dialogs = l.find(l.controls.Dialog.prototype.__getType());
		for ( var i in dialogs) {
			var d = dialogs[i];
			d.destroy.jqueryDefer(d, 5);
		}
		l.win.unmask();
	};
	$.jqueryDialog.show = function(p) {
		var dialogs = l.find(l.controls.Dialog.prototype.__getType());
		if (dialogs.length) {
			for ( var i in dialogs) {
				dialogs[i].show();
				return;
			}
		}
		return $.jqueryDialog(p);
	};
	$.jqueryDialog.hide = function() {
		var dialogs = l.find(l.controls.Dialog.prototype.__getType());
		for ( var i in dialogs) {
			var d = dialogs[i];
			d.hide();
		}
	};
	$.jqueryDialog.tip = function(options) {
		options = $.extend({
			showType : 'slide',
			width : 240,
			modal : false,
			height : 100
		}, options || {});

		$.extend(options, {
			fixedType : 'se',
			type : 'none',
			isDrag : false,
			isResize : false,
			showMax : false,
			showToggle : false,
			showMin : false
		});
		return $.jqueryDialog.open(options);
	};
	$.jqueryDialog.alert = function(content, title, type, callback, options) {
		content = content || "";
		if (typeof (title) == "function") {
			callback = title;
			type = null;
		} else if (typeof (type) == "function") {
			callback = type;
		}
		var btnclick = function(item, Dialog, index) {
			Dialog.close();
			if (callback)
				callback(item, Dialog, index);
		};
		p = {
			content : content,
			buttons : [ {
				text : $.jqueryDefaults.DialogString.ok,
				onclick : btnclick
			} ]
		};
		if (typeof (title) == "string" && title != "")
			p.title = title;
		if (typeof (type) == "string" && type != "")
			p.type = type;
		$.extend(p, {
			showMax : false,
			showToggle : false,
			showMin : false
		}, options || {});
		return $.jqueryDialog(p);
	};

	$.jqueryDialog.confirm = function(content, title, callback) {
		if (typeof (title) == "function") {
			callback = title;
			type = null;
		}
		var btnclick = function(item, Dialog) {
			Dialog.close();
			if (callback) {
				callback(item.type == 'ok');
			}
		};
		p = {
			type : 'question',
			content : content,
			buttons : [ {
				text : $.jqueryDefaults.DialogString.yes,
				onclick : btnclick,
				type : 'ok'
			}, {
				text : $.jqueryDefaults.DialogString.no,
				onclick : btnclick,
				type : 'no'
			} ]
		};
		if (typeof (title) == "string" && title != "")
			p.title = title;
		$.extend(p, {
			showMax : false,
			showToggle : false,
			showMin : false
		});
		return $.jqueryDialog(p);
	};
	$.jqueryDialog.warning = function(content, title, callback, options) {
		if (typeof (title) == "function") {
			callback = title;
			type = null;
		}
		var btnclick = function(item, Dialog) {
			Dialog.close();
			if (callback) {
				callback(item.type);
			}
		};
		p = {
			type : 'question',
			content : content,
			buttons : [ {
				text : $.jqueryDefaults.DialogString.yes,
				onclick : btnclick,
				type : 'yes'
			}, {
				text : $.jqueryDefaults.DialogString.no,
				onclick : btnclick,
				type : 'no'
			}, {
				text : $.jqueryDefaults.DialogString.cancel,
				onclick : btnclick,
				type : 'cancel'
			} ]
		};
		if (typeof (title) == "string" && title != "")
			p.title = title;
		$.extend(p, {
			showMax : false,
			showToggle : false,
			showMin : false
		}, options || {});
		return $.jqueryDialog(p);
	};
	$.jqueryDialog.waitting = function(title) {
		title = title || $.jqueryDefaults.Dialog.waittingMessage;
		return $.jqueryDialog.open({
			cls : 'l-dialog-waittingdialog',
			type : 'none',
			content : '<div style="padding:4px">' + title + '</div>',
			allowClose : false
		});
	};
	$.jqueryDialog.closeWaitting = function() {
		var dialogs = l.find(l.controls.Dialog);
		for ( var i in dialogs) {
			var d = dialogs[i];
			if (d.dialog.hasClass("l-dialog-waittingdialog"))
				d.close();
		}
	};
	$.jqueryDialog.success = function(content, title, onBtnClick, options) {
		return $.jqueryDialog.alert(content, title, 'success', onBtnClick,
				options);
	};
	$.jqueryDialog.error = function(content, title, onBtnClick, options) {
		return $.jqueryDialog.alert(content, title, 'error', onBtnClick,
				options);
	};
	$.jqueryDialog.warn = function(content, title, onBtnClick, options) {
		return $.jqueryDialog
				.alert(content, title, 'warn', onBtnClick, options);
	};
	$.jqueryDialog.question = function(content, title, options) {
		return $.jqueryDialog.alert(content, title, 'question', null, options);
	};

	$.jqueryDialog.prompt = function(title, value, multi, callback) {
		var target = $('<input type="text" class="l-dialog-inputtext"/>');
		if (typeof (multi) == "function") {
			callback = multi;
		}
		if (typeof (value) == "function") {
			callback = value;
		} else if (typeof (value) == "boolean") {
			multi = value;
		}
		if (typeof (multi) == "boolean" && multi) {
			target = $('<textarea class="l-dialog-textarea"></textarea>');
		}
		if (typeof (value) == "string" || typeof (value) == "int") {
			target.val(value);
		}
		var btnclick = function(item, Dialog, index) {
			Dialog.close();
			if (callback) {
				callback(item.type == 'yes', target.val());
			}
		}
		p = {
			title : title,
			target : target,
			width : 320,
			buttons : [ {
				text : $.jqueryDefaults.DialogString.ok,
				onclick : btnclick,
				type : 'yes'
			}, {
				text : $.jqueryDefaults.DialogString.cancel,
				onclick : btnclick,
				type : 'cancel'
			} ]
		};
		return $.jqueryDialog(p);
	};

})(jQuery);

(function($) {
	var l = $.jqueryui;

	$.fn.jqueryDrag = function(options) {
		return l.run.call(this, "jqueryDrag", arguments, {
			idAttrName : 'jqueryuidragid',
			hasElement : false,
			propertyToElemnt : 'target'
		});
	};

	$.fn.jqueryGetDragManager = function() {
		return l.run.call(this, "jqueryGetDragManager", arguments, {
			idAttrName : 'jqueryuidragid',
			hasElement : false,
			propertyToElemnt : 'target'
		});
	};

	$.jqueryDefaults.Drag = {
		onStartDrag : false,
		onDrag : false,
		onStopDrag : false,
		handler : null,

		proxy : true,
		revert : false,
		animate : true,
		onRevert : null,
		onEndRevert : null,

		receive : null,

		onDragEnter : null,

		onDragOver : null,

		onDragLeave : null,

		onDrop : null,
		disabled : false,
		proxyX : null,
		proxyY : null
	};

	l.controls.Drag = function(options) {
		l.controls.Drag.base.constructor.call(this, null, options);
	};

	l.controls.Drag.jqueryExtend(l.core.UIComponent, {
		__getType : function() {
			return 'Drag';
		},
		__idPrev : function() {
			return 'Drag';
		},
		_render : function() {
			var g = this, p = this.options;
			this.set(p);
			g.cursor = "move";
			g.handler.css('cursor', g.cursor);
			g.handler.bind('mousedown.drag', function(e) {
				if (p.disabled)
					return;
				if (e.button == 2)
					return;
				g._start.call(g, e);
			}).bind('mousemove.drag', function() {
				if (p.disabled)
					return;
				g.handler.css('cursor', g.cursor);
			});
		},
		_rendered : function() {
			this.options.target.jqueryuidragid = this.id;
		},
		_start : function(e) {
			var g = this, p = this.options;
			if (g.reverting)
				return;
			if (p.disabled)
				return;
			g.current = {
				target : g.target,
				left : g.target.offset().left,
				top : g.target.offset().top,
				startX : e.pageX || e.screenX,
				startY : e.pageY || e.clientY
			};
			if (g.trigger('startDrag', [ g.current, e ]) == false)
				return false;
			g.cursor = "move";
			g._createProxy(p.proxy, e);

			if (p.proxy && !g.proxy)
				return false;
			(g.proxy || g.handler).css('cursor', g.cursor);
			$(document).bind("selectstart.drag", function() {
				return false;
			});
			$(document).bind('mousemove.drag', function() {
				g._drag.apply(g, arguments);
			});
			l.draggable.dragging = true;
			$(document).bind('mouseup.drag', function() {
				l.draggable.dragging = false;
				g._stop.apply(g, arguments);
			});
		},
		_drag : function(e) {
			var g = this, p = this.options;
			if (!g.current)
				return;
			var pageX = e.pageX || e.screenX;
			var pageY = e.pageY || e.screenY;
			g.current.diffX = pageX - g.current.startX;
			g.current.diffY = pageY - g.current.startY;
			(g.proxy || g.handler).css('cursor', g.cursor);
			if (g.receive) {
				g.receive
						.each(function(i, obj) {
							var receive = $(obj);
							var xy = receive.offset();
							if (pageX > xy.left
									&& pageX < xy.left + receive.width()
									&& pageY > xy.top
									&& pageY < xy.top + receive.height()) {
								if (!g.receiveEntered[i]) {
									g.receiveEntered[i] = true;
									g.trigger('dragEnter', [ obj,
											g.proxy || g.target, e ]);
								} else {
									g.trigger('dragOver', [ obj,
											g.proxy || g.target, e ]);
								}
							} else if (g.receiveEntered[i]) {
								g.receiveEntered[i] = false;
								g.trigger('dragLeave', [ obj,
										g.proxy || g.target, e ]);
							}
						});
			}
			if (g.hasBind('drag')) {
				if (g.trigger('drag', [ g.current, e ]) != false) {
					g._applyDrag();
				} else {
					if (g.proxy) {
						g._removeProxy();
					} else {
						g._stop();
					}
				}
			} else {
				g._applyDrag();
			}
		},
		_stop : function(e) {
			var g = this, p = this.options;
			$(document).unbind('mousemove.drag');
			$(document).unbind('mouseup.drag');
			$(document).unbind("selectstart.drag");
			if (g.receive) {
				g.receive.each(function(i, obj) {
					if (g.receiveEntered[i]) {
						g.trigger('drop', [ obj, g.proxy || g.target, e ]);
					}
				});
			}
			if (g.proxy) {
				if (p.revert) {
					if (g.hasBind('revert')) {
						if (g.trigger('revert', [ g.current, e ]) != false)
							g._revert(e);
						else
							g._removeProxy();
					} else {
						g._revert(e);
					}
				} else {
					g._applyDrag(g.target);
					g._removeProxy();
				}
			}
			g.cursor = 'move';
			g.trigger('stopDrag', [ g.current, e ]);
			g.current = null;
			g.handler.css('cursor', g.cursor);
		},
		_revert : function(e) {
			var g = this;
			g.reverting = true;
			g.proxy.animate({
				left : g.current.left,
				top : g.current.top
			}, function() {
				g.reverting = false;
				g._removeProxy();
				g.trigger('endRevert', [ g.current, e ]);
				g.current = null;
			});
		},
		_applyDrag : function(applyResultBody) {
			var g = this, p = this.options;
			applyResultBody = applyResultBody || g.proxy || g.target;
			var cur = {}, changed = false;
			var noproxy = applyResultBody == g.target;
			if (g.current.diffX) {
				if (noproxy || p.proxyX == null)
					cur.left = g.current.left + g.current.diffX;
				else
					cur.left = g.current.startX + p.proxyX + g.current.diffX;
				changed = true;
			}
			if (g.current.diffY) {
				if (noproxy || p.proxyY == null)
					cur.top = g.current.top + g.current.diffY;
				else
					cur.top = g.current.startY + p.proxyY + g.current.diffY;
				changed = true;
			}
			if (applyResultBody == g.target && g.proxy && p.animate) {
				g.reverting = true;
				applyResultBody.animate(cur, function() {
					g.reverting = false;
				});
			} else {
				applyResultBody.css(cur);
			}
		},
		_setReceive : function(receive) {
			this.receiveEntered = {};
			if (!receive)
				return;
			if (typeof receive == 'string')
				this.receive = $(receive);
			else
				this.receive = receive;
		},
		_setHandler : function(handler) {
			var g = this, p = this.options;
			if (!handler)
				g.handler = $(p.target);
			else
				g.handler = (typeof handler == 'string' ? $(handler, p.target)
						: handler);
		},
		_setTarget : function(target) {
			this.target = $(target);
		},
		_setCursor : function(cursor) {
			this.cursor = cursor;
			(this.proxy || this.handler).css('cursor', cursor);
		},
		_createProxy : function(proxy, e) {
			if (!proxy)
				return;
			var g = this, p = this.options;
			if (typeof proxy == 'function') {
				g.proxy = proxy.call(this.options.target, g, e);
			} else if (proxy == 'clone') {
				g.proxy = g.target.clone().css('position', 'absolute');
				g.proxy.appendTo('body');
			} else {
				g.proxy = $("<div class='l-draggable'></div>");
				g.proxy.width(g.target.width()).height(g.target.height())
				g.proxy.attr("dragid", g.id).appendTo('body');
			}
			g.proxy.css(
					{
						left : p.proxyX == null ? g.current.left
								: g.current.startX + p.proxyX,
						top : p.proxyY == null ? g.current.top
								: g.current.startY + p.proxyY
					}).show();
		},
		_removeProxy : function() {
			var g = this;
			if (g.proxy) {
				g.proxy.remove();
				g.proxy = null;
			}
		}

	});

})(jQuery);
(function($) {
	$.fn.jqueryEasyTab = function() {
		return $.jqueryui.run.call(this, "jqueryEasyTab", arguments);
	};
	$.fn.jqueryGetEasyTabManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetEasyTabManager", arguments);
	};

	$.jqueryDefaults.EasyTab = {};

	$.jqueryMethos.EasyTab = {};

	$.jqueryui.controls.EasyTab = function(element, options) {
		$.jqueryui.controls.EasyTab.base.constructor.call(this, element,
				options);
	};
	$.jqueryui.controls.EasyTab.jqueryExtend($.jqueryui.core.UIComponent, {
		__getType : function() {
			return 'EasyTab';
		},
		__idPrev : function() {
			return 'EasyTab';
		},
		_extendMethods : function() {
			return $.jqueryMethos.EasyTab;
		},
		_render : function() {
			var g = this, p = this.options;
			g.tabs = $(this.element);
			g.tabs.addClass("l-easytab");
			var selectedIndex = 0;
			if ($("> div[lselected=true]", g.tabs).length > 0)
				selectedIndex = $("> div", g.tabs).index(
						$("> div[lselected=true]", g.tabs));
			g.tabs.ul = $('<ul class="l-easytab-header"></ul>');
			$("> div", g.tabs).each(function(i, box) {
				var li = $('<li><span></span></li>');
				if (i == selectedIndex)
					$("span", li).addClass("l-selected");
				if ($(box).attr("title")) {
					$("span", li).html($(box).attr("title"));
					$(box).removeAttr("title");
				}
				g.tabs.ul.append(li);
				if (!$(box).hasClass("l-easytab-panelbox"))
					$(box).addClass("l-easytab-panelbox");
			});
			g.tabs.ul.prependTo(g.tabs);

			$(".l-easytab-panelbox:eq(" + selectedIndex + ")", g.tabs).show()
					.siblings(".l-easytab-panelbox").hide();

			$("> ul:first span", g.tabs).click(
					function() {
						if ($(this).hasClass("l-selected"))
							return;
						var i = $("> ul:first span", g.tabs).index(this);
						$(this).addClass("l-selected").parent().siblings()
								.find("span.l-selected").removeClass(
										"l-selected");
						$(".l-easytab-panelbox:eq(" + i + ")", g.tabs).show()
								.siblings(".l-easytab-panelbox").hide();
					}).not("l-selected").hover(function() {
				$(this).addClass("l-over");
			}, function() {
				$(this).removeClass("l-over");
			});
			g.set(p);
		}
	});

})(jQuery);
(function($) {
	$.fn.jqueryFilter = function() {
		return $.jqueryui.run.call(this, "jqueryFilter", arguments);
	};

	$.fn.jqueryGetFilterManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetFilterManager", arguments);
	};

	$.jqueryDefaults.Filter = {

		fields : [],

		operators : {},

		editors : {}
	};
	$.jqueryDefaults.FilterString = {
		strings : {
			"and" : "and",
			"or" : "or",
			"equal" : "=",
			"notequal" : "!=",
			"startwith" : "start with",
			"endwith" : "end with",
			"like" : "like",
			"greater" : ">",
			"greaterorequal" : "<=",
			"less" : "<",
			"lessorequal" : "<=",
			"in" : "in",
			"notin" : "not in",
			"addgroup" : "add group",
			"addrule" : "add rule",
			"deletegroup" : "delete group"
		}
	};

	$.jqueryDefaults.Filter.operators['string'] = $.jqueryDefaults.Filter.operators['text'] = [
			"equal", "notequal", "startwith", "endwith", "like", "greater",
			"greaterorequal", "less", "lessorequal", "in", "notin" ];

	$.jqueryDefaults.Filter.operators['number'] = $.jqueryDefaults.Filter.operators['int'] = $.jqueryDefaults.Filter.operators['float'] = $.jqueryDefaults.Filter.operators['date'] = [
			"equal", "notequal", "greater", "greaterorequal", "less",
			"lessorequal", "in", "notin" ];

	$.jqueryDefaults.Filter.editors['string'] = {
		create : function(container, field) {
			var input = $("<input type='text'/>");
			container.append(input);
			input.jqueryTextBox(field.editor.options || {});
			return input;
		},
		setValue : function(input, value) {
			input.val(value);
		},
		getValue : function(input) {
			return input.jquery('option', 'value');
		},
		destroy : function(input) {
			input.jquery('destroy');
		}
	};

	$.jqueryDefaults.Filter.editors['date'] = {
		create : function(container, field) {
			var input = $("<input type='text'/>");
			container.append(input);
			input.jqueryDateEditor(field.editor.options || {});
			return input;
		},
		setValue : function(input, value) {
			input.jquery('option', 'value', value);
		},
		getValue : function(input, field) {
			return input.jquery('option', 'value');
		},
		destroy : function(input) {
			input.jquery('destroy');
		}
	};

	$.jqueryDefaults.Filter.editors['number'] = {
		create : function(container, field) {
			var input = $("<input type='text'/>");
			container.append(input);
			var options = {
				minValue : field.editor.minValue,
				maxValue : field.editor.maxValue
			};
			input.jquerySpinner($.extend(options, field.editor.options || {}));
			return input;
		},
		setValue : function(input, value) {
			input.val(value);
		},
		getValue : function(input, field) {
			var isInt = field.editor.type == "int";
			if (isInt)
				return parseInt(input.val(), 10);
			else
				return parseFloat(input.val());
		},
		destroy : function(input) {
			input.jquery('destroy');
		}
	};

	$.jqueryDefaults.Filter.editors['combobox'] = {
		create : function(container, field) {
			var input = $("<input type='text'/>");
			container.append(input);
			var options = {
				data : field.data,
				slide : false,
				valueField : field.editor.valueField
						|| field.editor.valueColumnName,
				textField : field.editor.textField
						|| field.editor.displayColumnName
			};
			$.extend(options, field.editor.options || {});
			input.jqueryComboBox(options);
			return input;
		},
		setValue : function(input, value) {
			input.jquery('option', 'value', value);
		},
		getValue : function(input) {
			return input.jquery('option', 'value');
		},
		destroy : function(input) {
			input.jquery('destroy');
		}
	};

	$.jqueryui.controls.Filter = function(element, options) {
		$.jqueryui.controls.Filter.base.constructor
				.call(this, element, options);
	};

	$.jqueryui.controls.Filter
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						__getType : function() {
							return 'Filter'
						},
						__idPrev : function() {
							return 'Filter';
						},
						_init : function() {
							$.jqueryui.controls.Filter.base._init.call(this);
						},
						_render : function() {
							var g = this, p = this.options;

							g.set(p);

							$(g.element)[$.fn.on ? "on" : "live"]
									(
											"click",
											function() {
												var e = event.srcElement;
												var cn = e.className;

												if (cn.indexOf("addgroup") >= 0) {
													var jtable = $(e).parent()
															.parent().parent()
															.parent();
													g.addGroup(jtable);
												} else if (cn
														.indexOf("deletegroup") >= 0) {
													var jtable = $(e).parent()
															.parent().parent()
															.parent();
													g.deleteGroup(jtable);
												} else if (cn
														.indexOf("addrule") >= 0) {
													var jtable = $(e).parent()
															.parent().parent()
															.parent();
													g.addRule(jtable);
												} else if (cn
														.indexOf("deleterole") >= 0) {
													var rulerow = $(e).parent()
															.parent();
													g.deleteRule(rulerow);
												}
											});

						},

						_setFields : function(fields) {
							var g = this, p = this.options;
							if (g.group)
								g.group.remove();
							g.group = $(g._bulidGroupTableHtml()).appendTo(
									g.element);
						},

						editors : {},

						editorCounter : 0,

						addGroup : function(jgroup) {
							var g = this, p = this.options;
							jgroup = $(jgroup || g.group);
							var lastrow = $(">tbody:first > tr:last", jgroup);
							var groupHtmlArr = [];
							groupHtmlArr
									.push('<tr class="l-filter-rowgroup"><td class="l-filter-cellgroup" colSpan="4">');
							var altering = !jgroup
									.hasClass("l-filter-group-alt");
							groupHtmlArr.push(g._bulidGroupTableHtml(altering,
									true));
							groupHtmlArr.push('</td></tr>');
							var row = $(groupHtmlArr.join(''));
							lastrow.before(row);
							return row.find("table:first");
						},

						deleteGroup : function(group) {
							var g = this, p = this.options;
							$("td.l-filter-value", group).each(function() {
								var rulerow = $(this).parent();
								$("select.fieldsel", rulerow).unbind();
								g.removeEditor(rulerow);
							});
							$(group).parent().parent().remove();
						},

						removeEditor : function(rulerow) {
							var g = this, p = this.options;
							var type = $(rulerow).attr("editortype");
							var id = $(rulerow).attr("editorid");
							var editor = g.editors[id];
							if (editor)
								p.editors[type].destroy(editor);
							$("td.l-filter-value:first", rulerow).html("");
						},

						setData : function(group, jgroup) {
							var g = this, p = this.options;
							jgroup = jgroup || g.group;
							var lastrow = $(">tbody:first > tr:last", jgroup);
							jgroup.find(">tbody:first > tr").not(lastrow)
									.remove();
							$("select:first", lastrow).val(group.op);
							if (group.rules) {
								$(group.rules)
										.each(
												function() {
													var rulerow = g
															.addRule(jgroup);
													rulerow
															.attr(
																	"fieldtype",
																	this.type
																			|| "string");
													$("select.opsel", rulerow)
															.val(this.op);
													$("select.fieldsel",
															rulerow).val(
															this.field)
															.trigger('change');
													var editorid = rulerow
															.attr("editorid");
													if (editorid
															&& g.editors[editorid]) {
														var field = g
																.getField(this.field);
														if (field
																&& field.editor) {
															p.editors[field.editor.type]
																	.setValue(
																			g.editors[editorid],
																			this.value,
																			field);
														}
													} else {
														$(":text", rulerow)
																.val(this.value);
													}
												});
							}
							if (group.groups) {
								$(group.groups).each(function() {
									var subjgroup = g.addGroup(jgroup);
									g.setData(this, subjgroup);
								});
							}
						},

						addRule : function(jgroup) {
							var g = this, p = this.options;
							jgroup = jgroup || g.group;
							var lastrow = $(">tbody:first > tr:last", jgroup);
							var rulerow = $(g._bulidRuleRowHtml());
							lastrow.before(rulerow);
							if (p.fields.length) {

								g.appendEditor(rulerow, p.fields[0]);
							}

							$("select.fieldsel", rulerow)
									.bind(
											'change',
											function() {
												var jopsel = $(this).parent()
														.next().find(
																"select:first");
												var fieldName = $(this).val();
												if (!fieldName)
													return;
												var field = g
														.getField(fieldName);

												var fieldType = field.type
														|| "string";
												var oldFieldtype = rulerow
														.attr("fieldtype");
												if (fieldType != oldFieldtype) {
													jopsel
															.html(g
																	._bulidOpSelectOptionsHtml(fieldType));
													rulerow.attr("fieldtype",
															fieldType);
												}

												var editorType = null;

												var oldEditorType = rulerow
														.attr("editortype");
												if (g.enabledEditor(field))
													editorType = field.editor.type;
												if (oldEditorType) {

													g.removeEditor(rulerow);
												}
												if (editorType) {

													g.appendEditor(rulerow,
															field);
												} else {
													rulerow.removeAttr(
															"editortype")
															.removeAttr(
																	"editorid");
													$(
															"td.l-filter-value:first",
															rulerow)
															.html(
																	'<input type="text" class="valtxt" />');
												}
											});
							return rulerow;
						},

						deleteRule : function(rulerow) {
							$("select.fieldsel", rulerow).unbind();
							this.removeEditor(rulerow);
							$(rulerow).remove();
						},

						appendEditor : function(rulerow, field) {
							var g = this, p = this.options;
							if (g.enabledEditor(field)) {
								var cell = $("td.l-filter-value:first", rulerow)
										.html("");
								var editor = p.editors[field.editor.type];
								g.editors[++g.editorCounter] = editor.create(
										cell, field);
								rulerow.attr("editortype", field.editor.type)
										.attr("editorid", g.editorCounter);
							}
						},

						getData : function(group) {
							var g = this, p = this.options;
							group = group || g.group;

							var groupData = {};

							$("> tbody > tr", group).each(
									function(i, row) {
										var rowlast = $(row).hasClass(
												"l-filter-rowlast");
										var rowgroup = $(row).hasClass(
												"l-filter-rowgroup");
										if (rowgroup) {
											var groupTable = $(
													"> td:first > table:first",
													row);
											if (groupTable.length) {
												if (!groupData.groups)
													groupData.groups = [];
												groupData.groups.push(g
														.getData(groupTable));
											}
										} else if (rowlast) {
											groupData.op = $(
													".groupopsel:first", row)
													.val();
										} else {
											var fieldName = $(
													"select.fieldsel:first",
													row).val();
											var field = g.getField(fieldName);
											var op = $(".opsel:first", row)
													.val();
											var value = g._getRuleValue(row,
													field);
											var type = $(row).attr("fieldtype")
													|| "string";
											if (!groupData.rules)
												groupData.rules = [];
											groupData.rules.push({
												field : fieldName,
												op : op,
												value : value,
												type : type
											});
										}
									});

							return groupData;
						},

						_getRuleValue : function(rulerow, field) {
							var g = this, p = this.options;
							var editorid = $(rulerow).attr("editorid");
							var editortype = $(rulerow).attr("editortype");
							var editor = g.editors[editorid];
							if (editor)
								return p.editors[editortype].getValue(editor,
										field);
							return $(".valtxt:first", rulerow).val();
						},

						enabledEditor : function(field) {
							var g = this, p = this.options;
							if (!field.editor || !field.editor.type)
								return false;
							return (field.editor.type in p.editors);
						},

						getField : function(fieldname) {
							var g = this, p = this.options;
							for (var i = 0, l = p.fields.length; i < l; i++) {
								var field = p.fields[i];
								if (field.name == fieldname)
									return field;
							}
							return null;
						},

						_bulidGroupTableHtml : function(altering, allowDelete) {
							var g = this, p = this.options;
							var tableHtmlArr = [];
							tableHtmlArr
									.push('<table cellpadding="0" cellspacing="0" border="0" class="l-filter-group');
							if (altering)
								tableHtmlArr.push(' l-filter-group-alt');
							tableHtmlArr.push('"><tbody>');
							tableHtmlArr
									.push('<tr class="l-filter-rowlast"><td class="l-filter-rowlastcell" align="right" colSpan="4">');

							tableHtmlArr.push('<select class="groupopsel">');
							tableHtmlArr.push('<option value="and">'
									+ p.strings['and'] + '</option>');
							tableHtmlArr.push('<option value="or">'
									+ p.strings['or'] + '</option>');
							tableHtmlArr.push('</select>');

							tableHtmlArr.push('<input type="button" value="'
									+ p.strings['addgroup']
									+ '" class="addgroup">');

							tableHtmlArr.push('<input type="button" value="'
									+ p.strings['addrule']
									+ '" class="addrule">');
							if (allowDelete)
								tableHtmlArr
										.push('<input type="button" value="'
												+ p.strings['deletegroup']
												+ '" class="deletegroup">');

							tableHtmlArr.push('</td></tr>');

							tableHtmlArr.push('</tbody></table>');
							return tableHtmlArr.join('');
						},

						_bulidRuleRowHtml : function(fields) {
							var g = this, p = this.options;
							fields = fields || p.fields;
							var rowHtmlArr = [];
							var fieldType = fields[0].type || "string";
							rowHtmlArr.push('<tr fieldtype="' + fieldType
									+ '"><td class="l-filter-column">');
							rowHtmlArr.push('<select class="fieldsel">');
							for (var i = 0, l = fields.length; i < l; i++) {
								var field = fields[i];
								rowHtmlArr.push('<option value="' + field.name
										+ '"');
								if (i == 0)
									rowHtmlArr.push(" selected ");
								rowHtmlArr.push('>');
								rowHtmlArr.push(field.display);
								rowHtmlArr.push('</option>');
							}
							rowHtmlArr.push("</select>");
							rowHtmlArr.push('</td>');

							rowHtmlArr.push('<td class="l-filter-op">');
							rowHtmlArr.push('<select class="opsel">');
							rowHtmlArr.push(g
									._bulidOpSelectOptionsHtml(fieldType));
							rowHtmlArr.push('</select>');
							rowHtmlArr.push('</td>');
							rowHtmlArr.push('<td class="l-filter-value">');
							rowHtmlArr
									.push('<input type="text" class="valtxt" />');
							rowHtmlArr.push('</td>');
							rowHtmlArr.push('<td>');
							rowHtmlArr
									.push('<div class="l-icon-cross deleterole"></div>');
							rowHtmlArr.push('</td>');
							rowHtmlArr.push('</tr>');
							return rowHtmlArr.join('');
						},

						_bulidOpSelectOptionsHtml : function(fieldType) {
							var g = this, p = this.options;
							var ops = p.operators[fieldType];
							var opHtmlArr = [];
							for (var i = 0, l = ops.length; i < l; i++) {
								var op = ops[i];
								opHtmlArr[opHtmlArr.length] = '<option value="'
										+ op + '">';
								opHtmlArr[opHtmlArr.length] = p.strings[op];
								opHtmlArr[opHtmlArr.length] = '</option>';
							}
							return opHtmlArr.join('');
						}

					});

	$.jqueryFilter = function() {
	};
	$.jqueryFilter.filterTranslator = {
		translateGroup : function(group) {
			var out = [];
			if (group == null)
				return " 1==1 ";
			var appended = false;
			out.push('(');
			if (group.rules != null) {
				for ( var i in group.rules) {
					if (i == "indexOf")
						continue;
					var rule = group.rules[i];
					if (appended)
						out.push(this.getOperatorQueryText(group.op));
					out.push(this.translateRule(rule));
					appended = true;
				}
			}
			if (group.groups != null) {
				for ( var j in group.groups) {
					var subgroup = group.groups[j];
					if (appended)
						out.push(this.getOperatorQueryText(group.op));
					out.push(this.translateGroup(subgroup));
					appended = true;
				}
			}
			out.push(')');
			if (appended == false)
				return " 1==1 ";
			return out.join('');
		},

		translateRule : function(rule) {
			var out = [];
			if (rule == null)
				return " 1==1 ";
			if (rule.op == "like" || rule.op == "startwith"
					|| rule.op == "endwith") {
				out.push('/');
				if (rule.op == "startwith")
					out.push('^');
				out.push(rule.value);
				if (rule.op == "endwith")
					out.push('$');
				out.push('/i.test(');
				out.push('o["');
				out.push(rule.field);
				out.push('"]');
				out.push(')');
				return out.join('');
			}
			out.push('o["');
			out.push(rule.field);
			out.push('"]');
			out.push(this.getOperatorQueryText(rule.op));
			out.push('"');
			out.push(rule.value);
			out.push('"');
			return out.join('');
		},

		getOperatorQueryText : function(op) {
			switch (op) {
			case "equal":
				return " == ";
			case "notequal":
				return " != ";
			case "greater":
				return " > ";
			case "greaterorequal":
				return " >= ";
			case "less":
				return " < ";
			case "lessorequal":
				return " <= ";
			case "and":
				return " && ";
			case "or":
				return " || ";
			default:
				return " == ";
			}
		}

	};
	$.jqueryFilter.getFilterFunction = function(condition) {
		if ($.isArray(condition))
			condition = {
				op : "and",
				rules : condition
			};
		var fnbody = ' return  '
				+ $.jqueryFilter.filterTranslator.translateGroup(condition);
		return new Function("o", fnbody);
	};

})(jQuery);
(function($) {

	$.fn.jqueryForm = function() {
		return $.jqueryui.run.call(this, "jqueryForm", arguments);
	};

	$.jqueryui.getConditions = function(form, options) {
		if (!form)
			return null;
		form = jquery.get($(form));
		if (form && form.toConditions)
			return form.toConditions();
	};

	$.jqueryDefaults = $.jqueryDefaults || {};
	$.jqueryDefaults.Form = {
		width : null,

		inputWidth : 180,

		labelWidth : 90,

		space : 40,
		rightToken : ':',
		
		labelAlign : 'left',

		align : 'left',

		fields : [],

		appendID : true,

		prefixID : null,

		toJSON : $.jqueryui.toJSON,
		labelCss : null,
		fieldCss : null,
		spaceCss : null,
		onAfterSetFields : null,

		buttons : null,
		readonly : false,
		editors : {},

		validate : null,

		unSetValidateAttr : false,
		tab : null
	};

	$.jqueryDefaults.FormString = {
		invalidMessage : 'Error in field {errorCount}, Please double check.',
		detailMessage : 'Details',
		okMessage : 'OK'
	};

	$.jqueryDefaults.Form.editors.textarea = {
		create : function(container, editParm, p) {
			var editor = $('<textarea class="l-textarea" />');
			var id = (p.prefixID || "") + editParm.field.name;
			if ($("#" + id).length) {
				editor = $("#" + id);
			}
			editor.attr({
				id : id,
				name : id
			});
			if (p.readonly)
				editor.attr("readonly", true);
			container.append(editor);
			return editor;
		},
		getValue : function(editor, editParm) {
			return editor.val();
		},
		setValue : function(editor, value, editParm) {
			editor.val(value);
		},
		resize : function(editor, width, height, editParm) {
			editor.css({
				width : width - 2
			}).parent().css("width", "auto");
		}
	};

	$.jqueryDefaults.Form.editors.hidden = {
		create : function(container, editParm, p) {
			var editor = $('<input type = "hidden"  />');
			var id = (p.prefixID || "") + editParm.field.name;
			if ($("#" + id).length) {
				editor = $("#" + id);
			}

			editor.attr($.extend({
				id : id,
				name : id
			}, editParm.field.attr));

			if (editParm.field.options && editParm.field.options.value) {
				editor.val(editParm.field.options.value);
			}
			container.append(editor);
			return editor;
		},
		getValue : function(editor, editParm) {
			return editor.val();
		},
		setValue : function(editor, value, editParm) {
			editor.val(value);
		}
	};

	$.jqueryDefaults.Form_fields = {
		name : null,
		textField : null,
		type : null,
		editor : null,
		label : null,
		hideSpace : false,
		hideLabel : false,
		rightToken : null,
		newline : true,
		op : null,
		vt : null,
		attr : null,
		validate : null
	};

	$.jqueryDefaults.Form_editor = {};

	$.jqueryDefaults.Form.editorBulider = function(jinput) {

		var g = this, p = this.options;
		var options = {}, ltype = jinput.attr("ltype"), field = {};
		if (p.readonly)
			options.readonly = true;
		options = $.extend({
			width : (field.width || p.inputWidth) - 2
		}, field.options, field.editor, options);
		if (ltype == "autocomplete")
			options.autocomplete = true;
		if (jinput.is("select")) {
			jinput.jqueryComboBox(options);
		} else if (jinput.is(":password")) {
			jinput.jqueryTextBox(options);
		} else if (jinput.is(":text")) {
			switch (ltype) {
			case "select":
			case "combobox":
			case "autocomplete":
				jinput.jqueryComboBox(options);
				break;
			case "spinner":
				jinput.jquerySpinner(options);
				break;
			case "date":
				jinput.jqueryDateEditor(options);
				break;
			case "popup":
				jinput.jqueryPopupEdit(options);
				break;
			case "currency":
				options.currency = true;
			case "float":
			case "number":
				options.number = true;
				jinput.jqueryTextBox(options);
				break;
			case "int":
			case "digits":
				options.digits = true;
			default:
				jinput.jqueryTextBox(options);
				break;
			}
		} else if (jinput.is(":radio")) {
			jinput.jqueryRadio(options);
		} else if (jinput.is(":checkbox")) {
			jinput.jqueryCheckBox(options);
		} else if (jinput.is("textarea")) {
			jinput.addClass("l-textarea");
		}
	}

	$.jqueryui.controls.Form = function(element, options) {
		$.jqueryui.controls.Form.base.constructor.call(this, element, options);
	};

	$.jqueryui.controls.Form
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						__getType : function() {
							return 'Form'
						},
						__idPrev : function() {
							return 'Form';
						},
						_init : function() {
							var g = this, p = this.options;
							$.jqueryui.controls.Form.base._init.call(this);

							for ( var type in jquery.editors) {
								var editor = jquery.editors[type];

								if (!editor || type in p.editors)
									continue;
								p.editors[type] = jquery.getEditor($.extend({
									type : type,
									master : g
								}, editor));
							}
						},
						_render : function() {
							var g = this, p = this.options;
							var jform = $(this.element);
							g.form = jform.is("form") ? jform : jform
									.parents("form:first");

							$("input,select,textarea", jform).each(function() {
								p.editorBulider.call(g, $(this));
							});
							g.set(p);
							g.initValidate();
							if (p.buttons) {
								var jbuttons = $(
										'<ul class="l-form-buttons"></ul>')
										.appendTo(jform);
								$(p.buttons).each(
										function() {
											var jbutton = $(
													'<li><div></div></li>')
													.appendTo(jbuttons);
											$("div:first", jbutton)
													.jqueryButton(this);
										});
							}

							if (!g.element.id)
								g.element.id = g.id;

							$("#" + g.element.id + " .togglebtn").live(
									'click',
									function() {
										if ($(this).hasClass("togglebtn-down"))
											$(this).removeClass(
													"togglebtn-down");
										else
											$(this).addClass("togglebtn-down");
										var boxs = $(this).parent().nextAll(
												"ul,div");
										for (var i = 0; i < boxs.length; i++) {
											var jbox = $(boxs[i]);
											if (jbox.hasClass("l-group"))
												break;
											if ($(this).hasClass(
													"togglebtn-down")) {
												jbox.hide();
											} else {
												jbox.show();
											}

										}
									});
						},
						_setWidth : function(value) {
							var g = this, p = this.options;
							if (value)
								g.form.width(value);
						},
						getEditor : function(name) {
							var g = this, p = this.options;
							if (!g.editors)
								return;
							var o = find(null);
							if (o)
								return o;
							if (p.tab && p.tab.items) {
								for (var i = 0; i < p.tab.items.length; i++) {
									var item = p.tab.items[i];
									var o = find(item, i);
									if (o)
										return o;
								}
							}
							return null;
							function find(tabitem, tabindex) {
								var fields = tabitem == null ? p.fields
										: tabitem.fields;
								for (var i = 0, l = fields.length; i < l; i++) {
									var field = fields[i];
									var eIndex = tabindex == null ? i : "tab"
											+ tabindex + "_" + i;
									if (field.name == name && g.editors[eIndex]) {
										return g.editors[eIndex].control;
									}
								}
							}
						},
						getField : function(index) {
							var g = this, p = this.options;
							if (!p.fields)
								return null;
							return p.fields[index];
						},
						toConditions : function() {
							var g = this, p = this.options;
							var conditions = [];
							$(p.fields)
									.each(
											function(fieldIndex, field) {
												var name = field.name, textField = field.textField, editor = g.editors[fieldIndex];
												if (!editor || !name)
													return;
												var value = editor.editor
														.getValue(
																editor.control,
																{
																	field : field
																});
												if (value != null
														&& value !== "") {
													conditions.push({
														op : field.operator
																|| "like",
														field : name,
														value : value,
														type : field.type
																|| "string"
													});
												}
											});
							return conditions;
						},

						_preSetFields : function(fields) {
							var g = this, p = this.options, lastVisitedGroup = null, lastVisitedGroupIcon = null;

							$(p.fields)
									.each(
											function(i, field) {
												if (p.readonly
														|| field.readonly
														|| (field.editor && field.editor.readonly))
													delete field.validate;
												if (field.type == "hidden")
													return;
												field.type = field.type
														|| "text";
												if (field.newline == null)
													field.newline = true;
												if (lastVisitedGroup
														&& !field.group) {
													field.group = lastVisitedGroup;
													field.groupicon = lastVisitedGroupIcon;
												}
												if (field.group) {
													field.group = field.group
															.toString()
															.replace(/^\s\s*/,
																	'')
															.replace(/\s\s*$/,
																	'');
													lastVisitedGroup = field.group;
													lastVisitedGroupIcon = field.groupicon;
												}
											});

						},
						_setReadonly : function(readonly) {
							var g = this, p = this.options;
							if (readonly && g.editors) {
								for ( var index in g.editors) {
									var control = g.editors[index].control;
									if (control && control._setReadonly)
										control._setReadonly(true);
								}
							}
						},
						_setFields : function(fields) {
							var g = this, p = this.options;
							if ($.isFunction(p.prefixID))
								p.prefixID = p.prefixID(g);
							var jform = $(g.element).addClass("l-form");
							g._initFieldsValidate({
								fields : fields
							});
							g._initFieldsHtml({
								panel : jform,
								fields : fields
							});
							g._createEditors({
								fields : fields
							});
							g.trigger('afterSetFields');
						},
						_initFieldsValidate : function(e) {
							var g = this, p = this.options;
							var fields = e.fields;
							g.validate = g.validate || {};
							if (fields && fields.length) {
								$(fields)
										.each(
												function(index, field) {
													var name = field.name, readonly = (field.readonly || (field.editor && field.editor.readonly)) ? true
															: false, txtInputName = (p.prefixID || "")
															+ (field.textField
																	|| field.id || field.name);
													if (field.validate
															&& !readonly) {
														g.validate.rules = g.validate.rules
																|| {};
														g.validate.rules[txtInputName] = field.validate;
														if (field.validateMessage) {
															g.validate.messages = g.validate.messages
																	|| {};
															g.validate.messages[txtInputName] = field.validateMessage;
														}
													}
												});
							}
						},
						_initFieldsHtml : function(e) {
							var g = this, p = this.options;
							var jform = e.panel, fields = e.fields, idPrev = e.idPrev
									|| g.id;
							$(">.l-form-container", jform).remove();
							var lineWidth = 0, maxWidth = 0;
							if (fields && fields.length) {
								g._preSetFields(fields);
								var out = [ '<div class="l-form-container">' ], appendULStartTag = false, lastVisitedGroup = null, groups = [];
								$(fields).each(function(index, field) {
									if ($.inArray(field.group, groups) == -1)
										groups.push(field.group);
								});
								$(groups)
										.each(
												function(groupIndex, group) {
													$(fields)
															.each(
																	function(i,
																			field) {
																		if (field.group != group)
																			return;
																		var index = $
																				.inArray(
																						field,
																						fields);
																		var name = field.id
																				|| field.name, newline = field.newline;
																		var inputName = (p.prefixID || "")
																				+ (field.id || field.name);
																		if (!name)
																			return;
																		if (field.type == "hidden") {
																			if (!$("#"
																					+ inputName).length)
																				out
																						.push('<div style="display:none" id="'
																								+ (idPrev
																										+ "|" + i)
																								+ '"></div>');
																			return;
																		}
																		var toAppendGroupRow = field.group
																				&& field.group != lastVisitedGroup;
																		if (index == 0
																				|| toAppendGroupRow)
																			newline = true;
																		if (newline) {
																			lineWidth = 0;
																			if (appendULStartTag) {
																				out
																						.push('</ul>');
																				appendULStartTag = false;
																			}
																			if (toAppendGroupRow) {
																				out
																						.push('<div class="l-group');
																				if (field.groupicon)
																					out
																							.push(' l-group-hasicon');
																				out
																						.push('">');
																				if (field.groupicon)
																					out
																							.push('<img src="'
																									+ field.groupicon
																									+ '" />');
																				out
																						.push('<span>'
																								+ field.group
																								+ '</span></div>');
																				lastVisitedGroup = field.group;
																			}
																			out
																					.push('<ul>');
																			appendULStartTag = true;
																		}
																		out
																				.push('<li class="l-fieldcontainer');
																		if (newline) {
																			out
																					.push(' l-fieldcontainer-first');
																		}
																		out
																				.push('"');
																		out
																				.push(' fieldindex='
																						+ index);
																		out
																				.push('><ul>');
																		if (!field.hideLabel) {
																			out
																					.push(g
																							._buliderLabelContainer(
																									field,
																									index));
																		}

																		out
																				.push(g
																						._buliderControlContainer(
																								field,
																								index,
																								e.idPrev));

																		if (field.afterContent) {
																			var afterContent = $
																					.isFunction(field.afterContent) ? field
																					.afterContent(field)
																					: field.afterContent;
																			afterContent
																					&& out
																							.push(afterContent);
																		}

																		if (!field.hideSpace) {
																			out
																					.push(g
																							._buliderSpaceContainer(
																									field,
																									index));
																		}
																		out
																				.push('</ul></li>');

																		lineWidth += (field.width
																				|| p.inputWidth || 0);
																		lineWidth += (field.space
																				|| p.space || 0);
																		lineWidth += (field.labelWidth
																				|| p.labelWidth || 0);
																		if (lineWidth > maxWidth)
																			maxWidth = lineWidth;
																	});
												});
								if (appendULStartTag) {
									out.push('</ul>');
									appendULStartTag = false;
								}
								out.push('</div>');
								jform.append(out.join(''));
								if (!p.width || maxWidth > p.width) {

								}
								$(".l-group .togglebtn", jform).remove();
								$(".l-group", jform)
										.width(jform.width() * 0.95)
										.append("<div class='togglebtn'></div>");
							}
						},
						_createEditors : function(e) {
							var g = this, p = this.options;
							var fields = e.fields, idPrev = e.idPrev || g.id, editPrev = e.editPrev
									|| "";
							g.editors = g.editors || {};
							$(fields)
									.each(
											function(fieldIndex, field) {
												var container = $(
														"#" + idPrev + "\\|"
																+ fieldIndex,
														g.element).get(0), editor = p.editors[field.type], editId = editPrev
														+ fieldIndex;
												if (!container)
													return;
												container = $(container);
												var editorControl = g
														._createEditor(
																editor,
																container,
																{
																	field : field
																},
																container
																		.width(),
																container
																		.height());
												if (!editorControl)
													return;
												if (g.editors[editId]
														&& g.editors[editId].control
														&& g.editors[editId].control.destroy) {
													g.editors[editId].control
															.destroy();
												}
												g.editors[editId] = {
													control : editorControl,
													editor : editor
												};
											});
						},
						getChanges : function() {

							var g = this, p = this.options;
							var originData = g.data;
							var curData = g.getData();
							g.data = originData;

							var c = {};
							for ( var k in originData) {
								if (curData[k] != originData[k])
									c[k] = curData[k];
							}
							return c;
						},
						setEnabled : function(arg, isEnabled) {
							var fieldNames = [];
							if ($.isArray(arg))
								fieldNames = arg;
							if (typeof (arg) == "string")
								fieldNames.push(arg);
							var g = this, p = this.options;
							setEnabledInFields(p.fields);
							if (p.tab && p.tab.items) {
								for (var i = 0; i < p.tab.items.length; i++) {
									var item = p.tab.items[i];
									setEnabledInFields(item.fields, i);
								}
							}
							function setEnabledInFields(fields, tabIndex) {
								$(fields)
										.each(
												function(fieldIndex, field) {
													var name = field.name, textField = field.textField, editPrev = tabIndex == null ? ""
															: "tab" + tabIndex
																	+ "_", editor = g.editors[editPrev
															+ fieldIndex];
													if (!editor || !name)
														return;
													if (!editor.editor
															|| !editor.editor.setEnabled)
														return;
													if ($.inArray(name,
															fieldNames) == -1)
														return;
													editor.editor.setEnabled(
															editor.control,
															isEnabled);
												});
							}
						},
						setVisible : function(arg, isVisible) {
							var fieldNames = [];
							if ($.isArray(arg))
								fieldNames = arg;
							if (typeof (arg) == "string")
								fieldNames.push(arg);
							var g = this, p = this.options;
							setVisibleInFields(p.fields);
							if (p.tab && p.tab.items) {
								for (var i = 0; i < p.tab.items.length; i++) {
									var item = p.tab.items[i];
									setVisibleInFields(item.fields, i);
								}
							}
							function setVisibleInFields(fields, tabIndex) {
								$(fields)
										.each(
												function(fieldIndex, field) {
													var name = field.name;
													if ($.inArray(name,
															fieldNames) == -1)
														return;
													g._setFieldPanelVisible(
															tabIndex,
															fieldIndex,
															isVisible);
												});
							}
						},
						_setFieldPanelVisible : function(tabindex, fieldindex,
								visible) {
							var g = this, p = this.options;
							if (tabindex == null) {
								$("li.l-fieldcontainer[fieldindex="
										+ fieldindex + "]", g.element)[visible ? 'show'
										: 'hide']();
							} else {
								$("div.ui-tabs-panel[data-index=" + tabindex
										+ "] li.l-fieldcontainer[fieldindex="
										+ fieldindex + "]", g.element)[visible ? 'show'
										: 'hide']();
							}
						},
						getData : function() {
							var g = this, p = this.options;
							g.data = {};
							getFieldValueToData(p.fields);
							if (p.tab && p.tab.items) {
								for (var i = 0; i < p.tab.items.length; i++) {
									var item = p.tab.items[i];
									getFieldValueToData(item.fields, i);
								}
							}
							function getFieldValueToData(fields, tabIndex) {
								$(fields)
										.each(
												function(fieldIndex, field) {
													var name = field.name, textField = field.textField, editPrev = tabIndex == null ? ""
															: "tab" + tabIndex
																	+ "_", editor = g.editors[editPrev
															+ fieldIndex];
													if (!editor)
														return;
													if (name) {
														var value = editor.editor
																.getValue(
																		editor.control,
																		{
																			field : field
																		});
														g._setValueByName(
																g.data, name,
																value);
													}
													if (textField) {
														var value = editor.editor
																.getText(
																		editor.control,
																		{
																			field : field
																		});
														g._setValueByName(
																g.data,
																textField,
																value);
													}
												});
							}
							return g.data;
						},
						_setData : function(data) {
							this.setData(data);
						},
						setData : function(data) {
							var g = this, p = this.options;
							g.data = data || {};
							setDataToFields(p.fields);
							if (p.tab && p.tab.items) {
								for (var i = 0; i < p.tab.items.length; i++) {
									var item = p.tab.items[i];
									setDataToFields(item.fields, i);
								}
							}
							function setDataToFields(fields, tabIndex) {
								$(fields)
										.each(
												function(fieldIndex, field) {
													var name = field.name, textField = field.textField, editPrev = tabIndex == null ? ""
															: "tab" + tabIndex
																	+ "_", editor = g.editors[editPrev
															+ fieldIndex];
													if (!editor)
														return;
													if (name
															&& (name in g.data)) {
														var value = g
																._getValueByName(
																		g.data,
																		name);
														editor.editor
																.setValue(
																		editor.control,
																		value,
																		{
																			field : field
																		});
													}
													if (textField
															&& (textField in g.data)) {
														var text = g
																._getValueByName(
																		g.data,
																		textField);
														editor.editor
																.setText(
																		editor.control,
																		text,
																		{
																			field : field
																		});
													}
												});
							}
						},
						_setValueByName : function(data, name, value) {
							if (!data || !name)
								return null;
							if (name.indexOf('.') == -1) {
								data[name] = value;
							} else {
								try {
									new Function("data,value", "data." + name
											+ "=value;")(data, value);
								} catch (e) {
								}
							}
						},
						_getValueByName : function(data, name) {
							if (!data || !name)
								return null;
							if (name.indexOf('.') == -1) {
								return data[name];
							} else {
								try {
									return new Function("data", "return data."
											+ name + ";")(data);
								} catch (e) {
									return null;
								}
							}
						},

						valid : function() {
							var g = this, p = this.options;
							if (!g.form || !g.validator)
								return true;
							return g.form.valid();
						},
						showFieldError : function(name, errorText) {
							var element = $("[name=" + name + "]", this.element);
							if (element.hasClass("l-textarea")) {
								element.addClass("l-textarea-invalid");
							} else if (element.hasClass("l-text-field")) {
								element.parent().addClass("l-text-invalid");
							}
							$(element).removeAttr("title").jqueryHideTip();
							$(element).attr("title", errorText).jqueryTip({
								distanceX : 5,
								distanceY : -3,
								auto : true
							});
						},
						hideFieldError : function(name) {
							var element = $("[name=" + name + "]", this.element);
							if (element.hasClass("l-textarea")) {
								element.removeClass("l-textarea-invalid");
							} else {
								element.parent().removeClass("l-text-invalid");
							}
							$(element).removeAttr("title").jqueryHideTip();
						},

						initValidate : function() {
							var g = this, p = this.options;
							if (!g.form || !p.validate || !g.form.validate) {
								g.validator = null;
								return;
							}
							var validate = p.validate == true ? {} : p.validate;
							var validateOptions = $
									.extend(
											{
												errorPlacement : function(
														lable, element) {
													if (!$(lable).html()) {
														return;
													}
													if (!element.attr("id")) {
														var eleid = new Date()
																.getTime();
														element.attr("id",
																eleid);
														lable
																.attr("for",
																		eleid);
													}
													if (element
															.hasClass("l-textarea")) {
														element
																.addClass("l-textarea-invalid");
													} else if (element
															.hasClass("l-text-field")) {
														element
																.parent()
																.addClass(
																		"l-text-invalid");
													}
													$(element).removeAttr(
															"title")
															.jqueryHideTip();
													$(element).attr("title",
															$(lable).html())
															.jqueryTip({
																distanceX : 5,
																distanceY : -3,
																auto : true
															});
												},
												success : function(lable) {
													var eleId = lable
															.attr("for");
													if (!eleId)
														return;
													var element = $("#" + eleId);
													if (element
															.hasClass("l-textarea")) {
														element
																.removeClass("l-textarea-invalid");
													} else {
														element
																.parent()
																.removeClass(
																		"l-text-invalid");
													}
													$(element).removeAttr(
															"title")
															.jqueryHideTip();
												}
											}, validate, {
												rules : g.validate.rules,
												messages : g.validate.messages
											});
							g.validator = g.form.validate(validateOptions);
						},
						setFieldValidate : function(name, validate, messages) {
							var jele = $("[name=" + name + "]");
							if (!jele.length || !jele.rules)
								return;
							var oldRule = jele.rules("remove");
							if (oldRule) {
								if (jele.hasClass("l-text-field")) {
									jele.parent().removeClass("l-text-invalid");
								}
								jele.removeAttr("title").jqueryHideTip();
								if (oldRule.required) {
									jele.parents("li:first").next("li:first")
											.find(".l-star").remove();
								}
							}
							if (!validate) {
								return;
							}
							var rule = $.extend({}, validate, {
								messages : messages
							});
							jele.rules("add", rule);
							if (validate.required) {

								jele
										.parents("li:first")
										.next("li:first")
										.append('<span class="l-star">*</span>');
							}
						},

						showInvalid : function() {
							var g = this, p = this.options;
							if (!g.validator)
								return;
							var jmessage = $('<div><div class="invalid">'
									+ p.invalidMessage.replace('{errorCount}',
											g.validator.errorList.length)
									+ '<a class="viewInvalidDetail" href="javascript:void(0)">'
									+ p.detailMessage
									+ '</a></div><div class="invalidDetail" style="display:none;">'
									+ getInvalidInf(g.validator.errorList)
									+ '</div></div>');
							jmessage.find("a.viewInvalidDetail:first").bind(
									'click',
									function() {
										$(this).parent().next(
												"div.invalidDetail").toggle();
									});
							$.jqueryDialog.open({
								type : 'error',
								width : 350,
								showMax : false,
								showToggle : false,
								showMin : false,
								target : jmessage,
								buttons : [ {
									text : p.okMessage,
									onclick : function(item, dailog) {
										dailog.close();
									}
								} ]
							});
						},
						_createEditor : function(editorBuilder, container,
								editParm, width, height) {
							var g = this, p = this.options;
							try {
								var editor = editorBuilder.create.call(this,
										container, editParm, p);
								if (editor && editorBuilder.resize)
									editorBuilder.resize.call(this, editor,
											width, height, editParm);
								return editor;
							} catch (e) {
								return null;
							}
						},

						_buliderLabelContainer : function(field) {
							var g = this, p = this.options;
							var label = field.label || field.display;
							var labelWidth = field.labelWidth
									|| field.labelwidth || p.labelWidth;
							var labelAlign = field.labelAlign || p.labelAlign;
							if (label)
								label += field.rightToken || p.rightToken;
							var out = [];
							out.push('<li');
							if (p.labelCss) {
								out.push(' class="' + p.labelCss + '"');
							}
							out.push(' style="');
							if (/px$/i.test(labelWidth)
									|| /auto/i.test(labelWidth)
									|| /%$/i.test(labelWidth)) {
								out.push('width:' + labelWidth + ';');
							} else if (labelWidth) {
								out.push('width:' + labelWidth + 'px;');
							}
							if (labelAlign) {
								out.push('text-align:' + labelAlign + ';');
								out.push('margin-right:10px;');
								
							}

							out.push('">');
							if (label) {
								out.push(label);
							}
							out.push('</li>');
							return out.join('');
						},

						_buliderControlContainer : function(field, fieldIndex,
								idPrev) {
							var g = this, p = this.options;
							var width = field.width || p.inputWidth, align = field.align
									|| field.textAlign
									|| field.textalign
									|| p.align, out = [], idPrev = idPrev
									|| g.id;
							out.push('<li');
							out.push(' id="' + (idPrev + "|" + fieldIndex)
									+ '"');
							if (p.fieldCss) {
								out.push(' class="' + p.fieldCss + '"');
							}
							out.push(' style="');
							if (width) {
								out.push('width:' + width + 'px;');
							}
							if (align) {
								out.push('text-align:' + align + ';');
							}
							out.push('">');
							out.push('</li>');
							return out.join('');
						},

						_buliderSpaceContainer : function(field) {
							var g = this, p = this.options;
							var spaceWidth = field.space || field.spaceWidth
									|| p.space;
							if (field.space === 0 || field.spaceWidth === 0)
								spaceWidth = 0;
							var out = [];
							out.push('<li');
							if (p.spaceCss) {
								out.push(' class="' + p.spaceCss + '"');
							}
							out.push(' style="');
							if (/px$/i.test(spaceWidth)
									|| /auto/i.test(spaceWidth)
									|| /%$/i.test(spaceWidth)) {
								out.push('width:' + spaceWidth + ';');
							}
							if (spaceWidth) {
								out.push('width:' + spaceWidth + 'px;');
							}
							out.push('">');
							if (field.validate && field.validate.required) {
								out.push("<span class='l-star'>*</span>");
							}
							out.push('</li>');
							return out.join('');
						},
						_getInputAttrHtml : function(field) {
							var out = [], type = (field.type || "text")
									.toLowerCase();
							if (type == "textarea") {
								field.cols
										&& out.push('cols="' + field.cols
												+ '" ');
								field.rows
										&& out.push('rows="' + field.rows
												+ '" ');
							}
							out.push('ltype="' + type + '" ');
							field.op && out.push('op="' + field.op + '" ');
							field.vt && out.push('vt="' + field.vt + '" ');
							if (field.attr) {
								for ( var attrp in field.attr) {
									out.push(attrp + '="' + field.attr[attrp]
											+ '" ');
								}
							}
							return out.join('');
						},
						_setTab : function(tab) {
							var g = this, p = this.options;
							if (!tab || !tab.items)
								return;
							var jtab = $('<div class="l-form-tabs"></div>')
									.appendTo(g.element);
							var jtabNav = $(
									'<ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" original-title="">')
									.appendTo(jtab);
							for (var i = 0; i < tab.items.length; i++) {
								var tabItem = tab.items[i], jnavItem = $(
										'<li class="ui-state-default ui-corner-top"><a href="javascript:void(0)"></a></li>')
										.appendTo(jtabNav), jcontentItem = $(
										'<div class="ui-tabs-panel ui-widget-content ui-corner-bottom">')
										.appendTo(jtab), idPrev = g.id + "|tdb"
										+ i;
								jnavItem.add(jcontentItem)
										.attr("data-index", i);
								jnavItem.find("a:first").text(tabItem.title);
								g._initFieldsValidate({
									fields : tabItem.fields
								});
								g._initFieldsHtml({
									panel : jcontentItem,
									fields : tabItem.fields,
									idPrev : idPrev
								});
								g._createEditors({
									fields : tabItem.fields,
									idPrev : idPrev,
									editPrev : 'tab' + i + "_"
								});
							}
							jtabNav.find("li").hover(function() {
								$(this).addClass("ui-state-active");
							}, function() {
								$(this).removeClass("ui-state-active");
							}).click(function() {
								var index = $(this).attr("data-index");
								g.selectTab(index);
							});
							g.selectTab(0);
						},
						selectTab : function(index) {
							var g = this, p = this.options;
							var jtab = $(g.element).find(".l-form-tabs:first");
							var links = jtab.find(".ui-tabs-nav li"), contents = jtab
									.find(".ui-tabs-panel");
							links
									.filter("[data-index=" + index + "]")
									.addClass(
											"ui-tabs-selected ui-state-active ui-state-hover");
							links
									.filter("[data-index!=" + index + "]")
									.removeClass(
											"ui-tabs-selected ui-state-active ui-state-hover");
							contents.filter("[data-index=" + index + "]")
									.show();
							contents.filter("[data-index!=" + index + "]")
									.hide();
						}
					});

	function getInvalidInf(errorList) {
		var out = [];
		$(errorList).each(
				function(i, error) {
					var label = $(error.element).parents("li:first").prev(
							"li:first").html();
					var message = error.message;
					out.push('<div>' + label + ' ' + message + '</div>');
				});
		return out.join('');
	}

})(jQuery);

(function($) {
	var l = $.jqueryui;

	$.fn.jqueryGrid = function(options) {
		return $.jqueryui.run.call(this, "jqueryGrid", arguments);
	};

	$.fn.jqueryGetGridManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetGridManager", arguments);
	};

	$.jqueryDefaults.Grid = {
		title : null,
		width : 'auto',
		height : 'auto',
		columnWidth : null,
		resizable : true,
		url : false,
		data : null,
		usePager : true,
		page : 1,
		pageSize : 10,
		pageSizeOptions : [5, 10, 20, 30, 40, 50 ],
		parms : [],
		columns : [],
		minColToggle : 1,
		dataType : 'server',
		dataAction : 'server',
		showTableToggleBtn : false,
		switchPageSizeApplyComboBox : false,
		allowAdjustColWidth : true,
		checkbox : false,
		allowHideColumn : true,
		enabledEdit : false,
		isScroll : true,
		dateFormat : 'yyyy-MM-dd',
		inWindow : true,
		statusName : '__status',
		method : 'post',
		async : true,
		fixedCellHeight : true,
		heightDiff : 0,
		cssClass : null,
		root : 'Rows',
		record : 'Total',
		pageParmName : 'page',
		pagesizeParmName : 'pagesize',
		sortnameParmName : 'sortname',
		sortorderParmName : 'sortorder',
		allowUnSelectRow : false,
		alternatingRow : true,
		mouseoverRowCssClass : 'l-grid-row-over',
		enabledSort : true,
		rowAttrRender : null,
		groupColumnName : null,
		groupColumnDisplay : 'Group',
		groupRender : null,
		totalRender : null,
		delayLoad : false,
		where : null,
		selectRowButtonOnly : false,
		whenRClickToSelect : false,
		contentType : null,
		checkboxColWidth : 27,
		detailColWidth : 29,
		clickToEdit : true,
		detailToEdit : false,
		onEndEdit : null,
		minColumnWidth : 80,
		tree : null,
		isChecked : null,
		isSelected : null,
		frozen : true,
		frozenDetail : false,
		frozenCheckbox : true,
		detail : null,
		detailHeight : 260,
		isShowDetailToggle : null,
		rownumbers : false,
		frozenRownumbers : true,
		rownumbersColWidth : 26,
		colDraggable : false,
		rowDraggable : false,
		rowDraggingRender : null,
		autoCheckChildren : true,
		onRowDragDrop : null,
		rowHeight : 30,
		headerRowHeight : 28,
		toolbar : null,
		toolbarShowInLeft : true,
		headerImg : null,
		editorTopDiff : 0,
		unSetValidateAttr : true,
		autoFilter : false,
		onDragCol : null,
		onToggleCol : null,
		onChangeSort : null,
		onSuccess : null,
		onDblClickRow : null,
		onSelectRow : null,
		onUnSelectRow : null,
		onBeforeCheckRow : null,
		onCheckRow : null,
		onBeforeCheckAllRow : null,
		onCheckAllRow : null,
		onBeforeShowData : null,
		onAfterShowData : null,
		onError : null,
		onSubmit : null,
		onReload : null,
		onToFirst : null,
		onToPrev : null,
		onToNext : null,
		onToLast : null,
		onAfterAddRow : null,
		onBeforeEdit : null,
		onBeforeSubmitEdit : null,
		onAfterEdit : null,
		onLoading : null,
		onLoaded : null,
		onContextmenu : null,
		onBeforeCancelEdit : null,
		onAfterSubmitEdit : null,
		onRowDragDrop : null,
		onGroupExtend : null,
		onGroupCollapse : null,
		onTreeExpand : null,
		onTreeCollapse : null,
		onTreeExpanded : null,
		onTreeCollapsed : null,
		onLoadData : null
	};
	$.jqueryDefaults.GridString = {
		errorMessage : 'ERROR',
		pageStatMessage : 'Start from {from} to {to}',
		pageTextMessage : 'Page',
		loadingMessage : 'Loading...',
		findTextMessage : 'Search',
		noRecordMessage : 'No result searched',
		isContinueByDataChanged : 'Data has been changed. Data might be lost if continue?',
		cancelMessage : 'Cancel',
		saveMessage : 'Save',
		applyMessage : 'Apply',
		draggingMessage : 'Line {count}'
	};

	$.jqueryDefaults.Grid_columns = {
		id : null,
		name : null,
		totalSummary : null,
		display : null,
		headerRender : null,
		isAllowHide : true,
		isSort : false,
		type : null,
		columns : null,
		width : 120,
		minWidth : 80,
		format : null,
		align : 'left',
		hide : false,
		editor : null,
		render : null,
		textField : null
	};
	$.jqueryDefaults.Grid_editor = {
		type : null,
		ext : null,
		onChange : null,
		onChanged : null
	};

	$.jqueryMethos.Grid = $.jqueryMethos.Grid || {};

	$.jqueryDefaults.Grid.sorters = $.jqueryDefaults.Grid.sorters || {};

	$.jqueryDefaults.Grid.formatters = $.jqueryDefaults.Grid.formatters || {};

	$.jqueryDefaults.Grid.editors = $.jqueryDefaults.Grid.editors || {};

	$.jqueryDefaults.Grid.sorters['date'] = function(val1, val2) {
		return val1 < val2 ? -1 : val1 > val2 ? 1 : 0;
	};
	$.jqueryDefaults.Grid.sorters['int'] = function(val1, val2) {
		return parseInt(val1) < parseInt(val2) ? -1
				: parseInt(val1) > parseInt(val2) ? 1 : 0;
	};
	$.jqueryDefaults.Grid.sorters['float'] = function(val1, val2) {
		return parseFloat(val1) < parseFloat(val2) ? -1
				: parseFloat(val1) > parseFloat(val2) ? 1 : 0;
	};
	$.jqueryDefaults.Grid.sorters['string'] = function(val1, val2) {
		if (!val1)
			return false;
		return val1.localeCompare(val2);
	};

	$.jqueryDefaults.Grid.formatters['date'] = function(value, column) {
		function getFormatDate(date, dateformat) {
			var g = this, p = this.options;
			if (isNaN(date))
				return null;
			var format = dateformat;
			var o = {
				"M+" : date.getMonth() + 1,
				"d+" : date.getDate(),
				"h+" : date.getHours(),
				"m+" : date.getMinutes(),
				"s+" : date.getSeconds(),
				"q+" : Math.floor((date.getMonth() + 3) / 3),
				"S" : date.getMilliseconds()
			}
			if (/(y+)/.test(format)) {
				format = format.replace(RegExp.$1, (date.getFullYear() + "")
						.substr(4 - RegExp.$1.length));
			}
			for ( var k in o) {
				if (new RegExp("(" + k + ")").test(format)) {
					format = format.replace(RegExp.$1,
							RegExp.$1.length == 1 ? o[k] : ("00" + o[k])
									.substr(("" + o[k]).length));
				}
			}
			return format;
		}
		if (!value)
			return "";

		if (typeof (value) == "string" && /^\/Date/.test(value)) {
			value = value.replace(/^\//, "new ").replace(/\/$/, "");
			eval("value = " + value);
		}
		if (value instanceof Date) {
			var format = column.format || this.options.dateFormat
					|| "yyyy-MM-dd";
			return getFormatDate(value, format);
		} else {
			return value.toString();
		}
	}

	$.jqueryui.controls.Grid = function(element, options) {
		$.jqueryui.controls.Grid.base.constructor.call(this, element, options);
	};

	$.jqueryui.controls.Grid
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						__getType : function() {
							return '$.jqueryui.controls.Grid';
						},
						__idPrev : function() {
							return 'grid';
						},
						_extendMethods : function() {
							return $.jqueryMethos.Grid;
						},
						_init : function() {
							$.jqueryui.controls.Grid.base._init.call(this);
							var g = this, p = this.options;
							p.dataType = p.url ? "server" : "local";
							if (p.dataType == "local") {
								p.data = p.data || [];
								p.dataAction = "local";
							}
							if (p.isScroll == false) {
								p.height = 'auto';
							}
							if (!p.frozen) {
								p.frozenCheckbox = false;
								p.frozenDetail = false;
								p.frozenRownumbers = false;
							}
							if (p.detailToEdit) {
								p.enabledEdit = true;
								p.clickToEdit = false;
								p.detail = {
									height : 'auto',
									onShowDetail : function(record, container,
											callback) {
										$(container).addClass(
												"l-grid-detailpanel-edit");
										g
												.beginEdit(
														record,
														function(rowdata,
																column) {
															var editContainer = $("<div class='l-editbox'></div>");
															editContainer
																	.width(120)
																	.height(
																			p.rowHeight + 1);
															editContainer
																	.appendTo(container);
															return editContainer;
														});
										function removeRow() {
											$(container).parent().parent()
													.remove();
											g.collapseDetail(record);
										}
										$("<div class='l-clear'></div>")
												.appendTo(container);
										$(
												"<div class='l-button'>"
														+ p.saveMessage
														+ "</div>").appendTo(
												container).click(function() {
											g.endEdit(record);
											removeRow();
										});
										$(
												"<div class='l-button'>"
														+ p.applyMessage
														+ "</div>").appendTo(
												container).click(function() {
											g.submitEdit(record);
										});
										$(
												"<div class='l-button'>"
														+ p.cancelMessage
														+ "</div>").appendTo(
												container).click(function() {
											g.cancelEdit(record);
											removeRow();
										});
									}
								};
							}
							if (p.tree) {
								p.tree.childrenName = p.tree.childrenName
										|| "children";
								p.tree.isParent = p.tree.isParent
										|| function(rowData) {
											var exist = p.tree.childrenName in rowData;
											return exist;
										};
								p.tree.isExtend = p.tree.isExtend
										|| function(rowData) {
											if ('isextend' in rowData
													&& rowData['isextend'] == false)
												return false;
											return true;
										};
							}

							for ( var type in jquery.editors) {
								var editor = jquery.editors[type];

								if (!editor || type in p.editors)
									continue;
								p.editors[type] = jquery.getEditor($.extend({
									type : type,
									master : g
								}, editor));
							}
						},
						_render : function() {
							var g = this, p = this.options;
							g.grid = $(g.element);
							g.grid.addClass("l-panel");
							var gridhtmlarr = [];
							gridhtmlarr
									.push("        <div class='l-panel-header'><span class='l-panel-header-text'></span></div>");
							gridhtmlarr
									.push("                    <div class='l-grid-loading'></div>");
							gridhtmlarr
									.push("        <div class='l-panel-topbar' style='display:none'><div class='l-panel-topbarinner'></div></div><div class='l-clear'></div>");
							gridhtmlarr
									.push("        <div class='l-panel-bwarp'>");
							gridhtmlarr
									.push("            <div class='l-panel-body'>");
							gridhtmlarr
									.push("                <div class='l-grid'>");
							gridhtmlarr
									.push("                    <div class='l-grid-dragging-line'></div>");
							gridhtmlarr
									.push("                    <div class='l-grid-popup'><table cellpadding='0' cellspacing='0'><tbody></tbody></table></div>");

							gridhtmlarr
									.push("                  <div class='l-grid1'>");
							gridhtmlarr
									.push("                      <div class='l-grid-header l-grid-header1'>");
							gridhtmlarr
									.push("                          <div class='l-grid-header-inner'><table class='l-grid-header-table' cellpadding='0' cellspacing='0'><tbody></tbody></table></div>");
							gridhtmlarr.push("                      </div>");
							gridhtmlarr
									.push("                      <div class='l-grid-body l-grid-body1'>");
							gridhtmlarr.push("                      </div>");
							gridhtmlarr.push("                  </div>");

							gridhtmlarr
									.push("                  <div class='l-grid2'>");
							gridhtmlarr
									.push("                      <div class='l-grid-header l-grid-header2'>");
							gridhtmlarr
									.push("                          <div class='l-grid-header-inner'><table class='l-grid-header-table' cellpadding='0' cellspacing='0'><tbody></tbody></table></div>");
							gridhtmlarr.push("                      </div>");
							gridhtmlarr
									.push("                      <div class='l-grid-body l-grid-body2 l-scroll'>");
							gridhtmlarr.push("                      </div>");
							gridhtmlarr.push("                  </div>");

							gridhtmlarr.push("                 </div>");
							gridhtmlarr.push("              </div>");
							gridhtmlarr.push("         </div>");
							gridhtmlarr
									.push("         <div class='l-panel-bar'>");
							gridhtmlarr
									.push("            <div class='l-panel-bbar-inner'>");
							gridhtmlarr
									.push("                <div class='l-bar-group  l-bar-message'><span class='l-bar-text'></span></div>");
							gridhtmlarr
									.push("            <div class='l-bar-group l-bar-selectpagesize'></div>");
							gridhtmlarr
									.push("                <div class='l-bar-separator'></div>");
							gridhtmlarr
									.push("                <div class='l-bar-group'>");
							gridhtmlarr
									.push("                    <div class='l-bar-button l-bar-btnfirst'><span></span></div>");
							gridhtmlarr
									.push("                    <div class='l-bar-button l-bar-btnprev'><span></span></div>");
							gridhtmlarr.push("                </div>");
							gridhtmlarr
									.push("                <div class='l-bar-separator'></div>");
							gridhtmlarr
									.push("                <div class='l-bar-group'><span class='pcontrol'> <input type='text' size='4' value='1' style='width:20px' maxlength='3' /> / <span></span></span></div>");
							gridhtmlarr
									.push("                <div class='l-bar-separator'></div>");
							gridhtmlarr
									.push("                <div class='l-bar-group'>");
							gridhtmlarr
									.push("                     <div class='l-bar-button l-bar-btnnext'><span></span></div>");
							gridhtmlarr
									.push("                    <div class='l-bar-button l-bar-btnlast'><span></span></div>");
							gridhtmlarr.push("                </div>");
							gridhtmlarr
									.push("                <div class='l-bar-separator'></div>");
							gridhtmlarr
									.push("                <div class='l-bar-group'>");
							gridhtmlarr
									.push("                     <div class='l-bar-button l-bar-btnload'><span></span></div>");
							gridhtmlarr.push("                </div>");
							gridhtmlarr
									.push("                <div class='l-bar-separator'></div>");

							gridhtmlarr
									.push("                <div class='l-clear'></div>");
							gridhtmlarr.push("            </div>");
							gridhtmlarr.push("         </div>");
							g.grid.html(gridhtmlarr.join(''));

							g.header = $(".l-panel-header:first", g.grid);

							g.body = $(".l-panel-body:first", g.grid);

							g.toolbar = $(".l-panel-bar:first", g.grid);

							g.popup = $(".l-grid-popup:first", g.grid);

							g.gridloading = $(".l-grid-loading:first", g.grid);

							g.draggingline = $(".l-grid-dragging-line", g.grid);

							g.topbar = $(".l-panel-topbarinner:first", g.grid);

							g.gridview = $(".l-grid:first", g.grid);
							g.gridview.attr("id", g.id + "grid");
							g.gridview1 = $(".l-grid1:first", g.gridview);
							g.gridview2 = $(".l-grid2:first", g.gridview);

							g.gridheader = $(".l-grid-header:first",
									g.gridview2);

							g.gridbody = $(".l-grid-body:first", g.gridview2);

							if (p.autoFilter) {
								var item = {
									text : 'search',
									gridid : g.id,
									click : function() {
										g.showFilter();
									},
									icon : 'search2'
								};
								if (p.toolbar && p.toolbar.items) {
									p.toolbar.items.push(item);
								} else {
									p.toolbar = {
										items : [ item ]
									};
								}
							}

							g.f = {};

							g.f.gridheader = $(".l-grid-header:first",
									g.gridview1);

							g.f.gridbody = $(".l-grid-body:first", g.gridview1);

							g.currentData = null;
							g.changedCells = {};
							g.editors = {};
							g.editor = {
								editing : false
							};

							g.cacheData = {};

							if (p.height == "auto") {
								g.bind("SysGridHeightChanged", function() {
									if (g.enabledFrozen())
										g.gridview.height(Math
												.max(g.gridview1.height(),
														g.gridview2.height()));
								});
							}

							var pc = $.extend({}, p);

							this._bulid();
							this._setColumns(p.columns);

							delete pc['columns'];
							delete pc['data'];
							delete pc['url'];
							g.set(pc);
							if (!p.delayLoad) {
								if (p.url)
									g.set({
										url : p.url
									});
								else if (p.data)
									g.set({
										data : p.data
									});
							}
						},
						_setFrozen : function(frozen) {
							if (frozen)
								this.grid.addClass("l-frozen");
							else
								this.grid.removeClass("l-frozen");
						},
						_setCssClass : function(value) {
							this.grid.addClass(value);
						},
						_setLoadingMessage : function(value) {
							this.gridloading.html(value);
						},
						_setToolbar : function(value) {
							var g = this, p = this.options;
							if (value && $.fn.jqueryToolBar) {
								g.topbar.parent().show();
								g.toolbarManager = g.topbar
										.jqueryToolBar(value);
								if (value.title) {
									var jtitle = $("<div class='l-panel-topbartitle'><span>"
											+ value.title + "</span></div>");
									if (value.icon) {
										jtitle
												.append("<img class='l-panel-topbaricon' src='"
														+ value.icon
														+ "'></img>");
										jtitle
												.addClass("l-panel-topbartitle-hasicon");
									}
									g.topbar.parent().append(jtitle);
								}
								if (p.toolbarShowInLeft) {
									g.topbar
											.addClass("l-panel-topbarinner-left");
								}
							} else {
								g.topbar.parent().remove();
							}
						},
						isHorizontalScrollShowed : function() {
							var g = this;
							var inner = g.gridbody
									.find(".l-grid-body-inner:first");
							if (!inner.length)
								return false;

							return g.gridbody.width() - 20 < inner.width();
						},
						_setHeight : function(h) {
							var g = this, p = this.options;
							g.unbind("SysGridHeightChanged");
							if (h == "auto") {
								g.bind("SysGridHeightChanged", function() {
									if (g.enabledFrozen())
										g.gridview.height(Math
												.max(g.gridview1.height(),
														g.gridview2.height()));
								});
								return;
							}
							h = g._calculateGridBodyHeight(h);
							if (h > 0) {
								g.gridbody.height(h);
								g.f.gridbody.height(h);
								var gridHeaderHeight = p.headerRowHeight
										* (g._columnMaxLevel - 1)
										+ p.headerRowHeight - 1;
								g.gridview.height(h + gridHeaderHeight);
							}
							g._updateHorizontalScrollStatus.jqueryDefer(g, 10);
						},
						_calculateGridBodyHeight : function(h) {
							var g = this, p = this.options;
							if (typeof h == "string" && h.indexOf('%') > 0) {
								if (p.inWindow)
									h = $(window).height() * parseInt(h) * 0.01;
								else
									h = g.grid.parent().height() * parseInt(h)
											* 0.01;
							}
							if (p.title)
								h -= 24;
							if (p.usePager)
								h -= 32;
							if (p.totalRender)
								h -= 25;
							if (p.toolbar)
								h -= g.topbar.outerHeight();
							var gridHeaderHeight = p.headerRowHeight
									* (g._columnMaxLevel - 1)
									+ p.headerRowHeight - 1;
							h -= gridHeaderHeight;
							return h;
						},
						_updateHorizontalScrollStatus : function() {
							var g = this, p = this.options;
							if (g.isHorizontalScrollShowed()) {
								g.gridview.addClass("l-grid-hashorizontal");
							} else {
								g.gridview.removeClass("l-grid-hashorizontal");
							}
						},
						_updateFrozenWidth : function() {
							var g = this, p = this.options;
							if (g.enabledFrozen()) {
								g.gridview1.width(g.f.gridtablewidth);
								var view2width = g.gridview.width()
										- g.f.gridtablewidth;
								g.gridview2.css({
									left : g.f.gridtablewidth
								});
								if (view2width > 0)
									g.gridview2.css({
										width : view2width
									});
							}
						},
						_setWidth : function(value) {
							var g = this, p = this.options;
							if (g.enabledFrozen())
								g._onResize();
						},
						_setUrl : function(value) {
							this.options.url = value;
							if (value) {
								this.options.dataType = "server";
								this.loadData(true);
							} else {
								this.options.dataType = "local";
							}
						},
						removeParm : function(name) {
							var g = this;
							var parms = g.get('parms');
							if (!parms)
								parms = {};
							if (parms instanceof Array) {
								removeArrItem(parms, function(p) {
									return p.name == name;
								});
							} else {
								delete parms[name];
							}
							g.set('parms', parms);
						},
						setParm : function(name, value) {
							var g = this;
							var parms = g.get('parms');
							if (!parms)
								parms = {};
							if (parms instanceof Array) {
								removeArrItem(parms, function(p) {
									return p.name == name;
								});
								parms.push({
									name : name,
									value : value
								});
							} else {
								parms[name] = value;
							}
							g.set('parms', parms);
						},
						_setData : function(value) {
							this.loadData(this.options.data);
						},

						loadData : function(loadDataParm) {
							var g = this, p = this.options;
							g.loading = true;
							g.trigger('loadData');
							var clause = null;
							var loadServer = true;
							if (typeof (loadDataParm) == "function") {
								clause = loadDataParm;
								if (g.lastData) {
									g.data = g.lastData;
								} else {
									g.data = g.currentData;
									if (!g.data)
										g.data = {};
									if (!g.data[p.root])
										g.data[p.root] = [];
									g.lastData = g.data;
								}
								loadServer = false;
							} else if (typeof (loadDataParm) == "boolean") {
								loadServer = loadDataParm;
							} else if (typeof (loadDataParm) == "object"
									&& loadDataParm) {
								loadServer = false;
								p.dataType = "local";
								p.data = loadDataParm;
							}

							if (!p.newPage)
								p.newPage = 1;
							if (p.dataAction == "server") {
								if (!p.sortOrder)
									p.sortOrder = "asc";
							}
							var param = [];
							if (p.parms) {
								var parms = $.isFunction(p.parms) ? p.parms()
										: p.parms;
								if (parms.length) {
									$(parms).each(function() {
										param.push({
											name : this.name,
											value : this.value
										});
									});
									for (var i = parms.length - 1; i >= 0; i--) {
										if (parms[i].temp)
											parms.splice(i, 1);
									}
								} else if (typeof parms == "object") {
									for ( var name in parms) {
										param.push({
											name : name,
											value : parms[name]
										});
									}
								}
							}
							if (p.dataAction == "server") {
								if (p.usePager) {
									param.push({
										name : p.pageParmName,
										value : p.newPage
									});
									param.push({
										name : p.pagesizeParmName,
										value : p.pageSize
									});
								}
								if (p.sortName) {
									param.push({
										name : p.sortnameParmName,
										value : p.sortName
									});
									param.push({
										name : p.sortorderParmName,
										value : p.sortOrder
									});
								}
							}
							;
							$(".l-bar-btnload span", g.toolbar).addClass(
									"l-disabled");
							if (p.dataType == "local") {

								g.filteredData = $.extend(true, {}, p.data
										|| g.currentData);
								if (clause)
									g.filteredData[p.root] = g._searchData(
											g.filteredData[p.root], clause);
								if (p.usePager)
									g.currentData = g
											._getCurrentPageData(g.filteredData);
								else {
									g.currentData = g.filteredData;
								}
								g._convertTreeData();
								g._showData();
							} else if (p.dataAction == "local" && !loadServer) {
								if (g.data && g.data[p.root]) {
									g.filteredData = g.data;
									if (clause)
										g.filteredData[p.root] = g._searchData(
												g.filteredData[p.root], clause);
									g.currentData = g
											._getCurrentPageData(g.filteredData);
									g._convertTreeData();
									g._showData();
								}
							} else {
								g.loadServerData(param, clause);

							}
							g.loading = false;
						},
						_convertTreeData : function() {
							var g = this, p = this.options;
							if (p.tree && p.tree.idField
									&& p.tree.parentIDField) {
								g.currentData[p.root] = g.arrayToTree(
										g.currentData[p.root], p.tree.idField,
										p.tree.parentIDField);
								g.currentData[p.record] = g.currentData[p.root].length;
							}
						},
						loadServerData : function(param, clause) {
							var g = this, p = this.options;
							var url = p.url;
							if ($.isFunction(url))
								url = url();
							var ajaxOptions = {
								type : p.method,
								url : url,
								data : param,
								async : p.async,
								dataType : 'json',
								beforeSend : function() {
									if (g.hasBind('loading')) {
										g.trigger('loading');
									} else {
										g.toggleLoading(true);
									}
								},
								success : function(data) {
									g.trigger('success', [ data, g ]);
									if (!data || !data[p.root]
											|| !data[p.root].length) {
										g.currentData = g.data = {};
										g.currentData[p.root] = g.data[p.root] = [];
										if (data && data[p.record]) {
											g.currentData[p.record] = g.data[p.record] = data[p.record];
										} else {
											g.currentData[p.record] = g.data[p.record] = 0;
										}
										g._convertTreeData();
										g._showData();
										return;
									}
									g.data = data;

									if (g.data[p.record] != null) {
										g.cacheData.records = g.data[p.record];
									}
									if (p.dataAction == "server") {
										g.currentData = g.data;

										if (g.currentData[p.record] == null
												&& g.cacheData.records) {
											g.currentData[p.record] = g.cacheData.records;
										}
									} else {
										g.filteredData = g.data;
										if (clause)
											g.filteredData[p.root] = g
													._searchData(
															g.filteredData[p.root],
															clause);
										if (p.usePager)
											g.currentData = g
													._getCurrentPageData(g.filteredData);
										else
											g.currentData = g.filteredData;
									}
									g._convertTreeData();
									g._showData.jqueryDefer(g, 10,
											[ g.currentData ]);
								},
								complete : function() {
									g.trigger('complete', [ g ]);
									if (g.hasBind('loaded')) {
										g.trigger('loaded', [ g ]);
									} else {
										g.toggleLoading.jqueryDefer(g, 10,
												[ false ]);
									}
								},
								error : function(XMLHttpRequest, textStatus,
										errorThrown) {
									g.currentData = g.data = {};
									g.currentData[p.root] = g.data[p.root] = [];
									g.currentData[p.record] = g.data[p.record] = 0;
									g.toggleLoading.jqueryDefer(g, 10,
											[ false ]);
									$(".l-bar-btnload span", g.toolbar)
											.removeClass("l-disabled");
									g.trigger('error', [ XMLHttpRequest,
											textStatus, errorThrown ]);
								}
							};
							if (p.contentType)
								ajaxOptions.contentType = p.contentType;
							$.ajax(ajaxOptions);
						},
						toggleLoading : function(show) {
							this.gridloading[show ? 'show' : 'hide']();
						},
						_createEditor : function(editorBuilder, container,
								editParm, width, height) {
							var editor = editorBuilder.create.call(this,
									container, editParm);
							if (editorBuilder.setValue)
								editorBuilder.setValue.call(this, editor,
										editParm.value, editParm);
							if (editorBuilder.setText
									&& editParm.column.textField)
								editorBuilder.setText.call(this, editor,
										editParm.text, editParm);
							if (editorBuilder.resize)
								editorBuilder.resize.call(this, editor, width,
										height, editParm);
							return editor;
						},

						beginEdit : function(rowParm, containerBulider) {
							var g = this, p = this.options;
							if (!p.enabledEdit || p.clickToEdit)
								return;
							var rowdata = g.getRow(rowParm);
							if (rowdata._editing)
								return;
							if (g.trigger('beginEdit', {
								record : rowdata,
								rowindex : rowdata['__index']
							}) == false)
								return;
							g.editors[rowdata['__id']] = {};
							rowdata._editing = true;
							g.reRender({
								rowdata : rowdata
							});
							containerBulider = containerBulider
									|| function(rowdata, column) {
										var cellobj = g.getCellObj(rowdata,
												column);
										var container = $(cellobj).html("");
										g.setCellEditing(rowdata, column, true);
										return container;
									};
							for (var i = 0, l = g.columns.length; i < l; i++) {
								var column = g.columns[i];
								if (!column.name || !column.editor
										|| !column.editor.type
										|| !p.editors[column.editor.type])
									continue;
								var editor = p.editors[column.editor.type];
								var editParm = {
									record : rowdata,
									value : g._getValueByName(rowdata,
											column.name),
									column : column,
									rowindex : rowdata['__index'],
									grid : g
								};
								var container = containerBulider(rowdata,
										column);
								var width = container.width(), height = container
										.height();
								var editorControl = g._createEditor(editor,
										container, editParm, width, height);
								g.editors[rowdata['__id']][column['__id']] = {
									editor : editor,
									input : editorControl,
									editParm : editParm,
									container : container
								};
							}
							g.trigger('afterBeginEdit', {
								record : rowdata,
								rowindex : rowdata['__index']
							});

						},
						cancelEdit : function(rowParm) {
							var g = this;
							if (rowParm == undefined) {
								for ( var rowid in g.editors) {
									g.cancelEdit(rowid);
								}
							} else {
								var rowdata = g.getRow(rowParm);
								if (!g.editors[rowdata['__id']])
									return;
								if (g.trigger('beforeCancelEdit', {
									record : rowdata,
									rowindex : rowdata['__index']
								}) == false)
									return;
								for ( var columnid in g.editors[rowdata['__id']]) {
									var o = g.editors[rowdata['__id']][columnid];
									if (o.editor.destroy)
										o.editor.destroy(o.input, o.editParm);
								}
								delete g.editors[rowdata['__id']];
								delete rowdata['_editing'];
								g.reRender({
									rowdata : rowdata
								});
							}
						},
						addEditRow : function(rowdata, containerBulider) {
							this.submitEdit();
							rowdata = this.add(rowdata);
							this.beginEdit(rowdata, containerBulider);
						},
						submitEdit : function(rowParm) {
							var g = this, p = this.options;
							if (rowParm == undefined) {
								for ( var rowid in g.editors) {
									g.submitEdit(rowid);
								}
							} else {
								var rowdata = g.getRow(rowParm);
								var newdata = {};
								if (!g.editors[rowdata['__id']])
									return;
								for ( var columnid in g.editors[rowdata['__id']]) {
									var o = g.editors[rowdata['__id']][columnid];
									var column = o.editParm.column;
									if (column.name) {
										newdata[column.name] = o.editor
												.getValue(o.input, o.editParm);
									}
									if (column.textField && o.editor.getText) {
										newdata[column.textField] = o.editor
												.getText(o.input, o.editParm);
									}
								}
								if (g.trigger('beforeSubmitEdit', {
									record : rowdata,
									rowindex : rowdata['__index'],
									newdata : newdata
								}) == false)
									return false;
								g.updateRow(rowdata, newdata);
								g.trigger('afterSubmitEdit', {
									record : rowdata,
									rowindex : rowdata['__index'],
									newdata : newdata
								});
							}
						},
						endEdit : function(rowParm) {
							var g = this, p = this.options;
							if (g.editor.editing) {
								var o = g.editor;
								g.trigger('sysEndEdit', [ g.editor.editParm ]);
								g.trigger('endEdit', [ g.editor.editParm ]);
								if (o.editor.destroy)
									o.editor.destroy(o.input, o.editParm);
								g.editor.container.remove();
								g.reRender({
									rowdata : g.editor.editParm.record,
									column : g.editor.editParm.column
								});
								g.trigger('afterEdit', [ g.editor.editParm ]);
								g.editor = {
									editing : false
								};
							} else if (rowParm != undefined) {
								var rowdata = g.getRow(rowParm);
								if (!g.editors[rowdata['__id']])
									return;
								if (g.submitEdit(rowParm) == false)
									return false;
								for ( var columnid in g.editors[rowdata['__id']]) {
									var o = g.editors[rowdata['__id']][columnid];
									if (o.editor.destroy)
										o.editor.destroy(o.input, o.editParm);
								}
								delete g.editors[rowdata['__id']];
								delete rowdata['_editing'];
								g.trigger('afterEdit', {
									record : rowdata,
									rowindex : rowdata['__index']
								});
							} else {
								for ( var rowid in g.editors) {
									g.endEdit(rowid);
								}
							}
							g._fixHeight.jqueryDefer(g, 10);
						},
						setWidth : function(w) {
							return this._setWidth(w);
						},
						setHeight : function(h) {
							return this._setHeight(h);
						},

						enabledCheckbox : function() {
							return this.options.checkbox ? true : false;
						},

						enabledFrozen : function() {
							var g = this, p = this.options;
							if (!p.frozen)
								return false;
							var cols = g.columns || [];
							if (g.enabledDetail() && p.frozenDetail
									|| g.enabledCheckbox() && p.frozenCheckbox
									|| p.frozenRownumbers && p.rownumbers)
								return true;
							for (var i = 0, l = cols.length; i < l; i++) {
								if (cols[i].frozen) {
									return true;
								}
							}
							this._setFrozen(false);
							return false;
						},

						enabledDetailEdit : function() {
							if (!this.enabledDetail())
								return false;
							return this.options.detailToEdit ? true : false;
						},

						enabledDetail : function() {
							if (this.options.detail
									&& this.options.detail.onShowDetail)
								return true;
							return false;
						},

						enabledGroup : function() {
							return this.options.groupColumnName ? true : false;
						},
						deleteSelectedRow : function() {
							if (!this.selected)
								return;
							for ( var i in this.selected) {
								var o = this.selected[i];
								if (o['__id'] in this.records)
									this._deleteData.jqueryDefer(this, 10,
											[ o ]);
							}
							this.reRender.jqueryDefer(this, 20);
						},
						removeRange : function(rowArr) {
							var g = this, p = this.options;
							$.each(rowArr, function() {
								g._removeData(this);
							});
							g.reRender();
						},
						remove : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							g._removeData(rowParm);
							g.reRender();
						},
						deleteRange : function(rowArr) {
							var g = this, p = this.options;
							$.each(rowArr, function() {
								g._deleteData(this);
							});
							g.reRender();
						},
						deleteRow : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							if (!rowdata)
								return;
							g._deleteData(rowdata);
							g.reRender();
							g.isDataChanged = true;
						},
						_deleteData : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							rowdata[p.statusName] = 'delete';
							if (p.tree) {
								var children = g.getChildren(rowdata, true);
								if (children) {
									for (var i = 0, l = children.length; i < l; i++) {
										children[i][p.statusName] = 'delete';
									}
								}
							}
							g.deletedRows = g.deletedRows || [];
							g.deletedRows.push(rowdata);
							g._removeSelected(rowdata);
						},

						updateCell : function(arg, value, rowParm) {
							var g = this, p = this.options;
							var column, cellObj, rowdata;
							if (typeof (arg) == "string") {
								for (var i = 0, l = g.columns.length; i < l; i++) {
									if (g.columns[i].name == arg) {
										g.updateCell(i, value, rowParm);
									}
								}
								return;
							}
							if (typeof (arg) == "number") {
								column = g.columns[arg];
								rowdata = g.getRow(rowParm);
								cellObj = g.getCellObj(rowdata, column);
							} else if (typeof (arg) == "object" && arg['__id']) {
								column = arg;
								rowdata = g.getRow(rowParm);
								cellObj = g.getCellObj(rowdata, column);
							} else {
								cellObj = arg;
								var ids = cellObj.id.split('|');
								var columnid = ids[ids.length - 1];
								column = g._columns[columnid];
								var row = $(cellObj).parent();
								rowdata = rowdata || g.getRow(row[0]);
							}
							if (value != null && column.name) {
								g._setValueByName(rowdata, column.name, value);
								if (rowdata[p.statusName] != 'add')
									rowdata[p.statusName] = 'update';
								g.isDataChanged = true;
							}
							g.reRender({
								rowdata : rowdata,
								column : column
							});
						},
						addRows : function(rowdataArr, neardata, isBefore,
								parentRowData) {
							var g = this, p = this.options;
							$(rowdataArr).each(
									function() {
										g.addRow(this, neardata, isBefore,
												parentRowData);
									});
						},
						_createRowid : function() {
							return "r" + (1000 + this.recordNumber);
						},
						_isRowId : function(str) {
							return (str in this.records);
						},
						_addNewRecord : function(o, previd, pid) {
							var g = this, p = this.options;
							g.recordNumber++;
							o['__id'] = g._createRowid();
							o['__previd'] = previd;
							if (previd && previd != -1) {
								var prev = g.records[previd];
								if (prev['__nextid'] && prev['__nextid'] != -1) {
									var prevOldNext = g.records[prev['__nextid']];
									if (prevOldNext)
										prevOldNext['__previd'] = o['__id'];
								}
								prev['__nextid'] = o['__id'];
								o['__index'] = prev['__index'] + 1;
							} else {
								o['__index'] = 0;
							}
							if (p.tree) {
								if (pid && pid != -1) {
									var parent = g.records[pid];
									o['__pid'] = pid;
									o['__level'] = parent['__level'] + 1;
								} else {
									o['__pid'] = -1;
									o['__level'] = 1;
								}
								o['__hasChildren'] = o[p.tree.childrenName] ? true
										: false;
							}
							o[p.statusName] = o[p.statusName] || "nochanged";
							g.rows[o['__index']] = o;
							g.records[o['__id']] = o;
							return o;
						},

						_getRows : function(data) {
							var g = this, p = this.options;
							var targetData = [];
							function load(data) {
								if (!data || !data.length)
									return;
								for (var i = 0, l = data.length; i < l; i++) {
									var o = data[i];
									targetData.push(o);
									if (o[p.tree.childrenName]) {
										load(o[p.tree.childrenName]);
									}
								}
							}
							load(data);
							return targetData;
						},
						_updateGridData : function() {
							var g = this, p = this.options;
							g.recordNumber = 0;
							g.rows = [];
							g.records = {};
							var previd = -1;
							function load(data, pid) {
								if (!data || !data.length)
									return;
								for (var i = 0, l = data.length; i < l; i++) {
									var o = data[i];
									g.formatRecord(o);
									if (o[p.statusName] == "delete")
										continue;
									g._addNewRecord(o, previd, pid);
									previd = o['__id'];
									if (o['__hasChildren']) {
										load(o[p.tree.childrenName], o['__id']);
									}
								}
							}
							load(g.currentData[p.root], -1);
							return g.rows;
						},
						_moveData : function(from, to, isAfter) {
							var g = this, p = this.options;
							var fromRow = g.getRow(from);
							var toRow = g.getRow(to);
							var fromIndex, toIndex;
							var listdata = g._getParentChildren(fromRow);
							fromIndex = $.inArray(fromRow, listdata);
							listdata.splice(fromIndex, 1);
							listdata = g._getParentChildren(toRow);
							toIndex = $.inArray(toRow, listdata);
							listdata.splice(toIndex + (isAfter ? 1 : 0), 0,
									fromRow);
						},
						move : function(from, to, isAfter) {
							this._moveData(from, to, isAfter);
							this.reRender();
						},
						moveRange : function(rows, to, isAfter) {
							for ( var i in rows) {
								this._moveData(rows[i], to, isAfter);
							}
							this.reRender();
						},
						up : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							var listdata = g._getParentChildren(rowdata);
							var index = $.inArray(rowdata, listdata);
							if (index == -1 || index == 0)
								return;
							var selected = g.getSelected();
							g.move(rowdata, listdata[index - 1], false);
							g.select(selected);
						},
						down : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							var listdata = g._getParentChildren(rowdata);
							var index = $.inArray(rowdata, listdata);
							if (index == -1 || index == listdata.length - 1)
								return;
							var selected = g.getSelected();
							g.move(rowdata, listdata[index + 1], true);
							g.select(selected);
						},
						addRow : function(rowdata, neardata, isBefore,
								parentRowData) {
							var g = this, p = this.options;
							rowdata = rowdata || {};
							g._addData(rowdata, parentRowData, neardata,
									isBefore);
							g.reRender();

							rowdata[p.statusName] = 'add';
							if (p.tree) {
								var children = g.getChildren(rowdata, true);
								if (children) {
									for (var i = 0, l = children.length; i < l; i++) {
										children[i][p.statusName] = 'add';
									}
								}
							}
							g.isDataChanged = true;
							p.total = p.total ? (p.total + 1) : 1;
							p.pageCount = Math.ceil(p.total / p.pageSize);
							g._buildPager();
							g.trigger('SysGridHeightChanged');
							g.trigger('afterAddRow', [ rowdata ]);
							return rowdata;
						},
						updateRow : function(rowDom, newRowData) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowDom);

							g.isDataChanged = true;
							$.extend(rowdata, newRowData || {});
							if (rowdata[p.statusName] != 'add')
								rowdata[p.statusName] = 'update';
							g.reRender.jqueryDefer(g, 10, [ {
								rowdata : rowdata
							} ]);
							return rowdata;
						},
						setCellEditing : function(rowdata, column, editing) {
							var g = this, p = this.options;
							var cell = g.getCellObj(rowdata, column);
							var methodName = editing ? 'addClass'
									: 'removeClass';
							$(cell)[methodName]("l-grid-row-cell-editing");
							if (rowdata['__id'] != 0) {
								var prevrowobj = $(g.getRowObj(rowdata['__id']))
										.prev();

								if (!prevrowobj.length
										|| prevrowobj.length <= 0
										|| prevrowobj[0].id == null
										|| prevrowobj[0].id == "") {
									return;
								}
								var prevrow = g.getRow(prevrowobj[0]);
								var cellprev = g.getCellObj(prevrow, column);
								if (!cellprev)
									return;
								$(cellprev)[methodName]
										("l-grid-row-cell-editing-topcell");
							}
							if (column['__previd'] != -1
									&& column['__previd'] != null) {
								var cellprev = $(g.getCellObj(rowdata, column))
										.prev();
								$(cellprev)[methodName]
										("l-grid-row-cell-editing-leftcell");
							}
						},
						reRender : function(e) {
							var g = this, p = this.options;
							e = e || {};
							var rowdata = e.rowdata, column = e.column;
							if (column
									&& (column.isdetail || column.ischeckbox))
								return;
							if (rowdata && rowdata[p.statusName] == "delete")
								return;
							if (rowdata && column) {
								var cell = g.getCellObj(rowdata, column);
								$(cell).html(g._getCellHtml(rowdata, column));
								if (!column.issystem)
									g.setCellEditing(rowdata, column, false);
							} else if (rowdata) {
								$(g.columns).each(function() {
									g.reRender({
										rowdata : rowdata,
										column : this
									});
								});
							} else if (column) {
								for ( var rowid in g.records) {
									g.reRender({
										rowdata : g.records[rowid],
										column : column
									});
								}
								for (var i = 0; i < g.totalNumber; i++) {
									var tobj = document.getElementById(g.id
											+ "|total" + i + "|"
											+ column['__id']);
									$("div:first", tobj)
											.html(
													g
															._getTotalCellContent(
																	column,
																	g.groups
																			&& g.groups[i] ? g.groups[i]
																			: g.currentData[p.root]));
								}
							} else {
								g._showData();
							}
						},
						getData : function(status, removeStatus) {
							var g = this, p = this.options;
							var data = [];
							if (removeStatus == undefined)
								removeStatus = true;
							for ( var rowid in g.records) {
								var o = $.extend(true, {}, g.records[rowid]);
								if (o[p.statusName] == status
										|| status == undefined) {
									data.push(g.formatRecord(o, removeStatus));
								}
							}
							return data;
						},

						formatRecord : function(o, removeStatus) {
							delete o['__id'];
							delete o['__previd'];
							delete o['__nextid'];
							delete o['__index'];
							if (this.options.tree) {
								delete o['__pid'];
								delete o['__level'];
								delete o['__hasChildren'];
							}
							if (removeStatus)
								delete o[this.options.statusName];
							return o;
						},
						getUpdated : function() {
							return this.getData('update', true);
						},
						getDeleted : function() {
							return this.deletedRows;
						},
						getAdded : function() {
							return this.getData('add', true);
						},
						getChanges : function() {

							var g = this, p = this.options;
							var data = [];
							if (this.deletedRows) {
								$(this.deletedRows).each(function() {
									var o = $.extend(true, {}, this);
									data.push(g.formatRecord(o, false));
								});
							}
							$.merge(data, g.getData("update", false));
							$.merge(data, g.getData("add", false));
							return data;
						},
						getColumn : function(columnParm) {
							var g = this, p = this.options;
							if (typeof columnParm == "string") {
								if (g._isColumnId(columnParm))
									return g._columns[columnParm];
								else
									return g.columns[parseInt(columnParm)];
							} else if (typeof (columnParm) == "number") {
								return g.columns[columnParm];
							} else if (typeof columnParm == "object"
									&& columnParm.nodeType == 1) {
								var ids = columnParm.id.split('|');
								var columnid = ids[ids.length - 1];
								return g._columns[columnid];
							}
							return columnParm;
						},
						getColumnType : function(columnname) {
							var g = this, p = this.options;
							for (i = 0; i < g.columns.length; i++) {
								if (g.columns[i].name == columnname) {
									if (g.columns[i].type)
										return g.columns[i].type;
									return "string";
								}
							}
							return null;
						},

						isTotalSummary : function() {
							var g = this, p = this.options;
							for (var i = 0; i < g.columns.length; i++) {
								if (g.columns[i].totalSummary)
									return true;
							}
							return false;
						},

						getColumns : function(columnLevel) {
							var g = this, p = this.options;
							var columns = [];
							for ( var id in g._columns) {
								var col = g._columns[id];
								if (columnLevel != undefined) {
									if (col['__level'] == columnLevel)
										columns.push(col);
								} else {
									if (col['__leaf'])
										columns.push(col);
								}
							}
							return columns;
						},

						changeSort : function(columnName, sortOrder) {
							var g = this, p = this.options;
							if (g.loading)
								return true;
							if (p.dataAction == "local") {
								var columnType = g.getColumnType(columnName);
								if (!g.sortedData)
									g.sortedData = g.filteredData;
								if (!g.sortedData || !g.sortedData[p.root])
									return;
								if (p.sortName == columnName) {
									g.sortedData[p.root].reverse();
								} else {
									g.sortedData[p.root].sort(function(data1,
											data2) {
										return g._compareData(data1, data2,
												columnName, columnType);
									});
								}
								if (p.usePager)
									g.currentData = g
											._getCurrentPageData(g.sortedData);
								else
									g.currentData = g.sortedData;
								g._showData();
							}
							p.sortName = columnName;
							p.sortOrder = sortOrder;
							if (p.dataAction == "server") {
								g.loadData(p.where);
							}
						},

						changePage : function(ctype) {
							var g = this, p = this.options;
							if (g.loading)
								return true;
							if (p.dataAction != "local" && g.isDataChanged
									&& !confirm(p.isContinueByDataChanged))
								return false;
							p.pageCount = parseInt($(".pcontrol span",
									g.toolbar).html());
							switch (ctype) {
							case 'first':
								if (p.page == 1)
									return;
								p.newPage = 1;
								break;
							case 'prev':
								if (p.page == 1)
									return;
								if (p.page > 1)
									p.newPage = parseInt(p.page) - 1;
								break;
							case 'next':
								if (p.page >= p.pageCount)
									return;
								p.newPage = parseInt(p.page) + 1;
								break;
							case 'last':
								if (p.page >= p.pageCount)
									return;
								p.newPage = p.pageCount;
								break;
							case 'input':
								var nv = parseInt($('.pcontrol input',
										g.toolbar).val());
								if (isNaN(nv))
									nv = 1;
								if (nv < 1)
									nv = 1;
								else if (nv > p.pageCount)
									nv = p.pageCount;
								$('.pcontrol input', g.toolbar).val(nv);
								p.newPage = nv;
								break;
							}
							if (p.newPage == p.page)
								return false;
							if (p.newPage == 1) {
								$(".l-bar-btnfirst span", g.toolbar).addClass(
										"l-disabled");
								$(".l-bar-btnprev span", g.toolbar).addClass(
										"l-disabled");
							} else {
								$(".l-bar-btnfirst span", g.toolbar)
										.removeClass("l-disabled");
								$(".l-bar-btnprev span", g.toolbar)
										.removeClass("l-disabled");
							}
							if (p.newPage == p.pageCount) {
								$(".l-bar-btnlast span", g.toolbar).addClass(
										"l-disabled");
								$(".l-bar-btnnext span", g.toolbar).addClass(
										"l-disabled");
							} else {
								$(".l-bar-btnlast span", g.toolbar)
										.removeClass("l-disabled");
								$(".l-bar-btnnext span", g.toolbar)
										.removeClass("l-disabled");
							}
							g.trigger('changePage', [ p.newPage ]);
							if (p.dataAction == "server") {
								p.parms.push({
									name : "changepage",
									value : "1",
									temp : true
								});
								g.loadData(p.where);
							} else {
								g.currentData = g
										._getCurrentPageData(g.filteredData);

								if (p.tree) {
									var childrenName = p.tree.childrenName;
									$(g.filteredData[p.root]).each(
											function(index, item) {
												if (item[childrenName])
													item[childrenName] = [];
											});
									g._convertTreeData();
								}
								g._showData();
							}
						},
						getSelectedRow : function() {
							for ( var i in this.selected) {
								var o = this.selected[i];

								if (o['__id'] in this.records)
									return o;
							}
							return null;
						},
						getSelectedRows : function() {
							var arr = [];
							for ( var i in this.selected) {
								var o = this.selected[i];
								if (o['__id'] in this.records)
									arr.push(o);
							}
							return arr;
						},
						getSelectedRowObj : function() {
							for ( var i in this.selected) {
								var o = this.selected[i];
								if (o['__id'] in this.records)
									return this.getRowObj(o);
							}
							return null;
						},
						getSelectedRowObjs : function() {
							var arr = [];
							for ( var i in this.selected) {
								var o = this.selected[i];
								if (o['__id'] in this.records)
									arr.push(this.getRowObj(o));
							}
							return arr;
						},
						getCellObj : function(rowParm, column) {
							var rowdata = this.getRow(rowParm);
							column = this.getColumn(column);
							return document.getElementById(this._getCellDomId(
									rowdata, column));
						},
						getRowObj : function(rowParm, frozen) {
							var g = this, p = this.options;
							if (rowParm == null)
								return null;
							if (typeof (rowParm) == "string") {
								if (g._isRowId(rowParm))
									return document.getElementById(g.id
											+ (frozen ? "|1|" : "|2|")
											+ rowParm);
								else
									return document
											.getElementById(g.id
													+ (frozen ? "|1|" : "|2|")
													+ g.rows[parseInt(rowParm)]['__id']);
							} else if (typeof (rowParm) == "number") {
								return document.getElementById(g.id
										+ (frozen ? "|1|" : "|2|")
										+ g.rows[rowParm]['__id']);
							} else if (typeof (rowParm) == "object"
									&& rowParm['__id']) {
								return g.getRowObj(rowParm['__id'], frozen);
							}
							return rowParm;
						},
						getRow : function(rowParm) {
							var g = this, p = this.options;
							if (rowParm == null)
								return null;
							if (typeof (rowParm) == "string") {
								if (g._isRowId(rowParm))
									return g.records[rowParm];
								else
									return g.rows[parseInt(rowParm)];
							} else if (typeof (rowParm) == "number") {
								return g.rows[parseInt(rowParm)];
							} else if (typeof (rowParm) == "object"
									&& rowParm.nodeType == 1
									&& !rowParm['__id']) {
								return g._getRowByDomId(rowParm.id);
							}
							return rowParm;
						},
						_setColumnVisible : function(column, hide) {
							var g = this, p = this.options;
							if (!hide) {
								column._hide = false;
								document.getElementById(column['__domid']).style.display = "";

								if (column['__pid'] != -1) {
									var pcol = g._columns[column['__pid']];
									if (pcol._hide) {
										document
												.getElementById(pcol['__domid']).style.display = "";
										this._setColumnVisible(pcol, hide);
									}
								}
							} else {
								column._hide = true;
								document.getElementById(column['__domid']).style.display = "none";

								if (column['__pid'] != -1) {
									var hideall = true;
									var pcol = this._columns[column['__pid']];
									for (var i = 0; pcol
											&& i < pcol.columns.length; i++) {
										if (!pcol.columns[i]._hide) {
											hideall = false;
											break;
										}
									}
									if (hideall) {
										pcol._hide = true;
										document
												.getElementById(pcol['__domid']).style.display = "none";
										this._setColumnVisible(pcol, hide);
									}
								}
							}
						},

						toggleCol : function(columnparm, visible, toggleByPopup) {
							var g = this, p = this.options;
							var column;
							if (typeof (columnparm) == "number") {
								column = g.columns[columnparm];
							} else if (typeof (columnparm) == "object"
									&& columnparm['__id']) {
								column = columnparm;
							} else if (typeof (columnparm) == "string") {
								if (g._isColumnId(columnparm)) {
									column = g._columns[columnparm];
								} else {
									$(g.columns).each(
											function() {
												if (this.name == columnparm)
													g.toggleCol(this, visible,
															toggleByPopup);
											});
									return;
								}
							}
							if (!column)
								return;
							var columnindex = column['__leafindex'];
							var headercell = document
									.getElementById(column['__domid']);
							if (!headercell)
								return;
							headercell = $(headercell);
							var cells = [];
							for ( var i in g.rows) {
								var obj = g.getCellObj(g.rows[i], column);
								if (obj)
									cells.push(obj);
							}
							for (var i = 0; i < g.totalNumber; i++) {
								var tobj = document.getElementById(g.id
										+ "|total" + i + "|" + column['__id']);
								if (tobj)
									cells.push(tobj);
							}
							var colwidth = column._width;

							if (visible && column._hide) {
								if (column.frozen)
									g.f.gridtablewidth += (parseInt(colwidth) + 1);
								else
									g.gridtablewidth += (parseInt(colwidth) + 1);
								g._setColumnVisible(column, false);
								$(cells).show();
							}

							else if (!visible && !column._hide) {
								if (column.frozen)
									g.f.gridtablewidth -= (parseInt(colwidth) + 1);
								else
									g.gridtablewidth -= (parseInt(colwidth) + 1);
								g._setColumnVisible(column, true);
								$(cells).hide();
							}
							if (column.frozen) {
								$("div:first", g.f.gridheader).width(
										g.f.gridtablewidth);
								$("div:first", g.f.gridbody).width(
										g.f.gridtablewidth);
							} else {
								$("div:first", g.gridheader).width(
										g.gridtablewidth + 40);
								$("div:first", g.gridbody).width(
										g.gridtablewidth);
							}
							g._updateFrozenWidth();
							if (!toggleByPopup) {
								$(':checkbox[columnindex=' + columnindex + "]",
										g.popup)
										.each(
												function() {
													this.checked = visible;
													if ($.fn.jqueryCheckBox) {
														var checkboxmanager = $(
																this)
																.jqueryGetCheckBoxManager();
														if (checkboxmanager)
															checkboxmanager
																	.updateStyle();
													}
												});
							}
						},

						setColumnWidth : function(columnparm, newwidth) {
							var g = this, p = this.options;
							if (!newwidth)
								return;
							newwidth = parseInt(newwidth, 10);
							var column;
							if (typeof (columnparm) == "number") {
								column = g.columns[columnparm];
							} else if (typeof (columnparm) == "object"
									&& columnparm['__id']) {
								column = columnparm;
							} else if (typeof (columnparm) == "string") {
								if (g._isColumnId(columnparm)) {
									column = g._columns[columnparm];
								} else {
									$(g.columns).each(function() {
										if (this.name == columnparm)
											g.setColumnWidth(this, newwidth);
									});
									return;
								}
							}
							if (!column)
								return;
							var mincolumnwidth = p.minColumnWidth;
							if (column.minWidth)
								mincolumnwidth = column.minWidth;
							newwidth = newwidth < mincolumnwidth ? mincolumnwidth
									: newwidth;
							var diff = newwidth - column._width;
							if (g.trigger('beforeChangeColumnWidth', [ column,
									newwidth ]) == false)
								return;
							column._width = newwidth;
							if (column.frozen) {
								g.f.gridtablewidth += diff;
								$("div:first", g.f.gridheader).width(
										g.f.gridtablewidth);
								$("div:first", g.f.gridbody).width(
										g.f.gridtablewidth);
							} else {
								g.gridtablewidth += diff;
								$("div:first", g.gridheader).width(
										g.gridtablewidth + 40);
								$("div:first", g.gridbody).width(
										g.gridtablewidth);
							}
							$(document.getElementById(column['__domid'])).css(
									'width', newwidth);
							var cells = [];
							for ( var rowid in g.records) {
								var obj = g
										.getCellObj(g.records[rowid], column);
								if (obj)
									cells.push(obj);

								if (!g.enabledDetailEdit() && g.editors[rowid]
										&& g.editors[rowid][column['__id']]) {
									var o = g.editors[rowid][column['__id']];
									if (o.editor.resize)
										o.editor.resize(o.input, newwidth,
												o.container.height(),
												o.editParm);
								}
							}
							for (var i = 0; i < g.totalNumber; i++) {
								var tobj = document.getElementById(g.id
										+ "|total" + i + "|" + column['__id']);
								if (tobj)
									cells.push(tobj);
							}
							$(cells).css('width', newwidth).find(
									"> div.l-grid-row-cell-inner:first").css(
									'width', newwidth - 8);

							g._updateFrozenWidth();
							g._updateHorizontalScrollStatus.jqueryDefer(g, 10);

							g.trigger('afterChangeColumnWidth', [ column,
									newwidth ]);
						},

						changeHeaderText : function(columnparm, headerText) {
							var g = this, p = this.options;
							var column;
							if (typeof (columnparm) == "number") {
								column = g.columns[columnparm];
							} else if (typeof (columnparm) == "object"
									&& columnparm['__id']) {
								column = columnparm;
							} else if (typeof (columnparm) == "string") {
								if (g._isColumnId(columnparm)) {
									column = g._columns[columnparm];
								} else {
									$(g.columns).each(
											function() {
												if (this.name == columnparm)
													g.changeHeaderText(this,
															headerText);
											});
									return;
								}
							}
							if (!column)
								return;
							var columnindex = column['__leafindex'];
							var headercell = document
									.getElementById(column['__domid']);
							$(".l-grid-hd-cell-text", headercell).html(
									headerText);
							if (p.allowHideColumn) {
								$(':checkbox[columnindex=' + columnindex + "]",
										g.popup).parent().next().html(
										headerText);
							}
						},

						changeCol : function(from, to, isAfter) {
							var g = this, p = this.options;
							if (!from || !to)
								return;
							var fromCol = g.getColumn(from);
							var toCol = g.getColumn(to);
							fromCol.frozen = toCol.frozen;
							var fromColIndex, toColIndex;
							var fromColumns = fromCol['__pid'] == -1 ? p.columns
									: g._columns[fromCol['__pid']].columns;
							var toColumns = toCol['__pid'] == -1 ? p.columns
									: g._columns[toCol['__pid']].columns;
							fromColIndex = $.inArray(fromCol, fromColumns);
							toColIndex = $.inArray(toCol, toColumns);
							var sameParent = fromColumns == toColumns;
							var sameLevel = fromCol['__level'] == toCol['__level'];
							toColumns.splice(toColIndex + (isAfter ? 1 : 0), 0,
									fromCol);
							if (!sameParent) {
								fromColumns.splice(fromColIndex, 1);
							} else {
								if (isAfter)
									fromColumns.splice(fromColIndex, 1);
								else
									fromColumns.splice(fromColIndex + 1, 1);
							}
							g._setColumns(p.columns);
							g.reRender();
						},

						collapseDetail : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							if (!rowdata)
								return;
							for (var i = 0, l = g.columns.length; i < l; i++) {
								if (g.columns[i].isdetail) {
									var row = g.getRowObj(rowdata);
									var cell = g.getCellObj(rowdata,
											g.columns[i]);
									$(row).next("tr.l-grid-detailpanel").hide();
									$(".l-grid-row-cell-detailbtn:first", cell)
											.removeClass("l-open");
									g.trigger('SysGridHeightChanged');
									return;
								}
							}
						},
						extendDetail : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							if (!rowdata)
								return;
							for (var i = 0, l = g.columns.length; i < l; i++) {
								if (g.columns[i].isdetail) {
									var row = g.getRowObj(rowdata);
									var cell = g.getCellObj(rowdata,
											g.columns[i]);
									$(row).next("tr.l-grid-detailpanel").show();
									$(".l-grid-row-cell-detailbtn:first", cell)
											.addClass("l-open");
									g.trigger('SysGridHeightChanged');
									return;
								}
							}
						},
						getParent : function(rowParm) {
							var g = this, p = this.options;
							if (!p.tree)
								return null;
							var rowdata = g.getRow(rowParm);
							if (!rowdata)
								return null;
							if (rowdata['__pid'] in g.records)
								return g.records[rowdata['__pid']];
							else
								return null;
						},
						getChildren : function(rowParm, deep) {
							var g = this, p = this.options;
							if (!p.tree)
								return null;
							var rowData = g.getRow(rowParm);
							if (!rowData)
								return null;
							var arr = [];
							function loadChildren(data) {
								if (data[p.tree.childrenName]) {
									for (var i = 0, l = data[p.tree.childrenName].length; i < l; i++) {
										var o = data[p.tree.childrenName][i];
										if (o[p.statusName] == 'delete')
											continue;
										arr.push(o);
										if (deep)
											loadChildren(o);
									}
								}
							}
							loadChildren(rowData);
							return arr;
						},
						isLeaf : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							if (!rowdata)
								return;
							return rowdata['__hasChildren'] ? false : true;
						},
						hasChildren : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = this.getRow(rowParm);
							if (!rowdata)
								return;
							return (rowdata[p.tree.childrenName] && rowdata[p.tree.childrenName].length) ? true
									: false;
						},
						existRecord : function(record) {
							for ( var rowid in this.records) {
								if (this.records[rowid] == record)
									return true;
							}
							return false;
						},
						_removeSelected : function(rowdata) {
							var g = this, p = this.options;
							if (p.tree) {
								var children = g.getChildren(rowdata, true);
								if (children) {
									for (var i = 0, l = children.length; i < l; i++) {
										var index2 = $.inArray(children[i],
												g.selected);
										if (index2 != -1)
											g.selected.splice(index2, 1);
									}
								}
							}
							var index = $.inArray(rowdata, g.selected);
							if (index != -1)
								g.selected.splice(index, 1);
						},
						_getParentChildren : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							var listdata;
							if (p.tree && g.existRecord(rowdata)
									&& rowdata['__pid'] in g.records) {
								listdata = g.records[rowdata['__pid']][p.tree.childrenName];
							} else {
								listdata = g.currentData[p.root];
							}
							return listdata;
						},
						_removeData : function(rowdata) {
							var g = this, p = this.options;
							var listdata = g._getParentChildren(rowdata);
							var index = $.inArray(rowdata, listdata);
							if (index != -1) {
								listdata.splice(index, 1);
							}
							g._removeSelected(rowdata);
						},
						_addData : function(rowdata, parentdata, neardata,
								isBefore) {
							var g = this, p = this.options;
							if (!g.currentData)
								g.currentData = {};
							if (!g.currentData[p.root])
								g.currentData[p.root] = [];
							var listdata = g.currentData[p.root];
							if (neardata) {
								if (p.tree) {
									if (parentdata)
										listdata = parentdata[p.tree.childrenName];
									else if (neardata['__pid'] in g.records)
										listdata = g.records[neardata['__pid']][p.tree.childrenName];
								}
								var index = $.inArray(neardata, listdata);
								listdata.splice(index == -1 ? -1 : index
										+ (isBefore ? 0 : 1), 0, rowdata);
							} else {
								if (p.tree && parentdata) {
									listdata = parentdata[p.tree.childrenName];
								}
								listdata.push(rowdata);
							}
						},

						_appendData : function(rowdata, parentdata, neardata,
								isBefore) {
							var g = this, p = this.options;
							rowdata[p.statusName] = "update";
							g._removeData(rowdata);
							g._addData(rowdata, parentdata, neardata, isBefore);
						},
						appendRange : function(rows, parentdata, neardata,
								isBefore) {
							var g = this, p = this.options;
							var toRender = false;
							$.each(rows, function(i, item) {
								if (item['__id'] && g.existRecord(item)) {
									if (g.isLeaf(parentdata))
										g.upgrade(parentdata);
									g._appendData(item, parentdata, neardata,
											isBefore);
									toRender = true;
								} else {
									g.appendRow(item, parentdata, neardata,
											isBefore);
								}
							});
							if (toRender)
								g.reRender();

						},
						appendRow : function(rowdata, parentdata, neardata,
								isBefore) {
							var g = this, p = this.options;
							if ($.isArray(rowdata)) {
								g.appendRange(rowdata, parentdata, neardata,
										isBefore);
								return;
							}
							if (rowdata['__id'] && g.existRecord(rowdata)) {
								g._appendData(rowdata, parentdata, neardata,
										isBefore);
								g.reRender();
								return;
							}
							if (parentdata && g.isLeaf(parentdata))
								g.upgrade(parentdata);
							g.addRow(rowdata, neardata,
									isBefore ? true : false, parentdata);
						},
						upgrade : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							if (!rowdata || !p.tree)
								return;
							rowdata[p.tree.childrenName] = rowdata[p.tree.childrenName]
									|| [];
							rowdata['__hasChildren'] = true;
							var rowobjs = [ g.getRowObj(rowdata) ];
							if (g.enabledFrozen())
								rowobjs.push(g.getRowObj(rowdata, true));
							$("> td > div > .l-grid-tree-space:last", rowobjs)
									.addClass(
											"l-grid-tree-link l-grid-tree-link-open");
						},
						demotion : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							if (!rowdata || !p.tree)
								return;
							var rowobjs = [ g.getRowObj(rowdata) ];
							if (g.enabledFrozen())
								rowobjs.push(g.getRowObj(rowdata, true));
							$("> td > div > .l-grid-tree-space:last", rowobjs)
									.removeClass(
											"l-grid-tree-link l-grid-tree-link-open l-grid-tree-link-close");
							if (g.hasChildren(rowdata)) {
								var children = g.getChildren(rowdata);
								for (var i = 0, l = children.length; i < l; i++) {
									g.deleteRow(children[i]);
								}
							}
							rowdata['__hasChildren'] = false;
						},

						collapseAll : function() {
							var g = this, p = this.options;
							$(g.rows)
									.each(
											function(rowIndex, rowParm) {
												var targetRowObj = g
														.getRowObj(rowParm);
												var linkbtn = $(
														".l-grid-tree-link",
														targetRowObj);
												if (linkbtn
														.hasClass("l-grid-tree-link-close"))
													return;
												g.toggle(rowParm);
											});
						},
						expandAll : function() {
							var g = this, p = this.options;
							$(g.rows)
									.each(
											function(rowIndex, rowParm) {
												var targetRowObj = g
														.getRowObj(rowParm);
												var linkbtn = $(
														".l-grid-tree-link",
														targetRowObj);
												if (linkbtn
														.hasClass("l-grid-tree-link-open"))
													return;
												g.toggle(rowParm);
											});
						},

						collapse : function(rowParm) {
							var g = this, p = this.options;
							var targetRowObj = g.getRowObj(rowParm);
							var linkbtn = $(".l-grid-tree-link", targetRowObj);
							if (linkbtn.hasClass("l-grid-tree-link-close"))
								return;
							g.toggle(rowParm);
						},
						expand : function(rowParm) {
							var g = this, p = this.options;
							var targetRowObj = g.getRowObj(rowParm);
							var linkbtn = $(".l-grid-tree-link", targetRowObj);
							if (linkbtn.hasClass("l-grid-tree-link-open"))
								return;
							g.toggle(rowParm);
						},
						toggle : function(rowParm) {
							if (!rowParm)
								return;
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							var targetRowObj = [ g.getRowObj(rowdata) ];
							if (g.enabledFrozen())
								targetRowObj.push(g.getRowObj(rowdata, true));
							var level = rowdata['__level'], indexInCollapsedRows;
							var linkbtn = $(".l-grid-tree-link:first",
									targetRowObj);
							var opening = true;
							g.collapsedRows = g.collapsedRows || [];
							if (linkbtn.hasClass("l-grid-tree-link-close")) {
								if (g.hasBind('treeExpand')
										&& g.trigger('treeExpand', [ rowdata ]) == false)
									return false;
								linkbtn.removeClass("l-grid-tree-link-close")
										.addClass("l-grid-tree-link-open");
								indexInCollapsedRows = $.inArray(rowdata,
										g.collapsedRows);
								if (indexInCollapsedRows != -1)
									g.collapsedRows.splice(
											indexInCollapsedRows, 1);
							} else {
								if (g.hasBind('treeCollapse')
										&& g.trigger('treeCollapse',
												[ rowdata ]) == false)
									return false;
								opening = false;
								linkbtn.addClass("l-grid-tree-link-close")
										.removeClass("l-grid-tree-link-open");
								indexInCollapsedRows = $.inArray(rowdata,
										g.collapsedRows);
								if (indexInCollapsedRows == -1)
									g.collapsedRows.push(rowdata);
							}
							var children = g.getChildren(rowdata, true);
							for (var i = 0, l = children.length; i < l; i++) {
								var o = children[i];
								var currentRow = $([ g.getRowObj(o['__id']) ]);
								if (g.enabledFrozen())
									currentRow = currentRow.add(g.getRowObj(
											o['__id'], true));
								if (opening) {
									$(".l-grid-tree-link", currentRow)
											.removeClass(
													"l-grid-tree-link-close")
											.addClass("l-grid-tree-link-open");
									currentRow.show();
								} else {
									$(".l-grid-tree-link", currentRow)
											.removeClass(
													"l-grid-tree-link-open")
											.addClass("l-grid-tree-link-close");
									currentRow.hide();
								}
							}
							g.trigger(opening ? 'treeExpanded'
									: 'treeCollapsed', [ rowdata ]);
						},
						_bulid : function() {
							var g = this;
							g._clearGrid();

							g._initBuildHeader();

							g._initHeight();

							g._initFootbar();

							g._buildPager();

							g._setEvent();
						},
						_setColumns : function(columns) {
							var g = this;

							g._initColumns();

							g._initBuildGridHeader();

							g._initBuildPopup();
						},
						_initBuildHeader : function() {
							var g = this, p = this.options;
							if (p.title) {
								$(".l-panel-header-text", g.header).html(
										p.title);
								if (p.headerImg)
									g.header
											.append(
													"<img src='" + p.headerImg
															+ "' />").addClass(
													"l-panel-header-hasicon");
							} else {
								g.header.hide();
							}
							if (p.toolbar) {
								if ($.fn.jqueryToolBar) {
									g.toolbarManager = g.topbar
											.jqueryToolBar(p.toolbar);

									if (g.topbar.height() == 0)
										g.topbar.parent().height(25);
									else
										g.topbar.parent().height(
												g.topbar.height());
								}
							} else {
								g.topbar.parent().remove();
							}
						},
						_createColumnId : function(column) {
							if (column.id != null && column.id != "")
								return column.id.toString();
							return "c" + (100 + this._columnCount);
						},
						_isColumnId : function(str) {
							return (str in this._columns);
						},
						_initColumns : function() {
							var g = this, p = this.options;
							g._columns = {};
							g._columnCount = 0;
							g._columnLeafCount = 0;
							g._columnMaxLevel = 1;
							if (!p.columns)
								return;
							function removeProp(column, props) {
								for ( var i in props) {
									if (props[i] in column)
										delete column[props[i]];
								}
							}

							function setColumn(column, level, pid, previd) {
								removeProp(column, [ '__id', '__pid',
										'__previd', '__nextid', '__domid',
										'__leaf', '__leafindex', '__level',
										'__colSpan', '__rowSpan' ]);
								if (level > g._columnMaxLevel)
									g._columnMaxLevel = level;
								g._columnCount++;
								column['__id'] = g._createColumnId(column);
								column['__domid'] = g.id + "|hcell|"
										+ column['__id'];
								g._columns[column['__id']] = column;
								if (!column.columns || !column.columns.length)
									column['__leafindex'] = g._columnLeafCount++;
								column['__level'] = level;
								column['__pid'] = pid;
								column['__previd'] = previd;
								if (!column.columns || !column.columns.length) {
									column['__leaf'] = true;
									return 1;
								}
								var leafcount = 0;
								var newid = -1;
								for (var i = 0, l = column.columns.length; i < l; i++) {
									var col = column.columns[i];
									leafcount += setColumn(col, level + 1,
											column['__id'], newid);
									newid = col['__id'];
								}
								column['__leafcount'] = leafcount;
								return leafcount;
							}
							var lastid = -1;

							if (p.rownumbers) {
								var frozenRownumbers = g.enabledGroup() ? false
										: p.frozen && p.frozenRownumbers;
								var col = {
									isrownumber : true,
									issystem : true,
									width : p.rownumbersColWidth,
									frozen : frozenRownumbers
								};
								setColumn(col, 1, -1, lastid);
								lastid = col['__id'];
							}

							if (g.enabledDetail()) {
								var frozenDetail = g.enabledGroup() ? false
										: p.frozen && p.frozenDetail;
								var col = {
									isdetail : true,
									issystem : true,
									width : p.detailColWidth,
									frozen : frozenDetail
								};
								setColumn(col, 1, -1, lastid);
								lastid = col['__id'];
							}

							if (g.enabledCheckbox()) {
								var frozenCheckbox = g.enabledGroup() ? false
										: p.frozen && p.frozenCheckbox;
								var col = {
									ischeckbox : true,
									issystem : true,
									width : p.detailColWidth,
									frozen : frozenCheckbox
								};
								setColumn(col, 1, -1, lastid);
								lastid = col['__id'];
							}
							for (var i = 0, l = p.columns.length; i < l; i++) {
								var col = p.columns[i];

								if (!col)
									continue;
								setColumn(col, 1, -1, lastid);
								lastid = col['__id'];
							}

							for ( var id in g._columns) {
								var col = g._columns[id];
								if (col['__leafcount'] > 1) {
									col['__colSpan'] = col['__leafcount'];
								}
								if (col['__leaf']
										&& col['__level'] != g._columnMaxLevel) {
									col['__rowSpan'] = g._columnMaxLevel
											- col['__level'] + 1;
								}
							}

							g.columns = g.getColumns();
							$(g.columns)
									.each(
											function(i, column) {
												column.columnname = column.name;
												column.columnindex = i;
												column.type = column.type
														|| "string";
												column.islast = i == g.columns.length - 1;
												column.isSort = column.isSort == false ? false
														: true;
												column.frozen = column.frozen ? true
														: false;
												column._width = g
														._getColumnWidth(column);
												column._hide = column.hide ? true
														: false;
											});
						},
						_getColumnWidth : function(column) {
							var g = this, p = this.options;
							if (column._width)
								return column._width;
							var colwidth = column.width || p.columnWidth;
							if (!colwidth || colwidth == "auto") {
								var autoColumnNumber = 0, noAutoColumnWidth = 0;
								$(g.columns)
										.each(
												function(i, col) {
													var colwidth = col.width
															|| p.columnWidth;
													var isAuto = (!colwidth || colwidth == "auto") ? true
															: false;
													if (isAuto)
														autoColumnNumber++;
													else
														noAutoColumnWidth += (parseInt(g
																._getColumnWidth(col)) + 1);
												});
								colwidth = parseInt((g.grid.width() - noAutoColumnWidth)
										/ autoColumnNumber) - 1;
							}
							if (typeof (colwidth) == "string"
									&& colwidth.indexOf('%') > 0) {

								var lwidth = 0;
								if (g.enabledDetail()) {
									lwidth += p.detailColWidth;
								}
								if (g.enabledCheckbox()) {
									lwidth += p.checkboxColWidth;
								}
								if (g.options.rownumbers) {
									lwidth += g.options.rownumbersColWidth;
								}
								column._width = colwidth = parseInt(parseInt(colwidth)
										* 0.01
										* (g.grid.width() - lwidth
												- (g.columns.length / 2) - 1));
							}
							if (column.minWidth && colwidth < column.minWidth)
								colwidth = column.minWidth;
							if (column.maxWidth && colwidth > column.maxWidth)
								colwidth = column.maxWidth;
							return colwidth;
						},
						_createHeaderCell : function(column) {
							var g = this, p = this.options;
							var jcell = $("<td class='l-grid-hd-cell'><div class='l-grid-hd-cell-inner'><span class='l-grid-hd-cell-text'></span></div></td>");
							jcell.attr("id", column['__domid']);
							if (!column['__leaf'])
								jcell.addClass("l-grid-hd-cell-mul");
							if (column.columnindex == g.columns.length - 1) {
								jcell.addClass("l-grid-hd-cell-last");
							}
							if (column.isrownumber) {
								jcell.addClass("l-grid-hd-cell-rownumbers");
								jcell
										.html("<div class='l-grid-hd-cell-inner'></div>");
							}
							if (column.ischeckbox) {
								jcell.addClass("l-grid-hd-cell-checkbox");
								jcell
										.html("<div class='l-grid-hd-cell-inner'><div class='l-grid-hd-cell-text l-grid-hd-cell-btn-checkbox'></div></div>");
							}
							if (column.isdetail) {
								jcell.addClass("l-grid-hd-cell-detail");
								jcell
										.html("<div class='l-grid-hd-cell-inner'><div class='l-grid-hd-cell-text l-grid-hd-cell-btn-detail'></div></div>");
							}
							if (column.heightAlign) {
								$(".l-grid-hd-cell-inner:first", jcell).css(
										"textAlign", column.heightAlign);
							}
							if (column['__colSpan'])
								jcell.attr("colSpan", column['__colSpan']);
							if (column['__rowSpan']) {
								jcell.attr("rowSpan", column['__rowSpan']);
								jcell.height(p.headerRowHeight
										* column['__rowSpan']);
								var paddingTop = (p.headerRowHeight
										* column['__rowSpan'] - p.headerRowHeight) / 2 - 5;
								$(".l-grid-hd-cell-inner:first", jcell).css(
										"paddingTop", paddingTop);
							} else {
								jcell.height(p.headerRowHeight);
							}
							if (column['__leaf']) {
								jcell.width(column['_width']);
								jcell
										.attr("columnindex",
												column['__leafindex']);
							}
							var cellHeight = jcell.height();
							if (!column['__rowSpan'] && cellHeight > 10)
								$(">div:first", jcell).height(cellHeight);
							if (column._hide)
								jcell.hide();
							if (column.name)
								jcell.attr({
									columnname : column.name
								});
							var headerText = "";
							if (column.display && column.display != "")
								headerText = column.display;
							else if (column.headerRender)
								headerText = column.headerRender(column);
							else
								headerText = "&nbsp;";
							$(".l-grid-hd-cell-text:first", jcell).html(
									headerText);
							if (!column.issystem && column['__leaf']
									&& column.resizable !== false
									&& $.fn.jqueryResizable
									&& p.allowAdjustColWidth) {
								g.colResizable[column['__id']] = jcell
										.jqueryResizable({
											handles : 'e',
											onStartResize : function(e, ev) {
												this.proxy.hide();
												g.draggingline
														.css(
																{
																	height : g.body
																			.height(),
																	top : 0,
																	left : ev.pageX
																			- g.grid
																					.offset().left
																			+ parseInt(g.body[0].scrollLeft)
																}).show();
											},
											onResize : function(e, ev) {
												g.colresizing = true;
												g.draggingline
														.css({
															left : ev.pageX
																	- g.grid
																			.offset().left
																	+ parseInt(g.body[0].scrollLeft)
														});
												$('body').add(jcell).css(
														'cursor', 'e-resize');
											},
											onStopResize : function(e) {
												g.colresizing = false;
												$('body').add(jcell).css(
														'cursor', 'default');
												g.draggingline.hide();
												g.setColumnWidth(column,
														parseInt(column._width)
																+ e.diffX);
												return false;
											}
										});
							}
							return jcell;
						},
						_initBuildGridHeader : function() {
							var g = this, p = this.options;
							g.gridtablewidth = 0;
							g.f.gridtablewidth = 0;
							if (g.colResizable) {
								for ( var i in g.colResizable) {
									g.colResizable[i].destroy();
								}
								g.colResizable = null;
							}
							g.colResizable = {};
							$("tbody:first", g.gridheader).html("");
							$("tbody:first", g.f.gridheader).html("");
							for (var level = 1; level <= g._columnMaxLevel; level++) {
								var columns = g.getColumns(level);
								var islast = level == g._columnMaxLevel;
								var tr = $("<tr class='l-grid-hd-row'></tr>");
								var trf = $("<tr class='l-grid-hd-row'></tr>");
								if (!islast)
									tr.add(trf).addClass("l-grid-hd-mul");
								$("tbody:first", g.gridheader).append(tr);
								$("tbody:first", g.f.gridheader).append(trf);
								$(columns)
										.each(
												function(i, column) {
													(column.frozen ? trf : tr)
															.append(g
																	._createHeaderCell(column));
													if (column['__leaf']) {
														var colwidth = column['_width'];
														if (!column.frozen)
															g.gridtablewidth += (parseInt(colwidth) ? parseInt(colwidth)
																	: 0) + 1;
														else
															g.f.gridtablewidth += (parseInt(colwidth) ? parseInt(colwidth)
																	: 0) + 1;
													}
												});
							}
							if (g._columnMaxLevel > 0) {
								var h = p.headerRowHeight * g._columnMaxLevel;
								g.gridheader.add(g.f.gridheader).height(h);
								if (p.rownumbers && p.frozenRownumbers)
									g.f.gridheader.find("td:first").height(h);
							}
							g._updateFrozenWidth();
							$("div:first", g.gridheader).width(
									g.gridtablewidth + 40);
						},
						_initBuildPopup : function() {
							var g = this, p = this.options;
							$(':checkbox', g.popup).unbind();
							$('tbody tr', g.popup).remove();
							$(g.columns)
									.each(
											function(i, column) {
												if (column.issystem)
													return;
												if (column.isAllowHide == false)
													return;
												var chk = 'checked="checked"';
												if (column._hide)
													chk = '';
												var header = column.display;
												$('tbody', g.popup)
														.append(
																'<tr><td class="l-column-left"><input type="checkbox" '
																		+ chk
																		+ ' class="l-checkbox" columnindex="'
																		+ i
																		+ '"/></td><td class="l-column-right">'
																		+ header
																		+ '</td></tr>');
											});
							if ($.fn.jqueryCheckBox) {
								$('input:checkbox', g.popup)
										.jqueryCheckBox(
												{
													onBeforeClick : function(
															obj) {
														if (!obj.checked)
															return true;
														if ($('input:checked',
																g.popup).length <= p.minColToggle)
															return false;
														return true;
													}
												});
							}

							if (p.allowHideColumn) {
								$('tr', g.popup).hover(function() {
									$(this).addClass('l-popup-row-over');
								}, function() {
									$(this).removeClass('l-popup-row-over');
								});
								var onPopupCheckboxChange = function() {
									if ($('input:checked', g.popup).length + 1 <= p.minColToggle) {
										return false;
									}
									g
											.toggleCol(parseInt($(this).attr(
													"columnindex")),
													this.checked, true);
								};
								if ($.fn.jqueryCheckBox)
									$(':checkbox', g.popup).bind('change',
											onPopupCheckboxChange);
								else
									$(':checkbox', g.popup).bind('click',
											onPopupCheckboxChange);
							}
						},
						_initHeight : function() {
							var g = this, p = this.options;
							if (p.height == 'auto') {
								g.gridbody.height('auto');
								g.f.gridbody.height('auto');
							}
							if (p.width) {
								g.grid.width(p.width);
							}
							g._onResize.call(g);
						},
						_initFootbar : function() {
							var g = this, p = this.options;
							if (p.usePager) {

								var optStr = "";
								var selectedIndex = -1;
								$(p.pageSizeOptions).each(
										function(i, item) {
											var selectedStr = "";
											if (p.pageSize == item)
												selectedIndex = i;
											optStr += "<option value='" + item
													+ "' " + selectedStr + " >"
													+ item + "</option>";
										});

								$('.l-bar-selectpagesize', g.toolbar).append(
										"<select name='rp'>" + optStr
												+ "</select>");
								if (selectedIndex != -1)
									$('.l-bar-selectpagesize select', g.toolbar)[0].selectedIndex = selectedIndex;
								if (p.switchPageSizeApplyComboBox
										&& $.fn.jqueryComboBox) {
									$(".l-bar-selectpagesize select", g.toolbar)
											.jqueryComboBox(
													{
														onBeforeSelect : function() {
															if (p.url
																	&& g.isDataChanged
																	&& !confirm(p.isContinueByDataChanged))
																return false;
															return true;
														},
														width : 45
													});
								}
							} else {
								g.toolbar.hide();
							}
						},
						_searchData : function(data, clause) {
							var g = this, p = this.options;
							var newData = new Array();
							for (var i = 0; i < data.length; i++) {
								if (clause(data[i], i)) {
									newData[newData.length] = data[i];
								}
							}
							return newData;
						},
						_clearGrid : function() {
							var g = this, p = this.options;
							for ( var i in g.rows) {
								var rowobj = $(g.getRowObj(g.rows[i]));
								if (g.enabledFrozen())
									rowobj = rowobj.add(g.getRowObj(g.rows[i],
											true));
								rowobj.unbind();
							}

							g.gridbody.html("");
							g.f.gridbody.html("");
							g.recordNumber = 0;
							g.records = {};
							g.rows = [];

							g.selected = [];
							g.totalNumber = 0;

							g.editorcounter = 0;
						},
						_fillGridBody : function(data, frozen) {
							var g = this, p = this.options;

							var gridhtmlarr = [ '<div class="l-grid-body-inner"><table class="l-grid-body-table" cellpadding=0 cellspacing=0><tbody>' ];
							if (g.enabledGroup()) {
								var groups = [];
								var groupsdata = [];
								g.groups = groupsdata;
								for ( var rowparm in data) {
									var item = data[rowparm];
									var groupColumnValue = item[p.groupColumnName];
									var valueIndex = $.inArray(
											groupColumnValue, groups);
									if (valueIndex == -1) {
										groups.push(groupColumnValue);
										valueIndex = groups.length - 1;
										groupsdata.push([]);
									}
									groupsdata[valueIndex].push(item);
								}
								$(groupsdata)
										.each(
												function(i, item) {
													if (groupsdata.length == 1)
														gridhtmlarr
																.push('<tr class="l-grid-grouprow l-grid-grouprow-last l-grid-grouprow-first"');
													if (i == groupsdata.length - 1)
														gridhtmlarr
																.push('<tr class="l-grid-grouprow l-grid-grouprow-last"');
													else if (i == 0)
														gridhtmlarr
																.push('<tr class="l-grid-grouprow l-grid-grouprow-first"');
													else
														gridhtmlarr
																.push('<tr class="l-grid-grouprow"');
													gridhtmlarr
															.push(' groupindex"='
																	+ i + '" >');
													gridhtmlarr
															.push('<td colSpan="'
																	+ g.columns.length
																	+ '" class="l-grid-grouprow-cell">');
													gridhtmlarr
															.push('<span class="l-grid-group-togglebtn">&nbsp;&nbsp;&nbsp;&nbsp;</span>');
													if (p.groupRender)
														gridhtmlarr
																.push(p
																		.groupRender(
																				groups[i],
																				item,
																				p.groupColumnDisplay));
													else
														gridhtmlarr
																.push(p.groupColumnDisplay
																		+ ':'
																		+ groups[i]);

													gridhtmlarr.push('</td>');
													gridhtmlarr.push('</tr>');

													gridhtmlarr.push(g
															._getHtmlFromData(
																	item,
																	frozen));

													if (g.isTotalSummary())
														gridhtmlarr
																.push(g
																		._getTotalSummaryHtml(
																				item,
																				"l-grid-totalsummary-group",
																				frozen));
												});
							} else {
								gridhtmlarr.push(g._getHtmlFromData(data,
										frozen));
							}
							gridhtmlarr.push('</tbody></table></div>');
							if (frozen)
								gridhtmlarr
										.push('<div class="l-jplace"></div>');
							(frozen ? g.f.gridbody : g.gridbody)
									.html(gridhtmlarr.join(''));

							if (!g.enabledGroup()) {

								g._bulidTotalSummary(frozen);
							}
							$("> div:first", g.gridbody)
									.width(g.gridtablewidth);
							g._onResize();
						},
						_showData : function() {
							var g = this, p = this.options;
							g.changedCells = {};
							var data = g.currentData[p.root];
							if (p.usePager) {

								if (p.dataAction == "server" && g.data
										&& g.data[p.record])
									p.total = g.data[p.record];
								else if (g.filteredData
										&& g.filteredData[p.root])
									p.total = g.filteredData[p.root].length;
								else if (g.data && g.data[p.root])
									p.total = g.data[p.root].length;
								else if (data)
									p.total = data.length;

								p.page = p.newPage;
								if (!p.total)
									p.total = 0;
								if (!p.page)
									p.page = 1;
								p.pageCount = Math.ceil(p.total / p.pageSize);
								if (!p.pageCount)
									p.pageCount = 1;

								g._buildPager();
							}

							$('.l-bar-btnloading:first', g.toolbar)
									.removeClass('l-bar-btnloading');
							if (g.trigger('beforeShowData', [ g.currentData ]) == false)
								return;
							g._clearGrid();
							g.isDataChanged = false;
							if (!data || !data.length) {
								g.gridview.addClass("l-grid-empty");
								$("<div></div>").addClass("l-grid-body-inner")
										.appendTo(g.gridbody).css(
												{
													width : g.gridheader.find(
															">div:first")
															.width(),
													height : g.gridbody
															.height()
												});
								g._onResize.jqueryDefer(g, 50);
								return;
							} else {
								g.gridview.removeClass("l-grid-empty");
							}
							$(".l-bar-btnload:first span", g.toolbar)
									.removeClass("l-disabled");
							g._updateGridData();
							if (g.enabledFrozen())
								g._fillGridBody(g.rows, true);
							g._fillGridBody(g.rows, false);
							g.trigger('SysGridHeightChanged');
							if (p.totalRender) {
								$(".l-panel-bar-total", g.element).remove();
								$(".l-panel-bar", g.element).before(
										'<div class="l-panel-bar-total">'
												+ p.totalRender(g.data,
														g.filteredData)
												+ '</div>');
							}
							if (p.mouseoverRowCssClass) {
								for ( var i in g.rows) {
									var rowobj = $(g.getRowObj(g.rows[i]));
									if (g.enabledFrozen())
										rowobj = rowobj.add(g.getRowObj(
												g.rows[i], true));
									rowobj.bind('mouseover.gridrow',
											function() {
												g._onRowOver(this, true);
											}).bind('mouseout.gridrow',
											function() {
												g._onRowOver(this, false);
											});
								}
							}
							g._fixHeight();
							g.gridbody.trigger('scroll.grid');
							g.trigger('afterShowData', [ g.currentData ]);
						},
						_fixHeight : function() {
							var g = this, p = this.options;
							if (p.fixedCellHeight || !p.frozen)
								return;
							var column1, column2;
							for ( var i in g.columns) {
								var column = g.columns[i];
								if (column1 && column2)
									break;
								if (column.frozen && !column1) {
									column1 = column;
									continue;
								}
								if (!column.frozen && !column2) {
									column2 = column;
									continue;
								}
							}
							if (!column1 || !column2)
								return;
							for ( var rowid in g.records) {
								var cell1 = g.getCellObj(rowid, column1), cell2 = g
										.getCellObj(rowid, column2);
								var height = Math.max($(cell1).height(),
										($(cell2).height()));
								$(cell1).add(cell2).height(height);
							}
						},
						_getRowDomId : function(rowdata, frozen) {
							return this.id + "|" + (frozen ? "1" : "2") + "|"
									+ rowdata['__id'];
						},
						_getCellDomId : function(rowdata, column) {
							return this._getRowDomId(rowdata, column.frozen)
									+ "|" + column['__id'];
						},
						_getHtmlFromData : function(data, frozen) {
							if (!data)
								return "";
							var g = this, p = this.options;
							var gridhtmlarr = [];
							for (var i = 0, l = data.length; i < l; i++) {
								var item = data[i];
								var rowid = item['__id'];
								if (!item)
									continue;
								gridhtmlarr.push('<tr');
								gridhtmlarr.push(' id="'
										+ g._getRowDomId(item, frozen) + '"');
								gridhtmlarr.push(' class="l-grid-row');
								if (!frozen && g.enabledCheckbox()
										&& p.isChecked && p.isChecked(item)) {
									g.select(item);
									gridhtmlarr.push(' l-selected');
								} else if (g.isSelected(item)) {
									gridhtmlarr.push(' l-selected');
								} else if (p.isSelected && p.isSelected(item)) {
									g.select(item);
									gridhtmlarr.push(' l-selected');
								}
								if (item['__index'] % 2 == 1
										&& p.alternatingRow)
									gridhtmlarr.push(' l-grid-row-alt');
								gridhtmlarr.push('" ');
								if (p.rowAttrRender)
									gridhtmlarr.push(p.rowAttrRender(item,
											rowid));
								if (p.tree && g.collapsedRows
										&& g.collapsedRows.length) {
									var isHide = function() {
										var pitem = g.getParent(item);
										while (pitem) {
											if ($.inArray(pitem,
													g.collapsedRows) != -1)
												return true;
											pitem = g.getParent(pitem);
										}
										return false;
									};
									if (isHide())
										gridhtmlarr
												.push(' style="display:none;" ');
								}
								gridhtmlarr.push('>');
								$(g.columns)
										.each(
												function(columnindex, column) {
													if (frozen != column.frozen)
														return;
													gridhtmlarr.push('<td');
													gridhtmlarr.push(' id="'
															+ g._getCellDomId(
																	item, this)
															+ '"');

													if (this.isrownumber) {
														gridhtmlarr
																.push(' class="l-grid-row-cell l-grid-row-cell-rownumbers" style="width:'
																		+ this.width
																		+ 'px"><div class="l-grid-row-cell-inner"');
														if (p.fixedCellHeight)
															gridhtmlarr
																	.push(' style = "height:'
																			+ p.rowHeight
																			+ 'px;" ');
														else
															gridhtmlarr
																	.push(' style = "min-height:'
																			+ p.rowHeight
																			+ 'px;" ');
														gridhtmlarr
																.push('>'
																		+ (parseInt(item['__index']) + 1)
																		+ '</div></td>');
														return;
													}

													if (this.ischeckbox) {
														gridhtmlarr
																.push(' class="l-grid-row-cell l-grid-row-cell-checkbox" style="width:'
																		+ this.width
																		+ 'px"><div class="l-grid-row-cell-inner"');
														if (p.fixedCellHeight)
															gridhtmlarr
																	.push(' style = "height:'
																			+ p.rowHeight
																			+ 'px;" ');
														else
															gridhtmlarr
																	.push(' style = "min-height:'
																			+ p.rowHeight
																			+ 'px;" ');
														gridhtmlarr.push('>');
														gridhtmlarr
																.push('<span class="l-grid-row-cell-btn-checkbox"></span>');
														gridhtmlarr
																.push('</div></td>');
														return;
													}

													else if (this.isdetail) {
														gridhtmlarr
																.push(' class="l-grid-row-cell l-grid-row-cell-detail" style="width:'
																		+ this.width
																		+ 'px"><div class="l-grid-row-cell-inner"');
														if (p.fixedCellHeight)
															gridhtmlarr
																	.push(' style = "height:'
																			+ p.rowHeight
																			+ 'px;" ');
														else
															gridhtmlarr
																	.push(' style = "min-height:'
																			+ p.rowHeight
																			+ 'px;" ');
														gridhtmlarr.push('>');
														if (!p.isShowDetailToggle
																|| p
																		.isShowDetailToggle(item)) {
															gridhtmlarr
																	.push('<span class="l-grid-row-cell-detailbtn"></span>');
														}
														gridhtmlarr
																.push('</div></td>');
														return;
													}
													var colwidth = this._width;
													gridhtmlarr
															.push(' class="l-grid-row-cell ');
													if (g.changedCells[rowid
															+ "_"
															+ this['__id']])
														gridhtmlarr
																.push("l-grid-row-cell-edited ");
													if (this.islast)
														gridhtmlarr
																.push('l-grid-row-cell-last ');
													gridhtmlarr.push('"');

													gridhtmlarr
															.push(' style = "');
													gridhtmlarr
															.push('width:'
																	+ colwidth
																	+ 'px; ');
													if (column._hide) {
														gridhtmlarr
																.push('display:none;');
													}
													gridhtmlarr.push(' ">');
													gridhtmlarr.push(g
															._getCellHtml(item,
																	column));
													gridhtmlarr.push('</td>');
												});
								gridhtmlarr.push('</tr>');
							}
							return gridhtmlarr.join('');
						},
						_getCellHtml : function(rowdata, column) {
							var g = this, p = this.options;
							if (column.isrownumber)
								return '<div class="l-grid-row-cell-inner">'
										+ (parseInt(rowdata['__index']) + 1)
										+ '</div>';
							var htmlarr = [];
							htmlarr.push('<div class="l-grid-row-cell-inner"');

							htmlarr.push(' style = "width:'
									+ parseInt(column._width - 8) + 'px;');
							if (p.fixedCellHeight)
								htmlarr.push('height:' + p.rowHeight + 'px;');
							htmlarr.push('min-height:' + p.rowHeight + 'px; ');
							if (column.align)
								htmlarr
										.push('text-align:' + column.align
												+ ';');
							var content = g._getCellContent(rowdata, column);
							htmlarr.push('">' + content + '</div>');
							return htmlarr.join('');
						},
						_setValueByName : function(data, name, value) {
							if (!data || !name)
								return null;
							if (name.indexOf('.') == -1) {
								data[name] = value;
							} else {
								try {
									new Function("data,value", "data." + name
											+ "=value;")(data, value);
								} catch (e) {
								}
							}
						},
						_getValueByName : function(data, name) {
							if (!data || !name)
								return null;
							if (name.indexOf('.') == -1) {
								return data[name];
							} else {
								try {
									return new Function("data", "return data."
											+ name + ";")(data);
								} catch (e) {
									return null;
								}
							}
						},
						_getCellContent : function(rowdata, column) {
							var g = this, p = this.options;
							if (!rowdata || !column)
								return "";
							if (column.isrownumber)
								return parseInt(rowdata['__index']) + 1;
							var rowid = rowdata['__id'];
							var rowindex = rowdata['__index'];
							var value = g._getValueByName(rowdata, column.name);
							var text = g._getValueByName(rowdata,
									column.textField);
							var content = "";
							if (column.render) {
								content = column.render.call(g, rowdata,
										rowindex, value, column);
							} else if (p.formatters[column.type]) {
								content = p.formatters[column.type].call(g,
										value, column);
							} else if (text != null) {
								content = text.toString();
							} else if (value != null) {
								content = value.toString();
							}
							if (p.tree
									&& (p.tree.columnName != null
											&& p.tree.columnName == column.name || p.tree.columnId != null
											&& p.tree.columnId == column.id)) {
								content = g._getTreeCellHtml(content, rowdata);
							}
							return content || "";
						},
						_getTreeCellHtml : function(oldContent, rowdata) {
							var level = rowdata['__level'];
							var g = this, p = this.options;

							var isExtend = $.inArray(rowdata, g.collapsedRows
									|| []) == -1;
							var isParent = p.tree.isParent(rowdata);
							var content = "";
							level = parseInt(level) || 1;
							for (var i = 1; i < level; i++) {
								content += "<div class='l-grid-tree-space'></div>";
							}
							if (isExtend && isParent)
								content += "<div class='l-grid-tree-space l-grid-tree-link l-grid-tree-link-open'></div>";
							else if (isParent)
								content += "<div class='l-grid-tree-space l-grid-tree-link l-grid-tree-link-close'></div>";
							else
								content += "<div class='l-grid-tree-space'></div>";
							content += "<span class='l-grid-tree-content'>"
									+ oldContent + "</span>";
							return content;
						},
						_applyEditor : function(obj) {
							var g = this, p = this.options;
							var rowcell = obj, ids = rowcell.id.split('|');
							var columnid = ids[ids.length - 1], column = g._columns[columnid];
							var row = $(rowcell).parent(), rowdata = g
									.getRow(row[0]), rowid = rowdata['__id'], rowindex = rowdata['__index'];
							if (!column || !column.editor)
								return;
							var columnname = column.name, columnindex = column.columnindex;
							if (column.editor.type
									&& p.editors[column.editor.type]) {
								var currentdata = g._getValueByName(rowdata,
										columnname);
								var editParm = {
									record : rowdata,
									value : currentdata,
									column : column,
									rowindex : rowindex
								};
								if (column.textField)
									editParm.text = g._getValueByName(rowdata,
											column.textField);
								if (g.trigger('beforeEdit', [ editParm ]) == false)
									return false;
								g.lastEditRow = rowdata;
								var editor = p.editors[column.editor.type], jcell = $(rowcell), offset = $(
										rowcell).offset(), width = $(rowcell)
										.width(), height = $(rowcell).height(), container = $(
										"<div class='l-grid-editor'></div>")
										.appendTo(g.grid), left = 0, top = 0, pc = jcell
										.position(), pb = g.gridbody.position(), pv = g.gridview2
										.position(),

								topbarHeight = (p.toolbar ? g.topbar.parent()
										.outerHeight() : 0)
										+ (p.title ? g.header.outerHeight() : 0), left = pc.left
										+ pb.left + pv.left, top = pc.top
										+ pb.top + pv.top + topbarHeight;

								jcell.html("");
								g.setCellEditing(rowdata, column, true);
								container.css(
										{
											left : left,
											top : ($.browser.safari ? top
													: top - 1)
													+ p.editorTopDiff
										}).show();
								if (column.textField)
									editParm.text = g._getValueByName(rowdata,
											column.textField);
								var editorInput = g._createEditor(editor,
										container, editParm, width, height - 1);
								g.editor = {
									editing : true,
									editor : editor,
									input : editorInput,
									editParm : editParm,
									container : container
								};
								g.unbind('sysEndEdit');
								g.bind('sysEndEdit', function() {
									var newValue = editor.getValue(editorInput,
											editParm);
									if (column.textField && editor.getText) {
										editParm.text = editor.getText(
												editorInput, editParm);
									}
									if (editor.getSelected) {
										editParm.selected = editor.getSelected(
												editorInput, editParm);
									}
									if (newValue != currentdata) {
										$(rowcell).addClass(
												"l-grid-row-cell-edited");
										g.changedCells[rowid + "_"
												+ column['__id']] = true;
										if (column.textField != column.name) {
											editParm.value = newValue;
										}
									}
									if (column.editor.onChange)
										column.editor.onChange(editParm);
									if (g._checkEditAndUpdateCell(editParm)) {
										if (column.editor.onChanged)
											column.editor.onChanged(editParm);
									}
								});
							}
						},
						_checkEditAndUpdateCell : function(editParm) {
							var g = this, p = this.options;
							if (g.trigger('beforeSubmitEdit', [ editParm ]) == false)
								return false;
							var column = editParm.column;
							if (editParm.text && column.textField)
								g._setValueByName(editParm.record,
										column.textField, editParm.text);
							g.updateCell(column, editParm.value,
									editParm.record);
							if (column.render || g.enabledTotal())
								g.reRender({
									column : column
								});
							g.reRender({
								rowdata : editParm.record
							});
							return true;
						},
						_getCurrentPageData : function(source) {
							var g = this, p = this.options;
							var data = {};
							data[p.root] = [];
							if (!source || !source[p.root]
									|| !source[p.root].length) {
								data[p.record] = 0;
								return data;
							}
							data[p.record] = source[p.root].length;
							if (!p.newPage)
								p.newPage = 1;
							for (i = (p.newPage - 1) * p.pageSize; i < source[p.root].length
									&& i < p.newPage * p.pageSize; i++) {
								data[p.root].push(source[p.root][i]);
							}
							return data;
						},

						_compareData : function(data1, data2, columnName,
								columnType) {
							var g = this, p = this.options;
							var val1 = data1[columnName], val2 = data2[columnName];
							if (val1 == null && val2 != null)
								return 1;
							else if (val1 == null && val2 == null)
								return 0;
							else if (val1 != null && val2 == null)
								return -1;
							if (p.sorters[columnType])
								return p.sorters[columnType]
										.call(g, val1, val2);
							else
								return val1 < val2 ? -1 : val1 > val2 ? 1 : 0;
						},
						_getTotalCellContent : function(column, data) {
							var g = this, p = this.options;
							var totalsummaryArr = [];
							if (column.totalSummary) {
								var isExist = function(type) {
									for (var i = 0; i < types.length; i++)
										if (types[i].toLowerCase() == type
												.toLowerCase())
											return true;
									return false;
								};
								var sum = 0, count = 0, avg = 0;
								var max = parseFloat(data[0][column.name]);
								var min = parseFloat(data[0][column.name]);
								for (var i = 0; i < data.length; i++) {
									if (data[i][p.statusName] == 'delete')
										continue;
									count += 1;
									var value = data[i][column.name];
									if (typeof (value) == "string")
										value = value.replace(/\$|\,/g, '');
									value = parseFloat(value);
									if (!value)
										continue;
									sum += value;
									if (value > max)
										max = value;
									if (value < min)
										min = value;
								}
								avg = sum * 1.0 / data.length;
								if (column.totalSummary.render) {
									var renderhtml = column.totalSummary
											.render({
												sum : sum,
												count : count,
												avg : avg,
												min : min,
												max : max
											}, column, g.data);
									totalsummaryArr.push(renderhtml);
								} else if (column.totalSummary.type) {
									var types = column.totalSummary.type
											.split(',');
									if (isExist('sum'))
										totalsummaryArr.push("<div>Sum="
												+ sum.toFixed(2) + "</div>");
									if (isExist('count'))
										totalsummaryArr.push("<div>Count="
												+ count + "</div>");
									if (isExist('max'))
										totalsummaryArr.push("<div>Max="
												+ max.toFixed(2) + "</div>");
									if (isExist('min'))
										totalsummaryArr.push("<div>Min="
												+ min.toFixed(2) + "</div>");
									if (isExist('avg'))
										totalsummaryArr.push("<div>Avg="
												+ avg.toFixed(2) + "</div>");
								}
							}
							return totalsummaryArr.join('');
						},
						_getTotalSummaryHtml : function(data, classCssName,
								frozen) {
							var g = this, p = this.options;
							var totalsummaryArr = [];
							if (classCssName)
								totalsummaryArr
										.push('<tr class="l-grid-totalsummary '
												+ classCssName + '">');
							else
								totalsummaryArr
										.push('<tr class="l-grid-totalsummary">');
							$(g.columns)
									.each(
											function(columnindex, column) {
												if (this.frozen != frozen)
													return;

												if (this.isrownumber) {
													totalsummaryArr
															.push('<td class="l-grid-totalsummary-cell l-grid-totalsummary-cell-rownumbers" style="width:'
																	+ this.width
																	+ 'px"><div>&nbsp;</div></td>');
													return;
												}

												if (this.ischeckbox) {
													totalsummaryArr
															.push('<td class="l-grid-totalsummary-cell l-grid-totalsummary-cell-checkbox" style="width:'
																	+ this.width
																	+ 'px"><div>&nbsp;</div></td>');
													return;
												}

												else if (this.isdetail) {
													totalsummaryArr
															.push('<td class="l-grid-totalsummary-cell l-grid-totalsummary-cell-detail" style="width:'
																	+ this.width
																	+ 'px"><div>&nbsp;</div></td>');
													return;
												}
												totalsummaryArr
														.push('<td class="l-grid-totalsummary-cell');
												if (this.islast)
													totalsummaryArr
															.push(" l-grid-totalsummary-cell-last");
												totalsummaryArr.push('" ');
												totalsummaryArr.push('id="'
														+ g.id + "|total"
														+ g.totalNumber + "|"
														+ column.__id + '" ');
												totalsummaryArr.push('width="'
														+ this._width + '" ');
												columnname = this.columnname;
												if (columnname) {
													totalsummaryArr
															.push('columnname="'
																	+ columnname
																	+ '" ');
												}
												totalsummaryArr
														.push('columnindex="'
																+ columnindex
																+ '" ');
												totalsummaryArr
														.push('><div class="l-grid-totalsummary-cell-inner"');
												if (column.align)
													totalsummaryArr
															.push(' style="text-Align:'
																	+ column.align
																	+ ';"');
												totalsummaryArr.push('>');
												totalsummaryArr.push(g
														._getTotalCellContent(
																column, data));
												totalsummaryArr
														.push('</div></td>');
											});
							totalsummaryArr.push('</tr>');
							if (!frozen)
								g.totalNumber++;
							return totalsummaryArr.join('');
						},
						_bulidTotalSummary : function(frozen) {
							var g = this, p = this.options;
							if (!g.isTotalSummary())
								return false;
							if (!g.currentData
									|| g.currentData[p.root].length == 0)
								return false;
							var totalRow = $(g._getTotalSummaryHtml(
									g.currentData[p.root], null, frozen));
							$("tbody:first", frozen ? g.f.gridbody : g.gridbody)
									.append(totalRow);
							if (frozen)
								g.totalRow1 = totalRow;
							else
								g.totalRow2 = totalRow;
						},
						updateTotalSummary : function() {
							var g = this, p = this.options;
							if (!g.isTotalSummary())
								return;
							if (!g.currentData
									|| g.currentData[p.root].length == 0)
								return;
							var totalRow2 = $(g._getTotalSummaryHtml(
									g.currentData[p.root], null, false));
							if (g.totalRow2)
								g.totalRow2.html(totalRow2.html());
						},
						_buildPager : function() {
							var g = this, p = this.options;
							$('.pcontrol input', g.toolbar).val(p.page);
							if (!p.pageCount)
								p.pageCount = 1;
							$('.pcontrol span', g.toolbar).html(p.pageCount);
							var r1 = parseInt((p.page - 1) * p.pageSize) + 1.0;
							var r2 = parseInt(r1) + parseInt(p.pageSize) - 1;
							if (!p.total)
								p.total = 0;
							if (p.total < r2)
								r2 = p.total;
							if (!p.total)
								r1 = r2 = 0;
							if (r1 < 0)
								r1 = 0;
							if (r2 < 0)
								r2 = 0;
							var stat = p.pageStatMessage;
							stat = stat.replace(/{from}/, r1);
							stat = stat.replace(/{to}/, r2);
							stat = stat.replace(/{total}/, p.total);
							stat = stat.replace(/{pagesize}/, p.pageSize);
							$('.l-bar-text', g.toolbar).html(stat);
							if (!p.total) {
								$(
										".l-bar-btnfirst span,.l-bar-btnprev span,.l-bar-btnnext span,.l-bar-btnlast span",
										g.toolbar).addClass("l-disabled");
							}
							if (p.page == 1) {
								$(".l-bar-btnfirst span", g.toolbar).addClass(
										"l-disabled");
								$(".l-bar-btnprev span", g.toolbar).addClass(
										"l-disabled");
							} else if (p.page > p.pageCount && p.pageCount > 0) {
								$(".l-bar-btnfirst span", g.toolbar)
										.removeClass("l-disabled");
								$(".l-bar-btnprev span", g.toolbar)
										.removeClass("l-disabled");
							}
							if (p.page == p.pageCount) {
								$(".l-bar-btnlast span", g.toolbar).addClass(
										"l-disabled");
								$(".l-bar-btnnext span", g.toolbar).addClass(
										"l-disabled");
							} else if (p.page < p.pageCount && p.pageCount > 0) {
								$(".l-bar-btnlast span", g.toolbar)
										.removeClass("l-disabled");
								$(".l-bar-btnnext span", g.toolbar)
										.removeClass("l-disabled");
							}
						},
						_getRowIdByDomId : function(domid) {
							var ids = domid.split('|');
							var rowid = ids[2];
							return rowid;
						},
						_getRowByDomId : function(domid) {
							return this.records[this._getRowIdByDomId(domid)];
						},

						_isEditing : function(jobjs) {
							return jobjs.hasClass("l-box-dateeditor")
									|| jobjs.hasClass("l-box-select");
						},
						_getSrcElementByEvent : function(e) {
							var g = this;
							var obj = (e.target || e.srcElement);
							var jobjs = $(obj).parents().add(obj);
							var fn = function(parm) {
								for (var i = 0, l = jobjs.length; i < l; i++) {
									if (typeof parm == "string") {
										if ($(jobjs[i]).hasClass(parm))
											return jobjs[i];
									} else if (typeof parm == "object") {
										if (jobjs[i] == parm)
											return jobjs[i];
									}
								}
								return null;
							};
							if (fn("l-grid-editor"))
								return {
									editing : true,
									editor : fn("l-grid-editor")
								};
							if (jobjs.index(this.element) == -1) {
								if (g._isEditing(jobjs))
									return {
										editing : true
									};
								else
									return {
										out : true
									};
							}
							var indetail = false;
							if (jobjs.hasClass("l-grid-detailpanel")
									&& g.detailrows) {
								for (var i = 0, l = g.detailrows.length; i < l; i++) {
									if (jobjs.index(g.detailrows[i]) != -1) {
										indetail = true;
										break;
									}
								}
							}
							var r = {
								grid : fn("l-panel"),
								indetail : indetail,
								frozen : fn(g.gridview1[0]) ? true : false,
								header : fn("l-panel-header"),
								gridheader : fn("l-grid-header"),
								gridbody : fn("l-grid-body"),
								total : fn("l-panel-bar-total"),
								popup : fn("l-grid-popup"),
								toolbar : fn("l-panel-bar")
							};
							if (r.gridheader) {
								r.hrow = fn("l-grid-hd-row");
								r.hcell = fn("l-grid-hd-cell");
								r.hcelltext = fn("l-grid-hd-cell-text");
								r.checkboxall = fn("l-grid-hd-cell-checkbox");
								if (r.hcell) {
									var columnid = r.hcell.id.split('|')[2];
									r.column = g._columns[columnid];
								}
							}
							if (r.gridbody) {
								r.row = fn("l-grid-row");
								r.cell = fn("l-grid-row-cell");
								r.checkbox = fn("l-grid-row-cell-btn-checkbox");
								r.groupbtn = fn("l-grid-group-togglebtn");
								r.grouprow = fn("l-grid-grouprow");
								r.detailbtn = fn("l-grid-row-cell-detailbtn");
								r.detailrow = fn("l-grid-detailpanel");
								r.totalrow = fn("l-grid-totalsummary");
								r.totalcell = fn("l-grid-totalsummary-cell");
								r.rownumberscell = $(r.cell).hasClass(
										"l-grid-row-cell-rownumbers") ? r.cell
										: null;
								r.detailcell = $(r.cell).hasClass(
										"l-grid-row-cell-detail") ? r.cell
										: null;
								r.checkboxcell = $(r.cell).hasClass(
										"l-grid-row-cell-checkbox") ? r.cell
										: null;
								r.treelink = fn("l-grid-tree-link");
								r.editor = fn("l-grid-editor");
								if (r.row)
									r.data = this._getRowByDomId(r.row.id);
								if (r.cell)
									r.editing = $(r.cell).hasClass(
											"l-grid-row-cell-editing");
								if (r.editor)
									r.editing = true;
								if (r.editing)
									r.out = false;
							}
							if (r.toolbar) {
								r.first = fn("l-bar-btnfirst");
								r.last = fn("l-bar-btnlast");
								r.next = fn("l-bar-btnnext");
								r.prev = fn("l-bar-btnprev");
								r.load = fn("l-bar-btnload");
								r.button = fn("l-bar-button");
							}

							return r;
						},
						_setEvent : function() {
							var g = this, p = this.options;
							g.grid.bind("mousedown.grid", function(e) {
								g._onMouseDown.call(g, e);
							});
							g.grid.bind("dblclick.grid", function(e) {
								g._onDblClick.call(g, e);
							});
							g.grid.bind("contextmenu.grid", function(e) {
								return g._onContextmenu.call(g, e);
							});
							$(document).bind("mouseup.grid", function(e) {
								g._onMouseUp.call(g, e);
							});
							$(document).bind("click.grid", function(e) {
								g._onClick.call(g, e);
							});
							$(window).bind("resize.grid", function(e) {
								g._onResize.call(g);
							});
							$(document).bind("keydown.grid", function(e) {
								if (e.ctrlKey)
									g.ctrlKey = true;
							});
							$(document).bind("keyup.grid", function(e) {
								delete g.ctrlKey;
							});

							g.gridbody.bind('scroll.grid', function() {
								var scrollLeft = g.gridbody.scrollLeft();
								var scrollTop = g.gridbody.scrollTop();
								if (scrollLeft != null)
									g.gridheader[0].scrollLeft = scrollLeft;
								if (scrollTop != null)
									g.f.gridbody[0].scrollTop = scrollTop;
								g.trigger('SysGridHeightChanged');
							});

							$('select', g.toolbar)
									.change(
											function() {
												if (g.isDataChanged
														&& p.dataAction != "local"
														&& !confirm(p.isContinueByDataChanged))
													return false;
												p.newPage = 1;
												p.pageSize = this.value;
												g
														.loadData(p.dataAction != "local" ? p.where
																: false);
											});

							$('span.pcontrol :text', g.toolbar).blur(
									function(e) {
										g.changePage('input');
									});
							$("div.l-bar-button", g.toolbar).hover(function() {
								$(this).addClass("l-bar-button-over");
							}, function() {
								$(this).removeClass("l-bar-button-over");
							});

							if ($.fn.jqueryDrag && p.colDraggable) {
								g.colDroptip = $(
										"<div class='l-drag-coldroptip' style='display:none'><div class='l-drop-move-up'></div><div class='l-drop-move-down'></div></div>")
										.appendTo('body');
								g.gridheader
										.add(g.f.gridheader)
										.jqueryDrag(
												{
													revert : true,
													animate : false,
													proxyX : 0,
													proxyY : 0,
													proxy : function(draggable,
															e) {
														var src = g
																._getSrcElementByEvent(e);
														if (src.hcell
																&& src.column) {
															var content = $(
																	".l-grid-hd-cell-text:first",
																	src.hcell)
																	.html();
															var proxy = $(
																	"<div class='l-drag-proxy' style='display:none'><div class='l-drop-icon l-drop-no'></div></div>")
																	.appendTo(
																			'body');
															proxy
																	.append(content);
															return proxy;
														}
													},
													onRevert : function() {
														return false;
													},
													onRendered : function() {
														this.set('cursor',
																'default');
														g.children[this.id] = this;
													},
													onStartDrag : function(
															current, e) {
														if (e.button == 2)
															return false;
														if (g.colresizing)
															return false;
														this.set('cursor',
																'default');
														var src = g
																._getSrcElementByEvent(e);
														if (!src.hcell
																|| !src.column
																|| src.column.issystem
																|| src.hcelltext)
															return false;
														if ($(src.hcell)
																.css('cursor')
																.indexOf(
																		'resize') != -1)
															return false;
														this.draggingColumn = src.column;
														g.coldragging = true;

														var gridOffset = g.grid
																.offset();
														this.validRange = {
															top : gridOffset.top,
															bottom : gridOffset.top
																	+ g.gridheader
																			.height(),
															left : gridOffset.left - 10,
															right : gridOffset.left
																	+ g.grid
																			.width()
																	+ 10
														};
													},
													onDrag : function(current,
															e) {
														this.set('cursor',
																'default');
														var column = this.draggingColumn;
														if (!column)
															return false;
														if (g.colresizing)
															return false;
														if (g.colDropIn == null)
															g.colDropIn = -1;
														var pageX = e.pageX;
														var pageY = e.pageY;
														var visit = false;
														var gridOffset = g.grid
																.offset();
														var validRange = this.validRange;
														if (pageX < validRange.left
																|| pageX > validRange.right
																|| pageY > validRange.bottom
																|| pageY < validRange.top) {
															g.colDropIn = -1;
															g.colDroptip.hide();
															this.proxy
																	.find(
																			".l-drop-icon:first")
																	.removeClass(
																			"l-drop-yes")
																	.addClass(
																			"l-drop-no");
															return;
														}
														for ( var colid in g._columns) {
															var col = g._columns[colid];
															if (column == col) {
																visit = true;
																continue;
															}
															if (col.issystem)
																continue;
															var sameLevel = col['__level'] == column['__level'];
															var isAfter = !sameLevel ? false
																	: visit ? true
																			: false;
															if (column.frozen != col.frozen)
																isAfter = col.frozen ? false
																		: true;
															if (g.colDropIn != -1
																	&& g.colDropIn != colid)
																continue;
															var cell = document
																	.getElementById(col['__domid']);
															var offset = $(cell)
																	.offset();
															var range = {
																top : offset.top,
																bottom : offset.top
																		+ $(
																				cell)
																				.height(),
																left : offset.left - 10,
																right : offset.left + 10
															};
															if (isAfter) {
																var cellwidth = $(
																		cell)
																		.width();
																range.left += cellwidth;
																range.right += cellwidth;
															}
															if (pageX > range.left
																	&& pageX < range.right
																	&& pageY > range.top
																	&& pageY < range.bottom) {
																var height = p.headerRowHeight;
																if (col['__rowSpan'])
																	height *= col['__rowSpan'];
																g.colDroptip
																		.css(
																				{
																					left : range.left + 5,
																					top : range.top - 9,
																					height : height + 9 * 2
																				})
																		.show();
																g.colDropIn = colid;
																g.colDropDir = isAfter ? "right"
																		: "left";
																this.proxy
																		.find(
																				".l-drop-icon:first")
																		.removeClass(
																				"l-drop-no")
																		.addClass(
																				"l-drop-yes");
																break;
															} else if (g.colDropIn != -1) {
																g.colDropIn = -1;
																g.colDroptip
																		.hide();
																this.proxy
																		.find(
																				".l-drop-icon:first")
																		.removeClass(
																				"l-drop-yes")
																		.addClass(
																				"l-drop-no");
															}
														}
													},
													onStopDrag : function(
															current, e) {
														var column = this.draggingColumn;
														g.coldragging = false;
														if (g.colDropIn != -1) {
															g.changeCol
																	.jqueryDefer(
																			g,
																			0,
																			[
																					column,
																					g.colDropIn,
																					g.colDropDir == "right" ]);
															g.colDropIn = -1;
														}
														g.colDroptip.hide();
														this.set('cursor',
																'default');
													}
												});
							}

							if ($.fn.jqueryDrag && p.rowDraggable) {
								g.rowDroptip = $(
										"<div class='l-drag-rowdroptip' style='display:none'></div>")
										.appendTo('body');
								g.gridbody
										.add(g.f.gridbody)
										.jqueryDrag(
												{
													revert : true,
													animate : false,
													proxyX : 0,
													proxyY : 0,
													proxy : function(draggable,
															e) {
														var src = g
																._getSrcElementByEvent(e);
														if (src.row) {
															var content = p.draggingMessage
																	.replace(
																			/{count}/,
																			draggable.draggingRows ? draggable.draggingRows.length
																					: 1);
															if (p.rowDraggingRender) {
																content = p
																		.rowDraggingRender(
																				draggable.draggingRows,
																				draggable,
																				g);
															}
															var proxy = $(
																	"<div class='l-drag-proxy' style='display:none'><div class='l-drop-icon l-drop-no'></div>"
																			+ content
																			+ "</div>")
																	.appendTo(
																			'body');
															return proxy;
														}
													},
													onRevert : function() {
														return false;
													},
													onRendered : function() {
														this.set('cursor',
																'default');
														g.children[this.id] = this;
													},
													onStartDrag : function(
															current, e) {
														if (e.button == 2)
															return false;
														if (g.colresizing)
															return false;
														if (!g.columns.length)
															return false;
														this.set('cursor',
																'default');
														var src = g
																._getSrcElementByEvent(e);
														if (!src.cell
																|| !src.data
																|| src.checkbox)
															return false;
														var ids = src.cell.id
																.split('|');
														var column = g._columns[ids[ids.length - 1]];
														if (src.rownumberscell
																|| src.detailcell
																|| src.checkboxcell
																|| column == g.columns[0]) {
															if (g
																	.enabledCheckbox()) {
																this.draggingRows = g
																		.getSelecteds();
																if (!this.draggingRows
																		|| !this.draggingRows.length)
																	return false;
															} else {
																this.draggingRows = [ src.data ];
															}
															this.draggingRow = src.data;
															this.set('cursor',
																	'move');
															g.rowdragging = true;
															this.validRange = {
																top : g.gridbody
																		.offset().top,
																bottom : g.gridbody
																		.offset().top
																		+ g.gridbody
																				.height(),
																left : g.grid
																		.offset().left - 10,
																right : g.grid
																		.offset().left
																		+ g.grid
																				.width()
																		+ 10
															};
														} else {
															return false;
														}
													},
													onDrag : function(current,
															e) {
														var rowdata = this.draggingRow;
														if (!rowdata)
															return false;
														var rows = this.draggingRows ? this.draggingRows
																: [ rowdata ];
														if (g.colresizing)
															return false;
														if (g.rowDropIn == null)
															g.rowDropIn = -1;
														var pageX = e.pageX;
														var pageY = e.pageY;
														var visit = false;
														var validRange = this.validRange;
														if (pageX < validRange.left
																|| pageX > validRange.right
																|| pageY > validRange.bottom
																|| pageY < validRange.top) {
															g.rowDropIn = -1;
															g.rowDroptip.hide();
															this.proxy
																	.find(
																			".l-drop-icon:first")
																	.removeClass(
																			"l-drop-yes l-drop-add")
																	.addClass(
																			"l-drop-no");
															return;
														}
														for ( var i in g.rows) {
															var rd = g.rows[i];
															var rowid = rd['__id'];
															if (rowdata == rd)
																visit = true;
															if ($.inArray(rd,
																	rows) != -1)
																continue;
															var isAfter = visit ? true
																	: false;
															if (g.rowDropIn != -1
																	&& g.rowDropIn != rowid)
																continue;
															var rowobj = g
																	.getRowObj(rowid);
															var offset = $(
																	rowobj)
																	.offset();
															var range = {
																top : offset.top - 4,
																bottom : offset.top
																		+ $(
																				rowobj)
																				.height()
																		+ 4,
																left : g.grid
																		.offset().left,
																right : g.grid
																		.offset().left
																		+ g.grid
																				.width()
															};
															if (pageX > range.left
																	&& pageX < range.right
																	&& pageY > range.top
																	&& pageY < range.bottom) {
																var lineTop = offset.top;
																if (isAfter)
																	lineTop += $(
																			rowobj)
																			.height();
																g.rowDroptip
																		.css(
																				{
																					left : range.left,
																					top : lineTop,
																					width : range.right
																							- range.left
																				})
																		.show();
																g.rowDropIn = rowid;
																g.rowDropDir = isAfter ? "bottom"
																		: "top";
																if (p.tree
																		&& pageY > range.top + 5
																		&& pageY < range.bottom - 5) {
																	this.proxy
																			.find(
																					".l-drop-icon:first")
																			.removeClass(
																					"l-drop-no l-drop-yes")
																			.addClass(
																					"l-drop-add");
																	g.rowDroptip
																			.hide();
																	g.rowDropInParent = true;
																} else {
																	this.proxy
																			.find(
																					".l-drop-icon:first")
																			.removeClass(
																					"l-drop-no l-drop-add")
																			.addClass(
																					"l-drop-yes");
																	g.rowDroptip
																			.show();
																	g.rowDropInParent = false;
																}
																break;
															} else if (g.rowDropIn != -1) {
																g.rowDropIn = -1;
																g.rowDropInParent = false;
																g.rowDroptip
																		.hide();
																this.proxy
																		.find(
																				".l-drop-icon:first")
																		.removeClass(
																				"l-drop-yes  l-drop-add")
																		.addClass(
																				"l-drop-no");
															}
														}
													},
													onStopDrag : function(
															current, e) {
														var rows = this.draggingRows;
														g.rowdragging = false;
														for (var i = 0; i < rows.length; i++) {
															var children = rows[i].children;
															if (children) {
																rows = $
																		.grep(
																				rows,
																				function(
																						node,
																						i) {
																					var isIn = $
																							.inArray(
																									node,
																									children) == -1;
																					return isIn;
																				});
															}
														}
														if (g.rowDropIn != -1) {
															if (p.tree) {
																var neardata, prow;
																if (g.rowDropInParent) {
																	prow = g
																			.getRow(g.rowDropIn);
																} else {
																	neardata = g
																			.getRow(g.rowDropIn);
																	prow = g
																			.getParent(neardata);
																}
																g
																		.appendRange(
																				rows,
																				prow,
																				neardata,
																				g.rowDropDir != "bottom");
																g
																		.trigger(
																				'rowDragDrop',
																				{
																					rows : rows,
																					parent : prow,
																					near : neardata,
																					after : g.rowDropDir == "bottom"
																				});
															} else {
																g
																		.moveRange(
																				rows,
																				g.rowDropIn,
																				g.rowDropDir == "bottom");
																g
																		.trigger(
																				'rowDragDrop',
																				{
																					rows : rows,
																					parent : prow,
																					near : g
																							.getRow(g.rowDropIn),
																					after : g.rowDropDir == "bottom"
																				});
															}

															g.rowDropIn = -1;
														}
														g.rowDroptip.hide();
														this.set('cursor',
																'default');
													}
												});
							}
						},
						_onRowOver : function(rowParm, over) {
							if (l.draggable.dragging)
								return;
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							var methodName = over ? "addClass" : "removeClass";
							if (g.enabledFrozen())
								$(g.getRowObj(rowdata, true))[methodName]
										(p.mouseoverRowCssClass);
							$(g.getRowObj(rowdata, false))[methodName]
									(p.mouseoverRowCssClass);
						},
						_onMouseUp : function(e) {
							var g = this, p = this.options;
							if (l.draggable.dragging) {
								var src = g._getSrcElementByEvent(e);

								if (src.hcell && src.column) {
									g.trigger('dragdrop', [ {
										type : 'header',
										column : src.column,
										cell : src.hcell
									}, e ]);
								} else if (src.row) {
									g.trigger('dragdrop', [ {
										type : 'row',
										record : src.data,
										row : src.row
									}, e ]);
								}
							}
						},
						_onMouseDown : function(e) {
							var g = this, p = this.options;
						},
						_onContextmenu : function(e) {
							var g = this, p = this.options;
							var src = g._getSrcElementByEvent(e);
							if (src.row) {
								if (p.whenRClickToSelect)
									g.select(src.data);
								if (g.hasBind('contextmenu')) {
									return g.trigger('contextmenu', [ {
										data : src.data,
										rowindex : src.data['__index'],
										row : src.row
									}, e ]);
								}
							} else if (src.hcell) {
								if (!p.allowHideColumn)
									return true;
								var columnindex = $(src.hcell).attr(
										"columnindex");
								if (columnindex == undefined)
									return true;
								var left = (e.pageX - g.body.offset().left + parseInt(g.body[0].scrollLeft));
								if (columnindex == g.columns.length - 1)
									left -= 50;
								g.popup.css({
									left : left,
									top : g.gridheader.height() + 1
								});
								g.popup.toggle();
								return false;
							}
						},
						_onDblClick : function(e) {
							var g = this, p = this.options;
							var src = g._getSrcElementByEvent(e);
							if (src.row) {
								g.trigger('dblClickRow', [ src.data,
										src.data['__id'], src.row ]);
							}
						},
						_onClick : function(e) {
							var obj = (e.target || e.srcElement);
							var g = this, p = this.options;
							var src = g._getSrcElementByEvent(e);
							if (src.out) {
								if (g.editor.editing && !$.jqueryui.win.masking)
									g.endEdit();
								if (p.allowHideColumn)
									g.popup.hide();
								return;
							}
							if (src.indetail || src.editing) {
								return;
							}
							if (g.editor.editing) {
								g.endEdit();
							}
							if (p.allowHideColumn) {
								if (!src.popup) {
									g.popup.hide();
								}
							}
							if (src.checkboxall) {
								var row = $(src.hrow);
								var uncheck = row.hasClass("l-checked");
								if (g.trigger('beforeCheckAllRow', [ !uncheck,
										g.element ]) == false)
									return false;
								if (uncheck) {
									row.removeClass("l-checked");
								} else {
									row.addClass("l-checked");
								}
								g.selected = [];
								for ( var rowid in g.records) {
									if (uncheck)
										g.unselect(g.records[rowid]);
									else
										g.select(g.records[rowid]);
								}
								g.trigger('checkAllRow',
										[ !uncheck, g.element ]);
							} else if (src.hcelltext) {
								var hcell = $(src.hcelltext).parent().parent();
								if (!p.enabledSort || !src.column)
									return;
								if (src.column.isSort == false)
									return;
								if (p.url && p.dataAction != "local"
										&& g.isDataChanged
										&& !confirm(p.isContinueByDataChanged))
									return;
								var sort = $(".l-grid-hd-cell-sort:first",
										hcell);
								var columnName = src.column.name;
								if (!columnName)
									return;
								if (sort.length > 0) {
									if (sort
											.hasClass("l-grid-hd-cell-sort-asc")) {
										sort
												.removeClass(
														"l-grid-hd-cell-sort-asc")
												.addClass(
														"l-grid-hd-cell-sort-desc");
										hcell
												.removeClass(
														"l-grid-hd-cell-asc")
												.addClass("l-grid-hd-cell-desc");
										g.trigger('ChangeSort', [ columnName,
												'desc' ]);
										g.changeSort(columnName, 'desc');
									} else if (sort
											.hasClass("l-grid-hd-cell-sort-desc")) {
										sort
												.removeClass(
														"l-grid-hd-cell-sort-desc")
												.addClass(
														"l-grid-hd-cell-sort-asc");
										hcell
												.removeClass(
														"l-grid-hd-cell-desc")
												.addClass("l-grid-hd-cell-asc");
										g.trigger('ChangeSort', [ columnName,
												'asc' ]);
										g.changeSort(columnName, 'asc');
									}
								} else {
									hcell.removeClass("l-grid-hd-cell-desc")
											.addClass("l-grid-hd-cell-asc");
									$(src.hcelltext)
											.after(
													"<span class='l-grid-hd-cell-sort l-grid-hd-cell-sort-asc'>&nbsp;&nbsp;</span>");
									g.trigger('ChangeSort',
											[ columnName, 'asc' ]);
									g.changeSort(columnName, 'asc');
								}
								$(".l-grid-hd-cell-sort", g.gridheader).add(
										$(".l-grid-hd-cell-sort",
												g.f.gridheader)).not(
										$(".l-grid-hd-cell-sort:first", hcell))
										.remove();
							}

							else if (src.detailbtn && p.detail) {
								var item = src.data;
								var row = $([ g.getRowObj(item, false) ]);
								if (g.enabledFrozen())
									row = row.add(g.getRowObj(item, true));
								var rowid = item['__id'];
								if ($(src.detailbtn).hasClass("l-open")) {
									if (p.detail.onCollapse)
										p.detail
												.onCollapse(
														item,
														$(
																".l-grid-detailpanel-inner:first",
																nextrow)[0]);
									row.next("tr.l-grid-detailpanel").hide();
									$(src.detailbtn).removeClass("l-open");
								} else {
									var nextrow = row
											.next("tr.l-grid-detailpanel");
									if (nextrow.length > 0) {
										nextrow.show();
										if (p.detail.onExtend)
											p.detail
													.onExtend(
															item,
															$(
																	".l-grid-detailpanel-inner:first",
																	nextrow)[0]);
										$(src.detailbtn).addClass("l-open");
										g.trigger('SysGridHeightChanged');
										return;
									}
									$(src.detailbtn).addClass("l-open");
									var frozenColNum = 0;
									for (var i = 0; i < g.columns.length; i++)
										if (g.columns[i].frozen)
											frozenColNum++;
									var detailRow = $("<tr class='l-grid-detailpanel'><td><div class='l-grid-detailpanel-inner' style='display:none'></div></td></tr>");
									var detailFrozenRow = $("<tr class='l-grid-detailpanel'><td><div class='l-grid-detailpanel-inner' style='display:none'></div></td></tr>");
									detailRow.find("div:first").width(
											g.gridheader.find("div:first")
													.width() - 50);
									detailRow.attr("id", g.id + "|detail|"
											+ rowid);
									g.detailrows = g.detailrows || [];
									g.detailrows.push(detailRow[0]);
									g.detailrows.push(detailFrozenRow[0]);
									var detailRowInner = $("div:first",
											detailRow);
									detailRowInner.parent().attr("colSpan",
											g.columns.length - frozenColNum);
									row.eq(0).after(detailRow);
									if (frozenColNum > 0) {
										detailFrozenRow.find("td:first").attr(
												"colSpan", frozenColNum);
										row.eq(1).after(detailFrozenRow);
									}
									if (p.detail.onShowDetail) {
										p.detail
												.onShowDetail(
														item,
														detailRowInner[0],
														function() {
															g
																	.trigger('SysGridHeightChanged');
														});
										$("div:first", detailFrozenRow).add(
												detailRowInner).show().height(
												p.detail.height
														|| p.detailHeight);
									} else if (p.detail.render) {
										detailRowInner
												.append(p.detail.render());
										detailRowInner.show();
									}
									g.trigger('SysGridHeightChanged');
								}
							} else if (src.groupbtn) {
								var grouprow = $(src.grouprow);
								var opening = true;
								if ($(src.groupbtn).hasClass(
										"l-grid-group-togglebtn-close")) {
									$(src.groupbtn).removeClass(
											"l-grid-group-togglebtn-close");

									if (grouprow
											.hasClass("l-grid-grouprow-last")) {
										$("td:first", grouprow).width('auto');
									}
								} else {
									opening = false;
									$(src.groupbtn).addClass(
											"l-grid-group-togglebtn-close");
									if (grouprow
											.hasClass("l-grid-grouprow-last")) {
										$("td:first", grouprow).width(
												g.gridtablewidth);
									}
								}
								var currentRow = grouprow
										.next(".l-grid-row,.l-grid-totalsummary-group,.l-grid-detailpanel");
								while (true) {
									if (currentRow.length == 0)
										break;
									if (opening) {
										currentRow.show();

										if (currentRow
												.hasClass("l-grid-detailpanel")
												&& !currentRow
														.prev()
														.find(
																"td.l-grid-row-cell-detail:first span.l-grid-row-cell-detailbtn:first")
														.hasClass("l-open")) {
											currentRow.hide();
										}
									} else {
										currentRow.hide();
									}
									currentRow = currentRow
											.next(".l-grid-row,.l-grid-totalsummary-group,.l-grid-detailpanel");
								}
								g.trigger(opening ? 'groupExtend'
										: 'groupCollapse');
								g.trigger('SysGridHeightChanged');
							}

							else if (src.treelink) {
								g.toggle(src.data);
							} else if (src.row && g.enabledCheckbox()) {

								var selectRowButtonOnly = p.selectRowButtonOnly ? true
										: false;
								if (p.enabledEdit)
									selectRowButtonOnly = true;
								if (src.checkbox || !selectRowButtonOnly) {
									var row = $(src.row);
									var uncheck = row.hasClass("l-selected");
									if (g
											.trigger('beforeCheckRow', [
													!uncheck, src.data,
													src.data['__id'], src.row ]) == false)
										return false;
									var met = uncheck ? 'unselect' : 'select';
									g[met](src.data);
									if (p.tree && p.autoCheckChildren) {
										var children = g.getChildren(src.data,
												true);
										for (var i = 0, l = children.length; i < l; i++) {
											g[met](children[i]);
										}
									}
									g.trigger('checkRow', [ !uncheck, src.data,
											src.data['__id'], src.row ]);
								}
								if (!src.checkbox && src.cell && p.enabledEdit
										&& p.clickToEdit) {
									g._applyEditor(src.cell);
								}
							} else if (src.row && !g.enabledCheckbox()) {
								if (src.cell && p.enabledEdit && p.clickToEdit) {
									g._applyEditor(src.cell);
								}

								if ($(src.row).hasClass("l-selected")) {
									if (!p.allowUnSelectRow) {
										$(src.row).addClass("l-selected-again");
										return;
									}
									g.unselect(src.data);
								} else {
									g.select(src.data);
								}
							} else if (src.toolbar) {
								if (src.first) {
									if (g.trigger('toFirst', [ g.element ]) == false)
										return false;
									g.changePage('first');
								} else if (src.prev) {
									if (g.trigger('toPrev', [ g.element ]) == false)
										return false;
									g.changePage('prev');
								} else if (src.next) {
									if (g.trigger('toNext', [ g.element ]) == false)
										return false;
									g.changePage('next');
								} else if (src.last) {
									if (g.trigger('toLast', [ g.element ]) == false)
										return false;
									g.changePage('last');
								} else if (src.load) {
									if ($("span", src.load).hasClass(
											"l-disabled"))
										return false;
									if (g.trigger('reload', [ g.element ]) == false)
										return false;
									if (p.url
											&& g.isDataChanged
											&& !confirm(p.isContinueByDataChanged))
										return false;
									g.loadData(p.where);
								}
							}
						},
						select : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							var rowid = rowdata['__id'];
							var rowobj = g.getRowObj(rowid);
							var rowobj1 = g.getRowObj(rowid, true);
							if (!g.enabledCheckbox() && !g.ctrlKey) {
								for ( var i in g.selected) {
									var o = g.selected[i];
									if (o['__id'] in g.records) {
										$(g.getRowObj(o)).removeClass(
												"l-selected l-selected-again");
										if (g.enabledFrozen())
											$(g.getRowObj(o, true))
													.removeClass(
															"l-selected l-selected-again");
									}
								}
								g.selected = [];
							}
							if (rowobj)
								$(rowobj).addClass("l-selected");
							if (rowobj1)
								$(rowobj1).addClass("l-selected");
							g.selected[g.selected.length] = rowdata;
							g.trigger('selectRow', [ rowdata, rowid, rowobj ]);
						},
						unselect : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							var rowid = rowdata['__id'];
							var rowobj = g.getRowObj(rowid);
							var rowobj1 = g.getRowObj(rowid, true);
							$(rowobj)
									.removeClass("l-selected l-selected-again");
							if (g.enabledFrozen())
								$(rowobj1).removeClass(
										"l-selected l-selected-again");
							g._removeSelected(rowdata);
							g
									.trigger('unSelectRow', [ rowdata, rowid,
											rowobj ]);
						},
						isSelected : function(rowParm) {
							var g = this, p = this.options;
							var rowdata = g.getRow(rowParm);
							for ( var i in g.selected) {
								if (g.selected[i] == rowdata)
									return true;
							}
							return false;
						},
						arrayToTree : function(data, id, pid) {
							var g = this, p = this.options;
							var childrenName = "children";
							if (p.tree)
								childrenName = p.tree.childrenName;
							if (!data || !data.length)
								return [];
							var targetData = [];
							var records = {};
							var itemLength = data.length;
							for (var i = 0; i < itemLength; i++) {
								var o = data[i];
								var key = getKey(o[id]);
								records[key] = o;
							}
							for (var i = 0; i < itemLength; i++) {
								var currentData = data[i];
								var key = getKey(currentData[pid]);
								var parentData = records[key];
								if (!parentData) {
									targetData.push(currentData);
									continue;
								}
								parentData[childrenName] = parentData[childrenName]
										|| [];
								parentData[childrenName].push(currentData);
							}
							return targetData;

							function getKey(key) {
								if (typeof (key) == "string")
									key = key.replace(/[.]/g, '').toLowerCase();
								return key;
							}
						},
						_onResize : function() {
							var g = this, p = this.options;
							if (p.height && p.height != 'auto') {
								var windowHeight = $(window).height();

								var h = 0;
								var parentHeight = null;
								if (typeof (p.height) == "string"
										&& p.height.indexOf('%') > 0) {
									var gridparent = g.grid.parent();
									if (p.inWindow) {
										parentHeight = windowHeight;
										parentHeight -= parseInt($('body').css(
												'paddingTop'));
										parentHeight -= parseInt($('body').css(
												'paddingBottom'));
									} else {
										parentHeight = gridparent.height();
									}
									h = parentHeight * parseInt(p.height)
											* 0.01;
									if (p.inWindow
											|| gridparent[0].tagName
													.toLowerCase() == "body")
										h -= (g.grid.offset().top - parseInt($(
												'body').css('paddingTop')));
								} else {
									h = parseInt(p.height);
								}

								h += p.heightDiff;
								g.windowHeight = windowHeight;
								g._setHeight(h);
							} else {
								g._updateHorizontalScrollStatus.jqueryDefer(g,
										10);
							}
							if (g.enabledFrozen()) {
								var gridView1Width = g.gridview1.width();
								var gridViewWidth = g.gridview.width()
								g.gridview2.css({
									width : gridViewWidth - gridView1Width
								});
							}

							g.trigger('SysGridHeightChanged');
						},
						showFilter : function() {
							var g = this, p = this.options;
							if (g.winfilter) {
								g.winfilter.show();
								return;
							}
							var filtercontainer = $(
									'<div id="' + g.id
											+ '_filtercontainer"></div>')
									.width(380).height(120).hide();
							var filter = filtercontainer.jqueryFilter({
								fields : getFields()
							});
							filter.addRule($(filter.element.firstChild));
							return g.winfilter = $.jqueryDialog.open({
								width : 420,
								height : 208,
								target : filtercontainer,
								isResize : true,
								top : 50,
								buttons : [ {
									text : 'OK',
									onclick : function(item, dialog) {
										loadData();
										dialog.hide();
									}
								}, {
									text : 'Cancel',
									onclick : function(item, dialog) {
										dialog.hide();
									}
								} ]
							});

							function getFields() {
								var fields = [];

								$(g.columns).each(
										function() {
											var o = {
												name : this.name,
												display : this.display
											};
											var isNumber = this.type == "int"
													|| this.type == "number"
													|| this.type == "float";
											var isDate = this.type == "date";
											if (isNumber)
												o.type = "number";
											if (isDate)
												o.type = "date";
											if (this.editor) {
												o.editor = this.editor;
											}
											fields.push(o);
										});
								return fields;
							}

							function loadData() {
								var data = filter.getData();
								if (g.options.dataType == "server") {

									loadServerData(data);
								} else {

									loadClientData(data);
								}
							}

							function loadServerData(data) {
								if (data && data.rules && data.rules.length) {
									g.setParm("where", JSON.stringify(data));
								} else {
									g.removeParm("where");
								}
								g.loadData();
							}
							function loadClientData(data) {
								g.loadData($.jqueryFilter
										.getFilterFunction(data));
							}
						}
					});

	$.jqueryui.controls.Grid.prototype.enabledTotal = $.jqueryui.controls.Grid.prototype.isTotalSummary;
	$.jqueryui.controls.Grid.prototype.add = $.jqueryui.controls.Grid.prototype.addRow;
	$.jqueryui.controls.Grid.prototype.update = $.jqueryui.controls.Grid.prototype.updateRow;
	$.jqueryui.controls.Grid.prototype.append = $.jqueryui.controls.Grid.prototype.appendRow;
	$.jqueryui.controls.Grid.prototype.getSelected = $.jqueryui.controls.Grid.prototype.getSelectedRow;
	$.jqueryui.controls.Grid.prototype.getSelecteds = $.jqueryui.controls.Grid.prototype.getSelectedRows;
	$.jqueryui.controls.Grid.prototype.getCheckedRows = $.jqueryui.controls.Grid.prototype.getSelectedRows;
	$.jqueryui.controls.Grid.prototype.getCheckedRowObjs = $.jqueryui.controls.Grid.prototype.getSelectedRowObjs;
	$.jqueryui.controls.Grid.prototype.setOptions = $.jqueryui.controls.Grid.prototype.set;
	$.jqueryui.controls.Grid.prototype.reload = $.jqueryui.controls.Grid.prototype.loadData;
	$.jqueryui.controls.Grid.prototype.refreshSize = $.jqueryui.controls.Grid.prototype._onResize;

	function removeArrItem(arr, filterFn) {
		for (var i = arr.length - 1; i >= 0; i--) {
			if (filterFn(arr[i])) {
				arr.splice(i, 1);
			}
		}
	}
})(jQuery);
(function($) {
	$.fn.jqueryLayout = function(options) {
		
		return $.jqueryui.run.call(this, "jqueryLayout", arguments);
	};

	$.fn.jqueryGetLayoutManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetLayoutManager", arguments);
	};

	$.jqueryDefaults.Layout = {
		topHeight : 50,
		bottomHeight : 50,
		leftWidth : 110,
		centerWidth : 300,
		rightWidth : 170,
		centerBottomHeight : 100,
		allowCenterBottomResize : true,
		inWindow : true,
		heightDiff : 0,
		height : '100%',
		onHeightChanged : null,
		isLeftCollapse : false,
		isRightCollapse : false,
		allowLeftCollapse : true,
		allowRightCollapse : true,
		allowLeftResize : true,
		allowRightResize : true,
		allowTopResize : true,
		allowBottomResize : true,
		space : 3,
		onEndResize : null,
		minLeftWidth : 80,
		minRightWidth : 80
	};

	$.jqueryMethos.Layout = {};

	$.jqueryui.controls.Layout = function(element, options) {
		
		$.jqueryui.controls.Layout.base.constructor
				.call(this, element, options);
	};
	$.jqueryui.controls.Layout
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						__getType : function() {
							return 'Layout';
						},
						__idPrev : function() {
							return 'Layout';
						},
						_extendMethods : function() {
							return $.jqueryMethos.Layout;
						},
						_init : function() {
							$.jqueryui.controls.Layout.base._init.call(this);

							var g = this, p = this.options;
							if (p.InWindow != null && p.inWindow == null)
								p.inWindow = p.InWindow;
						},
						_render : function() {
							var g = this, p = this.options;
							g.layout = $(this.element);
							g.layout.addClass("l-layout");
							g.width = g.layout.width();

							if ($("> div[position=top]", g.layout).length > 0) {
								g.top = $("> div[position=top]", g.layout)
										.wrap(
												'<div class="l-layout-top" style="top:0px;"></div>')
										.parent();
								g.top.content = $("> div[position=top]", g.top);
								if (!g.top.content.hasClass("l-layout-content"))
									g.top.content.addClass("l-layout-content");
								g.topHeight = p.topHeight;
								if (g.topHeight) {
									g.top.height(g.topHeight);
								}
							}

							if ($("> div[position=bottom]", g.layout).length > 0) {
								g.bottom = $("> div[position=bottom]", g.layout)
										.wrap(
												'<div class="l-layout-bottom"></div>')
										.parent();
								g.bottom.content = $("> div[position=bottom]",
										g.bottom);
								if (!g.bottom.content
										.hasClass("l-layout-content"))
									g.bottom.content
											.addClass("l-layout-content");

								g.bottomHeight = p.bottomHeight;
								if (g.bottomHeight) {
									g.bottom.height(g.bottomHeight);
								}

								var bottomtitle = g.bottom.content
										.attr("title");
								if (bottomtitle) {
									g.bottom.header = $('<div class="l-layout-header"></div>');
									g.bottom.prepend(g.bottom.header);
									g.bottom.header.html(bottomtitle);
									g.bottom.content.attr("title", "");
								}
							}

							if ($("> div[position=left]", g.layout).length > 0) {
								g.left = $("> div[position=left]", g.layout)
										.wrap(
												'<div class="l-layout-left" style="left:0px;"></div>')
										.parent();
								g.left.header = $('<div class="l-layout-header"><div class="l-layout-header-toggle"></div><div class="l-layout-header-inner"></div></div>');
								g.left.prepend(g.left.header);

								g.left.header.toggle = $(
										".l-layout-header-toggle",
										g.left.header);
								g.left.content = $("> div[position=left]",
										g.left);
								if (!g.left.content
										.hasClass("l-layout-content"))
									g.left.content.addClass("l-layout-content");
								if (!p.allowLeftCollapse)
									$(".l-layout-header-toggle", g.left.header)
											.remove();

								var lefttitle = g.left.content.attr("title");
								if (lefttitle) {
									g.left.content.attr("title", "");
									$(".l-layout-header-inner", g.left.header)
											.html(lefttitle);
								}

								if (g.left.content.attr("hidetitle")) {
									g.left.content.attr("title", "");
									g.left.header.remove();
								}

								g.leftWidth = p.leftWidth;
								if (g.leftWidth)
									g.left.width(g.leftWidth);
							}

							if ($("> div[position=center]", g.layout).length > 0) {
								g.center = $("> div[position=center]", g.layout)
										.wrap(
												'<div class="l-layout-center" ></div>')
										.parent();
								g.center.content = $("> div[position=center]",
										g.center);
								g.center.content.addClass("l-layout-content");

								var centertitle = g.center.content
										.attr("title");
								if (centertitle) {
									g.center.content.attr("title", "");
									g.center.header = $('<div class="l-layout-header"></div>');
									g.center.prepend(g.center.header);
									g.center.header.html(centertitle);
								}
								if (g.center.content.attr("hidetitle")) {
									g.center.content.attr("title", "");
									g.center.header.remove();
								}

								g.centerWidth = p.centerWidth;
								if (g.centerWidth)
									g.center.width(g.centerWidth);

								if ($("> div[position=centerbottom]", g.layout).length > 0) {
									g.centerBottom = $(
											"> div[position=centerbottom]",
											g.layout)
											.wrap(
													'<div class="l-layout-centerbottom" ></div>')
											.parent();
									g.centerBottom.content = $(
											"> div[position=centerbottom]",
											g.centerBottom);
									g.centerBottom.content
											.addClass("l-layout-content");

									var centertitle = g.centerBottom.content
											.attr("title");
									if (centertitle) {
										g.centerBottom.content
												.attr("title", "");
										g.centerBottom.header = $('<div class="l-layout-header"></div>');
										g.centerBottom
												.prepend(g.centerBottom.header);
										g.centerBottom.header.html(centertitle);
									}
									if (g.centerBottom.content
											.attr("hidetitle")) {
										g.centerBottom.content
												.attr("title", "");
										if (g.centerBottom.header) {
											g.centerBottom.header.remove();
										}
									}
									if (g.centerWidth)
										g.centerBottom.width(g.centerWidth);
								}
							}

							if ($("> div[position=right]", g.layout).length > 0) {
								g.right = $("> div[position=right]", g.layout)
										.wrap(
												'<div class="l-layout-right"></div>')
										.parent();

								g.right.header = $('<div class="l-layout-header"><div class="l-layout-header-toggle"></div><div class="l-layout-header-inner"></div></div>');
								g.right.prepend(g.right.header);
								g.right.header.toggle = $(
										".l-layout-header-toggle",
										g.right.header);
								if (!p.allowRightCollapse)
									$(".l-layout-header-toggle", g.right.header)
											.remove();
								g.right.content = $("> div[position=right]",
										g.right);
								if (!g.right.content
										.hasClass("l-layout-content"))
									g.right.content
											.addClass("l-layout-content");

								var righttitle = g.right.content.attr("title");
								if (righttitle) {
									g.right.content.attr("title", "");
									$(".l-layout-header-inner", g.right.header)
											.html(righttitle);
								}
								if (g.right.content.attr("hidetitle")) {
									g.right.content.attr("title", "");
									g.right.header.remove();
								}

								g.rightWidth = p.rightWidth;
								if (g.rightWidth)
									g.right.width(g.rightWidth);
							}

							g.layout.lock = $("<div class='l-layout-lock'></div>");
							g.layout.append(g.layout.lock);

							g._addDropHandle();

							g.isLeftCollapse = p.isLeftCollapse;
							g.isRightCollapse = p.isRightCollapse;
							g.leftCollapse = $('<div class="l-layout-collapse-left" style="display: none; "><div class="l-layout-collapse-left-toggle"></div></div>');
							g.rightCollapse = $('<div class="l-layout-collapse-right" style="display: none; "><div class="l-layout-collapse-right-toggle"></div></div>');
							g.layout.append(g.leftCollapse).append(
									g.rightCollapse);
							g.leftCollapse.toggle = $(
									"> .l-layout-collapse-left-toggle",
									g.leftCollapse);
							g.rightCollapse.toggle = $(
									"> .l-layout-collapse-right-toggle",
									g.rightCollapse);
							g._setCollapse();

							g._bulid();
							$(window).resize(function() {
								g._onResize();
							});
							g.set(p);
							g.mask.height(g.layout.height());
						},
						setLeftCollapse : function(isCollapse) {
							
							var g = this, p = this.options;
							if (!g.left)
								return false;
							g.isLeftCollapse = isCollapse;
							if (g.isLeftCollapse) {
								g.leftCollapse.show();
								g.leftDropHandle && g.leftDropHandle.hide();
								g.left.hide();
							} else {
								g.leftCollapse.hide();
								g.leftDropHandle && g.leftDropHandle.show();
								g.left.show();
							}
							g._onResize();
						},
						setRightCollapse : function(isCollapse) {
							var g = this, p = this.options;
							if (!g.right)
								return false;
							g.isRightCollapse = isCollapse;
							g._onResize();
							if (g.isRightCollapse) {
								g.rightCollapse.show();
								g.rightDropHandle && g.rightDropHandle.hide();
								g.right.hide();
							} else {
								g.rightCollapse.hide();
								g.rightDropHandle && g.rightDropHandle.show();
								g.right.show();
							}
							g._onResize();
						},
						_bulid : function() {
							var g = this, p = this.options;
							$(
									"> .l-layout-left .l-layout-header,> .l-layout-right .l-layout-header",
									g.layout).hover(function() {
								$(this).addClass("l-layout-header-over");
							}, function() {
								$(this).removeClass("l-layout-header-over");

							});
							$(".l-layout-header-toggle", g.layout).hover(
									function() {
										$(this).addClass(
												"l-layout-header-toggle-over");
									},
									function() {
										$(this).removeClass(
												"l-layout-header-toggle-over");

									});
							$(".l-layout-header-toggle", g.left).click(
									
									function() {
										
										g.setLeftCollapse(true);
									});
							$(".l-layout-header-toggle", g.right).click(
									function() {
										g.setRightCollapse(true);
									});

							g.middleTop = 0;
							if (g.top) {
								g.middleTop += g.top.height();
								g.middleTop += parseInt(g.top
										.css('borderTopWidth'));
								g.middleTop += parseInt(g.top
										.css('borderBottomWidth'));
								g.middleTop += p.space;
							}
							if (g.left) {
								g.left.css({
									top : g.middleTop
								});
								g.leftCollapse.css({
									top : g.middleTop
								});
							}
							if (g.center)
								g.center.css({
									top : g.middleTop
								});
							if (g.right) {
								g.right.css({
									top : g.middleTop
								});
								g.rightCollapse.css({
									top : g.middleTop
								});
							}

							if (g.left)
								g.left.css({
									left : 0
								});
							g._onResize();
							g._onResize();
						},
						_setCollapse : function() {
							var g = this, p = this.options;
							g.leftCollapse.hover(
									function() {
										$(this).addClass(
												"l-layout-collapse-left-over");
									}, function() {
										$(this).removeClass(
												"l-layout-collapse-left-over");
									});
							g.leftCollapse.toggle.hover(function() {
								$(this).addClass(
										"l-layout-collapse-left-toggle-over");
							}, function() {
								$(this).removeClass(
										"l-layout-collapse-left-toggle-over");
							});
							g.rightCollapse
									.hover(
											function() {
												$(this)
														.addClass(
																"l-layout-collapse-right-over");
											},
											function() {
												$(this)
														.removeClass(
																"l-layout-collapse-right-over");
											});
							g.rightCollapse.toggle.hover(function() {
								$(this).addClass(
										"l-layout-collapse-right-toggle-over");
							}, function() {
								$(this).removeClass(
										"l-layout-collapse-right-toggle-over");
							});
							g.leftCollapse.toggle.click(function() {
								
								g.setLeftCollapse(false);
							});
							g.rightCollapse.toggle.click(function() {
								g.setRightCollapse(false);
							});
							if (g.left && g.isLeftCollapse) {
								g.leftCollapse.show();
								g.leftDropHandle && g.leftDropHandle.hide();
								g.left.hide();
							}
							if (g.right && g.isRightCollapse) {
								g.rightCollapse.show();
								g.rightDropHandle && g.rightDropHandle.hide();
								g.right.hide();
							}
						},
						_addDropHandle : function() {
							var g = this, p = this.options;
							if (g.left && p.allowLeftResize) {
								g.leftDropHandle = $("<div class='l-layout-drophandle-left'></div>");
								g.layout.append(g.leftDropHandle);
								g.leftDropHandle && g.leftDropHandle.show();
								g.leftDropHandle.mousedown(function(e) {
									g._start('leftresize', e);
								});
							}
							if (g.right && p.allowRightResize) {
								g.rightDropHandle = $("<div class='l-layout-drophandle-right'></div>");
								g.layout.append(g.rightDropHandle);
								g.rightDropHandle && g.rightDropHandle.show();
								g.rightDropHandle.mousedown(function(e) {
									g._start('rightresize', e);
								});
							}
							if (g.top && p.allowTopResize) {
								g.topDropHandle = $("<div class='l-layout-drophandle-top'></div>");
								g.layout.append(g.topDropHandle);
								g.topDropHandle.show();
								g.topDropHandle.mousedown(function(e) {
									g._start('topresize', e);
								});
							}
							if (g.bottom && p.allowBottomResize) {
								g.bottomDropHandle = $("<div class='l-layout-drophandle-bottom'></div>");
								g.layout.append(g.bottomDropHandle);
								g.bottomDropHandle.show();
								g.bottomDropHandle.mousedown(function(e) {
									g._start('bottomresize', e);
								});
							}
							if (g.centerBottom && p.allowCenterBottomResize) {
								g.centerBottomDropHandle = $("<div class='l-layout-drophandle-centerbottom'></div>");
								g.layout.append(g.centerBottomDropHandle);
								g.centerBottomDropHandle.show();
								g.centerBottomDropHandle.mousedown(function(e) {
									g._start('centerbottomresize', e);
								});
							}
							g.draggingxline = $("<div class='l-layout-dragging-xline'></div>");
							g.draggingyline = $("<div class='l-layout-dragging-yline'></div>");
							g.mask = $("<div class='l-dragging-mask'></div>");
							g.layout.append(g.draggingxline).append(
									g.draggingyline).append(g.mask);
						},
						_setDropHandlePosition : function() {
							var g = this, p = this.options;
							if (g.leftDropHandle) {
								g.leftDropHandle.css({
									left : g.left.width()
											+ parseInt(g.left.css('left')),
									height : g.middleHeight,
									top : g.middleTop
								});
							}
							if (g.rightDropHandle) {
								g.rightDropHandle.css({
									left : parseInt(g.right.css('left'))
											- p.space,
									height : g.middleHeight,
									top : g.middleTop
								});
							}
							if (g.topDropHandle) {
								g.topDropHandle.css({
									top : g.top.height()
											+ parseInt(g.top.css('top')),
									width : g.top.width()
								});
							}
							if (g.bottomDropHandle) {
								g.bottomDropHandle.css({
									top : parseInt(g.bottom.css('top'))
											- p.space,
									width : g.bottom.width()
								});
							}
							if (g.centerBottomDropHandle) {
								g.centerBottomDropHandle.css({
									top : parseInt(g.centerBottom.css('top'))
											- p.space,
									left : parseInt(g.center.css('left')),
									width : g.center.width()
								});
							}
						},
						_onResize : function() {
							var g = this, p = this.options;
							var oldheight = g.layout.height();

							var h = 0;
							var windowHeight = $(window).height();
							var parentHeight = null;
							if (typeof (p.height) == "string"
									&& p.height.indexOf('%') > 0) {
								var layoutparent = g.layout.parent();
								if (p.inWindow
										|| layoutparent[0].tagName
												.toLowerCase() == "body") {
									parentHeight = windowHeight;
									parentHeight -= parseInt($('body').css(
											'paddingTop'));
									parentHeight -= parseInt($('body').css(
											'paddingBottom'));
								} else {
									parentHeight = layoutparent.height();
								}
								h = parentHeight * parseFloat(p.height) * 0.01;
								if (p.inWindow
										|| layoutparent[0].tagName
												.toLowerCase() == "body")
									h -= (g.layout.offset().top - parseInt($(
											'body').css('paddingTop')));
							} else {
								h = parseInt(p.height);
							}
							h += p.heightDiff;
							g.layout.height(h);
							g.layoutHeight = g.layout.height();
							g.middleWidth = g.layout.width();
							g.middleHeight = g.layout.height();
							if (g.top) {
								g.middleHeight -= g.top.height();
								g.middleHeight -= parseInt(g.top
										.css('borderTopWidth'));
								g.middleHeight -= parseInt(g.top
										.css('borderBottomWidth'));
								g.middleHeight -= p.space;
							}
							if (g.bottom) {
								g.middleHeight -= g.bottom.height();
								g.middleHeight -= parseInt(g.bottom
										.css('borderTopWidth'));
								g.middleHeight -= parseInt(g.bottom
										.css('borderBottomWidth'));
								g.middleHeight -= p.space;
							}

							g.middleHeight -= 2;

							if (g.hasBind('heightChanged')
									&& g.layoutHeight != oldheight) {
								g.trigger('heightChanged', [ {
									layoutHeight : g.layoutHeight,
									diff : g.layoutHeight - oldheight,
									middleHeight : g.middleHeight
								} ]);
							}

							if (g.center) {
								g.centerWidth = g.middleWidth;
								if (g.left) {
									if (g.isLeftCollapse) {
										g.centerWidth -= g.leftCollapse.width();
										g.centerWidth -= parseInt(g.leftCollapse
												.css('borderLeftWidth'));
										g.centerWidth -= parseInt(g.leftCollapse
												.css('borderRightWidth'));
										g.centerWidth -= parseInt(g.leftCollapse
												.css('left'));
										g.centerWidth -= p.space;
									} else {
										g.centerWidth -= g.leftWidth;
										g.centerWidth -= parseInt(g.left
												.css('borderLeftWidth'));
										g.centerWidth -= parseInt(g.left
												.css('borderRightWidth'));
										g.centerWidth -= parseInt(g.left
												.css('left'));
										g.centerWidth -= p.space;
									}
								}
								if (g.right) {
									if (g.isRightCollapse) {
										g.centerWidth -= g.rightCollapse
												.width();
										g.centerWidth -= parseInt(g.rightCollapse
												.css('borderLeftWidth'));
										g.centerWidth -= parseInt(g.rightCollapse
												.css('borderRightWidth'));
										g.centerWidth -= parseInt(g.rightCollapse
												.css('right'));
										g.centerWidth -= p.space;
									} else {
										g.centerWidth -= g.rightWidth;
										g.centerWidth -= parseInt(g.right
												.css('borderLeftWidth'));
										g.centerWidth -= parseInt(g.right
												.css('borderRightWidth'));
										g.centerWidth -= p.space;
									}
								}
								g.centerLeft = 0;
								if (g.left) {
									if (g.isLeftCollapse) {
										g.centerLeft += g.leftCollapse.width();
										g.centerLeft += parseInt(g.leftCollapse
												.css('borderLeftWidth'));
										g.centerLeft += parseInt(g.leftCollapse
												.css('borderRightWidth'));
										g.centerLeft += parseInt(g.leftCollapse
												.css('left'));
										g.centerLeft += p.space;
									} else {
										g.centerLeft += g.left.width();
										g.centerLeft += parseInt(g.left
												.css('borderLeftWidth'));
										g.centerLeft += parseInt(g.left
												.css('borderRightWidth'));
										g.centerLeft += p.space;
									}
								}
								g.center.css({
									left : g.centerLeft
								});
								g.centerWidth >= 0
										&& g.center.width(g.centerWidth);
								g.middleHeight >= 0
										&& g.center.height(g.middleHeight);
								var contentHeight = g.middleHeight;
								if (g.center.header)
									contentHeight -= g.center.header.height();
								contentHeight >= 0
										&& g.center.content
												.height(contentHeight);

								g._updateCenterBottom(true);
							}
							if (g.left) {
								g.leftCollapse.height(g.middleHeight);
								g.left.height(g.middleHeight);
							}
							if (g.right) {
								g.rightCollapse.height(g.middleHeight);
								g.right.height(g.middleHeight);

								g.rightLeft = 0;

								if (g.left) {
									if (g.isLeftCollapse) {
										g.rightLeft += g.leftCollapse.width();
										g.rightLeft += parseInt(g.leftCollapse
												.css('borderLeftWidth'));
										g.rightLeft += parseInt(g.leftCollapse
												.css('borderRightWidth'));
										g.rightLeft += p.space;
									} else {
										g.rightLeft += g.left.width();
										g.rightLeft += parseInt(g.left
												.css('borderLeftWidth'));
										g.rightLeft += parseInt(g.left
												.css('borderRightWidth'));
										g.rightLeft += parseInt(g.left
												.css('left'));
										g.rightLeft += p.space;
									}
								}
								if (g.center) {
									g.rightLeft += g.center.width();
									g.rightLeft += parseInt(g.center
											.css('borderLeftWidth'));
									g.rightLeft += parseInt(g.center
											.css('borderRightWidth'));
									g.rightLeft += p.space;
								}
								g.right.css({
									left : g.rightLeft
								});
							}
							if (g.bottom) {
								g.bottomTop = g.layoutHeight
										- g.bottom.height() - 2;
								g.bottom.css({
									top : g.bottomTop
								});
							}
							g._setDropHandlePosition();

						},

						_updateCenterBottom : function(isHeightResize) {
							var g = this, p = this.options;
							if (g.centerBottom) {
								if (isHeightResize) {
									var centerBottomHeight = g.centerBottomHeight
											|| p.centerBottomHeight;
									g.centerBottom.css({
										left : g.centerLeft
									});
									g.centerWidth >= 0
											&& g.centerBottom
													.width(g.centerWidth);
									var centerHeight = g.center.height(), centerTop = parseInt(g.center
											.css("top"));
									g.centerBottom.height(centerBottomHeight)
									g.centerBottom.css({
										top : centerTop + centerHeight
												- centerBottomHeight + 2
									});
									g.center.height(centerHeight
											- centerBottomHeight - 2);
								}
								var centerLeft = parseInt(g.center.css("left"));
								g.centerBottom.width(g.center.width()).css({
									left : centerLeft
								});
							}
						},
						_start : function(dragtype, e) {
							var g = this, p = this.options;
							g.dragtype = dragtype;
							if (dragtype == 'leftresize'
									|| dragtype == 'rightresize') {
								g.xresize = {
									startX : e.pageX
								};
								g.draggingyline.css({
									left : e.pageX - g.layout.offset().left,
									height : g.middleHeight,
									top : g.middleTop
								}).show();
								$('body').css('cursor', 'col-resize');
								g.mask.height(g.layout.height()).removeClass(
										"l-layout-ymask").addClass(
										"l-layout-xmask").show();
							} else if (dragtype == 'topresize'
									|| dragtype == 'bottomresize') {
								g.yresize = {
									startY : e.pageY
								};
								g.draggingxline.css({
									top : e.pageY - g.layout.offset().top,
									width : g.layout.width()
								}).show();
								$('body').css('cursor', 'row-resize');
								g.mask.height(g.layout.height()).removeClass(
										"l-layout-xmask").addClass(
										"l-layout-ymask").show();
							} else if (dragtype == 'centerbottomresize') {
								g.yresize = {
									startY : e.pageY
								};
								g.draggingxline.css({
									top : e.pageY - g.layout.offset().top,
									width : g.layout.width()
								}).show();
								$('body').css('cursor', 'row-resize');
								g.mask.height(g.layout.height()).removeClass(
										"l-layout-xmask").addClass(
										"l-layout-ymask").show();
							} else {
								return;
							}
							g.layout.lock.width(g.layout.width());
							g.layout.lock.height(g.layout.height());
							g.layout.lock.show();
							if ($.browser.msie || $.browser.safari)
								$('body').bind('selectstart', function() {
									return false;
								});

							$(document).bind('mouseup', function() {
								g._stop.apply(g, arguments);
							});
							$(document).bind('mousemove', function() {
								g._drag.apply(g, arguments);
							});
						},
						_drag : function(e) {
							var g = this, p = this.options;
							if (g.xresize) {
								g.xresize.diff = e.pageX - g.xresize.startX;
								g.draggingyline.css({
									left : e.pageX - g.layout.offset().left
								});
								$('body').css('cursor', 'col-resize');
							} else if (g.yresize) {
								g.yresize.diff = e.pageY - g.yresize.startY;
								g.draggingxline.css({
									top : e.pageY - g.layout.offset().top
								});
								$('body').css('cursor', 'row-resize');
							}
						},
						_stop : function(e) {
							var g = this, p = this.options;
							var diff;
							if (g.xresize && g.xresize.diff != undefined) {
								diff = g.xresize.diff;
								if (g.dragtype == 'leftresize') {
									if (p.minLeftWidth) {
										if (g.leftWidth + g.xresize.diff < p.minLeftWidth)
											return;
									}
									g.leftWidth += g.xresize.diff;
									g.left.width(g.leftWidth);
									if (g.center)
										g.center.width(
												g.center.width()
														- g.xresize.diff).css(
												{
													left : parseInt(g.center
															.css('left'))
															+ g.xresize.diff
												});
									else if (g.right)
										g.right
												.width(
														g.left.width()
																- g.xresize.diff)
												.css(
														{
															left : parseInt(g.right
																	.css('left'))
																	+ g.xresize.diff
														});
								} else if (g.dragtype == 'rightresize') {
									if (p.minRightWidth) {
										if (g.rightWidth - g.xresize.diff < p.minRightWidth)
											return;
									}
									g.rightWidth -= g.xresize.diff;
									g.right.width(g.rightWidth).css(
											{
												left : parseInt(g.right
														.css('left'))
														+ g.xresize.diff
											});
									if (g.center)
										g.center.width(g.center.width()
												+ g.xresize.diff);
									else if (g.left)
										g.left.width(g.left.width()
												+ g.xresize.diff);
								}
								g._updateCenterBottom();
							} else if (g.yresize && g.yresize.diff != undefined) {
								diff = g.yresize.diff;
								if (g.dragtype == 'topresize') {
									g.top.height(g.top.height()
											+ g.yresize.diff);
									g.middleTop += g.yresize.diff;
									g.middleHeight -= g.yresize.diff;
									if (g.left) {
										g.left.css({
											top : g.middleTop
										}).height(g.middleHeight);
										g.leftCollapse.css({
											top : g.middleTop
										}).height(g.middleHeight);
									}
									if (g.center)
										g.center.css({
											top : g.middleTop
										}).height(g.middleHeight);
									if (g.right) {
										g.right.css({
											top : g.middleTop
										}).height(g.middleHeight);
										g.rightCollapse.css({
											top : g.middleTop
										}).height(g.middleHeight);
									}
									g._updateCenterBottom(true);
								} else if (g.dragtype == 'bottomresize') {
									g.bottom.height(g.bottom.height()
											- g.yresize.diff);
									g.middleHeight += g.yresize.diff;
									g.bottomTop += g.yresize.diff;
									g.bottom.css({
										top : g.bottomTop
									});
									if (g.left) {
										g.left.height(g.middleHeight);
										g.leftCollapse.height(g.middleHeight);
									}
									if (g.center)
										g.center.height(g.middleHeight);
									if (g.right) {
										g.right.height(g.middleHeight);
										g.rightCollapse.height(g.middleHeight);
									}
									g._updateCenterBottom(true);
								} else if (g.dragtype == 'centerbottomresize') {
									g.centerBottomHeight = g.centerBottomHeight
											|| p.centerBottomHeight;
									g.centerBottomHeight -= g.yresize.diff;
									var centerBottomTop = parseInt(g.centerBottom
											.css("top"));
									g.centerBottom.css("top", centerBottomTop
											+ g.yresize.diff);
									g.centerBottom.height(g.centerBottom
											.height()
											- g.yresize.diff);
									g.center.height(g.center.height()
											+ g.yresize.diff);
								}
							}
							g.trigger('endResize', [
									{
										direction : g.dragtype ? g.dragtype
												.replace(/resize/, '') : '',
										diff : diff
									}, e ]);
							g._setDropHandlePosition();
							g.draggingxline.hide();
							g.draggingyline.hide();
							g.mask.hide();
							g.xresize = g.yresize = g.dragtype = false;
							g.layout.lock.hide();
							if ($.browser.msie || $.browser.safari)
								$('body').unbind('selectstart');
							$(document).unbind('mousemove', g._drag);
							$(document).unbind('mouseup', g._stop);
							$('body').css('cursor', '');

						}
					});

})(jQuery);
(function($) {

	$.fn.jqueryListBox = function(options) {
		return $.jqueryui.run.call(this, "jqueryListBox", arguments);
	};

	$.jqueryDefaults.ListBox = {
		isMultiSelect : false,
		isShowCheckBox : false,
		columns : null,
		width : 480,
		height : 220,
		onSelect : false,
		onSelected : null,
		valueField : 'id',
		textField : 'text',
		valueFieldID : null,
		split : ";",
		data : null,
		parms : null,
		url : null,
		onSuccess : null,
		onError : null,
		render : null,
		css : null,
		value : null,
		valueFieldCssClass : null
	};

	$.jqueryMethos.ListBox = $.jqueryMethos.ListBox || {};

	$.jqueryui.controls.ListBox = function(element, options) {
		$.jqueryui.controls.ListBox.base.constructor.call(this, element,
				options);
	};
	$.jqueryui.controls.ListBox
			.jqueryExtend(
					$.jqueryui.controls.Input,
					{
						__getType : function() {
							return 'ListBox';
						},
						_extendMethods : function() {
							return $.jqueryMethos.ListBox;
						},
						_init : function() {
							$.jqueryui.controls.ListBox.base._init.call(this);
						},
						_render : function() {
							var g = this, p = this.options;
							g.data = p.data;
							g.valueField = null;

							if (p.valueFieldID) {
								g.valueField = $("#" + p.valueFieldID
										+ ":input,[name=" + p.valueFieldID
										+ "]:input");
								if (g.valueField.length == 0)
									g.valueField = $('<input type="hidden"/>');
								g.valueField[0].id = g.valueField[0].name = p.valueFieldID;
							} else {
								g.valueField = $('<input type="hidden"/>');
								g.valueField[0].id = g.valueField[0].name = g.id
										+ "_val";
							}
							if (g.valueField[0].name == null)
								g.valueField[0].name = g.valueField[0].id;
							if (p.valueFieldCssClass) {
								g.valueField.addClass(p.valueFieldCssClass);
							}
							g.valueField.attr("data-jqueryid", g.id);

							g.selectBox = $(this.element);
							g.selectBox
									.html(
											'<div class="l-listbox-inner"><table cellpadding="0" cellspacing="0" border="0" class="l-listbox-table"></table></div>')
									.addClass("l-listbox").append(g.valueField);
							g.selectBox.table = $("table:first", g.selectBox);

							g.set(p);

							g._addClickEven();
						},
						destroy : function() {
							if (this.selectBox)
								this.selectBox.remove();
							this.options = null;
							$.jqueryui.remove(this);
						},
						clear : function() {
							this._changeValue("");
							this.trigger('clear');
						},
						_setIsShowCheckBox : function(value) {
							if (value) {
								$("table", this.selectBox).addClass(
										"l-table-checkbox");
							} else {
								$("table", this.selectBox).addClass(
										"l-table-nocheckbox");
							}
						},
						_setCss : function(css) {
							if (css) {
								this.selectBox.addClass(css);
							}
						},
						_setDisabled : function(value) {

							if (value) {
								this.selectBox.addClass('l-text-disabled');
							} else {
								this.selectBox.removeClass('l-text-disabled');
							}
						},
						_setWidth : function(value) {
							this.selectBox.width(value);
						},
						_setHeight : function(value) {
							this.selectBox.height(value);
						},

						findTextByValue : function(value) {
							var g = this, p = this.options;
							if (value == null)
								return "";
							var texts = "";
							var contain = function(checkvalue) {
								var targetdata = value.toString()
										.split(p.split);
								for (var i = 0; i < targetdata.length; i++) {
									if (targetdata[i] == checkvalue)
										return true;
								}
								return false;
							};
							$(g.data).each(function(i, item) {
								var val = item[p.valueField];
								var txt = item[p.textField];
								if (contain(val)) {
									texts += txt + p.split;
								}
							});
							if (texts.length > 0)
								texts = texts.substr(0, texts.length - 1);
							return texts;
						},
						getDataByValue : function(value) {
							var g = this, p = this.options;
							for (var i = 0, l = g.data.length; i < l; i++) {
								if (g.data[i][p.valueField] == value)
									return g.data[i];
							}
							return null;
						},
						indexOf : function(item) {
							var g = this, p = this.options;
							if (!g.data)
								return -1;
							var isObj = typeof (item) == "object";
							for (var i = 0, l = g.data.length; i < l; i++) {
								if (isObj) {
									if (g.data[i] == item)
										return i;
								} else {
									if (g.data[i][p.valueField]
											&& g.data[i][p.valueField]
													.toString() == item
													.toString())
										return i;
								}
							}
							return -1;
						},
						removeItems : function(items) {
							var g = this;
							if (!g.data)
								return;
							$(items).each(function(i, item) {
								var index = g.indexOf(item);
								if (index == -1)
									return;
								g.data.splice(index, 1);
							});
							g.refresh();
						},
						removeItem : function(item) {
							if (!this.data)
								return;
							var index = this.indexOf(item);
							if (index == -1)
								return;
							this.data.splice(index, 1);
							this.refresh();
						},
						insertItem : function(item, index) {
							var g = this;
							if (!g.data)
								g.data = [];
							g.data.splice(index, 0, item);
							g.refresh();
						},
						addItems : function(items) {
							var g = this;
							if (!g.data)
								g.data = [];
							$(items).each(function(i, item) {
								g.data.push(item);
							});
							g.refresh();
						},
						addItem : function(item) {
							var g = this;
							if (!g.data)
								g.data = [];
							g.data.push(item);
							g.refresh();
						},
						getSelectedItems : function() {
							var g = this, p = this.options;
							if (!g.data)
								return null;
							var value = g.getValue();
							if (!value)
								return null;
							var items = [];
							$(value.split(p.split)).each(function() {
								var index = g.indexOf(this.toString());
								if (index != -1)
									items.push(g.data[index]);
							});
							return items;
						},
						_setValue : function(value) {
							var g = this, p = this.options;
							p.value = value;
							this._dataInit();
						},
						setValue : function(value) {
							this._setValue(value);
						},
						_setUrl : function(url) {
							if (!url)
								return;
							var g = this, p = this.options;
							$.ajax({
								type : 'post',
								url : url,
								data : p.parms,
								cache : false,
								dataType : 'json',
								success : function(data) {
									g.setData(data);
									g.trigger('success', [ data ]);
								},
								error : function(XMLHttpRequest, textStatus) {
									g.trigger('error', [ XMLHttpRequest,
											textStatus ]);
								}
							});
						},
						setUrl : function(url) {
							return this._setUrl(url);
						},
						setParm : function(name, value) {
							if (!name)
								return;
							var g = this;
							var parms = g.get('parms');
							if (!parms)
								parms = {};
							parms[name] = value;
							g.set('parms', parms);
						},
						clearContent : function() {
							var g = this, p = this.options;
							$("table", g.selectBox).html("");
						},
						_setColumns : function(columns) {
							var g = this, p = this.options;
							p.columns = columns;
							g.refresh();
						},
						_setData : function(data) {
							this.setData(data);
						},
						setData : function(data) {
							var g = this, p = this.options;
							if (!data || !data.length)
								return;
							g.data = data;
							g.refresh();
							g.updateStyle();
						},
						refresh : function() {
							var g = this, p = this.options, data = this.data;
							this.clearContent();
							if (!data)
								return;
							if (p.columns) {
								g.selectBox.table.headrow = $("<tr class='l-table-headerow'><td width='18px' class='l-checkboxrow'></td></tr>");
								g.selectBox.table
										.append(g.selectBox.table.headrow);
								g.selectBox.table.addClass("l-listbox-grid");
								for (var j = 0; j < p.columns.length; j++) {
									var headrow = $("<td columnindex='" + j
											+ "' columnname='"
											+ p.columns[j].name + "'>"
											+ p.columns[j].header + "</td>");
									if (p.columns[j].width) {
										headrow.width(p.columns[j].width);
									}
									g.selectBox.table.headrow.append(headrow);

								}
							}
							var out = [];
							for (var i = 0; i < data.length; i++) {
								var val = data[i][p.valueField];
								var txt = data[i][p.textField];
								var valueIndexStr = " value='" + val
										+ "' index='" + i + "'";
								if (!p.columns) {
									out.push("<tr " + valueIndexStr + ">");
									out
											.push("<td style='width:18px;' class='l-checkboxrow'><input type='checkbox'"
													+ valueIndexStr + "/></td>");
									var itemHtml = txt;
									if (p.render) {
										itemHtml = p.render({
											data : data[i],
											value : val,
											text : txt
										});
									}
									out.push("<td align='left'>" + itemHtml
											+ "</td></tr>");
								} else {
									out
											.push("<tr "
													+ valueIndexStr
													+ "><td style='width:18px;' class='l-checkboxrow'><input type='checkbox' "
													+ valueIndexStr + "/></td>");
									for (var j = 0; j < p.columns.length; j++) {
										var columnname = p.columns[j].name;
										out.push("<td>" + data[i][columnname]
												+ "</td>");
									}
									out.push('</tr>');
								}
							}
							g.selectBox.table.append(out.join(''));
						},
						_getValue : function() {
							return $(this.valueField).val();
						},
						getValue : function() {

							return this._getValue();
						},
						updateStyle : function() {
							this._dataInit();
						},
						selectAll : function() {
							var g = this, p = this.options;
							var values = [];
							$("tr", g.selectBox).each(function() {
								var jrow = $(this);
								values.push(jrow.attr("value"));
							});
							$("tr", g.selectBox).addClass("l-selected").find(
									":checkbox").each(function() {
								this.checked = true;
							});
							g.valueField.val(values.join(p.split));
						},
						_dataInit : function() {
							var g = this, p = this.options;
							var value = p.value;

							if (value != null) {
								g._changeValue(value);
							} else if (g.valueField.val() != "") {
								p.value = g.valueField.val();
							}
							var valueArr = (value || "").toString().split(
									p.split);

							$("tr.l-selected", g.selectBox).removeClass(
									"l-selected").find(":checkbox").each(
									function() {
										this.checked = false;
									});
							$(valueArr).each(
									function(i, item) {
										$("tr[value='" + item + "']",
												g.selectBox).addClass(
												"l-selected").find(":checkbox")
												.each(function() {
													this.checked = true;
												});
									});
						},

						_changeValue : function(newValue) {
							var g = this, p = this.options;
							g.valueField.val(newValue);
							g.selectedValue = newValue;
						},

						_updateValue : function() {
							var g = this, p = this.options;
							var values = [];
							$("tr", g.selectBox).each(function() {
								var jrow = $(this);
								if (jrow.hasClass("l-selected")) {
									values.push(jrow.attr("value"));
								}
							});
							g._changeValue(values.join(p.split));
						},
						_addClickEven : function() {
							var g = this, p = this.options;

							g.selectBox.click(function(e) {
								var obj = (e.target || e.srcElement);
								var jrow = $(obj).parents("tr:first");
								if (!jrow.length)
									return;
								var value = jrow.attr("value");
								var text = g.findTextByValue(value), data = g
										.getDataByValue(value);
								if (g.hasBind('select')) {
									if (g.trigger('select',
											[ value, text, data ]) == false) {
										return false;
									}
								}
								if (!p.isMultiSelect) {
									$("tr.l-selected", g.selectBox).not(jrow)
											.removeClass("l-selected").find(
													":checkbox").each(
													function() {
														this.checked = false
													});
								}
								if (jrow.hasClass("l-selected")) {
									jrow.removeClass("l-selected");
								} else {
									jrow.addClass("l-selected");
								}
								jrow.find(":checkbox").each(function() {
									this.checked = jrow.hasClass("l-selected");
								});
								g._updateValue();
								g.trigger('selected', [ value, text, data ]);
							});
						}

					});

})(jQuery);
(function($) {
	$.jqueryMenu = function(options) {
		return $.jqueryui.run.call(null, "jqueryMenu", arguments);
	};

	$.jqueryDefaults.Menu = {
		width : 120,
		top : 0,
		left : 0,
		items : null,
		shadow : true
	};

	$.jqueryMethos.Menu = {};

	$.jqueryui.controls.Menu = function(options) {
		$.jqueryui.controls.Menu.base.constructor.call(this, null, options);
	};
	$.jqueryui.controls.Menu
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						__getType : function() {
							return 'Menu';
						},
						__idPrev : function() {
							return 'Menu';
						},
						_extendMethods : function() {
							return $.jqueryMethos.Menu;
						},
						_render : function() {
							var g = this, p = this.options;
							g.menuItemCount = 0;

							g.menus = {};

							g.menu = g.createMenu();
							g.element = g.menu[0];
							g.menu.css({
								top : p.top,
								left : p.left,
								width : p.width
							});

							p.items && $(p.items).each(function(i, item) {
								g.addItem(item);
							});

							$(document).bind('click.menu', function() {
								for ( var menuid in g.menus) {
									var menu = g.menus[menuid];
									if (!menu)
										return;
									menu.hide();
									if (menu.shadow)
										menu.shadow.hide();
								}
							});
							g.set(p);
						},
						show : function(options, menu) {
							var g = this, p = this.options;
							if (menu == undefined)
								menu = g.menu;
							if (options && options.left != undefined) {
								menu.css({
									left : options.left
								});
							}
							if (options && options.top != undefined) {
								menu.css({
									top : options.top
								});
							}
							menu.show();
							g.updateShadow(menu);
						},
						updateShadow : function(menu) {
							var g = this, p = this.options;
							if (!p.shadow)
								return;
							menu.shadow.css({
								left : menu.css('left'),
								top : menu.css('top'),
								width : menu.outerWidth(),
								height : menu.outerHeight()
							});
							if (menu.is(":visible"))
								menu.shadow.show();
							else
								menu.shadow.hide();
						},
						hide : function(menu) {
							var g = this, p = this.options;
							if (menu == undefined)
								menu = g.menu;
							g.hideAllSubMenu(menu);
							menu.hide();
							g.updateShadow(menu);
						},
						toggle : function() {
							var g = this, p = this.options;
							g.menu.toggle();
							g.updateShadow(g.menu);
						},
						removeItem : function(itemid) {
							var g = this, p = this.options;
							$("> .l-menu-item[menuitemid=" + itemid + "]",
									g.menu.items).remove();
						},
						setEnabled : function(itemid) {
							var g = this, p = this.options;
							$("> .l-menu-item[menuitemid=" + itemid + "]",
									g.menu.items).removeClass(
									"l-menu-item-disable");
						},
						setMenuText : function(itemid, text) {
							var g = this, p = this.options;
							$(
									"> .l-menu-item[menuitemid=" + itemid
											+ "] >.l-menu-item-text:first",
									g.menu.items).html(text);
						},
						setDisabled : function(itemid) {
							var g = this, p = this.options;
							$("> .l-menu-item[menuitemid=" + itemid + "]",
									g.menu.items).addClass(
									"l-menu-item-disable");
						},
						isEnable : function(itemid) {
							var g = this, p = this.options;
							return !$(
									"> .l-menu-item[menuitemid=" + itemid + "]",
									g.menu.items).hasClass(
									"l-menu-item-disable");
						},
						getItemCount : function() {
							var g = this, p = this.options;
							return $("> .l-menu-item", g.menu.items).length;
						},
						addItem : function(item, menu) {
							var g = this, p = this.options;
							if (!item)
								return;
							if (menu == undefined)
								menu = g.menu;

							if (item.line) {
								menu.items
										.append('<div class="l-menu-item-line"></div>');
								return;
							}
							var ditem = $('<div class="l-menu-item"><div class="l-menu-item-text"></div> </div>');
							var itemcount = $("> .l-menu-item", menu.items).length;
							menu.items.append(ditem);
							ditem.attr("jqueryuimenutemid", ++g.menuItemCount);
							item.id && ditem.attr("menuitemid", item.id);
							item.text
									&& $(">.l-menu-item-text:first", ditem)
											.html(item.text);
							item.icon
									&& ditem
											.prepend('<div class="l-menu-item-icon l-icon-'
													+ item.icon + '"></div>');
							item.img
									&& ditem
											.prepend('<div class="l-menu-item-icon"><img style="width:16px;height:16px;margin:2px;" src="'
													+ item.img + '" /></div>');
							if (item.disable || item.disabled)
								ditem.addClass("l-menu-item-disable");
							if (item.children) {
								ditem
										.append('<div class="l-menu-item-arrow"></div>');
								var newmenu = g.createMenu(ditem
										.attr("jqueryuimenutemid"));
								g.menus[ditem.attr("jqueryuimenutemid")] = newmenu;
								newmenu.width(p.width);
								newmenu.hover(null, function() {
									if (!newmenu.showedSubMenu)
										g.hide(newmenu);
								});
								$(item.children).each(function() {
									g.addItem(this, newmenu);
								});
							}
							item.click && ditem.click(function() {
								if ($(this).hasClass("l-menu-item-disable"))
									return;
								item.click(item, itemcount);
							});
							item.dblclick && ditem.dblclick(function() {
								if ($(this).hasClass("l-menu-item-disable"))
									return;
								item.dblclick(item, itemcount);
							});

							var menuover = $("> .l-menu-over:first", menu);
							ditem.hover(function() {
								if ($(this).hasClass("l-menu-item-disable"))
									return;
								var itemtop = $(this).offset().top;
								var top = itemtop - menu.offset().top;
								menuover.css({
									top : top
								});
								g.hideAllSubMenu(menu);
								if (item.children) {
									var jqueryuimenutemid = $(this).attr(
											"jqueryuimenutemid");
									if (!jqueryuimenutemid)
										return;
									if (g.menus[jqueryuimenutemid]) {
										g.show({
											top : itemtop,
											left : $(this).offset().left
													+ $(this).width() - 5
										}, g.menus[jqueryuimenutemid]);
										menu.showedSubMenu = true;
									}
								}
							}, function() {
								if ($(this).hasClass("l-menu-item-disable"))
									return;
								var jqueryuimenutemid = $(this).attr(
										"jqueryuimenutemid");
								if (item.children) {
									var jqueryuimenutemid = $(this).attr(
											"jqueryuimenutemid");
									if (!jqueryuimenutemid)
										return;
								}
								;
							});
						},
						hideAllSubMenu : function(menu) {
							var g = this, p = this.options;
							if (menu == undefined)
								menu = g.menu;
							$("> .l-menu-item", menu.items)
									.each(
											function() {
												if ($("> .l-menu-item-arrow",
														this).length > 0) {
													var jqueryuimenutemid = $(
															this)
															.attr(
																	"jqueryuimenutemid");
													if (!jqueryuimenutemid)
														return;
													g.menus[jqueryuimenutemid]
															&& g
																	.hide(g.menus[jqueryuimenutemid]);
												}
											});
							menu.showedSubMenu = false;
						},
						createMenu : function(parentMenuItemID) {
							var g = this, p = this.options;
							var menu = $('<div class="l-menu" style="display:none"><div class="l-menu-yline"></div><div class="l-menu-over"><div class="l-menu-over-l"></div> <div class="l-menu-over-r"></div></div><div class="l-menu-inner"></div></div>');
							parentMenuItemID
									&& menu.attr("jqueryuiparentmenuitemid",
											parentMenuItemID);
							menu.items = $("> .l-menu-inner:first", menu);
							menu.appendTo('body');
							if (p.shadow) {
								menu.shadow = $(
										'<div class="l-menu-shadow"></div>')
										.insertAfter(menu);
								g.updateShadow(menu);
							}
							menu.hover(null, function() {
								if (!menu.showedSubMenu)
									$("> .l-menu-over:first", menu).css({
										top : -24
									});
							});
							if (parentMenuItemID)
								g.menus[parentMenuItemID] = menu;
							else
								g.menus[0] = menu;
							return menu;
						}
					});

	$.jqueryui.controls.Menu.prototype.setEnable = $.jqueryui.controls.Menu.prototype.setEnabled;
	$.jqueryui.controls.Menu.prototype.setDisable = $.jqueryui.controls.Menu.prototype.setDisabled;

})(jQuery);
(function($) {
	$.fn.jqueryMenuBar = function(options) {
		return $.jqueryui.run.call(this, "jqueryMenuBar", arguments);
	};
	$.fn.jqueryGetMenuBarManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetMenuBarManager", arguments);
	};

	$.jqueryDefaults.MenuBar = {};

	$.jqueryMethos.MenuBar = {};

	$.jqueryui.controls.MenuBar = function(element, options) {
		$.jqueryui.controls.MenuBar.base.constructor.call(this, element,
				options);
	};
	$.jqueryui.controls.MenuBar
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						__getType : function() {
							return 'MenuBar';
						},
						__idPrev : function() {
							return 'MenuBar';
						},
						_extendMethods : function() {
							return $.jqueryMethos.MenuBar;
						},
						_render : function() {
							var g = this, p = this.options;
							g.menubar = $(this.element);
							if (!g.menubar.hasClass("l-menubar"))
								g.menubar.addClass("l-menubar");
							if (p && p.items) {
								$(p.items).each(function(i, item) {
									g.addItem(item);
								});
							}
							$(document)
									.click(
											function() {
												$(".l-panel-btn-selected",
														g.menubar).removeClass(
														"l-panel-btn-selected");
											});
							g.set(p);
						},
						addItem : function(item) {
							var g = this, p = this.options;
							var ditem = $('<div class="l-menubar-item l-panel-btn"><span></span><div class="l-panel-btn-l"></div><div class="l-panel-btn-r"></div><div class="l-menubar-item-down"></div></div>');
							g.menubar.append(ditem);
							item.id && ditem.attr("menubarid", item.id);
							item.text && $("span:first", ditem).html(item.text);
							item.disable
									&& ditem.addClass("l-menubar-item-disable");
							item.click && ditem.click(function() {
								item.click(item);
							});
							if (item.menu) {
								var menu = $.jqueryMenu(item.menu);
								ditem
										.hover(
												function() {
													g.actionMenu
															&& g.actionMenu
																	.hide();
													var left = $(this).offset().left;
													var top = $(this).offset().top
															+ $(this).height();
													menu.show({
														top : top,
														left : left
													});
													g.actionMenu = menu;
													$(this)
															.addClass(
																	"l-panel-btn-over l-panel-btn-selected")
															.siblings(
																	".l-menubar-item")
															.removeClass(
																	"l-panel-btn-selected");
												},
												function() {
													$(this).removeClass(
															"l-panel-btn-over");
												});
							} else {
								ditem.hover(function() {
									$(this).addClass("l-panel-btn-over");
								}, function() {
									$(this).removeClass("l-panel-btn-over");
								});
								$(".l-menubar-item-down", ditem).remove();
							}

						}
					});

})(jQuery);
(function($) {

	$.jqueryMessageBox = function(options) {
		return $.jqueryui.run.call(null, "jqueryMessageBox", arguments, {
			isStatic : true
		});
	};

	$.jqueryDefaults.MessageBox = {
		isDrag : true
	};

	$.jqueryMethos.MessageBox = {};

	$.jqueryui.controls.MessageBox = function(options) {
		$.jqueryui.controls.MessageBox.base.constructor.call(this, null,
				options);
	};
	$.jqueryui.controls.MessageBox
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						__getType : function() {
							return 'MessageBox';
						},
						__idPrev : function() {
							return 'MessageBox';
						},
						_extendMethods : function() {
							return $.jqueryMethos.MessageBox;
						},
						_render : function() {
							var g = this, p = this.options;
							var messageBoxHTML = "";
							messageBoxHTML += '<div class="l-messagebox">';
							messageBoxHTML += '        <div class="l-messagebox-lt"></div><div class="l-messagebox-rt"></div>';
							messageBoxHTML += '        <div class="l-messagebox-l"></div><div class="l-messagebox-r"></div> ';
							messageBoxHTML += '        <div class="l-messagebox-image"></div>';
							messageBoxHTML += '        <div class="l-messagebox-title">';
							messageBoxHTML += '            <div class="l-messagebox-title-inner"></div>';
							messageBoxHTML += '            <div class="l-messagebox-close"></div>';
							messageBoxHTML += '        </div>';
							messageBoxHTML += '        <div class="l-messagebox-content">';
							messageBoxHTML += '        </div>';
							messageBoxHTML += '        <div class="l-messagebox-buttons"><div class="l-messagebox-buttons-inner">';
							messageBoxHTML += '        </div></div>';
							messageBoxHTML += '    </div>';
							g.messageBox = $(messageBoxHTML);
							$('body').append(g.messageBox);
							g.messageBox.close = function() {
								g._removeWindowMask();
								g.messageBox.remove();
							};

							p.width && g.messageBox.width(p.width);
							p.title
									&& $(".l-messagebox-title-inner",
											g.messageBox).html(p.title);
							p.content
									&& $(".l-messagebox-content", g.messageBox)
											.html(p.content);
							if (p.buttons) {
								$(p.buttons)
										.each(
												function(i, item) {
													var btn = $('<div class="l-messagebox-btn"><div class="l-messagebox-btn-l"></div><div class="l-messagebox-btn-r"></div><div class="l-messagebox-btn-inner"></div></div>');
													$(
															".l-messagebox-btn-inner",
															btn)
															.html(item.text);
													$(
															".l-messagebox-buttons-inner",
															g.messageBox)
															.append(btn);
													item.width
															&& btn
																	.width(item.width);
													item.onclick
															&& btn
																	.click(function() {
																		item
																				.onclick(
																						item,
																						i,
																						g.messageBox)
																	});
												});
								$(".l-messagebox-buttons-inner", g.messageBox)
										.append("<div class='l-clear'></div>");
							}
							var boxWidth = g.messageBox.width();
							var sumBtnWidth = 0;
							$(".l-messagebox-buttons-inner .l-messagebox-btn",
									g.messageBox).each(function() {
								sumBtnWidth += $(this).width();
							});
							$(".l-messagebox-buttons-inner", g.messageBox)
									.css(
											{
												marginLeft : parseInt((boxWidth - sumBtnWidth) * 0.5)
											});

							g._applyWindowMask();
							g._applyDrag();
							g._setImage();

							var left = 0;
							var top = 0;
							var width = p.width || g.messageBox.width();
							if (p.left != null)
								left = p.left;
							else
								p.left = left = 0.5 * ($(window).width() - width);
							if (p.top != null)
								top = p.top;
							else
								p.top = top = 0.5
										* ($(window).height() - g.messageBox
												.height())
										+ $(window).scrollTop() - 10;
							if (left < 0)
								p.left = left = 0;
							if (top < 0)
								p.top = top = 0;
							g.messageBox.css({
								left : left,
								top : top
							});

							$(".l-messagebox-btn", g.messageBox).hover(
									function() {
										$(this).addClass(
												"l-messagebox-btn-over");
									},
									function() {
										$(this).removeClass(
												"l-messagebox-btn-over");
									});
							$(".l-messagebox-close", g.messageBox).hover(
									function() {
										$(this).addClass(
												"l-messagebox-close-over");
									},
									function() {
										$(this).removeClass(
												"l-messagebox-close-over");
									}).click(function() {
								g.messageBox.close();
							});
							g.set(p);
						},
						close : function() {
							var g = this, p = this.options;
							this.g._removeWindowMask();
							this.messageBox.remove();
						},
						_applyWindowMask : function() {
							var g = this, p = this.options;
							$(".l-window-mask").remove();
							$(
									"<div class='l-window-mask' style='display: block;'></div>")
									.appendTo($("body"));
						},
						_removeWindowMask : function() {
							var g = this, p = this.options;
							$(".l-window-mask").remove();
						},
						_applyDrag : function() {
							var g = this, p = this.options;
							if (p.isDrag && $.fn.jqueryDrag)
								g.messageBox.jqueryDrag({
									handler : '.l-messagebox-title-inner',
									animate : false
								});
						},
						_setImage : function() {
							var g = this, p = this.options;
							if (p.type) {
								if (p.type == 'success' || p.type == 'donne') {
									$(".l-messagebox-image", g.messageBox)
											.addClass(
													"l-messagebox-image-donne")
											.show();
									$(".l-messagebox-content", g.messageBox)
											.css({
												paddingLeft : 64,
												paddingBottom : 30
											});
								} else if (p.type == 'error') {
									$(".l-messagebox-image", g.messageBox)
											.addClass(
													"l-messagebox-image-error")
											.show();
									$(".l-messagebox-content", g.messageBox)
											.css({
												paddingLeft : 64,
												paddingBottom : 30
											});
								} else if (p.type == 'warn') {
									$(".l-messagebox-image", g.messageBox)
											.addClass("l-messagebox-image-warn")
											.show();
									$(".l-messagebox-content", g.messageBox)
											.css({
												paddingLeft : 64,
												paddingBottom : 30
											});
								} else if (p.type == 'question') {
									$(".l-messagebox-image", g.messageBox)
											.addClass(
													"l-messagebox-image-question")
											.show();
									$(".l-messagebox-content", g.messageBox)
											.css({
												paddingLeft : 64,
												paddingBottom : 40
											});
								}
							}
						}
					});

	$.jqueryMessageBox.show = function(p) {
		return $.jqueryMessageBox(p);
	};
	$.jqueryMessageBox.alert = function(title, content, type, onBtnClick) {
		title = title || "";
		content = content || title;
		var onclick = function(item, index, messageBox) {
			messageBox.close();
			if (onBtnClick)
				onBtnClick(item, index, messageBox);
		};
		p = {
			title : title,
			content : content,
			buttons : [ {
				text : 'OK',
				onclick : onclick
			} ]
		};
		if (type)
			p.type = type;
		return $.jqueryMessageBox(p);
	};
	$.jqueryMessageBox.confirm = function(title, content, callback) {
		var onclick = function(item, index, messageBox) {
			messageBox.close();
			if (callback) {
				callback(index == 0);
			}
		};
		p = {
			type : 'question',
			title : title,
			content : content,
			buttons : [ {
				text : 'Yes',
				onclick : onclick
			}, {
				text : 'No',
				onclick : onclick
			} ]
		};
		return $.jqueryMessageBox(p);
	};
	$.jqueryMessageBox.success = function(title, content, onBtnClick) {
		return $.jqueryMessageBox.alert(title, content, 'success', onBtnClick);
	};
	$.jqueryMessageBox.error = function(title, content, onBtnClick) {
		return $.jqueryMessageBox.alert(title, content, 'error', onBtnClick);
	};
	$.jqueryMessageBox.warn = function(title, content, onBtnClick) {
		return $.jqueryMessageBox.alert(title, content, 'warn', onBtnClick);
	};
	$.jqueryMessageBox.question = function(title, content) {
		return $.jqueryMessageBox.alert(title, content, 'question');
	};

})(jQuery);
(function($) {

	$.fn.jqueryPanel = function(options) {
		return $.jqueryui.run.call(this, "jqueryPanel", arguments);
	};

	$.jqueryDefaults.Panel = {
		width : 400,
		height : 300,
		title : 'Panel',
		content : null,
		url : null,
		frameName : null,
		data : null,
		showClose : false,
		showToggle : true,
		icon : null,
		onClose : null,
		onClosed : null,
		onLoaded : null
	};

	$.jqueryMethos.Panel = {};

	$.jqueryui.controls.Panel = function(element, options) {
		$.jqueryui.controls.Panel.base.constructor.call(this, element, options);
	};
	$.jqueryui.controls.Panel
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						__getType : function() {
							return 'Panel';
						},
						__idPrev : function() {
							return 'Panel';
						},
						_extendMethods : function() {
							return $.jqueryMethos.Panel;
						},
						_init : function() {
							var g = this, p = this.options;
							$.jqueryui.controls.Panel.base._init.call(this);
							p.content = p.content || $(g.element).html();
						},
						_render : function() {
							var g = this, p = this.options;
							g.panel = $(g.element).addClass("l-panel").html("");
							g.panel
									.append('<div class="l-panel-header"><span></span><div class="icons"></div></div><div class="l-panel-content"></div>');

							g.set(p);

							g.panel
									.bind(
											"click.panel",
											function(e) {
												var obj = (e.target || e.srcElement), jobj = $(obj);
												if (jobj
														.hasClass("l-panel-header-toggle")) {
													g.toggle();
												} else if (jobj
														.hasClass("l-panel-header-close")) {
													g.close();
												}
											});
						},
						_setChildren : function(children) {
							var g = this, p = this.options;
							var tagNames = {
								input : [ "textbox", "combobox", "select" ]
							};
							var PluginNameMatchs = {
								"grid" : "jqueryGrid",
								"toolbar" : "jqueryToolBar",
								"tree" : "jqueryTree",
								"form" : "jqueryForm",
								"menu" : "jqueryMenu",
								"menubar" : "jqueryMenuBar",
								"portal" : "jqueryPortal",
								"combobox" : "jqueryComboBox",
								"textbox" : "jqueryTextBox",
								"spinner" : "jquerySpinner",
								"listbox" : "jqueryListBox",
								"checkbox" : "jqueryCheckBox",
								"radio" : "jqueryRadio",
								"checkboxlist" : "jqueryCheckBoxList",
								"radiolist" : "jqueryRadioList",
								"popupedit" : "jqueryPopupEdit",
								"button" : "jqueryButton",
								"dateeditor" : "jqueryDateEditor",
								"dialog" : "jqueryDialog",
								"panel" : "jqueryPanel",
								"layout" : "jqueryLayout",
								"accordion" : "jqueryAccordion",
								"tab" : "jqueryTab"
							};
							if (!children || !children.length)
								return;
							for (var i = 0; i < children.length; i++) {
								var child = children[i], type = child.type;
								var tagName = tagNames[type] || "div";
								var plugin = PluginNameMatchs[type];
								if (!plugin)
									continue;
								var element = document.createElement(tagName);
								g.panel.find(".l-panel-content")
										.append(element);
								var childOp = $.extend({}, child);
								childOp.type = null;
								$(element)[plugin](childOp);
							}
						},
						collapse : function() {
							var g = this, p = this.options;
							var toggle = g.panel
									.find(".l-panel-header .l-panel-header-toggle:first");
							if (toggle.hasClass("l-panel-header-toggle-hide"))
								return;
							g.toggle();
						},
						expand : function() {
							var g = this, p = this.options;
							var toggle = g.panel
									.find(".l-panel-header .l-panel-header-toggle:first");
							if (!toggle.hasClass("l-panel-header-toggle-hide"))
								return;
							g.toggle();
						},
						toggle : function() {
							var g = this, p = this.options;
							var toggle = g.panel
									.find(".l-panel-header .l-panel-header-toggle:first");
							if (toggle.hasClass("l-panel-header-toggle-hide")) {
								toggle
										.removeClass("l-panel-header-toggle-hide");
							} else {
								toggle.addClass("l-panel-header-toggle-hide");
							}
							g.panel.find(".l-panel-content:first").toggle(
									"normal");
						},
						_setShowToggle : function(v) {
							var g = this, p = this.options;
							var header = g.panel.find(".l-panel-header:first");
							if (v) {
								var toggle = $("<div class='l-panel-header-toggle'></div>");
								toggle.appendTo(header.find(".icons"));
							} else {
								header.find(".l-panel-header-toggle").remove();
							}
						},
						_setContent : function(v) {
							var g = this, p = this.options;
							var content = g.panel
									.find(".l-panel-content:first");
							if (v) {
								content.html(v);
							}
						},
						_setUrl : function(url) {
							var g = this, p = this.options;
							var content = g.panel
									.find(".l-panel-content:first");
							if (url) {
								g.jiframe = $("<iframe frameborder='0'></iframe>");
								var framename = p.frameName ? p.frameName
										: "jquerypanel" + new Date().getTime();
								g.jiframe.attr("name", framename);
								g.jiframe.attr("id", framename);
								content.prepend(g.jiframe);

								setTimeout(
										function() {
											if (content
													.find(".l-panel-loading:first").length == 0)
												content
														.append("<div class='l-panel-loading' style='display:block;'></div>");
											var iframeloading = $(
													".l-panel-loading:first",
													content);
											g.jiframe[0].panel = g;

											g.jiframe.attr("src", p.url).bind(
													'load.panel', function() {
														iframeloading.hide();
														g.trigger('loaded');
													});
											g.frame = window.frames[g.jiframe
													.attr("name")];
										}, 0);
							}
						},
						_setShowClose : function(v) {
							var g = this, p = this.options;
							var header = g.panel.find(".l-panel-header:first");
							if (v) {
								var btn = $("<div class='l-panel-header-close'></div>");
								btn.appendTo(header.find(".icons"));
							} else {
								header.find(".l-panel-header-close").remove();
							}
						},
						close : function() {
							var g = this, p = this.options;
							if (g.trigger('close') == false)
								return;
							g.panel.remove();
							g.trigger('closed');
						},
						show : function() {
							this.panel.show();
						},
						_setIcon : function(url) {
							var g = this;
							if (!url) {
								g.panel.removeClass("l-panel-hasicon");
								g.panel.find('img').remove();
							} else {
								g.panel.addClass("l-panel-hasicon");
								g.panel.append('<img src="' + url + '" />');
							}
						},
						_setWidth : function(value) {
							value && this.panel.width(value);
						},
						_setHeight : function(value) {
							var g = this, p = this.options;
							var header = g.panel.find(".l-panel-header:first");
							this.panel.find(".l-panel-content:first").height(
									value - header.height());
						},
						_setTitle : function(value) {
							this.panel.find(".l-panel-header span:first").text(
									value);
						}
					});

})(jQuery);
(function($) {

	$.fn.jqueryPopupEdit = function(options) {
		return $.jqueryui.run.call(this, "jqueryPopupEdit", arguments);
	};

	$.fn.jqueryGetPopupEditManager = function() {
		return $.jqueryui.run
				.call(this, "jqueryGetPopupEditManager", arguments);
	};

	$.jqueryDefaults.PopupEdit = {
		valueFieldID : null,
		css : null,
		onButtonClick : null,
		nullText : null,
		disabled : false,
		cancelable : true,
		width : 200,
		heigth : null,
		render : null,
		split : ';',
		grid : null,
		condition : null,
		valueField : 'id',
		textField : 'text',
		parms : null,
		onSelect : null,
		onSelected : null,
		valueFieldCssClass : null
	};

	$.jqueryMethos.PopupEdit = $.jqueryMethos.PopupEdit || {};

	$.jqueryui.controls.PopupEdit = function(element, options) {
		$.jqueryui.controls.PopupEdit.base.constructor.call(this, element,
				options);
	};
	$.jqueryui.controls.PopupEdit
			.jqueryExtend(
					$.jqueryui.controls.Input,
					{
						__getType : function() {
							return 'PopupEdit';
						},
						_extendMethods : function() {
							return $.jqueryMethos.PopupEdit;
						},
						_init : function() {
							$.jqueryui.controls.PopupEdit.base._init.call(this);
						},
						_render : function() {
							var g = this, p = this.options;
							g.inputText = null;

							if (this.element.tagName.toLowerCase() == "input") {
								this.element.readOnly = true;
								g.inputText = $(this.element);
								g.textFieldID = this.element.id;
							}
							if (g.inputText[0].name == undefined)
								g.inputText[0].name = g.textFieldID;

							g.valueField = null;
							if (p.valueFieldID) {
								g.valueField = $("#" + p.valueFieldID
										+ ":input");
								if (g.valueField.length == 0)
									g.valueField = $('<input type="hidden"/>');
								g.valueField[0].id = g.valueField[0].name = p.valueFieldID;
							} else {
								g.valueField = $('<input type="hidden"/>');
								g.valueField[0].id = g.valueField[0].name = g.textFieldID
										+ "_val";
							}
							if (g.valueField[0].name == undefined)
								g.valueField[0].name = g.valueField[0].id;
							if (p.valueFieldCssClass) {
								g.valueField.addClass(p.valueFieldCssClass);
							}

							g.link = $('<div class="l-trigger"><div class="l-trigger-icon"></div></div>');

							g.wrapper = g.inputText.wrap(
									'<div class="l-text l-text-popup"></div>')
									.parent();
							g.wrapper
									.append('<div class="l-text-l"></div><div class="l-text-r"></div>');
							g.wrapper.append(g.link);
							g.wrapper.append(g.valueField);

							g.valueField.attr("data-jqueryid", g.id);
							g.inputText.addClass("l-text-field");

							g.link.hover(function() {
								if (p.disabled)
									return;
								this.className = "l-trigger-hover";
							}, function() {
								if (p.disabled)
									return;
								this.className = "l-trigger";
							}).mousedown(function() {
								if (p.disabled)
									return;
								this.className = "l-trigger-pressed";
							}).mouseup(function() {
								if (p.disabled)
									return;
								this.className = "l-trigger-hover";
							}).click(function() {
								if (p.disabled)
									return;
								if (g.trigger('buttonClick') == false)
									return false;
							});
							g.inputText.click(function() {
								if (p.disabled)
									return;
							}).blur(function() {
								if (p.disabled)
									return;
								g.wrapper.removeClass("l-text-focus");
							}).focus(function() {
								if (p.disabled)
									return;
								g.wrapper.addClass("l-text-focus");
							});
							g.wrapper.hover(function() {
								if (p.disabled)
									return;
								g.wrapper.addClass("l-text-over");
							}, function() {
								if (p.disabled)
									return;
								g.wrapper.removeClass("l-text-over");
							});

							g.set(p);
						},
						destroy : function() {
							if (this.wrapper)
								this.wrapper.remove();
							this.options = null;
							$.jqueryui.remove(this);
						},
						clear : function() {
							var g = this, p = this.options;
							g.inputText.val("");
							g.valueField.val("");
						},
						_setCss : function(css) {
							if (css) {
								this.wrapper.addClass(css);
							}
						},

						_setCancelable : function(value) {
							var g = this, p = this.options;
							if (!value && g.unselect) {
								g.unselect.remove();
								g.unselect = null;
							}
							if (!value && !g.unselect)
								return;
							g.unselect = $(
									'<div class="l-trigger l-trigger-cancel"><div class="l-trigger-icon"></div></div>')
									.hide();
							g.wrapper.hover(function() {
								g.unselect.show();
							}, function() {
								g.unselect.hide();
							})
							if (!p.disabled && p.cancelable) {
								g.wrapper.append(g.unselect);
							}
							g.unselect
									.hover(
											function() {
												this.className = "l-trigger-hover l-trigger-cancel";
											},
											function() {
												this.className = "l-trigger l-trigger-cancel";
											}).click(function() {
										g.clear();
									});
						},
						_setDisabled : function(value) {
							if (value) {
								this.wrapper.addClass('l-text-disabled');
							} else {
								this.wrapper.removeClass('l-text-disabled');
							}
						},
						_setWidth : function(value) {
							var g = this;
							if (value > 20) {
								g.wrapper.css({
									width : value
								});
								g.inputText.css({
									width : value - 20
								});
							}
						},
						_setHeight : function(value) {
							var g = this;
							if (value > 10) {
								g.wrapper.height(value);
								g.inputText.height(value - 2);
							}
						},
						getData : function() {
							var g = this, p = this.options;
							var data = [];
							var v = $(g.valueField).val(), t = $(g.inputText)
									.val();
							var values = v ? v.split(p.split) : null, texts = t ? t
									.split(p.split)
									: null;
							$(values).each(function(i) {
								var o = {};
								o[p.textField] = texts[i];
								o[p.valueField] = values[i];
								data.push(o);
							});
							return data;
						},
						_getText : function() {
							return $(this.inputText).val();
						},
						_getValue : function() {
							return $(this.valueField).val();
						},
						getValue : function() {
							return this._getValue();
						},
						getText : function() {
							return this._getText();
						},

						setValue : function(value, text) {
							var g = this, p = this.options;
							if (arguments.length >= 2) {
								g.setValue(value);
								g.setText(text);
								return;
							}
							g.valueField.val(value);
						},

						setText : function(text) {
							var g = this, p = this.options;
							if (p.render) {
								g.inputText.val(p.render(text));
							} else {
								g.inputText.val(text);
							}
						},
						addValue : function(value, text) {
							var g = this, p = this.options;
							if (!value)
								return;
							var v = g.getValue(), t = g.getText();
							if (!v) {
								g.setValue(value);
								g.setText(text);
							} else {
								var arrV = [], arrT = [], old = v
										.split(p.split), value = value
										.split(p.split), text = text
										.split(p.split);
								for (var i = 0, l = value.length; i < l; i++) {
									if ($.inArray(value[i], old) == -1) {
										arrV.push(value[i]);
										arrT.push(text[i]);
									}
								}
								if (arrV.length) {
									g
											.setValue(v + p.split
													+ arrV.join(p.split));
									g.setText(t + p.split + arrT.join(p.split));
								}
							}
						},
						removeValue : function(value, text) {
							var g = this, p = this.options;
							if (!value)
								return;
							var v = g.getValue(), t = g.getText();
							if (!v)
								return;
							var oldV = v.split(p.split), oldT = t
									.split(p.split), value = value
									.split(p.split);
							for (var i = 0, index = -1, l = value.length; i < l; i++) {
								if ((index = $.inArray(value[i], oldV)) != -1) {
									oldV.splice(index, 1);
									oldT.splice(index, 1);
								}
							}
							g.setValue(oldV.join(p.split));
							g.setText(oldT.join(p.split));
						},
						_setGrid : function(value) {
							if (!value)
								return;
							var g = this, p = this.options;
							var gridOptions = $.extend({
								parms : p.parms
							}, p.grid);

							this
									.bind(
											'buttonClick',
											function() {
												function getLastSelected() {
													try {
														return g.getData();
													} catch (e) {
														return null;
													}
												}
												if (!g.popupFn) {
													var options = {
														grid : gridOptions,
														condition : p.condition,
														valueField : p.valueField,
														textField : p.textField,
														split : p.split,
														lastSelected : getLastSelected(),
														onSelect : function(e) {
															if (g
																	.trigger(
																			'select',
																			e) == false)
																return;
															if (p.grid.checkbox) {
																g
																		.addValue(
																				e.value,
																				e.text);
																g
																		.removeValue(
																				e.remvoeValue,
																				e.remvoeText);
															} else {
																g
																		.setValue(e.value);
																g
																		.setText(e.text);
															}
															g.trigger(
																	'selected',
																	e);
														},
														selectInit : function(
																rowdata) {
															var value = g
																	.getValue();
															if (!value)
																return false;
															if (!p.valueField
																	|| !rowdata[p.valueField])
																return false;
															return $
																	.inArray(
																			rowdata[p.valueField]
																					.toString(),
																			value
																					.split(p.split)) != -1;
														}
													};
													g.popupFn = $.jqueryui
															.getPopupFn(options);
												}
												g.popupFn();
											});
						}
					});

	$.jqueryui.getPopupFn = function(p) {
		p = $.extend({
			title : '',
			width : 700,
			height : 320,
			top : null,
			left : null,
			split : ';',
			valueField : null,
			textField : null,
			grid : null,
			condition : null,
			onSelect : function(p) {
			},
			selectInit : function(rowdata) {
				return false
			}
		}, p);
		if (!p.grid)
			return;
		var win, grid, condition, lastSelected = p.lastSelected || [];
		return function() {
			show();
			return false;
		};
		function show() {
			function getGridHeight(height) {
				height = height || p.height;
				height -= conditionPanel.height();
				return height;
			}
			if (win) {
				grid._showData();
				win.show();
				grid.refreshSize();
				lastSelected = grid.selected.concat();
				return;
			}
			var panle = $("<div></div>");
			var conditionPanel = $("<div></div>");
			var gridPanel = $("<div></div>");
			panle.append(conditionPanel).append(gridPanel);
			if (p.condition) {
				var conditionParm = $.extend({
					labelWidth : 60,
					space : 20
				}, p.condition);
				condition = conditionPanel.jqueryForm(conditionParm);
			} else {
				conditionPanel.remove();
			}
			var gridParm = $.extend({
				columnWidth : 120,
				alternatingRow : false,
				frozen : true,
				rownumbers : true
			}, p.grid, {
				width : "100%",
				height : getGridHeight(),
				isChecked : p.selectInit,
				isSelected : p.selectInit,
				inWindow : false
			});

			grid = gridPanel.jqueryGrid(gridParm);

			if (p.condition) {
				var containerBtn1 = $('<li style="margin-right:9px"><div></div></li>');
				$("ul:first", conditionPanel).append(containerBtn1).after(
						'<div class="l-clear"></div>');
				$("div", containerBtn1).jqueryButton({
					text : 'Search',
					click : function() {
						var rules = $.jqueryui.getConditions(conditionPanel);
						grid.setParm('condition', $.jqueryui.toJSON(rules));
						grid.reload();
					}
				});
			}

			win = $.jqueryDialog.open({
				title : p.title,
				width : p.width,
				height : 'auto',
				top : p.top,
				left : p.left,
				target : panle,
				isResize : true,
				cls : 'l-selectorwin',
				onContentHeightChange : function(height) {
					grid.set('height', getGridHeight(height));
					return false;
				},
				onStopResize : function() {
					grid.refreshSize();
				},
				buttons : [ {
					text : 'OK',
					onclick : function(item, dialog) {
						toSelect();
						dialog.hide();
					}
				}, {
					text : 'Cancel',
					onclick : function(item, dialog) {
						dialog.hide();
					}
				} ]
			});

			grid.refreshSize();
		}
		function exist(value, data) {
			for (var i = 0; data && data[i]; i++) {
				var item = data[i];
				if (item[p.valueField] == value)
					return true;
			}
			return false;
		}
		function toSelect() {
			var selected = grid.selected || [];
			var value = [], text = [], data = [];
			$(selected).each(function(i, rowdata) {
				p.valueField && value.push(rowdata[p.valueField]);
				p.textField && text.push(rowdata[p.textField]);
				var o = $.extend(true, {}, this);
				grid.formatRecord(o, true);
				data.push(o);
			});
			var unSelected = [];
			$(lastSelected).each(
					function(i, item) {
						if (!exist(item[p.valueField], selected)
								&& exist(item[p.valueField], grid.rows)) {
							unSelected.push(item);
						}
					});
			var removeValue = [], removeText = [], removeData = [];
			$(unSelected).each(function(i, rowdata) {
				p.valueField && removeValue.push(rowdata[p.valueField]);
				p.textField && removeText.push(rowdata[p.textField]);
				var o = $.extend(true, {}, this);
				grid.formatRecord(o, true);
				removeData.push(o);
			});
			p.onSelect({
				value : value.join(p.split),
				text : text.join(p.split),
				data : data,
				remvoeValue : removeValue.join(p.split),
				remvoeText : removeText.join(p.split),
				removeData : removeData
			});
		}
	};

})(jQuery);
(function($) {

	$.fn.jqueryPortal = function(options) {
		return $.jqueryui.run.call(this, "jqueryPortal", arguments);
	};

	$.jqueryDefaults.Portal = {
		width : null,
		rows : null,
		columns : null,
		url : null,
		method : 'get',
		parms : null,
		draggable : false,
		onLoaded : null
	};
	$.jqueryDefaults.Portal_rows = {
		width : null,
		height : null
	};
	$.jqueryDefaults.Portal_columns = {
		width : null,
		height : null
	};

	$.jqueryMethos.Portal = {};

	$.jqueryui.controls.Portal = function(element, options) {
		$.jqueryui.controls.Portal.base.constructor
				.call(this, element, options);
	};
	$.jqueryui.controls.Portal
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						__getType : function() {
							return 'Portal';
						},
						__idPrev : function() {
							return 'Portal';
						},
						_extendMethods : function() {
							return $.jqueryMethos.Portal;
						},
						_init : function() {
							var g = this, p = this.options;
							$.jqueryui.controls.Portal.base._init.call(this);
							if ($(">div", g.element).length) {
								p.columns = [];
								$(">div", g.element).each(function(i, jpanel) {
									p.columns[i] = {
										panels : []
									};
								});

								g.tempInitPanels = $("<div></div>");
								$(">div", g.element).appendTo(g.tempInitPanels);
							}
							if (!p.rows && p.columns) {
								p.rows = [ {
									columns : p.columns
								} ];
							}
						},
						_render : function() {
							var g = this, p = this.options;

							g.portal = $(g.element).addClass("l-portal").html(
									"");

							g.set(p);

						},
						_setRows : function(rows) {
							var g = this, p = this.options;
							g.rows = [];
							if (rows && rows.length) {
								for (var i = 0; i < rows.length; i++) {
									var row = rows[i];
									var jrow = $('<div class="l-row"></div>')
											.appendTo(g.portal);
									g.rows[i] = g._renderRow({
										row : row,
										rowIndex : i,
										jrow : jrow
									});
									jrow.append('<div class="l-clear"></div>');
								}
							}
						},
						_renderRow : function(e) {
							var row = e.row, rowIndex = e.rowIndex, jrow = e.jrow;
							var g = this, p = this.options;
							var rowObj = {
								element : jrow[0]
							};
							if (row.width)
								jrow.width(row.width);
							if (row.height)
								jrow.height(row.height);
							if (row.columns)
								rowObj.columns = [];
							if (row.columns && row.columns.length) {
								for (var i = 0; i < row.columns.length; i++) {
									var column = row.columns[i];
									var jcolumn = $(
											'<div class="l-column"></div>')
											.appendTo(jrow);
									rowObj.columns[i] = g._renderColumn({
										column : column,
										columnIndex : i,
										jcolumn : jcolumn,
										rowIndex : rowIndex
									});
								}
							}
							return rowObj;
						},
						remove : function(e) {
							var g = this, p = this.options;
							var rowIndex = e.rowIndex, columnIndex = e.columnIndex, index = e.index;
							if (index == null)
								index = -1;
							if (index >= 0
									&& g.rows[rowIndex]
									&& g.rows[rowIndex].columns
									&& g.rows[rowIndex].columns[columnIndex]
									&& g.rows[rowIndex].columns[columnIndex].panels) {
								var panel = g.rows[rowIndex].columns[columnIndex].panels[index];
								panel && panel.close();
								g._updatePortal();
							}
						},
						add : function(e) {
							var g = this, p = this.options;
							var rowIndex = e.rowIndex, columnIndex = e.columnIndex, index = e.index, panel = e.panel;
							if (index == null)
								index = -1;
							if (!(g.rows[rowIndex] && g.rows[rowIndex].columns && g.rows[rowIndex].columns[columnIndex]))
								return;
							var gColumn = g.rows[rowIndex].columns[columnIndex], pColumn = p.rows[rowIndex].columns[columnIndex], jqueryPanel, jcolumn = $(gColumn.element);
							pColumn.panels = pColumn.panels || [];
							gColumn.panels = gColumn.panels || [];
							pColumn.panels.splice(index, 0, panel);
							if (index < 0) {
								var jpanel = $('<div></div>').insertBefore(
										gColumn.jplace);
								jqueryPanel = jpanel.jqueryPanel(panel);
							} else if (gColumn.panels[index]) {
								var jpanel = $('<div></div>').insertBefore(
										gColumn.panels[index].panel);
								jqueryPanel = jpanel.jqueryPanel(panel);
							}
							if (jqueryPanel) {
								jqueryPanel.bind('closed', g
										._createPanelClosed());
								g.setPanelEvent({
									panel : jqueryPanel
								});
								gColumn.panels.splice(index, 0, jqueryPanel);
							}
							g._updatePortal();
						},
						_createPanelClosed : function() {
							var g = this, p = this.options;
							return function() {
								var panel = this;
								var panels = g.getPanels();
								var rowIndex, columnIndex, index;
								$(panels).each(function() {
									if (this.panel == panel) {
										rowIndex = this.rowIndex;
										columnIndex = this.columnIndex;
										index = this.index;
									}
								});
								p.rows[rowIndex].columns[columnIndex].panels
										.splice(index, 1);
								g.rows[rowIndex].columns[columnIndex].panels
										.splice(index, 1);
							};
						},
						_renderColumn : function(e) {
							var column = e.column, columnIndex = e.columnIndex, jcolumn = e.jcolumn;
							var rowIndex = e.rowIndex;
							var g = this, p = this.options;
							var columnObj = {
								element : jcolumn[0]
							};
							if (column.width)
								jcolumn.width(column.width);
							if (column.height)
								jcolumn.height(column.height);
							if (column.panels)
								columnObj.panels = [];
							if (column.panels && column.panels.length) {
								for (var i = 0; i < column.panels.length; i++) {
									var panel = column.panels[i];
									var jpanel = $('<div></div>').appendTo(
											jcolumn);
									columnObj.panels[i] = jpanel
											.jqueryPanel(panel);
									columnObj.panels[i].bind('closed', g
											._createPanelClosed());
									g.setPanelEvent({
										panel : columnObj.panels[i]
									});
								}
							} else if (g.tempInitPanels) {

								var tempPanel = g.tempInitPanels
										.find(">div:eq(" + columnIndex + ")");
								if (tempPanel.length) {
									columnObj.panels = [];
									var panelOptions = {};
									var jelement = tempPanel.clone();
									if (jquery.inject
											&& jquery.inject.getOptions) {
										panelOptions = jquery.inject
												.getOptions({
													jelement : jelement,
													defaults : $.jqueryDefaults.Panel,
													config : jquery.inject.config.Panel
												});
									}
									columnObj.panels[0] = jelement.appendTo(
											jcolumn).jqueryPanel(panelOptions);
									columnObj.panels[0].bind('closed', g
											._createPanelClosed());
									g.setPanelEvent({
										panel : columnObj.panels[0]
									});
								}
							}
							columnObj.jplace = $(
									'<div class="l-column-place"></div>')
									.appendTo(jcolumn);
							return columnObj;
						},
						setPanelEvent : function(e) {

							var panel = e.panel, jpanel = panel.panel;
							var g = this, p = this.options;

							if ($.fn.jqueryDrag && p.draggable) {
								jpanel
										.addClass("l-panel-draggable")
										.jqueryDrag(
												{
													proxy : false,
													revert : true,
													handler : ".l-panel-header span:first",
													onRendered : function() {
													},
													onStartDrag : function(
															current, e) {
														g.portal
																.find(">.l-row")
																.addClass(
																		"l-row-dragging");
														this.jplace = $('<div class="l-panel-place"></div>');
														this.jplace
																.height(jpanel
																		.height());
														jpanel.width(jpanel
																.width());
														jpanel
																.addClass("l-panel-dragging");
														jpanel.css("position",
																"absolute");
														jpanel
																.after(this.jplace);
														g._updatePortal();
													},
													onDrag : function(current,
															e) {
														var pageX = e.pageX
																|| e.screenX, pageY = e.pageY
																|| e.screenY;
														var height = jpanel
																.height(), width = jpanel
																.width(), offset = jpanel
																.offset();
														var centerX = offset.left
																+ width / 2, centerY = offset.top + 10;
														var panels = g
																.getPanels(), emptyColumns = g
																.getEmptyColumns();
														var result = getPositionIn(
																panels,
																emptyColumns,
																centerX,
																centerY);
														if (result) {

															if (this.placeStatus) {
																if (this.placeStatus.panel
																		&& result.panel) {
																	if (this.placeStatus.panel.rowIndex == result.panel.rowIndex
																			&& this.placeStatus.panel.columnIndex == result.panel.columnIndex
																			&& this.placeStatus.panel.index == result.panel.index
																			&& this.placeStatus.position == result.position) {
																		return;
																	}
																}
																if (this.placeStatus.column
																		&& result.column) {
																	if (this.placeStatus.column.rowIndex == result.column.rowIndex
																			&& this.placeStatus.column.columnIndex == result.column.columnIndex
																			&& this.placeStatus.position == result.position) {
																		return;
																	}
																}
															}
															if (result.position == "top") {
																this.jplace
																		.insertBefore(result.panel ? result.panel.jpanel
																				: result.column.jplace);
																this.savedPosition = result.panel ? result.panel
																		: result.column
																this.savedPosition.inTop = true;
															} else if (result.position == "bottom") {
																this.jplace
																		.insertAfter(result.panel.jpanel);
																this.savedPosition = result.panel;
																this.savedPosition.inTop = false;
															}
															this.placeStatus = result;
														} else {
															this.placeStatus = null;
														}

														function getPositionIn(
																panels,
																columns, x, y) {
															for (
																	i = 0,
																	l = panels.length; i < l; i++) {
																var o = panels[i];
																if (o.panel == panel) {
																	continue;
																}
																var r = positionIn(
																		o,
																		null,
																		x, y);
																if (r)
																	return r;
															}
															for (
																	i = 0,
																	l = columns.length; i < l; i++) {
																var column = columns[i];
																var r = positionIn(
																		null,
																		column,
																		x, y);
																if (r)
																	return r;
															}
															return null;
														}

														function positionIn(
																panel, column,
																x, y) {
															var jelement = panel ? panel.jpanel
																	: column.jplace;
															if (!jelement)
																return null;
															var height = jelement
																	.height(), width = jelement
																	.width();
															var left = jelement
																	.offset().left, top = jelement
																	.offset().top;
															var diff = 3;
															if (x > left - diff
																	&& x < left
																			+ width
																			+ diff) {
																if (y > top
																		- diff
																		&& y < top
																				+ height
																				/ 2
																				+ diff) {
																	return {
																		panel : panel,
																		column : column,
																		position : "top"
																	};
																}
																if (y > top
																		+ height
																		/ 2
																		- diff
																		&& y < top
																				+ height
																				+ diff) {
																	return {
																		panel : panel,
																		column : column,
																		position : panel ? "bottom"
																				: "top"
																	};
																}
															}
															return null;
														}
													},
													onStopDrag : function(
															current, e) {
														g.portal
																.find(">.l-row")
																.removeClass(
																		"l-row-dragging");
														panel
																.set(
																		'width',
																		panel
																				.get('width'));
														jpanel
																.removeClass("l-panel-dragging");

														if (this.jplace) {
															jpanel
																	.css({
																		"position" : "relative",
																		"left" : null,
																		"top" : null
																	});
															jpanel
																	.insertAfter(this.jplace);
															g.portal
																	.find(
																			">.l-row > .l-column >.l-panel-place")
																	.remove();

															if (this.savedPosition) {
																var panels = g
																		.getPanels();
																var rowIndex, columnIndex, index;
																$(panels)
																		.each(
																				function() {
																					if (this.panel == panel) {
																						rowIndex = this.rowIndex;
																						columnIndex = this.columnIndex;
																						index = this.index;
																					}
																				});
																var oldPanelOptions = p.rows[rowIndex].columns[columnIndex].panels[index];
																var oldPanel = g.rows[rowIndex].columns[columnIndex].panels[index];
																p.rows[rowIndex].columns[columnIndex].panels
																		.splice(
																				index,
																				1);
																g.rows[rowIndex].columns[columnIndex].panels
																		.splice(
																				index,
																				1);

																if (this.savedPosition.panel) {

																	p.rows[this.savedPosition.rowIndex].columns[this.savedPosition.columnIndex].panels
																			.splice(
																					this.savedPosition.index
																							+ this.savedPosition.inTop ? -1
																							: 0,
																					0,
																					oldPanelOptions);
																	g.rows[this.savedPosition.rowIndex].columns[this.savedPosition.columnIndex].panels
																			.splice(
																					this.savedPosition.index
																							+ this.savedPosition.inTop ? -1
																							: 0,
																					0,
																					oldPanel);
																} else {
																	p.rows[this.savedPosition.rowIndex].columns[this.savedPosition.columnIndex].panels = [ oldPanelOptions ];
																	g.rows[this.savedPosition.rowIndex].columns[this.savedPosition.columnIndex].panels = [ oldPanel ];
																}
															}
														}
														g._updatePortal();

														return false;
													}
												});
							}

						},
						_updatePortal : function() {
							var g = this, p = this.options;
							$(g.rows)
									.each(
											function(rowIndex) {
												$(this.columns)
														.each(
																function(
																		columnIndex) {
																	if (this.panels
																			&& this.panels.length) {
																		$(
																				this.element)
																				.removeClass(
																						"l-column-empty");
																	} else {
																		$(
																				this.element)
																				.addClass(
																						"l-column-empty");
																	}
																});
											});
						},
						getPanels : function() {
							var g = this, p = this.options;
							var panels = [];
							$(g.rows).each(function(rowIndex) {
								$(this.columns).each(function(columnIndex) {
									$(this.panels).each(function(index) {
										panels.push({
											rowIndex : rowIndex,
											columnIndex : columnIndex,
											index : index,
											panel : this,
											jpanel : this.panel
										});
									});
								});
							});
							return panels;
						},
						getPanel : function(e) {
							var g = this, p = this.options;
							e = $.extend({
								rowIndex : 0,
								columnIndex : 0,
								index : 0
							}, e);
							var panel = null;
							$(g.rows)
									.each(
											function(rowIndex) {
												$(this.columns)
														.each(
																function(
																		columnIndex) {
																	$(
																			this.panels)
																			.each(
																					function(
																							index) {
																						if (panel)
																							return;
																						if (rowIndex == e.rowIndex
																								&& columnIndex == e.columnIndex
																								&& index == e.index) {
																							panel = this;
																						}
																					});
																});
											});
							return panel;
						},
						getEmptyColumns : function() {
							var g = this, p = this.options;
							var columns = [];
							$(g.rows).each(function(rowIndex) {
								$(this.columns).each(function(columnIndex) {
									if (!this.panels || !this.panels.length) {
										columns.push({
											rowIndex : rowIndex,
											columnIndex : columnIndex,
											jplace : this.jplace
										});
									}
								});
							});
							return columns;
						},
						_setUrl : function(url) {
							var g = this, p = this.options;
							if (!url)
								return;
							$.ajax({
								url : url,
								data : p.parms,
								type : p.method,
								dataType : 'json',
								success : function(rows) {
									g.set('rows', rows);
								}
							});
						},
						_setWidth : function(value) {
							value && this.portal.width(value);
						},
						collapseAll : function() {
							var g = this, p = this.options;
							var panels = g.getPanels();
							$(panels).each(function(i, o) {
								var panel = o.panel;
								panel.collapse();
							});
						},
						expandAll : function() {
							var g = this, p = this.options;
							var panels = g.getPanels();
							$(panels).each(function(i, o) {
								var panel = o.panel;
								panel.expand();
							});
						}
					});

})(jQuery);

(function($) {

	$.fn.jqueryRadio = function() {
		return $.jqueryui.run.call(this, "jqueryRadio", arguments);
	};

	$.fn.jqueryGetRadioManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetRadioManager", arguments);
	};

	$.jqueryDefaults.Radio = {
		disabled : false
	};

	$.jqueryMethos.Radio = {};

	$.jqueryui.controls.Radio = function(element, options) {
		$.jqueryui.controls.Radio.base.constructor.call(this, element, options);
	};
	$.jqueryui.controls.Radio.jqueryExtend($.jqueryui.controls.Input, {
		__getType : function() {
			return 'Radio';
		},
		__idPrev : function() {
			return 'Radio';
		},
		_extendMethods : function() {
			return $.jqueryMethos.Radio;
		},
		_render : function() {
			var g = this, p = this.options;
			g.input = $(this.element);
			g.link = $('<a href="javascript:void(0)" class="l-radio"></a>');
			g.wrapper = g.input.addClass('l-hidden').wrap(
					'<div class="l-radio-wrapper"></div>').parent();
			g.wrapper.prepend(g.link);
			g.input.change(function() {
				if (this.checked) {
					g.link.addClass('l-radio-checked');
				} else {
					g.link.removeClass('l-radio-checked');
				}
				return true;
			});
			g.link.click(function() {
				g._doclick();
			});
			g.wrapper.hover(function() {
				if (!p.disabled)
					$(this).addClass("l-over");
			}, function() {
				$(this).removeClass("l-over");
			});
			this.element.checked && g.link.addClass('l-radio-checked');

			if (this.element.id) {
				$("label[for=" + this.element.id + "]").click(function() {
					g._doclick();
				});
			}
			g.set(p);
		},
		setValue : function(value) {
			var g = this, p = this.options;
			if (!value) {
				g.input[0].checked = false;
				g.link.removeClass('l-radio-checked');
			} else {
				g.input[0].checked = true;
				g.link.addClass('l-radio-checked');
			}
		},
		getValue : function() {
			return this.input[0].checked;
		},
		setEnabled : function() {
			this.input.attr('disabled', false);
			this.wrapper.removeClass("l-disabled");
			this.options.disabled = false;
		},
		setDisabled : function() {
			this.input.attr('disabled', true);
			this.wrapper.addClass("l-disabled");
			this.options.disabled = true;
		},
		updateStyle : function() {
			if (this.input.attr('disabled')) {
				this.wrapper.addClass("l-disabled");
				this.options.disabled = true;
			}
			if (this.input[0].checked) {
				this.link.addClass('l-checkbox-checked');
			} else {
				this.link.removeClass('l-checkbox-checked');
			}
		},
		_doclick : function() {
			var g = this, p = this.options;
			if (g.input.attr('disabled')) {
				return false;
			}
			g.input.trigger('click').trigger('change');
			var formEle;
			if (g.input[0].form)
				formEle = g.input[0].form;
			else
				formEle = document;
			$("input:radio[name=" + g.input[0].name + "]", formEle)
					.not(g.input).trigger("change");
			return false;
		}
	});

})(jQuery);
(function($) {

	$.fn.jqueryRadioList = function(options) {
		return $.jqueryui.run.call(this, "jqueryRadioList", arguments);
	};

	$.jqueryDefaults.RadioList = {
		rowSize : 3,
		valueField : 'id',
		textField : 'text',
		valueFieldID : null,
		name : null,
		data : null,
		parms : null,
		url : null,
		onSuccess : null,
		onError : null,
		onSelect : null,
		css : null,
		value : null,
		valueFieldCssClass : null
	};

	$.jqueryMethos.RadioList = $.jqueryMethos.RadioList || {};

	$.jqueryui.controls.RadioList = function(element, options) {
		$.jqueryui.controls.RadioList.base.constructor.call(this, element,
				options);
	};
	$.jqueryui.controls.RadioList
			.jqueryExtend(
					$.jqueryui.controls.Input,
					{
						__getType : function() {
							return 'RadioList';
						},
						_extendMethods : function() {
							return $.jqueryMethos.RadioList;
						},
						_init : function() {
							$.jqueryui.controls.RadioList.base._init.call(this);
						},
						_render : function() {
							var g = this, p = this.options;
							g.data = p.data;
							g.valueField = null;

							if (p.valueFieldID) {
								g.valueField = $("#" + p.valueFieldID
										+ ":input,[name=" + p.valueFieldID
										+ "]:input");
								if (g.valueField.length == 0)
									g.valueField = $('<input type="hidden"/>');
								g.valueField[0].id = g.valueField[0].name = p.valueFieldID;
							} else {
								g.valueField = $('<input type="hidden"/>');
								g.valueField[0].id = g.valueField[0].name = g.id
										+ "_val";
							}
							if (g.valueField[0].name == null)
								g.valueField[0].name = g.valueField[0].id;
							if (p.valueFieldCssClass) {
								g.valueField.addClass(p.valueFieldCssClass);
							}
							g.valueField.attr("data-jqueryid", g.id);
							g.radioList = $(this.element);
							g.radioList
									.html(
											'<div class="l-radiolist-inner"><table cellpadding="0" cellspacing="0" border="0" class="l-radiolist-table"></table></div>')
									.addClass("l-radiolist").append(
											g.valueField);
							g.radioList.table = $("table:first", g.radioList);

							p.value = g.valueField.val() || p.value;

							g.set(p);

							g._addClickEven();
						},
						destroy : function() {
							if (this.radioList)
								this.radioList.remove();
							this.options = null;
							$.jqueryui.remove(this);
						},
						clear : function() {
							this._changeValue("");
							this.trigger('clear');
						},
						_setCss : function(css) {
							if (css) {
								this.radioList.addClass(css);
							}
						},
						_setDisabled : function(value) {

							if (value) {
								this.radioList.addClass('l-radiolist-disabled');
								$("input:radio", this.radioList).attr(
										"disabled", true);
							} else {
								this.radioList
										.removeClass('l-radiolist-disabled');
								$("input:radio", this.radioList).removeAttr(
										"disabled");
							}
						},
						_setWidth : function(value) {
							this.radioList.width(value);
						},
						_setHeight : function(value) {
							this.radioList.height(value);
						},
						indexOf : function(item) {
							var g = this, p = this.options;
							if (!g.data)
								return -1;
							for (var i = 0, l = g.data.length; i < l; i++) {
								if (typeof (item) == "object") {
									if (g.data[i] == item)
										return i;
								} else {
									if (g.data[i][p.valueField].toString() == item
											.toString())
										return i;
								}
							}
							return -1;
						},
						removeItems : function(items) {
							var g = this;
							if (!g.data)
								return;
							$(items).each(function(i, item) {
								var index = g.indexOf(item);
								if (index == -1)
									return;
								g.data.splice(index, 1);
							});
							g.refresh();
						},
						removeItem : function(item) {
							if (!this.data)
								return;
							var index = this.indexOf(item);
							if (index == -1)
								return;
							this.data.splice(index, 1);
							this.refresh();
						},
						insertItem : function(item, index) {
							var g = this;
							if (!g.data)
								g.data = [];
							g.data.splice(index, 0, item);
							g.refresh();
						},
						addItems : function(items) {
							var g = this;
							if (!g.data)
								g.data = [];
							$(items).each(function(i, item) {
								g.data.push(item);
							});
							g.refresh();
						},
						addItem : function(item) {
							var g = this;
							if (!g.data)
								g.data = [];
							g.data.push(item);
							g.refresh();
						},
						_setValue : function(value) {
							var g = this, p = this.options;
							p.value = value;
							this._dataInit();
						},
						setValue : function(value) {
							this._setValue(value);
						},
						_setUrl : function(url) {
							if (!url)
								return;
							var g = this, p = this.options;
							$.ajax({
								type : 'post',
								url : url,
								data : p.parms,
								cache : false,
								dataType : 'json',
								success : function(data) {
									g.setData(data);
									g.trigger('success', [ data ]);
								},
								error : function(XMLHttpRequest, textStatus) {
									g.trigger('error', [ XMLHttpRequest,
											textStatus ]);
								}
							});
						},
						setUrl : function(url) {
							return this._setUrl(url);
						},
						setParm : function(name, value) {
							if (!name)
								return;
							var g = this;
							var parms = g.get('parms');
							if (!parms)
								parms = {};
							parms[name] = value;
							g.set('parms', parms);
						},
						clearContent : function() {
							var g = this, p = this.options;
							$("table", g.radioList).html("");
						},
						_setData : function(data) {
							this.setData(data);
						},
						setData : function(data) {
							var g = this, p = this.options;
							if (!data || !data.length)
								return;
							g.data = data;
							g.refresh();
							g.updateStyle();
						},
						refresh : function() {
							var g = this, p = this.options, data = this.data;
							this.clearContent();
							if (!data)
								return;
							var out = [], rowSize = p.rowSize, appendRowStart = false, name = p.name
									|| g.id;
							for (var i = 0; i < data.length; i++) {
								var val = data[i][p.valueField], txt = data[i][p.textField], id = g.id
										+ "-" + i;
								var newRow = i % rowSize == 0;

								if (newRow) {
									if (appendRowStart)
										out.push('</tr>');
									out.push("<tr>");
									appendRowStart = true;
								}
								out.push("<td><input type='radio' name='"
										+ name + "' value='" + val + "' id='"
										+ id + "'/><label for='" + id + "'>"
										+ txt + "</label></td>");
							}
							if (appendRowStart)
								out.push('</tr>');
							g.radioList.table.append(out.join(''));
						},
						_getValue : function() {
							var g = this, p = this.options, name = p.name
									|| g.id;
							return $('input:radio[name="' + name + '"]:checked')
									.val();
						},
						getValue : function() {

							return this._getValue();
						},
						updateStyle : function() {
							var g = this, p = this.options;
							g._dataInit();
							$(":radio", g.element).change(function() {
								var value = g.getValue();
								g.trigger('select', [ {
									value : value
								} ]);
							});
						},
						_dataInit : function() {
							var g = this, p = this.options;
							var value = g.valueField.val() || g._getValue()
									|| p.value;
							g._changeValue(value);
						},

						_changeValue : function(newValue) {
							var g = this, p = this.options, name = p.name
									|| g.id;
							$("input:radio[name='" + name + "']", g.radioList)
									.each(function() {
										this.checked = this.value == newValue;
									});
							g.valueField.val(newValue);
							g.selectedValue = newValue;
						},
						_addClickEven : function() {
							var g = this, p = this.options;

							g.radioList.click(function(e) {
								var value = g.getValue();
								if (value)
									g.valueField.val(value);
							});
						}
					});

})(jQuery);
(function($) {
	$.fn.jqueryResizable = function(options) {
		return $.jqueryui.run.call(this, "jqueryResizable", arguments, {
			idAttrName : 'jqueryuiresizableid',
			hasElement : false,
			propertyToElemnt : 'target'
		});
	};

	$.fn.jqueryGetResizableManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetResizableManager",
				arguments, {
					idAttrName : 'jqueryuiresizableid',
					hasElement : false,
					propertyToElemnt : 'target'
				});
	};

	$.jqueryDefaults.Resizable = {
		handles : 'n, e, s, w, ne, se, sw, nw',
		maxWidth : 2000,
		maxHeight : 2000,
		minWidth : 20,
		minHeight : 20,
		scope : 3,
		animate : false,
		onStartResize : function(e) {
		},
		onResize : function(e) {
		},
		onStopResize : function(e) {
		},
		onEndResize : null
	};

	$.jqueryui.controls.Resizable = function(options) {
		$.jqueryui.controls.Resizable.base.constructor
				.call(this, null, options);
	};

	$.jqueryui.controls.Resizable.jqueryExtend($.jqueryui.core.UIComponent, {
		__getType : function() {
			return 'Resizable';
		},
		__idPrev : function() {
			return 'Resizable';
		},
		_render : function() {
			var g = this, p = this.options;
			g.target = $(p.target);
			g.set(p);

			g.target.mousemove(function(e) {
				if (p.disabled)
					return;
				g.dir = g._getDir(e);
				if (g.dir)
					g.target.css('cursor', g.dir + '-resize');
				else if (g.target.css('cursor').indexOf('-resize') > 0)
					g.target.css('cursor', 'default');
				if (p.target.jqueryuidragid) {
					var drag = $.jqueryui.get(p.target.jqueryuidragid);
					if (drag && g.dir) {
						drag.set('disabled', true);
					} else if (drag) {
						drag.set('disabled', false);
					}
				}
			}).mousedown(function(e) {
				if (p.disabled)
					return;
				if (g.dir) {
					g._start(e);
				}
			});
		},
		_rendered : function() {
			this.options.target.jqueryuiresizableid = this.id;
		},
		_getDir : function(e) {
			var g = this, p = this.options;
			var dir = '';
			var xy = g.target.offset();
			var width = g.target.width();
			var height = g.target.height();
			var scope = p.scope;
			var pageX = e.pageX || e.screenX;
			var pageY = e.pageY || e.screenY;
			if (pageY >= xy.top && pageY < xy.top + scope) {
				dir += 'n';
			} else if (pageY <= xy.top + height
					&& pageY > xy.top + height - scope) {
				dir += 's';
			}
			if (pageX >= xy.left && pageX < xy.left + scope) {
				dir += 'w';
			} else if (pageX <= xy.left + width
					&& pageX > xy.left + width - scope) {
				dir += 'e';
			}
			if (p.handles == "all" || dir == "")
				return dir;
			if ($.inArray(dir, g.handles) != -1)
				return dir;
			return '';
		},
		_setHandles : function(handles) {
			if (!handles)
				return;
			this.handles = handles.replace(/(\s*)/g, '').split(',');
		},
		_createProxy : function() {
			var g = this;
			g.proxy = $('<div class="l-resizable"></div>');
			g.proxy.width(g.target.width()).height(g.target.height())
			g.proxy.attr("resizableid", g.id).appendTo('body');
		},
		_removeProxy : function() {
			var g = this;
			if (g.proxy) {
				g.proxy.remove();
				g.proxy = null;
			}
		},
		_start : function(e) {
			var g = this, p = this.options;
			g._createProxy();
			g.proxy.css({
				left : g.target.offset().left,
				top : g.target.offset().top,
				position : 'absolute'
			});
			g.current = {
				dir : g.dir,
				left : g.target.offset().left,
				top : g.target.offset().top,
				startX : e.pageX || e.screenX,
				startY : e.pageY || e.clientY,
				width : g.target.width(),
				height : g.target.height()
			};
			$(document).bind("selectstart.resizable", function() {
				return false;
			});
			$(document).bind('mouseup.resizable', function() {
				g._stop.apply(g, arguments);
			});
			$(document).bind('mousemove.resizable', function() {
				g._drag.apply(g, arguments);
			});
			g.proxy.show();
			g.trigger('startResize', [ g.current, e ]);
		},
		changeBy : {
			t : [ 'n', 'ne', 'nw' ],
			l : [ 'w', 'sw', 'nw' ],
			w : [ 'w', 'sw', 'nw', 'e', 'ne', 'se' ],
			h : [ 'n', 'ne', 'nw', 's', 'se', 'sw' ]
		},
		_drag : function(e) {
			var g = this, p = this.options;
			if (!g.current)
				return;
			if (!g.proxy)
				return;
			g.proxy.css('cursor', g.current.dir == '' ? 'default'
					: g.current.dir + '-resize');
			var pageX = e.pageX || e.screenX;
			var pageY = e.pageY || e.screenY;
			g.current.diffX = pageX - g.current.startX;
			g.current.diffY = pageY - g.current.startY;
			g._applyResize(g.proxy);
			g.trigger('resize', [ g.current, e ]);
		},
		_stop : function(e) {
			var g = this, p = this.options;
			if (g.hasBind('stopResize')) {
				if (g.trigger('stopResize', [ g.current, e ]) != false)
					g._applyResize();
			} else {
				g._applyResize();
			}
			g._removeProxy();
			g.trigger('endResize', [ g.current, e ]);
			$(document).unbind("selectstart.resizable");
			$(document).unbind('mousemove.resizable');
			$(document).unbind('mouseup.resizable');
		},
		_applyResize : function(applyResultBody) {
			var g = this, p = this.options;
			var cur = {
				left : g.current.left,
				top : g.current.top,
				width : g.current.width,
				height : g.current.height
			};
			var applyToTarget = false;
			if (!applyResultBody) {
				applyResultBody = g.target;
				applyToTarget = true;
				if (!isNaN(parseInt(g.target.css('top'))))
					cur.top = parseInt(g.target.css('top'));
				else
					cur.top = 0;
				if (!isNaN(parseInt(g.target.css('left'))))
					cur.left = parseInt(g.target.css('left'));
				else
					cur.left = 0;
			}
			if ($.inArray(g.current.dir, g.changeBy.l) > -1) {
				cur.left += g.current.diffX;
				g.current.diffLeft = g.current.diffX;

			} else if (applyToTarget) {
				delete cur.left;
			}
			if ($.inArray(g.current.dir, g.changeBy.t) > -1) {
				cur.top += g.current.diffY;
				g.current.diffTop = g.current.diffY;
			} else if (applyToTarget) {
				delete cur.top;
			}
			if ($.inArray(g.current.dir, g.changeBy.w) > -1) {
				cur.width += (g.current.dir.indexOf('w') == -1 ? 1 : -1)
						* g.current.diffX;
				g.current.newWidth = cur.width;
			} else if (applyToTarget) {
				delete cur.width;
			}
			if ($.inArray(g.current.dir, g.changeBy.h) > -1) {
				cur.height += (g.current.dir.indexOf('n') == -1 ? 1 : -1)
						* g.current.diffY;
				g.current.newHeight = cur.height;
			} else if (applyToTarget) {
				delete cur.height;
			}
			if (applyToTarget && p.animate)
				applyResultBody.animate(cur);
			else
				applyResultBody.css(cur);
		}
	});

})(jQuery);
(function($) {
	$.fn.jquerySpinner = function() {
		return $.jqueryui.run.call(this, "jquerySpinner", arguments);
	};
	$.fn.jqueryGetSpinnerManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetSpinnerManager", arguments);
	};

	$.jqueryDefaults.Spinner = {
		type : 'float',
		isNegative : true,
		decimalplace : 2,
		step : 0.1,
		interval : 50,
		onChangeValue : false,
		minValue : null,
		maxValue : null,
		disabled : false,
		readonly : false
	};

	$.jqueryMethos.Spinner = {};

	$.jqueryui.controls.Spinner = function(element, options) {
		$.jqueryui.controls.Spinner.base.constructor.call(this, element,
				options);
	};
	$.jqueryui.controls.Spinner
			.jqueryExtend(
					$.jqueryui.controls.Input,
					{
						__getType : function() {
							return 'Spinner';
						},
						__idPrev : function() {
							return 'Spinner';
						},
						_extendMethods : function() {
							return $.jqueryMethos.Spinner;
						},
						_init : function() {
							$.jqueryui.controls.Spinner.base._init.call(this);
							var p = this.options;
							if (p.type == 'float') {
								p.step = 0.1;
								p.interval = 50;
							} else if (p.type == 'int') {
								p.step = 1;
								p.interval = 100;
							} else if (p.type == 'time') {
								p.step = 1;
								p.interval = 100;
							} else {
								p.type = "int";
								p.step = 1;
								p.interval = 100;
							}
						},
						_render : function() {
							var g = this, p = this.options;
							g.interval = null;
							g.inputText = null;
							g.value = null;
							g.textFieldID = "";
							if (this.element.tagName.toLowerCase() == "input"
									&& this.element.type
									&& this.element.type == "text") {
								g.inputText = $(this.element);
								if (this.element.id)
									g.textFieldID = this.element.id;
							} else {
								g.inputText = $('<input type="text"/>');
								g.inputText.appendTo($(this.element));
							}
							if (g.textFieldID == "" && p.textFieldID)
								g.textFieldID = p.textFieldID;

							g.link = $('<div class="l-trigger"><div class="l-spinner-up"><div class="l-spinner-icon"></div></div><div class="l-spinner-split"></div><div class="l-spinner-down"><div class="l-spinner-icon"></div></div></div>');
							g.wrapper = g.inputText.wrap(
									'<div class="l-text"></div>').parent();
							g.wrapper
									.append('<div class="l-text-l"></div><div class="l-text-r"></div>');
							g.wrapper.append(g.link).after(g.selectBox).after(
									g.valueField);
							g.link.up = $(".l-spinner-up", g.link);
							g.link.down = $(".l-spinner-down", g.link);
							g.inputText.addClass("l-text-field");

							if (p.disabled) {
								g.wrapper.addClass("l-text-disabled");
							}

							if (!g._isVerify(g.inputText.val())) {
								g.value = g._getDefaultValue();
								g._showValue(g.value);
							}

							g.link.up.hover(function() {
								if (!p.disabled)
									$(this).addClass("l-spinner-up-over");
							}, function() {
								clearInterval(g.interval);
								$(document).unbind("selectstart.spinner");
								$(this).removeClass("l-spinner-up-over");
							}).mousedown(
									function() {
										if (!p.disabled) {
											g._uping.call(g);
											g.interval = setInterval(
													function() {
														g._uping.call(g);
													}, p.interval);
											$(document).bind(
													"selectstart.spinner",
													function() {
														return false;
													});
										}
									}).mouseup(function() {
								clearInterval(g.interval);
								g.inputText.trigger("change").focus();
								$(document).unbind("selectstart.spinner");
							});
							g.link.down.hover(function() {
								if (!p.disabled)
									$(this).addClass("l-spinner-down-over");
							}, function() {
								clearInterval(g.interval);
								$(document).unbind("selectstart.spinner");
								$(this).removeClass("l-spinner-down-over");
							}).mousedown(
									function() {
										if (!p.disabled) {
											g.interval = setInterval(
													function() {
														g._downing.call(g);
													}, p.interval);
											$(document).bind(
													"selectstart.spinner",
													function() {
														return false;
													});
										}
									}).mouseup(function() {
								clearInterval(g.interval);
								g.inputText.trigger("change").focus();
								$(document).unbind("selectstart.spinner");
							});

							g.inputText.change(function() {
								var value = g.inputText.val();
								g.value = g._getVerifyValue(value);
								g.trigger('changeValue', [ g.value ]);
								g._showValue(g.value);
							}).blur(function() {
								g.wrapper.removeClass("l-text-focus");
							}).focus(function() {
								g.wrapper.addClass("l-text-focus");
							});
							g.wrapper.hover(function() {
								if (!p.disabled)
									g.wrapper.addClass("l-text-over");
							}, function() {
								g.wrapper.removeClass("l-text-over");
							});
							g.set(p);
						},
						_setWidth : function(value) {
							var g = this;
							if (value > 20) {
								g.wrapper.css({
									width : value
								});
								g.inputText.css({
									width : value - 20
								});
							}
						},
						_setHeight : function(value) {
							var g = this;
							if (value > 10) {
								g.wrapper.height(value);
								g.inputText.height(value - 2);
								g.link.height(value - 4);
							}
						},
						_setDisabled : function(value) {
							if (value) {
								this.wrapper.addClass("l-text-disabled");
							} else {
								this.wrapper.removeClass("l-text-disabled");
							}
						},
						_showValue : function(value) {
							var g = this, p = this.options;
							if (!value || value == "NaN")
								value = 0;
							if (p.type == 'float') {
								value = parseFloat(value).toFixed(
										p.decimalplace);
							}
							this.inputText.val(value)
						},
						_setValue : function(value) {
							this._showValue(value);
						},
						setValue : function(value) {
							this._showValue(value);
						},
						getValue : function() {
							return this.inputText.val();
						},
						_round : function(v, e) {
							var g = this, p = this.options;
							var t = 1;
							for (; e > 0; t *= 10, e--) {
							}
							for (; e < 0; t /= 10, e++) {
							}
							return Math.round(v * t) / t;
						},
						_isInt : function(str) {
							var g = this, p = this.options;
							var strP = p.isNegative ? /^-?\d+$/ : /^\d+$/;
							if (!strP.test(str))
								return false;
							if (parseFloat(str) != str)
								return false;
							return true;
						},
						_isFloat : function(str) {
							var g = this, p = this.options;
							var strP = p.isNegative ? /^-?\d+(\.\d+)?$/
									: /^\d+(\.\d+)?$/;
							if (!strP.test(str))
								return false;
							if (parseFloat(str) != str)
								return false;
							return true;
						},
						_isTime : function(str) {
							var g = this, p = this.options;
							var a = str.match(/^(\d{1,2}):(\d{1,2})$/);
							if (a == null)
								return false;
							if (a[1] > 24 || a[2] > 60)
								return false;
							return true;

						},
						_isVerify : function(str) {
							var g = this, p = this.options;
							if (p.type == 'float') {
								if (!g._isFloat(str))
									return false;
								var value = parseFloat(str);
								if (p.minValue != undefined
										&& p.minValue > value)
									return false;
								if (p.maxValue != undefined
										&& p.maxValue < value)
									return false;
								return true;
							} else if (p.type == 'int') {
								if (!g._isInt(str))
									return false;
								var value = parseInt(str);
								if (p.minValue != undefined
										&& p.minValue > value)
									return false;
								if (p.maxValue != undefined
										&& p.maxValue < value)
									return false;
								return true;
							} else if (p.type == 'time') {
								return g._isTime(str);
							}
							return false;
						},
						_getVerifyValue : function(value) {
							var g = this, p = this.options;
							var newvalue = null;
							if (p.type == 'float') {
								newvalue = g._round(value, p.decimalplace);
							} else if (p.type == 'int') {
								newvalue = parseInt(value);
							} else if (p.type == 'time') {
								newvalue = value;
							}
							if (!g._isVerify(newvalue)) {
								return g.value;
							} else {
								return newvalue;
							}
						},
						_isOverValue : function(value) {
							var g = this, p = this.options;
							if (p.minValue != null && p.minValue > value)
								return true;
							if (p.maxValue != null && p.maxValue < value)
								return true;
							return false;
						},
						_getDefaultValue : function() {
							var g = this, p = this.options;
							if (p.type == 'float' || p.type == 'int') {
								return 0;
							} else if (p.type == 'time') {
								return "00:00";
							}
						},
						_addValue : function(num) {
							var g = this, p = this.options;
							var value = g.inputText.val();
							value = parseFloat(value) + num;
							if (g._isOverValue(value))
								return;
							g._showValue(value);
							g.inputText.trigger("change");
						},
						_addTime : function(minute) {
							var g = this, p = this.options;
							var value = g.inputText.val();
							var a = value.match(/^(\d{1,2}):(\d{1,2})$/);
							newminute = parseInt(a[2]) + minute;
							if (newminute < 10)
								newminute = "0" + newminute;
							value = a[1] + ":" + newminute;
							if (g._isOverValue(value))
								return;
							g._showValue(value);
							g.inputText.trigger("change");
						},
						_uping : function() {
							var g = this, p = this.options;
							if (p.type == 'float' || p.type == 'int') {
								g._addValue(p.step);
							} else if (p.type == 'time') {
								g._addTime(p.step);
							}
						},
						_downing : function() {
							var g = this, p = this.options;
							if (p.type == 'float' || p.type == 'int') {
								g._addValue(-1 * p.step);
							} else if (p.type == 'time') {
								g._addTime(-1 * p.step);
							}
						},
						_isDateTime : function(dateStr) {
							var g = this, p = this.options;
							var r = dateStr
									.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
							if (r == null)
								return false;
							var d = new Date(r[1], r[3] - 1, r[4]);
							if (d == "NaN")
								return false;
							return (d.getFullYear() == r[1]
									&& (d.getMonth() + 1) == r[3] && d
									.getDate() == r[4]);
						},
						_isLongDateTime : function(dateStr) {
							var g = this, p = this.options;
							var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2})$/;
							var r = dateStr.match(reg);
							if (r == null)
								return false;
							var d = new Date(r[1], r[3] - 1, r[4], r[5], r[6]);
							if (d == "NaN")
								return false;
							return (d.getFullYear() == r[1]
									&& (d.getMonth() + 1) == r[3]
									&& d.getDate() == r[4]
									&& d.getHours() == r[5] && d.getMinutes() == r[6]);
						}
					});

})(jQuery);
(function($) {

	$.fn.jqueryTab = function(options) {
		return $.jqueryui.run.call(this, "jqueryTab", arguments);
	};

	$.fn.jqueryGetTabManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetTabManager", arguments);
	};

	$.jqueryDefaults.Tab = {
		height : null,
		heightDiff : 0,
		changeHeightOnResize : false,
		contextmenu : true,
		dblClickToClose : false,
		dragToMove : false,
		showSwitch : false,
		showSwitchInTab : false,
		onBeforeOverrideTabItem : null,
		onAfterOverrideTabItem : null,
		onBeforeRemoveTabItem : null,
		onAfterRemoveTabItem : null,
		onBeforeAddTabItem : null,
		onAfterAddTabItem : null,
		onBeforeSelectTabItem : null,
		onAfterSelectTabItem : null,
		onCloseOther : null,
		onCloseAll : null,
		onClose : null,
		onReload : null
	};
	$.jqueryDefaults.TabString = {
		closeMessage : "Close",
		closeOtherMessage : "Close others",
		closeAllMessage : "Close all",
		reloadMessage : "Refresh"
	};

	$.jqueryMethos.Tab = {};

	$.jqueryui.controls.Tab = function(element, options) {
		$.jqueryui.controls.Tab.base.constructor.call(this, element, options);
	};
	$.jqueryui.controls.Tab
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						__getType : function() {
							return 'Tab';
						},
						__idPrev : function() {
							return 'Tab';
						},
						_extendMethods : function() {
							return $.jqueryMethos.Tab;
						},
						_render : function() {
							var g = this, p = this.options;
							if (p.height)
								g.makeFullHeight = true;
							g.tab = $(this.element);
							g.tab.addClass("l-tab");
							if (p.contextmenu && $.jqueryMenu) {
								g.tab.menu = $.jqueryMenu({
									width : 100,
									items : [
											{
												text : p.closeMessage,
												id : 'close',
												click : function() {
													g._menuItemClick.apply(g,
															arguments);
												}
											},
											{
												text : p.closeOtherMessage,
												id : 'closeother',
												click : function() {
													g._menuItemClick.apply(g,
															arguments);
												}
											},
											{
												text : p.closeAllMessage,
												id : 'closeall',
												click : function() {
													g._menuItemClick.apply(g,
															arguments);
												}
											},
											{
												text : p.reloadMessage,
												id : 'reload',
												click : function() {
													g._menuItemClick.apply(g,
															arguments);
												}
											} ]
								});
							}
							g.tab.content = $('<div class="l-tab-content"></div>');
							$("> div", g.tab).appendTo(g.tab.content);
							g.tab.content.appendTo(g.tab);
							g.tab.links = $('<div class="l-tab-links"><ul style="left: 0px; "></ul><div class="l-tab-switch"></div></div>');
							g.tab.links.prependTo(g.tab);
							g.tab.links.ul = $("ul", g.tab.links);
							var lselecteds = $("> div[lselected=true]",
									g.tab.content);
							var haslselected = lselecteds.length > 0;
							g.selectedTabId = lselecteds.attr("tabid");
							$("> div", g.tab.content)
									.each(
											function(i, box) {
												var li = $('<li class=""><a></a><div class="l-tab-links-item-left"></div><div class="l-tab-links-item-right"></div></li>');
												var contentitem = $(this);
												if (contentitem.attr("title")) {
													$("> a", li)
															.html(
																	contentitem
																			.attr("title"));
													contentitem.attr("title",
															"");
												}
												var tabid = contentitem
														.attr("tabid");
												if (tabid == undefined) {
													tabid = g.getNewTabid();
													contentitem.attr("tabid",
															tabid);
													if (contentitem
															.attr("lselected")) {
														g.selectedTabId = tabid;
													}
												}
												li.attr("tabid", tabid);
												if (!haslselected && i == 0)
													g.selectedTabId = tabid;
												var showClose = contentitem
														.attr("showClose");
												if (showClose) {
													li
															.append("<div class='l-tab-links-item-close'></div>");
												}
												$("> ul", g.tab.links).append(
														li);
												if (!contentitem
														.hasClass("l-tab-content-item"))
													contentitem
															.addClass("l-tab-content-item");
												if (contentitem.find("iframe").length > 0) {
													var iframe = $(
															"iframe:first",
															contentitem);
													if (iframe[0].readyState != "complete") {
														if (contentitem
																.find(".l-tab-loading:first").length == 0)
															contentitem
																	.prepend("<div class='l-tab-loading' style='display:block;'></div>");
														var iframeloading = $(
																".l-tab-loading:first",
																contentitem);
														iframe
																.bind(
																		'load.tab',
																		function() {
																			iframeloading
																					.hide();
																		});
													}
												}
											});

							g.selectTabItem(g.selectedTabId);

							if (p.height) {
								if (typeof (p.height) == 'string'
										&& p.height.indexOf('%') > 0) {
									g.onResize();
									if (p.changeHeightOnResize) {
										$(window).resize(function() {
											g.onResize.call(g);
										});
									}
								} else {
									g.setHeight(p.height);
								}
							}
							if (g.makeFullHeight)
								g.setContentHeight();

							$("li", g.tab.links).each(function() {
								g._addTabItemEvent($(this));
							});
							g.tab
									.bind(
											'dblclick.tab',
											function(e) {
												if (!p.dblClickToClose)
													return;
												g.dblclicking = true;
												var obj = (e.target || e.srcElement);
												var tagName = obj.tagName
														.toLowerCase();
												if (tagName == "a") {
													var tabid = $(obj).parent()
															.attr("tabid");
													var allowClose = $(obj)
															.parent()
															.find(
																	"div.l-tab-links-item-close").length ? true
															: false;
													if (allowClose) {
														g.removeTabItem(tabid);
													}
												}
												g.dblclicking = false;
											});

							g.set(p);
						},
						_setShowSwitch : function(value) {
							var g = this, p = this.options;
							if (value) {
								if (!$(".l-tab-switch", g.tab.links).length) {
									$("<div class='l-tab-switch'></div>")
											.appendTo(g.tab.links);
								}
								$(g.tab).addClass("l-tab-switchable");
								$(".l-tab-switch", g.tab).click(function() {
									g.toggleSwitch(this);
								});
							} else {
								$(g.tab).removeClass("l-tab-switchable");
								$("body > .l-tab-windowsswitch").remove();
							}
						},
						_setShowSwitchInTab : function(value) {
							var g = this, p = this.options;
							if (p.showSwitch && value) {
								$(g.tab).removeClass("l-tab-switchable");
								$(".l-tab-switch", g.tab).remove();
								var tabitem = $("<li class='l-tab-itemswitch'><a></a><div class='l-tab-links-item-left'></div><div class='l-tab-links-item-right'></div></li>");
								tabitem.appendTo(g.tab.links.ul);
								tabitem.click(function() {
									g.toggleSwitch(this);
								});
							} else {
								$(".l-tab-itemswitch", g.tab.ul).remove();
							}
						},
						toggleSwitch : function(btn) {
							var g = this, p = this.options;
							if ($("body > .l-tab-windowsswitch").length) {
								$("body > .l-tab-windowsswitch").remove();
								return;
							}
							if (btn == null)
								return;
							var windowsswitch = $(
									"<div class='l-tab-windowsswitch'></div>")
									.appendTo('body');
							var tabItems = g.tab.links.ul.find('>li');
							var selectedTabItemID = g.getSelectedTabItemID();
							tabItems
									.each(function(i, item) {
										var jlink = $("<a href='javascript:void(0)'></a>");
										jlink.text($(item).find("a").text());
										var tabid = $(item).attr("tabid");
										if (tabid == null)
											return;
										if (tabid == selectedTabItemID) {
											jlink.addClass("selected");
										}
										jlink.attr("tabid", tabid);
										windowsswitch.append(jlink);
									});
							windowsswitch.css({
								top : $(btn).offset().top + $(btn).height(),
								left : $(btn).offset().left
										- windowsswitch.width()
							});
							windowsswitch.bind("click", function(e) {
								var obj = (e.target || e.srcElement);
								if (obj.tagName.toLowerCase() == "a") {
									var tabid = $(obj).attr("tabid");
									g.selectTabItem(tabid);
									g.moveToTabItem(tabid);
									$("body > .l-tab-windowsswitch").remove();
									return;
								}
							});
						},
						_applyDrag : function(tabItemDom) {
							var g = this, p = this.options;
							g.droptip = g.droptip
									|| $(
											"<div class='l-tab-drag-droptip' style='display:none'><div class='l-drop-move-up'></div><div class='l-drop-move-down'></div></div>")
											.appendTo('body');
							var drag = $(tabItemDom)
									.jqueryDrag(
											{
												revert : true,
												animate : false,
												proxy : function() {
													var name = $(this)
															.find("a").html();
													g.dragproxy = $(
															"<div class='l-tab-drag-proxy' style='display:none'><div class='l-drop-icon l-drop-no'></div></div>")
															.appendTo('body');
													g.dragproxy.append(name);
													return g.dragproxy;
												},
												onRendered : function() {
													this.set('cursor',
															'pointer');
												},
												onStartDrag : function(current,
														e) {
													if (!$(tabItemDom)
															.hasClass(
																	"l-selected"))
														return false;
													if (e.button == 2)
														return false;
													var obj = e.srcElement
															|| e.target;
													if ($(obj)
															.hasClass(
																	"l-tab-links-item-close"))
														return false;
												},
												onDrag : function(current, e) {
													if (g.dropIn == null)
														g.dropIn = -1;
													var tabItems = g.tab.links.ul
															.find('>li');
													var targetIndex = tabItems
															.index(current.target);
													tabItems
															.each(function(i,
																	item) {
																if (targetIndex == i) {
																	return;
																}
																var isAfter = i > targetIndex;
																if (g.dropIn != -1
																		&& g.dropIn != i)
																	return;
																var offset = $(
																		this)
																		.offset();
																var range = {
																	top : offset.top,
																	bottom : offset.top
																			+ $(
																					this)
																					.height(),
																	left : offset.left - 10,
																	right : offset.left + 10
																};
																if (isAfter) {
																	range.left += $(
																			this)
																			.width();
																	range.right += $(
																			this)
																			.width();
																}
																var pageX = e.pageX
																		|| e.screenX;
																var pageY = e.pageY
																		|| e.screenY;
																if (pageX > range.left
																		&& pageX < range.right
																		&& pageY > range.top
																		&& pageY < range.bottom) {
																	g.droptip
																			.css(
																					{
																						left : range.left + 5,
																						top : range.top - 9
																					})
																			.show();
																	g.dropIn = i;
																	g.dragproxy
																			.find(
																					".l-drop-icon")
																			.removeClass(
																					"l-drop-no")
																			.addClass(
																					"l-drop-yes");
																} else {
																	g.dropIn = -1;
																	g.droptip
																			.hide();
																	g.dragproxy
																			.find(
																					".l-drop-icon")
																			.removeClass(
																					"l-drop-yes")
																			.addClass(
																					"l-drop-no");
																}
															});
												},
												onStopDrag : function(current,
														e) {
													if (g.dropIn > -1) {
														var to = g.tab.links.ul
																.find(
																		'>li:eq('
																				+ g.dropIn
																				+ ')')
																.attr("tabid");
														var from = $(
																current.target)
																.attr("tabid");
														setTimeout(function() {
															g.moveTabItem(from,
																	to);
														}, 0);
														g.dropIn = -1;
														g.dragproxy.remove();
													}
													g.droptip.hide();
													this.set('cursor',
															'default');
												}
											});
							return drag;
						},
						_setDragToMove : function(value) {
							if (!$.fn.jqueryDrag)
								return;
							var g = this, p = this.options;
							if (value) {
								if (g.drags)
									return;
								g.drags = g.drags || [];
								g.tab.links.ul.find('>li').each(function() {
									g.drags.push(g._applyDrag(this));
								});
							}
						},
						moveTabItem : function(fromTabItemID, toTabItemID) {
							var g = this;
							var from = g.tab.links.ul.find(">li[tabid="
									+ fromTabItemID + "]");
							var to = g.tab.links.ul.find(">li[tabid="
									+ toTabItemID + "]");
							var index1 = g.tab.links.ul.find(">li").index(from);
							var index2 = g.tab.links.ul.find(">li").index(to);
							if (index1 < index2) {
								to.after(from);
							} else {
								to.before(from);
							}
						},

						setTabButton : function() {
							var g = this, p = this.options;
							var sumwidth = 0;
							$("li", g.tab.links.ul).each(function() {
								sumwidth += $(this).width() + 2;
							});
							var mainwidth = g.tab.width();
							if (sumwidth > mainwidth) {
								if (!$(".l-tab-links-left", g.tab).length) {
									g.tab.links
											.append('<div class="l-tab-links-left"><span></span></div><div class="l-tab-links-right"><span></span></div>');
									g.setTabButtonEven();
								}
								return true;
							} else {
								g.tab.links.ul.animate({
									left : 0
								});
								$(".l-tab-links-left,.l-tab-links-right",
										g.tab.links).remove();
								return false;
							}
						},

						setTabButtonEven : function() {
							var g = this, p = this.options;
							$(".l-tab-links-left", g.tab.links).hover(
									function() {
										$(this).addClass(
												"l-tab-links-left-over");
									},
									function() {
										$(this).removeClass(
												"l-tab-links-left-over");
									}).click(function() {
								g.moveToPrevTabItem();
							});
							$(".l-tab-links-right", g.tab.links).hover(
									function() {
										$(this).addClass(
												"l-tab-links-right-over");
									},
									function() {
										$(this).removeClass(
												"l-tab-links-right-over");
									}).click(function() {
								g.moveToNextTabItem();
							});
						},

						moveToPrevTabItem : function(tabid) {
							var g = this, p = this.options;
							var tabItems = $("> li", g.tab.links.ul), nextBtn = $(
									".l-tab-links-right", g.tab), prevBtn = $(
									".l-tab-links-left", g.tab);
							if (!nextBtn.length || !prevBtn.length)
								return false;
							var nextBtnOffset = nextBtn.offset(), prevBtnOffset = prevBtn
									.offset();

							var moveToTabItem = null, currentWidth = 0;
							var prevBtnLeft = prevBtnOffset.left
									+ prevBtn.outerWidth();
							for (var i = 0, l = tabItems.length; i < l; i++) {
								var tabitem = $(tabItems[i]);
								var offset = tabitem.offset();
								var start = offset.left, end = offset.left
										+ tabitem.outerWidth();
								if (tabid != null) {
									if (start < prevBtnLeft
											&& tabitem.attr("tabid") == tabid) {
										moveToTabItem = tabitem;
										break;
									}
								} else if (start < prevBtnLeft
										&& end >= prevBtnLeft) {
									moveToTabItem = tabitem;
									break;
								}
								currentWidth += tabitem.outerWidth()
										+ parseInt(tabitem.css("marginLeft"))
										+ parseInt(tabitem.css("marginRight"));
							}
							if (moveToTabItem == null)
								return false;

							var left = currentWidth - prevBtn.outerWidth();
							g.tab.links.ul.animate({
								left : -1 * left
							});
							return true;
						},

						moveToNextTabItem : function(tabid) {
							var g = this, p = this.options;
							var tabItems = $("> li", g.tab.links.ul), nextBtn = $(
									".l-tab-links-right", g.tab), prevBtn = $(
									".l-tab-links-left", g.tab);
							if (!nextBtn.length || !prevBtn.length)
								return false;
							var nextBtnOffset = nextBtn.offset(), prevBtnOffset = prevBtn
									.offset();

							var moveToTabItem = null, currentWidth = 0;
							for (var i = 0, l = tabItems.length; i < l; i++) {
								var tabitem = $(tabItems[i]);
								currentWidth += tabitem.outerWidth()
										+ parseInt(tabitem.css("marginLeft"))
										+ parseInt(tabitem.css("marginRight"));
								var offset = tabitem.offset();
								var start = offset.left, end = offset.left
										+ tabitem.outerWidth();
								if (tabid != null) {
									if (end > nextBtnOffset.left
											&& tabitem.attr("tabid") == tabid) {
										moveToTabItem = tabitem;
										break;
									}
								} else if (start <= nextBtnOffset.left
										&& end > nextBtnOffset.left) {
									moveToTabItem = tabitem;
									break;
								}
							}
							if (moveToTabItem == null)
								return false;

							var left = currentWidth
									- (nextBtnOffset.left - prevBtnOffset.left)
									+ parseInt(moveToTabItem.css("marginLeft"))
									+ parseInt(moveToTabItem.css("marginRight"));
							g.tab.links.ul.animate({
								left : -1 * left
							});
							return true;
						},

						moveToTabItem : function(tabid) {
							var g = this, p = this.options;
							if (!g.moveToPrevTabItem(tabid)) {
								g.moveToNextTabItem(tabid);
							}
						},
						getTabItemCount : function() {
							var g = this, p = this.options;
							return $("li", g.tab.links.ul).length;
						},
						getSelectedTabItemID : function() {
							var g = this, p = this.options;
							return $("li.l-selected", g.tab.links.ul).attr(
									"tabid");
						},
						removeSelectedTabItem : function() {
							var g = this, p = this.options;
							g.removeTabItem(g.getSelectedTabItemID());
						},

						overrideSelectedTabItem : function(options) {
							var g = this, p = this.options;
							g
									.overrideTabItem(g.getSelectedTabItemID(),
											options);
						},

						overrideTabItem : function(targettabid, options) {
							var g = this, p = this.options;
							if (g.trigger('beforeOverrideTabItem',
									[ targettabid ]) == false)
								return false;
							var tabid = options.tabid;
							if (tabid == undefined)
								tabid = g.getNewTabid();
							var url = options.url;
							var content = options.content;
							var target = options.target;
							var text = options.text;
							var showClose = options.showClose;
							var height = options.height;

							if (g.isTabItemExist(tabid)) {
								return;
							}
							var tabitem = $("li[tabid=" + targettabid + "]",
									g.tab.links.ul);
							var contentitem = $(".l-tab-content-item[tabid="
									+ targettabid + "]", g.tab.content);
							if (!tabitem || !contentitem)
								return;
							tabitem.attr("tabid", tabid);
							contentitem.attr("tabid", tabid);
							if ($("iframe", contentitem).length == 0 && url) {
								contentitem
										.html("<iframe frameborder='0'></iframe>");
							} else if (content) {
								contentitem.html(content);
							}
							$("iframe", contentitem).attr("name", tabid);
							if (showClose == undefined)
								showClose = true;
							if (showClose == false)
								$(".l-tab-links-item-close", tabitem).remove();
							else {
								if ($(".l-tab-links-item-close", tabitem).length == 0)
									tabitem
											.append("<div class='l-tab-links-item-close'></div>");
							}
							if (text == undefined)
								text = tabid;
							if (height)
								contentitem.height(height);
							$("a", tabitem).text(text);
							$("iframe", contentitem).attr("src", url);

							g.trigger('afterOverrideTabItem', [ targettabid ]);
						},

						setHeader : function(tabid, header) {
							$("li[tabid=" + tabid + "] a", this.tab.links.ul)
									.text(header);
						},

						selectTabItem : function(tabid) {
							var g = this, p = this.options;
							if (g.trigger('beforeSelectTabItem', [ tabid ]) == false)
								return false;
							g.selectedTabId = tabid;
							$("> .l-tab-content-item[tabid=" + tabid + "]",
									g.tab.content).show().siblings().hide();
							$("li[tabid=" + tabid + "]", g.tab.links.ul)
									.addClass("l-selected").siblings()
									.removeClass("l-selected");
							g.trigger('afterSelectTabItem', [ tabid ]);
						},

						moveToLastTabItem : function() {
							var g = this, p = this.options;
							var sumwidth = 0;
							$("li", g.tab.links.ul).each(function() {
								sumwidth += $(this).width() + 2;
							});
							var mainwidth = g.tab.width();
							if (sumwidth > mainwidth) {
								var btnWitdth = $(".l-tab-links-right",
										g.tab.links).width();
								g.tab.links.ul
										.animate({
											left : -1
													* (sumwidth - mainwidth
															+ btnWitdth + 2)
										});
							}
						},

						isTabItemExist : function(tabid) {
							var g = this, p = this.options;
							return $("li[tabid=" + tabid + "]", g.tab.links.ul).length > 0;
						},

						addTabItem : function(options) {
							var g = this, p = this.options;
							if (g.trigger('beforeAddTabItem', [ options ]) == false)
								return false;
							var tabid = options.tabid;
							if (tabid == undefined)
								tabid = g.getNewTabid();
							var url = options.url, content = options.content, text = options.text, showClose = options.showClose, height = options.height;

							if (g.isTabItemExist(tabid)) {
								g.selectTabItem(tabid);
								return;
							}
							var tabitem = $("<li><a></a><div class='l-tab-links-item-left'></div><div class='l-tab-links-item-right'></div><div class='l-tab-links-item-close'></div></li>");
							var contentitem = $("<div class='l-tab-content-item'><div class='l-tab-loading' style='display:block;'></div><iframe frameborder='0'></iframe></div>");
							var iframeloading = $("div:first", contentitem);
							var iframe = $("iframe:first", contentitem);
							if (g.makeFullHeight) {
								var newheight = g.tab.height()
										- g.tab.links.height();
								contentitem.height(newheight);
							}
							tabitem.attr("tabid", tabid);
							contentitem.attr("tabid", tabid);
							if (url) {
								iframe[0].tab = g;
								iframe.attr("name", tabid).attr("id", tabid)
										.attr("src", url).bind('load.tab',
												function() {
													iframeloading.hide();
													if (options.callback)
														options.callback();
												});
							} else {
								iframe.remove();
								iframeloading.remove();
							}
							if (content) {
								contentitem.html(content);
								if (options.callback)
									options.callback();
							} else if (options.target) {
								contentitem.append(options.target);
								if (options.callback)
									options.callback();
							}
							if (showClose == undefined)
								showClose = true;
							if (showClose == false)
								$(".l-tab-links-item-close", tabitem).remove();
							if (text == undefined)
								text = tabid;
							if (height)
								contentitem.height(height);
							$("a", tabitem).text(text);
							if ($(".l-tab-itemswitch", g.tab.links.ul).length) {
								tabitem.insertBefore($(".l-tab-itemswitch",
										g.tab.links.ul));
							} else {
								g.tab.links.ul.append(tabitem);
							}
							g.tab.content.append(contentitem);
							g.selectTabItem(tabid);
							if (g.setTabButton()) {
								g.moveToTabItem(tabid);
							}

							g._addTabItemEvent(tabitem);
							if (p.dragToMove && $.fn.jqueryDrag) {
								g.drags = g.drags || [];
								tabitem.each(function() {
									g.drags.push(g._applyDrag(this));
								});
							}
							g.toggleSwitch();
							g.trigger('afterAddTabItem', [ options ]);
						},
						_addTabItemEvent : function(tabitem) {
							var g = this, p = this.options;
							tabitem.click(function() {
								var tabid = $(this).attr("tabid");
								g.selectTabItem(tabid);
							});

							g.tab.menu && g._addTabItemContextMenuEven(tabitem);
							$(".l-tab-links-item-close", tabitem).hover(
									function() {
										$(this).addClass(
												"l-tab-links-item-close-over");
									},
									function() {
										$(this).removeClass(
												"l-tab-links-item-close-over");
									}).click(function() {
								var tabid = $(this).parent().attr("tabid");
								g.removeTabItem(tabid);
							});

						},

						removeTabItem : function(tabid) {
							var g = this, p = this.options;
							if (g.trigger('beforeRemoveTabItem', [ tabid ]) == false)
								return false;
							var currentIsSelected = $(
									"li[tabid=" + tabid + "]", g.tab.links.ul)
									.hasClass("l-selected");
							if (currentIsSelected) {
								$(".l-tab-content-item[tabid=" + tabid + "]",
										g.tab.content).prev().show();
								$("li[tabid=" + tabid + "]", g.tab.links.ul)
										.prev().addClass("l-selected")
										.siblings().removeClass("l-selected");
							}
							var contentItem = $(".l-tab-content-item[tabid="
									+ tabid + "]", g.tab.content);
							var jframe = $('iframe', contentItem);
							if (jframe.length) {
								var frame = jframe[0];
								frame.src = "about:blank";
								try {
									frame.contentWindow.document.write('');
								} catch (e) {
								}
								$.browser.msie && CollectGarbage();
								jframe.remove();
							}
							contentItem.remove();
							$("li[tabid=" + tabid + "]", g.tab.links.ul)
									.remove();
							g.setTabButton();
							g.trigger('afterRemoveTabItem', [ tabid ]);
						},
						addHeight : function(heightDiff) {
							var g = this, p = this.options;
							var newHeight = g.tab.height() + heightDiff;
							g.setHeight(newHeight);
						},
						setHeight : function(height) {
							var g = this, p = this.options;
							g.tab.height(height);
							g.setContentHeight();
						},
						setContentHeight : function() {
							var g = this, p = this.options;
							var newheight = g.tab.height()
									- g.tab.links.height();
							g.tab.content.height(newheight);
							$("> .l-tab-content-item", g.tab.content).height(
									newheight);
						},
						getNewTabid : function() {
							var g = this, p = this.options;
							g.getnewidcount = g.getnewidcount || 0;
							return 'tabitem' + (++g.getnewidcount);
						},

						getTabidList : function(notabid, noclose) {
							var g = this, p = this.options;
							var tabidlist = [];
							$("> li", g.tab.links.ul)
									.each(
											function() {
												if ($(this).attr("tabid")
														&& $(this)
																.attr("tabid") != notabid
														&& (!noclose || $(
																".l-tab-links-item-close",
																this).length > 0)) {
													tabidlist.push($(this)
															.attr("tabid"));
												}
											});
							return tabidlist;
						},
						removeOther : function(tabid, compel) {
							var g = this, p = this.options;
							var tabidlist = g.getTabidList(tabid, true);
							$(tabidlist).each(function() {
								g.removeTabItem(this);
							});
						},
						reload : function(tabid) {
							var g = this, p = this.options;
							var contentitem = $(".l-tab-content-item[tabid="
									+ tabid + "]");
							var iframeloading = $(".l-tab-loading:first",
									contentitem);
							var iframe = $("iframe:first", contentitem);
							var url = $(iframe).attr("src");
							iframeloading.show();
							iframe.attr("src", url).unbind('load.tab').bind(
									'load.tab', function() {
										iframeloading.hide();
									});
						},
						removeAll : function(compel) {
							var g = this, p = this.options;
							var tabidlist = g.getTabidList(null, true);
							$(tabidlist).each(function() {
								g.removeTabItem(this);
							});
						},
						onResize : function() {
							var g = this, p = this.options;
							if (!p.height || typeof (p.height) != 'string'
									|| p.height.indexOf('%') == -1)
								return false;

							if (g.tab.parent()[0].tagName.toLowerCase() == "body") {
								var windowHeight = $(window).height();
								windowHeight -= parseInt(g.tab.parent().css(
										'paddingTop'));
								windowHeight -= parseInt(g.tab.parent().css(
										'paddingBottom'));
								g.height = p.heightDiff + windowHeight
										* parseFloat(g.height) * 0.01;
							} else {
								g.height = p.heightDiff
										+ (g.tab.parent().height()
												* parseFloat(p.height) * 0.01);
							}
							g.tab.height(g.height);
							g.setContentHeight();
						},
						_menuItemClick : function(item) {
							var g = this, p = this.options;
							if (!item.id || !g.actionTabid)
								return;
							switch (item.id) {
							case "close":
								if (g.trigger('close') == false)
									return;
								g.removeTabItem(g.actionTabid);
								g.actionTabid = null;
								break;
							case "closeother":
								if (g.trigger('closeother') == false)
									return;
								g.removeOther(g.actionTabid);
								break;
							case "closeall":
								if (g.trigger('closeall') == false)
									return;
								g.removeAll();
								g.actionTabid = null;
								break;
							case "reload":
								if (g.trigger('reload', [ {
									tabid : g.actionTabid
								} ]) == false)
									return;
								g.selectTabItem(g.actionTabid);
								g.reload(g.actionTabid);
								break;
							}
						},
						_addTabItemContextMenuEven : function(tabitem) {
							var g = this, p = this.options;
							tabitem
									.bind(
											"contextmenu",
											function(e) {
												if (!g.tab.menu)
													return;
												g.actionTabid = tabitem
														.attr("tabid");
												g.tab.menu.show({
													top : e.pageY,
													left : e.pageX
												});
												if ($(
														".l-tab-links-item-close",
														this).length == 0) {
													g.tab.menu
															.setDisabled('close');
												} else {
													g.tab.menu
															.setEnabled('close');
												}
												return false;
											});
						}
					});

})(jQuery);
(function($) {
	$.fn.jqueryTextBox = function() {
		return $.jqueryui.run.call(this, "jqueryTextBox", arguments);
	};

	$.fn.jqueryGetTextBoxManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetTextBoxManager", arguments);
	};

	$.jqueryDefaults.TextBox = {
		onChangeValue : null,
		onMouseOver : null,
		onMouseOut : null,
		onBlur : null,
		onFocus : null,
		width : null,
		disabled : false,
		value : null,
		nullText : null,
		digits : false,
		number : false,
		currency : false,
		readonly : false
	};

	$.jqueryui.controls.TextBox = function(element, options) {
		$.jqueryui.controls.TextBox.base.constructor.call(this, element,
				options);
	};

	$.jqueryui.controls.TextBox
			.jqueryExtend(
					$.jqueryui.controls.Input,
					{
						__getType : function() {
							return 'TextBox'
						},
						__idPrev : function() {
							return 'TextBox';
						},
						_init : function() {
							$.jqueryui.controls.TextBox.base._init.call(this);
							var g = this, p = this.options;
							if (!p.width) {
								p.width = $(g.element).width();
							}
							if ($(this.element).attr("readonly")) {
								p.readonly = true;
							} else if (p.readonly) {
								$(this.element).attr("readonly", true);
							}
						},
						_render : function() {
							var g = this, p = this.options;
							g.inputText = $(this.element);

							g.wrapper = g.inputText.wrap(
									'<div class="l-text"></div>').parent();
							g.wrapper
									.append('<div class="l-text-l"></div><div class="l-text-r"></div>');
							if (!g.inputText.hasClass("l-text-field"))
								g.inputText.addClass("l-text-field");
							this._setEvent();
							if (p.digits || p.number || p.currency) {
								g.inputText.addClass("l-text-field-number");
							}
							g.set(p);
							g.checkValue();
						},
						destroy : function() {
							var g = this;
							if (g.wrapper) {
								g.wrapper.remove();
							}
							g.options = null;
							jquery.remove(this);
						},
						_getValue : function() {
							return this.inputText.val();
						},
						_setNullText : function() {
							this.checkNotNull();
						},
						checkValue : function() {
							var g = this, p = this.options;
							var v = g.inputText.val() || "";
							if (p.currency)
								v = v.replace(/\$|\,/g, '');
							var isFloat = p.number || p.currency, isDigits = p.digits;
							if (v != ""
									&& isFloat
									&& !/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/
											.test(v) || isDigits
									&& !/^\d+$/.test(v)) {
								if (g.value != null) {

									g.inputText.val(g.value);
								} else {
									g.inputText.val('');
								}
								p.currency
										&& g.inputText
												.val(currencyFormatter(g.value));
								return;
							}
							g.value = v;
							p.currency
									&& g.inputText
											.val(currencyFormatter(g.value));
						},
						checkNotNull : function() {
							var g = this, p = this.options;
							if (p.nullText && !p.disabled) {
								if (!g.inputText.val()) {
									g.inputText.addClass("l-text-field-null")
											.val(p.nullText);
								}
							}
						},
						_setEvent : function() {
							var g = this, p = this.options;
							g.inputText.bind('blur.textBox', function() {
								g.trigger('blur');
								g.checkNotNull();
								g.checkValue();
								g.wrapper.removeClass("l-text-focus");
							}).bind(
									'focus.textBox',
									function() {
										g.trigger('focus');
										if (p.nullText) {
											if ($(this).hasClass(
													"l-text-field-null")) {
												$(this).removeClass(
														"l-text-field-null")
														.val("");
											}
										}
										g.wrapper.addClass("l-text-focus");
									}).change(function() {
								g.trigger('changeValue', [ this.value ]);
							});
							g.wrapper.hover(function() {
								g.trigger('mouseOver');
								g.wrapper.addClass("l-text-over");
							}, function() {
								g.trigger('mouseOut');
								g.wrapper.removeClass("l-text-over");
							});
						},
						_setDisabled : function(value) {
							var g = this, p = this.options;
							if (value) {
								this.inputText.attr("readonly", "readonly");
								this.wrapper.addClass("l-text-disabled");
							} else if (!p.readonly) {
								this.inputText.removeAttr("readonly");
								this.wrapper.removeClass('l-text-disabled');
							}
						},
						_setWidth : function(value) {
							if (value > 20) {
								this.wrapper.css({
									width : value
								});
								this.inputText.css({
									width : value - 4
								});
							}
						},
						_setHeight : function(value) {
							if (value > 10) {
								this.wrapper.height(value);
								this.inputText.height(value - 2);
							}
						},
						_setValue : function(value) {
							if (value != null)
								this.inputText.val(value);
						},
						_setLabel : function(value) {
							var g = this, p = this.options;
							if (!g.labelwrapper) {
								g.labelwrapper = g.wrapper.wrap(
										'<div class="l-labeltext"></div>')
										.parent();
								var lable = $('<div class="l-text-label" style="float:left;">'
										+ value + ':&nbsp</div>');
								g.labelwrapper.prepend(lable);
								g.wrapper.css('float', 'left');
								if (!p.labelWidth) {
									p.labelWidth = lable.width();
								} else {
									g._setLabelWidth(p.labelWidth);
								}
								lable.height(g.wrapper.height());
								if (p.labelAlign) {
									g._setLabelAlign(p.labelAlign);
								}
								g.labelwrapper
										.append('<br style="clear:both;" />');
								g.labelwrapper
										.width(p.labelWidth + p.width + 2);
							} else {
								g.labelwrapper.find(".l-text-label").html(
										value + ':&nbsp');
							}
						},
						_setLabelWidth : function(value) {
							var g = this, p = this.options;
							if (!g.labelwrapper)
								return;
							g.labelwrapper.find(".l-text-label").width(value);
						},
						_setLabelAlign : function(value) {
							var g = this, p = this.options;
							if (!g.labelwrapper)
								return;
							g.labelwrapper.find(".l-text-label").css(
									'text-align', value);
						},
						updateStyle : function() {
							var g = this, p = this.options;
							if (g.inputText.attr('readonly')) {
								g.wrapper.addClass("l-text-readonly");
								p.disabled = true;
							} else {
								g.wrapper.removeClass("l-text-readonly");
								p.disabled = false;
							}
							if (g.inputText.attr('disabled')) {
								g.wrapper.addClass("l-text-disabled");
								p.disabled = true;
							} else {
								g.wrapper.removeClass("l-text-disabled");
								p.disabled = false;
							}
							if (g.inputText.hasClass("l-text-field-null")
									&& g.inputText.val() != p.nullText) {
								g.inputText.removeClass("l-text-field-null");
							}
							g.checkValue();
						},
						setValue : function(value) {
							this._setValue(value);
							this.trigger('changeValue', [ value ]);
						}
					});

	function currencyFormatter(num) {
		if (!num)
			return "0.00";
		num = num.toString().replace(/\$|\,/g, '');
		if (isNaN(num))
			num = "0.00";
		sign = (num == (num = Math.abs(num)));
		num = Math.floor(num * 100 + 0.50000000001);
		cents = num % 100;
		num = Math.floor(num / 100).toString();
		if (cents < 10)
			cents = "0" + cents;
		for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
			num = num.substring(0, num.length - (4 * i + 3)) + ','
					+ num.substring(num.length - (4 * i + 3));
		return "" + (((sign) ? '' : '-') + '' + num + '.' + cents);
	}

})(jQuery);

(function($) {

	$.jqueryTip = function(p) {
		return $.jqueryui.run.call(null, "jqueryTip", arguments);
	};

	$.fn.jqueryTip = function(options) {
		this.each(function() {
			var p = $.extend({}, $.jqueryDefaults.ElementTip, options || {});
			p.target = p.target || this;

			if (p.auto || options == undefined) {
				if (!p.content) {
					p.content = this.title;
					if (p.removeTitle)
						$(this).removeAttr("title");
				}
				p.content = p.content || this.title;
				$(this).bind(
						'mouseover.tip',
						function() {
							p.x = $(this).offset().left + $(this).width()
									+ (p.distanceX || 0);
							p.y = $(this).offset().top + (p.distanceY || 0);
							$.jqueryTip(p);
						}).bind('mouseout.tip', function() {

					var tipmanager = $.jqueryui.managers[this.jqueryuitipid];
					if (tipmanager) {
						tipmanager.remove();
					}
				});
			} else {
				if (p.target.jqueryuitipid)
					return;
				p.x = $(this).offset().left + $(this).width()
						+ (p.distanceX || 0);
				p.y = $(this).offset().top + (p.distanceY || 0);
				p.x = p.x || 0;
				p.y = p.y || 0;
				$.jqueryTip(p);
			}
		});
		return $.jqueryui.get(this, 'jqueryuitipid');
	};

	$.fn.jqueryHideTip = function(options) {
		return this.each(
				function() {
					var p = options || {};
					if (p.isLabel == undefined) {

						p.isLabel = this.tagName.toLowerCase() == "label"
								&& $(this).attr("for") != null;
					}
					var target = this;
					if (p.isLabel) {
						var forele = $("#" + $(this).attr("for"));
						if (forele.length == 0)
							return;
						target = forele[0];
					}
					var tipmanager = $.jqueryui.managers[target.jqueryuitipid];
					if (tipmanager) {
						tipmanager.remove();
					}
				}).unbind('mouseover.tip').unbind('mouseout.tip');
	};

	$.fn.jqueryGetTipManager = function() {
		return $.jqueryui.get(this);
	};

	$.jqueryDefaults = $.jqueryDefaults || {};

	$.jqueryDefaults.HideTip = {};

	$.jqueryDefaults.Tip = {
		content : null,
		callback : null,
		width : 150,
		height : null,
		x : 0,
		y : 0,
		appendIdTo : null,
		target : null,
		auto : null,
		removeTitle : true
	};

	$.jqueryDefaults.ElementTip = {
		distanceX : 1,
		distanceY : -3,
		auto : null,
		removeTitle : true
	};

	$.jqueryMethos.Tip = {};

	$.jqueryui.controls.Tip = function(options) {
		$.jqueryui.controls.Tip.base.constructor.call(this, null, options);
	};
	$.jqueryui.controls.Tip
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						__getType : function() {
							return 'Tip';
						},
						__idPrev : function() {
							return 'Tip';
						},
						_extendMethods : function() {
							return $.jqueryMethos.Tip;
						},
						_render : function() {
							var g = this, p = this.options;
							var tip = $('<div class="l-verify-tip"><div class="l-verify-tip-corner"></div><div class="l-verify-tip-content"></div></div>');
							g.tip = tip;
							g.tip.attr("id", g.id);
							if (p.content) {
								$("> .l-verify-tip-content:first", tip).html(
										p.content);
								tip.appendTo('body');
							} else {
								return;
							}
							tip.css({
								left : p.x,
								top : p.y
							}).show();
							p.width
									&& $("> .l-verify-tip-content:first", tip)
											.width(p.width - 8);
							p.height
									&& $("> .l-verify-tip-content:first", tip)
											.width(p.height);
							eee = p.appendIdTo;
							if (p.appendIdTo) {
								p.appendIdTo.attr("jqueryTipId", g.id);
							}
							if (p.target) {
								$(p.target).attr("jqueryTipId", g.id);
								p.target.jqueryuitipid = g.id;
							}
							p.callback && p.callback(tip);
							g.set(p);
						},
						_setContent : function(content) {
							$("> .l-verify-tip-content:first", this.tip).html(
									content);
						},
						remove : function() {
							if (this.options.appendIdTo) {
								this.options.appendIdTo
										.removeAttr("jqueryTipId");
							}
							if (this.options.target) {
								$(this.options.target)
										.removeAttr("jqueryTipId");
								this.options.target.jqueryuitipid = null;
							}
							this.tip.remove();
						}
					});
})(jQuery);

(function($) {

	$.fn.jqueryToolBar = function(options) {
		return $.jqueryui.run.call(this, "jqueryToolBar", arguments);
	};

	$.fn.jqueryGetToolBarManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetToolBarManager", arguments);
	};

	$.jqueryDefaults.ToolBar = {};

	$.jqueryMethos.ToolBar = {};

	$.jqueryui.controls.ToolBar = function(element, options) {
		$.jqueryui.controls.ToolBar.base.constructor.call(this, element,
				options);
	};
	$.jqueryui.controls.ToolBar
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						__getType : function() {
							return 'ToolBar';
						},
						__idPrev : function() {
							return 'ToolBar';
						},
						_extendMethods : function() {
							return $.jqueryMethos.ToolBar;
						},
						_render : function() {
							var g = this, p = this.options;
							g.toolbarItemCount = 0;
							g.toolBar = $(this.element);
							g.toolBar.addClass("l-toolbar");
							g.set(p);
						},
						_setItems : function(items) {
							var g = this;
							g.toolBar.html("");
							$(items).each(function(i, item) {
								g.addItem(item);
							});
						},
						removeItem : function(itemid) {
							var g = this, p = this.options;
							$("> .l-toolbar-item[toolbarid=" + itemid + "]",
									g.toolBar).remove();
						},
						setEnabled : function(itemid) {
							var g = this, p = this.options;
							$("> .l-toolbar-item[toolbarid=" + itemid + "]",
									g.toolBar).removeClass(
									"l-toolbar-item-disable");
						},
						setDisabled : function(itemid) {
							var g = this, p = this.options;
							$("> .l-toolbar-item[toolbarid=" + itemid + "]",
									g.toolBar).addClass(
									"l-toolbar-item-disable");
						},
						isEnable : function(itemid) {
							var g = this, p = this.options;
							return !$(
									"> .l-toolbar-item[toolbarid=" + itemid
											+ "]", g.toolBar).hasClass(
									"l-toolbar-item-disable");
						},
						addItem : function(item) {
							var g = this, p = this.options;
							if (item.line || item.type == "line") {
								g.toolBar
										.append('<div class="l-bar-separator"></div>');
								return;
							}
							if (item.type == "text") {
								g.toolBar
										.append('<div class="l-toolbar-item l-toolbar-text"><span>'
												+ item.text
												|| ""
												+ '</span></div>');
								return;
							}
							var ditem = $('<div class="l-toolbar-item l-panel-btn"><span></span><div class="l-panel-btn-l"></div><div class="l-panel-btn-r"></div></div>');
							g.toolBar.append(ditem);
							if (!item.id)
								item.id = 'item-' + (++g.toolbarItemCount);
							ditem.attr("toolbarid", item.id);
							if (item.img) {
								ditem.append("<img src='" + item.img + "' />");
								ditem.addClass("l-toolbar-item-hasicon");
							} else if (item.icon) {
								ditem.append("<div class='l-icon l-icon-"
										+ item.icon + "'></div>");
								ditem.addClass("l-toolbar-item-hasicon");
							} else if (item.color) {
								ditem
										.append("<div class='l-toolbar-item-color' style='background:"
												+ item.color + "'></div>");
								ditem.addClass("l-toolbar-item-hasicon");
							}
							item.text && $("span:first", ditem).html(item.text);
							item.disable
									&& ditem.addClass("l-toolbar-item-disable");
							item.click && ditem.click(function() {
								if ($(this).hasClass("l-toolbar-item-disable"))
									return;
								item.click(item);
							});
							if (item.menu) {
								item.menu = $.jqueryMenu(item.menu);
								ditem.hover(function() {
									if ($(this).hasClass(
											"l-toolbar-item-disable"))
										return;
									g.actionMenu && g.actionMenu.hide();
									var left = $(this).offset().left;
									var top = $(this).offset().top
											+ $(this).height();
									item.menu.show({
										top : top,
										left : left
									});
									g.actionMenu = item.menu;
									$(this).addClass("l-panel-btn-over");
								}, function() {
									if ($(this).hasClass(
											"l-toolbar-item-disable"))
										return;
									$(this).removeClass("l-panel-btn-over");
								});
							} else {
								ditem.hover(function() {
									if ($(this).hasClass(
											"l-toolbar-item-disable"))
										return;
									$(this).addClass("l-panel-btn-over");
								}, function() {
									if ($(this).hasClass(
											"l-toolbar-item-disable"))
										return;
									$(this).removeClass("l-panel-btn-over");
								});
							}
						}
					});

	$.jqueryui.controls.ToolBar.prototype.setEnable = $.jqueryui.controls.ToolBar.prototype.setEnabled;
	$.jqueryui.controls.ToolBar.prototype.setDisable = $.jqueryui.controls.ToolBar.prototype.setDisabled;
})(jQuery);

(function($) {
	$.fn.jqueryTree = function(options) {
		return $.jqueryui.run.call(this, "jqueryTree", arguments);
	};

	$.fn.jqueryGetTreeManager = function() {
		return $.jqueryui.run.call(this, "jqueryGetTreeManager", arguments);
	};

	$.jqueryDefaults.Tree = {
		url : null,
		data : null,
		checkbox : true,
		autoCheckboxEven : true,
		parentIcon : 'folder',
		childIcon : 'leaf',
		textFieldName : 'text',
		attribute : [ 'id', 'url' ],
		treeLine : true,
		nodeWidth : 90,
		statusName : '__status',
		isLeaf : null,
		single : false,
		needCancel : true,
		onBeforeExpand : function() {
		},
		onContextmenu : function() {
		},
		onExpand : function() {
		},
		onBeforeCollapse : function() {
		},
		onCollapse : function() {
		},
		onBeforeSelect : function() {
		},
		onSelect : function() {
		},
		onBeforeCancelSelect : function() {
		},
		onCancelselect : function() {
		},
		onCheck : function() {
		},
		onSuccess : function() {
		},
		onError : function() {
		},
		onClick : function() {
		},
		idFieldName : 'id',
		parentIDFieldName : null,
		topParentIDValue : 0,
		onBeforeAppend : function() {
		},
		onAppend : function() {
		},
		onAfterAppend : function() {
		},
		slide : true,
		iconFieldName : 'icon',
		nodeDraggable : false,
		nodeDraggingRender : null,
		btnClickToToggleOnly : true,
		ajaxType : 'post',
		render : null,
		selectable : null,
		isExpand : null,
		delay : null
	};

	$.jqueryui.controls.Tree = function(element, options) {
		$.jqueryui.controls.Tree.base.constructor.call(this, element, options);
	};

	$.jqueryui.controls.Tree
			.jqueryExtend(
					$.jqueryui.core.UIComponent,
					{
						_init : function() {
							$.jqueryui.controls.Tree.base._init.call(this);
							var g = this, p = this.options;
							if (p.single)
								p.autoCheckboxEven = false;
						},
						_render : function() {
							var g = this, p = this.options;
							g.set(p, true);
							g.tree = $(g.element);
							g.tree.addClass('l-tree');
							g.toggleNodeCallbacks = [];
							g.sysAttribute = [ 'isexpand', 'ischecked', 'href',
									'style', 'delay' ];
							g.loading = $("<div class='l-tree-loading'></div>");
							g.tree.after(g.loading);
							g.data = [];
							g.maxOutlineLevel = 1;
							g.treedataindex = 0;
							g._applyTree();
							g._setTreeEven();
							g.set(p, false);
						},
						_setTreeLine : function(value) {
							if (value)
								this.tree.removeClass("l-tree-noline");
							else
								this.tree.addClass("l-tree-noline");
						},
						_setParms : function() {
							var g = this, p = this.options;
							if ($.isFunction(p.parms))
								p.parms = p.parms();
						},
						reload : function(callback) {
							var g = this, p = this.options;
							g.clear();
							g.loadData(null, p.url, null, {
								success : callback
							});
						},
						_setUrl : function(url) {
							var g = this, p = this.options;
							if (url) {
								g.clear();
								g.loadData(null, url);
							}
						},
						_setData : function(data) {
							if (data) {
								this.clear();
								this.append(null, data);
							}
						},
						setData : function(data) {
							this.set('data', data);
						},
						getData : function() {
							return this.data;
						},

						hasChildren : function(treenodedata) {
							if (this.options.isLeaf)
								return !this.options.isLeaf(treenodedata);
							return treenodedata.children ? true : false;
						},

						getParent : function(treenode, level) {
							var g = this;
							treenode = g.getNodeDom(treenode);
							var parentTreeNode = g.getParentTreeItem(treenode,
									level);
							if (!parentTreeNode)
								return null;
							var parentIndex = $(parentTreeNode).attr(
									"treedataindex");
							return g._getDataNodeByTreeDataIndex(parentIndex);
						},

						getParentTreeItem : function(treenode, level) {
							var g = this;
							treenode = g.getNodeDom(treenode);
							var treeitem = $(treenode);
							if (treeitem.parent().hasClass("l-tree"))
								return null;
							if (level == undefined) {
								if (treeitem.parent().parent("li").length == 0)
									return null;
								return treeitem.parent().parent("li")[0];
							}
							var currentLevel = parseInt(treeitem
									.attr("outlinelevel"));
							var currenttreeitem = treeitem;
							for (var i = currentLevel - 1; i >= level; i--) {
								currenttreeitem = currenttreeitem.parent()
										.parent("li");
							}
							return currenttreeitem[0];
						},
						getChecked : function() {
							var g = this, p = this.options;
							if (!this.options.checkbox)
								return null;
							var nodes = [];
							$(".l-checkbox-checked", g.tree)
									.parent()
									.parent("li")
									.each(
											function() {
												var treedataindex = parseInt($(
														this).attr(
														"treedataindex"));
												nodes
														.push({
															target : this,
															data : g
																	._getDataNodeByTreeDataIndex(
																			g.data,
																			treedataindex)
														});
											});
							return nodes;
						},

						refreshTree : function() {
							var g = this, p = this.options;
							$.each(this.getChecked(), function(k, v) {
								g._setParentCheckboxStatus($(v.target));
							});
						},
						getSelected : function() {
							var g = this, p = this.options;
							var node = {};
							node.target = $(".l-selected", g.tree).parent("li")[0];
							if (node.target) {
								var treedataindex = parseInt($(node.target)
										.attr("treedataindex"));
								node.data = g._getDataNodeByTreeDataIndex(
										g.data, treedataindex);
								return node;
							}
							return null;
						},

						upgrade : function(treeNode) {
							var g = this, p = this.options;
							$(".l-note", treeNode).each(
									function() {
										$(this).removeClass("l-note").addClass(
												"l-expandable-open");
									});
							$(".l-note-last", treeNode).each(
									function() {
										$(this).removeClass("l-note-last")
												.addClass("l-expandable-open");
									});
							$("." + g._getChildNodeClassName(), treeNode)
									.each(
											function() {
												$(this)
														.removeClass(
																g
																		._getChildNodeClassName())
														.addClass(
																g
																		._getParentNodeClassName(true));
											});
						},

						demotion : function(treeNode) {
							var g = this, p = this.options;
							if (!treeNode
									&& treeNode[0].tagName.toLowerCase() != 'li')
								return;
							var islast = $(treeNode).hasClass("l-last");
							$(".l-expandable-open", treeNode).each(
									function() {
										$(this)
												.removeClass(
														"l-expandable-open")
												.addClass(
														islast ? "l-note-last"
																: "l-note");
									});
							$(".l-expandable-close", treeNode).each(
									function() {
										$(this).removeClass(
												"l-expandable-close").addClass(
												islast ? "l-note-last"
														: "l-note");
									});
							$("." + g._getParentNodeClassName(true), treeNode)
									.each(
											function() {
												$(this)
														.removeClass(
																g
																		._getParentNodeClassName(true))
														.addClass(
																g
																		._getChildNodeClassName());
											});
						},
						collapseAll : function() {
							var g = this, p = this.options;
							$(".l-expandable-open", g.tree).click();
						},
						expandAll : function() {
							var g = this, p = this.options;
							$(".l-expandable-close", g.tree).click();
						},
						loadData : function(node, url, param, e) {
							var g = this, p = this.options;
							e = $.extend({
								showLoading : function() {
									g.loading.show();
								},
								success : function() {
								},
								error : function() {
								},
								hideLoading : function() {
									g.loading.hide();
								}
							}, e || {});
							var ajaxtype = p.ajaxType;

							param = $.extend(($.isFunction(p.parms) ? p.parms()
									: p.parms), param);

							$.ajax({
								type : ajaxtype,
								url : url,
								data : param,
								dataType : 'json',
								beforeSend : function() {
									e.showLoading();
								},
								success : function(data) {
									if (!data)
										return;
									e.hideLoading();
									g.append(node, data);
									g.trigger('success', [ data ]);
									e.success(data);
								},
								error : function(XMLHttpRequest, textStatus,
										errorThrown) {
									try {
										e.hideLoading();
										g.trigger('error', [ XMLHttpRequest,
												textStatus, errorThrown ]);
										e.error(XMLHttpRequest, textStatus,
												errorThrown);
									} catch (e) {

									}
								}
							});
						},

						clear : function() {
							var g = this, p = this.options;
							g.toggleNodeCallbacks = [];
							g.data = null;
							g.data = [];
							g.nodes = null;
							g.tree.html("");
						},

						getNodeDom : function(nodeParm) {
							var g = this, p = this.options;
							if (nodeParm == null)
								return nodeParm;
							if (typeof (nodeParm) == "string"
									|| typeof (nodeParm) == "number") {
								return $("li[treedataindex=" + nodeParm + "]",
										g.tree).get(0);
							} else if (typeof (nodeParm) == "object"
									&& 'treedataindex' in nodeParm) {
								return g.getNodeDom(nodeParm['treedataindex']);
							}
							return nodeParm;
						},
						hide : function(treeNode) {
							var g = this, p = this.options;
							treeNode = g.getNodeDom(treeNode);
							if (treeNode)
								$(treeNode).hide();
						},
						show : function(treeNode) {
							var g = this, p = this.options;
							treeNode = g.getNodeDom(treeNode);
							if (treeNode)
								$(treeNode).show();
						},

						remove : function(treeNode) {
							var g = this, p = this.options;
							treeNode = g.getNodeDom(treeNode);
							var treedataindex = parseInt($(treeNode).attr(
									"treedataindex"));
							var treenodedata = g._getDataNodeByTreeDataIndex(
									g.data, treedataindex);
							if (treenodedata)
								g
										._setTreeDataStatus([ treenodedata ],
												'delete');
							var parentNode = g.getParentTreeItem(treeNode);

							if (p.checkbox) {
								g._setParentCheckboxStatus($(treeNode));
							}
							$(treeNode).remove();
							g._updateStyle(parentNode ? $("ul:first",
									parentNode) : g.tree);
						},
						_updateStyle : function(ul) {
							var g = this, p = this.options;
							var itmes = $(" > li", ul);
							var treeitemlength = itmes.length;
							if (!treeitemlength)
								return;

							itmes
									.each(function(i, item) {
										if (i == 0
												&& !$(this).hasClass("l-first"))
											$(this).addClass("l-first");
										if (i == treeitemlength - 1
												&& !$(this).hasClass("l-last"))
											$(this).addClass("l-last");
										if (i == 0 && i == treeitemlength - 1)
											$(this).addClass("l-onlychild");
										$("> div .l-note,> div .l-note-last",
												this)
												.removeClass(
														"l-note l-note-last")
												.addClass(
														i == treeitemlength - 1 ? "l-note-last"
																: "l-note");
										g._setTreeItem(this, {
											isLast : i == treeitemlength - 1
										});
									});
						},

						update : function(domnode, newnodedata) {
							var g = this, p = this.options;
							domnode = g.getNodeDom(domnode);
							var treedataindex = parseInt($(domnode).attr(
									"treedataindex"));
							nodedata = g._getDataNodeByTreeDataIndex(g.data,
									treedataindex);
							for ( var attr in newnodedata) {
								nodedata[attr] = newnodedata[attr];
								if (attr == p.textFieldName) {
									$("> .l-body > span", domnode).text(
											newnodedata[attr]);
								}
							}
						},

						append : function(parentNode, newdata, nearNode,
								isAfter) {
							var g = this, p = this.options;
							parentNode = g.getNodeDom(parentNode);
							if (g.trigger('beforeAppend',
									[ parentNode, newdata ]) == false)
								return false;
							if (!newdata || !newdata.length)
								return false;
							if (p.idFieldName && p.parentIDFieldName)
								newdata = g.arrayToTree(newdata, p.idFieldName,
										p.parentIDFieldName);
							g._addTreeDataIndexToData(newdata);
							g._setTreeDataStatus(newdata, 'add');
							if (nearNode != null) {
								nearNode = g.getNodeDom(nearNode);
							}
							g.trigger('append', [ parentNode, newdata ])
							g._appendData(parentNode, newdata);
							if (parentNode == null) {
								var gridhtmlarr = g._getTreeHTMLByData(newdata,
										1, [], true);
								gridhtmlarr[gridhtmlarr.length - 1] = gridhtmlarr[0] = "";
								if (nearNode != null) {
									$(nearNode)[isAfter ? 'after' : 'before']
											(gridhtmlarr.join(''));
									g._updateStyle(parentNode ? $("ul:first",
											parentNode) : g.tree);
								} else {

									if ($("> li:last", g.tree).length > 0)
										g._setTreeItem(
												$("> li:last", g.tree)[0], {
													isLast : false
												});
									g.tree.append(gridhtmlarr.join(''));
								}
								$(".l-body", g.tree).hover(function() {
									$(this).addClass("l-over");
								}, function() {
									$(this).removeClass("l-over");
								});
								g._upadteTreeWidth();
								g.trigger('afterAppend',
										[ parentNode, newdata ])
								return;
							}
							var treeitem = $(parentNode);
							var outlineLevel = parseInt(treeitem
									.attr("outlinelevel"));

							var hasChildren = $("> ul", treeitem).length > 0;
							if (!hasChildren) {
								treeitem.append("<ul class='l-children'></ul>");

								g.upgrade(parentNode);
							}
							var isLast = [];
							for (var i = 1; i <= outlineLevel - 1; i++) {
								var currentParentTreeItem = $(g
										.getParentTreeItem(parentNode, i));
								isLast.push(currentParentTreeItem
										.hasClass("l-last"));
							}
							isLast.push(treeitem.hasClass("l-last"));
							var gridhtmlarr = g._getTreeHTMLByData(newdata,
									outlineLevel + 1, isLast, true);
							gridhtmlarr[gridhtmlarr.length - 1] = gridhtmlarr[0] = "";
							if (nearNode != null) {
								$(nearNode)[isAfter ? 'after' : 'before']
										(gridhtmlarr.join(''));
								g._updateStyle(parentNode ? $("ul:first",
										parentNode) : g.tree);
							} else {

								if ($("> .l-children > li:last", treeitem).length > 0)
									g._setTreeItem($("> .l-children > li:last",
											treeitem)[0], {
										isLast : false
									});
								$(">.l-children", parentNode).append(
										gridhtmlarr.join(''));
							}
							g._upadteTreeWidth();
							$(">.l-children .l-body", parentNode).hover(
									function() {
										$(this).addClass("l-over");
									}, function() {
										$(this).removeClass("l-over");
									});
							g.trigger('afterAppend', [ parentNode, newdata ]);
						},

						cancelSelect : function(nodeParm) {
							var g = this, p = this.options;
							var domNode = g.getNodeDom(nodeParm);
							var treeitem = $(domNode);
							var treedataindex = parseInt(treeitem
									.attr("treedataindex"));
							var treenodedata = g._getDataNodeByTreeDataIndex(
									g.data, treedataindex);
							var treeitembody = $(">div:first", treeitem);
							if (p.checkbox)
								$(".l-checkbox", treeitembody).removeClass(
										"l-checkbox-checked").addClass(
										"l-checkbox-unchecked");
							else
								treeitembody.removeClass("l-selected");
							g.trigger('cancelSelect', [ {
								data : treenodedata,
								target : treeitem[0]
							} ]);
						},

						selectNode : function(selectNodeParm) {
							var g = this, p = this.options;
							var clause = null;
							if (typeof (selectNodeParm) == "function") {
								clause = selectNodeParm;
							} else if (typeof (selectNodeParm) == "object") {
								var treeitem = $(selectNodeParm);
								var treedataindex = parseInt(treeitem
										.attr("treedataindex"));
								var treenodedata = g
										._getDataNodeByTreeDataIndex(g.data,
												treedataindex);
								var treeitembody = $(">div:first", treeitem);
								if (!treeitembody.length) {
									treeitembody = $("li[treedataindex="
											+ treedataindex + "] >div:first",
											g.tree);
								}
								if (p.checkbox) {
									$(".l-checkbox", treeitembody).removeClass(
											"l-checkbox-unchecked").addClass(
											"l-checkbox-checked");
								} else {
									$("div.l-selected", g.tree).removeClass(
											"l-selected");
									treeitembody.addClass("l-selected");
								}
								g.trigger('select', [ {
									data : treenodedata,
									target : treeitembody.parent().get(0)
								} ]);
								return;
							} else {
								clause = function(data) {
									if (!data[p.idFieldName])
										return false;
									return strTrim(data[p.idFieldName]
											.toString()) == strTrim(selectNodeParm
											.toString());
								};
							}
							$("li", g.tree)
									.each(
											function() {
												var treeitem = $(this);
												var treedataindex = parseInt(treeitem
														.attr("treedataindex"));
												var treenodedata = g
														._getDataNodeByTreeDataIndex(
																g.data,
																treedataindex);
												if (clause(treenodedata,
														treedataindex)) {
													g.selectNode(this);
												} else {

													if (!g.options.checkbox) {
														g.cancelSelect(this);
													}
												}
											});
						},
						getTextByID : function(id) {
							var g = this, p = this.options;
							var data = g.getDataByID(id);
							if (!data)
								return null;
							return data[p.textFieldName];
						},
						getDataByID : function(id) {
							var g = this, p = this.options;
							var data = null;
							$("li", g.tree).each(
									function() {
										if (data)
											return;
										var treeitem = $(this);
										var treedataindex = parseInt(treeitem
												.attr("treedataindex"));
										var treenodedata = g
												._getDataNodeByTreeDataIndex(
														g.data, treedataindex);
										if (treenodedata[p.idFieldName]
												.toString() == id.toString()) {
											data = treenodedata;
										}
									});
							return data;
						},
						arrayToTree : function(data, id, pid) {
							if (!data || !data.length)
								return [];
							var targetData = [];
							var records = {};
							var itemLength = data.length;
							for (var i = 0; i < itemLength; i++) {
								var o = data[i];
								records[o[id]] = o;
							}
							for (var i = 0; i < itemLength; i++) {
								var currentData = data[i];
								var parentData = records[currentData[pid]];
								if (!parentData) {
									targetData.push(currentData);
									continue;
								}
								parentData.children = parentData.children || [];
								parentData.children.push(currentData);
							}
							return targetData;
						},

						_getDataNodeByTreeDataIndex : function(data,
								treedataindex) {
							var g = this, p = this.options;
							for (var i = 0; i < data.length; i++) {
								if (data[i].treedataindex == treedataindex)
									return data[i];
								if (data[i].children) {
									var targetData = g
											._getDataNodeByTreeDataIndex(
													data[i].children,
													treedataindex);
									if (targetData)
										return targetData;
								}
							}
							return null;
						},

						_setTreeDataStatus : function(data, status) {
							var g = this, p = this.options;
							$(data).each(
									function() {
										this[p.statusName] = status;
										if (this.children) {
											g._setTreeDataStatus(this.children,
													status);
										}
									});
						},

						_addTreeDataIndexToData : function(data) {
							var g = this, p = this.options;
							$(data).each(function() {
								if (this.treedataindex != undefined)
									return;
								this.treedataindex = g.treedataindex++;
								if (this.children) {
									g._addTreeDataIndexToData(this.children);
								}
							});
						},
						_addToNodes : function(data) {
							var g = this, p = this.options;
							g.nodes = g.nodes || [];
							g.nodes.push(data);
							if (!data.children)
								return;
							$(data.children).each(function(i, item) {
								g._addToNodes(item);
							});
						},

						_appendData : function(treeNode, data) {
							var g = this, p = this.options;
							var treedataindex = parseInt($(treeNode).attr(
									"treedataindex"));
							var treenodedata = g._getDataNodeByTreeDataIndex(
									g.data, treedataindex);
							if (g.treedataindex == undefined)
								g.treedataindex = 0;
							if (treenodedata
									&& treenodedata.children == undefined)
								treenodedata.children = [];
							$(data)
									.each(
											function(i, item) {
												if (treenodedata)
													treenodedata.children[treenodedata.children.length] = item;
												else
													g.data[g.data.length] = item;
												g._addToNodes(item);
											});
						},
						_setTreeItem : function(treeNode, options) {
							var g = this, p = this.options;
							if (!options)
								return;
							treeNode = g.getNodeDom(treeNode);
							var treeItem = $(treeNode);
							var outlineLevel = parseInt(treeItem
									.attr("outlinelevel"));
							if (options.isLast != undefined) {
								if (options.isLast == true) {
									treeItem.removeClass("l-last").addClass(
											"l-last");
									$("> div .l-note", treeItem).removeClass(
											"l-note").addClass("l-note-last");
									$(".l-children li", treeItem).find(
											".l-box:eq(" + (outlineLevel - 1)
													+ ")")
											.removeClass("l-line");
								} else if (options.isLast == false) {
									treeItem.removeClass("l-last");
									$("> div .l-note-last", treeItem)
											.removeClass("l-note-last")
											.addClass("l-note");

									$(".l-children li", treeItem).find(
											".l-box:eq(" + (outlineLevel - 1)
													+ ")")
											.removeClass("l-line").addClass(
													"l-line");
								}
							}
						},
						_upadteTreeWidth : function() {
							var g = this, p = this.options;
							var treeWidth = g.maxOutlineLevel * 22;
							if (p.checkbox)
								treeWidth += 22;
							if (p.parentIcon || p.childIcon)
								treeWidth += 22;
							treeWidth += p.nodeWidth;
							g.tree.width(treeWidth);
						},
						_getChildNodeClassName : function() {
							var g = this, p = this.options;
							return 'l-tree-icon-' + p.childIcon;
						},
						_getParentNodeClassName : function(isOpen) {
							var g = this, p = this.options;
							var nodeclassname = 'l-tree-icon-' + p.parentIcon;
							if (isOpen)
								nodeclassname += '-open';
							return nodeclassname;
						},

						_isExpand : function(o, level) {
							var g = this, p = this.options;
							var isExpand = o.isExpand != null ? o.isExpand
									: (o.isexpand != null ? o.isexpand
											: p.isExpand);
							if (isExpand == null)
								return true;
							if (typeof (isExpand) == "function")
								isExpand = p.isExpand({
									data : o,
									level : level
								});
							if (typeof (isExpand) == "boolean")
								return isExpand;
							if (typeof (isExpand) == "string")
								return isExpand == "true";
							if (typeof (isExpand) == "number")
								return isExpand > level;
							return true;
						},

						_getDelay : function(o, level) {
							var g = this, p = this.options;
							var delay = o.delay != null ? o.delay : p.delay;
							if (delay == null)
								return false;
							if (typeof (delay) == "function")
								delay = delay({
									data : o,
									level : level
								});
							if (typeof (delay) == "boolean")
								return delay;
							if (typeof (delay) == "string")
								return {
									url : delay
								};
							if (typeof (delay) == "number")
								delay = [ delay ];
							if ($.isArray(delay))
								return $.inArray(level, delay) != -1;
							if (typeof (delay) == "object" && delay.url)
								return delay;
							return false;
						},

						_getTreeHTMLByData : function(data, outlineLevel,
								isLast, isExpand) {
							var g = this, p = this.options;
							if (g.maxOutlineLevel < outlineLevel)
								g.maxOutlineLevel = outlineLevel;
							isLast = isLast || [];
							outlineLevel = outlineLevel || 1;
							var treehtmlarr = [];
							if (!isExpand)
								treehtmlarr
										.push('<ul class="l-children" style="display:none">');
							else
								treehtmlarr.push("<ul class='l-children'>");
							for (var i = 0; i < data.length; i++) {
								var o = data[i];
								var isFirst = i == 0;
								var isLastCurrent = i == data.length - 1;
								var delay = g._getDelay(o, outlineLevel);
								var isExpandCurrent = delay ? false : g
										._isExpand(o, outlineLevel);

								treehtmlarr.push('<li ');
								if (o.treedataindex != undefined)
									treehtmlarr.push('treedataindex="'
											+ o.treedataindex + '" ');
								if (isExpandCurrent)
									treehtmlarr.push('isexpand=' + o.isexpand
											+ ' ');
								treehtmlarr.push('outlinelevel=' + outlineLevel
										+ ' ');

								for (var j = 0; j < g.sysAttribute.length; j++) {
									if ($(this).attr(g.sysAttribute[j]))
										data[dataindex][g.sysAttribute[j]] = $(
												this).attr(g.sysAttribute[j]);
								}
								for (var j = 0; j < p.attribute.length; j++) {
									if (o[p.attribute[j]])
										treehtmlarr.push(p.attribute[j] + '="'
												+ o[p.attribute[j]] + '" ');
								}

								treehtmlarr.push('class="');
								isFirst && treehtmlarr.push('l-first ');
								isLastCurrent && treehtmlarr.push('l-last ');
								isFirst && isLastCurrent
										&& treehtmlarr.push('l-onlychild ');
								treehtmlarr.push('"');
								treehtmlarr.push('>');
								treehtmlarr.push('<div class="l-body');
								if (p.selectable && p.selectable(o) == false) {
									treehtmlarr.push(' l-unselectable');
								}
								treehtmlarr.push('">');
								for (var k = 0; k <= outlineLevel - 2; k++) {
									if (isLast[k])
										treehtmlarr
												.push('<div class="l-box"></div>');
									else
										treehtmlarr
												.push('<div class="l-box l-line"></div>');
								}
								if (g.hasChildren(o)) {
									if (isExpandCurrent)
										treehtmlarr
												.push('<div class="l-box l-expandable-open"></div>');
									else
										treehtmlarr
												.push('<div class="l-box l-expandable-close"></div>');
									if (p.checkbox) {
										if (o.ischecked)
											treehtmlarr
													.push('<div class="l-box l-checkbox l-checkbox-checked"></div>');
										else
											treehtmlarr
													.push('<div class="l-box l-checkbox l-checkbox-unchecked"></div>');
									}
									if (p.parentIcon) {

										treehtmlarr
												.push('<div class="l-box l-tree-icon ');
										treehtmlarr
												.push(g
														._getParentNodeClassName(isExpandCurrent ? true
																: false)
														+ " ");
										if (p.iconFieldName
												&& o[p.iconFieldName])
											treehtmlarr
													.push('l-tree-icon-none');
										treehtmlarr.push('">');
										if (p.iconFieldName
												&& o[p.iconFieldName])
											treehtmlarr.push('<img src="'
													+ o[p.iconFieldName]
													+ '" />');
										treehtmlarr.push('</div>');
									}
								} else {
									if (isLastCurrent)
										treehtmlarr
												.push('<div class="l-box l-note-last"></div>');
									else
										treehtmlarr
												.push('<div class="l-box l-note"></div>');
									if (p.checkbox) {
										if (o.ischecked)
											treehtmlarr
													.push('<div class="l-box l-checkbox l-checkbox-checked"></div>');
										else
											treehtmlarr
													.push('<div class="l-box l-checkbox l-checkbox-unchecked"></div>');
									}
									if (p.childIcon) {

										treehtmlarr
												.push('<div class="l-box l-tree-icon ');
										treehtmlarr.push(g
												._getChildNodeClassName()
												+ " ");
										if (p.iconFieldName
												&& o[p.iconFieldName])
											treehtmlarr
													.push('l-tree-icon-none');
										treehtmlarr.push('">');
										if (p.iconFieldName
												&& o[p.iconFieldName])
											treehtmlarr.push('<img src="'
													+ o[p.iconFieldName]
													+ '" />');
										treehtmlarr.push('</div>');
									}
								}
								if (p.render) {
									treehtmlarr.push('<span>'
											+ p.render(o, o[p.textFieldName])
											+ '</span>');
								} else {
									treehtmlarr.push('<span>'
											+ o[p.textFieldName] + '</span>');
								}
								treehtmlarr.push('</div>');
								if (g.hasChildren(o)) {
									var isLastNew = [];
									for (var k = 0; k < isLast.length; k++) {
										isLastNew.push(isLast[k]);
									}
									isLastNew.push(isLastCurrent);
									if (delay) {
										if (delay == true) {
											g.toggleNodeCallbacks
													.push({
														data : o,
														callback : function(
																dom, o) {
															var content = g
																	._getTreeHTMLByData(
																			o.children,
																			outlineLevel + 1,
																			isLastNew,
																			isExpandCurrent)
																	.join('');
															$(dom).append(
																	content);
															$(
																	">.l-children .l-body",
																	dom)
																	.hover(
																			function() {
																				$(
																						this)
																						.addClass(
																								"l-over");
																			},
																			function() {
																				$(
																						this)
																						.removeClass(
																								"l-over");
																			});
															g
																	._removeToggleNodeCallback(o);
														}
													});
										} else if (delay.url) {
											(function(o, url, parms) {
												g.toggleNodeCallbacks
														.push({
															data : o,
															callback : function(
																	dom, o) {
																g
																		.loadData(
																				dom,
																				url,
																				parms,
																				{
																					showLoading : function() {
																						$(
																								"div.l-expandable-close:first",
																								dom)
																								.addClass(
																										"l-box-loading");
																					},
																					hideLoading : function() {
																						$(
																								"div.l-box-loading:first",
																								dom)
																								.removeClass(
																										"l-box-loading");
																					}
																				});
																g
																		._removeToggleNodeCallback(o);
															}
														});
											})(o, delay.url, delay.parms);
										}
									} else {
										treehtmlarr.push(g._getTreeHTMLByData(
												o.children, outlineLevel + 1,
												isLastNew, isExpandCurrent)
												.join(''));
									}

								}
								treehtmlarr.push('</li>');
							}
							treehtmlarr.push("</ul>");
							return treehtmlarr;

						},
						_removeToggleNodeCallback : function(nodeData) {
							var g = this, p = this.options;
							for (var i = 0; i <= g.toggleNodeCallbacks.length; i++) {
								if (g.toggleNodeCallbacks[i]
										&& g.toggleNodeCallbacks[i].data == nodeData) {
									g.toggleNodeCallbacks.splice(i, 1);
									break;
								}
							}
						},

						_getDataByTreeHTML : function(treeDom) {
							var g = this, p = this.options;
							var data = [];
							$("> li", treeDom)
									.each(
											function(i, item) {
												var dataindex = data.length;
												data[dataindex] = {
													treedataindex : g.treedataindex++
												};
												data[dataindex][p.textFieldName] = $(
														"> span,> a", this)
														.html();
												for (var j = 0; j < g.sysAttribute.length; j++) {
													if ($(this).attr(
															g.sysAttribute[j]))
														data[dataindex][g.sysAttribute[j]] = $(
																this)
																.attr(
																		g.sysAttribute[j]);
												}
												for (var j = 0; j < p.attribute.length; j++) {
													if ($(this).attr(
															p.attribute[j]))
														data[dataindex][p.attribute[j]] = $(
																this).attr(
																p.attribute[j]);
												}
												if ($("> ul", this).length > 0) {
													data[dataindex].children = g
															._getDataByTreeHTML($(
																	"> ul",
																	this));
												}
											});
							return data;
						},
						_applyTree : function() {
							var g = this, p = this.options;
							g.data = g._getDataByTreeHTML(g.tree);
							var gridhtmlarr = g._getTreeHTMLByData(g.data, 1,
									[], true);
							gridhtmlarr[gridhtmlarr.length - 1] = gridhtmlarr[0] = "";
							g.tree.html(gridhtmlarr.join(''));
							g._upadteTreeWidth();
							$(".l-body", g.tree).hover(function() {
								$(this).addClass("l-over");
							}, function() {
								$(this).removeClass("l-over");
							});
						},
						_getSrcElementByEvent : function(e) {
							var g = this;
							var obj = (e.target || e.srcElement);
							var tag = obj.tagName.toLowerCase();
							var jobjs = $(obj).parents().add(obj);
							var fn = function(parm) {
								for (var i = jobjs.length - 1; i >= 0; i--) {
									if ($(jobjs[i]).hasClass(parm))
										return jobjs[i];
								}
								return null;
							};
							if (jobjs.index(this.element) == -1)
								return {
									out : true
								};
							var r = {
								tree : fn("l-tree"),
								node : fn("l-body"),
								checkbox : fn("l-checkbox"),
								icon : fn("l-tree-icon"),
								text : tag == "span"
							};
							if (r.node) {
								var treedataindex = parseInt($(r.node).parent()
										.attr("treedataindex"));
								r.data = g._getDataNodeByTreeDataIndex(g.data,
										treedataindex);
							}
							return r;
						},
						_setTreeEven : function() {
							var g = this, p = this.options;
							if (g.hasBind('contextmenu')) {
								g.tree
										.bind(
												"contextmenu",
												function(e) {
													var obj = (e.target || e.srcElement);
													var treeitem = null;
													if (obj.tagName
															.toLowerCase() == "a"
															|| obj.tagName
																	.toLowerCase() == "span"
															|| $(obj).hasClass(
																	"l-box"))
														treeitem = $(obj)
																.parent()
																.parent();
													else if ($(obj).hasClass(
															"l-body"))
														treeitem = $(obj)
																.parent();
													else if (obj.tagName
															.toLowerCase() == "li")
														treeitem = $(obj);
													if (!treeitem)
														return;
													var treedataindex = parseInt(treeitem
															.attr("treedataindex"));
													var treenodedata = g
															._getDataNodeByTreeDataIndex(
																	g.data,
																	treedataindex);
													return g
															.trigger(
																	'contextmenu',
																	[
																			{
																				data : treenodedata,
																				target : treeitem[0]
																			},
																			e ]);
												});
							}
							g.tree
									.click(function(e) {
										var obj = (e.target || e.srcElement);
										var treeitem = null;
										if (obj.tagName.toLowerCase() == "a"
												|| obj.tagName.toLowerCase() == "span"
												|| $(obj).hasClass("l-box"))
											treeitem = $(obj).parent().parent();
										else if ($(obj).hasClass("l-body"))
											treeitem = $(obj).parent();
										else
											treeitem = $(obj);
										if (!treeitem)
											return;
										var treedataindex = parseInt(treeitem
												.attr("treedataindex"));
										var treenodedata = g
												._getDataNodeByTreeDataIndex(
														g.data, treedataindex);
										var treeitembtn = $("div.l-body:first",
												treeitem)
												.find(
														"div.l-expandable-open:first,div.l-expandable-close:first");
										var clickOnTreeItemBtn = $(obj)
												.hasClass("l-expandable-open")
												|| $(obj).hasClass(
														"l-expandable-close");
										if (!$(obj).hasClass("l-checkbox")
												&& !clickOnTreeItemBtn) {
											if (!treeitem
													.hasClass("l-unselectable")) {
												if ($(">div:first", treeitem)
														.hasClass("l-selected")
														&& p.needCancel) {
													if (g
															.trigger(
																	'beforeCancelSelect',
																	[ {
																		data : treenodedata,
																		target : treeitem[0]
																	} ]) == false)
														return false;

													$(">div:first", treeitem)
															.removeClass(
																	"l-selected");
													g
															.trigger(
																	'cancelSelect',
																	[ {
																		data : treenodedata,
																		target : treeitem[0]
																	} ]);
												} else {
													if (g
															.trigger(
																	'beforeSelect',
																	[ {
																		data : treenodedata,
																		target : treeitem[0]
																	} ]) == false)
														return false;
													$(".l-body", g.tree)
															.removeClass(
																	"l-selected");
													$(">div:first", treeitem)
															.addClass(
																	"l-selected");
													g.trigger('select', [ {
														data : treenodedata,
														target : treeitem[0]
													} ])
												}
											}
										}

										if ($(obj).hasClass("l-checkbox")) {
											if (p.autoCheckboxEven) {

												if ($(obj).hasClass(
														"l-checkbox-unchecked")) {
													$(obj)
															.removeClass(
																	"l-checkbox-unchecked")
															.addClass(
																	"l-checkbox-checked");
													$(
															".l-children .l-checkbox",
															treeitem)
															.removeClass(
																	"l-checkbox-incomplete l-checkbox-unchecked")
															.addClass(
																	"l-checkbox-checked");
													g.trigger('check', [ {
														data : treenodedata,
														target : treeitem[0]
													}, true ]);
												}

												else if ($(obj).hasClass(
														"l-checkbox-checked")) {
													$(obj)
															.removeClass(
																	"l-checkbox-checked")
															.addClass(
																	"l-checkbox-unchecked");
													$(
															".l-children .l-checkbox",
															treeitem)
															.removeClass(
																	"l-checkbox-incomplete l-checkbox-checked")
															.addClass(
																	"l-checkbox-unchecked");
													g.trigger('check', [ {
														data : treenodedata,
														target : treeitem[0]
													}, false ]);
												}

												else if ($(obj)
														.hasClass(
																"l-checkbox-incomplete")) {
													$(obj)
															.removeClass(
																	"l-checkbox-incomplete")
															.addClass(
																	"l-checkbox-checked");
													$(
															".l-children .l-checkbox",
															treeitem)
															.removeClass(
																	"l-checkbox-incomplete l-checkbox-unchecked")
															.addClass(
																	"l-checkbox-checked");
													g.trigger('check', [ {
														data : treenodedata,
														target : treeitem[0]
													}, true ]);
												}
												g
														._setParentCheckboxStatus(treeitem);
											} else {

												if ($(obj).hasClass(
														"l-checkbox-unchecked")) {
													$(obj)
															.removeClass(
																	"l-checkbox-unchecked")
															.addClass(
																	"l-checkbox-checked");

													if (p.single) {
														$(".l-checkbox", g.tree)
																.not(obj)
																.removeClass(
																		"l-checkbox-checked")
																.addClass(
																		"l-checkbox-unchecked");
													}
													g.trigger('check', [ {
														data : treenodedata,
														target : treeitem[0]
													}, true ]);
												}

												else if ($(obj).hasClass(
														"l-checkbox-checked")) {
													$(obj)
															.removeClass(
																	"l-checkbox-checked")
															.addClass(
																	"l-checkbox-unchecked");
													g.trigger('check', [ {
														data : treenodedata,
														target : treeitem[0]
													}, false ]);
												}
											}
										}

										else if (treeitembtn
												.hasClass("l-expandable-open")
												&& (!p.btnClickToToggleOnly || clickOnTreeItemBtn)) {
											if (g.trigger('beforeCollapse', [ {
												data : treenodedata,
												target : treeitem[0]
											} ]) == false)
												return false;
											treeitembtn
													.removeClass(
															"l-expandable-open")
													.addClass(
															"l-expandable-close");
											if (p.slide)
												$("> .l-children", treeitem)
														.slideToggle('fast');
											else
												$("> .l-children", treeitem)
														.hide();
											$(
													"> div ."
															+ g
																	._getParentNodeClassName(true),
													treeitem)
													.removeClass(
															g
																	._getParentNodeClassName(true))
													.addClass(
															g
																	._getParentNodeClassName());
											g.trigger('collapse', [ {
												data : treenodedata,
												target : treeitem[0]
											} ]);
										}

										else if (treeitembtn
												.hasClass("l-expandable-close")
												&& (!p.btnClickToToggleOnly || clickOnTreeItemBtn)) {
											if (g.trigger('beforeExpand', [ {
												data : treenodedata,
												target : treeitem[0]
											} ]) == false)
												return false;

											$(g.toggleNodeCallbacks)
													.each(
															function() {
																if (this.data == treenodedata) {
																	this
																			.callback(
																					treeitem[0],
																					treenodedata);
																}
															});
											treeitembtn
													.removeClass(
															"l-expandable-close")
													.addClass(
															"l-expandable-open");
											var callback = function() {
												g.trigger('expand', [ {
													data : treenodedata,
													target : treeitem[0]
												} ]);
											};
											if (p.slide) {
												$("> .l-children", treeitem)
														.slideToggle('fast',
																callback);
											} else {
												$("> .l-children", treeitem)
														.show();
												callback();
											}
											$(
													"> div ."
															+ g
																	._getParentNodeClassName(),
													treeitem)
													.removeClass(
															g
																	._getParentNodeClassName())
													.addClass(
															g
																	._getParentNodeClassName(true));
										}
										g.trigger('click', [ {
											data : treenodedata,
											target : treeitem[0]
										} ]);
									});

							if ($.fn.jqueryDrag && p.nodeDraggable) {
								g.nodeDroptip = $(
										"<div class='l-drag-nodedroptip' style='display:none'></div>")
										.appendTo('body');
								g.tree
										.jqueryDrag({
											revert : true,
											animate : false,
											proxyX : 20,
											proxyY : 20,
											proxy : function(draggable, e) {
												var src = g
														._getSrcElementByEvent(e);
												if (src.node) {
													var content = "dragging";
													if (p.nodeDraggingRender) {
														content = p
																.nodeDraggingRender(
																		draggable.draggingNodes,
																		draggable,
																		g);
													} else {
														content = "";
														var appended = false;
														for ( var i in draggable.draggingNodes) {
															var node = draggable.draggingNodes[i];
															if (appended)
																content += ",";
															content += node.text;
															appended = true;
														}
													}
													var proxy = $(
															"<div class='l-drag-proxy' style='display:none'><div class='l-drop-icon l-drop-no'></div>"
																	+ content
																	+ "</div>")
															.appendTo('body');
													return proxy;
												}
											},
											onRevert : function() {
												return false;
											},
											onRendered : function() {
												this.set('cursor', 'default');
												g.children[this.id] = this;
											},
											onStartDrag : function(current, e) {
												if (e.button == 2)
													return false;
												this.set('cursor', 'default');
												var src = g
														._getSrcElementByEvent(e);
												if (src.checkbox)
													return false;
												if (p.checkbox) {
													var checked = g
															.getChecked();
													this.draggingNodes = [];
													for ( var i in checked) {
														this.draggingNodes
																.push(checked[i].data);
													}
													if (!this.draggingNodes
															|| !this.draggingNodes.length)
														return false;
												} else {
													this.draggingNodes = [ src.data ];
												}
												this.draggingNode = src.data;
												this.set('cursor', 'move');
												g.nodedragging = true;
												this.validRange = {
													top : g.tree.offset().top,
													bottom : g.tree.offset().top
															+ g.tree.height(),
													left : g.tree.offset().left,
													right : g.tree.offset().left
															+ g.tree.width()
												};
											},
											onDrag : function(current, e) {
												var nodedata = this.draggingNode;
												if (!nodedata)
													return false;
												var nodes = this.draggingNodes ? this.draggingNodes
														: [ nodedata ];
												if (g.nodeDropIn == null)
													g.nodeDropIn = -1;
												var pageX = e.pageX;
												var pageY = e.pageY;
												var visit = false;
												var validRange = this.validRange;
												if (pageX < validRange.left
														|| pageX > validRange.right
														|| pageY > validRange.bottom
														|| pageY < validRange.top) {

													g.nodeDropIn = -1;
													g.nodeDroptip.hide();
													this.proxy
															.find(
																	".l-drop-icon:first")
															.removeClass(
																	"l-drop-yes l-drop-add")
															.addClass(
																	"l-drop-no");
													return;
												}
												for (var i = 0, l = g.nodes.length; i < l; i++) {
													var nd = g.nodes[i];
													var treedataindex = nd['treedataindex'];
													if (nodedata['treedataindex'] == treedataindex)
														visit = true;
													if ($.inArray(nd, nodes) != -1)
														continue;
													var isAfter = visit ? true
															: false;
													if (g.nodeDropIn != -1
															&& g.nodeDropIn != treedataindex)
														continue;
													var jnode = $(
															"li[treedataindex="
																	+ treedataindex
																	+ "] div:first",
															g.tree);
													var offset = jnode.offset();
													var range = {
														top : offset.top,
														bottom : offset.top
																+ jnode
																		.height(),
														left : g.tree.offset().left,
														right : g.tree.offset().left
																+ g.tree
																		.width()
													};
													if (pageX > range.left
															&& pageX < range.right
															&& pageY > range.top
															&& pageY < range.bottom) {
														var lineTop = offset.top;
														if (isAfter)
															lineTop += jnode
																	.height();
														g.nodeDroptip
																.css(
																		{
																			left : range.left,
																			top : lineTop,
																			width : range.right
																					- range.left
																		})
																.show();
														g.nodeDropIn = treedataindex;
														g.nodeDropDir = isAfter ? "bottom"
																: "top";
														if (pageY > range.top + 7
																&& pageY < range.bottom - 7) {
															this.proxy
																	.find(
																			".l-drop-icon:first")
																	.removeClass(
																			"l-drop-no l-drop-yes")
																	.addClass(
																			"l-drop-add");
															g.nodeDroptip
																	.hide();
															g.nodeDropInParent = true;
														} else {
															this.proxy
																	.find(
																			".l-drop-icon:first")
																	.removeClass(
																			"l-drop-no l-drop-add")
																	.addClass(
																			"l-drop-yes");
															g.nodeDroptip
																	.show();
															g.nodeDropInParent = false;
														}
														break;
													} else if (g.nodeDropIn != -1) {
														g.nodeDropIn = -1;
														g.nodeDropInParent = false;
														g.nodeDroptip.hide();
														this.proxy
																.find(
																		".l-drop-icon:first")
																.removeClass(
																		"l-drop-yes  l-drop-add")
																.addClass(
																		"l-drop-no");
													}
												}
											},
											onStopDrag : function(current, e) {
												var nodes = this.draggingNodes;
												g.nodedragging = false;
												if (g.nodeDropIn != -1) {
													for (var i = 0; i < nodes.length; i++) {
														var children = nodes[i].children;
														if (children) {
															nodes = $
																	.grep(
																			nodes,
																			function(
																					node,
																					i) {
																				var isIn = $
																						.inArray(
																								node,
																								children) == -1;
																				return isIn;
																			});
														}
													}
													for ( var i in nodes) {
														var node = nodes[i];
														if (g.nodeDropInParent) {
															g.remove(node);
															g
																	.append(
																			g.nodeDropIn,
																			[ node ]);
														} else {
															g.remove(node);
															g
																	.append(
																			g
																					.getParent(g.nodeDropIn),
																			[ node ],
																			g.nodeDropIn,
																			g.nodeDropDir == "bottom")
														}
													}
													g.nodeDropIn = -1;
												}
												g.nodeDroptip.hide();
												this.set('cursor', 'default');
											}
										});
							}
						},

						_setParentCheckboxStatus : function(treeitem) {
							var g = this, p = this.options;

							var isCheckedComplete = $(".l-checkbox-unchecked",
									treeitem.parent()).length == 0;

							var isCheckedNull = $(".l-checkbox-checked",
									treeitem.parent()).length == 0;
							if (isCheckedComplete) {
								treeitem
										.parent()
										.prev()
										.find(".l-checkbox")
										.removeClass(
												"l-checkbox-unchecked l-checkbox-incomplete")
										.addClass("l-checkbox-checked");
							} else if (isCheckedNull) {
								treeitem
										.parent()
										.prev()
										.find("> .l-checkbox")
										.removeClass(
												"l-checkbox-checked l-checkbox-incomplete")
										.addClass("l-checkbox-unchecked");
							} else {
								treeitem
										.parent()
										.prev()
										.find("> .l-checkbox")
										.removeClass(
												"l-checkbox-unchecked l-checkbox-checked")
										.addClass("l-checkbox-incomplete");
							}
							if (treeitem.parent().parent("li").length > 0)
								g._setParentCheckboxStatus(treeitem.parent()
										.parent("li"));
						}
					});

	function strTrim(str) {
		if (!str)
			return str;
		return str.replace(/(^\s*)|(\s*$)/g, '');
	}
	;

})(jQuery);
(function($) {

	var l = $.jqueryui;

	l.windowCount = 0;

	$.jqueryWindow = function(options) {
		return l.run.call(null, "jqueryWindow", arguments, {
			isStatic : true
		});
	};

	$.jqueryWindow.show = function(p) {
		return $.jqueryWindow(p);
	};

	$.jqueryDefaults.Window = {
		showClose : true,
		showMax : true,
		showToggle : true,
		showMin : true,
		title : 'window',
		load : false,
		onLoaded : null,
		onClose : null,
		onRegain : null,
		onMax : null,
		modal : false
	};

	$.jqueryMethos.Window = {};

	l.controls.Window = function(options) {
		l.controls.Window.base.constructor.call(this, null, options);
	};
	l.controls.Window
			.jqueryExtend(
					l.core.Win,
					{
						__getType : function() {
							return 'Window';
						},
						__idPrev : function() {
							return 'Window';
						},
						_extendMethods : function() {
							return $.jqueryMethos.Window;
						},
						_render : function() {
							var g = this, p = this.options;
							g.window = $('<div class="l-window"><div class="l-window-header"><div class="l-window-header-buttons"><div class="l-window-toggle"></div><div class="l-window-max"></div><div class="l-window-close"></div><div class="l-clear"></div></div><div class="l-window-header-inner"></div></div><div class="l-window-content"></div></div>');
							g.element = g.window[0];
							g.window.content = $(".l-window-content", g.window);
							g.window.header = $(".l-window-header", g.window);
							g.window.buttons = $(
									".l-window-header-buttons:first", g.window);
							if (p.url) {
								if (p.load) {
									g.window.content.load(p.url, function() {
										g.trigger('loaded');
									});
									g.window.content
											.addClass("l-window-content-scroll");
								} else {
									var iframe = $("<iframe frameborder='0' src='"
											+ p.url + "'></iframe>");
									var framename = "jqueryuiwindow"
											+ l.windowCount++;
									if (p.name)
										framename = p.name;
									iframe.attr("name", framename).attr("id",
											framename);
									p.framename = framename;
									iframe.appendTo(g.window.content);
									g.iframe = iframe;
								}
							} else if (p.content) {
								var content = $("<div>" + p.content + "</div>");
								content.appendTo(g.window.content);
							} else if (p.target) {
								g.window.content.append(p.target);
								p.target.show();
							}

							this.mask();

							g.active();

							$('body').append(g.window);

							g.set({
								width : p.width,
								height : p.height
							});

							var left = 0;
							var top = 0;
							if (p.left != null)
								left = p.left;
							else
								p.left = left = 0.5 * ($(window).width() - g.window
										.width());
							if (p.top != null)
								top = p.top;
							else
								p.top = top = 0.5
										* ($(window).height() - g.window
												.height())
										+ $(window).scrollTop() - 10;
							if (left < 0)
								p.left = left = 0;
							if (top < 0)
								p.top = top = 0;

							g.set(p);

							p.framename
									&& $(">iframe", g.window.content).attr(
											'name', p.framename);
							if (!p.showToggle)
								$(".l-window-toggle", g.window).remove();
							if (!p.showMax)
								$(".l-window-max", g.window).remove();
							if (!p.showClose)
								$(".l-window-close", g.window).remove();

							g._saveStatus();

							if ($.fn.jqueryDrag) {
								g.draggable = g.window.drag = g.window
										.jqueryDrag({
											handler : '.l-window-header-inner',
											onStartDrag : function() {
												g.active();
											},
											onStopDrag : function() {
												g._saveStatus();
											},
											animate : false
										});
							}

							if ($.fn.jqueryResizable) {
								g.resizeable = g.window.resizable = g.window
										.jqueryResizable({
											onStartResize : function() {
												g.active();
												$(".l-window-max", g.window)
														.removeClass(
																"l-window-regain");
											},
											onStopResize : function(current, e) {
												var top = 0;
												var left = 0;
												if (!isNaN(parseInt(g.window
														.css('top'))))
													top = parseInt(g.window
															.css('top'));
												if (!isNaN(parseInt(g.window
														.css('left'))))
													left = parseInt(g.window
															.css('left'));
												if (current.diffTop)
													g.window
															.css({
																top : top
																		+ current.diffTop
															});
												if (current.diffLeft)
													g.window
															.css({
																left : left
																		+ current.diffLeft
															});
												if (current.newWidth)
													g.window
															.width(current.newWidth);
												if (current.newHeight)
													g.window.content
															.height(current.newHeight - 28);

												g._saveStatus();
												return false;
											}
										});
								g.window
										.append("<div class='l-btn-nw-drop'></div>");
							}

							$(".l-window-toggle", g.window).click(
									function() {
										if ($(this).hasClass(
												"l-window-toggle-close")) {
											g.collapsed = false;
											$(this).removeClass(
													"l-window-toggle-close");
										} else {
											g.collapsed = true;
											$(this).addClass(
													"l-window-toggle-close");
										}
										g.window.content.slideToggle();
									}).hover(function() {
								if (g.window.drag)
									g.window.drag.set('disabled', true);
							}, function() {
								if (g.window.drag)
									g.window.drag.set('disabled', false);
							});
							$(".l-window-close", g.window).click(function() {
								if (g.trigger('close') == false)
									return false;
								g.window.hide();
								l.win.removeTask(g);
							}).hover(function() {
								if (g.window.drag)
									g.window.drag.set('disabled', true);
							}, function() {
								if (g.window.drag)
									g.window.drag.set('disabled', false);
							});
							$(".l-window-max", g.window)
									.click(
											function() {
												if ($(this).hasClass(
														"l-window-regain")) {
													if (g.trigger('regain') == false)
														return false;
													g.window.width(g._width)
															.css({
																left : g._left,
																top : g._top
															});
													g.window.content
															.height(g._height - 28);
													$(this).removeClass(
															"l-window-regain");
												} else {
													if (g.trigger('max') == false)
														return false;
													g.window
															.width(
																	$(window)
																			.width() - 2)
															.css({
																left : 0,
																top : 0
															});
													g.window.content
															.height(
																	$(window)
																			.height() - 28)
															.show();
													$(this).addClass(
															"l-window-regain");
												}
											});
						},
						_saveStatus : function() {
							var g = this;
							g._width = g.window.width();
							g._height = g.window.height();
							var top = 0;
							var left = 0;
							if (!isNaN(parseInt(g.window.css('top'))))
								top = parseInt(g.window.css('top'));
							if (!isNaN(parseInt(g.window.css('left'))))
								left = parseInt(g.window.css('left'));
							g._top = top;
							g._left = left;
						},
						min : function() {
							this.window.hide();
							this.minimize = true;
							this.actived = false;
						},
						_setShowMin : function(value) {
							var g = this, p = this.options;
							if (value) {
								if (!g.winmin) {
									g.winmin = $(
											'<div class="l-window-min"></div>')
											.prependTo(g.window.buttons).click(
													function() {
														g.min();
													});
									l.win.addTask(g);
								}
							} else if (g.winmin) {
								g.winmin.remove();
								g.winmin = null;
							}
						},
						_setLeft : function(value) {
							if (value != null)
								this.window.css({
									left : value
								});
						},
						_setTop : function(value) {
							if (value != null)
								this.window.css({
									top : value
								});
						},
						_setWidth : function(value) {
							if (value > 0)
								this.window.width(value);
						},
						_setHeight : function(value) {
							if (value > 28)
								this.window.content.height(value - 28);
						},
						_setTitle : function(value) {
							if (value)
								$(".l-window-header-inner", this.window.header)
										.html(value);
						},
						_setUrl : function(url) {
							var g = this, p = this.options;
							p.url = url;
							if (p.load) {
								g.window.content.html("").load(p.url,
										function() {
											if (g.trigger('loaded') == false)
												return false;
										});
							} else if (g.jiframe) {
								g.jiframe.attr("src", p.url);
							}
						},
						hide : function() {
							var g = this, p = this.options;
							this.unmask();
							this.window.hide();
						},
						show : function() {
							var g = this, p = this.options;
							this.mask();
							this.window.show();
						},
						remove : function() {
							var g = this, p = this.options;
							this.unmask();
							this.window.remove();
						},
						active : function() {
							var g = this, p = this.options;
							if (g.minimize) {
								var width = g._width, height = g._height, left = g._left, top = g._top;
								if (g.maximum) {
									width = $(window).width();
									height = $(window).height();
									left = top = 0;
									if (l.win.taskbar) {
										height -= l.win.taskbar.outerHeight();
										if (l.win.top)
											top += l.win.taskbar.outerHeight();
									}
								}
								g.set({
									width : width,
									height : height,
									left : left,
									top : top
								});
							}
							g.actived = true;
							g.minimize = false;
							l.win.setFront(g);
							g.show();
							l.win.setFront(this);
						},
						setUrl : function(url) {
							return _setUrl(url);
						}
					});

})(jQuery);