/**
 * @file pages/Admin/AdminDashboard.jsx
 * @description Centralized admin dashboard with modular tab sections.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Calendar, Car, Users, Settings, Tag, Shield, 
  Wrench, Package, Download, Database, FileText, Palette, Plus, Trash2, ToggleLeft, ToggleRight,
  Search, ArrowUp, ArrowDown, Check, X, Eye, Save, GripVertical, Upload, Loader2, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { getFullImageUrl } from '../../utils/imageUrl';



const AutocompleteField = ({ label, value, onChange, options, placeholder = '', disabled = false }) => {
  const [show, setShow] = useState(false);
  const filtered = options.filter(o => o.toLowerCase().includes(value.toLowerCase()) && o.toLowerCase() !== value.toLowerCase());

  return (
    <div className="space-y-2 relative">
      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm disabled:opacity-50" 
        required 
        disabled={disabled}
      />
      {show && filtered.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-100 shadow-xl mt-1 max-h-40 overflow-y-auto">
          {filtered.map(opt => (
            <div 
              key={opt}
              onClick={() => {
                onChange(opt);
                setShow(false);
              }}
              className="px-4 py-2 text-sm hover:bg-premium-light-gray cursor-pointer text-gray-700"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AsyncBrandAutocomplete = ({ label, value, onChange, onSelect, placeholder = '', disabled = false }) => {
  const [show, setShow] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!show || disabled) return;
    
    setLoading(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const query = value ? `where=make like "${value}*"&` : '';
        const url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?${query}group_by=make&limit=50`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && data.results) {
          const makes = data.results.map(r => r.make).filter(Boolean);
          setOptions(makes);
        }
      } catch (err) {
        console.error("Error fetching brands:", err);
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [value, show, disabled]);

  return (
    <div className="space-y-2 relative">
      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 250)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm disabled:opacity-50" 
        required 
        disabled={disabled}
      />
      {show && !disabled && (
        <div className="absolute z-10 w-full bg-white border border-gray-100 shadow-xl mt-1 max-h-40 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Recherche...</div>
          ) : options.length > 0 ? (
            options.map(opt => (
              <div 
                key={opt}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt);
                  if (onSelect) onSelect(opt);
                  setShow(false);
                }}
                className="px-4 py-2 text-sm hover:bg-premium-light-gray cursor-pointer text-gray-700"
              >
                {opt}
              </div>
            ))
          ) : value ? (
            <div className="px-4 py-2 text-sm text-gray-500">Aucune marque trouvée</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

const AsyncModelAutocomplete = ({ label, value, onChange, onSelect, brand, placeholder = '', disabled = false }) => {
  const [show, setShow] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!brand || !show || disabled) return;
    
    setLoading(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const query = value ? `and model like "${value}*"` : '';
        const url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?where=make like "${brand}" ${query}&group_by=model&limit=50`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && data.results) {
          const models = data.results.map(r => r.model).filter(Boolean);
          setOptions(models);
        }
      } catch (err) {
        console.error("Error fetching models:", err);
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [value, brand, show, disabled]);

  return (
    <div className="space-y-2 relative">
      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 250)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm disabled:opacity-50" 
        required 
        disabled={disabled || !brand}
      />
      {show && !disabled && (
        <div className="absolute z-10 w-full bg-white border border-gray-100 shadow-xl mt-1 max-h-40 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Recherche...</div>
          ) : options.length > 0 ? (
            options.map(opt => (
              <div 
                key={opt}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt);
                  if (onSelect) onSelect(opt);
                  setShow(false);
                }}
                className="px-4 py-2 text-sm hover:bg-premium-light-gray cursor-pointer text-gray-700"
              >
                {opt}
              </div>
            ))
          ) : value ? (
            <div className="px-4 py-2 text-sm text-gray-500">Aucun modèle trouvé</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

// Simple tab button component
const TabButton = ({ active, icon: Icon, label, onClick }) => {
  const RenderIcon = Icon;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-4 text-left transition-colors border-l-2 ${
        active 
          ? 'border-premium-gold bg-premium-light-gray text-premium-black' 
          : 'border-transparent text-gray-500 hover:bg-gray-50'
      }`}
    >
      {RenderIcon && <RenderIcon size={16} className={active ? 'text-premium-gold' : ''} />}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
};

// --- Sub-components for each tab ---

const StatsTab = ({ stats }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Véhicules', value: stats.vehicleCount, icon: Car, sub: stats.activeMaintenanceCount > 0 ? `${stats.activeMaintenanceCount} en maintenance` : null },
        { label: 'Réservations', value: stats.bookingCount, icon: Calendar },
        { label: 'Clients', value: stats.userCount, icon: Users },
        { label: 'Maintenances', value: stats.maintenanceCount, icon: Wrench },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-premium-light-gray flex items-center justify-center text-premium-gold">
            <stat.icon size={20} />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-gray-400">{stat.label}</p>
            <p className="text-2xl font-serif text-premium-black">{stat.value}</p>
            {stat.sub && (
              <p className="text-[10px] text-orange-600 font-semibold mt-1">{stat.sub}</p>
            )}
          </div>
        </div>
      ))}
    </div>

    {stats.maintenanceAlerts?.length > 0 && (
      <div className="bg-orange-50 border border-orange-200 p-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-800 mb-4 flex items-center gap-2">
          <Shield size={14} /> Alertes Maintenance
        </h3>
        <ul className="space-y-2">
          {stats.maintenanceAlerts.map(v => (
            <li key={v.id} className="text-xs text-orange-700">
              {v.brand} {v.model} - {v.current_mileage} km (Service prévu à {v.next_service_mileage} km)
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const BookingsTab = ({ bookings, onUpdateStatus }) => {
  const handleExport = async (type) => {
    try {
      const res = await api.get(`/admin/bookings/export-${type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: type === 'pdf' ? 'application/pdf' : 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Export ${type.toUpperCase()} réussi.`);
    } catch (err) {
      console.error(err);
      toast.error(`Erreur lors de l'export ${type.toUpperCase()}`);
    }
  };

  return (
    <div className="bg-white border border-gray-100 p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-serif">Réservations</h2>
        <div className="flex gap-4">
          <button onClick={() => handleExport('csv')} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-premium-gold border border-gray-200 px-4 py-2 cursor-pointer bg-transparent">
            <Download size={12} /> CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-premium-gold border border-gray-200 px-4 py-2 cursor-pointer bg-transparent">
            <FileText size={12} /> PDF
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">ID</th>
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Client</th>
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Véhicule</th>
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Dates</th>
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Paiement</th>
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Statut</th>
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-4 text-xs font-mono text-gray-500">#{b.id}</td>
                <td className="py-4 text-sm font-bold">{b.user_name}</td>
                <td className="py-4 text-sm text-gray-600">{b.brand} {b.model}</td>
                <td className="py-4 text-xs text-gray-500">
                  {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}
                </td>
                <td className="py-4">
                  {b.payment_method === 'cash' ? (
                    <span className="inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                      <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
                      Sur place
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
                      <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                      PayPal
                    </span>
                  )}
                </td>
                <td className="py-4">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                    b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    b.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {b.status === 'confirmed' ? 'Confirmée' :
                     b.status === 'cancelled' ? 'Annulée' :
                     b.status === 'completed' ? 'Terminée' :
                     'En attente'}
                  </span>
                </td>
                <td className="py-4 text-right">
                  {b.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        if (window.confirm("Voulez-vous vraiment rejeter/annuler cette réservation ?")) {
                          onUpdateStatus(b.id, 'cancelled');
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      Rejeter
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const VehiclesTab = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    category: '',
    price_per_day: '',
    is_available: true,
    is_in_maintenance: false,
    power: '',
    transmission: '',
    fuel: '',
    description: '',
    seats: 5,
    doors: 5,
    suitcases: 2,
    air_conditioning: true,
    gps: false,
    bluetooth: true,
    cruise_control: false,
    backup_camera: false,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImagesToKeep, setExistingImagesToKeep] = useState([]);
  const [isFetchingSpecs, setIsFetchingSpecs] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [availableEngines, setAvailableEngines] = useState([]);
  const [selectedEngine, setSelectedEngine] = useState('');
  const lastFetchedRef = useRef({ brand: '', model: '' });

  useEffect(() => {
    if (!formData.brand || !formData.model) return;
    if (formData.brand.trim().toLowerCase() === lastFetchedRef.current.brand.trim().toLowerCase() && 
        formData.model.trim().toLowerCase() === lastFetchedRef.current.model.trim().toLowerCase()) {
      return;
    }

    const timer = setTimeout(() => {
      lastFetchedRef.current = { brand: formData.brand, model: formData.model };
      fetchEngines(formData.brand, formData.model);
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.brand, formData.model]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const imageFilesOnly = files.filter(f => f.type.startsWith("image/"));
      // Validate image sizes (5MB limit per file)
      const validFiles = [];
      for (const file of imageFilesOnly) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Le fichier ${file.name} dépasse la limite de 5 Mo.`);
        } else {
          validFiles.push(file);
        }
      }
      setImageFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      const validFiles = [];
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Le fichier ${file.name} dépasse la limite de 5 Mo.`);
        } else {
          validFiles.push(file);
        }
      }
      setImageFiles(prev => [...prev, ...validFiles]);
    }
  };

  const applyEngineSpecs = (engine) => {
    const specs = engine.raw;
    let trans = 'Automatique';
    if (specs.trany && specs.trany.toLowerCase().includes('manual')) trans = 'Manuelle';
    
    let fuel = 'Essence';
    if (specs.fueltype1) {
      const f = specs.fueltype1.toLowerCase();
      if (f.includes('diesel')) fuel = 'Diesel';
      if (f.includes('electricity') || f.includes('electric')) fuel = 'Électrique';
      if (f.includes('hybrid')) fuel = 'Hybride';
    }
    
    let category = '';
    if (specs.vclass) {
      const vc = specs.vclass.toLowerCase();
      if (vc.includes('sport utility') || vc.includes('suv')) category = 'SUV';
      else if (vc.includes('two seater') || vc.includes('minicompact') || vc.includes('subcompact')) category = 'Citadine';
      else if (vc.includes('compact') || vc.includes('midsize')) category = 'Berline';
      else if (vc.includes('large') || vc.includes('luxury') || vc.includes('special purpose')) category = 'Luxe';
      else if (vc.includes('coupe')) category = 'Coupé';
      else if (vc.includes('convertible')) category = 'Cabriolet';
    }
    if (fuel === 'Électrique') category = 'Électrique';
    if (fuel === 'Hybride' || fuel === 'Hybride Rechargeable') category = 'Hybride';

    setFormData(prev => {
      let power = prev.power;
      if (specs.cylinders) {
        power = `${specs.displ ? specs.displ+'L ' : ''}${specs.cylinders} cylindres`; 
      }
      const finalCategory = category || prev.category;
      let seats = 5, doors = 5, suitcases = 2;
      if (finalCategory === 'Citadine') {
        seats = 4; doors = 3; suitcases = 1;
      } else if (finalCategory === 'SUV') {
        seats = 5; doors = 5; suitcases = 3;
      } else if (finalCategory === 'Luxe' || finalCategory === 'Coupé' || finalCategory === 'Cabriolet' || finalCategory === 'Sport') {
        seats = 4; doors = 3; suitcases = 2;
      }
      return {
        ...prev,
        transmission: trans,
        fuel: fuel,
        power: power,
        year: specs.year || prev.year,
        category: finalCategory,
        seats,
        doors,
        suitcases
      };
    });
  };

  const fetchEngines = async (brandParam, modelParam) => {
    const currentBrand = brandParam || formData.brand;
    const currentModel = modelParam || formData.model;
    
    if (!currentBrand || !currentModel) {
      toast.error('Veuillez saisir une marque et un modèle d\'abord.');
      return;
    }
    setIsFetchingSpecs(true);
    setAvailableEngines([]);
    setSelectedEngine('');
    try {
      const url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?where=make like "${currentBrand}" and model like "${currentModel}"&limit=30`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.results && data.results.length > 0) {
        const engines = data.results.map(r => {
          let fuelLabel = r.fueltype1 || 'Essence';
          if (fuelLabel.toLowerCase().includes('gasoline') || fuelLabel.toLowerCase().includes('regular') || fuelLabel.toLowerCase().includes('premium')) fuelLabel = 'Essence';
          if (fuelLabel.toLowerCase().includes('diesel')) fuelLabel = 'Diesel';
          if (fuelLabel.toLowerCase().includes('electric')) fuelLabel = 'Électrique';

          const cylStr = r.cylinders ? `(${r.cylinders} cyl.) ` : '';
          const displStr = r.displ ? `${r.displ}L ` : '';
          const transStr = r.trany ? (r.trany.toLowerCase().includes('manual') ? 'Manuelle' : 'Automatique') : '';
          
          return {
            label: `${displStr}${cylStr}- ${fuelLabel} - ${transStr} (${r.year || 'N/A'})`,
            raw: r
          };
        }).filter(e => e.label.length > 10);
        
        const uniqueEngines = [];
        const seen = new Set();
        for (const e of engines) {
          if (!seen.has(e.label)) {
            seen.add(e.label);
            uniqueEngines.push(e);
          }
        }
        
        setAvailableEngines(uniqueEngines);
        if (uniqueEngines.length > 0) {
          toast.success(`${uniqueEngines.length} motorisation(s) trouvée(s).`);
          setSelectedEngine(uniqueEngines[0].label);
          applyEngineSpecs(uniqueEngines[0]);
        }
        else toast.error('Aucune donnée trouvée pour ce modèle.');
      } else {
        toast.error('Aucune donnée trouvée pour ce modèle.');
      }
    } catch (_e) {
      toast.error('Erreur lors de la récupération des données.');
    } finally {
      setIsFetchingSpecs(false);
    }
  };

  const handleEngineSelect = (e) => {
    const val = e.target.value;
    setSelectedEngine(val);
    const engine = availableEngines.find(eng => eng.label === val);
    if (!engine) return;
    applyEngineSpecs(engine);
  };

  const handleModelSelect = (opt) => {
    setFormData(prev => ({...prev, model: opt}));
    fetchEngines(formData.brand, opt);
  };

  const handleBrandSelect = (opt) => {
    setFormData(prev => ({...prev, brand: opt, model: ''}));
    setAvailableEngines([]);
    setSelectedEngine('');
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles/admin/all');
      setVehicles(res.data);
    } catch (_err) {
      toast.error('Erreur lors du chargement des véhicules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleToggleMaintenance = async (v) => {
    try {
      await api.put(`/vehicles/${v.id}`, {
        is_in_maintenance: !v.is_in_maintenance
      });
      toast.success(v.is_in_maintenance ? 'Véhicule sorti de maintenance.' : 'Véhicule placé en maintenance.');
      fetchVehicles();
    } catch (err) {
      toast.error("Erreur lors de la modification du statut de maintenance.");
    }
  };

  const openCreateModal = () => {
    setEditingVehicle(null);
    setFormData({ 
      brand: '', 
      model: '', 
      year: '', 
      category: '', 
      price_per_day: '', 
      is_available: true, 
      is_in_maintenance: false, 
      power: '', 
      transmission: '', 
      fuel: '',
      description: '',
      seats: 5,
      doors: 5,
      suitcases: 2,
      air_conditioning: true,
      gps: false,
      bluetooth: true,
      cruise_control: false,
      backup_camera: false,
    });
    setImageFiles([]);
    setExistingImagesToKeep([]);
    setAvailableEngines([]);
    setSelectedEngine('');
    lastFetchedRef.current = { brand: '', model: '' };
    setShowModal(true);
  };

  const openEditModal = (v) => {
    let specs = {};
    try { specs = JSON.parse(v.specs || '{}'); } catch (_e) { console.debug('Failed to parse vehicle specs:', _e); }
    setEditingVehicle(v);
    setFormData({
      brand: v.brand || '',
      model: v.model || '',
      year: v.year || '',
      category: v.category || '',
      price_per_day: v.price_per_day || '',
      is_available: v.is_available,
      is_in_maintenance: v.is_in_maintenance || false,
      power: specs.power || '',
      transmission: specs.transmission || '',
      fuel: specs.fuel || '',
      description: specs.description || '',
      seats: specs.seats !== undefined ? specs.seats : 5,
      doors: specs.doors !== undefined ? specs.doors : 5,
      suitcases: specs.suitcases !== undefined ? specs.suitcases : 2,
      air_conditioning: specs.air_conditioning !== undefined ? specs.air_conditioning : true,
      gps: specs.gps !== undefined ? specs.gps : false,
      bluetooth: specs.bluetooth !== undefined ? specs.bluetooth : true,
      cruise_control: specs.cruise_control !== undefined ? specs.cruise_control : false,
      backup_camera: specs.backup_camera !== undefined ? specs.backup_camera : false,
    });
    setImageFiles([]);
    const currentImages = v.images ? v.images.map(img => img.url) : (v.image_url ? [v.image_url] : []);
    setExistingImagesToKeep(currentImages);
    setAvailableEngines([]);
    setSelectedEngine('');
    lastFetchedRef.current = { brand: v.brand || '', model: v.model || '' };
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce véhicule ?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Véhicule supprimé.');
      fetchVehicles();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la suppression.';
      toast.error(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('brand', formData.brand);
    data.append('model', formData.model);
    if (formData.year) data.append('year', formData.year);
    if (formData.category) data.append('category', formData.category);
    if (formData.price_per_day) data.append('price_per_day', formData.price_per_day);
    data.append('is_available', formData.is_available);
    data.append('is_in_maintenance', formData.is_in_maintenance);
    const specs = JSON.stringify({
      power: formData.power,
      transmission: formData.transmission,
      fuel: formData.fuel,
      description: formData.description,
      seats: Number(formData.seats),
      doors: Number(formData.doors),
      suitcases: Number(formData.suitcases),
      air_conditioning: formData.air_conditioning,
      gps: formData.gps,
      bluetooth: formData.bluetooth,
      cruise_control: formData.cruise_control,
      backup_camera: formData.backup_camera,
    });
    data.append('specs', specs);

    if (editingVehicle) {
      data.append('existing_images', JSON.stringify(existingImagesToKeep));
    }

    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach(file => {
        data.append('image', file);
      });
    }

    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Véhicule modifié avec succès.');
      } else {
        await api.post('/vehicles', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Véhicule ajouté avec succès.');
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Erreur lors de l\'enregistrement.';
      toast.error(msg);
    }
  };

  if (loading) return <div className="text-center py-10">Chargement...</div>;

  return (
    <div className="bg-white border border-gray-100 p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-serif">Véhicules</h2>
        <button onClick={openCreateModal} className="px-6 py-2 bg-premium-black text-white text-[9px] font-bold uppercase tracking-widest hover:bg-premium-gold transition-colors">
          + Ajouter un véhicule
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">ID</th>
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Marque & Modèle</th>
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Catégorie</th>
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Prix/J</th>
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Statut</th>
              <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-4 text-xs font-mono text-gray-500">#{v.id}</td>
                <td className="py-4 text-sm font-bold">{v.brand} {v.model}</td>
                <td className="py-4 text-xs text-gray-500">{v.category}</td>
                <td className="py-4 text-sm font-bold">{v.price_per_day}€</td>
                <td className="py-4">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                    v.is_in_maintenance 
                      ? 'bg-orange-100 text-orange-700' 
                      : v.is_available 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {v.is_in_maintenance ? 'En maintenance' : v.is_available ? 'Disponible' : 'Indisponible'}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button onClick={() => handleToggleMaintenance(v)} className={`mr-4 text-[10px] font-bold uppercase tracking-widest ${v.is_in_maintenance ? 'text-green-600 hover:text-green-800' : 'text-orange-500 hover:text-orange-700'}`}>
                    {v.is_in_maintenance ? 'Activer' : 'Maintenance'}
                  </button>
                  <button onClick={() => openEditModal(v)} className="text-premium-gold hover:text-premium-black mr-4 text-[10px] font-bold uppercase tracking-widest">Modifier</button>
                  <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-widest">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-serif mb-6">{editingVehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <AsyncBrandAutocomplete 
                  label="Marque" 
                  value={formData.brand} 
                  onChange={val => setFormData({...formData, brand: val})} 
                  onSelect={handleBrandSelect}
                  placeholder="Ex: Audi, BMW..."
                  disabled={isFetchingSpecs}
                />
                <AsyncModelAutocomplete 
                  label="Modèle" 
                  value={formData.model} 
                  onChange={val => setFormData({...formData, model: val})} 
                  onSelect={handleModelSelect}
                  brand={formData.brand}
                  placeholder={formData.brand ? `Ex: RS6, A4...` : 'Choisissez une marque d\'abord'}
                  disabled={isFetchingSpecs}
                />
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Année</label>
                  <input type="number" disabled={isFetchingSpecs} value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm disabled:opacity-50" />
                </div>
                <AutocompleteField 
                  label="Catégorie" 
                  value={formData.category} 
                  onChange={val => setFormData({...formData, category: val})} 
                  options={['Citadine', 'Berline', 'SUV', 'Coupé', 'Cabriolet', 'Sport', 'Luxe', 'Électrique', 'Hybride']} 
                  disabled={isFetchingSpecs}
                />
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Prix / jour (€)</label>
                  <input required type="number" step="0.01" disabled={isFetchingSpecs} value={formData.price_per_day} onChange={e => setFormData({...formData, price_per_day: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm disabled:opacity-50" />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6 mb-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-premium-gold">Motorisation & Fiche Technique</h4>
                <button 
                  type="button" 
                  onClick={() => fetchEngines()}
                  disabled={isFetchingSpecs || !formData.brand || !formData.model}
                  className="text-[9px] font-bold uppercase tracking-widest text-white bg-premium-gold px-3 py-1 hover:bg-premium-black transition-colors disabled:opacity-50"
                >
                  {isFetchingSpecs ? 'Recherche...' : 'Chercher les motorisations API'}
                </button>
              </div>

              {availableEngines.length > 0 && (
                <div className="space-y-2 mb-4">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-premium-gold">Choix du moteur</label>
                  <select 
                    value={selectedEngine} 
                    onChange={handleEngineSelect}
                    disabled={isFetchingSpecs}
                    className="w-full bg-premium-light-gray border-b border-gray-200 py-2 px-2 outline-none focus:border-premium-gold text-sm disabled:opacity-50"
                  >
                    <option value="" disabled>Sélectionnez une motorisation pour pré-remplir la fiche...</option>
                    {availableEngines.map(e => (
                      <option key={e.label} value={e.label}>{e.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="relative border border-gray-100 rounded-xl p-4 bg-gray-50/20">
                {isFetchingSpecs && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 rounded-xl">
                    <Loader2 className="w-5 h-5 text-premium-gold animate-spin mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-premium-black">Chargement des spécifications...</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Puissance (CV)</label>
                    <input type="text" disabled={isFetchingSpecs} value={formData.power} onChange={e => setFormData({...formData, power: e.target.value})} placeholder="Ex: 510 cv" className="w-full bg-transparent border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm disabled:opacity-50" />
                  </div>
                  <AutocompleteField 
                    label="Transmission" 
                    value={formData.transmission} 
                    onChange={val => setFormData({...formData, transmission: val})} 
                    options={['Automatique', 'Manuelle', 'Séquentielle']} 
                    disabled={isFetchingSpecs}
                  />
                  <AutocompleteField 
                    label="Carburant" 
                    value={formData.fuel} 
                    onChange={val => setFormData({...formData, fuel: val})} 
                    options={['Essence', 'Diesel', 'Électrique', 'Hybride Rechargeable', 'Hybride']} 
                    disabled={isFetchingSpecs}
                  />
                  <div className="space-y-2 flex flex-col justify-end gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} className="accent-premium-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Disponible à la location</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.is_in_maintenance} onChange={e => setFormData({...formData, is_in_maintenance: e.target.checked})} className="accent-premium-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">En maintenance</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Capacities */}
              <div className="grid grid-cols-3 gap-4 border border-gray-100 rounded-xl p-4 bg-gray-50/20">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Nombre de Places</label>
                  <input type="number" min="1" value={formData.seats} onChange={e => setFormData({...formData, seats: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1 outline-none focus:border-premium-gold text-sm font-semibold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Nombre de Portes</label>
                  <input type="number" min="2" value={formData.doors} onChange={e => setFormData({...formData, doors: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1 outline-none focus:border-premium-gold text-sm font-semibold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Nombre de Valises</label>
                  <input type="number" min="0" value={formData.suitcases} onChange={e => setFormData({...formData, suitcases: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1 outline-none focus:border-premium-gold text-sm font-semibold" />
                </div>
              </div>

              {/* Equipments Checklist */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-premium-gold">Équipements & Options de Confort</label>
                <div className="grid grid-cols-2 gap-3 bg-gray-50/40 p-4 rounded-xl border border-gray-100">
                  {[
                    { label: 'Climatisation', key: 'air_conditioning' },
                    { label: 'GPS intégré', key: 'gps' },
                    { label: 'Connexion Bluetooth', key: 'bluetooth' },
                    { label: 'Régulateur de vitesse', key: 'cruise_control' },
                    { label: 'Caméra de recul', key: 'backup_camera' },
                  ].map(eq => (
                    <label key={eq.key} className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData[eq.key]} 
                        onChange={e => setFormData({...formData, [eq.key]: e.target.checked})} 
                        className="accent-premium-gold rounded" 
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{eq.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description TextArea */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Présentation du véhicule (Visible par les clients)</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Saisissez une description attractive pour présenter le véhicule aux clients..." 
                  rows={3}
                  className="w-full bg-gray-50/20 border border-gray-200 rounded-xl p-3 outline-none focus:border-premium-gold text-xs leading-relaxed resize-none"
                />
              </div>
              
              {/* Drag & Drop Multiple Images */}
              <div className="space-y-3 pt-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Photos du véhicule</label>
                
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`w-full min-h-[140px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all duration-300 relative group cursor-pointer ${
                    dragActive 
                      ? 'border-premium-gold bg-premium-gold/5' 
                      : 'border-gray-200 hover:border-premium-gold bg-premium-light-gray/40'
                  }`}
                  onClick={() => document.getElementById('drag-drop-file-input').click()}
                >
                  <input 
                    id="drag-drop-file-input" 
                    type="file" 
                    multiple 
                    accept="image/jpeg,image/png,image/webp,image/jpg" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-premium-gold transition-colors duration-300" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Faites glisser des photos ici</p>
                  <p className="text-[9px] text-gray-400">ou cliquez pour parcourir les fichiers (max 5 Mo par image)</p>
                </div>

                {/* Existing Images Preview (with delete action) */}
                {existingImagesToKeep.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-premium-gold">Photos existantes enregistrées</p>
                    <div className="grid grid-cols-5 gap-2">
                      {existingImagesToKeep.map((url, i) => (
                        <div key={`existing-${i}`} className="relative aspect-square border border-gray-100 rounded-lg overflow-hidden group">
                          <img src={getFullImageUrl(url)} alt={`Existing ${i}`} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setExistingImagesToKeep(prev => prev.filter((_, idx) => idx !== i));
                            }}
                            className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-md transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview (with delete action) */}
                {imageFiles.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-premium-gold">Nouvelles photos prêtes à être téléversées</p>
                    <div className="grid grid-cols-5 gap-2">
                      {imageFiles.map((file, i) => (
                        <div key={`new-${i}`} className="relative aspect-square border border-gray-100 rounded-lg overflow-hidden group">
                          <img src={URL.createObjectURL(file)} alt={`New ${i}`} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageFiles(prev => prev.filter((_, idx) => idx !== i));
                            }}
                            className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-md transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-black">Annuler</button>
                <button type="submit" disabled={isFetchingSpecs} className="flex-1 py-3 bg-premium-black text-white text-[9px] font-bold uppercase tracking-widest hover:bg-premium-gold transition-colors disabled:opacity-50">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Promotions Tab ──────────────────────────────────────────────────────────

const PromotionsTab = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    min_booking_price: '',
    is_active: true,
  });

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/promotions/admin/all');
      setPromos(res.data);
    } catch {
      toast.error('Impossible de charger les promotions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/promotions', {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        min_booking_price: parseFloat(form.min_booking_price) || 0,
        is_active: form.is_active,
      });
      toast.success('Code promo créé avec succès.');
      setForm({ code: '', discount_type: 'percentage', discount_value: '', start_date: '', end_date: '', min_booking_price: '', is_active: true });
      setShowForm(false);
      fetchPromos();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la création.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce code promo ?')) return;
    try {
      await api.delete(`/promotions/${id}`);
      toast.success('Code promo supprimé.');
      fetchPromos();
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const toggleActive = async (promo) => {
    try {
      // No PATCH endpoint – workaround: delete + recreate with toggled flag
      await api.delete(`/promotions/${promo.id}`);
      await api.post('/promotions', {
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        start_date: promo.start_date || null,
        end_date: promo.end_date || null,
        min_booking_price: promo.min_booking_price,
        is_active: !promo.is_active,
      });
      toast.success(`Code ${promo.is_active ? 'désactivé' : 'activé'}.`);
      fetchPromos();
    } catch {
      toast.error('Erreur lors de la mise à jour.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-serif">Codes Promotionnels</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2 bg-premium-black text-white text-[9px] font-bold uppercase tracking-widest hover:bg-premium-gold transition-colors"
          >
            <Plus size={12} /> Nouveau code
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="border border-gray-100 bg-gray-50/60 p-6 mb-8 space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-premium-gold mb-2">Créer un code promo</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Code *</label>
                <input
                  required type="text" value={form.code}
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  placeholder="EX: SUMMER20"
                  className="w-full bg-white border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Type</label>
                <select
                  value={form.discount_type}
                  onChange={e => setForm({...form, discount_type: e.target.value})}
                  className="w-full bg-white border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (€)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                  Valeur * {form.discount_type === 'percentage' ? '(%)' : '(€)'}
                </label>
                <input
                  required type="number" min="0" step="0.01" value={form.discount_value}
                  onChange={e => setForm({...form, discount_value: e.target.value})}
                  className="w-full bg-white border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Prix min. commande (€)</label>
                <input
                  type="number" min="0" step="0.01" value={form.min_booking_price}
                  onChange={e => setForm({...form, min_booking_price: e.target.value})}
                  placeholder="0 = aucune limite"
                  className="w-full bg-white border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Début (optionnel)</label>
                <input
                  type="date" value={form.start_date}
                  onChange={e => setForm({...form, start_date: e.target.value})}
                  className="w-full bg-white border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Expiration (optionnel)</label>
                <input
                  type="date" value={form.end_date}
                  onChange={e => setForm({...form, end_date: e.target.value})}
                  className="w-full bg-white border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox" checked={form.is_active}
                onChange={e => setForm({...form, is_active: e.target.checked})}
                className="accent-premium-gold"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Actif immédiatement</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black px-4 py-2 border border-gray-200">
                Annuler
              </button>
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-premium-black text-white text-[9px] font-bold uppercase tracking-widest hover:bg-premium-gold transition-colors disabled:opacity-50">
                {submitting ? 'Création...' : 'Créer le code'}
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-premium-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : promos.length === 0 ? (
          <p className="text-xs text-gray-400 uppercase tracking-widest text-center py-10">Aucun code promo créé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Code', 'Type', 'Réduction', 'Min. commande', 'Validité', 'Statut', ''].map(h => (
                    <th key={h} className="py-4 pr-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promos.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-4 pr-4 font-mono text-sm font-bold text-premium-black">{p.code}</td>
                    <td className="py-4 pr-4 text-xs text-gray-500">
                      {p.discount_type === 'percentage' ? 'Pourcentage' : 'Fixe'}
                    </td>
                    <td className="py-4 pr-4 text-sm font-bold">
                      {p.discount_type === 'percentage' ? `${p.discount_value}%` : `${p.discount_value}€`}
                    </td>
                    <td className="py-4 pr-4 text-xs text-gray-500">
                      {p.min_booking_price > 0 ? `≥ ${p.min_booking_price}€` : '—'}
                    </td>
                    <td className="py-4 pr-4 text-xs text-gray-500">
                      {p.start_date ? new Date(p.start_date).toLocaleDateString() : '∞'}
                      {' → '}
                      {p.end_date ? new Date(p.end_date).toLocaleDateString() : '∞'}
                    </td>
                    <td className="py-4 pr-4">
                      <button onClick={() => toggleActive(p)} title={p.is_active ? 'Désactiver' : 'Activer'}>
                        {p.is_active
                          ? <ToggleRight size={22} className="text-green-500" />
                          : <ToggleLeft size={22} className="text-gray-300" />
                        }
                      </button>
                    </td>
                    <td className="py-4 text-right">
                      <button onClick={() => handleDelete(p.id)} title="Supprimer">
                        <Trash2 size={14} className="text-red-400 hover:text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Home Config / Appearance Tab ────────────────────────────────────────────

const HomeConfigTab = () => {
  const DEFAULT_GOLD = '#c5a059';

  const [config, setConfig] = useState({
    hiddenCategories: [],
    sortOrder: 'newest',
    primaryColor: DEFAULT_GOLD,
    heroTitle: "Location de Voitures\nSimple & Rapide",
    heroSubtitle: 'Une large gamme de véhicules adaptés à tous vos besoins au meilleur prix.',
    siteName: 'Loc 34',
    announcementText: 'Profitez de -10% sur votre première réservation avec le code LOC34 !',
    announcementVisible: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data) {
          setConfig(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Failed to load settings from server:', err);
        // Fallback to localStorage
        const saved = localStorage.getItem('loc34_home_config');
        if (saved) {
          try { setConfig(prev => ({ ...prev, ...JSON.parse(saved) })); } catch (_e) { console.debug('Failed to parse saved config:', _e); }
        }
      }
    };
    loadSettings();
  }, []);

  // Live preview: apply color instantly while the picker is moved
  const handleColorChange = (color) => {
    setConfig(prev => ({ ...prev, primaryColor: color }));
    document.documentElement.style.setProperty('--premium-gold', color);
    document.documentElement.style.setProperty('--color-premium-gold', color);
    document.documentElement.style.setProperty('--color-premium-gold-light', color + 'E6');
  };

  const handleSave = async () => {
    try {
      const res = await api.put('/settings', config);
      const updated = res.data;
      
      document.documentElement.style.setProperty('--premium-gold', updated.primaryColor);
      document.documentElement.style.setProperty('--color-premium-gold', updated.primaryColor);
      document.documentElement.style.setProperty('--color-premium-gold-light', updated.primaryColor + 'E6');
      
      // Update local storage too for compatibility/fallbacks
      localStorage.setItem('loc34_home_config', JSON.stringify(updated));
      
      toast.success('Apparence sauvegardée et appliquée sur le serveur.');
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Impossible d\'enregistrer les configurations.');
    }
  };

  const handleReset = async () => {
    const reset = { ...config, primaryColor: DEFAULT_GOLD };
    try {
      await api.put('/settings', reset);
      setConfig(reset);
      document.documentElement.style.setProperty('--premium-gold', DEFAULT_GOLD);
      document.documentElement.style.setProperty('--color-premium-gold', DEFAULT_GOLD);
      document.documentElement.style.setProperty('--color-premium-gold-light', DEFAULT_GOLD + 'E6');
      localStorage.setItem('loc34_home_config', JSON.stringify(reset));
      toast.success('Couleur réinitialisée.');
      setTimeout(() => window.location.reload(), 800);
    } catch (_err) {
      toast.error('Erreur lors de la réinitialisation.');
    }
  };

  const toggleCategory = (cat) => {
    setConfig(prev => ({
      ...prev,
      hiddenCategories: prev.hiddenCategories.includes(cat) 
        ? prev.hiddenCategories.filter(c => c !== cat)
        : [...prev.hiddenCategories, cat]
    }));
  };

  const allCats = ['Economy', 'Luxury', 'SUV', 'Electric', 'Citadine', 'Berline', 'Sport', 'Cabriolet'];

  return (
    <div className="bg-white border border-gray-100 p-8 shadow-sm max-w-3xl space-y-10">
      <h2 className="text-xl font-serif">Apparence du Site</h2>

      {/* ── Identité visuelle ─────────────────── */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-premium-gold flex items-center gap-2">
          <Palette size={13} /> Couleur principale
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <input
              type="color"
              value={config.primaryColor}
              onChange={e => handleColorChange(e.target.value)}
              className="w-14 h-14 cursor-pointer border-0 bg-transparent p-0 rounded-sm"
              title="Choisir la couleur principale"
            />
            <span className="absolute -bottom-5 left-0 text-[9px] font-mono text-gray-400 uppercase tracking-widest">{config.primaryColor}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-1">
              Cette couleur remplace le doré sur l'ensemble du site (boutons, accents, soulignements).
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['#c5a059','#d4b782','#8b5cf6','#ef4444','#3b82f6','#10b981','#f97316','#ec4899','#1a1a1a'].map(c => (
                <button
                  key={c}
                  title={c}
                  onClick={() => handleColorChange(c)}
                  style={{ background: c }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    config.primaryColor === c ? 'border-gray-800 scale-110' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-premium-gold border border-gray-200 px-3 py-2 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </section>

      {/* ── Barre d'annonce ──────────────────── */}
      <section className="space-y-4 border-t border-gray-100 pt-8">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-premium-gold">Barre d'annonce</h3>
        <label className="flex items-center gap-2 cursor-pointer pb-2">
          <input
            type="checkbox"
            checked={config.announcementVisible}
            onChange={e => setConfig({...config, announcementVisible: e.target.checked})}
            className="accent-premium-gold"
          />
          <span className="text-xs font-semibold text-gray-700">Activer la barre d'annonce en haut du site</span>
        </label>
        {config.announcementVisible && (
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Texte de l'annonce</label>
            <input
              type="text"
              value={config.announcementText}
              onChange={e => setConfig({...config, announcementText: e.target.value})}
              placeholder="Ex: Profitez de -10% avec le code LOC34 !"
              className="w-full bg-transparent border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm"
            />
          </div>
        )}
      </section>

      {/* ── Textes de la bannière ─────────────── */}
      <section className="space-y-4 border-t border-gray-100 pt-8">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-premium-gold">Bannière d'accueil</h3>
        <div className="space-y-1">
          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Nom du site (tagline)</label>
          <input
            type="text"
            value={config.siteName}
            onChange={e => setConfig({...config, siteName: e.target.value})}
            placeholder="Loc 34"
            className="w-full bg-transparent border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Titre principal (\n pour saut de ligne)</label>
          <input
            type="text"
            value={config.heroTitle}
            onChange={e => setConfig({...config, heroTitle: e.target.value})}
            placeholder="Location de Voitures\nSimple & Rapide"
            className="w-full bg-transparent border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Sous-titre / description</label>
          <textarea
            rows={2}
            value={config.heroSubtitle}
            onChange={e => setConfig({...config, heroSubtitle: e.target.value})}
            placeholder="Une large gamme de véhicules..."
            className="w-full bg-transparent border-b border-gray-200 py-2 outline-none focus:border-premium-gold text-sm resize-none"
          />
        </div>
      </section>

      {/* ── Catalogue ────────────────────────── */}
      <section className="space-y-4 border-t border-gray-100 pt-8">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-premium-gold">Catalogue — Ordre d'affichage</h3>
        <select 
          value={config.sortOrder} 
          onChange={e => setConfig({...config, sortOrder: e.target.value})}
          className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold text-sm"
        >
          <option value="newest">Les plus récents d'abord</option>
          <option value="price_asc">Prix : croissant</option>
          <option value="price_desc">Prix : décroissant</option>
          <option value="brand">Par marque (A-Z)</option>
          <option value="custom">Ordre personnalisé (Drag & Drop)</option>
        </select>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-8">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-premium-gold">Catégories masquées</h3>
        <p className="text-xs text-gray-500">Cliquez sur une catégorie pour la masquer de la page d'accueil.</p>
        <div className="flex flex-wrap gap-3">
          {allCats.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-bold border transition-colors ${
                config.hiddenCategories.includes(cat)
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-premium-gold'
              }`}
            >
              {config.hiddenCategories.includes(cat) ? `🚫 ${cat}` : cat}
            </button>
          ))}
        </div>
      </section>

      <button onClick={handleSave} className="w-full py-4 bg-premium-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-premium-gold transition-colors">
        Publier les modifications
      </button>
    </div>
  );
};

// ─── Custom Sort Order Draggable Tab ────────────────────────────────────────

const CustomOrderTab = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchVehiclesAndSettings = async () => {
      try {
        const [vehiclesRes, settingsRes] = await Promise.all([
          api.get('/vehicles/admin/all'),
          api.get('/settings').catch(() => ({ data: null }))
        ]);
        let data = vehiclesRes.data;
        const config = settingsRes.data;

        // Order based on customOrder if it exists
        if (config && config.customOrder && config.customOrder.length > 0) {
          data.sort((a, b) => {
            const idxA = config.customOrder.indexOf(a.id);
            const idxB = config.customOrder.indexOf(b.id);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
          });
        }

        setVehicles(data);
      } catch (_err) {
        toast.error('Erreur lors du chargement des véhicules.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehiclesAndSettings();
  }, []);

  const handleDragStart = (e, index) => {
    if (searchQuery) return; // Disable drag-and-drop when list is filtered
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (searchQuery || draggedIndex === null || draggedIndex === index) return;

    const list = [...vehicles];
    const [draggedItem] = list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);

    setVehicles(list);
    setDraggedIndex(null);
  };

  const moveVehicle = (id, direction) => {
    const index = vehicles.findIndex(v => v.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= vehicles.length) return;

    const list = [...vehicles];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    setVehicles(list);
  };

  const handleSaveOrder = async () => {
    const orderIds = vehicles.map(v => v.id);
    try {
      const settingsRes = await api.get('/settings');
      const currentSettings = settingsRes.data || {};
      const updatedSettings = { ...currentSettings, customOrder: orderIds };
      
      await api.put('/settings', updatedSettings);
      localStorage.setItem('loc34_home_config', JSON.stringify(updatedSettings));
      
      toast.success("Ordre personnalisé enregistré ! N'oubliez pas d'activer 'Ordre personnalisé' dans l'onglet Apparence.");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Erreur lors de l'enregistrement.");
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-premium-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 p-8 shadow-sm space-y-6 rounded-lg">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center border-b border-gray-100 pb-6 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-premium-gold animate-pulse" />
            <h2 className="text-2xl font-serif text-premium-black">Ordre Personnalisé du Catalogue</h2>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Glissez et déposez ou utilisez les flèches pour réorganiser l'ordre d'affichage des véhicules.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Rechercher un véhicule..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded text-xs outline-none focus:border-premium-gold focus:ring-1 focus:ring-premium-gold/30 transition-all w-full sm:w-60 bg-gray-50/50 focus:bg-white"
            />
            <Search size={14} className="absolute left-3 top-3.5 text-gray-400" />
          </div>
          <button
            onClick={handleSaveOrder}
            className="px-6 py-2.5 bg-premium-black hover:bg-premium-gold text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow hover:shadow-md hover:shadow-premium-gold/10 rounded cursor-pointer flex items-center justify-center gap-2"
          >
            <Save size={13} />
            Sauvegarder l'Ordre
          </button>
        </div>
      </div>

      {searchQuery && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded">
          💡 Le Drag & Drop est désactivé pendant une recherche. Utilisez les flèches directionnelles pour ajuster l'ordre.
        </p>
      )}

      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Aucun véhicule ne correspond à votre recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredVehicles.map((v) => {
            const fullIndex = vehicles.findIndex(x => x.id === v.id);
            const isFirst = fullIndex === 0;
            const isLast = fullIndex === vehicles.length - 1;

            return (
              <div
                key={v.id}
                draggable={!searchQuery}
                onDragStart={(e) => handleDragStart(e, fullIndex)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, fullIndex)}
                className={`border rounded-lg overflow-hidden relative group transition-all duration-300 bg-white ${
                  draggedIndex === fullIndex
                    ? 'opacity-25 scale-95 border-premium-gold border-dashed'
                    : ''
                } ${
                  searchQuery 
                    ? 'border-gray-200 hover:border-premium-gold shadow-sm'
                    : 'cursor-move border-gray-200 hover:border-premium-gold hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] active:shadow-md'
                }`}
                title={searchQuery ? "" : "Glissez-déposez pour réorganiser"}
              >
                {!searchQuery && (
                  <div className="absolute top-3 right-3 z-10 bg-white/95 text-gray-500 hover:text-premium-black p-1.5 rounded-full backdrop-blur shadow-sm opacity-80 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center border border-gray-100">
                    <GripVertical size={14} className="text-gray-600" />
                  </div>
                )}
                
                {/* Movement controls */}
                <div className="absolute bottom-3 left-3 z-10 flex gap-1 bg-white/95 p-1 rounded-md shadow-md backdrop-blur border border-gray-100 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveVehicle(v.id, 'up'); }}
                    disabled={isFirst}
                    className="p-1.5 text-gray-600 hover:text-premium-gold disabled:opacity-30 disabled:hover:text-gray-600 transition-colors cursor-pointer rounded hover:bg-gray-50"
                    title="Monter d'un rang"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveVehicle(v.id, 'down'); }}
                    disabled={isLast}
                    className="p-1.5 text-gray-600 hover:text-premium-gold disabled:opacity-30 disabled:hover:text-gray-600 transition-colors cursor-pointer rounded hover:bg-gray-50"
                    title="Descendre d'un rang"
                  >
                    <ArrowDown size={13} />
                  </button>
                </div>

                <div className="opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    {v.image_url ? (
                      <img
                        src={getFullImageUrl(v.image_url)}
                        alt={v.model}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Aucune image</div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5 items-center z-10">
                      <span className="bg-premium-black/80 text-premium-gold px-2.5 py-0.5 text-[10px] font-bold rounded backdrop-blur border border-premium-gold/30 shadow-sm">
                        #{fullIndex + 1}
                      </span>
                      <span className="bg-white/90 text-gray-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded shadow-sm backdrop-blur">
                        {v.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-white border-t border-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[9px] text-premium-gold font-bold uppercase tracking-wider block mb-0.5">{v.brand}</span>
                        <h4 className="text-sm font-bold text-premium-black font-serif">{v.model}</h4>
                      </div>
                      <div className="text-right bg-premium-black/[0.02] border border-gray-100 px-2.5 py-1 rounded">
                        <span className="text-xs font-bold text-premium-black block">{v.price_per_day} €</span>
                        <span className="text-[8px] text-gray-400 block uppercase tracking-widest leading-none">/ jour</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SettingsTab = () => {
  const [backupLoading, setBackupLoading] = useState(false);

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      await api.post('/admin/backup');
      toast.success('Sauvegarde de la base de données réussie.');
    } catch {
      toast.error('Échec de la sauvegarde.');
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 p-8 shadow-sm max-w-2xl">
      <h2 className="text-xl font-serif mb-8">Système & Maintenance</h2>
      
      <div className="space-y-8">
        <div className="p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 mb-1">
              <Database size={16} className="text-premium-gold" />
              Sauvegarde Base de Données
            </h3>
            <p className="text-xs text-gray-500">Créer une copie physique de la base SQLite.</p>
          </div>
          <button 
            onClick={handleBackup}
            disabled={backupLoading}
            className="px-6 py-3 bg-premium-black text-white text-[9px] font-bold uppercase tracking-widest hover:bg-premium-gold transition-colors disabled:opacity-50"
          >
            {backupLoading ? 'Création...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data);
    } catch (_err) {
      toast.error('Erreur lors du chargement des avis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet avis ?')) return;

    try {
      await api.delete(`/admin/reviews/${id}`);
      toast.success('Avis supprimé avec succès.');
      fetchReviews();
    } catch (_err) {
      toast.error("Impossible de supprimer l'avis.");
    }
  };

  const filteredReviews = reviews.filter(r =>
    r.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.vehicle_info.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.comment && r.comment.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-premium-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-100 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Modération des Avis Clients</h2>
            <p className="text-xs text-gray-500 mt-1">Consultez et supprimez les avis publiés sur vos véhicules.</p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par client, véhicule, commentaire..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded text-xs outline-none focus:border-premium-gold w-full sm:w-80"
            />
            <Search size={14} className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm"> Aucun avis trouvé. </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50/50">
                  <th className="py-4 px-4">Véhicule</th>
                  <th className="py-4 px-4">Client</th>
                  <th className="py-4 px-4">Note / Avis</th>
                  <th className="py-4 px-4">Date de publication</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReviews.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-900">{r.vehicle_info}</td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900 font-medium">{r.user_name}</div>
                      <div className="text-gray-400 text-[10px]">{r.user_email}</div>
                    </td>
                    <td className="py-4 px-4 max-w-sm">
                      <div className="flex gap-0.5 mb-1.5">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className={`text-sm ${i < r.rating ? 'text-yellow-500' : 'text-gray-200'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {r.comment ? (
                        <p className="text-gray-600 italic bg-gray-50 p-2 border-l-2 border-premium-gold/30 rounded text-[11px] leading-relaxed">
                          "{r.comment}"
                        </p>
                      ) : (
                        <span className="text-gray-400 italic">Pas de commentaire</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-500">
                      {new Date(r.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="p-2 bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition-colors rounded cursor-pointer"
                        title="Supprimer l'avis"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const ClientsTab = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingScore, setEditingScore] = useState({});
  const [selectedKycUrl, setSelectedKycUrl] = useState(null);

  const fetchClients = async () => {
    try {
      const res = await api.get('/user/admin/clients');
      setClients(res.data);
    } catch (_err) {
      toast.error('Erreur lors du chargement des clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleToggleVerify = async (client) => {
    const nextStatus = !client.is_verified;
    try {
      await api.put(`/user/admin/clients/${client.id}`, { is_verified: nextStatus });
      toast.success(nextStatus ? 'Client vérifié avec succès.' : 'Vérification annulée.');
      fetchClients();
    } catch (_err) {
      toast.error("Impossible de modifier le statut de vérification.");
    }
  };

  const handleToggleBlacklist = async (client) => {
    const nextStatus = !client.is_blacklisted;
    try {
      await api.put(`/user/admin/clients/${client.id}`, { is_blacklisted: nextStatus });
      toast.success(nextStatus ? 'Client mis sur liste noire.' : 'Client retiré de la liste noire.');
      fetchClients();
    } catch (_err) {
      toast.error("Impossible de modifier le statut de la liste noire.");
    }
  };

  const handleSaveScore = async (clientId) => {
    const score = editingScore[clientId];
    if (score === undefined || isNaN(score) || score < 0 || score > 100) {
      toast.error("Le score doit être un nombre entre 0 et 100.");
      return;
    }
    try {
      await api.put(`/user/admin/clients/${clientId}`, { scoring: parseInt(score, 10) });
      toast.success("Score de confiance mis à jour.");
      fetchClients();
    } catch (_err) {
      toast.error("Impossible de mettre à jour le score.");
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute aggregated stats
  const totalClients = clients.length;
  const verifiedClients = clients.filter(c => c.is_verified).length;
  const totalSpent = clients.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const averageScore = clients.length > 0 
    ? Math.round(clients.reduce((sum, c) => sum + (c.scoring || 0), 0) / clients.length) 
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-premium-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Total Clients</span>
          <span className="text-3xl font-serif mt-2 font-bold text-gray-900">{totalClients}</span>
        </div>
        <div className="bg-white border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Comptes Vérifiés</span>
          <span className="text-3xl font-serif mt-2 font-bold text-green-600">{verifiedClients}</span>
        </div>
        <div className="bg-white border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Score de Confiance Moyen</span>
          <span className="text-3xl font-serif mt-2 font-bold text-premium-gold">{averageScore}/100</span>
        </div>
        <div className="bg-white border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Chiffre d'Affaires Cumulé</span>
          <span className="text-3xl font-serif mt-2 font-bold text-blue-600">{totalSpent.toFixed(2)} €</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Annuaire des Clients</h2>
            <p className="text-xs text-gray-500 mt-1">Gérez le KYC, la liste noire et le score de confiance de vos clients.</p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded text-xs outline-none focus:border-premium-gold w-full sm:w-64"
            />
            <Search size={14} className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm"> Aucun client trouvé. </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50/50">
                  <th className="py-4 px-4">Client</th>
                  <th className="py-4 px-4">Contact</th>
                  <th className="py-4 px-4">KYC / ID</th>
                  <th className="py-4 px-4">Score / Confiance</th>
                  <th className="py-4 px-4">Stats Commande</th>
                  <th className="py-4 px-4">Statut Compte</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-900">{client.name}</td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{client.email}</div>
                      {client.phone && <div className="text-gray-400 text-[10px]">{client.phone}</div>}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {client.is_verified ? (
                          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold text-[10px] flex items-center gap-1">
                            <Check size={10} /> Vérifié
                          </span>
                        ) : client.id_card_url ? (
                          <span className="bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded font-semibold text-[10px] flex items-center gap-1">
                            ⚠️ À vérifier
                          </span>
                        ) : (
                          <span className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded font-semibold text-[10px]">
                            Aucun document
                          </span>
                        )}
                        {client.id_card_url && (
                          <button
                            onClick={() => setSelectedKycUrl(client.id_card_url)}
                            className="p-1 text-gray-400 hover:text-premium-gold transition-colors cursor-pointer"
                            title="Voir la pièce d'identité"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editingScore[client.id] !== undefined ? editingScore[client.id] : client.scoring || 0}
                          onChange={e => setEditingScore({ ...editingScore, [client.id]: parseInt(e.target.value, 10) })}
                          className="w-12 px-1 py-1 border border-gray-200 rounded text-center"
                        />
                        <button
                          onClick={() => handleSaveScore(client.id)}
                          className="px-2 py-1 bg-gray-100 hover:bg-premium-gold hover:text-white transition-colors rounded text-[10px] font-semibold cursor-pointer"
                        >
                          Ok
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900 font-medium">{client.bookings_count} rés.</div>
                      <div className="text-gray-400 text-[10px]">{(client.total_spent || 0).toFixed(2)} €</div>
                    </td>
                    <td className="py-4 px-4">
                      {client.is_blacklisted ? (
                        <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-semibold text-[10px] flex items-center gap-1 w-fit">
                          <X size={10} /> Suspendu
                        </span>
                      ) : (
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold text-[10px] flex items-center gap-1 w-fit">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {client.id_card_url && (
                        <button
                          onClick={() => handleToggleVerify(client)}
                          className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                            client.is_verified
                              ? 'bg-white text-gray-500 border-gray-200 hover:border-red-500 hover:text-red-500'
                              : 'bg-green-600 hover:bg-green-700 text-white border-transparent'
                          }`}
                        >
                          {client.is_verified ? 'Invalider' : 'Valider KYC'}
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleBlacklist(client)}
                        className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                          client.is_blacklisted
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {client.is_blacklisted ? 'Débloquer' : 'Bloquer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KYC ID Card Modal/Lightbox */}
      {selectedKycUrl && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedKycUrl(null)}
        >
          <div 
            className="bg-white border border-premium-gold/30 p-6 shadow-2xl max-w-2xl w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedKycUrl(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-sm font-bold uppercase tracking-widest text-premium-gold mb-4">Pièce d'identité client</h3>
            <div className="bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center max-h-[60vh]">
              <img 
                src={getFullImageUrl(selectedKycUrl)} 
                alt="Document KYC" 
                className="max-w-full max-h-[50vh] object-contain shadow-inner"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-3 text-center uppercase tracking-widest">
              Vérifiez le nom et la validité du document avant de l'approuver.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const CalendarTab = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const MONTHS_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const setToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getFirstDayOfMonth = () => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getDaysInMonth = () => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayIndex = getFirstDayOfMonth();
  const daysInMonth = getDaysInMonth();

  const calendarDays = [];
  
  const prevMonthDaysCount = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDaysCount - i,
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true
    });
  }

  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      day: i,
      month: month === 11 ? 0 : month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false
    });
  }

  const getBookingsForDate = (date) => {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return bookings.filter(b => {
      const start = new Date(b.start_date);
      const end = new Date(b.end_date);
      
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      
      const isWithinRange = checkDate >= startDateOnly && checkDate <= endDateOnly;
      if (!isWithinRange) return false;

      if (statusFilter !== 'all' && b.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const clientMatch = b.user_name?.toLowerCase().includes(query) || b.user_email?.toLowerCase().includes(query);
        const vehicleMatch = `${b.brand} ${b.model}`.toLowerCase().includes(query);
        const idMatch = b.id.toString().includes(query);
        return clientMatch || vehicleMatch || idMatch;
      }

      return true;
    });
  };

  const selectedDateBookings = getBookingsForDate(selectedDate);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'approved':
      case 'confirmé':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'pending':
      case 'en attente':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'completed':
      case 'terminé':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'cancelled':
      case 'annulé':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'approved':
      case 'confirmé':
        return 'Confirmé';
      case 'pending':
      case 'en attente':
        return 'En attente';
      case 'completed':
      case 'terminé':
        return 'Terminé';
      case 'cancelled':
      case 'annulé':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-serif text-premium-black">Calendrier des Réservations</h2>
            <p className="text-xs text-gray-500 mt-1">
              Visualisez le planning des locations et gérez les réservations au jour le jour.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              type="button"
              onClick={prevMonth}
              className="p-2 border border-gray-200 hover:border-premium-gold hover:text-premium-gold transition-colors bg-white rounded text-sm font-bold w-8 h-8 flex items-center justify-center"
              title="Mois précédent"
            >
              &lt;
            </button>
            <h3 className="text-xs font-bold uppercase tracking-widest min-w-[120px] text-center text-premium-black">
              {MONTHS_FR[month]} {year}
            </h3>
            <button 
              type="button"
              onClick={nextMonth}
              className="p-2 border border-gray-200 hover:border-premium-gold hover:text-premium-gold transition-colors bg-white rounded text-sm font-bold w-8 h-8 flex items-center justify-center"
              title="Mois suivant"
            >
              &gt;
            </button>
            <button 
              type="button"
              onClick={setToday}
              className="ml-2 px-4 py-2 border border-gray-200 text-[9px] font-bold uppercase tracking-widest hover:border-premium-gold hover:text-premium-gold transition-colors bg-white rounded"
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par client, voiture..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-premium-light-gray border-b border-gray-200 py-2 px-3 outline-none focus:border-premium-gold text-xs transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Statut :</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="flex-1 bg-premium-light-gray border-b border-gray-200 py-2 px-2 outline-none focus:border-premium-gold text-xs"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-start md:justify-end gap-3">
            {[
              { label: 'En attente', color: 'bg-amber-500' },
              { label: 'Confirmé', color: 'bg-emerald-500' },
              { label: 'Terminé', color: 'bg-blue-500' },
              { label: 'Annulé', color: 'bg-rose-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 text-[9px] text-gray-500">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] uppercase tracking-widest text-gray-400 mb-2">
              {DAYS_FR.map(d => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((cell, idx) => {
                const cellDate = new Date(cell.year, cell.month, cell.day);
                const dayBookings = getBookingsForDate(cellDate);
                
                const isSelected = selectedDate.getDate() === cell.day && 
                                   selectedDate.getMonth() === cell.month && 
                                   selectedDate.getFullYear() === cell.year;
                
                const isToday = new Date().getDate() === cell.day && 
                                new Date().getMonth() === cell.month && 
                                new Date().getFullYear() === cell.year;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(cellDate)}
                    className={`min-h-[85px] p-2 flex flex-col justify-between border text-left transition-all ${
                      cell.isCurrentMonth ? 'bg-white' : 'bg-gray-50/50 text-gray-400'
                    } ${
                      isSelected 
                        ? 'border-premium-gold ring-1 ring-premium-gold' 
                        : 'border-gray-100 hover:border-gray-300'
                    } ${isToday ? 'bg-premium-light-gray/40' : ''}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-[10px] font-bold ${
                        isToday 
                          ? 'w-5 h-5 rounded-full bg-premium-gold text-white flex items-center justify-center' 
                          : isSelected 
                            ? 'text-premium-gold' 
                            : 'text-gray-700'
                      }`}>
                        {cell.day}
                      </span>
                      {dayBookings.length > 0 && (
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-premium-black text-white">
                          {dayBookings.length}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 w-full overflow-hidden">
                      {dayBookings.slice(0, 2).map(b => (
                        <div 
                          key={b.id} 
                          className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded truncate border ${getStatusStyle(b.status)}`}
                          title={`${b.brand} ${b.model} - ${b.user_name}`}
                        >
                          {b.brand} {b.model}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-[7px] text-gray-400 font-semibold text-center mt-0.5">
                          + {dayBookings.length - 2} de plus
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-premium-light-gray/40 border border-gray-100 p-6 flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="border-b border-gray-200 pb-4 mb-4">
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-premium-gold">
                  Réservations du Jour
                </span>
                <h3 className="text-sm font-serif text-premium-black mt-1">
                  {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
              </div>

              {selectedDateBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-300 border border-gray-100 mb-3">
                    <Calendar size={16} />
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Aucune réservation active.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {selectedDateBookings.map(b => (
                    <div 
                      key={b.id} 
                      className="bg-white p-4 border border-gray-100 hover:border-premium-gold transition-all shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <p className="text-[9px] font-mono text-gray-400">#RES-{b.id}</p>
                          <h4 className="text-xs font-bold text-premium-black">{b.brand} {b.model}</h4>
                        </div>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${getStatusStyle(b.status)}`}>
                          {getStatusLabel(b.status)}
                        </span>
                      </div>

                      <div className="space-y-2 text-[11px] text-gray-600 mb-1 border-t border-gray-50 pt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Client :</span>
                          <span className="font-semibold text-premium-black">{b.user_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email :</span>
                          <span className="text-gray-500 font-mono text-[10px]">{b.user_email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Période :</span>
                          <span className="font-semibold text-premium-black">
                            {new Date(b.start_date).toLocaleDateString('fr-FR')} - {new Date(b.end_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Prix total :</span>
                          <span className="font-bold text-premium-gold">{b.total_price} €</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="bg-white p-3 border border-gray-100 rounded text-center">
                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                  Total de ce mois
                </span>
                <span className="text-sm font-serif text-premium-black font-semibold">
                  {bookings.filter(b => {
                    const start = new Date(b.start_date);
                    return start.getMonth() === month && start.getFullYear() === year;
                  }).length} réservations
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success("Statut de la réservation mis à jour avec succès.");
      const bookingsRes = await api.get('/admin/bookings');
      setBookings(bookingsRes.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Erreur de mise à jour.";
      toast.error(msg);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/admin/stats/summary'),
          api.get('/admin/bookings')
        ]);
        setStats(statsRes.data);
        setBookings(bookingsRes.data);
      } catch (_err) {
        toast.error("Erreur lors du chargement des données d'administration.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const TABS = [
    { id: 'stats', label: 'Vue d\'ensemble', icon: BarChart },
    { id: 'bookings', label: 'Réservations', icon: FileText },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'vehicles', label: 'Véhicules', icon: Car },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'reviews', label: 'Avis clients', icon: MessageSquare },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'home_config', label: 'Apparence', icon: Settings },
    { id: 'custom_order', label: 'Ordre personnalisé', icon: Palette },
    { id: 'settings', label: 'Système', icon: Database },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-premium-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6 border-b border-gray-100">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-1">
            Administration
          </p>
          <h1 className="text-xl font-serif text-premium-black">Dashboard</h1>
        </div>
        <nav className="py-4">
          {TABS.map(tab => (
            <TabButton 
              key={tab.id}
              active={activeTab === tab.id}
              icon={tab.icon}
              label={tab.label}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          <Motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'stats' && <StatsTab stats={stats} />}
            {activeTab === 'bookings' && <BookingsTab bookings={bookings} onUpdateStatus={handleUpdateBookingStatus} />}
            {activeTab === 'calendar' && <CalendarTab bookings={bookings} />}
            {activeTab === 'vehicles' && <VehiclesTab />}
            {activeTab === 'promotions' && <PromotionsTab />}
            {activeTab === 'home_config' && <HomeConfigTab />}
            {activeTab === 'custom_order' && <CustomOrderTab />}
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'clients' && <ClientsTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
          </Motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
