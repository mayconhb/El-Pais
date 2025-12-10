document.addEventListener('DOMContentLoaded', function() {
    const likeBtn = document.getElementById('likeBtn');

    let likesCount = 12700;
    let userLiked = false;

    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    likeBtn.addEventListener('click', function() {
        likeBtn.classList.toggle('active');
        userLiked = !userLiked;
        
        const reactionsNumber = document.querySelector('.reactions-number');
        
        if (userLiked) {
            likesCount += 1;
        } else {
            likesCount -= 1;
        }
        
        reactionsNumber.textContent = formatNumber(likesCount);
    });

    function showPopup(message) {
        let popup = document.querySelector('.custom-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.className = 'custom-popup';
            popup.innerHTML = `
                <div class="popup-overlay"></div>
                <div class="popup-content">
                    <p class="popup-message"></p>
                    <button class="popup-close-btn">OK</button>
                </div>
            `;
            document.body.appendChild(popup);
            
            const closeBtn = popup.querySelector('.popup-close-btn');
            const overlay = popup.querySelector('.popup-overlay');
            
            closeBtn.addEventListener('click', function() {
                popup.classList.remove('show');
            });
            
            overlay.addEventListener('click', function() {
                popup.classList.remove('show');
            });
        }
        
        const messageElement = popup.querySelector('.popup-message');
        messageElement.textContent = message;
        popup.classList.add('show');
    }

    const shareBtn = document.getElementById('shareBtn');
    shareBtn.addEventListener('click', function() {
        showPopup('Necesitas terminar de ver el video antes de compartir.');
    });

    const commentBtn = document.getElementById('commentBtn');
    commentBtn.addEventListener('click', function() {
        showPopup('Necesitas terminar de ver el video antes de comentar.');
    });

    const commentActions = document.querySelectorAll('.comment-action');
    commentActions.forEach(action => {
        if (action.textContent === 'Me gusta') {
            action.addEventListener('click', function() {
                action.style.color = action.style.color === 'rgb(24, 119, 242)' ? '' : '#1877f2';
                action.style.fontWeight = action.style.fontWeight === '700' ? '600' : '700';
            });
        }
        if (action.textContent === 'Responder') {
            action.addEventListener('click', function() {
                showPopup('Necesitas terminar de ver el video antes de responder.');
            });
        }
    });

    const authorName = document.querySelector('.author-name');
    if (authorName) {
        authorName.addEventListener('click', function() {
            showPopup('Necesitas terminar de ver el video antes de visitar el perfil.');
        });
    }

    const authorAvatar = document.querySelector('.author-avatar-img');
    if (authorAvatar) {
        authorAvatar.addEventListener('click', function() {
            showPopup('Necesitas terminar de ver el video antes de visitar el perfil.');
        });
    }

    const commentAvatars = document.querySelectorAll('.comment-avatar');
    commentAvatars.forEach(avatar => {
        avatar.addEventListener('click', function() {
            showPopup('Necesitas terminar de ver el video antes de visitar el perfil.');
        });
    });

    const commentAuthors = document.querySelectorAll('.comment-author');
    commentAuthors.forEach(author => {
        author.addEventListener('click', function() {
            showPopup('Necesitas terminar de ver el video antes de visitar el perfil.');
        });
    });
});
