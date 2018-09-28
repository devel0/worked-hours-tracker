using System.Collections.Generic;

namespace WorkedHoursTrackerWebapi
{

    public class CustomerListResponse : CommonResponse
    {

        public List<Customer> customerList { get; set; }

    }

}