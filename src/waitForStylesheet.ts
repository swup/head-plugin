export default function waitForStylesheet(element: HTMLLinkElement, timeoutMs: number = 0) {
	const isLoaded = ({ href }: HTMLLinkElement) => {
		return Array.from(document.styleSheets)
			.map(({ href }) => href)
			.includes(href);
	};

	const whenLoaded = (cb: (value?: unknown) => void) => {
		if (isLoaded(element)) {
			cb();
		} else {
			setTimeout(() => whenLoaded(cb), 10);
		}
	};

	return new Promise((resolve) => {
		whenLoaded(resolve);
		if (timeoutMs > 0) {
			setTimeout(resolve, timeoutMs);
		}
	});
}
