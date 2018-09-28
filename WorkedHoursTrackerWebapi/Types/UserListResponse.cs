using System.Collections.Generic;

namespace WorkedHoursTrackerWebapi
{

    public class UserListResponse : CommonResponse
    {

        public List<User> UserList { get; set; }

    }

}