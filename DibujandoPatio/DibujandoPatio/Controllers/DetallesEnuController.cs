using RN.Patio;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DibujandoPatio.Controllers
{
    public class DetallesEnuController : Controller
    {
        [HttpGet]
        public JsonResult ObtenerDetallesEnuPorId(int id)
        {
            DetalleEnuRN detalleEnuRN = new DetalleEnuRN();
            var detalles = detalleEnuRN.BuscarPorId(id);
            return Json(new { ok = true, data = detalles }, JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        public JsonResult ListarTiposEstructura()
        {
            EstructuraRN estructuraRN = new EstructuraRN();
            var lista = estructuraRN.DameTodosAlta().ToList();
            return Json(new { ok = true, data = lista }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Index()
        {
            return View();
        }
    }
}