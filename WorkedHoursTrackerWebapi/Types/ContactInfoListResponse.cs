using System.Collections.Generic;

namespace WorkedHoursTrackerWebapi
{

    public class ContactInfoListResponse : CommonResponse
    {

        public List<ContactInfo> ContactList { get; set; }

    }

}