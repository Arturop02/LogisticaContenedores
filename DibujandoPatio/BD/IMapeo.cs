using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD
{
    public interface IMapeo<TEntity>
    {
        TEntity Mapear(IDataRecord record);
    }
}
