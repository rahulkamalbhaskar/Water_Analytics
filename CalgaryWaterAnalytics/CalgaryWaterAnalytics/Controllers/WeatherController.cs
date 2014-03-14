using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CalgaryWaterAnalytics.Models;

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
        [HttpPost]
        public ActionResult jsonResult(string selectedStationCode)
        {
            return Json(getWeatherData(selectedStationCode));
        }

    }
}
