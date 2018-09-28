//-------------------------------------------------------------------------
// contacts
//-------------------------------------------------------------------------
$('.js-contacts-btn').click(function (e) {
    gotoState('customers');
    reloadCustomers();
});

// load contacts list
function reloadCustomers() {
    $.post(urlbase + '/Api/CustomerList',
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
                _.each(_.sortBy(data.customerList, (x) => x.name), (x) => {
                    html += '<tr>';
                    html += '<td><a href="#edit" onclick="openCustomer(\'' + x.id + '\');">' + x.name + '</a></td>';                    
                    html += '</tr>';
                });
                html += '</tbody>';
                html += '</table>';
                $('#customers-tbl').html(html);
            } else {
                $.notify('invalid login', 'error');
                gotoState('login');
            }
        });
}

function clearCustomerEdit() {
    $('#customer-edit-id')[0].value = '0';
    $('#customer-edit-name-box')[0].value = '';
}

function buildCustomerEditObj() {
    return {
        id: $('#customer-edit-id')[0].value,
        name: $('#customer-edit-name-box')[0].value
    };
}

function isEmptyContactObj(o) {
    return $.trim($('#customer-edit-name-box')[0].value) == "";
}

// create customer
$('.js-customer-new-btn').click(function (e) {
    clearCustomerEdit();

    contactEditOrig = JSON.stringify(buildCustomerEditObj());

    gotoState('customer-edit');
})

// edit customer
function openCustomer(id) {
    $.post(urlbase + '/Api/LoadCustomer',
        {
            username: username,
            password: password,
            id: id
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiSuccessful(data)) {
                $('#customer-edit-name-box')[0].value = data.customer.name;
                $('#customer-edit-id')[0].value = data.customer.id;

                contactEditOrig = JSON.stringify(buildCustomerEditObj());

                gotoState('customer-edit');
            } else {
                $.notify('invalid login', 'error');
                gotoState('login');
            }
        });
}

// save customer
$('.js-customer-save-btn').click(function (e) {
    if (isEmptyContactObj()) {
        $.notify('cannot save empty', 'warning');
        return;
    }

    $.post(
        urlbase + '/Api/SaveCustomer',
        {
            username: username,
            password: password,
            jCustomer: buildCustomerEditObj()
        },
        function (data, status, jqXHR) {
            if (checkApiError(data)) return;
            if (checkApiInvalidAuth(data)) showPart('.js-login');
            else {
                $.notify('data saved', 'success');
                gotoState('customers');
                reloadCustomers();
            }
        }
    );

})

// remove customer
$('.js-customer-delete-btn').click(function (e) {
    if (confirm('sure to delete ?')) {
        $.post(
            urlbase + '/Api/DeleteCustomer',
            {
                username: username,
                password: password,
                id: $('#customer-edit-id')[0].value
            },
            function (data, status, jqXHR) {
                if (checkApiError(data)) return;
                if (checkApiInvalidAuth(data)) showPart('.js-login');
                else {
                    $.notify('data saved', 'success');
                    gotoState('customers');
                    reloadCustomers();
                }
            }
        );
    }
})

// close contact
let contactEditOrig = null;

function tryDiscardCustomerEdit() {
    if (JSON.stringify(buildCustomerEditObj()) == contactEditOrig || confirm('Discard changes ?') == true) {
        gotoState('customers');
        return true;
    }
    return false;
}

$('.js-customer-discard-btn').click(function (e) {
    if (tryDiscardCustomerEdit()) {
        history.pushState(null, '', '/');
    }
})
