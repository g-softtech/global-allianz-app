import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ServiceSection({
  id, icon, title, tagline, image, description,
  coverage, ideal, index,
}) {
  const ref   = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <section
      id={id}
      ref={ref}
      className="scroll-mt-32 py-20 md:py-28 border-b border-gray-100 last:border-0"
    >
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Image side */}
        <div className={`relative ${isEven ? "lg:order-1" : "lg:order-2"}`}>
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-navy group">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />

            {/* Floating badge */}
            <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-card">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-display font-semibold text-navy-900 text-sm leading-none">{title}</p>
                  <p className="font-sans text-xs text-gold-600 mt-0.5">{tagline}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative element */}
          <div
            className={`absolute -z-10 w-48 h-48 rounded-full bg-gold-100 blur-3xl opacity-60 ${
              isEven ? "-bottom-8 -right-8" : "-bottom-8 -left-8"
            }`}
          />
        </div>

        {/* Content side */}
        <div className={`${isEven ? "lg:order-2" : "lg:order-1"}`}>
          {/* Section counter */}
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-xs font-bold text-gold-500 bg-gold-50 border border-gold-100 px-2.5 py-1 rounded-full">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-3 leading-tight">
            {title}
          </h2>
          <p className="font-sans text-gold-600 font-medium text-sm mb-5 uppercase tracking-widest">
            {tagline}
          </p>
          <p className="font-sans text-gray-600 leading-relaxed mb-8">{description}</p>

          {/* Coverage grid */}
          <div className="mb-6">
            <h4 className="font-sans font-semibold text-navy-900 text-xs uppercase tracking-widest mb-4">
              What's covered
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {coverage.map((item, i) => (
                <div
                  key={item}
                  className="flex items-center gap-3 bg-navy-50/60 rounded-xl px-3.5 py-2.5 group hover:bg-gold-50 hover:border-gold-200 border border-transparent transition-all duration-200"
                  style={{ transitionDelay: `${i * 30}ms` }}
                >
                  <div className="w-5 h-5 bg-gsuccess-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-sans text-xs font-medium text-navy-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ideal for */}
          <div className="bg-gradient-to-r from-navy-50 to-transparent rounded-xl px-4 py-3 mb-7 border-l-2 border-gold-400">
            <span className="font-sans text-xs font-semibold text-navy-600 uppercase tracking-wide">Ideal for: </span>
            <span className="font-sans text-xs text-navy-700">{ideal}</span>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              state={{ subject: title }}
              className="btn btn-primary text-sm px-6 py-3"
            >
              Get a Quote
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href={`https://wa.me/2341234567890?text=I'm interested in ${title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn border-2 border-gray-200 text-gray-600 hover:border-gold-400 hover:text-gold-600 text-sm px-6 py-3 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
