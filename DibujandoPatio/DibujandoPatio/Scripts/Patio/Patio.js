var stage;
var layer;
var Lienzo;
var previewStage;
var previewLayer

var enumModoLienzo = {
    Area: 'Area',
    Isla: 'Isla',
    Contenedor: 'Contenedor',
}
function DameEscala() {
    const escala = 0.4;
    return escala;
}

Lienzo = {
    Modo: enumModoLienzo.Area,
    Escala: DameEscala(),
    Estado: null,
    lstPunto: [],
    PuntoActual: null,
    IslaActual: null,
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
};

var enumTipoGrafico = {
        Linea: 'Linea',
        Punto: 'Punto',
        Rectangulo: 'Rectangulo',
    };

function CrearLienzo(stage, layer) {
    return {
        Modo: enumModoLienzo.Area,
        Escala: DameEscala(),
        Estado: null,
        lstPunto: [],
        PuntoActual: null,
        IslaActual: null,
        Stage: stage,
        Layer: layer,

        AgregarPunto: Lienzo.AgregarPunto,
        RelacionarPuntos: Lienzo.RelacionarPuntos,
        Cerrar: Lienzo.Cerrar,
        AgregarIsla: Lienzo.AgregarIsla,
        TamanoIsla: Lienzo.TamanoIsla,
        AjustarOrden: Lienzo.AjustarOrden,
        AjustarTamanosIsla: Lienzo.AjustarTamanosIsla,
    };
}

function Linea(puntoInicial, puntoFinal) {
    this.Tipo = enumTipoGrafico.Linea;
    this.Grafico = null;
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

        if (this.Grafico == null) {
            this.Grafico = new Konva.Line(cfgGraficoLinea);

            previewLayer.add(this.Grafico);
        } else {
            this.Grafico.setAttrs(cfgGraficoLinea);
            this.Grafico.getLayer().batchDraw();
        }
    }
}

function Punto() {
    this.Tipo = enumTipoGrafico.Punto;
    this.Grafico = null;
    this.lstRelacionado = [];

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
            previewLayer.add(this.Grafico);
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
    this.GraficoIcono = null;
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

    this.Dibujar = function () {
        var tamanoDefault = Lienzo.TamanoIsla();

        var cfgGrafico = {
            Id: this.Id,
            x: 0,
            y: 0,
            name: this.Nombre,
            text: this.Descripcion,
            width: this.Ancho,
            height: this.Alto,
            fill: this.Color ? `#${this.Color}` : "#88b7d5",
            strokeWidth: 1.2,
            stroke: 'black',
            rotation: this.Orientacion,
            offsetX: this.Ancho / 2,
            offsetY: this.Alto / 2,
        };

        var cfgGraficoIcono = {
            text: this.Icono,
            align: 'center',
            verticalAlign: 'middle',
            fontFamily: 'FontAwesome',
            fill: 'white',
            rotation: this.Orientacion,
        };

        var cfgGrupo = {
            x: this.Posicion.x,
            y: this.Posicion.y,
            draggable: false,
        };

        if (this.Grafico == null) {
            this.Grupo = new Konva.Group(cfgGrupo);

            this.Grafico = new Konva.Rect(cfgGrafico);

            this.GraficoIcono = new Konva.Text(cfgGraficoIcono);
            document.fonts.ready.then(() => {
                this.GraficoIcono.fontSize(TamanoIcono(this.Grafico));

                this.GraficoIcono.offsetX(this.GraficoIcono.width() / 2);
                this.GraficoIcono.offsetY(this.GraficoIcono.height() / 2);

                this.GraficoIcono.position({ x: 0, y: 0 });

                previewLayer.batchDraw();
            });

            this.Grupo.add(this.Grafico, this.GraficoIcono);

            previewLayer.add(this.Grupo);
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

    const elementoTemporal = document.createElement('i');
    elementoTemporal.className = `fa ${iconClass}`;
    elementoTemporal.style.fontFamily = 'FontAwesome';
    elementoTemporal.style.display = 'inline-block';
    elementoTemporal.style.visibility = 'hidden';
    elementoTemporal.style.position = 'absolute';

    document.body.appendChild(elementoTemporal);


    const unicode = window.getComputedStyle(elementoTemporal, '::before')
        .getPropertyValue('content')
        .replace(/['"]/g, '');

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

Lienzo.Stage = stage;

layer = new Konva.Layer();
stage.add(layer);

function cargarPreviewsPorPatio(patioId) {
    
    $.getJSON('/Patio/ObtenerTodoPorPatioId', { id: patioId }, function (res) {
        if (!res.ok || !res.data) return;

        var areas = res.data;

        areas.forEach(area => {
            const containerId = "preview-" + area.Id;
            $('#preview-header-' + area.Id).show();
            $('#preview-card-' + area.Id).show();
            generarPreview(area, containerId);
        });
    });
}

function generarPreview(area, containerId) {

    const cont = document.getElementById(containerId);
    cont.innerHTML = "";

    previewStage = new Konva.Stage({
        container: containerId,
        width: cont.offsetWidth,
        height: cont.offsetHeight,
    });

    previewLayer = new Konva.Layer();
    previewStage.add(previewLayer);

    const lienzoPreview = CrearLienzo(previewStage, previewLayer);   /* Object.assign({}, Lienzo);*/
    lienzoPreview.Stage = previewStage;

    area.Vertices = area.Vertices.OrderBy(c => c.Orden).ToArray();
    area.Vertices.forEach(v => {
        lienzoPreview.PuntoActual = lienzoPreview.AgregarPunto(v.X, v.Y);
        lienzoPreview.PuntoActual.Id = v.Id;
        lienzoPreview.PuntoActual.Dibujar();    
    });

    lienzoPreview.PuntoActual = null;
    lienzoPreview.Cerrar();

    area.Islas.forEach(i => {
        lienzoPreview.IslaActual = lienzoPreview.AgregarIsla(i.X, i.Y, i.Ancho, i.Alto, i.Nombre, i.Color, i.Icono, i.Orientacion);
        lienzoPreview.IslaActual.Dibujar();
    });

    lienzoPreview.IslaActual = null;

    previewLayer.draw();

    const scaleX = previewStage.width() / stage.width();
    const scaleY = previewStage.height() / stage.height();
    const scale = Math.min(scaleX, scaleY);

    previewStage.scale({ x: scale, y: scale });
    previewStage.draw();

    const dataUrl = previewStage.toDataURL({ pixelRatio: 0.9 });
    previewStage.destroy();

    cont.innerHTML = `<img src="${dataUrl}" class="preview-img"/>`;
    
}


window.seleccionarPatio = function (id) {
    var idPatioSeleccionado = id;
    if (!id) return;

    layer.destroy();

    cargarPreviewsPorPatio(idPatioSeleccionado);
}




//var stage;
//var layer;
//var Lienzo;
//var Historial = [];
//var indiceHistorial = -1;
//var enumModoLienzo = {
//    Patio: 'Patio',
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

//function inicializarArea() {

//    function throttle(func, limit) {
//        var inThrottle = false;
//        return function (...args) {
//            if (!inThrottle) {
//                inThrottle = true;
//                setTimeout(() => inThrottle = false, limit);
//                func.apply(this, args);
//            }
//        }
//    }

//    function DameEscala() {
//        const escala = 0.2;
//        return escala;
//    }

//    Lienzo = {
//        Modo: enumModoLienzo.Patio,
//        Escala: DameEscala(),
//        Estado: null,
//        lstPunto: [],
//        PuntoActual: null,
//        DamePosicion: function () {
//            const transform = this.Stage.getAbsoluteTransform().copy();
//            transform.invert();
//            const posicion = transform.point(this.Stage.getPointerPosition());
//            posicion.x = posicion.x.toFixed(6) * 1;
//            posicion.y = posicion.y.toFixed(6) * 1;
//            return posicion;
//        },
//        RestaurarTamano: function () {
//            this.Stage.scale({ x: 1, y: 1 });
//            this.Stage.position({ x: 0, y: 0 });
//            this.Stage.batchDraw();
//        },
//        Cerrar: function () {
//            if (this.PuntoActual != null)
//                this.PuntoActual.Eliminar();

//            var puntoInicial = this.lstPunto[0];
//            var puntoFinal = this.lstPunto[this.lstPunto.length - 1];

//            this.RelacionarPuntos(puntoInicial, puntoFinal);

//            puntoInicial.Dibujar();
//            puntoFinal.Dibujar();

//            this.Modo = enumModoLienzo.Patio;
//            this.Estado = enumEstadoLienzo.Editando;
//            this.AjustarOrden();
//        },
//        RelacionarPuntos: function (punto1, punto2) {
//            var linea = new Linea(punto1, punto2);
//            punto1.lstRelacionado.push(linea);
//            punto2.lstRelacionado.push(linea);

//            linea.lstRelacionado.push(punto1);
//            linea.lstRelacionado.push(punto2);
//        },
//        AgregarPunto: function (x, y) {
//            var punto = new Punto();
//            punto.Posicion.x = x;
//            punto.Posicion.y = y;

//            this.lstPunto.push(punto);

//            if (this.PuntoActual != null) {
//                this.RelacionarPuntos(this.PuntoActual, punto);
//            }
//            punto.Dibujar();

//            this.AjustarOrden();

//            return punto;
//        },
//        AjustarOrden: function () {
//            this.lstPunto.toReversed().forEach(item => {
//                item.MoverArriba();
//            });
//        },
//        HabilitarArrastrable: function (habilitar) {
//            if (habilitar) {
//                this.Stage.draggable(true);
//                this.Stage.startDrag();
//                this._contextualMenuHandler = (e) => e.preventDefault();
//                this.Stage.container().addEventListener('contextmenu', this._contextualMenuHandler);
//            } else {
//                this.Stage.draggable(false);
//                //if (this._contextualMenuHandler) {
//                //this.Stage.container().removeEventListener('contextmenu', this._contextualMenuHandler);
//                //this._contextualMenuHandler = null;
//                //}
//            }
//        },
//        BloquearPatio: function (bloquear) {
//            this.lstPunto.forEach(p => {
//                if (p.Grafico) {
//                    p.Grafico.draggable(!bloquear);
//                    p.Grafico.listening(!bloquear);
//                }
//            });
//        },
//    };

//    var enumTipoGrafico = {
//        Linea: 'Linea',
//        Punto: 'Punto'
//    };

//    function Linea(puntoInicial, puntoFinal) {
//        this.Tipo = enumTipoGrafico.Linea;
//        this.Grafico = null;
//        this.GraficoTexto = null;
//        this.lstRelacionado = [];

//        this.PuntoInicial = puntoInicial
//        this.PuntoFinal = puntoFinal;

//        this.Eliminar = function () {
//            this.Grafico?.destroy();
//            this.GraficoTexto?.destroy();
//            this.lstRelacionado.forEach(item => {
//                item.lstRelacionado.RemoveAll(c => c == this);
//            });
//        }

//        this.Dibujar = function () {
            
//            var cfgGraficoLinea = {
//                points: [this.PuntoInicial.Posicion.x, this.PuntoInicial.Posicion.y, this.PuntoFinal.Posicion.x, this.PuntoFinal.Posicion.y],
//                stroke: 'blue',
//                strokeWidth: 4
//            };

//            const dx = this.PuntoFinal.Posicion.x - this.PuntoInicial.Posicion.x;
//            const dy = this.PuntoFinal.Posicion.y - this.PuntoInicial.Posicion.y;
//            const distanciaPixeles = Math.sqrt(dx * dx + dy * dy);
//            const distanciaMetros = distanciaPixeles * Lienzo.Escala;

//            var cfgGraficoTexto = {
//                x: (this.PuntoInicial.Posicion.x + this.PuntoFinal.Posicion.x) / 2,
//                y: (this.PuntoInicial.Posicion.y + this.PuntoFinal.Posicion.y) / 2,
//                text: `${distanciaMetros.toFixed(2)}m`,
//                fontSize: 16,
//                fill: 'black',
//                padding: 4,
//                background: 'white'
//            };

//            if (this.Grafico == null) {
//                this.Grafico = new Konva.Line(cfgGraficoLinea);
//                this.GraficoTexto = new Konva.Text(cfgGraficoTexto);

//                layer.add(this.Grafico);
//                layer.add(this.GraficoTexto);
//                var linea = this;
//                this.Grafico.on('pointerdblclick', (e) => {
//                    if (Lienzo.Modo !== enumModoLienzo.Patio || Lienzo.Estado !== enumEstadoLienzo.Editando) {
//                        return;
//                    }

//                    const pos = Lienzo.DamePosicion();
//                    bootbox.confirm({
//                        message: '¿Deseas agregar un nuevo punto?',
//                        buttons: {
//                            confirm: {
//                                label: 'Agregar',
//                                className: 'btn-success'
//                            },
//                            cancel: {
//                                label: 'Cancelar',
//                                className: 'btn-danger'
//                            }
//                        },
//                        callback: (result) => {
//                            if (result) {
//                                var Orden = linea.lstRelacionado.Min(c => c.Orden);

//                                linea.Eliminar();
//                                var punto = Lienzo.AgregarPunto(pos.x, pos.y);

//                                linea.lstRelacionado.forEach(item => {
//                                    Lienzo.RelacionarPuntos(item, punto);
//                                });

//                                Orden = linea.lstRelacionado.Min(c => c.Orden);
//                                if (Orden == 0)
//                                    Orden = linea.lstRelacionado.Max(c => c.Orden);
//                                punto.Orden = Orden + 1;

//                                Lienzo.lstPunto.Where(c => c.Orden > Orden && c != punto).forEach(item => {
//                                    item.Orden++;
//                                });

//                                punto.Dibujar();
//                                Lienzo.AjustarOrden();
//                                Lienzo.PuntoActual = punto;
//                                Lienzo.Estado = enumEstadoLienzo.Moviendo;
//                            }
//                        }
//                    });
//                });
//            } else {
//                this.Grafico.setAttrs(cfgGraficoLinea);
//                this.Grafico.getLayer().batchDraw();

//                this.GraficoTexto.setAttrs(cfgGraficoTexto);
//                this.GraficoTexto.getLayer().batchDraw();
//            }
//        }
//    }

//    function Punto() {
//        this.Tipo = enumTipoGrafico.Punto;
//        this.Grafico = null;
//        this.lstRelacionado = [];
//        this.Arrastrable = false;

//        this.Posicion = { x: null, y: null };
//        this.Orden = Punto.OrdenActual++;

//        this.Eliminar = function () {
//            this.Grafico.destroy();
//            Lienzo.lstPunto.RemoveAll(c => c == this);
//            if (Lienzo.PuntoActual == this)
//                Lienzo.PuntoActual = null;

//            var temp = [];
//            temp.AddRange(this.lstRelacionado);

//            temp.forEach(function (item) {
//                item.Eliminar();
//            });

//            return this;
//        }

//        this.Dibujar = function () {

//            var cfgGrafico = {
//                x: this.Posicion.x,
//                y: this.Posicion.y,
//                radius: 7,
//                fill: 'red',
//                draggable: false
//            };

//            if (this.Grafico == null) {
//                this.Grafico = new Konva.Circle(cfgGrafico);
//                layer.add(this.Grafico);

//                this.Grafico.on('pointerdown', throttle((e) => {
                    
//                    if (Lienzo.Modo === enumModoLienzo.Patio) {
//                        if (Lienzo.Estado === enumEstadoLienzo.Editando) {
//                            Lienzo.Estado = enumEstadoLienzo.Moviendo;
//                            Lienzo.PuntoActual = this;
//                        } else if (Lienzo.Estado === enumEstadoLienzo.Moviendo) {
//                            Lienzo.Estado = enumEstadoLienzo.Editando;
//                            Lienzo.PuntoActual = null;
//                        } else if (Lienzo.Estado === enumEstadoLienzo.Agregando && Lienzo.lstPunto.length >= 3 && Lienzo.lstPunto[0] === this) {
//                            Lienzo.Cerrar();
//                        }
//                    }
//                }, 300));
//                this.Grafico.on('pointerdblclick', (e) => {
//                    if (Lienzo.Modo === enumModoLienzo.Isla) return;
//                    if (Lienzo.Modo === enumModoLienzo.Patio) {
//                        if (Lienzo.Estado === enumEstadoLienzo.Editando) {
//                            var lstpunto = [];
//                            bootbox.confirm({
//                                message: '¿Deseas eliminar el punto?',
//                                buttons: {
//                                    confirm: {
//                                        label: 'Eliminar',
//                                        className: 'btn-success'
//                                    },
//                                    cancel: {
//                                        label: 'Cancelar',
//                                        className: 'btn-danger'
//                                    }
//                                },
//                                callback: (result) => {
//                                    if (result) {
//                                        this.lstRelacionado.forEach(linea => {
//                                            linea.lstRelacionado.forEach(punto => {
//                                                if (punto != this)
//                                                    lstpunto.push(punto);
//                                            });
//                                        });

//                                        var punto1 = lstpunto[0];
//                                        var punto2 = lstpunto[1];

//                                        this.Eliminar();

//                                        Lienzo.RelacionarPuntos(punto1, punto2);

//                                        punto1.Dibujar();

//                                        Lienzo.lstPunto.forEach(item => {
//                                            if (item.Orden > this.Orden && item != this)
//                                                item.Orden--;
//                                        });
//                                    }
//                                }
//                            });
//                        }
//                    }
//                });
//            }
//            else {
//                this.Grafico.setAttrs(cfgGrafico);
//                this.Grafico.getLayer().batchDraw();
//            }

//            this.lstRelacionado.forEach(function (item) {
//                item.Dibujar();
//            });
//        }

//        this.MoverArriba = function () {
//            this.Grafico.moveToTop();
//        }
//    }

//    Punto.OrdenActual = 0;

//    var container = document.getElementById('container');

//    stage = new Konva.Stage({
//        container: 'container',
//        width: container.offsetWidth,
//        height: container.offsetHeight
//    });

//    window.addEventListener('resize', function () {
//        stage.width(container.offsetWidth);
//        stage.height(container.offsetHeight);
//        stage.draw();
//    });

//    Lienzo.Stage = stage;

//    //Instanciar las capas en el escenario
//    layer = new Konva.Layer();
//    stage.add(layer);

//    //Evento que permite el zoom al girar la rueda del raton
//    stage.on('wheel', (e) => {
//        e.evt.preventDefault();
//        const escalaAnterior = stage.scaleX();
//        const cursor = stage.getPointerPosition();

//        const escalarPor = 1.25;
//        const direccion = e.evt.deltaY > 0 ? 1 : -1;
//        const nuevaEscala = direccion > 0 ? escalaAnterior / escalarPor : escalaAnterior * escalarPor;

//        stage.scale({ x: nuevaEscala, y: nuevaEscala });

//        const mousePointTo = {
//            x: (cursor.x - stage.x()) / escalaAnterior,
//            y: (cursor.y - stage.y()) / escalaAnterior
//        };
//        stage.position({
//            x: cursor.x - mousePointTo.x * nuevaEscala,
//            y: cursor.y - mousePointTo.y * nuevaEscala
//        });
//        stage.batchDraw();
//    });

//    //Evento que permite dibujar si se da clic
//    stage.on('pointerdown touchstart', function (e) {
//        const boton = e.evt.button;
//        let esTouch = e.type.startsWith("touch");

//        if (!esTouch) {
//            if (e.evt.crtlKey) {
//                Lienzo.HabilitarArrastrable(true);
//                return;
//            }
//        }

//        if (esTouch && e.evt.touches.length === 2) {
//            Lienzo.HabilitarArrastrable(true);
//            return;
//        }

//        if (Lienzo.Modo === enumModoLienzo.Patio) {
//            switch (boton) {
//                case enumBotton.ClickDerecho: {
//                    Lienzo.HabilitarArrastrable(true);
//                    break;
//                }
//                case enumBotton.ClickIzquierdo: {
//                    if (Lienzo.Estado === enumEstadoLienzo.Agregando) {
//                        const posicion = Lienzo.DamePosicion();

//                        Lienzo.PuntoActual = Lienzo.AgregarPunto(posicion.x, posicion.y);
//                        if (Lienzo.lstPunto.length == 0)
//                            Lienzo.PuntoActual = Lienzo.AgregarPunto(posicion.x, posicion.y);
//                    }
//                    break;
//                }
//            }
//        } else if (Lienzo.Modo === enumModoLienzo.Isla) {
//            switch (boton) {
//                case enumBotton.ClickDerecho: {
//                    Lienzo.HabilitarArrastrable(true);
//                    break;
//                }
//                case enumBotton.ClickIzquierdo: {
//                    return;
//                    break;
//                }
//            }
//        } else if (Lienzo.Modo === enumModoLienzo.Contenedor) {

//        }
//    });

//    //Acciones que se realizan al arrastrar el mousez
//    stage.on('pointermove', function (e) {
//        if (Lienzo.Modo === enumModoLienzo.Patio) {
//            if ([enumEstadoLienzo.Agregando, enumEstadoLienzo.Editando, enumEstadoLienzo.Moviendo].includes(Lienzo.Estado)) {

//                if (Lienzo.PuntoActual != null) {
//                    const pos = Lienzo.DamePosicion();

//                    Lienzo.PuntoActual.Posicion.x = pos.x;
//                    Lienzo.PuntoActual.Posicion.y = pos.y;
//                    Lienzo.PuntoActual.Dibujar();
//                }
//            }
//        } else if (Lienzo.Modo === enumModoLienzo.Isla) {
//            return;
//        } else if (Lienzo.Modo === enumModoLienzo.Contenedor) {
//            return;
//        }
        
//    });

//    //Acciones que se realizan al dejar de hacer un clic sostenido
//    stage.on('pointerup touchend', function (e) {

//        let esTouch = e.type.startsWith("touch");
//        const boton = e.evt.button;

//        if (Lienzo.Modo === enumModoLienzo.Patio) {
//            if (boton === 2) {
//                Lienzo.HabilitarArrastrable(false);
//            }
//        } else if (Lienzo.Modo === enumModoLienzo.Isla) {
//            if (boton === 2) {
//                Lienzo.HabilitarArrastrable(false);
//            }
//        } else if (Lienzo.Modo === enumModoLienzo.Contenedor) {

//        }

//        if (esTouch && e.evt.touches.length < 2) {
//            Lienzo.HabilitarArrastrable(false);
//        }
//    });

//    $(`#lstAreas`).on('click', 'label.btn', function () {
//        $(`#lstAreas .btn`).removeClass('active');
//        $(this).addClass('active');

//        let id = $(this).find('input[name="area"]').data('id');

//        $('#guardarBtn').data('idpatio', id).prop('disabled', !id);
//        $('#btnRedirigir').data('idpatio', id).prop('disabled', !id);
        
//        if (!id) return;

//        $.getJSON('/Patio/ObtenerPatiosPorId', { id: id}, function (res) {
//            if (!res.ok || !res.data) return;

//            layer.destroyChildren();
//            layer.draw();
//            Lienzo.lstPunto = [];
//            Lienzo.PuntoActual = null;

//            var patio = res.data;
//            patio.Vertices = patio.Vertices.OrderBy(c => c.Orden).ToArray();
//            patio.Vertices.forEach(v => {
//                Lienzo.PuntoActual = Lienzo.AgregarPunto(v.X, v.Y);
//                Lienzo.PuntoActual.Id = v.Id;
//                Lienzo.PuntoActual.Dibujar();
//            });

//            Lienzo.PuntoActual = null;
//            Lienzo.Cerrar();
//            Lienzo.Modo = enumModoLienzo.Patio;
//            Lienzo.Estado = enumEstadoLienzo.Editando;
//            Lienzo.BloquearPatio(false);
//        });
//    });

//    $('#guardarBtn').on('click', function (e) {
//        Lienzo.Cerrar();

//        //Se guarda el nombre del input con el id nombreInput
//        const id = $(this).data('idpatio');
//        const nombre = $('#nombreInput').val();
//        const escala = Lienzo.Escala;

//        //Arreglo de vertices que guarda el orden en el que fueron creados los puntos al recorrer
//        //el array puntos con un for
//        const vertices = Lienzo.lstPunto.map(p => ({
//            Id: p.Id,
//            X: p.Posicion.x,
//            Y: p.Posicion.y,
//            Orden: p.Orden,
//            Activo: p.Activo
//        }));

//        ////Condicion que envia una alerta si alguno de los campos no se ha completado
//        if (!nombre || !escala || vertices.length === 0) {
//            bootbox.alert("Por favor, completa todos los campos y/o dibuja el patio antes de guardar.");
//            return;
//        }

//        let url, payload;

//        if (id) {
//            url = '/Patio/EditarPatio';
//            payload = {
//                Id: id,
//                Nombre: nombre,
//                Escala: escala,
//                Vertices: vertices
//            }
//        } else {
//            url = '/Patio/GuardarPatio';
//            payload = JSON.stringify({
//                Nombre: nombre,
//                Escala: escala,
//                Vertices: vertices
//            });
//        }

//        ////Metodo POST usando jquery y ajax para comunicar con la BD
//        $.ajax({
//            url: url,
//            method: 'POST',
//            data: payload,
//            contentType: id ? 'application/x-www-form-urlencoded; charset=UTF-8' : 'application/json',
//            success: function (res) {
//                if (res.ok) {
//                    bootbox.alert(id ? "Editado con exito" : "Guardado correctamente");
//                    dibujando = false;
//                    $('#guardarBtn').prop('disabled', true);
//                } else {
//                    bootbox.alert("Ha ocurriod un problema")
//                }
//            }
//        });
//    });

//    $(`#btnRedirigir`).on('click', function () {
//        let valor = $(`#lstAreas input[name = "area"]:checked`).data('id');
//        if (!valor) {
//            bootbox.alert("Seleccione un patio");
//            return;
//        }
//        window.location.href = objSer.Url.Isla.Index.replace('__id__', valor);
//    });

//    $(document).trigger('LienzoReady');
//}
