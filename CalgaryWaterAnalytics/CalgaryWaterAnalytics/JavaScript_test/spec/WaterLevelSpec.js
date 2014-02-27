
describe("Test Water Level JS for response from sever", function () {
    describe("Test for historic water data response", function () {
        var stationCode = "000001";
        var graphData = "";
        var seriesData = getWaterlevelData(stationCode, graphData).split(";");
        it("Test for size of the json string return by server", function () { 
            expect(seriesData.length).toBe(5);
        });
        it("Test for Station name", function () {
            expect(seriesData[0]).toBe('Test station');
        });
        it("Test for Day", function () {
            expect(seriesData[1]).toBe('8');
        });
        it("Test for Month", function () {
            expect(seriesData[2]).toBe('2');
        });
        it("Test for Year", function () {
            expect(seriesData[3]).toBe('1911');
        });
        it("Test for Water Level", function () {
            expect(seriesData[4]).toBe('162,162,262,262,362,362,462,462,562,562');
        });
    });
    describe("Test for Gauge meter for current status ", function () {
        it("Test for latest water level", function () {
            var stationCode = "000001";
            var LastLevel = "";
            expect(getLastWaterlevel(stationCode,LastLevel)).toBe(562);
        });
    });
});
