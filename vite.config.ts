import tailwindcss from '@tailwindcss/postcss';
import { cloudflare } from '@cloudflare/vite-plugin';
import { sites } from '@openai/sites-vite-plugin';
import vinext from 'vinext';
import { defineConfig } from 'vite';

// Development and local audits run on Node; Sites builds target Workers.
export default defineConfig(({ mode }) => ({
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
      'gsap/ScrollToPlugin',
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
  plugins: [
    vinext(),
    sites(),
    ...(mode === 'sites'
      ? [cloudflare({
          configPath: './wrangler.sites.jsonc',
          viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        })]
      : []),
  ],
}));
