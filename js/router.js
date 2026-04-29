/**
 * Router Module — Hash-based client-side routing with lazy view loading
 */

const routes = {};
let currentView = null;
let contentEl = null;

/** Register a route */
export function addRoute(path, viewModule) {
  routes[path] = viewModule;
}

/** Navigate to a route programmatically */
export function navigate(path) {
  window.location.hash = path;
}

/** Get current route path */
export function getCurrentRoute() {
  return window.location.hash.slice(1) || '/';
}

/** Initialize the router */
export function initRouter(containerSelector = '#app-content') {
  contentEl = document.querySelector(containerSelector);
  if (!contentEl) { console.error('Router: container not found'); return; }

  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // Handle initial route
}

async function handleRoute() {
  const path = getCurrentRoute();
  const view = routes[path] || routes['/'];

  if (!view) {
    contentEl.innerHTML = `<section class="view-404"><h1>Page Not Found</h1><p><a href="#/">Go Home</a></p></section>`;
    return;
  }

  // Unmount current view
  if (currentView?.unmount) {
    try { currentView.unmount(); } catch (e) { console.warn('Unmount error:', e); }
  }

  // Loading state
  contentEl.setAttribute('aria-busy', 'true');

  try {
    // If view is a function (lazy loader), resolve it
    const resolvedView = typeof view === 'function' ? await view() : view;

    // Render and mount
    contentEl.innerHTML = resolvedView.render();
    if (resolvedView.mount) resolvedView.mount();
    currentView = resolvedView;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === '#' + path || (path === '/' && href === '#/'));
    });

    // Scroll to top
    contentEl.scrollTop = 0;
    window.scrollTo(0, 0);
  } catch (e) {
    console.error('Route error:', e);
    contentEl.innerHTML = `<section class="view-error"><h1>Something went wrong</h1><p><a href="#/">Go Home</a></p></section>`;
  }

  contentEl.setAttribute('aria-busy', 'false');
}
