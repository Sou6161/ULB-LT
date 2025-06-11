import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import confetti from 'canvas-confetti';

interface SmallCondition_SubLevel_2GameProps {
  score: number;
  onRetry: () => void;
  onContinue: () => void;
  isDarkMode: boolean;
}

const SmallCondition_SubLevel_2Game: React.FC<SmallCondition_SubLevel_2GameProps> = ({
  score,
  onRetry,
  onContinue,
  isDarkMode,
}) => {
  const [percentage, setPercentage] = useState(0);
  const [showProTip, setShowProTip] = useState(false);
  const totalQuestions = 5;
  const correctAnswers = score;

  useEffect(() => {
    const calculatedPercentage = (correctAnswers / totalQuestions) * 100;
    
    // Animate progress bar
    setTimeout(() => setPercentage(calculatedPercentage), 800);

    // Show pro tip for perfect score
    if (correctAnswers === totalQuestions) {
      setTimeout(() => setShowProTip(true), 1500);
      
      // Trigger confetti
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#16a34a', '#15803d']
        });
      }, 1000);
    }
  }, [correctAnswers]);

  const getProgressColor = () => {
    if (percentage >= 80) return '#22c55e'; // Green (4-5 correct)
    if (percentage >= 60) return '#eab308'; // Yellow (3 correct)
    return '#ef4444'; // Red (0-2 correct)
  };

  const getStarRating = () => {
    if (correctAnswers === 5) return '⭐⭐⭐'; // 5/5 correct
    if (correctAnswers >= 4) return '⭐⭐';   // 4/5 correct
    if (correctAnswers >= 3) return '⭐';     // 3/5 correct
    return '❌';                              // 0-2 correct
  };

  const getGradientBackground = () => {
    if (isDarkMode) {
      if (percentage >= 80) return 'from-emerald-900/30 via-gray-800 to-gray-900';
      if (percentage >= 60) return 'from-yellow-900/30 via-gray-800 to-gray-900';
      return 'from-red-900/30 via-gray-800 to-gray-900';
    } else {
      if (percentage >= 80) return 'from-emerald-50 via-white to-gray-50';
      if (percentage >= 60) return 'from-yellow-50 via-white to-gray-50';
      return 'from-red-50 via-white to-gray-50';
    }
  };

  const getPerformanceMessage = () => {
    if (correctAnswers === 5) return "Perfect! You've mastered this level! 🚀";
    if (correctAnswers >= 4) return "Excellent work! Almost perfect! 💪";
    if (correctAnswers >= 3) return "Good job! You can move forward! 👍";
    return "Keep practicing! You'll get there! 💪";
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: 50,
      rotateX: -15
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.6
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const progressVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.4,
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }
  };

  const starVariants = {
    hidden: { scale: 0, rotate: -45 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.6,
        type: "spring",
        damping: 15,
        stiffness: 400
      }
    }
  };

  const scoreVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.8,
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.0 + (i * 0.1),
        duration: 0.4,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 20
      }
    }
  };

  const proTipVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
        duration: 0.6
      }
    }
  };

  const glowVariants = {
    initial: { opacity: 0.5, scale: 1 },
    animate: {
      opacity: [0.5, 0.8, 0.5],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 p-4"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className={`
          p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 
          bg-gradient-to-br ${getGradientBackground()}
          border border-white/10 backdrop-blur-xl
          ${isDarkMode ? 'shadow-black/50' : 'shadow-gray-300/50'}
        `}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        style={{ perspective: 1000 }}
      >
        
        {/* Header with Progress Circle */}
        <div className="flex items-center justify-between mb-6">
          <motion.div 
            className="flex-1"
            variants={headerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center space-x-3 mb-3">
              <motion.div 
                className={`flex items-center justify-center w-10 h-10 rounded-full
                  ${isDarkMode ? 'bg-teal-500/20 border border-teal-400/30' : 'bg-teal-100 border border-teal-200'}
                `}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-lg">🎯</span>
              </motion.div>
              <div>
                <h2 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent
                  ${isDarkMode 
                    ? 'from-teal-300 via-cyan-300 to-blue-300' 
                    : 'from-teal-600 via-cyan-600 to-blue-600'
                  }`}>
                  Small Conditions Mastery
                </h2>
                <motion.div 
                  className="flex items-center space-x-2"
                  variants={starVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.span 
                    className="text-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    {getStarRating()}
                  </motion.span>
                </motion.div>
              </div>
            </div>
            
            <motion.p 
              className={`text-xs font-medium px-3 py-1 rounded-full inline-block
                ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-white/70 text-gray-600'}
              `}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {getPerformanceMessage()}
            </motion.p>
          </motion.div>

          {/* Progress Circle with Glow Effect */}
          <motion.div 
            className="relative w-24 h-24 ml-4"
            variants={progressVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className={`absolute inset-0 rounded-full blur-lg opacity-20
                ${percentage >= 80 ? 'bg-green-400' : percentage >= 60 ? 'bg-yellow-400' : 'bg-red-400'}
              `}
              variants={glowVariants}
              initial="initial"
              animate="animate"
            />
            
            <div className="relative z-10">
              <CircularProgressbar
                value={percentage}
                text={`${Math.round(percentage)}%`}
                styles={buildStyles({
                  pathColor: getProgressColor(),
                  textColor: isDarkMode ? '#fff' : '#1f2937',
                  trailColor: isDarkMode ? '#374151' : '#e5e7eb',
                  pathTransitionDuration: 1.5,
                  textSize: '24px',
                  pathTransition: 'stroke-dashoffset 1.5s ease-in-out',
                })}
                strokeWidth={10}
              />
            </div>
          </motion.div>
        </div>

        {/* Score Details */}
        <motion.div 
          className="text-center mb-6"
          variants={scoreVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl
              ${isDarkMode 
                ? 'bg-gray-700/50 border border-gray-600/30' 
                : 'bg-white/80 border border-gray-200/50'
              }`}
            whileHover={{
              scale: 1.05,
              boxShadow: isDarkMode 
                ? "0 10px 30px rgba(0,0,0,0.3)" 
                : "0 10px 30px rgba(0,0,0,0.1)"
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-lg">📊</span>
            <span className={`text-lg font-bold
              ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}
            `}>
              {correctAnswers} / {totalQuestions}
            </span>
            <span className={`text-sm font-medium
              ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
            `}>
              correct
            </span>
          </motion.div>
        </motion.div>

        {/* Pro Tip Section */}
        <AnimatePresence>
          {correctAnswers === totalQuestions && showProTip && (
            <motion.div 
              className={`mb-6 p-4 rounded-xl
                ${isDarkMode 
                  ? 'bg-gradient-to-r from-teal-900/50 to-cyan-900/50 border border-teal-500/30' 
                  : 'bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200'
                }`}
              variants={proTipVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex items-start space-x-2">
                <motion.span 
                  className="text-lg"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  💡
                </motion.span>
                <div>
                  <h3 className={`font-bold text-xs mb-1
                    ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}
                  `}>
                    Pro Tip Unlocked!
                  </h3>
                  <p className={`text-xs leading-relaxed
                    ${isDarkMode ? 'text-teal-200' : 'text-teal-800'}
                  `}>
                    Modularize your templates to improve readability and scalability. 
                    Breaking conditions into reusable blocks helps you debug faster.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          <motion.button
            onClick={onRetry}
            className={`group px-6 py-3 rounded-xl font-medium flex items-center space-x-2
              ${isDarkMode
                ? 'bg-gray-700/50 hover:bg-gray-600/60 text-white border border-gray-600/30 hover:border-gray-500/50'
                : 'bg-white/80 hover:bg-white text-gray-800 border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
              }`}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            custom={0}
          >
            <motion.span 
              className="text-sm"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              🔁
            </motion.span>
            <span className="text-sm">Retry</span>
          </motion.button>
          
          <motion.button
            onClick={onContinue}
            disabled={correctAnswers < 3}
            className={`group px-6 py-3 rounded-xl font-medium flex items-center space-x-2 relative overflow-hidden
              ${correctAnswers >= 3
                ? isDarkMode
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-teal-500/25'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg hover:shadow-xl'
                : isDarkMode
                  ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed border border-gray-600/20'
                  : 'bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover={correctAnswers >= 3 ? "hover" : {}}
            whileTap={correctAnswers >= 3 ? "tap" : {}}
            custom={1}
          >
            {correctAnswers >= 3 && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{
                  x: "100%",
                  transition: { duration: 0.7, ease: "easeInOut" }
                }}
              />
            )}
            <motion.span 
              className="text-sm"
              whileHover={correctAnswers >= 3 ? { x: 4 } : {}}
              transition={{ duration: 0.2 }}
            >
              ⏭️
            </motion.span>
            <span className="relative z-10 text-sm">Continue</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SmallCondition_SubLevel_2Game;