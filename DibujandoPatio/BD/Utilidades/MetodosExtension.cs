using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
