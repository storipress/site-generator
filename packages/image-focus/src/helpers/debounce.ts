export function debounce(
  func: (...args: any[]) => void,
  debounceTime: number
): ((...args: any[]) => void) & { cancel: () => void } {
  let timeout: any;

  function debouncedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), debounceTime);
  }

  debouncedFunction.cancel = () => clearTimeout(timeout);

  return debouncedFunction;
}
