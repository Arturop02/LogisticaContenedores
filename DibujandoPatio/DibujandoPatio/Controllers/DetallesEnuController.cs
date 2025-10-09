using BT.Patio;
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
        [HttpPost]
        public JsonResult GuardarDetalleEnu(DetalleEnuBT detalleEnuBT)
        {
            DetalleEnuRN detalleEnuRN = new DetalleEnuRN();
            detalleEnuRN.Agregar(detalleEnuBT);
            return Json(new { ok = true });
        }

        [HttpGet]
        public JsonResult ObtenerDetallesEnuPorId(int id)
        {
            DetalleEnuRN detalleEnuRN = new DetalleEnuRN();
            var detalles = detalleEnuRN.BuscarPorId(id);
            return Json(new { ok = true, data = detalles }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ListarEnus()
        {
            DetalleEnuRN detalleEnu = new DetalleEnuRN();
            var listaEnu = detalleEnu.DameTodosAlta()
                .ToList();
            return Json(listaEnu, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Index()
        {
            return View();
        }
    }
}