using RN.Patio;
using System.Web.Mvc;

namespace DibujandoPatio.Controllers
{
    public class AreaController : Controller
    {
        public string RutaBase { get; set; } = "~/Views/Catalogos/Operacion/Area/";

        [HttpGet]
        public ActionResult DibujarLimite(int? Id)
        {
            PatioRN patioRN = new PatioRN();
            var patio = patioRN.DameTodosAlta();
            ViewBag.Patios = patio;

            ViewBag.IdPatioSeleccionado = Id;
            return View(RutaBase + "DibujarLimite.cshtml");
        }

        [HttpGet]
        public ActionResult DibujarIsla(int? Id)
        {
            PatioRN patioRN = new PatioRN();
            var patio = patioRN.DameTodosAlta();
            ViewBag.Patios = patio;

            ViewBag.IdPatioSeleccionado = Id;
            return View(RutaBase + "DibujarIsla.cshtml");
        }

    }
}