var stage;
var layer;
var Lienzo;
var TextoSuperior = null;
var TextoDerecha = null;
var datosIsla = {};
var nuevosDatos = {};
var listarTipoEstructuras = [];
var listarEnus = [];
var listaIslasGuardar = [];

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
    Click: 0,
    Arrastre: 2
}

var enumEstado = {
    Agregando: 'Agregando',
    Moviendo: 'Moviendo',
    Editando: 'Editando',
}

function inicializarArea() {
    function DameEscala() {
        const escala = 0.4;
        return escala;
    }

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
    
    Lienzo = {
        Modo: enumModoLienzo.Isla,
        Escala: DameEscala(),
        Estado: null,
        lstPunto: [],
        PuntoActual: null,
        IslaActual: null,
        IslaAnterior: null,
        lstIslas: [],
        Transformer: null,
        DamePosicion: function () {
            const transform = this.Stage.getAbsoluteTransform().copy();
            transform.invert();
            const posicion = transform.point(this.Stage.getPointerPosition());
            posicion.x = posicion.x.toFixed(6) * 1;
            posicion.y = posicion.y.toFixed(6) * 1;
            return posicion;
        },
        TransformarAPosicionLocal: function (puntoAbs) {
            const transform = this.Stage.getAbsoluteTransform().copy();
            transform.invert();
            const local = transform.point(puntoAbs);
            return {
                x: Number(local.x.toFixed(4)),
                y: Number(local.y.toFixed(4))
            };
        },
        RestaurarTamano: function () {
            this.Stage.scale({ x: 1, y: 1 });
            this.Stage.position({ x: 0, y: 0 });
            Lienzo.AjustarEscalaVisual();
            this.Stage.batchDraw();
        },
        AjustarEscalaVisual: function () {
            var escala = stage.scaleX();
            var div = 1 / escala;
            Lienzo.lstPunto.forEach(p => {
                if (p.Grafico) {
                    p.Grafico.radius(7 * div);
                }

                p.lstRelacionado.forEach(item => {
                    item.Grafico.strokeWidth(4 * div);

                    if (item.GraficoTexto) {
                        item.GraficoTexto.fontSize(16 * div);
                    }
                });
            });
        },
        Cerrar: function () {
            if (this.PuntoActual != null)
                this.PuntoActual.Eliminar(Lienzo);

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
            punto.Tipo = enumTipoGrafico.Punto;
            punto.Grafico = null;
            punto.lstRelacionado = [];
            punto.Arrastrable = false;
            punto.Orden = Punto.OrdenActual++;

            this.lstPunto.push(punto);

            if (this.PuntoActual != null) {
                this.RelacionarPuntos(this.PuntoActual, punto);
            }
            punto.Dibujar(Lienzo, throttle, layer, enumModoLienzo, enumEstadoLienzo);

            this.AjustarOrden();

            return punto;
        },
        AjustarOrden: function () {
            this.lstPunto.toReversed().forEach(item => {
                item.MoverArriba();
            });
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
        AjustarIconoIsla: function (isla) {
            var tamIcono;

            var promedio = (isla.width() + isla.height()) / 2;

            tamIcono = promedio * 0.4;


            if (!tamIcono || tamIcono <= 0 || isNaN(tamIcono)) {
                tamIcono = 20;
            }

            return tamIcono
        },
        CrearIslaTemporal: async function (x, y, datos) {

            const isla = new IslaRect();

            var estructura = await Lienzo.ActualizacionVisual(datos);

            isla.Color = estructura.Color;
            var uniCodeIcono;
            if (estructura.Icono && estructura.Icono.trim() !== "") {
                uniCodeIcono = ObtenerUnicodeDesdeClase(estructura.Icono);
            }

            isla.Icono = uniCodeIcono;
            isla.Posicion.x = x;
            isla.Posicion.y = y;
            isla.Alto = Lienzo.TamanoIsla().alto;
            isla.Ancho = Lienzo.TamanoIsla().ancho;
            isla.Nombre = datos.Nombre;
            isla.Observaciones = datos.Observaciones;
            isla.Estructura = datos.IdEstructura;

            isla.Nueva = true;
            isla.Modificada = false;

            isla.Dibujar();

            IslaActual = isla;
            Lienzo.Estado = enumEstadoLienzo.Moviendo;

            if (isla.GraficoTrasnformer) {
                isla.GraficoTrasnformer.nodes([isla.Grafico]);
                isla.GraficoTrasnformer.visible(true);
                isla.Grupo.draggable(true);
                layer.draw();
            }
            return isla;
        },
        AgregarIsla: function (x, y, ancho, alto, nombre, color, icono, orientacion, estructura) {

            var isla = new IslaRect();
            isla.Posicion.x = x;
            isla.Posicion.y = y;
            isla.Ancho = ancho;
            isla.Alto = alto;
            isla.Orientacion = orientacion;
            isla.Nombre = nombre;
            isla.Color = color;
            isla.Estructura = estructura
            
            var uniCodeIcono;
            if (icono && icono.trim() !== "") {
                uniCodeIcono = ObtenerUnicodeDesdeClase(icono);
            }

            isla.Icono = uniCodeIcono;

            isla.Nueva = false;
            isla.Modificada = false;

            return isla;
        },
        ActualizacionVisual: async function (datos) {
            var respuesta = await fetch(`/Estructura/ObtenerTipoEstructuraPorId?id=${datos.IdEstructura}`);
            var data = await respuesta.json();

            const estructura = data.data;
            return estructura;
        },
        CerrarTransformer: function () {

            if (Lienzo.Transformer) {
                Lienzo.Transformer.nodes([]);
                Lienzo.Transformer.visible(false);
            }

            if (Lienzo.IslaAnterior) {
                Lienzo.IslaAnterior.Grupo.draggable(false);
            }

            Lienzo.IslaAnterior = null;
            layer.batchDraw();
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
                    p.Grafico.draggable(bloquear);
                    p.Grafico.listening(bloquear);
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

    //function Linea(puntoInicial, puntoFinal) {
    //    this.Tipo = enumTipoGrafico.Linea;
    //    this.Grafico = null;
    //    this.GraficoTexto = null;
    //    this.lstRelacionado = [];

    //    this.PuntoInicial = puntoInicial
    //    this.PuntoFinal = puntoFinal;

    //    this.Dibujar = function () {

    //        var cfgGraficoLinea = {
    //            points: [this.PuntoInicial.Posicion.x, this.PuntoInicial.Posicion.y, this.PuntoFinal.Posicion.x, this.PuntoFinal.Posicion.y],
    //            stroke: 'blue',
    //            strokeWidth: 4
    //        };

    //        const dx = this.PuntoFinal.Posicion.x - this.PuntoInicial.Posicion.x;
    //        const dy = this.PuntoFinal.Posicion.y - this.PuntoInicial.Posicion.y;
    //        const distanciaPixeles = Math.sqrt(dx * dx + dy * dy);
    //        const distanciaMetros = distanciaPixeles * Lienzo.Escala;

    //        var cfgGraficoTexto = {
    //            x: (this.PuntoInicial.Posicion.x + this.PuntoFinal.Posicion.x) / 2,
    //            y: (this.PuntoInicial.Posicion.y + this.PuntoFinal.Posicion.y) / 2,
    //            text: `${distanciaMetros.toFixed(2)}m`,
    //            fontSize: 16,
    //            fill: 'black',
    //            padding: 4,
    //            background: 'white'
    //        };

    //        if (this.Grafico == null) {
    //            this.Grafico = new Konva.Line(cfgGraficoLinea);
    //            this.GraficoTexto = new Konva.Text(cfgGraficoTexto);

    //            layer.add(this.Grafico);
    //            layer.add(this.GraficoTexto);
                
    //        } else {
    //        this.Grafico.setAttrs(cfgGraficoLinea);
    //        this.Grafico.getLayer().batchDraw();

    //        this.GraficoTexto.setAttrs(cfgGraficoTexto);
    //        this.GraficoTexto.getLayer().batchDraw();
    //        }
    //    }
    //}

    //function Punto() {
    //    this.Tipo = enumTipoGrafico.Punto;
    //    this.Grafico = null;
    //    this.lstRelacionado = [];
    //    this.Arrastrable = false;

    //    this.Posicion = { x: null, y: null };
    //    this.Orden = Punto.OrdenActual++;

    //    this.Dibujar = function () {

    //        var cfgGrafico = {
    //            x: this.Posicion.x,
    //            y: this.Posicion.y,
    //            radius: 7,
    //            fill: 'red',
    //            draggable: false
    //        };

    //        if (this.Grafico == null) {
    //            this.Grafico = new Konva.Circle(cfgGrafico);
    //            layer.add(this.Grafico);
    //        }
    //        else {
    //        this.Grafico.setAttrs(cfgGrafico);
    //        this.Grafico.getLayer().batchDraw();
    //        }

    //        this.lstRelacionado.forEach(function (item) {
    //            item.Dibujar();
    //        });
    //    }

    //    this.MoverArriba = function () {
    //        this.Grafico.moveToTop();
    //    }
    //}

    //function Isla() {
    //    this.Tipo = enumTipoGrafico.Rectangulo;
    //    this.Grafico = null;
    //    this.GraficoTexto = null;
    //    this.GraficoIcono = null;
    //    this.GraficoTrasnformer = null;
    //    this.lstIslas = [];

    //    this.Posicion = { x: null, y: null };
    //    this.Orientacion = null;
    //    this.Ancho = null;
    //    this.Alto = null;

    //    this.Id = null;
    //    this.Nombre = null;
    //    this.Descripcion = null;
    //    this.Estructura = null;
    //    this.Color = null;
    //    this.Icono = null;

    //    this.Nueva = null;
    //    this.Modificada = null;
        
    //    this.Eliminar = function () {
    //        this.Grafico?.destroy();
    //        this.GraficoIcono.destroy();
    //        this.GraficoTexto.destroy();
    //        Lienzo.Transformer?.destroy();

    //        var temp = [];
    //        temp.forEach(function (item) {
    //            item.Eliminar();
    //        });

    //        return this;
    //    };

    //    this.Actualizar = function () {
    //        if (!this.Grafico) {
    //            this.Dibujar();
    //            return;
    //        }

    //        this.Grafico.setAttrs({
    //            fill: this.Color ? `#${this.Color}` : "#88b7d5",
    //        });

    //        if (this.GraficoTexto) {
    //            this.GraficoTexto.text(this.Nombre);
    //        }

    //        if (this.GraficoIcono) {
    //            this.GraficoIcono.text(this.Icono);
    //            this.GraficoIcono.fontSize(TamanoIcono(this.Grafico));
    //        }

    //        this.Grafico.getLayer().batchDraw();

    //    }

    //    this.Dibujar = function () {
    //        var tamanoDefault = Lienzo.TamanoIsla();
    //        Lienzo.TamanoIsla();

    //        var cfgGrafico = {
    //            Id: this.Id,
    //            x: 0,
    //            y: 0,
    //            name: this.Nombre,
    //            text: this.Descripcion,
    //            width: this.Ancho, 
    //            height: this.Alto,
    //            fill: this.Color ? `#${this.Color}` : "#88b7d5",
    //            strokeWidth: 1.2,
    //            stroke: 'black',
    //            rotation: this.Orientacion,
    //            offsetX: this.Ancho / 2,
    //            offsetY: this.Alto / 2,
    //        };

    //        var cfgGraficoIcono = {
    //            text: this.Icono,
    //            align: 'center',
    //            verticalAlign: 'middle',
    //            fontFamily: 'FontAwesome',
    //            fill: 'white',
    //            rotation: this.Orientacion,
    //        };
            
    //        var cfgGraficoTexto = {
    //            text: this.Nombre,
    //            fontSize: 12,
    //            fill: 'black',
    //            rotation: this.Orientacion,
    //        };

    //        var cfgTransformer = {
    //            nodes: [],
    //            enabledAnchors: [
    //                'top-center',
    //                'top-right',
    //                'bottom-right',
    //                'bottom-center',
    //                'middle-right'
    //            ],
    //            rotateEnabled: true,
    //            flipEnabled: false,
    //            resizeEnabled: true,
    //            visible: false,
    //            rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
    //            rotateAnchorOffset: 30,
    //            strokeScaleEnabled: false,
    //            boundBoxFunc: (oldBox, newBox) => {
    //                if (newBox.width < tamanoDefault.ancho || newBox.height < tamanoDefault.alto) {
    //                    return oldBox;
    //                }

    //                return newBox;
    //            }
    //        };
            
    //        if (this.Grafico == null) {
    //            this.Grupo = new Konva.Group({
    //                x: this.Posicion.x,
    //                y: this.Posicion.y,
    //                draggable: false,
    //            });

    //            this.Grafico = new Konva.Rect(cfgGrafico);

    //            this.GraficoTexto = new Konva.Text(cfgGraficoTexto);
    //            var radio = this.Alto / 2 + this.GraficoTexto.height();
    //            var radianes = (90 + this.Orientacion) * Math.PI / 180;
    //            var xNombre = radio * Math.cos(radianes);
    //            var yNombre = radio * Math.sin(radianes);

    //            this.GraficoTexto.setAttrs({
    //                position: {
    //                    x: xNombre,
    //                    y: yNombre,
    //                },
    //            });
    //            this.GraficoTexto.offsetX(this.GraficoTexto.width() / 2);
    //            this.GraficoTexto.offsetY(this.GraficoTexto.height() / 2);

    //            this.GraficoIcono = new Konva.Text(cfgGraficoIcono);
    //            document.fonts.ready.then(() => {
    //                this.GraficoIcono.fontSize(TamanoIcono(this.Grafico));

    //                this.GraficoIcono.offsetX(this.GraficoIcono.width() / 2);
    //                this.GraficoIcono.offsetY(this.GraficoIcono.height() / 2);

    //                this.GraficoIcono.position({ x: 0, y: 0 });

    //                layer.batchDraw();
    //            });

    //            this.GraficoTrasnformer = new Konva.Transformer(cfgTransformer);
    //            Lienzo.Transformer = this.GraficoTrasnformer;

    //            this.Grupo.add(this.Grafico, this.GraficoIcono, this.GraficoTexto);

    //            layer.add(this.Grupo, Lienzo.Transformer);
    //            var isla = this;

    //            isla.Grafico.on('pointerclick', throttle((e) => {
    //                if (Lienzo.Estado === enumEstadoLienzo.Moviendo) {
    //                    Lienzo.Estado = enumEstadoLienzo.Editando;

    //                    if (Lienzo.IslaActual || Lienzo.Transformer) {
    //                        Lienzo.CerrarTransformer();
    //                    }
    //                    layer.batchDraw();
    //                }

    //                if (Lienzo.Estado === enumEstadoLienzo.Editando) {

    //                    if (Lienzo.IslaActual && Lienzo.IslaActual !== isla) {
    //                        Lienzo.IslaAnterior = Lienzo.IslaActual;
    //                    }

    //                    Lienzo.IslaActual = isla;

    //                    if (Lienzo.IslaAnterior) {
    //                        Lienzo.CerrarTransformer();
    //                    }
                        
    //                    Lienzo.Estado = enumEstadoLienzo.Moviendo;
    //                    window.recibirDatosAActualizar(Lienzo.IslaActual);

    //                    isla.Grafico.setAttrs({
    //                        fill: Lienzo.IslaActual.Color ?
    //                            `#${Lienzo.IslaActual.Color}` : "#88b7d5"
    //                    });
    //                }
    //            }, 300));

    //            isla.Grupo.on('dragend', function () {

    //                var absPos = isla.Grafico.getAbsolutePosition();
    //                var posFinal = Lienzo.TransformarAPosicionLocal(absPos);

    //                Lienzo.IslaActual = isla;
    //                isla.Posicion.x = posFinal.x;
    //                isla.Posicion.y = posFinal.y;
    //                isla.Ancho = isla.Grafico.width() * isla.Grafico.scaleX();
    //                isla.Alto = isla.Grafico.height() * isla.Grafico.scaleY();
    //                isla.Modificada = true;

    //                window.agregarIslasAGuardar(isla);
    //            });

    //            isla.Grafico.on('transform', function () {

    //                var rectIsla = this;
    //                var scaleX = rectIsla.scaleX();
    //                var scaleY = rectIsla.scaleY();
    //                var stage = rectIsla.getStage();
    //                var stageScale = stage.scaleX();
                    
    //                var rotacion = rectIsla.DameRotacion();

    //                const anchoReal = rectIsla.width() * scaleX;
    //                const altoReal = rectIsla.height() * scaleY;

    //                var absPos = rectIsla.getAbsolutePosition();

    //                rectIsla.setAttrs({
    //                    scaleX: 1,
    //                    scaleY: 1,
    //                    width: anchoReal,
    //                    height: altoReal,
    //                    offsetX: anchoReal / 2,
    //                    offsetY: altoReal / 2,
    //                });
                    
    //                rectIsla.absolutePosition(absPos);
    //                rectIsla.rotation(rotacion);

    //                var centro = rectIsla.DameCentroAbsoluto();
                    
    //                var radio = ((altoReal / 2) + isla.GraficoTexto.height()) * stageScale;
    //                var radianes = (90 + rotacion) * Math.PI / 180;

    //                var xNombre = centro.x + radio * Math.cos(radianes);
    //                var yNombre = centro.y + radio * Math.sin(radianes);

    //                isla.GraficoTexto.setAttrs({
    //                    absolutePosition: {
    //                        x: xNombre, 
    //                        y: yNombre,
    //                    },
    //                    offsetX: isla.GraficoTexto.width() / 2,
    //                    offsetY: isla.GraficoTexto.height() / 2,
    //                    rotation: rotacion,
    //                });

    //                isla.GraficoIcono.setAttrs({
    //                    fontSize: TamanoIcono(isla.Grafico),
    //                    absolutePosition: {
    //                        x: centro.x,
    //                        y: centro.y,
    //                    },
    //                    offsetX: isla.GraficoIcono.width() / 2,
    //                    offsetY: isla.GraficoIcono.height() / 2,
    //                    rotation: rotacion,
    //                });
                    
    //            });
                
    //            isla.Grafico.on('transformend', function () {

    //                var rectIsla = this;
    //                var scaleX = rectIsla.scaleX();
    //                var scaleY = rectIsla.scaleY();
    //                var rotacion = rectIsla.DameRotacion();

    //                const anchoReal = rectIsla.width() * scaleX;
    //                const altoReal = rectIsla.height() * scaleY;

    //                var absPos = rectIsla.getAbsolutePosition();
    //                var posFinal = Lienzo.TransformarAPosicionLocal(absPos);

    //                rectIsla.setAttrs({
    //                    scaleX: 1,
    //                    scaleY: 1,
    //                    width: anchoReal,
    //                    height: altoReal,
    //                    offsetX: anchoReal / 2,
    //                    offsetY: altoReal / 2,
    //                });

    //                rectIsla.absolutePosition(absPos);
    //                rectIsla.rotation(rotacion);

    //                isla.Posicion.x = posFinal.x;
    //                isla.Posicion.y = posFinal.y;
    //                isla.Orientacion = rotacion;
    //                isla.Ancho = Number(anchoReal.toFixed(4));
    //                isla.Alto = Number(altoReal.toFixed(4));
    //                isla.Modificada = true;

    //                window.agregarIslasAGuardar(isla);

    //            });
    //        }

    //        this.lstIslas.forEach(function (item) {
    //            item.Dibujar();
    //        })

    //        this.MoverArriba = function () {
    //            this.Grafico.moveToTop();
    //        }
    //    }
    //}

    //Punto.OrdenActual = 0;

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

    //Evento que permite el zoom al girar la rueda del raton
    stage.on('wheel', (e) => {
        e.evt.preventDefault();
        const escalaAnterior = stage.scaleX();
        const cursor = stage.getPointerPosition();

        const escalarPor = 1.05;
        const direccion = e.evt.deltaY > 0 ? 1 : -1;
        var nuevaEscala = direccion > 0 ? escalaAnterior / escalarPor : escalaAnterior * escalarPor;

        const escalaMinima = 0.2;
        const escalaMaxima = 10;

        nuevaEscala = Math.max(escalaMinima, Math.min(escalaMaxima, nuevaEscala));
        stage.scale({ x: nuevaEscala, y: nuevaEscala });

        const mousePointTo = {
            x: (cursor.x - stage.x()) / escalaAnterior,
            y: (cursor.y - stage.y()) / escalaAnterior
        };
        stage.position({
            x: cursor.x - mousePointTo.x * nuevaEscala,
            y: cursor.y - mousePointTo.y * nuevaEscala
        });

        Lienzo.AjustarEscalaVisual();

        stage.batchDraw();
    });

    stage.on('pointerdown touchstart', function (e) {

        var esStage = e.target === stage;
        var esNodo = e.target instanceof Konva.Node && e.target !== stage
        var boton = e.evt.button;
        //var esTouch = e.type.startsWith("touch");

        if (esStage) {
            if (Lienzo.Transformer) {
                Lienzo.CerrarTransformer(Lienzo.Transformer, Lienzo.IslaActual);
            }
            layer.draw();
        }

        //if (!esTouch) {
        //    if (e.evt.crtlKey) {
        //        Lienzo.HabilitarArrastrable(true);
        //        return;
        //    }
        //}

        //if (esTouch && e.evt.touches.length === 2) {
        //    Lienzo.HabilitarArrastrable(true);
        //    return;
        //}

        if (boton === enumBotton.Arrastre) {
            Lienzo.HabilitarArrastrable(true);
        } else if (Lienzo.Estado === enumEstadoLienzo.Agregando && boton === enumBotton.Click) {

            const posicion = Lienzo.DamePosicion();
            var nuevaIsla = Lienzo.CrearIslaTemporal(posicion.x, posicion.y, datosIsla);

            Lienzo.IslaActual = nuevaIsla;
            Lienzo.Estado = enumEstadoLienzo.Moviendo;
        }

    });

    stage.on('pointerup touchend', function (e) {

        let esTouch = e.type.startsWith("touch");
        const boton = e.evt.button;

        if (Lienzo.Modo === enumModoLienzo.Isla) {
            if (boton === 2) {
                Lienzo.HabilitarArrastrable(false);
            }
        }

        if (esTouch && e.evt.touches.length < 2) {
            Lienzo.HabilitarArrastrable(false);
        }

    });

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
                Lienzo.IslaActual = Lienzo.AgregarIsla(i.X, i.Y, i.Ancho, i.Alto, i.Nombre, i.Color, i.Icono, i.Orientacion, i.TipoEstructuraId);
                Lienzo.IslaActual.Id = i.Id;
                Lienzo.IslaActual.Dibujar();
            });

            Lienzo.IslaActual = null;
            Lienzo.Estado = enumEstadoLienzo.Editando;
            Lienzo.BloquearArea(false);
        });
    }

    window.agregarEstructura = function (descripcion, idEnu, color, icono) {

        var payload = {
            Descripcion: descripcion,
            DetalleTipoEstructura: { Id: idEnu },
            Color: color,
            Icono: icono,
        }
        var url = '/Estructura/GuardarTipoEstructura';

        $.ajax({
            method: 'POST',
            url: url,
            data: JSON.stringify(payload),
            contentType: 'application/json; charset=utf-8',
            success: function (res) {
                if (res.ok) {
                    Notify('Tipo de estructura guardada con exito', null, null, 'success');
                } else {
                    bootbox.alert('Error al guardar el tipo de estructura');
                }
            }
        });
    }

    window.crearZona = async function (datos) {
        Lienzo.Estado = enumEstadoLienzo.Agregando;
        datosIsla = datos;
        Notify("Da click para crear una zona", null, null, "success");
    }

    window.editarZona = async function (datos) {
        
        if (datos) {
            Lienzo.IslaActual.Nombre = datos.Nombre;
            Lienzo.IslaActual.Estructura = datos.IdEstructura;
            Lienzo.IslaActual.Observaciones = datos.Observaciones;

            var actualizar = await Lienzo.ActualizacionVisual(datos);

            Lienzo.IslaActual.Color = actualizar.Color;
            Lienzo.IslaActual.Icono = ObtenerUnicodeDesdeClase(actualizar.Icono);

            Lienzo.IslaActual.Actualizar();
        }

        Lienzo.IslaActual.Modificada = true;
        Lienzo.Transformer.nodes([Lienzo.IslaActual.Grafico]);
        Lienzo.Transformer.visible(true);
        Lienzo.IslaActual.Grupo.draggable(true);
        layer.batchDraw();

        Notify("Los datos seran actualizados", null, null, "success");
    }

    window.borrarZona = async function (datos) {
        Lienzo.IslaActual = datos;
        Lienzo.IslaActual.Eliminar();

        $.ajax({
            url: '/Isla/BorrarIsla',
            method: 'POST',
            data: JSON.stringify(Lienzo.IslaActual),
            contentType: 'application/json; charset=utf-8',
            success: function (res) {
                if (res.ok) {
                    Notify(`La zona ha sido eliminada`, null, null, `danger`);
                } else {
                    bootbox.alert(`Ha ocurrido un error al intentar eliminar la zona`);
                }
            }
        });
    }

    window.agregarIslasAGuardar = function (isla) {
        var registrada = listaIslasGuardar.some(x =>
            (isla.Id > 0 && x.Id === isla.Id) || (isla.Id === null && x === isla)
        );

        if (!registrada) listaIslasGuardar.push(isla);
    }

    window.actualizarDatosIsla = function (datos) {
        var isla = Lienzo.IslaActual;
        datosIsla = datos;
        isla.Modificada = true;
        window.agregarIslasAGuardar(isla);
    }

    window.guardarTodoAsync = async function () {
        
        var aEnviar = listaIslasGuardar
            .filter(x => x.Nueva || x.Modificada)
            .map(x => ({
                Id: x.Id ?? 0,
                Nombre: x.Nombre,
                X: x.Posicion.x,
                Y: x.Posicion.y,
                Orientacion: x.Orientacion,
                Ancho: x.Ancho,
                Alto: x.Alto,
                Observaciones: x.Observaciones,
                Area: { Id: idAreaSeleccionada },
                Estructura: { Id: x.Estructura },
            }));

        return new Promise((resolve, reject) => {
            console.log("ENVIANDO:", JSON.stringify(aEnviar, null, 2));

            $.ajax({
                url: '/Isla/GuardarMultiplesIslas',
                method: 'POST',
                data: JSON.stringify(aEnviar),
                contentType: 'application/json; charset=utf-8',
                success: function (res) {
                    if (res.ok) {
                        Notify("Cambios realizados", null, null, "success");
                        listaIslasGuardar = [];
                        Lienzo.lstIslas.forEach(i => {
                            i.Nueva = false;
                            i.Modificada = false;
                        });
                        resolve(res);
                    } else {
                        bootbox.alert("Ha ocurrido un error");
                        reject(res);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    reject(errorThrown);
                }
            })
        });
    }
}