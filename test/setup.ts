class LocalStorageMock {
  store: Record<string, string>;
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

// @ts-ignore
global.localStorage = new LocalStorageMock();
// @ts-ignore
global.window = {};
