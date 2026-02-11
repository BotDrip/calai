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
} from 'lucide-react';
import { useMealPlanner } from '../context/MealPlannerContext';
import type { MealSlot, NutritionPayload } from '../context/MealPlannerContext';
import { useToast } from '../context/ToastContext';
import { analyzeFoodImage } from '../lib/gemini'; // Import the AI function

type ScanResult = {
  foodName: string;
  confidence: number;
  nutrition: NutritionPayload;
  insights: string[];
  budgetAlternative?: {
    name: string;
    portion: string;
    protein: string;
    note: string;
  };
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

  const { addScanToMeal, scanHistory } = useMealPlanner();
  const { pushToast } = useToast();
  const chartData = useMemo(() => macroChartData(scanResult), [scanResult]);

  const stopCameraStream = () => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
      setSelectedImage(null);
      setScanResult(null);
      setScanError(null);
    };
  }, []);

  const openCamera = async () => {
    setScanError(null);
    setScanResult(null);
    setAddedToMeal(false);
    setSelectedImage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const message = 'Camera not supported in this browser. Please upload an image.';
      setScanError(message);
      pushToast(message, 'error');
      return;
    }

    try {
      stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      pushToast('Camera permission granted. Live preview ready.', 'success');
    } catch (error) {
      setScanError('Unable to start camera. Try image upload instead.');
      pushToast('Unable to start camera.', 'error');
      stopCameraStream();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !isCameraOn) {
      pushToast('Camera is not active. Open camera first.', 'error');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Canvas context unavailable.');

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compressed for API

      setSelectedImage(imageDataUrl);
      setScanResult(null);
      setScanError(null);
      setAddedToMeal(false);
      stopCameraStream();
      pushToast('Photo captured successfully.', 'success');
    } catch {
      setScanError('Failed to capture photo. Please try again.');
      pushToast('Failed to capture photo.', 'error');
    }
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setScanError(null);
    setScanResult(null);
    setAddedToMeal(false);
    stopCameraStream();

    if (!file.type.startsWith('image/')) {
      const message = 'Invalid file type. Please select an image file.';
      setScanError(message);
      pushToast(message, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
        pushToast('Image uploaded successfully.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const scanFood = async () => {
    setScanError(null);
    setAddedToMeal(false);

    if (!selectedImage) {
      const message = 'No image selected. Capture or upload an image before scanning.';
      setScanError(message);
      pushToast(message, 'info');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      // --- REAL AI CALL HAPPENS HERE ---
      const aiData = await analyzeFoodImage(selectedImage);
      
      const mappedResult: ScanResult = {
        foodName: aiData.foodName,
        confidence: aiData.healthScore * 10, // Approximate confidence from health score
        nutrition: {
          calories: aiData.calories,
          protein: aiData.protein,
          carbs: aiData.carbs,
          fats: aiData.fats,
          fiber: 0, // Gemini vision often misses fiber, defaulting to 0 or estimates
          estimatedWeight: 0, // Difficult to guess weight from 2D image without reference
        },
        insights: [
          aiData.recommendation,
          `Health Score: ${aiData.healthScore}/10`,
        ],
        // You can ask the AI for budget alternatives specifically if you update the prompt in gemini.ts
      };

      setScanResult(mappedResult);
      pushToast('Analysis complete!', 'success');
    } catch (error) {
      console.error(error);
      setScanError('AI Analysis failed. Please try a clearer image.');
      pushToast('AI Analysis failed.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddToMeal = () => {
    if (!scanResult) {
      pushToast('Scan food first to add it into Meal Planner.', 'info');
      return;
    }
    addScanToMeal(selectedMeal, scanResult.foodName, scanResult.nutrition);
    setAddedToMeal(true);
    pushToast(`Added to ${selectedMeal} meal planner totals.`, 'success');
  };

  return (
    <section className="space-y-6">
      <article className="glass-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <h2 className="text-xl font-bold text-slate-800">AI Food Scanner</h2>
        </div>

        <div className={`relative overflow-hidden rounded-3xl border border-white/70 bg-white/60 p-4 transition-all ${isScanning ? 'ring-2 ring-primary/40' : ''}`}>
          {isScanning && <div className="pointer-events-none absolute inset-0 animate-pulse bg-primary/5" />}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-slate-900 p-3">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-800">
                {isCameraOn ? (
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                ) : selectedImage ? (
                  <img src={selectedImage} alt="Selected food preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
                    Open camera or upload image to scan food
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button className="button-ghost w-full justify-start" type="button" onClick={openCamera}>
                <Camera size={16} /> Open Camera
              </button>

              {isCameraOn && (
                <button className="button-ghost w-full justify-start" type="button" onClick={capturePhoto}>
                  <ImagePlus size={16} /> Capture Photo
                </button>
              )}

              <label className="button-ghost flex w-full cursor-pointer items-center justify-start">
                <Upload size={16} /> Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>

              <button className="button-primary w-full justify-start" type="button" onClick={scanFood} disabled={isScanning}>
                {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Cpu size={16} />}
                {isScanning ? 'Analyzing...' : 'Scan Food'}
              </button>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                {scanError ? scanError : isScanning ? 'AI processing image...' : selectedImage ? 'Ready to scan' : 'Ready for AI scan'}
              </div>
            </div>
          </div>
        </div>
      </article>

      {scanResult && (
        <article className="grid gap-6 lg:grid-cols-3">
          <div className="glass-card space-y-4 p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Detected Food</p>
                <h3 className="text-lg font-bold text-slate-800">{scanResult.foodName}</h3>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                AI Confidence: {scanResult.confidence}%
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-52 rounded-2xl bg-white/70 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" innerRadius={55} outerRadius={78} stroke="none" paddingAngle={5}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'Calories', value: scanResult.nutrition.calories, max: 900 },
                  { key: 'Protein (g)', value: scanResult.nutrition.protein, max: 60 },
                  { key: 'Carbs (g)', value: scanResult.nutrition.carbs, max: 120 },
                  { key: 'Fats (g)', value: scanResult.nutrition.fats, max: 45 },
                ].map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{item.key}</span>
                      <span className="font-semibold text-slate-800">{item.value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary/80 transition-all duration-500"
                        style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card space-y-4 p-6">
            <h3 className="text-base font-bold text-slate-800">Add to Meal</h3>
            <select
              className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm outline-none"
              value={selectedMeal}
              onChange={(event) => setSelectedMeal(event.target.value as MealSlot)}
            >
              {mealOptions.map((meal) => (
                <option key={meal} value={meal}>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </option>
              ))}
            </select>

            <button className="button-primary w-full justify-center" type="button" onClick={handleAddToMeal}>
              Add to Meal Planner
            </button>

            {addedToMeal && (
              <p className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-700">
                <CheckCircle2 size={14} /> Meal Planner totals updated.
              </p>
            )}
          </div>
        </article>
      )}

      {scanResult && (
        <article className="glass-card p-6">
          <h3 className="mb-3 text-base font-bold text-slate-800">Smart AI Insights</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {scanResult.insights.map((insight, idx) => (
              <li key={idx} className="rounded-xl bg-white/80 p-3">
                {insight}
              </li>
            ))}
          </ul>
        </article>
      )}

      <article className="glass-card p-6">
        <h3 className="mb-3 text-base font-bold text-slate-800">History</h3>
        {scanHistory.length === 0 ? (
          <p className="text-sm text-slate-500">No scans added to meals yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {scanHistory.slice(0, 6).map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-white/80 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">{entry.foodName}</p>
                <p className="text-xs text-slate-500">
                  {entry.nutrition.calories} kcal | P {entry.nutrition.protein}g
                </p>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}