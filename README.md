# VuexModuleMaker

Es un *helper* para crear módulos de **Vuex**. El objetivo principal de este *helper* es disminuir la cantidad de código que es necesario escribir al crear un módulo de **Vuex** y por lo tanto agilizar la creación del mismo.

## Inicio Rápido

```javascript
const state = {
  categoriesPlain: [],
  categoriesTree: [],
  groupingCodes: []
}

const vuexModule = new VuexModuleMaker(
  {
    state,
    actions: {
      createCategory: {
        service: createCategoryAPI,
        attr: "category"
      },
      getGroupingCodes: {
        service: listGroupingCodesAPI,
        attr: "groupingCodes"
      }
    }
  }
).getModule()
```

Este código genera un módulo de **Vuex** siguiendo el *mapping* `standard` de **vuex-pathify**, es decir:

| state | getter | mutation | action |
| ----- | ------ | -------- | ------ |
| foo   | foo    | SET_FOO  | setFoo |

Por lo que, suponiendo que este módulo se registre bajo el nombre de `categories`, el siguiente código sería totalmente válido:

```javascript
store.getters["categories/categoriesPlain"]

store.commit("categories/SET_GROUPING_CODES", groupingCodes)

store.dispatch("categories/createCategory", newCategory)
```

## API

**VuexModuleMaker** no es más que una clase que permite generar un módulo de **Vuex** a partir de pequeñas configuraciones.

### Constructor

El constructor admite dos parámetros, siendo el segundo totalmente opcional.

El primer parámetro es un objeto con la definición del `state`, `getters`, `mutations`, `actions`

El segundo parámetro es un objeto de opciones para **Vuex**. Por defecto es: `{ namespaced: true }`

En el caso del state, sigue manteniendo la misma sintaxis. Para el resto quedaría de la siguiente forma:

#### getters

- type: `Object.<string,function|string>`
- Optional

Por ejemplo:

```javascript
const state = {
  categoriesPlain: [],
  categoriesTree: [],
  groupingCodes: []
}

const getters: {
  "tree": "categoriesTree",
  "treeWithFunction": state => {
    return state.categoriesTree
  }
}
```

Estos(☝) dos getters registrados son equivalentes.

De esta forma se puede definir un nombre personalizado para un getter y utilizando directamente una función se puede realizar un definición explicita de lo que se desea retornar.

**Nota:** Este parámetro es opcional, ya que automáticamente se genera un getter para cada campo del `state`

#### mutations

- type: `Object.<string,function|string>`
- Optional

Por ejemplo:

```javascript
const state = {
  categoriesPlain: [],
  categoriesTree: [],
  groupingCodes: []
}

const mutations: {
  "SET_CATEG_TREE": "categoriesTree",
  "SET_CATEG_TREE_WF": (state, payload) => {
    state["categoriesTree"] = payload
  }
}
```

Estos(☝) dos mutations registrados son equivalentes.

De esta forma se puede definir un nombre personalizado para un mutation y utilizando directamente una función se puede realizar un definición explicita de lo que se desea setear.

**Nota:** Este parámetro es opcional, ya que automáticamente se genera un mutation para cada campo del `state`

#### actions

- type: `Object.<string,Function| {service: Function, attr: string, mutation?: string, spreadServiceArgs?: bool}>`
- Required

Por ejemplo:

```javascript
const state = {
  categoriesPlain: [],
  categoriesTree: [],
  groupingCodes: []
}

const actions = {
  createCategory: {
    service: createCategoryAPI,
    attr: "category"
  },
  getCategories: (context, query) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await categoriesApiSet.list(query)
        if (query.format === "plain") {
          context.commit("SET_CATEGORIES_PLAIN", data)
          resolve(data)
        } else {
          context.commit("SET_CATEGORIES_TREE", data)
          resolve(data)
        }
      } catch (error) {
        reject(error)
      }
    })
  }
}
```

El caso de `actions` el valor de cada key puede ser una función o un objeto con la configuración necesaria. Si pasa una función, será la definición usual de un action.

En caso de que se pase un objeto, se generará un action que:
1. Ejecutará una función pasada en el campo `service` pasándole los parámetros que reciba la action al ser llamada
2. Actualizará el estado con el resultado del llamado a dicho `service`

Para actualizar el estado se basará en el campo `attr` o `mutation`, en el caso de que este último se defina. En la action de ejemplo se actualizara el campo `category` del state. En cambio, al definir el campo `mutation` se haría `commit` a dicha mutación con el valor que devuelva el `service`. Por ejemplo:

```javascript
const actions = {
  createCategory: {
    service: createCategoryAPI,
    mutation: "SET_CATEGORY_BY_HELPER"
  }
}
```

sería equivalente a

```javascript
//...
const {data} = await createCategoryAPI()
context.commit("SET_CATEGORY_BY_HELPER", data)
//...
```

El campo `spreadServiceArgs` del objeto de configuración define si los argumentos pasados al action cuando se llama, debería ser *spreaded* al pasárselos a `service`. Útil para cuando `service` recibe más de un argumento.

```javascript
if (actionConfig.spreadServiceArgs) {
  // if need to pass more than one parameter to service
  data = (await actionConfig.service(...requestBody)).data
} else {
  data = (await actionConfig.service(requestBody)).data
}
```

de esta manera, es posible llamar a un action con un array de parámetros en caso de ser necesario

```javascript
this.actionToSetItems( [ item1, item2, item3 ] )
// el service pasado como parámetro sería llamado con todos los parámetros en vez de con una lista
action.service( item1, item2, item3 )
```

### Métodos

#### getModule

Genera el módulo de **Vuex**

Ejemplo:

```javascript
const state = {
  categoriesPlain: [],
  categoriesTree: [],
  groupingCodes: []
}

const vuexHelper = new VuexModuleMaker(
  {
    state,
    actions: {
      createCategory: {
        service: createCategoryAPI,
        attr: "category"
      },
      getGroupingCodes: {
        service: listGroupingCodesAPI,
        attr: "groupingCodes"
      }
    }
  }
)

const store = new Vuex.Store({
  modules: {
    vuexModule: vuexHelper.getModule()
  }
})
```

#### addGetter

Añade un getter

`@param {Object.<string,function|string>} getter`

Ejemplo:

```javascript
const state = {
  categoriesPlain: [],
  categoriesTree: [],
  groupingCodes: []
}

const vuexHelper = new VuexModuleMaker(
  {
    state,
    actions: {
      createCategory: {
        service: createCategoryAPI,
        attr: "category"
      },
      getGroupingCodes: {
        service: listGroupingCodesAPI,
        attr: "groupingCodes"
      }
    }
  }
)

vuexHelper.addGetter({customGetterName: "groupingCodes"})
vuexHelper.addGetter({
  customGetterName: state => state.groupingCodes
  }
)
```

#### addMutation

Añade una mutation

`@param {Object.<string,function|string>} mutation`

Ejemplo:

```javascript
const state = {
  categoriesPlain: [],
  categoriesTree: [],
  groupingCodes: []
}

const vuexHelper = new VuexModuleMaker(
  {
    state,
    actions: {
      createCategory: {
        service: createCategoryAPI,
        attr: "category"
      },
      getGroupingCodes: {
        service: listGroupingCodesAPI,
        attr: "groupingCodes"
      }
    }
  }
)

vuexHelper.addMutation({customGetterName: "groupingCodes"})
vuexHelper.addMutation({
  customGetterName: (state, payload) => {
    state["categoriesTree"] = payload
  }
)
```

#### addAction

Añade una acción

`@param {actionName, action} action`

Ejemplo:

```javascript
const state = {
  categoriesPlain: [],
  categoriesTree: [],
  groupingCodes: []
}

const vuexHelper = new VuexModuleMaker(
  {
    state,
  }
)

vuexHelper.addAction({
  createCategory: {
    service: createCategoryAPI,
    attr: "category"
  }
})
vuexHelper.addAction({
  getCategories: (context, query) => {
    return new Promise(async (resolve, reject) => {
      try {
        //...
      } catch (error) {
        //...
      }
    })
  }
)
```

#### buildGetters

Genera los getters

Ejemplo:

```javascript
const state = {
  categoriesPlain: [],
  categoriesTree: [],
}

const vuexHelper = new VuexModuleMaker(
  //...
)

vuexHelper.buildGetters()
/*
{
  categoriesPlain: state => state.categoriesPlain
  categoriesTree: state => state.categoriesTree
}
*/
```

#### buildMutations

Genera los mutations

Ejemplo:

```javascript
const state = {
  categoriesPlain: [],
  categoriesTree: [],
}

const vuexHelper = new VuexModuleMaker(
  //...
)

vuexHelper.buildMutations()
/*
{
  SET_CATEGORIES_PLAIN: (state, payload) => state.categoriesPlain = payload
  SET_CATEGORIES_TREE: (state, payload) => state.categoriesTree = payload
}
*/
```

#### buildActions

Genera los actions

Ejemplo:

```javascript
const state = {
  categoriesPlain: [],
  categoriesTree: [],
}

const vuexHelper = new VuexModuleMaker({
  actions:  {
    createCategory: {
      service: createCategoryAPI,
      attr: "category"
    }
  }
}
  
)

vuexHelper.buildActions()
/*
{
  createCategory: (context, argument) => new Promise(() => {
    // basic action logic
  })
}
*/
```
