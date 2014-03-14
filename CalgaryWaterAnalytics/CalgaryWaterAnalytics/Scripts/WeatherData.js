function getWeatherData(stationCode) {
    $.ajax({
        url: '/Weather/jsonResult',
        type: 'post',
        datatype: 'json',
        async: false,
        data: { selectedStationCode: stationCode },
        success: function (data) {
            alert(data);
        },
        error: function (data) { }
    });
}