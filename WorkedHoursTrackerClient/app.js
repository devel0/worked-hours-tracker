urlbase = window.location.protocol + '//' + window.location.hostname;
debugmode = true; // set to false from entrypoint
if (debugmode) urlbase += ":5000";

username = '';
password = '';

username = sessionStorage.getItem('username');
password = sessionStorage.getItem('password');

can_edit_jobs = false;
can_edit_activities = false;

// caches loaded data
let credshortlistdata = null;

// control page navigation state
let state = '';

let filterTimer = null;

window.onpopstate = function (e) {
    let loc = new this.URL(document.location);

    //console.log('onpostate loc:[' + loc + '] hash:[' + loc.hash + '] state:[' + state + ']');

    if (state == 'user-edit' && loc.hash == '') {
        if (!tryDiscardUserEdit()) {
            this.history.pushState(null, 'edit', '#edit');
        }
    } else if (state == 'activity-edit' && loc.hash == '') {
        if (!tryDiscardActivityEdit()) {
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
$.post(
    urlbase + '/Api/IsAuthValid',
    { username: username, password: password },
    function (data, status, jqXHR) {
        if (checkApiError(data)) return;
        if (checkApiInvalidAuth(data))
            gotoState('login');
        else {
            can_edit_activities = data.canEditActivities;
            can_edit_jobs = data.canEditJobs;
            gotoState('main');
        }
    }
);
