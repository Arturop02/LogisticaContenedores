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
                            x: islaTemporal.ancho/2,//.width() / 2,
                            y: -20,
                            text: '',
                            fontSize: 12,
                            fill: 'black',
                            
                        });
                        TextoSuperior.offsetX(TextoSuperior.width() / 2);

                        TextoDerecha = new Konva.Text({
                            x: islaTemporal.ancho + 5,//islaTemporal.width() + 5,
                            y: islaTemporal.alto/2,//islaTemporal.height() / 2,
                            text: '',
                            fontSize: 12,
                            fill: 'black',
                            
                        });
                        TextoDerecha.offsetY(TextoDerecha.height() / 2);

                        if (angulo !== 90 && angulo !== 0) {
                            islaTemporal.rotation(angulo);
                            islaTemporal.offsetX(tamano.ancho / 2);
                            islaTemporal.offsetY(tamano.alto / 2);
                        }

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

                        islaTemporal.on('dragmove transform', function () {
                            DameTamano(islaTemporal, layer);
                            layer.batchDraw();
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
                            boundBoxFunc: function (oldBox, newBox) {
                                if (newBox.x < 0) newBox.x = 0;
                                if (newBox.y < 0) newBox.y = 0;

                                if (newBox.width < 10) newBox.width = 10;
                                if (newBox.height < 10) newBox.height = 10;

                                return newBox;
                            }
                        });

                        layer.add(tr);
                        actualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);
                        tr.on('transform dragmove', () => {
                            actualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);
                            layer.batchDraw();
                        });

                        DameTamano(islaTemporal, layer);
                        grupoIslas.add(islaTemporal, TextoSuperior, TextoDerecha);


                        layer.add(grupoIslas);
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

    const escala = Lienzo.Escala;
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

    //function rotarPunto(px, py, cx, cy, angulo) {
    //    const rad = angulo * (Math.PI / 180);
    //    const cos = Math.cos(rad);
    //    const sin = Math.sin(rad);
    //    return {
    //        x: cos * (px - cx) - sin * (py - cy) + cx,
    //        y: sin * (px - cx) + cos * (py - cy) + cy,
    //    };
    //}

    function DameTamano(isla, layer) {
        if (!isla) return;

        //const anchoMetros = (isla.width() * isla.scaleX() * escala).toFixed(2);
        //const altoMetros = (isla.height() * isla.scaleY() * escala).toFixed(2);

        //const cx = isla.x();        
        //const cy = isla.y();        

        //const w = isla.width() * isla.scaleX();
        //const h = isla.height() * isla.scaleY();
        //const angulo = isla.rotation();

        //const top = rotarPunto(cx, cy - h / 2 - 20, cx, cy, angulo);
        //const right = rotarPunto(cx + w / 2 + 20, cy, cx, cy, angulo);

        //if (!isla, TextoSuperior) {
        //    isla.TextoSuperior = new Konva.Text({
        //        text: `${anchoMetros} m`,
        //        fontSize: 12,
        //        fill: 'black'
        //    });
        //    layer.add(isla.TextoSuperior);
        //} else {
        //    isla.TextoSuperior.position(top);
        //    isla.TextoSuperior.rotation(angulo);
        //}

        //if (!isla.TextoDerecha) {
        //    isla.TextoDerecha = new Konva.Text({
        //        text: `${altoMetros} m`,
        //        fontSize: 12,
        //        fill: 'black'
        //    });
        //    layer.add(isla.TextoDerecha);
        //}
        //isla.TextoDerecha.position(right);
        //isla.TextoDerecha.rotation(angulo);
    //}

        const anchoMetros = (isla.width() * isla.scaleX() * escala).toFixed(2);
        const altoMetros = (isla.height() * isla.scaleY() * escala).toFixed(2);

        TextoSuperior.text(`${anchoMetros} m`);
        TextoDerecha.text(`${altoMetros} m`);

        //const ancho = isla.width() * isla.scaleX();
        //const alto = isla.height() * isla.scaleY();

        actualizarTexto(isla, TextoSuperior, TextoDerecha);

        //const X = isla.x();
        //const Y = isla.y();
        //const angulo = isla.rotation();

        //const top = rotarPunto(X, Y - alto / 2, X, Y, angulo);
        //const right = rotarPunto(X + ancho / 2 + 20, Y, X, Y, angulo);
        //TextoSuperior.position(top);
        //TextoDerecha.position(right);

        //TextoSuperior.rotation(0);
        //TextoDerecha.rotation(0);

        //const X = Math.max(0, isla.x() - isla.offsetX());
        //const Y = Math.max(0, isla.y() - isla.offsetY());

        //if (!isla.TextoSuperior) {
        //    isla.TextoSuperior = new Konva.Text({
        //        x: topX,
        //        y: topY,
        //        text: `${anchoMetros} m`,
        //        fontSize: 12,
        //        fill: 'black',
        //        padding: 4,
        //        rotation: isla.angulo
        //    });
        //    //isla.TextoSuperior.offsetX();
        //    layer.add(isla.TextoSuperior);
        //} else {
        //    isla.TextoSuperior.position({ x: topX, y: topY });
        //    isla.TextoSuperior.text(`${anchoMetros} m`);
        //}

        ////const rightX = X + Math.cos(angulo) * (ancho + 5) - Math.sin(angulo) * (alto / 2);
        ////const rightY = Y + Math.sin(angulo) * (ancho + 5) - Math.cos(angulo) * (alto / 2);

        //const rightX = box.x + box.width + 5;
        //const rightY = box.y + box.height / 2;


        //if (!isla.TextoDerecha) {
        //    isla.TextoDerecha = new Konva.Text({
        //        x: rightX,
        //        y: rightY,
        //        text: `${altoMetros} m`,
        //        fontSize: 12,
        //        fill: 'black',
        //        padding: 4
        //    });
        //    layer.add(isla.TextoDerecha);
        //} else {
        //    isla.TextoDerecha.position({ x: rightX, y: rightY });
        //    isla.TextoDerecha.text(`${altoMetros}`);
        //}
        
        ////isla.TextoSuperior.x(X + ancho / 2);
        ////isla.TextoSuperior.y(Y - 20);
        ////isla.TextoSuperior.text(`${anchoMetros} m`);

        ////isla.TextoDerecha.x(X + ancho + 5);
        ////isla.TextoDerecha.y(Y + alto / 2);
        ////isla.TextoDerecha.text(`${altoMetros} m`);
        
        //layer.batchDraw();
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

    TextoSuperior.rotation(nodo.angulo);
    TextoDerecha.rotation(nodo.angulo);

}
