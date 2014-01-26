var map;
require(["esri/map",
                "esri/dijit/LocateButton",
                "esri/dijit/BasemapToggle",
                "esri/dijit/BasemapGallery",
                "esri/arcgis/utils",
                "dojo/parser",
                "esri/geometry/Point",
                "esri/graphic",
                "esri/symbols/SimpleMarkerSymbol",
                "dijit/layout/BorderContainer",
                "esri/dijit/PopupTemplate",
                "dojo/domReady!"],
                function (Map, LocateButton, BasemapToggle, BasemapGallery, arcgisUtils, parser) {
                    parser.parse();
                    map = new Map("mapDiv", {
                        center: [-114.08529, 51.05011],
                        zoom: 8,
                        basemap: "streets"
                    });


                    //added for location button
                    geoLocate = new LocateButton({
                        map: map
                    }, "LocateButton");
                    geoLocate.startup();

                    //Added to toggle content of the map
                    /*var toggle = new BasemapToggle({
                    map: map,
                    basemap: "satellite"
                    }, "BasemapToggle");
                    toggle.startup();*/

                    //add the basemap gallery, in this case we'll display maps from ArcGIS.com including bing maps
                    var basemapGallery = new BasemapGallery({
                        showArcGISBasemaps: true,
                        map: map
                    }, "basemapGallery");
                    basemapGallery.startup();

                    basemapGallery.on("error", function (msg) {
                        console.log("basemap gallery error:  ", msg);
                    });
                    //This code is added to bring map switch button inside the GIS map div i.e. mapDiv_root which is rendered at runtime
                    $("#Basemap_Gallery").appendTo("#mapDiv_root");
                    //same for locate button 
                    $("#LocateButton").appendTo("#mapDiv_root");
                    //same for locate button 
                    $("#Layer_galery").appendTo("#mapDiv_root");

                });


/* function init() {
     var layer = new esri.layers.ArcGISDynamicMapServiceLayer("http://136.159.14.34:6080/arcgis/rest/services/Bow1Test/MapServer");
     map.addLayer(layer);
 }*/

var Layer0;
function init() {

    Layer0 = new esri.layers.ArcGISDynamicMapServiceLayer("http://136.159.14.34:6080/arcgis/rest/services/Bow1Test/MapServer", { id: "Bow1Test" });
    map.addLayer(Layer0);
}
function selectLayer() {

    var stnLyr = document.getElementById('stationLayer').checked;
    var rdLyr = document.getElementById('roadLayer').checked;
    var strmLyr = document.getElementById('streamLayer').checked;
    var lakLyr = document.getElementById('lakeLayer').checked;
    var demLyr = document.getElementById('demLayer').checked;

    var selectedLayers = "";
    if (stnLyr) {
        if (selectedLayers === "") {
            selectedLayers = +'0';

        } else {
            selectedLayers += "," + '0';
        }

    }

    if (rdLyr) {

        if (selectedLayers === "") {
            selectedLayers = +'1';

        } else {
            selectedLayers += "," + '1';
        }
    }
    if (strmLyr) {

        if (selectedLayers === "") {
            selectedLayers = +'2';
        } else {
            selectedLayers += "," + '2';
        }
    }
    if (lakLyr) {

        if (selectedLayers === "") {
            selectedLayers = +'3';
        } else {
            selectedLayers += "," + '3';
        }
    }
    if (demLyr) {

        if (selectedLayers === "") {
            selectedLayers = +'4';
        } else {
            selectedLayers += "," + '4';
        }
    }
    Layer0.setVisibleLayers([selectedLayers]);

}

//ArcGISTiledMapServiceLayer
//ArcGISDynamicMapServiceLayer
dojo.addOnLoad(init);

//Yellow Marker on the screen 
var symbol = new esri.symbol.PictureMarkerSymbol({
    "angle": 0,
    "xoffset": 0,
    "yoffset": 10,
    "type": "esriPMS",
    "url": "http://static.arcgis.com/images/Symbols/Shapes/YellowPin1LargeB.png",
    "contentType": "image/png",
    "width": 24,
    "height": 24
});

//This is the popup box shown on the screen 
var template = new esri.InfoTemplate("${name}, ${*}");

//Function to locate particular locaiton on the map
function locate_station(latitude,longitutde,stationId)
{
    //TODO: search function for the to locate poin check this link https://developers.arcgis.com/en/javascript/jsapi/point.html
    //Link station from the search box to stattion list 
}
require([
  "esri/map",
  "esri/dijit/Geocoder",

  "esri/graphic",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/geometry/screenUtils",

  "dojo/dom",
  "dojo/dom-construct",
  "dojo/query",
  "dojo/_base/Color",

  "dojo/domReady!"
],
function showLocation() {
    map.graphics.clear();
    var point = new esri.geometry.Point(117,52);
    var symbol1 = new SimpleMarkerSymbol()
      .setStyle("square")
      .setColor(new Color([255,0,0,0.5]));
    var graphic = new Graphic(point, symbol1);
    map.graphics.add(graphic);

    map.infoWindow.setTitle("Search Result");
    map.infoWindow.setContent(evt.result.name);
    map.infoWindow.show(evt.result.feature.geometry);
});