/**
 * The action configuration object
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
 */

/**
 * The VuexModuleMaker config
 * @typedef {Object} Config
 * @property {Object} state
 * @property {Object.<string,function|string>} getters
 * @property {Object.<string,function|string>} mutations
 * @property {Object.<string,Function| ActionConfig>} actions
 * @property {Object} options
 */

import { getFieldFrom, camelToUpSnake } from "./utils/jsHelpers"
import { cacheAction } from "vuex-cache"

export default class VuexModuleMaker {
  /**
   * @param {Config} config
   */
  constructor({ state, getters = {}, mutations = {}, actions }, options = { namespaced: true }) {
    this._state = state
    this._getters = [...Object.keys(state), getters]
    this._actions = actions
    this.options = options

    this._mutations = [...this._getDefaultMutations(state, actions), mutations]

    this._cachedActions = {}
  }

  getModule() {
    return {
      state: this._state,
      getters: this.buildGetters(),
      mutations: this.buildMutations(),
      actions: this.buildActions(),
      ...this.options
    }
  }

  _getDefaultMutations(state, actions) {
    const defaultMutations = new Set(Object.keys(state))
    //Add mutations as needed in actions
    let mutationsNeeded = new Set(
      //FIXME: this makes actions required so better check if actions and then get the values
      Object.values(actions)
        .filter(action => typeof action === "object" && !action.mutation)
        .map(action => action.attr)
    )
    for (const mutationFromAction of mutationsNeeded) {
      defaultMutations.add(mutationFromAction)
    }

    return defaultMutations
  }

  /**
   * Adds a getter. If getter names collide, the last added
   * will be the one used
   *
   * Note for developer: for now that precedence behaviour
   * is a result of overwritting a key's value on the getter
   * object been built, but this can be improve by using a Set
   * for the _getters property(Comming soon)
   *
   * @param {Object.<string,function|string>} getter
   */
  addGetter(getter) {
    this._getters.push(getter)
    return this
  }

  /**
   * Adds a mutation. If mutation names collide, the last added
   * will be the one used
   *
   * Note for developer: for now that precedence behaviour
   * is a result of overwritting a key's value on the getter
   * object been built, but this can be improve by using a Set
   * for the _getters property(Comming soon)
   * @param {Object.<string,function|string>} mutation
   */
  addMutation(mutation) {
    this._mutations.push(mutation)
    return this
  }

  addAction({ actionName, action }) {
    if (typeof action === "object" && !action.mutation) {
      const defaultMutations = this._mutations.filter(mutation => typeof mutation === "string")
      if (!defaultMutations.some(dM => dM === action.attr)) {
        // if there is no mutations for this action's attr, set one
        this._mutations.push(action.attr)
      }
    }
    this._actions[actionName] = action
    return this
  }

  buildGetters() {
    const getters = {}
    let fieldChain
    for (const getter of this._getters) {
      if (typeof getter === "string") {
        // if getter is string then it is a dotted path to value to be returned from module state
        // Ex: state => state.user.name then getter === "user.name"
        fieldChain = getter.split(".")
        const binded = getFieldFrom.bind(null, fieldChain)
        getters[fieldChain[fieldChain.length - 1]] = binded
      } else if (typeof getter === "object") {
        // if getter is object then each key (i.e. entry[0]) is the name of a getter
        for (const entry of Object.entries(getter)) {
          if (typeof entry[1] === "string") {
            // if value (i.e. entry[1]) is string then it is a dotted path to value to be returned from module state
            fieldChain = getter.split(".")
            const binded = getFieldFrom.bind(null, fieldChain)
            getters[entry[0]] = binded
          } else if (typeof entry[1] === "function") {
            // if value (i.e. entry[1]) is function then is a whole getter definition
            getters[entry[0]] = entry[1]
          }
        }
      }
    }
    return getters
  }
  buildMutations() {
    const mutations = {}
    for (const mutation of this._mutations) {
      if (typeof mutation === "string") {
        // if mutation is string then it is the field to be set. A vuex mutation is created
        // using this string.
        // Ex: if mutation === "user" then a vuex mutation is created, name SET_USER
        // mutations["SET_" + mutation.toUpperCase()] = (state, payload) => (state[mutation] = payload)
        mutations["SET_" + camelToUpSnake(mutation)] = (state, payload) =>
          (state[mutation] = payload)
      } else if (typeof mutation === "object") {
        // if mutation is object then each key (i.e. entry[0]) is the name of a mutation
        for (const entry of Object.entries(mutation)) {
          if (typeof entry[1] === "string") {
            // if value (i.e. entry[1]) is string then it is the state's field to be set
            mutations[entry[0]] = (state, payload) => (state[entry[1]] = payload)
          } else if (typeof entry[1] === "function") {
            // if value (i.e. entry[1]) is function then it is a whole mutation definition
            mutations[entry[0]] = entry[1]
          }
        }
      }
    }
    return mutations
  }
  buildActions() {
    const actions = {}
    // Every key of actions's object is going to be used as the name of the action
    for (const action in this._actions) {
      if (typeof this._actions[action] === "function") {
        // if the value is a function then it is a whole action definition
        actions[action] = this._actions[action]
      } else if (typeof this._actions[action] === "object") {
        // if the value is a object then it contains: a reference to the api service
        // that must be used, stored in field "service", a string with the name of the
        // field of state where the response will be saved stored in "attr".
        // As an optional field it could contain a "mutation" field, which should be the
        // name of a vuex mutation available in this module
        const actionConfig = this._actions[action]
        if (actionConfig.cacheAPIRequestIn) {
          actions[actionConfig.cacheAPIRequestIn] = this._createFetchAction(actionConfig)
          const [, action] = actionConfig.cacheAPIRequestIn.split("/")
          actions[
            `clear${action[0].toUpperCase() + action.slice(1)}`
          ] = this._createClearCacheAction(actionConfig.cacheAPIRequestIn)
        }

        actions[action] = this.buildAction(actionConfig)
      }
    }
    return actions
  }
  buildAction(actionConfig) {
    // TODO: allow to define cache timeout through dispatch
    const action = ({ commit, state, cache }, requestBody) => {
      let append = actionConfig.appendAlways || (actionConfig.append && requestBody?.append)
      let refresh = requestBody?.refresh && actionConfig.editingRefreshService
      if (requestBody) {
        delete requestBody["append"]
      }

      return new Promise(async (resolve, reject) => {
        try {
          if (cache && actionConfig.cacheActionToDelete) {
            this._deleteCacheAction(cache, actionConfig.cacheActionToDelete)
          }

          let data =
            cache && actionConfig.cacheAPIRequestIn
              ? await this._cacheAction(cache, actionConfig.cacheAPIRequestIn, requestBody)
              : await this._sendRequest(requestBody, actionConfig)

          if (actionConfig.hasMetadata) {
            commit("SET_TOTAL_" + camelToUpSnake(actionConfig.attr), data.metadata.total)
          }

          if (actionConfig.attr || actionConfig.mutation) {
            commit(
              actionConfig.mutation
                ? actionConfig.mutation
                : "SET_" + camelToUpSnake(actionConfig.attr),
              await this._prepareDataToCommit(data, { ...actionConfig, append, state, refresh })
            )
          }

          resolve(data)
        } catch (e) {
          reject(e)
        }
      })
    }

    return actionConfig.cacheAPIRequestIn || actionConfig.cacheActionToDelete
      ? cacheAction(action)
      : action
  }

  async _prepareDataToCommit(data, config) {
    let preparedData = data
    if (config.hasMetadata) {
      preparedData = data.data
    }

    if (config.append) {
      return Array.prototype.concat(config.state[config.attr], preparedData)
    } else if (config.editing) {
      const documents = config.state[config.attr]
      const updatedDocumentIndex = documents.findIndex(document => document.id === preparedData.id)
      if (config.refresh) {
        const response = await config.editingRefreshService(preparedData.id, {
          fields: "editable,deletable"
        })
        preparedData = response.data
      }
      documents[updatedDocumentIndex] = preparedData
      return documents
    }
    return preparedData
  }

  async _sendRequest(requestBody, config) {
    if (config.spreadServiceArgs) {
      // if need to pass more than one parameter to service
      return (await config.service(...requestBody)).data
    } else if (config.editing) {
      return (await config.service(requestBody.id, requestBody.body)).data
    } else {
      return (await config.service(requestBody)).data
    }
  }

  _createFetchAction(actionConfig) {
    return (context, requestBody) => {
      return new Promise(async (resolve, reject) => {
        try {
          const data = await this._sendRequest(requestBody, actionConfig)
          resolve(data)
        } catch (error) {
          reject(error)
        }
      })
    }
  }

  _createClearCacheAction(actionToDelete) {
    return cacheAction(context => {
      this._deleteCacheAction(context.cache, actionToDelete)
    })
  }

  _cacheAction(cache, actionToCache, requestBody) {
    const requestBodyString = requestBody ? JSON.stringify(requestBody) : ""
    if (this._cachedActions[actionToCache]) {
      this._cachedActions[actionToCache].add(requestBodyString)
    } else {
      this._cachedActions[actionToCache] = new Set([requestBodyString])
    }
    return cache.dispatch(actionToCache, requestBody)
  }

  _deleteCacheAction(cache, actionToDelete) {
    if (this._cachedActions[actionToDelete]) {
      for (const requestBodyString of this._cachedActions[actionToDelete]) {
        const requestBody = requestBodyString !== "" ? JSON.parse(requestBodyString) : undefined
        if (cache.has(actionToDelete, requestBody)) {
          cache.delete(actionToDelete, requestBody)
        }
      }
      this._cachedActions[actionToDelete] = new Set()
    }
  }
}
