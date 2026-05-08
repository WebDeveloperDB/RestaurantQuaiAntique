import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";
import { pageTemplates } from "./pageTemplates.js";

const getRuntimeBasePath = () => {
  try {
    const baseEl = document.querySelector('base');
    if (baseEl && baseEl.getAttribute('href')) {
      const url = new URL(baseEl.href, window.location.origin);
      // remove trailing slash
      return url.pathname.replace(/\/$/, '');
    }
  } catch (e) {
    // fallback to empty
  }
  return '';
};

const runtimeBasePath = getRuntimeBasePath();
const route404 = new Route("404", "Page introuvable", "/pages/404.html", []);
let routeScriptVersion = 0;

const stripBasePath = (pathname) => {
  if (runtimeBasePath && pathname.startsWith(runtimeBasePath)) {
    const stripped = pathname.slice(runtimeBasePath.length);
    return stripped || "/";
  }

  return pathname || "/";
};

const looksLikeAppShell = (html) => {
  return html.includes('id="main-page"') || html.includes("id='main-page'");
};

const fetchRouteHtml = async (routePath) => {
  if (pageTemplates[routePath]) {
    return pageTemplates[routePath];
  }

  const candidates = [
    `${runtimeBasePath}${routePath}`,
    routePath,
    `/QuaiAntiqueFrontend${routePath}`,
  ];

  for (const candidate of [...new Set(candidates)]) {
    const response = await fetch(candidate);
    if (!response.ok) {
      continue;
    }

    const html = await response.text();
    if (!looksLikeAppShell(html)) {
      return html;
    }
  }

  return pageTemplates["/pages/404.html"] || "<h1>404 - Page introuvable</h1>";
};

const getRouteByUrl = (url) => {
  let currentRoute = null;
  allRoutes.forEach((element) => {
    if (element.url == url) {
      currentRoute = element;
    }
  });
  return currentRoute || route404;
};

const LoadContentPage = async () => {
  const path = stripBasePath(window.location.pathname);
  const actualRoute = getRouteByUrl(path);

  const allRolesArray = actualRoute.authorize;
  
  if (allRolesArray.length > 0) {
    if (allRolesArray.includes("disconnected")) {
      const connected = window.isConnected ? window.isConnected() : false;
      if (connected) {
        window.location.replace(runtimeBasePath + "/");
        return;
      }
    } else {
      const roleUser = window.getRole ? window.getRole() : null;
      
      let hasAccess = allRolesArray.includes(roleUser);
      if (roleUser === 'ROLE_ADMIN') {
        hasAccess = true;
      } else if (roleUser === 'ROLE_EMPLOYE' && allRolesArray.includes('ROLE_USER')) {
        hasAccess = true;
      }
      
      if (!hasAccess) {
        window.location.replace(runtimeBasePath + "/");
        return;
      }
    }
  }

  const html = await fetchRouteHtml(actualRoute.pathHtml);
  document.getElementById("main-page").innerHTML = html;

  if (actualRoute.pathJS != "") {
    // Force un nouveau chargement du script de route a chaque navigation.
    routeScriptVersion += 1;
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("type", "module");
    scriptTag.setAttribute("src", `${runtimeBasePath}${actualRoute.pathJS}?routeLoad=${routeScriptVersion}`);
    document.querySelector("body").appendChild(scriptTag);
  }

  document.title = actualRoute.title + " - " + websiteName;
  
  if (window.showAndHideElementsForRoles) {
    window.showAndHideElementsForRoles();
  }
};

const routeEvent = (event, hrefOverride = null) => {
  event = event || window.event;
  event.preventDefault();
  const href = hrefOverride || event.target.href;
  window.history.pushState({}, "", href);
  LoadContentPage();
};

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) {
    return;
  }

  const href = link.getAttribute("href");
  if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) {
    return;
  }

  const url = new URL(link.href, window.location.origin);
  const normalizedPath = stripBasePath(url.pathname);
  const matchingRoute = getRouteByUrl(normalizedPath);

  if (matchingRoute !== route404 || normalizedPath === "/") {
    routeEvent(event, url.pathname);
  }
});

window.onpopstate = LoadContentPage;
window.route = routeEvent;
LoadContentPage();
