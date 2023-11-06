<?php

namespace Drupal\geonorge_mosaic\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\Markup;

/**
 * Class for rendering geonorge mosaic map.
 */
class GeonorgeMosaicController extends ControllerBase {

  /**
   * Render the map.
   */
  public function render() {
    $config = $this->config('geonorge_mosaic.settings');
    $zoom_level = $config->get('zoom_level');
    $center_lat = $config->get('center_lat');
    $center_lon = $config->get('center_lon');
    $helptext = Markup::create($config->get('helptext')['value']);

    $this->getLogger('geonorge_mosaic')->debug("Zoom level: " . $zoom_level);
    $this->getLogger('geonorge_mosaic')->debug("Center latitude: " . $center_lat);
    $this->getLogger('geonorge_mosaic')->debug("Center longitude: " . $center_lon);

    /*    return [
    '#type' => 'markup',
    '#markup' => '<div id="map" class="map"></div>',
    '#allowed_tags' => ['div'],
    '#attached' => [
    'library' => [
    'geonorge_mosaic/geonorge_mosaic',
    ],


    'drupalSettings' => [
    'geonorge_mosaic' => [
    'zoom' => $zoom_level,
    'center_lat' => $center_lat,
    'center_lon' => $center_lon,
    ],
    ],
    ],
    ];*/
    // '#cache' => [
    // 'max-age' => 5,
    // ],
    return [
      '#type' => 'container',
      '#theme' => 'geonorge_mosaic-template',
      '#helptext' => $helptext,
      '#attached' => [
        'library' => [
          'geonorge_mosaic/geonorge_mosaic',
        ],

        'drupalSettings' => [
          'geonorge_mosaic' => [
            'zoom' => $zoom_level,
            'center_lat' => $center_lat,
            'center_lon' => $center_lon,
          ],
        ],
      ],
          // '#cache' => [
          // 'max-age' => 5,
          // ],
    ];
  }

  /**
   * Returns a page title.
   */
  public function getTitle() {
    // Get current language code.
    $language = $this->languageManager()->getCurrentLanguage()->getId();
    switch ($language) {
      case 'nb':
        $title = 'Geonorge Sentinel-2 Mosaikk';
        break;

      case 'en':
        $title = 'Geonorge Sentinel-2 Mosaic';
        break;
    }
    return $title;
  }

}
