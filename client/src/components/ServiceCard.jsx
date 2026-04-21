import { Link } from "react-router-dom";

export default function ServiceCard({ icon, title, description, color = "navy", delay = 0, to = "/services" }) {
  const colorMap = {
    navy:  { bg: "bg-navy-50",  icon: "text-navy-600",  border: "border-navy-100",  hover: "hover:border-navy-300" },
    gold:  { bg: "bg-gold-50",  icon: "text-gold-600",  border: "border-gold-100",  hover: "hover:border-gold-400" },
    green: { bg: "bg-gsuccess-50", icon: "text-gsuccess-600", border: "border-gsuccess-200", hover: "hover:border-gsuccess-400" },
  };
  const c = colorMap[color] || colorMap.navy;

  return (
    <div
      className={`reveal card-hover border ${c.border} ${c.hover} group cursor-pointer`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <span className={`text-2xl ${c.icon}`}>{icon}</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-navy-900 mb-2 group-hover:text-navy-700 transition-colors">{title}</h3>
      <p className="font-sans text-sm text-gray-500 leading-relaxed mb-4">{description}</p>
      <Link to={to} className={`font-sans text-sm font-semibold ${c.icon} flex items-center gap-1.5 group-hover:gap-3 transition-all duration-300`}>
        Learn More
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}
