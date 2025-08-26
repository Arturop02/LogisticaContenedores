using BD.Patio;
using BT.Patio;
using System;
using System.Collections.Generic;
using System.Linq;

namespace RN.Patio
{
    public class IslaRN
    {
        public IslaBT Agregar(IslaBT islaBT)
        {
            try
            {
                IslaBD islaBD = new IslaBD(ConstantesRN.BD_CONECTION);
                return islaBD.AltaCambio(islaBT, BD.Utilidades.Accion.Alta);
            }
            catch (Exception)
            {

                throw;
            }
        }

        public IslaBT Cambio(IslaBT islaBT)
        {
            try
            {
                IslaBD islaBD = new IslaBD(ConstantesRN.BD_CONECTION);
                return islaBD.AltaCambio(islaBT, BD.Utilidades.Accion.Cambio);
            }
            catch (Exception)
            {

                throw;
            }
        }
        public IslaBT Borrado(IslaBT islaBT)
        {
            try
            {
                IslaBD islaBD = new IslaBD(ConstantesRN.BD_CONECTION);
                return islaBD.AltaCambio(islaBT, BD.Utilidades.Accion.Borrar);
            }
            catch (Exception)
            {

                throw;
            }
        }

        public IslaBT BuscarPorId(int id)
        {
            try
            {
                IslaBD islaBD = new IslaBD(ConstantesRN.BD_CONECTION);
                return islaBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.Id, Query: id.ToString()).FirstOrDefault();
            }
            catch (Exception)
            {

                throw;
            }
        }

        public List<IslaBT> BuscarPorPatio(int id)
        {
            try
            {
                IslaBD islaBD = new IslaBD(ConstantesRN.BD_CONECTION);
                return islaBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.PorPatio, Query: id.ToString());
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<IslaBT> DameTodosAlta()
        {
            try
            {
                IslaBD islaBD = new IslaBD(ConstantesRN.BD_CONECTION);
                return islaBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.TodosA);
            }
            catch (Exception)
            {

                throw;
            }
        }

        public List<IslaBT> DameTodos()
        {
            try
            {
                IslaBD islaBD = new IslaBD(ConstantesRN.BD_CONECTION);
                return islaBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.TodosAB);
            }
            catch (Exception)
            {

                throw;
            }
        }

        public List<IslaBT> BuscarPorQuery(string Query)
        {
            try
            {
                IslaBD islaBD = new IslaBD(ConstantesRN.BD_CONECTION);
                return islaBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.QueryA, Query: Query);
            }
            catch (Exception)
            {

                throw;
            }
        }
    }
}
