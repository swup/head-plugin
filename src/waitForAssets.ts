export default function waitForAssets(
	elements: Element[],
	timeoutMs: number = 0
): Promise<HTMLLinkElement>[] {
	return elements.filter(isStylesheet).map((el) => waitForStylesheet(el, timeoutMs));
}

function isStylesheet(el: Element): el is HTMLLinkElement {
	return el.matches('link[rel=stylesheet][href]');
}

export function waitForStylesheet(
	element: HTMLLinkElement,
	timeoutMs: number = 0
): Promise<HTMLLinkElement> {
	const isLoaded = ({ href }: HTMLLinkElement) => {
		return Array.from(document.styleSheets)
			.map(({ href }) => href)
			.includes(href);
	};

	const whenLoaded = (cb: () => void) => {
		if (isLoaded(element)) {
			cb();
		} else {
			setTimeout(() => whenLoaded(cb), 10);
		}
	};

	return new Promise((resolve) => {
		whenLoaded(() => resolve(element));
		if (timeoutMs > 0) {
			setTimeout(() => resolve(element), timeoutMs);
		}
	});
}
