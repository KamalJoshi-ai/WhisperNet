import { FaChevronDown } from "react-icons/fa";
import countries from "../../utils/countriles";
import useLoginStore from "../../store/useLoginStore";
import React from "react";
export default function CountrySelect({ theme }) {
  const { selectedCountry, setSelectedCountry } = useLoginStore();
 
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className=" w-1/3 h-12 ">
      {/* Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex justify-between w-full h-12 items-center py-2 px-4 text-sm font-medium 
          ${
            theme === "dark"
              ? "text-white bg-gray-800 border-gray-700"
              : "text-gray-900 bg-gray-100 border-gray-300"
          } 
          border rounded-md focus:ring-1 focus:ring-green-500`}
      >
        <span className="flex items-center gap-2">
          <img
            src={selectedCountry?.flag || countries[46].flag}
            alt={selectedCountry?.name || countries[46].name}
            className="w-6 h-4 object-cover rounded-sm"
          />
          {selectedCountry?.dialCode || countries[46].dialCode}
        </span>
        <FaChevronDown className="ml-2 cursor-pointer" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-20 mt-2  rounded-md shadow-lg max-h-60 overflow-y-visible
            ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-300"
            }`}
        >
          {/* Search Input */}
          <div className="p-2">
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-green-500 outline-none
                ${
                  theme === "dark"
                    ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-100 border border-gray-300 text-black placeholder-gray-500"
                }`}
            />
          </div>

          {/* Country List */}
          <ul className="max-h-40 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <li
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country); 
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-4 py-2 cursor-pointer text-sm flex items-center gap-2
                    ${
                      theme === "dark"
                        ? "hover:bg-gray-700 text-white"
                        : "hover:bg-gray-100 text-black"
                    }`}
                >
                  <img
                    src={country.flag}
                    alt={country.name}
                    className="w-6 h-4 object-cover rounded-sm"
                  />

                  <span>{country.name}</span>

                  <span className="ml-auto text-gray-500">
                    {country.dialCode}
                  </span>

                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500 text-sm">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}