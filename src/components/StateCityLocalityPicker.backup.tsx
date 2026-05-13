import React, { useEffect, useRef, useState } from "react";
import { State, City } from "country-state-city";
import { AnimatePresence, motion } from "framer-motion";
import { PickerProps } from "../types";
import { getLocalities } from "../api/dropdown";

const StateCityLocalityPicker: React.FC<PickerProps> = ({
  value,
  onChange,
  errorFields = [],
}) => {
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);

  const [searchLocality, setSearchLocality] = useState("");
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);

  const prevStateRef = useRef("");
  const prevCityRef = useRef("");

  /* ---------- STATES ---------- */
  useEffect(() => {
    setStates(State.getStatesOfCountry("IN"));
  }, []);

  /* ---------- CITIES ---------- */
  useEffect(() => {
    if (!value.state) {
      setCities([]);
      return;
    }

    const stateChanged = prevStateRef.current !== value.state;
    const selectedState = states.find((s) => s.name === value.state);

    if (selectedState) {
      setCities(City.getCitiesOfState("IN", selectedState.isoCode));
    }

    if (stateChanged && prevStateRef.current) {
      onChange({ state: value.state, city: "", locality: "" });
      setLocalities([]);
    }

    prevStateRef.current = value.state;
  }, [value.state, states, onChange]);

  /* ---------- LOCALITIES ---------- */
  useEffect(() => {
    if (!value.city) {
      setLocalities([]);
      return;
    }

    const cityChanged = prevCityRef.current !== value.city;
    if (cityChanged && prevCityRef.current) {
      setSearchLocality("");
      onChange({ ...value, locality: "" });
      setLocalities([]);
    }

    prevCityRef.current = value.city;
  }, [value.city, value, onChange]);

  const fetchLocalities = async (search?: string) => {
    if (!value.city || !value.state) return;
    const res = await getLocalities(value.city, value.state, search);
    setLocalities(res);
    setShowLocalityDropdown(true);
  };

  /* ---------- UI ---------- */
  return (
    <>
      {/* STATE */}
      <select
        value={value.state}
        onChange={(e) =>
          onChange({ state: e.target.value, city: "", locality: "" })
        }
        className={`form-input ${errorFields.includes("addressState") ? "border-red-500 ring-1 ring-red-500" : ""
          }`}
      >
        <option value="">Select State</option>
        {states.map((s) => (
          <option key={s.isoCode} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>

      {/* CITY */}
      <select
        value={value.city}
        disabled={!value.state}
        onChange={(e) =>
          onChange({ ...value, city: e.target.value, locality: "" })
        }
        className={`form-input ${errorFields.includes("addressCity") ? "border-red-500 ring-1 ring-red-500" : ""
          }`}
      >
        <option value="">
          {!value.state ? "Select State first" : "Select City"}
        </option>
        {cities.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      {/* LOCALITY */}
      {value.city ? (
        <div className="relative">
          <div className="relative flex items-center">
            <input
              value={searchLocality}
              onChange={(e) => setSearchLocality(e.target.value)}
              onFocus={() => fetchLocalities()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // 🚫 form submit stop
                  fetchLocalities(searchLocality); // 🔍 search only
                }
              }}
              placeholder="Search locality"
              className={`form-input pr-10 ${errorFields.includes("addressLocality") ? "border-red-500 ring-1 ring-red-500" : ""
                }`}
            />

            {/* Search Button */}
            <button
              type="button"
              disabled={!searchLocality.trim()}
              onClick={() => fetchLocalities(searchLocality)}
              className="absolute right-3 text-gray-400 hover:text-gray-800"
              aria-label="Search locality"
            >
              Search
            </button>
          </div>

          <AnimatePresence>
            {showLocalityDropdown && localities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute z-50 w-full bg-white border rounded shadow max-h-56 overflow-y-auto"
              >
                {localities.map((loc) => (
                  <div
                    key={loc}
                    onClick={() => {
                      onChange({ ...value, locality: loc });
                      setSearchLocality(loc);
                      setShowLocalityDropdown(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {loc}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Select City first</p>
      )}
    </>
  );
};

export default StateCityLocalityPicker;
