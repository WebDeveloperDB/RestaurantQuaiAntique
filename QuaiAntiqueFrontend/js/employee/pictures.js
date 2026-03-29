const apiBaseUrl = 'https://restaurantquaiantique-production.up.railway.app/api';
let deleteModalInstance;
let currentDeleteId = null;

deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteModal'));

loadPictures();

document.getElementById('pictureForm').addEventListener('submit', handleFormSubmit);
document.getElementById('cancelBtn').addEventListener('click', resetForm);
document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

async function loadPictures() {
    try {
        const response = await fetch(`${apiBaseUrl}/pictures`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const pictures = await response.json();
            displayPictures(pictures);
        } else {
            document.getElementById('noPicturesMessage').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('noPicturesMessage').style.display = 'block';
    }
}

function displayPictures(pictures) {
    const gallery = document.getElementById('picturesGallery');
    const noMessage = document.getElementById('noPicturesMessage');
    
    gallery.innerHTML = '';
    
    if (pictures.length === 0) {
        noMessage.style.display = 'block';
        return;
    }
    
    noMessage.style.display = 'none';
    
    pictures.forEach(picture => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-lg-3 mb-4';
        
        const imageUrl = `https://restaurantquaiantique-production.up.railway.app${window.escapeHtml(picture.url)}`;
        
        col.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${imageUrl}" class="card-img-top" alt="${window.escapeHtml(picture.title)}" 
                     style="height: 200px; object-fit: cover;" title="${window.escapeHtml(picture.title)}">
                <div class="card-body">
                    <h6 class="card-title">${window.escapeHtml(picture.title)}</h6>
                    <small class="text-muted">Ajoutée le ${window.escapeHtml(picture.createdAt || '-')}</small>
                </div>
                <div class="card-footer bg-white border-0" data-show="employe,admin">
                    <button class="btn btn-sm btn-warning me-1" onclick="editPicture(${window.escapeHtml(picture.id)})">
                        <i class="bi bi-pencil"></i> Modifier
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePicture(${window.escapeHtml(picture.id)})">
                        <i class="bi bi-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
        
        gallery.appendChild(col);
    });

    window.showAndHideElementsForRoles();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const pictureId = document.getElementById('pictureId').value;
    const title = document.getElementById('pictureTitle').value.trim();
    const fileInput = document.getElementById('pictureFile');

    if (!title) {
        alert('Veuillez saisir un titre');
        return;
    }

    if (pictureId) {
        await updatePicture(pictureId, title);
    } else {
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Veuillez sélectionner une image');
            return;
        }

        const file = fileInput.files[0];
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, WEBP');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Fichier trop volumineux (max 5MB)');
            return;
        }

        await createPicture(title, file);
    }
}

async function createPicture(title, file) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
        const response = await fetch(`${apiBaseUrl}/pictures`, {
            method: 'POST',
            headers: {
                'X-AUTH-TOKEN': window.getToken()
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            resetForm();
            await loadPictures();
        } else {
            const error = await response.json();
            alert(error.error || 'Une erreur est survenue');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la communication avec le serveur');
    }
}

async function updatePicture(id, title) {
    try {
        const response = await fetch(`${apiBaseUrl}/pictures/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': window.getToken()
            },
            body: JSON.stringify({ title })
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            resetForm();
            await loadPictures();
        } else {
            const error = await response.json();
            alert(error.error || 'Une erreur est survenue');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la communication avec le serveur');
    }
}

async function editPicture(id) {
    try {
        const response = await fetch(`${apiBaseUrl}/pictures/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': window.getToken()
            }
        });

        if (response.ok) {
            const picture = await response.json();
            
            document.getElementById('pictureId').value = picture.id;
            document.getElementById('pictureTitle').value = picture.title;
            
            document.getElementById('fileInputContainer').style.display = 'none';
            document.getElementById('pictureFile').required = false;
            
            const currentImageContainer = document.getElementById('currentImageContainer');
            const currentImage = document.getElementById('currentImage');
            currentImage.src = `https://restaurantquaiantique-production.up.railway.app${picture.url}`;
            currentImage.alt = picture.title;
            currentImageContainer.style.display = 'block';
            
            document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle"></i> Modifier';
            document.getElementById('cancelBtn').style.display = 'inline-block';
            
            document.getElementById('pictureTitle').scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            alert('Erreur lors du chargement de la photo');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement de la photo');
    }
}

function deletePicture(id) {
    currentDeleteId = id;
    deleteModalInstance.show();
}

async function confirmDelete() {
    if (!currentDeleteId) return;

    try {
        const response = await fetch(`${apiBaseUrl}/pictures/${currentDeleteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': window.getToken()
            }
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            deleteModalInstance.hide();
            currentDeleteId = null;
            await loadPictures();
        } else {
            const error = await response.json();
            alert(error.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression de la photo');
    }
}

function resetForm() {
    document.getElementById('pictureForm').reset();
    document.getElementById('pictureId').value = '';
    document.getElementById('fileInputContainer').style.display = 'block';
    document.getElementById('pictureFile').required = true;
    document.getElementById('currentImageContainer').style.display = 'none';
    document.getElementById('submitBtn').innerHTML = '<i class="bi bi-upload"></i> Ajouter la photo';
    document.getElementById('cancelBtn').style.display = 'none';
}
