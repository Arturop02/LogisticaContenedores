using Microsoft.Ajax.Utilities;
using System.Web;
using System.Web.Optimization;

namespace DibujandoPatio
{
    public class BundleConfig
    {
        // Para obtener más información sobre las uniones, visite https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Utilice la versión de desarrollo de Modernizr para desarrollar y obtener información sobre los formularios.  De esta manera estará
            // para la producción, use la herramienta de compilación disponible en https://modernizr.com para seleccionar solo las pruebas que necesite.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new Bundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.min.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/site.css"));

            bundles.Add(new ScriptBundle("~/bundles/linq").Include(
                        "~/Scripts/linq-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/bootbox").Include(
                       "~/Scripts/bootbox.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/sat").Include(
                        "~/Scripts/sat-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/konva").Include(
                        "~/Scripts/konva-{version}.js", 
                        "~/Scripts/utilidadesKonva-{version}.js")
            );

            bundles.Add(new StyleBundle("~/bundles/jqgridcss").Include(
                      "~/Content/ui.jqgrid.min.css"));

            bundles.Add(new StyleBundle("~/bundles/fontawesomecss").Include(
                      "~/Content/font-awesome.min.css"));

            bundles.Add(new StyleBundle("~/bundles/bootstrapselectcss").Include(
                      "~/Content/bootstrap-select.min.css"));

            bundles.Add(new ScriptBundle("~/bundles/jqgrid").Include(
                        "~/Scripts/grid.locale-es.js",
                        "~/Scripts/jquery.jqGrid.min.js"));   

            bundles.Add(new ScriptBundle("~/bundles/bootstrapselect").Include(
                        "~/Scripts/bootstrap-select.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/vue").Include(
                        "~/Scripts/vue.js"));

            bundles.Add(new ScriptBundle("~/bundles/notify").Include(
                        "~/Scripts/Notify.js"));
        }
    }
}
