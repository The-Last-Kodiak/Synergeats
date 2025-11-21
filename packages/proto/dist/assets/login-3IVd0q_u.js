import{a as n,i as m,x as p,r as h,n as u,d as g,b}from"./state-BFvJTQ8F.js";const f=n`
  * { margin: 0; box-sizing: border-box; }
  img { max-width: 100%; display: block; }
  ul, menu { list-style: none; padding: 0; margin: 0; }
`,y={styles:f},v=n`
  h1, h2, h3, h4 {
    font-family: var(--font-display-stack, system-ui);
    font-weight: 600;
    line-height: var(--leading-tight, 1.1);
    margin: 0 0 0.5rem 0;
  }

  h2 {
    font-size: var(--font-size-4, 1.5rem);
  }
`,x={styles:v};var w=Object.defineProperty,i=(c,e,t,s)=>{for(var r=void 0,a=c.length-1,l;a>=0;a--)(l=c[a])&&(r=l(e,t,r)||r);return r&&w(e,t,r),r};const d=class d extends m{constructor(){super(...arguments),this.formData={},this.redirect="/"}get canSubmit(){return!!(this.api&&this.formData.username&&this.formData.password)}render(){return p`
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
    `}handleChange(e){const t=e.target,s=t?.name,r=t?.value,a=this.formData;switch(s){case"username":this.formData={...a,username:r};break;case"password":this.formData={...a,password:r};break}}handleSubmit(e){e.preventDefault(),this.canSubmit&&fetch(this.api||"",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(this.formData)}).then(t=>{if(t.status!==200)throw"Login failed";return t.json()}).then(t=>{const{token:s}=t,r=new CustomEvent("auth:message",{bubbles:!0,composed:!0,detail:["auth/signin",{token:s,redirect:this.redirect}]});console.log("dispatching message",r),this.dispatchEvent(r)}).catch(t=>{console.log(t),this.error=String(t)})}};d.styles=[y.styles,x.styles,n`
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
    `];let o=d;i([h()],o.prototype,"formData");i([u()],o.prototype,"api");i([u()],o.prototype,"redirect");i([h()],o.prototype,"error");g({"mu-auth":b.Provider,"login-form":o});
