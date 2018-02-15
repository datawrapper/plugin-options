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
];
$assets = ['vendor/typeahead.jquery.js', 'options.js', 'options.css'];

$use_require = ['text-annotations' => 1, 'select-elements' => 1];

foreach ($options as $opt) {
    if (file_exists(ROOT_PATH . 'plugins/'.$plugin->getName().'/static/'.$opt.'.js') && !isset($use_require[$opt])) $assets[] = $opt.'.js';
    Hooks::register(
        Hooks::VIS_OPTION_CONTROLS,
        function($o, $k) use ($app, $plugin, $opt) {
            $env = array('option' => $o, 'key' => $k);
            $app->render('plugins/' . $plugin->getName() . '/'.$opt.'.twig', $env);
        }
    );
}

Hooks::register('compile_less_files', function() use ($plugin) {
    return [ROOT_PATH . 'plugins/' . $plugin->getName() . '/less/options.less',];
});

$plugin->registerAdminPage(function() use ($plugin) {
    return array(
        'url' => '/options',
        'title' => __('Options'),
        'controller' => function() {
            ?>
            <table class="matrix"><thead><tr><td/>
            <?php

            $vis = array_filter(DatawrapperVisualization::all(), function($v) {
                return !empty($v['title']);
            });

            $type_rows = [];

            $matrix = [];

            foreach ($vis as $col => $v) {
                $options = empty($v['annotate_options']) ? $v['options'] : array_merge($v['options'], $v['annotate_options']);
                $types = [];
                foreach ($options as $o) {
                    if (empty($o['type'])) continue;
                    if ($o['type'] == 'group') {
                        foreach ($o['options'] as $o2) {
                            if (empty($o2['type'])) continue;
                            $types[] = $o2['type'];
                        }
                    } else {
                        $types[] = $o['type'];
                    }
                }
                foreach (array_unique($types) as $type) {
                    if (empty($type_rows[$type])) {
                        $type_rows[$type] = count($matrix);
                        $the_row = [
                            'type' => $type,
                            'columns' => []
                        ];
                        foreach ($vis as $v) {
                            $the_row['columns'][] = false;
                        }
                        $matrix[] = $the_row;
                    }
                    $matrix[$type_rows[$type]]['columns'][$col] = true;

                }
            }
            foreach ($vis as $v) {
                print '<th><span>'.$v['title'].'</span></th>';
            }
            print '</tr></thead><tbody>';
            foreach ($matrix as $row) {
                print '<tr><th>'.$row['type'].'</th>';
                foreach ($row['columns'] as $col) {
                    print '<td>'.($col ? '*' : '').'</td>';
                }
                print '</tr>';
            }

            ?>
            </table>
            <style>
            table th { text-align: left;font-size: 11px; font-weight: normal; width: 40px; }
            table thead tr > * { width: 30px; overflow: hidden; height: 100px; border: none;}
            table thead th span { transform: rotate(-90deg); display: block;
                transform-origin: left;
                white-space: nowrap;
                margin-top: 100px;
                margin-left: 14px;
                width: 10px;
            }
            table tbody th { width: 150px; white-space: nowrap; text-align: right; padding-right: 2ex}
            table td { position: relative; border: 1px solid #ddd;width:30px; text-align: center;}
            </style>
            <?php
        },
        'group' => __('Admin'),
        'icon' => 'fa-university',
        'order' => 299999
    );
});

$plugin->declareAssets($assets, "#/chart|map/[^/]+/visualize#");
