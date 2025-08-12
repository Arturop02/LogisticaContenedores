'use strict'

//#region Utilidades
var Linq = {};
Linq.Object = {};
Linq.Array = {};
Linq.Utilidades = {};

/**
 * Error personalizado de linq
 * @param {String} Nombre
 * @param {String} Mensaje
 * @param {String} DescripcionPersonalizada 
 * @returns {Object} Error
 */
Linq.Error = function (Nombre, Mensaje, DescripcionPersonalizada) {
    this.name = Nombre;
    this.message = Mensaje;
    this.Descripcion = DescripcionPersonalizada
}

/**
 * Hereda de objeto Array
 * @param {Object} Array Objeto a evaluar
 */
Linq.Array.EsArray = function (Array) {
    return window.Array.isArray(Array);
}

/**
 * Clonar Object
 * @param {*} obj Objeto a clonar
 * @param {Number} [maxAnidamiento=500] maximo de niveles de anidamientos a clonar (por defecto 500)
 * @param {Number} [anidamiento] nivel actual de anidamiento
 */
Linq.Object.Clonar = function (obj, maxAnidamiento, anidamiento) {
    maxAnidamiento = maxAnidamiento == null ? 500 : maxAnidamiento;
    anidamiento = anidamiento == null ? 0 : anidamiento + 1;
    var temp = null;
    if (obj != null) {
        if (Array.isArray(obj))
            temp = [];
        else if (typeof obj === 'object')
            temp = {};
        else
            return obj;
        var propiedades = Object.keys(obj);
        var length = propiedades.length;
        for (var i = 0; i < length; i++) {
            if (typeof obj[propiedades[i]] === "object")
                temp[propiedades[i]] = anidamiento == maxAnidamiento ? null : Linq.Object.Clonar(obj[propiedades[i]], maxAnidamiento, anidamiento);
            else
                temp[propiedades[i]] = obj[propiedades[i]];
        }
    }
    return temp;
}

/**
 * Comparar Objetos
 * @param {*} obj1 Objeto 1 a comparar
 * @param {*} obj2 Objeto 2 a comparar
 * @param {Number} [maxAnidamiento=500] maximo de niveles de anidamientos a comparar (por defecto 500)
 * @param {Number} anidamiento nivel actual de anidamiento
 */
Linq.Object.Comparar = function (obj1, obj2, maxAnidamiento, anidamiento) {
    maxAnidamiento = maxAnidamiento == null ? 500 : maxAnidamiento;
    anidamiento = anidamiento == null ? 0 : anidamiento + 1;
    if (obj1 == null ^ obj2 == null)
        return false;
    if (obj1 == null && obj2 == null)
        return true;
    var Iguales = true;
    var PropObj1 = Object.keys(obj1);
    var PropObj2 = Object.keys(obj2);
    var AllProp = PropObj1.Clone();
    AllProp.AddRange(PropObj2);
    AllProp = AllProp.DistinctBy();
    var length = AllProp.length;
    for (var i = 0; i < length; i++) {
        var type1 = obj1 == null ? 'null' : typeof obj1;
        var type2 = obj2 == null ? 'null' : typeof obj2;
        if (type1 != type2) {
            Iguales = false;
            break;
        }
        if (typeof obj1[AllProp[i]] == 'object') {
            if (anidamiento <= maxAnidamiento && !Linq.Object.Comparar(obj1[AllProp[i]], obj2[AllProp[i]], maxAnidamiento, anidamiento)) {
                Iguales = false;
                break;
            }
        }
        else {
            if (obj1[AllProp[i]] != obj2[AllProp[i]]) {
                Iguales = false;
                break;
            }
        }
    }
    return Iguales;
}

Linq.Configuracion = {
    UrlLinq: ''
};

//#endregion
/**
 * Filtrar
 * @param {function(T):Boolean} lambda expresion lambda que evalua, recibe un objeto del array y debe devolver un boolean
 * @returns {Array<T>} 
 */
Array.prototype.Where = function (lambda) {
    var temp = [];
    var length = this.length;
    for (var i = 0; i < length; i++) {
        if (lambda(this[i]))
            temp.push(this[i]);
    }
    return temp;
}

/**
 * Sumar valores de un array
 * @param {function(T):Number} [lambda] expresion lambda que evalua, recibe un objeto del array y debe devolver un numero
 * @returns {Number} Suma
 */
Array.prototype.Sum = function (lambda, Exacto) {
    if (lambda === undefined)
        lambda = function (c) { return c }

    if (Exacto === true) {
        if (window['Decimal'] == null)
            throw new Linq.Error('Linq.Sum', 'Las operaciones exactas requieren la libreria Decimal.js');

        var temp = new Decimal(0);
        if (typeof lambda === 'function') {
            var length = this.length;
            for (var i = 0; i < length; i++) {
                temp = temp.plus(lambda(this[i]));
            }
        }

        return temp.toNumber();
    } else {
        var temp = 0;
        if (typeof lambda === 'function') {
            var length = this.length;
            for (var i = 0; i < length; i++) {
                temp += lambda(this[i]);
            }
        }
        return temp;
    }
}

/**
 * Crea un nuevo array seleccionando valores dentro de uno ya existente
 * @param {function(T):TSalida} lambda expresion lambda que evalua, recibe un objeto del array y debe devolver un objecto del quese compondra el nuevo array
 * @returns {Array<TSalida>}
 */
Array.prototype.Select = function (lambda) {
    var temp = [];
    var length = this.length;
    for (var i = 0; i < length; i++) {
        temp.push(lambda(this[i]));
    }
    return temp;
}

/**
 * Primer elemento del Array
 * @returns {T} 
 * */
Array.prototype.First = function () {
    return this[0];
}

/**
 * Ultimo elemento del Array
 * @returns {T}
 * */
Array.prototype.Last = function () {
    return this[this.length - 1];
}

/**
 * Valor maximo del array
 * @param {function(T):Number} [lambda] recibe un objeto del array y debe devolver un numero con el cual se trabajara
 * @returns {Number}
 */
Array.prototype.Max = function (lambda) {
    if (this.length == 0)
        return null;

    if (lambda === undefined)
        lambda = function (c) { return c };

    var temp = null;
    if (typeof lambda === 'function') {
        temp = lambda(this[0]);
        var length = this.length;
        for (var i = 0; i < length; i++) {
            if (lambda(this[i]) > temp)
                temp = lambda(this[i]);
        }
    }
    else
        throw new Linq.Error('Linq.Max', 'El parametro proporcionado no es valido');

    return temp;
}

/**
 * Valor minimo del array
 * @param {function(T):Number} [lambda] recibe un objeto del array y debe devolver un numero con el cual se trabajara
 * @returns {Number}
 */
Array.prototype.Min = function (lambda) {
    if (lambda === undefined)
        lambda = function (c) { return c };

    var temp = null;
    if (typeof lambda === 'function') {
        temp = lambda(this[0]);
        var length = this.length;
        for (var i = 0; i < length; i++) {
            if (lambda(this[i]) < temp)
                temp = lambda(this[i]);
        }
    }
    else
        throw new Linq.Error('Linq.Min', 'El parametro proporcionado no es valido');
    return temp;
}

/**
 * Valor promedio del array
 * @param {function(T):Number} [lambda] recibe un objeto del array y debe devolver un numero con el cual se trabajara
 * @returns {Number}
 */
Array.prototype.Average = function (lambda) {
    if (lambda === undefined)
        lambda = function (c) { return c };

    var temp = 0;
    if (typeof lambda === 'function') {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            temp += lambda(this[i]);
        }
    }
    else
        throw new Linq.Error('Linq.Average', 'El parametro proporcionado no es valido');

    return temp / this.length;
}

/**
 * Todos los items del Array cumplen la codicion de la expresion lambda
 * @param {function(T):Boolean} lambda recibe un objeto del array y debe devolver un boolean dependiento si cumple los criterios requeridos
 * @returns {Boolean}
 */
Array.prototype.All = function (lambda) {
    var length = this.length;
    for (var i = 0; i < length; i++) {
        if (!lambda(this[i]))
            return false;
    }
    return true;
}

/**
 * Al menos uno de los items del Array cumple la codicion de la expresion lambda
 * @param {function(T):Boolean} lambda recibe un objeto del array y debe devolver un boolean dependiento si cumple los criterios requeridos
 * @returns {Boolean} Al menos un item cumple la codicion
 */
Array.prototype.Any = function (lambda) {
    var length = this.length;
    for (var i = 0; i < length; i++) {
        if (lambda(this[i]))
            return true;
    }
    return false;
}

/**
 * Primer elemento,en cumplir la condicion si es que se le especifica o default
 * @param {function(T):Boolean} [lambda=true] recibe un objeto del array y debe devolver un boolean dependiento si cumple los criterios requeridos
 * @returns {Object} Primer elemento en cumplir la condicion
 */
Array.prototype.FirstOrDefault = function (lambda) {
    if (lambda === undefined)
        return this[0] === undefined ? null : this[0];
    var length = this.length;
    for (var i = 0; i < length; i++) {
        if (lambda(this[i]))
            return this[i]
    }
    return null;
}

/**
 * Proyecta cada elemento de una secuencia en un Array y reduce las secuencias resultantes en una secuencia.
 * @param {function(T):TSalida} lambda expresion lambda que evalua, recibe un objeto del array y debe devolver un Array
 * @returns {Array<TSalida>} Array que contendra los items de todos los arrays devueltos por lambda
 */
Array.prototype.SelectMany = function (lambda) {
    var temp = [];
    var length = this.length;
    for (var i = 0; i < length; i++) {
        temp.AddRange(lambda(this[i]));
    }
    return temp;
}

/**
 * Agrupa los elementos en array mas pequeño con la cantidad especificada
 * @param {number} Cantidad cantidad de que cada grupo
 * @returns {Array<Array<TSalida>>} Array que contendra los items de todos los arrays devueltos por lambda
 */
Array.prototype.Chunk = function (Cantidad) {
    var resultado = [], temp = null;
    var length = this.length;
    var posicionInicial = 0;
    var posicionFinal = Cantidad - 1;
    while (posicionInicial < length) {
        temp = [];
        for (var i = posicionInicial; i <= posicionFinal && i < length; i++) {
            temp.push(this[i]);
        }
        resultado.push(temp);
        posicionInicial = posicionFinal + 1;
        posicionFinal = posicionInicial + Cantidad - 1;
    }
    return resultado;
}

/**
 * Devuelve los elementos que solo se encuentran en uno de los 2 Array,los items individuales van a ser comparados por callback proporcionado
 * @param {Array} SegundoArray Cantidad de que cada grupo
 * @param {function(T1,T2):Boolean} lambda Cantidad de que cada grupo
 * @returns {Array<Array<TSalida>>} Array que contendra los items de todos los arrays devueltos por lambda
 */
Array.prototype.ExceptBy = function (SegundoArray, lambda) {
    var Resultado = [], This = this;
    Resultado.AddRange(this.Where(function (c) { return !SegundoArray.Any(function (x) { return lambda(c, x) }) }));
    Resultado.AddRange(SegundoArray.Where(function (c) { return !This.Any(function (x) { return lambda(c, x) }) }));
    return Resultado;
}

Array.prototype.IntersectBy = function (SegundoArray, lambda) {
    return this.Where(function (c) { return SegundoArray.Any(function (x) { return lambda(c, x) }) });
}

/**
 * Agrupar por una clave
 * @param {function(T):TkeyGrupo} lambda expresion lambda que evalua, recibe un objeto del array y debe devolver el valor por el que se va a agrupar
 * @returns {Array} Array de grupos
 */
Array.prototype.GroupBy = function (lambda) {
    var temp = [];
    //Lista This
    var length = this.length;
    for (var i = 0; i < length; i++) {
        var GrupoEncontrado = false;
        //lista de grupos
        for (var a = 0; a < temp.length; a++) {
            if (lambda(this[i]) == lambda(temp[a][0])) {
                temp[a].push(this[i]);
                GrupoEncontrado = true;
                break;
            }
        }
        if (!GrupoEncontrado) {
            temp.push([this[i]]);
        }
    }
    return temp;
}

/**
 * Formato de moneda
 * @param {{
 *  Decimal: Number,
 *  DecimalSeparator: String,
 *  ThousandsSeparator: String,
 *  Prefix: String,
 *  Default: String,
 *  ThousandsQuantity: Number
 * }} Estructura
 */
Number.prototype.FormatMoney = function (Estructura) {
    if (Estructura == null)
        Estructura = {};
    //Valores default
    Object.setPrototypeOf(Estructura, {
        Decimal: 2,
        DecimalSeparator: '.',
        ThousandsSeparator: ',',
        Prefix: '$',
        Default: '',
        ThousandsQuantity: 3
    });

    //Comprobar si el Valor es null o no esta definido
    if (this != null && this != undefined) {
        var Fixed = this.toFixed(Estructura.Decimal);
        var Enteros = Fixed.split(".")[0];
        var Decimales = Fixed.split(".")[1];
        Enteros = Enteros.split("").reverse();
        var Cadena = "";
        var ContadorComa = 0;
        for (var i = 0; i < Enteros.length; i++) {
            Cadena += Enteros[i];
            ContadorComa++;
            if (ContadorComa == Estructura.ThousandsQuantity && (i + 1 != Enteros.length)) {
                Cadena += Estructura.ThousandsSeparator;
                ContadorComa = 0;
            }
        }
        Cadena = Estructura.Prefix + Cadena.split("").reverse().join("") + (Estructura.Decimal > 0 ? Estructura.DecimalSeparator + Decimales : '');
        return Cadena;
    }
    else {
        //En caso de que el valor sea Null o undefined
        return Estructura.Default;
    }
}
/**
 * Agregar dias
 * @param {Number} Dias
 * @returns {void}
 */
Date.prototype.addDays = function (Dias) {
    this.setHours(this.getHours() + (Dias * 24));
}

/**
 * Llenar a la izquierda la cantidad de digitos faltantes
 * @param {Number} Tamanio Tama?o de la cadena
 * @param {String} Caracter Caracter a usar para llenar espacios vacios
 * @returns {String} Cadena corregida
 */
String.prototype.PadLeft = function (Tamanio, Caracter) {
    //Valor Default
    if (Caracter === null || Caracter === undefined)
        Caracter = " ";
    if (this.length >= Tamanio)
        return this;
    else {
        var result = this;
        while (result.length < Tamanio) {
            result = Caracter + result;
        }
        return result;
    }
}

/**
 * Llenar a la derecha la cantidad de digitos faltantes
 * @param {Number} Tamanio Tama?o de la cadena
 * @param {String} Caracter Caracter a usar para llenar espacios vacios
 * @returns {String} Cadena corregida
 */
String.prototype.PadRight = function (Tamanio, Caracter) {
    //Valor Default
    if (Caracter === null || Caracter === undefined)
        Caracter = " ";
    if (this.length >= Tamanio)
        return this;
    else {
        var result = this;
        while (result.length < Tamanio) {
            result += Caracter;
        }
        return result;
    }
}

/**
 * Truncar numero
 * @param {Number} Decimales Longitud de decimales
 */
Number.prototype.toTrunc = function (Decimales) {
    if (Decimales == null)
        Decimales = 0;
    var Resultado = 0;
    var Enteros = ("" + this).split(".")[0];
    if (Decimales == 0) {
        Resultado = Enteros;
    }
    else {
        var Decimal = ("" + this).split(".").length > 0 ? ("" + this).split(".")[1] : 0;
        Decimal = Decimal.PadRight(Decimales, "0");
        var TempDecimal = "";
        for (var i = 0; i < Decimales; i++) {
            TempDecimal += Decimal[i];
        }
        Decimal = TempDecimal;
        Resultado = Enteros + "." + Decimal;
    }
    return Resultado * 1;
}

/**
 * Remover el primer elemento que cumpla la condicion
 * @param {function(T):Boolean} lambda recibe un objeto del array y debe devolver un boolean dependiento si cumple los requisitos requeridos
 * @returns {void}
 */
Array.prototype.RemoveAt = function (lambda) {
    var Indice = null;
    var TipoExpresion = lambda == null ? 'null' : typeof lambda;
    switch (TipoExpresion) {
        case 'function': {
            var length = this.length;
            for (var i = 0; i < length; i++) {
                if (lambda(this[i])) {
                    Indice = i;
                    break;
                }
            }
            break;
        }
        case 'number': {
            Indice = lambda;
            break;
        }
        case 'string': {
            if (!isNaN(lambda))
                Indice = lambda * 1;
            else
                throw new Linq.Error('Linq.RemoveAt', 'El valor que paso es un tipo de dato no valido');
            break;
        }
        case 'null': {
            throw new Linq.Error('Linq.RemoveAt', 'No se paso una expresion o indice para eliminar el elemento');
            break;
        }
        default: {
            throw new Linq.Error('Linq.RemoveAt', 'El valor que paso es un tipo de dato no valido');
        }
    }
    this.splice(Indice, 1);
};

/**
 * Remover todos los elemento que cumpla la condicion
  * @param {function(T):Boolean} lambda recibe un objeto del array y debe devolver un boolean dependiento si cumple los requisitos requeridos
 * @returns {void}
 */
Array.prototype.RemoveAll = function (lambda) {
    if (lambda === undefined) {
        this.splice(0, this.length);
        return;
    }
    var longitudInicial = this.length;
    for (var i = 1; i <= longitudInicial; i++) {
        if (lambda(this[longitudInicial - i])) {
            this.splice(longitudInicial - i, 1);
        }
    }
};

/**
 * Omitir los primeros items dependiendo de la cantidad especificada
 * @param {Number} Cantidad
 * @returns {Array<T>}
 */
Array.prototype.Skip = function (Cantidad) {
    var temp = [];
    if (Cantidad < 0)
        return this;

    var length = this.length;
    if (length > Cantidad) {
        for (var i = Cantidad; i < length; i++) {
            temp.push(this[i]);
        }
    }
    return temp;
}

/**
 * Omitir los ultimos items segun la cantidad especificada
 * @param {Number} Cantidad
 * @returns {Array<T>}
 */
Array.prototype.SkipLast = function (Cantidad) {
    var temp = [];
    if (Cantidad < 0)
        return this;
    var length = this.length;
    if (length > Cantidad) {
        for (var i = 0; i < length - Cantidad; i++) {
            temp.push(this[i]);
        }
    }
    return temp;
}

/**
 * Tomar los primeros items segun la cantidad especificada
 * @param {Number} Cantidad
 * @returns {Array<T>} 
 */
Array.prototype.Take = function (Cantidad) {
    var temp = [];
    if (Cantidad < 0)
        return this;
    var length = this.length;
    if (length >= Cantidad) {
        for (var i = 0; i < Cantidad; i++) {
            temp.push(this[i]);
        }
    }
    else {
        for (var i = 0; i < length; i++) {
            temp.push(this[i]);
        }
    }
    return temp;
}

/**
 * Tomar los utlmos items segun la cantidad especificada
 * @param {Number} Cantidad
 * @returns {Array<T>}
 */
Array.prototype.TakeLast = function (Cantidad) {
    var temp = [];
    var length = this.length;
    if (Cantidad < 0 || Cantidad > length)
        return this;
    if (length >= Cantidad) {
        for (var i = length - Cantidad; i < length; i++) {
            temp.push(this[i]);
        }
    }
    return temp;
}

/**
 * Utimo item en cumplir la condicion o default
 * @param {function(T):Boolean} [lambda=true] recibe un objeto del array y debe devolver un boolean dependiento si cumple los requisitos requeridos
 * @returns {T}
 */
Array.prototype.LastOrDefault = function (lambda) {
    var length = this.length;
    for (var i = 1; i <= length; i++) {
        if (lambda(this[length - i])) {
            return this[length - i];
        }
    }
    return null;
}

/**
 * Replica del primer item en cumplir la condicion o default
 * @param {function(T):Boolean} lambda recibe un objeto del array y debe devolver un boolean dependiento si cumple los requisitos requeridos
 * @returns {T}
 */
Array.prototype.CloneFirstOrDefault = function (lambda, Anidamiento) {
    return Linq.Object.Clonar(this.FirstOrDefault(lambda), Anidamiento);
}

/**
 * Replica del ultimo item en cumplir la condicion o default
 * @param {function(T):Boolean} lambda recibe un objeto del array y debe devolver un boolean dependiento si cumple los requisitos requeridos
 * @returns {T}
 */
Array.prototype.CloneLastOrDefault = function (lambda, Anidamiento) {
    return Linq.Object.Clonar(this.LastOrDefault(lambda), Anidamiento);
}

/**
 * Se crea una replica del Array
 * @param {Number} [Anidamiento=500] Profundidad de la clonacion
 * @returns {Array<T>}
 */
Array.prototype.Clone = function (Anidamiento) {
    var temp = [];
    var length = this.length;
    for (var i = 0; i < length; i++) {
        if (typeof this[i] == 'object')
            temp.push(Linq.Object.Clonar(this[i], Anidamiento));
        else
            temp.push(this[i])
    }
    return temp;
}

/**
 * Se agregan los items de un arreglo existente
 * @param {Array} Array Array de items a agregar
 */
Array.prototype.AddRange = function (Array) {
    if (Linq.Array.EsArray(Array)) {
        var length = Array.length;
        for (var i = 0; i < length; i++) {
            this.push(Array[i]);
        }
    }
    else
        throw new Linq.Error('Linq.AddRange', 'El valor que ingreso no es un array');
}

/**
 * Devuelve los items no replicados segun una clave especificada
 * @param {function(T):TkeyGrupo} lambda expresion lambda que evalua, recibe un objeto del array y debe devolver un valor que actuara como clave unica
 */
Array.prototype.DistinctBy = function (lambda) {
    var keys = [];
    var temp = [];
    if (lambda != null) {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            if (KeyAdd(lambda(this[i])))
                temp.push(this[i]);
        }
    }
    else {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            if (KeyAdd(this[i]))
                temp.push(this[i]);
        }
    }
    function KeyAdd(key) {
        var Agregar = true;
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] == key) {
                Agregar = false;
                break;
            }
        }
        if (Agregar)
            keys.push(key);
        return Agregar;
    }
    return temp;
}

/**
 * es nulo, vacio o solo espacios
 * @param {String} string Cadena de texto a evaluar
 * @returns {Boolean}
 */
String.IsEmptyOrWhiteSpace = function (string) {
    var Result = false;
    if (!string)
        Result = true;
    if (!Result) {
        var temp = true;
        var length = string.length;
        for (var i = 0; i < length; i++) {
            if (string[i] != " ") {
                temp = false;
                break;
            }
        }
        Result = temp;
    }
    return Result;
};

/**
 * Es nulo o vacio
 * @param {String} string Cadena de texto a evaluar
 * @returns {Boolean}
 */
String.IsNullOrEmpty = function (string) {
    return (string === null || string === '');
};

/**
 * Ordena los elementos de forma ascendente por una clave
 * @param {function(T):TkeyOrden} lambda Recibe un item del array debe devolver un valor por el cual se ordenara
 * @returns {Object} _IOrdered
 */
Array.prototype.OrderBy = function (lambda) {
    return new Linq.Array._IOrdered(this, { Order: 'ASC', arg: lambda });
}

/**
 * Ordena los elementos de forma descendentes por una clave
 * @param {function(T):TkeyOrden} lambda Recibe un item del array debe devolver un valor por el cual se ordenara
 * @returns {_IOrdered} _IOrdered
 */
Array.prototype.OrderByDescending = function (lambda) {
    return new Linq.Array._IOrdered(this, { Order: 'DESC', arg: lambda });
}
Linq.Array._IOrdered = function (lstArrayElement, PrimeraOperacion) {
    var lstElement = [];
    lstElement.AddRange(lstArrayElement);
    var lstOperaciones = [PrimeraOperacion];
    /**
     * Ordena de subsiguiente ascendentemente
     * @param {Function} lambda Expresion lambda, recibe un item del array debe devolver un valor por el cual se ordenara
     * @returns {Object} _IOrdered
     */
    this.ThenBy = function (lambda) {
        lstOperaciones.push({ Order: 'ASC', arg: lambda });
        return this;
    }
    /**
     * Ordena de subsiguiente descendentemente
     * @param {Function} lambda Expresion lambda, recibe un item del array debe devolver un valor por el cual se ordenara
     * @returns {Object} _IOrdered
     */
    this.ThenByDescending = function (lambda) {
        lstOperaciones.push({ Order: 'DESC', arg: lambda });
        return this;
    }
    /**
     * Devuelve el un array ordenado segun los criterios especificados
     * @returns {Array}
     * */
    this.ToArray = function () {
        var length = lstOperaciones.length;
        for (var i = 1; i <= length; i++) {
            switch (lstOperaciones[length - i].Order) {
                case 'ASC': OrdenarASC(lstOperaciones[length - i].arg); break;
                case 'DESC': OrdenarDESC(lstOperaciones[length - i].arg); break;
                default: throw new Linq.Error('Linq.IOrdered.ToArray', 'Ordenamiento omitido, clave no encontrada', JSON.stringify(lstOperaciones[length - i]));
            }
        }
        return lstElement;
    }
    function OrdenarASC(lambda) {
        for (var Index = 0; Index <= lstElement.length - 2; Index++) {
            var ItemTemp = null;
            if (lambda(lstElement[Index]) > lambda(lstElement[Index + 1])) {
                ItemTemp = lstElement[Index];
                lstElement[Index] = lstElement[Index + 1]
                lstElement[Index + 1] = ItemTemp;
                if (Index > 0)
                    Index -= 2;
            }
        }
    }
    function OrdenarDESC(lambda) {
        for (var Index = 0; Index <= lstElement.length - 2; Index++) {
            var ItemTemp = null;
            if (lambda(lstElement[Index]) < lambda(lstElement[Index + 1])) {
                ItemTemp = lstElement[Index];
                lstElement[Index] = lstElement[Index + 1]
                lstElement[Index + 1] = ItemTemp;
                if (Index > 0)
                    Index -= 2;
            }
        }
    }
}
/**
 * Permite usar metodos sobre un item
 * @param {*} item
 */
Linq.Item = function (item) {
    return {
        _IgualdadEstricta: false,
        _Comparador: function (a, b) { return a == b },
        IgualdadEstricta: function (stricto) {
            this._IgualdadEstricta = !(stricto == false);
            if (this._IgualdadEstricta == true)
                this._Comparador = function (a, b) { return a === b }
            else
                this._Comparador = function (a, b) { return a == b }
            return this;
        },
        /**
         * buscar el item en un array o argumentos
         * @param {Array|arguments} Parametros Array o Argumentos con los que se comparara el item
         * @returns {boolean}
         */
        EnLista: function (Parametros) {
            var args = [];
            if (Linq.Array.EsArray(Parametros))
                args = Parametros;
            else
                args = Array.prototype.slice.call(arguments);

            var Comparador = this._Comparador;
            if (args != null)
                return args.Any(function (c) { return Comparador(c, item) });
            return false;
        },
        /**
         * Si item es null devuelve el valor proporcionado
         * @param {*} [ValorSiNull] si el item es null se devuelve este valor
         * @returns {boolean|*} si se proporciona un parametro y el valor es null se devuelve este,si no se proporciona se devuelve la comparacion de item == null
         */
        EsNull: function (ValorSiNull) {
            if (ValorSiNull === undefined)
                return this._Comparador(item, null);
            else
                return this._Comparador(item, null) ? ValorSiNull : item;
        }
    }
}
if (Array.prototype.forEach == null) {
    /**
     * Metodo iterador de Array
     * @param {Function} callback 
     * @param {Function} callback.Item Elemento actual en el iterador
     * @param {Function} callback.Index Posicion actual en el iterador
     * @param {Function} callback.Array Array que se esta iterando
     */
    Array.prototype.forEach = function (callback) {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            callback(this[i], i, this);
        }
    }
}
Linq.String = {
    FormatoPersonalizado: function (Cadena, Sufijo) {
        switch (typeof Cadena) {
            case 'string': {
                return Cadena;
            }
            case 'number': {
                if (Sufijo[0] === 'N') {
                    return (Cadena).toFixed(Sufijo.slice(1, Sufijo.length) * 1)
                }
                switch (Sufijo) {
                    case 'E': return Cadena.toExponential();
                    case 'C': return Cadena.FormatMoney();
                }
            }
            default: {
                if (Cadena instanceof Date) {
                    return Cadena.toStringFormat(Sufijo);
                }
                return Cadena;
            }
        }
    }
};

String.Format = function (Cadena, Parametros) {
    var temp = null;

    var ArrayParametro = Array.prototype.slice.call(arguments);
    var ValorEncontrado = null;
    temp = Cadena.replace(/{[0-9]{1,}:[0-9a-zA-Z\/]{1,}}|{[0-9]{1,}}/g, function (c) {
        ValorEncontrado = c.substring(1, c.length - 1).split(':');
        if (ValorEncontrado.length === 1)
            return ArrayParametro[(ValorEncontrado[0] * 1) + 1];
        else
            return Linq.String.FormatoPersonalizado(ArrayParametro[(ValorEncontrado[0] * 1) + 1], ValorEncontrado[1])
    });

    return temp;
}

Date.Dias = [{ Nombre: 'Lunes', Abreviacion: 'Lun' }, { Nombre: 'Martes', Abreviacion: 'Mar' }, { Nombre: 'Miercoles', Abreviacion: 'Miñ' },
{ Nombre: 'Jueves', Abreviacion: 'Jue' }, { Nombre: 'Viernes', Abreviacion: 'Vie' }, { Nombre: 'Sabado', Abreviacion: 'Sab' }, { Nombre: 'Domingo', Abreviacion: 'Dom' },
];

Date.Meses = [
    { Nombre: 'Enero', Abreviacion: 'Ene' }, { Nombre: 'Febrero', Abreviacion: 'Feb' }, { Nombre: 'Marzo', Abreviacion: 'Mar' }, { Nombre: 'Abril', Abreviacion: 'Abr' }, { Nombre: 'Mayo', Abreviacion: 'May' }, { Nombre: 'Junio', Abreviacion: 'Jun' },
    { Nombre: 'Julio', Abreviacion: 'Jul' }, { Nombre: 'Agosto', Abreviacion: 'Ago' }, { Nombre: 'Septiembre', Abreviacion: 'Sep' }, { Nombre: 'Octubre', Abreviacion: 'Oct' }, { Nombre: 'Noviembre', Abreviacion: 'Nov' }, { Nombre: 'Diciembre', Abreviacion: 'Dic' }
];

Date.prototype.toStringFormat = function (arg) {
    var This = this;
    switch (arg) {
        case 't': return Formato('h:mm tt');
        case 'd': return Formato('M/d/yyyy');
        case 'T': return Formato('h:mm:ss tt');
        case 'D': return Formato('dddd, MMMM dd, yyyy');
        case 'f': return Formato('dddd, MMMM dd, yyyy h:mm tt');
        case 'F': return Formato('dddd, MMMM dd, yyyy h:mm:ss tt');
        case 'g': return Formato('M/d/yyyy h:mm tt');
        case 'G': return Formato('M/d/yyyy h:mm:ss tt');
        case 'm':
        case 'M': return Formato('MMMM dd');
        case 'y':
        case 'Y': return Formato('MMMM, yyyy');
        case 'r':
        case 'R': return Formato("'ddd, dd MMM yyyy HH': 'mm':'ss'");
        case 's': return Formato("yyyy'-'MM'-'dd'T'HH':'mm':'ss");
        case 'u': return Formato("yyyy'-'MM'-'dd HH':'mm':'ss'Z'");
        default: return Formato(arg);
    }

    function Formato(format) {
        var lstFormat = [
            { Patron: 'yyyy', Valor: function () { return This.getUTCFullYear() } },
            { Patron: 'MMMM', Valor: function () { return Date.Meses[This.getMonth()].Nombre } },
            { Patron: 'dddd', Valor: function () { return Date.Dias[This.getUTCDay()].Nombre } },
            { Patron: 'yyy', Valor: function () { return (This.getUTCFullYear() + '').slice(1, 4) } },
            { Patron: 'MMM', Valor: function () { return Date.Meses[This.getMonth()].Abreviacion } },
            { Patron: 'ddd', Valor: function () { return Date.Dias[This.getUTCDay()].Abreviacion } },
            { Patron: 'yy', Valor: function () { return (This.getUTCFullYear() + '').slice(2, 4) } },
            { Patron: 'MM', Valor: function () { return (This.getMonth() + 1).padLeft(2) } },
            { Patron: 'dd', Valor: function () { return This.getDate().padLeft(2) } },
            { Patron: 'mm', Valor: function () { return This.getMinutes().padLeft(2) } },
            { Patron: 'hh', Valor: function () { return (This.getHours() > 12 ? This.getHours() - 12 : This.getHours()).padLeft(2) } },
            { Patron: 'HH', Valor: function () { return This.getHours().padLeft(2) } },
            { Patron: 'ss', Valor: function () { return This.getSeconds().padLeft(2) } },
            { Patron: 'tt', Valor: function () { return This.getHours() < 12 ? 'AM' : 'PM' } },
            { Patron: 'y', Valor: function () { return (This.getUTCFullYear() + '').slice(3, 4) } },
            { Patron: 'M', Valor: function () { return (This.getMonth() + 1) } },
            { Patron: 'd', Valor: function () { return This.getDate().padLeft(2) } },
            { Patron: 'm', Valor: function () { return This.getMinutes() } },
            { Patron: 'h', Valor: function () { return (This.getHours() > 12 ? This.getHours() - 12 : This.getHours()) } },
            { Patron: 'H', Valor: function () { return This.getHours() } },
            { Patron: 's', Valor: function () { return This.getSeconds() } },
            { Patron: 't', Valor: function () { return This.getHours() < 12 ? 'A' : 'P' } },
        ];

        var temp = null;

        temp = format.replace(/[y]{4}|[M]{4}|[d]{4}|[y]{3}|[M]{3}|[d]{3}|[y]{2}|[M]{2}|[d]{2}|[m]{2}|[h]{2}|[H]{2}|[s]{2}|[t]{2}|[y]{1}|[M]{1}|[d]{1}|[m]{1}|[h]{1}|[H]{1}|[s]{1}|[t]{1}/g, function (c) {
            for (var i = 0; i < lstFormat.length; i++) {
                if (lstFormat[i].Patron === c)
                    return lstFormat[i].Valor();
            }
            return c;
        });

        return temp;
    }
};
/**
 * Unir un Array en un String
 * @param {String} Separador
 * @param {function(T):String} [lambda] Recibe un item del array, debe devolver una cadena que sera la que se concatene
 * @returns {String} 
 */
Array.prototype.Unir = function (Separador, lambda) {
    if (lambda === undefined)
        return this.join(Separador);
    else
        return this.Select(lambda).join(Separador);
};

(function () {
    /**
     * Join SQL
     * @param {String} alias Encabezado
     * @param {Array<Object>} querys [{ Array:[], Tipo: 'INNER|LEFT|RIGHT|FULL|CROSS', Alias: 'Detalle', Condicion: c => c.Encabezado.Numero === c.Detalle.NumeroEncabezado },..] //No se requiere la condicion cuando es CROSS
     * @returns {Array}
     */
    Array.prototype.UnionSQL = function (alias, querys) {
        if (String.IsEmptyOrWhiteSpace(alias))
            throw new Linq.Error('Linq.JoinSQL', 'No se pasaron el alias para el array principal');

        if (querys == null)
            throw new Linq.Error('Linq.JoinSQL', 'No se pasaron querys');

        if (querys.GroupBy(function (c) { return c.Alias }).Any(function (c) { return c.length > 1 }) || querys.Any(function (c) { return c.Alias === alias }))
            throw new Linq.Error('Linq.JoinSQL', 'No se permiten alias duplicados');

        var length = this.length;
        var Resultado = [];
        var temp = null;
        for (var i = 0; i < length; i++) {
            temp = {};
            temp[alias] = this[i];
            Resultado.push(temp);
        }

        querys.forEach(function (item) {
            switch (item.Tipo) {
                case 'INNER': Resultado = INNER(Resultado, item); break;
                case 'LEFT': Resultado = LEFT(Resultado, item); break;
                case 'RIGHT': Resultado = RIGHT(Resultado, item, querys, alias); break;
                case 'FULL': Resultado = FULL(Resultado, item, querys, alias); break;
                case 'CROSS': Resultado = CROSS(Resultado, item); break;
                default: throw new Linq.Error('Linq.JoinSQL', 'Tipo no valido');
            }
        });
        return Resultado;
    }

    function FULL(lst, unir, querys,aliasPrincipal) {
        var Resultado = [];
        var temp = null;
        lst.forEach(function (item1) {
            unir.Array.forEach(function (item2) {
                temp = Object.assign({}, item1);
                temp[unir.Alias] = item2;
                //PASAR PARAMETROS OPCIONALES
                if (unir.Condicion(temp))
                    Resultado.push(temp);
            });
        });

        var encontrado = null;
        lst.forEach(function (item1) {
            encontrado = false;
            unir.Array.forEach(function (item2) {
                temp = Object.assign({}, item1);
                temp[unir.Alias] = item2;
                if (unir.Condicion(temp))
                    encontrado = true;
            });
            if (!encontrado) {
                temp = Object.assign({}, item1);
                temp[unir.Alias] = null;
                Resultado.push(temp);
            }
        });
        unir.Array.forEach(function (item2) {
            encontrado = false;
            lst.forEach(function (item1) {
                temp = Object.assign({}, item1);
                temp[unir.Alias] = item2;
                if (unir.Condicion(temp))
                    encontrado = true;
            });
            if (!encontrado) {
                temp = {};
                temp[aliasPrincipal] = null;
                querys.forEach(function (query) {
                    temp[query.Alias] = null;
                });
                temp[unir.Alias] = item2;
                Resultado.push(temp);
            }
        });

        return Resultado;
    }

    function INNER(lst, unir) {
        var Resultado = [];
        var temp = null;
        lst.forEach(function (item1) {
            unir.Array.forEach(function (item2) {
                temp = Object.assign({}, item1);
                temp[unir.Alias] = item2;
                if (unir.Condicion(temp))
                    Resultado.push(temp);
            });
        });
        return Resultado;
    }

    function LEFT(lst, unir) {
        var Resultado = [];
        var temp = null;
        var encontrado = null;
        lst.forEach(function (item1) {
            encontrado = false;
            unir.Array.forEach(function (item2) {
                temp = Object.assign({}, item1);
                temp[unir.Alias] = item2;
                if (unir.Condicion(temp)) {
                    Resultado.push(temp);
                    encontrado = true;
                }
            });
            if (!encontrado) {
                temp = Object.assign({}, item1);
                temp[unir.Alias] = null;
                Resultado.push(temp);
            }
        });
        return Resultado;
    }

    function RIGHT(lst, unir, querys, aliasPrincipal) {
        var Resultado = [];
        var temp = null;
        var encontrado = null;
        unir.Array.forEach(function (item2) {
            encontrado = false;
            lst.forEach(function (item1) {
                temp = Object.assign({}, item1);
                temp[unir.Alias] = item2;
                if (unir.Condicion(temp)) {
                    Resultado.push(temp);
                    encontrado = true;
                }
            });
            if (!encontrado) {
                temp = {};
                temp[aliasPrincipal] = null;
                querys.forEach(function (query) {
                    temp[query.Alias] = null;
                });
                temp[unir.Alias] = item2;
                Resultado.push(temp);
            }
        });
        return Resultado;
    }    

    function CROSS(lst, unir) {
        var Resultado = [];
        var temp = null;
        lst.forEach(function (item1) {
            unir.Array.forEach(function (item2) {
                temp = Object.assign({}, item1);
                temp[unir.Alias] = item2;
                Resultado.push(temp);
            });
        });
        return Resultado;
    }
})();
Array.Range = function (inicio, fin) {
    var resultado = [];
    for (var i = inicio; i <= fin; i++) {
        resultado.push(i);
    }
    return resultado;
};