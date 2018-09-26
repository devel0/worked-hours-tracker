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
        if (!tryDiscardUserEdit()) {
            this.history.pushState(null, 'edit', '#edit');
        }
    } else if (state == 'contact-edit' && loc.hash == '') {
        if (!tryDiscardContactEdit()) {
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
                html += '<th scope="col">Cost</th>';
                html += '</tr></thead>';
                html += '<tbody>';
                _.each(_.sortBy(data.credList, (x) => x.username), (x) => {
                    html += '<tr>';
                    html += '<td><a href="#edit" onclick="openUser(\'' + x.guid + '\');">' + x.username + '</a></td>';
                    html += '<td><a href="#edit" onclick="openUser(\'' + x.guid + '\');">' + x.cost + '</a></td>';
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
    $('#user-edit-cost-box')[0].value = '0';
}

function buildUserEditObj() {
    return {
        username: $('#user-edit-username-box')[0].value,
        password: $('#user-edit-password-box')[0].value,
        cost: $('#user-edit-cost-box')[0].value,
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
                $('#user-edit-cost-box')[0].value = data.cred.cost;
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
$('.js-user-delete-btn').click(function (e) {
    if (confirm('sure to delete ?')) {
        $.post(
            urlbase + '/Api/DeleteCred',
            {
                username: username,
                password: password,
                guid: $('#user-guid')[0].value
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
    }
})

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
    reloadContacts();
});

// load contacts list
function reloadContacts() {
    $.post(urlbase + '/Api/ContactList',
        {
            username: username,
            password: password
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiSuccessful(data)) {
                let html = '<table class="table table-striped">';
                html += '<thead><tr>';
                html += '<th scope="col">Name</th>';                
                html += '</tr></thead>';
                html += '<tbody>';
                _.each(_.sortBy(data.contactList, (x) => x.username), (x) => {
                    html += '<tr>';
                    html += '<td><a href="#edit" onclick="openContact(\'' + x.guid + '\');">' + x.name + '</a></td>';                    
                    html += '</tr>';
                });
                html += '</tbody>';
                html += '</table>';
                $('#contacts-tbl').html(html);
            } else {
                $.notify('invalid login', 'error');
                gotoState('login');
            }
        });
}

function clearContactEdit() {
    $('#contact-edit-name-box')[0].value = '';    ;
}

function buildContactEditObj() {
    return {
        name: $('#contact-edit-name-box')[0].value,        
        guid: $('#user-guid')[0].value
    };
}

function isEmptyContactObj(o) {
    return $.trim($('#contact-edit-name-box')[0].value) == "";
}

// create contact
$('.js-contact-new-btn').click(function (e) {
    clearContactEdit();

    contactEditOrig = JSON.stringify(buildContactEditObj());

    gotoState('contact-edit');
})

// edit contact
function openContact(guid) {
    $.post(urlbase + '/Api/LoadContact',
        {
            username: username,
            password: password,
            guid: guid
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiSuccessful(data)) {
                $('#contact-edit-name-box')[0].value = data.contact.name;
                $('#contact-guid')[0].value = data.contact.guid;

                contactEditOrig = JSON.stringify(buildContactEditObj());

                gotoState('contact-edit');
            } else {
                $.notify('invalid login', 'error');
                gotoState('login');
            }
        });
}

// save contact
$('.js-contact-save-btn').click(function (e) {
    if (isEmptyContactObj()) {
        $.notify('cannot save empty', 'warning');
        return;
    }

    $.post(
        urlbase + '/Api/SaveContact',
        {
            username: username,
            password: password,
            contact: buildContactEditObj()
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiInvalidAuth(data)) showPart('.js-login');
            else {
                $.notify('data saved', 'success');
                gotoState('contacts');
                reloadContacts();
            }
        }
    );

})

// remove user
$('.js-contact-delete-btn').click(function (e) {
    if (confirm('sure to delete ?')) {
        $.post(
            urlbase + '/Api/DeleteContact',
            {
                username: username,
                password: password,
                guid: $('#contact-guid')[0].value
            },
            function (data, status, jqXHR) {
                if (checkApiError(data)) return;
                if (checkApiInvalidAuth(data)) showPart('.js-login');
                else {
                    $.notify('data saved', 'success');
                    gotoState('contacts');
                    reloadContacts();
                }
            }
        );
    }
})

// close contact
let contactEditOrig = null;

function tryDiscardContactEdit() {
    if (JSON.stringify(buildContactEditObj()) == contactEditOrig || confirm('Discard changes ?') == true) {
        gotoState('contacts');
        return true;
    }
    return false;
}

$('.js-contact-discard-btn').click(function (e) {
    if (tryDiscardContactEdit()) {
        history.pushState(null, '', '/');
    }
})

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
