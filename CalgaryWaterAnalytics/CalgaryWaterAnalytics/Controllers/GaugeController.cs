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
        private static List<double> WaterLevelList ;
        private static List<double> WaterLevelListForDVSWL;
        private static List<double> DischargeListForDVSWL;
        private static List<DateTime> DateListForDVSWL;
        private static string dateDVSWL="";
        //
        // GET: /Gauge/
 
        /// <summary>
        /// This method will give historic water level for particalar station code from database
        /// </summary>
        /// <param name="selectedStationCode"></param>
        /// <returns></returns>
        protected string getWaterLevel(string selectedStationCode)
        {

            WaterLevelList = new List<double>();

            //Added for the Graph between water level VS Diacharge
            WaterLevelListForDVSWL = new List<double>();
            DischargeListForDVSWL = new List<double>();
            DateListForDVSWL = new List<DateTime>();

            using(WaterAnalyticsEntities db = new WaterAnalyticsEntities()){
            string waterLevelData = "";
            string year = "";
            string day = "";
            string month = "";
            string stationName = "";

            //Added for the Graph between water level VS Diacharge
            string yearDVSWL = "";
            string dayDVSWL = "";
            string monthDVSWL = "";
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
                //Added to get waterLevel
                if (!waterlevel.WateLevel.Equals(" ") && waterlevel.WateLevel != null )
                {
                    WaterLevelList.Add(Convert.ToDouble( waterlevel.WateLevel));
                }
                //Added to get discharge vs preceptation
                if (!waterlevel.WateLevel.Equals(" ") && waterlevel.WateLevel != null && !waterlevel.Discharge.Equals(" ") && waterlevel.Discharge != null)
                {
                    if (dayDVSWL.Equals(""))
                    {
                        DateTime firstInstanceDate = (DateTime)waterlevel.Date;
                        yearDVSWL = Convert.ToString(firstInstanceDate.Year).Trim(' ');
                        dayDVSWL = Convert.ToString(firstInstanceDate.Day).Trim(' ');
                        monthDVSWL = Convert.ToString(firstInstanceDate.Month-1);
                        dateDVSWL= yearDVSWL+","+dayDVSWL+","+monthDVSWL;
                    }
                    WaterLevelListForDVSWL.Add(Convert.ToDouble(waterlevel.WateLevel));
                    DischargeListForDVSWL.Add(Convert.ToDouble(waterlevel.Discharge));
                    DateListForDVSWL.Add(((DateTime)waterlevel.Date).Date);
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
        protected String getLastWaterLevel(string selectedStationCode) {
            WaterLevelList.Sort();
            String lowerQuartile = GetQuartile(WaterLevelList,0.25).ToString();
            String upperQuartile = GetQuartile(WaterLevelList,0.75).ToString();
            String middleQuartile = GetQuartile(WaterLevelList,0.50).ToString();
            String topQuartile = GetQuartile(WaterLevelList, 1.0).ToString();
            String LowestQuartile = GetQuartile(WaterLevelList,0.0).ToString();
            using (WaterAnalyticsEntities db = new WaterAnalyticsEntities())
            {
                String result = "0";
                var query = db.WaterLevels.Where(x => x.StationCode == selectedStationCode);
                var lastByDate = query.Where(x => x.Date.HasValue && x.WateLevel.HasValue).OrderByDescending(x => x.Date).Take(1).FirstOrDefault();
                if (lastByDate != null)
                {
                    result = lastByDate.WateLevel.ToString();
                }
                else 
                {
                    result = "0";
                }
                if (lowerQuartile.Equals("0") && upperQuartile.Equals("0") && middleQuartile.Equals("0") && topQuartile.Equals("0") && LowestQuartile.Equals("0"))
                {
                    lowerQuartile = "2";
                    upperQuartile = "7";
                    middleQuartile = "5";
                    topQuartile = "10";
                    LowestQuartile = "0";
                    result = "4";

                }

                return (LowestQuartile + ";" + lowerQuartile + ";" + middleQuartile + ";" + upperQuartile + ";" +topQuartile +";" + result+";"+String.Join(",", WaterLevelListForDVSWL)+";"+String.Join(",",DischargeListForDVSWL)+";"+dateDVSWL);
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
        //Code Added to calculate quartiles

        private  double GetQuartile(List<double> list, double quartile)
        {
            double result;
            if (list.Count != 0)
            {
                // Get roughly the index
                double index = quartile * (list.Count() - 1);

                // Get the remainder of that index value if exists
                double remainder = index % 1;

                // Get the integer value of that index
                index = Math.Floor(index);

                if (remainder.Equals(0))
                {
                    // we have an integer value, no interpolation needed
                    result = list.ElementAt((int)index);
                }
                else
                {
                    // we need to interpolate
                    double value = list.ElementAt((int)index);
                    double interpolationValue = (value - list.ElementAt((int)(index + 1))) * remainder;

                    result = value + interpolationValue;
                }
            }
            else
            {
                result = 0;
            }

            return result;
        }
    }
}
