using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio.Mapeo
{
    public class CatalogoTamanoMapeo : IMapeo<CatalogoTamanoBT>
    {
        public CatalogoTamanoBT Mapear(IDataRecord record)
        {
            CatalogoTamanoBT catalogoTamano = new CatalogoTamanoBT();
            catalogoTamano.Id = (int)record["Id"];
            catalogoTamano.Tamaño = (int)record["Tamaño"];
            return catalogoTamano;
        }
    }
}
