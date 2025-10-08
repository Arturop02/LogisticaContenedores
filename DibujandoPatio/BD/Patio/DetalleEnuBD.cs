using BD.Patio.Mapeo;
using BD.Utilidades;
using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio
{
    public class DetalleEnuBD: BaseBD<DetalleEnuBT>
    {
        public DetalleEnuBD(string conexion): base(conexion){ }
        public DetalleEnuBT AltaCambio(DetalleEnuBT detalleEnuBT, Accion accion)
        {
            try
            {
                using (SqlConnection conexion = new SqlConnection())
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandText = "utili.o_dca_Detalle_Enu_AC";

                        cmd.Parameters.AgregarConValorNull("@Id", detalleEnuBT.Id, output: true);
                        cmd.Parameters.AgregarConValorNull("@Descripcion", detalleEnuBT.Descripcion);
                        cmd.Parameters.AgregarConValorNull("@Valor", detalleEnuBT.Valor);

                        cmd.Parameters.AgregarConValorNull("@Accion", ((char)accion).ToString());

                        conexion.Open();
                        cmd.ExecuteNonQuery();
                        conexion.Close();

                        detalleEnuBT.Id = cmd.Parameters.ValorODefecto<int>("@Id");
                    }
                }
                return detalleEnuBT;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public List<DetalleEnuBT> BuscaPorOpcion(BuscarOpcion Opcion, string Query = null, ParametroXML parametroXML = null)
        {
            SqlConnection conn = null;
            try
            {
                if (parametroXML == null) parametroXML = new ParametroXML();
                
                if (!string.IsNullOrEmpty(Query)) 
                    parametroXML.Agregar("Query", Query);
                
                conn = new SqlConnection(Conexion);
                SqlCommand comm = new SqlCommand("utili.o_dca_DetalleEnu_PorOpcion");
                comm.CommandType = CommandType.StoredProcedure;
                comm.Parameters.AgregarConValorNull("@Opcion", Opcion.ToString());
                comm.Parameters.AgregarConValorNull("@XML", parametroXML.DameXML());

                conn.Open();
                var result = ListaBT<DetalleEnuMapeo>(comm);
                conn.Close();
                return result;
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                if (conn != null && conn.State == System.Data.ConnectionState.Open) conn.Close();
            }
        }
    }
}
