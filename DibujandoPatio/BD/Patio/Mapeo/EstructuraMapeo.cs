using BT.Patio;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio.Mapeo
{
    public class EstructuraMapeo: IMapeo<EstructuraBT>
    {
        public EstructuraBT Mapear(System.Data.IDataRecord record)
        {
            EstructuraBT estructuraBT = new EstructuraBT();
            estructuraBT.Id = (int)record["ide_Estructura"];
            estructuraBT.Descripcion = record["Descripcion"].ToString().Trim();
            estructuraBT.ClaveMov = record["ClaveMov"].ToString().Trim();
            estructuraBT.Icono = record["Icono"].ToString().Trim();
            //estructuraBT.DetalleTipoEstructura = new DetalleEnuBT();
            //var color = estructuraBT.Color.Trim();
            //if (color.Length > 8) color = color.Substring(0, 8);
            estructuraBT.Color = record["Color"].ToString().Trim();
            estructuraBT.Est_cve = record["Est_cve"].ToString().Trim()[0];
            return estructuraBT;
        }
    }
}
