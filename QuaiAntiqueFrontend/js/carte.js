const apiBaseUrl = 'https://ton-backend.up.railway.app/api';

loadMenus();
loadFoods();

async function loadMenus() {
    try {
        const response = await fetch(`${apiBaseUrl}/menus`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const menus = await response.json();
            displayMenus(menus);
        } else {
            document.getElementById('noMenusMessage').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('noMenusMessage').style.display = 'block';
    }
}

function displayMenus(menus) {
    const container = document.getElementById('menusContainer');
    const noMessage = document.getElementById('noMenusMessage');
    
    container.innerHTML = '';
    
    if (menus.length === 0) {
        noMessage.style.display = 'block';
        return;
    }
    
    noMessage.style.display = 'none';
    
    menus.forEach(menu => {
        const priceInEuros = (menu.price / 100).toFixed(2);
        
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        let imageHtml = '';
        if (menu.picture) {
            const imageUrl = `https://ton-backend.up.railway.app${window.escapeHtml(menu.picture.url)}`;
            imageHtml = `<img src="${imageUrl}" class="card-img-top" alt="${window.escapeHtml(menu.title)}" style="height: 200px; object-fit: cover;">`;
        }
        
        col.innerHTML = `
            <div class="card h-100 shadow-sm hover-card" onclick="trackMenuView(${window.escapeHtml(menu.id)})" style="cursor: pointer;">
                ${imageHtml}
                <div class="card-body">
                    <h5 class="card-title text-primary">${window.escapeHtml(menu.title)}</h5>
                    <p class="card-text" style="white-space: pre-line;">${window.escapeHtml(menu.description)}</p>
                </div>
                <div class="card-footer bg-white border-0">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="h4 mb-0 text-success">${window.escapeHtml(priceInEuros)} €</span>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });
}

async function loadFoods() {
    try {
        const response = await fetch(`${apiBaseUrl}/foods`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const foods = await response.json();
            displayFoodsByCategory(foods);
        } else {
            document.getElementById('noFoodsMessage').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('noFoodsMessage').style.display = 'block';
    }
}

function displayFoodsByCategory(foods) {
    const container = document.getElementById('foodsContainer');
    const noMessage = document.getElementById('noFoodsMessage');
    
    container.innerHTML = '';
    
    if (foods.length === 0) {
        noMessage.style.display = 'block';
        return;
    }
    
    noMessage.style.display = 'none';
    
    const foodsByCategory = {};
    
    foods.forEach(food => {
        if (food.categories && food.categories.length > 0) {
            food.categories.forEach(category => {
                if (!foodsByCategory[category.title]) {
                    foodsByCategory[category.title] = [];
                }
                if (!foodsByCategory[category.title].find(f => f.id === food.id)) {
                    foodsByCategory[category.title].push(food);
                }
            });
        } else {
            if (!foodsByCategory['Autres']) {
                foodsByCategory['Autres'] = [];
            }
            foodsByCategory['Autres'].push(food);
        }
    });
    
    Object.keys(foodsByCategory).sort().forEach(categoryName => {
        const categorySection = document.createElement('div');
        categorySection.className = 'mb-5';
        
        categorySection.innerHTML = `
            <h3 class="mb-3 pb-2 border-bottom">${window.escapeHtml(categoryName)}</h3>
            <div class="row" id="category-${window.escapeHtml(categoryName)}"></div>
        `;
        
        container.appendChild(categorySection);
        
        const categoryRow = categorySection.querySelector(`#category-${categoryName}`);
        
        foodsByCategory[categoryName].forEach(food => {
            const priceInEuros = (food.price / 100).toFixed(2);
            
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 mb-4';
            
            let imageHtml = '';
            if (food.picture) {
                const imageUrl = `https://ton-backend.up.railway.app${window.escapeHtml(food.picture.url)}`;
                imageHtml = `<img src="${imageUrl}" class="card-img-top" alt="${window.escapeHtml(food.title)}" style="height: 200px; object-fit: cover;">`;
            }
            
            col.innerHTML = `
                <div class="card h-100 shadow-sm hover-card" onclick="trackFoodView(${window.escapeHtml(food.id)})" style="cursor: pointer;">
                    ${imageHtml}
                    <div class="card-body">
                        <h5 class="card-title">${window.escapeHtml(food.title)}</h5>
                        <p class="card-text text-muted">${window.escapeHtml(food.description)}</p>
                    </div>
                    <div class="card-footer bg-white border-0">
                        <span class="h5 mb-0 text-success">${window.escapeHtml(priceInEuros)} €</span>
                    </div>
                </div>
            `;
            
            categoryRow.appendChild(col);
        });
    });
    
    window.showAndHideElementsForRoles();
}

async function trackMenuView(menuId) {
    try {
        const response = await fetch(`${apiBaseUrl}/stats/menu/${menuId}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
        } else {
        }
    } catch (error) {
    }
}

async function trackFoodView(foodId) {
    try {
        const response = await fetch(`${apiBaseUrl}/stats/food/${foodId}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
        } else {
        }
    } catch (error) {
    }
}

window.trackMenuView = trackMenuView;
window.trackFoodView = trackFoodView;
