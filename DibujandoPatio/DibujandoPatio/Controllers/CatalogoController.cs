using BT.Patio;
using RN.Patio;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Deployment.Internal;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DibujandoPatio.Controllers
{
    public class CatalogoController : Controller
    {
        private string conexion = ConfigurationManager.ConnectionStrings["mapaConnection"].ConnectionString;

        [HttpPost]
        public JsonResult GuardarTipo(CatalogoTiposBT catalogoTIposBT)
        {
            CatalogoTiposRN catalogoRN = new CatalogoTiposRN();
            catalogoRN.Agregar(catalogoTIposBT);
            return Json(new { ok = true });
        }

        [HttpPost]
        public JsonResult GuardarOrientacion(CatalogoOrientacionBT catalogoOrientacionBT)
        {
            CatalogoOrientacionRN catalogoOrientacionRN = new CatalogoOrientacionRN();
            catalogoOrientacionRN.Agregar(catalogoOrientacionBT);
            return Json(new { ok = true });
        }

        [HttpGet]
        public JsonResult ObtenerTipos()
        {
            CatalogoTiposRN catalogoTiposRN = new CatalogoTiposRN();
            var tipos = catalogoTiposRN.DameTodos();
            return Json(tipos, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerOrientacion()
        {
            CatalogoOrientacionRN catalogoOrientacionRN = new CatalogoOrientacionRN();
            var orientaciones = catalogoOrientacionRN.DameTodos();
            return Json(orientaciones, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Index()
        {
            return View();
        }
    }
}