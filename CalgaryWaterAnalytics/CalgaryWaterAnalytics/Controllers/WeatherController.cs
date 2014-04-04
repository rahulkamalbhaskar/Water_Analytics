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
            using (WaterAnalyticsEntities db = new WaterAnalyticsEntities())
            {
                //Query to fetch latitude and longitude for xml data

                var query = from c in db.Stations
                            where c.Name.Equals(selectedStationCode)
                            select c;
                foreach (Station station in query)
                {
                    lat = (float)station.Lat;
                    longi = (float)station.Long;
                }

            }
            return getCurrentWeather(lat.ToString(), longi.ToString());
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
                                  one = c.Element("temp"),
                                  two = c.Element("day_max_temp")
                              }
                              ).ToArray();

            var temp = temprature[0].one.Value;
            var tempDayOne = temprature[1].two.Value;
            var tempDayTwo = temprature[2].two.Value;
            return temp + " " + tempDayOne+" "+tempDayTwo;
        }
        [HttpPost]
        public ActionResult jsonResult(string selectedStationCode)
        {
            return Json(getWeatherData(selectedStationCode));
        }

    }
}
