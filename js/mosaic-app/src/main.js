console.log("Start of geonorge_mosaic map script:");

import "ol/ol.css";
import "./style.css";
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/WebGLTile';
import GroupLayer from 'ol/layer/Group';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import { get as getProjection, transformExtent } from 'ol/proj';
import { getCenter } from 'ol/extent';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4.js';

import { defaults as defaultControls } from 'ol/control/defaults';
import FullScreen from 'ol/control/FullScreen';
import MousePosition from 'ol/control/MousePosition';

/**
 * Approximate bounding box (lon/lat, EPSG:4326) covering Norway mainland,
 * used to fit the map view on load and whenever the projection changes.
 */
const NORWAY_MAINLAND_EXTENT_4326 = [4.0, 57.8, 31.5, 71.5];

/**
 * Register Projections
 */
function registerProjections() {
  // EPSG:32661 (WGS 84 / UPS North) is provided via WKT since the WMS
  // endpoint only supports this EPSG code (not EPSG:5041, its proj4
  // built-in equivalent). EPSG:326xx UTM zones are built into proj4's
  // default definitions. Only EPSG:4258 (ETRS89) needs an explicit
  // proj4-string definition here.
  proj4.defs("EPSG:32661", 'PROJCS["WGS 84 / UPS North (N,E)",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Polar_Stereographic"],PARAMETER["latitude_of_origin",90],PARAMETER["central_meridian",0],PARAMETER["scale_factor",0.994],PARAMETER["false_easting",2000000],PARAMETER["false_northing",2000000],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Northing",SOUTH],AXIS["Easting",SOUTH],AUTHORITY["EPSG","32661"]]');
  proj4.defs("EPSG:4258", "+proj=longlat +ellps=GRS80 +no_defs +type=crs");

  register(proj4);

  // Set extents for projections
  getProjection("EPSG:4258").setExtent([-16.1, 33.26, 38.01, 84.73]);
  getProjection("EPSG:32661").setExtent([-4e6, -6e6, 8e6, 8e6]);
  getProjection("EPSG:32632").setExtent([-477086, 5.53927e6, 2.06741e6, 8.90982e6]);
  getProjection("EPSG:32633").setExtent([-610721, 5.61167e6, 1.63802e6, 8.78545e6]);
  getProjection("EPSG:32634").setExtent([-1.03982e6, 5.53707e6, 1.50414e6, 8.90695e6]);
  getProjection("EPSG:32635").setExtent([-1.46485e6, 5.49786e6, 1.36002e6, 9.04106e6]);

  console.log("Projections registered.");
}

/**
 * Create Map Layers
 */
function createBaseLayer() {
  return new TileLayer({
    title: 'ESRI Satellite',
    visible: true,
    source: new XYZ({
      attributions: ['Powered by Esri', 'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maxZoom: 23,
      crossOrigin: 'anonymous',
    }),
  });
}

function createGeonorgeMosaicLayers() {
  const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
  const mosaicLayers = years.map(year => (
    new TileLayer({
      title: `Mosaikk ${year}`,
      visible: year === 2025, // Default visible layer
      source: new TileWMS({
        url: 'https://wms.geonorge.no/skwms1/wms.sentinel2',
        params: {
          LAYERS: `${year}`,
          TRANSPARENT: 'true',
          FORMAT: 'image/png',
          VERSION: '1.3.0',
        },
        crossOrigin: 'anonymous',
      }),
    })
  ));

  return new GroupLayer({
    title: 'Geonorge Mosaic',
    layers: mosaicLayers,
  });
}

/**
 * Build a simple radio-button based layer switcher for the mosaic years.
 * Since the mosaic layers are a static, mutually exclusive set (one year
 * visible at a time), a full third-party layer switcher control is
 * unnecessary; this keeps the bundle small and dependency-free.
 * @param {import('ol/layer/Group').default} mosaicLayerGroup
 * @param {HTMLElement} container
 */
function createLayerSwitcher(mosaicLayerGroup, container) {
  const mosaicLayers = mosaicLayerGroup.getLayers().getArray();
  const fieldsetName = 'geonorge-mosaic-year';

  const list = document.createElement('ul');
  list.className = 'geonorge-mosaic-switcher';

  mosaicLayers.forEach((layer, index) => {
    const id = `${fieldsetName}-${index}`;

    const listItem = document.createElement('li');
    listItem.className = 'geonorge-mosaic-switcher__item';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = fieldsetName;
    input.id = id;
    input.className = 'geonorge-mosaic-switcher__input';
    input.checked = layer.getVisible();
    input.addEventListener('change', () => {
      mosaicLayers.forEach(mosaicLayer => mosaicLayer.setVisible(mosaicLayer === layer));
    });

    const label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'geonorge-mosaic-switcher__label';
    label.textContent = layer.get('title');

    listItem.append(input, label);
    list.append(listItem);
  });

  container.replaceChildren(list);
}


/**
 * Fit the map view to the Norway mainland extent, reprojecting the
 * reference extent into the view's current projection first.
 * @param {import('ol/Map').default} map
 */
function fitNorwayExtent(map) {
  const view = map.getView();
  const extent = transformExtent(NORWAY_MAINLAND_EXTENT_4326, 'EPSG:4326', view.getProjection());
  view.fit(extent, {
    size: map.getSize(),
    padding: [16, 16, 16, 16],
    constrainResolution: false,
  });
}

/**
 * Wire the projection <select> so that choosing a different EPSG code
 * swaps the map's view projection and re-fits it to the Norway mainland
 * extent (layer sources are reprojected on the fly by OpenLayers).
 * @param {import('ol/Map').default} map
 * @param {HTMLSelectElement} selectElement
 */
function createProjectionSwitcher(map, selectElement) {
  selectElement.addEventListener('change', () => {
    const projection = getProjection(selectElement.value);
    if (!projection) {
      console.warn(`Unknown projection selected: ${selectElement.value}`);
      return;
    }

    const extent = transformExtent(NORWAY_MAINLAND_EXTENT_4326, 'EPSG:4326', projection);
    map.setView(new View({ projection, center: getCenter(extent) }));
    fitNorwayExtent(map);
  });
}

/**
 * Create the OpenLayers map
 * @param {Object} settings - Drupal settings
 * @param {HTMLElement} mapElement - The DOM element where the map will render
 * @param {HTMLElement} layerSwitcherElement - The layer switcher container
 * @param {HTMLSelectElement|null} projectionSelectElement - The projection <select> element
 */
function createMap(settings, mapElement, layerSwitcherElement, projectionSelectElement) {
  console.log('Initializing Geonorge Mosaic Map...');

  // Register projections
  registerProjections();

  // Read settings
  const { zoom } = settings;
  const defaultProjection = getProjection('EPSG:32661');
  const initialExtent = transformExtent(NORWAY_MAINLAND_EXTENT_4326, 'EPSG:4326', defaultProjection);

  // Create layers
  const baseLayer = createBaseLayer();
  const geonorgeMosaicLayerGroup = createGeonorgeMosaicLayers();

  // Build the map
  const map = new Map({
    target: mapElement,
    layers: [baseLayer, geonorgeMosaicLayerGroup],
    view: new View({
      zoom,
      center: getCenter(initialExtent),
      projection: defaultProjection,
    }),
    controls: defaultControls().extend([new FullScreen()]),
  });

  // Fit the view to Norway mainland once the map has a known size.
  map.once('rendercomplete', () => fitNorwayExtent(map));

  // Add mouse position control
  const mousePositionControl = new MousePosition({
    coordinateFormat: coord => `lon: ${coord[0].toFixed(2)}, lat: ${coord[1].toFixed(2)}`,
    projection: 'EPSG:4326',
  });
  map.addControl(mousePositionControl);

  // Build the custom layer switcher for the mosaic years
  createLayerSwitcher(geonorgeMosaicLayerGroup, layerSwitcherElement);

  // Wire up the projection selector, if present
  if (projectionSelectElement) {
    createProjectionSwitcher(map, projectionSelectElement);
  }

  console.log('Geonorge Mosaic Map initialized.');
}

/**
 * Drupal behavior to initialize the map
 */
(function (Drupal, drupalSettings) {
  Drupal.behaviors.geonorgeMosaic = {
    attach: function (context) {
      const mapElements = context.querySelectorAll('[data-geonorge-mosaic]:not([data-geonorge-mosaic-processed])');
      mapElements.forEach(mapEl => {
        const appElement = mapEl.closest('[data-geonorge-mosaic-app]');
        const layoutElement = mapEl.closest('[data-geonorge-mosaic-layout]');
        const layerSwitcherElement = layoutElement?.querySelector('[data-geonorge-mosaic-layer-switcher]');
        const projectionSelectElement = appElement?.querySelector('[data-geonorge-mosaic-projection]');

        if (!layerSwitcherElement) {
          throw new Error('Geonorge Mosaic layer switcher container is missing.');
        }

        createMap(drupalSettings.geonorge_mosaic, mapEl, layerSwitcherElement, projectionSelectElement);
        mapEl.setAttribute('data-geonorge-mosaic-processed', 'true');
      });
    },
  };
})(Drupal, drupalSettings);
