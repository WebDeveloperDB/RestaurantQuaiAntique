const API_BASE = "http://localhost:8000/api";

let restaurantSettings = null;
let currentUser = null;

async function init() {
    await loadUserData();
    await loadRestaurantSettings();
    setupEventListeners();
    updateTimeSlots();
}

async function loadUserData() {
    try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(`${API_BASE}/account`, {
            headers: { "X-AUTH-TOKEN": token }
        });

        if (!response.ok) return;

        currentUser = await response.json();

        const nomInput = document.getElementById("NomInput");
        const prenomInput = document.getElementById("PrenomInput");
        const allergieInput = document.getElementById("AllergieInput");
        const guestInput = document.getElementById("NbConvivesInput");

        if (nomInput && currentUser.lastName) nomInput.value = window.escapeHtml(currentUser.lastName);
        if (prenomInput && currentUser.firstName) prenomInput.value = window.escapeHtml(currentUser.firstName);
        if (allergieInput && currentUser.allergy) allergieInput.value = window.escapeHtml(currentUser.allergy);
        if (guestInput && currentUser.guestNumber) guestInput.value = window.escapeHtml(currentUser.guestNumber);

    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function loadRestaurantSettings() {
    try {
        const response = await fetch(`${API_BASE}/admin/restaurant`);
        
        if (!response.ok) {
            throw new Error("Settings nicht geladen");
        }

        restaurantSettings = await response.json();

    } catch (error) {
        console.error('Erreur:', error);
        restaurantSettings = {
            maxGuest: 50,
            amOpeningTime: ["12:00", "14:00"],
            pmOpeningTime: ["19:00", "22:00"]
        };
    }
}

function setupEventListeners() {
    const dateInput = document.getElementById("DateInput");
    const serviceRadios = document.querySelectorAll('input[name="serviceChoisi"]');
    const guestInput = document.getElementById("NbConvivesInput");
    const timeSelect = document.getElementById("selectHour");
    const btnReserve = document.getElementById("btnReserve");
    const btnCancel = document.getElementById("btnCancel");

    if (dateInput) {
        dateInput.addEventListener("change", updateTimeSlots);
    }

    serviceRadios.forEach(radio => {
        radio.addEventListener("change", updateTimeSlots);
    });

    if (guestInput) {
        guestInput.addEventListener("change", checkAvailability);
    }
    if (timeSelect) {
        timeSelect.addEventListener("change", checkAvailability);
    }

    if (btnReserve) {
        btnReserve.addEventListener("click", handleReservation);
    }

    if (btnCancel) {
        btnCancel.addEventListener("click", () => {
            window.location.href = "/QuaiAntique/QuaiAntiqueFrontend/";
        });
    }
}


function updateTimeSlots() {
    if (!restaurantSettings) {
        return;
    }

    const dateInput = document.getElementById("DateInput");
    const selectedDate = dateInput?.value;

    if (!selectedDate) {
        return;
    }

    const date = new Date(selectedDate + "T12:00:00");
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 1) {
        showMessage("Le restaurant est fermé le lundi", "warning");
        document.getElementById("selectHour").innerHTML = '<option value="">Restaurant fermé</option>';
        return;
    }

    const selectedService = document.querySelector('input[name="serviceChoisi"]:checked')?.value;
    const openingTime = selectedService === "soir" 
        ? restaurantSettings.pmOpeningTime 
        : restaurantSettings.amOpeningTime;

    if (!openingTime || openingTime.length !== 2) {
        return;
    }

    const [startTime, endTime] = openingTime;
    const slots = generate15MinSlots(startTime, endTime);

    const timeSelect = document.getElementById("selectHour");
    timeSelect.innerHTML = '<option value="">-- Choisir un horaire --</option>';

    slots.forEach(slot => {
        const option = document.createElement("option");
        option.value = window.escapeHtml(slot);
        option.textContent = window.escapeHtml(slot);
        timeSelect.appendChild(option);
    });
}

function generate15MinSlots(start, end) {
    const slots = [];
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes <= endMinutes) {
        const h = Math.floor(currentMinutes / 60);
        const m = currentMinutes % 60;
        slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
        currentMinutes += 15;
    }

    return slots;
}

async function checkAvailability() {
    const dateInput = document.getElementById("DateInput");
    const timeSelect = document.getElementById("selectHour");
    const guestInput = document.getElementById("NbConvivesInput");
    const msgDiv = document.getElementById("availabilityMsg");

    const date = dateInput?.value;
    const time = timeSelect?.value;
    const guests = parseInt(guestInput?.value || "0");

    if (!date || !time || guests < 1) {
        msgDiv.innerHTML = "";
        return;
    }

    try {
        const url = `${API_BASE}/reservations/available?date=${date}&time=${time}&guests=${guests}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.free) {
            msgDiv.innerHTML = '<span class="text-success fw-bold">✓ Disponible</span>';
        } else {
            msgDiv.innerHTML = '<span class="text-danger fw-bold">✗ Complet</span>';
        }

    } catch (error) {
        console.error('Erreur:', error);
        msgDiv.innerHTML = '<span class="text-warning">Erreur de vérification</span>';
    }
}

async function handleReservation() {
    const dateInput = document.getElementById("DateInput");
    const timeSelect = document.getElementById("selectHour");
    const guestInput = document.getElementById("NbConvivesInput");
    const allergyInput = document.getElementById("AllergieInput");

    const date = dateInput?.value;
    const time = timeSelect?.value;
    const guests = parseInt(guestInput?.value || "0");
    const allergy = allergyInput?.value || null;

    if (!date || !time || guests < 1) {
        showMessage("Veuillez remplir tous les champs obligatoires", "danger");
        return;
    }

    const datetime = `${date}T${time}:00`;

    const body = {
        datetime: datetime,
        guestNumber: guests,
        allergy: allergy
    };

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/reservations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-AUTH-TOKEN": token
            },
            body: JSON.stringify(body)
        });

        if (response.status === 409) {
            showMessage("Désolé, ce créneau est complet", "danger");
            return;
        }

        if (!response.ok) {
            throw new Error("Erreur lors de la réservation");
        }

        showMessage("Réservation confirmée!", "success");
        
        setTimeout(() => {
            window.location.href = "/QuaiAntique/QuaiAntiqueFrontend/allResa";
        }, 1500);

    } catch (error) {
        console.error('Erreur:', error);
        showMessage("Erreur: " + error.message, "danger");
    }
}

function showMessage(text, type) {
    const msgDiv = document.getElementById("availabilityMsg");
    if (!msgDiv) return;

    const alertClass = type === "success" ? "alert-success" : 
                       type === "warning" ? "alert-warning" : "alert-danger";

    msgDiv.innerHTML = `<div class="alert ${alertClass}">${window.escapeHtml(text)}</div>`;

    setTimeout(() => {
        msgDiv.innerHTML = "";
    }, 5000);
}

async function loadAllReservations() {
    const container = document.getElementById("myReservations");
    if (!container) return;

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/reservations`, {
            headers: { "X-AUTH-TOKEN": token }
        });

        if (!response.ok) throw new Error("Fehler beim Laden");

        const reservations = await response.json();

        if (reservations.length === 0) {
            container.innerHTML = '<p class="text-muted">Aucune réservation trouvée</p>';
            return;
        }

        let html = '<div class="row g-3">';
        
        reservations.forEach(resa => {
            const date = new Date(resa.orderDateTime);
            const dateStr = date.toLocaleDateString("fr-FR");
            const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

            html += `
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Réservation #${window.escapeHtml(resa.id)}</h5>
                            <p class="mb-1"><strong>Date:</strong> ${window.escapeHtml(dateStr)}</p>
                            <p class="mb-1"><strong>Heure:</strong> ${window.escapeHtml(timeStr)}</p>
                            <p class="mb-1"><strong>Convives:</strong> ${window.escapeHtml(resa.guestNumber)}</p>
                            ${resa.allergy ? `<p class="mb-1"><strong>Allergies:</strong> ${window.escapeHtml(resa.allergy)}</p>` : ''}
                            <button class="btn btn-danger btn-sm mt-2" onclick="deleteReservation(${window.escapeHtml(resa.id)})">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

    } catch (error) {
        console.error('Erreur:', error);
        container.innerHTML = '<p class="text-danger">Erreur de chargement</p>';
    }
}

async function deleteReservation(id) {
    if (!confirm("Voulez-vous vraiment annuler cette réservation?")) return;

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/reservations/${id}`, {
            method: "DELETE",
            headers: { "X-AUTH-TOKEN": token }
        });

        if (!response.ok) throw new Error("Erreur de suppression");

        showMessage("Réservation annulée", "success");
        loadAllReservations();

    } catch (error) {
        console.error('Erreur:', error);
        showMessage("Erreur: " + error.message, "danger");
    }
}

window.deleteReservation = deleteReservation;

if (window.location.pathname === "/QuaiAntique/QuaiAntiqueFrontend/reserver") {
    init();
} else if (window.location.pathname === "/QuaiAntique/QuaiAntiqueFrontend/allResa") {
    loadAllReservations();
}