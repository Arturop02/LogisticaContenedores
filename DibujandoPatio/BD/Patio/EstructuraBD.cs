using BD.Patio.Mapeo;
using BD.Utilidades;
using BT.Patio;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.Patio
{
    public class EstructuraBD : BaseBD<EstructuraBT>
    {
        public EstructuraBD(string conexion) : base(conexion) { }

        public EstructuraBT AltaCambio(EstructuraBT estructuraBT, Accion accion)
        {
            try
            {
                using (SqlConnection conexion = new SqlConnection(Conexion))
                {
                    using (SqlCommand cmd = new SqlCommand("opera.o_cat_Estructura_AC", conexion))
                    {
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        
                        cmd.Parameters.AgregarConValorNull("@Id", estructuraBT.Id, output: true);
                        cmd.Parameters.AgregarConValorNull("@Descripcion", estructuraBT.Descripcion);
                        cmd.Parameters.AgregarConValorNull("@ClaveMov", estructuraBT.ClaveMov);
                        cmd.Parameters.AgregarConValorNull("@Icono", estructuraBT.Icono);
                        cmd.Parameters.AgregarConValorNull("@ide_Detalle_Enu", estructuraBT.DetalleTipoEstructura.Id);
                        string color = estructuraBT.Color.Trim();
                        if (color.Length > 8) color = color.Substring(0, 8);
                        cmd.Parameters.AgregarConValorNull("@Color", color);
                        cmd.Parameters.AgregarConValorNull("@Accion", ((char)accion).ToString());

                        conexion.Open();
                        cmd.ExecuteNonQuery();
                        conexion.Close();

                        estructuraBT.Id = cmd.Parameters.ValorODefecto<int>("@Id");
                    }
                }
                return estructuraBT;
            }
            catch (Exception ex)
            {
                throw;
            }
        }


        public List<EstructuraBT> BuscaPorOpcion(BuscarOpcion Opcion, string Query = null, ParametroXML parametroXML = null)
        {
            SqlConnection conn = null;
            try
            {
                if (parametroXML == null) parametroXML = new ParametroXML();

                if (!string.IsNullOrEmpty(Query))
                    parametroXML.Agregar("Buscar", Query);

                conn = new SqlConnection(Conexion);
                SqlCommand comm = new SqlCommand("opera.o_cat_Estructura_PorOpcion", conn);
                comm.CommandType = System.Data.CommandType.StoredProcedure;

                comm.Parameters.AgregarConValorNull("@Opcion", Opcion.ToString());
                comm.Parameters.AgregarConValorNull("@XML", parametroXML.DameXML());

                conn.Open();
                var estructuras = ListaBT<EstructuraMapeo>(comm);
                conn.Close();
                return estructuras;
            }
            catch (Exception ex)
            {
                throw new Exception("Mo se obtiene informacion de la estructura", ex); ;
            }
            finally
            {
                if (conn != null) conn.Dispose();
            }
        }
    }
}
