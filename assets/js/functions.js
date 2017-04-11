/**
 * Created by laia on 17/03/17.
 */
//FUNCIONES GLOBALES
var loaded = false;
var dataTable;
if ($(location).attr('href').indexOf('index.html') != -1) {
    //Dialog de error de login
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
    if (loaded == false) {
        initLogin();
    }
} else if ($(location).attr('href').indexOf('dashboard.html') != -1) {
    if (localStorage.login != undefined) {
        initDashboard();
    } else {
        $(location).attr('href', 'index.html');
    }
}
//Funcion cerrar sesion
function closeSesion() {
    window.localStorage.clear();
    $(location).attr('href', 'index.html');
    loaded = false;
    url = '';
}
//Funcion que comprueba si hay login
function checkLocalStorage() {
    var login = window.localStorage.login;
    if ($(location).attr('href').indexOf('index.html') != -1) {
        if (login != undefined) {
            $(location).attr('href', "dashboard.html");
        }
    }
}
//FUNCIONES PARA LOGIN
function initLogin() {
    function makeLogin() {
        var login = {
            user: $('#nameUser').val(),
            pass: $('#passUser').val()
        };
        if (login.user && login.pass) {
            $.ajax({
                url: "http://localhost/ionic/logAdmin.php",
                type: "POST",
                data: login,
                complete: function (resp) {
                    if (resp.responseText == 'OK') {
                        window.localStorage.setItem('login', JSON.stringify(login));
                        $(location).attr('href', 'dashboard.html');
                    } else {
                        $('#resetForm').dialog("open");
                    }
                }
            })
        } else {
            $('#contentDialog').html("Introduce usuario y contraseña");
            $('#resetForm').dialog("open");
        }
    }

    //Si pulsa INTRO en el nameUser pasa al siguiente input
    $('#nameUser').keypress(function (e) {
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
        var code = e.keyCode || e.which;
        if (code == 13) {
            makeLogin();
        }
    });
    //Funcion de log con llamada ajax en click boton
    $('#btnLogin').mousedown(function () {
        makeLogin();
    });

    checkLocalStorage();
}

//Funcion Promise JSONS
function getDate() {
    var getJSON = jQuery.Deferred();
    var getJSON2 = jQuery.Deferred();
    getJSON.resolve(
        //    JSON CHECKINGS
        $.getJSON("../assets/PHP_y_JSON/date.json")
    );
    return getJSON.promise();
}
function getNames() {
    var getJSON = jQuery.Deferred();
    getJSON.resolve(
        //    JSON CHECKINGS
        $.getJSON("../assets/PHP_y_JSON/names.json")
    );
    return getJSON.promise();
}
//Funcion PROMISE DataTable
function fillTable(language, arrayJson) {
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
    var table = jQuery.Deferred();
    table.resolve(
        //Generamos el datatable
        dataTable = $('#searchTeachers').DataTable(optionsDataTable)
    );
    return table.promise();
}
//FUNCIONES PARA DASHBOARD
function initDashboard() {
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
        jsonDashBoard(checkLanguage($('#languageSelect option:selected').attr("name")));
    });

//Funcion que inicia dataTables y rellena dataTable pasando por parametro el idioma
    function jsonDashBoard() {
        var login2 = window.localStorage.getItem('login');
        var dataJson;
        var arrayJson = [];
        //Llamada que comprueba que el token sea correcto
        $.ajax({
            url: "http://localhost/ionic/logAdmin.php",
            type: "POST",
            data: login2,
            complete: function (resp) {
                //Si es correcto
                if (resp.responseText == 'OK') {
                    var dates = $.ajax("../assets/PHP_y_JSON/date.json");
                    var name = $.ajax("../assets/PHP_y_JSON/names.json");
                    $.when(name, dates).done(function (name, dates) {
                        name = name[0];
                        dates = dates[0];
                        $.each(name, function (g, nameP) {
                            var nameUser = g;
                            //Variable donde asignamos el nombre de usuario
                            $.each(nameP, function (l, nameString) {
                                $.each(dates, function (i, userName) {
                                    $.each(userName, function (h, data) {
                                        if (data != null) {
                                            //Si el nombre de usuario es igual
                                            if (data.usuario.toLowerCase() == nameUser) {
                                                //Asignamos y añadimos al objeto data nombre y apellidos.
                                                data.name = nameString.name;
                                                data.firstname = nameString.firstname;
                                                data.lastname = nameString.lastname;
                                                arrayJson.push(data);
                                            }
                                        }
                                    })
                                })
                            });
                        });
                        //PRUEBA PROMISE TABLE
                        $.when(fillTable(checkLanguage($('#languageSelect option:selected').attr("name")), arrayJson));
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
                    });
                } else if (resp.responseText != 'OK') {
                    $(location).attr('href', 'index.html')
                }
            }
        });
    }

    jsonDashBoard(checkLanguage("castellano"));
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
function resetDialogInput() {
    $('#dateInit').val('');
    $('#dateEnd').val('');
}
function filterData() {
    var min = $('#dateInit').val();
    var max = $('#dateEnd').val();
    $.fn.dataTableExt.afnFiltering.push(
        function (oSettings, aaData, iDataIndex) {
            if (min && !isNaN(min)) {
                if (aaData.fecha < min) {
                    return false;
                }
            }
            if (max && !isNaN(max)) {
                if (aData.fecha > max) {
                    return false;
                }
            }

            return true;
        }
    );
    dataTable.draw();
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

    var login2 = window.localStorage.getItem('login');
    var dataJson;
    var arrayJson = [];
    var names = [];
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
    $.ajax({
        url: "http://localhost/ionic/logAdmin.php",
        type: "POST",
        data: login2,
        complete: function (resp) {
            //Si es correcto
            if (resp.responseText == 'OK') {
                //Llamada al json que contiene los marcajes
                $.ajax({
                    url: "http://localhost/ionic/date.json",
                    type: "GET",
                    complete: function (resp2) {
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

                        //Llamada al json que contiene los nombres y apellidos de los usuarios
                        $.ajax({
                            url: "http://localhost/ionic/names.json",
                            type: "GET",
                            complete: function (resp3) {
                                names = JSON.parse(resp3.responseText);
                                dataJson = JSON.parse(resp2.responseText);
                                $.each(names, function (g, name) {
                                    //Variable donde asignamos el nombre de usuario
                                    var nameUser = g;
                                    $.each(name, function (j, properties) {
                                        teachersNames.push(properties.name);
                                        $.each(dataJson, function (i, user) {
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
                                selectOptions.data = teachersNames;
                                $('#selectTeacher').select2(selectOptions);
                            }
                        });
                    }
                });
            }
        }
    });
}