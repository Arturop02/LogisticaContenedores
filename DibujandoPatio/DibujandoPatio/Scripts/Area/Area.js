var stage;
var layer;
var Lienzo;
var idAreaSeleccionada = null;
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

    function throttle(func, limit) {
        var inThrottle = false;
        return function (...args) {
            if (!inThrottle) {
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
                func.apply(this, args);
            }
        }
    }

    function DameEscala() {
        const escala = 0.4;
        return escala;
    }

    function DameRotacion(nodo) {
        var rotacion = nodo.rotation() % 360;
        if (rotacion < 0) rotacion += 360;
        return rotacion;
    }

    function TamanoIsla(escala) {
        const anchoBahia = 6.06 / escala;
        const altoBahia = 2.44 / escala;

        var ancho = 2 * anchoBahia;
        var alto = altoBahia;

        return { ancho, alto };
    }

    var tamano = TamanoIsla(DameEscala()); 

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

    function DibujaDatosIsla(isla) {
        const escala = DameEscala();
        var alto = (isla.Alto * escala).toFixed(2);
        var ancho = (isla.Ancho * escala).toFixed(2);

        const datosIsla = [{
            Nombre: isla.Nombre,
            Descripcion: isla.Descripcion,
            Ancho: ancho + 'm',
            Alto: alto + 'm',
            Observaciones: isla.Observaciones
        }];

        const tabla = $('#tablaDatos');

        if (tabla.data('initialized')) {
            $('#tablaDatos').jqGrid('clearGridData');
            $('#tablaDatos').jqGrid('setGridParam', { data: datosIsla }).trigger('reloadGrid');
            console.log("Tabla actualizada");
        } else if (tabla) {
            $('#tablaDatos').jqGrid({
                datatype: 'local',
                data: datosIsla,
                colModel: [
                    { label: "Nombre", name: "Nombre", width: 200 },
                    { label: "Tipo de Estructura", name: "Descripcion", width: 200 },
                    { label: "Ancho", name: "Ancho", width: 150, align: "center" },
                    { label: "Alto", name: "Alto", width: 150, align: "center" },
                    { label: "Observaciones", name: "Observaciones", width: 200 },
                ],
                viewrecords: true,
                height: "auto",
                rowNum: 10,
            });
            tabla.data('initialized', true);
            $("#tablaDatos").jqGrid('setGridWidth', $("#sidebar-content").width());
        }
        $("#sidebar").addClass("active");
    }

    Lienzo = {
        Modo: enumModoLienzo.Area, 
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

        this.Eliminar = function () {
            this.Grafico?.destroy();
            this.GraficoTexto?.destroy();
            this.lstRelacionado.forEach(item => {
                item.lstRelacionado.RemoveAll(c => c == this);
            });
        }

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
                var linea = this;
                this.Grafico.on('pointerdblclick', (e) => {
                    if (Lienzo.Modo !== enumModoLienzo.Area || Lienzo.Estado !== enumEstadoLienzo.Editando) {
                        return;
                    }

                    const pos = Lienzo.DamePosicion();
                    bootbox.confirm({
                        message: '¿Deseas agregar un nuevo punto?',
                        buttons: {
                            confirm: {
                                label: 'Agregar',
                                className: 'btn-success'
                            },
                            cancel: {
                                label: 'Cancelar',
                                className: 'btn-danger'
                            }
                        },
                        callback: (result) => {
                            if (result) {
                                var Orden = linea.lstRelacionado.Min(c => c.Orden);

                                linea.Eliminar();
                                var punto = Lienzo.AgregarPunto(pos.x, pos.y);

                                linea.lstRelacionado.forEach(item => {
                                    Lienzo.RelacionarPuntos(item, punto);
                                });

                                Orden = linea.lstRelacionado.Min(c => c.Orden);
                                if (Orden == 0)
                                    Orden = linea.lstRelacionado.Max(c => c.Orden);
                                punto.Orden = Orden + 1;

                                Lienzo.lstPunto.Where(c => c.Orden > Orden && c != punto).forEach(item => {
                                    item.Orden++;
                                });

                                punto.Dibujar();
                                Lienzo.AjustarOrden();
                                Lienzo.PuntoActual = punto;
                                Lienzo.Estado = enumEstadoLienzo.Moviendo;
                            }
                        }
                    });
                });
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

        this.Eliminar = function () {
            this.Grafico.destroy();
            Lienzo.lstPunto.RemoveAll(c => c == this);
            if (Lienzo.PuntoActual == this)
                Lienzo.PuntoActual = null;

            var temp = [];
            temp.AddRange(this.lstRelacionado);

            temp.forEach(function (item) {
                item.Eliminar();
            });

            return this;
        }

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

                this.Grafico.on('pointerdown', throttle((e) => {

                    if (Lienzo.Modo === enumModoLienzo.Area) {
                        if (Lienzo.Estado === enumEstadoLienzo.Editando) {
                            Lienzo.Estado = enumEstadoLienzo.Moviendo;
                            Lienzo.PuntoActual = this;
                        } else if (Lienzo.Estado === enumEstadoLienzo.Moviendo) {
                            Lienzo.Estado = enumEstadoLienzo.Editando;
                            Lienzo.PuntoActual = null;
                        } else if (Lienzo.Estado === enumEstadoLienzo.Agregando && Lienzo.lstPunto.length >= 3 && Lienzo.lstPunto[0] === this) {
                            Lienzo.Cerrar();
                        }
                    }
                }, 300));
                this.Grafico.on('pointerdblclick', (e) => {
                    if (Lienzo.Modo === enumModoLienzo.Isla) return;
                    if (Lienzo.Modo === enumModoLienzo.Area) {
                        if (Lienzo.Estado === enumEstadoLienzo.Editando) {
                            var lstpunto = [];
                            bootbox.confirm({
                                message: '¿Deseas eliminar el punto?',
                                buttons: {
                                    confirm: {
                                        label: 'Eliminar',
                                        className: 'btn-success'
                                    },
                                    cancel: {
                                        label: 'Cancelar',
                                        className: 'btn-danger'
                                    }
                                },
                                callback: (result) => {
                                    if (result) {
                                        this.lstRelacionado.forEach(linea => {
                                            linea.lstRelacionado.forEach(punto => {
                                                if (punto != this)
                                                    lstpunto.push(punto);
                                            });
                                        });

                                        var punto1 = lstpunto[0];
                                        var punto2 = lstpunto[1];

                                        this.Eliminar();

                                        Lienzo.RelacionarPuntos(punto1, punto2);

                                        punto1.Dibujar();

                                        Lienzo.lstPunto.forEach(item => {
                                            if (item.Orden > this.Orden && item != this)
                                                item.Orden--;
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
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

    function cargarIslas(idAreaSeleccionada) {
        var idAreaActual = null;
        if (idAreaActual == idAreaSeleccionada) return;

        idAreaActual = idAreaSeleccionada;
        layer.destroyChildren();
        layer.draw();

        $.getJSON('/Area/ObtenerIslasPorAreaId', { id: idAreaSeleccionada }, function (res) {
            if (!res.ok || !res.data);

            var area = res.data;
            area.Islas.forEach(i => {
                
                var rectanguloIsla = new Konva.Rect({
                    name: i.Nombre,
                    text: i.Descripcion,
                    rotation: i.Orientacion,
                    x: i.X,
                    y: i.Y,
                    width: i.Ancho,
                    height: i.Alto,
                    fill: `#${i.Color}`,
                    strokeWidth: 1,
                    stroke: 'black', 
                });

                rectanguloIsla.on('pointerclick', function () {
                    DibujaDatosIsla(i);
                });

                rectanguloIsla.on('pointerdblclick', function () {
                    bootbox.dialog({
                        title: `Modificar isla ${i.Nombre}`,
                        message: "Deseas editar o eliminar la isla",
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
                                        title: "Editar Isla",
                                        message: `<form id="formIsla">
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
                                                        });

                                                        var nuevosDatos = {
                                                            Nombre: $('#nombreIsla').val(),
                                                            Observaciones: $('#observacionesIsla').val(),
                                                        }

                                                        rectanguloIsla.on('pointerup', function () {
                                                            const transform = stage.getAbsoluteTransform().copy().invert();
                                                            const pos = transform.point(rectanguloIsla.getAbsolutePosition());
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
                                                                        bootbox.alert(`La isla ${i.Nombre} ha sido editada`);
                                                                    } else {
                                                                        bootbox.alert(`Ha ocurrido un error al intentar editar la isla ${i.Nombre}`);
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
                                        message: `Estas de acuerdo en eliminar la isla ${i.Nombre}`,
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
                                                                bootbox.alert(`La isla ${i.Nombre} ha sido eliminada`);
                                                            } else {
                                                                bootbox.alert(`Ha ocurrido un error al intentar eliminar la isla ${i.Nombre}`);
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
                layer.add(rectanguloIsla);

            });
            layer.draw();
        });
    }

    Punto.OrdenActual = 0;

    var container = document.getElementById('container');
    var listarPatios = [];

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

    //Evento que permite dibujar si se da clic
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

        if (Lienzo.Modo === enumModoLienzo.Area) {
            switch (boton) {
                case enumBotton.ClickDerecho: {
                    Lienzo.HabilitarArrastrable(true);
                    break;
                }
                case enumBotton.ClickIzquierdo: {
                    if (Lienzo.Estado === enumEstadoLienzo.Agregando) {
                        const posicion = Lienzo.DamePosicion();

                        Lienzo.PuntoActual = Lienzo.AgregarPunto(posicion.x, posicion.y);
                        if (Lienzo.lstPunto.length == 0)
                            Lienzo.PuntoActual = Lienzo.AgregarPunto(posicion.x, posicion.y);
                    }
                    break;
                }
            }
        }
    });

    //Acciones que se realizan al arrastrar el mouse
    stage.on('pointermove', function (e) {
        if (Lienzo.Modo === enumModoLienzo.Area) {
            if ([enumEstadoLienzo.Agregando, enumEstadoLienzo.Editando, enumEstadoLienzo.Moviendo].includes(Lienzo.Estado)) {

                if (Lienzo.PuntoActual != null) {
                    const pos = Lienzo.DamePosicion();

                    Lienzo.PuntoActual.Posicion.x = pos.x;
                    Lienzo.PuntoActual.Posicion.y = pos.y;
                    Lienzo.PuntoActual.Dibujar();
                }
            }
        }
    });

    //Acciones que se realizan al dejar de hacer un clic sostenido
    stage.on('pointerup touchend', function (e) {

        let esTouch = e.type.startsWith("touch");
        const boton = e.evt.button;

        if (Lienzo.Modo === enumModoLienzo.Area) {
            if (boton === 2) {
                Lienzo.HabilitarArrastrable(false);
            }
        }

        if (esTouch && e.evt.touches.length < 2) {
            Lienzo.HabilitarArrastrable(false);
        }
    });

    $.getJSON('/Patio/ListarPatios', function (res) {
        listarPatios = res.map(p => `<option value="${p.Id}">${p.Nombre}</option>`).join('');
    });

    $(`#lstAreas`).on('click','label.btn', function () {
        $(`#lstAreas .btn`).removeClass('active');
        $(this).addClass('active');

        let input = $(this).find('input[name="area"]');
        let id = input.data('id');
        let nombre = input.data('nombre');

        idAreaSeleccionada = id;

        $('#guardarBtn').data('idpatio', id)
            .data('nombre', nombre)
            .prop('disabled', !id);

        $('#btnRedirigir').data('idpatio', id).prop('disabled', !id);

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

        });

        cargarIslas(id);

    });

    $(`#btnDibujar`).on('click', function () {
        layer.destroyChildren();
        layer.draw();
        Lienzo.lstPunto = [];
        Lienzo.PuntoActual = null;

        Punto.OrdenActual = 0;

        Lienzo.Modo = enumModoLienzo.Area;
        Lienzo.Estado = enumEstadoLienzo.Agregando;

        $('#guardarBtn').removeData('idpatio').prop('disabled', false);
    });

    $('#agregarEnu').on('click', function () {
        let formularioEnu = `
            <div class="mb-3">
                <label for="nuevoEnu">Nuevo ENU:</label>
                <input type="text" id="nuevoEnu" class="form-control" placeholder="Ingresa el nombre del nuevo ENU"/> 
            </div>
        `;
        bootbox.dialog({
            title: 'Confirmar Guardado',
            message: formularioEnu,
            buttons: {
                cancel: {
                    label: 'Cancelar',
                    className: 'btn-danger'
                },
                confirm: {
                    label: 'Guardar',
                    className: 'btn-success',
                    callback: function () {
                        const DescripcionEnu = $('#nuevoEnu').val().trim();

                        url = '/DetallesEnu/GuardarDetalleEnu';
                        payload = {
                            Descripcion: DescripcionEnu,
                        }

                        $.ajax({
                            url: url,
                            method: 'POST',
                            data: JSON.stringify(payload),
                            contentType: 'application/json; charset=UTF-8',
                            success: function (res) {
                                if (res.ok) {
                                    bootbox.alert("Guardado correctamente");
                                    dibujando = false;
                                    $('#guardarBtn').prop('disabled', true);
                                } else {
                                    bootbox.alert("Ha ocurrido un problema");
                                }
                            }
                        });

                    }
                }
            }
        });
    })

    $('#guardarBtn').on('click', function (e) {
        Lienzo.Cerrar();
        let id = $(this).data('idpatio');
        let nombre = $(this).data('nombre');
       
        //Arreglo de vertices que guarda el orden en el que fueron creados los puntos al recorrer
        //el array puntos con un for
        const vertices = Lienzo.lstPunto.map(p => ({
            Id: p.Id,
            X: p.Posicion.x,
            Y: p.Posicion.y,
            Orden: p.Orden,
            Activo: p.Activo
        }));

        let url, payload;

        if (id) {
            url = '/Area/EditarArea';
            payload = {
                Id: id,
                Nombre: nombre,
                Vertices: vertices
            }

            $.ajax({
                url: url,
                method: 'POST',
                data: JSON.stringify(payload),
                contentType: 'application/json; charset=utf-8',
                success: function (res) {
                    //console.log("respuesta del server", res);
                    if (res.ok) {
                        bootbox.alert("Editado correctamente");
                        dibujando = false;
                        $('#guardarBtn').prop('disabled', true);
                    } else {
                        bootbox.alert("Ha ocurrido un problema");
                    }
                }
            });

        } else {

            let formulario = `
                <div class="mb-3">
                    <label for="selectPatio">Selecciona el patio:</label>
                    <select id="selectPatio" class="form-control">
                        <option value="">-- Selecciona --</option>
                        ${listarPatios}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="nombreArea">Área:</label>
                    <input type="text" id="nombreArea" class="form-control" placeholder="Ingresa el nombre del área nueva"/>
                </div>
            `;

            bootbox.dialog({
                title: 'Confirmar Guardado',
                message: formulario,
                buttons: {
                    cancel: {
                        label: 'Cancelar',
                        className: 'btn-danger'
                    },
                    confirm: {
                        label: 'Guardar',
                        className: 'btn-success',
                        callback: function () {
                            const idPatio = $('#selectPatio').val();
                            const nombreArea = $('#nombreArea').val().trim();

                            if (!idPatio) {
                                bootbox.alert("Por favor, selecciona un patio existente o ingresa el nombre de un nuevo patio.");
                                return false;
                            }

                            if (!nombreArea) {
                                bootbox.alert("Por favor, ingresa el nombre del área.");
                                return false;
                            }

                            url = '/Area/GuardarArea';
                            payload = {
                                Nombre: nombreArea,
                                Patio: { Id: idPatio },
                                Vertices: vertices
                            }

                            $.ajax({
                                url: url,
                                method: 'POST',
                                data: JSON.stringify(payload),
                                contentType: 'application/json; charset=UTF-8',
                                success: function (res) {
                                    if (res.ok) {
                                        bootbox.alert("Guardado correctamente");
                                        dibujando = false;
                                        $('#guardarBtn').prop('disabled', true);
                                    } else {
                                        bootbox.alert("Ha ocurrido un problema");
                                    }
                                }
                            });

                        }
                    },
                },
            });
        }
    });

    $(`#btnRedirigir`).on('click', function () {
        let valor = $(`#lstAreas input[name = "area"]:checked`).data('id');
        window.location.href = objSer.Url.Area.DibujarIsla.replace('__id__', valor);
    });

    $('#cerrarSidebar').on('click', function () {
        $('#sidebar').removeClass("active");
    });
}
