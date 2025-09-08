using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio.Mapeo
{
    public class UbicacionMapeo : IMapeo<UbicacionBT>
    {
        public UbicacionBT Mapear(IDataRecord record)
        {
            UbicacionBT ubicacion = new UbicacionBT();
            ubicacion.Id = (int)record["Id"];
            return ubicacion;
        }
    }
}
