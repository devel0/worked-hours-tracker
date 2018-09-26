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
