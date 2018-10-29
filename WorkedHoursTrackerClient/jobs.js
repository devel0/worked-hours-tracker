//-------------------------------------------------------------------------
// jobs
//-------------------------------------------------------------------------

$('.js-jobs-btn').click(function (e) {
    gotoState('jobs');
    reloadJobs();
});

var dsJobs = null;
var dsJobsQueryTime = null;
setInterval(timeChecker, 3000);

function timeChecker() {
    if (dsJobsQueryTime == null) return;
    _.each(dsJobs, (x) => {
        if (x.is_active) {
            let dtdiff_h = moment(new Date()).diff(moment(dsJobsQueryTime)) / 1000 / 60 / 60;

            {
                let hdiff = x.total_hours + dtdiff_h;
                let hh = Math.trunc(hdiff);
                let mdiff = (hdiff - hh) * 60;
                let mm = Math.trunc(mdiff);
                let ss = Math.trunc((mdiff - mm) * 60);

                let hitem = $('#jtot_' + x.job.id);

                hitem[0].textContent = hh + ":" + mm;
            }

            {
                let hdiff = x.last_24_hours + dtdiff_h;
                let hh = Math.trunc(hdiff);
                let mdiff = (hdiff - hh) * 60;
                let mm = Math.trunc(mdiff);
                let ss = Math.trunc((mdiff - mm) * 60);

                let hitem = $('#j24_' + x.job.id);

                hitem[0].textContent = hh + ":" + mm + ":" + ss;
                hitem.addClass('running-hours');
            }
        }
    });
}

// load jobs list
function reloadJobs() {
    $.post(urlbase + '/Api/ActivityList',
        {
            username: username,
            password: password
        },
        function (data1, status1, jqXHR1) {
            activities = data1.activityList;

            $.post(urlbase + '/Api/JobList',
                {
                    username: username,
                    password: password
                },
                function (data, status, jqXHR) {
                    if (checkApiError(data)) return;
                    if (checkApiSuccessful(data)) {
                        let html = '';

                        html += '<datalist id="actions">';                        
                        _.each(activities, (act) => {
                            html += '<option value="' + act.name + '" title="' + act.description +'">' + act.name + '</option>';
                        });                        
                        html += '</datalist>';

                        html += '<table class="table table-striped">';
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
                        html += '<th scope="col">Activity</th>';
                        html += '<th scope="col">Action</th>';
                        html += '</tr></thead>';
                        html += '<tbody>';
                        dsJobsQueryTime = new Date();
                        dsJobs = _.sortBy(_.sortBy(data.userJobList, (x) => x.name), (x) => !x.is_active);
                        _.each(dsJobs, (x) => {
                            html += '<tr>';
                            html += '<td><a href="#edit" onclick="openJob(\'' + x.job.id + '\');">' + x.job.name + '</a></td>';
                            if (username == 'admin') {
                                html += '<td><a href="#edit" onclick="openJob(\'' + x.job.id + '\');">' + x.job.base_cost + '</a></td>';
                                html += '<td><a href="#edit" onclick="openJob(\'' + x.job.id + '\');">' + x.job.min_cost + '</a></td>';
                                html += '<td><a href="#edit" onclick="openJob(\'' + x.job.id + '\');">' + x.job.cost_factor + '</a></td>';
                                html += '<td><a href="#edit" onclick="openJob(\'' + x.job.id + '\');">' + x.job.minutes_round + '</a></td>';
                            }

                            html += '<td><span id="jtot_' + x.job.id + '">' + x.total_hours.toFixed(2) + '</span></td>';
                            html += '<td><span id="j24_' + x.job.id + '">' + x.last_24_hours.toFixed(2) + '</span></td>';

                            if (x.is_active) {
                                html += '<td>' + x.activity + '</td>';
                                html += '<td><a href="#edit" onclick="triggerJob(\'' + x.job.id + '\');">';
                                html += 'Deactivate</a> - <a href="#edit" onclick="editJobNotes(\'' + x.job.id + '\');">';
                                html += '<i class="far fa-sticky-note"></i> Notes';
                                html += '</a></td>';
                            }
                            else {
                                html += "<td><input list='actions' id='action_" + x.job.id + "'/></td>";
                                html += '<td>';
                                html += '<a href="#edit" onclick="triggerJob(\'' + x.job.id + '\');">Activate</a>';
                                html += '<a href="#edit" onclick="reviseJob(\'' + x.job.id + '\');"> - Revise</a>';
                                html += '</td>';
                            }

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
        });
}

//-------------------------------------------------------------------------
// job edit
//-------------------------------------------------------------------------

let jobEditOrig = null;

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

//-------------------------------------------------------------------------
// job notes
//-------------------------------------------------------------------------

// edit job notes
function editJobNotes(id) {
    loadJobNote(id);
}

//-------------------------------------------------------------------------
// job trigger
//-------------------------------------------------------------------------

// trigger job
function triggerJob(id) {
    let actstr = '';
    let qact = $('#action_' + id);
    if (qact[0] != null) actstr = qact[0].value;

    $.post(urlbase + '/Api/TriggerJob',
        {
            username: username,
            password: password,
            id_job: id,
            activity: actstr
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

//-------------------------------------------------------------------------
// job revise
//-------------------------------------------------------------------------

let jobReviseOrig = null;

function clearJobRevise() {
    $('#job-revise-name-box')[0].value = '';
    $('#job-revise-id-from')[0].value = '0';
    $('#job-revise-from')[0].value = '';
    $('#job-revise-id-to')[0].value = '0';    
    $('#job-revise-to')[0].value = '';
    $('#job-revise-notes-box')[0].value = '';
}

function buildJobReviseObj() {
    return {        
        name: $('#job-revise-name-box')[0].value,        
        id_user_job_from: $('#job-revise-id-from')[0].value,
        from: $('#job-revise-from')[0].value,
        id_user_job_to: $('#job-revise-id-to')[0].value,
        to: $('#job-revise-to')[0].value,
        notes: $('#job-revise-notes-box')[0].value,
    };
}

function isEmptyJobReviseObj(o) {
    return $.trim($('#job-revise-name-box')[0].value) == "";
}

// save job revise
$('.js-job-revise-save-btn').click(function (e) {
    if (isEmptyJobReviseObj()) {
        $.notify('cannot save empty', 'warning');
        return;
    }

    $.post(
        urlbase + '/Api/SaveJobRevise',
        {
            username: username,
            password: password,
            jJobRevise: buildJobReviseObj()
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

// remove job revise
$('.js-job-revise-delete-btn').click(function (e) {
    if (confirm('sure to delete ?')) {
        $.post(
            urlbase + '/Api/DeleteJobRevise',
            {
                username: username,
                password: password,
                jJobRevise: buildJobReviseObj()
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

// revise job
function reviseJob(id) {    
    $.post(urlbase + '/Api/LoadReviseJob',
        {
            username: username,
            password: password,
            id_job: id,
            last_index: 1
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiSuccessful(data)) {
                $('#job-revise-name-box')[0].value = data.job.name;
                $('#job-revise-activity-box')[0].value = data.activity;
                $('#job-revise-id-from')[0].value = data.id_user_job_from;
                $('#job-revise-from')[0].value = moment(data.from).format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS);
                $('#job-revise-id-to')[0].value = data.id_user_job_to;
                $('#job-revise-to')[0].value = moment(data.to).format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS);
                $('#job-revise-notes-box')[0].value = data.notes;

                jobReviseOrig = JSON.stringify(buildJobReviseObj());

                gotoState('job-revise');
            } else {
                $.notify('invalid login', 'error');
                gotoState('login');
            }
        });
}

function tryDiscardJobRevise() {
    if (JSON.stringify(buildJobReviseObj()) == jobReviseOrig || confirm('Discard changes ?') == true) {
        gotoState('jobs');
        return true;
    }
    return false;
}

$('.js-job-revise-discard-btn').click(function (e) {
    if (tryDiscardJobRevise()) {
        history.pushState(null, '', '/');
    }
})
