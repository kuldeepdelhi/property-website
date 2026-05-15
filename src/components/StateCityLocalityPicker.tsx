import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PickerProps } from "../types";
import {
  searchLocation,
  getAllStates,
  getCitiesByState,
  getLocalities
} from '../api/dropdown';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faMapMarkerAlt, faChevronRight, faMap } from "@fortawesome/free-solid-svg-icons";

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

const StateCityLocalityPicker: React.FC<PickerProps> = ({
  value,
  onChange,
  errorFields = [],
}) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  
  const [statesList, setStatesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [localitiesList, setLocalitiesList] = useState<any[]>([]);

  const [currentView, setCurrentView] = useState<'search' | 'states' | 'cities' | 'localities'>('search');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const getStateName = (s: any) => typeof s === 'string' ? s : (s?.label || s?.state || s?.name || "");
  const getCityName = (c: any) => typeof c === 'string' ? c : (c?.name || c?.city || c?.label || "");
  const getLocalityName = (l: any) => typeof l === 'string' ? l : (l?.locality || l?.name || l?.label || "");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Load States aur pehli baar ke cities automatically
 // Load States aur pehli baar ke cities automatically
  // <--- Yahan humne dono function ke naam daal diye hain

  const fetchStates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllStates();
      if (res) {
        const data = Array.isArray(res) ? res : (res.data || []);
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
      if (res) {
        const data = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
        setCitiesList(data);
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
    } finally {
      setLoading(false);
    }
  }, []);
useEffect(() => {
    fetchStates();
    // Shuruwat mein saari cities mangwa lene ke liye (optional, backend allow kare toh)
    fetchCities(""); 
  }, [fetchStates, fetchCities]); 
  const fetchLocalities = useCallback(async (cityName: string, stateName: string, search: string = "") => {
    setLoading(true);
    try {
      const res = await getLocalities(cityName, stateName, search);
      if (res) {
        const data = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
        setLocalitiesList(data);
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
      onChange({ state: "", city: "", locality: "" });
      setSearchResults([]);
      setCurrentView('states');
      setSelectedState(null);
      setSelectedCity(null);
    }
  };

  const filteredStates = useMemo(() => {
    if (!value.state || !value.state.trim()) return statesList;
    return statesList.filter((s: any) =>
      getStateName(s).toLowerCase().includes(value.state.toLowerCase())
    );
  }, [statesList, value.state]);

  const filteredCities = useMemo(() => {
    if (!value.city || !value.city.trim()) return citiesList;
    return citiesList.filter((c: any) =>
      getCityName(c).toLowerCase().includes(value.city.toLowerCase())
    );
  }, [citiesList, value.city]);
  
  const filteredLocalities = useMemo(() => {
      if (!value.locality || !value.locality.trim()) return localitiesList;
      return localitiesList.filter((l: any) =>
        getLocalityName(l).toLowerCase().includes(value.locality.toLowerCase())
      );
    }, [localitiesList, value.locality]);

  const handleStateSelect = (state: any) => {
    const stateName = getStateName(state);
    setSelectedState(stateName);
    onChange({
      ...value,
      state: stateName,
      city: "",
      locality: ""
    });
    setCurrentView('cities');
    fetchCities(stateName);
  };

  const handleCitySelect = (city: any) => {
    const cityName = getCityName(city);
    setSelectedCity(cityName);
    onChange({
      ...value,
      city: cityName,
      locality: ""
    });
    setCurrentView('localities');
    fetchLocalities(cityName, selectedState || value.state);
  };

  const handleLocalitySelect = (locality: any) => {
    const localityName = getLocalityName(locality);
    const cityName = selectedCity || value.city || "";
    const stateName = selectedState || value.state || "";

    onChange({
      state: stateName,
      city: cityName,
      locality: localityName,
    });
    setQuery([localityName, cityName, stateName].filter(Boolean).join(", "));
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
            onFocus={() => setCurrentView('search')}
            onKeyDown={(e) => { if (e.key === 'Enter') triggerGlobalSearch(); }}
            placeholder="Type city or locality..."
            className="form-input pl-10 pr-20 w-full rounded-xl py-3 border-gray-200 focus:border-blue-500 transition-all shadow-sm"
          />
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
            >
              <FontAwesomeIcon icon={faSearch} size="sm" />
            </button>
          </div>
        </div>

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
                setShowDropdown(true); // Focu karte hi list dikhao
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentView('states');
                  setShowDropdown(true);
                }
              }}
              placeholder="Maharashtra"
              className={`form-input w-full rounded-xl py-2.5 pr-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 transition-all text-sm font-medium ${isFieldRequired('addressState') ? errorClass : ""}`}
            />
            <button
              type="button"
              onClick={() => {
                setCurrentView('states');
                setShowDropdown(!showDropdown); // Toggle dropdown
              }}
              className="absolute right-2 p-1 transition-colors text-blue-500 hover:text-blue-700"
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
                {loading && statesList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 animate-pulse">Loading States...</div>
                ) : filteredStates.length > 0 ? (
                  filteredStates.map((state, idx) => {
                    const name = getStateName(state);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          handleStateSelect(state);
                          setShowDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 font-medium transition-colors"
                      >
                        {name}
                      </div>
                    )
                  })
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
                setShowDropdown(true); // Focus karte hi list dikhao
                if(value.state && citiesList.length === 0) fetchCities(value.state); // Agar state hai aur cities nahi, toh fetch karo
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentView('cities');
                  setShowDropdown(true);
                }
              }}
              placeholder="Mumbai"
              className={`form-input w-full rounded-xl py-2.5 pr-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 transition-all text-sm font-medium ${isFieldRequired('addressCity') ? errorClass : ""}`}
            />
            <button
              type="button"
              onClick={() => {
                setCurrentView('cities');
                setShowDropdown(!showDropdown);
                if(value.state && citiesList.length === 0) fetchCities(value.state);
              }}
              className="absolute right-2 p-1 transition-colors text-blue-500 hover:text-blue-700"
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
                {loading && citiesList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 animate-pulse">Loading Cities...</div>
                ) : filteredCities.length > 0 ? (
                  filteredCities.map((city, idx) => {
                    const name = getCityName(city);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          handleCitySelect(city);
                          setShowDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 font-medium transition-colors"
                      >
                        {name}
                      </div>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">
                    {value.state ? "No cities found for this state" : "Please select a state first"}
                  </div>
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
                  setShowDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentView('localities');
                  setShowDropdown(true);
                }
              }}
              placeholder="Andheri West"
              className={`form-input w-full rounded-xl py-2.5 pr-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 transition-all text-sm font-medium ${isFieldRequired('addressLocality') ? errorClass : ""}`}
            />
            <button
              type="button"
              onClick={() => {
                setCurrentView('localities');
                setShowDropdown(!showDropdown);
              }}
              className="absolute right-2 p-1 transition-colors text-blue-500 hover:text-blue-700"
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
                {loading && localitiesList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 animate-pulse">Loading Localities...</div>
                ) : filteredLocalities.length > 0 ? (
                  filteredLocalities.map((locality, idx) => {
                    const name = getLocalityName(locality);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          handleLocalitySelect(locality);
                          setShowDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 font-medium transition-colors"
                      >
                        {name}
                      </div>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">
                      {value.city ? "No localities found" : "Please select a city first"}
                  </div>
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