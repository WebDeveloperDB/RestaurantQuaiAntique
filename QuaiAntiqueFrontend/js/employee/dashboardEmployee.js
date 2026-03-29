const userRole = getRole();
if (userRole !== 'ROLE_ADMIN') {
    alert('Accès refusé. Cette page est réservée aux administrateurs.');
    window.location.href = '/QuaiAntique/QuaiAntiqueFrontend/';
}
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    const headers = {
        ...options.headers,
        'X-AUTH-TOKEN': token,
    };
    return fetch( ...options, headers );
}



async function createUser() {
    const token = getToken();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {
        const response = await fetchWithAuth("https://restaurantquaiantique-production.up.railway.app/api/admin/create-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-AUTH-TOKEN": token
            },
            body: JSON.stringify({ email, password, role })
        });

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {}
            throw new Error(errorData.message || "L'utilisateur n'a pas pu être créé.");
        }

        alert("Utilisateur créé avec succès !");
       
    } catch (err) {        console.error('Erreur:', err);        alert("Erreur lors de la création : " + err.message);

    }
}


async function loadUsers() {
    const token = getToken();
    try {
        const response = await fetch("https://restaurantquaiantique-production.up.railway.app/api/admin/users", {
            headers: {
                "X-AUTH-TOKEN": token
            }
        });
        const users = await response.json();

        const userList = document.getElementById("userList");
        userList.innerHTML = "";

        users.forEach(user => {
            const div = document.createElement("div");
            div.innerHTML = `<strong>${window.escapeHtml(user.email)}</strong> - ${window.escapeHtml(user.role)}`;
            userList.appendChild(div);
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function updateUser() {
    const token = getToken();
    const email = document.getElementById("update-email").value;
    const password = document.getElementById("update-password").value;
    const role = document.getElementById("update-role").value;

    if (!email) {
        alert("Veuillez d’abord sélectionner un utilisateur dans la liste !");
        return;
    }

    try {
        const response = await fetch(`https://restaurantquaiantique-production.up.railway.app/api/admin/users/${email}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-AUTH-TOKEN": token
            },
            body: JSON.stringify({ email, password, role })
        });
        let result = {};
        try { result = await response.json(); } catch (e) {}
        if (response.ok) {
            alert("L'utilisateur a été mis à jour avec succès !");
            document.getElementById("updateUserForm").reset();
            loadUsers();
        } else {
            alert("Fehler: " + (result.message || "La mise à jour a échoué."));
        }
    } catch (error) {
        alert("Fehler: " + error.message);
    }
}




async function deleteUser() {
    const token = getToken();
    const email = document.getElementById("update-email").value;
    if (!confirm(`Supprimer ${email} ?`)) return;

    try {
        const response = await fetch(`https://restaurantquaiantique-production.up.railway.app/api/admin/users/${email}`, {
            method: "DELETE",
            headers: {
                "X-AUTH-TOKEN": token
            }
        });

        const result = await response.json();
        if (response.ok) {
            alert("Utilisateur supprimé !");
            loadUsers();
            document.getElementById("updateUserForm").reset();
        } else {
            alert("Erreur : " + (result.message || "Suppression impossible."));
        }
    } catch (error) {
        console.error('Erreur:', error);
    }

}

loadUsers();
