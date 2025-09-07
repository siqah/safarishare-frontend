import React from 'react';
import { Shield, Users, Leaf, Clock, MessageCircle } from 'lucide-react';


const Features: React.FC = () => {

   const KShIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 4v16" />
    <path d="M6 12h5.5a3.5 3.5 0 0 0 0-7H6" />
    <path d="M11.5 12H9l7 8" />
    <path d="M11 20l5.5-6" />
  </svg>
);
  const features = [
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Verified profiles, ratings, and secure payment system ensure your safety.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: KShIcon,
      title: 'Save Money',
      description: 'Split fuel costs and travel expenses with fellow passengers.',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      icon: Users,
      title: 'Meet People',
      description: 'Connect with like-minded travelers and make new friends.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Leaf,
      title: 'Eco-Friendly',
      description: 'Reduce your carbon footprint by sharing rides instead of driving alone.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Clock,
      title: 'Flexible',
      description: 'Find rides that match your schedule and preferred travel times.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: MessageCircle,
      title: 'Stay Connected',
      description: 'Chat with drivers and passengers to coordinate your trip.',
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why choose SafariShare?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join  people who are already sharing rides, saving money, and protecting the environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;