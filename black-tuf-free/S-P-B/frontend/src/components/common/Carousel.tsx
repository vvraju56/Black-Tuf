import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const slides = [
  {
    title: 'Deals of the Day',
    subtitle: 'Up to 50% off on top brands',
    bg: 'bg-gradient-to-r from-primary to-sky-500',
    link: '/products?sort=-discount',
    img: 'https://images.unsplash.com/photo-1483980710-265135578913?auto=format&fit=crop&w=600&q=60',
  },
  {
    title: 'New Arrivals',
    subtitle: 'Just dropped — freshest tech',
    bg: 'bg-gradient-to-r from-fuchsia-500 to-pink-500',
    link: '/products?sort=-createdAt',
    img: 'https://images.unsplash.com/photo-1512436979618-145db6ef8a05?auto=format&fit=crop&w=600&q=60',
  },
  {
    title: 'Top Picks',
    subtitle: 'Curated by our editors',
    bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    link: '/products?sort=rating',
    img: 'https://images.unsplash.com/photo-1491553896770-3c3e3a2f392f?auto=format&fit=crop&w=600&q=60',
  },
];

export const Carousel = () => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    timeoutRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const go = (dir: number) => {
    setCurrent((c) => (c + dir + slides.length) % slides.length);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-500 ${s.bg} ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="container mx-auto flex h-full min-h-[240px] flex-col items-center gap-4 px-4 py-12 text-center text-white md:flex-row md:text-left">
            <div className="md:w-1/2">
              <h2 className="text-2xl font-bold md:text-4xl">{s.title}</h2>
              <p className="mt-2 text-lg">{s.subtitle}</p>
              <Link to={s.link} className="mt-4 inline-block rounded-md bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30">Shop now</Link>
            </div>
            <div className="md:w-1/2">
              <img src={s.img} alt={s.title} className="h-48 w-full rounded-md object-cover shadow-lg md:h-64" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/30">
        <ArrowLeftIcon className="h-5 w-5" />
      </button>
      <button onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/30">
        <ArrowRightIcon className="h-5 w-5" />
      </button>
      <div className="absolute bottom-3 flex w-full justify-center gap-1">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 w-5 rounded-full transition-all ${i === current ? 'bg-white w-8' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
