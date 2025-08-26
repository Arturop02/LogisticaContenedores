using BT.Patio;
using System.Data;

namespace BD.Isla
{
    public class IslaMapeo: IMapeo<IslaBT>
    {
        public IslaBT Mapear(IDataRecord record)
        {
            IslaBT islaBT = new IslaBT();
            islaBT.Id = (int)record["Id"];
            islaBT.Nombre = record["Nombre"].ToString();
            islaBT.X = (decimal)record["X"];
            islaBT.Y = (decimal)record["Y"];
            islaBT.Ancho = (decimal)record["Ancho"];
            islaBT.Alto = (decimal)record["Alto"];
            islaBT.NumeroBahias = (int)record["NumeroBahias"];
            islaBT.Activo = (bool)record["Activo"];
            islaBT.Observaciones = record["Observaciones"].ToString();
            return islaBT;
        }

    }
}
