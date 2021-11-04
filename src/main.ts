// @ts-ignore that this module couldn't be found (it's virtual)
import { useRegisterSW } from 'virtual:pwa-register/svelte';
import App from './App.svelte';

const app = new App({
	target: document.getElementById('app')!,
});

useRegisterSW();

export default app;
