var edit_job_note_id_job = 0;

function loadJobNote(id) {
    edit_job_note_id_job = id;

    post(
        '/api/GetJobNotes',
        {
            username: username,
            password: password,
            id_job: edit_job_note_id_job
        },
        function (data) {
            if (checkApiError(data)) {
                gotoState('jobs');
                return;
            }
            if (checkApiInvalidAuth(data)) showPart('.js-login');
            else {
                $('#job-edit-note-notes-box')[0].value = data.notes;
                gotoState('job-edit-note');
            }
        }
    );
}

// save job
$('.js-job-note-save-btn').click(function (e) {
    post(
        '/api/SaveJobNotes',
        {
            username: username,
            password: password,
            id_job: edit_job_note_id_job,
            notes: $('#job-edit-note-notes-box')[0].value
        },
        function (data) {
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

// close job
let jobEditNoteOrig = null;

function tryDiscardJobEditNote() {
    if ($('#job-edit-note-notes-box')[0].value == jobEditNoteOrig || confirm('Discard changes ?') == true) {
        gotoState('jobs');
        return true;
    }
    return false;
}

$('.js-job-note-discard-btn').click(function (e) {
    if (tryDiscardJobEditNote()) {
        history.pushState(null, '', '/');
    }
})
