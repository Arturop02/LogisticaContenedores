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
            patioBT.Escala = (decimal)record["Escala"];
            if (record.GetOrdinal("Activo") >= 0 && !record.IsDBNull(record.GetOrdinal("Activo")))
                patioBT.Activo = (bool)record["Activo"];
            else
                patioBT.Activo = true;
            return patioBT;
        }
    }
}
