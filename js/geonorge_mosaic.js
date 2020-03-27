proj4.defs('EPSG:32661', '+proj=stere +lat_0=90 +lat_ts=90 +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m +no_defs');
ol.proj.proj4.register(proj4);

var proj32661 = new ol.proj.Projection({
  code: 'EPSG:32661',
  extent: [-4e+06,-6e+06,8e+06,8e+06]
});

var prj = proj32661;

//import settings from configuration
var zoom = Drupal.settings.zoom;
var center_lat = Drupal.settings.center_lat;
var center_lon = Drupal.settings.center_lon;

console.log(zoom);
console.log(center_lat);
console.log(center_lon);

var layer = {};

// Base layer WMS
layer['base']  = new ol.layer.Tile({
   type: 'base',
   source: new ol.source.TileWMS({ 
       url: 'http://public-wms.met.no/backgroundmaps/northpole.map',
       params: {'LAYERS': 'world', 'TRANSPARENT':'true', 'VERSION':'1.1.1','FORMAT':'image/png', 'SRS':prj}
   })
});

// Border layer WMS
layer['border']  = new ol.layer.Tile({
   source: new ol.source.TileWMS({
       url: 'http://public-wms.met.no/backgroundmaps/northpole.map',
       params: {'LAYERS': 'borders', 'TRANSPARENT':'true', 'VERSION':'1.1.1','FORMAT':'image/png', 'SRS':prj}
   })
});

layer['gn_mosaic']  = new ol.layer.Tile({
       source: new ol.source.TileWMS({
       url: "http://wms.geonorge.no/skwms1/wms.sentinel2mosaikk",
       params: {'LAYERS': 'mosaikk,rutenett', 
                'TRANSPARENT':'true', 
                'FORMAT':'image/png', 
                'CRS':'EPSG:25833', 
                'VERSION':'1.3.0', 
                'SERVICE':'WMS',
                'REQUEST':'GetMap',
                'TILE':'true','WIDTH':'256','HEIGHT':'256'}
   })
});

layer['euro']  = new ol.layer.Tile({
   title: 'Europaveg',
   visible: false,
   source: new ol.source.TileWMS({
       url: 'https://openwms.statkart.no/skwms1/wms.vegnett?',
       params: {'LAYERS': 'europaveg', 'TRANSPARENT':'true', 'VERSION':'1.3.0','FORMAT':'image/png', 'CRS':prj},
       //crossOrigin: 'anonymous'
   })
});

layer['fylk']  = new ol.layer.Tile({
   title: 'Fylkesveg',
   source: new ol.source.TileWMS({
       url: 'https://openwms.statkart.no/skwms1/wms.vegnett?',
       params: {'LAYERS': 'fylkesveg', 'TRANSPARENT':'true', 'VERSION':'1.3.0','FORMAT':'image/png', 'CRS':prj},
       //crossOrigin: 'anonymous'
   })
});

layer['riks']  = new ol.layer.Tile({
   title: 'Riksveg',
   source: new ol.source.TileWMS({
       url: 'https://openwms.statkart.no/skwms1/wms.vegnett?',
       params: {'LAYERS': 'riksveg', 'TRANSPARENT':'true', 'VERSION':'1.3.0','FORMAT':'image/png', 'CRS':prj},
       //crossOrigin: 'anonymous'
   })
});


// build up the map 
var centerLonLat1 = [center_lon, center_lat];
var centerTrans1 = ol.proj.transform(centerLonLat1, "EPSG:4326",  prj);

var map = new ol.Map({
   controls: ol.control.defaults().extend([
      new ol.control.FullScreen()
   ]),
   target: 'map',
   layers: [ layer['base'],
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
   coordinateFormat : function(co) {
      return ol.coordinate.format(co, template = 'lon: {x}, lat: {y}', 2);
   },
   projection : 'EPSG:4326',
});
map.addControl(mousePositionControl);

var lswitcher = new ol.control.LayerSwitcher({});
map.addControl(lswitcher);
lswitcher.showPanel();

