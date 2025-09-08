using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BT.Patio
{
    public class UbicacionBT : BaseBT
    {
        public PatioBT Patio { get; set; }
        public IslaBT Isla { get; set; }
        public BahiaBT Bahia { get; set; }
        public FilaBT Fila { get; set; }
        public NivelBT Nivel { get; set; }
    }
}
