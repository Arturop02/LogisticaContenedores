using BT.Patio;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BT
{
    public class AreaBT : BaseBT
    {
        public string Nombre { get; set; }
        public PatioBT Patio { get; set; }
        public List<VerticeBT> Vertices { get; set; }

        public List<IslaBT> Islas { get; set; }

    }
}
