using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio.Mapeo
{
    public class DetalleEnuMapeo : IMapeo<DetalleEnuBT>
    {
        public DetalleEnuBT Mapear(IDataRecord record)
        {
            DetalleEnuBT detalle = new DetalleEnuBT();
            detalle.Id = (int)record["ide_Detalle_Enu"];
            detalle.Descripcion = record["Descripcion"].ToString();
            detalle.Valor = record["Valor"].ToString();
            return detalle;
        }
    }
}
