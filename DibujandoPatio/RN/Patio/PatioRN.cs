using BD.Patio;
using BD.Utilidades;
using BT.Patio;
using BT.Utilidades;
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
                        var verticesActuales = verticeRN.BuscarPorPatio(patioBT.Id);

                        var detalles = patioBT.Vertices
                            .FullJoin(verticesActuales, (cliente, bd) => cliente?.Id == bd?.Id, (cliente, bd) => new
                            {
                                vertice = cliente ?? bd,
                                Accion = bd == null ? Accion.Alta : (cliente == null ? Accion.Borrar : Accion.Cambio)
                            }).ToList();

                        foreach (var vertice in detalles)
                        {
                            vertice.vertice.Patio = patioBT;
                            switch (vertice.Accion)
                            {
                                case Accion.Alta: verticeRN.Agregar(vertice.vertice); break;
                                case Accion.Cambio: verticeRN.Cambio(vertice.vertice); break;
                                case Accion.Borrar: verticeRN.Borrado(vertice.vertice); break;
                                default:
                                    throw new NotImplementedException("Accion no configurada");
                            }
                        }

                        //foreach (var v in patioBT.Vertices)
                        //{
                        //    v.Patio = patioBT;
                        //    if (v.Id > 0)
                        //    {
                        //        verticeRN.Cambio(v);
                        //    }
                        //    else
                        //    {
                        //        verticeRN.Agregar(v);
                        //    }
                        //}

                        //var idsRecibidos = patioBT.Vertices.Where(x => x.Id > 0).Select(x => x.Id).ToList();
                        //foreach (var verticeActual in verticesActuales)
                        //{
                        //    if (!idsRecibidos.Contains(verticeActual.Id))
                        //    {
                        //        verticeRN.Borrado(new VerticeBT { Id = verticeActual.Id });
                        //    }
                        //}
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
