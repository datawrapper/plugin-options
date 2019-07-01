<?php

global $app;

$options = [
    'axis-matrix',
    'base-color',
    'checkbox',
    'color-key',
    'column-select',
    'custom-format',
    'custom-format-numeral',
    'custom-format-d3',
    'custom-range',
    'number',
    'radio',
    'radio-left',
    'select-axis-column',
    'select',
    'select-elements',
    'separator',
    'slider',
    'text',
    'textarea',
    'text-annotations',
    'typeahead',
    'alert'
];
$assets = ['vendor/typeahead.jquery.js', 'options.js', 'options.css'];

$use_require = ['text-annotations' => 1, 'select-elements' => 1];

foreach ($options as $opt) {
    if (file_exists(get_plugin_path() . $plugin->getName().'/static/'.$opt.'.js') && !isset($use_require[$opt])) $assets[] = $opt.'.js';
    Hooks::register(
        Hooks::VIS_OPTION_CONTROLS,
        function($o, $k) use ($app, $plugin, $opt) {
            $env = array('option' => $o, 'key' => $k);
            $app->render('plugins/' . $plugin->getName() . '/'.$opt.'.twig', $env);
        }
    );
}

Hooks::register('compile_less_files', function() use ($plugin) {
    return [get_plugin_path() . $plugin->getName() . '/less/options.less',];
});

$plugin->declareAssets($assets, "#/chart|map/[^/]+/visualize#");
