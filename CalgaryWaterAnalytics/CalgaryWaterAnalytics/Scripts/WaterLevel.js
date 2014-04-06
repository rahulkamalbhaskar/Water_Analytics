
function WaterLevel(StationCode) {
    var graphData;
    var graphdata = getWaterlevelData(StationCode, graphData).split(";");
    waterLevel = JSON.parse("[" + graphdata[4] + "]");
    $('#container').highcharts({
        chart: {
            zoomType: 'x',
            spacingRight: 20
        },
        title: {
            text: 'Water Level for <\br>' + graphdata[0]
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
                text: 'Water Level'
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
            name: 'Water Level',
            pointInterval: 24 * 3600 * 1000,
            pointStart: Date.UTC(graphdata[3], graphdata[2], graphdata[1]),
            data: waterLevel
        }]
    });
    //gauge Chart
    var result
    var result = getLastWaterlevel(StationCode, result).split(";");
    //lowerQuartile + ";" + upperQuartile+ ";" + middleQuartile+ ";" + topQuartile+ ";" + LowestQuartile+ ";" + result
    //$('#gauge').highcharts({

    //    chart: {
    //        type: 'gauge',
    //        plotBackgroundColor: null,
    //        plotBackgroundImage: null,
    //        plotBorderWidth: 0,
    //        plotShadow: false
    //    },

    //    title: {
    //        text: 'Gauge Water Level',
    //        itemStyle: {
    //            fontSize: '18px',
    //            color: '#ffff'
    //        }

    //    },

    //    pane: {
    //        startAngle: -150,
    //        endAngle: 150,
    //        background: [{
    //            backgroundColor: {
    //                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
    //                stops: [
    //                    [0, '#FFF'],
    //                    [1, '#333']
    //                ]
    //            },
    //            borderWidth: 0,
    //            outerRadius: '109%'
    //        }, {
    //            backgroundColor: {
    //                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
    //                stops: [
    //                    [0, '#333'],
    //                    [1, '#FFF']
    //                ]
    //            },
    //            borderWidth: 10,
    //            outerRadius: '107%'
    //        }, {
    //            // default background
    //        }, {
    //            backgroundColor: '#DDD',
    //            borderWidth: 0,
    //            outerRadius: '105%',
    //            innerRadius: '103%'
    //        }]
    //    },

    //    // the value axis
    //    yAxis: {
    //        min: 0,
    //        max: 10,

    //        // minorTickInterval: 'auto',
    //        minorTickWidth: 1,
    //        minorTickLength: 10,
    //        minorTickPosition: 'inside',
    //        minorTickColor: '#666',

    //        tickPixelInterval: 30,
    //        tickWidth: 2,
    //        tickPosition: 'inside',
    //        tickLength: 10,
    //        tickColor: '#666',
    //        labels: {
    //            step: 2,
    //            //rotation: 'auto'
    //        },
    //        title: {
    //            text: 'Meter'
    //        },
    //        plotBands: [{
    //            from: 0,
    //            to: 5,
    //            color: '#55BF3B' // green
    //        }, {
    //            from: 5,
    //            to: 8,
    //            color: '#DDDF0D' // yellow
    //        }, {
    //            from: 8,
    //            to: 10,
    //            color: '#DF5353' // red
    //        }]
    //    },

    //    series: [{
    //        name: 'WaterLevel',
    //        data: [result],
    //        tooltip: {
    //            valueSuffix: 'meter'
    //        }
    //    }]

    //});


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
                categories: ['1'],
                title: {
                    text: ''
                }
            },

            yAxis: {
                title: {
                    text: ''
                },
                plotLines: [{
                    value: 8,
                    color: 'red',
                    width: 0.5,
                    label: {
                        text: '',
                        align: 'center',
                        style: {
                            color: 'gray'
                        }
                    }
                }]
            },
            series: [{
                name: 'Observations',
                data: [
                    [result[4], result[1], result[5], result[1], result[3]]
                ],
                tooltip: {
                    headerFormat: ''
                }
            }

            //, {
            //    name: 'Outlier',
            //    color: Highcharts.getOptions().colors[0],
            //    type: 'scatter',
            //    data: [ // x, y positions where 0 is the first category
            //        [0, 644],
            //        [4, 718],
            //        [4, 951],
            //        [4, 969]
            //    ],
            //    marker: {
            //        fillColor: 'white',
            //        lineWidth: 1,
            //        lineColor: Highcharts.getOptions().colors[0]
            //    },
            //    tooltip: {
            //        pointFormat: 'Observation: {point.y}'
            //    }
            //}
            ]

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

