using BD.Patio;
using BD.Utilidades;
using BT.Patio;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;

namespace RN.Patio
{
    public class EstructuraRN
    {
        public EstructuraBT Agregar(EstructuraBT estructuraBT)
        {
            try
            {
                using (TransactionScope ts = new TransactionScope())
                {
                    EstructuraBD estructuraBD = new EstructuraBD(ConstantesRN.BD_CONECTION);
                    estructuraBT = estructuraBD.AltaCambio(estructuraBT, Accion.Alta);
                    ts.Complete();
                }
                return estructuraBT;
            }
            catch (Exception)
            {
                throw;

            }
        }

        public EstructuraBT Cambio(EstructuraBT estructuraBT)
        {
            try
            {
                using (TransactionScope ts = new TransactionScope())
                {
                    EstructuraBD estructuraBD = new EstructuraBD(ConstantesRN.BD_CONECTION);
                    estructuraBT = estructuraBD.AltaCambio(estructuraBT, Accion.Cambio);
                    ts.Complete();
                }
                return estructuraBT;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public EstructuraBT Borrado(EstructuraBT estructuraBT)
        {
            try
            {
                using (TransactionScope ts = new TransactionScope())
                {
                    EstructuraBD estructuraBD = new EstructuraBD(ConstantesRN.BD_CONECTION);
                    estructuraBT = estructuraBD.AltaCambio(estructuraBT, Accion.Borrar);
                    ts.Complete();
                }
                return estructuraBT;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public EstructuraBT BuscarPorId(int id)
        {
            try
            {
                EstructuraBD estructuraBD = new EstructuraBD(ConstantesRN.BD_CONECTION);
                return estructuraBD.BuscaPorOpcion(BuscarOpcion.Id, id.ToString()).FirstOrDefault();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<EstructuraBT> DameTodosAlta()
        {
            try
            {
                EstructuraBD estructuraBD = new EstructuraBD(ConstantesRN.BD_CONECTION);
                return estructuraBD.BuscaPorOpcion(BuscarOpcion.TodosA);
            }
            catch (Exception)
            {
                throw;
            }
        }
        public List<EstructuraBT> DameTodos()
        {
            try
            {
                EstructuraBD estructuraBD = new EstructuraBD(ConstantesRN.BD_CONECTION);
                return estructuraBD.BuscaPorOpcion(BuscarOpcion.TodosAB);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
