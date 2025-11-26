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

    function MoverGrupoIsla(nodo, texto, icono) {
        var nodoRect = nodo.getParent().findOne('Rect');

        let anchoRect = nodoRect.getWidth();
        let altoRect = nodoRect.getHeight();
        var rotacion = DameRotacion(nodo);

        var Centro = {
            x: nodoRect.width() / 2,
            y: nodoRect.height() / 2,
        };


        let r = (altoRect / 2) + texto.height();
        var rad = (90 + rotacion) * Math.PI / 180;

        var xTexto = Centro.x + r * Math.cos(rad);
        var yTexto = Centro.y + r * Math.sin(rad);


        texto.position({
            x: xTexto,
            y: yTexto,
        });

        texto.offsetX(texto.width() / 2);
        texto.offsetY(texto.height() / 2);

        icono.position({
            x: Centro.x,
            y: Centro.y,
        });
        icono.fontSize(TamanoIcono(nodoRect));

        icono.offsetX(icono.width() / 2);
        icono.offsetY(icono.height() / 2);

        texto.rotation(rotacion);
        icono.rotation(rotacion);

    }

    function DibujarDatosIsla(isla) {
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
        AgregarIsla: function (x, y, ancho, alto, nombre, color, icono, orientacion) {

            var isla = new Isla();
            isla.Posicion.x = x;
            isla.Posicion.y = y;
            isla.Ancho = ancho;
            isla.Alto = alto;
            isla.Orientacion = orientacion;
            isla.Nombre = nombre;
            isla.Color = color;

            var uniCodeIcono;
            if (icono && icono.trim() !== "") {
                uniCodeIcono = ObtenerUnicodeDesdeClase(icono);
            }

            isla.Icono = uniCodeIcono;

            return isla;
        },
        TamanoIsla: function () {
            const escala = Lienzo.Escala;
            const anchoBahia = 6.06 / escala;
            const altoBahia = 2.44 / escala;

            var ancho = 2 * anchoBahia;
            var alto = altoBahia;

            return { ancho, alto };
        },
        AjustarTamanosIsla: function (isla) {
            const pasoHorizontal = 6.06;
            const pasoVertical = 2.44;

            const escala = Lienzo.Escala;

            let anchoMetros = Math.round((isla.width() * isla.scaleX() * escala) / pasoHorizontal) * pasoHorizontal;
            let altoMetros = Math.round((isla.height() * isla.scaleY() * escala) / pasoVertical) * pasoVertical;

            isla.width(anchoMetros / escala);
            isla.height(altoMetros / escala);

            isla.scaleX(1);
            isla.scaleY(1);
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
        PantallaCompleta: function () {

            if (!document.fullscreenElement) {
                this.anchoOriginal = stage.width();
                this.altoOriginal = stage.height();

                document.body.requestFullscreen().then(() => {
                    container.style.backgroundColor = "white";
                    stage.width(window.innerWidth);
                    stage.height(window.innerHeight);
                    stage.draw();
                }).catch(err => console.log("Error", err));
            } else {
                document.exitFullscreen().then(() => {
                    stage.width(this.anchoOriginal);
                    stage.height(this.altoOriginal);
                    stage.draw();
                }).catch(err => console.log("Error", err));
            }
        },
    };

    var enumTipoGrafico = {
        Linea: 'Linea',
        Punto: 'Punto',
        Rectangulo: 'Rectangulo', 
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

    function Isla() {
        this.Tipo = enumTipoGrafico.Rectangulo;
        this.Grafico = null;
        this.GraficoTexto = null;
        this.GraficoIcono = null;
        this.GraficoTrasnformer = null;
        this.lstIslas = [];

        this.Posicion = { x: null, y: null };
        this.Orientacion = null;
        this.Ancho = null;
        this.Alto = null;

        this.Id = null;
        this.Nombre = null;
        this.Descripcion = null;
        this.Color = null;
        this.Icono = null;

        this.Eliminar = function () {
            this.Grafico?.destroy();
            this.GraficoIcono.destroy();
            this.GraficoTexto.destroy();
            this.GraficoTrasnformer?.destroy();

            var temp = [];
            temp.forEach(function (item) {
                item.Eliminar();
            });

            return this;
        };

        this.Dibujar = function () {
            var tamanoDefault = Lienzo.TamanoIsla();

            var cfgGrafico = {
                Id: this.Id,
                name: this.Nombre,
                text: this.Descripcion,
                width: this.Ancho /*|| tamanoDefault.ancho*/,
                height: this.Alto /*|| tamanoDefault.alto*/,
                fill: `#${this.Color}`,
                strokeWidth: 1.2,
                stroke: 'black',
            };

            var cfgGraficoIcono = {
                x: 0,
                y: 0,
                text: this.Icono,
                align: 'center',
                fontFamily: 'FontAwesome',
                fill: 'white',
            };

            var cfgGraficoTexto = {
                x: 0,
                y: this.Alto / 2 + 10,
                text: this.Nombre,
                fontSize: 12,
                fill: 'black',
            };

            var cfgTransformer = {
                nodes: [],
                enabledAnchors: [
                    'top-center',
                    'top-right',
                    'bottom-right',
                    'bottom-center',
                    'middle-right'
                ],
                rotateEnabled: true,
                resizeEnabled: true,
                visible: false,
                boundBoxFunc: (oldBox, newBox) => {
                    if (newBox.width < tamanoDefault.ancho || newBox.height < tamanoDefault.alto) {
                        return oldBox;
                    }
                    return newBox;
                }
            }

            var cfgGrupo = {
                x: this.Posicion.x,
                y: this.Posicion.y,
                rotation: this.Orientacion,
                draggable: false,
            };

            if (this.Grafico == null) {
                this.Grupo = new Konva.Group(cfgGrupo);

                this.Grafico = new Konva.Rect(cfgGrafico);
                this.Grafico.offsetX(this.Grafico.width() / 2);
                this.Grafico.offsetY(this.Grafico.height() / 2);

                this.GraficoIcono = new Konva.Text(cfgGraficoIcono);
                this.GraficoIcono.fontSize(TamanoIcono(this.Grafico || { width: c => tamanoDefault.ancho, height: c => tamanoDefault.alto, }))
                this.GraficoIcono.offsetX(this.GraficoIcono.width() / 2);
                this.GraficoIcono.offsetY(this.GraficoIcono.height() / 2);

                this.GraficoTexto = new Konva.Text(cfgGraficoTexto);
                this.GraficoTexto.offsetX(this.GraficoTexto.width() / 2);
                this.GraficoTexto.offsetY(this.GraficoTexto.height() / 2);

                this.GraficoTrasnformer = new Konva.Transformer(cfgTransformer);


                this.Grupo.add(this.Grafico, this.GraficoIcono, this.GraficoTexto, this.GraficoTrasnformer);

                layer.add(this.Grupo);
                var isla = this;

                this.Grafico.on('pointerdown', throttle((e) => {
                    
                    if (Lienzo.Estado === enumEstadoLienzo.Editando) {

                        Lienzo.Estado = enumEstadoLienzo.Moviendo;
                        Lienzo.IslaActual = isla;

                        isla.GraficoTrasnformer.nodes([isla.Grafico]);
                        isla.GraficoTrasnformer.visible(true);
                        isla.Grafico.draggable(true);
                        //isla.Grafico.on('transform dragmove', function () {
                        //    TransformarGrupoIsla(this.Grafico, this.GraficoIcono, this.GraficoIcono)
                        //});
                        layer.draw();

                    } else if (Lienzo.Estado === enumEstadoLienzo.Moviendo) {
                        Lienzo.Estado = enumEstadoLienzo.Editando;
                        Lienzo.IslaActual = null;
                    }
                }, 300));

                this.Grafico.on('pointerdblclick', function () {
                    if (Lienzo.Estado !== enumEstadoLienzo.Editando) {
                        bootbox.confirm({
                            message: '¿Deseas eliminar la isla?',
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
                                var payload = {
                                    Id: isla.Id,
                                    Nombre: isla.Nombre,
                                };
                                if (result) {
                                    isla.Eliminar();
                                    $.ajax({
                                        url: '/Isla/BorrarIsla',
                                        method: 'POST',
                                        data: JSON.stringify(payload),
                                        contentType: 'application/json; charset=utf-8',
                                        success: function (res) {
                                            if (res.ok) {
                                                Notify(`La zona ${isla.Nombre} ha sido eliminada`, null, null, "danger");
                                            } else {
                                                //Notify(`Ha ocurrido un error al intentar eliminar la zona ${isla.Nombre}`, null, null, "danger");
                                                bootbox.alert(`Ha ocurrido un error al intentar eliminar la isla ${isla.Nombre}`);
                                            }
                                        }
                                    });
                                }
                            },
                        });
                    }
                });
            }
            else {
                this.Grafico.setAttrs(cfgGrafico);
                this.Grafico.absolutePosition({ x: cfgGrafico.x, y: cfgGrafico.y });
                this.Grafico.getLayer().batchDraw();

                this.GraficoTexto.setAttrs(cfgGraficoTexto);
                this.GraficoTexto.absolutePosition({ x: cfgGraficoTexto.x, y: cfgGraficoTexto.y });
                this.GraficoTexto.getLayer().batchDraw();

                this.GraficoIcono.setAttrs(cfgGraficoIcono);
                this.GraficoIcono.absolutePosition({ x: cfgGraficoIcono.x, y: cfgGraficoIcono.y });
                this.GraficoIcono.getLayer().batchDraw();
            }

            this.lstIslas.forEach(function (item) {
                item.Dibujar();
            })

            this.MoverArriba = function () {
                this.Grafico.moveToTop();
            }
        }
    }

    function ObtenerUnicodeDesdeClase(iconClass) {
        // Crear un elemento temporal <i>
        const elementoTemporal = document.createElement('i');
        elementoTemporal.className = `fa ${iconClass}`;
        elementoTemporal.style.fontFamily = 'FontAwesome';
        elementoTemporal.style.display = 'inline-block';
        elementoTemporal.style.visibility = 'hidden'; // no visible
        elementoTemporal.style.position = 'absolute'; // fuera de flujo

        // Insertar en el documento (necesario para poder leer el ::before)
        document.body.appendChild(elementoTemporal);

        // Obtener el contenido del pseudo-elemento ::before
        const unicode = window.getComputedStyle(elementoTemporal, '::before')
            .getPropertyValue('content')
            .replace(/['"]/g, ''); // quitar comillas

        // Eliminar el elemento temporal
        document.body.removeChild(elementoTemporal);

        return unicode;
    }
    function TamanoIcono(rectangulo) {
        var tamIcono;

        var promedio = (rectangulo.width() + rectangulo.height()) / 2;

        if (!tamIcono || tamIcono <= 0 || isNaN(tamIcono)) {
            tamIcono = 20;
        }

        tamIcono = promedio * 0.4;

        if (!tamIcono || tamIcono <= 0 || isNaN(tamIcono)) {
            tamIcono = 20;
        }
        return tamIcono
    }
    
    Punto.OrdenActual = 0;

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
            if (e.evt.ctrlKey) {
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

    $('#cerrarSidebar').on('click', function () {
        $('#sidebar').removeClass("active");
    });

    window.iniciarDibujo = function () {
        layer.destroyChildren();
        layer.draw();
        Lienzo.lstPunto = [];
        Lienzo.PuntoActual = null;

        Punto.OrdenActual = 0;

        Lienzo.Modo = enumModoLienzo.Area;
        Lienzo.Estado = enumEstadoLienzo.Agregando;

    }

    window.seleccionarArea = function (id) {

        idAreaSeleccionada = id;
        if (!id) return;

        layer.destroyChildren();
        Lienzo.lstPunto = [];
        Lienzo.PuntoActual = null;
        Lienzo.IslaActual = null;

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

        $.getJSON('/Area/ObtenerIslasPorAreaId', { id: id }, function (res) {
            var area = res.data;
            area.Islas.forEach(i => {
                Lienzo.IslaActual = Lienzo.AgregarIsla(i.X, i.Y, i.Ancho, i.Alto, i.Nombre, i.Color, i.Icono, i.Orientacion);
                Lienzo.IslaActual.Id = i.Id;
                Lienzo.IslaActual.Dibujar();
            });

            Lienzo.IslaActual = null;
            Lienzo.Estado = enumEstadoLienzo.Editando;
            Lienzo.BloquearArea(false);
        });
    }

    window.agregarZona = function () {
        window.location.href = objSer.Url.Area.DibujarIsla.replace('__id__', idAreaSeleccionada);
    }

    window.guardarAsync = function (area) {
        Lienzo.Cerrar();
        area.Vertices = Lienzo.lstPunto.map(p => ({
            Id: p.Id,
            X: p.Posicion.x,
            Y: p.Posicion.y,
            Orden: p.Orden,
            Activo: p.Activo
        }));

        let url;
        if (area.Id == 0)
            url = '/Area/GuardarArea';
        else
            url = '/Area/EditarArea';

        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                method: 'POST',
                data: JSON.stringify(area),
                contentType: 'application/json; charset=utf-8',
                success: function (res) {
                    if (res.ok) {
                        Notify(`Editado correctamente`, null, null, "success");
                        dibujando = false;
                        $('#guardarBtn').prop('disabled', true);
                        resolve(res.Area);
                    } else {
                        bootbox.alert("Ha ocurrido un problema");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    reject(errorThrown);
                }
            });
        });       
    }

    window.agregarEnu = function () {
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
                                    Notify(`Guardado correctamente`, null, null, "success");
                                    //bootbox.alert("Guardado correctamente");
                                    dibujando = false;
//                                    $('#guardarBtn').prop('disabled', true);
                                } else {
                                    bootbox.alert("Ha ocurrido un problema");
                                }
                            }
                        });

                    }
                }
            }
        });
    };

}
