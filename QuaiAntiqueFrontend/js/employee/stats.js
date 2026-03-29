const apiUrl = 'https://restaurantquaiantique-production.up.railway.app/api';

async function loadStats() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${apiUrl}/stats/dashboard`, {
            headers: {
                'X-AUTH-TOKEN': token,
            }
        });

        if (!response.ok) {
            return;
        }

        const stats = await response.json();
        displayStats(stats);
    } catch (error) {
        console.error('Erreur:', error);
        return;
    }
}

function displayStats(stats) {
    document.getElementById('totalFoodViews').textContent = window.escapeHtml(stats.totalFoodViews.toLocaleString('fr-FR'));
    document.getElementById('totalMenuViews').textContent = window.escapeHtml(stats.totalMenuViews.toLocaleString('fr-FR'));
    
    displayTopFoods(stats.topFoods);
    displayTopMenus(stats.topMenus);
}

function displayTopFoods(foods) {
    const tbody = document.getElementById('topFoodsTableBody');
    
    if (foods.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Aucune donnée disponible</td></tr>';
        return;
    }

    tbody.innerHTML = foods.map((food, index) => {
        const barWidth = foods[0].views > 0 ? (food.views / foods[0].views) * 100 : 0;
        
        return `
            <tr>
                <td><strong>${window.escapeHtml(index + 1)}</strong></td>
                <td>${window.escapeHtml(food.name)}</td>
                <td><span class="badge bg-primary">${window.escapeHtml(food.views)}</span></td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-primary" role="progressbar" 
                             style="width: ${window.escapeHtml(barWidth)}%;" 
                             aria-valuenow="${window.escapeHtml(food.views)}" 
                             aria-valuemin="0" 
                             aria-valuemax="${window.escapeHtml(foods[0].views)}">
                            ${window.escapeHtml(barWidth.toFixed(0))}%
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function displayTopMenus(menus) {
    const tbody = document.getElementById('topMenusTableBody');
    
    if (menus.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Aucune donnée disponible</td></tr>';
        return;
    }

    tbody.innerHTML = menus.map((menu, index) => {
        const barWidth = menus[0].views > 0 ? (menu.views / menus[0].views) * 100 : 0;
        
        return `
            <tr>
                <td><strong>${window.escapeHtml(index + 1)}</strong></td>
                <td>${window.escapeHtml(menu.name)}</td>
                <td><span class="badge bg-success">${window.escapeHtml(menu.views)}</span></td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-success" role="progressbar" 
                             style="width: ${window.escapeHtml(barWidth)}%;" 
                             aria-valuenow="${window.escapeHtml(menu.views)}" 
                             aria-valuemin="0" 
                             aria-valuemax="${window.escapeHtml(menus[0].views)}">
                            ${window.escapeHtml(barWidth.toFixed(0))}%
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function createFoodsChart(foods) {
    if (typeof Chart === 'undefined') {
        return;
    }
    
    const ctx = document.getElementById('foodsChart').getContext('2d');
(function initStats() {
    setTimeout(function() {
        loadStats();
    }, 100);
})();

window.loadStats = loadStats}
