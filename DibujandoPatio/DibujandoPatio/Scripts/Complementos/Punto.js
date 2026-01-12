class Punto {
    static OrdenActual = 0;

    constructor() {
        this.Posicion = { x: null, y: null };
        this.Tipo = null;
        this.Grafico = null;
        this.lstRelacionado = [];
        this.Arrastrable = false;
        this.Orden = null;

        //Me quede probando agregar el Lienzo como una propiedad del punto asi evitando la insercion de lienzo cada que se necesitaba
        this.Lienzo = null;
    }

    Eliminar(Lienzo) {

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

    Dibujar(Lienzo, layer, enumModoLienzo, enumEstadoLienzo) {

        var cfgGrafico = {
            x: this.Posicion.x,
            y: this.Posicion.y,
            radius: 7,
            fill: 'red',
            draggable: false
        };

        if (this.Grafico === null) {
            this.Grafico = new Konva.Circle(cfgGrafico);
            //this.Grafico.listening(true);
            layer.add(this.Grafico);
            layer.draw();

            this.Grafico.on('pointerdown',() => {

                if (Lienzo.Modo === enumModoLienzo.Area) {
                    if (Lienzo.Estado === enumEstadoLienzo.Editando) {
                        console.log('Se hizo click en el punto' + puntoActual);
                        Lienzo.Estado = enumEstadoLienzo.Moviendo;
                        Lienzo.PuntoActual = this;
                    } else if (Lienzo.Estado === enumEstadoLienzo.Moviendo) {
                        Lienzo.Estado = enumEstadoLienzo.Editando;
                        Lienzo.PuntoActual = null;
                    } else if (Lienzo.Estado === enumEstadoLienzo.Agregando && Lienzo.lstPunto.length >= 3 && Lienzo.lstPunto[0] === this) {
                        Lienzo.Cerrar();
                    }
                }
            });
            this.Grafico.on('pointerdblclick', (e) => {
                if (Lienzo.Modo === enumModoLienzo.Area) {
                    if (Lienzo.Estado === enumEstadoLienzo.Editando) {
                        window.confirmarEliminarPunto(this);
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

    MoverArriba = function () {
        this.Grafico.moveToTop();
    }
}

//window.Punto = Punto;



//function Punto() {
//    //this.Tipo = enumTipoGrafico.Punto;
//    //this.Grafico = null;
//    //this.lstRelacionado = [];
//    //this.Arrastrable = false;

//    //this.Posicion = { x: null, y: null };
//    //this.Orden = Punto.OrdenActual++;

//    //this.Eliminar = function () {
//    //    this.Grafico.destroy();
//    //    Lienzo.lstPunto.RemoveAll(c => c == this);
//    //    if (Lienzo.PuntoActual == this)
//    //        Lienzo.PuntoActual = null;

//    //    var temp = [];
//    //    temp.AddRange(this.lstRelacionado);

//    //    temp.forEach(function (item) {
//    //        item.Eliminar();
//    //    });

//    //    return this;
//    //}

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