using BD.Patio;
using BT.Patio;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Transactions;

namespace RN.Patio
{
    public class PatioRN
    {
        public PatioBT Agregar(PatioBT patioBT)
        {
            try
            {
                using (TransactionScope ts = new TransactionScope())
                {
                    PatioBD patioBD = new PatioBD(ConstantesRN.BD_CONECTION);
                    patioBT = patioBD.AltaCambio(patioBT, BD.Utilidades.Accion.Alta);

                    if (patioBT.Vertices != null)
                    {
                        VerticeRN verticeRN = new VerticeRN();
                        foreach (var item in patioBT.Vertices)
                        {
                            item.Patio = patioBT;
                            verticeRN.Agregar(item);
                        }
                    }

                    ts.Complete();
                }
                return patioBT;
            }
            catch (Exception)
            {

                throw;
            }
        }

        public PatioBT Cambio(PatioBT patioBT)
        {
            try
            {
                using (TransactionScope ts = new TransactionScope())
                {
                    PatioBD patioBD = new PatioBD(ConstantesRN.BD_CONECTION);
                    patioBT = patioBD.AltaCambio(patioBT, BD.Utilidades.Accion.Cambio);

                    if (patioBT.Vertices != null)
                    {
                        VerticeRN verticeRN = new VerticeRN();
                        foreach (var item in patioBT.Vertices)
                        {
                            item.Patio = patioBT;
                            verticeRN.Cambio(item);

                        }
                    }

                    ts.Complete();
                }
                return patioBT;
            }
            catch (Exception)
            {

                throw;
            }
        }

        public PatioBT BuscarPorId(int id)
        {
            try
            {
                PatioBD patioBD = new PatioBD(ConstantesRN.BD_CONECTION);
                return patioBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.Id, Query: id.ToString()).FirstOrDefault();
            }
            catch (Exception)
            {

                throw;
            }
        }
        public List<PatioBT> DameTodosAlta()
        {
            try
            {
                PatioBD patioBD = new PatioBD(ConstantesRN.BD_CONECTION);
                return patioBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.TodosA);
            }
            catch (Exception)
            {

                throw;
            }
        }

        public List<PatioBT> DameTodos()
        {
            try
            {
                PatioBD patioBD = new PatioBD(ConstantesRN.BD_CONECTION);
                return patioBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.TodosAB);
            }
            catch (Exception)
            {

                throw;
            }
        }

        public List<PatioBT> BuscarPorQuery(string Query)
        {
            try
            {
                PatioBD patioBD = new PatioBD(ConstantesRN.BD_CONECTION);
                return patioBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.QueryA, Query: Query);
            }
            catch (Exception)
            {

                throw;
            }
        }
    }
}
