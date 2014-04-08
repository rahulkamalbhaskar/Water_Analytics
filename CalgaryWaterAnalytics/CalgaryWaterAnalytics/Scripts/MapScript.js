var dialog, gsvc, tb;
var layer, map, visible = [];
var GaugeLayer, stationLayer;
var findTask, findParams;
var geocoder;
require(["esri/map", "esri/tasks/GeometryService", "esri/tasks/BufferParameters", "esri/config",
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
                "dojo/dom", "dojo/dom-attr", "dojo/_base/array", "dojo/on",
                "esri/symbols/SimpleFillSymbol",
                 "esri/renderers/ClassBreaksRenderer",
                "esri/InfoTemplate", 
                "dojo/_base/Color",
                "esri/dijit/Geocoder",
                "esri/tasks/geometry",
                "esri/geometry/Point",
                "dijit/layout/BorderContainer",
                "esri/dijit/PopupTemplate", "dijit/layout/ContentPane",
                "dojo/domReady!"
],

                function (Map, GeometryService, BufferParameters, esriConfig, Circle, GraphicsLayer, LocateButton, BasemapToggle, BasemapGallery, arcgisUtils, parser, FeatureLayer,
          SimpleFillSymbol, SimpleLineSymbol,
          SimpleRenderer, Graphic, esriLang,
          Color, number, domStyle,
          TooltipDialog, dijitPopup, Draw, PictureFillSymbol, SimpleMarkerSymbol, CartographicLineSymbol,
                    dom, domAttr, array, on, SimpleFillSymbol, ClassBreaksRenderer, InfoTemplate, Color) {
                    parser.parse();
                    map = new Map("mapDiv", {
                        center: [-114.08529, 51.05011],
                        zoom: 8,
                        basemap: "streets",
                        //slider: false
                    });

                    gsvc = new esri.tasks.GeometryService("http://136.159.14.34:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
                   
                   

                    //add search box for stations
                    //create find task with url to map service
                    findTask = new esri.tasks.FindTask("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer");

                    //create find parameters and define known values
                    findParams = new esri.tasks.FindParameters();
                    findParams.returnGeometry = true;
                    findParams.layerIds = [0, 1];
                    findParams.searchFields = ["Station_No", "Staition_Name", "STATION_NAME"];
                    var sr = new esri.SpatialReference({ wkid: 4326 });

                    findParams.outSpatialReference = sr

                    map.on("load", initToolbar);
                    esriConfig.defaults.io.proxyUrl = "/proxy";
                    esriConfig.defaults.io.alwaysUseProxy = false;

                    function initToolbar(evtObj) {
                        app.tb = new Draw(evtObj.map);
                        app.tb.on("draw-end", doBuffer);
                    }

                 
                    function doBuffer(evtObj) {
                        var geometry = evtObj.geometry,
                        map = app.map,
                        gsvc = app.gsvc;
                        switch (geometry.type) {
                            case "point":
                                var symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
                                break;
                            case "polyline":
                                var symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 1);
                                break;
                            case "polygon":
                                var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NONE, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));
                                break;
                        }

                        var graphic = new Graphic(geometry, symbol);
                        map.graphics.add(graphic);

                        //setup the buffer parameters
                        var params = new BufferParameters();
                        params.distances = [dom.byId("distance").value];
                        params.bufferSpatialReference = new esri.SpatialReference({ wkid: dom.byId("bufferSpatialReference").value });
                        params.outSpatialReference = map.spatialReference;
                        params.unit = GeometryService[dom.byId("unit").value];

                        if (geometry.type === "polygon") {
                            //if geometry is a polygon then simplify polygon.  This will make the user drawn polygon topologically correct.
                            gsvc.simplify([geometry], function (geometries) {
                                params.geometries = geometries;
                                gsvc.buffer(params, showBuffer);
                            });
                        } else {
                            params.geometries = [geometry];
                            gsvc.buffer(params, showBuffer);
                        }
                    }

                    function showBuffer(bufferedGeometries) {
                        var symbol = new SimpleFillSymbol(
                          SimpleFillSymbol.STYLE_SOLID,
                          new SimpleLineSymbol(
                            SimpleLineSymbol.STYLE_SOLID,
                            new Color([255, 0, 0, 0.65]), 2
                          ),
                          new Color([255, 0, 0, 0.35])
                        );

                        array.forEach(bufferedGeometries, function (geometry) {
                            var graphic = new Graphic(geometry, symbol);
                            app.map.graphics.add(graphic);
                        });
                        //app.tb.deactivate();
                        app.map.showZoomSlider();
                    }

                    app = {
                        map: map,
                        tb: tb,
                        gsvc: gsvc
                    };
                    
                    
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

                    
                    //this part is for making watersheds Clickable
                    var symbol = new SimpleFillSymbol();
                    symbol.setColor(new Color([150, 150, 150, 0.5]));
                    var renderer = new ClassBreaksRenderer(symbol, "FID");
                    renderer.addBreak(0, 0, new SimpleFillSymbol().setColor(new Color([56, 168, 0, 0.5])));
                    //renderer.addBreak(50, 100, new SimpleFillSymbol().setColor(new Color([139, 209, 0, 0.5])));

                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/5", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);


                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/6", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);


                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/7", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);

                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/8", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);

                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/9", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);


                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/10", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);

                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/11", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);

                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/12", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);


                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/13", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);

                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/14", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);

                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/15", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);

                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/16", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);

                    var infoTemplate = new InfoTemplate("${*}");
                    var featureLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/17", {
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["*"],
                        infoTemplate: infoTemplate
                    });

                    //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                    featureLayer.setRenderer(renderer);
                    map.addLayer(featureLayer);
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
                        outFields: ["STATION_NAME","CLIMATE_ID", "PROVINCE", "ELEVATION"]
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
                        var t = "<table border=0 style=\"backgroundColor:#fff\"><tr><td>Station Name</td><td><strong> ${STATION_NAME}</strong></td><td><input id=\"detailButton\" type=\"button\" class=\"ui-state-default ui-corner-all\"onclick=\"javascript:showWeatherDetails('${CLIMATE_ID}');\"; value=\"Details\"></td></tr><tr><td>Province</td><td>${PROVINCE}</td></tr><tr><td>Station Number</td><td>${CLIMATE_ID}</td></tr></table>";
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
                    //GaugeLayer.on("click", doBuffer);

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
                    $("#Spatial_Analysis").appendTo("#mapDiv_root");

                   
                });

function showDiv() {

    document.getElementById("leftPane").style.display = "block";
    $("#leftPane").effect("slide", options, 800, callback);
}

function HideDiv() {
    document.getElementById("leftPane").style.display = "none";
    return false;
}

function buildLayerList(layer) {

    var items = dojo.map(layer.layerInfos, function (info, index) {
        // alert(info.id);
        //alert(info.defaultVisibility);
        //making all layers checked and visible
        //info.defaultVisibility = true;
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
            
            if (input.id == 0) {
                GaugeLayer.show();
            }
            else if (input.id == 1) {
                stationLayer.show();
            }
            else
            {
                visible.push(input.id);
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
            $("#leftPane").removeAttr("style").hide().fadeIn();
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
    // set effect from select menu value
    $("button").click(function () {
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
    var weatherData = getWeatherData(stationCode);
    createWeatherHTML(weatherData);
}

function execute(searchText) {
    //set the search text to find parameters
    findParams.searchText = searchText;
    findTask.execute(findParams, showResults);
}

function showResults(results) {

    //symbology for graphics
    var markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
    var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 1);
    var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));

    //find results return an array of findResult.
    map.graphics.clear();
    //var dataForGrid = [];
    //Build an array of attribute information and add each found graphic to the map
    dojo.forEach(results, function (result) {
        var graphic = result.feature;

        //dataForGrid.push([result.layerName, result.foundFieldName, result.value]);
        switch (graphic.geometry.type) {
            case "point":
                graphic.setSymbol(markerSymbol);
                break;
            case "polyline":
                graphic.setSymbol(lineSymbol);
                break;
            case "polygon":
                graphic.setSymbol(polygonSymbol);
                break;
        }

        map.graphics.add(graphic);

    });
    
}



