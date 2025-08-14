using BT.Patio;
using System.Data;

namespace BD.Patio.Mapeo
{
    public class VerticeMapeo : IMapeo<VerticeBT>
    {
        public VerticeBT Mapear(IDataRecord record)
        {
            VerticeBT obj = new VerticeBT();
            obj.Id = (int)record["Id"];
            obj.X = (decimal)record["X"];
            obj.Y = (decimal)record["Y"];
            obj.Orden = (int)record["Orden"];
            obj.Activo = (bool)record["Activo"];
            return obj;
        }
    }
}
