using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio.Mapeo
{
    public class CatalogoTiposMapeo : IMapeo<CatalogoTiposBT>
    {
        public CatalogoTiposBT Mapear(IDataRecord record) 
        { 
            CatalogoTiposBT catalogoTiposBT = new CatalogoTiposBT();
            catalogoTiposBT.Id = (int)record["Id"];
            catalogoTiposBT.Tipo = record["Tipo"].ToString();
            return catalogoTiposBT;
        }
    }
}
