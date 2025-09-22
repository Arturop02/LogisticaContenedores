using BT.Patio;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BT.Patio
{
    public class IslaBT: BaseBT
    {
        public AreaBT Area {  get; set; }
        public string Nombre { get; set; }
        public decimal Orientacion { get; set; }
        public decimal X { get; set; }
        public decimal Y { get; set; }
        public decimal Ancho { get; set; }
        public decimal Alto { get; set; }
        public string Observaciones { get; set; }
    }
}
