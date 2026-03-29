async function fetchWithAuth(url, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    "X-AUTH-TOKEN": token
  };

  return fetch(url, { ...options, headers });
}

async function toJsonOrThrow(response) {
  const text = await response.text();
  if (!response.ok) {
    const msg = text || response.statusText || "HTTP error";
    throw new Error(`HTTP ${response.status} – ${msg}`);
  }
  return text ? JSON.parse(text) : null;
}

const maxGuestInput = document.getElementById("MaxGuestInput");
const midiStart     = document.getElementById("MidiStart");
const midiEnd       = document.getElementById("MidiEnd");
const soirStart     = document.getElementById("SoirStart");
const soirEnd       = document.getElementById("SoirEnd");
const btnSave       = document.getElementById("btnSaveSettings");
const msg           = document.getElementById("settingsMsg");

async function loadSettings() {
  try {
    const res  = await fetchWithAuth("https://ton-backend.up.railway.app/api/admin/restaurant");
    const json = await toJsonOrThrow(res);

    maxGuestInput.value = window.escapeHtml(json.maxGuest);

    [midiStart.value, midiEnd.value] = json.amOpeningTime.map(window.escapeHtml);

    [soirStart.value, soirEnd.value] = json.pmOpeningTime.map(window.escapeHtml);

    msg.className   = "";
    msg.textContent = "";

  } catch (error) {
    console.error('Erreur:', error);
    msg.className   = "text-danger";
    msg.textContent = "Erreur lors du chargement : " + window.escapeHtml(error.message);
  }
}

loadSettings();

btnSave.addEventListener("click", saveSettings);

async function saveSettings() {
  const maxGuestVal = parseInt(maxGuestInput.value, 10);
  const amStartVal  = midiStart.value;
  const amEndVal    = midiEnd.value;
  const pmStartVal  = soirStart.value;
  const pmEndVal    = soirEnd.value;

  if (!maxGuestVal || maxGuestVal < 1) {
    msg.className   = "text-danger";
    msg.textContent = "Le nombre maximum de convives doit être ≥ 1.";
    return;
  }
  if (!amStartVal || !amEndVal || !pmStartVal || !pmEndVal) {
    msg.className   = "text-danger";
    msg.textContent = "Veuillez renseigner toutes les heures d’ouverture.";
    return;
  }

  const payload = {
    maxGuest: maxGuestVal,
    amOpeningTime: [amStartVal, amEndVal],
    pmOpeningTime: [pmStartVal, pmEndVal]
  };

  try {
    const res = await fetchWithAuth("https://ton-backend.up.railway.app/api/admin/restaurant", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    await toJsonOrThrow(res);

    msg.className   = "text-success";
    msg.textContent = "Paramètres enregistrés";

  } catch (error) {
    msg.className   = "text-danger";
    msg.textContent = "Erreur de sauvegarde : " + window.escapeHtml(error.message);

  }
}
