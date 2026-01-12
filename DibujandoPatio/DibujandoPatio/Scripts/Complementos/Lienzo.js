
class Lienzo {

    constructor(config = {}) {
        this.Modo = config.Modo;
        this.Escala = config.Escala;
        this.Tipo = config.Tipo
        this.Estado = null;
        this.lstPunto = [];
        this.PuntoActual = null;
        this.IslaActual = null;
        this.Stage = config.Stage;
        this.Layer = config.Layer;
        this.throttle = this.throttle();
    }

    DamePosicion() {
        var transform = this.Stage.getAbsoluteTransform().copy();
        transform.invert();
        var posicion = transform.point(this.Stage.getPointerPosition());
        posicion.x = posicion.x.toFixed(6) * 1;
        posicion.y = posicion.y.toFixed(6) * 1;
        return posicion;
    }

    RestaurarTamano() {
        this.Stage.scale({ x: 1, y: 1 });
        this.Stage.position({ x: 0, y: 0 });
        this.AjustarEscalaVisual();
        this.Stage.batchDraw();
    }

    AjustarEscalaVisual() {
        var escala = this.Stage.scaleX();
        var div = 1 / escala;
        this.lstPunto.forEach(p => {
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
    }

    Cerrar() {
        if (this.PuntoActual != null)
            this.PuntoActual.Eliminar(this);

        var puntoInicial = this.lstPunto[0];
        var puntoFinal = this.lstPunto[this.lstPunto.length - 1];

        this.RelacionarPuntos(puntoInicial, puntoFinal);

        puntoInicial.Dibujar();
        puntoFinal.Dibujar();

        this.Modo = enumModoLienzo.Area;
        this.Estado = enumEstadoLienzo.Editando;
        this.AjustarOrden();
    }

    RelacionarPuntos(punto1, punto2) {
        var linea = new Linea(punto1, punto2, this);
        punto1.lstRelacionado.push(linea);
        punto2.lstRelacionado.push(linea);

        linea.lstRelacionado.push(punto1);
        linea.lstRelacionado.push(punto2);
    }

    AgregarPunto(x, y) {
        var punto = new Punto();
        punto.Posicion.x = x;
        punto.Posicion.y = y;
        punto.Tipo = this.Tipo.Punto;
        punto.Grafico = null;
        punto.lstRelacionado = [];
        punto.Arrastrable = false;
        punto.Orden = Punto.OrdenActual++;

        this.lstPunto.push(punto);

        if (this.PuntoActual != null) {
            this.RelacionarPuntos(this.PuntoActual, punto);
        }

        punto.Dibujar(this, this.Layer, this.Modo, this.Estado);

        this.AjustarOrden();

        return punto;
    }

    AjustarOrden() {
        this.lstPunto.toReversed().forEach(item => {
            item.MoverArriba();
        });
    }

    AgregarIsla(x, y, ancho, alto, nombre, color, icono, orientacion) {
        var isla = new IslaRect();
        isla.Posicion.x = x;
        isla.Posicion.y = y;
        isla.Ancho = ancho;
        isla.Alto = alto;
        isla.Orientacion = orientacion;
        isla.Nombre = nombre;
        isla.Color = color;
        isla.Lienzo = this;

        var uniCodeIcono;
        if (icono && icono.trim() !== "") {
            uniCodeIcono = this.ObtenerUnicodeDesdeClase(icono);
        }

        isla.Icono = uniCodeIcono;

        return isla;
    }

    AjustarTamanosIsla(isla) {
        const pasoHorizontal = 6.06;
        const pasoVertical = 2.44;

        const escala = Lienzo.Escala;

        let anchoMetros = Math.round((isla.width() * isla.scaleX() * escala) / pasoHorizontal) * pasoHorizontal;
        let altoMetros = Math.round((isla.height() * isla.scaleY() * escala) / pasoVertical) * pasoVertical;

        isla.width(anchoMetros / escala);
        isla.height(altoMetros / escala);

        isla.scaleX(1);
        isla.scaleY(1);
    }

    AjustarIconoIsla(isla) {
        var tamIcono;

        var promedio = (isla.width() + isla.height()) / 2;

        tamIcono = promedio * 0.4;


        if (!tamIcono || tamIcono <= 0 || isNaN(tamIcono)) {
            tamIcono = 20;
        }

        return tamIcono
    }

    TamanoIsla() {
        const escala = Lienzo.Escala;
        const anchoBahia = 6.06 / escala;
        const altoBahia = 2.44 / escala;

        var ancho = 2 * anchoBahia;
        var alto = altoBahia;

        return { ancho, alto };
    }

    HabilitarArrastrable(habilitar) {
        if (habilitar) {
            this.Stage.draggable(true);
            this.Stage.startDrag();
            this._contextualMenuHandler = (e) => e.preventDefault();
            this.Stage.container().addEventListener('contexmenu', this._contextualMenuHandler);
        } else {
            this.Stage.draggable(false);
            //if (this._contextualMenuHandler) {
            //this.Stage.container().removeEventListener('contextmenu', this._contextualMenuHandler);
            //this._contextualMenuHandler = null;
            //}
        }
    }

    BloquearArea(bloquear) {
        this.lstPunto.forEach(p => {
            if (p.Grafico) {
                p.Grafico.draggable(!bloquear);
                p.Grafico.listening(!bloquear);
            }
        });
    }

    PantallaCompleta() {
        if (!document.fullscreenElement) {
            this.anchoOriginal = this.Stage.width();
            this.altoOriginal = this.Stage.height();

            document.body.requestFullscreen().then(() => {
                container.style.backgroundColor = "white";
                this.Stage.width(window.innerWidth);
                this.Stage.height(window.innerHeight);
                this.Stage.draw();
            }).catch(err => console.log("Error", err));
        } else {
            document.exitFullscreen().then(() => {
                this.Stage.width(this.anchoOriginal);
                this.Stage.height(this.altoOriginal);
                this.Stage.draw();
            }).catch(err => console.log("Error", err));
        }
    }

    ObtenerUnicodeDesdeClase(iconClass) {

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

    throttle(func, limit) {
        var inThrottle = false;
        return function (...args) {
            if (!inThrottle) {
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
                func.apply(this, args);
            }
        }
    }
}

    