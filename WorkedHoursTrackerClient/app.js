urlbase = 'http://localhost:5000'; // set to external url from entrypoint
debugmode = true; // set to false from entrypoint

username = '';
password = '';

username = sessionStorage.getItem('username');
password = sessionStorage.getItem('password');

// caches loaded data
let credshortlistdata = null;

// control page navigation state
let state = '';

let filterTimer = null;

window.onpopstate = function (e) {
    let loc = new this.URL(document.location);

    console.log('onpostate loc:[' + loc + '] hash:[' + loc.hash + '] state:[' + state + ']');

    if (state == 'user-edit' && loc.hash == '') {
        if (!tryDiscardEdit()) {
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

//-------------------------------------------------------------------------
// users
//-------------------------------------------------------------------------
$('.js-users-btn').click(function (e) {
    gotoState('users');
    reloadUsers();
})

// load user list
function reloadUsers() {
    $.post(urlbase + '/Api/CredList',
        {
            username: username,
            password: password
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiSuccessful(data)) {
                let html = '<table class="table table-striped">';
                html += '<thead><tr>';
                html += '<th scope="col">Username</th>';
                html += '</tr></thead>';
                html += '<tbody>';
                _.each(_.sortBy(data.credList, (x) => x.username), (x) => {
                    html += '<tr>';
                    html += '<td><a href="#edit" onclick="openUser(\'' + x.guid + '\');">' + x.username + '</a></td>';
                    html += '</tr>';
                });
                html += '</tbody>';
                html += '</table>';
                $('#users-tbl').html(html);
            } else {
                $.notify('invalid login', 'error');
                gotoState('login');
            }
        });
}

function clearUserEdit() {
    $('#user-edit-username-box')[0].value = '';
    $('#user-edit-password-box')[0].value = '';
}

function buildUserEditObj() {
    return {
        username: $('#user-edit-username-box')[0].value,
        password: $('#user-edit-password-box')[0].value,
        guid: $('#user-guid')[0].value
    };
}

function isEmptyUserObj(o) {
    return $.trim($('#user-edit-username-box')[0].value) == "" &&
        $.trim($('#user-edit-password-box')[0].value) == "";
}

// create user
$('.js-user-new-btn').click(function (e) {
    clearUserEdit();

    userEditOrig = JSON.stringify(buildUserEditObj());

    gotoState('user-edit');
})

// edit user
function openUser(guid) {
    $.post(urlbase + '/Api/LoadCred',
        {
            username: username,
            password: password,
            guid: guid
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiSuccessful(data)) {
                $('#user-edit-username-box')[0].value = data.cred.username;
                $('#user-edit-password-box')[0].value = data.cred.password;
                $('#user-guid')[0].value = data.cred.guid;

                userEditOrig = JSON.stringify(buildUserEditObj());

                gotoState('user-edit');
            } else {
                $.notify('invalid login', 'error');
                gotoState('login');
            }
        });
}

// save user
$('.js-user-save-btn').click(function (e) {
    if (isEmptyUserObj()) {
        $.notify('cannot save empty', 'warning');
        return;
    }

    $.post(
        urlbase + '/Api/SaveCred',
        {
            username: username,
            password: password,
            cred: buildUserEditObj()
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiInvalidAuth(data)) showPart('.js-login');
            else {
                $.notify('data saved', 'success');
                gotoState('users');
                reloadUsers();
            }
        }
    );

})

// remove user

// close user
let userEditOrig = null;

function tryDiscardUserEdit() {
    if (JSON.stringify(buildUserEditObj()) == userEditOrig || confirm('Discard changes ?') == true) {
        gotoState('users');
        return true;
    }
    return false;
}

$('.js-user-discard-btn').click(function (e) {
    if (tryDiscardUserEdit()) {
        history.pushState(null, '', '/');
    }
})

//-------------------------------------------------------------------------
// contacts
//-------------------------------------------------------------------------
$('.js-contacts-btn').click(function (e) {
    gotoState('contacts');
});

//-------------------------------------------------------------------------
// costs
//-------------------------------------------------------------------------
$('.js-costs-btn').click(function (e) {
    gotoState('costs');
});

//-------------------------------------------------------------------------
// report
//-------------------------------------------------------------------------
$('.js-report-btn').click(function (e) {
    gotoState('report');
});

// check if login required
$.post(
    urlbase + '/Api/IsAuthValid',
    { username: username, password: password },
    function (data, status, jqXHR) {
        if (checkApiError(data)) return;
        if (checkApiInvalidAuth(data))
            gotoState('login');
        else {
            gotoState('main');
        }
    }
);
