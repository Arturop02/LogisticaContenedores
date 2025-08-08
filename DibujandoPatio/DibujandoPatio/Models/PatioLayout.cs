using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DibujandoPatio.Models
{
    public class PatioLayout
    {
        public class Vertice
        {
            public float X { get; set; }
            public float Y { get; set; }
        }

        public class Patio
        {
            public int Id { get; set; }
            public string Nombre { get; set; }
            public decimal Escala { get; set; }
            public List<Vertice> Vertices { get; set; }
        }

    }
}