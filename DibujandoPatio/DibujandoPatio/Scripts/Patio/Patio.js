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

        vuePatio.areas = res.data;

        vuePatio.$nextTick(() => {  
            requestAnimationFrame(() => {
                vuePatio.areas.forEach(a => {
                    generarPreview(a, `preview-${a.Id}`);
                });
            });
        });
    });
}

async function generarPreview(area, containerId) {

    const cont = document.getElementById(containerId);
    
    cont.innerHTML = "";

    previewStage = new Konva.Stage({
        container: containerId,
        width: cont.offsetWidth,
        height: cont.offsetHeight,
    });

    previewLayer = new Konva.Layer();
    previewStage.add(previewLayer);

    const lienzoPreview = CrearLienzo(previewStage, previewLayer);
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

window.nuevaArea = function () {
    window.location.href = objSer.Url.Area.DibujarLimite.replace('__id__', idAreaSeleccionada);
}
