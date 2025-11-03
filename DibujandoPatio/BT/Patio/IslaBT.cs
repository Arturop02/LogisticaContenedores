namespace BT.Patio
{
    public class IslaBT: BaseBT
    {
        public AreaBT Area {  get; set; }
        public EstructuraBT Estructura { get; set; }
        public string Nombre { get; set; }
        public decimal Orientacion { get; set; }
        public decimal X { get; set; }
        public decimal Y { get; set; }
        public decimal Ancho { get; set; }
        public decimal Alto { get; set; }
        public string Observaciones { get; set; }
        
        //Datos extra de EstructuraBT
        public string Color { get; set; }
        public string Descripcion { get; set; }
        public string Icono { get; set; }
    }
}
