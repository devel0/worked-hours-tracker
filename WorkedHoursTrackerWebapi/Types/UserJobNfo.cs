using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WorkedHoursTrackerWebapi
{

    /// <summary>
    /// response with current job info for user
    /// </summary>
    public class UserJobNfo
    {

        public Job job { get; set; }

        public DateTime trigger_timestamp { get; set; }

        public bool is_active { get; set; }

        public double total_hours { get; set; }

        public double last_24_hours { get; set; }

    }

}