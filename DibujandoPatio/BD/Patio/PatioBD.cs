using BD.Patio.Mapeo;
using BD.Utilidades;
using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace BD.Patio
{
    public class PatioBD : BaseBD<PatioBT>
    {
        public PatioBD(string conexion) : base(conexion) { }
        public PatioBT AltaCambio(PatioBT patioBT, Accion accion)
        {
            try
            {
                using (SqlConnection conex = new SqlConnection(Conexion))
                {

                    using (SqlCommand cmd = new SqlCommand("opera.o_cat_Patio_AC", conex))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AgregarConValorNull("@Id", patioBT.Id, output: true);
                        cmd.Parameters.AgregarConValorNull("@Nombre", patioBT.Nombre);
                        cmd.Parameters.AgregarConValorNull("@Accion", ((char)accion).ToString());

                        conex.Open();
                        cmd.ExecuteNonQuery();
                        conex.Close();

                        patioBT.Id = cmd.Parameters.ValorODefecto<int>("@Id");
                    }
                }
                return patioBT;
            }
            catch (Exception ex)
            {
                throw new Exception("No se pudo guardar en base de datos por el siguiente error: " + ex);
            }
        }

        public List<PatioBT> BuscaPorOpcion(BuscarOpcion Opcion, string Query = null, ParametroXML parametroXML = null)
        {
            SqlConnection conn = null;
            try
            {
                if (parametroXML == null)
                    parametroXML = new ParametroXML();

                if (!string.IsNullOrEmpty(Query))
                    parametroXML.Agregar("Buscar", Query);

                conn = new SqlConnection(Conexion);
                SqlCommand comm = new SqlCommand("opera.o_cat_Patio_PorOpcion", conn);
                comm.CommandType = CommandType.StoredProcedure;
                
                comm.Parameters.AgregarConValorNull("@Opcion", Opcion.ToString());
                comm.Parameters.AgregarConValorNull("@XML", parametroXML.ToString());

                conn.Open();
                var result = ListaBT<PatioMapeo>(comm);
                conn.Close();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("No se pudo obtener la información del patio", ex);
            }
            finally
            {
                if (conn != null) conn.Dispose();
            }
        }
    }
}
