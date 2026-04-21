import { useRef, useEffect } from "react";

const NAV_ITEMS = [
  { id: "business-insurance", label: "Business",  icon: "🏢" },
  { id: "motor-insurance",    label: "Motor",     icon: "🚗" },
  { id: "health-insurance",   label: "Health",    icon: "💊" },
  { id: "life-insurance",     label: "Life",      icon: "🛡️" },
  { id: "property-insurance", label: "Property",  icon: "🏠" },
  { id: "travel-insurance",   label: "Travel",    icon: "✈️" },
];

export default function ServicesStickyNav({ activeSection, onNavClick }) {
  const activeRef = useRef(null);
  const navRef    = useRef(null);

  // Auto-scroll nav to keep active item visible on mobile
  useEffect(() => {
    if (activeRef.current && navRef.current) {
      const nav    = navRef.current;
      const item   = activeRef.current;
      const offset = item.offsetLeft - nav.offsetWidth / 2 + item.offsetWidth / 2;
      nav.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [activeSection]);

  return (
    <div className="sticky top-[64px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      {/* Progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-100" />

      <div
        ref={navRef}
        className="flex items-center gap-1 px-4 md:px-8 overflow-x-auto scrollbar-hide py-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              ref={isActive ? activeRef : null}
              onClick={() => onNavClick(item.id)}
              className={`relative flex items-center gap-2 px-4 py-4 font-sans text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                isActive
                  ? "text-gold-600 font-semibold"
                  : "text-gray-500 hover:text-navy-700 font-medium"
              }`}
            >
              <span className={`text-base transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>

              {/* Active underline */}
              <span
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 rounded-full transition-all duration-300 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Active dot indicator */}
              {isActive && (
                <span className="absolute top-3 right-2 w-1.5 h-1.5 bg-gold-400 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}

        {/* Get Quote CTA — always visible on right */}
        <div className="ml-auto pl-4 flex-shrink-0 py-2">
          <a
            href="/contact"
            className="btn btn-primary text-xs px-4 py-2 whitespace-nowrap"
          >
            Get a Quote
          </a>
        </div>
      </div>
    </div>
  );
}
