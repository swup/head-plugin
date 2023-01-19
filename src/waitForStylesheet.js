export default function waitForStylesheet(element, timeoutMs = 0) {
  const isLoaded = ({ href }) => {
    return Array.from(document.styleSheets).map(({ href }) => href).includes(href);
  };

  const whenLoaded = (cb) => {
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
};
