import{i as g,x as c,a as u,n as s,O as v,r as b,d as y,b as x}from"./state-BFvJTQ8F.js";var $=Object.defineProperty,d=(l,r,t,o)=>{for(var e=void 0,i=l.length-1,n;i>=0;i--)(n=l[i])&&(e=n(r,t,e)||e);return e&&$(r,t,e),e};const p=class p extends g{render(){return c`
      <article class="card">
        ${this.imgSrc?c`
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
    `}};p.styles=u`
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
  `;let a=p;d([s({attribute:"img-src"})],a.prototype,"imgSrc");d([s()],a.prototype,"href");d([s({type:Number})],a.prototype,"calories");d([s({type:Number})],a.prototype,"protein");d([s({type:Number})],a.prototype,"carbs");d([s({type:Number})],a.prototype,"fat");var k=Object.defineProperty,f=(l,r,t,o)=>{for(var e=void 0,i=l.length-1,n;i>=0;i--)(n=l[i])&&(e=n(r,t,e)||e);return e&&k(r,t,e),e};const m=class m extends g{constructor(){super(...arguments),this.meals=[],this._authObserver=new v(this,"Synergeats:auth")}connectedCallback(){super.connectedCallback(),this._authObserver.observe(r=>{this._user=r.user,this.src&&this.hydrate(this.src)}),this.src&&this.hydrate(this.src)}get authorization(){if(this._user&&this._user.authenticated&&"token"in this._user)return{Authorization:`Bearer ${this._user.token}`}}hydrate(r){fetch(r,{headers:this.authorization}).then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{Array.isArray(t)?this.meals=t.map(o=>({...o,tags:Array.isArray(o.tags)?o.tags.join(" • "):o.tags})):(console.warn("Expected an array in JSON:",t),this.meals=[])}).catch(t=>console.error("Failed to load meals:",t))}render(){return c`
      <section class="card" aria-labelledby="meals-heading">
        <h2 id="meals-heading">Menu Meals (weekly)</h2>
        <ul class="list">
          ${this.meals.map(r=>c`
            <li>
              <sg-meal-card
                img-src=${r.imgSrc??""}
                href=${r.href??"#"}
                .calories=${r.calories}
                .protein=${r.protein}
                .carbs=${r.carbs}
                .fat=${r.fat}
              >
                ${r.name}
                ${r.tags?c`<span slot="tags">${r.tags}</span>`:null}
              </sg-meal-card>
            </li>
          `)}
        </ul>
      </section>
    `}};m.styles=u`
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
  `;let h=m;f([s()],h.prototype,"src");f([b()],h.prototype,"meals");y({"mu-auth":x.Provider,"sg-meal-card":a,"sg-meal-list":h});
