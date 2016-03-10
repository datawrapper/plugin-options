<?php

global $app;

$options = array('custom-format', 'custom-format-numeral', 'slider', 'axis-matrix', 'typeahead');
$assets = array('vendor/typeahead.jquery.js');

foreach ($options as $opt) {
    $assets[] = $opt.'.js';
    DatawrapperHooks::register(
        DatawrapperHooks::VIS_OPTION_CONTROLS,
        function($o, $k) use ($app, $plugin, $opt) {
            $env = array('option' => $o, 'key' => $k);
            $app->render('plugins/' . $plugin->getName() . '/'.$opt.'.twig', $env);
        }
    );
}

$plugin->declareAssets($assets, "#/chart|map/[^/]+/visualize#");
