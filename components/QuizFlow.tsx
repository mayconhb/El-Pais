import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertTriangle, Check, X } from 'lucide-react';

// --- Types ---
type StepType = 'intro' | 'button-select' | 'slider' | 'input' | 'loading' | 'result' | 'sales';

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

  // Reset slider value when entering slider steps
  useEffect(() => {
    if (step === 11) setRangeValue(70);  // Peso actual
    if (step === 12) setRangeValue(165); // Estatura
    if (step === 13) setRangeValue(60);  // Peso objetivo
  }, [step]);

  // Handle Loading Logic
  useEffect(() => {
    // The loading step is now at index 15
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

  const renderSlider = (title: string, min: number, max: number, unit: string, subtitle?: string, icon?: string, defaultValue?: number) => {
    const currentValue = rangeValue < min || rangeValue > max ? (defaultValue || Math.round((min + max) / 2)) : rangeValue;
    const percentage = ((currentValue - min) / (max - min)) * 100;
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setRangeValue(parseInt(e.target.value));
    };

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center">
          {icon && <span className="text-4xl mb-2 block">{icon}</span>}
          <h2 className="font-serif text-2xl font-bold text-news-black leading-tight">
            {title}
          </h2>
          {subtitle && <p className="text-gray-500 font-serif text-sm mt-2">{subtitle}</p>}
        </div>

        {/* Value Display */}
        <div className="text-center py-4">
          <span className="text-6xl font-bold font-serif text-news-black">{currentValue}</span>
          <span className="text-2xl font-serif text-gray-500 ml-2">{unit}</span>
        </div>

        {/* Slider Track */}
        <div className="px-2">
          <div className="relative h-8 flex items-center">
            {/* Background Track */}
            <div className="absolute w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              {/* Filled Track */}
              <div 
                className="h-full bg-gradient-to-r from-news-yellow to-orange-400 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            {/* Thumb Indicator */}
            <div 
              className="absolute w-7 h-7 bg-white border-4 border-news-yellow rounded-full shadow-lg pointer-events-none"
              style={{ left: `calc(${percentage}% - 14px)` }}
            />
            
            {/* Invisible Range Input on top */}
            <input 
              type="range" 
              min={min} 
              max={max} 
              value={currentValue} 
              onChange={handleSliderChange}
              className="absolute w-full h-8 opacity-0 cursor-pointer z-10"
            />
          </div>
          
          {/* Min/Max Labels */}
          <div className="flex justify-between mt-3 text-sm text-gray-400 font-medium">
            <span>{min} {unit}</span>
            <span>{max} {unit}</span>
          </div>
        </div>

        {/* Helper Text */}
        <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600 font-serif">
            <span className="text-news-yellow">✓</span> Ajustaremos la <strong className="text-news-black">dosis ideal</strong> del Protocolo para tu cuerpo.
          </p>
        </div>

        <button 
          onClick={handleNext}
          className="w-full bg-news-yellow hover:bg-[#ebd040] text-black font-bold text-lg py-4 px-6 rounded shadow-md transition-all"
        >
          Continuar
        </button>
      </div>
    );
  };

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

  const renderProtocolIntro = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-serif text-2xl font-bold text-news-black leading-tight text-center">
        ¡Conoce el Protocolo Gelatina Bariátrica que está ayudando a celebridades y a miles de mujeres comunes a adelgazar sin gastar una fortuna en farmacia!
      </h2>
      
      <p className="font-serif text-gray-700 text-center">
        Descubre el Protocolo <strong className="text-black">10 veces más potente</strong> que el Mounjaro y el Ozempic juntos...
      </p>
      
      <p className="font-serif text-gray-700 text-center">
        Controla tu apetito, acelera tu metabolismo y te ayuda a <span className="underline decoration-news-yellow decoration-2">eliminar grasa de forma rápida y eficaz</span>.
      </p>

      <button 
        onClick={handleNext}
        className="w-full bg-news-yellow hover:bg-[#ebd040] text-black font-bold text-lg py-4 px-6 rounded shadow-md transition-all"
      >
        Continuar
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-6">
        <h3 className="font-serif text-xl font-bold text-center text-news-black mb-6">
          ¿CÓMO FUNCIONA EL PROTOCOLO DE GELATINA BARIÁTRICA?
        </h3>
        
        {/* Placeholder for illustration */}
        <div className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-6">
          <span className="text-gray-400 text-sm">Espacio para imagen ilustrativa</span>
        </div>
      </div>

      <p className="font-serif text-gray-700 text-center">
        Los componentes del Protocolo Gelatina Bariátrica siguen actuando mientras duermes, <strong className="text-black">activando tus células quemadoras de grasa</strong> y acelerando la producción natural de GLP-1.
      </p>

      <p className="font-serif text-gray-700 text-center">
        Esto mantiene tu metabolismo quemando grasa <strong className="text-black">hasta 10 veces más rápido</strong> durante el sueño.
      </p>

      <button 
        onClick={handleNext}
        className="w-full bg-news-yellow hover:bg-[#ebd040] text-black font-bold text-lg py-4 px-6 rounded shadow-md transition-all"
      >
        Continuar
      </button>
    </div>
  );

  const renderTestimonials = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-serif text-2xl font-bold text-news-black leading-tight text-center">
        Historias Reales de Transformación de nuestras clientas con el Protocolo Gelatina Bariátrica
      </h2>

      {/* Testimonial 1 - Gomita */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="w-full h-48 bg-gray-100 border-b border-dashed border-gray-300 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Espacio para foto</span>
        </div>
        <div className="p-4 space-y-3">
          <p className="font-serif italic text-gray-700 text-sm leading-relaxed border-l-4 border-news-yellow pl-3">
            "Ya había intentado de todo para adelgazar, pero nada funcionaba realmente. Después de empezar a usar la fórmula de la Gelatina Bariátrica en mi día a día, perdí 8 kilos en solo 17 días — sin cambiar nada en mi alimentación. Ahora me siento más ligera, más bonita y con una confianza que no sentía desde hacía años."
          </p>
          <p className="font-bold text-news-black text-sm">— Gomita / Influenciadora Mexicana</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-yellow-400">★★★★★</span>
            <span>Cliente Verificada</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleNext}
        className="w-full bg-news-yellow hover:bg-[#ebd040] text-black font-bold text-lg py-4 px-6 rounded shadow-md transition-all"
      >
        Continuar
      </button>

      {/* Testimonial 2 - Fernanda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="w-full h-48 bg-gray-100 border-b border-dashed border-gray-300 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Espacio para foto</span>
        </div>
        <div className="p-4 space-y-3">
          <p className="font-serif italic text-gray-700 text-sm leading-relaxed border-l-4 border-news-yellow pl-3">
            "Ya había intentado de todo para adelgazar, pero nada funcionaba. Después de incluir la fórmula de la Gelatina Bariátrica en mi rutina, perdí 11 kg en solo 3 semanas sin cambiar nada en mi alimentación. Ahora me siento más segura y llena de energía. ¡Este Protocolo cambió mi vida!"
          </p>
          <p className="font-bold text-news-black text-sm">— Fernanda Rodríguez — Ciudad de México</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-yellow-400">★★★★★</span>
            <span>Cliente Verificada</span>
          </div>
        </div>
      </div>

      {/* Testimonial 3 - Mariana */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="w-full h-48 bg-gray-100 border-b border-dashed border-gray-300 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Espacio para foto</span>
        </div>
        <div className="p-4 space-y-3">
          <p className="font-serif italic text-gray-700 text-sm leading-relaxed border-l-4 border-news-yellow pl-3">
            "Siempre luché con mi peso y me sentía cansada todo el tiempo. Desde que empecé con la fórmula de la Sal Rosa, logré bajar 15 kilos en 2 semanas. No tuve que hacer dietas extremas ni pasar hambre. Hoy tengo más energía, mi ropa me queda mejor y me siento orgullosa de mi misma."
          </p>
          <p className="font-bold text-news-black text-sm">— Mariana López - Buenos Aires</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-yellow-400">★★★★★</span>
            <span>Cliente Verificada</span>
          </div>
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
      <h2 className="font-serif text-2xl font-bold text-news-black leading-tight">
        ¡ATENCIÓN, {name.toUpperCase() || 'AMIGA'}!
      </h2>

      <p className="font-serif text-base text-gray-700 leading-relaxed">
        Según tus respuestas, tu cuerpo está en modo <strong className="text-black">ACUMULACIÓN DE GRASA</strong>. Si no actúas HOY, esta situación tiende a <strong className="text-black">EMPEORAR</strong>.
      </p>

      {/* IMC visualizer */}
      <div className="space-y-2 my-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚖️</span>
          <h4 className="font-bold text-sm">Índice de Masa Corporal (IMC)</h4>
        </div>
        <div className="p-3 bg-gray-50 border rounded text-gray-400 text-sm">Abaixo do Peso</div>
        <div className="p-3 bg-gray-50 border rounded text-gray-400 text-sm">Normal</div>
        <div className="p-3 bg-yellow-100 border border-yellow-400 rounded text-black font-bold text-sm flex justify-between items-center shadow-sm">
          Sobrepeso
          <span className="text-lg">⚠️</span>
        </div>
        <div className="p-3 bg-gray-50 border rounded text-gray-400 text-sm">Obesidad</div>
      </div>

      <div className="bg-yellow-100 p-3 rounded text-center text-sm font-bold border border-yellow-200">
        Zona de Alerta – ¡Este es tu resultado!
      </div>

      <h3 className="font-serif text-xl font-bold text-center mt-6">
        ¡Tus células quemagrasas pueden estar dormidas y saboteando tu metabolismo sin que te des cuenta!
      </h3>

      <p className="font-serif text-sm text-gray-700 leading-relaxed">
        Incluso si estás en un peso normal, tu cuerpo podría estar desactivando las <span className="text-news-yellow font-semibold">células quemagrasas del intestino</span>, lo que ralentiza tu metabolismo, dificulta la quema de grasa y favorece el aumento de peso.
      </p>

      <div className="space-y-4 mt-6">
        <p className="font-bold text-sm text-news-black">Algunos signos de alerta:</p>
        
        <div className="space-y-3 text-sm font-serif text-gray-700">
          <p className="flex items-start gap-2">
            <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>Metabolismo lento y dificultad para adelgazar aunque comas poco</span>
          </p>
          <p className="flex items-start gap-2">
            <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>Cansancio constante y sensación de hinchazón</span>
          </p>
          <p className="flex items-start gap-2">
            <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>Acumulación de grasa en zonas específicas del cuerpo, especialmente en el abdomen</span>
          </p>
          <p className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <span>Con el Protocolo Gelatina Bariátrica, tu cuerpo acelera la quema de grasa de forma natural</span>
          </p>
          <p className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <span>La combinación ideal de ingredientes puede reactivar las células quemagrasas, acelerar el metabolismo, reducir la retención de líquidos y aumentar tu energía</span>
          </p>
        </div>
      </div>

      <div className="text-center py-4 mt-4">
        <h3 className="font-serif font-bold text-xl mb-4 text-news-black">
          ¡Descubre ahora cómo el Protocolo Gelatina Bariátrica puede transformar tu cuerpo!
        </h3>
        <p className="text-sm text-gray-600 mb-4">Mira la transformación de <span className="text-news-yellow font-semibold">Rosana Rosalez</span>.</p>
        
        {/* Placeholder for transformation photos */}
        <div className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-6">
          <span className="text-gray-400 text-sm">Espacio para fotos de transformación</span>
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

  const renderSales = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-serif text-2xl font-bold text-news-black leading-tight">
        ¡ATENCIÓN, {name.toUpperCase() || 'AMIGA'}!
      </h2>

      <p className="font-serif text-base text-gray-700 leading-relaxed">
        Según tus respuestas, tu cuerpo está en modo <strong className="text-black">ACUMULACIÓN DE GRASA</strong>. Si no actúas HOY, esta situación tiende a <strong className="text-black">EMPEORAR</strong>.
      </p>

      {/* IMC visualizer */}
      <div className="space-y-2 my-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚖️</span>
          <h4 className="font-bold text-sm">Índice de Masa Corporal (IMC)</h4>
        </div>
        <div className="p-3 bg-gray-50 border rounded text-gray-400 text-sm">Abaixo do Peso</div>
        <div className="p-3 bg-gray-50 border rounded text-gray-400 text-sm">Normal</div>
        <div className="p-3 bg-yellow-100 border border-yellow-400 rounded text-black font-bold text-sm flex justify-between items-center shadow-sm">
          Sobrepeso
          <span className="text-lg">⚠️</span>
        </div>
        <div className="p-3 bg-gray-50 border rounded text-gray-400 text-sm">Obesidad</div>
      </div>

      <div className="bg-yellow-100 p-3 rounded text-center text-sm font-bold border border-yellow-200">
        Zona de Alerta – ¡Este es tu resultado!
      </div>

      <h3 className="font-serif text-xl font-bold text-center mt-6">
        ¡Tus células quemagrasas pueden estar dormidas y saboteando tu metabolismo sin que te des cuenta!
      </h3>

      <p className="font-serif text-sm text-gray-700 leading-relaxed">
        Incluso si estás en un peso normal, tu cuerpo podría estar desactivando las <span className="text-news-yellow font-semibold">células quemagrasas del intestino</span>, lo que ralentiza tu metabolismo, dificulta la quema de grasa y favorece el aumento de peso.
      </p>

      <div className="space-y-4 mt-6">
        <p className="font-bold text-sm text-news-black">Algunos signos de alerta:</p>
        
        <div className="space-y-3 text-sm font-serif text-gray-700">
          <p className="flex items-start gap-2">
            <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>Metabolismo lento y dificultad para adelgazar aunque comas poco</span>
          </p>
          <p className="flex items-start gap-2">
            <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>Cansancio constante y sensación de hinchazón</span>
          </p>
          <p className="flex items-start gap-2">
            <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>Acumulación de grasa en zonas específicas del cuerpo, especialmente en el abdomen</span>
          </p>
          <p className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <span>Con el Protocolo Gelatina Bariátrica, tu cuerpo acelera la quema de grasa de forma natural</span>
          </p>
          <p className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <span>La combinación ideal de ingredientes puede reactivar las células quemagrasas, acelerar el metabolismo, reducir la retención de líquidos y aumentar tu energía</span>
          </p>
        </div>
      </div>

      <div className="text-center py-4 mt-4">
        <h3 className="font-serif font-bold text-xl mb-4 text-news-black">
          ¡Descubre ahora cómo el Protocolo Gelatina Bariátrica puede transformar tu cuerpo!
        </h3>
        <p className="text-sm text-gray-600 mb-4">Mira la transformación de <span className="text-news-yellow font-semibold">Rosana Rosalez</span>.</p>
        
        {/* Placeholder for transformation photos */}
        <div className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-6">
          <span className="text-gray-400 text-sm">Espacio para fotos de transformación</span>
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

  const renderVideoPage = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-serif text-xl font-bold text-news-black leading-tight text-center uppercase">
        MIRA EL VIDEO A CONTINUACIÓN Y DESCUBRE CÓMO ACCEDER A TU PROTOCOLO DE GELATINA BARIÁTRICA.
      </h2>

      {/* Video Placeholder */}
      <div className="relative w-full aspect-video bg-yellow-100 rounded-lg overflow-hidden flex flex-col items-center justify-center">
        <div className="w-full h-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Espacio para video</span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-t pt-6 mt-6">
        <h4 className="font-bold text-sm mb-4">100+ comentarios</h4>
        
        <div className="space-y-4">
          {/* Comment 1 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1">
              <p className="font-bold text-sm">Mariana Gutiérrez</p>
              <p className="text-xs text-gray-600 mt-1">Este protocolo lo cambió todo para mí. En pocas semanas vi cómo mi abdomen desinflamaba y la ropa volvía a quedarme.</p>
              <p className="text-xs text-gray-400 mt-1">Responder · Me gusta · hace 2 min</p>
            </div>
          </div>

          {/* Comment 2 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1">
              <p className="font-bold text-sm">Camila Rodríguez</p>
              <p className="text-xs text-gray-600 mt-1">Intenté de todo, pero nada funcionaba... hasta conocer este protocolo. Hoy estoy 14 kg más liviana y con la autoestima por las nubes.</p>
              <p className="text-xs text-gray-400 mt-1">Responder · Me gusta · hace 5 min</p>
            </div>
          </div>

          {/* Comment 3 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1">
              <p className="font-bold text-sm">Sofía Morales</p>
              <p className="text-xs text-gray-600 mt-1">Es increíble cómo algo tan simple puede transformar tanto. Ya son 3 meses siguiéndolo y me siento otra persona.</p>
              <p className="text-xs text-gray-400 mt-1">Responder · Me gusta · hace 8 min</p>
            </div>
          </div>

          {/* Comment 4 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1">
              <p className="font-bold text-sm">Valeria Castillo</p>
              <p className="text-xs text-gray-600 mt-1">Había perdido las esperanzas, pero este protocolo que devolvió la confianza y la energía. Nunca imaginé que funcionaría tan bien.</p>
              <p className="text-xs text-gray-400 mt-1">Responder · Me gusta · hace 12 min</p>
            </div>
          </div>

          {/* Comment 5 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1">
              <p className="font-bold text-sm">Fernanda López</p>
              <p className="text-xs text-gray-600 mt-1">Mi vida cambió por completo. La balanza finalmente empezó a bajar y no se detuvo más.</p>
              <p className="text-xs text-gray-400 mt-1">Responder · Me gusta · hace 15 min</p>
            </div>
          </div>

          {/* Comment 6 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1">
              <p className="font-bold text-sm">Carolina Ramírez</p>
              <p className="text-xs text-gray-600 mt-1">Nunca voy a olvidar la sensación de ver mi cuerpo cambiar día tras día gracias a este protocolo.</p>
              <p className="text-xs text-gray-400 mt-1">Responder · Me gusta · hace 18 min</p>
            </div>
          </div>

          {/* Comment 7 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1">
              <p className="font-bold text-sm">Lucía Fernández</p>
              <p className="text-xs text-gray-600 mt-1">En solo 10 días ya vi resultados que no logré en años de gimnasio y dietas.</p>
              <p className="text-xs text-gray-400 mt-1">Responder · Me gusta · hace 22 min</p>
            </div>
          </div>

          {/* Comment 8 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1">
              <p className="font-bold text-sm">Gabriela Torres</p>
              <p className="text-xs text-gray-600 mt-1">El protocolo fue como un renacimiento para mí. Me siento más joven, más ligera y feliz con mi cuerpo.</p>
              <p className="text-xs text-gray-400 mt-1">Responder · Me gusta · hace 25 min</p>
            </div>
          </div>

          {/* Comment 9 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1">
              <p className="font-bold text-sm">Isabella Vargas</p>
              <p className="text-xs text-gray-600 mt-1">Hoy, después de 18 kg menos, solo tengo una palabra: gratitud por este protocolo.</p>
              <p className="text-xs text-gray-400 mt-1">Responder · Me gusta · hace 30 min</p>
            </div>
          </div>

          {/* Comment 10 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1">
              <p className="font-bold text-sm">Patricia Martínez</p>
              <p className="text-xs text-gray-600 mt-1">Hoy, después de 18 kg menos, solo tengo una palabra: gratitud por este protocolo.</p>
              <p className="text-xs text-gray-400 mt-1">Responder · Me gusta · hace 35 min</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6 pt-4 border-t">
          Para comentar, inicia sesión en tu cuenta.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t">
        <p className="text-xs text-gray-400">© Protocolo Gelatina Bariátrica 2024 – Todos los Derechos Reservados.</p>
      </div>
    </div>
  );

  const renderTransformReady = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-serif text-2xl font-bold text-news-black leading-tight">
        {name || 'Amiga'}, ¿Estás lista para transformar tu cuerpo y tu salud?
      </h2>

      <p className="font-serif text-base text-gray-700 leading-relaxed text-center">
        Haz clic en <strong className="text-black">Continuar</strong> si deseas obtener tu <span className="text-news-yellow font-semibold">protocolo personalizado</span>.
      </p>

      {/* Before/After Images Placeholder */}
      <div className="grid grid-cols-2 gap-2">
        <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-xs text-center px-2">Foto Antes</span>
        </div>
        <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-xs text-center px-2">Foto Después</span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {/* Without Protocol */}
        <div className="space-y-3">
          <h4 className="text-red-500 font-bold text-sm text-center">Sin el Protocolo Gelatina Bariátrica</h4>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span><strong>Metabolismo:</strong> Lento</span>
            </p>
            <p className="flex items-start gap-2">
              <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span><strong>Nivel de estrés:</strong> Alto</span>
            </p>
            <p className="flex items-start gap-2">
              <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span><strong>Nivel de energía:</strong> Bajo</span>
            </p>
            <p className="flex items-start gap-2">
              <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span><strong>Riesgos de enfermedades:</strong> Altísimos</span>
            </p>
          </div>
        </div>

        {/* With Protocol */}
        <div className="space-y-3">
          <h4 className="text-green-600 font-bold text-sm text-center">Con el Protocolo Gelatina Bariátrica</h4>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <span><strong>Metabolismo:</strong> Acelerado</span>
            </p>
            <p className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <span><strong>Nivel de estrés:</strong> Bajo</span>
            </p>
            <p className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <span><strong>Nivel de energía:</strong> Fuerte</span>
            </p>
            <p className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <span><strong>Riesgo de enfermedades:</strong> Muy bajo</span>
            </p>
          </div>
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
    case 9:
      return renderProtocolIntro();
    case 10:
      return renderTestimonials();
    case 11:
      return renderSlider('¿Cuál es tu peso actual?', 50, 150, 'kg', '¡Comencemos! Esto nos ayuda a personalizar tu protocolo.', undefined, 70);
    case 12:
      return renderSlider('¿Cuál es tu estatura?', 140, 200, 'cm', 'Calcularemos la dosis exacta del Protocolo para tu cuerpo.', undefined, 165);
    case 13:
      return renderSlider('¿Cuál es tu peso objetivo?', 40, 100, 'kg', '¡Ya casi terminamos! Este es el peso que deseas alcanzar.', undefined, 60);
    case 14:
      return renderButtons('¿Cuántos vasos de agua bebes al día?', [
        'Solo bebo café o té',
        '1–2 vasos al día',
        '2–6 vasos al día',
        'Más de 6 vasos'
      ], 'Tu nivel de hidratación también influye en tu pérdida de peso.');
    case 15:
      return renderLoading();
    case 16:
      return renderResult();
    case 17:
      return renderSales();
    case 18:
      return renderTransformReady();
    case 19:
      return renderVideoPage();
    default:
      return null;
  }
};