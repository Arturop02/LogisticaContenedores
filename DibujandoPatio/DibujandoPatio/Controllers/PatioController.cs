
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using static DibujandoPatio.Models.PatioLayout;

namespace DibujandoPatio.Controllers
{
    public class PatioController : Controller
    {
        private string conexion = ConfigurationManager.ConnectionStrings["mapaConnection"].ConnectionString;

        [HttpPost]
        public JsonResult GuardarPatio(string nombre, decimal escala, List<Vertice> vertices)
        {
            var dtVertices = new DataTable();
            dtVertices.Columns.Add("X",  typeof(float));
            dtVertices.Columns.Add("Y", typeof(float));
            dtVertices.Columns.Add("Orden", typeof(int));

            int orden = 0;
            foreach (Vertice vertice in vertices) { 
                dtVertices.Rows.Add(vertice.X, vertice.Y, orden++);
            }

            using (SqlConnection conex = new SqlConnection(conexion)) { 
                conex.Open();

                using (SqlCommand cmd = new SqlCommand("sp_dibujar_patio", conex))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    //cmd.Parameters.AddWithValue("@Id", id);
                    cmd.Parameters.AddWithValue("@Nombre", nombre);
                    cmd.Parameters.AddWithValue("@Escala", escala);

                    var param = cmd.Parameters.AddWithValue("@Vertices", dtVertices);
                    param.SqlDbType = SqlDbType.Structured;
                    param.TypeName = "VerticeTPV";

                    cmd.ExecuteNonQuery();
                }

                conex.Close();
                
            }

            return Json(new {ok = true});
        }

        /*public JsonResult obtenerPatio()
        {
            List<Patio> patios = new List<Patio>();

            using (SqlConnection conn = new SqlConnection(conexion))
            {
                conn.Open();
                using (SqlCommand cmd = new SqlCommand("SELECT * FROM v_obtener_patio", conn)) { 
                    
                    using(SqlDataReader reader = cmd.ExecuteReader())
                    {
                        int? patioActual = null;
                        Patio patio = null;

                        while (reader.Read())
                        {
                            int id = (int)reader["Id"];

                            if(patioActual == null || patioActual != id)
                            {
                                patio = new Patio
                                {
                                    Nombre = reader["NombrePatio"].ToString(),
                                    Escala = (decimal)reader["Escala"],
                                    Vertices = new List<Vertice>()
                                };
                                patios.Add(patio);
                                patioActual = id;
                            }

                            patio.Vertices.Add(new Vertice
                            {
                                X = float.Parse(reader["X"].ToString()),
                                Y = float.Parse(reader["Y"].ToString())
                            });

                        }
                    }
                    conn.Close();
                }

                return Json(patios, JsonRequestBehavior.AllowGet);

            }
        }*/

        public JsonResult ListarPatios()
        {
            List<object> patios = new List<object>();
            using (SqlConnection conex = new SqlConnection(conexion))
            {
                conex.Open();
                using (SqlCommand cmd = new SqlCommand("SELECT Id, NombrePatio FROM Patio", conex))
                {
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            patios.Add(new
                            {
                                Id = (int)reader["Id"],
                                Nombre = reader["NombrePatio"].ToString()
                            });
                        }
                    }
                }
                conex.Close();
            }
            return Json(patios, JsonRequestBehavior.AllowGet);
        }

        public JsonResult ObtenerPatioId(int Id)
        {
            Patio patio = null;

            using (SqlConnection conex = new SqlConnection(conexion))
            {
                conex.Open();
                using (SqlCommand cmd = new SqlCommand("SELECT * FROM v_obtener_patio WHERE Id = @Id", conex))
                {
                    cmd.Parameters.AddWithValue("@Id", Id);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            if(patio == null)
                            {
                                patio = new Patio
                                {
                                    Nombre = reader["NombrePatio"].ToString(),
                                    Escala = (decimal)reader["Escala"],
                                    Vertices = new List<Vertice>()
                                };
                            }
                            patio.Vertices.Add(new Vertice
                            {
                                X = float.Parse(reader["X"].ToString()),
                                Y = float.Parse(reader["Y"].ToString())
                            });
                        }
                    }
                }
                conex.Close();
            }
            return Json(patio, JsonRequestBehavior.AllowGet);
        }


        public ActionResult Index()
        {
            return View();
        }
    }
}