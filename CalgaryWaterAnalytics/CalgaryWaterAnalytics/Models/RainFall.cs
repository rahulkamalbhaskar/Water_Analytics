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
    
    public partial class RainFall
    {
        public int ID { get; set; }
        public Nullable<double> RainFall1 { get; set; }
        public Nullable<System.DateTime> DateTime { get; set; }
        public string StationCode { get; set; }
    
        public virtual Station Station { get; set; }
    }
}
