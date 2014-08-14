using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CalgaryWaterAnalytics.Models;
using System.Xml.Linq;
using System.Web.Services;

namespace CalgaryWaterAnalytics.Controllers
{
    /// <summary>
    /// Contains method for gauging station
    /// </summary>
    public class GaugeController : Controller
    {
        private static List<double> WaterLevelList;
        private static List<double> WaterLevelListForDVSWL;
        private static List<double> DischargeListForDVSWL;
        private static List<DateTime> DateListForDVSWL;
        private static string dateDVSWL = "";

        public static string ApplicationFolder = "";



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

            using (WaterAnalyticsEntities db = new WaterAnalyticsEntities())
            {
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


                var stationNameQuery = db.Stations.Where(x => x.StationCode == selectedStationCode);
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
                    if (!waterlevel.WateLevel.Equals(" ") && waterlevel.WateLevel != null)
                    {
                        WaterLevelList.Add(Convert.ToDouble(waterlevel.WateLevel));
                    }
                    //Added to get discharge vs preceptation
                    if (!waterlevel.WateLevel.Equals(" ") && waterlevel.WateLevel != null && !waterlevel.Discharge.Equals(" ") && waterlevel.Discharge != null)
                    {
                        if (dayDVSWL.Equals(""))
                        {
                            DateTime firstInstanceDate = (DateTime)waterlevel.Date;
                            yearDVSWL = Convert.ToString(firstInstanceDate.Year).Trim(' ');
                            dayDVSWL = Convert.ToString(firstInstanceDate.Day).Trim(' ');
                            monthDVSWL = Convert.ToString(firstInstanceDate.Month - 1);
                            dateDVSWL = yearDVSWL + "," + dayDVSWL + "," + monthDVSWL;
                        }
                        WaterLevelListForDVSWL.Add(Convert.ToDouble(waterlevel.WateLevel));
                        DischargeListForDVSWL.Add(Convert.ToDouble(waterlevel.Discharge));
                        DateListForDVSWL.Add(((DateTime)waterlevel.Date).Date);
                    }
                }
                //Appending the date value in the string
                //Format DAY;MONTH;YEAR;WATERLEVELS
                waterLevelData = stationName + ";" + day + ";" + month + ";" + year + ";" + waterLevelData;

                return waterLevelData;
            }
        }
        /// <summary>
        /// This method returns the last water level row by ordering dates
        /// </summary>
        /// <param name="selectedStationCode"></param>
        /// <returns></returns>
        protected String getLastWaterLevel(string selectedStationCode)
        {
            WaterLevelList.Sort();
            String lowerQuartile = GetQuartile(WaterLevelList, 0.25).ToString();
            String upperQuartile = GetQuartile(WaterLevelList, 0.75).ToString();
            String middleQuartile = GetQuartile(WaterLevelList, 0.50).ToString();
            String topQuartile = GetQuartile(WaterLevelList, 1.0).ToString();
            String LowestQuartile = GetQuartile(WaterLevelList, 0.0).ToString();
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

                return (LowestQuartile + ";" + lowerQuartile + ";" + middleQuartile + ";" + upperQuartile + ";" + topQuartile + ";" + result + ";" + String.Join(",", WaterLevelListForDVSWL) + ";" + String.Join(",", DischargeListForDVSWL) + ";" + dateDVSWL);
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

        private double GetQuartile(List<double> list, double quartile)
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

        /// <summary>
        /// Fetch data for gauging station and the related weather station to draw correaltion graph
        /// </summary>
        /// <param name="gaugingStationNumber"></param>
        /// <returns></returns>
        //public string getCorrelationDataForSelectedStation(string gaugingStationNumber) 
        //{
        //    //Fetch list of weather station from the XML file for the selected gauging station 
        //    List< string> listOfWeatherStation = getListOfGaugeRelatedWeatherStation(gaugingStationNumber);

        //    if (listOfWeatherStation.Count==0)
        //    {
        //        return null;
        //    }
        //    //Call DB server to get data relevant to that station
        //    else 
        //    {
        //        List<Object> weatherGaugeCorrelationData = new List<Object>();
        //        foreach (string weatherStNumber in listOfWeatherStation)
        //        {
        //            using (WaterAnalyticsEntities db = new WaterAnalyticsEntities())
        //            {
        //                var result = db.WaterLevels.Join(db.Weathers,
        //                    x => x.Date,
        //                    y => y.DateTime,
        //                    (x, y) => new { x, y })
        //                    .Where(waterL => waterL.x.StationCode == gaugingStationNumber)
        //                    .Where(weath => weath.y.StationCode == weatherStNumber).ToList();
        //                weatherGaugeCorrelationData.Add(result);
        //            }

        //        }


        //    }

        //    //Format that data in the required format

        //    return null;
        //}

        public static Dictionary<string, object> getCorrelationDataForSelectedStation(string gaugingStationNumber, DateTime start, DateTime end)
        {
            
            //Fetch list of weather station from the XML file for the selected gauging station
            WaterAnalyticsEntities db = new WaterAnalyticsEntities();
            List<string> listOfWeatherStation = getListOfGaugeRelatedWeatherStation(gaugingStationNumber);
            List<Object> weatherGaugeCorrelationData = null;
            Dictionary<string, object> queryDict = new Dictionary<string, object>();

            var endDt = db.WaterLevels.Where(x => x.StationCode == gaugingStationNumber).Max(x => x.Date);
            var gaugingStationData = new List<WaterLevel>();
            var sDate = endDt.Value.AddYears(-5);
            if (endDt.HasValue)
            {

                gaugingStationData = db.WaterLevels.Where(x => x.StationCode == gaugingStationNumber).Where(x => x.Date >= sDate && x.Date <= endDt).OrderBy(x => x.Date).ToList();
            }


            //var gaugingStationData = db.WaterLevels.Where(x => x.StationCode == gaugingStationNumber).Where(x => x.Date >= start && x.Date <= end).OrderBy(x => x.Date).ToList();
            queryDict.Add("gaugeData", gaugingStationData);
            if (listOfWeatherStation.Count == 0)
            {
                return null;
            }
            //Call DB server to get data relevant to that station
            else
            {
                weatherGaugeCorrelationData = new List<Object>();
                foreach (string weatherStNumber in listOfWeatherStation)
                {
                    var endDate = db.Weathers.Where(x => x.StationCode == weatherStNumber).Max(x => x.DateTime);
                    var result = new List<Weather>();
                    var stDate = endDate.Value.AddYears(-5);
                    if (endDate.HasValue)
                    {
                        result = db.Weathers.Where(x => x.StationCode == weatherStNumber && x.DateTime >= stDate && x.DateTime <= endDate).OrderBy(x => x.DateTime).ToList();
                    }
                    weatherGaugeCorrelationData.Add(result);
                }


            }
            queryDict.Add("weatherData", weatherGaugeCorrelationData);
            //Format that data in the required format

            return queryDict;
        }
        /// <summary>
        /// Fetch list of weather station from the XML file for the selected gauging station 
        /// </summary>
        /// <param name="StationNumber"></param>
        /// <returns></returns>
        //public List<string> getListOfGaugeRelatedWeatherStation(string StationNumber )
        //{
        //    XElement root = XElement.Load(@"~/listOfGaugeWeatherStationCorrelation.xml");
        //    List<string> weatherStationList = new List<string>();
        //    try
        //    {
        //        weatherStationList =
        //        (from el in root.Elements("Guage")
        //         where (string)el.Attribute("ID") == StationNumber
        //         select el.Value).Single().Split(',').ToList();

        //    }
        //    catch (Exception e)
        //    {
        //        e.ToString();
        //    }
        //    return weatherStationList;
        //}

        private static List<string> getListOfGaugeRelatedWeatherStation(string StationNumber)
        {
            try
            {

                XElement root = XElement.Load(ApplicationFolder + "\\listOfGaugeWeatherStationCorrelation.xml");
                List<string> weatherStationList = new List<string>();

                weatherStationList =
                (from el in root.Elements("Guage")
                 where (string)el.Attribute("ID") == StationNumber
                 select el.Value).Single().Split(',').ToList();
                return weatherStationList;
            }
            catch (Exception e)
            {
                e.ToString();
                return null;
            }

        }
        private static List<string> StaticGetListOfGaugeRelatedWeatherStation(string StationNumber)
        {
            XElement root = XElement.Load(ApplicationFolder + "\\listOfGaugeWeatherStationCorrelation.xml");
            List<string> weatherStationList = new List<string>();
            try
            {
                weatherStationList =
                (from el in root.Elements("Guage")
                 where (string)el.Attribute("ID") == StationNumber
                 select el.Value).Single().Split(',').ToList();

            }
            catch (Exception e)
            {
                e.ToString();
            }
            return weatherStationList;
        }
        //Scatter plot graph section 
        /// <summary>
        /// 
        /// </summary>
        /// <param name="selectedStationCode"></param>
        /// <param name="startDate"></param>
        /// <param name="endDate"></param>
        [HttpPost]
        public ActionResult showScatterPlotForDischargeVsPrecipitation(string selectedStationCode, string startDate, string endDate)
        {
            //selectedStationCode = "05BB001";
            DateTime start = DateTime.Parse(startDate);
            DateTime end = DateTime.Parse(endDate);
            var temp = Json(getDataforScatterplot(selectedStationCode, start, end));
            return temp;
        }

        [HttpPost]
        public ActionResult showDischargeVsPrecipitation(string selectedStationCode, string startDate, string endDate)
        {
            try
            {
                ApplicationFolder = HttpContext.Request.PhysicalApplicationPath;
                DateTime start = DateTime.Parse(startDate);
                DateTime end = DateTime.Parse(endDate);
                List<seriesDataObject> SeriesL = new List<seriesDataObject>();
                Dictionary<string, object> StationData = getCorrelationDataForSelectedStation(selectedStationCode, start, end);
                seriesDataObject series = null;
                if (StationData != null)
                {
                    //Parse weather station
                    var GaugeData = StationData["gaugeData"];
                    series = new seriesDataObject();
                    foreach (WaterLevel wl in (IEnumerable<WaterLevel>)GaugeData)
                    {
                        if (series.type.Equals(""))
                        {
                            DateTime date = (DateTime)wl.Date;
                            series.startYear = date.Year;
                            series.startDay = date.Day;
                            series.startMonth = date.Month;

                            series.type = "line";
                            series.name = "Discharge for  " + wl.StationCode;
                            series.pointInterval = 24 * 3600 * 1000;
                            series.pointStart = "";
                            series.yAxis = 0;
                        }

                        if (series.dataValue.Equals(String.Empty))
                        {
                            series.dataValue = wl.Discharge.ToString();
                        }
                        else
                        {
                            series.dataValue += "," + wl.Discharge.ToString();
                        }
                    }
                    SeriesL.Add(series);
                    List<object> WeatherData = new List<object>();
                    // WeatherData =StationData["weatherData"]);
                    WeatherData = (List<object>)StationData["weatherData"];

                    foreach (object obj in WeatherData)
                    {
                        series = new seriesDataObject();
                        seriesDataObject snowFallSeries = new seriesDataObject();
                        foreach (Weather we in (IEnumerable<Weather>)obj)
                        {
                            //date from the reading start
                            if (series.type.Equals(""))
                            {
                                DateTime date = (DateTime)we.DateTime;
                                series.startYear = date.Year;
                                series.startDay = date.Day;
                                series.startMonth = date.Month;

                                series.type = "line";
                                series.name = "Rainfall for" + we.StationCode;
                                series.pointInterval = 24 * 3600 * 1000;
                                series.pointStart = "";

                                series.yAxis = 1;
                                //snowfall series Data
                                snowFallSeries.type = "line";
                                snowFallSeries.name = "SnowFall for " + we.StationCode;
                                snowFallSeries.pointInterval = 24 * 3600 * 1000;
                                snowFallSeries.pointStart = "";

                                snowFallSeries.startYear = date.Year;
                                snowFallSeries.startDay = date.Day;
                                snowFallSeries.startMonth = date.Month;

                                series.yAxis = 2;
                            }

                            if (series.dataValue.Equals(String.Empty))
                            {
                                series.dataValue = we.Rainfall.ToString();
                                snowFallSeries.dataValue = we.Snowfall.ToString();
                            }
                            else
                            {
                                series.dataValue += "," + we.Rainfall.ToString();
                                snowFallSeries.dataValue += "," + we.Snowfall.ToString();
                            }
                        }
                        SeriesL.Add(snowFallSeries);
                        SeriesL.Add(series);

                    }


                }
                return Json(SeriesL);//serializer.Serialize( series);
            }
            catch (Exception ex) {
                return null;
            }
        }

        public Dictionary<string, object> getDataforScatterplot(string gaugingStationNumber, DateTime start, DateTime end)
        {
            WaterAnalyticsEntities db = new WaterAnalyticsEntities();
            List<string> listOfWeatherStation = StaticGetListOfGaugeRelatedWeatherStation(gaugingStationNumber);
            Dictionary<string, object> weatherGaugeSationData = new Dictionary<string, object>();
            if (listOfWeatherStation.Count == 0)
            {
                return null;
            }
            //Call DB server to get data relevant to that station
            else
            {
                foreach (string weatherStNumber in listOfWeatherStation)
                {
                    string year = "";
                    string color = "";
                    int gVariant = 0;
                    var result = db.WaterLevels.Join(db.Weathers,
                            x => x.Date,
                            y => y.DateTime,
                            (x, y) => new { x, y })
                            .Where(waterL => waterL.x.StationCode == gaugingStationNumber)
                            .Where(weath => weath.y.StationCode == weatherStNumber).OrderBy(weath => weath.y.DateTime)
                            .Where(weath => weath.y.DateTime >= start && weath.y.DateTime <= end)
                            .Where(waterL => waterL.x.Date >= start && waterL.x.Date <= end).ToList();
                    List<scatterPlotObject> points = new List<scatterPlotObject>();
                    foreach (var joinValue in result)
                    {
                        var waterLevel = joinValue.x;
                        var weather = joinValue.y;
                        scatterPlotObject point = new scatterPlotObject();
                        point.discharge = waterLevel.Discharge;
                        point.rainfall = weather.Rainfall;
                        DateTime? datetime = weather.DateTime;
                        string thisInstanceYear = datetime.Value.Year.ToString();
                        if (!year.Equals(thisInstanceYear))
                        {
                            year = datetime.Value.Year.ToString();
                            gVariant += 100;
                            color = "rgba(223, " + gVariant + ", 83, .5)";
                        }
                        point.color = color;
                        point.date = datetime.Value.Date.ToString();
                        points.Add(point);
                    }
                    weatherGaugeSationData.Add(weatherStNumber, points);
                }


            }
            return weatherGaugeSationData;
        }
        public class seriesDataObject
        {
            public string type = "";
            public string name = "";
            public int pointInterval;
            public string pointStart = "";
            public int startYear;
            public int startMonth;
            public int startDay;
            public string dataValue = "";
            public int yAxis;

        }
        public class scatterPlotObject
        {
            public double? discharge;
            public double? rainfall;
            public string date;
            public string color = "rgba(223, 83, 83, .5)";
        }

    }
}
