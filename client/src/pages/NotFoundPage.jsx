import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-navy-gradient flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-lg">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="font-display text-[160px] font-extrabold text-navy-800 leading-none select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gold-gradient rounded-2xl flex items-center justify-center shadow-gold animate-pulse-soft">
              <span className="text-4xl">🔍</span>
            </div>
          </div>
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="font-sans text-gray-400 leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn btn-primary">
            ← Go Home
          </Link>
          <Link to="/services" className="btn bg-navy-800 text-white hover:bg-navy-700">
            View Our Services
          </Link>
          <Link to="/contact" className="btn border-2 border-navy-700 text-gray-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Contact Support
          </Link>
        </div>

        <p className="font-sans text-xs text-gray-600 mt-10">
          Looking for a specific insurance product?{" "}
          <Link to="/services" className="text-gold-500 hover:text-gold-400 transition-colors">Browse all services →</Link>
        </p>
      </div>
    </div>
  );
}
