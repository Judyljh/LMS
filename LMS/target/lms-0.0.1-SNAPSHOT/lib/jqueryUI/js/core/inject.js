(function ($)
{
 
    jquery.inject = {

        prev: 'jquery-',

        defaults: {
            Grid_detail: {
                height: null,
                onShowDetail: null
            },
            Grid_editor: 'ComboBox,DateEditor,Spinner,TextBox,PopupEdit,CheckBoxList,RadioList,Grid_editor',
            Grid_popup: 'PopupEdit',
            Grid_grid: 'Grid',
            Grid_condition: 'Form',
            Grid_toolbar: 'Toolbar',
            Grid_fields: 'Form_fields',
            Form_editor: 'ComboBox,DateEditor,Spinner,TextBox,PopupEdit,CheckBoxList,RadioList,Form_editor',
            Form_grid: 'Grid',
            Form_columns: 'Grid_columns',
            Form_condition: 'Form',
            Form_popup: 'PopupEdit',
            Form_buttons: 'Button',
            Portal_panel: 'Panel'
        },

        config: {
            Grid: {
                dynamics: 'data,isChecked,detail,rowDraggingRender,toolbar,columns',
                arrays: 'columns',
                columns: {
                    dynamics: 'render,totalSummary,headerRender,columns,editor,columns',
                    arrays: 'columns',
                    textProperty: 'display',
                    columns: 'jquery.inject.config.Grid.columns',
                    editor: {
                        dynamics: 'data,columns,render,renderItem,grid,condition,ext',
                        grid: 'jquery.inject.config.Grid',
                        condition: 'jquery.inject.config.Form'
                    }
                },
                toolbar: {
                    arrays: 'items'
                }
            },
            Form: {
                dynamics: 'validate,fields,buttons',
                arrays: 'fields,buttons',
                fields: {
                    textProperty: 'label',
                    dynamics: 'validate,editor',
                    editor: {
                        dynamics: 'data,columns,render,renderItem,grid,condition,attr',
                        grid: 'jquery.inject.config.Grid',
                        condition: 'jquery.inject.config.Form'
                    }
                },
                buttons: 'jquery.inject.config.Button'
            },
            PopupEdit: {
                dynamics: 'grid,condition'
            },
            Button: {
                textProperty: 'text',
                dynamics: 'click'
            },
            ComboBox: {
                dynamics: 'columns,data,tree,grid,condition,render,parms,renderItem'
            },
            ListBox: {
                dynamics: 'columns,data,render,parms'
            },
            RadioList: {
                dynamics: 'data,parms'
            },
            CheckBoxList: {
                dynamics: 'data,parms'
            },
            Panel: {
            },
            Portal: {
               
                dynamics: 'rows,columns',
               
                arrays: 'rows,columns',
               
                columns: {
                    dynamics: 'panels',
                    arrays: 'panels'
                },
               
                rows: {
                    dynamics: 'panels',
                    arrays: 'panels'
                },
                toolbar: {
                    arrays: 'items'
                }
            }
        },

        parse: function (code)
        {
            try
            {
                if (code == null) return null;
                return new Function("return " + code + ";")();
            } catch (e)
            {
                return null;
            }
        },

        parseDefault: function (value)
        {
            var g = this;
            if (!value) return value;
            var result = {};
            $(value.split(',')).each(function (index, name)
            {
                if (!name) return;
                name = name.substr(0, 1).toUpperCase() + name.substr(1);
                $.extend(result, g.parse("jquery.defaults." + name));
            });
            return result;
        },

        fotmatValue: function (value, type)
        {
            if (type == "boolean")
                return value == "true" || value == "1";
            if (type == "number" && value)
                return parseFloat(value.toString());
            return value;
        },

        getOptions: function (e)
        {
            var jelement = e.jelement, defaults = e.defaults, config = e.config;
            config = $.extend({
                ignores: "",
                dynamics: "",
                arrays: ""
            }, config);
            var g = this, options = {}, value;
            if (config.textProperty) options[config.textProperty] = jelement.text();
            for (var proName in defaults)
            {
                var className = proName.toLowerCase();
                var subElement = $("> ." + className, jelement);
               
                if ($.inArray(proName, config.ignores.split(',')) != -1) continue;
               
                if (subElement.length)
                {
                    var defaultName = e.controlName + "_" + proName;
                    var subDefaults = g.defaults[defaultName] || jquery.defaults[defaultName], subConfig = config[proName];
                    if (typeof (subDefaults) == "string") subDefaults = g.parseDefault(subDefaults);
                    else if (typeof (subDefaults) == "funcion") subDefaults = subDefaults();
                    if (typeof (subConfig) == "string") subConfig = g.parse(subConfig);
                    else if (typeof (subConfig) == "funcion") subConfig = subConfig();
                    if (subDefaults)
                    {
                        if ($.inArray(proName, config.arrays.split(',')) != -1)
                        {
                            value = [];
                            $(">div,>li,>input", subElement).each(function ()
                            {
                                value.push(g.getOptions({
                                    defaults: subDefaults,
                                    controlName: e.controlName,
                                    config: subConfig,
                                    jelement: $(this)
                                }));
                            });
                            options[proName] = value;
                        } else
                        {
                            options[proName] = g.getOptions({
                                defaults: subDefaults,
                                controlName: e.controlName,
                                config: subConfig,
                                jelement: subElement
                            });
                        }
                    }
                    subElement.remove();
                }
                   
                else if ($.inArray(proName, config.dynamics.split(',')) != -1 || proName.indexOf('on') == 0)
                {
                    value = g.parse(jelement.attr("data-" + proName) || jelement.attr(proName));
                    if (value)
                    {
                        options[proName] = g.fotmatValue(value, typeof (defaults[proName]));
                    }
                }
                   
                else
                {
                    value = jelement.attr("data-" + proName) || jelement.attr(proName);
                    if (value)
                    {
                        options[proName] = g.fotmatValue(value, typeof (defaults[proName]));
                    }
                }
            }
            var dataOptions = jelement.attr("data-options") || jelement.attr("data-property");
            if (dataOptions) dataOptions = g.parse("{" + dataOptions + "}");
            if (dataOptions) $.extend(options, dataOptions);
            return options;
        },

        init: function ()
        {
            var g = this, configs = this.config;
            for (var name in g.defaults)
            {
                if (typeof (g.defaults[name]) == "string")
                {
                    g.defaults[name] = g.parseDefault(g.defaults[name]);
                }
            }
            for (var controlName in jquery.controls)
            {
                var config = configs[controlName] || {};
                var className = g.prev + controlName.toLowerCase();
                $("." + className).each(function ()
                {
                    var jelement = $(this), value;
                    var defaults = $.extend({
                        onrender: null,
                        onrendered: null
                    }, jquery.defaults[controlName]);
                    var options = g.getOptions({
                        defaults: defaults,
                        controlName: controlName,
                        config: config,
                        jelement: jelement
                    });
                    jelement[jquery.pluginPrev + controlName](options);
                });
            }
        }

    }

    $(function ()
    {
        jquery.inject.init();
    });

})(jQuery);