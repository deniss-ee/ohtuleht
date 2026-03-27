/// <reference types="vite/client" />

// Figma Make asset protocol — resolved to src/assets/ by the vite.config.ts plugin
declare module 'figma:asset/*' {
  const src: string
  export default src
}
