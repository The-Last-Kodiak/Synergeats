(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const n of a.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function t(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(s){if(s.ep)return;s.ep=!0;const a=t(s);fetch(s.href,a)}})();var G,Yt;class ge extends Error{}ge.prototype.name="InvalidTokenError";function gs(i){return decodeURIComponent(atob(i).replace(/(.)/g,(e,t)=>{let r=t.charCodeAt(0).toString(16).toUpperCase();return r.length<2&&(r="0"+r),"%"+r}))}function fs(i){let e=i.replace(/-/g,"+").replace(/_/g,"/");switch(e.length%4){case 0:break;case 2:e+="==";break;case 3:e+="=";break;default:throw new Error("base64 string is not of the correct length")}try{return gs(e)}catch{return atob(e)}}function xr(i,e){if(typeof i!="string")throw new ge("Invalid token specified: must be a string");e||(e={});const t=e.header===!0?0:1,r=i.split(".")[t];if(typeof r!="string")throw new ge(`Invalid token specified: missing part #${t+1}`);let s;try{s=fs(r)}catch(a){throw new ge(`Invalid token specified: invalid base64 for part #${t+1} (${a.message})`)}try{return JSON.parse(s)}catch(a){throw new ge(`Invalid token specified: invalid json for part #${t+1} (${a.message})`)}}const vs="mu:context",ct=`${vs}:change`;class ys{constructor(e,t){this._proxy=bs(e,t)}get value(){return this._proxy}set value(e){Object.assign(this._proxy,e)}apply(e){this.value=e(this.value)}}class vt extends HTMLElement{constructor(e){super(),console.log("Constructing context provider",this),this.context=new ys(e,this),this.style.display="contents"}attach(e){return this.addEventListener(ct,e),e}detach(e){this.removeEventListener(ct,e)}}function bs(i,e){return new Proxy(i,{get:(r,s,a)=>s==="then"?void 0:Reflect.get(r,s,a),set:(r,s,a,n)=>{const l=i[s];console.log(`Context['${s.toString()}'] <= `,a);const o=Reflect.set(r,s,a,n);if(o){let p=new CustomEvent(ct,{bubbles:!0,cancelable:!0,composed:!0});Object.assign(p,{property:s,oldValue:l,value:a}),e.dispatchEvent(p)}else console.log(`Context['${s}] was not set to ${a}`);return o}})}function $s(i,e){const t=Sr(e,i);return new Promise((r,s)=>{if(t){const a=t.localName;customElements.whenDefined(a).then(()=>r(t))}else s({context:e,reason:`No provider for this context "${e}:`})})}function Sr(i,e){const t=`[provides="${i}"]`;if(!e||e===document.getRootNode())return;const r=e.closest(t);if(r)return r;const s=e.getRootNode();if(s instanceof ShadowRoot)return Sr(i,s.host)}class _s extends CustomEvent{constructor(e,t="mu:message"){super(t,{bubbles:!0,composed:!0,detail:e})}}function Ar(i="mu:message"){return(e,...t)=>e.dispatchEvent(new _s(t,i))}class yt{constructor(e,t,r="service:message",s=!0){this._pending=[],this._context=t,this._update=e,this._eventType=r,this._running=s}attach(e){e.addEventListener(this._eventType,t=>{t.stopPropagation();const r=t.detail;this.consume(r)})}start(){this._running||(console.log(`Starting ${this._eventType} service`),this._running=!0,this._pending.forEach(e=>this.process(e)))}consume(e){this._running?this.process(e):(console.log(`Queueing ${this._eventType} message`,e),this._pending.push(e))}process(e){console.log(`Processing ${e[0]} message`,e);const t=this._update(e,this._context.value);if(console.log(`Next[${e[0]}] => `,t),!Array.isArray(t))this._context.value=t;else{const[r,...s]=t;this._context.value=r,s.forEach(a=>a.then(n=>{n.length&&this.consume(n)}))}}}const ht="mu:auth:jwt",kr=class Er extends yt{constructor(e,t){super((r,s)=>this.update(r,s),e,Er.EVENT_TYPE),this._redirectForLogin=t}update(e,t){switch(e[0]){case"auth/signin":{const{token:s,redirect:a}=e[1];return[xs(s),at(a)]}case"auth/signout":return[Ss(t.user),at(this._redirectForLogin)];case"auth/redirect":return[t,at(this._redirectForLogin,{next:window.location.href})];default:const r=e[0];throw new Error(`Unhandled Auth message "${r}"`)}}};kr.EVENT_TYPE="auth:message";let Pr=kr;const Cr=Ar(Pr.EVENT_TYPE);function at(i,e){return new Promise((t,r)=>{if(i){const s=window.location.href,a=new URL(i,s);e&&Object.entries(e).forEach(([n,l])=>a.searchParams.set(n,l)),console.log("Redirecting to ",i),window.location.assign(a)}t([])})}class ws extends vt{get redirect(){return this.getAttribute("redirect")||void 0}constructor(){const e=ee.authenticateFromLocalStorage();super({user:e,token:e.authenticated?e.token:void 0})}connectedCallback(){new Pr(this.context,this.redirect).attach(this)}}class X{constructor(){this.authenticated=!1,this.username="anonymous"}static deauthenticate(e){return e.authenticated=!1,e.username="anonymous",localStorage.removeItem(ht),e}}class ee extends X{constructor(e){super();const t=xr(e);console.log("Token payload",t),this.token=e,this.authenticated=!0,this.username=t.username}static authenticate(e){const t=new ee(e);return localStorage.setItem(ht,e),t}static authenticateFromLocalStorage(){const e=localStorage.getItem(ht);return e?ee.authenticate(e):new X}}function xs(i){return{user:ee.authenticate(i),token:i}}function Ss(i){return{user:i&&i.authenticated?X.deauthenticate(i):i,token:""}}function As(i){return i&&i.authenticated?{Authorization:`Bearer ${i.token||"NO_TOKEN"}`}:{}}function ks(i){return i.authenticated?xr(i.token||""):{}}const P=Object.freeze(Object.defineProperty({__proto__:null,AuthenticatedUser:ee,Provider:ws,User:X,dispatch:Cr,headers:As,payload:ks},Symbol.toStringTag,{value:"Module"}));function Es(i,e,t){const r=new CustomEvent(e,{bubbles:!0,composed:!0,detail:t});i.dispatchEvent(r)}function dt(i,e,t){const r=i.target;Es(r,e,t)}function Vt(i,e="*"){return i.composedPath().find(s=>{const a=s;return a.tagName&&a.matches(e)})||void 0}function bt(i,...e){const t=i.map((s,a)=>a?[e[a-1],s]:[s]).flat().join("");let r=new CSSStyleSheet;return r.replaceSync(t),r}const Ps=new DOMParser;function q(i,...e){const t=e.map(l),r=i.map((o,p)=>{if(p===0)return[o];const m=t[p-1];return m instanceof Node?[`<ins id="mu-html-${p-1}"></ins>`,o]:[m,o]}).flat().join(""),s=Ps.parseFromString(r,"text/html"),a=s.head.childElementCount?s.head.children:s.body.children,n=new DocumentFragment;return n.replaceChildren(...a),t.forEach((o,p)=>{if(o instanceof Node){const m=n.querySelector(`ins#mu-html-${p}`);if(m){const d=m.parentNode;d?.replaceChild(o,m)}else console.log("Missing insertion point:",`ins#mu-html-${p}`)}}),n;function l(o,p){if(o===null)return"";switch(typeof o){case"string":return Gt(o);case"bigint":case"boolean":case"number":case"symbol":return Gt(o.toString());case"object":if(Array.isArray(o)){const m=new DocumentFragment,d=o.map(l);return m.replaceChildren(...d),m}return o instanceof Node?o:new Text(o.toString());default:return new Comment(`[invalid parameter of type "${typeof o}"]`)}}}function Gt(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Je(i,e={mode:"open"}){const t=i.attachShadow(e),r={template:s,styles:a};return r;function s(n){const l=n.firstElementChild,o=l&&l.tagName==="TEMPLATE"?l:void 0;return o&&t.appendChild(o.content.cloneNode(!0)),r}function a(...n){t.adoptedStyleSheets=n}}let Cs=(G=class extends HTMLElement{constructor(){super(),this._state={},Je(this).template(G.template).styles(G.styles),this.addEventListener("change",i=>{const e=i.target;if(e){const t=e.name,r=e.value;t&&(this._state[t]=r)}}),this.form&&this.form.addEventListener("submit",i=>{i.preventDefault(),dt(i,"mu-form:submit",this._state)}),this.submitSlot&&this.submitSlot.addEventListener("slotchange",()=>{var i,e;for(const t of((i=this.submitSlot)==null?void 0:i.assignedNodes())||[])(e=this.form)==null||e.insertBefore(t,this.submitSlot)})}set init(i){this._state=i||{},Ts(this._state,this)}get form(){var i;return(i=this.shadowRoot)==null?void 0:i.querySelector("form")}get submitSlot(){var i;const e=(i=this.shadowRoot)==null?void 0:i.querySelector('slot[name="submit"]');return e||null}},G.template=q`
    <template>
      <form autocomplete="off">
        <slot></slot>
        <slot name="submit">
          <button type="submit">Submit</button>
        </slot>
      </form>
      <slot name="delete"></slot>
      <style></style>
    </template>
  `,G.styles=bt`
    form {
      display: grid;
      gap: var(--size-spacing-medium);
      grid-column: 1/-1;
      grid-template-columns:
        subgrid
        [start] [label] [input] [col2] [col3] [end];
    }
    ::slotted(label) {
      display: grid;
      grid-column: label / end;
      grid-template-columns: subgrid;
      gap: var(--size-spacing-medium);
    }
    ::slotted(fieldset) {
      display: contents;
    }
    button[type="submit"] {
      grid-column: input;
      justify-self: start;
    }
  `,G);function Ts(i,e){const t=Object.entries(i);for(const[r,s]of t){const a=e.querySelector(`[name="${r}"]`);if(a){const n=a;switch(n.type){case"checkbox":const l=n;l.checked=!!s;break;case"date":s instanceof Date?n.value=s.toISOString().substr(0,10):n.value=s;break;default:n.value=s;break}}}return i}const Tr=Object.freeze(Object.defineProperty({__proto__:null,Element:Cs},Symbol.toStringTag,{value:"Module"})),Or=class Mr extends yt{constructor(e){super((t,r)=>this.update(t,r),e,Mr.EVENT_TYPE)}update(e,t){switch(e[0]){case"history/navigate":{const{href:r,state:s}=e[1];return Ms(r,s)}case"history/redirect":{const{href:r,state:s}=e[1];return Ns(r,s)}}}};Or.EVENT_TYPE="history:message";let $t=Or;class Jt extends vt{constructor(){super({location:document.location,state:{}}),this.addEventListener("click",e=>{const t=Os(e);if(t){const r=new URL(t.href);r.origin===this.context.value.location.origin&&(!this._root||r.pathname.startsWith(this._root))&&(console.log("Preventing Click Event on <A>",e),e.preventDefault(),_t(t,"history/navigate",{href:r.pathname+r.search}))}}),window.addEventListener("popstate",e=>{console.log("Popstate",e.state),this.context.value={location:document.location,state:e.state}})}connectedCallback(){new $t(this.context).attach(this),this._root=this.getAttribute("root")||void 0}}function Os(i){const e=i.currentTarget,t=r=>r.tagName=="A"&&r.href;if(i.button===0)if(i.composed){const s=i.composedPath().find(t);return s||void 0}else{for(let r=i.target;r;r===e?null:r.parentElement)if(t(r))return r;return}}function Ms(i,e={}){return history.pushState(e,"",i),{location:document.location,state:history.state}}function Ns(i,e={}){return history.replaceState(e,"",i),{location:document.location,state:history.state}}const _t=Ar($t.EVENT_TYPE),E=Object.freeze(Object.defineProperty({__proto__:null,HistoryProvider:Jt,Provider:Jt,Service:$t,dispatch:_t},Symbol.toStringTag,{value:"Module"}));class O{constructor(e,t){this._effects=[],this._target=e,this._contextLabel=t}observe(e=void 0){return new Promise((t,r)=>{if(this._provider){const s=new Kt(this._provider,e);this._effects.push(s),t(s)}else $s(this._target,this._contextLabel).then(s=>{const a=new Kt(s,e);this._provider=s,this._effects.push(a),s.attach(n=>this._handleChange(n)),t(a)}).catch(s=>console.log(`Observer ${this._contextLabel} failed to locate a provider`,s))})}_handleChange(e){console.log("Received change event for observers",e,this._effects),e.stopPropagation(),this._effects.forEach(t=>t.runEffect())}}class Kt{constructor(e,t){this._provider=e,t&&this.setEffect(t)}get context(){return this._provider.context}get value(){return this.context.value}setEffect(e){this._effectFn=e,this.runEffect()}runEffect(){this._effectFn&&this._effectFn(this.context.value)}}const Nr=class Rr extends HTMLElement{constructor(){super(),this._state={},this._user=new X,this._authObserver=new O(this,"blazing:auth"),Je(this).template(Rr.template),this.form&&this.form.addEventListener("submit",e=>{if(e.preventDefault(),this.src||this.action){if(console.log("Submitting form",this._state),this.action)this.action(this._state);else if(this.src){const t=this.isNew?"POST":"PUT",r=this.isNew?"created":"updated",s=this.isNew?this.src.replace(/[/][$]new$/,""):this.src;Rs(s,this._state,t,this.authorization).then(a=>de(a,this)).then(a=>{const n=`mu-rest-form:${r}`,l=new CustomEvent(n,{bubbles:!0,composed:!0,detail:{method:t,[r]:a,url:s}});this.dispatchEvent(l)}).catch(a=>{const n="mu-rest-form:error",l=new CustomEvent(n,{bubbles:!0,composed:!0,detail:{method:t,error:a,url:s,request:this._state}});this.dispatchEvent(l)})}}}),this.addEventListener("change",e=>{const t=e.target;if(t){const r=t.name,s=t.value;r&&(this._state[r]=s)}})}get src(){return this.getAttribute("src")}get isNew(){return this.hasAttribute("new")}set init(e){this._state=e||{},de(this._state,this)}get form(){var e;return(e=this.shadowRoot)==null?void 0:e.querySelector("form")}get authorization(){var e;return(e=this._user)!=null&&e.authenticated?{Authorization:`Bearer ${this._user.token}`}:{}}connectedCallback(){this._authObserver.observe(({user:e})=>{e&&(this._user=e,this.src&&!this.isNew&&Zt(this.src,this.authorization).then(t=>{this._state=t,de(t,this)}))})}attributeChangedCallback(e,t,r){switch(e){case"src":this.src&&r&&r!==t&&!this.isNew&&Zt(this.src,this.authorization).then(s=>{this._state=s,de(s,this)});break;case"new":r&&(this._state={},de({},this));break}}};Nr.observedAttributes=["src","new","action"];Nr.template=q`
    <template>
      <form autocomplete="off">
        <slot></slot>
        <slot name="submit">
          <button type="submit">Submit</button>
        </slot>
      </form>
      <slot name="delete"></slot>
      <style>
        form {
          display: grid;
          gap: var(--size-spacing-medium);
          grid-template-columns: [start] 1fr [label] 1fr [input] 3fr 1fr [end];
        }
        ::slotted(label) {
          display: grid;
          grid-column: label / end;
          grid-template-columns: subgrid;
          gap: var(--size-spacing-medium);
        }
        button[type="submit"] {
          grid-column: input;
          justify-self: start;
        }
      </style>
    </template>
  `;function Zt(i,e){return fetch(i,{headers:e}).then(t=>{if(t.status!==200)throw`Status: ${t.status}`;return t.json()}).catch(t=>console.log(`Failed to load form from ${i}:`,t))}function de(i,e){const t=Object.entries(i);for(const[r,s]of t){const a=e.querySelector(`[name="${r}"]`);if(a){const n=a;switch(n.type){case"checkbox":const l=n;l.checked=!!s;break;default:n.value=s;break}}}return i}function Rs(i,e,t="PUT",r={}){return fetch(i,{method:t,headers:{"Content-Type":"application/json",...r},body:JSON.stringify(e)}).then(s=>{if(s.status!=200&&s.status!=201)throw`Form submission failed: Status ${s.status}`;return s.json()})}const Lr=class jr extends yt{constructor(e,t){super(t,e,jr.EVENT_TYPE,!1)}};Lr.EVENT_TYPE="mu:message";let Ur=Lr;class Ls extends vt{constructor(e,t,r){super(t),this._user=new X,this._updateFn=e,this._authObserver=new O(this,r)}connectedCallback(){const e=new Ur(this.context,(t,r)=>this._updateFn(t,r,this._user));e.attach(this),this._authObserver.observe(({user:t})=>{console.log("Store got auth",t),t&&(this._user=t),e.start()})}}const js=Object.freeze(Object.defineProperty({__proto__:null,Provider:Ls,Service:Ur},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Oe=globalThis,wt=Oe.ShadowRoot&&(Oe.ShadyCSS===void 0||Oe.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,xt=Symbol(),Qt=new WeakMap;let Dr=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==xt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(wt&&e===void 0){const r=t!==void 0&&t.length===1;r&&(e=Qt.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&Qt.set(t,e))}return e}toString(){return this.cssText}};const Us=i=>new Dr(typeof i=="string"?i:i+"",void 0,xt),Ds=(i,...e)=>{const t=i.length===1?i[0]:e.reduce((r,s,a)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[a+1],i[0]);return new Dr(t,i,xt)},Is=(i,e)=>{if(wt)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const r=document.createElement("style"),s=Oe.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=t.cssText,i.appendChild(r)}},Xt=wt?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const r of e.cssRules)t+=r.cssText;return Us(t)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Hs,defineProperty:zs,getOwnPropertyDescriptor:qs,getOwnPropertyNames:Fs,getOwnPropertySymbols:Bs,getPrototypeOf:Ws}=Object,te=globalThis,er=te.trustedTypes,Ys=er?er.emptyScript:"",tr=te.reactiveElementPolyfillSupport,fe=(i,e)=>i,Ne={toAttribute(i,e){switch(e){case Boolean:i=i?Ys:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},St=(i,e)=>!Hs(i,e),rr={attribute:!0,type:String,converter:Ne,reflect:!1,useDefault:!1,hasChanged:St};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),te.litPropertyMetadata??(te.litPropertyMetadata=new WeakMap);let K=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=rr){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const r=Symbol(),s=this.getPropertyDescriptor(e,r,t);s!==void 0&&zs(this.prototype,e,s)}}static getPropertyDescriptor(e,t,r){const{get:s,set:a}=qs(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){const l=s?.call(this);a?.call(this,n),this.requestUpdate(e,l,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??rr}static _$Ei(){if(this.hasOwnProperty(fe("elementProperties")))return;const e=Ws(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(fe("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(fe("properties"))){const t=this.properties,r=[...Fs(t),...Bs(t)];for(const s of r)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[r,s]of t)this.elementProperties.set(r,s)}this._$Eh=new Map;for(const[t,r]of this.elementProperties){const s=this._$Eu(t,r);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const s of r)t.unshift(Xt(s))}else e!==void 0&&t.push(Xt(e));return t}static _$Eu(e,t){const r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Is(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var r;return(r=t.hostConnected)==null?void 0:r.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var r;return(r=t.hostDisconnected)==null?void 0:r.call(t)})}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){var r;const s=this.constructor.elementProperties.get(e),a=this.constructor._$Eu(e,s);if(a!==void 0&&s.reflect===!0){const n=(((r=s.converter)==null?void 0:r.toAttribute)!==void 0?s.converter:Ne).toAttribute(t,s.type);this._$Em=e,n==null?this.removeAttribute(a):this.setAttribute(a,n),this._$Em=null}}_$AK(e,t){var r,s;const a=this.constructor,n=a._$Eh.get(e);if(n!==void 0&&this._$Em!==n){const l=a.getPropertyOptions(n),o=typeof l.converter=="function"?{fromAttribute:l.converter}:((r=l.converter)==null?void 0:r.fromAttribute)!==void 0?l.converter:Ne;this._$Em=n,this[n]=o.fromAttribute(t,l.type)??((s=this._$Ej)==null?void 0:s.get(n))??null,this._$Em=null}}requestUpdate(e,t,r){var s;if(e!==void 0){const a=this.constructor,n=this[e];if(r??(r=a.getPropertyOptions(e)),!((r.hasChanged??St)(n,t)||r.useDefault&&r.reflect&&n===((s=this._$Ej)==null?void 0:s.get(e))&&!this.hasAttribute(a._$Eu(e,r))))return;this.C(e,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:s,wrapped:a},n){r&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,n??t??this[e]),a!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[a,n]of this._$Ep)this[a]=n;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[a,n]of s){const{wrapped:l}=n,o=this[a];l!==!0||this._$AL.has(a)||o===void 0||this.C(a,void 0,n,o)}}let t=!1;const r=this._$AL;try{t=this.shouldUpdate(r),t?(this.willUpdate(r),(e=this._$EO)==null||e.forEach(s=>{var a;return(a=s.hostUpdate)==null?void 0:a.call(s)}),this.update(r)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(r)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(r=>{var s;return(s=r.hostUpdated)==null?void 0:s.call(r)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};K.elementStyles=[],K.shadowRootOptions={mode:"open"},K[fe("elementProperties")]=new Map,K[fe("finalized")]=new Map,tr?.({ReactiveElement:K}),(te.reactiveElementVersions??(te.reactiveElementVersions=[])).push("2.1.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Re=globalThis,Le=Re.trustedTypes,sr=Le?Le.createPolicy("lit-html",{createHTML:i=>i}):void 0,Ir="$lit$",N=`lit$${Math.random().toFixed(9).slice(2)}$`,Hr="?"+N,Vs=`<${Hr}>`,F=document,ye=()=>F.createComment(""),be=i=>i===null||typeof i!="object"&&typeof i!="function",At=Array.isArray,Gs=i=>At(i)||typeof i?.[Symbol.iterator]=="function",nt=`[ 	
\f\r]`,ue=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ir=/-->/g,ar=/>/g,D=RegExp(`>|${nt}(?:([^\\s"'>=/]+)(${nt}*=${nt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),nr=/'/g,or=/"/g,zr=/^(?:script|style|textarea|title)$/i,Js=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),pe=Js(1),re=Symbol.for("lit-noChange"),$=Symbol.for("lit-nothing"),lr=new WeakMap,H=F.createTreeWalker(F,129);function qr(i,e){if(!At(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return sr!==void 0?sr.createHTML(e):e}const Ks=(i,e)=>{const t=i.length-1,r=[];let s,a=e===2?"<svg>":e===3?"<math>":"",n=ue;for(let l=0;l<t;l++){const o=i[l];let p,m,d=-1,c=0;for(;c<o.length&&(n.lastIndex=c,m=n.exec(o),m!==null);)c=n.lastIndex,n===ue?m[1]==="!--"?n=ir:m[1]!==void 0?n=ar:m[2]!==void 0?(zr.test(m[2])&&(s=RegExp("</"+m[2],"g")),n=D):m[3]!==void 0&&(n=D):n===D?m[0]===">"?(n=s??ue,d=-1):m[1]===void 0?d=-2:(d=n.lastIndex-m[2].length,p=m[1],n=m[3]===void 0?D:m[3]==='"'?or:nr):n===or||n===nr?n=D:n===ir||n===ar?n=ue:(n=D,s=void 0);const h=n===D&&i[l+1].startsWith("/>")?" ":"";a+=n===ue?o+Vs:d>=0?(r.push(p),o.slice(0,d)+Ir+o.slice(d)+N+h):o+N+(d===-2?l:h)}return[qr(i,a+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]};let ut=class Fr{constructor({strings:e,_$litType$:t},r){let s;this.parts=[];let a=0,n=0;const l=e.length-1,o=this.parts,[p,m]=Ks(e,t);if(this.el=Fr.createElement(p,r),H.currentNode=this.el.content,t===2||t===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=H.nextNode())!==null&&o.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const d of s.getAttributeNames())if(d.endsWith(Ir)){const c=m[n++],h=s.getAttribute(d).split(N),g=/([.?@])?(.*)/.exec(c);o.push({type:1,index:a,name:g[2],strings:h,ctor:g[1]==="."?Qs:g[1]==="?"?Xs:g[1]==="@"?ei:Ke}),s.removeAttribute(d)}else d.startsWith(N)&&(o.push({type:6,index:a}),s.removeAttribute(d));if(zr.test(s.tagName)){const d=s.textContent.split(N),c=d.length-1;if(c>0){s.textContent=Le?Le.emptyScript:"";for(let h=0;h<c;h++)s.append(d[h],ye()),H.nextNode(),o.push({type:2,index:++a});s.append(d[c],ye())}}}else if(s.nodeType===8)if(s.data===Hr)o.push({type:2,index:a});else{let d=-1;for(;(d=s.data.indexOf(N,d+1))!==-1;)o.push({type:7,index:a}),d+=N.length-1}a++}}static createElement(e,t){const r=F.createElement("template");return r.innerHTML=e,r}};function se(i,e,t=i,r){var s,a;if(e===re)return e;let n=r!==void 0?(s=t._$Co)==null?void 0:s[r]:t._$Cl;const l=be(e)?void 0:e._$litDirective$;return n?.constructor!==l&&((a=n?._$AO)==null||a.call(n,!1),l===void 0?n=void 0:(n=new l(i),n._$AT(i,t,r)),r!==void 0?(t._$Co??(t._$Co=[]))[r]=n:t._$Cl=n),n!==void 0&&(e=se(i,n._$AS(i,e.values),n,r)),e}let Zs=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:r}=this._$AD,s=(e?.creationScope??F).importNode(t,!0);H.currentNode=s;let a=H.nextNode(),n=0,l=0,o=r[0];for(;o!==void 0;){if(n===o.index){let p;o.type===2?p=new kt(a,a.nextSibling,this,e):o.type===1?p=new o.ctor(a,o.name,o.strings,this,e):o.type===6&&(p=new ti(a,this,e)),this._$AV.push(p),o=r[++l]}n!==o?.index&&(a=H.nextNode(),n++)}return H.currentNode=F,s}p(e){let t=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}},kt=class Br{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,r,s){this.type=2,this._$AH=$,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=se(this,e,t),be(e)?e===$||e==null||e===""?(this._$AH!==$&&this._$AR(),this._$AH=$):e!==this._$AH&&e!==re&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Gs(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==$&&be(this._$AH)?this._$AA.nextSibling.data=e:this.T(F.createTextNode(e)),this._$AH=e}$(e){var t;const{values:r,_$litType$:s}=e,a=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=ut.createElement(qr(s.h,s.h[0]),this.options)),s);if(((t=this._$AH)==null?void 0:t._$AD)===a)this._$AH.p(r);else{const n=new Zs(a,this),l=n.u(this.options);n.p(r),this.T(l),this._$AH=n}}_$AC(e){let t=lr.get(e.strings);return t===void 0&&lr.set(e.strings,t=new ut(e)),t}k(e){At(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let r,s=0;for(const a of e)s===t.length?t.push(r=new Br(this.O(ye()),this.O(ye()),this,this.options)):r=t[s],r._$AI(a),s++;s<t.length&&(this._$AR(r&&r._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var r;for((r=this._$AP)==null?void 0:r.call(this,!1,!0,t);e&&e!==this._$AB;){const s=e.nextSibling;e.remove(),e=s}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}},Ke=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,s,a){this.type=1,this._$AH=$,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=a,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=$}_$AI(e,t=this,r,s){const a=this.strings;let n=!1;if(a===void 0)e=se(this,e,t,0),n=!be(e)||e!==this._$AH&&e!==re,n&&(this._$AH=e);else{const l=e;let o,p;for(e=a[0],o=0;o<a.length-1;o++)p=se(this,l[r+o],t,o),p===re&&(p=this._$AH[o]),n||(n=!be(p)||p!==this._$AH[o]),p===$?e=$:e!==$&&(e+=(p??"")+a[o+1]),this._$AH[o]=p}n&&!s&&this.j(e)}j(e){e===$?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},Qs=class extends Ke{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===$?void 0:e}},Xs=class extends Ke{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==$)}},ei=class extends Ke{constructor(e,t,r,s,a){super(e,t,r,s,a),this.type=5}_$AI(e,t=this){if((e=se(this,e,t,0)??$)===re)return;const r=this._$AH,s=e===$&&r!==$||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,a=e!==$&&(r===$||s);s&&this.element.removeEventListener(this.name,this,r),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}},ti=class{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){se(this,e)}};const cr=Re.litHtmlPolyfillSupport;cr?.(ut,kt),(Re.litHtmlVersions??(Re.litHtmlVersions=[])).push("3.3.0");const ri=(i,e,t)=>{const r=t?.renderBefore??e;let s=r._$litPart$;if(s===void 0){const a=t?.renderBefore??null;r._$litPart$=s=new kt(e.insertBefore(ye(),a),a,void 0,t??{})}return s._$AI(i),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const $e=globalThis;let Q=class extends K{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;const t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ri(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return re}};Q._$litElement$=!0,Q.finalized=!0,(Yt=$e.litElementHydrateSupport)==null||Yt.call($e,{LitElement:Q});const hr=$e.litElementPolyfillSupport;hr?.({LitElement:Q});($e.litElementVersions??($e.litElementVersions=[])).push("4.2.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const si={attribute:!0,type:String,converter:Ne,reflect:!1,hasChanged:St},ii=(i=si,e,t)=>{const{kind:r,metadata:s}=t;let a=globalThis.litPropertyMetadata.get(s);if(a===void 0&&globalThis.litPropertyMetadata.set(s,a=new Map),r==="setter"&&((i=Object.create(i)).wrapped=!0),a.set(t.name,i),r==="accessor"){const{name:n}=t;return{set(l){const o=e.get.call(this);e.set.call(this,l),this.requestUpdate(n,o,i)},init(l){return l!==void 0&&this.C(n,void 0,i,l),l}}}if(r==="setter"){const{name:n}=t;return function(l){const o=this[n];e.call(this,l),this.requestUpdate(n,o,i)}}throw Error("Unsupported decorator location: "+r)};function Wr(i){return(e,t)=>typeof t=="object"?ii(i,e,t):((r,s,a)=>{const n=s.hasOwnProperty(a);return s.constructor.createProperty(a,r),n?Object.getOwnPropertyDescriptor(s,a):void 0})(i,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Yr(i){return Wr({...i,state:!0,attribute:!1})}function ai(i){return i&&i.__esModule&&Object.prototype.hasOwnProperty.call(i,"default")?i.default:i}function ni(i){throw new Error('Could not dynamically require "'+i+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var Vr={};(function(i){var e=(function(){var t=function(d,c,h,g){for(h=h||{},g=d.length;g--;h[d[g]]=c);return h},r=[1,9],s=[1,10],a=[1,11],n=[1,12],l=[5,11,12,13,14,15],o={trace:function(){},yy:{},symbols_:{error:2,root:3,expressions:4,EOF:5,expression:6,optional:7,literal:8,splat:9,param:10,"(":11,")":12,LITERAL:13,SPLAT:14,PARAM:15,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",11:"(",12:")",13:"LITERAL",14:"SPLAT",15:"PARAM"},productions_:[0,[3,2],[3,1],[4,2],[4,1],[6,1],[6,1],[6,1],[6,1],[7,3],[8,1],[9,1],[10,1]],performAction:function(c,h,g,v,f,y,et){var A=y.length-1;switch(f){case 1:return new v.Root({},[y[A-1]]);case 2:return new v.Root({},[new v.Literal({value:""})]);case 3:this.$=new v.Concat({},[y[A-1],y[A]]);break;case 4:case 5:this.$=y[A];break;case 6:this.$=new v.Literal({value:y[A]});break;case 7:this.$=new v.Splat({name:y[A]});break;case 8:this.$=new v.Param({name:y[A]});break;case 9:this.$=new v.Optional({},[y[A-1]]);break;case 10:this.$=c;break;case 11:case 12:this.$=c.slice(1);break}},table:[{3:1,4:2,5:[1,3],6:4,7:5,8:6,9:7,10:8,11:r,13:s,14:a,15:n},{1:[3]},{5:[1,13],6:14,7:5,8:6,9:7,10:8,11:r,13:s,14:a,15:n},{1:[2,2]},t(l,[2,4]),t(l,[2,5]),t(l,[2,6]),t(l,[2,7]),t(l,[2,8]),{4:15,6:4,7:5,8:6,9:7,10:8,11:r,13:s,14:a,15:n},t(l,[2,10]),t(l,[2,11]),t(l,[2,12]),{1:[2,1]},t(l,[2,3]),{6:14,7:5,8:6,9:7,10:8,11:r,12:[1,16],13:s,14:a,15:n},t(l,[2,9])],defaultActions:{3:[2,2],13:[2,1]},parseError:function(c,h){if(h.recoverable)this.trace(c);else{let g=function(v,f){this.message=v,this.hash=f};throw g.prototype=Error,new g(c,h)}},parse:function(c){var h=this,g=[0],v=[null],f=[],y=this.table,et="",A=0,Ft=0,ds=2,Bt=1,us=f.slice.call(arguments,1),b=Object.create(this.lexer),j={yy:{}};for(var tt in this.yy)Object.prototype.hasOwnProperty.call(this.yy,tt)&&(j.yy[tt]=this.yy[tt]);b.setInput(c,j.yy),j.yy.lexer=b,j.yy.parser=this,typeof b.yylloc>"u"&&(b.yylloc={});var rt=b.yylloc;f.push(rt);var ps=b.options&&b.options.ranges;typeof j.yy.parseError=="function"?this.parseError=j.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;for(var ms=function(){var V;return V=b.lex()||Bt,typeof V!="number"&&(V=h.symbols_[V]||V),V},S,U,k,st,Y={},Ce,C,Wt,Te;;){if(U=g[g.length-1],this.defaultActions[U]?k=this.defaultActions[U]:((S===null||typeof S>"u")&&(S=ms()),k=y[U]&&y[U][S]),typeof k>"u"||!k.length||!k[0]){var it="";Te=[];for(Ce in y[U])this.terminals_[Ce]&&Ce>ds&&Te.push("'"+this.terminals_[Ce]+"'");b.showPosition?it="Parse error on line "+(A+1)+`:
`+b.showPosition()+`
Expecting `+Te.join(", ")+", got '"+(this.terminals_[S]||S)+"'":it="Parse error on line "+(A+1)+": Unexpected "+(S==Bt?"end of input":"'"+(this.terminals_[S]||S)+"'"),this.parseError(it,{text:b.match,token:this.terminals_[S]||S,line:b.yylineno,loc:rt,expected:Te})}if(k[0]instanceof Array&&k.length>1)throw new Error("Parse Error: multiple actions possible at state: "+U+", token: "+S);switch(k[0]){case 1:g.push(S),v.push(b.yytext),f.push(b.yylloc),g.push(k[1]),S=null,Ft=b.yyleng,et=b.yytext,A=b.yylineno,rt=b.yylloc;break;case 2:if(C=this.productions_[k[1]][1],Y.$=v[v.length-C],Y._$={first_line:f[f.length-(C||1)].first_line,last_line:f[f.length-1].last_line,first_column:f[f.length-(C||1)].first_column,last_column:f[f.length-1].last_column},ps&&(Y._$.range=[f[f.length-(C||1)].range[0],f[f.length-1].range[1]]),st=this.performAction.apply(Y,[et,Ft,A,j.yy,k[1],v,f].concat(us)),typeof st<"u")return st;C&&(g=g.slice(0,-1*C*2),v=v.slice(0,-1*C),f=f.slice(0,-1*C)),g.push(this.productions_[k[1]][0]),v.push(Y.$),f.push(Y._$),Wt=y[g[g.length-2]][g[g.length-1]],g.push(Wt);break;case 3:return!0}}return!0}},p=(function(){var d={EOF:1,parseError:function(h,g){if(this.yy.parser)this.yy.parser.parseError(h,g);else throw new Error(h)},setInput:function(c,h){return this.yy=h||this.yy||{},this._input=c,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var c=this._input[0];this.yytext+=c,this.yyleng++,this.offset++,this.match+=c,this.matched+=c;var h=c.match(/(?:\r\n?|\n).*/g);return h?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),c},unput:function(c){var h=c.length,g=c.split(/(?:\r\n?|\n)/g);this._input=c+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-h),this.offset-=h;var v=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),g.length-1&&(this.yylineno-=g.length-1);var f=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:g?(g.length===v.length?this.yylloc.first_column:0)+v[v.length-g.length].length-g[0].length:this.yylloc.first_column-h},this.options.ranges&&(this.yylloc.range=[f[0],f[0]+this.yyleng-h]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},less:function(c){this.unput(this.match.slice(c))},pastInput:function(){var c=this.matched.substr(0,this.matched.length-this.match.length);return(c.length>20?"...":"")+c.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var c=this.match;return c.length<20&&(c+=this._input.substr(0,20-c.length)),(c.substr(0,20)+(c.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var c=this.pastInput(),h=new Array(c.length+1).join("-");return c+this.upcomingInput()+`
`+h+"^"},test_match:function(c,h){var g,v,f;if(this.options.backtrack_lexer&&(f={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(f.yylloc.range=this.yylloc.range.slice(0))),v=c[0].match(/(?:\r\n?|\n).*/g),v&&(this.yylineno+=v.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:v?v[v.length-1].length-v[v.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+c[0].length},this.yytext+=c[0],this.match+=c[0],this.matches=c,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(c[0].length),this.matched+=c[0],g=this.performAction.call(this,this.yy,this,h,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),g)return g;if(this._backtrack){for(var y in f)this[y]=f[y];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var c,h,g,v;this._more||(this.yytext="",this.match="");for(var f=this._currentRules(),y=0;y<f.length;y++)if(g=this._input.match(this.rules[f[y]]),g&&(!h||g[0].length>h[0].length)){if(h=g,v=y,this.options.backtrack_lexer){if(c=this.test_match(g,f[y]),c!==!1)return c;if(this._backtrack){h=!1;continue}else return!1}else if(!this.options.flex)break}return h?(c=this.test_match(h,f[v]),c!==!1?c:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var h=this.next();return h||this.lex()},begin:function(h){this.conditionStack.push(h)},popState:function(){var h=this.conditionStack.length-1;return h>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(h){return h=this.conditionStack.length-1-Math.abs(h||0),h>=0?this.conditionStack[h]:"INITIAL"},pushState:function(h){this.begin(h)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(h,g,v,f){switch(v){case 0:return"(";case 1:return")";case 2:return"SPLAT";case 3:return"PARAM";case 4:return"LITERAL";case 5:return"LITERAL";case 6:return"EOF"}},rules:[/^(?:\()/,/^(?:\))/,/^(?:\*+\w+)/,/^(?::+\w+)/,/^(?:[\w%\-~\n]+)/,/^(?:.)/,/^(?:$)/],conditions:{INITIAL:{rules:[0,1,2,3,4,5,6],inclusive:!0}}};return d})();o.lexer=p;function m(){this.yy={}}return m.prototype=o,o.Parser=m,new m})();typeof ni<"u"&&(i.parser=e,i.Parser=e.Parser,i.parse=function(){return e.parse.apply(e,arguments)})})(Vr);function J(i){return function(e,t){return{displayName:i,props:e,children:t||[]}}}var Gr={Root:J("Root"),Concat:J("Concat"),Literal:J("Literal"),Splat:J("Splat"),Param:J("Param"),Optional:J("Optional")},Jr=Vr.parser;Jr.yy=Gr;var oi=Jr,li=Object.keys(Gr);function ci(i){return li.forEach(function(e){if(typeof i[e]>"u")throw new Error("No handler defined for "+e.displayName)}),{visit:function(e,t){return this.handlers[e.displayName].call(this,e,t)},handlers:i}}var Kr=ci,hi=Kr,di=/[\-{}\[\]+?.,\\\^$|#\s]/g;function Zr(i){this.captures=i.captures,this.re=i.re}Zr.prototype.match=function(i){var e=this.re.exec(i),t={};if(e)return this.captures.forEach(function(r,s){typeof e[s+1]>"u"?t[r]=void 0:t[r]=decodeURIComponent(e[s+1])}),t};var ui=hi({Concat:function(i){return i.children.reduce((function(e,t){var r=this.visit(t);return{re:e.re+r.re,captures:e.captures.concat(r.captures)}}).bind(this),{re:"",captures:[]})},Literal:function(i){return{re:i.props.value.replace(di,"\\$&"),captures:[]}},Splat:function(i){return{re:"([^?]*?)",captures:[i.props.name]}},Param:function(i){return{re:"([^\\/\\?]+)",captures:[i.props.name]}},Optional:function(i){var e=this.visit(i.children[0]);return{re:"(?:"+e.re+")?",captures:e.captures}},Root:function(i){var e=this.visit(i.children[0]);return new Zr({re:new RegExp("^"+e.re+"(?=\\?|$)"),captures:e.captures})}}),pi=ui,mi=Kr,gi=mi({Concat:function(i,e){var t=i.children.map((function(r){return this.visit(r,e)}).bind(this));return t.some(function(r){return r===!1})?!1:t.join("")},Literal:function(i){return decodeURI(i.props.value)},Splat:function(i,e){return e[i.props.name]?e[i.props.name]:!1},Param:function(i,e){return e[i.props.name]?e[i.props.name]:!1},Optional:function(i,e){var t=this.visit(i.children[0],e);return t||""},Root:function(i,e){e=e||{};var t=this.visit(i.children[0],e);return t?encodeURI(t):!1}}),fi=gi,vi=oi,yi=pi,bi=fi;Ee.prototype=Object.create(null);Ee.prototype.match=function(i){var e=yi.visit(this.ast),t=e.match(i);return t||!1};Ee.prototype.reverse=function(i){return bi.visit(this.ast,i)};function Ee(i){var e;if(this?e=this:e=Object.create(Ee.prototype),typeof i>"u")throw new Error("A route spec is required");return e.spec=i,e.ast=vi.parse(i),e}var $i=Ee,_i=$i,wi=_i;const xi=ai(wi);var Si=Object.defineProperty,Qr=(i,e,t,r)=>{for(var s=void 0,a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=n(e,t,s)||s);return s&&Si(e,t,s),s};const Xr=class extends Q{constructor(e,t,r=""){super(),this._cases=[],this._fallback=()=>pe` <h1>Not Found</h1> `,this._cases=e.map(s=>({...s,route:new xi(s.path)})),this._historyObserver=new O(this,t),this._authObserver=new O(this,r)}connectedCallback(){this._historyObserver.observe(({location:e})=>{console.log("New location",e),e&&(this._match=this.matchRoute(e))}),this._authObserver.observe(({user:e})=>{this._user=e}),super.connectedCallback()}render(){return console.log("Rendering for match",this._match,this._user),pe` <main>${(()=>{const t=this._match;if(t){if("view"in t)return this._user?t.auth&&t.auth!=="public"&&this._user&&!this._user.authenticated?(Cr(this,"auth/redirect"),pe` <h1>Redirecting for Login</h1> `):(console.log("Loading view, ",t.params,t.query),t.view(t.params||{},t.query)):pe` <h1>Authenticating</h1> `;if("redirect"in t){const r=t.redirect;if(typeof r=="string")return this.redirect(r),pe` <h1>Redirecting to ${r}…</h1> `}}return this._fallback({})})()}</main> `}updated(e){e.has("_match")&&this.requestUpdate()}matchRoute(e){const{search:t,pathname:r}=e,s=new URLSearchParams(t),a=r+t;for(const n of this._cases){const l=n.route.match(a);if(l)return{...n,path:r,params:l,query:s}}}redirect(e){_t(this,"history/redirect",{href:e})}};Xr.styles=Ds`
    :host,
    main {
      display: contents;
    }
  `;let je=Xr;Qr([Yr()],je.prototype,"_user");Qr([Yr()],je.prototype,"_match");const Ai=Object.freeze(Object.defineProperty({__proto__:null,Element:je,Switch:je},Symbol.toStringTag,{value:"Module"})),es=class pt extends HTMLElement{constructor(){if(super(),Je(this).template(pt.template).styles(pt.styles),this.shadowRoot){const e=this.shadowRoot.querySelector("slot[name='actuator']");e&&e.addEventListener("click",()=>this.toggle())}}toggle(){this.hasAttribute("open")?this.removeAttribute("open"):this.setAttribute("open","open")}};es.template=q` <template>
    <slot name="actuator"><button>Menu</button></slot>
    <div id="panel">
      <slot></slot>
    </div>
  </template>`;es.styles=bt`
    :host {
      position: relative;
    }
    #is-shown {
      display: none;
    }
    #panel {
      display: none;

      position: absolute;
      right: 0;
      margin-top: var(--size-spacing-small);
      width: max-content;
      padding: var(--size-spacing-small);
      border-radius: var(--size-radius-small);
      background: var(--color-background-card);
      color: var(--color-text);
      box-shadow: var(--shadow-popover);
    }
    :host([open]) #panel {
      display: block;
    }
  `;const ts=class mt extends HTMLElement{constructor(){super(),this._array=[],Je(this).template(mt.template).styles(mt.styles),this.addEventListener("input-array:add",e=>{e.stopPropagation(),this.append(rs("",this._array.length))}),this.addEventListener("input-array:remove",e=>{e.stopPropagation(),this.removeClosestItem(e.target)}),this.addEventListener("change",e=>{e.stopPropagation();const t=e.target;if(t&&t!==this){const r=new Event("change",{bubbles:!0}),s=t.value,a=t.closest("label");if(a){const n=Array.from(this.children).indexOf(a);this._array[n]=s,this.dispatchEvent(r)}}}),this.addEventListener("click",e=>{Vt(e,"button.add")?dt(e,"input-array:add"):Vt(e,"button.remove")&&dt(e,"input-array:remove")})}get name(){return this.getAttribute("name")}get value(){return this._array}set value(e){this._array=Array.isArray(e)?e:[e],ki(this._array,this)}removeClosestItem(e){const t=e.closest("label");if(console.log("Removing closest item:",t,e),t){const r=Array.from(this.children).indexOf(t);this._array.splice(r,1),t.remove()}}};ts.template=q`
    <template>
      <ul>
        <slot></slot>
      </ul>
      <button class="add">
        <slot name="label-add">Add one</slot>
        <style></style>
      </button>
    </template>
  `;ts.styles=bt`
    :host {
      display: grid;
      grid-template-columns: subgrid;
      grid-column: input / end;
    }
    ul {
      display: contents;
    }
    button.add {
      grid-column: input / input-end;
    }
    ::slotted(label) {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: subgrid;
    }
  `;function ki(i,e){e.replaceChildren(),i.forEach((t,r)=>e.append(rs(t)))}function rs(i,e){const t=i===void 0?q`<input />`:q`<input value="${i}" />`;return q`
    <label>
      ${t}
      <button class="remove" type="button">Remove</button>
    </label>
  `}function W(i){return Object.entries(i).map(([e,t])=>{customElements.get(e)||customElements.define(e,t)}),customElements}var Ei=Object.defineProperty,Pi=Object.getOwnPropertyDescriptor,Ci=(i,e,t,r)=>{for(var s=Pi(e,t),a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=n(e,t,s)||s);return s&&Ei(e,t,s),s};class M extends Q{constructor(e){super(),this._pending=[],this._observer=new O(this,e)}get model(){return this._lastModel=this._context?this._context.value:{},this._lastModel}connectedCallback(){var e;super.connectedCallback(),(e=this._observer)==null||e.observe().then(t=>{console.log("View effect (initial)",this,t),this._context=t.context,this._pending.length&&this._pending.forEach(([r,s])=>{console.log("Dispatching queued event",s,r),r.dispatchEvent(s)}),t.setEffect(()=>{var r;if(console.log("View effect",this,t,(r=this._context)==null?void 0:r.value),this._context)console.log("requesting update"),this.requestUpdate(),this._lastModel=this._context.value;else throw"View context not ready for effect"})})}dispatchMessage(e,t=this){const r=new CustomEvent("mu:message",{bubbles:!0,composed:!0,detail:e});this._context?(console.log("Dispatching message event",r),t.dispatchEvent(r)):(console.log("Queueing message event",r),this._pending.push([t,r]))}ref(e){return this.model?this.model[e]:void 0}}Ci([Wr()],M.prototype,"model");/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Me=globalThis,Et=Me.ShadowRoot&&(Me.ShadyCSS===void 0||Me.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Pt=Symbol(),dr=new WeakMap;let ss=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==Pt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Et&&e===void 0){const r=t!==void 0&&t.length===1;r&&(e=dr.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&dr.set(t,e))}return e}toString(){return this.cssText}};const Ti=i=>new ss(typeof i=="string"?i:i+"",void 0,Pt),x=(i,...e)=>{const t=i.length===1?i[0]:e.reduce(((r,s,a)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[a+1]),i[0]);return new ss(t,i,Pt)},Oi=(i,e)=>{if(Et)i.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const t of e){const r=document.createElement("style"),s=Me.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=t.cssText,i.appendChild(r)}},ur=Et?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const r of e.cssRules)t+=r.cssText;return Ti(t)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Mi,defineProperty:Ni,getOwnPropertyDescriptor:Ri,getOwnPropertyNames:Li,getOwnPropertySymbols:ji,getPrototypeOf:Ui}=Object,Ze=globalThis,pr=Ze.trustedTypes,Di=pr?pr.emptyScript:"",Ii=Ze.reactiveElementPolyfillSupport,ve=(i,e)=>i,Ue={toAttribute(i,e){switch(e){case Boolean:i=i?Di:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},Ct=(i,e)=>!Mi(i,e),mr={attribute:!0,type:String,converter:Ue,reflect:!1,useDefault:!1,hasChanged:Ct};Symbol.metadata??=Symbol("metadata"),Ze.litPropertyMetadata??=new WeakMap;let Z=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=mr){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const r=Symbol(),s=this.getPropertyDescriptor(e,r,t);s!==void 0&&Ni(this.prototype,e,s)}}static getPropertyDescriptor(e,t,r){const{get:s,set:a}=Ri(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){const l=s?.call(this);a?.call(this,n),this.requestUpdate(e,l,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??mr}static _$Ei(){if(this.hasOwnProperty(ve("elementProperties")))return;const e=Ui(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(ve("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ve("properties"))){const t=this.properties,r=[...Li(t),...ji(t)];for(const s of r)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[r,s]of t)this.elementProperties.set(r,s)}this._$Eh=new Map;for(const[t,r]of this.elementProperties){const s=this._$Eu(t,r);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const s of r)t.unshift(ur(s))}else e!==void 0&&t.push(ur(e));return t}static _$Eu(e,t){const r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Oi(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){const r=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,r);if(s!==void 0&&r.reflect===!0){const a=(r.converter?.toAttribute!==void 0?r.converter:Ue).toAttribute(t,r.type);this._$Em=e,a==null?this.removeAttribute(s):this.setAttribute(s,a),this._$Em=null}}_$AK(e,t){const r=this.constructor,s=r._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const a=r.getPropertyOptions(s),n=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:Ue;this._$Em=s;const l=n.fromAttribute(t,a.type);this[s]=l??this._$Ej?.get(s)??l,this._$Em=null}}requestUpdate(e,t,r){if(e!==void 0){const s=this.constructor,a=this[e];if(r??=s.getPropertyOptions(e),!((r.hasChanged??Ct)(a,t)||r.useDefault&&r.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,r))))return;this.C(e,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:s,wrapped:a},n){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),a!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,a]of this._$Ep)this[s]=a;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[s,a]of r){const{wrapped:n}=a,l=this[s];n!==!0||this._$AL.has(s)||l===void 0||this.C(s,void 0,a,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((r=>r.hostUpdate?.())),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};Z.elementStyles=[],Z.shadowRootOptions={mode:"open"},Z[ve("elementProperties")]=new Map,Z[ve("finalized")]=new Map,Ii?.({ReactiveElement:Z}),(Ze.reactiveElementVersions??=[]).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Tt=globalThis,De=Tt.trustedTypes,gr=De?De.createPolicy("lit-html",{createHTML:i=>i}):void 0,is="$lit$",R=`lit$${Math.random().toFixed(9).slice(2)}$`,as="?"+R,Hi=`<${as}>`,B=document,_e=()=>B.createComment(""),we=i=>i===null||typeof i!="object"&&typeof i!="function",Ot=Array.isArray,zi=i=>Ot(i)||typeof i?.[Symbol.iterator]=="function",ot=`[ 	
\f\r]`,me=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,fr=/-->/g,vr=/>/g,I=RegExp(`>|${ot}(?:([^\\s"'>=/]+)(${ot}*=${ot}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),yr=/'/g,br=/"/g,ns=/^(?:script|style|textarea|title)$/i,qi=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),u=qi(1),ie=Symbol.for("lit-noChange"),_=Symbol.for("lit-nothing"),$r=new WeakMap,z=B.createTreeWalker(B,129);function os(i,e){if(!Ot(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return gr!==void 0?gr.createHTML(e):e}const Fi=(i,e)=>{const t=i.length-1,r=[];let s,a=e===2?"<svg>":e===3?"<math>":"",n=me;for(let l=0;l<t;l++){const o=i[l];let p,m,d=-1,c=0;for(;c<o.length&&(n.lastIndex=c,m=n.exec(o),m!==null);)c=n.lastIndex,n===me?m[1]==="!--"?n=fr:m[1]!==void 0?n=vr:m[2]!==void 0?(ns.test(m[2])&&(s=RegExp("</"+m[2],"g")),n=I):m[3]!==void 0&&(n=I):n===I?m[0]===">"?(n=s??me,d=-1):m[1]===void 0?d=-2:(d=n.lastIndex-m[2].length,p=m[1],n=m[3]===void 0?I:m[3]==='"'?br:yr):n===br||n===yr?n=I:n===fr||n===vr?n=me:(n=I,s=void 0);const h=n===I&&i[l+1].startsWith("/>")?" ":"";a+=n===me?o+Hi:d>=0?(r.push(p),o.slice(0,d)+is+o.slice(d)+R+h):o+R+(d===-2?l:h)}return[os(i,a+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]};class xe{constructor({strings:e,_$litType$:t},r){let s;this.parts=[];let a=0,n=0;const l=e.length-1,o=this.parts,[p,m]=Fi(e,t);if(this.el=xe.createElement(p,r),z.currentNode=this.el.content,t===2||t===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=z.nextNode())!==null&&o.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const d of s.getAttributeNames())if(d.endsWith(is)){const c=m[n++],h=s.getAttribute(d).split(R),g=/([.?@])?(.*)/.exec(c);o.push({type:1,index:a,name:g[2],strings:h,ctor:g[1]==="."?Wi:g[1]==="?"?Yi:g[1]==="@"?Vi:Qe}),s.removeAttribute(d)}else d.startsWith(R)&&(o.push({type:6,index:a}),s.removeAttribute(d));if(ns.test(s.tagName)){const d=s.textContent.split(R),c=d.length-1;if(c>0){s.textContent=De?De.emptyScript:"";for(let h=0;h<c;h++)s.append(d[h],_e()),z.nextNode(),o.push({type:2,index:++a});s.append(d[c],_e())}}}else if(s.nodeType===8)if(s.data===as)o.push({type:2,index:a});else{let d=-1;for(;(d=s.data.indexOf(R,d+1))!==-1;)o.push({type:7,index:a}),d+=R.length-1}a++}}static createElement(e,t){const r=B.createElement("template");return r.innerHTML=e,r}}function ae(i,e,t=i,r){if(e===ie)return e;let s=r!==void 0?t._$Co?.[r]:t._$Cl;const a=we(e)?void 0:e._$litDirective$;return s?.constructor!==a&&(s?._$AO?.(!1),a===void 0?s=void 0:(s=new a(i),s._$AT(i,t,r)),r!==void 0?(t._$Co??=[])[r]=s:t._$Cl=s),s!==void 0&&(e=ae(i,s._$AS(i,e.values),s,r)),e}class Bi{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:r}=this._$AD,s=(e?.creationScope??B).importNode(t,!0);z.currentNode=s;let a=z.nextNode(),n=0,l=0,o=r[0];for(;o!==void 0;){if(n===o.index){let p;o.type===2?p=new Pe(a,a.nextSibling,this,e):o.type===1?p=new o.ctor(a,o.name,o.strings,this,e):o.type===6&&(p=new Gi(a,this,e)),this._$AV.push(p),o=r[++l]}n!==o?.index&&(a=z.nextNode(),n++)}return z.currentNode=B,s}p(e){let t=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}}class Pe{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,r,s){this.type=2,this._$AH=_,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ae(this,e,t),we(e)?e===_||e==null||e===""?(this._$AH!==_&&this._$AR(),this._$AH=_):e!==this._$AH&&e!==ie&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):zi(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==_&&we(this._$AH)?this._$AA.nextSibling.data=e:this.T(B.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:r}=e,s=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=xe.createElement(os(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===s)this._$AH.p(t);else{const a=new Bi(s,this),n=a.u(this.options);a.p(t),this.T(n),this._$AH=a}}_$AC(e){let t=$r.get(e.strings);return t===void 0&&$r.set(e.strings,t=new xe(e)),t}k(e){Ot(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let r,s=0;for(const a of e)s===t.length?t.push(r=new Pe(this.O(_e()),this.O(_e()),this,this.options)):r=t[s],r._$AI(a),s++;s<t.length&&(this._$AR(r&&r._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const r=e.nextSibling;e.remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class Qe{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,s,a){this.type=1,this._$AH=_,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=a,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=_}_$AI(e,t=this,r,s){const a=this.strings;let n=!1;if(a===void 0)e=ae(this,e,t,0),n=!we(e)||e!==this._$AH&&e!==ie,n&&(this._$AH=e);else{const l=e;let o,p;for(e=a[0],o=0;o<a.length-1;o++)p=ae(this,l[r+o],t,o),p===ie&&(p=this._$AH[o]),n||=!we(p)||p!==this._$AH[o],p===_?e=_:e!==_&&(e+=(p??"")+a[o+1]),this._$AH[o]=p}n&&!s&&this.j(e)}j(e){e===_?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Wi extends Qe{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===_?void 0:e}}class Yi extends Qe{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==_)}}class Vi extends Qe{constructor(e,t,r,s,a){super(e,t,r,s,a),this.type=5}_$AI(e,t=this){if((e=ae(this,e,t,0)??_)===ie)return;const r=this._$AH,s=e===_&&r!==_||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,a=e!==_&&(r===_||s);s&&this.element.removeEventListener(this.name,this,r),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Gi{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){ae(this,e)}}const Ji=Tt.litHtmlPolyfillSupport;Ji?.(xe,Pe),(Tt.litHtmlVersions??=[]).push("3.3.1");const Ki=(i,e,t)=>{const r=t?.renderBefore??e;let s=r._$litPart$;if(s===void 0){const a=t?.renderBefore??null;r._$litPart$=s=new Pe(e.insertBefore(_e(),a),a,void 0,t??{})}return s._$AI(i),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Mt=globalThis;class T extends Z{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ki(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ie}}T._$litElement$=!0,T.finalized=!0,Mt.litElementHydrateSupport?.({LitElement:T});const Zi=Mt.litElementPolyfillSupport;Zi?.({LitElement:T});(Mt.litElementVersions??=[]).push("4.2.1");const Qi={meals:[],profile:void 0,plan:void 0},_r={sedentary:12,light:13,moderate:14,active:15,athlete:16};function Xi(i){return i===void 0||Number.isNaN(i)?"moderate":i<=1?"sedentary":i<=3?"light":i<=6?"moderate":i<=10?"active":"athlete"}function Ie(i){const{weightLbs:e,goal:t}=i,r=i.activityLevel??Xi(i.activityHours),s=_r[r]??_r.moderate,a=e*s,l=Math.max(1200,Math.round(a+(t==="bulk"?300:t==="cut"?-300:0))),p=Math.round(e*(t==="cut"?1:.85)),m=Math.round(e*.3),d=Math.max(0,l-p*4-m*9),c=Math.round(d/4);return{calories:l,proteinTarget:p,carbsTarget:c,fatTarget:m}}function ea(i){if(!i)return i;const{weightLbs:e,goal:t,gender:r,activityLevel:s,calories:a,proteinTarget:n,carbsTarget:l,fatTarget:o}=i;if(a&&n&&l&&o)return i;if(e&&t){const p=Ie({weightLbs:e,goal:t,activityLevel:s});return{...i,...p}}return i}function ta(i,e,t){const[r,s,a]=i;switch(r){case"meals/request":return[e,ra(t).then(n=>["meals/load",{meals:n},a??{}])];case"meals/load":return{...e,meals:s.meals};case"meal/request":return[e,sa(s.id,t).then(n=>["meal/load",{meal:n},a??{}])];case"meal/load":return{...e,selectedMeal:s.meal};case"meal/save":return[e,ia(s,t,a??{}).then(n=>["meal/load",{meal:n},a??{}])];case"meal/delete":return[e,na(s.id,t,a??{}).then(()=>["meals/request",{},a??{}])];case"meal/create":return[e,aa(s.meal,t,a??{}).then(n=>["meal/load",{meal:n},a??{}])];case"plan/save":return[e,la(s.weeklyPlan,s.myMeals,t,a??{}).then(n=>["plan/load",{plan:n},a??{}])];case"plan/request":return[e,oa(t).then(n=>["plan/load",{plan:n},a??{}])];case"plan/load":return{...e,plan:s.plan};case"profile/request":return[e,ca(t).then(n=>["profile/load",{profile:n},a??{}])];case"profile/load":return{...e,profile:ea(s.profile)};case"profile/save":{const n=t?.username??t?.sub??t?.userid??void 0,l=n&&s?{...e.profile??{},userid:n,weightLbs:s.weightLbs??e.profile?.weightLbs??0,goal:s.goal??e.profile?.goal??"maintain",gender:s.gender,activityLevel:s.activityLevel,activityHours:s.activityHours,dietaryPreferences:s.dietaryPreferences,calories:s.calories,proteinTarget:s.proteinTarget,carbsTarget:s.carbsTarget,fatTarget:s.fatTarget,weeklyPlan:s.weeklyPlan??e.profile?.weeklyPlan}:e.profile;return[{...e,profile:l},ha(s,t,a??{}).then(o=>["profile/load",{profile:o},a??{}])]}default:{const n=r;throw new Error(`Unhandled message "${n}"`)}}}function ra(i){return fetch("/api/meals",{headers:P.headers(i)}).then(e=>{if(e.ok)return e.json();throw new Error(`Failed to load meals: ${e.status}`)}).then(e=>e)}function sa(i,e){return fetch(`/api/meals/${i}`,{headers:P.headers(e)}).then(t=>{if(t.ok)return t.json();throw new Error(`Failed to load meal ${i}: ${t.status}`)}).then(t=>t)}function ia(i,e,t){return fetch(`/api/meals/${i.id}`,{method:"PUT",headers:{"Content-Type":"application/json",...P.headers(e)},body:JSON.stringify(i.meal)}).then(r=>{if(r.ok)return r.json();throw new Error(`Failed to save meal ${i.id}: ${r.status}`)}).then(r=>{const s=r;return t.onSuccess?.(),s}).catch(r=>{throw t.onFailure?.(r),r})}function aa(i,e,t){return fetch("/api/meals",{method:"POST",headers:{"Content-Type":"application/json",...P.headers(e)},body:JSON.stringify(i)}).then(r=>{if(r.ok)return r.json();throw new Error(`Failed to create meal: ${r.status}`)}).then(r=>{const s=r;return t.onSuccess?.(),s}).catch(r=>{throw t.onFailure?.(r),r})}function na(i,e,t){return fetch(`/api/meals/${i}`,{method:"DELETE",headers:{...P.headers(e)}}).then(r=>{if(r.ok){t.onSuccess?.();return}throw new Error(`Failed to delete meal: ${r.status}`)}).catch(r=>{throw t.onFailure?.(r),r})}function oa(i){const e=P.headers(i),t=i?.username??i?.sub??i?.userid??"guest";return fetch("/api/plan",{headers:e}).then(r=>{if(r.status===401)throw new Error("Not authenticated");return r.ok?r.json():{userid:t,weeklyPlan:{},myMeals:[]}}).catch(()=>({userid:t,weeklyPlan:{},myMeals:[]}))}function la(i,e,t,r){const s={"Content-Type":"application/json",...P.headers(t)};return fetch("/api/plan",{method:"PUT",headers:s,body:JSON.stringify({weeklyPlan:i,myMeals:e})}).then(a=>{if(a.ok)return a.json();throw new Error(`Failed to save plan: ${a.status}`)}).then(a=>{const n=a;return r.onSuccess?.(),n}).catch(a=>{throw r.onFailure?.(a),a})}function ca(i){const e=i?.username??i?.sub??i?.userid??void 0;return e?fetch(`/api/profile/${e}`,{headers:P.headers(i)}).then(t=>{if(t.status===404)return{userid:e,weightLbs:0,goal:"maintain"};if(t.ok)return t.json();throw new Error(`Failed to load profile: ${t.status}`)}).then(t=>t):Promise.reject(new Error("No logged-in user"))}function ha(i,e,t){const r=e?.username??e?.sub??e?.userid??void 0;if(!r){const s=new Error("No logged-in user");return t.onFailure?.(s),Promise.reject(s)}return fetch(`/api/profile/${r}`,{method:"PUT",headers:{"Content-Type":"application/json",...P.headers(e)},body:JSON.stringify(i)}).then(s=>{if(s.ok)return s.json();throw new Error(`Failed to save profile: ${s.status}`)}).then(s=>{const a=s;return t.onSuccess?.(),a}).catch(s=>{throw t.onFailure?.(s),s})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const da={attribute:!0,type:String,converter:Ue,reflect:!1,hasChanged:Ct},ua=(i=da,e,t)=>{const{kind:r,metadata:s}=t;let a=globalThis.litPropertyMetadata.get(s);if(a===void 0&&globalThis.litPropertyMetadata.set(s,a=new Map),r==="setter"&&((i=Object.create(i)).wrapped=!0),a.set(t.name,i),r==="accessor"){const{name:n}=t;return{set(l){const o=e.get.call(this);e.set.call(this,l),this.requestUpdate(n,o,i)},init(l){return l!==void 0&&this.C(n,void 0,i,l),l}}}if(r==="setter"){const{name:n}=t;return function(l){const o=this[n];e.call(this,l),this.requestUpdate(n,o,i)}}throw Error("Unsupported decorator location: "+r)};function he(i){return(e,t)=>typeof t=="object"?ua(i,e,t):((r,s,a)=>{const n=s.hasOwnProperty(a);return s.constructor.createProperty(a,r),n?Object.getOwnPropertyDescriptor(s,a):void 0})(i,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function w(i){return he({...i,state:!0,attribute:!1})}var pa=Object.defineProperty,ma=(i,e,t,r)=>{for(var s=void 0,a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=n(e,t,s)||s);return s&&pa(e,t,s),s};const jt=class jt extends T{constructor(){super(...arguments),this.user=null,this.authObserver=new O(this,"Synergeats:auth")}connectedCallback(){super.connectedCallback(),this.authObserver.observe(e=>{this.user=e.user??null})}navigate(e,t){e.preventDefault(),E.dispatch(this,"history/navigate",{href:t})}handleSignOut(e){e.preventDefault(),this.dispatchEvent(new CustomEvent("auth:message",{bubbles:!0,composed:!0,detail:["auth/signout",{}]})),this.user=null,E.dispatch(this,"history/navigate",{href:"/app"})}render(){const e=this.user?.username??this.user?.userid??this.user?.sub??"";return u`
      <header class="header">
        <a class="brand" href="/app" @click=${t=>this.navigate(t,"/app")}>
          <span class="logo">Synergeats</span>
          <span class="tagline">Personalized meal planning SPA</span>
        </a>

        <nav class="nav">
          <a href="/app" @click=${t=>this.navigate(t,"/app")}>
            Home
          </a>
          <a
            href="/app/plan"
            @click=${t=>this.navigate(t,"/app/plan")}
          >
            Plan
          </a>
          <a
            href="/app/meals"
            @click=${t=>this.navigate(t,"/app/meals")}
          >
            Meals
          </a>
          <a
            href="/app/profile"
            @click=${t=>this.navigate(t,"/app/profile")}
          >
            Profile
          </a>
        </nav>

        <div class="auth">
          ${this.user&&this.user.authenticated?u`
                <span class="user-label">
                  Signed in as ${e}
                </span>
                <button @click=${this.handleSignOut}>Sign out</button>
              `:u`
                <button
                  class="ghost"
                  @click=${t=>this.navigate(t,"/app/login")}
                >
                  Sign in
                </button>
                <button
                  class="ghost"
                  @click=${t=>this.navigate(t,"/app/signup")}
                >
                  Sign up
                </button>
              `}
        </div>
      </header>
    `}};jt.styles=x`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 1rem 2rem;
    }

    .brand {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      text-decoration: none;
      color: inherit;
    }

    .logo {
      font-family: var(--font-display-stack);
      font-size: 1.6rem;
    }

    .tagline {
      font-size: 0.9rem;
      color: var(--color-muted, #9ea6c0);
    }

    .nav {
      display: flex;
      gap: 1.5rem;
      font-size: 1rem;
    }

    .nav a {
      color: var(--color-link, #1cd96a);
      text-decoration: none;
    }

    .nav a:hover {
      text-decoration: underline;
    }

    .auth {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
    }

    .auth button {
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      border: 1px solid var(--color-border, #283047);
      background: var(--color-surface-1, transparent);
      color: inherit;
      cursor: pointer;
    }

    .auth button.ghost {
      background: transparent;
    }

    .auth button:hover {
      border-color: var(--color-link, #22d3ee);
    }
  `;let He=jt;ma([w()],He.prototype,"user");var ga=Object.defineProperty,Nt=(i,e,t,r)=>{for(var s=void 0,a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=n(e,t,s)||s);return s&&ga(e,t,s),s};const fa="•",Ut=class Ut extends M{constructor(){super("Synergeats:model"),this.theme="dark",this.publicMeals=[],this.authObserver=new O(this,"Synergeats:auth"),this.toggleTheme=()=>{this.setTheme(this.theme==="dark"?"light":"dark")}}connectedCallback(){super.connectedCallback(),this.authObserver.observe(t=>{if(this.auth=t,t.user?.authenticated){const r={};if(this.dispatchMessage(["profile/request",{},r]),this.dispatchMessage(["plan/request",{},r]),!(this.model.profile&&(this.model.profile.weightLbs||this.model.profile.goal))){const a=localStorage.getItem("synergeats:onboarding");if(a)try{const n=JSON.parse(a);this.dispatchMessage(["profile/save",n,{}]),localStorage.removeItem("synergeats:onboarding")}catch{}}}}),localStorage.getItem("synergeats:theme")==="light"&&this.setTheme("light"),this.loadPublicMeals()}loadPublicMeals(){fetch("/api/public/meals").then(e=>e.ok?e.json():[]).then(e=>this.publicMeals=e??[]).catch(()=>this.publicMeals=[])}setTheme(e){this.theme=e,document.body.classList.toggle("light-mode",e==="light"),localStorage.setItem("synergeats:theme",e)}navigate(e,t){e.preventDefault(),E.dispatch(this,"history/navigate",{href:t})}get isLoggedIn(){return!!this.auth?.user?.authenticated}get username(){const e=this.auth?.user;return e?.username??e?.userid??e?.sub??"you"}render(){const e=this.model.profile,t=!e||!e.weightLbs||!e.goal;return u`
      <main class="page home">
        <section class="hero card">
          <div class="header-row">
            <h1>Synergeats</h1>
            <div class="toggles">
              <label class="mode">
                <input
                  type="checkbox"
                  @change=${this.toggleTheme}
                  ?checked=${this.theme==="light"}
                />
                <span>Light mode</span>
              </label>
              ${this.isLoggedIn?null:u`
                    <a
                      class="ghost"
                      href="/app/login"
                      @click=${r=>this.navigate(r,"/app/login")}
                    >
                      Sign in
                    </a>
                  `}
            </div>
          </div>

          <p>
            Guided nutrition made simple. Answer a few questions, we calculate
            your macros, and you pick meals that fit.
          </p>

          ${this.isLoggedIn?u`
                <div class="cta-row">
                  <a
                    class="primary"
                    href="/app/plan"
                    @click=${r=>this.navigate(r,"/app/plan")}
                  >
                    Plan & schedule
                  </a>
                  <a
                    class="ghost"
                    href="/app/meals"
                    @click=${r=>this.navigate(r,"/app/meals")}
                  >
                    Select meals
                  </a>
                </div>
              `:u`
                <div class="cta-row">
                  <a
                    class="primary"
                    href="/app/signup"
                    @click=${r=>this.navigate(r,"/app/signup")}
                  >
                    Create an account
                  </a>
                  <a
                    class="ghost"
                    href="/app/login"
                    @click=${r=>this.navigate(r,"/app/login")}
                  >
                    Sign in
                  </a>
                </div>
              `}
        </section>

        ${this.isLoggedIn?t?this.renderOnboardingPrompt():this.renderDashboard(e):this.renderLoggedOut()}
      </main>
    `}renderLoggedOut(){return u`
      <section class="card preview">
        <h2>Why Synergeats?</h2>
        <ol>
          <li>Answer a short onboarding (diet, goals, activity).</li>
          <li>We estimate calories & macros you can tweak anytime.</li>
          <li>Pick weekly meals that match your targets.</li>
        </ol>
        <p class="hint">
          Browse our default meals below. Saving your plan requires an account.
        </p>
        <div class="cta-row">
          <a
            class="primary"
            href="/app/signup"
            @click=${e=>this.navigate(e,"/app/signup")}
          >
            Sign up free
          </a>
        </div>
        <div class="meal-preview">
          ${(this.publicMeals??[]).map(e=>u`
              <article class="mini-card">
                <h4>${e.name}</h4>
                <p class="tags">${(e.tags??[]).join(` ${fa} `)}</p>
                <p class="macros">${e.calories??"—"} kcal</p>
              </article>
            `)}
        </div>
      </section>
    `}renderOnboardingPrompt(){return u`
      <section class="card preview">
        <h2>Finish onboarding</h2>
        <p class="hint">
          We need your diet, goal, and activity to build your plan.
        </p>
        <a
          class="primary"
          href="/app/onboarding"
          @click=${e=>this.navigate(e,"/app/onboarding")}
        >
          Start now
        </a>
      </section>
    `}renderDashboard(e){const t=!!e;return u`
      <section class="card split">
        <div>
          <p class="eyebrow">Welcome back</p>
          <h2>${this.username}, here is your plan</h2>
          ${t?u`
                <dl class="stats">
                  <div>
                    <dt>Goal</dt>
                    <dd>${e?.goal??"maintain"}</dd>
                  </div>
                  <div>
                    <dt>Weight</dt>
                    <dd>${e?.weightLbs??"—"} lb</dd>
                  </div>
                  <div>
                    <dt>Calories</dt>
                    <dd>${e?.calories??"—"} kcal</dd>
                  </div>
                  <div>
                    <dt>Protein</dt>
                    <dd>${e?.proteinTarget??"—"} g</dd>
                  </div>
                  <div>
                    <dt>Carbs</dt>
                    <dd>${e?.carbsTarget??"—"} g</dd>
                  </div>
                  <div>
                    <dt>Fat</dt>
                    <dd>${e?.fatTarget??"—"} g</dd>
                  </div>
                </dl>
              `:u`
                <p class="hint">
                  You have not configured a plan yet. Start with the plan page
                  to calculate your macros.
                </p>
              `}

          <div class="cta-row">
            <a
              class="primary"
              href="/app/plan"
              @click=${r=>this.navigate(r,"/app/plan")}
            >
              Adjust plan
            </a>
            <a
              class="ghost"
              href="/app/profile"
              @click=${r=>this.navigate(r,"/app/profile")}
            >
              Edit profile
            </a>
          </div>
        </div>

        <div class="card inset">
          <h3>Your week</h3>
          <p class="hint">
            Review your selected meals for the week and make swaps anytime.
          </p>
          <ul class="links">
            <li>
              <a
                href="/app/meals"
                @click=${r=>this.navigate(r,"/app/meals")}
              >
                Meal selections
              </a>
            </li>
            <li>
              <a
                href="/app/plan"
                @click=${r=>this.navigate(r,"/app/plan")}
              >
                Plan + macros
              </a>
            </li>
          </ul>
        </div>
      </section>
    `}};Ut.styles=x`
    main.home {
      padding: 2rem 3rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .card {
      padding: 2rem 2.5rem;
      border-radius: var(--radius-2xl, 1.5rem);
      background: var(--color-surface-1, #0f172a);
      border: 1px solid var(--color-border, #1c2230);
      color: var(--color-text, #e5e7eb);
    }

    .card.inset {
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed rgba(255, 255, 255, 0.15);
    }

    .hero h1 {
      margin-bottom: 0.75rem;
      font-size: 2rem;
    }

    .hero p {
      margin-bottom: 0.75rem;
      max-width: 40rem;
    }

    .cta-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 0.75rem;
    }

    a.primary,
    a.ghost {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.65rem 1.2rem;
      border-radius: 999px;
      font-weight: 700;
      text-decoration: none;
      border: 1px solid var(--color-border, #1c2230);
      color: inherit;
    }

    a.primary {
      background: #16a34a;
      color: #020617;
      border-color: #16a34a;
    }

    a.ghost:hover {
      border-color: var(--color-border, #1c2230);
    }

    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .toggles {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .mode {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.95rem;
    }

    .split {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: 1.3fr 1fr;
    }

    @media (max-width: 860px) {
      .split {
        grid-template-columns: 1fr;
      }
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .stats dt {
      font-size: 0.85rem;
      color: var(--color-muted, #9ea6c0);
    }

    .stats dd {
      margin: 0;
      font-weight: 700;
    }

    .eyebrow {
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 0.8rem;
      color: var(--color-muted, #9ea6c0);
      margin: 0 0 0.4rem 0;
    }

    .links {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0 0;
      display: grid;
      gap: 0.5rem;
    }

    .links a {
      color: var(--color-link, #1cd96a);
      text-decoration: none;
    }

    .preview ol {
      margin: 0 0 0.6rem 1.1rem;
      padding: 0;
      display: grid;
      gap: 0.35rem;
    }

    .hint {
      color: var(--color-muted, #9ea6c0);
      margin: 0.25rem 0 0;
    }

    .meal-preview {
      margin-top: 1rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.5rem;
    }

    .mini-card {
      padding: 0.75rem;
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 0.75rem;
      background: var(--color-surface-2, #0f1b32);
    }

    .mini-card h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
    }

    .mini-card .tags,
    .mini-card .macros {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-muted, #9ea6c0);
    }
  `;let ne=Ut;Nt([w()],ne.prototype,"auth");Nt([w()],ne.prototype,"theme");Nt([w()],ne.prototype,"publicMeals");var va=Object.defineProperty,ya=(i,e,t,r)=>{for(var s=void 0,a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=n(e,t,s)||s);return s&&va(e,t,s),s};const Dt=class Dt extends T{render(){const e=this.meal;return e?u`
      <article class="card">
        ${e.imgSrc?u`<div class="thumb">
              <img src=${e.imgSrc} alt=${e.name} />
            </div>`:null}
        <header>
          <h3>${e.name}</h3>
          ${e.tags?.length?u`<p class="tags">
                ${e.tags.join(" • ")}
              </p>`:null}
        </header>

        <dl class="macros">
          <div>
            <dt>Calories</dt>
            <dd>${e.calories}</dd>
          </div>
          <div>
            <dt>Protein</dt>
            <dd>${e.protein} g</dd>
          </div>
          <div>
            <dt>Carbs</dt>
            <dd>${e.carbs} g</dd>
          </div>
          <div>
            <dt>Fat</dt>
            <dd>${e.fat} g</dd>
          </div>
        </dl>

        ${e.ingredients?u`<p class="ingredients">${e.ingredients}</p>`:null}
      </article>
    `:u``}};Dt.styles=x`
    :host {
      display: block;
    }

    .card {
      padding: 1.5rem 2rem;
      border-radius: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: grid;
      gap: 0.75rem;
      grid-template-columns: 1fr;
      min-height: 100%;
    }

    h3 {
      font-size: 1.4rem;
      margin: 0;
    }

    .tags {
      margin: 0.25rem 0 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .macros {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin: 0;
    }

    .macros div {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    dt {
      font-size: 0.8rem;
      text-transform: uppercase;
      opacity: 0.7;
    }

    dd {
      margin: 0;
      font-weight: 600;
    }

    .thumb img {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border-radius: 0.8rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .ingredients {
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-muted, #9ea6c0);
    }
  `;let oe=Dt;ya([he({type:Object})],oe.prototype,"meal");var ba=Object.defineProperty,Rt=(i,e,t,r)=>{for(var s=void 0,a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=n(e,t,s)||s);return s&&ba(e,t,s),s};const Fe=class Fe extends M{constructor(){super("Synergeats:model"),this.authObserver=new O(this,"Synergeats:auth"),this.loggedIn=!1,this.publicMeals=[],this.myMeals=[]}connectedCallback(){super.connectedCallback(),this.authObserver.observe(e=>{if(this.loggedIn=!!e.user?.authenticated,this.loggedIn){const t={};this.dispatchMessage(["meals/request",{},t])}else this.loadPublicMeals()}),this.loadPublicMeals()}updated(){this.myMeals=this.model.plan?.myMeals??[]}loadPublicMeals(){fetch("/api/public/meals").then(e=>e.ok?e.json():[]).then(e=>this.publicMeals=e??[]).catch(()=>this.publicMeals=[])}navigate(e,t){e.preventDefault(),E.dispatch(this,"history/navigate",{href:t})}scrollToCatalog(e){e.preventDefault(),(this.renderRoot?.querySelector("#catalog")??document.getElementById("catalog"))?.scrollIntoView({behavior:"smooth"})}render(){const e=this.loggedIn?this.model.meals??[]:this.publicMeals;return u`
      <main class="page">
        <header class="page-header">
          <div>
            <h2>Your meals</h2>
            <p class="hint">
              Meals you've selected for the week. Adjust your plan to change quantities.
            </p>
          </div>
          <div class="actions">
            ${this.loggedIn?u`
                  <a
                    class="primary"
                    href="/app/plan"
                    @click=${t=>this.navigate(t,"/app/plan")}
                  >
                    Update plan
                  </a>
                  <a class="ghost" href="#catalog" @click=${this.scrollToCatalog}>
                    Add more meals
                  </a>
                  <a
                    class="ghost"
                    href="/app/meals/new"
                    @click=${t=>this.navigate(t,"/app/meals/new")}
                  >
                    Create new meal
                  </a>
                `:u`
                  <a
                    class="primary"
                    href="/app/signup"
                    @click=${t=>this.navigate(t,"/app/signup")}
                  >
                    Sign up to save meals
                  </a>
                  <a
                    class="ghost"
                    href="/app/login"
                    @click=${t=>this.navigate(t,"/app/login")}
                  >
                    Sign in
                  </a>
                `}
          </div>
        </header>

        ${this.loggedIn?u`
              <section class="catalog card" id="my">
                <div class="catalog-header">
                  <h3>My meals list</h3>
                  <p class="hint">
                    Check meals to keep in your personal list. This list is shared with your plan days.
                  </p>
                </div>
                <div class="meals-list selectable">
                  ${e.map(t=>{const r=t.id??t._id,s=this.myMeals.includes(r);return u`
                      <label class="meal-select">
                        <input
                          type="checkbox"
                          ?checked=${s}
                          @change=${a=>this.toggleMyMeal(a,r)}
                        />
                        <sg-meal-card .meal=${t}></sg-meal-card>
                      </label>
                    `})}
                </div>
              </section>
            `:null}

        <section class="meals-list selected">
          ${e.length?e.map(t=>this.renderMeal(t)):u`<p>No meals loaded yet (or still loading)...</p>`}
        </section>

        ${this.loggedIn,null}
      </main>
    `}renderMeal(e){const t=e.id??e._id;return u`
      <article class="meal-row">
        <a class="card-link" href="/app/meals/${t}">
          <sg-meal-card .meal=${e}></sg-meal-card>
        </a>
        ${this.loggedIn&&t&&e.owner&&e.owner!=="default"?u`
              <p class="meal-actions">
                <a href="/app/meals/${t}">View</a>
                <a href="/app/meals/${t}/edit">Edit</a>
                <button
                  class="ghost"
                  @click=${r=>this.deleteMeal(r,t)}
                >
                  Delete
                </button>
              </p>
            `:null}
      </article>
    `}deleteMeal(e,t){e.preventDefault();const r={};this.dispatchMessage(["meal/delete",{id:t},r])}toggleMyMeal(e,t){const s=e.target.checked?Array.from(new Set([...this.myMeals,t])):this.myMeals.filter(l=>l!==t);this.myMeals=s;const a={},n=this.model.plan?.weeklyPlan??{};this.dispatchMessage(["plan/save",{weeklyPlan:n,myMeals:s},a])}};Fe.uses=W({"sg-meal-card":oe}),Fe.styles=x`
    main.page {
      padding: 2rem 3rem;
    }

    h2 {
      margin: 0;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    a.primary,
    a.ghost {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.55rem 1rem;
      border-radius: 999px;
      font-weight: 700;
      text-decoration: none;
      border: 1px solid var(--color-border, #1c2230);
      color: inherit;
    }

    a.primary {
      background: #16a34a;
      border-color: #16a34a;
      color: #020617;
    }

    .meals-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.75rem;
      margin-bottom: 2rem;
      align-items: start;
    }

    .meal-actions {
      margin-top: 0.5rem;
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .hint {
      color: var(--color-muted, #9ea6c0);
      margin: 0.2rem 0 0;
    }

    .catalog {
      padding: 1.25rem;
      border-radius: 1.25rem;
      border: 1px solid var(--color-border, #1c2230);
      background: var(--color-surface-1, #0f172a);
      margin-top: 2rem;
    }

    .catalog-header {
      margin-bottom: 0.75rem;
    }

    .catalog h3 {
      margin: 0;
    }

    .card-link {
      color: inherit;
      text-decoration: none;
      display: block;
      height: 100%;
    }

    button.ghost {
      padding: 0.35rem 0.8rem;
      border-radius: 999px;
      border: 1px solid var(--color-border, #1c2230);
      background: transparent;
      color: inherit;
      cursor: pointer;
    }

    .meal-select {
      display: grid;
      gap: 0.4rem;
      background: var(--color-surface-2, #0f1b32);
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 0.75rem;
      padding: 0.5rem;
      height: 100%;
    }

    .meal-select input {
      justify-self: start;
      width: 1.2rem;
      height: 1.2rem;
    }
  `;let le=Fe;Rt([w()],le.prototype,"loggedIn");Rt([w()],le.prototype,"publicMeals");Rt([w()],le.prototype,"myMeals");var $a=Object.defineProperty,_a=Object.getOwnPropertyDescriptor,ls=(i,e,t,r)=>{for(var s=r>1?void 0:r?_a(e,t):e,a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=(r?n(e,t,s):n(s))||s);return r&&s&&$a(e,t,s),s};const It=class It extends M{constructor(){super("Synergeats:model"),this.handleSubmit=e=>{if(e.preventDefault(),!this.mealid)return;const t=e.currentTarget,r=new FormData(t),s=r.get("tags")??"",a={id:this.mealid,name:String(r.get("name")??""),calories:Number(r.get("calories")??0),protein:Number(r.get("protein")??0),carbs:Number(r.get("carbs")??0),fat:Number(r.get("fat")??0),tags:s.split(",").map(n=>n.trim()).filter(Boolean),imgSrc:String(r.get("imgSrc")??"").trim()||void 0,ingredients:String(r.get("ingredients")??"").trim()||void 0};this.dispatchMessage(["meal/save",{id:this.mealid,meal:a},{onSuccess:()=>E.dispatch(this,"history/navigate",{href:"/app/meals"}),onFailure:n=>console.error("ERROR saving meal:",n)}])},this.handleCancel=e=>{e.preventDefault(),E.dispatch(this,"history/navigate",{href:"/app/meals"})}}get meal(){return this.model.selectedMeal}connectedCallback(){super.connectedCallback(),this.mealid&&this.dispatchMessage(["meal/request",{id:this.mealid},{}])}attributeChangedCallback(e,t,r){super.attributeChangedCallback(e,t,r),e==="meal-id"&&r&&r!==t&&this.dispatchMessage(["meal/request",{id:r},{}])}render(){const e=this.meal;return e?u`
      <main class="page">
        <h2>Edit meal: ${e.name}</h2>

        <form class="card" @submit=${this.handleSubmit}>
          <label>
            <span>Name</span>
            <input name="name" .value=${e.name??""} required />
          </label>

          <div class="grid">
            <label>
              <span>Calories</span>
              <input
                type="number"
                name="calories"
                .value=${String(e.calories??"")}
                required
              />
            </label>

            <label>
              <span>Protein (g)</span>
              <input
                type="number"
                name="protein"
                .value=${String(e.protein??"")}
                required
              />
            </label>

            <label>
              <span>Carbs (g)</span>
              <input
                type="number"
                name="carbs"
                .value=${String(e.carbs??"")}
                required
              />
            </label>

            <label>
              <span>Fat (g)</span>
              <input
                type="number"
                name="fat"
                .value=${String(e.fat??"")}
                required
              />
            </label>
          </div>

          <label>
            <span>Ingredients</span>
            <textarea
              name="ingredients"
              rows="2"
              .value=${e.ingredients??""}
            ></textarea>
          </label>

          <label>
            <span>Tags (comma-separated)</span>
            <input
              name="tags"
              .value=${(e.tags??[]).join(", ")}
              placeholder="High-Protein, Gluten-Free"
            />
          </label>

          <label>
            <span>Image URL</span>
            <input
              name="imgSrc"
              .value=${e.imgSrc??""}
              placeholder="/images/meals/chicken.jpg"
            />
          </label>

          <div class="buttons">
            <button type="submit" class="primary">Save meal</button>
            <button type="button" class="ghost" @click=${this.handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </main>
    `:u`
        <main class="page">
          <h2>Edit Meal</h2>
          <p>Loading meal data...</p>
        </main>
      `}};It.styles=x`
    main.page {
      padding: 2rem 3rem;
      max-width: 48rem;
    }

    form.card {
      display: grid;
      gap: 1rem;
      background: var(--color-surface-2, #0f1b32);
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 1rem;
      padding: 1.25rem;
    }

    .grid {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    input,
    textarea {
      padding: 0.5rem 0.7rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(0, 0, 0, 0.2);
      color: inherit;
    }

    .buttons {
      margin-top: 1rem;
      display: flex;
      gap: 0.75rem;
    }

    button.primary,
    button.ghost {
      padding: 0.55rem 1rem;
      border-radius: 999px;
      border: 1px solid var(--color-border, #1c2230);
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-weight: 700;
    }

    button.primary {
      background: var(--color-accent-2, #16a34a);
      color: var(--color-text-inverted, #020617);
      border-color: var(--color-accent-2, #16a34a);
    }
  `;let Se=It;ls([he({attribute:"meal-id"})],Se.prototype,"mealid",2);ls([w()],Se.prototype,"meal",1);var wa=Object.defineProperty,Lt=(i,e,t,r)=>{for(var s=void 0,a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=n(e,t,s)||s);return s&&wa(e,t,s),s};const wr=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],lt=()=>({Sun:[],Mon:[],Tue:[],Wed:[],Thu:[],Fri:[],Sat:[]}),Be=class Be extends M{constructor(){super("Synergeats:model"),this.selectedDay="Sun",this.schedule=lt(),this.myMeals=[],this.planSnapshot="",this.applyToAll=()=>{const e=this.schedule[this.selectedDay]??[],t=lt();wr.forEach(r=>{t[r]=[...e]}),this.schedule=t},this.saveSchedule=()=>{const e=this.myMeals.length>0?this.myMeals:Array.from(new Set(Object.values(this.schedule).flat().filter(Boolean))),t={};this.dispatchMessage(["plan/save",{weeklyPlan:this.schedule,myMeals:e},t])}}navigate(e,t){e.preventDefault(),E.dispatch(this,"history/navigate",{href:t})}connectedCallback(){super.connectedCallback();const e={};this.dispatchMessage(["profile/request",{},e]),this.dispatchMessage(["meals/request",{},e]),this.dispatchMessage(["plan/request",{},e])}updated(e){const t=this.model.plan?.weeklyPlan??{},r=JSON.stringify(t);r!==this.planSnapshot&&(this.planSnapshot=r,this.schedule=this.mergeWithDefaults(t),this.myMeals=this.model.plan?.myMeals??[])}mergeWithDefaults(e){const t=lt();return Object.entries(e??{}).forEach(([r,s])=>{r in t&&(t[r]=Array.isArray(s)?[...s]:[])}),t}render(){const e=this.model.meals??[],t=this.model.profile;return u`
      <main class="page">
        <header class="page-header">
          <div>
            <p class="eyebrow">Plan & schedule</p>
            <h1>Your weekly plan</h1>
            <p class="hint">
              Pick meals for each day, then save to your account. Defaults and your meals are all shown here.
            </p>
          </div>
          <div class="summary card">
            <h3>Macros</h3>
            <dl class="stats">
              <div>
                <dt>Calories</dt>
                <dd>${t?.calories??"—"}</dd>
              </div>
              <div>
                <dt>Protein</dt>
                <dd>${t?.proteinTarget??"—"} g</dd>
              </div>
              <div>
                <dt>Carbs</dt>
                <dd>${t?.carbsTarget??"—"} g</dd>
              </div>
              <div>
                <dt>Fat</dt>
                <dd>${t?.fatTarget??"—"} g</dd>
              </div>
            </dl>
          </div>
        </header>

        <section class="note card">
          <h3>Meal list</h3>
          <p class="hint">
            Your schedule uses the meals you've marked as "My meals" on the Meals page.
            Edit that list there, then return to assign days.
          </p>
          <a class="ghost" href="/app/meals" @click=${r=>this.navigate(r,"/app/meals")}>Go to Meals</a>
        </section>

      <section class="schedule card">
        <div class="days">
          ${wr.map(r=>u`
              <button
                  class=${r===this.selectedDay?"pill active":"pill"}
                  @click=${()=>this.selectedDay=r}
                >
                  ${r}
                </button>
              `)}
          </div>

          <div class="day-editor">
            <h3>Meals for ${this.selectedDay}</h3>
            <p class="hint">Select meals to include for this day.</p>
            ${this.availableMeals(e).length?u`
                  <div class="meal-grid selectable tightened">
                    ${this.availableMeals(e).map(r=>{const s=r.id??r._id,a=this.schedule[this.selectedDay]?.includes(s);return u`
                        <label class="meal-select">
                          <input
                            type="checkbox"
                            ?checked=${a}
                            @change=${n=>this.toggleMeal(n,this.selectedDay,s)}
                          />
                          <sg-meal-card .meal=${r}></sg-meal-card>
                        </label>
                      `})}
                  </div>
                `:u`<p class="hint">
                  No meals selected yet. Pick some in “My meals list” above.
                </p>`}

            <div class="actions">
              <button class="ghost" @click=${this.applyToAll}>
                Apply this day to all
              </button>
              <button class="primary" @click=${this.saveSchedule}>
                Save schedule
              </button>
            </div>
          </div>
        </section>
      </main>
    `}toggleMeal(e,t,r){const s=e.target.checked,a=this.schedule[t]??[],n=s?Array.from(new Set([...a,r])):a.filter(l=>l!==r);this.schedule={...this.schedule,[t]:n}}availableMeals(e){return this.myMeals.length?e.filter(t=>{const r=t?.id??t?._id;return this.myMeals.includes(r)}):e}};Be.uses=W({"sg-meal-card":oe}),Be.styles=x`
    main.page {
      padding: 2rem 3rem;
      display: grid;
      gap: 1.5rem;
    }

    .page-header {
      display: grid;
      gap: 1rem;
      grid-template-columns: 2fr 1fr;
      align-items: start;
    }

    @media (max-width: 900px) {
      .page-header {
        grid-template-columns: 1fr;
      }
    }

    .eyebrow {
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 0.8rem;
      color: var(--color-muted, #9ea6c0);
      margin: 0 0 0.3rem 0;
    }

    .hint {
      color: var(--color-muted, #9ea6c0);
      margin: 0.2rem 0 0;
    }

    .summary {
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 1rem;
      padding: 1rem;
      background: var(--color-surface-1, #0f172a);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.6rem;
      margin: 0.5rem 0 0;
      padding: 0;
    }

    .stats dt {
      font-size: 0.85rem;
      color: var(--color-muted, #9ea6c0);
    }

    .stats dd {
      margin: 0;
      font-weight: 700;
    }

    .suggestions {
      display: grid;
      gap: 0.75rem;
    }

    .meal-grid {
      display: grid;
      gap: 1.25rem;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      grid-auto-rows: 1fr;
      align-items: start;
    }

    .meal-grid.tightened {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .schedule {
      display: grid;
      gap: 1.25rem;
      background: var(--color-surface-1, #0f172a);
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 1rem;
      padding: 1rem;
    }

    .days {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .pill {
      padding: 0.5rem 0.9rem;
      border-radius: 999px;
      border: 1px solid var(--color-border, #1c2230);
      background: rgba(255, 255, 255, 0.04);
      color: inherit;
      cursor: pointer;
    }

    .pill.active {
      background: var(--color-accent-2, #16a34a);
      color: var(--color-text-inverted, #020617);
      border-color: var(--color-accent-2, #16a34a);
    }

    .day-editor {
      display: grid;
      gap: 0.75rem;
    }

    .meal-grid.selectable {
      background: var(--color-surface-2, #0f1b32);
      padding: 0.75rem;
      border-radius: 1rem;
      border: 1px solid var(--color-border, #1c2230);
    }

    .meal-select {
      display: grid;
      gap: 0.4rem;
      background: var(--color-surface-2, #0f1b32);
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 0.75rem;
      padding: 0.5rem;
      height: 100%;
    }

    .meal-select input {
      justify-self: start;
      width: 1.2rem;
      height: 1.2rem;
    }

    .meal-select sg-meal-card {
      display: block;
      height: 100%;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    button.primary,
    button.ghost {
      padding: 0.6rem 1.2rem;
      border-radius: 999px;
      border: 1px solid var(--color-border, #1c2230);
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-weight: 700;
    }

    button.primary {
      background: var(--color-accent-2, #16a34a);
      color: var(--color-text-inverted, #020617);
      border-color: var(--color-accent-2, #16a34a);
    }
  `;let ce=Be;Lt([w()],ce.prototype,"selectedDay");Lt([w()],ce.prototype,"schedule");Lt([w()],ce.prototype,"myMeals");const xa=x`
  * { margin: 0; box-sizing: border-box; }
  img { max-width: 100%; display: block; }
  ul, menu { list-style: none; padding: 0; margin: 0; }
`,Sa={styles:xa},Aa=x`
  h1, h2, h3, h4 {
    font-family: var(--font-display-stack, system-ui);
    font-weight: 600;
    line-height: var(--leading-tight, 1.1);
    margin: 0 0 0.5rem 0;
  }

  h2 {
    font-size: var(--font-size-4, 1.5rem);
  }
`,ka={styles:Aa};var Ea=Object.defineProperty,Xe=(i,e,t,r)=>{for(var s=void 0,a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=n(e,t,s)||s);return s&&Ea(e,t,s),s};const Ht=class Ht extends T{constructor(){super(...arguments),this.formData={},this.redirect="/"}get canSubmit(){return!!(this.api&&this.formData.username&&this.formData.password&&(!this.isRegister||this.formData.password===this.formData.passwordConfirm))}get isRegister(){return(this.api??"").includes("/register")}render(){return u`
      <form
        @change=${e=>this.handleChange(e)}
        @submit=${e=>this.handleSubmit(e)}
      >
        <slot></slot>

        <slot name="button">
          <button ?disabled=${!this.canSubmit} type="submit">
            Login
          </button>
        </slot>

        <p class="error">${this.error}</p>
      </form>
    `}handleChange(e){const t=e.target,r=t?.name,s=t?.value,a=this.formData;switch(r){case"username":this.formData={...a,username:s};break;case"password":this.formData={...a,password:s};break;case"passwordConfirm":this.formData={...a,passwordConfirm:s};break}}handleSubmit(e){e.preventDefault(),this.canSubmit&&fetch(this.api||"",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:this.formData.username,password:this.formData.password})}).then(t=>t.status===201||t.status===200?t.json():t.json().catch(()=>({})).then(r=>{throw r?.error??`Request failed (${t.status})`})).then(t=>{const{token:r}=t,s=new CustomEvent("auth:message",{bubbles:!0,composed:!0,detail:["auth/signin",{token:r,redirect:this.redirect}]});console.log("dispatching message",s),this.dispatchEvent(s)}).catch(t=>{console.log(t),this.error=String(t)})}};Ht.styles=[Sa.styles,ka.styles,x`
      form {
        display: grid;
        gap: 0.75rem;
      }

      label {
        display: grid;
        gap: 0.25rem;
      }

      span {
        font-weight: 600;
      }

      input {
        padding: 0.4rem 0.6rem;
        border-radius: 4px;
        border: 1px solid var(--color-border);
        background: var(--color-surface-1);
        color: var(--color-text);
      }

      button[type="submit"] {
        padding: 0.4rem 0.8rem;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        background: var(--color-accent);
        color: var(--color-on-accent);
        font-weight: 600;
      }

      button[disabled] {
        opacity: 0.6;
        cursor: default;
      }

      .error:not(:empty) {
        color: var(--color-error);
        border: 1px solid var(--color-error);
        padding: 0.5rem;
        border-radius: 4px;
      }
    `];let L=Ht;Xe([w()],L.prototype,"formData");Xe([he()],L.prototype,"api");Xe([he()],L.prototype,"redirect");Xe([w()],L.prototype,"error");const We=class We extends T{render(){return u`
      <main class="page">
        <section class="hero">
          <h1>Sign in to Synergeats</h1>
          <p>Log in to save your plan and personalize meals.</p>
          <p class="alt">
            No account? <a href="/app/signup">Create one here.</a>
          </p>
        </section>

        <section class="card">
          <login-form api="/auth/login" redirect="/app">
            <label>
              <span>Username</span>
              <input name="username" autocomplete="off" />
            </label>
            <label>
              <span>Password</span>
              <input type="password" name="password" />
            </label>
          </login-form>
        </section>
      </main>
    `}};We.uses=W({"mu-form":Tr.Element,"login-form":L}),We.styles=x`
    main.page {
      padding: 2rem 3rem;
      max-width: 640px;
      margin: 0 auto;
    }

    .hero {
      margin-bottom: 2rem;
    }

    .hero h1 {
      margin: 0 0 0.5rem 0;
    }

    .card {
      padding: 2rem;
      border-radius: 1.25rem;
      background: var(--color-surface-2, #050b15);
      border: 1px solid var(--color-border, #1c2230);
    }

    login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    input {
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.25);
      color: inherit;
    }
  `;let gt=We;var Pa=Object.defineProperty,cs=(i,e,t,r)=>{for(var s=void 0,a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=n(e,t,s)||s);return s&&Pa(e,t,s),s};const zt=class zt extends M{constructor(){super("Synergeats:model"),this.authObserver=new O(this,"Synergeats:auth"),this.step=0,this.form={dietaryPreferences:[]},this.next=e=>{e.preventDefault();const t=Math.min(2,this.step+1);this.step=t},this.back=e=>{e.preventDefault();const t=Math.max(0,this.step-1);this.step=t},this.finish=e=>{e.preventDefault();const t=this.form.weightLbs??0,r=this.form.goal??"maintain",s=this.form.gender??"unspecified",a=this.form.activityHours??0,n=t?Ie({weightLbs:t,goal:r,activityHours:a}):void 0,l={weightLbs:t,goal:r,gender:s,activityHours:a,dietaryPreferences:this.form.dietaryPreferences,...n};localStorage.setItem("synergeats:onboarding",JSON.stringify(l));const o={onSuccess:()=>E.dispatch(this,"history/navigate",{href:"/app"}),onFailure:()=>E.dispatch(this,"history/navigate",{href:"/app/signup"})};this.dispatchMessage(["profile/save",l,o])}}connectedCallback(){super.connectedCallback(),this.authObserver.observe(()=>{});const e=localStorage.getItem("synergeats:onboarding");if(e)try{this.form=JSON.parse(e)}catch{}}setField(e,t){this.form={...this.form,[e]:t}}togglePref(e,t){const r=this.form.dietaryPreferences??[];this.form={...this.form,dietaryPreferences:t?[...r,e]:r.filter(s=>s!==e)}}render(){const e=this.form.weightLbs&&this.form.goal?Ie({weightLbs:this.form.weightLbs,goal:this.form.goal,gender:this.form.gender,activityHours:this.form.activityHours}):void 0;return u`
      <main class="page">
        <p class="eyebrow">Onboarding</p>
        <h1>Let’s configure your nutrition</h1>
        <p class="lede">
          This quick setup gathers your diet, goals, and activity so we can
          recommend a weekly plan.
        </p>

        <section class="card wizard">
          <header class="steps">
            <span class=${this.step===0?"active":""}>Diet</span>
            <span class=${this.step===1?"active":""}>Goals</span>
            <span class=${this.step===2?"active":""}>Review</span>
          </header>

          ${this.step===0?this.renderDiet():null}
          ${this.step===1?this.renderGoals():null}
          ${this.step===2?this.renderReview(e):null}

          <footer class="nav">
            ${this.step>0?u`<button class="ghost" @click=${this.back}>Back</button>`:u`<span></span>`}
            ${this.step<2?u`<button class="primary" @click=${this.next}>
                  Next
                </button>`:u`<button class="primary" @click=${this.finish}>
                  Save and continue
                </button>`}
          </footer>
        </section>
      </main>
    `}renderDiet(){const e=this.form.dietaryPreferences??[];return u`
      <div class="panel">
        <h3>Dietary preferences</h3>
        <p class="hint">Pick all that apply to filter your menu.</p>
        <div class="chips">
          ${["vegetarian","vegan","gluten-free","dairy-free","high-protein"].map(t=>{const r=e.includes(t);return u`
                <label class=${r?"chip active":"chip"}>
                  <input
                    type="checkbox"
                    .checked=${r}
                    @change=${s=>this.togglePref(t,s.target?.checked??!1)}
                  />
                  ${t}
                </label>
              `})}
        </div>
      </div>
    `}renderGoals(){return u`
      <div class="panel grid">
        <label>
          <span>Goal</span>
          <select
            @change=${e=>this.setField("goal",e.target?.value)}
            .value=${this.form.goal??"maintain"}
          >
            <option value="bulk">Bulk (gain)</option>
            <option value="maintain">Maintain</option>
            <option value="cut">Cut (lose fat)</option>
          </select>
        </label>

        <label>
          <span>Weight (lb)</span>
          <input
            type="number"
            min="80"
            max="400"
            .value=${String(this.form.weightLbs??"")}
            @input=${e=>this.setField("weightLbs",Number(e.target?.value??0))}
          />
        </label>

        <label>
          <span>Gender</span>
          <select
            @change=${e=>this.setField("gender",e.target?.value??"unspecified")}
            .value=${this.form.gender??"unspecified"}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="unspecified">Prefer not to say</option>
          </select>
        </label>

        <label>
          <span>Activity (hours/week)</span>
          <input
            type="number"
            min="0"
            max="30"
            step="0.5"
            .value=${String(this.form.activityHours??"")}
            @input=${e=>this.setField("activityHours",Number(e.target?.value??0))}
          />
        </label>
      </div>
    `}renderReview(e){return u`
      <div class="panel review">
        <h3>Estimated macros</h3>
        ${e?u`
              <dl class="macros">
                <div>
                  <dt>Calories</dt>
                  <dd>${e.calories} kcal</dd>
                </div>
                <div>
                  <dt>Protein</dt>
                  <dd>${e.proteinTarget} g</dd>
                </div>
                <div>
                  <dt>Carbs</dt>
                  <dd>${e.carbsTarget} g</dd>
                </div>
                <div>
                  <dt>Fat</dt>
                  <dd>${e.fatTarget} g</dd>
                </div>
              </dl>
            `:u`<p class="hint">Enter a weight and goal to see your numbers.</p>`}
        <p class="hint">
          We'll save these to your profile so you can tweak them later.
        </p>
        <ul class="summary">
          <li>Goal: ${this.form.goal??"maintain"}</li>
          <li>Weight: ${this.form.weightLbs??"—"} lb</li>
          <li>Activity: ${this.form.activityHours??0} hrs/week</li>
          <li>
            Dietary: ${(this.form.dietaryPreferences??[]).join(", ")||"None"}
          </li>
        </ul>
      </div>
    `}};zt.styles=x`
    main.page {
      padding: 2rem 3rem;
      max-width: 960px;
    }

    .eyebrow {
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 0.8rem;
      color: var(--color-muted, #9ea6c0);
      margin: 0 0 0.25rem 0;
    }

    .lede {
      max-width: 48rem;
      color: var(--color-muted, #9ea6c0);
    }

    .card.wizard {
      margin-top: 1.5rem;
      background: var(--color-surface-2, #050b15);
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 1.25rem;
      padding: 1.5rem;
      display: grid;
      gap: 1.25rem;
    }

    .steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      font-weight: 600;
      text-align: center;
    }

    .steps span {
      padding: 0.5rem 0.75rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--color-muted, #9ea6c0);
    }

    .steps span.active {
      background: #16a34a;
      color: #020617;
      border-color: #16a34a;
    }

    .panel {
      display: grid;
      gap: 0.75rem;
    }

    .chips {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .chip {
      padding: 0.5rem 0.85rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      text-transform: capitalize;
      background: rgba(255, 255, 255, 0.06);
    }

    .chip input {
      display: none;
    }

    .chip.active {
      background: #16a34a;
      color: #0f172a;
      border-color: #16a34a;
    }

    .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    label {
      display: grid;
      gap: 0.35rem;
    }

    input,
    select {
      padding: 0.65rem 0.8rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.04);
      color: inherit;
    }

    select option {
      color: #0f172a;
    }

    .macros {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.9rem;
      margin: 0.5rem 0 0;
    }

    .macros dt {
      font-size: 0.85rem;
      color: var(--color-muted, #9ea6c0);
    }

    .macros dd {
      margin: 0;
      font-weight: 700;
    }

    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    button.primary,
    button.ghost {
      padding: 0.7rem 1.1rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      color: inherit;
      background: transparent;
      font-weight: 700;
    }

    button.primary {
      background: #16a34a;
      border-color: #16a34a;
      color: #020617;
    }

    button.ghost {
      background: #facc15;
      border-color: #eab308;
      color: #0f172a;
    }
  `;let Ae=zt;cs([w()],Ae.prototype,"step");cs([w()],Ae.prototype,"form");var Ca=Object.defineProperty,Ta=Object.getOwnPropertyDescriptor,Oa=(i,e,t,r)=>{for(var s=Ta(e,t),a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=n(e,t,s)||s);return s&&Ca(e,t,s),s};const Ye=class Ye extends M{constructor(){super("Synergeats:model"),this.applyRecommended=()=>{const e=this.profile;if(!e?.weightLbs||!e.goal)return;const t=Ie({weightLbs:e.weightLbs,goal:e.goal,gender:e.gender,activityHours:e.activityHours}),r={};this.dispatchMessage(["profile/save",{...e,...t},r])},this.handleSubmit=e=>{e.preventDefault();const t=e.currentTarget,r=new FormData(t),s={goal:r.get("goal")??"maintain",weightLbs:Number(r.get("weightLbs")??0),gender:r.get("gender")??"unspecified",activityLevel:void 0,activityHours:r.get("activityHours")?Number(r.get("activityHours")):void 0,dietaryPreferences:Array.from(r.getAll("dietaryPreferences")).map(String),calories:r.get("calories")?Number(r.get("calories")):void 0,proteinTarget:r.get("proteinTarget")?Number(r.get("proteinTarget")):void 0,carbsTarget:r.get("carbsTarget")?Number(r.get("carbsTarget")):void 0,fatTarget:r.get("fatTarget")?Number(r.get("fatTarget")):void 0};console.info("Profile save payload",s);const a={onSuccess:()=>{console.info("Profile saved"),localStorage.removeItem("synergeats:onboarding")},onFailure:n=>{console.error("Profile save failed",n)}};this.dispatchMessage(["profile/save",s,a])}}get profile(){return this.model.profile}connectedCallback(){super.connectedCallback();const e={};this.dispatchMessage(["profile/request",{},e])}render(){const e=this.profile;return u`
      <main class="page">
        <h1>Your profile</h1>
        <p class="hint">
          Adjust your stats and macro targets. Changes are saved to your
          account.
        </p>

        <form class="card" @submit=${this.handleSubmit}>
          <div class="grid">
            <label>
              <span>Goal</span>
              <select name="goal" .value=${e?.goal??"maintain"}>
                <option value="bulk">Bulk (gain)</option>
                <option value="maintain">Maintain</option>
                <option value="cut">Cut (lose fat)</option>
              </select>
            </label>

            <label>
              <span>Weight (lb)</span>
              <input
                name="weightLbs"
                type="number"
                min="80"
                max="400"
                .value=${String(e?.weightLbs??"")}
                required
              />
            </label>

            <label>
              <span>Gender</span>
              <select name="gender" .value=${e?.gender??"unspecified"}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="unspecified">Prefer not to say</option>
              </select>
            </label>

            <label>
              <span>Activity (hours/week)</span>
              <input
                name="activityHours"
                type="number"
                min="0"
                max="30"
                step="0.5"
                .value=${String(e?.activityHours??"")}
              />
            </label>
          </div>

          <fieldset class="preferences">
            <legend>Dietary preferences</legend>
            ${["vegetarian","vegan","gluten-free","dairy-free","high-protein"].map(t=>{const r=e?.dietaryPreferences?.includes(t)??!1;return u`
                  <label>
                    <input
                      type="checkbox"
                      name="dietaryPreferences"
                      value=${t}
                      ?checked=${r}
                    />
                    ${t}
                  </label>
                `})}
          </fieldset>

          <section class="macros">
            <h3>Macro targets</h3>
            <div class="grid">
              <label>
                <span>Calories</span>
                <input
                  name="calories"
                  type="number"
                  min="1000"
                  max="4500"
                  .value=${String(e?.calories??"")}
                />
              </label>
              <label>
                <span>Protein (g)</span>
                <input
                  name="proteinTarget"
                  type="number"
                  min="40"
                  max="400"
                  .value=${String(e?.proteinTarget??"")}
                />
              </label>
              <label>
                <span>Carbs (g)</span>
                <input
                  name="carbsTarget"
                  type="number"
                  min="40"
                  max="600"
                  .value=${String(e?.carbsTarget??"")}
                />
              </label>
              <label>
                <span>Fat (g)</span>
                <input
                  name="fatTarget"
                  type="number"
                  min="20"
                  max="200"
                  .value=${String(e?.fatTarget??"")}
                />
              </label>
            </div>
            <button type="button" class="ghost" @click=${this.applyRecommended}>
              Apply recommended macros
            </button>
          </section>

          <div class="actions">
            <button type="submit" class="primary">Save profile</button>
          </div>
        </form>
      </main>
    `}};Ye.uses=W({}),Ye.styles=x`
    main.page {
      padding: 2rem 3rem;
      max-width: 900px;
    }

    .hint {
      color: var(--color-muted, #9ea6c0);
      margin-bottom: 1rem;
    }

    form.card {
      padding: 1.5rem;
      border-radius: 1.25rem;
      background: var(--color-surface-2, #050b15);
      border: 1px solid var(--color-border, #1c2230);
      display: grid;
      gap: 1.25rem;
    }

    .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    label {
      display: grid;
      gap: 0.3rem;
    }

    input,
    select {
      padding: 0.6rem 0.75rem;
      border-radius: 0.7rem;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.04);
      color: inherit;
    }

    select option {
      color: #0f172a;
    }

    fieldset.preferences {
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 0.9rem;
      padding: 0.9rem;
      display: grid;
      gap: 0.4rem;
    }

    fieldset.preferences legend {
      padding: 0 0.25rem;
      color: var(--color-muted, #9ea6c0);
    }

    fieldset.preferences label {
      display: flex;
      gap: 0.4rem;
      align-items: center;
      text-transform: capitalize;
    }

    .macros {
      display: grid;
      gap: 0.6rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
    }

    button.primary {
      padding: 0.65rem 1.2rem;
      border-radius: 999px;
      border: none;
      background: #16a34a;
      color: #020617;
      font-weight: 700;
      cursor: pointer;
    }
  `;let ze=Ye;Oa([w()],ze.prototype,"profile");var Ma=Object.defineProperty,Na=(i,e,t,r)=>{for(var s=void 0,a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=n(e,t,s)||s);return s&&Ma(e,t,s),s};const qt=class qt extends M{constructor(){super("Synergeats:model"),this.busy=!1,this.handleSubmit=e=>{e.preventDefault();const t=e.currentTarget,r=new FormData(t);this.busy=!0;const s=r.get("tags")??"",a={id:String(r.get("id")??"").trim(),name:String(r.get("name")??"").trim(),calories:Number(r.get("calories")??0),protein:Number(r.get("protein")??0),carbs:Number(r.get("carbs")??0),fat:Number(r.get("fat")??0),tags:s.split(",").map(l=>l.trim()).filter(Boolean),imgSrc:String(r.get("imgSrc")??"").trim()||void 0,ingredients:String(r.get("ingredients")??"").trim()||void 0},n={onSuccess:()=>{this.busy=!1,E.dispatch(this,"history/navigate",{href:"/app/meals"})},onFailure:l=>{console.error("Failed to create meal",l),this.busy=!1}};this.dispatchMessage(["meal/create",{meal:a},n])}}render(){return u`
      <main class="page">
        <h2>Add a new meal</h2>
        <p class="hint">
          Enter macros and tags for this meal. An ID slug is required. Image URL is optional (absolute or /images/ path).
        </p>

        <form class="card" @submit=${this.handleSubmit}>
          <label>
            <span>Meal ID (slug)</span>
            <input name="id" required placeholder="chicken-bowl" />
          </label>
          <label>
            <span>Name</span>
            <input name="name" required />
          </label>

          <div class="grid">
            <label>
              <span>Calories</span>
              <input type="number" name="calories" required />
            </label>
            <label>
              <span>Protein (g)</span>
              <input type="number" name="protein" required />
            </label>
            <label>
              <span>Carbs (g)</span>
              <input type="number" name="carbs" required />
            </label>
            <label>
              <span>Fat (g)</span>
              <input type="number" name="fat" required />
            </label>
          </div>

          <label>
            <span>Ingredients (optional)</span>
            <textarea name="ingredients" rows="2" placeholder="Chicken, rice, broccoli"></textarea>
          </label>

          <label>
            <span>Tags (comma-separated)</span>
            <input name="tags" placeholder="High-Protein, Gluten-Free" />
          </label>

          <label>
            <span>Image URL (optional)</span>
            <input name="imgSrc" placeholder="/images/meals/chicken.jpg or https://…" />
          </label>

          <div class="actions">
            <button type="submit" class="primary" ?disabled=${this.busy}>
              ${this.busy?"Creating...":"Create meal"}
            </button>
            <button
              type="button"
              class="ghost"
              @click=${e=>this.navigate(e,"/app/meals")}
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    `}navigate(e,t){e.preventDefault(),E.dispatch(this,"history/navigate",{href:t})}};qt.styles=x`
    main.page {
      padding: 2rem 3rem;
      max-width: 840px;
    }

    .hint {
      color: var(--color-muted, #9ea6c0);
      margin-bottom: 1rem;
    }

    form.card {
      display: grid;
      gap: 1rem;
      background: var(--color-surface-2, #0f1b32);
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 1rem;
      padding: 1.25rem;
    }

    label {
      display: grid;
      gap: 0.35rem;
    }

    input,
    textarea {
      padding: 0.55rem 0.75rem;
      border-radius: 0.6rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.04);
      color: inherit;
      font-family: inherit;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.75rem;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    button.primary,
    button.ghost {
      padding: 0.6rem 1.2rem;
      border-radius: 999px;
      border: 1px solid var(--color-border, #1c2230);
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-weight: 700;
    }

    button.primary {
      background: var(--color-accent-2, #16a34a);
      color: var(--color-text-inverted, #020617);
      border-color: var(--color-accent-2, #16a34a);
    }
  `;let qe=qt;Na([w()],qe.prototype,"busy");const Ve=class Ve extends T{render(){return u`
      <main class="page">
        <section class="hero">
          <h1>Create your account</h1>
          <p>Sign up to save your plan and personalize meals.</p>
        </section>

        <section class="card">
          <login-form api="/auth/register" redirect="/app">
            <label>
              <span>Username</span>
              <input name="username" autocomplete="off" />
            </label>
            <label>
              <span>Password</span>
              <input type="password" name="password" />
            </label>
            <label>
              <span>Confirm Password</span>
              <input type="password" name="passwordConfirm" />
            </label>
            <p class="alt">
              Already have an account? <a href="/app/login">Sign in</a>
            </p>
          </login-form>
        </section>
      </main>
    `}};Ve.uses=W({"mu-form":Tr.Element,"login-form":L}),Ve.styles=x`
    main.page {
      padding: 2rem 3rem;
      max-width: 640px;
      margin: 0 auto;
    }

    .hero {
      margin-bottom: 2rem;
    }

    .hero h1 {
      margin: 0 0 0.5rem 0;
    }

    .card {
      padding: 2rem;
      border-radius: 1.25rem;
      background: var(--color-surface-2, #050b15);
      border: 1px solid var(--color-border, #1c2230);
    }

    login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    input {
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.25);
      color: inherit;
    }
  `;let ft=Ve;var Ra=Object.defineProperty,La=Object.getOwnPropertyDescriptor,hs=(i,e,t,r)=>{for(var s=r>1?void 0:r?La(e,t):e,a=i.length-1,n;a>=0;a--)(n=i[a])&&(s=(r?n(e,t,s):n(s))||s);return r&&s&&Ra(e,t,s),s};const Ge=class Ge extends M{get meal(){return this.model.selectedMeal}constructor(){super("Synergeats:model")}connectedCallback(){super.connectedCallback(),this.mealid&&this.dispatchMessage(["meal/request",{id:this.mealid},{}])}render(){const e=this.meal;return e?u`
      <main class="page detail">
        ${e.imgSrc?u`<div class="hero-img">
              <img src=${e.imgSrc} alt=${e.name} />
            </div>`:null}

        <section class="panel">
          <h2>${e.name}</h2>
          <p class="tags">${(e.tags??[]).join(" • ")}</p>
          <div class="macros">
            <div>
              <dt>Calories</dt>
              <dd>${e.calories}</dd>
            </div>
            <div>
              <dt>Protein</dt>
              <dd>${e.protein} g</dd>
            </div>
            <div>
              <dt>Carbs</dt>
              <dd>${e.carbs} g</dd>
            </div>
            <div>
              <dt>Fat</dt>
              <dd>${e.fat} g</dd>
            </div>
          </div>
        </section>

        ${e.ingredients?u`<section class="panel">
              <h3>Ingredients</h3>
              <p>${e.ingredients}</p>
            </section>`:null}
      </main>
    `:u`
        <main class="page">
          <p>Loading meal...</p>
        </main>
      `}};Ge.uses=W({"sg-meal-card":oe}),Ge.styles=x`
    main.page.detail {
      padding: 2rem 3rem;
      display: grid;
      gap: 1.5rem;
    }

    .hero-img {
      width: 100%;
      max-height: 200px;
      overflow: hidden;
      border-radius: 1rem;
      border: 1px solid var(--color-border, #1c2230);
    }

    .hero-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .panel {
      padding: 1.25rem;
      border-radius: 1rem;
      border: 1px solid var(--color-border, #1c2230);
      background: var(--color-surface-1, #0f1b32);
    }

    .macros {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin-top: 0.75rem;
    }

    .macros dt {
      font-size: 0.85rem;
      color: var(--color-muted, #9ea6c0);
    }

    .macros dd {
      margin: 0;
      font-weight: 700;
    }

    .tags {
      margin: 0.25rem 0 0;
      color: var(--color-muted, #9ea6c0);
    }
  `;let ke=Ge;hs([he({attribute:"meal-id"})],ke.prototype,"mealid",2);hs([w()],ke.prototype,"meal",1);const ja=[{path:"/app/onboarding",view:()=>u`<onboarding-view></onboarding-view>`},{path:"/app/plan",view:()=>u`<plan-view></plan-view>`},{path:"/app/meals/:id/edit",view:i=>u`<meal-edit-view meal-id=${i.id}></meal-edit-view>`},{path:"/app/meals/new",view:()=>u`<new-meal-view></new-meal-view>`},{path:"/app/meals/:id",view:i=>u`<meal-detail-view meal-id=${i.id}></meal-detail-view>`},{path:"/app/meals",view:()=>u`<meals-view></meals-view>`},{path:"/app/login",view:()=>u`<login-view></login-view>`},{path:"/app/signup",view:()=>u`<signup-view></signup-view>`},{path:"/app/profile",view:()=>u`<profile-view></profile-view>`},{path:"/app",view:()=>u`<home-view></home-view>`},{path:"/",redirect:"/app"}];W({"mu-auth":P.Provider,"mu-history":E.Provider,"mu-store":class extends js.Provider{constructor(){super(ta,Qi,"Synergeats:auth")}},"mu-switch":class extends Ai.Element{constructor(){super(ja,"Synergeats:history","Synergeats:auth")}},"sg-header":He,"home-view":ne,"meals-view":le,"meal-edit-view":Se,"plan-view":ce,"login-view":gt,"onboarding-view":Ae,"profile-view":ze,"new-meal-view":qe,"signup-view":ft,"meal-detail-view":ke});
