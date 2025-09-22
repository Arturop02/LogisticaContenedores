using BD.Patio;
using BD.Utilidades;
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
                return islaBD.AltaCambio(islaBT, Accion.Alta);
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
                return islaBD.AltaCambio(islaBT, Accion.Cambio);
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
                return islaBD.AltaCambio(islaBT, Accion.Borrar);
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
                return islaBD.BuscaPorOpcion(BuscarOpcion.Id, Query: id.ToString()).FirstOrDefault();
            }
            catch (Exception)
            {

                throw;
            }
        }

        public List<IslaBT> BuscarPorArea(int id)
        {
            try
            {
                IslaBD islaBD = new IslaBD(ConstantesRN.BD_CONECTION);
                return islaBD.BuscaPorOpcion(BuscarOpcion.PorArea, Query: id.ToString());
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
                return islaBD.BuscaPorOpcion(BuscarOpcion.TodosA);
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
                return islaBD.BuscaPorOpcion(BuscarOpcion.TodosAB);
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
                return islaBD.BuscaPorOpcion(BuscarOpcion.QueryA, Query: Query);
            }
            catch (Exception)
            {

                throw;
            }
        }
    }
}
