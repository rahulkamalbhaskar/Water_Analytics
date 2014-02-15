﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CalgaryWaterAnalytics.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Message = "Welcome to Calgary!!!!";
            ViewData.Add("","");

            return View();
        }

        public ActionResult About()
        {
            return View();
        }
    }
}
