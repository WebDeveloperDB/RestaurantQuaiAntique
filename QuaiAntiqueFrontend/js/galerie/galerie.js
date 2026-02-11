const apiBaseUrl = 'http://localhost:8000/api';

loadPictures();


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
    const gallery = document.getElementById('allImages');
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
        
        const imageUrl = `http://localhost:8000${picture.url}`;
        
        col.innerHTML = `
            <div class="image-card">
                <img src="${imageUrl}" class="img-fluid rounded shadow" alt="${window.sanitizeHtml(picture.title)}" 
                     title="${window.sanitizeHtml(picture.title)}" 
                     style="width: 100%; height: 250px; object-fit: cover; cursor: pointer;">
                <div class="text-center mt-2">
                    <p class="text-muted mb-0">${window.sanitizeHtml(picture.title)}</p>
                </div>
            </div>
        `;
        
        gallery.appendChild(col);
    });
    
    window.showAndHideElementsForRoles();
}
