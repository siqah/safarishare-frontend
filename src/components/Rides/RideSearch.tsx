import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, DollarSign, Users, Filter, AlertCircle } from 'lucide-react';
import { useRideStore } from '../../stores/rideStore';
import { useAuthStore } from '../../stores/authStore';
import RideCard from './RideCard';

const RideSearch: React.FC = () => {
  const { user } = useAuthStore();
  const { searchResults, searchRides, searchFilters, bookRide, isLoading, error, clearError } = useRideStore();
  const [filters, setFilters] = useState({
    from: searchFilters.from || '',
    to: searchFilters.to || '',
    date: searchFilters.date || '',
    maxPrice: searchFilters.maxPrice?.toString() || '',
    minSeats: searchFilters.minSeats?.toString() || '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load default rides when component mounts
  useEffect(() => {
    loadDefaultRides();
  }, []);

  // Load rides with existing search filters if any
  useEffect(() => {
    if (searchFilters.from || searchFilters.to || searchFilters.date) {
      handleSearch();
      setHasSearched(true);
    }
  }, []);

  const loadDefaultRides = async () => {
    clearError();
    try {
      // Load default rides without any search criteria
      await searchRides({});
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearError();
    setHasSearched(true);
    
    const searchData = {
      ...filters,
      maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
      minSeats: filters.minSeats ? parseInt(filters.minSeats) : undefined,
    };
    
    try {
      await searchRides(searchData);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleClearSearch = () => {
    setFilters({
      from: '',
      to: '',
      date: '',
      maxPrice: '',
      minSeats: '',
    });
    setHasSearched(false);
    setShowFilters(false);
    loadDefaultRides();
  };

  const handleBookRide = async (rideId: string) => {
    if (!user) {
      alert('Please log in to book a ride');
      return;
    }

    try {
      const seats = 1; // Default to 1 seat
      await bookRide(rideId, seats, user._id, 'Looking forward to the ride!');
      alert('Booking request sent! The driver will review your request.');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleMessage = (driverId: string) => {
    // In a real app, this would open the messaging interface
    alert(`Opening chat with driver ${driverId}`);
  };

  const getResultsTitle = () => {
    if (!hasSearched) {
      return `Available rides (${searchResults.length})`;
    }
    
    const hasActiveFilters = filters.from || filters.to || filters.date || filters.maxPrice || filters.minSeats;
    if (hasActiveFilters) {
      return `Search results (${searchResults.length})`;
    }
    
    return `All available rides (${searchResults.length})`;
  };

  const getEmptyStateMessage = () => {
    if (!hasSearched) {
      return {
        title: "No rides available at the moment",
        subtitle: "Check back later or try posting your own ride"
      };
    }
    
    return {
      title: "No rides found for your search criteria",
      subtitle: "Try adjusting your filters or search for different dates"
    };
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {hasSearched ? 'Search Rides' : 'Available Rides'}
          </h1>
          <p className="text-gray-600">
            {hasSearched ? 'Find the perfect ride for your journey' : 'Browse available rides or search for specific routes'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Departure city"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.from}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
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
                    placeholder="Destination city"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.to}
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })}
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
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Search Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Filter className="w-5 h-5" />
                  <span>Advanced filters</span>
                </button>
                {hasSearched && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-gray-600 hover:text-gray-700 underline text-sm"
                  >
                    Clear search
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Searching...' : hasSearched ? 'Update search' : 'Search'}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max price per seat
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      placeholder="50"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min available seats
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      placeholder="1"
                      min="1"
                      max="4"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.minSeats}
                      onChange={(e) => setFilters({ ...filters, minSeats: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {getResultsTitle()}
          </h2>
          {hasSearched && searchResults.length > 0 && (
            <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Exact matches shown first
            </span>
          )}
        </div>

        {/* Results */}
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {searchResults.map((ride) => (
              <RideCard
                key={ride._id}
                ride={ride}
                onBook={handleBookRide}
                onMessage={handleMessage}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">{emptyState.title}</div>
            <p className="text-gray-400">{emptyState.subtitle}</p>
            {hasSearched && (
              <button
                onClick={handleClearSearch}
                className="mt-4 text-blue-600 hover:text-blue-700 underline"
              >
                View all available rides
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RideSearch;