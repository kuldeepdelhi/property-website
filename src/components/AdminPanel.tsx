import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
// import RealImg from './RealImg';
import { animations, variants } from '../theme';
import { useNavigate } from 'react-router-dom';

// interface TempUser {
//   id: string;
//   fullName: string;
//   email: string;
//   mobileNumber: string;
//   userType: string;
//   createdAt: string;
// }

interface TempProperty {
  id: string;
  title: string;
  description?: string;
  category: string;
  subCategory: string;
  propertyPrice: number;
  carpetArea?: number;
  totalBathrooms?: number;
  totalRooms?: number;
  address?: {
    state: string;
    city: string;
    locality: string;
  };
  images?: string[];
  user?: {
    id: string;
    fullName: string;
    userType: string;
    accountType: string;
    mobileNumber: string;
  };
  createdAt?: string;
}

const AdminPanel: React.FC = () => {
  // const userString = localStorage.getItem('user');
  // const user = userString ? JSON.parse(userString) : null;

  // const [tempUsers, setTempUsers] = useState<TempUser[]>([]);
  const [tempProperties, setTempProperties] = useState<TempProperty[]>([]);
  // console.log("test :",tempProperties)
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'properties'>('properties');
  // const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Pagination and filter states for properties
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  // const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  // const [scrollPosition, setScrollPosition] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    subCategory: '',
    minPrice: '',
    maxPrice: '',
    mobileNumber: '',
    city: ''
  });



  useEffect(() => {
    // fetchTempUsers();
    fetchTempProperties(1, {});
  }, []);

  // Scroll to top button effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300);
      // setScrollPosition(scrollTop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFilterChange = (filterType: string, value: string) => {
    let sanitizedValue: string = value;

    if (filterType === 'minPrice' || filterType === 'maxPrice') {
      // keep only digits, no negatives
      sanitizedValue = value.replace(/[^0-9]/g, '');
    }

    if (filterType === 'mobileNumber') {
      // keep digits, cap at 15 to avoid overly long inputs
      sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 15);
    }

    setFilters(prev => ({
      ...prev,
      [filterType]: sanitizedValue
    }));
  };

  const handleFilterSubmit = () => {
    const min = filters.minPrice ? parseInt(filters.minPrice, 10) : undefined;
    const max = filters.maxPrice ? parseInt(filters.maxPrice, 10) : undefined;

    if (min !== undefined && max !== undefined && min > max) {
      alert('Min Price cannot be greater than Max Price.');
      return;
    }

    // Reset to first page when applying filters
    fetchTempProperties(1, filters);
    setCurrentPage(1);
    // Smooth scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page: number) => {
    if (!loading) {
      fetchTempProperties(page, filters);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // const fetchTempUsers = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get('https://nextopson.com/temp/api/v1/temp/users');
  //     setTempUsers(response.data.users);
  //   } catch (error) {
  //     console.error('Error fetching temp users:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchTempProperties = async (page = 1, filterParams = {}) => {
    try {
      setLoading(true);
      // const response = await axios.get('http://192.168.1.7:5001/api/v1/temp/properties', {
      const response = await axios.get('https://nextopson.com/temp/api/v1/temp/properties', {
        params: {
          page: page,
          limit: 12,
          ...filterParams
        }
      });

      // Handle response structure based on the API response
      const properties = response.data.properties || [];
      const pagination = response.data.pagination || {};

      // console.log("property : ", properties)

      setTempProperties(properties);
      setTotalPages(pagination.totalPages || 1);
      setTotalProperties(pagination.total || 0);
      setCurrentPage(page);
      // setHasMore(pagination.hasMore);
    } catch (error) {
      console.error('Error fetching temp properties:', error);
    } finally {
      setLoading(false);
    }
  };



  // const handleDeleteTempUser = async (userId: string) => {
  //   if (window.confirm('Are you sure you want to delete this temporary user?')) {
  //     try {
  //       setLoading(true);
  //       await axios.delete(`https://nextopson.com/temp/api/v1/temp/users/${userId}`);
  //       // Update local state instead of refetching everything
  //       setTempUsers(prev => prev.filter(u => u.id !== userId));
  //       alert('Temporary user deleted successfully!');
  //     } catch (error: any) {
  //       alert(error.response?.data?.message || 'Error deleting temporary user');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };

  // const handleDeleteTempProperty = async (propertyId: string) => {
  //   if (!window.confirm('Are you sure you want to delete this property?')) return;

  //   // Optimistic UI: disable actions for that card
  //   setDeletingPropertyId(propertyId);
  //   try {
  //     await axios.delete(`https://nextopson.com/temp/api/v1/temp/properties/${propertyId}`);
  //     // Remove from state immediately
  //     setTempProperties(prev => prev.filter(p => p.id !== propertyId));
  //     setTotalProperties(prev => Math.max(0, prev - 1));
  //     console.log('Temporary property deleted successfully!');
  //   } catch (error: any) {
  //     console.log(error.response?.data?.message || 'Error deleting temporary property');
  //     alert('Error deleting property');
  //   } finally {
  //     setDeletingPropertyId(null);
  //   }
  // };



  return (
    <motion.div
      className="min-h-screen py-8 bg-gray-50"
      variants={variants.springDrop}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={animations.springDrop}
    >
      <div className="container">
        <div className="card">
          {/* Header */}
          <div className="card-header flex justify-between items-center">
           <div>
             <h1 className="text-2xl font-bold text-gray-900">
              Listing Page - Temporary Properties
            </h1>
            <p className="text-gray-600">
              Manage temporary user properties
            </p>
           </div>
           <div>
            <button 
            onClick={() => navigate("/upload-property")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200">
              Upload Property
            </button>
           </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {/* <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Temporary Users ({tempUsers.length})
              </button> */}
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'properties'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Temporary Properties ({totalProperties})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="card-body">
            {loading && (
              <div className="text-center py-4">
                <div className="spinner" />
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            )}

            {/* Temporary Users Tab */}
            {/* {activeTab === 'users' && !loading && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  Temporary Users
                </h2>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Type</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tempUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="font-medium text-gray-900">
                            {user.fullName}
                          </td>
                          <td className="text-gray-500">
                            {user.mobileNumber}
                          </td>
                          <td className="text-gray-500">
                            {user.userType}
                          </td>
                          <td className="text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              onClick={() => handleDeleteTempUser(user.id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )} */}

            {/* Temporary Properties Tab */}
            {activeTab === 'properties' && !loading && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Temporary Properties</h2>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-outline"
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={filters.category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleFilterSubmit(); }}
                          className="form-input"
                        >
                          <option value="">All Categories</option>
                          <option value="Residential">Residential</option>
                          <option value="Commercial">Commercial</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                        <input
                          type="number"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleFilterSubmit(); }}
                          placeholder="Min Price"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                        <input
                          type="number"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleFilterSubmit(); }}
                          placeholder="Max Price"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input
                          type="tel"
                          value={filters.mobileNumber}
                          onChange={(e) => handleFilterChange('mobileNumber', e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleFilterSubmit(); }}
                          placeholder="Mobile Number"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
                        <select
                          value={filters.subCategory}
                          onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleFilterSubmit(); }}
                          className="form-input"
                        >
                          <option value="">All Types</option>
                          <option value="Flats">Flats</option>
                          <option value="Builder Floors">Builder Floors</option>
                          <option value="House Villas">House Villas</option>
                          <option value="Plots">Plots</option>
                          <option value="Farmhouses">Farmhouses</option>
                          <option value="Hotels">Hotels</option>
                          <option value="Lands">Lands</option>
                          <option value="Office Spaces">Office Spaces</option>
                          <option value="Hostels">Hostels</option>
                          <option value="Shops Showrooms">Shops Showrooms</option>
                          <option value="Restaurants">Restaurants</option>
                          <option value="Cafes">Cafes</option>
                          <option value="Bars">Bars</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <select
                          value={filters.city}
                          onChange={(e) => handleFilterChange('city', e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleFilterSubmit(); }}
                          className="form-input"
                        >
                          <option value="">All Cities</option>
                          <option value="Bhopal">Bhopal</option>
                          <option value="Indore">Indore</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Lucknow">Lucknow</option>
                        </select>
                      </div>
                    </div>

                    {/* Filter Action Buttons */}
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={handleFilterSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="spinner mr-2" />
                            Applying...
                          </div>
                        ) : (
                          'Apply Filters'
                        )}
                      </button>

                      <button
                        onClick={() => {
                          const cleared = {
                            category: '',
                            subCategory: '',
                            minPrice: '',
                            maxPrice: '',
                            mobileNumber: ''
                          };
                          setFilters(
                            {
                              ...cleared,
                              city: ''
                            }
                          );
                          setCurrentPage(1);
                          fetchTempProperties(1, cleared);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {tempProperties
                      .map((property) => (
                        <motion.div
                          key={property.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="bg-white rounded-lg shadow-md overflow-hidden relative"
                        >
                          {/* {deletingPropertyId === property.id && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                              <div className="spinner" />
                            </div>
                          )} */}
                          {/* Property Image */}
                          <div className="h-48 bg-gray-200 relative">
                            {property.images && property.images.length > 0 ? (
                              // <RealImg
                              //   imageKey={property.images[0]}
                              //   width="100%"
                              //   height="100%"
                              //   alt={property.title}
                              //   className="w-full h-full object-cover"
                              //   showSkeleton={true}
                              //   loadingDelay={300}
                              // />
                              <img src={property.images[0]} alt={property.title} className='w-full max-h-48 object-contain' />

                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Property Details */}
                          <div className="p-4">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                              {property.title}
                            </h3>

                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Category:</span>
                                <span className="font-medium">{property.category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Type:</span>
                                <span className="font-medium">{property.subCategory}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Price:</span>
                                <span className="font-medium text-green-600">₹{property.propertyPrice?.toLocaleString()}</span>
                              </div>
                              {property.carpetArea && (
                                <div className="flex justify-between">
                                  <span>Area:</span>
                                  <span className="font-medium">{property.carpetArea} sq ft</span>
                                </div>
                              )}
                              {property.address && (
                                <div className="flex justify-between">
                                  <span>Location:</span>
                                  <span className="font-medium">{property.address.locality},{property.address.city}, {property.address.state}</span>
                                </div>
                              )}
                              {property.user && (
                                <div className="flex justify-between">
                                  <span>Owner:</span>
                                  <span className="font-medium">{property.user.fullName}</span>
                                </div>
                              )}
                              {property.user && (
                                <div className="flex justify-between">
                                  <span>Contact </span>
                                  <button onClick={() => `tel:${property.user?.mobileNumber}`} className="font-medium">{property.user.mobileNumber}</button>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex justify-between">
                              <button
                                onClick={() => { navigate("/upload-property", { state: { propertyId: property.id } }) }}
                                className='text-blue-600 hover:text-blue-900 text-sm font-medium'>
                                Edit
                              </button>
                              {/* <button
                                onClick={() => handleDeleteTempProperty(property.id)}
                                disabled={deletingPropertyId === property.id}
                                className={`text-sm font-medium ${deletingPropertyId === property.id ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                              >
                                Delete
                              </button> */}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {tempProperties.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing page {currentPage} of {totalPages}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: {tempProperties.length} properties
                      </div>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <nav className="flex items-center space-x-1">
                        {/* Previous Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || loading}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          const shouldShow =
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1);

                          if (!shouldShow) {
                            // Show ellipsis
                            if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span key={`ellipsis-${page}`} className="px-3 py-2 text-gray-500">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              disabled={loading}
                              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === page
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                        {/* Next Button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages || loading}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>

                    {loading && (
                      <div className="mt-4 flex justify-center">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <div className="spinner" />
                          <span>Loading properties...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* No Properties Message */}
                {!loading && tempProperties.length === 0 && (
                  <div className="mt-8 text-center">
                    <div className="text-gray-500 text-lg font-medium mb-2">
                      No properties found
                    </div>
                    <div className="text-gray-400 text-sm">
                      Try adjusting your filters
                    </div>
                  </div>
                )}
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
};

export default AdminPanel; 