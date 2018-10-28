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

        case 'activities':
            {
                showInnerPart('.js-main', '.js-main-activities');
            }
            break;

        case 'activity-edit':
            {
                showInnerPart('.js-main', '.js-main-activity-edit');
            }
            break;

        case 'jobs':
            {
                showInnerPart('.js-main', '.js-main-jobs');
            }
            break;

        case 'job-edit':
            {
                showInnerPart('.js-main', '.js-main-job-edit');
            }
            break;

        case 'job-edit-note':
            {
                showInnerPart('.js-main', '.js-main-job-edit-note');
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
                can_edit_activities = data.canEditActivities;
                can_edit_jobs = data.canEditJobs;
                gotoState('main');
            } else {
                $.notify('invalid login', 'error');
            }
        });
}