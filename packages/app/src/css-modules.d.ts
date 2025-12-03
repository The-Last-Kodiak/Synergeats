// Treat any *.css.js module as "any" so TS stops complaining.
declare module "*.css.js" {
  const styles: any;
  export default styles;
}
