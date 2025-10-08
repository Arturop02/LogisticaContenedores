using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BT.Patio
{
    public class EstructuraBT: BaseBT
    {
        public string Descripcion { get; set; }
        public string ClaveMov { get; set; }
        public string Icono { get; set; }
        public DetalleEnuBT DetalleTipoEstructura { get; set; }
        public string Color { get; set; }
    }
}
