/**
 * Created by laia on 17/03/17.
 */
//VARIABLES GLOBALES
//Variable donde almacenaremos el datatable
var dataTable;
//Creacion de dialog error login
$("#resetForm").dialog({
    my: "center top", at: "center top+75", of: "#container",
    autoOpen: false,
    buttons: {
        OK: function () {
            $(this).dialog("close");
            $(location).attr('href', 'index.html');
        }
    }
});
//Variable donde almacenaremos el json de nombres
var namesGlobal;
//Variable donde almacenaremos el json de checkins
var datesGlobal;
//Variable donde asignaremos el promise del token
var hasLog;
//Variable para localstorage
var localData = localStorage.login;
//Promise de json de checkins
var dateJsonPromise = $.getJSON("http://localhost/ionic/date.json");
//Promise de json de nombres de usuarios
var namesPromise = $.getJSON("http://localhost/ionic/names.json");
//Comprobar si hay login
if($(location).attr('href').indexOf('index.html')!=-1 && localData!=null) {
    checkLocalStorage();
}
//Funcion de comprobar login
function checkLocalStorage() {
    //Promise de token correcto
    hasLog = $.ajax({
        url: "http://localhost/ionic/logAdmin.php",
        type: "POST",
        data: localData
    });
//Cuando el promise se haya cumplido
    hasLog.done(function (resp) {
        //Y si la respuesta es "OK"
        if (resp == "OK") {
            $.when(dateJsonPromise).then(function (dateJsonPromise) {
                namesGlobal = namesPromise[0];
                datesGlobal = dateJsonPromise[0];
                jsonDashBoard(checkLanguage("castellano"), namesGlobal, datesGlobal);
            });

        }
    });
}
//Funcion cerrar sesion
function closeSesion() {
    //Borra localstorage
    window.localStorage.clear();
    //Redirige al indice
    $(location).attr('href', 'index.html');
}
//Boton de login deshabilitado
$('#btnLogin').prop("disabled", true);
//FUNCIONES PARA LOGIN
function makeLogin() {
    //Objeto login que adquiere los datos del formulario
    var login = {
        user: $('#nameUser').val(),
        pass: $('#passUser').val()
    };
    //Promise del primer login
    var firstLogin = $.ajax({
        url: "http://localhost/ionic/logAdmin.php",
        type: "POST",
        data: login
    });
    //Si el login se completa
    function firstLog(resp) {
        //Si es OK
        if (resp == "OK") {
            //Almacena en localstorage
            window.localStorage.setItem('login', JSON.stringify(login));
            //Redirige a dashboard
            window.location.href= 'dashboard.html';
            jsonDashBoard(checkLanguage('castellano'),namesGlobal,datesGlobal);
        }else{
            //Si no es ok, muesta el dialogo de error
            $('#resetForm').dialog("open");
        }
    }
    if (login.user && login.pass) {
        //Si hay valores en login.user y login.pass
        //Ejecuta promise
        firstLogin.then(firstLog);
    }
}
function checkValues() {
    //Si hay valores en usuario y contraseña del formulario
    if($('#nameUser').val() !='' && $('#passUser').val()!=''){
        //Habilita el boton
        $('#btnLogin').prop("disabled", false);
    }
}
//Si pulsa INTRO en el nameUser pasa al siguiente input
$('#nameUser').keypress(function (e) {
    checkValues();
    var code = e.keyCode || e.which;
    if (code == 13) {
        var next = $('[tabIndex=' + (+this.tabIndex + 1) + ']');
        if (!next.length) {
            next = $('[tabIndex=1]');
        }
        next.focus();
    }
});
//Si pulsa INTRO en el passName
$('#passUser').keypress(function (e) {
    checkValues();
    var code = e.keyCode || e.which;
    if (code == 13) {
        makeLogin();
    }
});
//Funcion de log con llamada ajax en click boton
$('#btnLogin').mousedown(function () {
    makeLogin();
});

//FUNCIONES PARA DASHBOARD
$('#initAudit').css('display', 'none');
//Variables traduccion
function checkLanguage(nameLanguage) {
    switch (nameLanguage) {
        case "catalan":
            return {
                "url": "../assets/PHP_y_JSON/Catalan.json"
            };
        case "castellano":
            return {
                "url": "../assets/PHP_y_JSON/Spanish.json"
            };
        case "aleman":
            return {"url": "../assets/PHP_y_JSON/German.json"};
        case "ingles":
            return {"url": "../assets/PHP_y_JSON/English.json"}
    }
}

//EventListener del select de idiomas
$('#languageSelect').change(function () {
    dataTable.destroy();
    jsonDashBoard(checkLanguage($('#languageSelect option:selected').attr("name")),namesGlobal,datesGlobal);
});

//Funcion que inicia dataTables y rellena dataTable pasando por parametro el idioma
function jsonDashBoard(language, names, dates) {
    var arrayJson = [];
    $.each(names, function (g, name) {
        //Variable donde asignamos el nombre de usuario
        var nameUser = g;
        $.each(name, function (j, properties) {
            $.each(dates, function (i, user) {
                $.each(user, function (h, data) {
                    if (data != null) {
                        //Si el nombre de usuario es igual
                        if (data.usuario.toLowerCase() == nameUser) {
                            //Asignamos y añadimos al objeto data nombre y apellidos.
                            data.name = properties.name;
                            data.firstname = properties.firstname;
                            data.lastname = properties.lastname;
                            arrayJson.push(data);
                        }
                    }
                });
            });
        });
    });
    var optionsDataTable = {
        autoWidth: false,
        //Variable idioma que pasamos por parametro
        "language": language,
        //Datos que pasamos a la tabla provinientes del json
        'aaData': arrayJson,
        "aoColumns": [
            //Asinamos a las columnas los datos que debe mostrar
            {"sTitle": "Usuario", "mData": "usuario"},
            {"sTitle": "Nombre", "mData": "name"},
            {"sTitle": "1º Apellido", "mData": "firstname"},
            {"sTitle": "2º Apellido", "mData": "lastname"},
            {"sTitle": "Fecha", "mData": "fecha"},
            {"sTitle": "Hora", "mData": "hora"},
            {"sTitle": "Tipo", "mData": "tipo"}
        ],
        //Iniciamos los botones para exportar en excel y pdf
        dom: 'Bfrtip',
        buttons: [
            'excelHtml5',
            'pdfHtml5'
        ],
        //Variable que habilita guardar las busquedas del dataTable
        stateSave: true
    };
    //Generamos el datatable
    dataTable = $('#searchTeachers').DataTable(optionsDataTable);
    //Funcion columnFilter
    //Añadir input a cada th footer
    $('#searchTeachers tfoot th').each(function () {
        var title = $(this).text();
        $(this).html('<input type="text" placeholder="Buscar ' + title + '" />');
    });
    //Asignar la busqueda de los inputs
    dataTable.columns().every(function () {
        var that = this;
        $('input', this.footer()).css('width', '90%');
        $('input', this.footer()).on('keyup change', function () {
            if (that.search() !== this.value) {
                dataTable.search(this.value).draw();
            }
        });
    });
}
//Funcion que inicia dialog de informe
function initDialog() {
    $('#initAudit').dialog({
        close: function () {
            resetDialogInput();
        }
    });
    // if($('#initAudit').dialog('isOpen')==true){
    initAudit();
    // }
}
//Funcion para vaciar contenido del dialog informes
function resetDialogInput() {
    $('#dateInit').val('');
    $('#dateEnd').val('');
}

//FUNCIONES PARA INFORMES
function initAudit() {
    var dateInit;
    var dateEnd;
    function checkDates() {
        //Comprobacion de dates para habilitar o deshabilitar boton
        if (dateInit == undefined || dateEnd == undefined) {
            $('#btnAudit').prop("disabled", true);
            return false;
        } else {
            if (dateInit.val() != "" && dateEnd.val() != "") {
                $('#btnAudit').prop("disabled", false);
                return true;
            }
        }
    }
    var teachersNames = [];
    var formatDate = "dd-mm-yy";
    //Opciones para datepicker
    var datepickerOptions = {
        firstDay: 1,
        dateFormat: "dd-mm-yy",
        dayNames: ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"],
        dayNamesMin: ["Dg", "Dl", "Dm", "Dc", "Dj", "Dv", "Ds"],
        monthNames: ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juriol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"],
        monthNamesShort: ["Gen", "Feb", "Març", "Abr", "Maig", "Juny", "Jul", "Ag", "Set", "Oct", "Nov", "Des"],
        changeMonth: true,
        changeYear: true
    };
    //Opciones para select2
    var selectOptions = {
        placeholder: "Selecciona un professor",
        allowClear: true,
        data: ''
    };
    hasLog.done(function(resp){
        if(resp=="OK"){
            checkDates();
            //Datepicker fecha de inicio
            dateInit = $('#dateInit').datepicker(datepickerOptions)
            //Limitar fecha final a que minimo sea la de inicio
                .on("change", function () {
                    dateEnd.datepicker("option", "minDate", getDate(this));
                    checkDates();
                });
            //Datepicker fecha final
            dateEnd = $('#dateEnd').datepicker(datepickerOptions)
            //Limitar fecha inicio a que maximo sea la de final
                .on("change", function () {
                    dateInit.datepicker("option", "maxDate", getDate(this));
                    checkDates();
                });
            //Funcion  que obtiene la fecha
            function getDate(element) {
                var date;
                try {
                    date = $.datepicker.parseDate(formatDate, element.value);
                } catch (error) {
                    date = null;
                }
                return date;
            }
            function capitalFirst(s) {
                return s.charAt(0).toUpperCase() + s.slice(1);
            }
            $.each(namesGlobal, function (g, name) {
                //Poner en mayuscula primera letra
                g=capitalFirst(g);
                teachersNames.push(g);
            });
            selectOptions.data = teachersNames;
            $('#selectTeacher').select2(selectOptions);
        }
    })
}