console.log("Start of geonorge_mosaic map script:");
(function($, Drupal, drupalSettings) {

  console.log("Attaching geonorge_mosaic script to drupal behaviours:");
  /** Attach the metsis map to drupal behaviours function */
  Drupal.behaviors.geonorgeMosaic = {
    attach: function(context, drupalSettings) {
      $('#map', context).once().each(function() {
        //$('#map-res', context).once('metsisSearchBlock').each(function() {
        /** Start reading drupalSettings sent from the mapblock build */
        console.log('Initializing GEONORGE MOSAIC Map...');

        proj4.defs('EPSG:32661', '+proj=stere +lat_0=90 +lat_ts=90 +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m +no_defs');
        ol.proj.proj4.register(proj4);

        var proj32661 = new ol.proj.Projection({
          code: 'EPSG:32661',
          extent: [-4e+06, -6e+06, 8e+06, 8e+06]
        });

        var prj = proj32661;

        //import settings from configuration
        var zoom = drupalSettings.geonorge_mosaic.zoom;
        var center_lat = drupalSettings.geonorge_mosaic.center_lat;
        var center_lon = drupalSettings.geonorge_mosaic.center_lon;
        console.log("Got zoom-level: " + zoom);
        console.log("Got center latitude : " + center_lat);
        console.log("Got center longitude : " + center_lon);


        var layer = {};

        const osmStandard = new ol.layer.Tile({
          title: 'OSMStandard',
          baseLayer: true,
          visible: true,
          source: new ol.source.OSM({}),
        });

        const osmHumanitarian = new ol.layer.Tile({
          title: 'OSMHumanitarian',
          baseLayer: true,
          visible: false,
          source: new ol.source.OSM({
            url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
            crossOrigin: 'anonymous',
          }),
        });
        const yandex = new ol.layer.Tile({
          title: "Yandex",
          baseLayer: true,
          visible: false,
          source: new ol.source.XYZ({
            url: 'https://sat0{1-4}.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}',
            maxZoom: 15,
            transition: 0,
            //opaque: true,
            attributions: '© Yandex',
            crossOrigin: 'anonymous',
          }),
        });

        const esriSatellite = new ol.layer.Tile({
          title: "ESRI",
          baseLayer: true,
          visible: false,
          source: new ol.source.XYZ({
            attributions: ['Powered by Esri',
              'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
            ],
            attributionsCollapsible: false,
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            maxZoom: 23,
            crossOrigin: 'anonymous',
          }),
        });

        const stamenTerrain = new ol.layer.Tile({
          title: "stamenTerrain",
          baseLayer: true,
          visible: false,
          source: new ol.source.XYZ({
            attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
            url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
            crossOrigin: 'anonymous',
          }),
        });

        //Create a layergroup to hold the different basemaps
        const baseLayerGroup = new ol.layer.Group({
          title: 'Base Layers',
          //openInLayerSwitcher: true,
          layers: [
            osmStandard, osmHumanitarian, stamenTerrain, esriSatellite
          ],
        });

        // Border layer WMS
        layer['border'] = new ol.layer.Tile({

          source: new ol.source.TileWMS({
            projection: prj,
            url: 'https://public-wms.met.no/backgroundmaps/northpole.map',
            params: {
              'LAYERS': 'borders',
              'TRANSPARENT': 'true',
              'VERSION': '1.1.1',
              'FORMAT': 'image/png'
            }
          })
        });

        layer['gn_mosaic'] = new ol.layer.Tile({
          title: 'Geonorge Mosaic',
          openInLayerSwitcher: false,
          source: new ol.source.TileWMS({
            projection: "EPSG:25833",
            url: "https://wms.geonorge.no/skwms1/wms.sentinel2mosaikk",
            params: {
              'LAYERS': 'mosaikk,rutenett',
              'TRANSPARENT': 'true',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
            },
          })
        });

        layer['euro'] = new ol.layer.Tile({
          title: 'Europaveg',
          visible: false,
          source: new ol.source.TileWMS({
            projection: prj,
            url: 'https://openwms.statkart.no/skwms1/wms.vegnett?',
            params: {
              'LAYERS': 'europaveg',
              'TRANSPARENT': 'true',
              'VERSION': '1.3.0',
              'FORMAT': 'image/png'
            },
            //crossOrigin: 'anonymous'
          })
        });

        layer['fylk'] = new ol.layer.Tile({
          title: 'Fylkesveg',
          source: new ol.source.TileWMS({
            projection: prj,
            url: 'https://openwms.statkart.no/skwms1/wms.vegnett?',
            params: {
              'LAYERS': 'fylkesveg',
              'TRANSPARENT': 'true',
              'VERSION': '1.3.0',
              'FORMAT': 'image/png'
            },
            //crossOrigin: 'anonymous'
          })
        });

        layer['riks'] = new ol.layer.Tile({
          title: 'Riksveg',
          source: new ol.source.TileWMS({
            projection: prj,
            url: 'https://openwms.statkart.no/skwms1/wms.vegnett?',
            params: {
              'LAYERS': 'riksveg',
              'TRANSPARENT': 'true',
              'VERSION': '1.3.0',
              'FORMAT': 'image/png'
            },
            //crossOrigin: 'anonymous'
          })
        });


        // build up the map
        var centerLonLat1 = [center_lon, center_lat];
        var centerTrans1 = ol.proj.transform(centerLonLat1, "EPSG:4326", prj);

        var map = new ol.Map({
          controls: ol.control.defaults().extend([
            new ol.control.FullScreen()
          ]),
          target: 'map',
          layers: [baseLayerGroup,
            layer['gn_mosaic'],
            layer['euro'],
            layer['fylk'],
            layer['riks']
          ],
          view: new ol.View({
            zoom: zoom,
            minZoom: 1,
            maxZoom: 10,
            center: centerTrans1,
            projection: prj
          })
        });

        //Mouseposition
        var mousePositionControl = new ol.control.MousePosition({
          coordinateFormat: function(co) {
            return ol.coordinate.format(co, template = 'lon: {x}, lat: {y}', 2);
          },
          projection: 'EPSG:4326',
        });
        map.addControl(mousePositionControl);

        var lswitcher = new ol.control.LayerSwitcher({
          collapsed: false,
          reordering: false,
        });
        map.addControl(lswitcher);

        console.log("End of geonorge mosaic script");
      });
    },
  };
})(jQuery, Drupal, drupalSettings);
