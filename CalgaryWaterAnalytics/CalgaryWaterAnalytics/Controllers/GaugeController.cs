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

        public ActionResult GaugingStation()
        {
            ViewBag.WaterLevel = getWaterLevel("05BH004");
            return View();
        }

        //This method will water level for particalar station code from database
        
        protected String getWaterLevel(string selectedStationCode)
        {
            String waterLevelData = "";

            var query = from c in db.WaterLevels
                        orderby c.Date ascending
                        where c.StationCode.Equals(selectedStationCode)
                        select c;
            foreach (WaterLevel waterlevel in query)
            {
                //TODO: convert it into JSON format
                waterLevelData += waterlevel.WateLevel.ToString() + ",";
            }

            return waterLevelData;
        }

    }
}
