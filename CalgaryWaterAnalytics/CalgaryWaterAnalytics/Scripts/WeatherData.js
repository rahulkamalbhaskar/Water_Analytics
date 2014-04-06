function getWeatherData(stationCode) {
    var graphData="";
    $.ajax({
        url: '/Weather/jsonResult',
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
function createWeatherHTML(WeatherData) {
    $("#dialog-weather-detail").empty();
    //Temperature in format of currentDay;Tomorrows;DayAfterTomorrow
    var latLongiName = WeatherData.split(';');
    //alert(latLongiName[0] + " " + latLongiName[1] + " " + latLongiName[2]);
    var url = 'http://forecast.io/embed/#lat=' + latLongiName[0] + '&lon=' + latLongiName[1] + '&name='+latLongiName[2]+'&color=#00aaff&font=Georgia&units=ca';
    $("#dialog-weather-detail").append('<iframe id="forecast_embed" type="text/html" frameborder="0" height="245" width="100%" src="'+url+'"> </iframe>');
    showWeatherPopupDialog();
}

function showWeatherPopupDialog(){
    $("#tooltipDialog").hide();
    $( "#dialog-weather-detail" ).dialog({
        //modal: true,
        width: '30%',
        show: {
            effect: "blind",
            duration: 1000
        },
        hide: {
            effect: "explode",
            duration: 1000
        },
        close: function (event, ui) { $("#tooltipDialog").show(); },
        buttons: {
            Ok: function() {
                $(this).dialog("close");
                $("#tooltipDialog").show();
            }
        }
    });
}