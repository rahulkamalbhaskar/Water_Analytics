//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace CalgaryWaterAnalytics.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class WaterLevel
    {
        public string StationCode { get; set; }
        public Nullable<double> WateLevel { get; set; }
        public Nullable<double> Discharge { get; set; }
        public Nullable<System.DateTime> Date { get; set; }
        public int ID { get; set; }
    
        public virtual Station Station { get; set; }
    }
}