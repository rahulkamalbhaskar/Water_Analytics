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
 


        //This method will water level for particalar station code from database

        protected string getWaterLevel(string selectedStationCode)
        {
            using(WaterAnalyticsEntities db = new WaterAnalyticsEntities()){
            string waterLevelData = "";
            string year = "";
            string day = "";
            string month = "";
            string stationName = "";
            //get station name from data base
            //FIXME:There's no need to query DB (PERFORMANCE)
            //var stationNameQuery = from c in db.Stations
            //                     where c.StationCode.Equals(selectedStationCode)
            //                     select c;


            var stationNameQuery=  db.Stations.Where(x => x.StationCode == selectedStationCode);
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
        }
        //This method returns the last water level row by ordering dates
        protected double? getLastWaterLevel(string selectedStationCode) {
            using (WaterAnalyticsEntities db = new WaterAnalyticsEntities())
            {
                double? result = null;
                var query = db.WaterLevels.Where(x => x.StationCode == selectedStationCode);
                var lastByDate = query.Where(x => x.Date.HasValue && x.WateLevel.HasValue).OrderByDescending(x => x.Date).Take(1).FirstOrDefault();
                if (lastByDate != null)
                {
                    result = lastByDate.WateLevel;
                }
               
                return result;
            }

        }
       
        //Fuction waterlevel graph
        //input param: StationCode
        //Output param: Waterlevel String
        [HttpPost]
        public ActionResult jsonResult(string selectedStationCode)
        {
          return Json(getWaterLevel(selectedStationCode));
        }

        [HttpPost]
        public ActionResult LastLevelResult(string selectedStationCode)
        {
            return Json(getLastWaterLevel(selectedStationCode));
        }

    }
}
