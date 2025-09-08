using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio.Mapeo
{
    public class BahiaMapeo : IMapeo<BahiaBT>
    {
        public BahiaBT Mapear(IDataRecord record)
        {
            BahiaBT bahiaBT = new BahiaBT();
            bahiaBT.Id = (int)record["Id"];
            bahiaBT.Clave = record["Clave"].ToString();
            bahiaBT.NumeroFilas = (int)record["NumeroFilas"];
            bahiaBT.Activo = (bool)record["Activo"];

            return bahiaBT;
        }
    }
}
