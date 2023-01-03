export default function waitForStylesheet(element, timeoutMs = 0) {
  const whenLoaded = (cb) => {
    const { href } = element;
    const loadedStyleSheets = Array.from(document.styleSheets).map(({ href }) => href);
    if (loadedStyleSheets.includes(href)) {
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
};
