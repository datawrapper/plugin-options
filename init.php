<?php

global $app;

$options = [
    'axis-matrix',
    'base-color',
    'checkbox',
    'column-select',
    'custom-format',
    'custom-format-numeral',
    'custom-range',
    'number',
    'radio',
    'radio-left',
    'select-axis-column',
    'select',
    'separator',
    'slider',
    'text',
    'textarea',
    'text-annotations',
    'typeahead',
];
$assets = ['vendor/typeahead.jquery.js', 'options.js', 'options.css'];

$use_require = ['text-annotations' => 1];

foreach ($options as $opt) {
    if (file_exists(ROOT_PATH . 'plugins/'.$plugin->getName().'/static/'.$opt.'.js') && !isset($use_require[$opt])) $assets[] = $opt.'.js';
    DatawrapperHooks::register(
        DatawrapperHooks::VIS_OPTION_CONTROLS,
        function($o, $k) use ($app, $plugin, $opt) {
            $env = array('option' => $o, 'key' => $k);
            $app->render('plugins/' . $plugin->getName() . '/'.$opt.'.twig', $env);
        }
    );
}

DatawrapperHooks::register('compile_less_files', function() use ($plugin) {
    return [ROOT_PATH . 'plugins/' . $plugin->getName() . '/less/options.less',];
});


$plugin->declareAssets($assets, "#/chart|map/[^/]+/visualize#");
