using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CalgaryWaterAnalytics.Models;

namespace CalgaryWaterAnalytics.Controllers
{
    public class GaugeController : Controller
    {
        //
        // GET: /Gauge/
        private WaterAnalyticsEntities db = new WaterAnalyticsEntities();


        //This method will water level for particalar station code from database

        protected string getWaterLevel(string selectedStationCode)
        {
            string waterLevelData = "";
            string year = "";
            string day = "";
            string month = "";
            string stationName = "";
            //get station name from data base
            var stationNameQuery = from c in db.Stations
                                 where c.StationCode.Equals(selectedStationCode)
                                 select c;
            //Station name attribute
            foreach (Station stationsDetails in stationNameQuery)
            {
                stationName = stationsDetails.Name.ToString();
            }
            
            
            var query = from c in db.WaterLevels
                        orderby c.Date ascending
                        where c.StationCode.Equals(selectedStationCode)
                        select c;
            foreach (WaterLevel waterlevel in query)
            {
                //Getting First instance date i.e. day, month and year
                if (day.Equals(""))
                {
                    DateTime firstInstanceDate = (DateTime)waterlevel.Date;
                    year = Convert.ToString(firstInstanceDate.Year);
                    day = Convert.ToString(firstInstanceDate.Day);
                    month = Convert.ToString(firstInstanceDate.Month);
                }

                //Extracting water level from each instance
                if (waterlevel.WateLevel.ToString().Equals(""))
                {
                    waterLevelData += "0" + ",";
                }
                else
                {
                    waterLevelData += waterlevel.WateLevel.ToString() + ",";
                }
            }
            waterLevelData += '0';
            //Appending the date value in the string
            //Format DAY;MONTH;YEAR;WATERLEVELS
            waterLevelData = stationName+";"+day+";" + month+";"+year + ";" +waterLevelData;

            return waterLevelData;
        }
        //Fuction waterlevel graph
        //input param: StationCode
        //Output param: Waterlevel String
        [HttpPost]
        public ActionResult jsonResult(string selectedStationCode)
        {
          return Json(getWaterLevel(selectedStationCode));
        }


    }
}
