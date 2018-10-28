//-------------------------------------------------------------------------
// activities
//-------------------------------------------------------------------------
$('.js-activities-btn').click(function (e) {
    gotoState('activities');
    reloadActivities();
});

var dsActivities = null;

// load activities list
function reloadActivities() {
    $.post(urlbase + '/Api/ActivityList',
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
                html += '<th scope="col">Description</th>';
                html += '</tr></thead>';
                html += '<tbody>';
                dsActivities = _.sortBy(data.activityList, (x) => x.name);
                _.each(dsActivities, (x) => {
                    html += '<tr>';
                    html += '<td><a href="#edit" onclick="openActivity(\'' + x.id + '\');">' + x.name + '</a></td>';
                    html += '<td><a href="#edit" onclick="openActivity(\'' + x.id + '\');">' + x.description + '</a></td>';
                    html += '</tr>';
                });
                html += '</tbody>';
                html += '</table>';
                $('#activities-tbl').html(html);
            } else {
                $.notify('invalid login', 'error');
                gotoState('login');
            }
        });
}

function clearActivityEdit() {
    $('#activity-edit-id')[0].value = '0';
    $('#activity-edit-name-box')[0].value = '';
    $('#activity-edit-description-box')[0].value = '';
}

function buildActivityEditObj() {
    return {
        id: $('#activity-edit-id')[0].value,
        name: $('#activity-edit-name-box')[0].value,
        description: $('#activity-edit-description-box')[0].value
    };
}

function isEmptyActivityObj(o) {
    return $.trim($('#activity-edit-name-box')[0].value) == "";
}

// create activity
$('.js-activity-new-btn').click(function (e) {
    clearActivityEdit();

    activityEditOrig = JSON.stringify(buildActivityEditObj());

    gotoState('activity-edit');
})

// edit activity
function openActivity(id) {
    $.post(urlbase + '/Api/LoadActivity',
        {
            username: username,
            password: password,
            id_activity: id
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiSuccessful(data)) {
                $('#activity-edit-name-box')[0].value = data.activity.name;
                $('#activity-edit-description-box')[0].value = data.activity.description;
                $('#activity-edit-id')[0].value = data.activity.id;

                activityEditOrig = JSON.stringify(buildActivityEditObj());

                gotoState('activity-edit');
            } else {
                $.notify('invalid login', 'error');
                gotoState('login');
            }
        });
}

// save activity
$('.js-activity-save-btn').click(function (e) {
    if (isEmptyActivityObj()) {
        $.notify('cannot save empty', 'warning');
        return;
    }

    $.post(
        urlbase + '/Api/SaveActivity',
        {
            username: username,
            password: password,
            jActivity: buildActivityEditObj()
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiInvalidAuth(data)) showPart('.js-login');
            else {
                $.notify('data saved', 'success');
                gotoState('activities');
                reloadActivities();
            }
        }
    );

})

// remove activity
$('.js-activity-delete-btn').click(function (e) {
    if (confirm('sure to delete ?')) {
        $.post(
            urlbase + '/Api/DeleteActivity',
            {
                username: username,
                password: password,
                id_activity: $('#activity-edit-id')[0].value
            },
            function (data, status, jqXHR) {
                if (checkApiError(data)) return;
                if (checkApiInvalidAuth(data)) showPart('.js-login');
                else {
                    $.notify('data saved', 'success');
                    gotoState('activities');
                    reloadActivities();
                }
            }
        );
    }
})

// close activity
let activityEditOrig = null;

function tryDiscardActivityEdit() {
    if (JSON.stringify(buildActivityEditObj()) == activityEditOrig || confirm('Discard changes ?') == true) {
        gotoState('activities');
        return true;
    }
    return false;
}

$('.js-activity-discard-btn').click(function (e) {
    if (tryDiscardActivityEdit()) {
        history.pushState(null, '', '/');
    }
})
