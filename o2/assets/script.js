document.addEventListener('DOMContentLoaded', function() {
    const likeBtn = document.getElementById('likeBtn');

    // Video tracking for step 0 button
    let videoIsPlaying = false;
    let videoLastTimestamp = 0;
    let videoAccumulatedSeconds = 0;
    let videoButtonShown = false;
    const VIDEO_CTA_THRESHOLD = 10; // Show button after 10 seconds

    function setupVideoTracking() {
        const playerElement = document.querySelector('wistia-player[media-id="3hf26lz4vm"]');
        const continueBtn = document.getElementById('videoContinueBtn');
        
        if (playerElement && continueBtn) {
            console.log('[Video Tracker O2] Wistia player found - binding events');
            
            playerElement.addEventListener('play', () => {
                videoIsPlaying = true;
                console.log('[Video Tracker O2] PLAY - tracking time. Accumulated:', videoAccumulatedSeconds.toFixed(1), 's');
            });
            
            playerElement.addEventListener('pause', () => {
                videoIsPlaying = false;
                console.log('[Video Tracker O2] PAUSE - Total watched:', videoAccumulatedSeconds.toFixed(1), 's');
            });
            
            playerElement.addEventListener('end', () => {
                videoIsPlaying = false;
                console.log('[Video Tracker O2] ENDED - Total watched:', videoAccumulatedSeconds.toFixed(1), 's');
            });
            
            playerElement.addEventListener('time-update', (event) => {
                const currentTime = event.detail?.currentTime ?? event.target?.currentTime ?? 0;
                
                if (videoIsPlaying && currentTime > videoLastTimestamp) {
                    const delta = currentTime - videoLastTimestamp;
                    if (delta > 0 && delta < 2) {
                        videoAccumulatedSeconds += delta;
                    }
                }
                
                videoLastTimestamp = currentTime;
                
                if (videoAccumulatedSeconds >= VIDEO_CTA_THRESHOLD && !videoButtonShown) {
                    console.log('[Video Tracker O2] THRESHOLD REACHED! Watched', videoAccumulatedSeconds.toFixed(1), 's - SHOWING BUTTON');
                    videoButtonShown = true;
                    continueBtn.classList.remove('hidden');
                }
            });
            
            console.log('[Video Tracker O2] Events bound successfully');
        } else {
            console.log('[Video Tracker O2] Waiting for Wistia player element...');
            setTimeout(setupVideoTracking, 500);
        }
    }

    // Start video tracking after a short delay for Wistia to load
    setTimeout(setupVideoTracking, 1000);

    // Video tracking for step 13 (VSL final) link
    let vslIsPlaying = false;
    let vslLastTimestamp = 0;
    let vslAccumulatedSeconds = 0;
    let vslLinkShown = false;
    const VSL_CTA_THRESHOLD = 25; // Show link after 25 seconds

    function setupVSLTracking() {
        const playerElement = document.querySelector('wistia-player[media-id="mzot6yec0n"]');
        const continueLink = document.getElementById('vslContinueLink');
        
        if (playerElement && continueLink) {
            console.log('[VSL Tracker O2] Wistia player found - binding events');
            
            playerElement.addEventListener('play', () => {
                vslIsPlaying = true;
                console.log('[VSL Tracker O2] PLAY - tracking time. Accumulated:', vslAccumulatedSeconds.toFixed(1), 's');
            });
            
            playerElement.addEventListener('pause', () => {
                vslIsPlaying = false;
                console.log('[VSL Tracker O2] PAUSE - Total watched:', vslAccumulatedSeconds.toFixed(1), 's');
            });
            
            playerElement.addEventListener('end', () => {
                vslIsPlaying = false;
                console.log('[VSL Tracker O2] ENDED - Total watched:', vslAccumulatedSeconds.toFixed(1), 's');
            });
            
            playerElement.addEventListener('time-update', (event) => {
                const currentTime = event.detail?.currentTime ?? event.target?.currentTime ?? 0;
                
                if (vslIsPlaying && currentTime > vslLastTimestamp) {
                    const delta = currentTime - vslLastTimestamp;
                    if (delta > 0 && delta < 2) {
                        vslAccumulatedSeconds += delta;
                    }
                }
                
                vslLastTimestamp = currentTime;
                
                if (vslAccumulatedSeconds >= VSL_CTA_THRESHOLD && !vslLinkShown) {
                    console.log('[VSL Tracker O2] THRESHOLD REACHED! Watched', vslAccumulatedSeconds.toFixed(1), 's - SHOWING LINK');
                    vslLinkShown = true;
                    continueLink.classList.remove('hidden');
                }
            });
            
            console.log('[VSL Tracker O2] Events bound successfully');
        } else {
            setTimeout(setupVSLTracking, 500);
        }
    }

    // Start VSL tracking after a delay
    setTimeout(setupVSLTracking, 1500);

    // Quiz functionality
    const quizContainer = document.getElementById('quizContainer');
    if (quizContainer) {
        // Handle option clicks
        const options = quizContainer.querySelectorAll('.quiz-option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                const nextStep = parseInt(this.dataset.next);
                goToStep(nextStep);
            });
        });

        // Handle continue buttons
        const continueBtns = quizContainer.querySelectorAll('.quiz-continue-btn');
        continueBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const nextStep = parseInt(this.dataset.next);
                goToStep(nextStep);
            });
        });

        // Slider updates
        const pesoSlider = document.getElementById('pesoSlider');
        const pesoValue = document.getElementById('pesoValue');
        if (pesoSlider && pesoValue) {
            pesoSlider.addEventListener('input', function() {
                pesoValue.textContent = this.value;
            });
        }

        const estaturaSlider = document.getElementById('estaturaSlider');
        const estaturaValue = document.getElementById('estaturaValue');
        if (estaturaSlider && estaturaValue) {
            estaturaSlider.addEventListener('input', function() {
                estaturaValue.textContent = this.value;
            });
        }

        const pesoObjetivoSlider = document.getElementById('pesoObjetivoSlider');
        const pesoObjetivoValue = document.getElementById('pesoObjetivoValue');
        if (pesoObjetivoSlider && pesoObjetivoValue) {
            pesoObjetivoSlider.addEventListener('input', function() {
                pesoObjetivoValue.textContent = this.value;
            });
        }
    }

    let loadingInterval = null;

    function goToStep(stepNumber) {
        if (!quizContainer) return;
        
        const steps = quizContainer.querySelectorAll('.quiz-step');
        steps.forEach(step => step.classList.remove('active'));
        
        const targetStep = quizContainer.querySelector(`[data-step="${stepNumber}"]`);
        if (targetStep) {
            targetStep.classList.add('active');
            
            // Handle loading step
            if (stepNumber === 11) {
                simulateLoading();
            }
        }
    }

    function simulateLoading() {
        // Clear any existing interval
        if (loadingInterval) {
            clearInterval(loadingInterval);
            loadingInterval = null;
        }
        
        const progressBar = document.getElementById('loadingProgress');
        const loadingTitle = document.getElementById('loadingTitle');
        const loadingSubtitle = document.getElementById('loadingSubtitle');
        const loadingDetail = document.getElementById('loadingDetail');
        if (!progressBar) return;
        
        const loadingSteps = [
            { progress: 0, title: "Analizando tus respuestas...", subtitle: "Por favor espera un momento", detail: "✓ Iniciando análisis..." },
            { progress: 15, title: "Analizando tus respuestas...", subtitle: "Evaluando tu perfil metabólico", detail: "✓ Peso y estatura registrados" },
            { progress: 30, title: "Calculando tu IMC...", subtitle: "Determinando tu índice de masa corporal", detail: "✓ Perfil corporal identificado" },
            { progress: 45, title: "Evaluando tus objetivos...", subtitle: "Analizando metas de pérdida de peso", detail: "✓ Objetivo de peso definido" },
            { progress: 60, title: "Personalizando tu protocolo...", subtitle: "Ajustando dosis ideal para tu cuerpo", detail: "✓ Zona de enfoque: Abdomen" },
            { progress: 75, title: "Optimizando resultados...", subtitle: "Calculando beneficios esperados", detail: "✓ Beneficios personalizados listos" },
            { progress: 90, title: "Preparando tu plan...", subtitle: "Finalizando protocolo personalizado", detail: "✓ Plan de hidratación incluido" },
            { progress: 100, title: "¡Listo!", subtitle: "Tu protocolo está preparado", detail: "✓ Todo listo para comenzar" }
        ];
        
        let progress = 0;
        let currentStepIndex = 0;
        progressBar.style.width = '0%';
        
        function updateLoadingText() {
            for (let i = loadingSteps.length - 1; i >= 0; i--) {
                if (progress >= loadingSteps[i].progress) {
                    if (i !== currentStepIndex) {
                        currentStepIndex = i;
                        if (loadingTitle) loadingTitle.textContent = loadingSteps[i].title;
                        if (loadingSubtitle) loadingSubtitle.textContent = loadingSteps[i].subtitle;
                        if (loadingDetail) loadingDetail.textContent = loadingSteps[i].detail;
                    }
                    break;
                }
            }
        }
        
        loadingInterval = setInterval(() => {
            progress += 1;
            progressBar.style.width = progress + '%';
            updateLoadingText();
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
                loadingInterval = null;
                setTimeout(() => {
                    goToStep(12);
                }, 500);
            }
        }, 40);
    }

    let likesCount = 12700;
    let userLiked = false;

    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            likeBtn.classList.toggle('active');
            userLiked = !userLiked;
            
            const reactionsNumber = document.querySelector('.reactions-number');
            
            if (userLiked) {
                likesCount += 1;
            } else {
                likesCount -= 1;
            }
            
            if (reactionsNumber) {
                reactionsNumber.textContent = formatNumber(likesCount);
            }
        });
    }

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
