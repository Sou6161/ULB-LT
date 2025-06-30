import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface CompassProgressProps {
  score: number; // Number of correct placeholders (0-20)
  onRetry: () => void;
  onContinue: () => void;
  isDarkMode: boolean;
}

const NDACompassProgress_SubLevel_1Game: React.FC<CompassProgressProps> = ({
  score,
  onRetry,
  onContinue,
  isDarkMode,
}) => {
  const totalPlaceholders = 20;
  const [percentage, setPercentage] = useState(0);
  const [showProTip, setShowProTip] = useState(false);

  useEffect(() => {
    setPercentage((score / totalPlaceholders) * 100);
    setShowProTip(score >= 18);
  }, [score]);

  // Star rating logic
  const getStarRating = () => {
    if (score >= 18) return 3;
    if (score >= 12) return 2;
    if (score >= 6) return 1;
    return 0;
  };

  const getStarDisplay = () => {
    const stars = getStarRating();
    if (stars === 0) return '❌';
    return '⭐'.repeat(stars);
  };

  // Progress color
  const getProgressColor = () => {
    if (score >= 18) return '#22c55e'; // Green
    if (score >= 12) return '#3b82f6'; // Blue
    if (score >= 6) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  // Performance message
  const getPerformanceMessage = () => {
    if (score >= 18) return "Outstanding! You're a placeholder master.";
    if (score >= 12) return "Great job! You're getting the hang of it.";
    if (score >= 6) return "Good start! Keep practicing.";
    return "Keep trying! Practice makes perfect.";
  };

  // Pro Tip (only if 3 stars)
  const proTip =
    'Use clear, consistent placeholder formats. Avoid mismatched brackets or unclear terms.';

  // Button logic
  const canContinue = score >= 6;

  // Optional glow effect for 100%
  const glow = percentage === 100;

  return (
    <div
      className={`relative p-8 rounded-2xl shadow-xl max-w-md w-full mx-auto border overflow-hidden transition-all duration-500 ${
        isDarkMode
          ? 'bg-gray-900/80 border-gray-700'
          : 'bg-white/80 border-gray-200'
      }`}
    >
      {/* Compass Progress Ring */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32">
          <div
            className={`absolute inset-0 rounded-full blur-xl opacity-30 pointer-events-none transition-all duration-700 ${
              glow ? 'bg-green-400 animate-pulse' : ''
            }`}
          />
          <CircularProgressbar
            value={percentage}
            text={`${score} / ${totalPlaceholders}`}
            styles={buildStyles({
              pathColor: getProgressColor(),
              textColor: isDarkMode ? '#fff' : '#1f2937',
              trailColor: isDarkMode ? '#374151' : '#e5e7eb',
              pathTransitionDuration: 1.2,
              textSize: '18px',
            })}
            strokeWidth={12}
          />
        </div>
        <div className="mt-4 text-3xl flex items-center gap-2">
          <span>{getStarDisplay()}</span>
        </div>
        <div className={`mt-2 text-center text-base font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{getPerformanceMessage()}</div>
      </div>

      {/* Pro Tip (only if 3 stars) */}
      {showProTip && (
        <div className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50'}`}> 
          <p className={`text-sm text-center font-medium ${isDarkMode ? 'text-teal-200' : 'text-teal-800'}`}>
            💡 <span className="underline decoration-dotted underline-offset-2">Pro Tip:</span> {proTip}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={onRetry}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-102 active:scale-98 ${
            isDarkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          🔁 Retry
        </button>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-102 active:scale-98 ${
            canContinue
              ? isDarkMode
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-400 hover:to-emerald-500'
                : 'bg-gradient-to-r from-teal-400 to-emerald-500 text-white hover:from-teal-500 hover:to-emerald-600'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          ⏭️ Continue
        </button>
      </div>
    </div>
  );
};

export default NDACompassProgress_SubLevel_1Game; 