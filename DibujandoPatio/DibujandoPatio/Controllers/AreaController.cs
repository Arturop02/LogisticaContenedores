using BT;
using BT.Patio;
using Newtonsoft.Json;
using RN.Patio;
using System;
using System.Linq;
using System.Web.Mvc;

namespace DibujandoPatio.Controllers
{
    public class AreaController : Controller
    {
        public string RutaBase { get; set; } = "~/Views/Catalogos/Operacion/Area/";

        [HttpPost]
        public JsonResult GuardarArea(AreaBT areaBT)
        {
            AreaRN areaRN = new AreaRN();
            areaRN.Agregar(areaBT);
            return Json(new { ok = true, Area = areaBT });
        }

        [HttpPost]
        public JsonResult EditarArea(AreaBT areaBT)
        {
            try
            {
                AreaRN areaRN = new AreaRN();
                areaRN.Cambio(areaBT);
                return Json(new { ok = true });
            }
            catch
            {
                return Json(new { ok = false });
            }
        }

        [HttpPost]
        public JsonResult BorrarArea(AreaBT areaBT)
        {
            try
            {
                AreaRN areaRN = new AreaRN();
                var area = areaRN.Borrado(areaBT);
                return Json(new { ok = true });
            }
            catch (Exception ex)
            {
                return Json(new { ok = false, error = ex.Message });
            }
        }

        [HttpGet]
        public JsonResult ObtenerAreaPorId(int id)
        {
            AreaRN areaRN = new AreaRN();
            var area = areaRN.BuscarPorId(id);
            if (area != null)
            {
                area.Vertices = new VerticeRN().BuscarPorArea(area.Id);
                return Json(new { ok = true, data = area }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { ok = false, message = "No se pudo encontrar el area con el id" + id }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerIslasPorAreaId(int id)
        {
            AreaRN areaRN = new AreaRN();
            IslaRN islaRN = new IslaRN();
            var area = areaRN.BuscarPorId(id);
            var islas = islaRN.BuscarPorArea(id);
            if (area != null)
            {
                area.Islas = islas;
                return Json(new { ok = true, data = area }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { ok = false, message = "No se pudo encontrar el area con el id " + id }, JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        public JsonResult ObtenerPreview(int id)
        {
            AreaRN areaRN = new AreaRN();
            IslaRN islaRN = new IslaRN();
            var area = areaRN.BuscarPorId(id);
            var islas = islaRN.BuscarPorArea(id);
            if (area != null)
            {
                area.Islas = islas;
                return Json(new { ok = true, data = area }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { ok = false, message = "No se pudo encontrar el area con el id " + id }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ListarAreas()
        {
            AreaRN areaRN = new AreaRN();
            var lista = areaRN.DameTodosAlta()
                .ToList();

            return Json(new { lista }, JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        public ActionResult DibujarLimite(int? Id)
        {
            AreaRN areaRN = new AreaRN();
            var area = areaRN.DameTodosAlta();
            ViewBag.Areas = area;

            PatioRN patioRN = new PatioRN();
            var patios = patioRN.DameTodosAlta();
            ViewBag.Patios = patios;

            if (Id != null)
            {
                var areaSeleccionada = areaRN.BuscarPorId(Id.Value);
                ViewBag.AreaSeleccionada = JsonConvert.SerializeObject(areaSeleccionada);
            }


            return View(RutaBase + "DibujarLimite.cshtml");
        }

        [HttpGet]
        public ActionResult DibujarIsla(int? Id)
        {
            AreaRN areaRN = new AreaRN();
            var area = areaRN.DameTodosAlta();
            ViewBag.Areas = area;

            DetalleEnuRN detalleEnuRN = new DetalleEnuRN();
            var enus = detalleEnuRN.DameTodosAlta();
            ViewBag.Enus = enus;


            EstructuraRN estructuraRN = new EstructuraRN();
            var estructuras = estructuraRN.DameTodosAlta();
            ViewBag.Estructuras = estructuras;

            if (Id != null)
            {
                var areaSeleccionada = areaRN.BuscarPorId(Id.Value);
                ViewBag.AreaSeleccionada = JsonConvert.SerializeObject(areaSeleccionada);
            }

            //ViewBag.IdAreaSeleccionada = id;
            return View(RutaBase + "DibujarIsla.cshtml");
        }

    }
}