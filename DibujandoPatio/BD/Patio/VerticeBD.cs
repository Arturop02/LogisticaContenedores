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
        public VerticeBT AltaCambio(VerticeBT verticeBT, Accion accion)
        {
            try
            {
                using (SqlConnection conex = new SqlConnection(Conexion))
                {

                    using (SqlCommand cmd = new SqlCommand("dbo.sp_Vertice_AC", conex))
                    {
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.AgregarConValorNull("@Id", verticeBT.Id, output: true);

                        if (accion != Accion.Borrar) {
                            cmd.Parameters.AgregarConValorNull("@IdPatio", verticeBT.Patio.Id);
                            cmd.Parameters.AgregarConValorNull("@X", verticeBT.X);
                            cmd.Parameters.AgregarConValorNull("@Y", verticeBT.Y);
                            cmd.Parameters.AgregarConValorNull("@Orden", verticeBT.Orden);
                        }
                        
                        cmd.Parameters.AgregarConValorNull("@Accion", ((char)accion).ToString());

                        conex.Open();
                        cmd.ExecuteNonQuery();
                        conex.Close();

                        verticeBT.Id = cmd.Parameters.ValorODefecto<int>("@Id");
                    }
                }
                return verticeBT;
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
                SqlCommand comm = new SqlCommand("dbo.sp_Vertice_PorOpcion", conn);
                comm.CommandType = CommandType.StoredProcedure;

                comm.Parameters.AgregarConValorNull("@Opcion", Opcion.ToString());
                comm.Parameters.AgregarConValorNull("@XML", parametroXML.DameXML());

                conn.Open();
                var result = ListaBT<VerticeMapeo>(comm);
                conn.Close();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("No se pudo obtener la información de Vertice", ex);
            }
            finally
            {
                if (conn != null) conn.Dispose();
            }
        }
    }
}
