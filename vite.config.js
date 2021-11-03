import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		svelte(),
		VitePWA({
			registerType:  'autoUpdate',
			includeAssets: [ 'favicon.svg', 'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'robots.txt', 'apple-touch-icon.png' ],
			manifest:      {
				name:             'zacktype',
				short_name:       'zacktype',
				start_url:        '/',
				display:          'standalone',
				orientation:      'portrait',
				lang:             'en',
				background_color: '#171717',
				theme_color:      '#171717',
				icons:            [
					{
						src:   '/android-chrome-192x192.png',
						type:  'image/png',
						sizes: '192x192',
					},
					{
						src:   '/android-chrome-512x512.png',
						type:  'image/png',
						sizes: '512x512',
					},
					{
						src:     '/android-chrome-512x512.png',
						type:    'image/png',
						sizes:   '512x512',
						purpose: 'any maskable',
					},
				],
			},
		}),
	],
});
