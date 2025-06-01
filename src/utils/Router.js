class Router {
  constructor() {
    this.routes = {};
    this.notFoundHandler = null;
    this.currentPageInstance = null;
  }

  addRoute(path, handler) {
    const regexPath = path.replace(/:(\w+)/g, '(?<$1>[^/]+)');
    this.routes[path] = { handler, regex: new RegExp(`^${regexPath}$`) };
  }

  addNotFoundHandler(handler) {
    this.notFoundHandler = handler;
  }

  resolve() {
    const path = window.location.hash.slice(1) || '/';
    const normalizedPath = path === '' ? '/' : path;

    for (const routePath in this.routes) {
      const { handler, regex } = this.routes[routePath];
      const match = normalizedPath.match(regex);

      if (match) {
        const params = match.groups || {};

        const isClassConstructor = handler.prototype && handler.prototype.constructor === handler;

        if (isClassConstructor) {
          let storyIdToPass = params.id;

          if (params.id && typeof params.id === 'object' && params.id !== null && 'id' in params.id) {
            storyIdToPass = params.id.id;
          } else if (typeof params.id === 'undefined' || params.id === null) {
            storyIdToPass = '';
          } else if (typeof params.id !== 'string') {
            storyIdToPass = String(params.id);
          }

          return new handler(storyIdToPass);
        } else if (typeof handler === 'function') {
          return handler(params);
        } else {
          return null;
        }
      }
    }

    if (this.notFoundHandler) {
      return this.notFoundHandler();
    }

    return null;
  }

  navigate(path) {
    window.location.hash = path;
  }
}

const routerInstance = new Router();
export default Router;
export { routerInstance };
