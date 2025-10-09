using BT.Patio;
using Microsoft.Ajax.Utilities;
using RN.Patio;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DibujandoPatio.Controllers
{
    public class EstructuraController : Controller
    {
        [HttpPost]
        public JsonResult GuardarTipoEstructura(EstructuraBT estructuraBT)
        {
            EstructuraRN estructuraRN = new EstructuraRN();
            estructuraRN.Agregar(estructuraBT);
            return Json(new { ok = true });
        }

        [HttpGet]
        public JsonResult ObtenerTipoEstructuraPorId(int id)
        {
            EstructuraRN estructuraRN = new EstructuraRN();
            var estructura = estructuraRN.BuscarPorId(id);
            return Json(new { ok = true, data = estructura }, JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        public JsonResult ListarTiposEstructura() 
        { 
            EstructuraRN estructuraRN = new EstructuraRN();
            var lista = estructuraRN.DameTodosAlta().
                ToList();
            return Json(lista, JsonRequestBehavior.AllowGet);
        }


        public ActionResult Index()
        {
            return View();
        }
    }
}