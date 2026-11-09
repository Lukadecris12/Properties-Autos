'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Home, 
  Car, 
  LandPlot,
  Building2,
  Calendar,
  Tag,
  SlidersHorizontal,
  RotateCcw,
  BedDouble,
  CheckCircle2
} from 'lucide-react';
import { TransactionType, AssetCategory } from '@/lib/types';

export interface SearchFilterParams {
  keyword?: string;
  state?: string;
  min_price?: number;
  max_price?: number;
  subtype?: string;
  brand?: string;
  model?: string;
  condition?: string;
  year?: number;
  bedrooms?: number;
}

interface SearchHeroProps {
  selectedTransaction: TransactionType;
  onSelectTransaction: (tx: TransactionType) => void;
  selectedCategory: AssetCategory;
  onSelectCategory: (cat: AssetCategory) => void;
  onSearch: (params: SearchFilterParams) => void;
  onNLPSearch: (query: string) => void;
}

export const RESIDENTIAL_SUBTYPES = [
  'Mini Flat',
  'Self-Contain',
  'Blocks of Flats',
  'Detached Duplex',
  'Semi-Detached Duplex',
  'Detached Bungalow',
  'Semi-Detached Bungalow',
  'Terraced Bungalow',
  'Terraced Duplex',
  'Apartment / Flat',
  'Penthouse',
  'Serviced Short-let',
];

export const COMMERCIAL_SUBTYPES = [
  'Factory',
  'School',
  'Church',
  'Restaurant / Bar',
  'Filling Station',
  'Tank Farm',
  'Plaza / Complex / Mall',
  'Warehouse',
  'Shop',
  'Hotel / Guest House',
  'Hostel',
  'Office Space',
];

export const LAND_SUBTYPES = [
  'Residential Land',
  'Commercial Land',
  'Industrial Land',
  'Mixed-Used Land',
  'Farm Land',
];

export const CAR_CONDITIONS = [
  { id: 'Brand New', label: 'Brand New' },
  { id: 'Fairly Used', label: 'Fairly Used (Foreign / Tokunbo)' },
  { id: 'Nigerian Used', label: 'Nigerian Used' },
];

export const CAR_BRANDS_MODELS: Record<string, string[]> = {
  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Highlander', 'Land Cruiser', 'Land Cruiser Prado', 'Hilux', 'Avalon', 'Venza', 'Sienna', 'Coaster'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'AMG G 63 (G-Wagon)', 'CLA', 'ML 350'],
  'Lexus': ['RX 350', 'RX 450h', 'ES 350', 'GX 460', 'LX 570', 'LX 600', 'IS 250', 'NX 300'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'HR-V', 'Crosstour'],
  'Land Rover': ['Range Rover Autobiography', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Defender', 'Discovery'],
  'Ford': ['Explorer', 'Edge', 'F-150', 'F-150 Raptor', 'Escape', 'Mustang', 'Ranger'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X6', 'X7', 'M5 Competition'],
  'Hyundai': ['Tucson', 'Santa Fe', 'Elantra', 'Sonata', 'Palisade', 'Creta'],
  'Kia': ['Sportage', 'Sorento', 'Rio', 'Cerato', 'Optima', 'Selto'],
  'Porsche': ['Cayenne', 'Macan', '911 Carrera', 'Panamera', 'Taycan'],
  'Audi': ['Q5', 'Q7', 'Q8', 'A4', 'A6', 'RS7 Sportback'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X Plaid', 'Cybertruck'],
  'Nissan': ['Altima', 'Maxima', 'Pathfinder', 'Murano', 'Rogue', 'Patrol'],
  'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Touareg', 'Jetta'],
  'Peugeot': ['3008', '5008', '508', '301'],
  'Innoson (IVM)': ['Ikenga', 'G5T', 'G6', 'G80', 'Carrier'],
};

const CAR_YEARS = Array.from({ length: 22 }, (_, i) => 2026 - i);

export const SearchHero: React.FC<SearchHeroProps> = ({
  selectedTransaction,
  onSelectTransaction,
  selectedCategory,
  onSelectCategory,
  onSearch,
  onNLPSearch,
}) => {
  const [isAIMode, setIsAIMode] = useState(false);
  const [nlpQuery, setNlpQuery] = useState('');

  // Common Filters
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [subtype, setSubtype] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  // Vehicle Specific Filters
  const [carCondition, setCarCondition] = useState('');
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');

  // Reset category-specific sub-filters when switching main category
  useEffect(() => {
    setSubtype('');
    setBedrooms('');
    setCarCondition('');
    setCarBrand('');
    setCarModel('');
    setCarYear('');
  }, [selectedCategory]);

  const buildSearchParams = (overrides: Partial<SearchFilterParams> = {}): SearchFilterParams => {
    return {
      state: location.trim() || undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      subtype: subtype || undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      condition: carCondition || undefined,
      brand: carBrand || undefined,
      model: carModel.trim() || undefined,
      year: carYear ? Number(carYear) : undefined,
      ...overrides,
    };
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(buildSearchParams());
  };

  const handleQuickSubtypeSelect = (selected: string) => {
    const nextSubtype = subtype === selected ? '' : selected;
    setSubtype(nextSubtype);
    onSearch(buildSearchParams({ subtype: nextSubtype || undefined }));
  };

  const handleQuickConditionSelect = (selectedCond: string) => {
    const nextCond = carCondition === selectedCond ? '' : selectedCond;
    setCarCondition(nextCond);
    onSearch(buildSearchParams({ condition: nextCond || undefined }));
  };

  const handleResetFilters = () => {
    setLocation('');
    setMaxPrice('');
    setSubtype('');
    setBedrooms('');
    setCarCondition('');
    setCarBrand('');
    setCarModel('');
    setCarYear('');
    onSearch({});
  };

  const handleNLPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nlpQuery.trim()) {
      onNLPSearch(nlpQuery);
    }
  };

  const categories = [
    { id: 'RESIDENTIAL' as AssetCategory, label: 'Houses & Apartments', icon: Home },
    { id: 'COMMERCIAL' as AssetCategory, label: 'Commercial Property', icon: Building2 },
    { id: 'LAND' as AssetCategory, label: 'Land', icon: LandPlot },
    { id: 'VEHICLE' as AssetCategory, label: 'Cars & Vehicles', icon: Car },
  ];

  const activeSubtypes =
    selectedCategory === 'RESIDENTIAL'
      ? RESIDENTIAL_SUBTYPES
      : selectedCategory === 'COMMERCIAL'
      ? COMMERCIAL_SUBTYPES
      : selectedCategory === 'LAND'
      ? LAND_SUBTYPES
      : [];

  const hasActiveFilters = Boolean(
    location || maxPrice || subtype || bedrooms || carCondition || carBrand || carModel || carYear
  );

  const availableModels = carBrand && CAR_BRANDS_MODELS[carBrand] ? CAR_BRANDS_MODELS[carBrand] : [];

  return (
    <div className="relative pt-10 pb-16 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-gold-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Top Tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900/90 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-6 shadow-md backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
          <span>Global AI-Powered Property & Automobile Marketplace</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Find, Buy & Rent <br className="hidden sm:inline" />
          <span className="emerald-gradient">Properties</span> & <span className="gold-gradient">Cars</span> with AI
        </h1>

        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10">
          Nigeria&apos;s premier digital marketplace connecting verified property buyers, tenants, agents, developers, and auto dealers.
        </p>

        {/* Central Search Card */}
        <div className="glass-panel rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-800 text-left">
          
          {/* Header Row: BUY | RENT & AI Mode Switch */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-gray-800">
            
            {/* 1. Transaction Type Selector: BUY | RENT */}
            <div className="flex items-center bg-gray-950/80 p-1.5 rounded-2xl border border-gray-800">
              {(['SALE', 'RENT'] as const).map((tx) => {
                const label = tx === 'SALE' ? 'BUY' : 'RENT';
                const isActive = selectedTransaction === tx;
                return (
                  <button
                    key={tx}
                    type="button"
                    onClick={() => onSelectTransaction(tx)}
                    className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 tracking-wider ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && !isAIMode && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gray-900/90 text-gray-400 hover:text-white border border-gray-800 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              {/* AI Natural Language Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsAIMode(!isAIMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isAIMode
                    ? 'bg-brand-950 text-brand-300 border-brand-500 shadow-md shadow-brand-500/20'
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${isAIMode ? 'text-brand-400' : 'text-gray-500'}`} />
                <span>{isAIMode ? 'AI Search: Active' : 'Switch to AI Sentence Search'}</span>
              </button>
            </div>

          </div>

          {/* 2. Asset Category Selector: Houses & Apartments | Commercial Property | Land | Cars & Vehicles */}
          {!isAIMode && (
            <div className="pt-4 pb-3">
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onSelectCategory(cat.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                        isActive
                          ? 'bg-gray-800 text-brand-400 border border-brand-500/50 shadow-sm'
                          : 'bg-gray-950/40 text-gray-400 hover:text-white border border-gray-800/80 hover:bg-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 2B. Subcategory Quick-Selection Pills for Property & Land */}
              {activeSubtypes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3 h-3 text-brand-400" />
                      {selectedCategory === 'RESIDENTIAL' && 'Select Specific House / Apartment Type:'}
                      {selectedCategory === 'COMMERCIAL' && 'Select Specific Commercial Property Type:'}
                      {selectedCategory === 'LAND' && 'Select Specific Land Type:'}
                    </span>
                    {subtype && (
                      <button
                        type="button"
                        onClick={() => handleQuickSubtypeSelect(subtype)}
                        className="text-[11px] text-brand-400 hover:underline"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSubtypes.map((item) => {
                      const isSelected = subtype === item;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleQuickSubtypeSelect(item)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/60 shadow-sm'
                              : 'bg-gray-950/70 text-gray-400 hover:text-white border border-gray-800/80 hover:border-gray-700'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-brand-400" />}
                          <span>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2C. Vehicle Condition Quick-Selection Pills when Cars & Vehicles is selected */}
              {selectedCategory === 'VEHICLE' && (
                <div className="mt-3 pt-3 border-t border-gray-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-brand-400" />
                      Select Vehicle Condition:
                    </span>
                    {carCondition && (
                      <button
                        type="button"
                        onClick={() => handleQuickConditionSelect(carCondition)}
                        className="text-[11px] text-brand-400 hover:underline"
                      >
                        All conditions
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CAR_CONDITIONS.map((cond) => {
                      const isSelected = carCondition === cond.id;
                      return (
                        <button
                          key={cond.id}
                          type="button"
                          onClick={() => handleQuickConditionSelect(cond.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/60 shadow-sm'
                              : 'bg-gray-950/70 text-gray-400 hover:text-white border border-gray-800/80 hover:border-gray-700'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                          <span>{cond.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Search Input Form */}
          {isAIMode ? (
            /* AI Natural Language Search Form */
            <form onSubmit={handleNLPSubmit} className="pt-4 space-y-3">
              <div className="relative">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
                <input
                  type="text"
                  value={nlpQuery}
                  onChange={(e) => setNlpQuery(e.target.value)}
                  placeholder="Type anything naturally, e.g., 'Find a 3-bedroom detached duplex in Lekki under 150m' or 'Fairly used Toyota Prado in Abuja'"
                  className="w-full pl-12 pr-32 py-4 rounded-2xl bg-gray-950 border border-brand-500/40 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  AI Search
                </button>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
                <span>Try examples:</span>
                <button
                  type="button"
                  onClick={() => setNlpQuery("3-bedroom apartment for rent in Victoria Island under 15 million")}
                  className="text-gray-400 hover:text-brand-400 underline"
                >
                  3-bed rent in VI under 15m
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setNlpQuery("Toyota Prado SUV for sale in Lekki")}
                  className="text-gray-400 hover:text-brand-400 underline"
                >
                  Toyota Prado in Lekki
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setNlpQuery("Commercial warehouse or office space in Ikeja")}
                  className="text-gray-400 hover:text-brand-400 underline"
                >
                  Warehouse / Office in Ikeja
                </button>
              </div>
            </form>
          ) : selectedCategory === 'VEHICLE' ? (
            /* ============================================================
               VEHICLE / CAR MULTI-FILTER SEARCH FORM
               (Condition, Brand, Model, Year, Car Price, Location)
               ============================================================ */
            <form onSubmit={handleStandardSubmit} className="pt-3 space-y-3 border-t border-gray-800/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                
                {/* 1. Car Condition Dropdown */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Condition
                  </label>
                  <select
                    value={carCondition}
                    onChange={(e) => setCarCondition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="">All Conditions (New, Fairly Used, Nigerian Used)</option>
                    <option value="Brand New">Brand New</option>
                    <option value="Fairly Used">Fairly Used (Foreign Used / Tokunbo)</option>
                    <option value="Nigerian Used">Nigerian Used</option>
                  </select>
                </div>

                {/* 2. Car Brand / Make */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Brand / Make
                  </label>
                  <select
                    value={carBrand}
                    onChange={(e) => {
                      setCarBrand(e.target.value);
                      setCarModel('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="">All Car Brands</option>
                    {Object.keys(CAR_BRANDS_MODELS).map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Car Model */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Model
                  </label>
                  {availableModels.length > 0 ? (
                    <select
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    >
                      <option value="">All {carBrand} Models</option>
                      {availableModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      placeholder="Enter Model (e.g. Camry, Prado, GLE 450)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500"
                    />
                  )}
                </div>

                {/* 4. Year of Manufacture */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Year
                  </label>
                  <select
                    value={carYear}
                    onChange={(e) => setCarYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Any Year</option>
                    {CAR_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Car Price / Max Budget */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    {selectedTransaction === 'SALE' ? 'Max Car Price (₦)' : 'Max Rental Rate (₦)'}
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder={selectedTransaction === 'SALE' ? 'e.g. 50,000,000' : 'e.g. 150,000'}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* 6. Location */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State, or Area (e.g. Lagos, Abuja)"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

              </div>

              {/* Search Submit Button */}
              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Cars</span>
                </button>
              </div>
            </form>
          ) : (
            /* ============================================================
               PROPERTY & LAND MULTI-FILTER SEARCH FORM
               (Houses & Apartments, Commercial Property, Land)
               ============================================================ */
            <form onSubmit={handleStandardSubmit} className="pt-3 border-t border-gray-800/60">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                
                {/* Specific Subtype Dropdown */}
                <div className={selectedCategory === 'RESIDENTIAL' ? 'sm:col-span-3' : 'sm:col-span-4'}>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    {selectedCategory === 'RESIDENTIAL' && 'House / Apartment Type'}
                    {selectedCategory === 'COMMERCIAL' && 'Commercial Property Type'}
                    {selectedCategory === 'LAND' && 'Land Category / Use'}
                  </label>
                  <select
                    value={subtype}
                    onChange={(e) => setSubtype(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="">
                      {selectedCategory === 'RESIDENTIAL' && 'All Houses & Apartments'}
                      {selectedCategory === 'COMMERCIAL' && 'All Commercial Properties'}
                      {selectedCategory === 'LAND' && 'All Land Types'}
                    </option>
                    {activeSubtypes.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bedrooms Dropdown (Only for Houses & Apartments) */}
                {selectedCategory === 'RESIDENTIAL' && (
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Bedrooms
                    </label>
                    <div className="relative">
                      <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full pl-8 pr-2 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                      >
                        <option value="">Any Beds</option>
                        <option value="1">1 Bedroom</option>
                        <option value="2">2 Bedrooms</option>
                        <option value="3">3 Bedrooms</option>
                        <option value="4">4 Bedrooms</option>
                        <option value="5">5+ Bedrooms</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Location Input */}
                <div className={selectedCategory === 'RESIDENTIAL' ? 'sm:col-span-3' : 'sm:col-span-3'}>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Lekki, Victoria Island, Abuja..."
                      className="w-full pl-9 pr-3 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Price / Budget Filter */}
                <div className={selectedCategory === 'RESIDENTIAL' ? 'sm:col-span-2' : 'sm:col-span-3'}>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Max Budget (₦)
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder={
                      selectedTransaction === 'SALE'
                        ? 'Max Price (₦)'
                        : 'Max Rent (₦)'
                    }
                    className="w-full px-3 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Search Button */}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>

              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
