namespace WorkedHoursTrackerWebapi
{

    public enum CommonResponseExitCodes
    {
        Successful = 0,
        Error = 1,
        InvalidAuth = 2
    }

    public class CommonResponse
    {

        /// <summary>
        /// 0 - ok
        /// 1 - error ( see ErrorMsg )
        /// 2 - invalid auth
        /// </summary>
        public CommonResponseExitCodes ExitCode { get; set; }

        public string ErrorMsg { get; set; }

    }

}