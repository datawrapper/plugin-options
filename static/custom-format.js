
$(function() {

    function syncCustomFormat(args) {
        var curVal = args.chart.get('metadata.visualize.'+args.key),
            formats = [],
            colids = args.vis.axes()[args.option.axis],
            colid = _.isArray(colids) ? colids[0] : colids,
            axesCol = colid ? args.chart.dataset().column(colid) : null;

        if (!colid) return;
        if (axesCol.type() == 'number') {
            formats = [
                { l: '0', f: 'f' },
                { l: '0.0', f: '.1f' },
                { l: '0.00', f: '.2f' },
                { l: '0.000', f: '.3f' },
                { l: '1 sign. digit', f: '.1r' },
                { l: '2 sign. digits', f: '.2r' },
                { l: '3 sign. digits', f: '.3r' },
                { l: '0%', f: '%' },
                { l: '0k', f: '.1s' },
                { l: '0.0k', f: '.2s' },
                { l: '0.00k', f: '.3s' },
            ];
        } else if (axesCol.type() == 'date') {
            formats = [
                { l: '2015', f: '%Y' },
                { l: '’15', f: '’%y' },
                { l: 'April', f: '%B' },
                { l: 'Apr', f: '%b' },
                { l: 'Apr ’15', f: '%b ’%y' }
            ];
        }

        var select = d3.select('#'+args.key).html('');

        select.selectAll('option')
            .data(formats)
            .enter()
            .append('option')
            .attr('value', function(d) { return d.f; })
            .text(function(d) { return d.l; });

        select.on('change', function(d) {
            args.chart.set('metadata.visualize.'+args.key, select.node().value);
        });

        select.node().value = curVal || formats.length ? formats[0].f : '';
    }

    dw.backend.on('sync-option:custom-format', syncCustomFormat);

});
