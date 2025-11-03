namespace BD.Utilidades
{
    public static class MetodosExtension
    {
        public static string aEstandarXML(this string valor)
        {
            return valor == null ? null : System.Security.SecurityElement.Escape(valor);//.aCodificaUTF();
        }
    }
}
