using System.Collections.Generic;

namespace BT.Patio
{
    public class PatioBT: BaseBT
    {
        public string Nombre { get; set; }
        public decimal Escala { get; set; }
        public List<VerticeBT> Vertices { get; set; }
    }
}
