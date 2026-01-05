using BT.Patio;
using Newtonsoft.Json;
using RN.Patio;
using System;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web.Mvc;
using System.Web.Services.Description;

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
            try
            {
                PatioRN patioRN = new PatioRN();
                VerticeRN verticeRN = new VerticeRN();

                var patio = patioRN.Cambio(patioBT);

                return Json(new { ok = true });
            }
            catch (Exception)
            {
                return Json(new { ok = false });
            }
        }

        [HttpPost]
        public JsonResult BorrarPatio(int id)
        {
            try
            {
                PatioRN patioRN = new PatioRN();
                PatioBT patioBT = new PatioBT { Id = id};
                patioRN.Borrar(patioBT);

                return Json(new { ok = true });
            }
            catch (Exception ex)
            {
                return Json(new { ok = false, error= ex.Message});
            }
        }

        [HttpGet]
        public JsonResult ObtenerPatiosPorId(int id)
        {
            PatioRN patioRN = new PatioRN();
            var patio = patioRN.BuscarPorId(id);
            if (patio != null)
            {
                return Json(new { ok = true, data = patio }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { ok = false, message = "No se encontró el patio con Id " + id }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerTodoPorPatioId(int id)
        {
            PatioRN patioRN = new PatioRN();
            AreaRN areaRN = new AreaRN();
            IslaRN islaRN = new IslaRN();
            VerticeRN verticeRN = new VerticeRN();

            var patio = patioRN.BuscarPorId(id);
            if (patio == null)
                return Json(new { ok = false, message = "patio no encontrado" }, JsonRequestBehavior.AllowGet);

            var areas = areaRN.BuscarPorPatioId(id);
            if(areas == null)
                return Json(new { ok = false, message = "patio no encontrado" }, JsonRequestBehavior.AllowGet);

            foreach(var a in areas)
            {
                var areaId = a.Id;
                var islas = islaRN.BuscarPorArea(areaId);
                var vertices = verticeRN.BuscarPorArea(areaId);
                a.Islas = islas;
                a.Vertices = vertices;
            }
            return Json(new { ok = true, data = areas }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ListarPatios()
        {
            PatioRN patioRN = new PatioRN();
            var lista = patioRN.DameTodosAlta()
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
        public ActionResult Index(int? Id)
        {
            PatioRN patioRN = new PatioRN();
            var patio = patioRN.DameTodosAlta();
            ViewBag.Patios = patio;

            AreaRN areaRN = new AreaRN();
            var area = areaRN.DameTodosAlta();
            ViewBag.Areas = area;

            if(Id != null)
            {
                var patioSeleccionado = patioRN.BuscarPorId(Id.Value);
                ViewBag.PatioSeleccionado = JsonConvert.SerializeObject(patioSeleccionado);
            }

            //ViewBag.IdPatioSeleccionado = TempData["IdPatioSeleccionado"] ?? 0;
            return View();
        }
    }
}