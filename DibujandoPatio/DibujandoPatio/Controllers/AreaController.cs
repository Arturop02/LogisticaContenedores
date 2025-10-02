using BT;
using RN.Patio;
using System;
using System.Linq;
using System.Runtime.InteropServices;
using System.Web.Mvc;
using System.Web.Services.Description;

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
            return Json(new { ok = true });
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
        public JsonResult BorrarArea(int id)
        {
            try
            {
                AreaRN areaRN = new AreaRN();
                AreaBT areaBT = new AreaBT{ Id = id };
                areaRN.Borrado(areaBT);
                return Json(new { ok = true });
            }
            catch(Exception ex)
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
            //try
            //{

            //}catch (Exception)
            //{
            //    throw;
            //}

            AreaRN areaRN = new AreaRN();
            IslaRN islaRN = new IslaRN();
            var area = areaRN.BuscarPorId(id);
            var islas = islaRN.BuscarPorArea(id);
            if(area != null)
            {
                area.Islas = islas;
                return Json(new { ok = true, data = area }, JsonRequestBehavior.AllowGet);
            }
            return Json(new {ok = false, message = "No se pudo encontrar el area con el id " + id}, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ListarAreas()
        {
            AreaRN areaRN = new AreaRN();
            var lista = areaRN.DameTodosAlta()
                .ToList();

            return Json(new {lista }, JsonRequestBehavior.AllowGet);
        }
        

        [HttpGet]
        public ActionResult DibujarLimite(int? Id)
        {
            AreaRN areaRN = new AreaRN();
            var area = areaRN.DameTodosAlta();
            ViewBag.Areas = area;

            ViewBag.IdAreaSeleccionada = Id;
            return View(RutaBase + "DibujarLimite.cshtml");
        }

        [HttpGet]
        public ActionResult DibujarIsla(int? id)
       {
            AreaRN areaRN = new AreaRN();
            var area = areaRN.DameTodosAlta();
            ViewBag.Areas = area;

            ViewBag.IdAreaSeleccionada = id;
            return View(RutaBase + "DibujarIsla.cshtml");
        }

    }
}