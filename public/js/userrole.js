var permissions = {};
var role_strings = ['Customers', 'Employees', 'Suppliers', 'Supplier_Group', 'Inventory', 'Components', 'Products',
                    'Stations', 'Stock_Moves', 'Stock_Traceability', 'Material_Request', 'Request_for_Quotation',
                    'Supplier_Quotation', 'Email_Suppliers', 'Purchase_Order', 'Purchase_Receipt', 'Purchase_Invoice',
                    'Pending_Orders', 'Machine_Manual', 'Work_Center', 'Operations', 'Routings', 'BOM', 'Job_Scheduling',
                    'Sales', 'Payment_Logs', 'Warranty', 'Serial_Numbers', 'Work_Order', 'Delivery', 'Warranty', 'Reports'];

$(document).ready(function () {
    $('#UserRoleTable').DataTable();
    for(let i=0; i<role_strings.length; i++) {
        var key = role_strings[i];
        permissions[key] = {'view' : 0, 'create' : 0, 'edit' : 0, 'delete' : 0};
    }
});

$('.user-view, .user-create, .user-edit, .user-delete').change(function () { 
    var elem_class = $(this).attr('class');
    var elem_func = elem_class.replace('user-', '');
    var tr = $(this).parent('td').parent('tr');
    var tr_id = tr.attr('id');
    var key = tr_id.replace('role', '');
    var value = $(this).prop('checked') == true ? 1 : 0;
    permissions[key][elem_func] = value;
});

$(".role-entity").click(function() {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': CSRF_TOKEN,
        }
    });
    var id = $(this).attr('value');
    $.ajax({
        type: "GET",
        url: `/get-role/${id}`,
        data: id,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            var role = response.role;
            console.log(role);
            $("#roleEditName").val(role.role_name);
            permissions = role.permissions;
            for (let key in permissions) {
                console.log(key);
                var tr = $(`#roleEdit${key}`);
                var role_prop = permissions[key];
                tr.find('.edit-user-view').prop('checked', getCheckStatus(role_prop.view));
                tr.find('.edit-user-create').prop('checked', getCheckStatus(role_prop.create));
                tr.find('.edit-user-edit').prop('checked', getCheckStatus(role_prop.edit));
                tr.find('.edit-user-delete').prop('checked', getCheckStatus(role_prop.delete));
            }
        }
    });
});

function getCheckStatus(value) {
    return (value === 1) ? true : false; 
}

$("#closeRolePrompt, #closeRoleEditPrompt").click(function () { 
    resetRoleForm();
});

function resetRoleForm() {
    $('.user-view, .user-create, .user-edit, .user-delete').prop('checked', false);
    $("#roleName").val(null);
    for(var key in permissions) {
        permissions[key]['view'] = 0;
        permissions[key]['create'] = 0;
        permissions[key]['edit'] = 0;
        permissions[key]['delete'] = 0;
    }
    $("#roleNotif").html(null);
}

$("#saveRole").click(function () { 
    $("#roleForm").submit();
});

$("#URRefresh").click(function () { 
    $("#divMain").load('/userrole');
});

$("#roleForm").submit(function (e) {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': CSRF_TOKEN,
        }
    });
    var formData = new FormData(this);
    formData.append('permissions', JSON.stringify(permissions));
    $.ajax({
        type: $(this).attr('method'),
        url: $(this).attr('action'),
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            resetRoleForm();
            $("#newRoleFormPrompt").modal('hide');
        }
    });
    
    e.preventDefault();
    return false;
});
