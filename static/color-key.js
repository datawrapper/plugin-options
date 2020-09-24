/* globals dw,$,_ */
require(['dw/chart/visualize/options/initCustomColors'], function(updateCustomColors) {
    function syncColorKey(args) {

        var chart = args.chart,
            $colors = $('#'+args.key+' .color-key-colors'),
            theme = dw.theme(chart.get('theme'));

        var onchange = function() { };

        chart.onChange(function(b, c) { onchange(c); });

        if (!theme) {
            // theme not loaded
            dw.backend.on('theme-loaded', initialize);
        } else {
            initialize();
        }

        function initialize() {
            theme = dw.theme(chart.get('theme'));

            onchange = function(changed) {
                if (changed == 'theme') dw.backend.on('theme-loaded', initialize);
                if (changed == 'metadata.visualize.custom-colors') return initialize();
                if (!option.colors) return;
                for (var i=0; i<option.colors.length; i++) {
                    if (changed == 'metadata.visualize.'+option.colors[i]) return initialize();
                    if (changed == 'metadata.visualize.color-'+option.colors[i]) return initialize();
                }
            };

            var option = args.option,
                palette = [].concat(theme.colors.palette),
                oldColorKey = chart.get('metadata.visualize.'+args.key, {}),
                customColors = chart.get('metadata.visualize.custom-colors', {}),
                colorkey = {};

            var visAxes = dw.backend.currentVis.axes();

            _.each(option.colors, function(k) {
                var col = visAxes[k] ? chart.dataset().column(visAxes[k]) : null;
                colorkey[k] = {
                    color: chart.get('metadata.visualize.'+k) || chart.get('metadata.visualize.color-'+k) || 0,
                    def_lbl: col ? col.title() : k.replace(/-/g, ' ')
                };
                if (_.isNumber(colorkey[k].color)) {
                    colorkey[k].color = palette[colorkey[k].color % palette.length];
                }
                colorkey[k].label = oldColorKey[k] ? oldColorKey[k].label : null;
            });

            _.each(customColors, function(col, k) {
                if (col === '') {
                    delete colorkey[k];
                    return;
                }
                colorkey[k] = {
                    col: col,
                    color: col || 0
                };
                if (_.isNumber(colorkey[k].color)) {
                    colorkey[k].color = palette[colorkey[k].color % palette.length];
                }
                colorkey[k].label = oldColorKey[k] ? oldColorKey[k].label : null;
            });

            // group identical colors
            var knownColors = {};
            _.each(colorkey, function(ckey, ck) {
                if (!knownColors[ckey.color]) {
                    knownColors[ckey.color] = ckey;
                } else {
                    ckey.hide = true;
                    knownColors[ckey.color].def_lbl+=', '+ck;
                }
            });

            _.each(colorkey, function(ckey, ck) {
                // default label
                if (ckey.label === null) ckey.label = ckey.def_lbl || ck;
            });

            $colors.html(''); // wipe out old ui

            chart.set('metadata.visualize.'+args.key, colorkey);

            _.each(colorkey, function(ckey, ck) {
                if (ckey.hide) return;
                $colors.append('<div class="color-key-color" data-key="'+ck+'">'+
                    '<div class="color-key-swatch" style="background: '+ckey.color+'"></div>'+
                    '<input type="text" placeholder="'+ck+'" value="'+ckey.label+'" '+
                    'class="color-key-label" data-key="metadata.visualize.'+args.key+'.'+ck+'.label"></div>');
            });


            var _save = _.debounce(function() {
                chart.save();
            }, 500);

            chart.save();

            $('.color-key-color input', $colors)
                .on('change blur', function(e) {
                    var k = $(e.target).attr('placeholder');
                    colorkey = clone(colorkey);
                    colorkey[k].label = e.target.value;
                    chart.set('metadata.visualize.'+args.key, colorkey);
                });

            var swatch = $('.color-key-swatch', $colors).click(function() {
                var $s = $(this),
                    k = $s.parents('.color-key-color').data('key');
                swatch.colorselector({
                    color: colorkey[k].color,
                    config: theme.colors.picker,
                    groups: theme.colors.groups,
                    palette: palette,
                    change: function(new_color) {
                        colorkey = clone(colorkey);
                        customColors = clone(customColors);
                        if (args.option.colors.indexOf(k) < 0) {
                            colorkey[k].color = new_color;
                            customColors[k] = new_color;
                            chart.set('metadata.visualize.'+args.key, colorkey);
                            chart.set('metadata.visualize.custom-colors', customColors);
                        } else {
                            chart.set('metadata.visualize.'+k, new_color);
                            $('#'+k+' .base-color-picker').css('background', new_color);
                        }
                        $s.css('background', new_color);
                    }
                });
            })
        }


        // var el = $('#' + args.key);
        // el.val(args.chart.get('metadata.visualize.'+args.key));
        // function save() {
        //     args.chart.set('metadata.visualize.'+args.key, el.val());
        // }
        // el.change(save).keyup(save);
    }

    // column select
    dw.backend.on('sync-option:color-key', syncColorKey);
});

function clone(o) { return JSON.parse(JSON.stringify(o)); }
