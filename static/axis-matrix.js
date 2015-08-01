
$(function() {

    function syncAxesMatrix(args) {
        var curVal = args.chart.get('metadata.visualize.'+args.key, args.option.default),
            table = $('#'+args.key+' tbody').html(''),
            axesColumns = args.vis.axes(),
            ds = args.chart.dataset();

        ds.columns().forEach(function(column) {
            var tr = $('<tr />')
                .data('column', column.name())
                .appendTo(table);

            tr.append('<td>'+column.name()+'</td>');

            _.each(args.option.axes, function(axis) {
                var axisMeta = args.vis.meta.axes[axis.id],
                    defCol = axesColumns[axis.id],
                    td = $('<td />').data('axis', axis.id).appendTo(tr);
                if (_.indexOf(axisMeta.accepts, column.type()) > -1) {
                    $('<input type="radio" name="'+column.name()+'" />')
                        .prop('checked',
                            defCol ? (axisMeta.multiple ? defCol.indexOf(column.name()) > -1 :
                                column.name() == defCol) : false)
                        .appendTo(td)
                        .change(function() {
                            var checked = $(this).prop('checked');
                                _axes = _.clone(args.chart.get('metadata.axes', axesColumns));

                            if (axisMeta.multiple) {
                                if (!_axes[axis.id]) _axes[axis.id] = [];
                                // remove column from all axes
                                _.each(_axes, function(cols, k) {
                                    if (args.vis.meta.axes[k].multiple) {
                                        if (_axes[k]) _axes[k] = _axes[k].filter(function(d) {
                                            return d != column.name();
                                        });
                                    }
                                });
                                if (checked) {
                                    _axes[axis.id].push(column.name());
                                }
                            } else {
                                if (checked) _axes[axis.id] = column.name();
                            }
                            chart.set('metadata.axes', _axes);
                            update();
                        });
                }
            });
        });

        function update() {
            ds.columns().forEach(function(column) {
                _.each(args.option.axes, function(axis) {
                    var axisMeta = args.vis.meta.axes[axis.id],
                        defCol = axesColumns[axis.id];

                });
            });
        }

        // input.on('change', function() {
        //     args.chart.set('metadata.visualize.'+args.key, input.val());
        // });
    }

    dw.backend.on('sync-option:axis-matrix', syncAxesMatrix);

});
