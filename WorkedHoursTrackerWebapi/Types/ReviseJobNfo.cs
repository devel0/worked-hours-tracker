using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WorkedHoursTrackerWebapi
{
    
    public class ReviseJobNfo : CommonResponse
    {

        public Job job { get; set; }

        public string activity { get; set; }

        public DateTime from { get; set; }

        public long id_user_job_from { get; set; }

        public DateTime to { get; set; }

        public long id_user_job_to { get; set; }

        public string notes { get; set; }
    }

}