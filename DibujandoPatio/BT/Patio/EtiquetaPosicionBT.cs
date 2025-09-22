using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
