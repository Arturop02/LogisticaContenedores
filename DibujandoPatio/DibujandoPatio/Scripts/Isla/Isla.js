var islaTemporal = null;
var datosIsla = {};
var TextoSuperior = null;
var TextoDerecha = null;

$(document).on('LienzoReady',function () {
    Lienzo.Modo = enumModoLienzo.Isla;
    Lienzo.Estado = enumEstadoLienzo.Agregando;
    Lienzo.BloquearPatio(true);

    var stage = Lienzo.Stage;
    var layer = stage.getLayers()[0];
    var escala = Lienzo.Escala;

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
                        <input type="number" class="form-control" id="bahiasIsla" min="1" step="1" value="1" required />
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

                        const tamano = TamanoIsla(
                            datosIsla.NumeroBahias,
                            angulo,
                            stage.width(),
                            stage.height(),
                            escala
                        );

                        console.log("NumeroBahias:", datosIsla.NumeroBahias);
                        console.log("Ángulo:", angulo);
                        console.log("Tamaño calculado:", tamano.ancho, tamano.alto);

                        islaTemporal = new Konva.Rect({
                            x: 50,
                            y: 50,
                            width: tamano.ancho,
                            height: tamano.alto,
                            stroke: 'blue',
                            fill: 'lightblue',
                            strokeWidth: 2,
                            draggable: true,
                            name: 'isla'
                        });

                        if (angulo !== 90 && angulo !== 0) {
                            islaTemporal.rotation(angulo);
                            islaTemporal.offsetX(tamano.ancho / 2);
                            islaTemporal.offsetY(tamano.alto / 2);
                        }


                        console.log("Rect creado:");
                        console.log("width:", islaTemporal.width());
                        console.log("height:", islaTemporal.height());
                        console.log("scaleX:", islaTemporal.scaleX());
                        console.log("scaleY:", islaTemporal.scaleY());

                        islaTemporal.on('transformend', function () {
                            DameTamano(islaTemporal, layer);
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


                        islaTemporal.on('dragend', function () {
                            DameTamano(islaTemporal, layer);
                            layer.batchDraw();
                        });

                        var tr = new Konva.Transformer({
                            nodes: [islaTemporal],
                            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
                            rotateEnabled: true,
                            resizeEnabled: true,
                            boundBoxFunc: function (oldBox, newBox) {
                                if (newBox.x < 0) newBox.x = 0;
                                if (newBox.y < 0) newBox.y = 0;

                                if (newBox.width < 10) newBox.width = 10;
                                if (newBox.height < 10) newBox.height = 10;

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


    function TamanoIsla(numeroBahias, angulo, width, height, escala) {
        const anchoBahia = (width * 0.1) * escala;
        const altoBahia = (height * 0.15) * escala;

        let ancho = 0;
        let alto = 0;

        let rotacion = angulo % 360;
        if (rotacion < 0) rotacion += 360;


        switch (rotacion) {
            case 0:
            case 180:
                ancho = numeroBahias * anchoBahia;
                alto = altoBahia;
                break;
            case 90:
            case 270:
                ancho = anchoBahia;
                alto = numeroBahias * altoBahia;
                break;
            default:
                ancho = anchoBahia;
                alto = numeroBahias * altoBahia;
                break;
        }

        if (ancho > width * 0.8) ancho = width * 0.8;
        if (alto > height * 0.8) alto = height * 0.8;

        return { ancho, alto };
    }

    function DameTamano(isla, layer) {
        if (!isla) return;

        const escala = Lienzo.Escala;

        const anchoMetros = Math.max(0, (isla.width() * isla.scaleX() / escala).toFixed(2));
        const altoMetros = Math.max(0, (isla.height() * isla.scaleY() / escala).toFixed(2));

        const X = Math.max(0, isla.x() - isla.offsetX());
        const Y = Math.max(0, isla.y() - isla.offsetY());

        const ancho = isla.width() * isla.scaleX();
        const alto = isla.height() * isla.scaleY();

        if (!isla.TextoSuperior) {
            isla.TextoSuperior = new Konva.Text({
                x: X + ancho / 2,
                y: Y - 20,
                text: `${anchoMetros} m`,
                fontSize: 12,
                fill: 'black',
                padding: 4
            });
            isla.TextoSuperior.offsetX(isla.TextoSuperior.width() / 2);
            layer.add(isla.TextoSuperior);
        }

        if (!isla.TextoDerecha) {
            isla.TextoDerecha = new Konva.Text({
                x: X + ancho + 5,
                y: Y + alto / 2,
                text: `${altoMetros} m`,
                fontSize: 12,
                fill: 'black',
                padding: 4
            });
            isla.TextoDerecha.offsetX(isla.TextoDerecha.height() / 2);
            isla.TextoDerecha.rotation(90);
            layer.add(isla.TextoDerecha);
        }

        isla.TextoSuperior.x(X + ancho / 2);
        isla.TextoSuperior.y(Y - 20);
        isla.TextoSuperior.text(`${anchoMetros} m`);

        isla.TextoDerecha.x(X + ancho + 5);
        isla.TextoDerecha.y(Y + alto / 2);
        isla.TextoDerecha.text(`${altoMetros} m`);

        layer.batchDraw();
    }

});
