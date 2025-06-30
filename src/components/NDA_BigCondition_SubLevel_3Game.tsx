import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NDA_BigCondition_SubLevel_3GameProps {
  score: number; // 1 if correct, 0 if not
  onRetry: () => void;
  onFinish: () => void;
  isDarkMode: boolean;
}

const ScaleIcon = ({ balanced, animate }: { balanced: boolean; animate: boolean }) => (
  <motion.div
    className="flex justify-center items-center"
    initial={false}
    animate={balanced && animate ? { rotate: [0, -10, 10, -5, 5, 0] } : { rotate: balanced ? 0 : -20 }}
    transition={{ duration: balanced && animate ? 1.2 : 0.6, type: 'spring', stiffness: 80 }}
    style={{ fontSize: 64, lineHeight: 1 }}
  >
    <span role="img" aria-label="scale">⚖️</span>
  </motion.div>
);

const NDA_BigCondition_SubLevel_3Game: React.FC<NDA_BigCondition_SubLevel_3GameProps> = ({
  score,
  onRetry,
  onFinish,
  isDarkMode,
}) => {
  const [showProTip, setShowProTip] = useState(false);
  const [animateScale, setAnimateScale] = useState(false);

  useEffect(() => {
    if (score === 1) {
      setTimeout(() => setAnimateScale(true), 300);
      setTimeout(() => setShowProTip(true), 1200);
    } else {
      setAnimateScale(false);
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
        className={`p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 bg-gradient-to-br ${isDarkMode ? 'from-gray-900 via-gray-800 to-black' : 'from-cyan-50 via-white to-gray-50'} border border-white/10 backdrop-blur-xl`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="flex flex-col items-center mb-6">
          <ScaleIcon balanced={score === 1} animate={animateScale} />
          <h2 className={`mt-4 text-2xl font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Logic Scale: Big Condition</h2>
          <div className="mt-2 text-lg">
            {score === 1 ? <span className="text-cyan-500">⭐⭐⭐</span> : <span className="text-red-400">❌</span>}
          </div>
          <div className={`mt-2 text-base font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {score === 1 ? 'Balanced Logic Achieved!' : 'Try again to balance the scale!'}
          </div>
        </div>
        <AnimatePresence>
          {score === 1 && showProTip && (
            <motion.div
              className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500/30' : 'bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-start space-x-2">
                <span className="text-lg">💡</span>
                <div>
                  <h3 className={`font-bold text-xs mb-1 ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Pro Tip Unlocked!</h3>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-cyan-200' : 'text-cyan-800'}`}>
                    Well-structured logic is like a balanced scale — clear grouping makes conditions easier to read, test, and maintain.
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
            onClick={onFinish}
            disabled={score < 1}
            className={`group px-6 py-3 rounded-xl font-medium flex items-center space-x-2 relative overflow-hidden ${score >= 1 ? (isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25' : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg hover:shadow-xl') : (isDarkMode ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed border border-gray-600/20' : 'bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-200')}`}
            whileHover={score >= 1 ? { scale: 1.05 } : {}}
            whileTap={score >= 1 ? { scale: 0.95 } : {}}
          >
            <span className="text-sm">✅</span>
            <span className="relative z-10 text-sm">Finish Training</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NDA_BigCondition_SubLevel_3Game; 