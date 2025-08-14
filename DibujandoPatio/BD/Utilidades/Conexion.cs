using System;
using System.Data;
using System.Data.SqlClient;

namespace BD
{
    public static class Conexion
    {
        public static SqlParameter AgregarConValorNull(this SqlParameterCollection coleccion, string parametroNombre, object valor, bool output = false)
        {
            SqlParameter sqlParameter = null;
            if (valor == null)
                sqlParameter = coleccion.AddWithValue(parametroNombre, DBNull.Value);
            else
                sqlParameter = coleccion.AddWithValue(parametroNombre, valor);
            if (output)
                sqlParameter.Direction = ParameterDirection.InputOutput;

            return sqlParameter;
        }

        public static T ValorODefecto<T>(this SqlParameterCollection coleccion, string parametroNombre)
        {
            T Valor = default(T);

            object ValorRaw = coleccion[parametroNombre].Value;

            if (ValorRaw != null && ValorRaw is DBNull == false)
                Valor = (T)ValorRaw;

            return Valor;
        }

        public static T ValorODefecto<T>(this IDataRecord fila, string nombreCampo)
        {
            int ordinal = fila.GetOrdinal(nombreCampo);
            return fila.ValorODefecto<T>(ordinal);
        }

        public static T ValorODefecto<T>(this IDataRecord fila, int ordinal)
        {
            return (T)(fila.IsDBNull(ordinal) ? default(T) : fila.GetValue(ordinal));
        }

        public static bool TieneColumna(this IDataRecord dr, string nombreColumna)
        {
            for (int i = 0; i < dr.FieldCount; i++)
            {
                if (dr.GetName(i).Equals(nombreColumna, StringComparison.InvariantCultureIgnoreCase))
                    return true;
            }
            return false;
        }
    }
}
