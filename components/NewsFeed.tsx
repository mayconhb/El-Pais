import React from 'react';

const stories = [
  {
    title: "Después de 10 años de dietas fallidas, exmodelo brasileña pierde 44 kg en 5 meses.",
    excerpt: "Patricia Barca, de Río de Janeiro, adoptó el método Protocolo Gelatina Bariátrica y perdió 44 kg en solo 5 meses.",
    image: "https://picsum.photos/seed/weightloss1/600/400"
  },
  {
    title: "Cocinera que almorzaba croquetas y pasteles pierde 27 kg después de empezar a usar la famosa gelatina bariátrica.",
    excerpt: "Lo único que me motivaba era comer, afirma María. La colombiana llegó a pesar 108 kg y sufrió de hipertensión.",
    image: "https://picsum.photos/seed/weightloss2/600/400"
  },
  {
    title: "Joven mexicana renuncia a la cirugía bariátrica y pierde 43 kg después de tomar dos veces al día la famosa gelatina adelgazante.",
    excerpt: "La estudiante llegó a pesar 116 kg y por poco se sometió a una cirugía. Con la vida transformada, hoy motiva a otras.",
    image: "https://picsum.photos/seed/weightloss3/600/400"
  }
];

export const NewsFeed = () => {
  return (
    <section className="mt-8">
      <h3 className="font-bold text-lg border-b-2 border-black inline-block mb-6 uppercase tracking-tight">
        MÁS NOTICIAS
      </h3>
      
      <div className="space-y-8">
        {stories.map((story, index) => (
          <article key={index} className="flex flex-col gap-3 group cursor-pointer">
            <h4 className="font-serif font-bold text-xl leading-tight group-hover:text-news-blue transition-colors">
              {story.title}
            </h4>
            <p className="text-news-gray font-serif text-sm leading-relaxed">
              {story.excerpt}
            </p>
            <div className="w-full h-48 overflow-hidden rounded-sm bg-gray-100">
               {/* 
                  Using placeholder images as requested. 
                  In production these would be the real transformation photos.
               */}
               <img 
                src={story.image} 
                alt="Transformation" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
               />
            </div>
            {index !== stories.length - 1 && (
               <div className="w-full h-px bg-gray-200 mt-4"></div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};