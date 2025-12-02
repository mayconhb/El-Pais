// Quiz Flow State
let step = 0;
let loadingProgress = 0;
let rangeValue = 70;
let userName = '';
let peso = 70;
let altura = 165;
let carouselIndex = 0;
let showCTAButton = false;
let loadingInterval = null;
let carouselInterval = null;

// Video tracking
let isPlaying = false;
let lastTimestamp = 0;
let accumulatedSeconds = 0;
let wistiaBindied = false;
const CTA_THRESHOLD_SECONDS = 490;

// Preload tracking
let wistiaPreloaded = false;
let checkoutPreconnected = false;
const preloadedImages = new Set();

// SVG Icons
const icons = {
  menu: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  arrowRight: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>',
  checkLg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>',
  x: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>'
};

// Image paths
const images = {
  logo: 'assets/images/el-pais_1764448317569.png',
  gomita: 'assets/images/baixados_1764452903199.webp',
  protocolo: 'assets/images/protocolo_1764453061315.png',
  gomitaTestimonial: 'assets/images/Gomita_1764453233335.webp',
  fernandaTestimonial: 'assets/images/Fernanda_1764453233336.webp',
  marianaTestimonial: 'assets/images/Mariana_1764453233336.webp',
  carousel1: 'assets/images/lg-Wlmuz-slide-2-adriana-17kg_1764453347817.jpg',
  carousel2: 'assets/images/f4_1764453347817.webp',
  carousel3: 'assets/images/lg-qwnL0-slide-1nereide-16kg_1764453375116.webp',
  rosana: 'assets/images/50-year-old-woman-weight-600nw-2519627017_1764453653741.webp',
  beforeAfter: 'assets/images/dfg_1764453736974.webp',
  profilePhoto1: 'assets/images/baixados-2_1764470596368.jpg',
  profilePhoto2: 'assets/images/latina_woman_face_po_b062712e.jpg',
  profilePhoto3: 'assets/images/baixados-1_1764470596369.jpg',
  profilePhoto4: 'assets/images/latina_woman_face_po_721577a4.jpg',
  profilePhoto5: 'assets/images/latina_woman_face_po_43c11193.jpg',
  profilePhoto6: 'assets/images/middle_aged_woman_fa_da927933.jpg',
  profilePhoto7: 'assets/images/baixados_1764470596369.jpg',
  profilePhoto8: 'assets/images/images-1_1764470674545.jpg',
  profilePhoto9: 'assets/images/images_1764470674545.jpg',
  profilePhoto10: 'assets/images/images-2_1764470774467.jpg',
  patriciaBarca: 'assets/images/patricia-barca_1764452735065.webp',
  maria: 'assets/images/Maria_1764452735066.webp',
  jovemMexicana: 'assets/images/jovem-mexicana_1764452735066.webp'
};

const carouselImages = [images.carousel1, images.carousel2, images.carousel3];

// Mapeamento de imagens por etapa para preload inteligente
const stepImages = {
  0: [images.gomita],
  9: [images.protocolo],
  10: [images.gomitaTestimonial, images.fernandaTestimonial, images.marianaTestimonial],
  15: [images.carousel1, images.carousel2, images.carousel3],
  16: [images.rosana],
  17: [images.beforeAfter],
  18: [images.profilePhoto1, images.profilePhoto2, images.profilePhoto3, images.profilePhoto4, 
       images.profilePhoto5, images.profilePhoto6, images.profilePhoto7, images.profilePhoto8,
       images.profilePhoto9, images.profilePhoto10]
};

// Função para preload de imagem individual
function preloadImage(src) {
  if (preloadedImages.has(src)) return;
  preloadedImages.add(src);
  const img = new Image();
  img.src = src;
}

// Preload de imagens para as próximas etapas
function preloadNextStepImages(currentStep) {
  const stepsToPreload = [currentStep, currentStep + 1, currentStep + 2, currentStep + 3];
  stepsToPreload.forEach(s => {
    if (stepImages[s]) {
      stepImages[s].forEach(preloadImage);
    }
  });
}

// Preload do SDK Wistia (começa na etapa 15 para estar pronto na etapa 18)
function preloadWistiaSDK() {
  if (wistiaPreloaded) return;
  wistiaPreloaded = true;
  
  // Preconnect já feito no HTML, aqui fazemos o prefetch do script
  const playerScript = document.createElement('link');
  playerScript.rel = 'preload';
  playerScript.as = 'script';
  playerScript.href = 'https://fast.wistia.com/player.js';
  document.head.appendChild(playerScript);
  
  // Prefetch do embed específico do vídeo
  const embedScript = document.createElement('link');
  embedScript.rel = 'preload';
  embedScript.as = 'script';
  embedScript.href = 'https://fast.wistia.com/embed/8xc87ip699.js';
  document.head.appendChild(embedScript);
  
  // Prefetch do swatch (thumbnail do vídeo)
  const swatch = document.createElement('link');
  swatch.rel = 'preload';
  swatch.as = 'image';
  swatch.href = 'https://fast.wistia.com/embed/medias/8xc87ip699/swatch';
  document.head.appendChild(swatch);
  
  console.log('[Preload] Wistia SDK preloaded');
}

// Adiciona preconnect dinâmico para checkout (chamado na etapa 16+)
function preconnectCheckout() {
  if (checkoutPreconnected) return;
  checkoutPreconnected = true;
  
  const domains = [
    'https://pay.hotmart.com',
    'https://hotmart.com',
    'https://sec.hotmart.com',
    'https://static-media.hotmart.com',
    'https://api-sec.hotmart.com'
  ];
  
  // Adiciona dns-prefetch primeiro (mais rápido)
  domains.forEach(domain => {
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = domain;
    document.head.appendChild(dnsPrefetch);
  });
  
  // Depois adiciona preconnect (conexão completa)
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
  
  // Prefetch da página de checkout
  const checkoutPrefetch = document.createElement('link');
  checkoutPrefetch.rel = 'prefetch';
  checkoutPrefetch.href = 'https://pay.hotmart.com/I103092154N?off=8pqi3d4c&checkoutMode=10';
  document.head.appendChild(checkoutPrefetch);
  
  console.log('[Preload] Checkout preconnected and prefetched at step', step);
}

// Gerenciador de preload baseado na etapa atual
function handleStepPreloading(currentStep) {
  // Preload imagens das próximas etapas
  preloadNextStepImages(currentStep);
  
  // A partir da etapa 14, começa a preparar o vídeo
  if (currentStep >= 14) {
    preloadWistiaSDK();
  }
  
  // A partir da etapa 16, prepara o checkout
  if (currentStep >= 16) {
    preconnectCheckout();
  }
}

// Calculate IMC
function calcularIMC() {
  const alturaMetros = altura / 100;
  return peso / (alturaMetros * alturaMetros);
}

function getIMCCategory(imc) {
  if (imc < 18.5) return 'bajo';
  if (imc < 25) return 'normal';
  if (imc < 30) return 'sobrepeso';
  return 'obesidad';
}

// Handle next step
function handleNext() {
  step++;
  handleStepPreloading(step);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render functions
function renderIntro() {
  return `
    <div class="quiz-container space-y-3">
      <h1 class="quiz-title font-serif">
        GOMITA SORPRENDE A SUS FANS AL REVELAR CÓMO PERDIÓ 8 KG CON UNA GELATINA REDUCTORA CONSUMIDA ANTES DE LAS COMIDAS
      </h1>
      <p class="quiz-subtitle font-serif">
        El cambio radical ocurrió después de que la influencer mexicana realizara una <strong>PRUEBA GRATUITA</strong> del Protocolo de la Gelatina Reductora, que activa las células adelgazantes del intestino y permite perder de <strong>3 a 5 kg en solo 7 días</strong> — sin dieta, sin medicamentos y sin gimnasio.
      </p>
      
      <div style="width: 100%; overflow: hidden; border-radius: 0.375rem;">
        <img src="${images.gomita}" class="quiz-image" alt="Transformación de Gomita" width="512" height="384" fetchpriority="high" />
      </div>

      <div class="highlight-box">
        <p class="highlight-text font-serif">
          👉 Haz clic en el botón de abajo y descubre si este protocolo también funciona para tu cuerpo. <strong>¡Haz la prueba gratuita ahora!</strong>
        </p>
      </div>

      <button onclick="handleNext()" class="cta-button">
        Iniciar mi prueba GRATIS ahora
      </button>

      <div class="check-list">
        <div class="check-item">
          <span class="check-icon">${icons.check}</span> Prueba 100% gratuita
        </div>
        <div class="check-item">
          <span class="check-icon">${icons.check}</span> Toma menos de 2 minutos
        </div>
        <div class="check-item">
          <span class="check-icon">${icons.check}</span> Información 100% encriptada
        </div>
      </div>
    </div>
  `;
}

function renderButtons(title, options, subtitle) {
  const optionsHtml = options.map((opt, idx) => `
    <button onclick="handleNext()" class="option-button">
      ${opt}
      <span class="option-arrow">${icons.arrowRight}</span>
    </button>
  `).join('');

  return `
    <div class="quiz-container space-y-6">
      <h2 class="quiz-title quiz-title-lg font-serif">${title}</h2>
      ${subtitle ? `<p class="text-gray-600 font-serif">${subtitle}</p>` : ''}
      <div class="options-container">
        ${optionsHtml}
      </div>
    </div>
  `;
}

function renderSlider(title, min, max, unit, subtitle, defaultValue, saveKey) {
  const currentValue = rangeValue < min || rangeValue > max ? (defaultValue || Math.round((min + max) / 2)) : rangeValue;
  const percentage = ((currentValue - min) / (max - min)) * 100;
  
  return `
    <div class="quiz-container space-y-8">
      <div class="text-center">
        <h2 class="quiz-title quiz-title-lg font-serif">${title}</h2>
        ${subtitle ? `<p class="text-gray-500 font-serif text-sm mt-4">${subtitle}</p>` : ''}
      </div>

      <div class="slider-value">
        <span class="slider-number">${currentValue}</span>
        <span class="slider-unit">${unit}</span>
      </div>

      <div class="slider-container">
        <div class="slider-track-container">
          <div class="slider-track">
            <div class="slider-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="slider-thumb" style="left: ${percentage}%"></div>
          <input 
            type="range" 
            min="${min}" 
            max="${max}" 
            value="${currentValue}" 
            class="slider-input"
            oninput="handleSliderChange(event, '${saveKey}')"
          />
        </div>
        <div class="slider-labels">
          <span>${min} ${unit}</span>
          <span>${max} ${unit}</span>
        </div>
      </div>

      <div class="slider-helper">
        <p class="slider-helper-text font-serif">
          <span style="color: var(--news-yellow);">✓</span> Ajustaremos la <strong>dosis ideal</strong> del Protocolo para tu cuerpo.
        </p>
      </div>

      <button onclick="handleSliderContinue('${saveKey}')" class="cta-button cta-button-lg">
        Continuar
      </button>
    </div>
  `;
}

function handleSliderChange(event, saveKey) {
  rangeValue = parseInt(event.target.value);
  if (saveKey === 'peso') peso = rangeValue;
  if (saveKey === 'altura') altura = rangeValue;
  
  // Update display
  const container = document.querySelector('.slider-value');
  if (container) {
    container.querySelector('.slider-number').textContent = rangeValue;
  }
  
  // Update visual
  const percentage = ((rangeValue - parseInt(event.target.min)) / (parseInt(event.target.max) - parseInt(event.target.min))) * 100;
  document.querySelector('.slider-fill').style.width = percentage + '%';
  document.querySelector('.slider-thumb').style.left = percentage + '%';
}

function handleSliderContinue(saveKey) {
  if (saveKey === 'peso') peso = rangeValue;
  if (saveKey === 'altura') altura = rangeValue;
  handleNext();
}

function renderInput() {
  return `
    <div class="quiz-container space-y-6">
      <h2 class="quiz-title quiz-title-lg font-serif">
        Para crear tu plan personalizado, necesitamos tu nombre.
      </h2>
      <p class="text-gray-600 font-serif">Tranquila, tus datos están protegidos 🔒</p>

      <input 
        type="text" 
        placeholder="Escribe tu nombre..." 
        id="nameInput"
        class="input-field"
        oninput="handleNameInput(event)"
      />

      <button onclick="handleNameSubmit()" id="nameSubmitBtn" class="cta-button cta-button-lg" disabled>
        Continuar
      </button>
    </div>
  `;
}

function handleNameInput(event) {
  userName = event.target.value;
  const btn = document.getElementById('nameSubmitBtn');
  btn.disabled = userName.length < 2;
}

function handleNameSubmit() {
  if (userName.length >= 2) {
    handleNext();
  }
}

function renderProtocolIntro() {
  return `
    <div class="quiz-container space-y-6">
      <h2 class="quiz-title quiz-title-lg font-serif text-center">
        ¡Conoce el Protocolo Gelatina Reductora que está ayudando a celebridades y a miles de mujeres comunes a adelgazar sin gastar una fortuna en farmacia!
      </h2>
      
      <p class="font-serif text-gray-700 text-center">
        Descubre el Protocolo <strong>10 veces más potente</strong> que el Mounjaro y el Ozempic juntos...
      </p>
      
      <p class="font-serif text-gray-700 text-center">
        Controla tu apetito, acelera tu metabolismo y te ayuda a <span class="underline-yellow">eliminar grasa de forma rápida y eficaz</span>.
      </p>

      <button onclick="handleNext()" class="cta-button cta-button-lg">
        Continuar
      </button>

      <div class="mt-6">
        <h3 class="quiz-title text-xl text-center mb-6 font-serif">
          ¿CÓMO FUNCIONA EL PROTOCOLO DE GELATINA REDUCTORA?
        </h3>
        
        <div style="width: 100%; overflow: hidden; border-radius: 0.5rem;">
          <img src="${images.protocolo}" style="width: 100%; height: auto; object-fit: contain;" alt="Cómo funciona el Protocolo de Gelatina Reductora" width="512" height="384" />
        </div>
      </div>

      <p class="font-serif text-gray-700 text-center">
        Los componentes del Protocolo Gelatina Reductora siguen actuando mientras duermes, <strong>activando tus células quemadoras de grasa</strong> y acelerando la producción natural de GLP-1.
      </p>

      <p class="font-serif text-gray-700 text-center">
        Esto mantiene tu metabolismo quemando grasa <strong>hasta 10 veces más rápido</strong> durante el sueño.
      </p>

      <button onclick="handleNext()" class="cta-button cta-button-lg">
        Continuar
      </button>
    </div>
  `;
}

function renderTestimonials() {
  return `
    <div class="quiz-container space-y-6">
      <h2 class="quiz-title quiz-title-lg font-serif text-center">
        Historias Reales de Transformación de nuestras clientas con el Protocolo Gelatina Reductora
      </h2>

      <div class="testimonial-card">
        <img src="${images.gomitaTestimonial}" class="testimonial-image" alt="Transformación de Gomita" width="400" height="400" />
        <div class="testimonial-content">
          <p class="testimonial-quote">
            "Ya había intentado de todo para adelgazar, pero nada funcionaba realmente. Después de empezar a usar la fórmula de la Gelatina Reductora en mi día a día, perdí 8 kilos en solo 17 días — sin cambiar nada en mi alimentación. Ahora me siento más ligera, más bonita y con una confianza que no sentía desde hacía años."
          </p>
          <p class="testimonial-author">— Gomita / Influenciadora Mexicana</p>
          <div class="testimonial-rating">
            <span class="stars">★★★★★</span>
            <span>Cliente Verificada</span>
          </div>
        </div>
      </div>

      <button onclick="handleNext()" class="cta-button cta-button-lg">
        Continuar
      </button>

      <div class="testimonial-card">
        <img src="${images.fernandaTestimonial}" class="testimonial-image" alt="Transformación de Fernanda" width="400" height="400" />
        <div class="testimonial-content">
          <p class="testimonial-quote">
            "Ya había intentado de todo para adelgazar, pero nada funcionaba. Después de incluir la fórmula de la Gelatina Reductora en mi rutina, perdí 11 kg en solo 3 semanas sin cambiar nada en mi alimentación. Ahora me siento más segura y llena de energía. ¡Este Protocolo cambió mi vida!"
          </p>
          <p class="testimonial-author">— Fernanda Rodríguez — Ciudad de México</p>
          <div class="testimonial-rating">
            <span class="stars">★★★★★</span>
            <span>Cliente Verificada</span>
          </div>
        </div>
      </div>

      <div class="testimonial-card">
        <img src="${images.marianaTestimonial}" class="testimonial-image" alt="Transformación de Mariana" width="400" height="400" />
        <div class="testimonial-content">
          <p class="testimonial-quote">
            "Siempre luché con mi peso y me sentía cansada todo el tiempo. Desde que empecé con la fórmula de la Sal Rosa, logré bajar 15 kilos en 2 semanas. No tuve que hacer dietas extremas ni pasar hambre. Hoy tengo más energía, mi ropa me queda mejor y me siento orgullosa de mi misma."
          </p>
          <p class="testimonial-author">— Mariana López - Buenos Aires</p>
          <div class="testimonial-rating">
            <span class="stars">★★★★★</span>
            <span>Cliente Verificada</span>
          </div>
        </div>
      </div>

      <button onclick="handleNext()" class="cta-button cta-button-lg">
        Continuar
      </button>
    </div>
  `;
}

function renderLoading() {
  return `
    <div class="quiz-container loading-container">
      <h2 class="quiz-title quiz-title-lg font-serif mb-8">
        Espera mientras preparamos tu Protocolo Gelatina Reductora...
      </h2>

      <div class="carousel-container">
        ${carouselImages.map((img, index) => `
          <img 
            src="${img}" 
            class="carousel-image"
            style="opacity: ${index === carouselIndex ? 1 : 0}"
            alt="Transformación ${index + 1}" 
          />
        `).join('')}
        <div class="carousel-dots">
          ${carouselImages.map((_, index) => `
            <div class="carousel-dot ${index === carouselIndex ? 'active' : ''}"></div>
          `).join('')}
        </div>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${loadingProgress}%"></div>
      </div>
      <p class="progress-text font-serif">${Math.round(loadingProgress)}%</p>
    </div>
  `;
}

function startLoading() {
  loadingProgress = 0;
  loadingInterval = setInterval(() => {
    loadingProgress += 1.5;
    if (loadingProgress >= 100) {
      loadingProgress = 100;
      clearInterval(loadingInterval);
      clearInterval(carouselInterval);
      setTimeout(() => {
        step++;
        render();
      }, 100);
    }
    updateLoadingUI();
  }, 50);
  
  carouselInterval = setInterval(() => {
    carouselIndex = (carouselIndex + 1) % carouselImages.length;
    updateCarouselUI();
  }, 800);
}

function updateLoadingUI() {
  const fill = document.querySelector('.progress-fill');
  const text = document.querySelector('.progress-text');
  if (fill) fill.style.width = loadingProgress + '%';
  if (text) text.textContent = Math.round(loadingProgress) + '%';
}

function updateCarouselUI() {
  const images = document.querySelectorAll('.carousel-image');
  const dots = document.querySelectorAll('.carousel-dot');
  images.forEach((img, index) => {
    img.style.opacity = index === carouselIndex ? 1 : 0;
  });
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === carouselIndex);
  });
}

function renderResult() {
  const imc = calcularIMC();
  const category = getIMCCategory(imc);
  const imcPosition = Math.min(Math.max(((imc - 15) / (35 - 15)) * 100, 0), 100);
  const displayName = userName.toUpperCase() || 'AMIGA';
  
  return `
    <div class="quiz-container space-y-6">
      <h2 class="quiz-title quiz-title-lg font-serif">
        ¡ATENCIÓN, ${displayName}!
      </h2>

      <p class="font-serif text-gray-700" style="line-height: 1.6;">
        Según tus respuestas, tu cuerpo está en modo <strong>ACUMULACIÓN DE GRASA</strong>. Si no actúas HOY, esta situación tiende a <strong>EMPEORAR</strong>.
      </p>

      <div class="space-y-4 mt-6">
        <div class="imc-display">
          <p class="imc-label">Tu IMC:</p>
          <p class="imc-value">${imc.toFixed(1)}</p>
        </div>
        
        <div class="imc-bar-container">
          <div class="imc-indicator" style="left: ${imcPosition}%">
            <span class="imc-indicator-label">Tú hoy</span>
            <div class="imc-indicator-arrow"></div>
          </div>
          
          <div class="imc-bar">
            <div class="imc-bar-section imc-bajo ${category === 'bajo' ? 'active' : ''}">Bajo peso</div>
            <div class="imc-bar-section imc-normal ${category === 'normal' ? 'active' : ''}">Normal</div>
            <div class="imc-bar-section imc-sobrepeso ${category === 'sobrepeso' ? 'active' : ''}">Sobrepeso</div>
            <div class="imc-bar-section imc-obesidad ${category === 'obesidad' ? 'active' : ''}">Obesidad</div>
          </div>
        </div>
      </div>

      <h3 class="quiz-title text-xl text-center mt-6 font-serif">
        ¡Tus células quemagrasas pueden estar dormidas y saboteando tu metabolismo sin que te des cuenta!
      </h3>

      <p class="font-serif text-sm text-gray-700" style="line-height: 1.6;">
        Incluso si estás en un peso normal, tu cuerpo podría estar desactivando las <span style="color: var(--news-yellow); font-weight: 600;">células quemagrasas del intestino</span>, lo que ralentiza tu metabolismo, dificulta la quema de grasa y favorece el aumento de peso.
      </p>

      <div class="space-y-4 mt-6">
        <p class="font-bold text-sm">Algunos signos de alerta:</p>
        
        <div class="alert-list">
          <p class="alert-item">
            <span class="alert-icon red">${icons.x}</span>
            <span>Metabolismo lento y dificultad para adelgazar aunque comas poco</span>
          </p>
          <p class="alert-item">
            <span class="alert-icon red">${icons.x}</span>
            <span>Cansancio constante y sensación de hinchazón</span>
          </p>
          <p class="alert-item">
            <span class="alert-icon red">${icons.x}</span>
            <span>Acumulación de grasa en zonas específicas del cuerpo, especialmente en el abdomen</span>
          </p>
          <p class="alert-item">
            <span class="alert-icon green">${icons.checkLg}</span>
            <span>Con el Protocolo Gelatina Reductora, tu cuerpo acelera la quema de grasa de forma natural</span>
          </p>
          <p class="alert-item">
            <span class="alert-icon green">${icons.checkLg}</span>
            <span>La combinación ideal de ingredientes puede reactivar las células quemagrasas, acelerar el metabolismo, reducir la retención de líquidos y aumentar tu energía</span>
          </p>
        </div>
      </div>

      <div class="text-center py-4 mt-4">
        <h3 class="quiz-title text-xl mb-4 font-serif">
          ¡Descubre ahora cómo el Protocolo Gelatina Reductora puede transformar tu cuerpo!
        </h3>
        <p class="text-sm text-gray-600 mb-4">Mira la transformación de <span style="color: var(--news-yellow); font-weight: 600;">Rosana Rosalez</span>.</p>
        
        <div style="width: 100%; overflow: hidden; border-radius: 0.5rem; margin-bottom: 1.5rem;">
          <img src="${images.rosana}" style="width: 100%; height: auto; object-fit: cover;" alt="Transformación de Rosana Rosalez" width="512" height="384" />
        </div>
      </div>

      <button onclick="handleNext()" class="cta-button cta-button-lg">
        Continuar
      </button>
    </div>
  `;
}

function renderTransformReady() {
  const displayName = userName || 'Amiga';
  
  return `
    <div class="quiz-container space-y-6">
      <h2 class="quiz-title quiz-title-lg font-serif">
        ${displayName}, ¿Estás lista para transformar tu cuerpo y tu salud?
      </h2>

      <p class="font-serif text-gray-700 text-center" style="line-height: 1.6;">
        Haz clic en <strong>Continuar</strong> si deseas obtener tu <span style="color: var(--news-yellow); font-weight: 600;">protocolo personalizado</span>.
      </p>

      <div style="width: 100%; overflow: hidden; border-radius: 0.5rem;">
        <img src="${images.beforeAfter}" style="width: 100%; height: auto; object-fit: cover;" alt="Antes y Después" width="512" height="384" />
      </div>

      <div class="comparison-grid">
        <div class="comparison-column">
          <h4 class="comparison-title red">Sin el Protocolo Gelatina Reductora</h4>
          <div class="comparison-list">
            <p class="comparison-item">
              <span class="comparison-icon" style="color: #ef4444;">${icons.x}</span>
              <span><strong>Metabolismo:</strong> Lento</span>
            </p>
            <p class="comparison-item">
              <span class="comparison-icon" style="color: #ef4444;">${icons.x}</span>
              <span><strong>Nivel de estrés:</strong> Alto</span>
            </p>
            <p class="comparison-item">
              <span class="comparison-icon" style="color: #ef4444;">${icons.x}</span>
              <span><strong>Nivel de energía:</strong> Bajo</span>
            </p>
            <p class="comparison-item">
              <span class="comparison-icon" style="color: #ef4444;">${icons.x}</span>
              <span><strong>Riesgos de enfermedades:</strong> Altísimos</span>
            </p>
          </div>
        </div>

        <div class="comparison-column">
          <h4 class="comparison-title green">Con el Protocolo Gelatina Reductora</h4>
          <div class="comparison-list">
            <p class="comparison-item">
              <span class="comparison-icon" style="color: #16a34a;">${icons.checkLg}</span>
              <span><strong>Metabolismo:</strong> Acelerado</span>
            </p>
            <p class="comparison-item">
              <span class="comparison-icon" style="color: #16a34a;">${icons.checkLg}</span>
              <span><strong>Nivel de estrés:</strong> Bajo</span>
            </p>
            <p class="comparison-item">
              <span class="comparison-icon" style="color: #16a34a;">${icons.checkLg}</span>
              <span><strong>Nivel de energía:</strong> Fuerte</span>
            </p>
            <p class="comparison-item">
              <span class="comparison-icon" style="color: #16a34a;">${icons.checkLg}</span>
              <span><strong>Riesgo de enfermedades:</strong> Muy bajo</span>
            </p>
          </div>
        </div>
      </div>

      <button onclick="handleNext()" class="cta-button cta-button-lg">
        Continuar
      </button>
    </div>
  `;
}

function renderVideoPage() {
  const comments = [
    { name: 'Mariana Gutiérrez', photo: images.profilePhoto1, text: 'Este protocolo lo cambió todo para mí. En pocas semanas vi cómo mi abdomen desinflamaba y la ropa volvía a quedarme.', time: 'hace 2 min' },
    { name: 'Camila Rodríguez', photo: images.profilePhoto2, text: 'Intenté de todo, pero nada funcionaba... hasta conocer este protocolo. Hoy estoy 14 kg más liviana y con la autoestima por las nubes.', time: 'hace 5 min' },
    { name: 'Sofía Morales', photo: images.profilePhoto3, text: 'Es increíble cómo algo tan simple puede transformar tanto. Ya son 3 meses siguiéndolo y me siento otra persona.', time: 'hace 8 min' },
    { name: 'Valeria Castillo', photo: images.profilePhoto4, text: 'Había perdido las esperanzas, pero este protocolo que devolvió la confianza y la energía. Nunca imaginé que funcionaría tan bien.', time: 'hace 12 min' },
    { name: 'Fernanda López', photo: images.profilePhoto5, text: 'Mi vida cambió por completo. La balanza finalmente empezó a bajar y no se detuvo más.', time: 'hace 15 min' },
    { name: 'Carolina Ramírez', photo: images.profilePhoto6, text: 'Nunca voy a olvidar la sensación de ver mi cuerpo cambiar día tras día gracias a este protocolo.', time: 'hace 18 min' },
    { name: 'Lucía Fernández', photo: images.profilePhoto7, text: 'En solo 10 días ya vi resultados que no logré en años de gimnasio y dietas.', time: 'hace 22 min' },
    { name: 'Gabriela Torres', photo: images.profilePhoto8, text: 'El protocolo fue como un renacimiento para mí. Me siento más joven, más ligera y feliz con mi cuerpo.', time: 'hace 25 min' },
    { name: 'Isabella Vargas', photo: images.profilePhoto9, text: 'Hoy, después de 18 kg menos, solo tengo una palabra: gratitud por este protocolo.', time: 'hace 30 min' },
    { name: 'Patricia Martínez', photo: images.profilePhoto10, text: 'Hoy, después de 18 kg menos, solo tengo una palabra: gratitud por este protocolo.', time: 'hace 35 min' }
  ];
  
  return `
    <div class="quiz-container space-y-6">
      <h2 class="quiz-title text-xl font-serif text-center" style="text-transform: uppercase;">
        MIRA EL VIDEO A CONTINUACIÓN Y DESCUBRE CÓMO ACCEDER A TU PROTOCOLO DE GELATINA REDUCTORA.
      </h2>

      <div class="video-container">
        <div class="video-wrapper">
          <style>
            wistia-player[media-id='8xc87ip699']:not(:defined) {
              background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/8xc87ip699/swatch');
              display: block;
              filter: blur(5px);
              padding-top: 152.5%;
            }
          </style>
          <wistia-player media-id="8xc87ip699" seo="false" aspect="0.6557377049180327"></wistia-player>
        </div>
      </div>

      <div id="ctaButtonContainer" class="${showCTAButton ? '' : 'hidden'}" style="margin-top: 1rem;">
        <a
          href="https://pay.hotmart.com/I103092154N?off=8pqi3d4c&checkoutMode=10"
          onclick="handleCTAClick()"
          class="cta-link animate-pulse-cta-strong"
        >
          <span>ACCEDER A MI PROTOCOLO PERSONALIZADO AHORA</span>
          ${icons.arrowRight}
        </a>
      </div>

      <div class="comments-section">
        <h4 class="comments-title">100+ comentarios</h4>
        
        <div class="comments-list">
          ${comments.map(c => `
            <div class="comment">
              <img src="${c.photo}" alt="${c.name}" class="comment-avatar" width="32" height="32" />
              <div class="comment-content">
                <p class="comment-author">${c.name}</p>
                <p class="comment-text">${c.text}</p>
                <p class="comment-meta">Responder · Me gusta · ${c.time}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <p class="comments-footer">
          Para comentar, inicia sesión en tu cuenta.
        </p>
      </div>
    </div>
  `;
}

function handleCTAClick() {
  console.log('[CTA Link] Link clicked - pushing InitiateCheckout to dataLayer');
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': 'initiate_checkout',
    'event_category': 'ecommerce',
    'event_label': 'cta_link_click',
    'cta_source': 'custom_cta_link'
  });
}

function renderNewsFeed() {
  const stories = [
    {
      title: "Después de 10 años de dietas fallidas, exmodelo brasileña pierde 44 kg en 5 meses.",
      excerpt: "Patricia Barca, de Río de Janeiro, adoptó el método Protocolo Gelatina Reductora y perdió 44 kg en solo 5 meses.",
      image: images.patriciaBarca
    },
    {
      title: "Cocinera que almorzaba croquetas y pasteles pierde 27 kg después de empezar a usar la famosa gelatina reductora.",
      excerpt: "Lo único que me motivaba era comer, afirma María. La colombiana llegó a pesar 108 kg y sufrió de hipertensión.",
      image: images.maria
    },
    {
      title: "Joven mexicana renuncia a la cirugía bariátrica y pierde 43 kg después de tomar dos veces al día la famosa gelatina adelgazante.",
      excerpt: "La estudiante llegó a pesar 116 kg y por poco se sometió a una cirugía. Con la vida transformada, hoy motiva a otras.",
      image: images.jovemMexicana
    }
  ];

  return `
    <section class="newsfeed">
      <h3 class="newsfeed-title">MÁS NOTICIAS</h3>
      
      <div class="stories-list">
        ${stories.map((story, index) => `
          <article class="story">
            <h4 class="story-title font-serif">${story.title}</h4>
            <p class="story-excerpt font-serif">${story.excerpt}</p>
            <div class="story-image-container">
              <img src="${story.image}" alt="Transformation" class="story-image" width="512" height="288" loading="lazy" />
            </div>
            ${index !== stories.length - 1 ? '<div class="story-divider"></div>' : ''}
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

// Main render function
function render() {
  const quizContainer = document.getElementById('quiz-container');
  let content = '';
  
  switch (step) {
    case 0:
      content = renderIntro();
      break;
    case 1:
      content = renderButtons('¿Cuántos kilos deseas perder?', [
        'Hasta 5 kg',
        'De 6 a 10 kg',
        'De 11 a 15 kg',
        'De 16 a 20 kg',
        'Más de 20 kg'
      ], 'Con base en tu respuesta, veremos si estás apta para eliminar grasa de forma acelerada.');
      break;
    case 2:
      content = renderButtons('¿Cómo clasificarías tu cuerpo hoy?', [
        'Regular',
        'Flácido',
        'Sobrepeso',
        'Obeso'
      ]);
      break;
    case 3:
      content = renderButtons('¿En qué zona de tu cuerpo te gustaría reducir más grasa?', [
        'Región de las Caderas',
        'Región de los Muslos',
        'Región del Abdomen (barriga)',
        'Región de los Glúteos',
        'Región de los Brazos'
      ]);
      break;
    case 4:
      content = renderInput();
      break;
    case 5:
      content = renderButtons('¿Realmente estás feliz con tu apariencia?', [
        'No, porque me siento con sobrepeso',
        'Sí, pero sé que puedo mejorar mi salud',
        'No, me gustaría bajar de peso para mejorar mi bienestar'
      ]);
      break;
    case 6:
      content = renderButtons('¿Qué es lo que más te impide bajar de peso?', [
        'Falta de tiempo – Rutina agitada',
        'Autocontrol – Dificultad para resistir las tentaciones',
        'Finanzas – Considerar que lo saludable es caro'
      ]);
      break;
    case 7:
      content = renderButtons('¿Cómo afecta tu peso a tu vida?', [
        'Evito tomarme fotos porque me da vergüenza',
        'Mi pareja ya no me mira con deseo como antes',
        'Evito reuniones sociales porque no me siento bien',
        'Ninguna de las opciones'
      ]);
      break;
    case 8:
      content = renderButtons('¿Cuáles de estos beneficios te gustaría tener?', [
        'Bajar de peso sin esfuerzo y sin efecto rebote',
        'Dormir más profundamente',
        'Tener más energía y disposición durante el día',
        'Aumentar la autoestima y la confianza',
        'Reducir el estrés y la ansiedad'
      ], 'Personalizaremos tu protocolo para maximizar los resultados.');
      break;
    case 9:
      content = renderProtocolIntro();
      break;
    case 10:
      content = renderTestimonials();
      break;
    case 11:
      rangeValue = 70;
      content = renderSlider('¿Cuál es tu peso actual?', 50, 150, 'kg', '¡Comencemos! Esto nos ayuda a personalizar tu protocolo.', 70, 'peso');
      break;
    case 12:
      rangeValue = 165;
      content = renderSlider('¿Cuál es tu estatura?', 140, 200, 'cm', 'Calcularemos la dosis exacta del Protocolo para tu cuerpo.', 165, 'altura');
      break;
    case 13:
      rangeValue = 60;
      content = renderSlider('¿Cuál es tu peso objetivo?', 40, 120, 'kg', '¡Casi listo! Esto nos ayuda a definir tu meta.', 60, 'objetivo');
      break;
    case 14:
      content = renderButtons('¿Cuántos vasos de agua bebes al día?', [
        'Solo bebo café o té',
        '1–2 vasos al día',
        '2–6 vasos al día',
        'Más de 6 vasos'
      ], 'Tu nivel de hidratación también influye en tu pérdida de peso.');
      break;
    case 15:
      content = renderLoading();
      setTimeout(() => startLoading(), 100);
      break;
    case 16:
      content = renderResult();
      break;
    case 17:
      content = renderTransformReady();
      break;
    case 18:
      content = renderVideoPage();
      setTimeout(() => loadWistiaSDK(), 100);
      break;
    default:
      content = renderIntro();
  }
  
  quizContainer.innerHTML = content;
}

function loadWistiaSDK() {
  if (!document.querySelector('script[src*="fast.wistia.com/player.js"]')) {
    const playerScript = document.createElement('script');
    playerScript.src = 'https://fast.wistia.com/player.js';
    playerScript.async = true;
    document.head.appendChild(playerScript);
  }
  
  if (!document.querySelector('script[src*="fast.wistia.com/embed/8xc87ip699.js"]')) {
    const embedScript = document.createElement('script');
    embedScript.src = 'https://fast.wistia.com/embed/8xc87ip699.js';
    embedScript.async = true;
    embedScript.type = 'module';
    document.head.appendChild(embedScript);
  }
  
  // Set up video tracking
  setTimeout(() => setupVideoTracking(), 1000);
}

function setupVideoTracking() {
  if (wistiaBindied) return;
  
  const playerElement = document.querySelector('wistia-player[media-id="8xc87ip699"]');
  
  if (playerElement) {
    wistiaBindied = true;
    console.log('[Video Tracker] Wistia player found - binding events');
    
    playerElement.addEventListener('play', () => {
      isPlaying = true;
      console.log('[Video Tracker] PLAY - now tracking time. Accumulated so far:', accumulatedSeconds.toFixed(1), 's');
    });
    
    playerElement.addEventListener('pause', () => {
      isPlaying = false;
      console.log('[Video Tracker] PAUSE - stopped tracking. Total watched:', accumulatedSeconds.toFixed(1), 's');
    });
    
    playerElement.addEventListener('end', () => {
      isPlaying = false;
      console.log('[Video Tracker] ENDED - Total watched:', accumulatedSeconds.toFixed(1), 's');
    });
    
    playerElement.addEventListener('time-update', (event) => {
      const currentTime = event.detail?.currentTime ?? event.target?.currentTime ?? 0;
      
      if (isPlaying && currentTime > lastTimestamp) {
        const delta = currentTime - lastTimestamp;
        if (delta > 0 && delta < 2) {
          accumulatedSeconds += delta;
        }
      }
      
      lastTimestamp = currentTime;
      
      if (accumulatedSeconds >= CTA_THRESHOLD_SECONDS && !showCTAButton) {
        console.log('[Video Tracker] THRESHOLD REACHED! Watched', accumulatedSeconds.toFixed(1), 's - SHOWING CTA BUTTON');
        showCTAButton = true;
        const ctaContainer = document.getElementById('ctaButtonContainer');
        if (ctaContainer) {
          ctaContainer.classList.remove('hidden');
        }
      }
    });
    
    console.log('[Video Tracker] Events bound successfully');
  } else {
    console.log('[Video Tracker] Waiting for Wistia player element...');
    setTimeout(setupVideoTracking, 500);
  }
}

// UTM/XCOD tracking
function setupUTMTracking() {
  document.addEventListener('mousedown', function(e) {
    const target = e.target.closest('a');
    const checkoutTerms = ['pay.hotmart', 'kiwify', 'checkout', 'payment', 'pay'];
    
    if (target && target.href) {
      const isCheckout = checkoutTerms.some(term => target.href.includes(term));
      
      if (isCheckout) {
        const currentParams = window.location.search;
        
        if (currentParams && !target.href.includes('xcod')) {
          const separator = target.href.includes('?') ? '&' : '?';
          const paramsClean = currentParams.replace(/^\?/, '');
          target.href = target.href + separator + paramsClean;
          console.log('Parâmetros injetados no link:', target.href);
        }
      }
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Step 0 já está renderizado no HTML para FCP imediato
  // Só renderiza se precisar (após navegação)
  handleStepPreloading(step);
  
  // Preload agressivo: carrega TODAS as imagens em background após 2 segundos
  setTimeout(() => {
    Object.values(images).forEach(preloadImage);
    console.log('[Preload] All images preloaded in background');
  }, 2000);
});
