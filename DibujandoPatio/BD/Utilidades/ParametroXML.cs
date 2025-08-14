using System.Collections.Generic;
using System.Text;
using System;
using BD.Utilidades;

public class ParametroXML
{
    private StringBuilder sb = new StringBuilder();
    public void Agregar(string Clave, string Valor)
    {
        sb.Append("<Parametro Clave=\"").Append(Clave.aEstandarXML()).Append("\" ").Append("Valor=\"").Append(Valor.aEstandarXML()).Append("\" />");
    }

    public void Agregar<T>(string Clave, IEnumerable<T> lst, Func<T, string> func_Valor)
    {
        foreach (var item in lst)
        {
            Agregar(Clave, func_Valor(item));
        }
    }

    public string DameXML()
    {
        return sb.ToString();
    }

    public override string ToString()
    {
        return DameXML();
    }
}