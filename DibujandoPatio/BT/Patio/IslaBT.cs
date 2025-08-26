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
        public PatioBT Patio {  get; set; }
        public string Nombre { get; set; }
        public CatalogoOrientacionBT Orientacion { get; set; }
        public CatalogoTiposBT TipoCarga { get; set; }
        public decimal X { get; set; }
        public decimal Y { get; set; }
        public decimal Ancho { get; set; }
        public decimal Alto { get; set; }
        public int NumeroBahias { get; set; }
        public string Observaciones { get; set; }

    }
}

//    TipoCarga INT FOREIGN KEY REFERENCES CatalogoTipos(Id),
