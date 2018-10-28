using System.Collections.Generic;

namespace WorkedHoursTrackerWebapi
{

    public class UserAuthNfoResponse : CommonResponse
    {

        public bool CanEditJobs { get; set; }

        public bool CanEditActivities { get; set; }

    }

}