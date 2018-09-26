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
