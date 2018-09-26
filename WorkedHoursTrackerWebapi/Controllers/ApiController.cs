using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using SearchAThing.Util;

namespace WorkedHoursTrackerWebapi.Controllers
{
    [Route("[controller]/[action]")]
    public class ApiController : Controller
    {

        Global global { get { return Global.Instance; } }
        Config config { get { return global.Config; } }

        #region constructor
        public ApiController()
        {
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
            var inCredentials = config.Credentials.FirstOrDefault(w => w.Username == username);

            var is_valid = inCredentials != null && inCredentials.Password == password;

            if (!is_valid)
            {
                var q = HttpContext.Request.Headers["X-Real-IP"];
                var url = "";
                if (q.Count > 0) url = q.First();
                global.LogWarning($"invalid login attempt from [{url}]");
                // todo : autoban
            }

            return is_valid;
        }
        #endregion

        #region USERS

        [HttpPost]
        public CommonResponse SaveCred(string username, string password, CredInfo cred)
        {
            try
            {
                // disallow non admin
                if (cred == null || username  != "admin" || !CheckAuth(username, password)) return InvalidAuthResponse();

                config.SaveCred(cred);

                return SuccessfulResponse();
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost]
        public CommonResponse LoadCred(string username, string password, string guid)
        {
            try
            {
                // disallow non admin
                if (username != "admin" || !CheckAuth(username, password)) return InvalidAuthResponse();

                var response = new CredInfoResponse();

                response.Cred = config.LoadCred(guid);

                return response;
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost]
        public CommonResponse DeleteCred(string username, string password, string guid)
        {
            try
            {
                // disallow non admin
                if (username != "admin" || !CheckAuth(username, password)) return InvalidAuthResponse();

                config.DeleteCred(guid);

                return SuccessfulResponse();
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost]
        public CommonResponse CredList(string username, string password, string filter)
        {
            try
            {
                // disallow non admin
                if (username != "admin" || !CheckAuth(username, password)) return InvalidAuthResponse();

                var response = new CredInfoListResponse();

                response.CredList = config.GetCredList(filter);

                return response;
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        #endregion

        #region CONTACTS

        [HttpPost]
        public CommonResponse SaveContact(string username, string password, ContactInfo contact)
        {
            try
            {                
                if (!CheckAuth(username, password)) return InvalidAuthResponse();

                config.SaveContact(contact);

                return SuccessfulResponse();
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost]
        public CommonResponse LoadContact(string username, string password, string guid)
        {
            try
            {                
                if (!CheckAuth(username, password)) return InvalidAuthResponse();

                var response = new ContactInfoResponse();

                response.Contact = config.LoadContact(guid);

                return response;
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost]
        public CommonResponse DeleteContact(string username, string password, string guid)
        {
            try
            {                
                if (!CheckAuth(username, password)) return InvalidAuthResponse();

                config.DeleteContact(guid);

                return SuccessfulResponse();
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost]
        public CommonResponse ContactList(string username, string password, string filter)
        {
            try
            {                
                if (!CheckAuth(username, password)) return InvalidAuthResponse();

                var response = new ContactInfoListResponse();

                response.ContactList = config.GetContactList(filter);

                return response;
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
