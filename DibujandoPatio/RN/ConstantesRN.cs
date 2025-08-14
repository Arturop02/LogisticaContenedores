using System.Configuration;

namespace RN
{
    public class ConstantesRN
    {
        public static string BD_CONECTION { get => ConfigurationManager.ConnectionStrings["mapaConnection"].ConnectionString; }
    }
}
