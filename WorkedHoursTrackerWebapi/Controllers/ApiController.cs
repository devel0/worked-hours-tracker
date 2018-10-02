using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SearchAThing.Util;
using SearchAThing.EFUtil;
using SearchAThing.PsqlUtil;

namespace WorkedHoursTrackerWebapi.Controllers
{

    [Route("[controller]/[action]")]
    public class ApiController : Controller
    {

        private readonly IGlobal global;

        private readonly ILogger logger;
        private readonly MyDbContext ctx;

        #region constructor
        public ApiController(MyDbContext ctx, ILogger<ApiController> logger)
        {
            this.logger = logger;
            this.ctx = ctx;
            logger.LogDebug($"ApiController created");
            EnsureAdminAccount();
        }

        void EnsureAdminAccount()
        {
            if (!ctx.Users.Any(w => w.Username == "admin"))
            {
                ctx.Users.Add(new User()
                {
                    Username = "admin",
                    Password = "admin",
                    CreateTimestamp = DateTime.Now
                });
                ctx.SaveChanges();
            }
        }
        #endregion

        #region helpers
        CommonResponse InvalidAuthResponse()
        {
            return new CommonResponse() { ExitCode = CommonResponseExitCodes.InvalidAuth };
        }

        CommonResponse SuccessfulResponse()
        {
            return new CommonResponse() { ExitCode = CommonResponseExitCodes.Successful };
        }

        CommonResponse ErrorResponse(string errMsg)
        {
            return new CommonResponse()
            {
                ExitCode = CommonResponseExitCodes.Error,
                ErrorMsg = errMsg
            };
        }

        bool CheckAuth(string username, string password)
        {
            var qdb = ctx.Users.FirstOrDefault(w => w.Username == username);

            var is_valid = qdb != null && qdb.Password == password;

            if (!is_valid)
            {
                var q = HttpContext.Request.Headers["X-Real-IP"];
                var url = "";
                if (q.Count > 0) url = q.First();

                logger.LogWarning($"invalid login attempt from [{url}]");
                // todo : autoban
            }

            return is_valid;
        }
        #endregion

        #region USERS

        [HttpPost]
        public CommonResponse SaveUser(string username, string password, User jUser)
        {
            try
            {
                // disallow non admin
                if (jUser == null || username != "admin" || !CheckAuth(username, password)) return InvalidAuthResponse();

                User user = null;

                if (jUser.id == 0)
                {
                    if (jUser.Username == "admin") throw new Exception($"cannot create builtin admin account");

                    user = new User()
                    {
                        Username = jUser.Username,
                        CreateTimestamp = DateTime.UtcNow
                    };

                    ctx.Users.Add(user);
                }
                else
                {
                    user = ctx.Users.FirstOrDefault(w => w.id == jUser.id);
                    if (user == null) throw new Exception($"unable to find [{jUser.id}] entry");

                    user.ModifyTimestamp = DateTime.UtcNow;
                }
                user.Password = jUser.Password?.Trim();
                user.Cost = jUser.Cost;

                ctx.SaveChanges();

                return SuccessfulResponse();
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost]
        public CommonResponse LoadUser(string username, string password, int id)
        {
            try
            {
                // disallow non admin
                if (username != "admin" || !CheckAuth(username, password)) return InvalidAuthResponse();

                var response = new UserResponse();

                response.User = ctx.Users.FirstOrDefault(w => w.id == id);

                return response;
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost]
        public CommonResponse DeleteUser(string username, string password, int id)
        {
            try
            {
                // disallow non admin
                if (username != "admin" || !CheckAuth(username, password)) return InvalidAuthResponse();

                var q = ctx.Users.FirstOrDefault(w => w.id == id);
                if (q != null)
                {
                    ctx.Users.Remove(q);
                    ctx.SaveChanges();
                }

                return SuccessfulResponse();
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost]
        public CommonResponse UserList(string username, string password, string filter)
        {
            try
            {
                // disallow non admin
                if (username != "admin" || !CheckAuth(username, password)) return InvalidAuthResponse();

                var response = new UserListResponse();

                response.UserList = ctx.Users.ToList().Where(r => new[] { r.Username }.MatchesFilter(filter)).ToList();

                return response;
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        #endregion

        #region JOBS

        [HttpPost]
        public CommonResponse SaveJob(string username, string password, Job jJob)
        {
            try
            {
                if (username != "admin" || !CheckAuth(username, password)) return InvalidAuthResponse();

                Job job = null;
                if (jJob.id == 0)
                {
                    job = new Job()
                    {
                        CreateTimestamp = DateTime.UtcNow
                    };

                    ctx.Jobs.Add(job);
                }
                else
                {
                    job = ctx.Jobs.FirstOrDefault(w => w.id == jJob.id);
                    if (job == null) throw new Exception($"unable to find [{jJob.id}] entry");
                }
                job.name = jJob.name.Trim();
                job.base_cost = jJob.base_cost;
                job.min_cost = jJob.min_cost;
                job.cost_factor = jJob.cost_factor;
                job.minutes_round = jJob.minutes_round;
                ctx.SaveChanges();

                return SuccessfulResponse();
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost]
        public CommonResponse LoadJob(string username, string password, int id)
        {
            try
            {
                if (username != "admin" || !CheckAuth(username, password)) return InvalidAuthResponse();

                var response = new ContactInfoResponse();

                response.Job = ctx.Jobs.FirstOrDefault(w => w.id == id);

                return response;
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost]
        public CommonResponse DeleteJob(string username, string password, int id)
        {
            try
            {
                if (username != "admin" || !CheckAuth(username, password)) return InvalidAuthResponse();

                var q = ctx.Jobs.FirstOrDefault(w => w.id == id);

                if (q != null)
                {
                    ctx.Jobs.Remove(q);
                    ctx.SaveChanges();
                }

                return SuccessfulResponse();
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        public class tmptype
        {
            public long id_job;
            public double? hours_sum;
        }

        [HttpPost]
        public CommonResponse JobList(string username, string password, string filter)
        {
            try
            {
                if (!CheckAuth(username, password)) return InvalidAuthResponse();

                var response = new JobListResponse();

                var user = ctx.Users.First(w => w.Username == username);

                var query = $@"
select uj.id_job, sum(uj.hours_increment) hours_sum from ""user"" u
left join userjob uj on u.id = uj.id_user
where uj.id_user={user.id}
group by uj.id_job";

                var resTotalHours = ctx.ExecSQL<tmptype>(query).ToDictionary(w => w.id_job, w => w.hours_sum);

                if (resTotalHours.Count > 0)
                {

                    query = $@"
select uj.id_job, sum(uj.hours_increment) hours_sum from ""user"" u
left join userjob uj on u.id = uj.id_user
where uj.id_user={user.id} and uj.trigger_timestamp>{(DateTime.UtcNow - TimeSpan.FromDays(1)).ToPsql()}
group by uj.id_job";

                    var resLast24Hours = ctx.ExecSQL<tmptype>(query).ToDictionary(w => w.id_job, w => w.hours_sum);

                    query = $"select * from job where id in ({string.Join(',', resTotalHours.Select(w => w.Key.ToString()))})";

                    response.jobList = ctx.Jobs.AsNoTracking().FromSql(query).ToList();

                    foreach (var x in response.jobList)
                    {
                        x.total_hours = resTotalHours[x.id].GetValueOrDefault();
                        double? last24h = null;
                        if (resLast24Hours.TryGetValue(x.id, out last24h))
                            x.Last24Hours = last24h.GetValueOrDefault();
                    }

                    if (username != "admin")
                    {
                        foreach (var x in response.jobList)
                        {
                            x.base_cost = 0;
                            x.min_cost = 0;
                            x.cost_factor = 0;
                            x.minutes_round = 0;
                        }
                    }
                }
                else
                    response.jobList = new List<Job>();

                return response;
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        #endregion

        #region USER JOB

        [HttpPost]
        public CommonResponse TriggerJob(string username, string password, int idJob)
        {
            try
            {
                if (!CheckAuth(username, password)) return InvalidAuthResponse();

                var user = ctx.Users.First(w => w.Username == username);
                var id_user = user.id;

                var job = ctx.Jobs.First(w => w.id == idJob);

                var last = ctx.UserJobs.Where(r => r.user.id == id_user).OrderByDescending(w => w.trigger_timestamp).FirstOrDefault();

                UserJob newEntry = null;
                newEntry = new UserJob()
                {
                    user = user,
                    job = job,
                    trigger_timestamp = DateTime.UtcNow
                };
                if (last == null)
                {
                    newEntry.is_active = true;
                }
                else
                {
                    switch (last.is_active)
                    {
                        case true:
                            {
                                newEntry.is_active = false;
                                newEntry.hours_increment = (newEntry.trigger_timestamp - last.trigger_timestamp).TotalHours;
                            }
                            break;

                        case false:
                            {
                                newEntry.is_active = true;
                            }
                            break;
                    }
                }
                ctx.UserJobs.Add(newEntry);
                ctx.SaveChanges();

                return SuccessfulResponse();
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }


        #endregion

        [HttpPost]
        public CommonResponse IsAuthValid(string username, string password)
        {
            try
            {
                if (!CheckAuth(username, password)) return InvalidAuthResponse();
                return SuccessfulResponse();
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

    }

}
