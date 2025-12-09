using BT.Patio;
using System.Data;

namespace BD.Isla
{
    public class IslaMapeo: IMapeo<IslaBT>
    {
        public IslaBT Mapear(IDataRecord record)
        {
            IslaBT islaBT = new IslaBT();
            islaBT.Id = (int)record["ide_isla"];
            islaBT.Nombre = record["Nombre"].ToString();
            islaBT.TipoEstructuraId = (int)record["ide_TipoEstructura"];
            islaBT.Orientacion = (decimal)record["Orientacion"];
            islaBT.X = (decimal)record["X"];
            islaBT.Y = (decimal)record["Y"];
            islaBT.Ancho = (decimal)record["Ancho"];
            islaBT.Alto = (decimal)record["Alto"];
            islaBT.Observaciones = record["Observaciones"].ToString();
            islaBT.Color = record["Color"].ToString();
            islaBT.Icono = record["Icono"].ToString();
            islaBT.Descripcion = record["Descripcion"].ToString();
            islaBT.Est_cve = record["Est_cve"].ToString().Trim()[0];
            return islaBT;
        }

    }
}
