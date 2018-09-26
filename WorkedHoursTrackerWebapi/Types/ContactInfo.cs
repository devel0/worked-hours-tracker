using System;

namespace WorkedHoursTrackerWebapi
{

    public class ContactInfo
    {
        
        public string Name { get; set; }        
        
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
        
    }

}