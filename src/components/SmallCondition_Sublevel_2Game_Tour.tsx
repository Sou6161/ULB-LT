import React, { useEffect, useState, useRef} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import confetti from 'canvas-confetti';
import { FaPenToSquare } from 'react-icons/fa6';
import { TbSettingsMinus } from 'react-icons/tb';
import { useHighlightedText } from '../context/HighlightedTextContext'; // Adjust path as needed
import { useQuestionType } from '../context/QuestionTypeContext'; // Adjust path as needed
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Sample document component (replace with actual document content)
import EmploymentAgreement from '../utils/EmploymentAgreement'; // Adjust path as needed

// Define icon type
interface Icon {
  icon: JSX.Element;
  label: string;
}

// Interface for highlighted element state
interface HighlightedElement {
  text: string;
  type: 'placeholder';
  bgColor: string;
}

interface SmallCondition_SubLevel_2GameProps {
  score: number;
  onRetry: () => void;
  onContinue: () => void;
  isDarkMode: boolean;
}

const icons: Icon[] = [
  { icon: <FaPenToSquare />, label: 'Edit PlaceHolder' },
  { icon: <TbSettingsMinus />, label: 'Small Condition' },
];

const SmallCondition_SubLevel_2Game: React.FC<SmallCondition_SubLevel_2GameProps> = ({
  score,
  onRetry,
  onContinue,
  isDarkMode,
}) => {
  const [percentage, setPercentage] = useState(0);
  const [showProTip, setShowProTip] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const { highlightedTexts, addHighlightedText } = useHighlightedText();
  const { selectedTypes, setSelectedTypes } = useQuestionType();
  const documentRef = useRef<HTMLDivElement>(null);
  const totalQuestions = 5;
  const correctAnswers = score;

  // Restore highlighted elements
  useEffect(() => {
    const savedHighlights = sessionStorage.getItem('highlightedElements');
    if (savedHighlights && documentRef.current) {
      try {
        const highlightedElements: HighlightedElement[] = JSON.parse(savedHighlights);
        highlightedElements.forEach(({ text, type, bgColor }) => {
          if (type === 'placeholder') {
            const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedText})`, 'gi');
            const walker = document.createTreeWalker(
              documentRef.current!,
              NodeFilter.SHOW_TEXT,
              null
            );
            const textNodes: Text[] = [];
            let node;
            while ((node = walker.nextNode())) {
              if (node.nodeType === Node.TEXT_NODE && node.textContent?.match(regex)) {
                textNodes.push(node as Text);
              }
            }
            textNodes.forEach((textNode) => {
              const parent = textNode.parentElement;
              if (parent && textNode.textContent) {
                const parts = textNode.textContent.split(regex);
                const fragment = document.createDocumentFragment();
                parts.forEach((part, index) => {
                  if (index % 2 === 1) {
                    const span = document.createElement('span');
                    span.style.backgroundColor = bgColor;
                    span.textContent = part;
                    fragment.appendChild(span);
                  } else {
                    fragment.appendChild(document.createTextNode(part));
                  }
                });
                parent.replaceChild(fragment, textNode);
              }
            });
          }
        });
      } catch (error) {
        console.error('Error restoring highlighted elements:', error);
      }
    }
  }, []);

  // Save highlighted element to sessionStorage
  const saveHighlightedElement = (
    text: string,
    type: 'placeholder',
    bgColor: string
  ) => {
    const savedHighlights = sessionStorage.getItem('highlightedElements');
    let highlightedElements: HighlightedElement[] = [];
    if (savedHighlights) {
      try {
        highlightedElements = JSON.parse(savedHighlights);
      } catch (error) {
        console.error('Error parsing highlighted elements:', error);
      }
    }
    highlightedElements = highlightedElements.filter((el) => el.text !== text);
    const newElement: HighlightedElement = { text, type, bgColor };
    highlightedElements.push(newElement);
    sessionStorage.setItem('highlightedElements', JSON.stringify(highlightedElements));
  };

  // Handle progress and confetti
  useEffect(() => {
    const calculatedPercentage = (correctAnswers / totalQuestions) * 100;
    setTimeout(() => setPercentage(calculatedPercentage), 800);
    if (correctAnswers === totalQuestions) {
      setTimeout(() => setShowProTip(true), 1500);
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#16a34a', '#15803d'],
        });
      }, 1000);
    }
  }, [correctAnswers]);

  // Initialize selectedTypes
  useEffect(() => {
    const savedTypes = sessionStorage.getItem('selectedQuestionTypes');
    if (!savedTypes && highlightedTexts.length > 0) {
      const initialTypes = highlightedTexts.map(() => 'Text');
      setSelectedTypes(initialTypes);
      sessionStorage.setItem('selectedQuestionTypes', JSON.stringify(initialTypes));
    }
  }, [highlightedTexts, setSelectedTypes]);

  // Handle icon click for highlighting
  const handleIconClick = (label: string) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    let textWithoutBrackets = selectedText;
    let hasValidBrackets = false;

    if (selectedText.startsWith('[') && selectedText.endsWith(']')) {
      textWithoutBrackets = selectedText.slice(1, -1);
      hasValidBrackets = true;
    } else if (selectedText.startsWith('{') && selectedText.endsWith('}')) {
      textWithoutBrackets = selectedText.slice(1, -1);
      hasValidBrackets = true;
    }

    if (
      (label === 'Edit PlaceHolder' && !selectedText.startsWith('[')) ||
      (label === 'Small Condition' && !selectedText.startsWith('{'))
    ) {
      console.log('Selected text does not have valid brackets:', selectedText);
      return;
    }

    if (label === 'Edit PlaceHolder') {
      if (highlightedTexts.includes(textWithoutBrackets)) {
        alert('This placeholder has already been added!');
        return;
      }
      addHighlightedText(textWithoutBrackets);
      const newTypes = [...selectedTypes, 'Text'];
      setSelectedTypes(newTypes);
      sessionStorage.setItem('selectedQuestionTypes', JSON.stringify(newTypes));

      const bgColor = isDarkMode ? 'rgba(255, 245, 157, 0.5)' : 'rgba(255, 245, 157, 0.7)';
      const span = document.createElement('span');
      span.style.backgroundColor = bgColor;
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);
      saveHighlightedElement(selectedText, 'placeholder', bgColor);
    } else if (label === 'Small Condition') {
      if (highlightedTexts.includes(textWithoutBrackets)) {
        alert('This condition has already been added!');
        return;
      }
      addHighlightedText(textWithoutBrackets);
      const newTypes = [...selectedTypes, 'Radio'];
      setSelectedTypes(newTypes);
      sessionStorage.setItem('selectedQuestionTypes', JSON.stringify(newTypes));

      const bgColor = isDarkMode ? 'rgba(129, 236, 236, 0.5)' : 'rgba(129, 236, 236, 0.7)';
      const span = document.createElement('span');
      span.style.backgroundColor = bgColor;
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);
      saveHighlightedElement(selectedText, 'placeholder', bgColor);
    }
  };

  // Shepherd.js tour
  useEffect(() => {
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shadow-md bg-purple-dark',
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
      useModalOverlay: true,
      confirmCancel: false,
      tourName: `product-tour-sub-level-2-${Date.now()}`,
    });

    tour.addStep({
      id: 'introduction',
      text: `
        <div class="welcome-message">
          <strong class="welcome-title">Product Tour 1: Automating Small Conditions (Sub Level 2)</strong>
          <p class="welcome-text">Welcome to Sub Level 2, automation champion! You've conquered placeholders in Sub Level 1—now it's time to master Small Conditions. These are conditional clauses that appear or disappear based on user choices.</p>
          <p class="mission-text"><strong>Your mission:</strong> Automate the overtime pay clause using curly braces { }. Let's unlock this power!</p>
        </div>
      `,
      attachTo: { element: document.body, on: 'bottom-start' },
      classes: 'shepherd-theme-custom animate__animated animate__fadeIn',
      buttons: [{ text: 'Start Tour →', action: tour.next }],
    });

    tour.addStep({
      id: 'identify-small-conditions',
      text: `
        <div>
          <strong>Step 2: Identify Small Conditions in Document</strong>
          <p>Look at the JOB TITLE AND DUTIES section. See that text wrapped in curly braces like <strong>{The Employee may be required to perform additional duties as reasonably assigned by the Company}</strong>. Curly brackets mark Small Conditions—text that only appears when certain criteria are met. Small conditions are your tool for creating dynamic, personalized documents!</p>
        </div>
      `,
      attachTo: {
        element: document.querySelector('#job-title-duties-section') || document.body,
        on: 'bottom',
      },
      buttons: [{ text: 'Next →', action: tour.next }],
    });

    tour.addStep({
      id: 'select-small-condition',
      text: `
        <div>
          <strong>Step 3: Select and Create Small Condition</strong>
          <p>Click and highlight the entire overtime pay clause wrapped in curly braces: <strong>{The Employee may be required to perform additional duties as reasonably assigned by the Company}</strong>. Notice how the entire conditional text gets selected? Now click the ‘Small Condition’ button. Congratulations! You've identified your first small condition.</p>
        </div>
      `,
      attachTo: {
        element: document.querySelector('#job-title-duties-section') || document.body,
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Verify Selection ✅',
          action: function () {
            const selection = window.getSelection();
            const selectedText = selection ? selection.toString().trim() : '';
            const overtimeClause = '{The Employee may be required to perform additional duties as reasonably assigned by the Company}';
            if (selectedText === overtimeClause) {
              tour.next();
            } else {
              alert('⚠️ Please select the entire overtime pay clause exactly as shown.');
            }
          },
        },
      ],
    });

    tour.addStep({
      id: 'click-small-condition-button',
      text: `
        <div>
          <strong>Step 3 (Continued): Click Small Condition Button</strong>
          <p>With the overtime clause highlighted, click the <strong>Small Condition</strong> button to add it.</p>
        </div>
      `,
      attachTo: { element: '#icon-small-condition', on: 'bottom' },
      buttons: [{ text: 'Next →', action: tour.next }],
    });

    tour.addStep({
      id: 'navigate-questionnaire',
      text: `
        <div>
          <strong>Step 4: Navigate to Questionnaire for Small Conditions</strong>
          <p>Time to power up this condition! Head to the 'Questionnaire' page by clicking 'Questionnaire' in the menu bar. This is where you'll create the yes/no question by choosing the ‘Radio button’ that controls when this overtime clause appears in the final document.</p>
        </div>
      `,
      attachTo: { element: '#Questionnaire-button', on: 'right' },
      buttons: [{ text: 'Next →', action: tour.next }],
    });

    tour.addStep({
      id: 'configure-question',
      text: `
        <div>
          <strong>Step 5: Configure the Small Condition Question</strong>
          <p>Perfect! You're now in the Small Conditions section of the questionnaire. See the default question: <strong>‘Is the Employee required to perform additional duties as part of their employment?’</strong> This is a Radio button question with Yes/No options. Here's the magic:</p>
          <ul>
            <li>If user selects <strong>YES</strong> → The clause appears in the document</li>
            <li>If user selects <strong>NO</strong> → The clause disappears entirely</li>
          </ul>
          <p>By DEFAULT, the condition would remain hidden unless selected to be displayed. Feel free to customise this question text to make it clearer for your users!</p>
        </div>
      `,
      attachTo: { element: document.body, on: 'center' },
      buttons: [{ text: 'Next →', action: tour.next }],
    });

    tour.addStep({
      id: 'test-small-condition',
      text: `
        <div>
          <strong>Step 6: Test Your Small Condition</strong>
          <p>Let's see your small condition in action! Switch to the 'Live Preview' tab. Try selecting 'Yes' for the <strong>‘Is the Employee required to perform additional duties as part of their employment?’</strong> question—watch the clause appear in the right hand side of the document! Now select 'No'—see how it vanishes? You've just created dynamic document content that adapts to user needs!</p>
        </div>
      `,
      attachTo: { element: '#live_generation', on: 'right' },
      buttons: [{ text: 'Complete Tour', action: tour.complete }],
    });

    tour.start();
    return () => tour.complete();
  }, []);

  // Animation variants (unchanged)
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0, y: 50, rotateX: -15 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300, duration: 0.6 },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.5, ease: 'easeOut' } },
  };

  const progressVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { scale: 1, rotate: 0, transition: { delay: 0.4, type: 'spring', damping: 20, stiffness: 300 } },
  };

  const starVariants = {
    hidden: { scale: 0, rotate: -45 },
    visible: { scale: 1, rotate: 0, transition: { delay: 0.6, type: 'spring', damping: 15, stiffness: 400 } },
  };

  const scoreVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.8, duration: 0.4, ease: 'easeOut' } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 1.0 + i * 0.1, duration: 0.4, ease: 'easeOut' },
    }),
    hover: { scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 10 } },
    tap: { scale: 0.95, transition: { type: 'spring', stiffness: 600, damping: 20 } },
  };

  const proTipVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', damping: 20, stiffness: 300, duration: 0.6 },
    },
  };

  const glowVariants = {
    initial: { opacity: 0.5, scale: 1 },
    animate: {
      opacity: [0.5, 0.8, 0.5],
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const getProgressColor = () => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#eab308';
    return '#ef4444';
  };

  const getStarRating = () => {
    if (correctAnswers === 5) return '⭐⭐⭐';
    if (correctAnswers >= 4) return '⭐⭐';
    if (correctAnswers >= 3) return '⭐';
    return '❌';
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
    if (correctAnswers === 5) return 'Perfect! You\'ve mastered this level! 🚀';
    if (correctAnswers >= 4) return 'Excellent work! Almost perfect! 💪';
    if (correctAnswers >= 3) return 'Good job! You can move forward! 👍';
    return 'Keep practicing! You\'ll get there! 💪';
  };

  return (
    <motion.div
      className="fixed inset-0 backdrop-blur-md bg-black/40 flex flex-col items-center justify-start z-50 p-4 overflow-y-auto"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Results Modal */}
      <motion.div
        className={`
          p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 mb-8
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
          <motion.div className="flex-1" variants={headerVariants} initial="hidden" animate="visible">
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
                <h2
                  className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent
                    ${isDarkMode ? 'from-teal-300 via-cyan-300 to-blue-300' : 'from-teal-600 via-cyan-600 to-blue-600'}
                  `}
                >
                  Small Conditions Mastery
                </h2>
                <motion.div className="flex items-center space-x-2" variants={starVariants} initial="hidden" animate="visible">
                  <motion.span
                    className="text-xl"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
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
          <motion.div className="relative w-24 h-24 ml-4" variants={progressVariants} initial="hidden" animate="visible">
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
        <motion.div className="text-center mb-6" variants={scoreVariants} initial="hidden" animate="visible">
          <motion.div
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl
              ${isDarkMode ? 'bg-gray-700/50 border border-gray-600/30' : 'bg-white/80 border border-gray-200/50'}
            `}
            whileHover={{
              scale: 1.05,
              boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.1)',
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <span className="text-lg">📊</span>
            <span className={`text-lg font-bold ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
              {correctAnswers} / {totalQuestions}
            </span>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              correct
            </span>
          </motion.div>
        </motion.div>
        {/* Pro Tip Section */}
        <AnimatePresence>
          {correctAnswers === totalQuestions && showProTip && (
            <motion.div
              className={`mb-6 p-4 rounded-xl
                ${isDarkMode ? 'bg-gradient-to-r from-teal-900/50 to-cyan-900/50 border border-teal-500/30' : 'bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200'}
              `}
              variants={proTipVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex items-start space-x-2">
                <motion.span
                  className="text-lg"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  💡
                </motion.span>
                <div>
                  <h3 className={`font-bold text-xs mb-1 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                    Pro Tip Unlocked!
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-teal-200' : 'text-teal-800'}`}>
                    Modularize your templates to improve readability and scalability. Breaking conditions into reusable blocks helps you debug faster.
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
              ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-600/60 text-white border border-gray-600/30 hover:border-gray-500/50' : 'bg-white/80 hover:bg-white text-gray-800 border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'}
            `}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            custom={0}
          >
            <motion.span className="text-sm" whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
              🔁
            </motion.span>
            <span className="text-sm">Retry</span>
          </motion.button>
          <motion.button
            onClick={onContinue}
            disabled={correctAnswers < 3}
            className={`group px-6 py-3 rounded-xl font-medium flex items-center space-x-2 relative overflow-hidden
              ${correctAnswers >= 3 ? (isDarkMode ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-teal-500/25' : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg hover:shadow-xl') : (isDarkMode ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed border border-gray-600/20' : 'bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-200')}
            `}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover={correctAnswers >= 3 ? 'hover' : {}}
            whileTap={correctAnswers >= 3 ? 'tap' : {}}
            custom={1}
          >
            {correctAnswers >= 3 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%', transition: { duration: 0.7, ease: 'easeInOut' } }}
              />
            )}
            <motion.span className="text-sm" whileHover={correctAnswers >= 3 ? { x: 4 } : {}} transition={{ duration: 0.2 }}>
              ⏭️
            </motion.span>
            <span className="relative z-10 text-sm">Continue</span>
          </motion.button>
        </div>
      </motion.div>
      {/* Icon Toolbar */}
      <div className="fixed flex top-16 right-0 z-50 px-6 py-3 space-x-6">
        {icons.map(({ icon, label }, index) => (
          <div key={index} className="relative flex items-center">
            <button
              id={label === 'Edit PlaceHolder' ? 'edit-placeholder' : `icon-${label.toLowerCase().replace(' ', '-')}`}
              className={`p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 ease-in-out flex items-center justify-center text-2xl
                ${isDarkMode ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800' : 'bg-gradient-to-r from-teal-400 to-cyan-400 text-white hover:from-teal-500 hover:to-cyan-500'}
              `}
              onMouseEnter={() => setTooltip(label)}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => handleIconClick(label)}
            >
              {icon}
            </button>
            {tooltip === label && (
              <div
                className={`absolute -left-10 top-full mt-2 px-3 py-1 text-sm text-white rounded-lg shadow-lg whitespace-nowrap animate-fadeIn
                  ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-gray-800 to-gray-900'}
                `}
              >
                {label}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Document Section */}
      <div className="max-w-5xl mx-auto mt-10 px-8 pb-20" ref={documentRef}>
        <div
          className={`p-6 rounded-3xl shadow-xl border
            ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-md border-gray-700/20 bg-gradient-to-br from-gray-700/70 via-gray-800/70 to-gray-900/70' : 'bg-white/80 backdrop-blur-md border-teal-100/20 bg-gradient-to-br from-teal-50/70 via-cyan-50/70 to-indigo-50/70'}
          `}
        >
          <EmploymentAgreement />
        </div>
      </div>
      {/* Selected Placeholders */}
      <div
        className={`max-w-5xl mx-auto p-8 rounded-3xl shadow-2xl border mt-8 transform transition-all duration-500 hover:shadow-3xl
          ${isDarkMode ? 'bg-gray-800/90 backdrop-blur-lg border-gray-700/50' : 'bg-white/90 backdrop-blur-lg border-teal-100/30'}
        `}
      >
        <h2 className={`text-2xl font-semibold mb-6 tracking-wide ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
          ☑️ Selected Placeholders
        </h2>
        {highlightedTexts.length > 0 ? (
          <ul
            className={`space-y-3 p-5 rounded-xl shadow-inner
              ${isDarkMode ? 'bg-gradient-to-r from-gray-700/70 via-gray-800/70 to-gray-900/70' : 'bg-gradient-to-r from-teal-50/70 via-cyan-50/70 to-indigo-50/70'}
            `}
          >
            {[...new Set(highlightedTexts)].map((text, index) => (
              <li
                id={`selected-placeholder${index}`}
                key={`${text}-${index}`}
                className={`flex items-center justify-between p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1
                  ${isDarkMode ? 'text-teal-200 bg-gray-600/80 hover:bg-gray-500/70' : 'text-teal-800 bg-white/80 hover:bg-teal-100/70'}
                `}
              >
                <div className="flex items-center">
                  <span className={`mr-3 text-lg ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`}>✓</span>
                  <span className="text-sm font-medium truncate max-w-xs">{text}</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'text-gray-300 bg-gray-500/50' : 'text-gray-600 bg-teal-100/50'}`}
                >
                  Type: {selectedTypes[index] || 'Text'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className={`text-center py-8 rounded-xl shadow-inner
              ${isDarkMode ? 'bg-gradient-to-r from-gray-700/70 via-gray-800/70 to-gray-900/70' : 'bg-gradient-to-r from-teal-50/70 via-cyan-50/70 to-indigo-50/70'}
            `}
          >
            <p className={`italic text-lg ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
              No placeholders selected yet
            </p>
          </div>
        )}
        {highlightedTexts.length > 0 && (
          <div className="mt-5 text-right">
            <span
              className={`text-sm px-3 py-1 rounded-full ${isDarkMode ? 'text-teal-300 bg-gray-600/50' : 'text-teal-600 bg-teal-100/50'}`}
            >
              Total Placeholders: {[...new Set(highlightedTexts)].length}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SmallCondition_SubLevel_2Game;
