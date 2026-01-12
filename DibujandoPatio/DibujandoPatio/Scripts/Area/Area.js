
var stage;
var layer;
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

    //Lienzo = {
    //    Modo: enumModoLienzo.Area,
    //    Escala: DameEscala(),
    //    Estado: null,
    //    lstPunto: [],
    //    PuntoActual: null,
    //    DamePosicion: function () {
    //        const transform = this.Stage.getAbsoluteTransform().copy();
    //        transform.invert();
    //        const posicion = transform.point(this.Stage.getPointerPosition());
    //        posicion.x = posicion.x.toFixed(6) * 1;
    //        posicion.y = posicion.y.toFixed(6) * 1;
    //        return posicion;
    //    },
    //    RestaurarTamano: function () {
    //        this.Stage.scale({ x: 1, y: 1 });
    //        this.Stage.position({ x: 0, y: 0 });
    //        Lienzo.AjustarEscalaVisual();
    //        this.Stage.batchDraw();
    //    },
    //    AjustarEscalaVisual: function () {
    //        var escala = stage.scaleX();
    //        var div = 1 / escala;
    //        Lienzo.lstPunto.forEach(p => {
    //            if (p.Grafico) {
    //                p.Grafico.radius(7 * div);
    //            }

    //            p.lstRelacionado.forEach(item => {
    //                item.Grafico.strokeWidth(4 * div);

    //                if (item.GraficoTexto) {
    //                    item.GraficoTexto.fontSize(16 * div);
    //                }
    //            });
    //        });
    //    },
    //    Cerrar: function () {
    //        if (this.PuntoActual != null)
    //            this.PuntoActual.Eliminar(Lienzo);

    //        var puntoInicial = this.lstPunto[0];
    //        var puntoFinal = this.lstPunto[this.lstPunto.length - 1];

    //        this.RelacionarPuntos(puntoInicial, puntoFinal);

    //        puntoInicial.Dibujar();
    //        puntoFinal.Dibujar();

    //        this.Modo = enumModoLienzo.Area;
    //        this.Estado = enumEstadoLienzo.Editando;
    //        this.AjustarOrden();
    //    },
    //    RelacionarPuntos: function (punto1, punto2) {
    //        var linea = new Linea(punto1, punto2);
    //        punto1.lstRelacionado.push(linea);
    //        punto2.lstRelacionado.push(linea);

    //        linea.lstRelacionado.push(punto1);
    //        linea.lstRelacionado.push(punto2);
    //    },
    //    AgregarPunto: function (x, y) {
    //        var punto = new Punto();
    //        punto.Posicion.x = x;
    //        punto.Posicion.y = y;
    //        punto.Tipo = enumTipoGrafico.Punto;
    //        punto.Grafico = null;
    //        punto.lstRelacionado = [];
    //        punto.Arrastrable = false;
    //        punto.Orden = Punto.OrdenActual++;

    //        this.lstPunto.push(punto);

    //        if (this.PuntoActual != null) {
    //            this.RelacionarPuntos(this.PuntoActual, punto);
    //        }
    //        punto.Dibujar(Lienzo, /*throttle,*/ layer, enumModoLienzo, enumEstadoLienzo);

    //        this.AjustarOrden();

    //        return punto;
    //    },
    //    AjustarOrden: function () {
    //        this.lstPunto.toReversed().forEach(item => {
    //            item.MoverArriba();
    //        });
    //    },
    //    AgregarIsla: function (x, y, ancho, alto, nombre, color, icono, orientacion) {

    //        var isla = new Isla();
    //        isla.Posicion.x = x;
    //        isla.Posicion.y = y;
    //        isla.Ancho = ancho;
    //        isla.Alto = alto;
    //        isla.Orientacion = orientacion;
    //        isla.Nombre = nombre;
    //        isla.Color = color;

    //        var uniCodeIcono;
    //        if (icono && icono.trim() !== "") {
    //            uniCodeIcono = ObtenerUnicodeDesdeClase(icono);
    //        }

    //        isla.Icono = uniCodeIcono;

    //        return isla;
    //    },
    //    TamanoIsla: function () {
    //        const escala = Lienzo.Escala;
    //        const anchoBahia = 6.06 / escala;
    //        const altoBahia = 2.44 / escala;

    //        var ancho = 2 * anchoBahia;
    //        var alto = altoBahia;

    //        return { ancho, alto };
    //    },
    //    AjustarTamanosIsla: function (isla) {
    //        const pasoHorizontal = 6.06;
    //        const pasoVertical = 2.44;

    //        const escala = Lienzo.Escala;

    //        let anchoMetros = Math.round((isla.width() * isla.scaleX() * escala) / pasoHorizontal) * pasoHorizontal;
    //        let altoMetros = Math.round((isla.height() * isla.scaleY() * escala) / pasoVertical) * pasoVertical;

    //        isla.width(anchoMetros / escala);
    //        isla.height(altoMetros / escala);

    //        isla.scaleX(1);
    //        isla.scaleY(1);
    //    },
    //    HabilitarArrastrable: function (habilitar) {
    //        if (habilitar) {
    //            this.Stage.draggable(true);
    //            this.Stage.startDrag();
    //            this._contextualMenuHandler = (e) => e.preventDefault();
    //            this.Stage.container().addEventListener('contextmenu', this._contextualMenuHandler);
    //        } else {
    //            this.Stage.draggable(false);
    //            //if (this._contextualMenuHandler) {
    //            //this.Stage.container().removeEventListener('contextmenu', this._contextualMenuHandler);
    //            //this._contextualMenuHandler = null;
    //            //}
    //        }
    //    },
    //    BloquearArea: function (bloquear) {
    //        this.lstPunto.forEach(p => {
    //            if (p.Grafico) {
    //                p.Grafico.draggable(!bloquear);
    //                p.Grafico.listening(!bloquear);
    //            }
    //        });
    //    },
    //    PantallaCompleta: function () {

    //        if (!document.fullscreenElement) {
    //            this.anchoOriginal = this.Stage.width();
    //            this.altoOriginal = this.Stage.height();

    //            document.body.requestFullscreen().then(() => {
    //                container.style.backgroundColor = "white";
    //                this.Stage.width(window.innerWidth);
    //                this.Stage.height(window.innerHeight);
    //                this.Stage.draw();
    //            }).catch(err => console.log("Error", err));
    //        } else {
    //            document.exitFullscreen().then(() => {
    //                this.Stage.width(this.anchoOriginal);
    //                this.Stage.height(this.altoOriginal);
    //                this.Stage.draw();
    //            }).catch(err => console.log("Error", err));
    //        }
    //    },
    //};

    var enumTipoGrafico = {
        Linea: 'Linea',
        Punto: 'Punto',
        Rectangulo: 'Rectangulo', 
    };

    const LienzoArea = new Lienzo({
        Stage: stage,
        Layer: layer,
        Modo: enumModoLienzo.Area,
        Escala: DameEscala(),
        Tipo: enumTipoGrafico,
        Estado: enumEstadoLienzo,
        lstPunto: [],
        PuntoActual: null,
        IslaActual: null,
    });

    //function Linea(puntoInicial, puntoFinal) {
    //    this.Tipo = enumTipoGrafico.Linea;
    //    this.Grafico = null;
    //    this.GraficoTexto = null;
    //    this.lstRelacionado = [];

    //    this.PuntoInicial = puntoInicial
    //    this.PuntoFinal = puntoFinal;

    //    this.Eliminar = function () {
    //        this.Grafico?.destroy();
    //        this.GraficoTexto?.destroy();
    //        this.lstRelacionado.forEach(item => {
    //            item.lstRelacionado.RemoveAll(c => c == this);
    //        });
    //    }

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
    //            var linea = this;
    //            this.Grafico.on('pointerdblclick', (e) => {
    //                if (Lienzo.Modo !== enumModoLienzo.Area || Lienzo.Estado !== enumEstadoLienzo.Editando) {
    //                    return;
    //                }

    //                const pos = Lienzo.DamePosicion();
    //                window.agregarPunto(linea, pos);
    //            });
    //        } else {
    //            this.Grafico.setAttrs(cfgGraficoLinea);
    //            this.Grafico.getLayer().batchDraw();

    //            this.GraficoTexto.setAttrs(cfgGraficoTexto);
    //            this.GraficoTexto.getLayer().batchDraw();
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

    //    this.Eliminar = function () {
    //        this.Grafico.destroy();
    //        Lienzo.lstPunto.RemoveAll(c => c == this);
    //        if (Lienzo.PuntoActual == this)
    //            Lienzo.PuntoActual = null;

    //        var temp = [];
    //        temp.AddRange(this.lstRelacionado);

    //        temp.forEach(function (item) {
    //            item.Eliminar();
    //        });

    //        return this;
    //    }

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

    //            this.Grafico.on('pointerdown', throttle((e) => {

    //                if (Lienzo.Modo === enumModoLienzo.Area) {
    //                    if (Lienzo.Estado === enumEstadoLienzo.Editando) {
    //                        Lienzo.Estado = enumEstadoLienzo.Moviendo;
    //                        Lienzo.PuntoActual = this;
    //                    } else if (Lienzo.Estado === enumEstadoLienzo.Moviendo) {
    //                        Lienzo.Estado = enumEstadoLienzo.Editando;
    //                        Lienzo.PuntoActual = null;
    //                    } else if (Lienzo.Estado === enumEstadoLienzo.Agregando && Lienzo.lstPunto.length >= 3 && Lienzo.lstPunto[0] === this) {
    //                        Lienzo.Cerrar();
    //                    }
    //                }
    //            }, 300));
    //            this.Grafico.on('pointerdblclick', (e) => {
    //                if (Lienzo.Modo === enumModoLienzo.Isla) return;
    //                if (Lienzo.Modo === enumModoLienzo.Area) {
    //                    if (Lienzo.Estado === enumEstadoLienzo.Editando) {
    //                        window.confirmarEliminarPunto(this);
    //                    }
    //                }
    //            });
    //        }
    //        else {
    //            this.Grafico.setAttrs(cfgGrafico);
    //            this.Grafico.getLayer().batchDraw();
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
    //    this.Color = null;
    //    this.Icono = null;

    //    this.Dibujar = function () {
    //        var tamanoDefault = Lienzo.TamanoIsla();

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

    //        var cfgGrupo = {
    //            x: this.Posicion.x,
    //            y: this.Posicion.y,
    //            draggable: false,
    //        };

    //        if (this.Grafico == null) {
    //            this.Grupo = new Konva.Group(cfgGrupo);

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

    //            this.Grupo.add(this.Grafico, this.GraficoIcono, this.GraficoTexto);

    //            layer.add(this.Grupo);
    //        }
    //        //else {
    //        //    this.Grafico.setAttrs(cfgGrafico);
    //        //    this.Grafico.absolutePosition({ x: cfgGrafico.x, y: cfgGrafico.y });
    //        //    this.Grafico.getLayer().batchDraw();

    //        //    this.GraficoTexto.setAttrs(cfgGraficoTexto);
    //        //    this.GraficoTexto.absolutePosition({ x: cfgGraficoTexto.x, y: cfgGraficoTexto.y });
    //        //    this.GraficoTexto.getLayer().batchDraw();

    //        //    this.GraficoIcono.setAttrs(cfgGraficoIcono);
    //        //    this.GraficoIcono.absolutePosition({ x: cfgGraficoIcono.x, y: cfgGraficoIcono.y });
    //        //    this.GraficoIcono.getLayer().batchDraw();
    //        //}

    //        this.lstIslas.forEach(function (item) {
    //            item.Dibujar();
    //        })

    //        this.MoverArriba = function () {
    //            this.Grafico.moveToTop();
    //        }
    //    }
    //}

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

    //function TamanoIcono(rectangulo) {
    //    var tamIcono;

    //    var promedio = (rectangulo.width() + rectangulo.height()) / 2;

    //    if (!tamIcono || tamIcono <= 0 || isNaN(tamIcono)) {
    //        tamIcono = 20;
    //    }

    //    tamIcono = promedio * 0.4;

    //    if (!tamIcono || tamIcono <= 0 || isNaN(tamIcono)) {
    //        tamIcono = 20;
    //    }
    //    return tamIcono
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

    //Lienzo.Stage = stage;

    //Instanciar las capas en el escenario
    layer = new Konva.Layer();
    stage.add(layer);

    LienzoArea.Layer = layer;
    LienzoArea.Stage = stage;

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

        LienzoArea.AjustarEscalaVisual();

        stage.batchDraw();
    });

    //Evento que permite dibujar si se da clic
    stage.on('pointerdown touchstart', function (e) {
        const boton = e.evt.button;
        let esTouch = e.type.startsWith("touch");

        if (!esTouch) {
            if (e.evt.ctrlKey) {
                LienzoArea.HabilitarArrastrable(true);
                return;
            }
        }

        if (esTouch && e.evt.touches.length === 2) {
            LienzoArea.HabilitarArrastrable(true);
            return;
        }

        if (LienzoArea.Modo === enumModoLienzo.Area) {
            switch (boton) {
                case enumBotton.ClickDerecho: {
                    LienzoArea.HabilitarArrastrable(true);
                    break;
                }
                case enumBotton.ClickIzquierdo: {
                    if (LienzoArea.Estado === enumEstadoLienzo.Agregando) {
                        const posicion = LienzoArea.DamePosicion();

                        LienzoArea.PuntoActual = LienzoArea.AgregarPunto(posicion.x, posicion.y);
                        if (LienzoArea.lstPunto.length == 0)
                            LienzoArea.PuntoActual = LienzoArea.AgregarPunto(posicion.x, posicion.y);
                    }
                    break;
                }
            }
        }
    });

    //Acciones que se realizan al arrastrar el mouse
    stage.on('pointermove', function (e) {
        if (LienzoArea.Modo === enumModoLienzo.Area) {
            
            if ([enumEstadoLienzo.Agregando, enumEstadoLienzo.Editando, enumEstadoLienzo.Moviendo].includes(LienzoArea.Estado)) {

                if (LienzoArea.PuntoActual != null) {
                    const pos = LienzoArea.DamePosicion();

                    LienzoArea.PuntoActual.Posicion.x = pos.x;
                    LienzoArea.PuntoActual.Posicion.y = pos.y;
                    LienzoArea.PuntoActual.Dibujar(LienzoArea, LienzoArea.Layer, enumModoLienzo, enumEstadoLienzo);
                }
                LienzoArea.AjustarEscalaVisual();
            }
        }
    });

    //Acciones que se realizan al dejar de hacer un clic sostenido
    stage.on('pointerup touchend', function (e) {

        let esTouch = e.type.startsWith("touch");
        const boton = e.evt.button;

        if (LienzoArea.Modo === enumModoLienzo.Area) {
            if (boton === 2) {
                LienzoArea.HabilitarArrastrable(false);
            }
        }

        if (esTouch && e.evt.touches.length < 2) {
            LienzoArea.HabilitarArrastrable(false);
        }
    });

    $('#cerrarSidebar').on('click', function () {
        $('#sidebar').removeClass("active");
    });

    window.iniciarDibujo = function () {
        layer.destroyChildren();
        layer.draw();
        LienzoArea.lstPunto = [];
        LienzoArea.PuntoActual = null;

        //Punto.OrdenActual = 0;

        LienzoArea.Modo = enumModoLienzo.Area;
        LienzoArea.Estado = enumEstadoLienzo.Agregando;
    }

    window.seleccionarArea = function (id) {

        idAreaSeleccionada = id;
        if (!id) return;

        layer.destroyChildren();
        LienzoArea.lstPunto = [];
        LienzoArea.PuntoActual = null;
        LienzoArea.IslaActual = null;

        $.getJSON('/Area/ObtenerAreaPorId', { id: id }, function (res) {
            if (!res.ok || !res.data) return;

            var area = res.data;
            area.Vertices = area.Vertices.OrderBy(c => c.Orden).ToArray();
            area.Vertices.forEach(v => {
                LienzoArea.PuntoActual = LienzoArea.AgregarPunto(v.X, v.Y);
                LienzoArea.PuntoActual.Id = v.Id;
                LienzoArea.PuntoActual.Dibujar(LienzoArea, LienzoArea.Layer, enumModoLienzo, enumEstadoLienzo);
            });

            LienzoArea.PuntoActual = null;
            LienzoArea.Cerrar();
            LienzoArea.Modo = enumModoLienzo.Area;
            LienzoArea.Estado = enumEstadoLienzo.Editando;
            LienzoArea.BloquearArea(false);

        });

        //$.getJSON('/Area/ObtenerIslasPorAreaId', { id: id }, function (res) {
        //    var area = res.data;
        //    area.Islas.forEach(i => {
        //        Lienzo.IslaActual = Lienzo.AgregarIsla(i.X, i.Y, i.Ancho, i.Alto, i.Nombre, i.Color, i.Icono, i.Orientacion);
        //        Lienzo.IslaActual.Id = i.Id;
        //        Lienzo.IslaActual.Dibujar();
        //    });

        //    Lienzo.IslaActual = null;
        //    Lienzo.Estado = enumEstadoLienzo.Editando;
        //    Lienzo.BloquearArea(false);
        //});
    }

    window.agregarZona = function () {
        window.location.href = objSer.Url.Area.DibujarIsla.replace('__id__', idAreaSeleccionada);
    }

    window.editarArea = async function (area) {
        area.Vertices = LienzoArea.lstPunto.map(p => ({
            Id: p.Id,
            X: p.Posicion.x,
            Y: p.Posicion.y,
            Orden: p.Orden,
            Activo: p.Activo
        }));

        $.ajax({
            url: '/Area/EditarArea',
            method: 'POST',
            data: JSON.stringify(area),
            contentType: 'application/json; charset=utf-8',
            success: function (res) {
                if (res.ok) {
                    Notify(`Editado correctamente`, null, null, "success");
                    dibujando = false;
                } else {
                    bootbox.alert("Ha ocurrido un problema");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                reject(errorThrown);
            }
        });

    }

    window.eliminarArea = async function (area) {
        
        layer.destroyChildren();
        LienzoArea.lstPunto = [];
        LienzoArea.PuntoActual = null;
        LienzoArea.IslaActual = null;

        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/Area/BorrarArea',
                method: 'POST',
                data: JSON.stringify(area),
                contentType: 'application/json; charset=utf-8',
                success: function (res) {
                    if (res.ok) {
                        window.location.href = objSer.Url.Area.DibujarLimite;
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

    window.eliminarPuntos = async function (Punto) {
        var lstpunto = [];
        console.log(Punto);
        Punto.lstRelacionado.forEach(linea => {
            linea.lstRelacionado.forEach(punto => {
                if (punto !== Punto) {
                    lstpunto.push(punto);
                }
            });
        });

        var punto1 = lstpunto[0];
        var punto2 = lstpunto[1];

        Punto.Eliminar(LienzoArea);

        LienzoArea.RelacionarPuntos(punto1, punto2);

        punto1.Dibujar();

        LienzoArea.lstPunto.forEach(item => {
            if (item.Orden > Punto.Orden && item != Punto) {
                item.Orden--;
                item.MoverArriba();
            }
        });
        LienzoArea.AjustarEscalaVisual();
    }

    window.agregarPuntos = async function (linea, pos) {
        var Orden = linea.lstRelacionado.Min(c => c.Orden);

        linea.Eliminar();
        var punto = LienzoArea.AgregarPunto(pos.x, pos.y);

        var insercionAlInicio =
            linea.lstRelacionado.some(p => p.Orden === 0) &&
            linea.lstRelacionado.some(p => p.Orden === 1);

        if (insercionAlInicio) {
            punto.Orden = 1;
            LienzoArea.lstPunto
                .filter(p => p !== punto && p.Orden >= 1)
                .forEach(p => p.Orden++);

            linea.lstRelacionado.forEach(item => {
                LienzoArea.RelacionarPuntos(item, punto);
            });
        } else {

            linea.lstRelacionado.forEach(item => {
                LienzoArea.RelacionarPuntos(item, punto);
            });

            Orden = linea.lstRelacionado.Min(c => c.Orden);
            if (Orden == 0)
                Orden = linea.lstRelacionado.Max(c => c.Orden);
            punto.Orden = Orden + 1;

            LienzoArea.lstPunto.Where(c => c.Orden > Orden && c != punto).forEach(item => {
                item.Orden++;
            });
        }

        punto.Dibujar(LienzoArea, layer, enumModoLienzo, enumEstadoLienzo);
        LienzoArea.AjustarOrden();
        LienzoArea.AjustarEscalaVisual();
        LienzoArea.PuntoActual = punto;
        LienzoArea.Estado = enumEstadoLienzo.Moviendo;
    }

    window.guardarAsync = function (area) {
        LienzoArea.Cerrar();
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

    window.agregarEnu = function (Descripcion) {
        var obj = {
            Descripcion: Descripcion,
        };

        $.ajax({
            url: '/DetallesEnu/GuardarDetalleEnu',
            method: 'POST',
            data: JSON.stringify(obj),
            contentType: 'application/json; charset=UTF-8',
            success: function (res) {
                if (res.ok) {
                    Notify(`Guardado correctamente`, null, null, "success");
                    dibujando = false;
                } else {
                    bootbox.alert("Ha ocurrido un problema");
                }
            }
        });
    };

}
