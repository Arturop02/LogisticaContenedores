class Linea {
    constructor(puntoInicial, puntoFinal, Lienzo) {
        this.Tipo = null;
        this.Grafico = null;
        this.GraficoTexto = null;
        this.lstRelacionado = [];

        this.PuntoInicial = puntoInicial;
        this.PuntoFinal = puntoFinal;
        this.Lienzo = Lienzo;
    }

    Eliminar() {
        this.Grafico?.destroy();
        this.GraficoTexto?.destroy();
        this.lstRelacionado.forEach(item => {
            item.lstRelacionado.RemoveAll(c => c == this);
        });
    }

    Dibujar(){
        var cfgGraficoLinea = {
            points: [this.PuntoInicial.Posicion.x, this.PuntoInicial.Posicion.y, this.PuntoFinal.Posicion.x, this.PuntoFinal.Posicion.y],
            stroke: 'blue',
            strokeWidth: 4
        };

        const dx = this.PuntoFinal.Posicion.x - this.PuntoInicial.Posicion.x;
        const dy = this.PuntoFinal.Posicion.y - this.PuntoInicial.Posicion.y;
        const distanciaPixeles = Math.sqrt(dx * dx + dy * dy);
        const distanciaMetros = distanciaPixeles * this.Lienzo.Escala;

        var cfgGraficoTexto = {
            x: (this.PuntoInicial.Posicion.x + this.PuntoFinal.Posicion.x) / 2,
            y: (this.PuntoInicial.Posicion.y + this.PuntoFinal.Posicion.y) / 2,
            text: `${distanciaMetros.toFixed(2)}m`,
            fontSize: 16,
            fill: 'black',
            padding: 4,
            background: 'white'
        }

        if (this.Grafico == null) {
            this.Grafico = new Konva.Line(cfgGraficoLinea);
            this.GraficoTexto = new Konva.Text(cfgGraficoTexto);

            layer.add(this.Grafico);
            layer.add(this.GraficoTexto);
            var linea = this;
            this.Grafico.on('pointerdblclick', (e) => {
                if (this.Lienzo.Modo !== enumModoLienzo.Area || this.Lienzo.Estado !== enumEstadoLienzo.Editando) {
                    return;
                }

                const pos = this.Lienzo.DamePosicion();
                window.agregarPunto(linea, pos);
            });
        } else {
            this.Grafico.setAttrs(cfgGraficoLinea);
            this.Grafico.getLayer().batchDraw();

            this.GraficoTexto.setAttrs(cfgGraficoTexto);
            this.GraficoTexto.getLayer().batchDraw();
        }
    }
}



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

//        if (this.Grafico === null) {
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