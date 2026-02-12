const apiBaseUrl = 'http://localhost:8000/api';
let deleteModalInstance;
let currentDeleteId = null;
let allPictures = [];

deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteModal'));

loadPictures();
loadMenus();

document.getElementById('menuForm').addEventListener('submit', handleFormSubmit);
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
            allPictures = await response.json();
            displayPictureSelect();
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function displayPictureSelect() {
    const select = document.getElementById('menuPicture');
    select.innerHTML = '<option value="">Aucune photo</option>';

    allPictures.forEach(picture => {
        const option = document.createElement('option');
        option.value = window.escapeHtml(picture.id);
        option.textContent = window.escapeHtml(picture.title);
        select.appendChild(option);
    });
}


async function loadMenus() {
    try {
        const response = await fetch(`${apiBaseUrl}/menus`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': window.getToken()
            }
        });

        if (response.ok) {
            const menus = await response.json();
            displayMenus(menus);
        } else {
            console.error('Erreur:', error);
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}


function displayMenus(menus) {
    const tbody = document.getElementById('menusTableBody');
    tbody.innerHTML = '';

    if (menus.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Aucun menu trouvé</td></tr>';
        return;
    }

    menus.forEach(menu => {
        const tr = document.createElement('tr');
        
        const priceInEuros = (menu.price / 100).toFixed(2);
        
        tr.innerHTML = `
            <td>${window.escapeHtml(menu.id)}</td>
            <td>${window.escapeHtml(menu.title)}</td>
            <td>${window.escapeHtml(menu.description)}</td>
            <td>${window.escapeHtml(priceInEuros)}€</td>
            <td>${window.escapeHtml(menu.createdAt || '-')}</td>
            <td>${window.escapeHtml(menu.updatedAt || '-')}</td>
            <td data-show="employe,admin">
                <button class="btn btn-sm btn-warning me-1" onclick="editMenu(${window.escapeHtml(menu.id)})">
                    <i class="bi bi-pencil"></i> Modifier
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteMenu(${window.escapeHtml(menu.id)})">
                    <i class="bi bi-trash"></i> Supprimer
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });

    window.showAndHideElementsForRoles();
}


async function handleFormSubmit(e) {
    e.preventDefault();
    
    const menuId = document.getElementById('menuId').value;
    const title = document.getElementById('menuTitle').value.trim();
    const description = document.getElementById('menuDescription').value.trim();
    const price = parseInt(document.getElementById('menuPrice').value);
    const pictureId = document.getElementById('menuPicture').value;

    if (!title || !description || isNaN(price) || price < 0) {
        alert('Veuillez remplir tous les champs correctement');
        return;
    }

    const menuData = {
        title,
        description,
        price,
        pictureId: pictureId || null
    };

    try {
        const url = menuId ? `${apiBaseUrl}/menus/${menuId}` : `${apiBaseUrl}/menus`;
        const method = menuId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': window.getToken()
            },
            body: JSON.stringify(menuData)
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            resetForm();
            await loadMenus();
        } else {
            const error = await response.json();
            alert(error.error || 'Une erreur est survenue');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la communication avec le serveur');
    }
}


async function editMenu(id) {
    try {
        const response = await fetch(`${apiBaseUrl}/menus/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': window.getToken()
            }
        });

        if (response.ok) {
            const menu = await response.json();
            
            document.getElementById('menuId').value = menu.id;
            document.getElementById('menuTitle').value = menu.title;
            document.getElementById('menuDescription').value = menu.description;
            document.getElementById('menuPrice').value = menu.price;
            document.getElementById('menuPicture').value = menu.picture ? menu.picture.id : '';
            
            document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle"></i> Modifier';
            document.getElementById('cancelBtn').style.display = 'inline-block';
            
            document.getElementById('menuTitle').scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            alert('Erreur lors du chargement du menu');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement du menu');
    }
}


function deleteMenu(id) {
    currentDeleteId = id;
    deleteModalInstance.show();
}


async function confirmDelete() {
    if (!currentDeleteId) return;

    try {
        const response = await fetch(`${apiBaseUrl}/menus/${currentDeleteId}`, {
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
            await loadMenus();
        } else {
            const error = await response.json();
            alert(error.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression du menu');
    }
}


function resetForm() {
    document.getElementById('menuForm').reset();
    document.getElementById('menuId').value = '';
    document.getElementById('menuPicture').value = '';
    document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle"></i> Ajouter';
    document.getElementById('cancelBtn').style.display = 'none';
}
