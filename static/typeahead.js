
$(function() {

    var substringMatcher = function(items) {

        return function findMatches(q, cb) {
            var matches = [], qRegex;

            try {
                qRegex = new RegExp(q.split('').join('.*?'), 'i');
            } catch (e) {
                qRegex = new RegExp(q, 'i');
            }

            $.each(items, function(i, item) {
                if (qRegex.test(item.label)) matches.push(item);
            });

            cb(matches);
        };
    };


    function syncTypeahead(args) {
        var curVal = args.chart.get('metadata.visualize.'+args.key, args.option.default),
            input = $('#'+args.key);

        input.typeahead2({
            hint: true,
            highlight: true,
            minLength: 1
        },{
            name: 'states',
            source: substringMatcher(args.option.options),
            display: 'label'
        }).on('typeahead:select', function(ev, suggestion) {
            args.chart.set('metadata.visualize.'+args.key, suggestion.value);
        }).typeahead2('val', _.find(args.option.options, { value: curVal }).label);
    }

    dw.backend.on('sync-option:typeahead', syncTypeahead);

});
