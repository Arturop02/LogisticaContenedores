using BT.Patio;
using RN.Patio;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text.RegularExpressions;
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
            catch (Exception ex)
            {
                return Json(new { ok = false });
            }
        }

        [HttpPost]
        public JsonResult GuardarMultiplesIslas(List<IslaBT> listadoIslas)
        {
            try
            {
                IslaRN islaRN = new IslaRN();
                foreach(var isla in listadoIslas)
                {
                    if(isla.Id == 0)
                    {
                        var islaAgregada = islaRN.Agregar(isla);
                    }
                    else
                    {
                        var islaEditada = islaRN.Cambio(isla);
                    }
                }
                return Json(new { ok = true });

            }
            catch(Exception ex)
            {
                return Json(new { ok = false });
            }
        }

        [HttpPost]
        public JsonResult BorrarIsla(IslaBT islaBT)
        {
            try
            {
                IslaRN islaRN = new IslaRN();
                var isla = islaRN.Borrado(islaBT);
                return Json(new { ok = true });
            }
            catch (Exception ex)
            {
                return Json(new { ok = false });
            }
        }

        [HttpGet]
        public JsonResult ObtenerIslasPorId(int id)
        {
            IslaRN islaRN = new IslaRN();
            var isla = islaRN.BuscarPorId(id);
            return Json(new { ok = true, data = isla }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Index(int? id)
        {
            AreaRN areaRN = new AreaRN();
            var area = areaRN.DameTodosAlta();
            ViewBag.Areas = area;

            ViewBag.IdAreaSeleccionada = id;
            return View();
        }

        
        [HttpGet]
        public JsonResult DameListaIconos(string busqueda = "", int pagina = 1, int tamPagina = 12)
        {
            string texto = System.IO.File.ReadAllText(Server.MapPath("~/Content/font-awesome.min.css"));

            var coincidencia = Regex.Matches(texto, "fa-[0-9a-z\\-]{1,}(?=:before)", RegexOptions.Multiline);

            //var opciones = coincidencia.Cast<Match>().Select(m => m.Value).Distinct().ToList();

            List<string> Opciones = new List<string>();

            foreach (Match item in coincidencia)
            {
                Opciones.Add(item.Value);
            }


            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                //opciones = opciones.Where(i => i.IndexOf(busqueda, StringComparison.OrdinalIgnoreCase)>=0).ToList();
                Opciones = Opciones
                    .Where(i => i.IndexOf(busqueda, StringComparison.OrdinalIgnoreCase) >= 0).ToList();
                    
            }

            int totalResultados = Opciones.Count;
            int totalPaginas = (int)Math.Ceiling((double)totalResultados / tamPagina);

            var resultadosPaginados = Opciones.Skip((pagina - 1) * tamPagina).Take(tamPagina).ToList();

            return Json(new { ok = true, paginaActual = pagina, totalPaginas, totalResultados,  data = resultadosPaginados }, JsonRequestBehavior.AllowGet);
        }
    }
}