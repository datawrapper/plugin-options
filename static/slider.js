
$(function() {

    function syncSlider(args) {
        var curVal = args.chart.get('metadata.visualize.'+args.key, args.option.default),
            input = $('#'+args.key),
            display = $('.value', input.parent());

        input.val(curVal);
        display.html(curVal);

        input.on('input', function() {
            display.html(input.val());
        }).on('change', function() {
            args.chart.set('metadata.visualize.'+args.key, input.val());
            display.html(input.val());
        });
    }

    dw.backend.on('sync-option:slider', syncSlider);

});
