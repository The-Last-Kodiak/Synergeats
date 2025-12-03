import { css } from "lit";

const styles = css`
  h1, h2, h3, h4 {
    font-family: var(--font-display-stack, system-ui);
    font-weight: 600;
    line-height: var(--leading-tight, 1.1);
    margin: 0 0 0.5rem 0;
  }

  h2 {
    font-size: var(--font-size-4, 1.5rem);
  }
`;

export default { styles };
