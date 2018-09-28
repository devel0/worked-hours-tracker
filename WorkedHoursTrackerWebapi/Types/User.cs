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
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }

        public double Cost { get; set; }

        [Required]
        /// <summary>
        /// create timestamp ( UTC )
        /// </summary>    
        public DateTime CreateTimestamp { get; set; }

        /// <summary>
        /// modify timestamp ( UTC )
        /// </summary>
        public DateTime? ModifyTimestamp { get; set; }

        /// <summary>
        /// last login timestamp ( UTC )
        /// </summary>
        public DateTime? LastloginTimestamp { get; set; }

    }

}