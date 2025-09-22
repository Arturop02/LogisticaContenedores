using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BT.Patio
{
    public class PosicionBT: BaseBT
    {
        public string Nombre { get; set; }
        public string ClaveMov { get; set; }
        public string Observaciones { get; set; }
        public DetalleEnuBT DetalleEnuEstado { get; set; }
        public IslaBT Isla { get; set; }
        public EtiquetaPosicionBT EtiquetaPosicionBahia { get; set; }
        public EtiquetaPosicionBT EtiquetaPosicionFila { get; set; }
        public EtiquetaPosicionBT EtiquetaPosicionNivel { get; set; }
    }
}
