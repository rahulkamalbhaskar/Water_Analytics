var map, dialog;
require(["esri/map",
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
                "esri/geometry/Point",
                "esri/graphic",
                "esri/symbols/SimpleMarkerSymbol",
                "dijit/layout/BorderContainer",
                "esri/dijit/PopupTemplate",
                "dojo/domReady!"],


                function (Map, LocateButton, BasemapToggle, BasemapGallery, arcgisUtils, parser, FeatureLayer,
          SimpleFillSymbol, SimpleLineSymbol,
          SimpleRenderer, Graphic, esriLang,
          Color, number, domStyle,
          TooltipDialog, dijitPopup) {
                    parser.parse();
                    map = new Map("mapDiv", {
                        center: [-114.08529, 51.05011],
                        zoom: 8,
                        basemap: "streets",
                        slider: true
                    });
                   
                   
                    var roadLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/3", {
                        id: "roadLayer"
                    });
                    map.addLayer(roadLayer);
                    var streamLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/4", {
                        id: "streamLayer"
                        
                    });
                    map.addLayer(streamLayer);

                    var lakeLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/5", {
                        id: "lakeLayer"
                        
                    });
                    map.addLayer(lakeLayer);

                    var bowDEMLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/6", {
                        id: "bowDEMLayer"
                        
                    });
                    map.addLayer(bowDEMLayer);
                    
                    var GaugeLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/0", {
                        id: "GaugeLayer",
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        outFields: ["STATION_NA", "SHAPE"]
                    });
                    map.addLayer(GaugeLayer);
                    var stationLayer = new FeatureLayer("http://136.159.14.34:6080/arcgis/rest/services/CalgaryFlood/Bow1/MapServer/2", {
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
                        var t = "<table border=0 style=\"backgroundColor:#fff\"><tr><td>Station Name</td><td><strong> ${STATION_NAME}</strong></td><td><input id=\"detailButton\" type=\"button\" class=\"ui-state-default ui-corner-all\"onclick=\"javascript:showMapDetails('${STATION_NAME}');\"; value=\"Details\"></td></tr><tr><td>Province</td><td>${PROVINCE}</td></tr><tr><td>Elevation</td><td>${ELEVATION}</td></tr></table>";
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
                        var t = "<table border=0 style=\"backgroundColor:#fff\"><tr><td>Station Name</td><td><strong> ${STATION_NA}</strong></td></tr><tr><td>Shape</td><td>${SHAPE}</td><td><input id=\"detailButton\" type=\"button\" class=\"ui-state-default ui-corner-all\"onclick=\"javascript:showMapDetails('${STATION_NAME}');\"; value=\"Details\"></td></tr><tr><td>Province</td><td>${PROVINCE}</td></tr><tr><td>Elevation</td><td>${ELEVATION}</td></tr></table>";
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
function showMapDetails(stationId) {
    // most effect types need no options passed by default
    var options = {};
    document.getElementById("toggler").style.visibility = "visible";
    $("#effect").effect("slide", options, 500, callback);
    showStationData(stationId);

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
                    backgroundColor: "#BDBDBD",
                    color: "#000",
                    width: 500
                }, 1000);
            } else {
                $("#effect").animate({
                    backgroundColor: "#fff",
                    color: "#000",
                    width: 240
                }, 1000);
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
function showStationData(stationId) {
    $("#weatherDetail").text(stationId);
}


