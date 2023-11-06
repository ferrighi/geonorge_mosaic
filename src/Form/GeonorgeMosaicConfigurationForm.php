<?php

namespace Drupal\geonorge_mosaic\Form;

/**
 *
 * @file
 * Contains \Drupal\geonorge_mosaic\Form\GeonorgeMosaicConfigurationForm.
 *
 * Form for Landing Page Creator Admin Configuration.
 */

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configuration form for geonorge mosaic.
 *
 *  {@inheritdoc}
 */
class GeonorgeMosaicConfigurationForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'geonorge_mosaic.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'geonorge_mosaic.admin_config_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('geonorge_mosaic.settings');
    // $form = array();
    $form['zoom_level'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Enter default zoom level (1-10)'),
      '#description' => $this->t("Default map zoom level"),
      '#default_value' => $config->get('zoom_level'),
    ];

    $form['center_lon'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Enter longitude for center of map'),
      '#description' => $this->t("Default map center longitude"),
      '#default_value' => $config->get('center_lon'),
    ];
    $form['center_lat'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Enter latitude for center of map'),
      '#description' => $this->t("Default map center latitude"),
      '#default_value' => $config->get('center_lat'),
    ];

    $form['helptext'] = [
      '#type'          => 'text_format',
      '#title'         => $this->t('Help markup text'),
      '#format'        => $config->get('helptext')['format'],
      '#default_value' => $config->get('helptext')['value'],
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   *
   * NOTE: Implement form validation here.
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {

  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    /* Save the configuration */
    $values = $form_state->getValues();

    $this->configFactory->getEditable('geonorge_mosaic.settings')
      ->set('zoom_level', $values['zoom_level'])
      ->set('center_lon', $values['center_lon'])
      ->set('center_lat', $values['center_lat'])
      ->set('helptext', $values['helptext'])
      ->save();
    parent::submitForm($form, $form_state);
  }

}
