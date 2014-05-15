
function WaterLevel(StationCode) {
    $("#tooltipDialog").hide();
    $("#pnlChartstby").dialog({
        //modal: true,
        width: '45%',
        height: '520',
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
    var graphData;
    var graphdata = getWaterlevelData(StationCode, graphData).split(";");
    waterLevel = JSON.parse("[" + graphdata[4] + "]");
    $('#container').highcharts({
        chart: {
            zoomType: 'x',
            spacingRight: 20
        },
        title: {
            text: 'Drainage for <\br>' + graphdata[0]
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
            name: 'Drainage',
            pointInterval: 24 * 3600 * 1000,
            pointStart: Date.UTC(graphdata[3], graphdata[2], graphdata[1]),
            data: waterLevel
        }]
    });
    //Used for dispalying boxplot
    var result = getLastWaterlevel(StationCode, result);
    //Varibale contains data for the both boxplot as well as comparision data
    result = result.split(';');
    $('#gauge').highcharts({

        chart: {
            type: 'boxplot'
        },

        title: {
            text: 'WaterLevel'
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
   //TODO: correct data from database as its not correct
    var dischargeVsWaterLevelDate =  result[8].split(',');
    $('#dischargeVSwaterLevel').highcharts({
        chart: {
            zoomType: 'x',
            spacingRight: 20
        },
        title: {
            text: 'Discharge VS Water Level <\br>' + graphdata[0]
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
            color:'grey',
            pointInterval: 3600 * 1000,
            pointStart: Date.UTC(dischargeVsWaterLevelDate[0], dischargeVsWaterLevelDate[2], dischargeVsWaterLevelDate[1]),
            data: JSON.parse("[" + result[6] + "]")
        }, {
            type: 'line',
            name: 'Water Level(m)',
            yAxis: 0,
            color: Highcharts.getOptions().colors[0],
            pointInterval: 3600 * 1000,
            pointStart: Date.UTC(dischargeVsWaterLevelDate[0], dischargeVsWaterLevelDate[2], dischargeVsWaterLevelDate[1]),
            data: JSON.parse("[" + result[7] + "]")
        }]
    });



}
function getWaterlevelData(stationCode, graphData) {
    $.ajax({
        url: '/Gauge/jsonResult',
        type: 'post',
        datatype: 'json',
        async: false,
        data: { selectedStationCode: stationCode },
        success: function (data) {
            graphData = data;
        },
        error: function (data) { }
    });
    return graphData;
}

//for gauge
function getLastWaterlevel(stationCode, LastLevel) {
    $.ajax({
        url: '/Gauge/LastLevelResult',
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

