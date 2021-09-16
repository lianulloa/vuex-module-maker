# VuexModuleMaker

It is just an helper to create [Vuex modules](https://vuex.vuejs.org/guide/modules.html).
Its target is to reduce the amount of code needed to create a Vuex module and thus to keep code DRY

## Quick Start

```javascript
const state = {
  categoriesPlan: [],
  categoriesTrie: {},
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

This code creates a Vuex module following the mapping `standard` of [vuex-pathify](https://davestewart.github.io/vuex-pathify/#/setup/install?id=config), for example:

| state | getter | mutation | action |
| ----- | ------ | -------- | ------ |
| foo   | foo    | SET_FOO  | setFoo |

Hence, assuming this module is registered under the name of `categories`, then the next code is completely valid:

```javascript
store.getters["categories/categoriesPlan"]

store.commit("categories/SET_GROUPING_CODES", groupingCodes)

store.dispatch("categories/createCategory", newCategory)
```

## Complex Example

```javascript
// usersApi is a class with methods to request info from API
import usersApi from "../../api/users"
import { VuexModuleMaker, actionConfigs } from "@lianulloa/vuex-module-maker"

const state = {
  users: [],
  totalUsers: 0
}

const vuexModule = new VuexModuleMaker({
  state,
  getters: {
    activeUsers: state => {
      return state.users.filter(user => user.status === "active")
    },
    coolUsers: state => {
      return state.users.filter(user => user.settings.cool)
    }
  },
  actions: {
    getUsers: {
      service: usersApi.list.bind(usersApi),
      attr: "users",
      cacheAPIRequestIn: "users/fetchUsers", // cache usersApi.list responses through this action. See vuex-cache
      ...actionConfigs.common.list
    },
    createCustomField: {
      service: usersApi.create.bind(usersApi),
      attr: "users",
      cacheActionToDelete: "users/fetchUsers",
      ...actionConfigs.common.create
    },
    editCustomField: {
      service: usersApi.edit.bind(usersApi),
      attr: "users",
      cacheActionToDelete: "users/fetchUsers",
      editingRefreshService: usersApi.detail.bind(usersApi),
      ...actionConfigs.common.edit
    },
    deleteCustomField: {
      service: usersApi.delete.bind(usersApi),
      cacheActionToDelete: "users/fetchUsers"
    }
  }
})

export default vuexModule.getModule()
```

## Clearing cache in all open tabs

**Available from version 1.1.0+**  
Your user can have two or more tabs of your app open in the browser, and these tabs will be using different instances of your store, thus different instances of the cache. So it could be useful, that when some part of the cache gets cleaned in one tab, that change gets reflected in all open tabs.

To enable this behavior, takes just two simple steps:

1. Register the plugin `createChannel` in the store

  ```javascript
  import { createChannel } from "@lianulloa/vuex-module-maker"

  export default new Vuex.Store({
    plugins: [ createChannel( {channelName:"any-name"} ) ],
    modules: {
      todos
    }
  })
  ```

2. Set the module name as an option to the `VuexModuleMaker` constructor
  
  ```javascript
  const state = {
    todos: []
  }

  const vuexModule = new VuexModuleMaker({
    state,
    actions: {
      getC: {
        service: list,
        attr: "todos",
        cacheAPIRequestIn: "todos/fetchTodos",
      },
      createC: {
        service: create,
        attr: "todos",
        cacheActionToDelete: "todos/fetchTodos",
      }
    }
  }, { namespaced: true, moduleName: "todos" }) // Note the field moduleName

  export default vuexModule.getModule()
  ```

  The module name MUST match with how you register the module at the first step

  That's it. Now whenever one part of the store's cache gets cleared, it will do the same in all the open tabs of your app

## API

**VuexModuleMaker** is just a class which generate a Vuex module from a few configurations

### Constructor

The constructor takes two parameters. The second is completely optional.

The fist is an object which defines the usual options: `state`, `getters`, `mutations`, `actions`

The second (and last) is an options object for Vuex. By default it look like this: `{ namespaced: true }`

`state` keeps its usual syntax. The syntax for `getters`, `mutations`, and `actions` is described below

#### getters

- type: `Object.<string,function|string>`
- Optional

Example:

```javascript
const state = {
  categoriesPlan: [],
  categoriesTrie: [],
  groupingCodes: []
}

const getters: {
  "tree": "categoriesTrie",
  "treeWithFunction": state => {
    return state.categoriesTrie
  }
}
```

These(☝) two getters are equivalents.

This way a custom name can be defined for a getter and/or defined explicitly what is returned
by using a funciton.

**Note:** This parameter is optional. Getters are defined automatically based on the fields of `state`

#### mutations

- type: `Object.<string,function|string>`
- Optional

Por ejemplo:

```javascript
const state = {
  categoriesPlan: [],
  categoriesTrie: [],
  groupingCodes: []
}

const mutations: {
  "SET_CATEG_TRIE": "categoriesTrie",
  "SET_CATEG_TRIE_2": (state, payload) => {
    state["categoriesTrie"] = payload
  }
}
```

These(☝) two mutations are equivalents.

This way a custom name can be defined for a mutation and/or defined explicitly what is setted
by using a funciton.

**Note:** This parameter is optional. Mutations are defined automatically based on the fields of `state`

#### actions

- type: `Object.<string,Function| ActionConfig>` Below you can see what is an [ActionConfig](#actionconfig)
- Required

Example:

```javascript
const state = {
  category: null
  categoriesPlan: [],
  categoriesTrie: [],
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
        if (query.format === "plan") {
          context.commit("SET_CATEGORIES_PLAN", data)
          resolve(data)
        } else {
          context.commit("SET_CATEGORIES_TRIE", data)
          resolve(data)
        }
      } catch (error) {
        reject(error)
      }
    })
  }
}
```

For `actions` each key's value could be a function or an object with the config needed (See [below](#actionconfig)). If a function is used, it MUST comply with the [Vuex's action definition](https://vuex.vuejs.org/guide/actions.html)

If an object is used, it will generate an action which at least will:

1. Execute the function passed as `service` field. Parameters received by the action (when it is dispatched) will be forwarded to this `service`
2. Update `state` with the response from `service`

In order to update `state`, it will use field `attr` (or `mutation` if it is defined)
In the example above, `category` would be updated when action `createCategory` is dispatched.
On the other side, if `mutation` is defined, it will be used to update `state` through a `context.commit` call.

Example:

```javascript
const actions = {
  createCategory: {
    service: createCategoryAPI,
    mutation: "SET_CATEGORY_BY_HELPER"
  }
}
```

will be the same as doing:

```javascript
//...
const {data} = await createCategoryAPI()
context.commit("SET_CATEGORY_BY_HELPER", data)
//...
```

The field `spreadServiceArgs` (See [below](#actionconfig)) controls if actions arguments (when dispatched) should be *spreaded* when forwarded down to `service`. Useful if `service` expect more than one argument.

```javascript
if (actionConfig.spreadServiceArgs) {
  // if need to pass more than one parameter to service
  data = (await actionConfig.service(...requestBody)).data
} else {
  data = (await actionConfig.service(requestBody)).data
}
```

this way, it is possible to dispatch an action with an array of arguments
de esta manera, es posible llamar a un action con un array de parámetros if necessary

```javascript
this.actionToSetItems( [ item1, item2, item3 ] )
action.service( item1, item2, item3 )
```

### Métodos

#### getModule

Creates the Vuex module

Example:

```javascript
const state = {
  categoriesPlan: [],
  categoriesTrie: [],
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

Adds a getter

`@param {Object.<string,function|string>} getter`

Example:

```javascript
const state = {
  categoriesPlan: [],
  categoriesTrie: [],
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

Adds a mutation

`@param {Object.<string,function|string>} mutation`

Example:

```javascript
const state = {
  categoriesPlan: [],
  categoriesTrie: [],
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
    state["categoriesTrie"] = payload
  }
)
```

#### addAction

Adds an action

`@param {actionName, action} action`

Example:

```javascript
const state = {
  categoriesPlan: [],
  categoriesTrie: [],
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

Generates the getters

Example:

```javascript
const state = {
  categoriesPlan: [],
  categoriesTrie: [],
}

const vuexHelper = new VuexModuleMaker(
  //...
)

vuexHelper.buildGetters()
/*
{
  categoriesPlan: state => state.categoriesPlan
  categoriesTrie: state => state.categoriesTrie
}
*/
```

#### buildMutations

Generates the mutations

Example:

```javascript
const state = {
  categoriesPlan: [],
  categoriesTrie: [],
}

const vuexHelper = new VuexModuleMaker(
  //...
)

vuexHelper.buildMutations()
/*
{
  SET_CATEGORIES_PLAIN: (state, payload) => state.categoriesPlan = payload
  SET_CATEGORIES_TREE: (state, payload) => state.categoriesTrie = payload
}
*/
```

#### buildActions

Generates the actions

Example:

```javascript
const state = {
  categoriesPlan: [],
  categoriesTrie: [],
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

### ActionConfig

The action configuration object
 * @typedef {Object} ActionConfig
 * @property {Function} service - Service used to obtain data
 * @property {String}   attr - The attribute of the state which will contain the data (if any)
 * @property {String}   [mutation] - Mutation to used to set data when it is not the default for the attr
 * @property {boolean}  [spreadServiceArgs] - Whether action argument should be spreaded into the service
 * @property {boolean}  [append] - Whether data should be appended to existing data in a list format if requestBody.append === true
 * @property {boolean}  [appendAlways] - Whether data should be appended to existing data in a list format even though is not requested
 * @property {boolean}  [editing] - Whether it is an editing action. CANNOT be used along with append or appendAlways
 * @property {Function}  [editingRefreshService] - Service used to refresh an edited document. MUST be defined if requestBody.refresh
 * @property {boolean}  [hasMetadata] - Whether response will included a metadata field. If metadata is true, then mutation MUST NOT be defined
 * @property {String}   [cacheAPIRequestIn] - Name of an action, automatically created, to cache API resquest made through service
 * @property {boolean}  [cacheActionToDelete] - Name of an action to delete from cache after the request to API. If it is not in cache, it does nothing

## Dependencies

- [vuex-cache](https://github.com/superwf/vuex-cache) It MUST be installed be consumer in order to cache actions
