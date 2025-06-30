import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NDA_SmallCondition_SubLevel_2GameProps {
  score: number; // 1 if correct, 0 if not
  onRetry: () => void;
  onContinue: () => void;
  isDarkMode: boolean;
}

const ShieldIcon = ({ filled, animate }: { filled: boolean; animate: boolean }) => (
  <motion.svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ scale: 1 }}
    animate={filled && animate ? { scale: [1, 1.15, 0.95, 1.05, 1], filter: ["drop-shadow(0 0 8px #22c55e)", "drop-shadow(0 0 16px #22c55e)", "none"] } : {}}
    transition={{ duration: 0.8 }}
    style={{ display: 'block', margin: '0 auto' }}
  >
    <path
      d="M40 8L68 20V38C68 56 54.5 68 40 72C25.5 68 12 56 12 38V20L40 8Z"
      fill={filled ? '#22c55e' : '#e5e7eb'}
      stroke="#15803d"
      strokeWidth="3"
      style={{ filter: filled ? 'drop-shadow(0 0 12px #22c55e)' : 'none' }}
    />
    <motion.path
      d="M40 8L68 20V38C68 56 54.5 68 40 72C25.5 68 12 56 12 38V20L40 8Z"
      fill="none"
      stroke={filled ? '#22c55e' : '#94a3b8'}
      strokeWidth="3"
      initial={false}
      animate={filled && animate ? { pathLength: [0, 1] } : {}}
      transition={{ duration: 0.7 }}
    />
  </motion.svg>
);

const NDA_SmallCondition_SubLevel_2Game: React.FC<NDA_SmallCondition_SubLevel_2GameProps> = ({
  score,
  onRetry,
  onContinue,
  isDarkMode,
}) => {
  const [showProTip, setShowProTip] = useState(false);
  const [animateShield, setAnimateShield] = useState(false);

  useEffect(() => {
    if (score === 1) {
      setTimeout(() => setAnimateShield(true), 300);
      setTimeout(() => setShowProTip(true), 1200);
    } else {
      setAnimateShield(false);
      setShowProTip(false);
    }
  }, [score]);

  return (
    <motion.div
      className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 bg-gradient-to-br ${isDarkMode ? 'from-gray-900 via-gray-800 to-black' : 'from-emerald-50 via-white to-gray-50'} border border-white/10 backdrop-blur-xl`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="flex flex-col items-center mb-6">
          <ShieldIcon filled={score === 1} animate={animateShield} />
          <h2 className={`mt-4 text-2xl font-bold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Shield Fill: Small Condition</h2>
          <div className="mt-2 text-lg">
            {score === 1 ? <span className="text-emerald-500">⭐⭐⭐</span> : <span className="text-red-400">❌</span>}
          </div>
          <div className={`mt-2 text-base font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {score === 1 ? 'Correct! The shield is filled.' : 'Try again to fill the shield!'}
          </div>
        </div>
        <AnimatePresence>
          {score === 1 && showProTip && (
            <motion.div
              className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-r from-emerald-900/50 to-cyan-900/50 border border-emerald-500/30' : 'bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-start space-x-2">
                <span className="text-lg">💡</span>
                <div>
                  <h3 className={`font-bold text-xs mb-1 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Pro Tip Unlocked!</h3>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>
                    Write small conditions clearly — <code>employee_type == "contractor"</code> is more maintainable than complex logic inside curly braces.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-center space-x-3 mt-4">
          <motion.button
            onClick={onRetry}
            className={`group px-6 py-3 rounded-xl font-medium flex items-center space-x-2 ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-600/60 text-white border border-gray-600/30 hover:border-gray-500/50' : 'bg-white/80 hover:bg-white text-gray-800 border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm">🔁</span>
            <span className="text-sm">Retry</span>
          </motion.button>
          <motion.button
            onClick={onContinue}
            disabled={score < 1}
            className={`group px-6 py-3 rounded-xl font-medium flex items-center space-x-2 relative overflow-hidden ${score >= 1 ? (isDarkMode ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-emerald-500/25' : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg hover:shadow-xl') : (isDarkMode ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed border border-gray-600/20' : 'bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-200')}`}
            whileHover={score >= 1 ? { scale: 1.05 } : {}}
            whileTap={score >= 1 ? { scale: 0.95 } : {}}
          >
            <span className="text-sm">⏭️</span>
            <span className="relative z-10 text-sm">Continue</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NDA_SmallCondition_SubLevel_2Game; 