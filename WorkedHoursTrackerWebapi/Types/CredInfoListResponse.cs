using System.Collections.Generic;

namespace WorkedHoursTrackerWebapi
{

    public class CredListResponse : CommonResponse
    {

        public List<CredInfo> CredList { get; set; }

    }

}