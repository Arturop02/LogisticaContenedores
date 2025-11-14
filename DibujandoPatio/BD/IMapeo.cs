using System.Data;

namespace BD
{
    public interface IMapeo<TEntity>
    {
        TEntity Mapear(IDataRecord record);
    }
}
