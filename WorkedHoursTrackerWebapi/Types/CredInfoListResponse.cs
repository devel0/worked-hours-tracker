using System.Collections.Generic;

namespace WorkedHoursTrackerWebapi
{

    public class CredInfoListResponse : CommonResponse
    {

        public List<CredInfo> CredList { get; set; }

    }

}