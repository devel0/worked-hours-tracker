using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WorkedHoursTrackerWebapi
{

    [Table("job")]
    public class Job
    {
        [Key]
        public long id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        /// <summary>
        /// create timestamp ( UTC )
        /// </summary>    
        public DateTime CreateTimestamp { get; set; }

        /// <summary>
        /// modify timestamp ( UTC )
        /// </summary>
        public DateTime? ModifyTimestamp { get; set; }

    }

}