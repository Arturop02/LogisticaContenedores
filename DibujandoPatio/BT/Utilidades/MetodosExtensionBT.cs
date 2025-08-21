using System;
using System.Collections.Generic;
using System.Linq;

namespace BT.Utilidades
{
    public static class MetodosExtensionBT
    {
        public static IEnumerable<TResultado> FullJoin<T1, T2, TResultado>(
             this IEnumerable<T1> lst1,
             IEnumerable<T2> lst2,
             Func<T1, T2, bool> condicion,
             Func<T1, T2, TResultado> proyeccion)
        {
            // Materializamos para poder marcar coincidencias y evitar reenumeraciones
            var l1 = (lst1 ?? Enumerable.Empty<T1>()).ToList();
            var l2 = (lst2 ?? Enumerable.Empty<T2>()).ToList();

            var matchedL1 = new bool[l1.Count];
            var matchedL2 = new bool[l2.Count];

            var resultado = new List<TResultado>();

            // Coincidencias (equivalente al INNER JOIN)
            for (int i = 0; i < l1.Count; i++)
            {
                for (int j = 0; j < l2.Count; j++)
                {
                    if (condicion(l1[i], l2[j]))
                    {
                        resultado.Add(proyeccion(l1[i], l2[j]));
                        matchedL1[i] = true;
                        matchedL2[j] = true;
                    }
                }
            }

            // Solo en lst1 (LEFT ONLY)
            for (int i = 0; i < l1.Count; i++)
            {
                if (!matchedL1[i])
                    resultado.Add(proyeccion(l1[i], default(T2))); // T2 ausente
            }

            // Solo en lst2 (RIGHT ONLY)
            for (int j = 0; j < l2.Count; j++)
            {
                if (!matchedL2[j])
                    resultado.Add(proyeccion(default(T1), l2[j])); // T1 ausente
            }

            return resultado;
        }
    }
}
