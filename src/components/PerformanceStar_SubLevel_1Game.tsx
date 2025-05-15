import React, { useState, useEffect } from 'react';

interface PerformanceStar_SubLevel_1GameProps {
  score: number;
  onRetry: () => void;
  onContinue: () => void;
  isDarkMode: boolean;
}

const PerformanceStar_SubLevel_1Game: React.FC<PerformanceStar_SubLevel_1GameProps> = ({ 
  score, 
  onRetry, 
  onContinue, 
  isDarkMode 
}) => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, [score]);

  // Calculate star rating: 1 star for every 5 correct placeholders (max 4 stars)
  const getStarRating = () => {
    if (score === 20) return 4; // 20 correct placeholders
    if (score >= 15) return 3;  // 15–19 correct placeholders
    if (score >= 10) return 2;  // 10–14 correct placeholders
    if (score >= 5) return 1;   // 5–9 correct placeholders
    return 0;                   // 0–4 correct placeholders
  };

  // Calculate progress bar percentage: 25% for every 5 correct placeholders
  const getProgressPercentage = () => {
    if (score === 20) return 100; // 20 correct → 100%
    if (score >= 15) return 75;   // 15–19 correct → 75%
    if (score >= 10) return 50;   // 10–14 correct → 50%
    if (score >= 5) return 25;    // 5–9 correct → 25%
    return 0;                     // 0–4 correct → 0%
  };

  // Get progress bar color based on score
  const getProgressColor = () => {
    if (score === 20) return 'bg-gradient-to-r from-green-400 to-emerald-500'; // 20 correct → Green gradient
    if (score >= 15) return 'bg-gradient-to-r from-blue-400 to-indigo-500';   // 15–19 correct → Blue gradient
    if (score >= 10) return 'bg-gradient-to-r from-yellow-400 to-amber-500'; // 10–14 correct → Yellow gradient
    if (score >= 5) return 'bg-gradient-to-r from-red-400 to-rose-500';     // 5–9 correct → Red gradient
    return 'bg-gray-200';                    // 0–4 correct → Gray (empty)
  };

  // Render stars (4 stars total)
  const renderStars = () => {
    const starCount = getStarRating();
    return Array(4).fill(null).map((_, index) => (
      <div key={index} className="relative">
        <span 
          className={`text-4xl transition-all duration-500 ${
            index < starCount 
              ? 'text-yellow-400 scale-110' 
              : 'text-gray-300 scale-90 opacity-50'
          }`}
        >
          ★
        </span>
        {index < starCount && score === 20 && (
          <span className="absolute inset-0 text-4xl text-yellow-300 animate-ping opacity-50">★</span>
        )}
      </div>
    ));
  };

  // Bonus tip: Show only when score is 20 (all placeholders correct)
  const getBonusTip = () => {
    return score === 20 
      ? "Keep templates modular to save time and reduce errors." 
      : null;
  };

  // Motivational message to encourage earning all 4 stars
  const getMotivationalMessage = () => {
    const starCount = getStarRating();
    if (starCount < 4) {
      return (
        <p 
          className={`text-sm text-center mb-4 italic font-medium animate-pulse ${
            isDarkMode ? "text-teal-300" : "text-teal-600"
          }`}
        >
          🌟 Earn all 4 stars to unlock a real-world bonus tip that's super useful!
        </p>
      );
    }
    return null;
  };

  // Get background based on performance
  const getBackgroundClass = () => {
    if (score === 20) return 'bg-gradient-to-br from-emerald-500/10 to-green-600/10';
    if (score >= 15) return 'bg-gradient-to-br from-blue-500/10 to-indigo-600/10';
    if (score >= 10) return 'bg-gradient-to-br from-yellow-500/10 to-amber-600/10';
    if (score >= 5) return 'bg-gradient-to-br from-red-500/10 to-rose-600/10';
    return 'bg-gradient-to-br from-gray-500/10 to-gray-600/10';
  };

  // Get emoji based on performance
  const getEmoji = () => {
    if (score === 20) return '🏆';
    if (score >= 15) return '🌟';
    if (score >= 10) return '👍';
    if (score >= 5) return '🔍';
    return '🚀';
  };

  return (
    <div className="relative">
      {/* Backdrop blur effect */}
      <div className={`absolute inset-0 -m-5 backdrop-blur-lg rounded-3xl ${getBackgroundClass()} opacity-70`}></div>
      
      <div 
        className={`relative p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 border overflow-hidden ${
          isDarkMode
            ? "backdrop-blur-xl bg-gray-900/70 border-gray-700"
            : "backdrop-blur-xl bg-white/70 border-gray-200"
        }`}
      >
        {/* Animated Underlay Patterns */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-pink-500 blur-3xl -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-blue-500 blur-3xl translate-x-16 translate-y-16"></div>
        </div>

        {/* Top emoji badge */}
        <div className="absolute -top-4 right-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transform ${animate ? 'scale-125' : 'scale-100'} transition-all duration-300 ${
            isDarkMode ? 'bg-gray-800 shadow-lg' : 'bg-white shadow-md'
          }`}>
            {getEmoji()}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden mb-6 shadow-inner">
          <div 
            className={`h-6 transition-all duration-1000 ease-out ${getProgressColor()}`} 
            style={{ width: `${getProgressPercentage()}%` }}
          >
            <div className="h-full w-full bg-white/20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHBhdGggZD0iTTAgMGgxMHYxMEgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]"></div>
          </div>
        </div>

        {/* Score Badge */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-200 text-gray-800'
          }`}>
            {score}
          </div>
        </div>

        {/* Star Rating (4 stars) */}
        <div className="flex justify-center space-x-3 mb-6 mt-2">
          {renderStars()}
        </div>

        {/* Performance Message */}
        <h3 
          className={`text-2xl font-bold mb-4 text-center ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          <span className={`inline-block ${animate ? 'scale-110' : 'scale-100'} transition-all duration-300`}>
            {score === 20 ? "Perfect Performance!" : 
            score >= 15 ? "Excellent Performance!" : 
            score >= 10 ? "Good Job!" : 
            score >= 5 ? "Nice Start!" : 
            "Keep Practicing"}
          </span>
        </h3>

        {/* Motivational Message (shown if fewer than 4 stars) */}
        {getMotivationalMessage()}

        {/* Bonus Tip (shown only with 4 stars) */}
        {getBonusTip() && (
          <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50'}`}>
            <p 
              className={`text-sm text-center font-medium ${
                isDarkMode ? "text-teal-200" : "text-teal-800"
              }`}
            >
              💡 <span className="underline decoration-dotted underline-offset-2">Pro Tip:</span> {getBonusTip()}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between space-x-4">
          <button
            onClick={onRetry}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-102 active:scale-98 ${
              isDarkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Retry
          </button>
          <button
            onClick={onContinue}
            disabled={score < 10} // Require at least 10 correct placeholders to continue
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-102 active:scale-98 ${
              score >= 10 
                ? (isDarkMode 
                    ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-400 hover:to-emerald-500" 
                    : "bg-gradient-to-r from-teal-400 to-emerald-500 text-white hover:from-teal-500 hover:to-emerald-600")
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            {score >= 10 ? "Continue" : "Locked"}
          </button>
        </div>

        {/* Celebration for Perfect Score */}
        {score === 20 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-2 h-8 bg-yellow-400 rounded-full animate-confetti-1"></div>
            <div className="absolute top-0 left-1/3 w-2 h-12 bg-teal-400 rounded-full animate-confetti-2"></div>
            <div className="absolute top-0 left-1/2 w-2 h-10 bg-pink-400 rounded-full animate-confetti-3"></div>
            <div className="absolute top-0 left-2/3 w-2 h-6 bg-indigo-400 rounded-full animate-confetti-4"></div>
            <div className="absolute top-0 left-3/4 w-2 h-8 bg-amber-400 rounded-full animate-confetti-5"></div>
          </div>
        )}
      </div>
    </div>
  );
};



export default PerformanceStar_SubLevel_1Game;