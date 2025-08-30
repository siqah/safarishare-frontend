import React, { useState } from 'react';
import { MapPin, Calendar, Search, Users, Car, Leaf } from 'lucide-react';

const Hero: React.FC = () => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
  });


  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Share the ride,
              <br />
              <span className="text-blue-200">share the planet</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Connect with fellow travelers and discover a smarter way to travel. 
              Save money, meet new people, and reduce your carbon footprint.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <Users className="w-8 h-8 text-blue-200 mx-auto mb-2" />
                  <div className="text-2xl font-bold">2M+</div>
                  <div className="text-sm text-blue-200">Happy Users</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <Car className="w-8 h-8 text-blue-200 mx-auto mb-2" />
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-sm text-blue-200">Daily Rides</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <Leaf className="w-8 h-8 text-blue-200 mx-auto mb-2" />
                  <div className="text-2xl font-bold">50%</div>
                  <div className="text-sm text-blue-200">CO2 Saved</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Search Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Find your next ride
            </h2>
            <form onSubmit={ void 0} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter departure city"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchData.from}
                    onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter destination city"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchData.to}
                    onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchData.date}
                    onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Search rides</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;