class IslaRect {
    constructor(Lienzo) {
        this.Tipo = null;
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
        this.Estructura = null;
        this.Color = null;
        this.Icono = null;

        this.Nueva = null;
        this.Modificada = null;
        this.Lienzo = Lienzo;
    }

    Eliminar() {
        this.Grafico?.destroy();
        this.GraficoIcono.destroy();
        this.GraficoTexto.destroy();
        Lienzo.Transformer?.destroy();

        var temp = [];
        temp.forEach(function (item) {
            item.Eliminar();
        });

        return this;
    }

    Actualizar() {
        if (this.Grafico == null){
            this.Dibujar();
            return;
        }

        this.Grafico.setAttrs({
            fill: this.Color ? `#${this.Color}` : "#88b7d5",
        });

        if (this.GraficoTexto) {
            this.GraficoTexto.text(this.Nombre);
        }

        if (this.GraficoIcono) {
            this.GraficoIcono.text(this.Icono);
            this.GraficoIcono.fontSize(TamanoIcono(this.Grafico));
        }

        this.Grafico.getLayer().batchDraw();

    }

    Dibujar() {
        var tamanoDefault = this.Lienzo.TamanoIsla();
        this.Lienzo.TamanoIsla();

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

        var cfgGraficoTexto = {
            text: this.Nombre,
            fontSize: 12,
            fill: 'black',
            rotation: this.Orientacion,
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
            flipEnabled: false,
            resizeEnabled: true,
            visible: false,
            rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
            rotateAnchorOffset: 30,
            strokeScaleEnabled: false,
            boundBoxFunc: (oldBox, newBox) => {
                if (newBox.width < tamanoDefault.ancho || newBox.height < tamanoDefault.alto) {
                    return oldBox;
                }

                return newBox;
            }
        };

        if (this.Grafico == null) {
            this.Grupo = new Konva.Group({
                x: this.Posicion.x,
                y: this.Posicion.y,
                draggable: false,
            });

            this.Grafico = new Konva.Rect(cfgGrafico);

            this.GraficoTexto = new Konva.Text(cfgGraficoTexto);
            var radio = this.Alto / 2 + this.GraficoTexto.height();
            var radianes = (90 + this.Orientacion) * Math.PI / 180;
            var xNombre = radio * Math.cos(radianes);
            var yNombre = radio * Math.sin(radianes);

            this.GraficoTexto.setAttrs({
                position: {
                    x: xNombre,
                    y: yNombre,
                },
            });
            this.GraficoTexto.offsetX(this.GraficoTexto.width() / 2);
            this.GraficoTexto.offsetY(this.GraficoTexto.height() / 2);

            this.GraficoIcono = new Konva.Text(cfgGraficoIcono);
            document.fonts.ready.then(() => {
                this.GraficoIcono.fontSize(this.Lienzo.AjustarIconoIsla(this.Grafico));

                this.GraficoIcono.offsetX(this.GraficoIcono.width() / 2);
                this.GraficoIcono.offsetY(this.GraficoIcono.height() / 2);

                this.GraficoIcono.position({ x: 0, y: 0 });

                layer.batchDraw();
            });

            this.GraficoTrasnformer = new Konva.Transformer(cfgTransformer);
            this.Lienzo.Transformer = this.GraficoTrasnformer;

            this.Grupo.add(this.Grafico, this.GraficoIcono, this.GraficoTexto);

            layer.add(this.Grupo, this.Lienzo.Transformer);
            var isla = this;

            isla.Grafico.on('pointerclick', () => {
                if (this.Lienzo.Estado === enumEstadoLienzo.Moviendo) {
                    this.Lienzo.Estado = enumEstadoLienzo.Editando;

                    if (this.Lienzo.IslaActual || this.Lienzo.Transformer) {
                        this.Lienzo.CerrarTransformer();
                    }
                    layer.batchDraw();
                }

                if (this.Lienzo.Estado === enumEstadoLienzo.Editando) {

                    if (this.Lienzo.IslaActual && this.Lienzo.IslaActual !== isla) {
                        this.Lienzo.IslaAnterior = this.Lienzo.IslaActual;
                    }

                    this.Lienzo.IslaActual = isla;

                    if (this.Lienzo.IslaAnterior) {
                        this.Lienzo.CerrarTransformer();
                    }

                    this.Lienzo.Estado = enumEstadoLienzo.Moviendo;
                    window.recibirDatosAActualizar(this.Lienzo.IslaActual);

                    isla.Grafico.setAttrs({
                        fill: this.Lienzo.IslaActual.Color ?
                            `#${this.Lienzo.IslaActual.Color}` : "#88b7d5"
                    });
                }
            });

            isla.Grupo.on('dragend', function () {

                var absPos = isla.Grafico.getAbsolutePosition();
                var posFinal = this.Lienzo.TransformarAPosicionLocal(absPos);

                this.Lienzo.IslaActual = isla;
                isla.Posicion.x = posFinal.x;
                isla.Posicion.y = posFinal.y;
                isla.Ancho = isla.Grafico.width() * isla.Grafico.scaleX();
                isla.Alto = isla.Grafico.height() * isla.Grafico.scaleY();
                isla.Modificada = true;

                window.agregarIslasAGuardar(isla);
            });

            isla.Grafico.on('transform', function () {

                var rectIsla = this;
                var scaleX = rectIsla.scaleX();
                var scaleY = rectIsla.scaleY();
                var stage = rectIsla.getStage();
                var stageScale = stage.scaleX();

                var rotacion = rectIsla.DameRotacion();

                const anchoReal = rectIsla.width() * scaleX;
                const altoReal = rectIsla.height() * scaleY;

                var absPos = rectIsla.getAbsolutePosition();

                rectIsla.setAttrs({
                    scaleX: 1,
                    scaleY: 1,
                    width: anchoReal,
                    height: altoReal,
                    offsetX: anchoReal / 2,
                    offsetY: altoReal / 2,
                });

                rectIsla.absolutePosition(absPos);
                rectIsla.rotation(rotacion);

                var centro = rectIsla.DameCentroAbsoluto();

                var radio = ((altoReal / 2) + isla.GraficoTexto.height()) * stageScale;
                var radianes = (90 + rotacion) * Math.PI / 180;

                var xNombre = centro.x + radio * Math.cos(radianes);
                var yNombre = centro.y + radio * Math.sin(radianes);

                isla.GraficoTexto.setAttrs({
                    absolutePosition: {
                        x: xNombre,
                        y: yNombre,
                    },
                    offsetX: isla.GraficoTexto.width() / 2,
                    offsetY: isla.GraficoTexto.height() / 2,
                    rotation: rotacion,
                });

                isla.GraficoIcono.setAttrs({
                    fontSize: this.Lienzo.AjustarIconoIsla(isla.Grafico),
                    absolutePosition: {
                        x: centro.x,
                        y: centro.y,
                    },
                    offsetX: isla.GraficoIcono.width() / 2,
                    offsetY: isla.GraficoIcono.height() / 2,
                    rotation: rotacion,
                });

            });

            isla.Grafico.on('transformend', function () {

                var rectIsla = this;
                var scaleX = rectIsla.scaleX();
                var scaleY = rectIsla.scaleY();
                var rotacion = rectIsla.DameRotacion();

                const anchoReal = rectIsla.width() * scaleX;
                const altoReal = rectIsla.height() * scaleY;

                var absPos = rectIsla.getAbsolutePosition();
                var posFinal = this.Lienzo.TransformarAPosicionLocal(absPos);

                rectIsla.setAttrs({
                    scaleX: 1,
                    scaleY: 1,
                    width: anchoReal,
                    height: altoReal,
                    offsetX: anchoReal / 2,
                    offsetY: altoReal / 2,
                });

                rectIsla.absolutePosition(absPos);
                rectIsla.rotation(rotacion);

                isla.Posicion.x = posFinal.x;
                isla.Posicion.y = posFinal.y;
                isla.Orientacion = rotacion;
                isla.Ancho = Number(anchoReal.toFixed(4));
                isla.Alto = Number(altoReal.toFixed(4));
                isla.Modificada = true;

                window.agregarIslasAGuardar(isla);

            });
        }

        this.lstIslas.forEach(function (item) {
            item.Dibujar();
        })

        this.MoverArriba = function () {
            this.Grafico.moveToTop();
        }


    }
}