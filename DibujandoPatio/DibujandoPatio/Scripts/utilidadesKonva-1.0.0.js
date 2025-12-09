//function DameEscala() {
//    const escala = 0.4;
//    return escala;
//};


Konva.Rect.prototype.DameCentroAbsoluto = function () {
    const box = this.getClientRect(); // bounding box del rect en coordenadas del layer
    // centro del bounding box relativo al stage:
    const center = {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2
    };
    return center;
};

Konva.Rect.prototype.DamePosicionAbsolutaTexto = function () {
    const box = this.getAbsolutePosition();

    const posicion = {
        x: box.width / 2,
        y: box.height
    };
    return posicion;
};

Konva.Rect.prototype.DameTamano = function (escala) {
    const rectangulo = this.getClientRect();
    const anchoMetros = (rectangulo.width * rectangulo.scaleX * escala).toFixed(2);
    const altoMetros = (rectangulo.height * rectangulo.scaleY * escala).toFixed(2);

    return { ancho: anchoMetros, alto: altoMetros };
};

Konva.Rect.prototype.DameRotacion = function () {
    var rotacion = this.rotation() % 360;
    if (rotacion < 0) rotacion += 360;
    return rotacion;
};

Konva.Group.prototype.DameRotacion = function () {
    var rotacion = this.rotation() % 360;
    if (rotacion < 0) rotacion += 360;
    return rotacion;
};

