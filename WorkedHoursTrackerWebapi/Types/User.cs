using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WorkedHoursTrackerWebapi
{

    [Table("user")]
    public class User
    {

        [Key]
        public int id { get; set; }

        [Required]
        public string username { get; set; }

        [Required]
        public string password { get; set; }

        public double cost { get; set; }

        [Required]
        /// <summary>
        /// create timestamp ( UTC )
        /// </summary>    
        public DateTime create_timestamp { get; set; }

        /// <summary>
        /// modify timestamp ( UTC )
        /// </summary>
        public DateTime? modify_timestamp { get; set; }

        /// <summary>
        /// last login timestamp ( UTC )
        /// </summary>
        public DateTime? last_login_timestamp { get; set; }

    }

}