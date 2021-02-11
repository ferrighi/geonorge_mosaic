<?php
/*
 *
 * @file
 * Contains \Drupal\geonorge_mosaic\Form\GeonorgeMosaicConfigurationForm
 *
 * Form for Landing Page Creator Admin Configuration
 *
 **/
namespace Drupal\geonorge_mosaic\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Url;

/*
 *  * Class ConfigurationForm.
 *
 *  {@inheritdoc}
 *
 *   */
class GeonorgeMosaicConfigurationForm extends ConfigFormBase {

  /*
   * {@inheritdoc}
  */
  protected function getEditableConfigNames() {
    return [
      'geonorge_mosaic.settings',
      ];
  }

  /*
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'geonorge_mosaic.admin_config_form';
  }

  /*
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('geonorge_mosaic.settings');
    //$form = array();


    $form['zoom_level'] = array(
      '#type' => 'textfield',
      '#title' => t('Enter default zoom level (1-10)'),
      '#description' => t("Default map zoom level"),
      '#default_value' => $config->get('zoom_level'),
    );

    $form['center_lon'] = array(
      '#type' => 'textfield',
      '#title' => t('Enter longitude for center of map'),
      '#description' => t("Default map center longitude"),
      '#default_value' => $config->get('center_lon'),
    );
    $form['center_lat'] = array(
      '#type' => 'textfield',
      '#title' => t('Enter latitude for center of map'),
      '#description' => t("Default map center latitude"),
      '#default_value' => $config->get('center_lat'),
    );




    return parent::buildForm($form, $form_state);
 }

  /*
   * {@inheritdoc}
   *
   * NOTE: Implement form validation here
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {


  }

  /*
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    /**
     * Save the configuration
    */
    $values = $form_state->getValues();

    $this->configFactory->getEditable('geonorge_mosaic.settings')
      ->set('zoom_level', $values['zoom_level'])
      ->set('center_lon', $values['center_lon'])
      ->set('center_lat', $values['center_lat'])

      ->save();
    parent::submitForm($form, $form_state);
  }
}
