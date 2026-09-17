import tailwindcss from '@tailwindcss/postcss';
import { cloudflare } from '@cloudflare/vite-plugin';
import { sites } from '@openai/sites-vite-plugin';
import vinext from 'vinext';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

// Keep local Node previews separate from the Vercel and optional Sites builds.
export default defineConfig(({ mode }) => ({
  resolve: { dedupe: ['react', 'react-dom'] },
  // Bundle both server environments before Nitro packages the Vercel function.
  ...(mode === 'vercel' ? {
    environments: {
      rsc: { resolve: { noExternal: true } },
      ssr: { resolve: { noExternal: true } },
    },
  } : {}),
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
    ...(mode === 'vercel' ? [nitro({ preset: 'vercel' })] : []),
    ...(mode === 'sites'
      ? [sites(), cloudflare({
          configPath: './wrangler.sites.jsonc',
          viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        })]
      : []),
  ],
}));
