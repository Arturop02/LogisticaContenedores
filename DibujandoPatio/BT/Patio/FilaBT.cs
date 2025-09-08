using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BT.Patio
{
    public class FilaBT : BaseBT
    {
        public BahiaBT Bahia { get; set; }
        public string Clave { get; set; }
        public int MaximoNiveles { get; set; }
        public int CantidadContenedores { get; set; }
        public string Restricciones { get; set; }
    }
}
