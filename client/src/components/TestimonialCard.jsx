export default function TestimonialCard({ name, role, quote, initials, delay = 0 }) {
  return (
    <div className="reveal card border border-gray-100 flex flex-col gap-4" style={{ transitionDelay: `${delay}ms` }}>
      {/* Stars */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
      </div>
      {/* Quote */}
      <p className="font-sans text-sm text-gray-600 leading-relaxed flex-1 italic">"{quote}"</p>
      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <div className="w-10 h-10 bg-navy-gradient rounded-full flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-sans font-semibold text-navy-900 text-sm">{name}</p>
          <p className="font-sans text-xs text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  );
}
