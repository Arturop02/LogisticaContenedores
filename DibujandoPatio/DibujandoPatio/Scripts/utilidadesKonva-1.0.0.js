Konva.Rect.prototype.DameCentroAbsoluto = function () {
    const box = this.getClientRect(); // bounding box del rect en coordenadas del layer

    // centro del bounding box relativo al stage:
    const center = {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2
    };
    return center;
};