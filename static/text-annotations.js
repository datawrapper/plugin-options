/* globals define, $, _, dw */
define(function(require) {
    return function(args) {
        const chart = args.chart;
        const key = args.key;
        let theme = chart.theme();
        const themeId = chart.get('theme');
        const ui = $('#vis-options-' + key);
        const rowTemplate = _.template($('#text-annotations-row-tpl').html());
        const annotationCont = $('.text-annotations', ui);
        let annotations = dw.utils.clone(chart.get('metadata.visualize.' + key) || []);

        if (!_.isArray(annotations)) annotations = [];

        if (dw.theme(themeId)) {
            theme = dw.theme(themeId);
        } else {
            dw.backend.one('theme-loaded', function() {
                theme = dw.theme(themeId);
            });
        }

        const themeDefaults = get(theme, 'style.chart.textAnnotations', {});

        // default annotation settings
        var annotation = Object.assign({
            x: 20,
            y: 20,
            dx: 0,
            dy: 0,
            size: 14,
            color: theme.colors ? theme.colors.text : '#000000',
            bold: false,
            bg: false,
            showMobile: true,
            showDesktop: true,
            italic: false,
            underline: false,
            text: args.insertTextLabel,
            align: 'mc'
        }, themeDefaults);

        var postAdd = function() {};

        update();

        function update() {
            annotationCont.html('');

            annotations.forEach(function(a) {
                if (typeof annotation.showDesktop === 'undefined' &&
                    typeof annotation.showMobile === 'undefined') {
                    annotation.showDesktop = true;
                    annotation.showMobile = true;
                }

                var row = $(rowTemplate(_.extend({}, annotation, a))).appendTo(annotationCont);
                row.get(0)._annotation = a;
            });

            $('.text-alignment div:not(.bg)', annotationCont).click(function() {
                const row = $(this).parents('.text-annotations-row');
                const align = $(this);
                const a = row.get(0)._annotation;
                a.align =
                    (align.hasClass('top') ? 't' : align.hasClass('bottom') ? 'b' : 'm') +
                    (align.hasClass('left') ? 'l' : align.hasClass('right') ? 'r' : 'c');
                save();
                $(this)
                    .parents('.text-alignment')
                    .attr('class', 'text-alignment ' + a.align);
            });

            $('textarea', annotationCont).keyup(onChange);
            $('input', annotationCont).change(onChange);

            function onChange() {
                const row = $(this).parents('.text-annotations-row');
                const a = row.get(0)._annotation;
                const k = $(this).data('var');
                let val = this.value;
                if ((k === 'x' || k === 'y' || k === 'size') && val === +val) val = +val;
                if (k === 'bg') val = this.checked;
                if (k === 'showMobile') val = this.checked;
                if (k === 'showDesktop') val = this.checked;
                a[k] = val;
                save();
            }

            $('button', annotationCont).click(function() {
                const row = $(this).parents('.text-annotations-row');
                const a = row.get(0)._annotation;
                const btn = $(this);
                const k = btn.data('var');
                const tgl = btn.data('toggle');
                // const val = this.value;
                if (tgl === 1) {
                    a[k] = !(a[k] || false);
                    btn.removeClass('btn-inverse');
                    if (a[k]) btn.addClass('btn-inverse');
                } else {
                    if (btn.is('.btn-fs-inc')) a.size = a.size + 1;
                    if (btn.is('.btn-fs-dec')) a.size = Math.max(7, a.size - 1);
                    $('input[data-var=size]', row).val(a.size);
                    if (btn.is('.btn-delete')) {
                        // remove annotation
                        annotations = annotations.filter(function(b) {
                            return a !== b;
                        });
                        row.remove();
                    }
                    if (btn.is('.btn-show-more')) {
                        row.addClass('show-more');
                    }
                    if (btn.is('.btn-show-less')) {
                        row.removeClass('show-more');
                    }
                    if (btn.is('.btn-color')) {
                        btn.find('.color').colorselector({
                            color: a.color,
                            config: theme.colors.picker,
                            palette: [].concat(theme.colors.palette, theme.colors.secondary),
                            change: function(col) {
                                a.color = col;
                                btn.find('.color').css('background', col);
                                btn.find('.fa').css('color', col);
                                save();
                            }
                        });
                    }
                }
                save();
            });

            $('a.pick-point', annotationCont).click(pickAPoint);

            postAdd = pickAPoint;

            function pickAPoint() {
                // console.log('pickAPoint');
                const row = $(this).parents('.text-annotations-row');
                const a = row.get(0)._annotation;
                const ifr = $('#iframe-vis');
                const iframeDoc = ifr.get(0).contentDocument;
                const iframeChart = $('.dw-chart-body,#chart', iframeDoc);

                iframeChart.addClass('dw-pick-coordinate');

                var infotext = row.parent().data('infotext');
                var help = $('<div class="info-text">' + infotext + '</div>').appendTo('#iframe-wrapper');

                // automatically hide help if user isn't acting
                // for 15 seconds
                setTimeout(done, 15000);

                window.waitingForCoordinate = function(pt) {
                    // this gets called by the chart
                    a.x = pt[0];
                    a.y = pt[1];
                    update(); // update ui
                    save(); // save changes
                    done(); // hide help message
                };

                function done() {
                    iframeChart.removeClass('dw-pick-coordinate');
                    window.waitingForCoordinate = undefined;
                    help.remove();
                }
            }
        }
        function save() {
            chart.set('metadata.visualize.' + key, dw.utils.clone(annotations));
        }

        function get(object, key = null, _default = null) {
            if (!key) return object;
            // expand keys
            const keys = key.split('.');
            let pt = object;

            for (let i = 0; i < keys.length; i++) {
                if (pt === null || pt === undefined) break; // break out of the loop
                // move one more level in
                pt = pt[keys[i]];
            }
            return pt === undefined || pt === null ? _default : pt;
        }

        $('.btn-add-annotation', ui).click(function() {
            annotations.push(_.extend({}, annotation));
            update();
            save();
            postAdd.call($('.text-annotations-row:last-child .pick-point').get(0));
        });
    };
});
