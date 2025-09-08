using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio.Mapeo
{
    public class NivelMapeo : IMapeo<NivelBT>
    {
        public NivelBT Mapear(IDataRecord record)
        {
            NivelBT nivelBT = new NivelBT();
            nivelBT.Id = (int)record["Id"];
            nivelBT.Nivel = record["Nivel"].ToString();
            nivelBT.Activo = (bool)record["Activo"];
            return nivelBT;
        }
    }
}
