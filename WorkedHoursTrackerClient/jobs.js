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
                if (username == 'admin') {
                    html += '<th scope="col">Cost (base)</th>';
                    html += '<th scope="col">Cost (min)</th>';
                    html += '<th scope="col">Cost (factor)</th>';
                    html += '<th scope="col">Minutes round</th>';
                }
                html += '<th scope="col">Total (hr)</th>';
                html += '<th scope="col">Last24 (hr)</th>';
                html += '<th scope="col">Action</th>';
                html += '</tr></thead>';
                html += '<tbody>';
                _.each(_.sortBy(data.jobList, (x) => x.name), (x) => {
                    html += '<tr>';
                    if (username == 'admin') {
                        html += '<td><a href="#edit" onclick="openJob(\'' + x.id + '\');">' + x.name + '</a></td>';
                        html += '<td><a href="#edit" onclick="openJob(\'' + x.id + '\');">' + x.base_cost + '</a></td>';
                        html += '<td><a href="#edit" onclick="openJob(\'' + x.id + '\');">' + x.min_cost + '</a></td>';
                        html += '<td><a href="#edit" onclick="openJob(\'' + x.id + '\');">' + x.cost_factor + '</a></td>';
                        html += '<td><a href="#edit" onclick="openJob(\'' + x.id + '\');">' + x.minutes_round + '</a></td>';
                    }
                    else
                        html += '<td>' + x.name + '</td>';

                    html += '<td>' + x.total_hours.toFixed(1) + '</td>';
                    html += '<td>' + x.last_24_hours.toFixed(1) + '</td>';

                    html += '<td><a href="#edit" onclick="triggerJob(\'' + x.id + '\');">' + (x.is_active ? "Deactivate" : "Activate") + '</a></td>';

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
        name: $('#job-edit-name-box')[0].value,
        base_cost: $('#job-edit-basecost-box')[0].value,
        min_cost: $('#job-edit-mincost-box')[0].value,
        cost_factor: $('#job-edit-costfactor-box')[0].value,
        minutes_round: $('#job-edit-minutesround-box')[0].value
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
            id_job: id
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiSuccessful(data)) {
                $('#job-edit-name-box')[0].value = data.job.name;
                $('#job-edit-id')[0].value = data.job.id;
                $('#job-edit-basecost-box')[0].value = data.job.base_cost;
                $('#job-edit-mincost-box')[0].value = data.job.min_cost;
                $('#job-edit-costfactor-box')[0].value = data.job.cost_factor;
                $('#job-edit-minutesround-box')[0].value = data.job.minutes_round;

                jobEditOrig = JSON.stringify(buildJobEditObj());

                gotoState('job-edit');
            } else {
                $.notify('invalid login', 'error');
                gotoState('login');
            }
        });
}

// trigger job
function triggerJob(id) {
    $.post(urlbase + '/Api/TriggerJob',
        {
            username: username,
            password: password,
            id_job: id
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiSuccessful(data)) {                
                reloadJobs();
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
                id_job: $('#job-edit-id')[0].value
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
