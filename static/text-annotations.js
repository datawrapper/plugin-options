define(function(require) {

    return function(args) {
        var chart = args.chart,
            key = args.key,
            theme = chart.theme(),
            theme_id = chart.get('theme'),
            ui = $('#vis-options-'+key),
            row_tpl = _.template($('#text-annotations-row-tpl', ui).html()),
            annotation_cont = $('.text-annotations', ui),
            annotations = clone(chart.get('metadata.visualize.'+key) || []);

        if (dw.theme(theme_id)) {
            theme = dw.theme(theme_id);
        } else {
            dw.backend.one('theme-loaded', function() {
                theme = dw.theme(theme_id);
            });
        }

        var annotation = {
            x: 20,
            y: 20,
            dx: 0,
            dy: 0,
            size: 14,
            color: theme.colors.text,
            bold: false,
            italic: false,
            underline: false,
            text: 'Insert text here',
            align: 'mc'
        };

        var postAdd = function() {};

        update();

        function update() {
            
            annotation_cont.html('');

            annotations.forEach(function(a) {
                var row = $(row_tpl(_.extend({} ,annotation, a)))
                    .appendTo(annotation_cont);
                row.get(0)._annotation = a;
            });

            $('.text-alignment div:not(.bg)', annotation_cont).click(function() {
                var row = $(this).parents('.text-annotations-row'),
                    align = $(this),
                    a = row.get(0)._annotation;
                a.align = (align.hasClass('top') ? 't' : align.hasClass('bottom') ? 'b' : 'm') +
                    (align.hasClass('left') ? 'l' : align.hasClass('right') ? 'r' : 'c');
                save();
                $(this).parents('.text-alignment').attr('class', 'text-alignment '+a.align);
            });

            $('textarea', annotation_cont).keyup(onChange);
            $('input', annotation_cont).change(onChange);

            function onChange() {
                var row = $(this).parents('.text-annotations-row'),
                    a = row.get(0)._annotation,
                    k = $(this).data('var'),
                    val = this.value;
                if (k == 'x' || k == 'y') val = +val;
                a[k] = val;
                save();
            }

            $('button', annotation_cont).click(function() {
                var row = $(this).parents('.text-annotations-row'),
                    a = row.get(0)._annotation,
                    btn = $(this),
                    k = btn.data('var'),
                    tgl = btn.data('toggle'),
                    val = this.value;
                if (tgl == '1') {
                    a[k] = !(a[k] || false);
                    btn.removeClass('btn-inverse');
                    if (a[k]) btn.addClass('btn-inverse');
                } else {
                    if (btn.is('.btn-fs-inc')) a.size = a.size + 1;
                    if (btn.is('.btn-fs-dec')) a.size = Math.max(7, a.size - 1);
                    if (btn.is('.btn-delete')) {
                        // remove annotation
                        annotations = annotations.filter(function(b) { return a != b; });
                        row.remove();
                    }
                    if (btn.is('.btn-show-more')) { row.addClass('show-more'); }
                    if (btn.is('.btn-show-less')) { row.removeClass('show-more'); }
                    if (btn.is('.btn-color')) {
                        btn.find('.color').colorselector({
                            color: a.color,
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

            $('a.pick-point', annotation_cont).click(pickAPoint);

            postAdd = pickAPoint;

            function pickAPoint() {
                // console.log('pickAPoint');
                var row = $(this).parents('.text-annotations-row'),
                    a = row.get(0)._annotation,
                    ifr = $('#iframe-vis'),
                    ifr_d = ifr.get(0).contentDocument;
                    ifr_chart = $('.dw-chart-body,#chart', ifr_d);
                ifr_chart.addClass('dw-pick-coordinate');
                
                var infotext = row.parent().data('infotext');
                var help = $('<div class="info-text">'+infotext+'</div>')
                    .appendTo('#iframe-wrapper');

                setTimeout(done, 15000);
                
                window.waitingForCoordinate = function(pt) {
                    // console.log('coord', pt);
                    a.x = pt[0];
                    a.y = pt[1];
                    update();
                    save();
                    done();
                };
                function done() {
                    ifr_chart.removeClass('dw-pick-coordinate');
                    window.waitingForCoordinate = undefined;
                    help.remove();
                }
            }
        }

        function save() {
            chart.set('metadata.visualize.'+key, clone(annotations));
        }

        $('.btn-add-annotation', ui).click(function() {
            annotations.push(_.extend({}, annotation));
            update();
            save();
            postAdd.call($('.text-annotations-row:last-child .pick-point').get(0));
        });

        function clone(o) {
            return JSON.parse(JSON.stringify(o));
        }

    };
});
