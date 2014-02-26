using System;
using CalgaryWaterAnalytics.Controllers;
using System.Web.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace CalgaryWaterAnalytics.Tests.Controllers
{
    /// <summary>
    /// During this test dummy station 000001 is tested. This Dummy station is being entered in the real table.
    /// No dummy table is created for this task.
    /// </summary>
    [TestClass]
    public class GaugeControllerTest
    {
        /// <summary>
        /// Test case for number of param return in json is 5 (i.e number of the param which json result will return as its required in UI)
        /// </summary>
        [TestMethod]
        public void TestgetWaterLevelForNumberOfOutputParam()
        {
            GaugeController controller = new GaugeController();
            JsonResult resultJson = controller.jsonResult("000001") as JsonResult;
            string [] stationData = resultJson.Data.ToString().Split(';');
            Assert.AreEqual(5, stationData.Length);
        }

        /// <summary>
        /// Test case for the data recieved "Station name" for the query when station id is passed
        /// </summary>
        [TestMethod]
        public void TestgetWaterLevelForStationName()
        {
            GaugeController controller = new GaugeController();
            JsonResult resultJson = controller.jsonResult("000001") as JsonResult;
            string [] stationData = resultJson.Data.ToString().Split(';');
            Assert.AreEqual("Test station", stationData[0]);
        }
        /// <summary>
        /// Test case for the data recieved (i.e. Day) for the query when station id is passed
        /// </summary>
        [TestMethod]
        public void TestgetWaterLevelForDay()
        {
            GaugeController controller = new GaugeController();
            JsonResult resultJson = controller.jsonResult("000001") as JsonResult;
            string[] stationData = resultJson.Data.ToString().Split(';');
            Assert.AreEqual("8", stationData[1]);
        }
        /// <summary>
        /// Test case for the data recieved (i.e. month) for the query when station id is passed
        /// </summary>
        [TestMethod]
        public void TestgetWaterLevelForMonth()
        {
            GaugeController controller = new GaugeController();
            JsonResult resultJson = controller.jsonResult("000001") as JsonResult;
            string[] stationData = resultJson.Data.ToString().Split(';');
            Assert.AreEqual("2", stationData[2]);
        }
        /// <summary>
        /// Test case for the data recieved (i.e. Year) for the query when station id is passed
        /// </summary>
        [TestMethod]
        public void TestgetWaterLevelForYear()
        {
            GaugeController controller = new GaugeController();
            JsonResult resultJson = controller.jsonResult("000001") as JsonResult;
            string[] stationData = resultJson.Data.ToString().Split(';');
            Assert.AreEqual("1911", stationData[3]);
        }
        /// <summary>
        /// Test case for the data recieved (i.e. waterLevel) for the query when station id is passed
        /// </summary>
        [TestMethod]
        public void TestgetWaterLevelForWaterLevel()
        {
            GaugeController controller = new GaugeController();
            JsonResult resultJson = controller.jsonResult("000001") as JsonResult;
            string[] stationData = resultJson.Data.ToString().Split(';');
            Assert.AreEqual("162,162,262,262,362,362,462,462,562,562", stationData[4]);
        }
        /// <summary>
        /// Test case for the data last water level for station when station id is not passed
        /// </summary>
        [TestMethod]
        public void TestLastLevelResultNoStation()
        {
            GaugeController controller = new GaugeController();
            JsonResult waterLevel = controller.LastLevelResult("") as JsonResult;
            Assert.AreEqual(Convert.ToDouble(0), waterLevel.Data);
        }
        /// <summary>
        /// Test case for the data last water level for station when station id is passed
        /// </summary>
        [TestMethod]
        public void TestLastLevelResult()
        {
            GaugeController controller = new GaugeController();
            JsonResult waterLevel = controller.LastLevelResult("000001") as JsonResult;
            Assert.AreEqual(Convert.ToDouble(562),waterLevel.Data);
        }

    }
}
