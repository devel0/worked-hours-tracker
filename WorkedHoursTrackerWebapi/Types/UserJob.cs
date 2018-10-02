using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WorkedHoursTrackerWebapi
{

    [Table("userjob")]
    public class UserJob
    {

        [Key]
        public int id { get; set; }

        [Required]
        [ForeignKey("id_user")]
        public User user { get; set; }

        [Required]
        [ForeignKey("id_job")]
        public Job job { get; set; }

        [Required]
        public DateTime trigger_timestamp { get; set; }

        [Required]
        public bool is_active { get; set; }

        /// <summary>
        /// hours increment between recent triggers
        /// </summary>        
        [Required]
        public double hours_increment { get; set; }

    }

}