var stage;
var layer;
var Lienzo;
var TextoSuperior = null;
var TextoDerecha = null;
var datosIsla = {};
var nuevosDatos = {};
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

    function GuardarAltaCambio(isla, datos) {
        if (!isla) {
            botboox.alert("No existe una isla para guarar");
            return;
        }

        let rotacion = isla.getAbsoluteRotation();
        let transform = isla.getAbsoluteTransform();
        let posicionAbsoluta = transform.getTranslation();

        datosIsla = {
            Id: isla.getAttr('Id'),
            Nombre: isla.Nombre || datos.Nombre,
            Orientacion: rotacion,
            X: posicionAbsoluta.x,
            Y: posicionAbsoluta.y,
            Ancho: isla.width() * isla.scaleX(),
            Alto: isla.height() * isla.scaleY(),
            Observaciones: isla.Observaciones || datos.Observaciones,
            Area: { Id: idAreaSeleccionada },
            Estructura: datos.Estructura,
        };

        if (datosIsla.Id) {
            console.log("En if ", datosIsla.Id);
            let url = '/Isla/EditarIsla';
            var data = JSON.stringify(datosIsla);

            $.ajax({
                url: url,
                method: 'POST',
                data: data,
                contentType: 'application/json; charset=utf-8',
                success: function (res) {
                    if (res.ok) {
                        bootbox.alert(`La isla ${datosIsla.Nombre} ha sido editada`);
                    } else {
                        bootbox.alert(`Ha ocurrido un error al intentar editar la isla ${datosIsla.Nombre}`);
                    }
                }
            });
        } else {
            console.log("En else ", datosIsla.Id > 0);
            var data = JSON.stringify(datosIsla);
            $.ajax({
                url: '/Isla/GuardarIsla',
                method: 'POST',
                data: data,
                contentType: 'application/json',
                success: function (res) {
                    if (res.ok) {
                        bootbox.alert("Isla guardada con exito");
                        isla = null;
                        $(`#guardarIsla`).addClass('d-none');
                        layer.draw();
                    } else {
                        bootbox.alert("Error al guardar isla");
                    }
                }
            });

        }

    }

    //Rectangulo = {
    //    Estado: null,
    //    DamePosicion: function () {
    //        const transform = this.Stage.getAbsoluteTransform().copy();
    //        transform.invert();
    //        const posicion = transform.point(this.Stage.getPointerPosition());
    //        posicion.x = posicion.x.toFixed(6) * 1;
    //        posicion.y = posicion.y.toFixed(6) * 1;
    //        return posicion;
    //    },
    //    TamanoIsla: function (escala) {
    //        const anchoBahia = 6.06 / escala;
    //        altoBahia = 2.44 / escala;

    //        var ancho = 2 * anchoBahia;
    //        var alto = altoBahia;
    //        return { ancho, alto };
    //    },
    //    DameTamano: function (escala) {
    //        const isla = this.getClientRect;
    //        const anchoMetros = (isla.width * isla.scaleX * escala).toFixed(2);
    //        const altoMetros = (isla.height * isla.scaleY * escala).toFixed(2);
    //        return { ancho: anchoMetros, alto: altoMetros };
    //    },
    //};

    //function TamanoIsla(escala) {
    //    const anchoBahia = 6.06 / escala;
    //    const altoBahia = 2.44 / escala;

    //    var ancho = 2 * anchoBahia;
    //    var alto = altoBahia;

    //    return { ancho, alto };
    //}

    //function DameTamano(isla) {
    //    if (!isla) return;

    //    const anchoMetros = (isla.width() * isla.scaleX() * escala).toFixed(2);
    //    const altoMetros = (isla.height() * isla.scaleY() * escala).toFixed(2);

    //    TextoSuperior.text(`${anchoMetros} m`);
    //    TextoDerecha.text(`${altoMetros} m`);

    //    /*ActualizarTexto(isla, TextoSuperior, TextoDerecha);*/
    //}

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

        if (!tamIcono || tamIcono <= 0 || isNaN(tamIcono)) {
            tamIcono = 20;
        }

        tamIcono = promedio * 0.4;

        if (!tamIcono || tamIcono <= 0 || isNaN(tamIcono)) {
            tamIcono = 20;
        }

        return tamIcono
    }

    function CargarIslas(idAreaSeleccionada) {
        var idAreaActual = null;
        if (idAreaActual == idAreaSeleccionada) return;

        idAreaActual = idAreaSeleccionada;
        layer.destroyChildren();
        layer.draw();

        $.getJSON('/Area/ObtenerIslasPorAreaId', { id: idAreaSeleccionada }, function (res) {
            if (!res.ok || !res.data);

            var area = res.data;
            area.Islas.forEach(i => {
            
                var grupoADibujar = new Konva.Group({
                    x: i.X,
                    y: i.Y,
                    rotation: i.Orientacion,
                });

                var rectanguloIsla = new Konva.Rect({
                    Id: i.Id,
                    name: i.Nombre,
                    text: i.Descripcion,
                    width: i.Ancho,
                    height: i.Alto,
                    fill: `#${i.Color}`,
                    strokeWidth: 1,
                    stroke: 'black',
                });
                
                var textoNombreIsla = new Konva.Text({
                    text: i.Nombre,
                    fontSize: 12,
                    x: (rectanguloIsla.width() / 2),
                    y: rectanguloIsla.height(),
                });

                var uniCodeIcono;

                if (i.Icono && i.Icono.trim() !== "") {
                    uniCodeIcono = ObtenerUnicodeDesdeClase(i.Icono);
                }

                var icono = new Konva.Text({
                    text: uniCodeIcono,
                    fontFamily: 'FontAwesome',
                    fontSize: TamanoIcono(rectanguloIsla),
                    fill: 'white'
                });

                icono.x(rectanguloIsla.width() / 2 - icono.width() / 2);
                icono.y(rectanguloIsla.height() / 2 - icono.height() / 2);

                var tooltipRect = new Konva.Rect({
                    fill: '#313131',
                    stroke: 'gray',
                    strokeWidth: 1,
                    visible: false,
                    opacity: 1,
                });

                var tooltip = new Konva.Text({
                    text: i.Nombre,
                    visible: false,
                    fontSize: 12,
                    fill: 'white',
                    padding: 3,
                });

                grupoADibujar.add(rectanguloIsla, icono, textoNombreIsla);
                
                grupoADibujar.on('pointerover', function () {

                    pointerPos = stage.getPointerPosition();
                    tooltip.position({
                        x: pointerPos.x + 5,
                        y: pointerPos.y + 5,
                    });

                    tooltip.visible(true);

                    tooltipRect.position({
                        x: tooltip.x() - 5,
                        y: tooltip.y() - 5,
                    });

                    tooltipRect.width(tooltip.width() + 10);
                    tooltipRect.height(tooltip.height() + 10);
                    tooltipRect.visible(true);

                    layer.batchDraw();
                });

                grupoADibujar.on('pointerleave', function () {
                    tooltip.visible(false);
                    tooltipRect.visible(false);
                    layer.batchDraw();
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

                                                        rectanguloIsla.on('transform dragmove', function () {
                                                            AjustarTamanos(rectanguloIsla, escala);
                                                            TransformarGrupoIsla(rectanguloIsla, textoNombreIsla, icono);
                                                        });
                                                        
                                                        nuevosDatos = {
                                                            Nombre: $('#nombreIsla').val(),
                                                            Observaciones: $('#observacionesIsla').val(),
                                                            Estructura: i.idEstructura,
                                                        }

                                                        $('#guardarBtn').on('click', function () {
                                                            GuardarAltaCambio(rectanguloIsla, nuevosDatos);
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
                                                    }
                                                    $.ajax({
                                                        url: '/Isla/BorrarIsla',
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
                layer.add(grupoADibujar);
                layer.add(tooltipRect, tooltip);

            });
            layer.draw();
        });
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
        CrearIslaTemporal: function (x, y) {
            if (this.IslaActual) {
                this.IslaActual.Eliminar();
                this.IslaActual = null;
            }

            const isla = new Isla();
            isla.Posicion.x = x;
            isla.Posicion.y = y;
            isla.Alto = Lienzo.TamanoIsla().alto;
            isla.Ancho = Lienzo.TamanoIsla().ancho;

            isla.Dibujar();
            IslaActual = isla;
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

    //var enumEstadoGrafico = {
    //    AltaCambio: 'pointerdown',
    //    Borrado: 'pointerdblclick',

    //};

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
                //draggable: true,
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
            

                this.Grupo.add(this.Grafico, this.GraficoIcono, this.GraficoTexto, this.GraficoTrasnformer);

                layer.add(this.Grupo);
                var isla = this;

                this.Grafico.on('pointerdown', throttle((e) => {
//                    e.cancelBubble = true;
                    
                    if (Lienzo.Estado === enumEstadoLienzo.Editando) {

                        Lienzo.Estado = enumEstadoLienzo.Moviendo;
                        Lienzo.IslaActual = isla;

                        isla.GraficoTrasnformer.nodes([this.Grafico]);
                        isla.GraficoTrasnformer.visible(true);
                        isla.Grafico.draggable(true);
                        //isla.Grafico.on('transform dragmove', function () {
                        //    TransformarGrupoIsla(this.Grafico, this.GraficoIcono, this.GraficoIcono)
                        //});
                        layer.draw();

                    }else if (Lienzo.Estado === enumEstadoLienzo.Moviendo) {
                        Lienzo.Estado = enumEstadoLienzo.Editando;
                        Lienzo.IslaActual = null;
                    }
                }, 300));

                //this.Grafico.on('pointerclick', function () {
                //    if (Lienzo.Estado === enumEstadoLienzo.Estado) {
                //        bootbox.confirm({
                //            message: '¿Desea editar una nueva zona?',
                //            buttons: {
                //                confirm: {
                //                    label: 'Editar',
                //                    className: 'btn-success',
                //                },
                //                cancel: {
                //                    label: 'Cancelar',
                //                    className: 'btn-danger'
                //                },
                //            },
                //            callback: (result) => {
                //                tr.nodes(isla);
                //                layer.draw();
                //                layer.add(tr);
                //                if (result) {
                //                    isla.Arrastrable = true;

                //                    TransformarGrupoIsla(isla, isla.GraficoTexto, GraficoTexto);

                //                    isla.Dibujar();
                //                    Lienzo.AjustarTamanosIsla();
                //                    Lienzo.IslaActual = isla;
                //                    Lienzo.Estado = enumEstadoLienzo.Moviendo
                //                }
                //            },
                //        });
                //    }
                //});

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
                                                bootbox.alert(`La isla ${isla.Nombre} ha sido eliminada`);
                                            } else {
                                                bootbox.alert(`Ha ocurrido un error al intentar eliminar la isla ${i.Nombre}`);
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
                console.log(this);
                this.Grafico.setAttrs(cfgGrafico);
                this.Grafico.absolutePosition(cfgGrafico);
                this.Grafico.getLayer().batchDraw();

                this.GraficoTexto.setAttrs(cfgGraficoTexto);
                this.GraficoTexto.absolutePosition(cfgGraficoTexto);
                this.GraficoTexto.getLayer().batchDraw();

                this.GraficoIcono.setAttrs(cfgGraficoIcono);
                this.GraficoIcono.absolutePosition(cfgGraficoIcono);
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

    if (idAreaSeleccionada != null && idAreaSeleccionada != "") {
        Lienzo.Modo = enumModoLienzo.Isla
        Lienzo.Estado = enumEstadoLienzo.Agregando;
        Lienzo.BloquearArea(true);
        let $radio = $(`#lstAreas input[data-id="${idAreaSeleccionada}"]`);
        $radio.closest("label.btn").trigger('click');
        $radio.prop('checked', true).trigger('change');
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

        var esStage = e.target === stage;
        var esNodo = e.target instanceof Konva.Node && e.target !== stage
        var boton = e.evt.button;
        var esTouch = e.type.startsWith("touch");

        if (esNodo) {
            return;
        }

        if (esStage) {
            if (Lienzo.IslaActual?.GraficoTrasnformer) {
                Lienzo.IslaActual.GraficoTrasnformer.visible(false);
            }
            Lienzo.IslaActual = null;
            layer.draw();
        }

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
        } else if (Lienzo.Estado === enumEstadoLienzo.Agregando && boton === enumBotton.ClickIzquierdo) {
            
            const posicion = Lienzo.DamePosicion();
            var nuevaIsla = Lienzo.CrearIslaTemporal(posicion.x, posicion.y);
            
            //if (nuevaIsla?.GraficoTrasnformer) {
            //    nuevaIsla.GraficoTrasnformer.visible(false);
            //}

            Lienzo.IslaActual = nuevaIsla;
            layer.draw();
        }

    });

    //stage.on('click', (e) => {
    //    if (e.target === stage) {
    //        if (Lienzo.IslaActual?.GraficoTrasnformer) {
    //            Lienzo.IslaActual.GraficoTrasnformer.visible(false);
    //        }

    //        Lienzo.IslaActual = null;
    //        layer.draw();
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

    $.getJSON('/Estructura/ListarTiposEstructura', function (res) {
        listarTipoEstructuras = res.map(t => `<option value="${t.Id}" data-color="${t.Color}">${t.Descripcion}</option>`).join('');
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

        //CargarIslas(id);
    });

    $('#agregarTipoEstructura').on('click', function () {
        bootbox.dialog({
            title: 'Agregar nuevo tipo de estructura',
            message: $('#formularioEstructuras').show(),
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
                        const icono = $('#iconoSeleccionado').val();

                        var payload = {
                            Descripcion: descripcion,
                            DetalleTipoEstructura: { Id: idEnu },
                            Color: color,
                            Icono: icono,
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
            },
        });
        $(document).on('click', '#btnBuscarIconos', function () {
            const filtro = $('#filtroIcono').val();
            BuscarIconos(filtro);
        });
    });


    //$(`#crearZona`).on(`click`, function () {
    //    bootbox.dialog({
    //        title: "Crear Zona",
    //        message: `<form id="formIsla">
    //                <div class="form-group">
    //                    <label>Nombre de la Zona</label>
    //                    <input type="text" class="form-control" id="nombreIsla" required />
    //                    <br />
    //                    <label>Tipo de estructura</label>
    //                    <select id="tipoEstructura" class="form-control" required />
    //                        <option value=""> --Selecciona-- </option>
    //                        ${listarTipoEstructuras}
    //                    </select>
    //                    <br />
    //                    <label>Observaciones</label>
    //                    <input type="text" class="form-control" id="observacionesIsla"/>
    //                </div>
    //            </form>`
    //        ,
    //        buttons: {
    //            cancelar: {
    //                label: "Cancelar",
    //                className: "btn-danger",
    //                callback: function () {
    //                    return;
    //                }
    //            },
    //            next: {
    //                label: "Siguiente",
    //                className: "btn-primary",
    //                callback: function () {
    //                    const idEstructura = $(`#tipoEstructura`).val();
    //                    nuevosDatos = {
    //                        Nombre: $(`#nombreIsla`).val(),
    //                        Estructura: { Id: idEstructura },
    //                        Observaciones: $(`#observacionesIsla`).val(),
    //                    };
    //                    if (!nuevosDatos.Nombre) {
    //                        bootbox.alert("Por favor nombra la isla");
    //                        return false;
    //                    }

    //                    var grupoIslas = new Konva.Group({
    //                        x: 50,
    //                        y: 50,
    //                        draggable: true
    //                    });

    //                    islaTemporal = new Konva.Rect({
    //                        x: 0,
    //                        y: 0,
    //                        width: tamano.ancho,
    //                        height: tamano.alto,
    //                        stroke: 'blue',
    //                        fill:  idEstructura.Color,
    //                        strokeWidth: 2,
    //                        name: 'isla'
    //                    });

    //                    TextoSuperior = new Konva.Text({
    //                        x: islaTemporal.width() / 2,
    //                        y: islaTemporal.height() / 2,
    //                        text: `${islaTemporal.DameTamano(escala).ancho}m`,
    //                        fontSize: 12,
    //                        fill: 'black',
    //                    });

    //                    TextoDerecha = new Konva.Text({
    //                        x: islaTemporal.width() / 2,
    //                        y: islaTemporal.height() / 2,
    //                        text: `${islaTemporal.DameTamano(escala).alto}m`,
    //                        fontSize: 12,
    //                        fill: 'black',
    //                    });

    //                    tr.nodes([islaTemporal]);

    //                    grupoIslas.add(islaTemporal, TextoSuperior, TextoDerecha);
    //                    layer.add(grupoIslas, tr);

    //                    islaTemporal.on('transform dragmove', function () {
    //                        islaTemporal.DameTamano(escala);
    //                        ActualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);
    //                        AjustarTamanos(islaTemporal, escala);
    //                        layer.batchDraw();
    //                    });

    //                    islaTemporal.on('transformend', function () {
    //                        islaTemporal.DameTamano(escala);
    //                        ActualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);
    //                        var rotacion = islaTemporal.DameRotacion();
    //                        datosIsla.Orientacion = rotacion;
    //                    });

    //                    ActualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);

    //                    tr.on('transform dragmove', () => {
    //                        ActualizarTexto(islaTemporal, TextoSuperior, TextoDerecha);
    //                        AjustarTamanos(islaTemporal, escala);
    //                        layer.batchDraw();
    //                    });

    //                    islaTemporal.DameTamano(escala);

    //                    layer.batchDraw();

    //                    layer.draw();

    //                    $(`#guardarBtn`).removeClass('d-none');

    //                    $(`#guardarBtn`).on('click', function () {
    //                        GuardarAltaCambio(islaTemporal, nuevosDatos);
    //                    });


    //                    return true;

    //                }
    //            }
    //        }
    //    });
    //});

    $('#cerrarSidebar').on('click', function () {
        $('#sidebar').removeClass("active");
    });

}