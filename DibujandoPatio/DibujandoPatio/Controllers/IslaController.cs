using BT.Patio;
using RN.Patio;
using System;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web.Mvc;


namespace DibujandoPatio.Controllers
{
    public class IslaController : Controller
    {
        private string conexion = ConfigurationManager.ConnectionStrings["mapaConnection"].ConnectionString;

        [HttpPost]
        public JsonResult GuardarIsla(IslaBT islaBT)
        {
            IslaRN islaRN = new IslaRN();
            islaRN.Agregar(islaBT);
            return Json(new { ok = true });
        }

        [HttpPost]
        public JsonResult EditarIsla(IslaBT islaBT)
        {
            try
            {
                IslaRN islaRN = new IslaRN();
                var isla = islaRN.Cambio(islaBT);
                return Json(new { ok = true });
            }
            catch (Exception ex) { 
                return Json(new { ok = false });
            }
        }

        [HttpGet]
        public JsonResult ObtenerIslasPorId(int id)
        {
            IslaRN islaRN = new IslaRN();
            var isla = islaRN.BuscarPorId(id);
            return Json(new { ok = true, data = isla}, JsonRequestBehavior.AllowGet);
        }
        
        public ActionResult Index()
        {
            return View();
        }
    }
}