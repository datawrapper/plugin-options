
$(function() {

require(['d3'], function(d3) {

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
                { l: '0%', f: '.0%' },
                { l: '0.0%', f: '.1%' },
                { l: '0.00%', f: '.2%' },
                { l: '0.000%', f: '.3%' },
                { l: '0k', f: 's' },
                { l: '0.0k', f: '.1s' },
                { l: '0.00k', f: '.2s' },
                { l: '0,0', f: ',f' },
            ];
        } else if (axesCol.type() == 'date') {
            formats = [
                { l: '2018', f: '%Y' },
                { l: '2018 Apr', f: '%Y %b' },
                { l: '’18', f: '’%y' },
                { l: 'April', f: '%B' },
                { l: 'Apr', f: '%b' },
                { l: 'Apr ’18', f: '%b ’%y' },
                { l: 'April, 2', f: '%B, %e' }
            ];
        }

        var select = d3.select('#'+args.key).html(''),
            input = d3.select('#'+args.key+'-user');

        if (formatMap[curVal]) {
            curVal = formatMap[curVal];
            args.chart.set('metadata.visualize.'+args.key, curVal);
        }

        formats.push({ l: '(custom)', f: '--' });

        select.selectAll('option')
            .data(formats)
            .enter()
            .append('option')
            .attr('value', function(d) { return d.f; })
            .text(function(d) { return d.l; });

        select.on('change', function(d) {
            var v = select.node().value;
            if (v == '--') {
                if (!input.node().value) input.node().value = formats[0].f;
                input.classed('hidden', false);
                v = input.node().value;
            } else {
                input.classed('hidden', true);
            }
            args.chart.set('metadata.visualize.'+args.key, v);
        });

        input.on('change', function(d) {
            args.chart.set('metadata.visualize.'+args.key, input.node().value);
        });

        if (_.findWhere(formats, { f: curVal })) {
            select.node().value = curVal;
            input.classed('hidden', true);
        } else {
            if (curVal) {
                input.classed('hidden', false).node().value = curVal;
                select.node().value = '--';
            } else select.node().value = formats.length ? formats[0].f : '';
        }
    }

    dw.backend.on('sync-option:custom-format-d3', syncCustomFormat);

});

});
