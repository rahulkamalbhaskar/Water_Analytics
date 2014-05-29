function getWeatherData(stationCode) {
    createWeatherHTML(stationCode);
}
function createWeatherHTML(stationCode) {
    $("#dialog-weather-detail").empty();

    //Design weather Popup
    //Hard code width change it to dynamic for screen resolution
    $('#dialog-weather-detail').append('<table id="weather-detail" width="650px"></table>');
    $("#weather-detail").append('<tr><td id="weather-live-forecast"></td> </tr>');

    //Added new div for Graph of rain fall and snowfall
    $("#weather-detail").append('<tr ><td id="weather-rainfall-snowfall-historic"></td></tr>');

    //Call to server to get all required data 
    var ajaxRequestData = ajaxCallForWeatherData(stationCode);
    var result = ajaxRequestData.split(';');

    //Populate weather Forcast graph
    $("#weather-live-forecast").append(createWeatherforecastGraph(result[6],result[7],result[8]));

    //Populate snowfall rain fall graph
    drawRainfallAndSnowfallChart(result[0], result[1], result[2], result[3], result[4], result[8]);
    

    showWeatherPopupDialog();
}

function showWeatherPopupDialog(){
    $("#tooltipDialog").hide();
    $( "#dialog-weather-detail" ).dialog({
        //modal: true,
        //Hard code width and height change it to dynamic for screen resolution
        width: '700',
        height: '520',
        show: {
            effect: "blind",
            duration: 500
        },
        //hide: {
        //    effect: "explode",
        //    duration: 1000
        //},
        close: function (event, ui) { $("#tooltipDialog").show(); },
        buttons: {
            Ok: function() {
                $(this).dialog("close");
                $("#tooltipDialog").show();
            }
        }
    });
}
//@author RKB 
//dt: 5/18/2014 Time: 1:45 p.m.
//Fuctin will draw highchart for combine snow fall and rainfall
function drawRainfallAndSnowfallChart(day,month,year,rainfall,snowfall,stationName) {
    $('#weather-rainfall-snowfall-historic').highcharts({
        chart: {
            zoomType: 'x',
            spacingRight: 20
        },
        title: {
            text: 'SnowFall VS RainFall <\br>' + stationName.trim(' ')
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
        yAxis: [{ // Primary yAxis Water Level
            labels: {
                format: '{value} cm',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            title: {
                text: 'SnowFall(cm)',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true

        }, { // Secondary yAxis Discharge
            gridLineWidth: 0,
            title: {
                text: 'RainFall(mm)',
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
            name: 'Rainfall(mm)',
            yAxis: 1,
            color: 'grey',
            pointInterval: 24 * 3600 * 1000,//day wise for hour wise change it to 3600*1000
            pointStart: Date.UTC(year, month, day),
            data: JSON.parse("[" + rainfall + "]")
        }, {
            type: 'line',
            name: 'Snowfall(cm)',
            yAxis: 0,
            color: Highcharts.getOptions().colors[0],
            pointInterval: 24 * 3600 * 1000,//day wise for hour wise change it to 3600*1000
            pointStart: Date.UTC(year, month, day),
            data: JSON.parse("[" + snowfall + "]")
        }]
    });
}
//Function for sending request to server to fetch data for the particular station
function ajaxCallForWeatherData(stationCode) {
    var graphData = "";
    var urlCreated = ROOT + '/Weather/jsonResult';
    $.ajax({
        url: urlCreated,
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

function createWeatherforecastGraph(lat, longit, name) {
    //Temperature in format of currentDay;Tomorrows;DayAfterTomorrow

    //alert(latLongiName[0] + " " + latLongiName[1] + " " + latLongiName[2]);
    var url = 'http://forecast.io/embed/#lat=' + lat + '&lon=' + longit + '&name=' + name + '&color=#00aaff&font=Georgia&units=ca';
    return '<iframe id="forecast_embed" type="text/html" frameborder="0" height="245" width="100%" src="' + url + '"> </iframe>';
}