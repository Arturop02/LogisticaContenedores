using System.Collections.Generic;
using System.Data;

namespace BD
{
    public class BaseBD<TEntity> where TEntity : new()
    {
        public BaseBD(string conexion)
        {
            this.Conexion = conexion;
        }
        public string Conexion { get; set; }

        protected List<TEntity> ListaBT<IMapeador>(IDbCommand comando) where IMapeador : IMapeo<TEntity>, new()
        {
            IMapeador mapeador = new IMapeador();
            return ListaBT(comando, mapeador);
        }
        protected List<TEntity> ListaBT(IDbCommand comando, IMapeo<TEntity> Mapeador)
        {
            List<TEntity> objetos = new List<TEntity>();
            using (var reader = comando.ExecuteReader())
            {
                while (reader.Read())
                {
                    var objeto = Mapeador.Mapear(reader);
                    objetos.Add(objeto);
                }
            }
            return objetos;
        }
    }
}
