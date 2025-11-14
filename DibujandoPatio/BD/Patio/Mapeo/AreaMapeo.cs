using BT;

namespace BD.Patio.Mapeo
{
    public class AreaMapeo: IMapeo<AreaBT>
    {
        public AreaBT Mapear(System.Data.IDataRecord record)
        {
            AreaBT areaBT = new AreaBT();
            areaBT.Id = (int)record["ide_Area"];
            areaBT.Nombre = record["Nombre"].ToString();
            areaBT.Est_cve = record["Est_cve"].ToString().Trim()[0];
            return areaBT;
        }
    }
}
