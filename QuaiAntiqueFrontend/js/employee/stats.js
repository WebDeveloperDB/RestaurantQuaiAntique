const apiUrl = 'http://localhost:8000/api';

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
    document.getElementById('totalFoodViews').textContent = stats.totalFoodViews.toLocaleString('fr-FR');
    document.getElementById('totalMenuViews').textContent = stats.totalMenuViews.toLocaleString('fr-FR');
    
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
                <td><strong>${index + 1}</strong></td>
                <td>${window.sanitizeHtml(food.name)}</td>
                <td><span class="badge bg-primary">${food.views}</span></td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-primary" role="progressbar" 
                             style="width: ${barWidth}%;" 
                             aria-valuenow="${food.views}" 
                             aria-valuemin="0" 
                             aria-valuemax="${foods[0].views}">
                            ${barWidth.toFixed(0)}%
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
                <td><strong>${index + 1}</strong></td>
                <td>${window.sanitizeHtml(menu.name)}</td>
                <td><span class="badge bg-success">${menu.views}</span></td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-success" role="progressbar" 
                             style="width: ${barWidth}%;" 
                             aria-valuenow="${menu.views}" 
                             aria-valuemin="0" 
                             aria-valuemax="${menus[0].views}">
                            ${barWidth.toFixed(0)}%
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