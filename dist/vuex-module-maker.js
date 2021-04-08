!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(require("vuex-cache")):"function"==typeof define&&define.amd?define(["vuex-cache"],e):"object"==typeof exports?exports.vuexModuleMaker=e(require("vuex-cache")):t.vuexModuleMaker=e(t["vuex-cache"])}(self,(function(t){return(()=>{"use strict";var e={614:e=>{e.exports=t}},r={};function n(t){var i=r[t];if(void 0!==i)return i.exports;var o=r[t]={exports:{}};return e[t](o,o.exports,n),o.exports}n.d=(t,e)=>{for(var r in e)n.o(e,r)&&!n.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},n.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),n.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};var i={};return(()=>{function t(e,r){return e.length?Object.prototype.hasOwnProperty.call(r,e[0])?t(e.slice(1),r[e[0]]):null:r}function e(t){return t.replace(/([A-Z])/g,(function(t){return"_"+t})).toUpperCase()}n.r(i),n.d(i,{VuexModuleMaker:()=>d,actionConfigs:()=>f});var r=n(614);function o(t,e,r,n,i,o,a){try{var c=t[o](a),s=c.value}catch(t){return void r(t)}c.done?e(s):Promise.resolve(s).then(n,i)}function a(t){return function(){var e=this,r=arguments;return new Promise((function(n,i){var a=t.apply(e,r);function c(t){o(a,n,i,c,s,"next",t)}function s(t){o(a,n,i,c,s,"throw",t)}c(void 0)}))}}function c(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function s(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?c(Object(r),!0).forEach((function(e){u(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function u(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}class d{constructor(t){var{state:e,getters:r={},mutations:n={},actions:i={}}=t,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{namespaced:!0};this._state=e,this._getters=[...Object.keys(e),r],this._actions=i,this.options=o,this._mutations=[...this._getDefaultMutations(e,i),n],this._cachedActions={}}getModule(){return s({state:this._state,getters:this.buildGetters(),mutations:this.buildMutations(),actions:this.buildActions()},this.options)}_getDefaultMutations(t,e){var r=new Set(Object.keys(t)),n=new Set(Object.values(e).filter((t=>"object"==typeof t&&!t.mutation)).map((t=>t.attr)));for(var i of n)r.add(i);return r}addGetter(t){return this._getters.push(t),this}addMutation(t){return this._mutations.push(t),this}addAction(t){var{actionName:e,action:r}=t;return"object"!=typeof r||r.mutation||this._mutations.filter((t=>"string"==typeof t)).some((t=>t===r.attr))||this._mutations.push(r.attr),this._actions[e]=r,this}buildGetters(){var e,r={};for(var n of this._getters)if("string"==typeof n){e=n.split(".");var i=t.bind(null,e);r[e[e.length-1]]=i}else if("object"==typeof n)for(var o of Object.entries(n))if("string"==typeof o[1]){e=n.split(".");var a=t.bind(null,e);r[o[0]]=a}else"function"==typeof o[1]&&(r[o[0]]=o[1]);return r}buildMutations(){var t={},r=function(r){if("string"==typeof r)t["SET_"+e(r)]=(t,e)=>t[r]=e;else if("object"==typeof r){var n=function(e){"string"==typeof e[1]?t[e[0]]=(t,r)=>t[e[1]]=r:"function"==typeof e[1]&&(t[e[0]]=e[1])};for(var i of Object.entries(r))n(i)}};for(var n of this._mutations)r(n);return t}buildActions(){var t={};for(var e in this._actions)if("function"==typeof this._actions[e])t[e]=this._actions[e];else if("object"==typeof this._actions[e]){var r=this._actions[e];if(r.cacheAPIRequestIn){t[r.cacheAPIRequestIn]=this._createFetchAction(r);var[,n]=r.cacheAPIRequestIn.split("/");t["clear".concat(n[0].toUpperCase()+n.slice(1))]=this._createClearCacheAction(r.cacheAPIRequestIn)}t[e]=this.buildAction(r)}return t}buildAction(t){var n=this,i=(r,i)=>{var{commit:o,state:c,cache:u}=r,d=t.appendAlways||t.append&&(null==i?void 0:i.append),f=(null==i?void 0:i.refresh)&&t.editingRefreshService;return i&&delete i.append,new Promise(function(){var r=a((function*(r,a){try{u&&t.cacheActionToDelete&&n._deleteCacheAction(u,t.cacheActionToDelete);var h=u&&t.cacheAPIRequestIn?yield n._cacheAction(u,t.cacheAPIRequestIn,i):yield n._sendRequest(i,t);t.hasMetadata&&o("SET_TOTAL_"+e(t.attr),h.metadata.total),(t.attr||t.mutation)&&o(t.mutation?t.mutation:"SET_"+e(t.attr),yield n._prepareDataToCommit(h,s(s({},t),{},{append:d,state:c,refresh:f}))),r(h)}catch(t){a(t)}}));return function(t,e){return r.apply(this,arguments)}}())};return t.cacheAPIRequestIn||t.cacheActionToDelete?(0,r.cacheAction)(i):i}_prepareDataToCommit(t,e){return a((function*(){var r=t;if(e.hasMetadata&&(r=t.data),e.append)return Array.prototype.concat(e.state[e.attr],r);if(e.editing){var n=e.state[e.attr],i=n.findIndex((t=>t.id===r.id));if(e.refresh){var o=yield e.editingRefreshService(r.id);r=o.data}return n[i]=r,n}return r}))()}_sendRequest(t,e){return a((function*(){return e.spreadServiceArgs?(yield e.service(...t)).data:e.editing?(yield e.service(t.id,t.body)).data:(yield e.service(t)).data}))()}_createFetchAction(t){var e=this;return(r,n)=>new Promise(function(){var r=a((function*(r,i){try{r(yield e._sendRequest(n,t))}catch(t){i(t)}}));return function(t,e){return r.apply(this,arguments)}}())}_createClearCacheAction(t){return(0,r.cacheAction)((e=>{this._deleteCacheAction(e.cache,t)}))}_cacheAction(t,e,r){var n=r?JSON.stringify(r):"";return this._cachedActions[e]?this._cachedActions[e].add(n):this._cachedActions[e]=new Set([n]),t.dispatch(e,r)}_deleteCacheAction(t,e){if(this._cachedActions[e]){for(var r of this._cachedActions[e]){var n=""!==r?JSON.parse(r):void 0;t.has(e,n)&&t.delete(e,n)}this._cachedActions[e]=new Set}}}const f={common:{list:{hasMetadata:!0,append:!0},create:{appendAlways:!0},edit:{editing:!0}}}})(),i})()}));