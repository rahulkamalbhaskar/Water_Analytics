using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CalgaryWaterAnalytics.Models;

namespace CalgaryWaterAnalytics.Controllers
{
    /// <summary>
    /// Contains method for gauging station
    /// </summary>
    public class GaugeController : Controller
    {
        //
        // GET: /Gauge/
 
        /// <summary>
        /// This method will give historic water level for particalar station code from database
        /// </summary>
        /// <param name="selectedStationCode"></param>
        /// <returns></returns>
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
                stationName = stationsDetails.Name.ToString().Trim(' ');
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
                    year = Convert.ToString(firstInstanceDate.Year).Trim(' ');
                    day = Convert.ToString(firstInstanceDate.Day).Trim(' ');
                    month = Convert.ToString(firstInstanceDate.Month);
                }
                if (!waterLevelData.Equals(""))
                {
                    waterLevelData += ",";
                }
                //Extracting water level from each instance
                if (waterlevel.Discharge.ToString().Equals(""))
                {
                    waterLevelData += "0";
                }
                else
                {
                    
                    waterLevelData += waterlevel.Discharge.ToString();
                    
                }
            }
            //Appending the date value in the string
            //Format DAY;MONTH;YEAR;WATERLEVELS
            waterLevelData = stationName+";"+day+";" + month+";"+year + ";" +waterLevelData;

            return waterLevelData;
            }
        }
        /// <summary>
        /// This method returns the last water level row by ordering dates
        /// </summary>
        /// <param name="selectedStationCode"></param>
        /// <returns></returns>
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
                else 
                {
                    result = 0;
                }
               
                return result;
            }

        }
        /// <summary>
        /// Fuction called from UI for waterlevel area graph
        /// </summary>
        /// <param name="StationCode"></param>
        /// <returns name="Waterlevel"></returns>
        [HttpPost]
        public ActionResult jsonResult(string selectedStationCode)
        {
          return Json(getWaterLevel(selectedStationCode));
        }
        /// <summary>
        /// Fuction called from UI for waterlevel gauge meter graph
        /// </summary>
        /// <param name="selectedStationCode"></param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult LastLevelResult(string selectedStationCode)
        {
            return Json(getLastWaterLevel(selectedStationCode));
        }
    }
}
