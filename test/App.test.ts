import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import App from '../src/App.svelte';

describe('App Component', () => {
	test('it renders', async () => {
		const { container } = render(App);

		expect(container).toBeInTheDocument();
	});
});
