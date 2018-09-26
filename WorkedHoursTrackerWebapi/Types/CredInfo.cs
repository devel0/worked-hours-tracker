using System;

namespace WorkedHoursTrackerWebapi
{

    public class CredInfo
    {
        
        public string Username { get; set; }        

        public string Password { get; set; }         

        public double Cost { get; set; }                       

        /// <summary>
        /// null for new entries
        /// </summary>        
        public string GUID { get; set; }

        /// <summary>
        /// create timestamp ( UTC )
        /// </summary>    
        public DateTime? CreateTimestamp { get; set; }

        /// <summary>
        /// modify timestamp ( UTC )
        /// </summary>
        public DateTime? ModifyTimestamp { get; set; }

        /// <summary>
        /// last login timestamp ( UTC )
        /// </summary>
        public DateTime? LastloginTimestamp { get; set; }

    }

}