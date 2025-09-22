using BT.Patio;
using System;
using System.Data;

namespace BD.Patio.Mapeo
{
    public class PatioMapeo : IMapeo<PatioBT>
    {
        public PatioBT Mapear(IDataRecord record)
        {
            PatioBT patioBT = new PatioBT();
            patioBT.Id = (int)record["Id"];
            patioBT.Nombre = record["Nombre"].ToString();
            patioBT.Est_cve = record["Est_cve"].ToString().Trim()[0];
            return patioBT;
        }
    }
}
