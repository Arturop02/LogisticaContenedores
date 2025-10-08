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
    public class DetalleEnuRN
    {
        public DetalleEnuBT Agregar(DetalleEnuBT detalleEnuBT)
        {
            try
            {
                using (TransactionScope ts = new TransactionScope())
                { 
                    DetalleEnuBD detalleEnuBD = new DetalleEnuBD(ConstantesRN.BD_CONECTION);
                    detalleEnuBT = detalleEnuBD.AltaCambio(detalleEnuBT, Accion.Alta);
                    ts.Complete();
                }
                return detalleEnuBT;
            }
            catch (Exception)
            {
                throw;
            }
        }
        
        public DetalleEnuBT Cambio(DetalleEnuBT detalleEnuBT)
        {
            try
            {
                using (TransactionScope ts = new TransactionScope())
                {
                    DetalleEnuBD detalleEnuBD = new DetalleEnuBD(ConstantesRN.BD_CONECTION);
                    detalleEnuBT = detalleEnuBD.AltaCambio(detalleEnuBT, Accion.Cambio);
                    ts.Complete();
                }
                return detalleEnuBT;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public DetalleEnuBT BuscarPorId(int id)
        {
            try
            {
                using (TransactionScope ts = new TransactionScope())
                {
                    DetalleEnuBD detalleEnuBD = new DetalleEnuBD(ConstantesRN.BD_CONECTION);
                    return detalleEnuBD.BuscaPorOpcion(BuscarOpcion.Id, id.ToString()).FirstOrDefault();
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<DetalleEnuBT> DameTodosAlta(BuscarOpcion Opcion, string Query = null, ParametroXML parametroXML = null)
        {
            try
            {
                DetalleEnuBD detalleEnuBD = new DetalleEnuBD(ConstantesRN.BD_CONECTION);
                return detalleEnuBD.BuscaPorOpcion(BuscarOpcion.TodosA);
                
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<DetalleEnuBT> DameTodos()
        {
            try
            {
                DetalleEnuBD detalleEnuBD = new DetalleEnuBD(ConstantesRN.BD_CONECTION);
                return detalleEnuBD.BuscaPorOpcion(BuscarOpcion.TodosAB);
            }
            catch(Exception ex)
            {
                throw;
            }
        }
    }
}
