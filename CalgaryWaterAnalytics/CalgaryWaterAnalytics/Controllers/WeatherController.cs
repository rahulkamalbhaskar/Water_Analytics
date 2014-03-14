using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CalgaryWaterAnalytics.Models;
using System.Xml;

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
        {       float lat=0;
                float longi=0;
            using (WaterAnalyticsEntities db = new WaterAnalyticsEntities())
            {
                //Query to fetch latitude and longitude for xml data
                
                var query = from c in db.Stations
                            where c.Name.Equals(selectedStationCode)
                            select c;
                foreach (Station station in query)
                {
                    lat= (float)station.Lat;
                    longi= (float)station.Long;
                }

            }
            return lat.ToString()+" "+longi.ToString();
        }
        protected string getCurrentWeather(string latitude, string longitude) {
            String URLString = "http://www.myweather2.com/developer/forecast.ashx?uac=0k4sV9akzs&query="+latitude+","+longitude+"&temp_unit=c";
            XmlTextReader reader = new XmlTextReader(URLString);
            String output = "";
            //Added to read node by node
            XmlDocument doc = new XmlDocument();
            XmlNode node = doc.ReadNode(reader);
            //foreach (XmlNode chldNode in node.ChildNodes)
            //{
            //    output += chldNode.Name + " " + chldNode.Value;
            //}
            while (reader.Read())
            {
                if (reader.Name == "temp")
                {
                    output += reader.Name + "=" + reader.Value + Environment.NewLine;

                }
                output += reader.Name + "=" + reader.Value + Environment.NewLine;
            }
            return "";
        }
        [HttpPost]
        public ActionResult jsonResult(string selectedStationCode)
        {
            return Json(getWeatherData(selectedStationCode));
        }

    }
}
