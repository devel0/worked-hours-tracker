using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SearchAThing.Util;

namespace WorkedHoursTrackerWebapi
{

    public class Config
    {

        public string DBHostname { get; set; }
        public int DBPort { get; set; }
        public string DBName { get; set; }
        public string DBUsername { get; set; }
        public string DBPassword { get; set; }

        [JsonIgnore]
        public string ConnectionString
        {
            get
            {
                return $"Server={DBHostname};Database={DBName};Username={DBUsername};Port={DBPort};Password={DBPassword}";
            }
        }

        public void Save(ILogger logger)
        {
            try
            {
                if (File.Exists(Global.AppConfigPathfilename))
                    File.Copy(Global.AppConfigPathfilename, Global.AppConfigPathfilenameBackup, true);
            }
            catch (Exception ex)
            {
                logger.LogError($"unable to backup config file [{Global.AppConfigPathfilename}] to [{Global.AppConfigPathfilenameBackup}] : {ex.Message}");
            }
            File.WriteAllText(Global.AppConfigPathfilename, JsonConvert.SerializeObject(this, Formatting.Indented));
            // save with mode 600
            LinuxHelper.SetFilePermission(Global.AppConfigPathfilename, 384);
        }

    }

}