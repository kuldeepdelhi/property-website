import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PickerProps } from "../types";
import {
  searchLocation,
  // getLocationDetails,
  getAllStates,
  getCitiesByState,
  getLocalities
} from '../api/dropdown';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faMapMarkerAlt, faChevronRight, faMap } from "@fortawesome/free-solid-svg-icons";

// Define the shape of search results based on API response
interface LocationResult {
  id: string;
  name: string;
  type: "country" | "state" | "city" | "locality" | "area" | "neighborhood";
  displayText: string;
  state: string;
  city?: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  isActive: boolean;
}

interface StateItem {
  id?: string;
  name?: string;
  state: string;
  type: string;
  cityCount?: number;
}

interface CityItem {
  id: string;
  name: string;
  state: string;
}

const StateCityLocalityPicker: React.FC<PickerProps> = ({
  value,
  onChange,
  errorFields = [],
}) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [statesList, setStatesList] = useState<StateItem[]>([]);
  const [citiesList, setCitiesList] = useState<CityItem[]>([]);
  const [localitiesList, setLocalitiesList] = useState<string[]>([]);

  const [currentView, setCurrentView] = useState<'search' | 'states' | 'cities' | 'localities'>('search');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ref to handle click outside
  const wrapperRef = useRef<HTMLDivElement>(null);



  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const fetchStates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllStates();
      if (res && res.data) {
        // Handle both simple array and wrapped response
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setStatesList(data);
      }
    } catch (err) {
      console.error("Error fetching states:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCities = useCallback(async (stateName: string, search: string = "") => {
    setLoading(true);
    try {
      const res = await getCitiesByState(stateName, search);
      if (res && res.data) {
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setCitiesList(data);
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLocalities = useCallback(async (cityName: string, stateName: string, search: string = "") => {
    setLoading(true);
    try {
      const res = await getLocalities(cityName, stateName, search);
      // getLocalities in dropdown.ts returns raw data
      if (Array.isArray(res)) {
        setLocalitiesList(res);
      } else if (res && res.data) {
        setLocalitiesList(res.data);
      }
    } catch (err) {
      console.error("Error fetching localities:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerGlobalSearch = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentView('states');
      fetchStates();
      setShowDropdown(true);
      return;
    }

    setCurrentView('search');
    setLoading(true);
    setShowDropdown(true);

    try {
      const res = await searchLocation(query);
      if (res && res.data) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error searching location:", err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setQuery(text);
    if (text === "") {
      // If user clears the search bar manually, we reset all fields
      onChange({ state: "", city: "", locality: "" });
      setSearchResults([]);
      setCurrentView('states');
      setSelectedState(null);
      setSelectedCity(null);
    }
  };

  const filteredStates = useMemo(() => {
    if (!value.state.trim()) return statesList;
    return statesList.filter(s =>
      (s.state || s.name || "").toLowerCase().includes(value.state.toLowerCase())
    );
  }, [statesList, value.state]);

  const filteredCities = useMemo(() => {
    if (!value.city.trim()) return citiesList;
    return citiesList.filter(c =>
      c.name.toLowerCase().includes(value.city.toLowerCase())
    );
  }, [citiesList, value.city]);


  const handleStateSelect = (state: StateItem) => {
    const stateName = state.state || state.name || "";
    setSelectedState(stateName);

    // Update parent state so input box shows the value
    onChange({
      ...value,
      state: stateName,
      city: "", // Clear city and locality when state changes
      locality: ""
    });

    setCurrentView('cities');
    fetchCities(stateName);
  };

  const handleCitySelect = (city: CityItem) => {
    setSelectedCity(city.name);

    // Update parent state so input box shows the value
    onChange({
      ...value,
      city: city.name,
      locality: "" // Clear locality when city changes
    });

    setCurrentView('localities');
    fetchLocalities(city.name, selectedState || city.state);
  };

  const handleLocalitySelect = (locality: string) => {
    // Preserve manual entries if dropdown selection state is missing
    const cityName = selectedCity || value.city || "";
    const stateName = selectedState || value.state || "";

    onChange({
      state: stateName,
      city: cityName,
      locality: locality,
    });

    setQuery([locality, cityName, stateName].filter(Boolean).join(", "));
    setShowDropdown(false);
  };

  const handleGlobalSelect = (item: LocationResult) => {
    setQuery(item.displayText);
    setSelectedState(item.state || null);
    setSelectedCity(item.city || null);
    onChange({
      state: item.state || "",
      city: item.city || "",
      locality: item.locality || "",
    });
    setShowDropdown(false);
  };


  const handleClear = () => {
    setQuery("");
    setSearchResults([]);
    setSelectedState(null);
    setSelectedCity(null);
    onChange({ state: "", city: "", locality: "" });
    setCurrentView('states');
    if (statesList.length === 0) fetchStates();
  };

  const isFieldRequired = (fieldName: string) => errorFields.includes(fieldName);

  const renderIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'state': return faMap;
      case 'city': return faMapMarkerAlt;
      case 'locality': return faMapMarkerAlt;
      default: return faMapMarkerAlt;
    }
  };

  const handleFieldChange = (field: keyof typeof value, text: string) => {
    onChange({
      ...value,
      [field]: text
    });
  };

  const errorClass = "border-red-500 ring-1 ring-red-500 shadow-sm shadow-red-100";

  return (
    <div className="space-y-6 w-full" ref={wrapperRef}>
      {/* Quick Search Section */}
      <div className="relative w-full">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
          Quick Search Address
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              setCurrentView('search');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                triggerGlobalSearch();
              }
            }}
            placeholder="Type city or locality..."
            className="form-input pl-10 pr-20 w-full rounded-xl py-3 border-gray-200 focus:border-blue-500 transition-all shadow-sm"
          />

          {/* <div className="absolute left-3 text-gray-400">
            <FontAwesomeIcon icon={faSearch} />
          </div> */}

          <div className="absolute right-3 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
            <button
              type="button"
              onClick={triggerGlobalSearch}
              disabled={!query.trim()}
              className={`${!query.trim() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} p-2 rounded-lg transition-colors flex items-center justify-center`}
              title="Search"
            >
              <FontAwesomeIcon icon={faSearch} size="sm" />
            </button>
          </div>
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showDropdown && currentView === 'search' && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-80 overflow-hidden flex flex-col"
            >
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {loading ? (
                  <div className="p-8 text-center text-sm text-gray-400">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleGlobalSelect(item)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 border-gray-50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <FontAwesomeIcon icon={renderIcon(item.type)} size="sm" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 truncate">{item.displayText}</p>
                      </div>
                      <FontAwesomeIcon icon={faChevronRight} className="text-gray-300 text-[10px]" />
                    </div>
                  ))
                ) : query.length > 2 && (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">No results found</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-px bg-gray-100 flex-1"></div>
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Or Select Manually</span>
        <div className="h-px bg-gray-100 flex-1"></div>
      </div>

      {/* Detail Fields Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* State Field */}
        <div className="flex flex-col relative">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
            State <span className="text-red-500 text-[10px]">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={value.state}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              onFocus={() => {
                setCurrentView('states');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value.state.trim()) {
                  setCurrentView('states');
                  setShowDropdown(true);
                  fetchStates();
                }
              }}
              placeholder="Maharashtra"
              className={`form-input w-full rounded-xl py-2.5 pr-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 transition-all text-sm font-medium ${isFieldRequired('addressState') ? errorClass : ""}`}
            />
            <button
              type="button"
              onClick={() => {
                setCurrentView('states');
                setShowDropdown(true);
                fetchStates();
              }}
              disabled={!value.state.trim()}
              className={`absolute right-2 p-1 transition-colors ${!value.state.trim() ? 'text-gray-300 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700'}`}
              title="Search States"
            >
              <FontAwesomeIcon icon={faSearch} size="xs" />
            </button>
          </div>
          <AnimatePresence>
            {showDropdown && currentView === 'states' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 z-[60] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar"
              >
                {loading ? (
                  <div className="p-4 text-center text-xs text-gray-400 animate-pulse">Loading States...</div>
                ) : filteredStates.length > 0 ? (
                  filteredStates.map((state) => (
                    <div
                      key={state.id || state.state || state.name}
                      onClick={() => {
                        handleStateSelect(state);
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 font-medium transition-colors"
                    >
                      {state.state || state.name}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">No states found</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* City Field */}
        <div className="flex flex-col relative">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
            City <span className="text-red-500 text-[10px]">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={value.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              onFocus={() => {
                setCurrentView('cities');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value.city.trim()) {
                  if (value.state) {
                    setCurrentView('cities');
                    setShowDropdown(true);
                    fetchCities(value.state, value.city);
                  } else {
                    setCurrentView('states');
                    setShowDropdown(true);
                    fetchStates();
                  }
                }
              }}
              placeholder="Mumbai"
              className={`form-input w-full rounded-xl py-2.5 pr-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 transition-all text-sm font-medium ${isFieldRequired('addressCity') ? errorClass : ""}`}
            />
            <button
              type="button"
              onClick={() => {
                if (value.state) {
                  setCurrentView('cities');
                  setShowDropdown(true);
                  fetchCities(value.state, value.city);
                } else {
                  setCurrentView('states');
                  setShowDropdown(true);
                  fetchStates();
                }
              }}
              disabled={!value.city.trim()}
              className={`absolute right-2 p-1 transition-colors ${!value.city.trim() ? 'text-gray-300 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700'}`}
              title="Search Cities"
            >
              <FontAwesomeIcon icon={faSearch} size="xs" />
            </button>
          </div>
          <AnimatePresence>
            {showDropdown && currentView === 'cities' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 z-[60] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar"
              >
                {loading ? (
                  <div className="p-4 text-center text-xs text-gray-400 animate-pulse">Loading Cities...</div>
                ) : filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <div
                      key={city.id}
                      onClick={() => {
                        handleCitySelect(city);
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 font-medium transition-colors"
                    >
                      {city.name}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">No cities found</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Locality Field */}
        <div className="flex flex-col relative">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
            Locality <span className="text-red-500 text-[10px]">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={value.locality}
              onChange={(e) => handleFieldChange('locality', e.target.value)}
              onFocus={() => {
                setCurrentView('localities');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value.locality.trim()) {
                  if (value.city) {
                    setCurrentView('localities');
                    setShowDropdown(true);
                    fetchLocalities(value.city, value.state, value.locality);
                  } else if (value.state) {
                    setCurrentView('cities');
                    setShowDropdown(true);
                    fetchCities(value.state);
                  } else {
                    setCurrentView('states');
                    setShowDropdown(true);
                    fetchStates();
                  }
                }
              }}
              placeholder="Andheri West"
              className={`form-input w-full rounded-xl py-2.5 pr-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 transition-all text-sm font-medium ${isFieldRequired('addressLocality') ? errorClass : ""}`}
            />
            <button
              type="button"
              onClick={() => {
                if (value.city) {
                  setCurrentView('localities');
                  setShowDropdown(true);
                  fetchLocalities(value.city, value.state, value.locality);
                } else if (value.state) {
                  setCurrentView('cities');
                  setShowDropdown(true);
                  fetchCities(value.state);
                } else {
                  setCurrentView('states');
                  setShowDropdown(true);
                  fetchStates();
                }
              }}
              disabled={!value.locality.trim()}
              className={`absolute right-2 p-1 transition-colors ${!value.locality.trim() ? 'text-gray-300 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700'}`}
              title="Search Localities"
            >
              <FontAwesomeIcon icon={faSearch} size="xs" />
            </button>
          </div>
          <AnimatePresence>
            {showDropdown && currentView === 'localities' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 z-[60] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar"
              >
                {loading ? (
                  <div className="p-4 text-center text-xs text-gray-400 animate-pulse">Loading Localities...</div>
                ) : localitiesList.length > 0 ? (
                  localitiesList.map((locality, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        handleLocalitySelect(locality);
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 font-medium transition-colors"
                    >
                      {locality}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">No localities found</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StateCityLocalityPicker;
