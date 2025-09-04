using BD.Patio;
using BT.Patio;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RN.Patio
{
    public class CatalogoTiposRN
    {

        public CatalogoTiposBT Agregar(CatalogoTiposBT catalogoTiposBT)
        {
            try
            {
                CatalogoTiposBD catalogoTiposBD = new CatalogoTiposBD(ConstantesRN.BD_CONECTION);
                return catalogoTiposBD.AltaCambio(catalogoTiposBT, BD.Utilidades.Accion.Alta);
            }
            catch (Exception)
            {
                throw;
            }
        }
        public CatalogoTiposBT Cambio(CatalogoTiposBT catalogoTiposBT)
        {
            try
            {
                CatalogoTiposBD catalogoTiposBD = new CatalogoTiposBD(ConstantesRN.BD_CONECTION);
                return catalogoTiposBD.AltaCambio(catalogoTiposBT, BD.Utilidades.Accion.Cambio);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public CatalogoTiposBT Borrado(CatalogoTiposBT catalogoTiposBT)
        {
            try
            {
                CatalogoTiposBD catalogoTiposBD = new CatalogoTiposBD(ConstantesRN.BD_CONECTION);
                return catalogoTiposBD.AltaCambio(catalogoTiposBT, BD.Utilidades.Accion.Borrar);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<CatalogoTiposBT> BuscarPorId(int id)
        {
            try
            {
                CatalogoTiposBD catalogoTiposBD = new CatalogoTiposBD(ConstantesRN.BD_CONECTION);
                return catalogoTiposBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.Id, Query: id.ToString()).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<CatalogoTiposBT> DameTodos()
        {
            try
            {
                CatalogoTiposBD catalogoTiposBD = new CatalogoTiposBD(ConstantesRN.BD_CONECTION);
                return catalogoTiposBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.TodosAB);
            }
            catch (Exception)
            {
                throw;
            }
        }

    }
}
