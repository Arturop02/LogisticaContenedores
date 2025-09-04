var islaTemporal = null;
var datosIsla = {};

$(document).on('LienzoReady',function () {
    Lienzo.Modo = enumModoLienzo.Isla;
    Lienzo.Estado = enumEstadoLienzo.Agregando;
    Lienzo.BloquearPatio(true);

    var stage = Lienzo.Stage;
    var layer = stage.getLayers()[0];

    if (idPatioSeleccionado != null && idPatioSeleccionado != "") {
        
        $(`#selectPatio`).val(idPatioSeleccionado).change();
    }

    $(`#crearIsla`).on(`click`, function () {
        bootbox.dialog({
            title: "Crear Isla",
            message:`<form id="formIsla">
                    <div class="form-group">
                        <label>Nombre de la Isla</label>
                        <input type="text" class="form-control" id="nombreIsla" required />
                    </div>
                    <div class="form-group">
                        <label>Orientacion</label>
                        <select name="orientacion" class="form-control" id="orientacionIsla">
                            <option value="">Selecciona la orientacion</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipo de carga</label>
                        <select class="form-control" id="tipoIsla">
                            <option value="">Selecciona el tipo de carga</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Numero de Bahias</label>
                        <input type="number" class="form-control" id="bahiasIsla" required />
                    </div>
                </form>`
            ,
            onShow: function () {
                cargarSelects();
            },
            buttons: {
                cancelar: {
                    label: "Cancelar",
                    className: "btn-danger",
                    callback: function () {
                        return;
                    }
                },
                next: {
                    label: "Siguiente",
                    className: "btn-primary",
                    callback: function () {
                        datosIsla = {
                            Nombre: $(`#nombreIsla`).val(),
                            Orientacion: $(`#orientacionIsla`).val(),
                            TipoCarga: $(`#tipoIsla`).val(),
                            NumeroBahias: $(`#bahiasIsla`).val()
                        };
                        if (!datosIsla.Nombre || !datosIsla.Orientacion || !datosIsla.TipoCarga || !datosIsla.NumeroBahias) {
                            bootbox.alert("Por favor complete todos los campos");
                            return false;
                        }

                        var orientacionSeleccionada = $(`#orientacionIsla option:selected`);
                        var angulo = orientacionSeleccionada.data('angulo') || 0;

                        islaTemporal = new Konva.Rect({
                            x: 50,
                            y: 50,
                            width: 100,
                            height: 50,
                            stroke: 'blue',
                            fill: 'lightblue',
                            strokeWidth: 2,
                            draggable: true,
                            rotation: angulo,
                            name: 'isla'
                        });

                        islaTemporal.on('transformend', function () {
                            let rotacion = islaTemporal.rotation() % 360;
                            if (rotacion < 0) rotacion += 360;

                            let opciones = $(`#orientacionIsla option`);
                            let orientacionId = null;
                            let diferenciaMin = 999;

                            opciones.each(function () {
                                let angulo = $(this).data('angulo');
                                let diferencia = Math.abs(rotacion - angulo);
                                if (diferencia < diferenciaMin) {
                                    diferenciaMin = diferencia;
                                    orientacionId = $(this).val();
                                }
                            });

                            if (orientacionId) {
                                $(`#orientacionIsla`).val(orientacionId);
                            }
                        });

                        var tr = new Konva.Transformer({
                            nodes: [islaTemporal],
                            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
                            rotateEnabled: true,
                            resizeEnabled: true
                        });

                        layer.add(islaTemporal);
                        layer.add(tr);
                        layer.draw();

                        $(`#guardarIsla`).removeClass('d-none');

                        return true;
                        
                    }
                }
            }
        });
    });

    function cargarSelects() {

        $.getJSON('/Catalogo/ObtenerOrientacion', function (data) {
            var select = $(`#orientacionIsla`);
            data.forEach(
                o => select.append(`<option value="${o.Id}" data-angulo="${o.Angulo}">${o.Orientacion}</option>`)
            );
        });

        $.getJSON('/Catalogo/ObtenerTipos', function (data) {
            var select = $(`#tipoIsla`);
            data.forEach(t => select.append(`<option value="${t.Id}">${t.Tipo}</option>`));
        });
    }

    $(`#orientacionIsla`).on('change', function () {
        if (!islaTemporal) return;

        var angulo = $(this).find(':selected').data('angulo');
        islaTemporal.rotation(angulo);
        layer.draw();
    });

    $(`#guardarIsla`).on('click', function () {
        if (!islaTemporal) {
            bootbox.alert("No hay isla para guardar");
            return;
        }
        var data = {
            Nombre: datosIsla.Nombre,
            Orientacion: $(`#orientacionIsla`).val(),
            TipoCarga: datosIsla.TipoCarga,
            NumeroBahias: datosIsla.NumeroBahias,
            x: islaTemporal.x(),
            y: islaTemporal.y(),
            Ancho: islaTemporal.width() * islaTemporal.scaleX(),
            Alto: islaTemporal.height() * islaTemporal.scaleY(),
            PatioId: $(`#guardarBtn`).data('idpatio')
        };
        $.ajax({
            url: '/Isla/GuardarIsla',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (res) {
                if (res.ok) {
                    bootbox.alert("Isla guardada con exito");
                    islaTemporal.destroy();
                    islaTemporal = null;
                    layer.find('Transformer').destroy();
                    $(`#guardarIsla`).addClass('d-none');
                    layer.draw();
                } else {
                    bootbox.alert("Error al guardar isla");
                }
            }
        });
    });
});
