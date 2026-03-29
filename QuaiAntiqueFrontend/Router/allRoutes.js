import Route from "./Route.js";

export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html", []),
    new Route("/galerie", "La galerie", "/pages/galerie/galerie.html", [], "/js/galerie/galerie.js"),
    new Route("/carte", "La carte", "/pages/carte.html", [], "/js/carte.js"),
    new Route("/signin", "Connexion", "/pages/auth/signin.html", ["disconnected"], "/js/auth/signin.js"),
    new Route("/signup", "Inscription", "/pages/auth/signup.html", ["disconnected"], "/js/auth/signup.js"),
    new Route("/account", "Mon compte", "/pages/auth/account.html", ["ROLE_USER"], "/js/auth/account.js"),
    new Route("/allResa", "Vos réservations", "/pages/reservations/allResa.html", ["ROLE_USER"], "/js/reservation/reserver.js"),
    new Route("/reserver", "Réserver", "/pages/reservations/reserver.html", ["ROLE_USER"], "/js/reservation/reserver.js"),
    new Route("/employeeDashboard", "Gestion Utilisateurs", "/pages/employee/dashboardEmployee.html", ["ROLE_ADMIN"], "/js/employee/dashboardEmployee.js"),
    new Route("/restaurantSettings", "Paramètres restaurant", "/pages/employee/restaurantSettings.html", ["ROLE_EMPLOYE"], "/js/employee/restaurantSettings.js"),
    new Route("/categories", "Gestion des catégories", "/pages/employee/categories.html", ["ROLE_EMPLOYE"], "/js/employee/categories.js"),
    new Route("/foods", "Gestion des plats", "/pages/employee/foods.html", ["ROLE_EMPLOYE"], "/js/employee/foods.js"),
    new Route("/menus", "Gestion des menus", "/pages/employee/menus.html", ["ROLE_EMPLOYE"], "/js/employee/menus.js"),
    new Route("/pictures", "Gestion de la galerie", "/pages/employee/pictures.html", ["ROLE_EMPLOYE"], "/js/employee/pictures.js"),
    new Route("/stats", "Statistiques", "/pages/employee/stats.html", ["ROLE_ADMIN"], "/js/employee/stats.js"),

];

export const websiteName = "Quai Antique";

export const basePath = "";
