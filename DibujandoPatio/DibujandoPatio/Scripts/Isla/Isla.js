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
    

    if (idPatioSeleccionado != null && idPatioSeleccionado != "") {
        Lienzo.Modo = enumModoLienzo.Isla;
        let $radio = $(`#lstAreas input[data-id="${idPatioSeleccionado}"]`);
        $radio.prop("checked", true);
        $radio.closest("label").trigger('click');
        $('#crearIsla').data('idpatio', idPatioSeleccionado).prop('disabled', !idPatioSeleccionado);
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
                            escala
                        );

                        var grupoIslas = new Konva.Group({
                            x: 50,
                            y: 50,
                            draggable: true
                        });

                        islaTemporal = new Konva.Rect({
                            x: 0,
                            y: 0,
                            width: tamano.ancho,
                            height: tamano.alto,
                            stroke: 'blue',
                            fill: 'lightblue',
                            strokeWidth: 2,
                            name: 'isla'
                        });

                        TextoSuperior = new Konva.Text({
                            x: islaTemporal.width()/2,
                            y: -20,
                            text: '',
                            fontSize: 12,
                            fill: 'black',
                            
                        });
                        TextoSuperior.offsetX(TextoSuperior.width() / 2);

                        TextoDerecha = new Konva.Text({
                            x: islaTemporal.width() + 5,
                            y: islaTemporal.height() / 2,
                            text: '',
                            fontSize: 12,
                            fill: 'black',
                            
                        });

                        TextoDerecha.offsetY(TextoDerecha.height() / 2);

                        grupoIslas.add(islaTemporal, TextoSuperior, TextoDerecha);
                        layer.add(grupoIslas);

                        if (angulo !== 90 && angulo !== 0) {
                            islaTemporal.rotation(angulo);
                            islaTemporal.offsetX(tamano.ancho / 2);
                            islaTemporal.offsetY(tamano.alto / 2);
                        }

                        islaTemporal.on('transform', function () {
                            DameTamano(islaTemporal, layer);
                            //actualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);
                            //ajustarTamanos(islaTemporal, escala);
                            //layer.batchDraw();
                        });

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

                        var tr = new Konva.Transformer({
                            nodes: [islaTemporal],
                            enabledAnchors: [
                                'top-left',
                                'top-center',
                                'top-right',
                                'bottom-left',
                                'bottom-right',
                                'bottom-center',
                                'middle-left',
                                'middle-right'
                            ],
                            rotateEnabled: true,
                            resizeEnabled: true,
                        });

                        layer.add(tr);

                        actualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);

                        tr.on('transform dragmove', () => {
                            actualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);
                            ajustarTamanos(islaTemporal, escala);
                            layer.batchDraw();
                        });

                        DameTamano(islaTemporal, layer);
                        
                        layer.batchDraw();

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

    $(`#guardarBtn`).on('click', function () {
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

    const escala = Lienzo.Escala;
    function TamanoIsla(numeroBahias, angulo, escala) {
        const anchoBahia = 6 / escala;
        const altoBahia = 2 / escala;

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

        return { ancho, alto };
    }

    function DameTamano(isla, layer) {
        if (!isla) return;

        const anchoMetros =(isla.width() * isla.scaleX() * escala).toFixed(2);
        const altoMetros = (isla.height() * isla.scaleY() * escala).toFixed(2);

        TextoSuperior.text(`${anchoMetros} m`);
        TextoDerecha.text(`${altoMetros} m`);

        actualizarTexto(isla, TextoSuperior, TextoDerecha);

    }
});

function actualizarTexto(nodo, TextoSuperior, TextoDerecha) {
    
    const bbox = nodo.getClientRect({ relativeTo: nodo.getParent() });
    TextoSuperior.x(bbox.x + bbox.width / 2);
    TextoSuperior.y(bbox.y - 20);
    TextoSuperior.offsetX(TextoSuperior.width() / 2);
    TextoSuperior.offsetY(0);

    TextoDerecha.x(bbox.x + bbox.width + 5);
    TextoDerecha.y(bbox.y + bbox.height / 2);
    TextoDerecha.offsetY(TextoDerecha.height() / 2);

    TextoSuperior.rotation(nodo.rotation());
    TextoDerecha.rotation(nodo.rotation());
}

function ajustarTamanos(isla, escala) {
    const pasoHorizontal = 6;
    const pasoVertical = 2;

    let anchoMetros = isla.width() * isla.scaleX() * escala;
    let altoMetros = isla.height() * isla.scaleY() * escala;

    let rotacion = isla.rotation() % 360;
    if (rotacion < 0) rotacion += 360;

    switch (rotacion) {
        case 0:
        case 180:
            anchoMetros = Math.round(anchoMetros / pasoHorizontal) * pasoHorizontal;
            altoMetros = Math.round(altoMetros / pasoVertical) * pasoVertical;
            break;
        case 90:
        case 270:
            anchoMetros = Math.round(anchoMetros / pasoVertical) * pasoVertical;
            altoMetros = Math.round(altoMetros / pasoHorizontal) * pasoHorizontal;
            break;
        default:
            anchoMetros = Math.round(anchoMetros / pasoHorizontal) * pasoHorizontal;
            altoMetros = Math.round(altoMetros / pasoVertical) * pasoVertical;
            break;
    }

    isla.width(anchoMetros / escala);
    isla.height(altoMetros / escala);

    isla.scaleX(1);
    isla.scaleY(1);
}
