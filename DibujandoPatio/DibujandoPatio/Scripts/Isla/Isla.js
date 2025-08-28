var islaTemporal = null;
var datosIsla = {};
//var stage, layer;

$(document).on('LienzoReady',function () {
    Lienzo.Modo = enumModoLienzo.Isla;
    Lienzo.Estado = enumEstadoLienzo.Agregando;
    //Lienzo.Escala;
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
                        <select class="form-control" id="orientacionIsla">
                            <option value="1">Horizontal</option>
                            <option value="2">Vertical</option>
                            <option value="3">Diagonal Derecha</option>
                            <option value="4">Diagonal Izquierda</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipo de carga</label>
                        <select class="form-control" id="tipoIsla">
                            <option value="1">Vacio</option>
                            <option value="2">Refrigerado</option>
                            <option value="3">Isotanque</option>
                            <option value="4">Peligroso</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Numero de Bahias</label>
                        <input type="number" class="form-control" id="bahiasIsla" required />
                    </div>
                </form>`
            ,
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

                        islaTemporal = new Konva.Rect({
                            x: 50,
                            y: 50,
                            width: 100,
                            height: 50,
                            stroke: 'blue',
                            strokeWidth: 2,
                            draggable: true,
                            name: 'isla'
                        });

                        var tr = new Konva.Transformer({
                            nodes: [islaTemporal],
                            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
                            boundBoxFunc: (oldBox, newBox) => {
                                if (newBox.width < 50 || newBox.height < 30) {
                                    return oldBox;
                                }
                                return newBox;
                            }
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
        /*var isla = new Konva.Rect({
            x: 150,
            y: 150,
            width: 100,
            height: 50,
            stroke: 'blue',
            strokeWidth: 2,
            draggable: true,
            name: 'isla'
        });
        layer.add(isla);
        layer.draw();

        $(`#guardarIsla`).off('click').on('click', function () {
            var data = {
                x: isla.x(),
                y: isla.y(),
                Ancho: isla.width(),
                Alto: isla.height(),
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
                    } else {
                        bootbox.alert("Error al guardar isla");
                    }
                }
            });
        });*/
    });
    $(`#guardarIsla`).on('click', function () {
        if (!islaTemporal) {
            bootbox.alert("No hay isla para guardar");
            return;
        }
        var data = {
            Nombre: datosIsla.Nombre,
            Orientacion: datosIsla.Orientacion,
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
                    $(`#guardarIsla`).addClass('d-none');
                    layer.draw();
                } else {
                    bootbox.alert("Error al guardar isla");
                }
            }
        });
    });
});
