using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio.Mapeo
{
    public class FilaMapeo : IMapeo<FilaBT>
    {
        public FilaBT Mapear(IDataRecord record)
        {
            FilaBT filaBT = new FilaBT();
            filaBT.Id = (int)record["Id"];
            filaBT.Clave = record["Clave"].ToString();
            filaBT.MaximoNiveles = (int)record["MaximoNiveles"];
            filaBT.CantidadContenedores = (int)record["CantidadContenedores"];
            filaBT.Restricciones = record["Restricciones"].ToString();
            filaBT.Activo = (bool)record["Activo"];
            return filaBT;
        }
    }
}
