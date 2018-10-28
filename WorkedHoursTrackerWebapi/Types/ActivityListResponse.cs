using System.Collections.Generic;

namespace WorkedHoursTrackerWebapi
{

    public class ActivityListResponse : CommonResponse
    {

        public List<Activity> activityList { get; set; } = new List<Activity>();

    }

}