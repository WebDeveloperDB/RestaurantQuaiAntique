
function fetchWithAuth(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      "X-AUTH-TOKEN": token
    }
  });
}


const btnSaveInfos = document.getElementById("btnSaveInfos");
const btnSavePw    = document.getElementById("btnSavePw");
const btnDelete    = document.getElementById("btnDelete");
const infosForm    = document.getElementById("infosForm");
const pwForm       = document.getElementById("pwForm");


btnSaveInfos.addEventListener("click", updateInfos);
btnSavePw.addEventListener("click", changePassword);
btnDelete.addEventListener("click", deleteAccount);


async function updateInfos() {
  const data = Object.fromEntries(new FormData(infosForm));
  try {
    const res = await fetchWithAuth("http://localhost:8000/api/account", {
      method: "PUT",
      body: JSON.stringify({
        firstName:   data.Prenom,
        lastName:    data.Nom,
        guestNumber: +data.NbConvives || null,
        allergy:     data.Allergies
      })
    });
    if (!res.ok) throw new Error(await res.text());
    alert("Informations mises à jour !");
  } catch (err) {
    alert("" + err.message);
  }
}


async function changePassword() {
  const data = Object.fromEntries(new FormData(pwForm));
  if (data.Password !== data.PasswordConfirm) {
    alert("Les mots de passe ne correspondent pas");
    return;
  }
  try {
    const res = await fetchWithAuth("http://localhost:8000/api/account", {
      method: "PUT",
      body: JSON.stringify({ password: data.Password })
    });
    if (!res.ok) throw new Error(await res.text());
    alert("Mot de passe changé !");
    pwForm.reset();
  } catch (err) {
    alert(err.message);
  }
}


async function deleteAccount() {
  if (!confirm("Supprimer votre compte ?")) return;
  try {
    const res = await fetchWithAuth("http://localhost:8000/api/account", { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    alert("Compte supprimé – au revoir !");
    signout();
  } catch (err) {
    alert(err.message);
  }
}
