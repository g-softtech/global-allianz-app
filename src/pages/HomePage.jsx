import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gblue-900 to-gblue-600 text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Get Insured in Minutes
              </h1>
              <p className="text-lg text-gblue-100 mb-8">
                Fast, reliable insurance solutions tailored to your needs. Protect what matters most with Global Allianz Insurance Brokers.
              </p>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn btn-primary bg-white text-gblue-900 hover:bg-gblue-50 inline-block"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/register" className="btn btn-primary inline-block">
                  Get Started
                </Link>
              )}
            </div>
            <div className="bg-gblue-800 rounded-lg h-96 flex items-center justify-center">
              <span className="text-gblue-300">Insurance Hero Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gblue-900">
            Why Choose Global Allianz?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Fast & Easy",
                description: "Complete your policy in just a few minutes with our streamlined process",
                icon: "⚡",
              },
              {
                title: "Trustworthy",
                description: "Over a decade of excellence in serving Nigerian insurance needs",
                icon: "🛡️",
              },
              {
                title: "Expert Support",
                description: "Professional brokers ready to help you 24/7",
                icon: "👥",
              },
            ].map((feature, idx) => (
              <div key={idx} className="card text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gblue-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gblue-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gblue-900">
            Peace of Mind Guaranteed
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Comprehensive coverage for individuals and businesses. Our expert insurance solutions help you make the right decisions.
          </p>
          <Link to="/register" className="btn btn-primary">
            Explore Policies
          </Link>
        </div>
      </section>
    </div>
  );
}
