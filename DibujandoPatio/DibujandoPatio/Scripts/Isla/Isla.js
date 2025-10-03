var islaTemporal = null;
var datosIsla = {};
var TextoSuperior = null;
var TextoDerecha = null;

//var enumModoLienzo = {
//    Area: 'Area',
//    Isla: 'Isla',
//    Contenedor: 'Contenedor',
//}

//var enumEstadoLienzo = {
//    Agregando: 'Agregando',
//    Moviendo: 'Moviendo',
//    Editando: 'Editando',
//};

//var enumBotton = {
//    ClickIzquierdo: 0,
//    ClickDerecho: 2
//}

$(document).on('LienzoReady', function () {
    $(document).on("AreaCargada", function () {
        Lienzo.Modo = enumModoLienzo.Isla;
        Lienzo.Estado = enumEstadoLienzo.Agregando;
        Lienzo.BloquearArea(true);
    });

    if (idAreaSeleccionada != null && idAreaSeleccionada != "") {
        Lienzo.Modo = enumModoLienzo.Isla;
        Lienzo.Estado = enumEstadoLienzo.Agregando;
        Lienzo.BloquearArea(true);
        let $radio = $(`#lstAreas input[data-id="${idAreaSeleccionada}"]`);
        //$radio.prop("checked", true).closest("label").addClass("active");
        $radio.closest("label").trigger('click');
        $('#crearIsla').data('idpatio', idAreaSeleccionada).prop('disabled', false);
    }
    
    var stage = Lienzo.Stage;
    var layer = stage.getLayers()[0];

    $(`#crearIsla`).on(`click`, function () {
        bootbox.dialog({
            title: "Crear Isla",
            message:`<form id="formIsla">
                    <div class="form-group">
                        <label>Nombre de la Isla</label>
                        <input type="text" class="form-control" id="nombreIsla" required />
                        <label>Observaciones</label>
                        <input type="text" class="form-control" id="observacionesIsla"/>
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
                            Observaciones: $(`#observacionesIsla`).val(),
                        };
                        if (!datosIsla.Nombre) {
                            bootbox.alert("Por favor nombra la isla");
                            return false;
                        }

                        const tamano = TamanoIsla(
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
                            fill: '',
                            strokeWidth: 2,
                            name: 'isla'
                        });
                        
                        TextoSuperior = new Konva.Text({
                            x: islaTemporal.width() / 2,
                            y: islaTemporal.height() / 2,
                            text: '',
                            fontSize: 12,
                            fill: 'black',
                            
                        });
                        
                        TextoDerecha = new Konva.Text({
                            x: islaTemporal.width() /2,
                            y: islaTemporal.height() / 2,
                            text: '',
                            fontSize: 12,
                            fill: 'black',
                        });

                        grupoIslas.add(islaTemporal, TextoSuperior, TextoDerecha);
                        layer.add(grupoIslas);
                        
                        islaTemporal.on('transform dragmove', function () {
                            DameTamano(islaTemporal, layer);
                            actualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);
                            ajustarTamanos(islaTemporal, escala);
                            //var satIsla = KonvaASATPoligono(islaTemporal);
                            //var satIslaComparar = layer.find('.satIslaGuardada');

                            //console.log(`SatIsla valores ${satIsla}`);
                            //console.log(`satIslaGuardada valores ${satIslaComparar}`);
                            //console.log(satIsla);

                            //var islas = layer.find('.rectanguloIsla');
                            //islas.forEach(i => {
                            //    var satIslaGuadada = KonvaASATPoligono(i);
                            //    console.log(satIslaGuadada);

                            //    var respuesta = SAT.testPolygonPolygon(satIslaGuadada, satIsla);
                            //    if (respuesta) {
                            //        islaTemporal.fill('green');
                            //        console.log("Las islas guardadas y la nueva isla han colisionado");
                            //    } else {
                            //        islaTemporal.fill('red');
                            //    }
                            //});
                            layer.batchDraw();
                        });

                        islaTemporal.on('transformend', function () {
                            DameTamano(islaTemporal, layer);
                            var rotacion = DameRotacion(islaTemporal);
                            datosIsla.Orientacion = rotacion;
                        });

                        var tr = new Konva.Transformer({
                            nodes: [islaTemporal],
                            enabledAnchors: [
                                'top-center',
                                'top-right',
                                'bottom-right',
                                'bottom-center',
                                'middle-right'
                            ],
                            rotateEnabled: true,
                            resizeEnabled: true,
                            boundBoxFunc: (oldBox, newBox) => {
                                if (newBox.width < tamano.ancho || newBox.height < tamano.alto) {
                                    return oldBox;
                                }
                                return newBox;
                            }
                        });

                        layer.add(tr);

                        actualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);

                        tr.on('transform dragmove', () => {
                            actualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);
                            ajustarTamanos(islaTemporal, escala);
                            
                            //for (let i = 0; i < islas.length; i++) {
                            //    let area = areas[i];
                            //    var satArea = KonvaASATPoligono(area);
                            //    var respuesta = SAT.testPolygonPolygon(satIsla, satArea);
                            //    if (respuesta) {
                            //        islaTemporal.fill('green');
                            //        break;
                            //    } else {
                            //        islaTemporal.fill('red');
                            //    }
                            //}

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

    $(`#guardarBtn`).on('click', function () {
        if (!islaTemporal) {
            bootbox.alert("No hay isla para guardar");
            return;
        }

        let rotacion = DameRotacion(islaTemporal);
        let posicionAbsoluta = islaTemporal.getAbsolutePosition();

        var data = {
            Nombre: datosIsla.Nombre,
            Orientacion: rotacion,
            x: posicionAbsoluta.x,
            y: posicionAbsoluta.y,
            Ancho: islaTemporal.width() * islaTemporal.scaleX(),
            Alto: islaTemporal.height() * islaTemporal.scaleY(),
            Observaciones: datosIsla.Observaciones,
            Area: { Id: idAreaSeleccionada },
        };
        $.ajax({
            url: '/Isla/GuardarIsla',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (res) {
                if (res.ok) {
                    bootbox.alert("Isla guardada con exito");
                    islaTemporal = null;
                    $(`#guardarIsla`).addClass('d-none');
                    layer.draw();
                } else {
                    bootbox.alert("Error al guardar isla");
                }
            }
        });
    });

    const escala = Lienzo.Escala;
    function TamanoIsla(escala) {
        const anchoBahia = 6.06 / escala;
        const altoBahia = 2.44 / escala;

        var ancho = 2 * anchoBahia;
        var alto = altoBahia;

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

function DameRotacion(nodo) {
    var rotacion = nodo.rotation() % 360;
    if (rotacion < 0) rotacion += 360;
    return rotacion;
}

function actualizarTexto(nodo, TextoSuperior, TextoDerecha) {
    var NodoRectangulo = nodo.getParent().findOne('Rect');
    //var NodoRectangulo = nodo.parent.children.FirstOrDefault(c => c instanceof Konva.Rect);

    var x = 0;
    var y = (NodoRectangulo.attrs.height / 2) + (TextoSuperior.textHeight);
    var rotacion = DameRotacion(nodo) + 180;

    let r = (nodo.height() / 2) + TextoSuperior.textHeight;

    var rad = (90 + rotacion) * Math.PI / 180;
    x = r * Math.cos(rad);
    y = r * Math.sin(rad);

    let rD = (nodo.width() / 2) + TextoDerecha.textWidth;
    var radD = (180 + rotacion) * Math.PI / 180;
    var xD = rD * Math.cos(radD);
    var yD = rD * Math.sin(radD);

    var Centro = {
        x: (NodoRectangulo.attrs.width / 2),
        y: (NodoRectangulo.attrs.height / 2) - (TextoSuperior.textHeight - 6),
    };
    var Derecha = {
        x: (NodoRectangulo.attrs.width / 2) - TextoDerecha.textWidth + 24,
        y: (NodoRectangulo.attrs.height /2),
    }

    TextoSuperior.x(Centro.x + x);
    TextoSuperior.y(Centro.y + y);

    TextoSuperior.offsetX(TextoSuperior.width() / 2);
    TextoSuperior.offsetY(TextoSuperior.height() / 2);

    TextoDerecha.x(Derecha.x + xD);
    TextoDerecha.y(Derecha.y + yD);

    TextoDerecha.offsetX(TextoDerecha.width() / 2);
    TextoDerecha.offsetY(TextoDerecha.height() / 2);

    TextoSuperior.rotation(nodo.rotation());
    TextoDerecha.rotation(nodo.rotation());
}

function ajustarTamanos(isla, escala) {
    const pasoHorizontal = 6.06;
    const pasoVertical = 2.44;

    let anchoMetros = Math.round((isla.width() * isla.scaleX() * escala) / pasoHorizontal) * pasoHorizontal;
    let altoMetros = Math.round((isla.height() * isla.scaleY() * escala) / pasoVertical) * pasoVertical;
    
    isla.width(anchoMetros / escala);
    isla.height(altoMetros / escala);

    isla.scaleX(1);
    isla.scaleY(1);
}

function KonvaASATCirculo(circulo) {
    return new SAT.Circle(
        new SAT.Vector(circulo.x(), circulo.y()),
        circle.radius());
}

function KonvaASATPoligono(rectangulo) {
    var posicion = rectangulo.getAbsolutePosition();
    return new SAT.Box(
        new SAT.Vector(posicion.x, posicion.y),
        rectangulo.width() * rectangulo.scaleX(),
        rectangulo.height() * rectangulo.scaleY()
    ).toPolygon();
}
