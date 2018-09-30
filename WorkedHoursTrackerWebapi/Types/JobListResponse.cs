using System.Collections.Generic;

namespace WorkedHoursTrackerWebapi
{

    public class JobListResponse : CommonResponse
    {

        public List<Job> jobList { get; set; }

    }

}