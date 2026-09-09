import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

// Local frontend preview runs on Node; no remote bindings or Workers runtime needed.
export default defineConfig({
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: {
    include: [
      'react',
      'react-dom/client',
      '@base-ui/react/button',
      '@base-ui/react/dialog',
      '@base-ui/react/input',
      '@base-ui/react/progress',
      'gsap',
      'gsap/ScrollTrigger',
    ],
  },
  server: {
    watch: {
      usePolling: true,
      interval: 300,
      ignored: ['**/DESIGN-REFERENCE.png'],
    },
  },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [vinext()],
});
