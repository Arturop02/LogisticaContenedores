using BT.Patio;
using System.Collections.Generic;

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
