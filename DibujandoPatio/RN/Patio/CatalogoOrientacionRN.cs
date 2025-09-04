using BD.Patio;
using BT.Patio;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RN.Patio
{
    public class CatalogoOrientacionRN
    {
        public CatalogoOrientacionBT Agregar(CatalogoOrientacionBT catalogoOrientacionBT)
        {
            try
            {
                CatalogoOrientacionBD catalogoOrientacionBD = new CatalogoOrientacionBD(ConstantesRN.BD_CONECTION);
                return catalogoOrientacionBD.AltaCambio(catalogoOrientacionBT, BD.Utilidades.Accion.Alta);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public CatalogoOrientacionBT Cambio(CatalogoOrientacionBT catalogoOrientacionBT)
        {
            try
            {
                CatalogoOrientacionBD catalogoOrientacionBD = new CatalogoOrientacionBD(ConstantesRN.BD_CONECTION);
                return catalogoOrientacionBD.AltaCambio(catalogoOrientacionBT, BD.Utilidades.Accion.Cambio);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public CatalogoOrientacionBT Borrado(CatalogoOrientacionBT catalogoOrientacionBT)
        {
            try
            {
                CatalogoOrientacionBD catalogoOrientacionBD = new CatalogoOrientacionBD(ConstantesRN.BD_CONECTION);
                return catalogoOrientacionBD.AltaCambio(catalogoOrientacionBT, BD.Utilidades.Accion.Borrar);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<CatalogoOrientacionBT> BuscarPorId(int id)
        {
            try
            {
                CatalogoOrientacionBD catalogoOrientacionBD = new CatalogoOrientacionBD(ConstantesRN.BD_CONECTION);
                return catalogoOrientacionBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.Id, Query: id.ToString()).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<CatalogoOrientacionBT> DameTodos()
        {
            try
            {
                CatalogoOrientacionBD catalogoOrientacionBD = new CatalogoOrientacionBD(ConstantesRN.BD_CONECTION);
                return catalogoOrientacionBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.TodosAB);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
