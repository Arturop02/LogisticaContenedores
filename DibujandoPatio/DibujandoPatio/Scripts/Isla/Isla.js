var stage;
var layer;
var Lienzo;
var TextoSuperior = null;
var TextoDerecha = null;
var datosIsla = {};
var listarTipoEstructuras = [];
var listarEnus = []

var enumModoLienzo = {
    Area: 'Area',
    Isla: 'Isla',
    Contenedor: 'Contenedor',
}

var enumEstadoLienzo = {
    Agregando: 'Agregando',
    Moviendo: 'Moviendo',
    Editando: 'Editando',
};

var enumBotton = {
    ClickIzquierdo: 0,
    ClickDerecho: 2
}

function inicializarArea() {
    
    function DameEscala() {
        const escala = 0.4;
        return escala;
    }

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
            y: (NodoRectangulo.attrs.height / 2),
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

    function DameDatosIsla(isla) {
        const escala = DameEscala();
        var alto = (isla.Alto * escala).toFixed(2);
        var ancho = (isla.Ancho * escala).toFixed(2);

        let contenido = "";
        contenido = `
            <p><strong>Nombre:</strong> ${isla.Nombre}</p>
            <p><strong>Tipo de Isla:</strong> ${isla.Descripcion}</p>
            <p><strong>Ancho:</strong> ${ancho}m</p>
            <p><strong>Alto:</strong> ${alto}m</p>
            <p><strong>Observaciones:</strong> ${isla.Observaciones}</p>
        `;
        $("#sidebar-content").html(contenido);
        $("#sidebar").addClass("active");
    }


    Lienzo = {
        Modo: enumModoLienzo.Isla,
        Escala: DameEscala(),
        Estado: null,
        lstPunto: [],
        PuntoActual: null,
        DamePosicion: function () {
            const transform = this.Stage.getAbsoluteTransform().copy();
            transform.invert();
            const posicion = transform.point(this.Stage.getPointerPosition());
            posicion.x = posicion.x.toFixed(6) * 1;
            posicion.y = posicion.y.toFixed(6) * 1;
            return posicion;
        },
        RestaurarTamano: function () {
            this.Stage.scale({ x: 1, y: 1 });
            this.Stage.position({ x: 0, y: 0 });
            this.Stage.batchDraw();
        },
        Cerrar: function () {
            if (this.PuntoActual != null)
                this.PuntoActual.Eliminar();

            var puntoInicial = this.lstPunto[0];
            var puntoFinal = this.lstPunto[this.lstPunto.length - 1];

            this.RelacionarPuntos(puntoInicial, puntoFinal);

            puntoInicial.Dibujar();
            puntoFinal.Dibujar();

            this.Modo = enumModoLienzo.Area;
            this.Estado = enumEstadoLienzo.Editando;
            this.AjustarOrden();
        },
        RelacionarPuntos: function (punto1, punto2) {
            var linea = new Linea(punto1, punto2);
            punto1.lstRelacionado.push(linea);
            punto2.lstRelacionado.push(linea);

            linea.lstRelacionado.push(punto1);
            linea.lstRelacionado.push(punto2);
        },
        AgregarPunto: function (x, y) {
            var punto = new Punto();
            punto.Posicion.x = x;
            punto.Posicion.y = y;

            this.lstPunto.push(punto);

            if (this.PuntoActual != null) {
                this.RelacionarPuntos(this.PuntoActual, punto);
            }
            punto.Dibujar();

            this.AjustarOrden();

            return punto;
        },
        AjustarOrden: function () {
            this.lstPunto.toReversed().forEach(item => {
                item.MoverArriba();
            });
        },
        HabilitarArrastrable: function (habilitar) {
            if (habilitar) {
                this.Stage.draggable(true);
                this.Stage.startDrag();
                this._contextualMenuHandler = (e) => e.preventDefault();
                this.Stage.container().addEventListener('contextmenu', this._contextualMenuHandler);
            } else {
                this.Stage.draggable(false);
                //if (this._contextualMenuHandler) {
                //this.Stage.container().removeEventListener('contextmenu', this._contextualMenuHandler);
                //this._contextualMenuHandler = null;
                //}
            }
        },
        BloquearArea: function (bloquear) {
            this.lstPunto.forEach(p => {
                if (p.Grafico) {
                    p.Grafico.draggable(!bloquear);
                    p.Grafico.listening(!bloquear);
                }
            });
        },
    };

    var enumTipoGrafico = {
        Linea: 'Linea',
        Punto: 'Punto'
    };

    function Linea(puntoInicial, puntoFinal) {
        this.Tipo = enumTipoGrafico.Linea;
        this.Grafico = null;
        this.GraficoTexto = null;
        this.lstRelacionado = [];

        this.PuntoInicial = puntoInicial
        this.PuntoFinal = puntoFinal;

        this.Dibujar = function () {

            var cfgGraficoLinea = {
                points: [this.PuntoInicial.Posicion.x, this.PuntoInicial.Posicion.y, this.PuntoFinal.Posicion.x, this.PuntoFinal.Posicion.y],
                stroke: 'blue',
                strokeWidth: 4
            };

            const dx = this.PuntoFinal.Posicion.x - this.PuntoInicial.Posicion.x;
            const dy = this.PuntoFinal.Posicion.y - this.PuntoInicial.Posicion.y;
            const distanciaPixeles = Math.sqrt(dx * dx + dy * dy);
            const distanciaMetros = distanciaPixeles * Lienzo.Escala;

            var cfgGraficoTexto = {
                x: (this.PuntoInicial.Posicion.x + this.PuntoFinal.Posicion.x) / 2,
                y: (this.PuntoInicial.Posicion.y + this.PuntoFinal.Posicion.y) / 2,
                text: `${distanciaMetros.toFixed(2)}m`,
                fontSize: 16,
                fill: 'black',
                padding: 4,
                background: 'white'
            };

            if (this.Grafico == null) {
                this.Grafico = new Konva.Line(cfgGraficoLinea);
                this.GraficoTexto = new Konva.Text(cfgGraficoTexto);

                layer.add(this.Grafico);
                layer.add(this.GraficoTexto);
                
            } else {
            this.Grafico.setAttrs(cfgGraficoLinea);
            this.Grafico.getLayer().batchDraw();

            this.GraficoTexto.setAttrs(cfgGraficoTexto);
            this.GraficoTexto.getLayer().batchDraw();
            }
        }
    }

    function Punto() {
        this.Tipo = enumTipoGrafico.Punto;
        this.Grafico = null;
        this.lstRelacionado = [];
        this.Arrastrable = false;

        this.Posicion = { x: null, y: null };
        this.Orden = Punto.OrdenActual++;

        this.Dibujar = function () {

            var cfgGrafico = {
                x: this.Posicion.x,
                y: this.Posicion.y,
                radius: 7,
                fill: 'red',
                draggable: false
            };

            if (this.Grafico == null) {
                this.Grafico = new Konva.Circle(cfgGrafico);
                layer.add(this.Grafico);
            }
            else {
            this.Grafico.setAttrs(cfgGrafico);
            this.Grafico.getLayer().batchDraw();
            }

            this.lstRelacionado.forEach(function (item) {
                item.Dibujar();
            });
        }

        this.MoverArriba = function () {
            this.Grafico.moveToTop();
        }
    }

    Punto.OrdenActual = 0;
    const escala = Lienzo.Escala;

    var container = document.getElementById('container');

    stage = new Konva.Stage({
        container: 'container',
        width: container.offsetWidth,
        height: container.offsetHeight
    });

    window.addEventListener('resize', function () {
        stage.width(container.offsetWidth);
        stage.height(container.offsetHeight);
        stage.draw();
    });

    Lienzo.Stage = stage;

    //Instanciar las capas en el escenario
    layer = new Konva.Layer();
    stage.add(layer);

    Lienzo.Estado = enumEstadoLienzo.Agregando;
    Lienzo.BloquearArea(true);

    if (idAreaSeleccionada != null && idAreaSeleccionada != "") {
        Lienzo.Modo = enumModoLienzo.Isla
        Lienzo.Estado = enumEstadoLienzo.Agregando;
        Lienzo.BloquearArea(true);
        let $radio = $(`#lstAreas input[data-id="${idAreaSeleccionada}"]`);
        $radio.closest("label").trigger('click');
        $('#crearIsla').data('idpatio', idAreaSeleccionada).prop('disabled', false);
    }

    //Evento que permite el zoom al girar la rueda del raton
    stage.on('wheel', (e) => {
        e.evt.preventDefault();
        const escalaAnterior = stage.scaleX();
        const cursor = stage.getPointerPosition();

        const escalarPor = 1.25;
        const direccion = e.evt.deltaY > 0 ? 1 : -1;
        const nuevaEscala = direccion > 0 ? escalaAnterior / escalarPor : escalaAnterior * escalarPor;

        stage.scale({ x: nuevaEscala, y: nuevaEscala });

        const mousePointTo = {
            x: (cursor.x - stage.x()) / escalaAnterior,
            y: (cursor.y - stage.y()) / escalaAnterior
        };
        stage.position({
            x: cursor.x - mousePointTo.x * nuevaEscala,
            y: cursor.y - mousePointTo.y * nuevaEscala
        });
        stage.batchDraw();
    });

    stage.on('pointerdown touchstart', function (e) {
        const boton = e.evt.button;
        let esTouch = e.type.startsWith("touch");

        if (!esTouch) {
            if (e.evt.crtlKey) {
                Lienzo.HabilitarArrastrable(true);
                return;
            }
        }

        if (esTouch && e.evt.touches.length === 2) {
            Lienzo.HabilitarArrastrable(true);
            return;
        }

        if (boton === enumBotton.ClickDerecho) {
            Lienzo.HabilitarArrastrable(true);
        }
    });
    
    stage.on('pointerup touchend', function (e) {

        let esTouch = e.type.startsWith("touch");
        const boton = e.evt.button;

        if (Lienzo.Modo === enumModoLienzo.is) {
            if (boton === 2) {
                Lienzo.HabilitarArrastrable(false);
            }
        }

        if (esTouch && e.evt.touches.length < 2) {
            Lienzo.HabilitarArrastrable(false);
        }
    });

    $.getJSON('/Estructura/ListarTiposEstructura', function (res) {
        listarTipoEstructuras = res.map(t => `<option value="${t.Id}" data-color="${t.Color}">${t.Descripcion}</option>`).join('');
    });

    $.getJSON('/DetallesEnu/ListarEnus', function (res) {
        listarEnus = res.map(e => `<option value="${e.Id}">${e.Descripcion}</option>`).join('');
    });

    $(`#lstAreas`).on('click', 'label.btn', function () {
        $(`#lstAreas .btn`).removeClass('active');
        $(this).addClass('active');

        let input = $(this).find('input[name="area"]');
        let id = input.data('id');
        
        idAreaSeleccionada = id;

        $('#guardarBtn').data('idpatio', id)
            .prop('disabled', !id);

        if (!id) return;

        layer.destroyChildren();
        Lienzo.lstPunto = [];
        Lienzo.PuntoActual = null;

        $.getJSON('/Area/ObtenerAreaPorId', { id: id }, function (res) {
            if (!res.ok || !res.data) return;

            var area = res.data;
            area.Vertices = area.Vertices.OrderBy(c => c.Orden).ToArray();
            area.Vertices.forEach(v => {
                Lienzo.PuntoActual = Lienzo.AgregarPunto(v.X, v.Y);
                Lienzo.PuntoActual.Id = v.Id;
                Lienzo.PuntoActual.Dibujar();
            });

            Lienzo.PuntoActual = null;
            Lienzo.Cerrar();
            Lienzo.Modo = enumModoLienzo.Area;
            Lienzo.Estado = enumEstadoLienzo.Editando;
            Lienzo.BloquearArea(false);

            $.getJSON('/Area/ObtenerIslasPorAreaId', { id: id }, function (res) {
                if (!res.ok || !res.data);

                var area = res.data;
                area.Islas.forEach(i => {
                    
                    var rectanguloIsla = new Konva.Rect({
                        name: i.Nombre,
                        rotation: i.Orientacion,
                        text: i.Descripcion,
                        x: i.X,
                        y: i.Y,
                        width: i.Ancho,
                        height: i.Alto,
                        fill: `#${i.Color}`,
                        strokeWidth: 1,
                        stroke: 'black',
                    });

                    rectanguloIsla.on('pointerclick', function () {
                        DameDatosIsla(i);
                    });

                    rectanguloIsla.on('pointerdblclick', function () {
                        bootbox.dialog({
                            title: `Modificar zona ${i.Nombre}`,
                            message: "Deseas editar o eliminar la zona",
                            buttons: {
                                btnSalir: {
                                    label: "Cancelar",
                                    className: "btn btn-primary",
                                    cancel: true,
                                },
                                btnEditar: {
                                    label: "Editar",
                                    className: "btn btn-success",
                                    callback: function () {
                                        bootbox.dialog({
                                            title: "Crear Zona",
                                            message: `<form id="formIsla">
                                                        <div class="form-group">
                                                            <label>Nombre de la zona</label>
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
                                                    className: "btn btn-primary",
                                                    callback: function (result) {
                                                        tr.nodes([rectanguloIsla]);
                                                        layer.draw();
                                                        layer.add(tr);
                                                        const escala = DameEscala();

                                                        if (result) {
                                                            rectanguloIsla.draggable(true);
                                                            rectanguloIsla.on('transform', function () {
                                                                ajustarTamanos(rectanguloIsla, escala);
                                                                DameTamano(rectanguloIsla, layer);
                                                            });

                                                            var nuevosDatos = {
                                                                Nombre: $('#nombreIsla').val(),
                                                                Observaciones: $('#observacionesIsla').val(),
                                                            }

                                                            rectanguloIsla.on('pointerup', function () {
                                                                const pos = rectanguloIsla.getAbsolutePosition();
                                                                var rotacion = DameRotacion(rectanguloIsla);

                                                                var payload = {
                                                                    Id: i.Id,
                                                                    Nombre: nuevosDatos.Nombre,
                                                                    Orientacion: rotacion,
                                                                    X: pos.x,
                                                                    Y: pos.y,
                                                                    Ancho: rectanguloIsla.width() * rectanguloIsla.scaleX(),
                                                                    Alto: rectanguloIsla.height() * rectanguloIsla.scaleY(),
                                                                    Observaciones: nuevosDatos.Observaciones,
                                                                };

                                                                $.ajax({
                                                                    url: './Isla/EditarIsla',
                                                                    method: 'POST',
                                                                    data: JSON.stringify(payload),
                                                                    contentType: 'application/json; charset=utf-8',
                                                                    success: function (res) {
                                                                        if (res.ok) {
                                                                            bootbox.alert(`La zona ${i.Nombre} ha sido editada`);
                                                                        } else {
                                                                            bootbox.alert(`Ha ocurrido un error al intentar editar la zona ${i.Nombre}`);
                                                                        }
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }
                                },
                                btnEliminar: {
                                    label: "Eliminar",
                                    className: "btn btn-danger",
                                    callback: function () {
                                        bootbox.dialog({
                                            title: 'Confirmar borrado',
                                            message: `Estas de acuerdo en eliminar la zona ${i.Nombre}`,
                                            buttons: {
                                                btnCancelar: {
                                                    label: "Cancelar",
                                                    className: "btn btn-primary",
                                                    cancel: true,
                                                },
                                                btnConfirmarEliminacion: {
                                                    label: "Eliminar",
                                                    className: "btn btn-danger",
                                                    callback: function () {
                                                        var payload = {
                                                            Id: i.Id,
                                                            Nombre: i.Nombre,
                                                            Orientacion: i.Orientacion,
                                                            X: i.X,
                                                            Y: i.Y,
                                                            Ancho: i.Ancho,
                                                            Alto: i.Alto,
                                                            Observaciones: i.Observaciones,
                                                        }
                                                        $.ajax({
                                                            url: './Isla/BorrarIsla',
                                                            method: 'POST',
                                                            data: JSON.stringify(payload),
                                                            contentType: 'application/json; charset=utf-8',
                                                            success: function (res) {
                                                                if (res.ok) {
                                                                    bootbox.alert(`La zona ${i.Nombre} ha sido eliminada`);
                                                                } else {
                                                                    bootbox.alert(`Ha ocurrido un error al intentar eliminar la zona ${i.Nombre}`);
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    });
                    layer.add(rectanguloIsla)
            });
                layer.draw();
            });
        }); 
    });

    $('#agregarTipoEstructura').on('click', function () {
        let formularioEstructura = `<form id="formTipoEstructura">
            <div class="form-group">
                <label>Descripcion</label>
                    <input type="text" class="form-control" id="descripcionEstructura" required />
                <br />
                <label>Seleccionar Enu</label>
                <select id="enuEstructura" class="form-control" required />
                    <option value=""> --Selecciona-- </option>
                    ${listarEnus}
                </select>
                <label>Color</label>
                <input type="color" class="form-control" id="colorEstructura" value="#ff0000" required />
            </div>
        `;
        bootbox.dialog({
            title: 'Agregar nuevo tipo de estructura',
            message: formularioEstructura,
            buttons: {
                cancelar: {
                    label: "Cancelar",
                    className: "btn-danger",
                    callback: function () {
                        return;
                    }
                },
                confirm: {
                    label: "Guardar",
                    className: "btn-success",
                    callback: function () {
                        const descripcion = $(`#descripcionEstructura`).val();
                        const idEnu = $(`#enuEstructura`).val();
                        const color = $(`#colorEstructura`).val().replace('#', '');

                        console.log(idEnu);

                        var payload = {
                            Descripcion: descripcion,
                            DetalleTipoEstructura: { Id: idEnu },
                            Color: color,
                        }
                        var url = '/Estructura/GuardarTipoEstructura';

                        console.log(payload);

                        $.ajax({
                            method: 'POST',
                            url: url,
                            data: JSON.stringify(payload),
                            contentType: 'application/json; charset=utf-8',
                            success: function (res) {
                                if (res.ok) {
                                    bootbox.alert('Tipo de estructura guardada con exito')
                                } else {
                                    bootbox.alert('Error al guardar el tipo de estructura');
                                }
                            }
                        });

                    }
                }
            }
        });
    });


    $(`#crearZona`).on(`click`, function () {
        bootbox.dialog({
            title: "Crear Zona",
            message: `<form id="formIsla">
                    <div class="form-group">
                        <label>Nombre de la Zona</label>
                        <input type="text" class="form-control" id="nombreIsla" required />
                        <br />
                        <label>Tipo de estructura</label>
                        <select id="tipoEstructura" class="form-control" required />
                            <option value=""> --Selecciona-- </option>
                            ${listarTipoEstructuras}
                        </select>
                        <br />
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
                        const idEstructura = $(`#tipoEstructura`).val();
                        datosIsla = {
                            Nombre: $(`#nombreIsla`).val(),
                            Estructura: { Id: idEstructura },
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
                            fill:  idEstructura.Color,
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
                            x: islaTemporal.width() / 2,
                            y: islaTemporal.height() / 2,
                            text: '',
                            fontSize: 12,
                            fill: 'black',
                        });

                        var tr = new Konva.Transformer({
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

                        tr.nodes([islaTemporal]);

                        grupoIslas.add(islaTemporal, TextoSuperior, TextoDerecha);
                        layer.add(grupoIslas, tr);

                        islaTemporal.on('transform dragmove', function () {
                            DameTamano(islaTemporal, layer);
                            actualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);
                            ajustarTamanos(islaTemporal, escala);
                            layer.batchDraw();
                        });

                        islaTemporal.on('transformend', function () {
                            DameTamano(islaTemporal, layer);
                            var rotacion = DameRotacion(islaTemporal);
                            datosIsla.Orientacion = rotacion;
                        });

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

    $(`#guardarBtn`).on('click', function () {
        if (!islaTemporal) {
            bootbox.alert("No hay isla para guardar");
            return;
        }

        let rotacion = DameRotacion(islaTemporal);
        let posicionAbsoluta = islaTemporal.getAbsolutePosition();

        var data = JSON.parse(JSON.stringify(datosIsla));

        data.Orientacion = rotacion;
        data.x = posicionAbsoluta.x;
        data.y = posicionAbsoluta.y;
        data.Ancho = islaTemporal.width() * islaTemporal.scaleX();
        data.Alto = islaTemporal.height() * islaTemporal.scaleY();
        data.Area = { Id: idAreaSeleccionada };

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

    $('#cerrarSidebar').on('click', function () {
        $('#sidebar').removeClass("active");
    });

    function TamanoIsla(escala) {
        const anchoBahia = 6.06 / escala;
        const altoBahia = 2.44 / escala;

        var ancho = 2 * anchoBahia;
        var alto = altoBahia;

        return { ancho, alto };
    }

    function DameTamano(isla, layer) {
        if (!isla) return;

        const anchoMetros = (isla.width() * isla.scaleX() * escala).toFixed(2);
        const altoMetros = (isla.height() * isla.scaleY() * escala).toFixed(2);

        TextoSuperior.text(`${anchoMetros} m`);
        TextoDerecha.text(`${altoMetros} m`);

        actualizarTexto(isla, TextoSuperior, TextoDerecha);
    }
}

