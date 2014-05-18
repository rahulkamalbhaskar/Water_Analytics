using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CalgaryWaterAnalytics.Models;
using System.Xml;
using System.Xml.Linq;

namespace CalgaryWaterAnalytics.Controllers
{
    public class WeatherController : Controller
    {
        //
        // GET: /Weather/

        public ActionResult Index()
        {
            return View();
        }

        protected string getWeatherData(string selectedStationCode)
        {
            float lat = 0;
            float longi = 0;
            String name = "";
            using (WaterAnalyticsEntities db = new WaterAnalyticsEntities())
            {
                //Query to fetch latitude and longitude for xml data

                var query = from c in db.Stations
                            where c.StationCode.Equals(selectedStationCode)
                            select c;
                foreach (Station station in query)
                {
                    lat = (float)station.Lat;
                    longi = (float)station.Long;
                    name = station.Name;
                }

            }
            return (lat+";"+longi+";"+name);//getCurrentWeather(lat.ToString(), longi.ToString());
        }
        /// <summary>
        /// http://dotnet.dzone.com/articles/using-linq-xml-query-xml-data
        /// http://www.codeproject.com/Articles/24376/LINQ-to-XML
        /// </summary>
        /// <param name="latitude"></param>
        /// <param name="longitude"></param>
        /// <returns></returns>
        protected string getCurrentWeather(string latitude, string longitude)
        {
            String URLString = "http://www.myweather2.com/developer/forecast.ashx?uac=0k4sV9akzs&query=" + latitude + "," + longitude + "&temp_unit=c";

            XElement main = XElement.Load(@URLString);

            IEnumerable<XElement> arrays = from el in main.Elements()
                                           select el; ;
            var temprature = (from c in arrays
                              select new
                              {
                                  currentDay = c.Element("temp"),
                                  futureDay= c.Element("day_max_temp")
                              }
                              ).ToArray();

            var temp = temprature[0].currentDay.Value;
            var tempDayOne = temprature[1].futureDay.Value;
            var tempDayTwo = temprature[2].futureDay.Value;
            return temp + ";" + tempDayOne+";"+tempDayTwo;
        }
        [HttpPost]
        public ActionResult jsonResult(string selectedStationCode)
        {
            //return Json(getWeatherData(selectedStationCode));
            return Json(getSnowFallRainFallTotalPrecepitation(selectedStationCode)+";"+getWeatherData(selectedStationCode));
        }
        /// <summary>
        /// @ author RKB dt: 05/18/2014 time 1:57 p.m. 
        /// Function return snowfall rainfall total precepeitaion for the specific station number
        /// </summary>
        /// <param name="selectedStationCode"></param>
        /// <returns></returns>
        private string getSnowFallRainFallTotalPrecepitation(string selectedStationCode)
        {
            string result="";
            string rainfall = "";
            string snowfall = "";
            string totPrecp = "";
            string day = "";
            string month = "";
            string year = "";
            using (WaterAnalyticsEntities db = new WaterAnalyticsEntities())
            {
                //Query to fetch Data for recieving the weather detail for the station number received

                var query = from c in db.Weathers
                            orderby c.DateTime ascending
                            where c.StationCode.Equals(selectedStationCode)
                            select c;
                foreach (Weather weatherDetails in query)
                {
                    if (day.Equals(""))
                    {
                        DateTime startDate = (DateTime)weatherDetails.DateTime;
                        day = startDate.Day.ToString();
                        month = (startDate.Month -1).ToString();
                        year = startDate.Year.ToString(); 
                    }
                    rainfall += (rainfall.Equals("") ? weatherDetails.Rainfall.ToString() : ("," + weatherDetails.Rainfall.ToString()));
                    snowfall += (snowfall.Equals("") ? weatherDetails.Snowfall.ToString() : ("," + weatherDetails.Snowfall.ToString()));
                    totPrecp += (totPrecp.Equals("") ? weatherDetails.TotalPrecp.ToString() : ("," + weatherDetails.TotalPrecp.ToString()));                    
                }

            }
            result = day + ";" + month + ";" + year + ";" + rainfall + ";" + snowfall + ";" + totPrecp;
            return result;
 
        }

    }
}
