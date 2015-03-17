
$(function() {

    function syncSlider(args) {
        var curVal = args.chart.get('metadata.visualize.'+args.key, args.option.default),
            input = $('#'+args.key);

        input.val(curVal);

        input.on('change', function() {
            args.chart.set('metadata.visualize.'+args.key, input.val());
        });
    }

    dw.backend.on('sync-option:slider', syncSlider);

});
