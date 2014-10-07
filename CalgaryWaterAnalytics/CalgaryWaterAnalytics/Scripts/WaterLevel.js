function WaterLevel(StationCode, StationName) {
    $("#gauge-popup-tabs").tabs();
    $("#tooltipDialog").hide();
    $("#pnlChartstby").dialog({
        //modal: true,
        width: 'auto',
        height: 'auto',
        autoResize: true,
        show: {
            effect: "blind",
            duration: 1000
        },
        //hide: {
        //    effect: "explode",
        //    duration: 1000
        //},
        close: function (event, ui) { $("#tooltipDialog").show(); },
        buttons: {
            Ok: function () {
                $(this).dialog("close");
                $("#tooltipDialog").show();
            }
        }
    });

    //Call method to display discharge time series
    getDischargeGraph(StationCode);
    //Call method to diplay boxplot for waterlevel
    getBoxPlotDataAndGraph(StationName, StationCode);
    //Call method to display time series for dis vs preciptation
    getTimeSeriesDataAndGraphForDisVsPrec(StationName, StationCode);
    //Call method to display time series for dischargeVSppt for gauge station as well as multiple station
    getTimeSeriesDataAndGraphForDisVsRainVsPrec(StationName,StationCode);
   
}

//function for showing graph discharge only
function getDischargeGraph(StationCode)
{
    var graphData = "";
    graphData = getWaterlevelData(StationCode, graphData);
    var graphdata = graphData.split(";");
    var waterLevel = JSON.parse("[" + graphdata[4] + "]");
    $('#container').highcharts({
        chart: {
            zoomType: 'x',
            spacingRight: 20
        },
        title: {
            text: 'Discharge for <\br>' + graphdata[0]
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                'Click and drag in the plot area to zoom in' :
                'Pinch the chart to zoom in'
        },
        xAxis: {
            type: 'datetime',
            maxZoom: 14 * 24 * 3600000, // fourteen days
            title: {
                text: null
            }
        },
        yAxis: {
            title: {
                text: 'Water Flow m3/s'
            }
        },
        tooltip: {
            shared: true
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                lineWidth: 1,
                marker: {
                    enabled: false
                },
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },

        series: [{
            type: 'area',
            name: 'Discharge',
            pointInterval: 24 * 3600 * 1000,
            pointStart: Date.UTC(graphdata[3], graphdata[2], graphdata[1]),
            data: waterLevel
        }]
    });
    if (waterLevel == "") {
        //alert("waterlevl null");

        $('#container').html("<div class='empty-chart'>No data available for selected date range</div>");

    }
    return graphdata[0];
}

//Used for showing boxplot
function getBoxPlotDataAndGraph(StationName, StationCode)
{
    // Used for dispalying boxplot
    var result = getLastWaterlevel(StationCode, result);
    //Varibale contains data for the both boxplot as well as comparision data
    result = result.split(';');
    $('#gauge').highcharts({

        chart: {
            type: 'boxplot'
        },

        title: {
            text: 'WaterLevel for station' + StationName
        },

        legend: {
            enabled: false
        },

        xAxis: {
            categories: ['Water Level'],
            title: {
                text: ''
            }
        },

        yAxis: {
            title: {
                text: ''
            },
            plotLines: [{
                value: parseFloat(result[5]),
                color: 'red',
                width: 0.5,
                zIndex: 5,
                label: {
                    text: 'Current Status',
                    align: 'left',
                    style: {
                        color: 'gray'
                    }
                }
            }]
        },
        series: [{
            name: 'Observations',
            data: [
                [parseFloat(result[0]), parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]), parseFloat(result[4])]
            ],
            tooltip: {
                headerFormat: ''
            }
        }
        ]

    });
}

//funtion to discharge Vs precepitation graph for the 
function getTimeSeriesDataAndGraphForDisVsPrec(StationName, StationCode)
{
    var result = getDataForDisVsPrec(StationCode).split(';');
    var dischargeVsWaterLevelDate = result[2].split(',');
    $('#dischargeVSwaterLevel').highcharts({
        chart: {
            zoomType: 'x',
            spacingRight: 20
        },
        title: {
            text: 'Discharge VS Water Level <\br>' + StationName
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                'Click and drag in the plot area to zoom in' :
                'Pinch the chart to zoom in'
        },
        xAxis: {
            type: 'datetime',
            maxZoom: 14 * 24 * 36000, // fourteen days
            title: {
                text: null
            }
        },
        //@author rkb
        //Timestamp: Dt: 05-15-2014 Time: 11:00 a.m. -11:45 a.m.
        //Added for the 2 y-axis 
        yAxis: [{ // Primary yAxis Water Level
            labels: {
                format: '{value} m',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            title: {
                text: 'Water Level(m)',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true

        }, { // Secondary yAxis Discharge
            gridLineWidth: 0,
            title: {
                text: 'Discharge(m3/s)',
                style: {
                    color: 'grey'
                }
            },
            labels: {
                format: '{value} m3/s',
                style: {
                    color: 'grey'
                }
            }

        }],
        tooltip: {
            shared: true
        },
        legend: {
            align: 'center',
            verticalAlign: 'bottom'
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                lineWidth: 1,
                marker: {
                    enabled: false
                },
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },

        series: [{
            type: 'line',
            name: 'Discharge(m3/s)',
            yAxis: 1,
            color: 'grey',
            pointInterval: 24 * 3600 * 1000,
            pointStart: Date.UTC(dischargeVsWaterLevelDate[0], dischargeVsWaterLevelDate[2], dischargeVsWaterLevelDate[1]),
            data: JSON.parse("[" + result[0] + "]")
        }, {
            type: 'line',
            name: 'Water Level(m)',
            yAxis: 0,
            color: Highcharts.getOptions().colors[0],
            pointInterval: 24 * 3600 * 1000,
            pointStart: Date.UTC(dischargeVsWaterLevelDate[0], dischargeVsWaterLevelDate[2], dischargeVsWaterLevelDate[1]),
            data: JSON.parse("[" + result[1] + "]")
        }]
    });


    if (result[0] == "" && result[1] == "") {
        // alert("dischargeVSwaterLevel");

        $('#dischargeVSwaterLevel').html("<h2>No data available for selected station</h2>");
    }
}

//function to discharge vs Rainfall vs Snowfall
function getTimeSeriesDataAndGraphForDisVsRainVsPrec(StationName, StationCode) {
    //option for dis vs percipitation
    var option = {
        chart: {
            zoomType: 'x',
            spacingRight: 20
        },
        title: {
            text: 'Discharge, Rainfall Vs Temperature<\br>' //+ graphdata[0]
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                'Click and drag in the plot area to zoom in' :
                'Pinch the chart to zoom in'
        },
        xAxis: {
            type: 'datetime',
            maxZoom: 14 * 24 * 36000, // fourteen days
            title: {
                text: null
            }
        },
        //@author rkb
        //Timestamp: Dt: 05-15-2014 Time: 11:00 a.m. -11:45 a.m.
        //Added for the 2 y-axis 
        yAxis: [{ // Primary yAxis Water Level
            labels: {
                format: '{value} m3/s',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            title: {
                text: 'Discharge(m3/s)',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true

        }, { // Secondary yAxis Discharge
            gridLineWidth: 0,
            title: {
                text: 'Rainfall(mm)',
                style: {
                    color: 'grey'
                }
            },
            labels: {
                format: '{value} mm',
                style: {
                    color: 'grey'
                }
            }

        }, {
            // Teritory yAxis SnoWFall
            gridLineWidth: 0,
            title: {
                text: 'Temperature(C)',
                style: {
                    color: 'grey'
                }
            },
            labels: {
                format: '{value} C/mm',
                style: {
                    color: 'Black'
                }
            }
        }],
        tooltip: {
            shared: true
        },
        legend: {
            align: 'center',
            verticalAlign: 'bottom'
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                lineWidth: 1,
                marker: {
                    enabled: false
                },
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },


        series: []
    };
    option.series = [];
    var data = getDataForDisVsRainVsSnow(StationCode);
    console.log(data);
    var dataPoints = "";
    data.forEach(function (obj) {
        console.log(obj);
        dataPoints = JSON.parse("[" + obj.dataValue + "]");
        console.log(dataPoints);
        var json = {
            type: obj.type,
            name: obj.name,
            pointInterval: 24 * 3600 * 1000,
            pointStart: Date.UTC(obj.startYear, obj.startMonth - 1, obj.startDay),
            data: dataPoints,
            yAxis: obj.yAxis
        };
        option.series.push(json);
    });

    //console.log(StationJson);
    $('#dischargeVSPerc').highcharts(option);


    if (dataPoints == "" || dataPoints == "[]") {

        $('#dischargeVSPerc').html("<h2> No Data Exists for this station</h2>");
    }
}

//Ajax fucntion to get DisVsPrec data
function getDataForDisVsPrec(StationCode)
{
    var urlCreated = ROOT + "Gauge/getDisVsPrecData";
    var result;
    $.ajax({
        url: urlCreated,
        type: 'post',
        datatype: 'json',
        async: false,
        data: { selectedStationCode: StationCode },
        success: function (data) {
            //alert("success");
            result = data;
        },
        error: function (data) { }
    });
    return result;
}

//Ajax function to get waterLevel data
function getWaterlevelData(stationCode, graphData) {
    var urlCreated = ROOT + "Gauge/jsonResult";
    console.log(urlCreated);
    $.ajax({
        url: urlCreated,

        type: 'post',
        datatype: 'json',
        async: false,
        data: { selectedStationCode: stationCode },
        success: function (data) {
            //alert("success");
            graphData = data;
        },
        error: function (data) { }
    });
    return graphData;
}

//Ajax function to get dataforDisVsRainVsSnow
function getDataForDisVsRainVsSnow(stationCode) {
    var urlCreated = ROOT + "Gauge/showDischargeVsPrecipitation";
    var result;
    $.ajax({
        type: 'post',
        url: urlCreated,
        // cache:false,
        data: JSON.stringify({ selectedStationCode: stationCode, startDate: "01/01/2000", endDate: "06/01/2014" }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function (msg) {
            result = msg;
        },
        failure: function (msg) {
            console.log(msg);
        }
    });
    return result;
}

//Ajax Function to boxPlot data
function getLastWaterlevel(stationCode, LastLevel) {
    var urlCreated = ROOT + "Gauge/LastLevelResult";
    $.ajax({
        url: urlCreated,
        type: 'post',
        datatype: 'json',
        async: false,
        data: { selectedStationCode: stationCode },
        success: function (data) {
            LastLevel = data;
        },
        error: function (data) { }
    });
    return LastLevel;
}