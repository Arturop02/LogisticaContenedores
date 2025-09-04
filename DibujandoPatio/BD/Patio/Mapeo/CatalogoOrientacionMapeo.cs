using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio.Mapeo
{
    public class CatalogoOrientacionMapeo : IMapeo<CatalogoOrientacionBT>
    {
        public CatalogoOrientacionBT Mapear(IDataRecord record)
        {
            CatalogoOrientacionBT catalogoOrientacionBT = new CatalogoOrientacionBT();
            catalogoOrientacionBT.Id = (int)record["Id"];
            catalogoOrientacionBT.Orientacion = record["Orientacion"].ToString();
            catalogoOrientacionBT.Angulo = (int)record["Angulo"];
            return catalogoOrientacionBT;
        }
    }
}
