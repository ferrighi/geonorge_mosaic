<?php
function geonorge_mosaic_admin($form, &$form_state) {
  $form = array();

  $form['#prefix']  = '<h2>Geonorge Mosaic Module configuration</h2>';

  $form['zoom'] = array(
    '#type' => 'textfield',
    '#title' => t('Enter zoom value from 1 to 10 username'),
    //'#default_value' => t('5'),
    '#attributes' => array(
        'placeholder' => t('5'),
      ),
    '#description' => t("initial zoom"),
  );

  $form['center_lat'] = array(
    '#type' => 'textfield',
    '#title' => t('Enter latitude for center of map'),
    //'#default_value' => t('65'),
    '#attributes' => array(
        'placeholder' => t('65'),
      ),
    '#description' => t("center latitude"),
  );

  $form['center_lon'] = array(
    '#type' => 'textfield',
    '#title' => t('Enter longitude for center of map'),
    //'#default_value' => t('12'),
    '#attributes' => array(
        'placeholder' => t('12'),
      ),
    '#description' => t("center longitude"),
  );

  return system_settings_form($form);
}