using BT.Patio;
using System;
using System.Data;

namespace BD.Patio.Mapeo
{
    public class VerticeMapeo : IMapeo<VerticeBT>
    {
        public VerticeBT Mapear(IDataRecord record)
        {
            VerticeBT obj = new VerticeBT();
            obj.Id = (int)record["ide_Vertice_Are"];
            obj.X = (decimal)record["X"];
            obj.Y = (decimal)record["Y"];
            obj.Orden = (int)record["Orden"];
            obj.Est_cve = record["Est_cve"].ToString().Trim()[0];
            return obj;
        }
    }
}
