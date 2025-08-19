using BT.Patio;
using RN.Patio;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web.Mvc;

namespace DibujandoPatio.Controllers
{
    public class PatioController : Controller
    {
        private string conexion = ConfigurationManager.ConnectionStrings["mapaConnection"].ConnectionString;

        [HttpPost]
        public JsonResult GuardarPatio(PatioBT patioBT)
        {
            PatioRN patioRN = new PatioRN();
            patioRN.Agregar(patioBT);

            return Json(new { ok = true });
        }
        [HttpGet]
        public JsonResult ObtenerPatiosPorId(int id)
        {
            System.Diagnostics.Debug.WriteLine("Id recibido en controller: " + id);
            PatioRN patioRN = new PatioRN();
            var patio = patioRN.BuscarPorId(id);
            System.Diagnostics.Debug.WriteLine("Datos del patio: " + patio);
            if (patio != null)
            {
                patio.Vertices = new VerticeRN().BuscarPorPatio(patio.Id);
                return Json(new { ok = true, data = patio }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { ok = false, message = "No se encontró el patio con Id " + id }, JsonRequestBehavior.AllowGet);
        }
        
        public JsonResult ListarPatios()
        {
            List<object> patios = new List<object>();
            using (SqlConnection conex = new SqlConnection(conexion))
            {
                conex.Open();
                using (SqlCommand cmd = new SqlCommand("SELECT * FROM Patio", conex))
                {
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            patios.Add(new
                            {
                                Id = (int)reader["Id"],
                                Nombre = reader["Nombre"].ToString(),
                                Escala = (decimal)reader["Escala"],
                                Activo = (bool)reader["Activo"]
                            });
                        }
                    }
                }
                conex.Close();
            }
            return Json(patios, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult BuscarPatioPorOpcion(PatioBT patioBT)
        {
            PatioRN patioRN = new PatioRN();
            patioRN.BuscarPorId(patioBT.Id);
            return Json(new { ok = true });
        }
        public ActionResult Index()
        {
            return View();
        }
    }
}