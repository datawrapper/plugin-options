$(function() {

require(['d3'], function(d3) {

    function syncCustomFormat(args) {
        var curVal = args.chart.get('metadata.visualize.'+args.key) || '0.0',
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
                { l: '1,000[.00]', f: '0,0.[00]' },
                { l: '0', f: '0' },
                { l: '0.0', f: '0.0' },
                { l: '0.00', f: '0.00' },
                { l: '0.000', f: '0.000' },
                { l: '0.[0]', f: '0.[0]' },
                { l: '0.[00]', f: '0.[00]' },
                { l: '0%', f: '0%' },
                { l: '0.0%', f: '0.0%' },
                { l: '0.00%', f: '0.00%' },
                { l: '0.[0]%', f: '0.[0]%' },
                { l: '0.[00]%', f: '0.[00]%' },
                { l: '10,000', f: '0,0' },
                { l: '1st', f: '0o' },
                { l: '123k', f: '0.[00]a' },
                { l: '123.4k', f: '0.0a' },
                { l: '123.45k', f: '0.00a' },
            ];
        } else if (axesCol.type() == 'date') {
            formats = [
                { l: '2018, 2019', f: 'YYYY' },
                { l: '2019 Q1, 2019 Q2', f: 'YYYY [Q]Q' },
                { l: '2019, Q2, Q3', f: 'YYYY|[Q]Q' },
                { l: '2019, Feb, Mar', f: 'YYYY|MMM' },
                { l: '’15', f: '’YY' },
                { l: '01/05/2019', f: 'L' },
                { l: 'April, May', f: 'MMMM' },
                { l: 'Apr, May', f: 'MMM' },
                { l: 'Apr ’19, May ’19', f: 'MMM ’YY' },
                { l: 'April, 2, 3', f: 'MMM|DD' },
                { l: 'April 1, 2:30pm', f: 'll|LT' },
                { l: 'Monday, 2:30pm', f: 'dddd|LT' },
                { l: 'Mon., 2:30pm', f: 'ddd|LT' },
            ];
        }

        var select = d3.select('#'+args.key).html(''),
            lblCustom = select.attr('data-lbl-custom'),
            input = d3.select('#'+args.key+'-user');

        formats.push({ l: '('+lblCustom+')', f: '--' });

        if (formatMap[curVal]) {
            curVal = formatMap[curVal];
            args.chart.set('metadata.visualize.'+args.key, curVal);
        }

        select.selectAll('option')
            .data(formats)
            .enter()
            .append('option')
            .property('selected', function(d) { return d.f == curVal; })
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
            if (select.node()) {
                select.node().value = curVal;
            }
            input.classed('hidden', true);
        } else {
            if (curVal) {
                input.classed('hidden', false).node().value = curVal;
                select.node().value = '--';
            } else select.node().value = formats.length ? formats[0].f : '';
        }
    }

    dw.backend.on('sync-option:custom-format-numeral', syncCustomFormat);

});

});
