var dialog, gsvc;
var layer, map, visible = [];
var GaugeLayer, stationLayer;
var geocoder;
require(["esri/map",
    "esri/geometry/Circle",
    "esri/layers/GraphicsLayer",
                "esri/dijit/LocateButton",
                "esri/dijit/BasemapToggle",
                "esri/dijit/BasemapGallery",
                "esri/arcgis/utils",
                "dojo/parser",
                "esri/layers/FeatureLayer",
                "esri/symbols/SimpleFillSymbol",
                "esri/symbols/SimpleLineSymbol",
                "esri/renderers/SimpleRenderer",
                "esri/graphic", "esri/lang",
                "dojo/_base/Color",
                "dojo/number",
                "dojo/dom-style",
                "dijit/TooltipDialog",
                "dijit/popup",
                "esri/toolbars/draw",
                "esri/symbols/PictureFillSymbol",
                "esri/symbols/SimpleMarkerSymbol",
                "esri/symbols/CartographicLineSymbol",
                "dojo/dom", "dojo/on",
                "esri/dijit/Geocoder",
                "esri/tasks/geometry",
                "esri/geometry/Point",
                "dijit/layout/BorderContainer",
                "esri/dijit/PopupTemplate",
                "dojo/domReady!",
],

                function (Map, Circle, GraphicsLayer, LocateButton, BasemapToggle, BasemapGallery, arcgisUtils, parser, FeatureLayer,
          SimpleFillSymbol, SimpleLineSymbol,
          SimpleRenderer, Graphic, esriLang,
          Color, number, domStyle,
          TooltipDialog, dijitPopup, Draw, PictureFillSymbol, SimpleMarkerSymbol, CartographicLineSymbol,
                    dom, on) {
                    parser.parse();
                    map = new Map("mapDiv", {
                        center: [-114.08529, 51.05011],
                        zoom: 8,
                        basemap: "streets",
                        slider: false
                    });


                    gsvc = new esri.tasks.GeometryService("http://136.159.14.34:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");

                    //layer = esri.layers.ArcGISDynamicMapServiceLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer");
                    //Added new layers with water sheded area
                    //layer = esri.layers.ArcGISDynamicMapServiceLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/BowCustomized/MapServer");
                    layer = esri.layers.ArcGISDynamicMapServiceLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer");
             
                    //add geocoder widget
                    geocoder = new esri.dijit.Geocoder({
                        map: map,
                        autoComplete: true,
                        arcgisGeocoder: {
                            name: "Esri World Geocoder",
                        }
                    }, "search");
                    geocoder.startup();

                    //map.addLayer(layer);

                    if (layer.loaded) {
                        buildLayerList(layer);
                    } else {
                        dojo.connect(layer, "onLoad", buildLayerList);
                    }

                    //var roadLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/3", {
                    //    id: "roadLayer"
                    //});
                    //map.addLayer(roadLayer);

                    //var streamLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/4", {
                    //    id: "streamLayer"

                    //});

                    //map.addLayer(streamLayer);
                    //var lakeLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/5", {
                    //    id: "lakeLayer"

                    //});
                    //map.addLayer(lakeLayer);

                    //var bowDEMLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/6", {
                    //    id: "bowDEMLayer"

                    //});
                    //map.addLayer(bowDEMLayer);

                    GaugeLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/0", {
                        id: "GaugeLayer",
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["Station_No", "Staition_Name"]
                    });
                    map.addLayer(GaugeLayer);

                    stationLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/1", {
                        id: "stattionLayer",
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["STATION_NAME", "PROVINCE", "ELEVATION"]
                    });
                    map.addLayer(stationLayer);

                    
                    //added for location button
                    geoLocate = new LocateButton({
                        map: map
                    }, "LocateButton");
                    geoLocate.startup();

                    //add the basemap gallery, in this case we'll display maps from ArcGIS.com including bing maps
                    var basemapGallery = new BasemapGallery({
                        showArcGISBasemaps: true,
                        map: map
                    }, "basemapGallery");
                    basemapGallery.startup();

                    basemapGallery.on("error", function (msg) {
                        console.log("basemap gallery error:  ", msg);
                    });

                    map.infoWindow.resize(300, 200);

                    dialog = new TooltipDialog({
                        id: "tooltipDialog",
                        style: "position: absolute; width: 250px; font: normal normal normal 10pt Helvetica;z-index:100"
                    });
                    dialog.startup();

                    var highlightSymbol = new SimpleFillSymbol(
                      SimpleFillSymbol.STYLE_SOLID,
                      new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        new Color([255, 0, 0]), 3
                      ),
                      new Color([125, 125, 125, 0.35])
                    );

                    //close the dialog when the mouse leaves the highlight graphic
                    map.on("load", function () {
                        map.graphics.enableMouseEvents();
                        map.graphics.on("mouse-out", closeDialog);

                    });
                    map.on("mouse-drag", function () {
                        closeDialog();

                    });

                    //"STATION_NAME", "PROVINCE", "ELEVATION"//listen for when the onMouseOver event fires on the countiesGraphicsLayer
                    //when fired, create a new graphic with the geometry from the event.graphic and add it to the maps graphics layer
                    stationLayer.on("click", function (evt) {
                        // var t = "<b>${STATION_NAME}</b><hr><b>${PROVINCE}</b><hr><b>${ELEVATION}</br>";
                        var t = "<table border=0 style=\"backgroundColor:#fff\"><tr><td>Station Name</td><td><strong> ${STATION_NAME}</strong></td><td><input id=\"detailButton\" type=\"button\" class=\"ui-state-default ui-corner-all\"onclick=\"javascript:showWeatherDetails('${STATION_NAME}');\"; value=\"Details\"></td></tr><tr><td>Province</td><td>${PROVINCE}</td></tr><tr><td>Elevation</td><td>${ELEVATION}</td></tr></table>";
                        var content = esriLang.substitute(evt.graphic.attributes, t);
                        var highlightGraphic = new Graphic(evt.graphic.geometry, highlightSymbol);
                        map.graphics.add(highlightGraphic);

                        dialog.setContent(content);

                        domStyle.set(dialog.domNode, "opacity", 0.85);
                        dijitPopup.open({
                            popup: dialog,
                            x: evt.pageX,
                            y: evt.pageY
                        });
                    });

                    GaugeLayer.on("click", function (evt) {
                        // var t = "<b>${STATION_NAME}</b><hr><b>${PROVINCE}</b><hr><b>${ELEVATION}</br>";
                        var t = "<table border=0 style=\"backgroundColor:#fff\"><tr><td>Station Name</td><td><strong> ${Staition_Name}</strong></td></tr><tr><td>STATION_NU</td><td>${Station_No}</td><td><input id=\"detailButton\" type=\"button\" class=\"ui-state-default ui-corner-all\"onclick=\"javascript:showMapDetails('${Station_No}');\"; value=\"Details\"></td></tr></table>";
                        var content = esriLang.substitute(evt.graphic.attributes, t);
                        var highlightGraphic = new Graphic(evt.graphic.geometry, highlightSymbol);
                        map.graphics.add(highlightGraphic);

                        dialog.setContent(content);

                        domStyle.set(dialog.domNode, "opacity", 0.85);
                        dijitPopup.open({
                            popup: dialog,
                            x: evt.pageX,
                            y: evt.pageY
                        });
                    });
                    GaugeLayer.on("click", doBuffer);

                    function closeDialog() {
                        map.graphics.clear();
                        dijitPopup.close(dialog);
                    }


                    //This code is added to bring map switch button inside the GIS map div i.e. mapDiv_root which is rendered at runtime
                    $("#Basemap_Gallery").appendTo("#mapDiv_root");
                    //same for locate button 
                    $("#LocateButton").appendTo("#mapDiv_root");
                    //same for locate button 
                    $("#Layer_galery").appendTo("#mapDiv_root");
                    //same for detail
                    $("#toggler").appendTo("#mapDiv_root");


                });

function buildLayerList(layer) {

    var items = dojo.map(layer.layerInfos, function (info, index) {
        // alert(info.id);
        if (info.defaultVisibility) {
            visible.push(info.id);
        }

        if (info.id == 0 || info.id == 1 || info.id == 2 || info.id == 3 || info.id == 4 || info.id == 18) {
           
            return "<input type='checkbox' class='list_item'" + (info.defaultVisibility ? "checked=checked" : "") + "' id='" + info.id + "' onclick='updateLayerVisibility(this);' /><label for='" + info.id + "'>" + getnamebyIndex(info, index) + "</label></br>";
        }
        else return "";

    });

    dojo.byId("layer_list").innerHTML = items.join(' ');

    layer.setVisibleLayers(visible);
    map.addLayer(layer);
    
}

function getnamebyIndex(info, index) {
    var x = info.name;
    switch (index) {
        case 0:
            x = "Gauge Station";
            break;
        case 1:
            x= "Weather Station";
            break;
        case 2:
            x = "100 Years Flood Plain";
            break;
        case 3:
            x = "Stream";
            break;
        case 4:
            x = "Roads";
            break;
        case 18:
            x = "Lakes";
            break;
    }

    return x;
}
function updateLayerVisibility(chk) {

    
    var inputs = dojo.query(".list_item"), input;

    visible = [];

    dojo.forEach(inputs, function (input) {
        //alert(input.id);

        if (input.checked) {
            visible.push(input.id);
            if (input.id == 0) {
                GaugeLayer.show();
            }
            if (input.id == 1) {
                stationLayer.show();
            }
        }
        if (!(input.checked) && (input.id == 0)) {
            GaugeLayer.hide();
        }
        if (!(input.checked) && (input.id == 1)) {
            stationLayer.hide();
        }

    });
    //if there aren't any layers visible set the array to be -1
    if (visible.length === 0) {
        visible.push(-1);
    }
    //making watersheds always visible
    visible.push(5);
    visible.push(6);
    visible.push(7);
    visible.push(8);
    visible.push(9);
    visible.push(10);
    visible.push(11);
    visible.push(12);
    visible.push(13);
    visible.push(14);
    visible.push(15);
    visible.push(16);
    visible.push(17);
    layer.setVisibleLayers(visible);
}

function doBuffer(evt) {

    map.graphics.clear();
    var params = new esri.tasks.BufferParameters();
    params.geometries = [evt.mapPoint];

    //buffer in linear units such as meters, km, miles etc.
    params.distances = [35, 60];
    params.unit = esri.tasks.GeometryService.UNIT_KILOMETER;
    params.outSpatialReference = map.spatialReference;

    gsvc.buffer(params, showBuffer);
}
// show the Buffer function 
function showBuffer(geometries) {
    var symbol = new esri.symbol.SimpleFillSymbol(
      esri.symbol.SimpleFillSymbol.STYLE_SOLID,
      new esri.symbol.SimpleLineSymbol(
        esri.symbol.SimpleLineSymbol.STYLE_SOLID,
        new dojo.Color([255, 99, 71, 1]), 2
      ),
      new dojo.Color([255, 99, 71, 0.35])
    );

    dojo.forEach(geometries, function (geometry) {
        var graphic = new esri.Graphic(geometry, symbol);
        map.graphics.add(graphic);
    });
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


// callback function to bring a hidden box back
function callback() {
};
// set effect from select menu value
function showMapDetails(stationCode) {
    // most effect types need no options passed by default

    var options = {};
    document.getElementById("toggler").style.visibility = "visible";
    $("#effect").effect("slide", options, 800, callback);
    showStationData(stationCode);

}

// Hide the slider
$(function () {
    // run the currently selected effect
    function runEffect() {
        // get effect type from
        var selectedEffect = "slide";

        // most effect types need no options passed by default
        var options = {};
        // some effects have required parameters


        // run the effect
        $("#effect").hide(selectedEffect, options, 1000);
    };

    // callback function to bring a hidden box back
    function callback() {
        setTimeout(function () {
            $("#effect").removeAttr("style").hide().fadeIn();
        }, 1000);
    };



    // More clicking point
    $(function () {
        var state = true;
        $("#more").click(function () {

            if (state) {

                $("#effect").animate({
                    backgroundColor: "#fff",
                    color: "#000",

                    width: 500
                }, 1000);
                document.getElementById("container").style.visibility = "visible";
            } else {
                $("#effect").animate({
                    backgroundColor: "#fff",
                    color: "#000",
                    width: 240
                }, 1000);
                document.getElementById("container").style.visibility = "hidden";
            }


            state = !state;
        });
    });


    // set effect from select menu value
    $("#hide").click(function () {
        runEffect();
        return false;
    });
});


//function for rendering graph
function showStationData(stationCode) {
    WaterLevel(stationCode);
}
//function for rendering weather data

function showWeatherDetails(stationCode) {
    getWeatherData(stationCode);
}





