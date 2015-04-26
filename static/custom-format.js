
$(function() {

    function syncCustomFormat(args) {
        var curVal = args.chart.get('metadata.visualize.'+args.key),
            formats = [],
            colids = args.vis.axes()[args.option.axis],
            colid = _.isArray(colids) ? colids[0] : colids,
            axesCol = colid ? args.chart.dataset().column(colid) : null;

        var formatMap = {
            '%Y': 'YYYY',
            '’%y': '’YY',
            '%B': 'MMMM',
            '%b': 'MMM',
            '%b ’%y': 'MMM ’YY'
        };

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
                { l: '2015', f: 'YYYY' },
                { l: '2015 Q1', f: 'YYYY [Q]Q' },
                { l: '’15', f: '’YY' },
                { l: 'April', f: 'MMMM' },
                { l: 'Apr', f: 'MMM' },
                { l: 'Apr ’15', f: 'MMM ’YY' }
            ];
        }

        var select = d3.select('#'+args.key).html('');

        if (formatMap[curVal]) {
            curVal = formatMap[curVal];
            args.chart.set('metadata.visualize.'+args.key, curVal);
        }

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
