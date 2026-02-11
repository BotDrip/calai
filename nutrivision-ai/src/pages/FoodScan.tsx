import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Camera,
  CheckCircle2,
  Cpu,
  ImagePlus,
  Loader2,
  Sparkles,
  Upload,
  ScanLine,
  History,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { useMealPlanner } from '../context/MealPlannerContext';
import type { MealSlot, NutritionPayload } from '../context/MealPlannerContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { analyzeFoodImage } from '../lib/gemini';
import { foodScanService, type FoodScan } from '../lib/supabase';

type ScanResult = {
  foodName: string;
  confidence: number;
  nutrition: NutritionPayload;
  insights: string[];
  portionSize?: string;
  category?: string;
  suitableFor?: string;
  micronutrients?: string;
};

const mealOptions: MealSlot[] = ['morning', 'afternoon', 'evening', 'night'];

function macroChartData(result: ScanResult | null) {
  if (!result) return [];
  return [
    { name: 'Protein', value: result.nutrition.protein, color: '#0EA5E9' },
    { name: 'Carbs', value: result.nutrition.carbs, color: '#22C55E' },
    { name: 'Fats', value: result.nutrition.fats, color: '#F59E0B' },
  ];
}

export default function FoodScan() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealSlot>('morning');
  const [addedToMeal, setAddedToMeal] = useState(false);
  const [recentScans, setRecentScans] = useState<FoodScan[]>([]);
  const [analytics, setAnalytics] = useState<{ total: number; avgConfidence: number; totalCalories: number } | null>(null);

  const { addScanToMeal } = useMealPlanner();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const chartData = useMemo(() => macroChartData(scanResult), [scanResult]);

  useEffect(() => {
    loadScanHistory();
    return () => {
      stopCameraStream();
    };
  }, [user]);

  const loadScanHistory = async () => {
    if (!user) return;

    try {
      const [scans, stats] = await Promise.all([
        foodScanService.getUserScans(user.uid, 10),
        foodScanService.getUserAnalytics(user.uid),
      ]);

      setRecentScans(scans || []);
      if (stats) {
        setAnalytics({
          total: stats.total_scans,
          avgConfidence: Math.round(stats.avg_confidence),
          totalCalories: Math.round(stats.total_calories_scanned),
        });
      }
    } catch (error) {
      console.error('Failed to load scan history:', error);
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const openCamera = async () => {
    setScanError(null);
    setScanResult(null);
    setSelectedImage(null);
    setAddedToMeal(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      pushToast('Camera not supported. Please upload an image.', 'error');
      return;
    }

    try {
      stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;

      setIsCameraOn(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Play error:", e));
        }
      }, 100);

      pushToast('Camera active.', 'success');
    } catch (error) {
      console.error(error);
      setScanError('Unable to access camera. Check permissions.');
      pushToast('Camera permission denied.', 'error');
      setIsCameraOn(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !isCameraOn) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        setSelectedImage(imageDataUrl);
        stopCameraStream();
        setAddedToMeal(false);
        pushToast('Photo captured!', 'success');
      }
    } catch (e) {
      console.error(e);
      pushToast('Capture failed.', 'error');
    }
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      pushToast('Please upload a valid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
        setScanResult(null);
        setScanError(null);
        setAddedToMeal(false);
        stopCameraStream();
        pushToast('Image loaded successfully.', 'success');
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const scanFood = async () => {
    if (!selectedImage) {
      pushToast('No image to scan!', 'info');
      return;
    }

    if (!user) {
      pushToast('Please sign in to use the scanner', 'error');
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const aiData = await analyzeFoodImage(selectedImage);

      const mappedResult: ScanResult = {
        foodName: aiData.foodName || "Unknown Food",
        confidence: aiData.confidenceScore || 85,
        nutrition: {
          calories: aiData.calories || 0,
          protein: aiData.protein || 0,
          carbs: aiData.carbs || 0,
          fats: aiData.fats || 0,
          fiber: aiData.fiber || 0,
          estimatedWeight: 0,
        },
        insights: [
          aiData.recommendation || "Enjoy your meal!",
          `Health Score: ${aiData.healthScore || 5}/10`,
          aiData.suitableFor ? `Best for: ${aiData.suitableFor}` : '',
        ].filter(Boolean),
        portionSize: aiData.portionSize,
        category: aiData.category,
        suitableFor: aiData.suitableFor,
        micronutrients: aiData.micronutrients,
      };

      setScanResult(mappedResult);

      // Save to database
      try {
        await foodScanService.saveScan(user.uid, {
          food_name: mappedResult.foodName,
          calories: mappedResult.nutrition.calories,
          protein: mappedResult.nutrition.protein,
          carbs: mappedResult.nutrition.carbs,
          fats: mappedResult.nutrition.fats,
          fiber: mappedResult.nutrition.fiber,
          confidence_score: mappedResult.confidence,
          health_score: aiData.healthScore || 5,
          portion_size: mappedResult.portionSize,
          food_category: mappedResult.category,
          added_to_meal: false,
          ai_recommendation: aiData.recommendation,
        });

        // Reload history
        loadScanHistory();
      } catch (dbError) {
        console.error('Failed to save scan:', dbError);
        pushToast('Scan completed but failed to save to history', 'info');
      }

      pushToast('Analysis Complete!', 'success');
    } catch (error: any) {
      console.error('Scan error:', error);
      setScanError(error.message || 'AI could not identify this food. Try a clearer angle.');
      pushToast(error.message || 'Scan failed. Please try again.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddToMeal = async () => {
    if (!scanResult || !user) return;

    addScanToMeal(selectedMeal, scanResult.foodName, scanResult.nutrition);
    setAddedToMeal(true);
    pushToast('Meal logged successfully!', 'success');
  };

  const handleDeleteScan = async (scanId: string) => {
    try {
      await foodScanService.deleteScan(scanId);
      pushToast('Scan deleted', 'success');
      loadScanHistory();
    } catch (error) {
      pushToast('Failed to delete scan', 'error');
    }
  };

  return (
    <section className="space-y-6 pb-20">

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-3 animate-in" style={{ animationDelay: '0ms' }}>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <ScanLine size={16} className="text-primary" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Scans</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{analytics.total}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-emerald-500" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Avg Confidence</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{analytics.avgConfidence}%</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-orange-500" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Analyzed</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{analytics.totalCalories} kcal</p>
          </div>
        </div>
      )}

      {/* Scanner Card */}
      <article className="glass-card p-6 animate-in" style={{ animationDelay: '100ms' }}>
        <div className="mb-4 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-primary to-blue-600 rounded-xl text-white shadow-lg shadow-primary/30">
            <ScanLine size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">AI Food Scanner</h2>
        </div>

        <div className={`relative overflow-hidden rounded-3xl border-2 border-slate-200/50 bg-slate-900 transition-all ${isScanning ? 'ring-4 ring-primary/30 border-primary' : ''}`}>

          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />

          <div className="relative z-10 grid gap-4 lg:grid-cols-2 p-4">

            {/* Viewfinder */}
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-800 ring-1 ring-white/10 shadow-inner group">
              {isCameraOn ? (
                <>
                   <video
                     ref={videoRef}
                     autoPlay
                     playsInline
                     muted
                     onLoadedMetadata={() => videoRef.current?.play()}
                     className="h-full w-full object-cover opacity-90"
                   />
                   <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent scan-line h-1/4 w-full z-20 border-b-2 border-primary/60 shadow-[0_0_20px_rgba(14,165,233,0.5)]"></div>
                </>
              ) : selectedImage ? (
                <>
                  <img src={selectedImage} alt="Preview" className="h-full w-full object-cover" />
                  {isScanning && (
                     <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent scan-line h-1/4 w-full z-20 border-b-2 border-primary/60 shadow-[0_0_20px_rgba(14,165,233,0.5)]"></div>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-3 h-full items-center justify-center px-4 text-center text-sm text-slate-400">
                  <div className="p-4 rounded-full bg-slate-700/50 group-hover:bg-slate-700 transition-colors">
                    <Camera size={32} className="text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                  <span>Open camera or upload image to start</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-3 flex flex-col justify-center">
              {!isCameraOn ? (
                <button className="button-ghost w-full justify-start hover:bg-white text-slate-200 hover:text-slate-800 border-slate-700 hover:border-white transition-all" type="button" onClick={openCamera}>
                  <Camera size={16} /> Open Camera
                </button>
              ) : (
                <button className="button-primary w-full justify-start" type="button" onClick={capturePhoto}>
                  <ImagePlus size={16} /> Capture Photo
                </button>
              )}

              <label className="button-ghost w-full flex cursor-pointer items-center justify-start hover:bg-white text-slate-200 hover:text-slate-800 border-slate-700 hover:border-white transition-all">
                <Upload size={16} /> Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>

              <button className="button-primary w-full justify-start mt-2" type="button" onClick={scanFood} disabled={isScanning || !selectedImage}>
                {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Cpu size={16} />}
                {isScanning ? 'Analyzing with AI...' : 'Scan Food'}
              </button>

              <div className="rounded-xl bg-slate-800/50 p-3 text-xs text-slate-400 border border-slate-700">
                {scanError ? (
                  <span className="text-red-400">{scanError}</span>
                ) : isScanning ? (
                  <span className="text-primary animate-pulse">Gemini AI is analyzing nutrition data...</span>
                ) : selectedImage ? (
                  <span className="text-green-400">Image ready. Click Scan Food to analyze.</span>
                ) : (
                  'Ready to scan. Camera or upload required.'
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Results Section */}
      {scanResult && (
        <article className="grid gap-6 lg:grid-cols-3 animate-in" style={{ animationDelay: '200ms' }}>

          <div className="glass-card space-y-4 p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Detected Food</p>
                <h3 className="text-2xl font-bold text-slate-800">{scanResult.foodName}</h3>
                {scanResult.portionSize && (
                  <p className="text-sm text-slate-600 mt-1">Portion: {scanResult.portionSize}</p>
                )}
                {scanResult.category && (
                  <p className="text-xs text-slate-500 mt-1">Category: {scanResult.category}</p>
                )}
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm border border-emerald-200">
                <Sparkles size={12} /> {scanResult.confidence}% Confidence
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 items-center">
              <div className="h-48 rounded-2xl bg-slate-50 p-2 border border-slate-100 relative">
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                    <span className="text-2xl font-bold text-slate-700">{scanResult.nutrition.calories}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Kcal</span>
                 </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" innerRadius={60} outerRadius={80} stroke="none" paddingAngle={4} cornerRadius={4}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'Protein', value: scanResult.nutrition.protein, max: 50, color: 'bg-primary' },
                  { key: 'Carbs', value: scanResult.nutrition.carbs, max: 100, color: 'bg-emerald-500' },
                  { key: 'Fats', value: scanResult.nutrition.fats, max: 40, color: 'bg-amber-500' },
                  { key: 'Fiber', value: scanResult.nutrition.fiber, max: 20, color: 'bg-purple-500' },
                ].map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">{item.key}</span>
                      <span className="text-slate-800">{item.value}g</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                        style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {scanResult.micronutrients && (
              <div className="rounded-xl bg-indigo-50 p-3 border border-indigo-100">
                <p className="text-xs font-semibold text-indigo-700 mb-1">Micronutrients</p>
                <p className="text-sm text-indigo-600">{scanResult.micronutrients}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
             <div className="glass-card space-y-4 p-6">
                <h3 className="text-base font-bold text-slate-800">Add to Meal</h3>
                <div className="relative">
                   <select
                     className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                     value={selectedMeal}
                     onChange={(event) => setSelectedMeal(event.target.value as MealSlot)}
                   >
                     {mealOptions.map((meal) => (
                       <option key={meal} value={meal}>
                         {meal.charAt(0).toUpperCase() + meal.slice(1)}
                       </option>
                     ))}
                   </select>
                </div>

                <button className="button-primary w-full justify-center" type="button" onClick={handleAddToMeal}>
                  Add to Planner
                </button>
                {addedToMeal && (
                  <p className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-medium text-green-700 border border-green-100">
                    <CheckCircle2 size={14} /> Added to {selectedMeal} meal!
                  </p>
                )}
             </div>

             <div className="glass-card p-6">
               <h3 className="mb-3 text-base font-bold text-slate-800">AI Insights</h3>
               <ul className="space-y-2 text-sm text-slate-600">
                 {scanResult.insights.map((insight, idx) => (
                   <li key={idx} className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                     {insight}
                   </li>
                 ))}
                 {scanResult.suitableFor && (
                   <li className="rounded-xl bg-blue-50 p-3 border border-blue-100 text-blue-700 font-medium">
                     Suitable for: {scanResult.suitableFor}
                   </li>
                 )}
               </ul>
             </div>
          </div>
        </article>
      )}

      {/* Scan History */}
      {recentScans.length > 0 && (
        <article className="glass-card p-6 animate-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <History size={18} className="text-primary" />
            <h3 className="text-lg font-bold text-slate-800">Recent Scans</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recentScans.map((scan) => (
              <div key={scan.id} className="rounded-xl bg-white/80 p-4 border border-slate-100 hover:border-primary/30 transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{scan.food_name}</p>
                    <p className="text-xs text-slate-500">{new Date(scan.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteScan(scan.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{scan.calories} kcal</span>
                  <span>P: {scan.protein}g</span>
                  <span>C: {scan.carbs}g</span>
                  <span>F: {scan.fats}g</span>
                </div>
                {scan.meal_type && (
                  <p className="text-xs text-primary mt-2 capitalize">{scan.meal_type} meal</p>
                )}
              </div>
            ))}
          </div>
        </article>
      )}
    </section>
  );
}
