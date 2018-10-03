using System.Collections.Generic;

namespace WorkedHoursTrackerWebapi
{

    public class JobListResponse : CommonResponse
    {

        public List<UserJobNfo> userJobList { get; set; } = new List<UserJobNfo>();

    }

}