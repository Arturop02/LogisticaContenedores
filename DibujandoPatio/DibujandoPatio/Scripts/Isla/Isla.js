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

    function BuscarIconos(filtro, pagina = 1, tamPagina = 12) {
        $.get('/Isla/DameListaIconos', { busqueda: filtro, pagina, tamPagina }, function (res) {
            if (!res || !res.ok) return;

            const container = $('#iconosContainer').empty();
            res.data.forEach(icono => {
                container.append(`
                    <button type="button" class="btn btn-outline-secondary" data-icono="${icono}" title="${icono}">
                    <i class="fa ${icono}" value="fa ${icono}"></i>
                    </button>`
                );
            });
            const paginador = $('#paginador').empty();
            for (let i = 1; i < res.totalPaginas; i++) {
                const btn = $(`<button class="btn btn-sm ${i === res.paginaActual ? 'btn-primary' : 'btn-light'}">${i}</button>`);
                btn.on('click', () => BuscarIconos(filtro, i, tamPagina));
                paginador.append(btn);
            }

            container.off('click').on('click', 'button', function () {
                const icono = $(this).data('icono');
                $('#iconoSeleccionado').val(icono);

                container.find('button').removeClass('active btn-success');
                $(this).addClass('active btn-success');
            });
        });
    }

    function TransformarGrupoIsla(nodo, texto, icono) {
        var grupo = nodo.getParent();
        var nodoRect = grupo.findOne('Rect');

        if (!nodoRect) nodoRect = nodo.findOne('Rect');

        let altoRect = nodoRect.height();
        var rotacion = nodoRect.DameRotacion();

        var centroRectangulo = nodoRect.DameCentroAbsoluto();
        
        let radio = (altoRect / 2) + texto.textHeight;
        var radianes = (90 + rotacion) * Math.PI / 180;

        var xTexto = centroRectangulo.x + radio * Math.cos(radianes);
        var yTexto = centroRectangulo.y + radio * Math.sin(radianes);
        
        texto.absolutePosition({
            x: xTexto,
            y: yTexto,
        });

        texto.offsetX(texto.width() / 2);
        texto.offsetY(texto.height() / 2);
        texto.rotation(rotacion);

        icono.absolutePosition({
            x: centroRectangulo.x,
            y: centroRectangulo.y,
        });

        icono.fontSize(TamanoIcono(nodoRect));
        icono.offsetX(icono.width() / 2);
        icono.offsetY(icono.height() / 2);
                
        icono.rotation(rotacion);
    }

    function ActualizarTexto(nodo, TextoSuperior, TextoDerecha) {
        var NodoRectangulo = nodo.getParent().findOne('Rect');
        var escala = DameEscala();
        
        var x = 0;
        var y = (NodoRectangulo.attrs.height / 2) + (TextoSuperior.textHeight);
        var rotacion = NodoRectangulo.DameRotacion() + 180;

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
        TextoSuperior.text(`${NodoRectangulo.DameTamano(escala).ancho}`);
        TextoSuperior.offsetX(TextoSuperior.width() / 2);
        TextoSuperior.offsetY(TextoSuperior.height() / 2);
        TextoSuperior.rotation(nodo.rotation());


        TextoDerecha.x(Derecha.x + xD);
        TextoDerecha.y(Derecha.y + yD);
        TextoSuperior.text(`${NodoRectangulo.DameTamano(escala).alto}`);
        TextoDerecha.offsetX(TextoDerecha.width() / 2);
        TextoDerecha.offsetY(TextoDerecha.height() / 2);
        TextoDerecha.rotation(nodo.rotation());
    }

    function AjustarTamanos(isla, escala) {
        const pasoHorizontal = 6.06;
        const pasoVertical = 2.44;

        let anchoMetros = Math.round((isla.width() * isla.scaleX() * escala) / pasoHorizontal) * pasoHorizontal;
        let altoMetros = Math.round((isla.height() * isla.scaleY() * escala) / pasoVertical) * pasoVertical;

        isla.width(anchoMetros / escala);
        isla.height(altoMetros / escala);

        isla.scaleX(1);
        isla.scaleY(1);
    }

    function DibujarDatosIsla(isla) {
        const escala = DameEscala();
        var alto = (isla.Alto * escala).toFixed(2);
        var ancho = (isla.Ancho * escala).toFixed(2);

        const datosIsla = [isla];

        const tabla = $('#tablaDatos');

        if (tabla.data('initialized')) {
            $('#tablaDatos').jqGrid('clearGridData');
            $('#tablaDatos').jqGrid('setGridParam', { data: datosIsla }).trigger('reloadGrid');
        } else if (tabla) {
            $('#tablaDatos').jqGrid({
                datatype: 'local',
                data: datosIsla,
                styleUI: 'Bootstrap',
                //responsive: true,
                shrinkToFit: false,
                autowidth: true,
                //toppager: true,
                rowList: [30, 40, 50],
                search: true,
                sortname: 'Documentacion',
                sortorder: 'asc',
                viewsortcols: [true, 'vertical', true],
                pager: "#jqGridServiciosPager",
                colModel: [
                    { label: "Nombre", name: "Nombre", width: 48, sortable: false, formatter:fnFormatNombreIsla },
                    { label: "Tipo de Estructura", name: "Descripcion", width: 100, sortable: false },
                    { label: "Ancho", name: "Ancho", width: 65, align: "center", sortable: false, formatter: 'currency', formatoptions: { decimalSeparator: '.', thousandsSeparator: ',', suffix: 'm', decimalPlaces: 2, defaultValue: '0.00' } },
                    { label: "Alto", name: "Alto", width: 65, align: "center", sortable: false, formatter: 'currency', formatoptions: { decimalSeparator: '.', thousandsSeparator: ',', suffix: 'm', decimalPlaces: 2, defaultValue: '0.00' } },
                    { label: "Observaciones", name: "Observaciones", width: 107, sortable: false },
                ],
                viewrecords: true,
                height: "auto",
                rowNum: 10,
            });

            function fnFormatNombreIsla(cellValue, options, rowObject) {
                console.log(arguments);

                return cellValue.toUpperCase();
            }

            tabla.data('initialized', true);
            $("#tablaDatos").jqGrid('setGridWidth', $("#sidebar-content").width());
        }
        $("#sidebar").addClass("active");
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

        tamIcono = promedio * 0.4;


        if (!tamIcono || tamIcono <= 0 || isNaN(tamIcono)) {
            tamIcono = 20;
        }

        return tamIcono
    }

    Lienzo = {
        Modo: enumModoLienzo.Isla,
        Escala: DameEscala(),
        Estado: null,
        lstPunto: [],
        PuntoActual: null,
        IslaActual: null,
        lstIslas: [],
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
        CrearIslaTemporal: function (x, y) {
            
            const isla = new Isla();
            isla.Posicion.x = x;
            isla.Posicion.y = y;
            isla.Alto = Lienzo.TamanoIsla().alto;
            isla.Ancho = Lienzo.TamanoIsla().ancho;
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

            //listaIslasGuardar.push(JSON.parse(JSON.stringify(IslaActual)));
            return isla;
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

            isla.Nueva = false;
            isla.Modificada = false;

            return isla;
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

        this.Nueva = null;
        this.Modificada = null;
        this.datosOriginales = {
            Id: this.Id,
            x: this.Posicion.x,
            y: this.Posicion.y,
            ancho: this.Ancho,
            alto: this.Alto,
            orientacion: this.Orientacion,
            nombre: this.Nombre,
            color: this.Color,
            descripcion: this.Descripcion,
            Icono: this.Icono,
        };

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
                x: 0,
                y: 0,
                name: this.Nombre,
                text: this.Descripcion,
                width: this.Ancho /*|| tamanoDefault.ancho*/,
                height: this.Alto /*|| tamanoDefault.alto*/,
                fill: this.Color ? `#${this.Color}` : "#88b7d5",
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
            
            if (this.Grafico == null) {
                this.Grupo = new Konva.Group({
                    x: this.Posicion.x,
                    y: this.Posicion.y,
                    rotation: this.Orientacion,
                    draggable: false,
                });

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
            
                this.Grupo.add(this.Grafico, this.GraficoIcono, this.GraficoTexto);

                layer.add(this.Grupo, this.GraficoTrasnformer);
                var isla = this;

                isla.Grafico.on('pointerdown', throttle((e) => {              
                    if (Lienzo.Estado === enumEstadoLienzo.Editando) {
                        //window.actualizarDatosIsla(this);
                        Lienzo.Estado = enumEstadoLienzo.Moviendo;
                        Lienzo.IslaActual = isla;
                        window.recibirDatosAActualizar(Lienzo.IslaActual);

                        isla.GraficoTrasnformer.nodes([isla.Grafico]);
                        isla.GraficoTrasnformer.visible(true);
                        isla.Grupo.draggable(true);
                        layer.draw();

                    }else if (Lienzo.Estado === enumEstadoLienzo.Moviendo) {
                        Lienzo.Estado = enumEstadoLienzo.Editando;
                        Lienzo.IslaActual = null;

                    }
                }, 300));

                isla.Grafico.on('pointerdblclick', function () {
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
                                                Notify(`La zona ${isla.Nombre} ha sido eliminada`, null, null, `danger`);
                                                //bootbox.alert(`La isla ${isla.Nombre} ha sido eliminada`);
                                            } else {
                                                bootbox.alert(`Ha ocurrido un error al intentar eliminar la zona`);
                                            }
                                        }
                                    });
                                }
                            },
                        });
                    }
                });

                isla.Grafico.on('dragend transformend', function () {
                    Lienzo.IslaActual = isla;
                    isla.Posicion.x = isla.Grupo.x();
                    isla.Posicion.y = isla.Grupo.y();
                    isla.Orientacion = isla.Grafico.getAbsoluteRotation();
                    isla.Ancho = isla.Grafico.width() * isla.Grafico.scaleX();
                    isla.Alto = isla.Grafico.height() * isla.Grafico.scaleY();

                    isla.Modificada = true;

                    window.agregarIslasAGuardar(isla);
                    
                });
            }
            else {
                this.Grafico.setAttrs(cfgGrafico);
                this.Grafico.absolutePosition({ x: this.Grupo.x, y: this.Grupo.y });
                //this.Grafico.absoluteRotation(this.Grupo.rotation);
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

    Lienzo.Estado = enumEstadoLienzo.Agregando;
    Lienzo.BloquearArea(true);

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

        var esStage = e.target === stage;
        var esNodo = e.target instanceof Konva.Node && e.target !== stage
        var boton = e.evt.button;
        //var esTouch = e.type.startsWith("touch");

        if (esStage) {
            if (Lienzo.IslaActual?.GraficoTrasnformer) {
                Lienzo.IslaActual.GraficoTrasnformer.nodes([]);
                Lienzo.IslaActual.GraficoTrasnformer.visible(false);
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
            var nuevaIsla = Lienzo.CrearIslaTemporal(posicion.x, posicion.y);

            Lienzo.IslaActual = nuevaIsla;
            Lienzo.Estado = enumEstadoLienzo.Moviendo;
            Lienzo.IslaActual.Estado = enumEstado.Moviendo;

            if (datosIsla) {
                Lienzo.IslaActual.Nombre = datosIsla.Nombre;
                Lienzo.IslaActual.Estructura = datosIsla.IdEstructura;
                Lienzo.IslaActual.Observaciones = datosIsla.Observaciones;

                datosIsla = null;
            }
            
           //listaIslasGuardar.push(Lienzo.IslaActual);

            console.log("Estado:", Lienzo.Estado);
            console.log("IslaActual:", Lienzo.IslaActual);

        }

    });

    //stage.on('pointermove', function (e) {
    //    if (Lienzo.Estado === enumEstadoLienzo.Moviendo && Lienzo.IslaActual != null) {
    //        //const isla = Lienzo.IslaActual;
    //        const pos = Lienzo.DamePosicion();

    //        Lienzo.IslaActual.Grupo.position({ x: pos.x, y: pos.y });

    //        Lienzo.IslaActual.Posicion.x = pos.x;
    //        Lienzo.IslaActual.Posicion.y = pos.y;

    //        Lienzo.IslaActual.Dibujar();
    //    }
    //});

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
                Lienzo.IslaActual = Lienzo.AgregarIsla(i.X, i.Y, i.Ancho, i.Alto, i.Nombre, i.Color, i.Icono, i.Orientacion);
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

    window.crearZona = function (datos) {

        Lienzo.Estado = enumEstadoLienzo.Agregando;

        datosIsla = datos;
        
        Notify("Da click para crear una zona", null, null, "success");
        
    }

    window.editarZona = function (datos) {

        Lienzo.Estado = enumEstadoLienzo.Moviendo;
        datosIsla = datos;
        Notify("Los datos seran actualizados", null, null, "success");
        
    }

    window.agregarIslasAGuardar = function (isla) {
        var registrada = listaIslasGuardar.some(x =>
            (isla.Id > 0 && x.Id === isla.Id) || (isla.Id === null && x === isla)
        );

        if (!registrada) listaIslasGuardar.push(isla);

        console.log("ListaActualizada", listaIslasGuardar);
    }

    window.actualizarDatosIsla = function (datos) {
        var isla = Lienzo.IslaActual;

        datosIsla = datos;

        isla.Modificada = true;
        window.agregarIslasAGuardar(isla);
    }

    //window.guardarAsync = function (datos) {

    //    if (!Lienzo.IslaActual) {
    //        bootbox.alert("No existe una isla para guardar");
    //        return;
    //    }

    //    var isla = Lienzo.IslaActual;

    //    datosIsla = {
    //        Id: isla.Id || 0,
    //        Nombre: datos?.Nombre ?? isla.Nombre,
    //        Orientacion: isla.Orientacion,//isla.Grupo.rotation() || isla.Grafico.rotation(),
    //        X: isla.Grupo.x(),
    //        Y: isla.Grupo.y(),
    //        Ancho: isla.Grafico.width() * isla.Grafico.scaleX(),
    //        Alto: isla.Grafico.height() * isla.Grafico.scaleY(),
    //        Observaciones: datos?.Observaciones ?? isla.Observaciones,
    //        Area: { Id: idAreaSeleccionada },
    //        Estructura: { Id: datos?.IdEstructura ?? isla.Estructura },
    //    };

    //    window.agregarIslasAGuardar(datosIsla);

    //    return datosIsla;

    //    //var url;

    //    //if (isla.Id == 0) 
    //    //    url = '/Isla/GuardarIsla';
    //    //else
    //    //    url = '/Isla/EditarIsla';

    //    //return new Promise((resolve, reject) => {
    //    //    $.ajax({
    //    //        url: url,
    //    //        method: 'POST',
    //    //        data: JSON.stringify(datosIsla),
    //    //        contentType: 'application/json; charset=utf-8',
    //    //        success: function (res) {
    //    //            if (res.ok) {
    //    //                bootbox.alert(`La isla ${datosIsla.Nombre} ha sido editada`);
    //    //                Lienzo.Estado = enumEstadoLienzo.Editando;
    //    //                Lienzo.IslaActual = null;
    //    //            } else {
    //    //                bootbox.alert(`Ha ocurrido un error al intentar editar la isla ${datosIsla.Nombre}`);
    //    //            }
    //    //        },
    //    //        error: function (XMLHttpRequest, textStatus, errorThrown) {
    //    //            reject(errorThrown);
    //    //        }
    //    //    });
    //    //});

    //}

    window.guardarTodoAsync = async function () {
        //if (listaIslasGuardar.length < 0) {
        //    bootbox.alert("No existe isla para guardar");
        //}

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