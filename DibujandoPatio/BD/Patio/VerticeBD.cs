using BD.Patio.Mapeo;
using BD.Utilidades;
using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace BD.Patio
{
    public class VerticeBD : BaseBD<VerticeBT>
    {
        public VerticeBD(string conexion) : base(conexion) { }
        public VerticeBT AltaCambio(VerticeBT patioBT, Accion accion)
        {
            try
            {
                using (SqlConnection conex = new SqlConnection(Conexion))
                {

                    using (SqlCommand cmd = new SqlCommand("[dbo].[sp_Patio_AC]", conex))
                    {
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.AgregarConValorNull("@IdPatio", patioBT.Id, output: true);
                        cmd.Parameters.AgregarConValorNull("@Accion", char.Parse(accion.ToString()));

                        conex.Open();
                        cmd.ExecuteNonQuery();
                        conex.Close();

                        patioBT.Id = cmd.Parameters.ValorODefecto<int>("@IdPatio");
                    }
                }
                return patioBT;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public List<VerticeBT> BuscaPorOpcion(BuscarOpcion Opcion, string Query = null, ParametroXML parametroXML = null)
        {
            SqlConnection conn = null;
            try
            {
                if (parametroXML == null)
                    parametroXML = new ParametroXML();

                if (!string.IsNullOrEmpty(Query))
                    parametroXML.Agregar("Buscar", Query);

                conn = new SqlConnection(Conexion);
                SqlCommand comm = new SqlCommand("dbo.sp_Patio_PorOpcion", conn);
                comm.CommandType = CommandType.StoredProcedure;
                comm.Parameters.AgregarConValorNull("@Opcion", Opcion);
                comm.Parameters.AgregarConValorNull("@XML", Query);

                conn.Open();
                var result = ListaBT<VerticeMapeo>(comm);
                conn.Close();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("No se pudo obtener la información de Producto", ex);
            }
            finally
            {
                if (conn != null) conn.Dispose();
            }
        }
    }
}
