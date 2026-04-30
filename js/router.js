/**
 * Router Module — Hash-based client-side routing with lazy view loading.
 * Handles navigation between views using URL hash fragments.
 * @module router
 */

const routes = {};
let currentView = null;
let contentEl = null;

/**
 * Register a route path to a view module.
 * @param {string} path - The URL hash path (e.g., '/' or '/chat').
 * @param {object} viewModule - The view module with render() and optional mount()/unmount().
 */
export function addRoute(path, viewModule) {
  routes[path] = viewModule;
}

/**
 * Navigate to a route programmatically.
 * @param {string} path - The path to navigate to.
 */
export function navigate(path) {
  window.location.hash = path;
}

/**
 * Get the current route path from the URL hash.
 * @returns {string} The current route path.
 */
export function getCurrentRoute() {
  return window.location.hash.slice(1) || '/';
}

/**
 * Initialize the router and begin handling hash changes.
 * @param {string} [containerSelector='#app-content'] - CSS selector for the content container.
 */
export function initRouter(containerSelector = '#app-content') {
  contentEl = document.querySelector(containerSelector);
  if (!contentEl) return;

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

/**
 * Handles a route change by unmounting the current view and rendering the new one.
 * @private
 */
async function handleRoute() {
  const path = getCurrentRoute();
  const view = routes[path] || routes['/'];

  if (!view) {
    contentEl.innerHTML = `<section class="view-404"><h1>Page Not Found</h1><p><a href="#/">Go Home</a></p></section>`;
    return;
  }

  if (currentView?.unmount) {
    try { currentView.unmount(); } catch (_e) { /* silent unmount failure */ }
  }

  contentEl.setAttribute('aria-busy', 'true');

  try {
    const resolvedView = typeof view === 'function' ? await view() : view;
    contentEl.innerHTML = resolvedView.render();
    if (resolvedView.mount) resolvedView.mount();
    currentView = resolvedView;

    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === '#' + path || (path === '/' && href === '#/'));
    });

    contentEl.scrollTop = 0;
    window.scrollTo(0, 0);
  } catch (_e) {
    contentEl.innerHTML = `<section class="view-error"><h1>Something went wrong</h1><p><a href="#/">Go Home</a></p></section>`;
  }

  contentEl.setAttribute('aria-busy', 'false');
}
