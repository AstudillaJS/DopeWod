import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';
import { Search, Plus, Check, X, Loader2 } from 'lucide-react';

interface ExerciseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ExerciseAutocomplete({ value, onChange, placeholder = 'BUSCAR EJERCICIO...', className }: ExerciseAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [results, setResults] = useState<{ id: string; name: string; category: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // States for inline registration
  const [isRegistering, setIsRegistering] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('Weightlifting');
  const [newExerciseEquipment, setNewExerciseEquipment] = useState('Barbell');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCategoryChange = (category: string) => {
    setNewExerciseCategory(category);
    if (category === 'Weightlifting') {
      setNewExerciseEquipment('Barbell');
    } else if (category === 'Gymnastics') {
      setNewExerciseEquipment('Bodyweight');
    } else if (category === 'Monostructural') {
      setNewExerciseEquipment('Machine');
    }
  };

  // Sync internal state with external value if it changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsRegistering(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchExercises = async () => {
      // Split by '+' to support complex exercises
      const parts = searchTerm.split('+');
      const activePart = parts[parts.length - 1] || '';
      const trimmedActivePart = activePart.trim();

      if (trimmedActivePart.length < 3) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);

      try {
        const snap = await getDocs(
          query(
            collection(db, 'exercises'),
            where('name', '>=', trimmedActivePart.toUpperCase()),
            where('name', '<=', trimmedActivePart.toUpperCase() + '\uf8ff'),
            orderBy('name'),
            limit(10)
          )
        );
        setResults(snap.docs.map(d => ({ id: d.id, name: d.data().name, category: d.data().category })));
      } catch (err) {
        console.error('Unexpected error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchExercises, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSelect = (exerciseName: string) => {
    const parts = searchTerm.split('+');
    
    // Replace the last typed segment with the selected exercise name
    parts[parts.length - 1] = ` ${exerciseName} `;
    
    // Reconstruct the full string
    let newValue = parts.map((p, idx) => {
      if (idx === 0) return p.trim();
      return p;
    }).join('+').toUpperCase();
    
    // Format spacing nicely around the '+' characters
    newValue = newValue.split('+').map(p => p.trim()).join(' + ').trim();

    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(false);
    setIsRegistering(false);
  };

  const handleCreateExercise = async () => {
    if (!newExerciseName.trim()) return;
    setIsCreating(true);
    setCreateError(null);

    try {
      const formattedName = newExerciseName.trim().toUpperCase();

      // Insert the new exercise into the 'exercises' collection in Firestore
      await addDoc(collection(db, 'exercises'), {
        name: formattedName,
        category: newExerciseCategory,
        equipment_type: newExerciseEquipment,
        created_at: new Date().toISOString(),
      });

      // Automatically select the newly created exercise
      handleSelect(formattedName);
    } catch (err: any) {
      console.error('Error creating exercise:', err);
      setCreateError(err.message || 'ERROR INESPERADO AL CREAR EL EJERCICIO.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onChange(e.target.value); // also update parent
          }}
          onFocus={() => {
            const parts = searchTerm.split('+');
            const trimmedActivePart = (parts[parts.length - 1] || '').trim();
            if (trimmedActivePart.length >= 3) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className={className || "w-full bg-black/40 border-b border-white/20 p-4 text-white font-headline text-2xl font-black uppercase outline-none focus:border-primary-cyan transition-all"}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary-cyan border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#051224] border border-primary-cyan/30 shadow-xl max-h-[350px] overflow-y-auto flex flex-col rounded-sm">
          {/* Results list */}
          {results.length > 0 && (
            <div className="overflow-y-auto flex-grow max-h-[220px]">
              {results.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => handleSelect(exercise.name)}
                  className="w-full text-left p-4 hover:bg-primary-cyan/10 border-b border-white/5 last:border-0 transition-all flex flex-col"
                >
                  <span className="font-headline font-black text-white uppercase text-lg">{exercise.name}</span>
                  <span className="font-headline font-black text-primary-cyan uppercase text-[10px] tracking-widest">{exercise.category}</span>
                </button>
              ))}
            </div>
          )}

          {results.length === 0 && !isLoading && !isRegistering && (
            <div className="p-6 text-center border-b border-white/5">
              <span className="font-headline text-white/40 uppercase text-xs tracking-wider block mb-2">No se encontraron resultados</span>
            </div>
          )}

          {/* Inline registration form or open button */}
          {!isRegistering ? (
            <button
              type="button"
              onClick={() => {
                const parts = searchTerm.split('+');
                const lastPart = parts[parts.length - 1]?.trim() || '';
                setNewExerciseName(lastPart.toUpperCase());
                setIsRegistering(true);
              }}
              className="w-full text-center p-4 bg-primary-cyan/5 hover:bg-primary-cyan/15 text-primary-cyan font-headline font-black uppercase text-xs tracking-widest border-t border-white/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} strokeWidth={3} />
              ¿No encuentras el ejercicio? Dar de alta nuevo
            </button>
          ) : (
            <div className="p-4 bg-black/80 border-t border-white/10 space-y-3 text-left">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="font-headline font-black text-white text-[10px] tracking-widest uppercase">REGISTRAR NUEVO EJERCICIO</span>
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(false)} 
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {createError && (
                <div className="text-red-500 font-headline font-black text-[9px] tracking-widest uppercase bg-red-500/10 p-2 border border-red-500/20">
                  {createError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest">Nombre del Ejercicio</label>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value.toUpperCase())}
                  placeholder="EJ: SQUAT SNATCH"
                  className="w-full bg-[#051224] border border-white/10 p-2.5 text-white font-headline text-xs font-black uppercase outline-none focus:border-primary-cyan/50 rounded-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest">Categoría</label>
                <select
                  value={newExerciseCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-[#051224] border border-white/10 p-2.5 text-white font-headline text-xs font-black uppercase outline-none focus:border-primary-cyan/50 rounded-sm cursor-pointer"
                >
                  <option value="Weightlifting">Weightlifting (Levantamiento)</option>
                  <option value="Gymnastics">Gymnastics (Gimnástico)</option>
                  <option value="Monostructural">Monostructural (Cardio / Metcon)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest">Tipo de Equipamiento</label>
                <select
                  value={newExerciseEquipment}
                  onChange={(e) => setNewExerciseEquipment(e.target.value)}
                  className="w-full bg-[#051224] border border-white/10 p-2.5 text-white font-headline text-xs font-black uppercase outline-none focus:border-primary-cyan/50 rounded-sm cursor-pointer"
                >
                  <option value="Barbell">Barbell (Barra)</option>
                  <option value="Bodyweight">Bodyweight (Corporal)</option>
                  <option value="Dumbbell">Dumbbell (Mancuerna)</option>
                  <option value="Kettlebell">Kettlebell (Pesa Rusa)</option>
                  <option value="Medicine Ball">Medicine Ball (Pelota Medicinal)</option>
                  <option value="Box">Box (Cajón)</option>
                  <option value="Rope">Rope (Cuerda)</option>
                  <option value="Machine">Machine (Máquina - Remo/EcoBike/etc.)</option>
                  <option value="Jump Rope">Jump Rope (Soga de Saltar)</option>
                  <option value="Bodyweight/Abmat">Bodyweight/Abmat (Abmat)</option>
                  <option value="GHD">GHD</option>
                  <option value="Sandbag">Sandbag (Saco de Arena)</option>
                  <option value="Tire">Tire (Neumático)</option>
                  <option value="Kettlebell/Dumbbell">Kettlebell/Dumbbell (Pesa Rusa/Mancuerna)</option>
                  <option value="Bodyweight/Box">Bodyweight/Box (Corporal/Cajón)</option>
                </select>
              </div>

              <button
                type="button"
                disabled={isCreating || !newExerciseName.trim()}
                onClick={handleCreateExercise}
                className="w-full bg-primary-cyan text-primary-navy p-3 font-headline font-black uppercase text-xs tracking-widest hover:bg-primary-cyan/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    CREANDO...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    CONFIRMAR Y SELECCIONAR
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
