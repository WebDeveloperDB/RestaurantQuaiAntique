const API_URL = 'http://localhost:8000/api/categories';

let deleteModal;

let categoryToDelete = null;

(function initCategories() {
    setTimeout(function() {
        const modalElement = document.getElementById('deleteModal');
        if (modalElement && typeof bootstrap !== 'undefined') {
            deleteModal = new bootstrap.Modal(modalElement);
        }
        
        loadCategories();
        
        const form = document.getElementById('categoryForm');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', resetForm);
        }
        
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', confirmDelete);
        }
        
        if (typeof showAndHideElementsForRoles === 'function') {
            showAndHideElementsForRoles();
        }
    }, 100);
})();

async function loadCategories() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const categoriesList = document.getElementById('categoriesList');
    
    loadingSpinner.style.display = 'block';
    errorMessage.style.display = 'none';
    categoriesList.style.display = 'none';
    
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des catégories');
        }
        
        const categories = await response.json();
        
        loadingSpinner.style.display = 'none';
        categoriesList.style.display = 'block';
        
        displayCategories(categories);
        
    } catch (error) {
        console.error('Erreur:', error);
        loadingSpinner.style.display = 'none';
        errorMessage.textContent = 'Impossible de charger les catégories. Veuillez réessayer.';
        errorMessage.style.display = 'block';
    }
}

function displayCategories(categories) {
    const tableBody = document.getElementById('categoriesTableBody');
    const emptyState = document.getElementById('emptyState');
    
    tableBody.innerHTML = '';
    
    if (categories.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    categories.forEach(category => {
        const row = document.createElement('tr');
        
        const createdAt = category.createdAt 
            ? new Date(category.createdAt).toLocaleDateString('fr-FR') 
            : '-';
            
        const updatedAt = category.updatedAt 
            ? new Date(category.updatedAt).toLocaleDateString('fr-FR') 
            : '-';
        
        const titleSafe = typeof sanitizeHtml !== 'undefined' 
            ? sanitizeHtml(category.title)
            : escapeHtml(category.title);
        
        row.innerHTML = `
            <td>${category.id}</td>
            <td><strong>${titleSafe}</strong></td>
            <td>${createdAt}</td>
            <td>${updatedAt}</td>
            <td data-show="employe,admin">
                <button class="btn btn-sm btn-primary" onclick="editCategory(${category.id}, '${escapeHtml(category.title)}')">
                    <i class="bi bi-pencil"></i> Modifier
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id}, '${escapeHtml(category.title)}')">
                    <i class="bi bi-trash"></i> Supprimer
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    if (typeof showAndHideElementsForRoles === 'function') {
        showAndHideElementsForRoles();
    }
}
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('categoryId').value;
    const title = document.getElementById('categoryTitle').value.trim();
    
    if (!title) {
        alert('Le titre de la catégorie est requis');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enregistrement...';
    
    try {
        const method = categoryId ? 'PUT' : 'POST';
        const url = categoryId ? `${API_URL}/${categoryId}` : API_URL;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = typeof getToken !== 'undefined' ? getToken() : null;
        if (token) {
            headers['X-AUTH-TOKEN'] = token;
        }
        
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: JSON.stringify({ title })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de l\'enregistrement');
        }
        
        alert(data.message || 'Catégorie enregistrée avec succès');
        
        resetForm();
        loadCategories();
        
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Une erreur est survenue');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Enregistrer';
    }
}

function editCategory(id, title) {
    document.getElementById('categoryId').value = id;
    document.getElementById('categoryTitle').value = title;
    document.getElementById('formTitle').textContent = 'Modifier la catégorie';
    document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle"></i> Mettre à jour';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    document.getElementById('categoryForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteCategory(id, title) {
    categoryToDelete = id;
    document.getElementById('deleteCategoryName').textContent = title;
    if (deleteModal) {
        deleteModal.show();
    }
}

async function confirmDelete() {
    if (!categoryToDelete) return;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Suppression...';
    
    try {
        const token = typeof getToken !== 'undefined' ? getToken() : null;
        if (!token) {
            throw new Error('Vous devez être connecté pour supprimer une catégorie');
        }
        
        const response = await fetch(`${API_URL}/${categoryToDelete}`, {
            method: 'DELETE',
            headers: {
                'X-AUTH-TOKEN': token
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de la suppression');
        }
        
        if (deleteModal) {
            deleteModal.hide();
        }
        
        alert(data.message || 'Catégorie supprimée avec succès');
        
        loadCategories();
        
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Une erreur est survenue lors de la suppression');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Supprimer';
        categoryToDelete = null;
    }
}

function resetForm() {
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryTitle').value = '';
    document.getElementById('formTitle').textContent = 'Ajouter une catégorie';
    document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle"></i> Enregistrer';
    document.getElementById('cancelBtn').style.display = 'none';
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
