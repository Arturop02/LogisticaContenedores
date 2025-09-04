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
    public class CatalogoOrientacionBD : BaseBD<CatalogoOrientacionBT>
    {
        public CatalogoOrientacionBD(string conexion) : base(conexion) { }

        public CatalogoOrientacionBT AltaCambio(CatalogoOrientacionBT catalogoOrientacionBT, Accion accion)
        {
            try
            {
                using (var conex = new SqlConnection(Conexion))
                {
                    using (var cmd = new SqlCommand("dbo.sp_CatalogoOrientacion_AC", conex))
                    {
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.AgregarConValorNull("@IdCatalogoOrientacion", catalogoOrientacionBT.Id, output: true);
                        cmd.Parameters.AgregarConValorNull("@Orientation", catalogoOrientacionBT.Orientacion);
                        cmd.Parameters.AgregarConValorNull("@Angulo", catalogoOrientacionBT.Angulo);
                        cmd.Parameters.AgregarConValorNull("@Accion", accion.ToString());
                        
                        conex.Open();
                        cmd.ExecuteNonQuery();
                        conex.Close();

                        catalogoOrientacionBT.Id = cmd.Parameters.ValorODefecto<int>("@IdCatalogoOrientacion");
                    }
                }
                return catalogoOrientacionBT;
            }
            catch (Exception ex)
            {
                throw new Exception("No se pudo guardar en base de datos por el siguiente error: " + ex);
            }
        }

        public List<CatalogoOrientacionBT> BuscaPorOpcion(BuscarOpcion Opcion, string Query = null, ParametroXML parametroXML = null)
        {
            SqlConnection conn = null;
            try
            {
                if (parametroXML == null)
                    parametroXML = new ParametroXML();

                if (!string.IsNullOrEmpty(Query))
                    parametroXML.Agregar("Buscar", Query);

                conn = new SqlConnection(Conexion);
                SqlCommand comm = new SqlCommand("dbo.sp_CatalogoOrientacion_PorOpcion", conn);
                comm.CommandType = System.Data.CommandType.StoredProcedure;

                comm.Parameters.AgregarConValorNull("@Opcion", Opcion.ToString());
                comm.Parameters.AgregarConValorNull("@XML", parametroXML.ToString());
                
                conn.Open();
                var result = ListaBT<CatalogoOrientacionMapeo>(comm);
                conn.Close();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("No se pudo consultar en base de datos por el siguiente error: " + ex);
            }
            finally
            {
                if (conn != null ) conn.Dispose();
            }
        }

    }

    
}
