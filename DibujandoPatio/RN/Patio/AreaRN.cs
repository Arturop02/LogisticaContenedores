using BD.Patio;
using BD.Utilidades;
using BT;
using BT.Utilidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Transactions;

namespace RN.Patio
{
    public class AreaRN
    {
        public AreaBT Agregar(AreaBT areaBT)
        {
            try
            {
                using(TransactionScope ts = new TransactionScope())
                {
                    AreaBD areaBD = new AreaBD(ConstantesRN.BD_CONECTION);
                    areaBT =  areaBD.AltaCambio(areaBT, Accion.Alta);

                    if(areaBT.Vertices != null)
                    {
                        VerticeRN verticeRN = new VerticeRN();
                        foreach(var item in areaBT.Vertices)
                        {
                            item.Area = areaBT;
                            item.Area.Id = areaBT.Id;
                            verticeRN.Agregar(item);
                        }
                    }
                    ts.Complete();

                }
                return areaBT;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public AreaBT Cambio(AreaBT areaBT)
        {
            try
            {
                using (TransactionScope ts = new TransactionScope())
                {

                    AreaBD areaBD = new AreaBD(ConstantesRN.BD_CONECTION);
                    areaBT = areaBD.AltaCambio(areaBT, BD.Utilidades.Accion.Cambio);

                    if (areaBT.Vertices != null)
                    {
                        VerticeRN verticeRN = new VerticeRN();
                        var verticesActuales = verticeRN.BuscarPorArea(areaBT.Id);

                        var detalles = areaBT.Vertices
                            .FullJoin(verticesActuales, (cliente, bd) => cliente?.Id == bd?.Id, (cliente, bd) => new
                            {
                                vertice = cliente ?? bd,
                                Accion = bd == null ? Accion.Alta : (cliente == null ? Accion.Borrar : Accion.Cambio)
                            }).ToList();

                        foreach (var vertice in detalles)
                        {
                            if(vertice.vertice.Area == null) vertice.vertice.Area = new AreaBT();
                            vertice.vertice.Area.Id = areaBT.Id;

                            //vertice.vertice.Area = areaBT;
                            switch (vertice.Accion)
                            {
                                case Accion.Alta: verticeRN.Agregar(vertice.vertice); break;
                                case Accion.Cambio: verticeRN.Cambio(vertice.vertice); break;
                                case Accion.Borrar: verticeRN.Borrado(vertice.vertice); break;
                                default:
                                    throw new NotImplementedException("Accion no configurada");
                            }
                        }

                    }
                    ts.Complete();

                }
                return areaBT;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public AreaBT Borrado(AreaBT areaBT)
        {
            try
            {
                AreaBD areaBD = new AreaBD(ConstantesRN.BD_CONECTION);
                return areaBD.AltaCambio(areaBT, Accion.Borrar);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public AreaBT BuscarPorId(int id)
        {
            try
            {
                AreaBD areaBD = new AreaBD(ConstantesRN.BD_CONECTION);
                return areaBD.BuscaPorOpcion(BuscarOpcion.Id, Query: id.ToString()).FirstOrDefault();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<AreaBT> DameTodosAlta()
        {
            try
            {
                AreaBD areaBD = new AreaBD(ConstantesRN.BD_CONECTION);
                return areaBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.TodosA);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<AreaBT> DameTodos()
        {
            try
            {
                AreaBD areaBD = new AreaBD(ConstantesRN.BD_CONECTION);
                return areaBD.BuscaPorOpcion(BD.Utilidades.BuscarOpcion.TodosAB);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
