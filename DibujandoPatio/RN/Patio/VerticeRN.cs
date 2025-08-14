using BD.Patio;
using BT.Patio;
using System;
using System.Collections.Generic;
using System.Linq;

namespace RN.Patio
{
    public class VerticeRN
    {
        public VerticeBT Agregar(VerticeBT VerticeBT)
        {
            try
            {
                VerticeBD verticeBD = new VerticeBD(ConstantesRN.BD_CONECTION);
                return verticeBD.AltaCambio(VerticeBT, BD.Utilidades.Accion.Alta);
            }
            catch (Exception)
            {

                throw;
            }
        }

        public VerticeBT Cambio(VerticeBT VerticeBT)
        {
            try
            {
                VerticeBD verticeBD = new VerticeBD(ConstantesRN.BD_CONECTION);
                return verticeBD.AltaCambio(VerticeBT, BD.Utilidades.Accion.Cambio);
            }
            catch (Exception)
            {

                throw;
            }
        }

        public VerticeBT BuscarPorId(int id)
        {
            try
            {
                VerticeBD verticeBD = new VerticeBD(ConstantesRN.BD_CONECTION);
                return verticeBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.Id, Query: id.ToString()).FirstOrDefault();
            }
            catch (Exception)
            {

                throw;
            }
        }
        public List<VerticeBT> DameTodosAlta()
        {
            try
            {
                VerticeBD verticeBD = new VerticeBD(ConstantesRN.BD_CONECTION);
                return verticeBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.TodosA);
            }
            catch (Exception)
            {

                throw;
            }
        }

        public List<VerticeBT> DameTodos()
        {
            try
            {
                VerticeBD verticeBD = new VerticeBD(ConstantesRN.BD_CONECTION);
                return verticeBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.TodosAB);
            }
            catch (Exception)
            {

                throw;
            }
        }

        public List<VerticeBT> BuscarPorQuery(string Query)
        {
            try
            {
                VerticeBD verticeBD = new VerticeBD(ConstantesRN.BD_CONECTION);
                return verticeBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.QueryA, Query: Query);
            }
            catch (Exception)
            {

                throw;
            }
        }
    }
}
