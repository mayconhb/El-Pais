import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertTriangle, Check, X, Flame, Star } from 'lucide-react';

// --- Types ---
type StepType = 'intro' | 'button-select' | 'slider' | 'input' | 'loading' | 'result' | 'sales' | 'testimonial';

interface StepConfig {
  id: number;
  type: StepType;
  title: React.ReactNode;
  subtitle?: string;
  options?: string[]; // For buttons
  min?: number; // For sliders
  max?: number;
  unit?: string;
  loadingText?: string; // For loading step
}

export const QuizFlow = () => {
  const [step, setStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [rangeValue, setRangeValue] = useState(50); // Generic slider state
  const [name, setName] = useState('');

  // Auto-scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Handle Loading Logic
  useEffect(() => {
    // The loading step is now at index 15 (shifted due to testimonials)
    if (step === 15) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep(prevStep => prevStep + 1);
            return 100;
          }
          return prev + 1.5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  // --- Step Content Renderers ---

  const renderIntro = () => (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-serif text-3xl font-bold leading-tight text-news-black">
        GOMITA SORPRENDE A SUS FANS AL REVELAR CÓMO PERDIÓ 8 KG CON UNA GELATINA BARIÁTRICA CONSUMIDA ANTES DE LAS COMIDAS
      </h1>
      <p className="font-serif text-lg leading-relaxed text-gray-700">
        El cambio radical ocurrió después de que la influencer mexicana realizara una <strong className="font-bold">PRUEBA GRATUITA</strong> del Protocolo de la Gelatina Bariátrica, que activa las células adelgazantes del intestino y permite perder de <strong className="font-bold">3 a 5 kg en solo 7 días</strong> — sin dieta, sin medicamentos y sin gimnasio.
      </p>
      
      <div className="grid grid-cols-3 gap-1">
        <img src="https://picsum.photos/seed/intro1/300/400" className="w-full h-40 object-cover rounded-l-md" alt="Before" />
        <img src="https://picsum.photos/seed/intro2/300/400" className="w-full h-40 object-cover" alt="During" />
        <img src="https://picsum.photos/seed/intro3/300/400" className="w-full h-40 object-cover rounded-r-md" alt="After" />
      </div>

      <div className="bg-yellow-50 border-l-4 border-news-yellow p-4 my-4">
        <p className="font-serif text-sm italic text-gray-700">
          👉 Haz clic en el botón de abajo y descubre si este protocolo también funciona para tu cuerpo. <span className="font-bold">¡Haz la prueba gratuita ahora!</span>
        </p>
      </div>

      <button 
        onClick={handleNext}
        className="w-full bg-news-yellow hover:bg-[#ebd040] text-black font-bold text-lg py-4 px-6 rounded shadow-md transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        Iniciar mi prueba GRATIS ahora
      </button>

      <div className="flex flex-col gap-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-news-yellow" /> Prueba 100% gratuita
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-news-yellow" /> Toma menos de 2 minutos
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-news-yellow" /> Información 100% encriptada
        </div>
      </div>
    </div>
  );

  const renderButtons = (title: string, options: string[], subtitle?: string) => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-serif text-2xl font-bold text-news-black leading-tight">
        {title}
      </h2>
      {subtitle && <p className="text-gray-600 font-serif">{subtitle}</p>}
      
      <div className="space-y-3 mt-6">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={handleNext}
            className="w-full text-left bg-white border border-gray-200 hover:border-news-yellow hover:bg-yellow-50 p-4 rounded-md shadow-sm transition-all font-medium text-gray-800 flex items-center justify-between group"
          >
            {opt}
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-news-yellow" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderSlider = (title: string, min: number, max: number, unit: string, subtitle?: string) => (
    <div className="space-y-8 animate-fade-in">
      <h2 className="font-serif text-2xl font-bold text-news-black leading-tight">
        {title}
      </h2>
      {subtitle && <p className="text-gray-600 font-serif">{subtitle}</p>}

      <div className="text-center">
        <span className="text-6xl font-bold font-serif">{rangeValue}</span>
        <span className="text-2xl font-serif text-gray-500 ml-2">{unit}</span>
      </div>

      <input 
        type="range" 
        min={min} 
        max={max} 
        value={rangeValue} 
        onChange={(e) => setRangeValue(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-news-yellow"
      />
      <div className="flex justify-between text-xs text-gray-400 font-sans uppercase tracking-widest">
        <span>Desliza para ajustar</span>
      </div>

      <div className="bg-gray-50 p-4 rounded text-center text-sm text-gray-600 font-serif">
        Basándonos en eso, ajustaremos la <strong className="text-news-black">dosis ideal</strong> para obtener los mejores resultados.
      </div>

      <button 
        onClick={handleNext}
        className="w-full bg-news-yellow hover:bg-[#ebd040] text-black font-bold text-lg py-4 px-6 rounded shadow-md transition-all"
      >
        Continuar
      </button>
    </div>
  );

  const renderInput = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-serif text-2xl font-bold text-news-black leading-tight">
        Para crear tu plan personalizado, necesitamos tu nombre.
      </h2>
      <p className="text-gray-600 font-serif">Tranquila, tus datos están protegidos 🔒</p>

      <input 
        type="text" 
        placeholder="Escribe tu nombre..." 
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-4 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400 focus:border-news-yellow focus:ring-1 focus:ring-news-yellow outline-none text-lg shadow-sm"
      />

      <button 
        onClick={handleNext}
        disabled={name.length < 2}
        className="w-full bg-news-yellow hover:bg-[#ebd040] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-lg py-4 px-6 rounded shadow-md transition-all"
      >
        Continuar
      </button>
    </div>
  );

  const renderTestimonial = (data: { title?: string, image: string, quote: string, author: string, verified: boolean }) => (
    <div className="space-y-6 animate-fade-in">
      {data.title && (
        <h2 className="font-serif text-xl font-bold text-center leading-tight mb-4 flex flex-col items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500 fill-current" />
          {data.title}
        </h2>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="w-full relative">
             {/* Using a grid of images simulation for Gomita if no single image fits perfectly, but a single placeholder works for now */}
             <img src={data.image} alt="Transformation" className="w-full h-auto object-cover" />
        </div>
        <div className="p-6 space-y-4">
          <p className="font-serif italic text-gray-700 leading-relaxed text-lg border-l-4 border-news-yellow pl-4">
            {data.quote}
          </p>
          
          <div className="font-bold text-news-black font-serif border-t border-gray-100 pt-3 mt-2">
            {data.author}
          </div>
          
          {data.verified && (
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
              </div>
              <span>Cliente Verificada</span>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={handleNext}
        className="w-full bg-news-yellow hover:bg-[#ebd040] text-black font-bold text-lg py-4 px-6 rounded shadow-md transition-all"
      >
        Continuar
      </button>
    </div>
  );

  const renderLoading = () => (
    <div className="space-y-6 animate-fade-in text-center py-10">
      <h2 className="font-serif text-2xl font-bold text-news-black leading-tight mb-8">
        Espera mientras preparamos tu Protocolo Gelatina Bariátrica...
      </h2>

      <div className="grid grid-cols-2 gap-2 mb-8 opacity-80">
         <img src="https://picsum.photos/seed/load1/300/400" className="w-full h-64 object-cover rounded-l-lg" alt="Analysis 1" />
         <img src="https://picsum.photos/seed/load2/300/400" className="w-full h-64 object-cover rounded-r-lg" alt="Analysis 2" />
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div 
          className="bg-news-yellow h-4 rounded-full transition-all duration-75 ease-out" 
          style={{ width: `${loadingProgress}%` }}
        ></div>
      </div>
      <p className="font-serif text-lg font-bold">{Math.round(loadingProgress)}%</p>
    </div>
  );

  const renderResult = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-yellow-50 border border-news-yellow p-4 rounded-md text-center mb-6">
        <div className="flex items-center justify-center gap-2 font-bold text-xl mb-2 text-news-black">
          <AlertTriangle className="text-orange-500 fill-current" />
          ¡ATENCIÓN, {name.toUpperCase() || 'AMIGA'}!
        </div>
      </div>

      <p className="font-serif text-lg text-gray-700 leading-relaxed">
        Según tus respuestas, tu cuerpo está en modo <strong className="text-black">ACUMULACIÓN DE GRASA</strong>. Si no actúas HOY, esta situación tiende a <strong className="text-black">EMPEORAR</strong>.
      </p>

      {/* IMC visualizer */}
      <div className="space-y-2 my-6">
         <h4 className="font-bold text-sm text-center uppercase tracking-wider mb-4">📊 Índice de Masa Corporal (IMC)</h4>
         <div className="p-3 bg-gray-50 border rounded text-gray-400 text-sm">Abaixo do Peso</div>
         <div className="p-3 bg-gray-50 border rounded text-gray-400 text-sm">Normal</div>
         <div className="p-3 bg-yellow-100 border border-yellow-400 rounded text-black font-bold text-sm flex justify-between items-center shadow-sm">
            Sobrepeso
            <AlertTriangle className="w-4 h-4 text-orange-500" />
         </div>
         <div className="p-3 bg-gray-50 border rounded text-gray-400 text-sm">Obesidad</div>
      </div>

      <div className="bg-yellow-100 p-3 rounded text-center text-sm font-bold border border-yellow-200">
        ⚠️ Zona de Alerta – ¡Este es tu resultado!
      </div>

      <h3 className="font-serif text-xl font-bold text-center mt-6">
        ¡Tus células quemagrasas pueden estar dormidas y saboteando tu metabolismo sin que te des cuenta!
      </h3>

      <div className="space-y-3 text-sm font-serif text-gray-700">
        <p className="flex items-start gap-2">
          <X className="w-5 h-5 text-red-500 shrink-0 mt-1" />
          Metabolismo lento y dificultad para adelgazar aunque comas poco.
        </p>
        <p className="flex items-start gap-2">
          <X className="w-5 h-5 text-red-500 shrink-0 mt-1" />
          Cansancio constante y sensación de hinchazón.
        </p>
        <p className="flex items-start gap-2">
          <Check className="w-5 h-5 text-green-600 shrink-0 mt-1" />
          Con el Protocolo Gelatina Bariátrica, tu cuerpo acelera la quema de grasa de forma natural.
        </p>
      </div>

      <div className="text-center py-4">
         <p className="font-serif font-bold text-lg mb-4">
           🔥 ¡Descubre ahora cómo el Protocolo Gelatina Bariátrica puede transformar tu cuerpo!
         </p>
         <img src="https://picsum.photos/seed/transf_final/500/350" className="w-full rounded-lg shadow-lg mb-6" alt="Transformation Result" />
      </div>

      <button 
        onClick={handleNext}
        className="w-full bg-news-yellow hover:bg-[#ebd040] text-black font-bold text-lg py-4 px-6 rounded shadow-md transition-all animate-bounce"
      >
        Continuar
      </button>
    </div>
  );

  const renderSales = () => (
    <div className="space-y-6 animate-fade-in text-center">
      <h2 className="font-serif text-2xl font-bold text-news-black leading-tight">
        ¿CÓMO FUNCIONA EL PROTOCOLO DE GELATINA BARIÁTRICA?
      </h2>
      
      <div className="relative bg-gray-100 p-6 rounded-lg my-6">
        {/* Placeholder for the diagram showing the mechanism */}
        <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-tl-lg rounded-br-lg">
          MECANISMO ÚNICO
        </div>
        <img 
          src="https://picsum.photos/seed/mechanism/400/400" 
          className="mx-auto rounded-full w-48 h-48 object-cover border-4 border-white shadow-lg mb-4" 
          alt="Mechanism" 
        />
        <p className="font-serif text-sm italic">
          Come 2 gomitas antes de las comidas para activar la quema de grasa automática.
        </p>
      </div>

      <p className="font-serif text-lg text-gray-700">
        Los componentes del Protocolo Gelatina Bariátrica siguen actuando mientras duermes, <strong className="text-black">activando tus células quemadoras de grasa</strong> y acelerando la producción natural de GLP-1.
      </p>

      <div className="bg-green-50 p-4 border border-green-200 rounded-lg">
        <p className="font-serif text-green-900 font-medium">
          Esto mantiene tu metabolismo quemando grasa <strong className="font-bold">hasta 10 veces más rápido</strong> durante el sueño.
        </p>
      </div>

      <button 
        onClick={() => alert('Redireccionando al checkout...')}
        className="w-full bg-news-yellow hover:bg-[#ebd040] text-black font-bold text-xl py-5 px-6 rounded shadow-xl transition-all uppercase tracking-wide border-b-4 border-yellow-500 active:border-b-0 active:translate-y-1"
      >
        QUIERO MI PROTOCOLO AHORA
      </button>

      <p className="text-xs text-gray-400 mt-4">
        Oferta limitada por tiempo. Garantía de satisfacción de 30 días.
      </p>
    </div>
  );

  // --- Main Switch ---

  switch (step) {
    case 0:
      return renderIntro();
    case 1:
      return renderButtons('¿Cuántos kilos deseas perder?', [
        'Hasta 5 kg',
        'De 6 a 10 kg',
        'De 11 a 15 kg',
        'De 16 a 20 kg',
        'Más de 20 kg'
      ], 'Con base en tu respuesta, veremos si estás apta para eliminar grasa de forma acelerada.');
    case 2:
      return renderButtons('¿Cómo clasificarías tu cuerpo hoy?', [
        'Regular',
        'Flácido',
        'Sobrepeso',
        'Obeso'
      ]);
    case 3:
      return renderButtons('¿En qué zona de tu cuerpo te gustaría reducir más grasa?', [
        'Región de las Caderas',
        'Región de los Muslos',
        'Región del Abdomen (barriga)',
        'Región de los Glúteos',
        'Región de los Brazos'
      ]);
    case 4:
      return renderInput();
    case 5:
      return renderButtons('¿Realmente estás feliz con tu apariencia?', [
        'No, porque me siento con sobrepeso',
        'Sí, pero sé que puedo mejorar mi salud',
        'No, me gustaría bajar de peso para mejorar mi bienestar'
      ]);
    case 6:
      return renderButtons('¿Qué es lo que más te impide bajar de peso?', [
        'Falta de tiempo – Rutina agitada',
        'Autocontrol – Dificultad para resistir las tentaciones',
        'Finanzas – Considerar que lo saludable es caro'
      ]);
    case 7:
       return renderButtons('¿Cómo afecta tu peso a tu vida?', [
        'Evito tomarme fotos porque me da vergüenza',
        'Mi pareja ya no me mira con deseo como antes',
        'Evito reuniones sociales porque no me siento bien',
        'Ninguna de las opciones'
      ]);
    case 8:
      return renderButtons('¿Cuáles de estos beneficios te gustaría tener?', [
        'Bajar de peso sin esfuerzo y sin efecto rebote',
        'Dormir más profundamente',
        'Tener más energía y disposición durante el día',
        'Aumentar la autoestima y la confianza',
        'Reducir el estrés y la ansiedad'
      ], 'Personalizaremos tu protocolo para maximizar los resultados.');
    // --- NEW TESTIMONIAL STEPS ---
    case 9:
      return renderTestimonial({
        title: "Historias Reales de Transformación de nuestras clientas con el Protocolo Gelatina Bariátrica",
        image: "https://picsum.photos/seed/gomita/500/300", 
        quote: "\"Ya había intentado de todo para adelgazar, pero nada funcionaba realmente. Después de empezar a usar la fórmula de la Gelatina Bariátrica en mi día a día, perdí 8 kilos en solo 17 días — sin cambiar nada en mi alimentación. Ahora me siento más ligera, más bonita y con una confianza que no sentía desde hacía años.\"",
        author: "— Gomita / Influenciadora Mexicana",
        verified: true
      });
    case 10:
      return renderTestimonial({
        image: "https://picsum.photos/seed/fernanda/500/400",
        quote: "\"Ya había intentado de todo para adelgazar, pero nada funcionaba. Después de incluir la fórmula de la Gelatina Bariátrica en mi rutina, perdí 11 kg en solo 3 semanas sin cambiar nada en mi alimentación. Ahora me siento más segura y llena de energía. ¡Este Protocolo cambió mi vida!\"",
        author: "— Fernanda Rodríguez — Ciudad de México",
        verified: true
      });
    // --- SHIFTED STEPS ---
    case 11:
      return renderSlider('¿Cuál es tu estatura?', 140, 200, 'cm', 'Esto nos ayudará a calcular la cantidad exacta del Protocolo Gelatina Bariátrica para tu cuerpo.');
    case 12:
      return renderSlider('¿Cuál es tu peso objetivo (deseado)?', 40, 100, 'kg', 'Esto nos ayudará a personalizar un plan específicamente para ti.');
    case 13:
      return renderSlider('¿Cuál es tu peso actual?', 50, 150, 'kg', '¡Ya casi terminamos! Ajustaremos tu plan de acuerdo con tu cuerpo.');
    case 14:
      return renderButtons('¿Cuántos vasos de agua bebes al día?', [
        'Solo bebo café o té',
        '1–2 vasos al día',
        '2–6 vasos al día',
        'Más de 6 vasos'
      ], 'Tu nivel de hidratación también influye en tu pérdida de peso.');
    case 15:
      // Pseudo-loading step
      return renderLoading();
    case 16:
      return renderResult();
    case 17:
      return renderSales();
    default:
      return null;
  }
};