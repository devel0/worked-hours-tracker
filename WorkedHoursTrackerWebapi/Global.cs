using System;
using System.IO;
using System.Linq;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using static System.Environment;

namespace WorkedHoursTrackerWebapi
{

    public class Global : IGlobal
    {        

        public static string AppFolder
        {
            get
            {
                var pathname = Path.Combine(Path.Combine(Environment.GetFolderPath(SpecialFolder.UserProfile), ".config"), "workedhourstracker");

                if (!Directory.Exists(pathname)) Directory.CreateDirectory(pathname);

                return pathname;
            }
        }

        public static string AppConfigPathfilename
        {
            get { return Path.Combine(AppFolder, "config.json"); }
        }

        public static string AppConfigPathfilenameBackup
        {
            get { return Path.Combine(AppFolder, "config.json.bak"); }
        }

        public Config Config { get; private set; }

        public string ConnectionString => Config.ConnectionString;

        private readonly ILogger logger;

        public Global(ILogger<Global> logger)
        {
            this.logger = logger;

            if (!File.Exists(Global.AppConfigPathfilename))
            {
                Config = new Config();
                Config.Save(logger);
            }
            else
            {
                // check mode 600
                if (!LinuxHelper.IsFilePermissionSafe(AppConfigPathfilename, 384))
                {
                    throw new Exception($"invalid file permission [{AppConfigPathfilename}] must set to 600");
                }

                var attrs = File.GetAttributes(AppConfigPathfilename);
                Config = JsonConvert.DeserializeObject<Config>(File.ReadAllText(AppConfigPathfilename));
            }

            if (string.IsNullOrEmpty(Config.DBHostname) || Config.DBPassword == "pass")
            {
                Config.DBHostname = "hostname";
                Config.DBPort = 5432;
                Config.DBName = "worked_hours_tracker";
                Config.DBUsername = "postgres";
                Config.DBPassword = "pass";
                Config.Save(logger);

                throw new Exception($"please configure [{AppConfigPathfilename}] setting DBHostname, DBPort, DBName, DBUsername, DBPassword (see README.md)");
            }
        }

    }

}