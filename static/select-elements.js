define(function(require) {

    console.log('select-elements');

    return function(args) {
        var chart = args.chart,
            key = args.key,
            vis = args.vis,
            keys = vis.keys().sort(),
            ui = $('#vis-options-'+key),
            select = $('select', ui),
            button = $('button', ui),
            elements = $('ul.elements', ui),
            selected = clone(chart.get('metadata.visualize.'+key) || []);

        if (!_.isArray(selected)) selected = [];

        keys.forEach(function(k) {
            $('<option>'+k+'</option>').appendTo(select);
        });

        select.on('change', function() {
            if (select.prop('value') != '----') {
                selected.push(select.prop('value'));
                select.prop('value', '----');
                update();
                save();
            }
        })

        update();

        function update() {
            
            elements.html('');

            selected.forEach(function(key) {
                var li = $('<li>'+key+'</li>')
                    .attr('title', key)
                    .appendTo(elements)
                    .click(function() {
                        selected = selected.filter(function(k) { return k != key; });
                        update();
                        save();
                    });
            });

            button.click(pickElement);

            // postAdd = pickAPoint;

            function pickElement() {
                // console.log('pickAPoint');
                var ifr = $('#iframe-vis'),
                    ifr_d = ifr.get(0).contentDocument;
                    ifr_chart = $('.dw-chart-body,#chart', ifr_d);
                ifr_chart.addClass('dw-pick-element');
                
                var infotext = $('.controls', ui).data('infotext');
                var help = $('<div class="info-text">'+infotext+'</div>')
                    .appendTo('#iframe-wrapper');

                setTimeout(done, 15000);
                
                window.waitingForElement = function(pick) {
                    done();
                    selected.push(pick.key);
                    update();
                    save();
                };
                function done() {
                    help.remove();
                    ifr_chart.removeClass('dw-pick-element');
                    window.waitingForElement = undefined;
                }
            }
        }

        function save() {
            chart.set('metadata.visualize.'+key, clone(selected));
        }

        // $('.btn-add-annotation', ui).click(function() {
        //     annotations.push(_.extend({}, annotation));
        //     update();
        //     save();
        //     postAdd.call($('.text-annotations-row:last-child .pick-point').get(0));
        // });

        function clone(o) {
            return JSON.parse(JSON.stringify(o));
        }

    };
});
