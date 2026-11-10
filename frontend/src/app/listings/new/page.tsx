'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  Building2, 
  Home, 
  Car, 
  LandPlot, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  MapPin, 
  Plus, 
  Trash2,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  Link as LinkIcon,
  Star,
  Camera,
  Loader2,
  UploadCloud,
  X
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AIAssistantModal } from '@/components/AIAssistantModal';
import { TransactionType, AssetCategory, RentalPeriod } from '@/lib/types';
import { api } from '@/lib/api';

export default function NewListingPage() {
  const router = useRouter();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [enhancingAI, setEnhancingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [transactionType, setTransactionType] = useState<TransactionType>('SALE');
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('RESIDENTIAL');

  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Pricing
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>('per_year');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [serviceCharge, setServiceCharge] = useState('');

  // Geography
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('Lagos');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [address, setAddress] = useState('');
  const [locationPrivacy, setLocationPrivacy] = useState<'EXACT' | 'APPROXIMATE' | 'NEIGHBOURHOOD_ONLY'>('EXACT');

  // Dynamic Category Attributes
  // Residential
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('3');
  const [propertyType, setPropertyType] = useState('apartment');
  const [furnishingStatus, setFurnishingStatus] = useState('furnished');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    '24/7 Power Supply',
    'Uniformed Security',
    'Fast Internet / WiFi'
  ]);

  // Land
  const [landSize, setLandSize] = useState('1000');
  const [landUnit, setLandUnit] = useState('sqm');
  const [permittedUse, setPermittedUse] = useState('Residential Land');
  const [titleDocument, setTitleDocument] = useState("Governor's Consent");
  const [roadAccess, setRoadAccess] = useState('Tarred Road');

  // Commercial
  const [commercialType, setCommercialType] = useState('Office Space');
  const [floorArea, setFloorArea] = useState('250');

  // Vehicle
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('Land Cruiser');
  const [year, setYear] = useState('2023');
  const [transmission, setTransmission] = useState('Automatic');
  const [fuelType, setFuelType] = useState('Petrol');
  const [condition, setCondition] = useState('Foreign Used');
  const [vehicleServiceType, setVehicleServiceType] = useState('chauffeur_driven');

  // Media State: Supports up to 5 photos via device upload or direct link
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaTab, setMediaTab] = useState<'device' | 'link'>('device');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [imagesList, setImagesList] = useState<Array<{ url: string; caption: string; is_cover: boolean }>>([]);

  const toggleAmenity = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  // Upload pictures from device (up to 5 total)
  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setMediaError(null);
    const remainingSlots = 5 - imagesList.length;

    if (remainingSlots <= 0) {
      setMediaError('Maximum 5 pictures allowed per listing. Remove an existing photo to upload another.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesArray = Array.from(files);
    if (filesArray.length > remainingSlots) {
      setMediaError(`Only ${remainingSlots} more picture(s) allowed. Uploading the first ${remainingSlots}.`);
    }

    const selectedFiles = filesArray.slice(0, remainingSlots);

    // Validate size (10MB)
    const oversize = selectedFiles.find(f => f.size > 10 * 1024 * 1024);
    if (oversize) {
      setMediaError(`File "${oversize.name}" exceeds the 10MB limit. Please upload an image under 10MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingImages(true);
    try {
      const res = await api.uploadMedia(selectedFiles);
      if (res.images && res.images.length > 0) {
        const newImages = res.images.map((item, idx) => ({
          url: item.url,
          caption: item.original_name.split('.')[0] || (assetCategory === 'VEHICLE' ? 'Auto Photo' : 'Property Photo'),
          is_cover: imagesList.length === 0 && idx === 0,
        }));
        setImagesList(prev => [...prev, ...newImages]);
      }
    } catch (err: any) {
      setMediaError(err.message || 'Failed to upload pictures. Please try again or use direct links.');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add picture via direct link
  const handleAddLink = () => {
    setMediaError(null);
    if (imagesList.length >= 5) {
      setMediaError('Maximum 5 pictures allowed per listing. Remove an existing picture first.');
      return;
    }

    if (!imageUrl.trim()) {
      setMediaError('Please enter a valid picture URL.');
      return;
    }

    try {
      new URL(imageUrl.trim());
    } catch {
      setMediaError('Please enter a valid website URL starting with http:// or https://');
      return;
    }

    setImagesList(prev => [
      ...prev,
      {
        url: imageUrl.trim(),
        caption: imageCaption.trim() || (assetCategory === 'VEHICLE' ? 'Auto Photo' : 'Property Photo'),
        is_cover: prev.length === 0,
      }
    ]);

    setImageUrl('');
    setImageCaption('');
  };

  const handleRemoveImage = (index: number) => {
    setMediaError(null);
    setImagesList(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index]?.is_cover && updated.length > 0) {
        updated[0].is_cover = true;
      }
      return updated;
    });
  };

  const handleSetCover = (index: number) => {
    setImagesList(prev =>
      prev.map((img, i) => ({
        ...img,
        is_cover: i === index,
      }))
    );
  };

  // AI Description Enhancement
  const handleAIEnhance = async () => {
    if (!title.trim()) {
      alert('Please enter a basic title first so the AI can craft an enhanced description.');
      return;
    }
    setEnhancingAI(true);
    try {
      const res = await fetch('/api/v1/ai/enhance-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category: assetCategory,
          transaction_type: transactionType,
          features: {
            state,
            city,
            neighbourhood,
            bedrooms: assetCategory === 'RESIDENTIAL' ? bedrooms : undefined,
            brand: assetCategory === 'VEHICLE' ? brand : undefined,
            model: assetCategory === 'VEHICLE' ? model : undefined,
            land_size: assetCategory === 'LAND' ? landSize : undefined,
          }
        })
      });
      const data = await res.json();
      if (data.data) {
        if (data.data.suggested_title) setTitle(data.data.suggested_title);
        if (data.data.suggested_description) setDescription(data.data.suggested_description);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnhancingAI(false);
    }
  };

  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !state || !city) {
      setError('Please fill out all required fields before publishing.');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Build attributes payload
    let attributes: Record<string, any> = {};
    if (assetCategory === 'RESIDENTIAL') {
      attributes = {
        property_type: propertyType,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        furnishing_status: furnishingStatus,
        amenities: selectedAmenities,
      };
    } else if (assetCategory === 'LAND') {
      attributes = {
        land_size: Number(landSize),
        land_unit: landUnit,
        permitted_use: permittedUse,
        title_document: titleDocument,
        road_access: roadAccess,
      };
    } else if (assetCategory === 'COMMERCIAL') {
      attributes = {
        commercial_type: commercialType,
        floor_area: Number(floorArea),
      };
    } else if (assetCategory === 'VEHICLE') {
      attributes = {
        brand,
        model,
        year: Number(year),
        transmission,
        fuel_type: fuelType,
        condition,
        rental_service_type: vehicleServiceType,
      };
    }

    const payload: any = {
      title,
      description,
      transaction_type: transactionType,
      asset_category: assetCategory,
      price: Number(price),
      currency,
      is_negotiable: isNegotiable,
      country,
      state,
      city,
      neighbourhood: neighbourhood || undefined,
      address: address || undefined,
      location_privacy: locationPrivacy,
      attributes,
      images: imagesList,
      status: 'PUBLISHED'
    };

    if (transactionType === 'RENT' || transactionType === 'LEASE') {
      payload.rental_period = rentalPeriod;
      if (securityDeposit) payload.security_deposit = Number(securityDeposit);
      if (serviceCharge) payload.service_charge = Number(serviceCharge);
    }

    try {
      // In development, default to active test user if no token present
      const token = typeof window !== 'undefined' ? localStorage.getItem('propertyhub_token') : null;
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };

      // If no token stored yet, obtain quick agent bearer token
      if (!token) {
        const authRes = await fetch('/api/v1/auth/login', {
          method: 'POST',
          body: new URLSearchParams({
            username: 'agent@apexproperties.ng',
            password: 'AgentPass123!'
          })
        });
        const authData = await authRes.json();
        if (authData.access_token) {
          headers['Authorization'] = `Bearer ${authData.access_token}`;
          localStorage.setItem('propertyhub_token', authData.access_token);
        }
      } else {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/v1/listings/', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Failed to publish listing.');
      }

      const created = await res.json();
      const newId = created.data?.id;
      if (newId) {
        router.push(`/listings/${newId}`);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while publishing the listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const amenityOptions = [
    '24/7 Power Supply',
    'Swimming Pool',
    'Fitness Gym',
    'Uniformed Security',
    'Fast Internet / WiFi',
    'CCTV Surveillance',
    'Smart Home Automation',
    'Fitted Kitchen',
    'Water Treatment Plant',
    'Elevator / Lift',
    'Cinema Room'
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar onOpenAI={() => setAiModalOpen(true)} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel and return to marketplace</span>
          </Link>
        </div>

        {/* Wizard Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-500/40 text-brand-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Publisher Wizard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Publish a Property or Automobile</h1>
          <p className="text-xs text-gray-400 max-w-lg mx-auto">
            Create high-converting listings with AI-assisted copywriting and automatic match broadcasting across Nigeria and international markets.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-10 px-2">
          {[
            { num: 1, label: 'Classification' },
            { num: 2, label: 'Basic Info' },
            { num: 3, label: 'Pricing & Terms' },
            { num: 4, label: 'Attributes & Media' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === s.num
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 ring-2 ring-brand-400'
                  : currentStep > s.num
                  ? 'bg-brand-950 text-brand-400 border border-brand-500/40'
                  : 'bg-gray-900 text-gray-500 border border-gray-800'
              }`}>
                {currentStep > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs hidden sm:inline ${currentStep === s.num ? 'text-white font-bold' : 'text-gray-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-gray-800 shadow-2xl">
          
          {/* STEP 1: TRANSACTION TYPE & CATEGORY */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-white mb-3">1. Select Transaction Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'SALE' as TransactionType, label: 'SALE (Outright)', desc: 'Sell land, houses, or vehicles' },
                    { type: 'RENT' as TransactionType, label: 'RENT (Residential/Vehicles)', desc: 'Short-let, yearly rent, or car rental' },
                    { type: 'LEASE' as TransactionType, label: 'LEASE (Commercial/Land)', desc: 'Long-term contractual occupation' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setTransactionType(item.type)}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        transactionType === item.type
                          ? 'bg-brand-950/60 border-brand-500 text-white shadow-md'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                      }`}
                    >
                      <div className="font-bold text-xs mb-1 text-white">{item.label}</div>
                      <div className="text-[11px] text-gray-400">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-3">2. Select Asset Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { cat: 'LAND' as AssetCategory, label: 'Land', icon: LandPlot },
                    { cat: 'RESIDENTIAL' as AssetCategory, label: 'Houses & Flats', icon: Home },
                    { cat: 'COMMERCIAL' as AssetCategory, label: 'Commercial & Warehouses', icon: Briefcase },
                    { cat: 'VEHICLE' as AssetCategory, label: 'Cars & Automobiles', icon: Car },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = assetCategory === item.cat;
                    return (
                      <button
                        key={item.cat}
                        type="button"
                        onClick={() => setAssetCategory(item.cat)}
                        className={`p-4 rounded-2xl text-center border transition-all flex flex-col items-center gap-2 ${
                          isSelected
                            ? 'bg-brand-950/60 border-brand-500 text-white shadow-md'
                            : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-brand-400' : 'text-gray-500'}`} />
                        <span className="text-xs font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
                >
                  <span>Continue to Basic Information</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BASIC INFO & AI COPYWRITER */}
          {currentStep === 2 && (
            <div className="space-y-6">
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">Listing Title *</label>
                  <button
                    type="button"
                    onClick={handleAIEnhance}
                    disabled={enhancingAI}
                    className="flex items-center gap-1.5 text-[11px] text-brand-300 bg-brand-950 px-3 py-1 rounded-lg border border-brand-500/40 hover:bg-brand-900 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
                    <span>{enhancingAI ? 'Generating with AI...' : 'Enhance with AI'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Contemporary 5-Bedroom Detached Duplex with Swimming Pool"
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Detailed Marketing Description *</label>
                <textarea
                  rows={6}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide comprehensive details about the property, neighbourhood advantages, finishing, legal status, or automotive condition..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-900 text-gray-300 hover:text-white text-xs font-medium border border-gray-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!title.trim() || !description.trim()) {
                      alert('Please provide both a title and description.');
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
                >
                  <span>Continue to Pricing & Terms</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: PRICING & TERMS (MANDATORY RENTAL PERIODS) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    {transactionType === 'SALE' ? 'Asking Price *' : 'Rental / Lease Rate *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">₦</span>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 85000000"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="NGN">NGN (Nigerian Naira ₦)</option>
                    <option value="USD">USD (US Dollar $)</option>
                    <option value="GBP">GBP (British Pound £)</option>
                    <option value="EUR">EUR (Euro €)</option>
                  </select>
                </div>
              </div>

              {/* Mandatory Rental Period Selector (If RENT or LEASE) */}
              {(transactionType === 'RENT' || transactionType === 'LEASE') && (
                <div className="p-4 rounded-2xl bg-gray-950 border border-brand-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Mandatory Rental Billing Frequency</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'per_night' as RentalPeriod, label: 'Per Night (Short-let)' },
                      { id: 'per_day' as RentalPeriod, label: 'Per Day (Daily)' },
                      { id: 'per_week' as RentalPeriod, label: 'Per Week' },
                      { id: 'per_month' as RentalPeriod, label: 'Per Month' },
                      { id: 'per_year' as RentalPeriod, label: 'Per Year (Per Annum)' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setRentalPeriod(p.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
                          rentalPeriod === p.id
                            ? 'bg-brand-600 text-white shadow-md'
                            : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Refundable Security Deposit (₦)</label>
                      <input
                        type="number"
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                        placeholder="e.g. 500000"
                        className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Annual Service Charge (₦)</label>
                      <input
                        type="number"
                        value={serviceCharge}
                        onChange={(e) => setServiceCharge(e.target.value)}
                        placeholder="e.g. 1500000"
                        className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="negotiable"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="rounded bg-gray-950 border-gray-800 text-brand-500 focus:ring-0"
                />
                <label htmlFor="negotiable" className="text-xs text-gray-300 cursor-pointer">
                  Price is open to reasonable negotiation
                </label>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-900 text-gray-300 hover:text-white text-xs font-medium border border-gray-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!price || Number(price) <= 0) {
                      alert('Please provide a valid price.');
                      return;
                    }
                    setCurrentStep(4);
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
                >
                  <span>Continue to Specifications & Media</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: CATEGORY SPECIFICATIONS & MEDIA UPLOADS */}
          {currentStep === 4 && (
            <form onSubmit={handlePublishListing} className="space-y-6">
              
              {/* Geography */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Geographic Location</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Lagos, Abuja FCT"
                      className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">City / Region *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lekki, Ikeja, Maitama"
                      className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Neighbourhood</label>
                    <input
                      type="text"
                      value={neighbourhood}
                      onChange={(e) => setNeighbourhood(e.target.value)}
                      placeholder="e.g. Lekki Phase 1, Old Ikoyi"
                      className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Category-Specific Form Fields */}
              {assetCategory === 'RESIDENTIAL' && (
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Residential Details</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Bedrooms</label>
                      <input
                        type="number"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Bathrooms</label>
                      <input
                        type="number"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Property Type</label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                      >
                        <option value="Mini Flat">Mini Flat</option>
                        <option value="Self-Contain">Self-Contain</option>
                        <option value="Blocks of Flats">Blocks of Flats</option>
                        <option value="Detached Duplex">Detached Duplex</option>
                        <option value="Semi-Detached Duplex">Semi-Detached Duplex</option>
                        <option value="Detached Bungalow">Detached Bungalow</option>
                        <option value="Semi-Detached Bungalow">Semi-Detached Bungalow</option>
                        <option value="Terraced Bungalow">Terraced Bungalow</option>
                        <option value="Terraced Duplex">Terraced Duplex</option>
                        <option value="Apartment / Flat">Apartment / Flat</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Serviced Short-let">Serviced Short-let</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Furnishing</label>
                      <select
                        value={furnishingStatus}
                        onChange={(e) => setFurnishingStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                      >
                        <option value="furnished">Fully Furnished</option>
                        <option value="semi_furnished">Semi Furnished</option>
                        <option value="unfurnished">Unfurnished</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-2">Amenities Checklist</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {amenityOptions.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleAmenity(a)}
                          className={`p-2 rounded-xl text-xs text-left border transition-all flex items-center gap-2 ${
                            selectedAmenities.includes(a)
                              ? 'bg-brand-950/60 border-brand-500 text-brand-300'
                              : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${selectedAmenities.includes(a) ? 'text-brand-400' : 'text-gray-600'}`} />
                          <span className="truncate">{a}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {assetCategory === 'COMMERCIAL' && (
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Commercial Property Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Commercial Property Type</label>
                      <select
                        value={commercialType}
                        onChange={(e) => setCommercialType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                      >
                        <option value="Factory">Factory</option>
                        <option value="School">School</option>
                        <option value="Church">Church</option>
                        <option value="Restaurant / Bar">Restaurant / Bar</option>
                        <option value="Filling Station">Filling Station</option>
                        <option value="Tank Farm">Tank Farm</option>
                        <option value="Plaza / Complex / Mall">Plaza / Complex / Mall</option>
                        <option value="Warehouse">Warehouse</option>
                        <option value="Shop">Shop</option>
                        <option value="Hotel / Guest House">Hotel / Guest House</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Office Space">Office Space</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Floor Area (sqm)</label>
                      <input
                        type="number"
                        value={floorArea}
                        onChange={(e) => setFloorArea(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {assetCategory === 'LAND' && (
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Land Specifications</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Land Type / Use</label>
                      <select
                        value={permittedUse}
                        onChange={(e) => setPermittedUse(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                      >
                        <option value="Residential Land">Residential Land</option>
                        <option value="Commercial Land">Commercial Land</option>
                        <option value="Industrial Land">Industrial Land</option>
                        <option value="Mixed-Used Land">Mixed-Used Land</option>
                        <option value="Farm Land">Farm Land</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Land Size</label>
                      <input
                        type="number"
                        value={landSize}
                        onChange={(e) => setLandSize(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Measurement Unit</label>
                      <select
                        value={landUnit}
                        onChange={(e) => setLandUnit(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                      >
                        <option value="sqm">Square Meters (sqm)</option>
                        <option value="plots">Plots</option>
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Title Document</label>
                      <select
                        value={titleDocument}
                        onChange={(e) => setTitleDocument(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                      >
                        <option value="Certificate of Occupancy (C of O)">Certificate of Occupancy (C of O)</option>
                        <option value="Governor's Consent">Governor&apos;s Consent</option>
                        <option value="Gazette">Gazette</option>
                        <option value="Excision">Excision</option>
                        <option value="Deed of Assignment">Deed of Assignment</option>
                        <option value="Survey Plan">Registered Survey Plan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Road Access</label>
                      <select
                        value={roadAccess}
                        onChange={(e) => setRoadAccess(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                      >
                        <option value="Tarred Road">Direct Tarred Road</option>
                        <option value="Paved Road">Interlocked Paved Road</option>
                        <option value="Graded Earth Road">Graded Earth Road</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {assetCategory === 'VEHICLE' && (
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Automobile Specifications</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Brand / Make</label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Model</label>
                      <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Year</label>
                      <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Condition</label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                      >
                        <option value="Brand New">Brand New</option>
                        <option value="Fairly Used">Fairly Used (Foreign Used / Tokunbo)</option>
                        <option value="Nigerian Used">Nigerian Used</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Photos & Media: Up to 5 Pictures (Device Upload or Picture Links) */}
              <div className="space-y-4 pt-6 border-t border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-brand-400" />
                      <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                        {assetCategory === 'VEHICLE' ? 'Auto Photos & Showcase' : 'Property Photos & Showcase'}
                      </h3>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Upload from your device or paste direct links. You can add up to 5 high-resolution pictures.
                    </p>
                  </div>
                  
                  {/* Photo Counter Pill */}
                  <div className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto border ${
                    imagesList.length >= 5
                      ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                      : imagesList.length > 0
                      ? 'bg-brand-950/80 border-brand-500/40 text-brand-300'
                      : 'bg-gray-900 border-gray-800 text-gray-400'
                  }`}>
                    {imagesList.length >= 5 ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>5 / 5 Photos (Max Reached)</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>{imagesList.length} of 5 Photos Added</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Media Tab Selector */}
                <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                  <button
                    type="button"
                    onClick={() => { setMediaTab('device'); setMediaError(null); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                      mediaTab === 'device'
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                        : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload From Device</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMediaTab('link'); setMediaError(null); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                      mediaTab === 'link'
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                        : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Add Picture Link</span>
                  </button>
                </div>

                {/* Media Error Message */}
                {mediaError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{mediaError}</span>
                    </div>
                    <button type="button" onClick={() => setMediaError(null)} className="text-red-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* TAB 1: DEVICE UPLOAD DROPZONE */}
                {mediaTab === 'device' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleDeviceUpload}
                      disabled={imagesList.length >= 5 || uploadingImages}
                      className="hidden"
                    />

                    <div
                      onClick={() => {
                        if (imagesList.length < 5 && !uploadingImages && fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                        imagesList.length >= 5
                          ? 'border-gray-800 bg-gray-950/40 opacity-60 cursor-not-allowed'
                          : uploadingImages
                          ? 'border-brand-500/50 bg-brand-950/20 cursor-wait'
                          : 'border-gray-800 hover:border-brand-500/50 hover:bg-gray-900/50 cursor-pointer bg-gray-950/60'
                      }`}
                    >
                      {uploadingImages ? (
                        <div className="flex flex-col items-center justify-center py-2">
                          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-2" />
                          <p className="text-xs font-bold text-white">Uploading & Optimizing Pictures...</p>
                          <p className="text-[11px] text-gray-400 mt-1">Saving high-resolution images to platform storage</p>
                        </div>
                      ) : imagesList.length >= 5 ? (
                        <div className="flex flex-col items-center justify-center py-2">
                          <CheckCircle2 className="w-8 h-8 text-amber-400 mb-2" />
                          <p className="text-xs font-bold text-white">Maximum 5 Pictures Reached</p>
                          <p className="text-[11px] text-gray-400 mt-1">To replace an image, delete one from your gallery below.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-2">
                          <div className="w-12 h-12 rounded-2xl bg-brand-950 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-3 shadow-lg shadow-brand-500/20">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-white">
                            Click to Browse or Drag & Drop Pictures from Your Device
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            PNG, JPG, JPEG, WebP, AVIF up to 10MB each • Up to 5 photos total ({5 - imagesList.length} slots left)
                          </p>
                          <button
                            type="button"
                            className="mt-3 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Camera className="w-3.5 h-3.5 text-brand-400" />
                            <span>Select Photos From Device</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: PASTE PICTURE LINK */}
                {mediaTab === 'link' && (
                  <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          disabled={imagesList.length >= 5}
                          placeholder="Paste image URL (e.g. https://images.unsplash.com/... or cloud image link)"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0b0f19] border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500 disabled:opacity-50"
                        />
                      </div>
                      <input
                        type="text"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        disabled={imagesList.length >= 5}
                        placeholder="Caption (e.g. Front View)"
                        className="sm:w-48 px-3 py-2.5 rounded-xl bg-[#0b0f19] border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={handleAddLink}
                        disabled={imagesList.length >= 5 || !imageUrl.trim()}
                        className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-600/25 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Picture</span>
                      </button>
                    </div>

                    {/* Category Caption Suggestions */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Quick labels:</span>
                      {(assetCategory === 'VEHICLE'
                        ? ['Front View', 'Dashboard & Interior', 'Rear Angle', 'Engine Bay', 'Side Profile']
                        : ['Living Room', 'Master Bedroom', 'Kitchen & Dining', 'Exterior / Compound', 'Floor Plan / Title']
                      ).map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setImageCaption(label)}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-gray-900 hover:bg-brand-950 border border-gray-800 hover:border-brand-500/40 text-gray-300 hover:text-brand-300 transition-all"
                        >
                          + {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5-PHOTO GALLERY SHOWCASE GRID */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-300">
                      Listing Photo Gallery ({imagesList.length} of 5 slots filled)
                    </span>
                    {imagesList.length > 0 && (
                      <span className="text-[11px] text-gray-400">
                        First or starred photo is your listing's primary cover image.
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {/* Render Added Photos */}
                    {imagesList.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-[16/11] rounded-2xl overflow-hidden border transition-all group ${
                          img.is_cover
                            ? 'border-brand-500 ring-2 ring-brand-500/50 shadow-lg shadow-brand-500/20'
                            : 'border-gray-800 hover:border-gray-700 bg-gray-950'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.caption || `Photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Cover Badge */}
                        {img.is_cover ? (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] bg-brand-600 text-white font-bold flex items-center gap-1 shadow-md shadow-brand-600/40">
                            <Star className="w-3 h-3 fill-current" />
                            Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetCover(idx)}
                            title="Set as main cover photo"
                            className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] bg-black/70 hover:bg-brand-600 text-gray-300 hover:text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                          >
                            <Star className="w-3 h-3" />
                            Set Cover
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove photo"
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/75 hover:bg-red-600 text-red-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Caption Overlay */}
                        <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                          <p className="text-[10px] text-white truncate font-medium">
                            {img.caption || `Photo #${idx + 1}`}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Render Empty Slots up to 5 */}
                    {Array.from({ length: Math.max(0, 5 - imagesList.length) }).map((_, emptyIdx) => {
                      const slotNum = imagesList.length + emptyIdx + 1;
                      return (
                        <div
                          key={`empty-${emptyIdx}`}
                          onClick={() => {
                            if (mediaTab === 'device' && fileInputRef.current) {
                              fileInputRef.current.click();
                            }
                          }}
                          className="aspect-[16/11] rounded-2xl border-2 border-dashed border-gray-800/80 hover:border-brand-500/40 bg-gray-950/40 hover:bg-gray-900/30 flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer group"
                        >
                          <div className="w-7 h-7 rounded-xl bg-gray-900 group-hover:bg-brand-950 border border-gray-800 group-hover:border-brand-500/30 flex items-center justify-center text-gray-500 group-hover:text-brand-400 transition-colors mb-1">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-semibold text-gray-500 group-hover:text-gray-300">
                            Slot {slotNum}
                          </span>
                          <span className="text-[9px] text-gray-600">
                            {emptyIdx === 0 && imagesList.length === 0 ? 'Primary Photo' : 'Optional Photo'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Final Submit & Publish Button */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-900 text-gray-300 hover:text-white text-xs font-medium border border-gray-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-xl shadow-brand-600/30 transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{submitting ? 'Publishing & Triggering AI Matching...' : 'Publish Listing Now'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </main>

      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      <Footer />
    </div>
  );
}
