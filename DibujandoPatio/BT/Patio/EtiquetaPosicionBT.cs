namespace BT.Patio
{
    public class EtiquetaPosicionBT: BaseBT
    {
        public string Nombre { get; set; }
        public DetalleEnuBT DetalleTipoEtiqueta { get; set; }
        public int Orden { get; set; }
        public string ClaveMov { get; set; }
    }
}
