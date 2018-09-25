using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Mono.Posix;

namespace WorkedHoursTrackerWebapi
{
    public class Program
    {

        public static bool MainStarted { get; private set; }

        public static void Main(string[] args)
        {
            MainStarted = true;

            var g = Global.Instance;            

            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .UseUrls("http://0.0.0.0:5000")
                .Build();
    }
}
