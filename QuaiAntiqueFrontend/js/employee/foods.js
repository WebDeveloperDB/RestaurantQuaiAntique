const apiBaseUrl = 'https://ton-backend.up.railway.app/api';
let deleteModalInstance;
let currentDeleteId = null;
let allCategories = [];
let allPictures = [];


deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteModal'));

loadCategories();
loadPictures();
loadFoods();

document.getElementById('foodForm').addEventListener('submit', handleFormSubmit);
document.getElementById('cancelBtn').addEventListener('click', resetForm);
document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

async function loadCategories() {
    try {
        const response = await fetch(`${apiBaseUrl}/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': window.getToken()
            }
        });

        if (response.ok) {
            allCategories = await response.json();
            displayCategoriesCheckboxes();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
    }
}

function displayCategoriesCheckboxes() {
    const container = document.getElementById('categoriesCheckboxes');
    container.innerHTML = '';

    if (allCategories.length === 0) {
        container.innerHTML = '<p class="text-muted mb-0">Aucune catégorie disponible</p>';
        return;
    }

    allCategories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'form-check';
        div.innerHTML = `
            <input class="form-check-input category-checkbox" type="checkbox" value="${window.escapeHtml(category.id)}" id="cat${window.escapeHtml(category.id)}">
            <label class="form-check-label" for="cat${window.escapeHtml(category.id)}">
                ${window.escapeHtml(category.title)}
            </label>
        `;
        container.appendChild(div);
    });
}

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
        console.error('Erreur lors du chargement des photos:', error);
    }
}

function displayPictureSelect() {
    const select = document.getElementById('foodPicture');
    select.innerHTML = '<option value="">Aucune photo</option>';

    allPictures.forEach(picture => {
        const option = document.createElement('option');
        option.value = window.escapeHtml(picture.id);
        option.textContent = window.escapeHtml(picture.title);
        select.appendChild(option);
    });
}

async function loadFoods() {
    try {
        const response = await fetch(`${apiBaseUrl}/foods`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': window.getToken()
            }
        });

        if (response.ok) {
            const foods = await response.json();
            displayFoods(foods);
        } else {
            console.error('Erreur lors du chargement des plats');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function displayFoods(foods) {
    const tbody = document.getElementById('foodsTableBody');
    tbody.innerHTML = '';

    if (foods.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Aucun plat trouvé</td></tr>';
        return;
    }

    foods.forEach(food => {
        const tr = document.createElement('tr');
        
        const priceInEuros = (food.price / 100).toFixed(2);
        const categoriesText = food.categories.map(cat => cat.title).join(', ') || '-';
        
        tr.innerHTML = `
            <td>${window.escapeHtml(food.id)}</td>
            <td>${window.escapeHtml(food.title)}</td>
            <td>${window.escapeHtml(food.description)}</td>
            <td>${window.escapeHtml(priceInEuros)}€</td>
            <td>${window.escapeHtml(categoriesText)}</td>
            <td>${window.escapeHtml(food.createdAt || '-')}</td>
            <td>${window.escapeHtml(food.updatedAt || '-')}</td>
            <td data-show="employe,admin">
                <button class="btn btn-sm btn-warning me-1" onclick="editFood(${window.escapeHtml(food.id)})">
                    <i class="bi bi-pencil"></i> Modifier
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteFood(${window.escapeHtml(food.id)})">
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
    
    const foodId = document.getElementById('foodId').value;
    const title = document.getElementById('foodTitle').value.trim();
    const description = document.getElementById('foodDescription').value.trim();
    const price = parseInt(document.getElementById('foodPrice').value);
    
    const categoryIds = Array.from(document.querySelectorAll('.category-checkbox:checked'))
        .map(checkbox => parseInt(checkbox.value));

    const pictureId = document.getElementById('foodPicture').value;

    if (!title || !description || isNaN(price) || price < 0) {
        alert('Veuillez remplir tous les champs correctement');
        return;
    }

    const foodData = {
        title,
        description,
        price,
        categoryIds,
        pictureId: pictureId || null
    };

    try {
        const url = foodId ? `${apiBaseUrl}/foods/${foodId}` : `${apiBaseUrl}/foods`;
        const method = foodId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': window.getToken()
            },
            body: JSON.stringify(foodData)
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            resetForm();
            await loadFoods();
        } else {
            const error = await response.json();
            alert(error.error || 'Une erreur est survenue');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la communication avec le serveur');
    }
}

async function editFood(id) {
    try {
        const response = await fetch(`${apiBaseUrl}/foods/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': window.getToken()
            }
        });

        if (response.ok) {
            const food = await response.json();
            
            document.getElementById('foodId').value = food.id;
            document.getElementById('foodTitle').value = food.title;
            document.getElementById('foodDescription').value = food.description;
            document.getElementById('foodPrice').value = food.price;
            
            document.querySelectorAll('.category-checkbox').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            food.categories.forEach(category => {
                const checkbox = document.getElementById(`cat${category.id}`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
            
            document.getElementById('foodPicture').value = food.picture ? food.picture.id : '';
            
            document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle"></i> Modifier';
            document.getElementById('cancelBtn').style.display = 'inline-block';
            
            document.getElementById('foodTitle').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function deleteFood(id) {
    currentDeleteId = id;
    deleteModalInstance.show();
}

async function confirmDelete() {
    if (!currentDeleteId) return;

    try {
        const response = await fetch(`${apiBaseUrl}/foods/${currentDeleteId}`, {
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
            await loadFoods();
        } else {
            alert('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la communication avec le serveur');
    }

    currentDeleteId = null;
}

function resetForm() {
    document.getElementById('foodForm').reset();
    document.getElementById('foodId').value = '';
    document.getElementById('foodPicture').value = '';
    document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle"></i> Ajouter';
    document.getElementById('cancelBtn').style.display = 'none';
    
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
}

window.editFood = editFood;
window.deleteFood = deleteFood;
