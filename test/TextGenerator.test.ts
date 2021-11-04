import { TextGenerator } from '$lib/TextGenerator';

test('generateText', () => {
	const text1 = TextGenerator.generateText();
	expect(text1).toEqual(expect.any(String));
	expect(text1).toMatch(/^[a-zA-Z.,?!\- ]+$/);

	const text2 = TextGenerator.generateText(10);
	expect(text2.length).toBeGreaterThanOrEqual(10);

	const text3 = TextGenerator.generateText(50);
	expect(text3.length).toBeGreaterThanOrEqual(50);
});
