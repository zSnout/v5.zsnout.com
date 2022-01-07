// Instead of adding an `exports` variable using declare var,
// we want to prevent `exports` from being introduced into the global scope in `client`.
(window as any).exports = {};

export {};
