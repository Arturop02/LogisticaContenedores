using BD.Patio.Mapeo;
using BD.Utilidades;
using BT;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using BT.Patio;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio
{
    public class AreaBD : BaseBD<AreaBT>
    {
        public AreaBD(string conexion) : base(conexion) { }

        public AreaBT AltaCambio(AreaBT areaBT, Accion accion)
        {
            try
            {
                using (SqlConnection conex = new SqlConnection(Conexion))
                {
                    using (SqlCommand cmd = new SqlCommand("opera.o_cat_Area_AC", conex))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AgregarConValorNull("@ide_Area", areaBT.Id, output: true);
                        cmd.Parameters.AgregarConValorNull("@Nombre", areaBT.Nombre);
                        cmd.Parameters.AgregarConValorNull("@ide_Patio", areaBT.Patio?.Id);
                        cmd.Parameters.AgregarConValorNull("@est_cve", areaBT.Est_cve);

                        cmd.Parameters.AgregarConValorNull("@Accion", ((char)accion).ToString());

                        conex.Open();
                        cmd.ExecuteNonQuery();
                        conex.Close();

                        areaBT.Id = cmd.Parameters.ValorODefecto<int>("@ide_Area");
                    }
                }
                return areaBT;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public List<AreaBT> BuscaPorOpcion(BuscarOpcion Opcion, string Query = null, ParametroXML parametroXML = null)
        {
            SqlConnection conn = null;
            try
            {
                if (parametroXML == null) parametroXML = new ParametroXML();

                if (!string.IsNullOrEmpty(Query))
                    parametroXML.Agregar("Buscar", Query);

                conn = new SqlConnection(Conexion);
                SqlCommand comm = new SqlCommand("opera.o_cat_Area_PorOpcion", conn);
                comm.CommandType = CommandType.StoredProcedure;

                comm.Parameters.AgregarConValorNull("@Opcion", Opcion.ToString());
                comm.Parameters.AgregarConValorNull("@XML", parametroXML.DameXML());

                conn.Open();
                var areas = ListaBT<AreaMapeo>(comm);
                conn.Close();
                return areas;
            }
            catch (Exception ex)
            {
                throw new Exception("Mo se obtiene informacion del area", ex);
            }
            finally
            {
                if (conn != null) conn.Dispose();
            }
        }
    }
}
