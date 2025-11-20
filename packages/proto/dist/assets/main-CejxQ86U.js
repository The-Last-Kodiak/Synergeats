(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();var z,ne;class st extends Error{}st.prototype.name="InvalidTokenError";function $s(r){return decodeURIComponent(atob(r).replace(/(.)/g,(t,e)=>{let s=e.charCodeAt(0).toString(16).toUpperCase();return s.length<2&&(s="0"+s),"%"+s}))}function vs(r){let t=r.replace(/-/g,"+").replace(/_/g,"/");switch(t.length%4){case 0:break;case 2:t+="==";break;case 3:t+="=";break;default:throw new Error("base64 string is not of the correct length")}try{return $s(t)}catch{return atob(t)}}function bs(r,t){if(typeof r!="string")throw new st("Invalid token specified: must be a string");t||(t={});const e=t.header===!0?0:1,s=r.split(".")[e];if(typeof s!="string")throw new st(`Invalid token specified: missing part #${e+1}`);let i;try{i=vs(s)}catch(n){throw new st(`Invalid token specified: invalid base64 for part #${e+1} (${n.message})`)}try{return JSON.parse(i)}catch(n){throw new st(`Invalid token specified: invalid json for part #${e+1} (${n.message})`)}}function As(r,t){const e=Ue(t,r);return new Promise((s,i)=>{if(e){const n=e.localName;customElements.whenDefined(n).then(()=>s(e))}else i({context:t,reason:`No provider for this context "${t}:`})})}function Ue(r,t){const e=`[provides="${r}"]`;if(!t||t===document.getRootNode())return;const s=t.closest(e);if(s)return s;const i=t.getRootNode();if(i instanceof ShadowRoot)return Ue(r,i.host)}class Es extends CustomEvent{constructor(t,e="mu:message"){super(e,{bubbles:!0,composed:!0,detail:t})}}function Ne(r="mu:message"){return(t,...e)=>t.dispatchEvent(new Es(e,r))}class qt{constructor(t,e,s="service:message",i=!0){this._pending=[],this._context=e,this._update=t,this._eventType=s,this._running=i}attach(t){t.addEventListener(this._eventType,e=>{e.stopPropagation();const s=e.detail;this.consume(s)})}start(){this._running||(console.log(`Starting ${this._eventType} service`),this._running=!0,this._pending.forEach(t=>this.process(t)))}apply(t){this._context.apply(t)}consume(t){this._running?this.process(t):(console.log(`Queueing ${this._eventType} message`,t),this._pending.push(t))}process(t){console.log(`Processing ${this._eventType} message`,t);const e=this._update(t,this.apply.bind(this));e&&e(this._context.value)}}function ws(r){return t=>({...t,...r})}const jt="mu:auth:jwt",Me=class He extends qt{constructor(t,e){super((s,i)=>this.update(s,i),t,He.EVENT_TYPE),this._redirectForLogin=e}update(t,e){switch(t[0]){case"auth/signin":const{token:s,redirect:i}=t[1];return e(Ps(s)),Ht(i);case"auth/signout":return e(ks()),Ht(this._redirectForLogin);case"auth/redirect":return Ht(this._redirectForLogin,{next:window.location.href});default:const n=t[0];throw new Error(`Unhandled Auth message "${n}"`)}}};Me.EVENT_TYPE="auth:message";let Ss=Me;const xs=Ne(Ss.EVENT_TYPE);function Ht(r,t={}){if(!r)return;const e=window.location.href,s=new URL(r,e);return Object.entries(t).forEach(([i,n])=>s.searchParams.set(i,n)),()=>{console.log("Redirecting to ",r),window.location.assign(s)}}class $t{constructor(){this.authenticated=!1,this.username="anonymous"}static deauthenticate(t){return t.authenticated=!1,t.username="anonymous",localStorage.removeItem(jt),t}}class vt extends $t{constructor(t){super();const e=bs(t);console.log("Token payload",e),this.token=t,this.authenticated=!0,this.username=e.username}static authenticate(t){const e=new vt(t);return localStorage.setItem(jt,t),e}static authenticateFromLocalStorage(){const t=localStorage.getItem(jt);return t?vt.authenticate(t):new $t}}function Ps(r){return ws({user:vt.authenticate(r),token:r})}function ks(){return r=>{const t=r.user;return{user:t&&t.authenticated?$t.deauthenticate(t):t,token:""}}}function zt(r,t,e){const s=r.target,i=new CustomEvent(t,{bubbles:!0,composed:!0,detail:e});console.log(`Relaying event from ${r.type}:`,i),s.dispatchEvent(i),r.stopPropagation()}function oe(r,t="*"){return r.composedPath().find(s=>{const i=s;return i.tagName&&i.matches(t)})}function Le(r,...t){const e=r.map((i,n)=>n?[t[n-1],i]:[i]).flat().join("");let s=new CSSStyleSheet;return s.replaceSync(e),s}const Cs=new DOMParser;function M(r,...t){const e=t.map(l),s=r.map((a,p)=>{if(p===0)return[a];const f=e[p-1];return f instanceof Node?[`<ins id="mu-html-${p-1}"></ins>`,a]:[f,a]}).flat().join(""),i=Cs.parseFromString(s,"text/html"),n=i.head.childElementCount?i.head.children:i.body.children,o=new DocumentFragment;return o.replaceChildren(...n),e.forEach((a,p)=>{if(a instanceof Node){const f=o.querySelector(`ins#mu-html-${p}`);if(f){const u=f.parentNode;u?.replaceChild(a,f)}else console.log("Missing insertion point:",`ins#mu-html-${p}`)}}),o;function l(a,p){if(a===null)return"";switch(typeof a){case"string":return ae(a);case"bigint":case"boolean":case"number":case"symbol":return ae(a.toString());case"object":if(a instanceof Node||a instanceof DocumentFragment)return a;if(Array.isArray(a)){const f=new DocumentFragment,u=a.map(l);return f.replaceChildren(...u),f}return new Text(a.toString());default:return new Comment(`[invalid parameter of type "${typeof a}"]`)}}}function ae(r){return r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Pt(r,t={mode:"open"}){const e=r.attachShadow(t),s={template:i,styles:n};return s;function i(o){const l=o.firstElementChild,a=l&&l.tagName==="TEMPLATE"?l:void 0;return a&&e.appendChild(a.content.cloneNode(!0)),s}function n(...o){e.adoptedStyleSheets=o}}z=class extends HTMLElement{constructor(){super(),this._state={},Pt(this).template(z.template).styles(z.styles),this.addEventListener("change",r=>{const t=r.target;if(t){const e=t.name,s=t.value;e&&(this._state[e]=s)}}),this.form&&this.form.addEventListener("submit",r=>{r.preventDefault(),zt(r,"mu-form:submit",this._state)})}set init(r){this._state=r||{},Os(this._state,this)}get form(){var r;return(r=this.shadowRoot)==null?void 0:r.querySelector("form")}},z.template=M`
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
  `,z.styles=Le`
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
  `;function Os(r,t){const e=Object.entries(r);for(const[s,i]of e){const n=t.querySelector(`[name="${s}"]`);if(n){const o=n;switch(o.type){case"checkbox":const l=o;l.checked=!!i;break;case"date":o.value=i.toISOString().substr(0,10);break;default:o.value=i;break}}}return r}const Ie=class je extends qt{constructor(t){super((e,s)=>this.update(e,s),t,je.EVENT_TYPE)}update(t,e){switch(t[0]){case"history/navigate":{const{href:s,state:i}=t[1];e(Rs(s,i));break}case"history/redirect":{const{href:s,state:i}=t[1];e(Us(s,i));break}}}};Ie.EVENT_TYPE="history:message";let Ts=Ie;function Rs(r,t={}){return history.pushState(t,"",r),()=>({location:document.location,state:history.state})}function Us(r,t={}){return history.replaceState(t,"",r),()=>({location:document.location,state:history.state})}const Ns=Ne(Ts.EVENT_TYPE);class bt{constructor(t,e){this._effects=[],this._target=t,this._contextLabel=e}observe(t=void 0){return new Promise((e,s)=>{if(this._provider){const i=new le(this._provider,t);this._effects.push(i),e(i)}else As(this._target,this._contextLabel).then(i=>{const n=new le(i,t);this._provider=i,this._effects.push(n),i.attach(o=>this._handleChange(o)),e(n)}).catch(i=>console.log(`Observer ${this._contextLabel}: ${i}`,i))})}_handleChange(t){console.log("Received change event for observers",t,this._effects),t.stopPropagation(),this._effects.forEach(e=>e.runEffect())}}class le{constructor(t,e){this._provider=t,e&&this.setEffect(e)}get context(){return this._provider.context}get value(){return this.context.value}setEffect(t){this._effectFn=t,this.runEffect()}runEffect(){this._effectFn&&this._effectFn(this.context.value)}}const ze=class De extends HTMLElement{constructor(){super(),this._state={},this._user=new $t,this._authObserver=new bt(this,"blazing:auth"),Pt(this).template(De.template),this.form&&this.form.addEventListener("submit",t=>{if(t.preventDefault(),this.src||this.action){if(console.log("Submitting form",this._state),this.action)this.action(this._state);else if(this.src){const e=this.isNew?"POST":"PUT",s=this.isNew?"created":"updated",i=this.isNew?this.src.replace(/[/][$]new$/,""):this.src;Ms(i,this._state,e,this.authorization).then(n=>G(n,this)).then(n=>{const o=`mu-rest-form:${s}`,l=new CustomEvent(o,{bubbles:!0,composed:!0,detail:{method:e,[s]:n,url:i}});this.dispatchEvent(l)}).catch(n=>{const o="mu-rest-form:error",l=new CustomEvent(o,{bubbles:!0,composed:!0,detail:{method:e,error:n,url:i,request:this._state}});this.dispatchEvent(l)})}}}),this.addEventListener("change",t=>{const e=t.target;if(e){const s=e.name,i=e.value;s&&(this._state[s]=i)}})}get src(){return this.getAttribute("src")}get isNew(){return this.hasAttribute("new")}set init(t){this._state=t||{},G(this._state,this)}get form(){var t;return(t=this.shadowRoot)==null?void 0:t.querySelector("form")}get authorization(){var t;return(t=this._user)!=null&&t.authenticated?{Authorization:`Bearer ${this._user.token}`}:{}}connectedCallback(){this._authObserver.observe(({user:t})=>{t&&(this._user=t,this.src&&!this.isNew&&he(this.src,this.authorization).then(e=>{this._state=e,G(e,this)}))})}attributeChangedCallback(t,e,s){switch(t){case"src":this.src&&s&&s!==e&&!this.isNew&&he(this.src,this.authorization).then(i=>{this._state=i,G(i,this)});break;case"new":s&&(this._state={},G({},this));break}}};ze.observedAttributes=["src","new","action"];ze.template=M`
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
  `;function he(r,t){return fetch(r,{headers:t}).then(e=>{if(e.status!==200)throw`Status: ${e.status}`;return e.json()}).catch(e=>console.log(`Failed to load form from ${r}:`,e))}function G(r,t){const e=Object.entries(r);for(const[s,i]of e){const n=t.querySelector(`[name="${s}"]`);if(n){const o=n;switch(o.type){case"checkbox":const l=o;l.checked=!!i;break;default:o.value=i;break}}}return r}function Ms(r,t,e="PUT",s={}){return fetch(r,{method:e,headers:{"Content-Type":"application/json",...s},body:JSON.stringify(t)}).then(i=>{if(i.status!=200&&i.status!=201)throw`Form submission failed: Status ${i.status}`;return i.json()})}const Hs=class Ve extends qt{constructor(t,e){super(e,t,Ve.EVENT_TYPE,!1)}};Hs.EVENT_TYPE="mu:message";/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const yt=globalThis,Ft=yt.ShadowRoot&&(yt.ShadyCSS===void 0||yt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Bt=Symbol(),ce=new WeakMap;let qe=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==Bt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(Ft&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=ce.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&ce.set(e,t))}return t}toString(){return this.cssText}};const Ls=r=>new qe(typeof r=="string"?r:r+"",void 0,Bt),Is=(r,...t)=>{const e=r.length===1?r[0]:t.reduce((s,i,n)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[n+1],r[0]);return new qe(e,r,Bt)},js=(r,t)=>{if(Ft)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const s=document.createElement("style"),i=yt.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},ue=Ft?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return Ls(e)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:zs,defineProperty:Ds,getOwnPropertyDescriptor:Vs,getOwnPropertyNames:qs,getOwnPropertySymbols:Fs,getPrototypeOf:Bs}=Object,W=globalThis,de=W.trustedTypes,Ws=de?de.emptyScript:"",pe=W.reactiveElementPolyfillSupport,it=(r,t)=>r,At={toAttribute(r,t){switch(t){case Boolean:r=r?Ws:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},Wt=(r,t)=>!zs(r,t),fe={attribute:!0,type:String,converter:At,reflect:!1,hasChanged:Wt};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),W.litPropertyMetadata??(W.litPropertyMetadata=new WeakMap);let V=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=fe){if(e.state&&(e.attribute=!1),this._$Ei(),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Ds(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:n}=Vs(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get(){return i?.call(this)},set(o){const l=i?.call(this);n.call(this,o),this.requestUpdate(t,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??fe}static _$Ei(){if(this.hasOwnProperty(it("elementProperties")))return;const t=Bs(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(it("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(it("properties"))){const e=this.properties,s=[...qs(e),...Fs(e)];for(const i of s)this.createProperty(i,e[i])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[e,s]of this.elementProperties){const i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)e.unshift(ue(i))}else t!==void 0&&e.push(ue(t));return e}static _$Eu(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(e=>e(this))}addController(t){var e;(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((e=t.hostConnected)==null||e.call(t))}removeController(t){var e;(e=this._$EO)==null||e.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return js(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$EO)==null||t.forEach(e=>{var s;return(s=e.hostConnected)==null?void 0:s.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$EO)==null||t.forEach(e=>{var s;return(s=e.hostDisconnected)==null?void 0:s.call(e)})}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$EC(t,e){var s;const i=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,i);if(n!==void 0&&i.reflect===!0){const o=(((s=i.converter)==null?void 0:s.toAttribute)!==void 0?i.converter:At).toAttribute(e,i.type);this._$Em=t,o==null?this.removeAttribute(n):this.setAttribute(n,o),this._$Em=null}}_$AK(t,e){var s;const i=this.constructor,n=i._$Eh.get(t);if(n!==void 0&&this._$Em!==n){const o=i.getPropertyOptions(n),l=typeof o.converter=="function"?{fromAttribute:o.converter}:((s=o.converter)==null?void 0:s.fromAttribute)!==void 0?o.converter:At;this._$Em=n,this[n]=l.fromAttribute(e,o.type),this._$Em=null}}requestUpdate(t,e,s){if(t!==void 0){if(s??(s=this.constructor.getPropertyOptions(t)),!(s.hasChanged??Wt)(this[t],e))return;this.P(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$ET())}P(t,e,s){this._$AL.has(t)||this._$AL.set(t,e),s.reflect===!0&&this._$Em!==t&&(this._$Ej??(this._$Ej=new Set)).add(t)}async _$ET(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[n,o]of this._$Ep)this[n]=o;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[n,o]of i)o.wrapped!==!0||this._$AL.has(n)||this[n]===void 0||this.P(n,this[n],o)}let e=!1;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),(t=this._$EO)==null||t.forEach(i=>{var n;return(n=i.hostUpdate)==null?void 0:n.call(i)}),this.update(s)):this._$EU()}catch(i){throw e=!1,this._$EU(),i}e&&this._$AE(s)}willUpdate(t){}_$AE(t){var e;(e=this._$EO)==null||e.forEach(s=>{var i;return(i=s.hostUpdated)==null?void 0:i.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Ej&&(this._$Ej=this._$Ej.forEach(e=>this._$EC(e,this[e]))),this._$EU()}updated(t){}firstUpdated(t){}};V.elementStyles=[],V.shadowRootOptions={mode:"open"},V[it("elementProperties")]=new Map,V[it("finalized")]=new Map,pe?.({ReactiveElement:V}),(W.reactiveElementVersions??(W.reactiveElementVersions=[])).push("2.0.4");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Et=globalThis,wt=Et.trustedTypes,me=wt?wt.createPolicy("lit-html",{createHTML:r=>r}):void 0,Fe="$lit$",x=`lit$${Math.random().toFixed(9).slice(2)}$`,Be="?"+x,Ys=`<${Be}>`,H=document,ot=()=>H.createComment(""),at=r=>r===null||typeof r!="object"&&typeof r!="function",Yt=Array.isArray,Ks=r=>Yt(r)||typeof r?.[Symbol.iterator]=="function",Lt=`[ 	
\f\r]`,X=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ge=/-->/g,ye=/>/g,T=RegExp(`>|${Lt}(?:([^\\s"'>=/]+)(${Lt}*=${Lt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),_e=/'/g,$e=/"/g,We=/^(?:script|style|textarea|title)$/i,Js=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),tt=Js(1),Y=Symbol.for("lit-noChange"),$=Symbol.for("lit-nothing"),ve=new WeakMap,U=H.createTreeWalker(H,129);function Ye(r,t){if(!Yt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return me!==void 0?me.createHTML(t):t}const Zs=(r,t)=>{const e=r.length-1,s=[];let i,n=t===2?"<svg>":t===3?"<math>":"",o=X;for(let l=0;l<e;l++){const a=r[l];let p,f,u=-1,h=0;for(;h<a.length&&(o.lastIndex=h,f=o.exec(a),f!==null);)h=o.lastIndex,o===X?f[1]==="!--"?o=ge:f[1]!==void 0?o=ye:f[2]!==void 0?(We.test(f[2])&&(i=RegExp("</"+f[2],"g")),o=T):f[3]!==void 0&&(o=T):o===T?f[0]===">"?(o=i??X,u=-1):f[1]===void 0?u=-2:(u=o.lastIndex-f[2].length,p=f[1],o=f[3]===void 0?T:f[3]==='"'?$e:_e):o===$e||o===_e?o=T:o===ge||o===ye?o=X:(o=T,i=void 0);const c=o===T&&r[l+1].startsWith("/>")?" ":"";n+=o===X?a+Ys:u>=0?(s.push(p),a.slice(0,u)+Fe+a.slice(u)+x+c):a+x+(u===-2?l:c)}return[Ye(r,n+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};let Dt=class Ke{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let n=0,o=0;const l=t.length-1,a=this.parts,[p,f]=Zs(t,e);if(this.el=Ke.createElement(p,s),U.currentNode=this.el.content,e===2||e===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=U.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(const u of i.getAttributeNames())if(u.endsWith(Fe)){const h=f[o++],c=i.getAttribute(u).split(x),d=/([.?@])?(.*)/.exec(h);a.push({type:1,index:n,name:d[2],strings:c,ctor:d[1]==="."?Gs:d[1]==="?"?Xs:d[1]==="@"?ti:kt}),i.removeAttribute(u)}else u.startsWith(x)&&(a.push({type:6,index:n}),i.removeAttribute(u));if(We.test(i.tagName)){const u=i.textContent.split(x),h=u.length-1;if(h>0){i.textContent=wt?wt.emptyScript:"";for(let c=0;c<h;c++)i.append(u[c],ot()),U.nextNode(),a.push({type:2,index:++n});i.append(u[h],ot())}}}else if(i.nodeType===8)if(i.data===Be)a.push({type:2,index:n});else{let u=-1;for(;(u=i.data.indexOf(x,u+1))!==-1;)a.push({type:7,index:n}),u+=x.length-1}n++}}static createElement(t,e){const s=H.createElement("template");return s.innerHTML=t,s}};function K(r,t,e=r,s){var i,n;if(t===Y)return t;let o=s!==void 0?(i=e.o)==null?void 0:i[s]:e.l;const l=at(t)?void 0:t._$litDirective$;return o?.constructor!==l&&((n=o?._$AO)==null||n.call(o,!1),l===void 0?o=void 0:(o=new l(r),o._$AT(r,e,s)),s!==void 0?(e.o??(e.o=[]))[s]=o:e.l=o),o!==void 0&&(t=K(r,o._$AS(r,t.values),o,s)),t}class Qs{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??H).importNode(e,!0);U.currentNode=i;let n=U.nextNode(),o=0,l=0,a=s[0];for(;a!==void 0;){if(o===a.index){let p;a.type===2?p=new dt(n,n.nextSibling,this,t):a.type===1?p=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(p=new ei(n,this,t)),this._$AV.push(p),a=s[++l]}o!==a?.index&&(n=U.nextNode(),o++)}return U.currentNode=H,i}p(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class dt{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this.v}constructor(t,e,s,i){this.type=2,this._$AH=$,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this.v=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=K(this,t,e),at(t)?t===$||t==null||t===""?(this._$AH!==$&&this._$AR(),this._$AH=$):t!==this._$AH&&t!==Y&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ks(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==$&&at(this._$AH)?this._$AA.nextSibling.data=t:this.T(H.createTextNode(t)),this._$AH=t}$(t){var e;const{values:s,_$litType$:i}=t,n=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=Dt.createElement(Ye(i.h,i.h[0]),this.options)),i);if(((e=this._$AH)==null?void 0:e._$AD)===n)this._$AH.p(s);else{const o=new Qs(n,this),l=o.u(this.options);o.p(s),this.T(l),this._$AH=o}}_$AC(t){let e=ve.get(t.strings);return e===void 0&&ve.set(t.strings,e=new Dt(t)),e}k(t){Yt(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const n of t)i===e.length?e.push(s=new dt(this.O(ot()),this.O(ot()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){var s;for((s=this._$AP)==null?void 0:s.call(this,!1,!0,e);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i}}setConnected(t){var e;this._$AM===void 0&&(this.v=t,(e=this._$AP)==null||e.call(this,t))}}class kt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,n){this.type=1,this._$AH=$,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=$}_$AI(t,e=this,s,i){const n=this.strings;let o=!1;if(n===void 0)t=K(this,t,e,0),o=!at(t)||t!==this._$AH&&t!==Y,o&&(this._$AH=t);else{const l=t;let a,p;for(t=n[0],a=0;a<n.length-1;a++)p=K(this,l[s+a],e,a),p===Y&&(p=this._$AH[a]),o||(o=!at(p)||p!==this._$AH[a]),p===$?t=$:t!==$&&(t+=(p??"")+n[a+1]),this._$AH[a]=p}o&&!i&&this.j(t)}j(t){t===$?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Gs extends kt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===$?void 0:t}}class Xs extends kt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==$)}}class ti extends kt{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){if((t=K(this,t,e,0)??$)===Y)return;const s=this._$AH,i=t===$&&s!==$||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==$&&(s===$||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e;typeof this._$AH=="function"?this._$AH.call(((e=this.options)==null?void 0:e.host)??this.element,t):this._$AH.handleEvent(t)}}class ei{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){K(this,t)}}const be=Et.litHtmlPolyfillSupport;be?.(Dt,dt),(Et.litHtmlVersions??(Et.litHtmlVersions=[])).push("3.2.0");const si=(r,t,e)=>{const s=e?.renderBefore??t;let i=s._$litPart$;if(i===void 0){const n=e?.renderBefore??null;s._$litPart$=i=new dt(t.insertBefore(ot(),n),n,void 0,e??{})}return i._$AI(r),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let F=class extends V{constructor(){super(...arguments),this.renderOptions={host:this},this.o=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this.o=si(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this.o)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this.o)==null||t.setConnected(!1)}render(){return Y}};F._$litElement$=!0,F.finalized=!0,(ne=globalThis.litElementHydrateSupport)==null||ne.call(globalThis,{LitElement:F});const Ae=globalThis.litElementPolyfillSupport;Ae?.({LitElement:F});(globalThis.litElementVersions??(globalThis.litElementVersions=[])).push("4.1.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ii={attribute:!0,type:String,converter:At,reflect:!1,hasChanged:Wt},ri=(r=ii,t,e)=>{const{kind:s,metadata:i}=e;let n=globalThis.litPropertyMetadata.get(i);if(n===void 0&&globalThis.litPropertyMetadata.set(i,n=new Map),n.set(e.name,r),s==="accessor"){const{name:o}=e;return{set(l){const a=t.get.call(this);t.set.call(this,l),this.requestUpdate(o,a,r)},init(l){return l!==void 0&&this.P(o,void 0,r),l}}}if(s==="setter"){const{name:o}=e;return function(l){const a=this[o];t.call(this,l),this.requestUpdate(o,a,r)}}throw Error("Unsupported decorator location: "+s)};function Je(r){return(t,e)=>typeof e=="object"?ri(r,t,e):((s,i,n)=>{const o=i.hasOwnProperty(n);return i.constructor.createProperty(n,o?{...s,wrapped:!0}:s),o?Object.getOwnPropertyDescriptor(i,n):void 0})(r,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Ze(r){return Je({...r,state:!0,attribute:!1})}function ni(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}function oi(r){throw new Error('Could not dynamically require "'+r+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var Qe={};(function(r){var t=(function(){var e=function(u,h,c,d){for(c=c||{},d=u.length;d--;c[u[d]]=h);return c},s=[1,9],i=[1,10],n=[1,11],o=[1,12],l=[5,11,12,13,14,15],a={trace:function(){},yy:{},symbols_:{error:2,root:3,expressions:4,EOF:5,expression:6,optional:7,literal:8,splat:9,param:10,"(":11,")":12,LITERAL:13,SPLAT:14,PARAM:15,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",11:"(",12:")",13:"LITERAL",14:"SPLAT",15:"PARAM"},productions_:[0,[3,2],[3,1],[4,2],[4,1],[6,1],[6,1],[6,1],[6,1],[7,3],[8,1],[9,1],[10,1]],performAction:function(h,c,d,g,m,y,Tt){var A=y.length-1;switch(m){case 1:return new g.Root({},[y[A-1]]);case 2:return new g.Root({},[new g.Literal({value:""})]);case 3:this.$=new g.Concat({},[y[A-1],y[A]]);break;case 4:case 5:this.$=y[A];break;case 6:this.$=new g.Literal({value:y[A]});break;case 7:this.$=new g.Splat({name:y[A]});break;case 8:this.$=new g.Param({name:y[A]});break;case 9:this.$=new g.Optional({},[y[A-1]]);break;case 10:this.$=h;break;case 11:case 12:this.$=h.slice(1);break}},table:[{3:1,4:2,5:[1,3],6:4,7:5,8:6,9:7,10:8,11:s,13:i,14:n,15:o},{1:[3]},{5:[1,13],6:14,7:5,8:6,9:7,10:8,11:s,13:i,14:n,15:o},{1:[2,2]},e(l,[2,4]),e(l,[2,5]),e(l,[2,6]),e(l,[2,7]),e(l,[2,8]),{4:15,6:4,7:5,8:6,9:7,10:8,11:s,13:i,14:n,15:o},e(l,[2,10]),e(l,[2,11]),e(l,[2,12]),{1:[2,1]},e(l,[2,3]),{6:14,7:5,8:6,9:7,10:8,11:s,12:[1,16],13:i,14:n,15:o},e(l,[2,9])],defaultActions:{3:[2,2],13:[2,1]},parseError:function(h,c){if(c.recoverable)this.trace(h);else{let d=function(g,m){this.message=g,this.hash=m};throw d.prototype=Error,new d(h,c)}},parse:function(h){var c=this,d=[0],g=[null],m=[],y=this.table,Tt="",A=0,se=0,ms=2,ie=1,gs=m.slice.call(arguments,1),_=Object.create(this.lexer),C={yy:{}};for(var Rt in this.yy)Object.prototype.hasOwnProperty.call(this.yy,Rt)&&(C.yy[Rt]=this.yy[Rt]);_.setInput(h,C.yy),C.yy.lexer=_,C.yy.parser=this,typeof _.yylloc>"u"&&(_.yylloc={});var Ut=_.yylloc;m.push(Ut);var ys=_.options&&_.options.ranges;typeof C.yy.parseError=="function"?this.parseError=C.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;for(var _s=function(){var j;return j=_.lex()||ie,typeof j!="number"&&(j=c.symbols_[j]||j),j},b,O,E,Nt,I={},mt,w,re,gt;;){if(O=d[d.length-1],this.defaultActions[O]?E=this.defaultActions[O]:((b===null||typeof b>"u")&&(b=_s()),E=y[O]&&y[O][b]),typeof E>"u"||!E.length||!E[0]){var Mt="";gt=[];for(mt in y[O])this.terminals_[mt]&&mt>ms&&gt.push("'"+this.terminals_[mt]+"'");_.showPosition?Mt="Parse error on line "+(A+1)+`:
`+_.showPosition()+`
Expecting `+gt.join(", ")+", got '"+(this.terminals_[b]||b)+"'":Mt="Parse error on line "+(A+1)+": Unexpected "+(b==ie?"end of input":"'"+(this.terminals_[b]||b)+"'"),this.parseError(Mt,{text:_.match,token:this.terminals_[b]||b,line:_.yylineno,loc:Ut,expected:gt})}if(E[0]instanceof Array&&E.length>1)throw new Error("Parse Error: multiple actions possible at state: "+O+", token: "+b);switch(E[0]){case 1:d.push(b),g.push(_.yytext),m.push(_.yylloc),d.push(E[1]),b=null,se=_.yyleng,Tt=_.yytext,A=_.yylineno,Ut=_.yylloc;break;case 2:if(w=this.productions_[E[1]][1],I.$=g[g.length-w],I._$={first_line:m[m.length-(w||1)].first_line,last_line:m[m.length-1].last_line,first_column:m[m.length-(w||1)].first_column,last_column:m[m.length-1].last_column},ys&&(I._$.range=[m[m.length-(w||1)].range[0],m[m.length-1].range[1]]),Nt=this.performAction.apply(I,[Tt,se,A,C.yy,E[1],g,m].concat(gs)),typeof Nt<"u")return Nt;w&&(d=d.slice(0,-1*w*2),g=g.slice(0,-1*w),m=m.slice(0,-1*w)),d.push(this.productions_[E[1]][0]),g.push(I.$),m.push(I._$),re=y[d[d.length-2]][d[d.length-1]],d.push(re);break;case 3:return!0}}return!0}},p=(function(){var u={EOF:1,parseError:function(c,d){if(this.yy.parser)this.yy.parser.parseError(c,d);else throw new Error(c)},setInput:function(h,c){return this.yy=c||this.yy||{},this._input=h,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var h=this._input[0];this.yytext+=h,this.yyleng++,this.offset++,this.match+=h,this.matched+=h;var c=h.match(/(?:\r\n?|\n).*/g);return c?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),h},unput:function(h){var c=h.length,d=h.split(/(?:\r\n?|\n)/g);this._input=h+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-c),this.offset-=c;var g=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),d.length-1&&(this.yylineno-=d.length-1);var m=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:d?(d.length===g.length?this.yylloc.first_column:0)+g[g.length-d.length].length-d[0].length:this.yylloc.first_column-c},this.options.ranges&&(this.yylloc.range=[m[0],m[0]+this.yyleng-c]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},less:function(h){this.unput(this.match.slice(h))},pastInput:function(){var h=this.matched.substr(0,this.matched.length-this.match.length);return(h.length>20?"...":"")+h.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var h=this.match;return h.length<20&&(h+=this._input.substr(0,20-h.length)),(h.substr(0,20)+(h.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var h=this.pastInput(),c=new Array(h.length+1).join("-");return h+this.upcomingInput()+`
`+c+"^"},test_match:function(h,c){var d,g,m;if(this.options.backtrack_lexer&&(m={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(m.yylloc.range=this.yylloc.range.slice(0))),g=h[0].match(/(?:\r\n?|\n).*/g),g&&(this.yylineno+=g.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:g?g[g.length-1].length-g[g.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+h[0].length},this.yytext+=h[0],this.match+=h[0],this.matches=h,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(h[0].length),this.matched+=h[0],d=this.performAction.call(this,this.yy,this,c,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),d)return d;if(this._backtrack){for(var y in m)this[y]=m[y];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var h,c,d,g;this._more||(this.yytext="",this.match="");for(var m=this._currentRules(),y=0;y<m.length;y++)if(d=this._input.match(this.rules[m[y]]),d&&(!c||d[0].length>c[0].length)){if(c=d,g=y,this.options.backtrack_lexer){if(h=this.test_match(d,m[y]),h!==!1)return h;if(this._backtrack){c=!1;continue}else return!1}else if(!this.options.flex)break}return c?(h=this.test_match(c,m[g]),h!==!1?h:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var c=this.next();return c||this.lex()},begin:function(c){this.conditionStack.push(c)},popState:function(){var c=this.conditionStack.length-1;return c>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(c){return c=this.conditionStack.length-1-Math.abs(c||0),c>=0?this.conditionStack[c]:"INITIAL"},pushState:function(c){this.begin(c)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(c,d,g,m){switch(g){case 0:return"(";case 1:return")";case 2:return"SPLAT";case 3:return"PARAM";case 4:return"LITERAL";case 5:return"LITERAL";case 6:return"EOF"}},rules:[/^(?:\()/,/^(?:\))/,/^(?:\*+\w+)/,/^(?::+\w+)/,/^(?:[\w%\-~\n]+)/,/^(?:.)/,/^(?:$)/],conditions:{INITIAL:{rules:[0,1,2,3,4,5,6],inclusive:!0}}};return u})();a.lexer=p;function f(){this.yy={}}return f.prototype=a,a.Parser=f,new f})();typeof oi<"u"&&(r.parser=t,r.Parser=t.Parser,r.parse=function(){return t.parse.apply(t,arguments)})})(Qe);function D(r){return function(t,e){return{displayName:r,props:t,children:e||[]}}}var Ge={Root:D("Root"),Concat:D("Concat"),Literal:D("Literal"),Splat:D("Splat"),Param:D("Param"),Optional:D("Optional")},Xe=Qe.parser;Xe.yy=Ge;var ai=Xe,li=Object.keys(Ge);function hi(r){return li.forEach(function(t){if(typeof r[t]>"u")throw new Error("No handler defined for "+t.displayName)}),{visit:function(t,e){return this.handlers[t.displayName].call(this,t,e)},handlers:r}}var ts=hi,ci=ts,ui=/[\-{}\[\]+?.,\\\^$|#\s]/g;function es(r){this.captures=r.captures,this.re=r.re}es.prototype.match=function(r){var t=this.re.exec(r),e={};if(t)return this.captures.forEach(function(s,i){typeof t[i+1]>"u"?e[s]=void 0:e[s]=decodeURIComponent(t[i+1])}),e};var di=ci({Concat:function(r){return r.children.reduce((function(t,e){var s=this.visit(e);return{re:t.re+s.re,captures:t.captures.concat(s.captures)}}).bind(this),{re:"",captures:[]})},Literal:function(r){return{re:r.props.value.replace(ui,"\\$&"),captures:[]}},Splat:function(r){return{re:"([^?]*?)",captures:[r.props.name]}},Param:function(r){return{re:"([^\\/\\?]+)",captures:[r.props.name]}},Optional:function(r){var t=this.visit(r.children[0]);return{re:"(?:"+t.re+")?",captures:t.captures}},Root:function(r){var t=this.visit(r.children[0]);return new es({re:new RegExp("^"+t.re+"(?=\\?|$)"),captures:t.captures})}}),pi=di,fi=ts,mi=fi({Concat:function(r,t){var e=r.children.map((function(s){return this.visit(s,t)}).bind(this));return e.some(function(s){return s===!1})?!1:e.join("")},Literal:function(r){return decodeURI(r.props.value)},Splat:function(r,t){return t[r.props.name]?t[r.props.name]:!1},Param:function(r,t){return t[r.props.name]?t[r.props.name]:!1},Optional:function(r,t){var e=this.visit(r.children[0],t);return e||""},Root:function(r,t){t=t||{};var e=this.visit(r.children[0],t);return e?encodeURI(e):!1}}),gi=mi,yi=ai,_i=pi,$i=gi;pt.prototype=Object.create(null);pt.prototype.match=function(r){var t=_i.visit(this.ast),e=t.match(r);return e||!1};pt.prototype.reverse=function(r){return $i.visit(this.ast,r)};function pt(r){var t;if(this?t=this:t=Object.create(pt.prototype),typeof r>"u")throw new Error("A route spec is required");return t.spec=r,t.ast=yi.parse(r),t}var vi=pt,bi=vi,Ai=bi;const Ei=ni(Ai);var wi=Object.defineProperty,ss=(r,t,e,s)=>{for(var i=void 0,n=r.length-1,o;n>=0;n--)(o=r[n])&&(i=o(t,e,i)||i);return i&&wi(t,e,i),i};const is=class extends F{constructor(t,e,s=""){super(),this._cases=[],this._fallback=()=>tt` <h1>Not Found</h1> `,this._cases=t.map(i=>({...i,route:new Ei(i.path)})),this._historyObserver=new bt(this,e),this._authObserver=new bt(this,s)}connectedCallback(){this._historyObserver.observe(({location:t})=>{console.log("New location",t),t&&(this._match=this.matchRoute(t))}),this._authObserver.observe(({user:t})=>{this._user=t}),super.connectedCallback()}render(){return console.log("Rendering for match",this._match,this._user),tt` <main>${(()=>{const e=this._match;if(e){if("view"in e)return this._user?e.auth&&e.auth!=="public"&&this._user&&!this._user.authenticated?(xs(this,"auth/redirect"),tt` <h1>Redirecting for Login</h1> `):(console.log("Loading view, ",e.params,e.query),e.view(e.params||{},e.query)):tt` <h1>Authenticating</h1> `;if("redirect"in e){const s=e.redirect;if(typeof s=="string")return this.redirect(s),tt` <h1>Redirecting to ${s}…</h1> `}}return this._fallback({})})()}</main> `}updated(t){t.has("_match")&&this.requestUpdate()}matchRoute(t){const{search:e,pathname:s}=t,i=new URLSearchParams(e),n=s+e;for(const o of this._cases){const l=o.route.match(n);if(l)return{...o,path:s,params:l,query:i}}}redirect(t){Ns(this,"history/redirect",{href:t})}};is.styles=Is`
    :host,
    main {
      display: contents;
    }
  `;let rs=is;ss([Ze()],rs.prototype,"_user");ss([Ze()],rs.prototype,"_match");const Si=class ns extends HTMLElement{constructor(){if(super(),Pt(this).template(ns.template),this.shadowRoot){const t=this.shadowRoot.querySelector("slot[name='actuator']");t&&t.addEventListener("click",()=>this.toggle())}}toggle(){this.hasAttribute("open")?this.removeAttribute("open"):this.setAttribute("open","open")}};Si.template=M`
    <template>
      <slot name="actuator"><button>Menu</button></slot>
      <div id="panel">
        <slot></slot>
      </div>

      <style>
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
      </style>
    </template>
  `;const os=class Vt extends HTMLElement{constructor(){super(),this._array=[],Pt(this).template(Vt.template).styles(Vt.styles),this.addEventListener("input-array:add",t=>{t.stopPropagation(),this.append(as("",this._array.length))}),this.addEventListener("input-array:remove",t=>{t.stopPropagation(),this.removeClosestItem(t.target)}),this.addEventListener("change",t=>{t.stopPropagation();const e=t.target;if(e&&e!==this){const s=new Event("change",{bubbles:!0}),i=e.value,n=e.closest("label");if(n){const o=Array.from(this.children).indexOf(n);this._array[o]=i,this.dispatchEvent(s)}}}),this.addEventListener("click",t=>{oe(t,"button.add")?zt(t,"input-array:add"):oe(t,"button.remove")&&zt(t,"input-array:remove")})}get name(){return this.getAttribute("name")}get value(){return this._array}set value(t){this._array=Array.isArray(t)?t:[t],xi(this._array,this)}removeClosestItem(t){const e=t.closest("label");if(console.log("Removing closest item:",e,t),e){const s=Array.from(this.children).indexOf(e);this._array.splice(s,1),e.remove()}}};os.template=M`
    <template>
      <ul>
        <slot></slot>
      </ul>
      <button class="add">
        <slot name="label-add">Add one</slot>
        <style></style>
      </button>
    </template>
  `;os.styles=Le`
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
  `;function xi(r,t){t.replaceChildren(),r.forEach((e,s)=>t.append(as(e)))}function as(r,t){const e=r===void 0?M`<input />`:M`<input value="${r}" />`;return M`
    <label>
      ${e}
      <button class="remove" type="button">Remove</button>
    </label>
  `}function Pi(r){return Object.entries(r).map(([t,e])=>{customElements.get(t)||customElements.define(t,e)}),customElements}var ki=Object.defineProperty,Ci=Object.getOwnPropertyDescriptor,Oi=(r,t,e,s)=>{for(var i=Ci(t,e),n=r.length-1,o;n>=0;n--)(o=r[n])&&(i=o(t,e,i)||i);return i&&ki(t,e,i),i};class Ti extends F{constructor(t){super(),this._pending=[],this._observer=new bt(this,t)}get model(){return this._lastModel=this._context?this._context.value:{},this._lastModel}connectedCallback(){var t;super.connectedCallback(),(t=this._observer)==null||t.observe().then(e=>{console.log("View effect (initial)",this,e),this._context=e.context,this._pending.length&&this._pending.forEach(([s,i])=>{console.log("Dispatching queued event",i,s),s.dispatchEvent(i)}),e.setEffect(()=>{var s;if(console.log("View effect",this,e,(s=this._context)==null?void 0:s.value),this._context)console.log("requesting update"),this.requestUpdate();else throw"View context not ready for effect"})})}dispatchMessage(t,e=this){const s=new CustomEvent("mu:message",{bubbles:!0,composed:!0,detail:t});this._context?(console.log("Dispatching message event",s),e.dispatchEvent(s)):(console.log("Queueing message event",s),this._pending.push([e,s]))}ref(t){return this.model?this.model[t]:void 0}}Oi([Je()],Ti.prototype,"model");/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const _t=globalThis,Kt=_t.ShadowRoot&&(_t.ShadyCSS===void 0||_t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Jt=Symbol(),Ee=new WeakMap;let ls=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==Jt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(Kt&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=Ee.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&Ee.set(e,t))}return t}toString(){return this.cssText}};const Ri=r=>new ls(typeof r=="string"?r:r+"",void 0,Jt),hs=(r,...t)=>{const e=r.length===1?r[0]:t.reduce(((s,i,n)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[n+1]),r[0]);return new ls(e,r,Jt)},Ui=(r,t)=>{if(Kt)r.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const e of t){const s=document.createElement("style"),i=_t.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},we=Kt?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return Ri(e)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Ni,defineProperty:Mi,getOwnPropertyDescriptor:Hi,getOwnPropertyNames:Li,getOwnPropertySymbols:Ii,getPrototypeOf:ji}=Object,Ct=globalThis,Se=Ct.trustedTypes,zi=Se?Se.emptyScript:"",Di=Ct.reactiveElementPolyfillSupport,rt=(r,t)=>r,St={toAttribute(r,t){switch(t){case Boolean:r=r?zi:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},Zt=(r,t)=>!Ni(r,t),xe={attribute:!0,type:String,converter:St,reflect:!1,useDefault:!1,hasChanged:Zt};Symbol.metadata??=Symbol("metadata"),Ct.litPropertyMetadata??=new WeakMap;let q=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=xe){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Mi(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:n}=Hi(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:i,set(o){const l=i?.call(this);n?.call(this,o),this.requestUpdate(t,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??xe}static _$Ei(){if(this.hasOwnProperty(rt("elementProperties")))return;const t=ji(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(rt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(rt("properties"))){const e=this.properties,s=[...Li(e),...Ii(e)];for(const i of s)this.createProperty(i,e[i])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[e,s]of this.elementProperties){const i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)e.unshift(we(i))}else t!==void 0&&e.push(we(t));return e}static _$Eu(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ui(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((t=>t.hostConnected?.()))}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()))}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){const n=(s.converter?.toAttribute!==void 0?s.converter:St).toAttribute(e,s.type);this._$Em=t,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const n=s.getPropertyOptions(i),o=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:St;this._$Em=i;const l=o.fromAttribute(e,n.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(t,e,s){if(t!==void 0){const i=this.constructor,n=this[t];if(s??=i.getPropertyOptions(t),!((s.hasChanged??Zt)(n,e)||s.useDefault&&s.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:n},o){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),n!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[i,n]of s){const{wrapped:o}=n,l=this[i];o!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,n,l)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach((s=>s.hostUpdate?.())),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach((e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};q.elementStyles=[],q.shadowRootOptions={mode:"open"},q[rt("elementProperties")]=new Map,q[rt("finalized")]=new Map,Di?.({ReactiveElement:q}),(Ct.reactiveElementVersions??=[]).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Qt=globalThis,xt=Qt.trustedTypes,Pe=xt?xt.createPolicy("lit-html",{createHTML:r=>r}):void 0,cs="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,us="?"+P,Vi=`<${us}>`,L=document,lt=()=>L.createComment(""),ht=r=>r===null||typeof r!="object"&&typeof r!="function",Gt=Array.isArray,qi=r=>Gt(r)||typeof r?.[Symbol.iterator]=="function",It=`[ 	
\f\r]`,et=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ke=/-->/g,Ce=/>/g,R=RegExp(`>|${It}(?:([^\\s"'>=/]+)(${It}*=${It}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Oe=/'/g,Te=/"/g,ds=/^(?:script|style|textarea|title)$/i,Fi=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),nt=Fi(1),J=Symbol.for("lit-noChange"),v=Symbol.for("lit-nothing"),Re=new WeakMap,N=L.createTreeWalker(L,129);function ps(r,t){if(!Gt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return Pe!==void 0?Pe.createHTML(t):t}const Bi=(r,t)=>{const e=r.length-1,s=[];let i,n=t===2?"<svg>":t===3?"<math>":"",o=et;for(let l=0;l<e;l++){const a=r[l];let p,f,u=-1,h=0;for(;h<a.length&&(o.lastIndex=h,f=o.exec(a),f!==null);)h=o.lastIndex,o===et?f[1]==="!--"?o=ke:f[1]!==void 0?o=Ce:f[2]!==void 0?(ds.test(f[2])&&(i=RegExp("</"+f[2],"g")),o=R):f[3]!==void 0&&(o=R):o===R?f[0]===">"?(o=i??et,u=-1):f[1]===void 0?u=-2:(u=o.lastIndex-f[2].length,p=f[1],o=f[3]===void 0?R:f[3]==='"'?Te:Oe):o===Te||o===Oe?o=R:o===ke||o===Ce?o=et:(o=R,i=void 0);const c=o===R&&r[l+1].startsWith("/>")?" ":"";n+=o===et?a+Vi:u>=0?(s.push(p),a.slice(0,u)+cs+a.slice(u)+P+c):a+P+(u===-2?l:c)}return[ps(r,n+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class ct{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let n=0,o=0;const l=t.length-1,a=this.parts,[p,f]=Bi(t,e);if(this.el=ct.createElement(p,s),N.currentNode=this.el.content,e===2||e===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=N.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(const u of i.getAttributeNames())if(u.endsWith(cs)){const h=f[o++],c=i.getAttribute(u).split(P),d=/([.?@])?(.*)/.exec(h);a.push({type:1,index:n,name:d[2],strings:c,ctor:d[1]==="."?Yi:d[1]==="?"?Ki:d[1]==="@"?Ji:Ot}),i.removeAttribute(u)}else u.startsWith(P)&&(a.push({type:6,index:n}),i.removeAttribute(u));if(ds.test(i.tagName)){const u=i.textContent.split(P),h=u.length-1;if(h>0){i.textContent=xt?xt.emptyScript:"";for(let c=0;c<h;c++)i.append(u[c],lt()),N.nextNode(),a.push({type:2,index:++n});i.append(u[h],lt())}}}else if(i.nodeType===8)if(i.data===us)a.push({type:2,index:n});else{let u=-1;for(;(u=i.data.indexOf(P,u+1))!==-1;)a.push({type:7,index:n}),u+=P.length-1}n++}}static createElement(t,e){const s=L.createElement("template");return s.innerHTML=t,s}}function Z(r,t,e=r,s){if(t===J)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl;const n=ht(t)?void 0:t._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),n===void 0?i=void 0:(i=new n(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=Z(r,i._$AS(r,t.values),i,s)),t}class Wi{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??L).importNode(e,!0);N.currentNode=i;let n=N.nextNode(),o=0,l=0,a=s[0];for(;a!==void 0;){if(o===a.index){let p;a.type===2?p=new ft(n,n.nextSibling,this,t):a.type===1?p=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(p=new Zi(n,this,t)),this._$AV.push(p),a=s[++l]}o!==a?.index&&(n=N.nextNode(),o++)}return N.currentNode=L,i}p(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class ft{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=v,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Z(this,t,e),ht(t)?t===v||t==null||t===""?(this._$AH!==v&&this._$AR(),this._$AH=v):t!==this._$AH&&t!==J&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):qi(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==v&&ht(this._$AH)?this._$AA.nextSibling.data=t:this.T(L.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=ct.createElement(ps(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const n=new Wi(i,this),o=n.u(this.options);n.p(e),this.T(o),this._$AH=n}}_$AC(t){let e=Re.get(t.strings);return e===void 0&&Re.set(t.strings,e=new ct(t)),e}k(t){Gt(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const n of t)i===e.length?e.push(s=new ft(this.O(lt()),this.O(lt()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const s=t.nextSibling;t.remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class Ot{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,n){this.type=1,this._$AH=v,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=v}_$AI(t,e=this,s,i){const n=this.strings;let o=!1;if(n===void 0)t=Z(this,t,e,0),o=!ht(t)||t!==this._$AH&&t!==J,o&&(this._$AH=t);else{const l=t;let a,p;for(t=n[0],a=0;a<n.length-1;a++)p=Z(this,l[s+a],e,a),p===J&&(p=this._$AH[a]),o||=!ht(p)||p!==this._$AH[a],p===v?t=v:t!==v&&(t+=(p??"")+n[a+1]),this._$AH[a]=p}o&&!i&&this.j(t)}j(t){t===v?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Yi extends Ot{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===v?void 0:t}}class Ki extends Ot{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==v)}}class Ji extends Ot{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??v)===J)return;const s=this._$AH,i=t===v&&s!==v||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==v&&(s===v||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class Zi{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}}const Qi=Qt.litHtmlPolyfillSupport;Qi?.(ct,ft),(Qt.litHtmlVersions??=[]).push("3.3.1");const Gi=(r,t,e)=>{const s=e?.renderBefore??t;let i=s._$litPart$;if(i===void 0){const n=e?.renderBefore??null;s._$litPart$=i=new ft(t.insertBefore(lt(),n),n,void 0,e??{})}return i._$AI(r),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Xt=globalThis;class B extends q{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Gi(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return J}}B._$litElement$=!0,B.finalized=!0,Xt.litElementHydrateSupport?.({LitElement:B});const Xi=Xt.litElementPolyfillSupport;Xi?.({LitElement:B});(Xt.litElementVersions??=[]).push("4.2.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const tr={attribute:!0,type:String,converter:St,reflect:!1,hasChanged:Zt},er=(r=tr,t,e)=>{const{kind:s,metadata:i}=e;let n=globalThis.litPropertyMetadata.get(i);if(n===void 0&&globalThis.litPropertyMetadata.set(i,n=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),n.set(e.name,r),s==="accessor"){const{name:o}=e;return{set(l){const a=t.get.call(this);t.set.call(this,l),this.requestUpdate(o,a,r)},init(l){return l!==void 0&&this.C(o,void 0,r,l),l}}}if(s==="setter"){const{name:o}=e;return function(l){const a=this[o];t.call(this,l),this.requestUpdate(o,a,r)}}throw Error("Unsupported decorator location: "+s)};function k(r){return(t,e)=>typeof e=="object"?er(r,t,e):((s,i,n)=>{const o=i.hasOwnProperty(n);return i.constructor.createProperty(n,s),o?Object.getOwnPropertyDescriptor(i,n):void 0})(r,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function sr(r){return k({...r,state:!0,attribute:!1})}var ir=Object.defineProperty,Q=(r,t,e,s)=>{for(var i=void 0,n=r.length-1,o;n>=0;n--)(o=r[n])&&(i=o(t,e,i)||i);return i&&ir(t,e,i),i};const te=class te extends B{render(){return nt`
      <article class="card">
        ${this.imgSrc?nt`
              <a
                class="thumb"
                href=${this.href??"#"}
                aria-label="Open meal"
              >
                <img src=${this.imgSrc} alt="" loading="lazy" />
              </a>
            `:null}

        <div class="content">
          <h3 class="title">
            <a href=${this.href??"#"}><slot></slot></a>
          </h3>

          <p class="tags"><slot name="tags"></slot></p>

          <dl class="macros">
            <div>
              <dt>Calories</dt>
              <dd>${this.calories??"—"}</dd>
            </div>
            <div>
              <dt>Protein</dt>
              <dd>${this.protein??"—"} g</dd>
            </div>
            <div>
              <dt>Carbs</dt>
              <dd>${this.carbs??"—"} g</dd>
            </div>
            <div>
              <dt>Fat</dt>
              <dd>${this.fat??"—"} g</dd>
            </div>
          </dl>
        </div>
      </article>
    `}};te.styles=hs`
    :host {
      display: block;
    }

    .card {
      background: var(--color-surface-1);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-2xl);
      display: grid;
      grid-template-columns: minmax(110px, 140px) 1fr;
      gap: 1rem;
      padding: 1rem;
      max-width: 100%;
      align-items: stretch;
    }

    .thumb {
      display: block;
    }

    .thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: calc(var(--radius-2xl) - 6px);
      display: block;
    }

    .content {
      display: grid;
      gap: 0.5rem;
      align-content: start;
      min-width: 0;
    }

    .title {
      font-family: var(--font-display-stack);
      line-height: var(--leading-tight);
      margin: 0;
      font-size: var(--font-size-4);
      font-weight: var(--font-weight-semibold);
    }

    .title a {
      color: var(--color-text);
      text-decoration: none;
    }

    .title a:hover {
      color: var(--color-link-hover);
      text-decoration: underline;
    }

    .tags {
      color: var(--color-text-muted);
      margin: 0;
      font-size: 0.9rem;
    }

    .macros {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
      gap: 0.5rem 1.25rem;
      margin: 0.25rem 0 0;
    }

    .macros div {
      display: grid;
      gap: 0.25rem;
      min-width: 0;
    }

    dt {
      color: var(--color-text-muted);
      font-weight: 600;
      font-size: 0.8rem;
      line-height: 1.1;
    }

    dd {
      margin: 0;
      font-size: 0.9rem;
    }

    @media (max-width: 640px) {
      .card {
        grid-template-columns: 1fr;
      }
    }
  `;let S=te;Q([k({attribute:"img-src"})],S.prototype,"imgSrc");Q([k()],S.prototype,"href");Q([k({type:Number})],S.prototype,"calories");Q([k({type:Number})],S.prototype,"protein");Q([k({type:Number})],S.prototype,"carbs");Q([k({type:Number})],S.prototype,"fat");var rr=Object.defineProperty,fs=(r,t,e,s)=>{for(var i=void 0,n=r.length-1,o;n>=0;n--)(o=r[n])&&(i=o(t,e,i)||i);return i&&rr(t,e,i),i};const ee=class ee extends B{constructor(){super(...arguments),this.meals=[]}connectedCallback(){super.connectedCallback(),this.src&&this.hydrate(this.src)}hydrate(t){fetch(t).then(e=>{if(!e.ok)throw new Error(`HTTP ${e.status}`);return e.json()}).then(e=>{Array.isArray(e)?this.meals=e:(console.warn("Expected an array in JSON:",e),this.meals=[])}).catch(e=>console.error("Failed to load meals:",e))}render(){return nt`
      <section class="card" aria-labelledby="meals-heading">
        <h2 id="meals-heading">Menu Meals (weekly)</h2>
        <ul class="list">
          ${this.meals.map(t=>{const e=Array.isArray(t.tags)?t.tags.join(" • "):t.tags??"";return nt`
              <li>
                <sg-meal-card
                  img-src=${t.imgSrc??""}
                  href=${t.href??"#"}
                  .calories=${t.calories??void 0}
                  .protein=${t.protein??void 0}
                  .carbs=${t.carbs??void 0}
                  .fat=${t.fat??void 0}
                >
                  ${t.name}
                  ${e?nt`<span slot="tags">${e}</span>`:null}
                </sg-meal-card>
              </li>
            `})}
        </ul>
      </section>
    `}};ee.styles=hs`
    :host {
      display: block;
    }

    section.card {
      background: var(--color-surface-1);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-2xl);
      padding: 1.25rem 1.5rem;
    }

    h2 {
      margin: 0 0 0.75rem 0;
      font-family: var(--font-display-stack);
    }

    ul.list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    li {
      margin: 0;
      padding: 0;
    }
  `;let ut=ee;fs([k()],ut.prototype,"src");fs([sr()],ut.prototype,"meals");Pi({"sg-meal-card":S,"sg-meal-list":ut});
