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