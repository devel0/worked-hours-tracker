//-------------------------------------------------------------------------
// jobs
//-------------------------------------------------------------------------
$('.js-jobs-btn').click(function (e) {
    gotoState('jobs');
    reloadJobs();
});

// load jobs list
function reloadJobs() {
    $.post(urlbase + '/Api/JobList',
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
                _.each(_.sortBy(data.jobList, (x) => x.name), (x) => {
                    html += '<tr>';
                    html += '<td><a href="#edit" onclick="openJob(\'' + x.id + '\');">' + x.name + '</a></td>';                    
                    html += '</tr>';
                });
                html += '</tbody>';
                html += '</table>';
                $('#jobs-tbl').html(html);
            } else {
                $.notify('invalid login', 'error');
                gotoState('login');
            }
        });
}

function clearJobEdit() {
    $('#job-edit-id')[0].value = '0';
    $('#job-edit-name-box')[0].value = '';
}

function buildJobEditObj() {
    return {
        id: $('#job-edit-id')[0].value,
        name: $('#job-edit-name-box')[0].value
    };
}

function isEmptyJobObj(o) {
    return $.trim($('#job-edit-name-box')[0].value) == "";
}

// create job
$('.js-job-new-btn').click(function (e) {
    clearJobEdit();

    jobEditOrig = JSON.stringify(buildJobEditObj());

    gotoState('job-edit');
})

// edit job
function openJob(id) {
    $.post(urlbase + '/Api/LoadJob',
        {
            username: username,
            password: password,
            id: id
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiSuccessful(data)) {
                $('#job-edit-name-box')[0].value = data.job.name;
                $('#job-edit-id')[0].value = data.job.id;

                jobEditOrig = JSON.stringify(buildJobEditObj());

                gotoState('job-edit');
            } else {
                $.notify('invalid login', 'error');
                gotoState('login');
            }
        });
}

// save job
$('.js-job-save-btn').click(function (e) {
    if (isEmptyJobObj()) {
        $.notify('cannot save empty', 'warning');
        return;
    }

    $.post(
        urlbase + '/Api/SaveJob',
        {
            username: username,
            password: password,
            jJob: buildJobEditObj()
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiInvalidAuth(data)) showPart('.js-login');
            else {
                $.notify('data saved', 'success');
                gotoState('jobs');
                reloadJobs();
            }
        }
    );

})

// remove job
$('.js-job-delete-btn').click(function (e) {
    if (confirm('sure to delete ?')) {
        $.post(
            urlbase + '/Api/DeleteJob',
            {
                username: username,
                password: password,
                id: $('#job-edit-id')[0].value
            },
            function (data, status, jqXHR) {
                if (checkApiError(data)) return;
                if (checkApiInvalidAuth(data)) showPart('.js-login');
                else {
                    $.notify('data saved', 'success');
                    gotoState('jobs');
                    reloadJobs();
                }
            }
        );
    }
})

// close job
let jobEditOrig = null;

function tryDiscardJobEdit() {
    if (JSON.stringify(buildJobEditObj()) == jobEditOrig || confirm('Discard changes ?') == true) {
        gotoState('jobs');
        return true;
    }
    return false;
}

$('.js-job-discard-btn').click(function (e) {
    if (tryDiscardJobEdit()) {
        history.pushState(null, '', '/');
    }
})
