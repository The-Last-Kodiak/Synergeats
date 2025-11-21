import{i as g,x as n,a as p,n as l,O as y,r as m,e as k,d as _,b as w}from"./state-DDl4RKRY.js";var O=Object.defineProperty,h=(i,e,r,d)=>{for(var t=void 0,a=i.length-1,o;a>=0;a--)(o=i[a])&&(t=o(e,r,t)||t);return t&&O(e,r,t),t};const f=class f extends g{render(){return n`
      <article class="card">
        ${this.imgSrc?n`
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
    `}};f.styles=p`
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
  `;let s=f;h([l({attribute:"img-src"})],s.prototype,"imgSrc");h([l()],s.prototype,"href");h([l({type:Number})],s.prototype,"calories");h([l({type:Number})],s.prototype,"protein");h([l({type:Number})],s.prototype,"carbs");h([l({type:Number})],s.prototype,"fat");var z=Object.defineProperty,x=(i,e,r,d)=>{for(var t=void 0,a=i.length-1,o;a>=0;a--)(o=i[a])&&(t=o(e,r,t)||t);return t&&z(e,r,t),t};const v=class v extends g{constructor(){super(...arguments),this.meals=[],this._authObserver=new y(this,"Synergeats:auth")}connectedCallback(){super.connectedCallback(),this._authObserver.observe(e=>{this._user=e.user,this.src&&this.hydrate(this.src)}),this.src&&this.hydrate(this.src)}get authorization(){if(this._user&&this._user.authenticated&&"token"in this._user)return{Authorization:`Bearer ${this._user.token}`}}hydrate(e){fetch(e,{headers:this.authorization}).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}).then(r=>{Array.isArray(r)?this.meals=r.map(d=>({...d,tags:Array.isArray(d.tags)?d.tags.join(" • "):d.tags})):(console.warn("Expected an array in JSON:",r),this.meals=[])}).catch(r=>console.error("Failed to load meals:",r))}render(){return n`
      <section class="card" aria-labelledby="meals-heading">
        <h2 id="meals-heading">Menu Meals (weekly)</h2>
        <ul class="list">
          ${this.meals.map(e=>n`
            <li>
              <sg-meal-card
                img-src=${e.imgSrc??""}
                href=${e.href??"#"}
                .calories=${e.calories}
                .protein=${e.protein}
                .carbs=${e.carbs}
                .fat=${e.fat}
              >
                ${e.name}
                ${e.tags?n`<span slot="tags">${e.tags}</span>`:null}
              </sg-meal-card>
            </li>
          `)}
        </ul>
      </section>
    `}};v.styles=p`
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
  `;let u=v;x([l()],u.prototype,"src");x([m()],u.prototype,"meals");var S=Object.defineProperty,$=(i,e,r,d)=>{for(var t=void 0,a=i.length-1,o;a>=0;a--)(o=i[a])&&(t=o(e,r,t)||t);return t&&S(e,r,t),t};const b=class b extends g{constructor(){super(...arguments),this._authObserver=new y(this,"Synergeats:auth"),this.loggedIn=!1}connectedCallback(){super.connectedCallback(),this._authObserver.observe(e=>{const r=e.user;r&&r.authenticated?(this.loggedIn=!0,this.username=r.username):(this.loggedIn=!1,this.username=void 0)})}render(){return n`
      <header>
        <div class="logo">
          <h2>Synergeats</h2>
        </div>

        <div class="user">
          ${this.loggedIn?n`
            Hello, ${this.username}
            <button @click=${this.signOut}>Sign out</button>
          `:n`
            <a href="/login.html">Sign in</a>
          `}
        </div>
      </header>
    `}signOut(e){k.relay(e,"auth:message",["auth/signout"])}static initializeOnce(){}};b.styles=p`
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: var(--color-surface-1);
      border-bottom: 1px solid var(--color-border);
    }

    .user {
      font-weight: bold;
      font-family: var(--font-display-stack);
    }

    button, a {
      font-size: 0.9rem;
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      cursor: pointer;
      border: none;
      background: var(--color-accent);
      color: var(--color-on-accent);
      text-decoration: none;
    }
  `;let c=b;$([m()],c.prototype,"loggedIn");$([m()],c.prototype,"username");_({"mu-auth":w.Provider,"sg-meal-card":s,"sg-meal-list":u,"sg-header":c});c.initializeOnce();
