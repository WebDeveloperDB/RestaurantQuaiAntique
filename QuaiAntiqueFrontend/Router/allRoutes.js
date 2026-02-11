import Route from "./Route.js";

export const allRoutes = [
    new Route("/QuaiAntique/QuaiAntiqueFrontend/", "Accueil", "/QuaiAntique/QuaiAntiqueFrontend/pages/home.html", []),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/galerie", "La galerie", "/QuaiAntique/QuaiAntiqueFrontend/pages/galerie/galerie.html", [], "/QuaiAntique/QuaiAntiqueFrontend/js/galerie/galerie.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/carte", "La carte", "/QuaiAntique/QuaiAntiqueFrontend/pages/carte.html", [], "/QuaiAntique/QuaiAntiqueFrontend/js/carte.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/signin", "Connexion", "/QuaiAntique/QuaiAntiqueFrontend/pages/auth/signin.html", ["disconnected"], "/QuaiAntique/QuaiAntiqueFrontend/js/auth/signin.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/signup", "Inscription", "/QuaiAntique/QuaiAntiqueFrontend/pages/auth/signup.html", ["disconnected"], "/QuaiAntique/QuaiAntiqueFrontend/js/auth/signup.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/account", "Mon compte", "/QuaiAntique/QuaiAntiqueFrontend/pages/auth/account.html", ["ROLE_USER"], "/QuaiAntique/QuaiAntiqueFrontend/js/auth/account.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/allResa", "Vos réservations", "/QuaiAntique/QuaiAntiqueFrontend/pages/reservations/allResa.html", ["ROLE_USER"], "/QuaiAntique/QuaiAntiqueFrontend/js/reservation/reserver.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/reserver", "Réserver", "/QuaiAntique/QuaiAntiqueFrontend/pages/reservations/reserver.html", ["ROLE_USER"], "/QuaiAntique/QuaiAntiqueFrontend/js/reservation/reserver.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/employeeDashboard", "Gestion Utilisateurs", "/QuaiAntique/QuaiAntiqueFrontend/pages/employee/dashboardEmployee.html", ["ROLE_ADMIN"], "/QuaiAntique/QuaiAntiqueFrontend/js/employee/dashboardEmployee.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/restaurantSettings", "Paramètres restaurant", "/QuaiAntique/QuaiAntiqueFrontend/pages/employee/restaurantSettings.html", ["ROLE_EMPLOYE"], "/QuaiAntique/QuaiAntiqueFrontend/js/employee/restaurantSettings.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/categories", "Gestion des catégories", "/QuaiAntique/QuaiAntiqueFrontend/pages/employee/categories.html", ["ROLE_EMPLOYE"], "/QuaiAntique/QuaiAntiqueFrontend/js/employee/categories.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/foods", "Gestion des plats", "/QuaiAntique/QuaiAntiqueFrontend/pages/employee/foods.html", ["ROLE_EMPLOYE"], "/QuaiAntique/QuaiAntiqueFrontend/js/employee/foods.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/menus", "Gestion des menus", "/QuaiAntique/QuaiAntiqueFrontend/pages/employee/menus.html", ["ROLE_EMPLOYE"], "/QuaiAntique/QuaiAntiqueFrontend/js/employee/menus.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/pictures", "Gestion de la galerie", "/QuaiAntique/QuaiAntiqueFrontend/pages/employee/pictures.html", ["ROLE_EMPLOYE"], "/QuaiAntique/QuaiAntiqueFrontend/js/employee/pictures.js"),
    new Route("/QuaiAntique/QuaiAntiqueFrontend/stats", "Statistiques", "/QuaiAntique/QuaiAntiqueFrontend/pages/employee/stats.html", ["ROLE_ADMIN"], "/QuaiAntique/QuaiAntiqueFrontend/js/employee/stats.js"),

];

export const websiteName = "Quai Antique";

export const basePath = "/QuaiAntique/QuaiAntiqueFrontend";