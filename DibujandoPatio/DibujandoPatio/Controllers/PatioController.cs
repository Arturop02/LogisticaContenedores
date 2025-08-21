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

        [HttpPost]
        public JsonResult EditarPatio(PatioBT patioBT)
        {
            PatioRN patioRN = new PatioRN();
            VerticeRN verticeRN = new VerticeRN();

            var patio = patioRN.Cambio(patioBT);

            if(patioRN != null)
            {
                var verticesActuales = verticeRN.BuscarPorPatio(patioBT.Id);

                foreach (var v in patioBT.Vertices)
                {
                    if (v.Id > 0)
                    {
                        verticeRN.Cambio(v);
                    }
                    else
                    {
                        verticeRN.Agregar(v);
                    }
                }

                var idsRecibidos = patioBT.Vertices.Where(x => x.Id > 0).Select(x => x.Id).ToList();
                foreach (var verticeActual in verticesActuales)
                {
                    if (!idsRecibidos.Contains(verticeActual.Id))
                    {
                        verticeRN.Borrado(new VerticeBT {Id = verticeActual.Id });
                    }
                }

                return Json(new { ok = true });
            }
            return Json(new { ok = false });
        }

        [HttpGet]
        public JsonResult ObtenerPatiosPorId(int id)
        {
            PatioRN patioRN = new PatioRN();
            var patio = patioRN.BuscarPorId(id);
            if (patio != null)
            {
                patio.Vertices = new VerticeRN().BuscarPorPatio(patio.Id);
                return Json(new { ok = true, data = patio }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { ok = false, message = "No se encontró el patio con Id " + id }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ListarPatios()
        {
            PatioRN patioRN = new PatioRN();
            var lista = patioRN.DameTodosAlta()
                .Where(p => p.Activo)
                .ToList();
            return Json(lista, JsonRequestBehavior.AllowGet);
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