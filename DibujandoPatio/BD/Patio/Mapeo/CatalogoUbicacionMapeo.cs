using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio.Mapeo
{
    public class CatalogoUbicacionMapeo : IMapeo<CatalogoUbicacionBT>
    {
        public CatalogoUbicacionBT Mapear(IDataRecord record)
        {
            CatalogoUbicacionBT catalogoUbicacion = new CatalogoUbicacionBT();
            catalogoUbicacion.Id = (int)record["Id"];
            catalogoUbicacion.CadenaUbicacion = record["CadenaUbicacion"].ToString();
            catalogoUbicacion.Ocupado = (bool)record["Ocupado"];
            return catalogoUbicacion;
        }
    }
}
