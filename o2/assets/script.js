document.addEventListener('DOMContentLoaded', function() {
    // O vídeo agora é gerenciado pelo Vturb player
    const likeBtn = document.getElementById('likeBtn');
    const offersSection = document.querySelector('.offers-section');
    let pitchButtonDetected = false;

    // Garantir que a seção de ofertas comece sempre oculta
    if (offersSection) {
        offersSection.classList.remove('visible');
    }

    // Countdown Timer - 15 minutos
    let countdownTime = 15 * 60; // 15 minutos em segundos
    let countdownInterval;

    function updateCountdown() {
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (!minutesElement || !secondsElement) return;

        const minutes = Math.floor(countdownTime / 60);
        const seconds = countdownTime % 60;

        minutesElement.textContent = String(minutes).padStart(2, '0');
        secondsElement.textContent = String(seconds).padStart(2, '0');

        if (countdownTime > 0) {
            countdownTime--;
        } else {
            clearInterval(countdownInterval);
        }
    }

    function startCountdown() {
        if (countdownInterval) clearInterval(countdownInterval);
        countdownTime = 15 * 60;
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    // Função para verificar se um elemento está realmente visível na tela
    function isElementVisible(element) {
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        // Verifica se o elemento está visível:
        // - display não é 'none'
        // - visibility não é 'hidden'
        // - opacity não é 0
        // - tem dimensões (width e height > 0)
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               parseFloat(style.opacity) > 0 &&
               rect.width > 0 &&
               rect.height > 0;
    }

    // Função para verificar se o botão "pitch" do vturb apareceu E está visível
    function checkForPitchButton() {
        // Procura por botões que contenham o texto "pitch" (case insensitive)
        const allButtons = document.querySelectorAll('button, a, div[role="button"]');
        
        for (let button of allButtons) {
            const buttonText = button.textContent.toLowerCase().trim();
            // Verifica se contém "pitch" E se está realmente visível na tela
            if (buttonText.includes('pitch') && !pitchButtonDetected && isElementVisible(button)) {
                pitchButtonDetected = true;
                console.log('Botão pitch detectado e VISÍVEL! Mostrando ofertas...');
                showOffers();
                return true;
            }
        }
        return false;
    }

    // Função para mostrar a seção de ofertas
    function showOffers() {
        if (offersSection) {
            offersSection.classList.add('visible');
            // Inicia o contador regressivo quando as ofertas aparecerem
            startCountdown();
        }
    }

    // Função para ocultar a seção de ofertas
    function hideOffers() {
        if (offersSection) {
            offersSection.classList.remove('visible');
        }
    }

    // Verificar periodicamente se o botão pitch apareceu
    const pitchCheckInterval = setInterval(function() {
        if (checkForPitchButton()) {
            clearInterval(pitchCheckInterval); // Para de verificar após encontrar
        }
    }, 500); // Verifica a cada 500ms

    // Observador de mutações no DOM para detectar mudanças no vturb player
    const observer = new MutationObserver(function(mutations) {
        if (!pitchButtonDetected) {
            checkForPitchButton();
        }
    });

    // Observa mudanças no body e seus filhos
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });

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
        showPopup('You need to finish watching the video before sharing.');
    });

    const commentBtn = document.getElementById('commentBtn');
    commentBtn.addEventListener('click', function() {
        showPopup('You need to finish watching the video before commenting.');
    });

    const commentActions = document.querySelectorAll('.comment-action');
    commentActions.forEach(action => {
        if (action.textContent === 'Like') {
            action.addEventListener('click', function() {
                action.style.color = action.style.color === 'rgb(24, 119, 242)' ? '' : '#1877f2';
                action.style.fontWeight = action.style.fontWeight === '700' ? '600' : '700';
            });
        }
        if (action.textContent === 'Reply') {
            action.addEventListener('click', function() {
                showPopup('You need to finish watching the video before replying.');
            });
        }
    });

    const authorName = document.querySelector('.author-name');
    if (authorName) {
        authorName.addEventListener('click', function() {
            showPopup('You need to finish watching the video before visiting the profile.');
        });
    }

    const authorAvatar = document.querySelector('.author-avatar-img');
    if (authorAvatar) {
        authorAvatar.addEventListener('click', function() {
            showPopup('You need to finish watching the video before visiting the profile.');
        });
    }

    const commentAvatars = document.querySelectorAll('.comment-avatar');
    commentAvatars.forEach(avatar => {
        avatar.addEventListener('click', function() {
            showPopup('You need to finish watching the video before visiting the profile.');
        });
    });

    const commentAuthors = document.querySelectorAll('.comment-author');
    commentAuthors.forEach(author => {
        author.addEventListener('click', function() {
            showPopup('You need to finish watching the video before visiting the profile.');
        });
    });
});
