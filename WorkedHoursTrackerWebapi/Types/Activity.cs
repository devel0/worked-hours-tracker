using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SearchAThing.Util;
using static System.Math;

namespace WorkedHoursTrackerWebapi
{

    [Table("activity")]
    public class activity
    {
        [Key]
        public long id { get; set; }

        [Required]
        public string name { get; set; }

        public string description { get; set; }        

    }

}