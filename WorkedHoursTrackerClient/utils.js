completion_connected = false;

// helper : gotoState
function gotoState(newstate) {
    state = newstate;
    switch (state) {
        case 'login': showPart('.js-login'); break;

        case 'main':
            {
                _.forEach($('.js-admin-fn'), (x) => {
                    if (username != "admin")
                        $(x).addClass('collapse');
                    else
                        $(x).removeClass('collapse');
                });

                showPart('.js-main');
            }
            break;

        case 'users':
            {
                showInnerPart('.js-main', '.js-main-users');
            }
            break;

        case 'user-edit':
            {
                showInnerPart('.js-main', '.js-main-user-edit');
            }
            break;

        case 'contacts':
            {
                showInnerPart('.js-main', '.js-main-contacts');
            }
            break;

        case 'contact-edit':
            {
                showInnerPart('.js-main', '.js-main-contact-edit');
            }
            break;        

        case 'report':
            {
                showInnerPart('.js-main', '.js-main-report');
            }
            break;

    }
}

// save password ( if debug mode )
function savePassword() {
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('password', password);
}

// helper : shortPart
function showPart(jFilter) {
    $('.js-part').addClass('collapse');
    $('.js-inner-part').addClass('collapse');
    $(jFilter).removeClass('collapse');
}

function showInnerPart(jFilter, jFilterInner) {
    showPart(jFilter);
    $(jFilterInner).removeClass('collapse');
}

// helper : checkApiError
function checkApiError(data) {
    if (data && data.exitCode == 1) {
        $.notify('error: ' + data.errorMsg, 'error');
        return true;
    }
    return false;
}

// helper : checkApiSuccessful
function checkApiSuccessful(data) {
    return data && data.exitCode == 0;
}

// helper : checkApiInvalidAuth
function checkApiInvalidAuth(data) {
    return data && data.exitCode == 2;
}

function checkLogin() {
    $.post(urlbase + '/Api/IsAuthValid',
        {
            username: username,
            password: password
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiSuccessful(data)) {
                $.notify('logged in', 'success');
                savePassword();
                gotoState('main');
            } else {
                $.notify('invalid login', 'error');
            }
        });
}