// @ts-ignore that this module couldn't be found (it's virtual)
import { registerSW } from 'virtual:pwa-register';
import App from './App.svelte';

const app = new App({
	target: document.getElementById('app')!,
});

registerSW({ immediate: true });

export default app;
