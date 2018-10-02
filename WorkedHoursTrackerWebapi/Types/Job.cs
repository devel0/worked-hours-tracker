using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SearchAThing.Util;
using static System.Math;

namespace WorkedHoursTrackerWebapi
{

    [Table("job")]
    public class Job
    {
        [Key]
        public long id { get; set; }

        [Required]
        public string name { get; set; }

        [Required]
        public double base_cost { get; set; } = MyDbContext.BASE_COST_DEFAULT;

        [Required]
        public double min_cost { get; set; } = MyDbContext.MIN_COST_DEFAULT;

        [Required]
        public double cost_factor { get; set; } = MyDbContext.COST_FACTOR_DEFAULT;

        [Required]
        public int minutes_round { get; set; } = MyDbContext.MINUTES_ROUND_DEFAULT;

        [NotMapped]
        public bool is_active { get; set; }

        [NotMapped]
        public double total_hours { get; set; }

        [NotMapped]
        public double last_24_hours { get; set; }

        public double Cost(double hours, double hourCost)
        {
            return Max(base_cost + (hours * 60).MRound(minutes_round) * hourCost * cost_factor, min_cost);
        }

        [Required]
        /// <summary>
        /// create timestamp ( UTC )
        /// </summary>    
        public DateTime create_timestamp { get; set; }

        /// <summary>
        /// modify timestamp ( UTC )
        /// </summary>
        public DateTime? modify_timestamp { get; set; }

    }

}