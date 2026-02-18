console.log("Start of geonorge_mosaic map script:");
(function($, Drupal, drupalSettings, once) {

  console.log("Attaching geonorge_mosaic script to drupal behaviours:");
  /** Attach the metsis map to drupal behaviours function */
  Drupal.behaviors.geonorgeMosaic = {
    attach: function(context) {
      const mapEl = $(once('#map', '[data-geonorge-mosaic]', context));
      mapEl.each(function () {

        //$('#map', context).once().each(function() {
        //$('#map-res', context).once('metsisSearchBlock').each(function() {
        /** Start reading drupalSettings sent from the mapblock build */
        console.log('Initializing GEONORGE MOSAIC Map...');
        //Regiter projections
        //proj4.defs('EPSG:32661','+proj=stere +lat_0=90 +lat_ts=90 +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m +no_defs');
        proj4.defs("EPSG:32661", 'PROJCS["WGS 84 / UPS North (N,E)",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Polar_Stereographic"],PARAMETER["latitude_of_origin",90],PARAMETER["central_meridian",0],PARAMETER["scale_factor",0.994],PARAMETER["false_easting",2000000],PARAMETER["false_northing",2000000],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Northing",SOUTH],AXIS["Easting",SOUTH],AUTHORITY["EPSG","32661"]]');
        proj4.defs('EPSG:32632','+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
        proj4.defs('EPSG:32633','+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
        proj4.defs('EPSG:32634','+proj=utm +zone=34 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
        proj4.defs('EPSG:32635','+proj=utm +zone=35 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
	proj4.defs("EPSG:4258","+proj=longlat +ellps=GRS80 +no_defs +type=crs");

        ol.proj.proj4.register(proj4);

        var proj4258 = ol.proj.get('EPSG:4258');
        proj4258.setExtent([-16.1, 33.26, 38.01, 84.73]);

        var proj32661 = ol.proj.get('EPSG:32661');
        proj32661.setExtent([-4e+06, -6e+06, 8e+06, 8e+06]);

        var proj32632 = ol.proj.get('EPSG:32632');
        proj32632.setExtent([-477086, 5.53927e+06, 2.06741e+06, 8.90982e+06]);


        var proj32633 = ol.proj.get('EPSG:32633');
        proj32633.setExtent([-610721, 5.61167e+06, 1.63802e+06, 8.78545e+06]);


        var proj32634 = ol.proj.get('EPSG:32634');
        proj32634.setExtent([-1.03982e+06, 5.53707e+06, 1.50414e+06, 8.90695e+06]);


        var proj32635 = ol.proj.get('EPSG:32635');
        proj32635.setExtent([-1.46485e+06, 5.49786e+06, 1.36002e+06, 9.04106e+06]);


        //Default proejection
        var prj = proj32661;
        $('#projID').val("EPSG:32661" );
        //var prj = proj32632;
        //$('#projID').val(32632);

        //import settings from configuration
        var zoom = drupalSettings.geonorge_mosaic.zoom;
        var center_lat = drupalSettings.geonorge_mosaic.center_lat;
        var center_lon = drupalSettings.geonorge_mosaic.center_lon;
        console.log("Got zoom-level: " + zoom);
        console.log("Got center latitude : " + center_lat);
        console.log("Got center longitude : " + center_lon);
        console.log("creating map with projection:" + $('#projID').val());


        //Check projections.
        //console.log(ol.proj.get("EPSG:32632"));
        //console.log(ol.proj.get("EPSG:32633"));
        //console.log(ol.proj.get("EPSG:32634"));
        //console.log(ol.proj.get("EPSG:32635"));

        var layer = {};

        const osmStandard = new ol.layer.Tile({
          title: 'OSMStandard',
          baseLayer: true,
          visible: false,
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
          visible: true,
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
        var borderLayer = new ol.layer.Tile({
          title: 'Border',
          source: new ol.source.TileWMS({
            //projection: prj,
            url: 'https://public-wms.met.no/backgroundmaps/northpole.map',
            params: {
              'LAYERS': 'borders',
              'TRANSPARENT': 'true',
              'VERSION': '1.1.1',
              'FORMAT': 'image/png'
            }
          })
        });
        var geonorgeMosaicLayer = new ol.layer.Tile({
          title: 'Mosaikk 2025',
          //openInLayerSwitcher: false,
          source: new ol.source.TileWMS({
            //projection: "EPSG:25833",
            //projection: prj,
            crossOrigin: 'anonymous',
            url: "https://wms.geonorge.no/skwms1/wms.sentinel2",
            params: {
              'LAYERS': '2025',
              'TRANSPARENT': 'true',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
            },
          })
        });
        var geonorgeMosaicLayer2024 = new ol.layer.Tile({
          title: 'Mosaikk 2024',
          visible: false,
          //openInLayerSwitcher: false,
          source: new ol.source.TileWMS({
            //projection: "EPSG:25833",
            //projection: prj,
            crossOrigin: 'anonymous',
            url: "https://wms.geonorge.no/skwms1/wms.sentinel2",
            params: {
              'LAYERS': '2024',
              'TRANSPARENT': 'true',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
            },
          })
        });
        var geonorgeMosaicLayer2023 = new ol.layer.Tile({
          title: 'Mosaikk 2023',
          visible: false,
          //openInLayerSwitcher: false,
          source: new ol.source.TileWMS({
            //projection: "EPSG:25833",
            //projection: prj,
            crossOrigin: 'anonymous',
            url: "https://wms.geonorge.no/skwms1/wms.sentinel2",
            params: {
              'LAYERS': '2023',
              'TRANSPARENT': 'true',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
            },
          })
        });
        var geonorgeMosaicLayer2022 = new ol.layer.Tile({
          title: 'Mosaikk 2022',
          visible: false,
          //openInLayerSwitcher: false,
          source: new ol.source.TileWMS({
            //projection: "EPSG:25833",
            //projection: prj,
            crossOrigin: 'anonymous',
            url: "https://wms.geonorge.no/skwms1/wms.sentinel2",
            params: {
              'LAYERS': '2022',
              'TRANSPARENT': 'true',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
            },
          })
        });
        var geonorgeMosaicLayer2021 = new ol.layer.Tile({
          title: 'Mosaikk 2021',
          visible: false,
          //openInLayerSwitcher: false,
          source: new ol.source.TileWMS({
            //projection: "EPSG:25833",
            //projection: prj,
            crossOrigin: 'anonymous',
            url: "https://wms.geonorge.no/skwms1/wms.sentinel2",
            params: {
              'LAYERS': '2021',
              'TRANSPARENT': 'true',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
            },
          })
        });

        var geonorgeMosaicLayer2020 = new ol.layer.Tile({
          title: 'Mosaikk 2020',
          visible: false,
          //openInLayerSwitcher: false,
          source: new ol.source.TileWMS({
            //projection: "EPSG:25833",
            //projection: prj,
            crossOrigin: 'anonymous',
            url: "https://wms.geonorge.no/skwms1/wms.sentinel2",
            params: {
              'LAYERS': '2020',
              'TRANSPARENT': 'true',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
            },
          })
        });

        var geonorgeMosaicLayer2019 = new ol.layer.Tile({
          title: 'Mosaikk 2019',
          //openInLayerSwitcher: false,
          visible: false,
          source: new ol.source.TileWMS({
            //projection: "EPSG:25833",
            //projection: prj,
            crossOrigin: 'anonymous',
            //url: "https://wms.geonorge.no/skwms1/wms.sentinel2mosaikk",
            url: "https://wms.geonorge.no/skwms1/wms.sentinel2",
            params: {
              'LAYERS': '2019',
              'TRANSPARENT': 'true',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
            },
          })
        });

        var geonorgeMosaicLayer2018 = new ol.layer.Tile({
          title: 'Mosaikk 2018',
          //openInLayerSwitcher: false,
          visible: false,
          source: new ol.source.TileWMS({
            //projection: "EPSG:25833",
            //projection: prj,
            crossOrigin: 'anonymous',
            //url: "https://wms.geonorge.no/skwms1/wms.sentinel2mosaikk",
            url: "https://wms.geonorge.no/skwms1/wms.sentinel2",
            params: {
              'LAYERS': '2018',
              'TRANSPARENT': 'true',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
            },
          })
        });

        var geonorgeRutenettLayer = new ol.layer.Tile({
          title: 'Rutenett',
          //openInLayerSwitcher: false,
          visible: false,
          source: new ol.source.TileWMS({
            //projection: "EPSG:25833",
            //projection: prj,
            crossOrigin: 'anonymous',
            url: "https://wms.geonorge.no/skwms1/wms.sentinel2mosaikk",
            params: {
              'LAYERS': 'rutenett',
              'TRANSPARENT': 'true',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
            },
          })
        });

        const geonorgeMosaicLayerGroup = new ol.layer.Group({
          title: 'Geonorge Mosaic',
          openInLayerSwitcher: true,
          layers: [
            geonorgeMosaicLayer2018,
            geonorgeMosaicLayer2019,
            geonorgeMosaicLayer2020,
            geonorgeMosaicLayer2021,
            geonorgeMosaicLayer2022,
            geonorgeMosaicLayer2023,
            geonorgeMosaicLayer //, geonorgeRutenettLayer
          ],
        });

        var europaVegLayer = new ol.layer.Tile({
          title: 'Europaveg',
          visible: true,
          crossOrigin: 'anonymous',
          source: new ol.source.TileWMS({
            //projection: prj,
            url: 'https://wms.geonorge.no/skwms1/wms.vegnett2',
            params: {
              'LAYERS': 'europaveg',
              'TRANSPARENT': 'true',
              'VERSION': '1.3.0',
              'FORMAT': 'image/png'
            },
            //crossOrigin: 'anonymous'
          })
        });

        var fylkesVegLayer = new ol.layer.Tile({
          title: 'Fylkesveg',
          visible: true,
          source: new ol.source.TileWMS({
            //projection: prj,
            crossOrigin: 'anonymous',
            url: 'https://wms.geonorge.no/skwms1/wms.vegnett2',
            params: {
              'LAYERS': 'fylkesveg',
              'TRANSPARENT': 'true',
              'VERSION': '1.3.0',
              'FORMAT': 'image/png'
            },
            //crossOrigin: 'anonymous'
          })
        });

        var riksVegLayer = new ol.layer.Tile({
          title: 'Riksveg',
          visible: true,
          source: new ol.source.TileWMS({
            //projection: prj,
            crossOrigin: 'anonymous',
            url: 'https://wms.geonorge.no/skwms1/wms.vegnett2',
            params: {
              'LAYERS': 'riksveg',
              'TRANSPARENT': 'true',
              'VERSION': '1.3.0',
              'FORMAT': 'image/png'
            },
            //crossOrigin: 'anonymous'
          })
        });

        const vegLayerGroup = new ol.layer.Group({
          title: 'Veg',
          visible: false,
          //openInLayerSwitcher: true,
          layers: [
            europaVegLayer, fylkesVegLayer, riksVegLayer
          ],
        });

        var territorialGrenseLayer = new ol.layer.Tile({
          title: 'Territorialgrense',
          visible: true,
          source: new ol.source.TileWMS({
            //projection: prj,
            crossOrigin: 'anonymous',
            projection: 'EPSG:4258',
            url: 'https://wms.geonorge.no/skwms1/wms.grunnkretser',
            params: {
              'LAYERS': 'Territorialgrense',
              'TRANSPARENT': 'true',
              'VERSION': '1.3.0',
              'FORMAT': 'image/png'
            },
            //crossOrigin: 'anonymous'
          })
        });

        var riksGrenseLayer = new ol.layer.Tile({
          title: 'Riksgrense',
          visible: true,
          source: new ol.source.TileWMS({
            //projection: prj,
            projection: 'EPSG:4258',
            crossOrigin: 'anonymous',
            url: 'https://wms.geonorge.no/skwms1/wms.grunnkretser',
            params: {
              'LAYERS': 'Riksgrense',
              'TRANSPARENT': 'true',
              'VERSION': '1.3.0',
              'FORMAT': 'image/png'
            },
            //crossOrigin: 'anonymous'
          })
        });
        var fylkesGrenserLayer = new ol.layer.Tile({
          title: 'Fylkesgrenser',
          visible: false,
          source: new ol.source.TileWMS({
            projection: 'EPSG:4258',
            crossOrigin: 'anonymous',
            url: 'https://wms.geonorge.no/skwms1/wms.grunnkretser',
            params: {
              'LAYERS': 'Fylker',
              'TRANSPARENT': 'false',
              'STYLE': 'default',
              'VERSION': '1.3.0',
              'FORMAT': 'image/png'
            },
            //crossOrigin: 'anonymous'
          })
        });

        var kommuneGrenserLayer = new ol.layer.Tile({
          title: 'Kommunesgrenser',
          visible: false,
          source: new ol.source.TileWMS({
            //projection: prj,
            projection: 'EPSG:4258',
            crossOrigin: 'anonymous',
            url: 'https://wms.geonorge.no/skwms1/wms.grunnkretser',
            params: {
              'LAYERS': 'Kommuner',
              'TRANSPARENT': 'true',
              'VERSION': '1.3.0',
              'FORMAT': 'image/png'
            },
            //crossOrigin: 'anonymous'
          })
        });

        const borderLayerGroup = new ol.layer.Group({
          title: 'Grenser',
          visible: false,
          //openInLayerSwitcher: true,
          layers: [
            territorialGrenseLayer, riksGrenseLayer, fylkesGrenserLayer, kommuneGrenserLayer
          ],
        });

        // build up the map
        var centerLonLat1 = [center_lon, center_lat];
        var centerTrans1 = ol.proj.transform(centerLonLat1, "EPSG:4326", prj);

        //Change opacitu of layergroup base
        baseLayerGroup.setOpacity(0.7);
        var map = new ol.Map({
          controls: ol.control.defaults().extend([
            new ol.control.FullScreen()
          ]),
          target: 'map',
          layers: [baseLayerGroup,
            geonorgeMosaicLayerGroup,
            // borderLayerGroup,
            vegLayerGroup
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
          show_progress: true,
          reordering: false,
        });
        map.addControl(lswitcher);


        //Change projection event.
        $('#projID').on('change', function() {
          var newProj = ol.proj.get($(this).val());
          var newProjExtent = newProj.getExtent();
          console.log('Chosen projection:' + newProj.getCode());
          console.log("Updating projections on layers and view");
          var newView = new ol.View({
            projection: newProj,
            //center: ol.extent.getCenter(newProjExtent || [0, 0, 0, 0]),
            center: ol.extent.getCenter(newProjExtent || centerTrans1),
            zoom: 2,
            extent: newProjExtent || undefined,
          });

          if (newProj.getCode() === 'EPSG:32661') {
            newView = new ol.View({
              zoom: zoom,
              minZoom: 1,
              maxZoom: 14,
              center: centerTrans1,
              projection: newProj
            })
            map.setView(newView);
          }
          else {
            map.setView(newView);
          }
          //console.log(prj);
          //layer['gn_mosaic'].getSource().set('projection', prj);
          //layer['euro'].getSource().set('projection', prj);
          //layer['fylk'].getSource().set('projection', prj);
          //layer['riks'].getSource().set('projection', prj);
          //map.getView().set('projection', prj);
          geonorgeMosaicLayerGroup.getLayers().forEach( function (el, idx, arr) {
            el.getSource().refresh();
          });
          map.getView().setZoom(map.getView().getZoom());
        });

        console.log("End of geonorge mosaic script");
      });
    },
  };
})(jQuery, Drupal, drupalSettings, once);
