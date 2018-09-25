namespace WorkedHoursTrackerWebapi
{

    public static class LinuxHelper
    {

        /// <summary>
        /// check if given file has required mode ( default = 700 )
        /// </summary>
        public static bool IsFilePermissionSafe(string pathfilename, int mode = 448)
        {
            var mask_777 = 511;

            Mono.Unix.Native.Stat buf;
            Mono.Unix.Native.Syscall.stat(pathfilename, out buf);

            return ((int)buf.st_mode & mask_777) == mode;
        }

        /// <summary>
        /// set file permission of given pathfilename
        /// </summary>        
        public static int SetFilePermission(string pathfilename, int mode)
        {
            return Mono.Unix.Native.Syscall.chmod(pathfilename, (Mono.Unix.Native.FilePermissions)mode);
        }

    }

}