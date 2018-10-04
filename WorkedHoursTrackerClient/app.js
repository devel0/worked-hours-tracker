//urlbase = 'http://localhost:5000'; // set to external url from entrypoint
urlbase = window.location.protocol + '//' + window.location.hostname;

debugmode = true; // set to false from entrypoint
if (debugmode) urlbase += ":5000";

username = '';
password = '';

username = sessionStorage.getItem('username');
password = sessionStorage.getItem('password');

// caches loaded data
let credshortlistdata = null;

// control page navigation state
let state = '';

let filterTimer = null;

/**
 * 
 * @param apiurl example: /api/UserList
 * @param data example: { username: 'xxx' }
 * @param success example: function (data) { }
 */
function post(apiurl,data,success)
{
    $.ajax({
        method: 'POST',
        url: urlbase + apiurl,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        success: success
    });
}

window.onpopstate = function (e) {
    let loc = new this.URL(document.location);

    //console.log('onpostate loc:[' + loc + '] hash:[' + loc.hash + '] state:[' + state + ']');

    if (state == 'user-edit' && loc.hash == '') {
        if (!tryDiscardUserEdit()) {
            this.history.pushState(null, 'edit', '#edit');
        }
    } else if (state == 'job-edit' && loc.hash == '') {
        if (!tryDiscardJobEdit()) {
            this.history.pushState(null, 'edit', '#edit');
        }
    } else if (state == 'job-edit-note' && loc.hash == '') {
        if (!tryDiscardJobEdit()) {
            this.history.pushState(null, 'edit', '#edit');
        }
    }
}

$('#login-btn').click(function (e) {
    e.preventDefault();
    username = $('#login-username-box')[0].value;
    password = $('#login-password-box')[0].value;
    checkLogin();
})

$('.js-logout-btn').click(function (e) {
    username = '';
    password = '';
    savePassword();
    gotoState('login');
})

// check if login required
$.ajax({
    method: 'POST',
    url: urlbase + '/api/IsAuthValid',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify({
        username: username,
        password: password
    }),
    success: function (data) {
        if (checkApiError(data)) return;
        if (checkApiInvalidAuth(data))
            gotoState('login');
        else {
            gotoState('main');
        }
    }
});