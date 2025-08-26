using BD.Isla;
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
    public class IslaBD : BaseBD<IslaBT>
    {
        public IslaBD(string conexion) : base(conexion) { }

        public IslaBT AltaCambio(IslaBT islaBT, Accion accion)
        {
            try
            {
                using (SqlConnection conex = new SqlConnection(Conexion))
                {

                    using (SqlCommand cmd = new SqlCommand("dbo.sp_Isla_AC", conex))
                    {
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.AgregarConValorNull("@Id", islaBT.Id, output: true);
                        cmd.Parameters.AgregarConValorNull("@IdPatio", islaBT.Patio?.Id);
                        cmd.Parameters.AgregarConValorNull("@Nombre", islaBT.Nombre);
                        cmd.Parameters.AgregarConValorNull("Orientacion", islaBT.Orientacion);
                        cmd.Parameters.AgregarConValorNull("@X", islaBT.X);
                        cmd.Parameters.AgregarConValorNull("@Y", islaBT.Y);
                        cmd.Parameters.AgregarConValorNull("Ancho", islaBT.Ancho);
                        cmd.Parameters.AgregarConValorNull("Alto", islaBT.Alto);
                        cmd.Parameters.AgregarConValorNull("@NumeroBahias", islaBT.NumeroBahias);
                        cmd.Parameters.AgregarConValorNull("@Observaciones", islaBT.Observaciones);

                        cmd.Parameters.AgregarConValorNull("@Accion", ((char)accion).ToString());

                        conex.Open();
                        cmd.ExecuteNonQuery();
                        conex.Close();

                        islaBT.Id = cmd.Parameters.ValorODefecto<int>("@Id");
                    }
                }
                return islaBT;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public List<IslaBT> BuscaPorOpcion(BuscarOpcion Opcion, string Query = null, ParametroXML parametroXML = null)
        {
            SqlConnection conn = null;
            try
            {
                if (parametroXML == null)
                    parametroXML = new ParametroXML();

                if (!string.IsNullOrEmpty(Query))
                    parametroXML.Agregar("Buscar", Query);

                conn = new SqlConnection(Conexion);
                SqlCommand comm = new SqlCommand("dbo.sp_Isla_PorOpcion", conn);
                comm.CommandType = CommandType.StoredProcedure;

                comm.Parameters.AgregarConValorNull("@Opcion", Opcion.ToString());
                comm.Parameters.AgregarConValorNull("@XML", parametroXML.DameXML());

                conn.Open();
                var result = ListaBT<IslaMapeo>(comm);
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
