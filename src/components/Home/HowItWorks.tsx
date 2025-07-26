import React from 'react';
import { Search, UserPlus, Car, Star } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Search,
      title: 'Search for rides',
      description: 'Enter your destination and find available rides that match your schedule.',
      color: 'bg-blue-600',
    },
    {
      icon: UserPlus,
      title: 'Book your seat',
      description: 'Connect with verified drivers and book your seat with just a few clicks.',
      color: 'bg-emerald-600',
    },
    {
      icon: Car,
      title: 'Enjoy the ride',
      description: 'Meet your driver and fellow passengers for a comfortable journey.',
      color: 'bg-orange-600',
    },
    {
      icon: Star,
      title: 'Rate the experience',
      description: 'Share your feedback to help maintain our community of trusted travelers.',
      color: 'bg-purple-600',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Getting started is simple. Follow these easy steps to begin your ridesharing journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500 mb-2">
                Step {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;