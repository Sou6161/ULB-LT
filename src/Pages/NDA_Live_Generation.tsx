import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import { documentText } from "../utils/NDA_Agreement";
import { ThemeContext } from "../context/ThemeContext";
import { useScore } from "../context/ScoreContext";
import parse, { DOMNode, Element } from "html-react-parser";
import {
  findNDAPlaceholderByValue,
  determineNDAQuestionType,
} from "../utils/NDA_questionTypeUtils";
import NDACompassProgress_SubLevel_1Game from "../components/CompassProgress_SubLevel_1Game";
import NDA_SmallCondition_SubLevel_2Game from "../components/NDA_SmallCondition_SubLevel_2Game";
import NDA_BigCondition_SubLevel_3Game from "../components/NDA_BigCondition_SubLevel_3Game";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

// NDA-specific context for user answers (local state for isolation)
interface NDAUserAnswers {
  [key: string]: string | boolean | null | { amount: string; currency: string };
}

interface NDACustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPart: (part: string, isDemo?: boolean, isNDA?: boolean) => void;
  isDarkMode: boolean;
}

const NDACustomDialog: React.FC<NDACustomDialogProps> = ({
  isOpen,
  onClose,
  onSelectPart,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div
        className={`rounded-2xl w-full max-w-lg mx-4 transform transition-all duration-300 ease-out animate-scale-in ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          className={`p-6 border-b ${
            isDarkMode ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <div className="flex justify-between items-center">
            <h3
              className={`text-2xl font-bold ${
                isDarkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Choose Your Path
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
              aria-label="Close dialog"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
          <p
            className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} mt-2`}
          >
            Select which part you'd like to explore
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => onSelectPart("one", false)}
              className={`group relative flex items-center p-4 rounded-xl transition-all duration-300 ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-900/50 to-blue-800/50 hover:from-blue-800 hover:to-blue-700"
                  : "bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
              }`}
              aria-label="Select Part One"
            >
              <div
                className={`${
                  isDarkMode ? "bg-blue-700" : "bg-blue-500"
                } p-3 rounded-lg shadow-md`}
              >
                <span className="text-white text-xl">📄</span>
              </div>
              <div className="ml-4 text-left">
                <h4
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-blue-200" : "text-blue-900"
                  }`}
                >
                  Return to Beginner Quest
                </h4>
                <p
                  className={`${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  } text-sm`}
                >
                  Match The Following
                </p>
              </div>
            </button>
            <button
              onClick={() => onSelectPart("two-demo", true)}
              className={`group relative flex items-center p-4 rounded-xl transition-all duration-300 ${
                isDarkMode
                  ? "bg-gradient-to-r from-green-900/50 to-lime-800/50 hover:from-green-800 hover:to-lime-700"
                  : "bg-gradient-to-r from-green-50 to-green-100 hover:from-lime-100 hover:to-lime-200"
              }`}
            >
              <div
                className={`${
                  isDarkMode ? "bg-lime-700" : "bg-lime-500"
                } p-3 rounded-lg`}
              >
                <span className="text-white text-xl">🧩</span>
              </div>
              <div className="ml-4 text-left">
                <h4
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-lime-200" : "text-lime-900"
                  }`}
                >
                  Automation Quest: Demo Challenge
                </h4>
                <p
                  className={`${
                    isDarkMode ? "text-lime-400" : "text-lime-600"
                  } text-sm`}
                >
                  Automate Non-Disclosure Agreement
                </p>
              </div>
            </button>
          </div>
        </div>
        <div
          className={`p-6 rounded-b-2xl ${
            isDarkMode ? "bg-gray-800" : "bg-gray-50"
          }`}
        >
          <p
            className={`text-sm text-center ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            You can always switch between parts later
          </p>
        </div>
      </div>
    </div>
  );
};

const WarningAlert = ({ message, isVisible, isDarkMode }: { message: string; isVisible: boolean; isDarkMode: boolean }) => {
  if (!isVisible) return null;
  return (
    <div className={`fixed top-20 right-6 p-4 rounded-xl shadow-md transition-opacity duration-500 z-50 ${isDarkMode ? "bg-gradient-to-r from-red-800 to-red-900 border-l-4 border-red-500 text-red-200" : "bg-gradient-to-r from-red-100 to-red-200 border-l-4 border-red-400 text-red-800"} animate-fadeIn`}>
      <p className="font-bold">Warning</p>
      <p className="text-sm">{message}</p>
    </div>
  );
};

const smallConditionToQuestionMap: { [key: string]: string } = {
  "except to its employees and professional advisers who need to know the same for the Purpose, who know they owe a duty of confidence to the Discloser and who are bound by obligations equivalent to those in this clause 2 above and this clause 3": "Can the Recipient disclose the Confidential Information to employees or advisers?",
  "[Indefinitely]": "How long do the confidentiality obligations last?",
  "for [Insert number] years from the date of this Agreement": "How long do the confidentiality obligations last?"
};

const DURATION_MAIN_QUESTION = "Should the confidentiality obligations apply?";
const DURATION_FOLLOWUP_QUESTION = "Should they apply indefinitely?";
const DURATION_YEARS_QUESTION = "How many years should the obligations last?";

const NDA_Live_Generation = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { totalScore, setLevelTwoScore, resetScore } = useScore();
  const navigate = useNavigate();
  // NDA-specific state
  const [agreement, setAgreement] = useState<string>(documentText);
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string }>({});
  const [userAnswers, setUserAnswers] = useState<NDAUserAnswers>({});
  const [showWarning, setShowWarning] = useState(false);
  // NDA questions and types - these will be loaded from questionnaire state
  const [highlightedTexts, setHighlightedTexts] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<(string | null)[]>([]);
  const [editedQuestions, setEditedQuestions] = useState<string[]>([]);
  const [requiredQuestions, setRequiredQuestions] = useState<boolean[]>([]);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [showCompassProgressPopup, setShowCompassProgressPopup] = useState(false);
  const [ndaScore, setNdaScore] = useState(0);
  const [showSmallConditionPopup, setShowSmallConditionPopup] = useState(false);
  const [smallConditionScore, setSmallConditionScore] = useState(0);
  const [showBigConditionPopup, setShowBigConditionPopup] = useState(false);
  const [bigConditionScore, setBigConditionScore] = useState(0);

  // Load userAnswers from sessionStorage on component mount
  useEffect(() => {
    const savedAnswers = sessionStorage.getItem("ndaUserAnswers");
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        setUserAnswers(parsedAnswers);
      } catch (error) {
        console.error("Error parsing saved ndaUserAnswers:", error);
        sessionStorage.removeItem("ndaUserAnswers");
      }
    }
  }, []);

  // Save userAnswers to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("ndaUserAnswers", JSON.stringify(userAnswers));
  }, [userAnswers]);

  // Load state from NDA questionnaire
  useEffect(() => {
    let processedTexts: string[] = [];
    let questionOrder: number[] = [];
    let types: string[] = [];
    let editedQuestions: string[] = [];
    let requiredQuestions: boolean[] = [];

    // Try to load from ndaQuestionnaireState first
    const savedState = localStorage.getItem("ndaQuestionnaireState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        const stateEntries = Object.entries(parsedState);
        
        // Sort by order
        stateEntries.sort(([, a], [, b]) => (a as any).order - (b as any).order);
        
        // Use questionText for display and answering
        processedTexts = stateEntries.map(([, state]) => (state as any).questionText || "");
        questionOrder = stateEntries.map(([, state]) => (state as any).order);
        types = stateEntries.map(([, state]) => (state as any).type || "Text");
        editedQuestions = stateEntries.map(([, state]) => (state as any).questionText || "");
        requiredQuestions = stateEntries.map(([, state]) => (state as any).required || false);
        
        console.log("Loaded from ndaQuestionnaireState (using questionText):", parsedState);
      } catch (error) {
        console.error("Error parsing ndaQuestionnaireState:", error);
      }
    }

    // If no questionnaire state, check for legacy sessionStorage keys
    if (processedTexts.length === 0) {
      const savedOrder = sessionStorage.getItem("ndaQuestionOrder");
      if (savedOrder) {
        questionOrder = JSON.parse(savedOrder);
      }

      const savedTypes = sessionStorage.getItem("ndaSelectedQuestionTypes");
      if (savedTypes) {
        types = JSON.parse(savedTypes);
      }

      const savedHighlightedTexts = sessionStorage.getItem("ndaHighlightedTexts");
      if (savedHighlightedTexts) {
        processedTexts = JSON.parse(savedHighlightedTexts);
      }

      const savedEditedQuestions = sessionStorage.getItem("ndaEditedQuestions");
      if (savedEditedQuestions) {
        editedQuestions = JSON.parse(savedEditedQuestions);
      }

      const savedRequiredQuestions = sessionStorage.getItem("ndaRequiredQuestions");
      if (savedRequiredQuestions) {
        requiredQuestions = JSON.parse(savedRequiredQuestions);
      }

      console.log("Loaded from legacy sessionStorage");
    }

    // Reorder data based on questionOrder
    const reorderedHighlightedTexts = questionOrder
      .map((index) => processedTexts[index])
      .filter((text): text is string => text !== undefined);
    const reorderedSelectedTypes = questionOrder
      .map((index) => types[index] ?? "Text")
      .filter((type): type is string => type !== undefined);
    const reorderedEditedQuestions = questionOrder
      .map((index) => editedQuestions[index] || processedTexts[index] || "No text selected")
      .filter((text): text is string => text !== undefined);
    const reorderedRequiredQuestions = questionOrder
      .map((index) => requiredQuestions[index] ?? false)
      .filter((req): req is boolean => req !== undefined);

    setHighlightedTexts(reorderedHighlightedTexts);
    setSelectedTypes(reorderedSelectedTypes);
    setEditedQuestions(reorderedEditedQuestions);
    setRequiredQuestions(reorderedRequiredQuestions);

    console.log("Processed NDA placeholders (using questionText):", reorderedHighlightedTexts.length, reorderedHighlightedTexts);
  }, []);

  // Update NDA document preview when answers change
  useEffect(() => {
    let updatedText = documentText;

    // Handle NDA-specific placeholders
    Object.entries(userAnswers).forEach(([question, answer]) => {
      const placeholder = findNDAPlaceholderByValue(question);
      if (placeholder) {
        const escapedPlaceholder = placeholder.replace(/[.*+?^=!:${}()|[\]\/\\]/g, "\\$&");
        if (typeof answer === "string" && answer.trim()) {
          // Handle placeholders that already contain brackets (like "201[ ]")
          if (placeholder.includes("[") && placeholder.includes("]")) {
            // For placeholders with brackets, replace the entire placeholder
            updatedText = updatedText.replace(
              new RegExp(escapedPlaceholder, "gi"),
              `<span class="${isDarkMode ? "bg-blue-600/70 text-blue-100" : "bg-blue-200/70 text-blue-900"} px-1 rounded">${answer}</span>`
            );
          } else {
            // For regular placeholders, add brackets around them
            updatedText = updatedText.replace(
              new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
              `<span class="${isDarkMode ? "bg-blue-600/70 text-blue-100" : "bg-blue-200/70 text-blue-900"} px-1 rounded">${answer}</span>`
            );
          }
        } else if (typeof answer === "boolean") {
          // Handle placeholders that already contain brackets (like "201[ ]")
          if (placeholder.includes("[") && placeholder.includes("]")) {
            // For placeholders with brackets, replace the entire placeholder
            updatedText = updatedText.replace(
              new RegExp(escapedPlaceholder, "gi"),
              answer ? "Yes" : "No"
            );
          } else {
            // For regular placeholders, add brackets around them
            updatedText = updatedText.replace(
              new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
              answer ? "Yes" : "No"
            );
          }
        }
      }
    });

    // Handle NDA-specific small condition clause visibility
    // Clause text to match (must match exactly as in the template)
    const smallConditionQuestion = "Can the Recipient disclose the Confidential Information to employees or advisers?";
    const userSmallConditionAnswer = userAnswers[smallConditionQuestion];

    // Regex to match the clause in curly braces (as in the template)
    updatedText = updatedText.replace(
      /\{except to its employees and professional advisers who need to know the same for the Purpose, who know they owe a duty of confidence to the Discloser and who are bound by obligations equivalent to those in this clause 2 above and this clause 3\}/g,
      userSmallConditionAnswer === true
        ? '{except to its employees and professional advisers who need to know the same for the Purpose, who know they owe a duty of confidence to the Discloser and who are bound by obligations equivalent to those in this clause 2 above and this clause 3}'
        : ""
    );

    // Handle duration of obligations section visibility based on "Should the confidentiality obligations apply?" answer
    const indefinitelyQuestion = DURATION_MAIN_QUESTION;
    const userIndefinitelyAnswer = userAnswers[indefinitelyQuestion];
    const followupIndefinite = userAnswers[DURATION_FOLLOWUP_QUESTION];
    const yearsValue = userAnswers[DURATION_YEARS_QUESTION];
    if (userIndefinitelyAnswer === true) {
      // Show the duration section, but update the clause based on follow-up
      if (followupIndefinite === true) {
        // Insert "indefinitely"
        updatedText = updatedText.replace(
          /\(\[Indefinitely\] \[for \[Insert number\] years from the date of this Agreement\]\)\./g,
          "(indefinitely)."
        );
      } else if (followupIndefinite === false && yearsValue) {
        // Insert number of years
        updatedText = updatedText.replace(
          /\(\[Indefinitely\] \[for \[Insert number\] years from the date of this Agreement\]\)\./g,
          `(for ${yearsValue} years from the date of this Agreement).`
        );
      }
    } else {
      // Remove the entire duration of obligations section
      updatedText = updatedText.replace(
        /<div>\s*<h2 className="text-2xl font-bold mt-6">\(DURATION OF OBLIGATIONS<\/h2>\s*<p>\s*The undertakings above will continue in force \(\[Indefinitely\] \[for \[Insert number\] years from the date of this Agreement\]\)\.\)\s*<\/p>\s*<\/div>/g,
        ""
      );
    }

    setAgreement(updatedText);
  }, [userAnswers, isDarkMode]);


  const handleAnswerChange = (index: number, value: any, questionOverride?: string) => {
    const question = questionOverride || editedQuestions[index] || "";
    setUserAnswers((prev) => ({
      ...prev,
      [question]: value,
    }));
    setInputErrors((prev) => ({
      ...prev,
      [question]: "",
    }));
  };

  const renderAnswerInput = (index: number) => {
    // Always map the question for display
    let question = editedQuestions[index] || "";
    const rawText = highlightedTexts[index] || "";
    const { primaryValue, primaryType } = determineNDAQuestionType(rawText);
    if (!question || question === rawText) {
      question = primaryValue || smallConditionToQuestionMap[rawText] || rawText;
    }
    if (!question) return null;
    // Use the determined type from determineNDAQuestionType, fallback to selectedTypes
    const currentType = primaryType !== "Unknown" ? primaryType : selectedTypes[index] || "Text";
    const answer = userAnswers[question] !== undefined ? userAnswers[question] : currentType === "Radio" ? null : "";
    const error = inputErrors[question] || "";
    const isRequired = requiredQuestions[index] || false;
    if (question === DURATION_MAIN_QUESTION) {
      // Render the main radio
      return (
        <div key={index} className="mb-12">
          <div className="w-full">
            <p className={`text-lg font-medium ${isDarkMode ? "text-blue-200" : "text-blue-900"}`}>{question}{isRequired && <span className="text-red-500 ml-2">*</span>}</p>
            <div className="mt-4 flex space-x-6">
              <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                <input type="radio" name={`radio-${index}-${question}`} checked={answer === true} onChange={() => handleAnswerChange(index, true, question)} className="cursor-pointer" required={isRequired} />
                <span>Yes</span>
              </label>
              <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                <input type="radio" name={`radio-${index}-${question}`} checked={answer === false} onChange={() => handleAnswerChange(index, false, question)} className="cursor-pointer" required={isRequired} />
                <span>No</span>
              </label>
            </div>
            {/* Follow-up logic */}
            {answer === true && (
              <div className="mt-6">
                <p className={`text-base font-medium ${isDarkMode ? "text-blue-200" : "text-blue-900"}`}>{DURATION_FOLLOWUP_QUESTION}</p>
                <div className="mt-2 flex space-x-6">
                  <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                    <input type="radio" name={`radio-followup-indefinite`} checked={userAnswers[DURATION_FOLLOWUP_QUESTION] === true} onChange={() => handleAnswerChange(-1, true, DURATION_FOLLOWUP_QUESTION)} className="cursor-pointer" />
                    <span>Yes</span>
                  </label>
                  <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                    <input type="radio" name={`radio-followup-indefinite`} checked={userAnswers[DURATION_FOLLOWUP_QUESTION] === false} onChange={() => handleAnswerChange(-1, false, DURATION_FOLLOWUP_QUESTION)} className="cursor-pointer" />
                    <span>No</span>
                  </label>
                </div>
                {/* If No, ask for number of years */}
                {userAnswers[DURATION_FOLLOWUP_QUESTION] === false && (
                  <div className="mt-4">
                    <p className={`text-base font-medium ${isDarkMode ? "text-blue-200" : "text-blue-900"}`}>{DURATION_YEARS_QUESTION}</p>
                    <input
                      type="number"
                      min="1"
                      className={`mt-2 w-40 px-3 py-2 border rounded ${isDarkMode ? "bg-gray-700 text-blue-100 border-gray-600" : "bg-white text-blue-900 border-blue-200"}`}
                      value={typeof userAnswers[DURATION_YEARS_QUESTION] === "string" || typeof userAnswers[DURATION_YEARS_QUESTION] === "number" ? userAnswers[DURATION_YEARS_QUESTION] : ""}
                      onChange={e => handleAnswerChange(-1, e.target.value, DURATION_YEARS_QUESTION)}
                      required
                    />
                  </div>
                )}
              </div>
            )}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        </div>
      );
    }
    return (
      <div key={index} className="mb-12">
        <div className="w-full">
          <p className={`text-lg font-medium ${isDarkMode ? "text-blue-200" : "text-blue-900"}`}>{question}{isRequired && <span className="text-red-500 ml-2">*</span>}</p>
          {currentType === "Radio" ? (
            <div className="mt-4 flex space-x-6">
              <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                <input type="radio" name={`radio-${index}-${question}`} checked={answer === true} onChange={() => handleAnswerChange(index, true, question)} className="cursor-pointer" required={isRequired} />
                <span>Yes</span>
              </label>
              <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                <input type="radio" name={`radio-${index}-${question}`} checked={answer === false} onChange={() => handleAnswerChange(index, false, question)} className="cursor-pointer" required={isRequired} />
                <span>No</span>
              </label>
            </div>
          ) : currentType === "Date" ? (
            <input
              type="date"
              className={`mt-2 w-full px-3 py-2 border rounded ${isDarkMode ? "bg-gray-700 text-blue-100 border-gray-600" : "bg-white text-blue-900 border-blue-200"}`}
              value={answer as string}
              onChange={(e) => handleAnswerChange(index, e.target.value, question)}
              required={isRequired}
            />
          ) : currentType === "Number" ? (
            <input
              type="number"
              className={`mt-2 w-full px-3 py-2 border rounded ${isDarkMode ? "bg-gray-700 text-blue-100 border-gray-600" : "bg-white text-blue-900 border-blue-200"}`}
              value={answer as string}
              onChange={(e) => handleAnswerChange(index, e.target.value, question)}
              required={isRequired}
            />
          ) : currentType === "Email" ? (
            <input
              type="email"
              className={`mt-2 w-full px-3 py-2 border rounded ${isDarkMode ? "bg-gray-700 text-blue-100 border-gray-600" : "bg-white text-blue-900 border-blue-200"}`}
              value={answer as string}
              onChange={(e) => handleAnswerChange(index, e.target.value, question)}
              required={isRequired}
            />
          ) : currentType === "Paragraph" ? (
            <textarea
              className={`mt-2 w-full px-3 py-2 border rounded ${isDarkMode ? "bg-gray-700 text-blue-100 border-gray-600" : "bg-white text-blue-900 border-blue-200"}`}
              rows={4}
              value={answer as string}
              onChange={(e) => handleAnswerChange(index, e.target.value, question)}
              required={isRequired}
            />
          ) : (
            <input
              type="text"
              className={`mt-2 w-full px-3 py-2 border rounded ${isDarkMode ? "bg-gray-700 text-blue-100 border-gray-600" : "bg-white text-blue-900 border-blue-200"}`}
              value={answer as string}
              onChange={(e) => handleAnswerChange(index, e.target.value, question)}
              required={isRequired}
            />
          )}
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    );
  };

  const handleFinish = () => {
    const hasErrors = Object.values(inputErrors).some((error) => error !== "");
    if (hasErrors) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
      return;
    }
    const unansweredRequiredFields = editedQuestions
      .map((question, index) => {
        const isRequired = requiredQuestions[index] || false;
        if (!question || !isRequired) return null;
        const answer = userAnswers[question];
        if (answer === null || answer === "" || (typeof answer === "object" && answer !== null && (!answer.amount || !answer.currency))) {
          return question;
        }
        return null;
      })
      .filter(Boolean);
    if (unansweredRequiredFields.length > 0) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
      return;
    }
    // Detect if user is in Challenge 2: Small Conditions
    const selectedPart = parseInt(localStorage.getItem("selectedPart") || "0", 10);
    if (selectedPart === 2) {
      // Check if the small condition question is answered correctly
      const smallConditionQuestion = "Can the Recipient disclose the Confidential Information to employees or advisers?";
      const userSmallConditionAnswer = userAnswers[smallConditionQuestion];
      setSmallConditionScore(userSmallConditionAnswer === true ? 1 : 0);
      setShowSmallConditionPopup(true);
      return;
    }
    // Detect if user is in Challenge 3: Big Conditions
    if (selectedPart === 3) {
      // Check if the big condition question is answered correctly
      const bigConditionQuestion = "Should the confidentiality obligations apply?";
      const userBigConditionAnswer = userAnswers[bigConditionQuestion];
      setBigConditionScore(userBigConditionAnswer === true ? 1 : 0);
      setShowBigConditionPopup(true);
      return;
    }
    // Default: NDA placeholder score (count of correctly filled [ ... ] placeholders)
    let correctPlaceholders = 0;
    editedQuestions.forEach((question) => {
      const answer = userAnswers[question];
      if (
        answer !== null &&
        answer !== "" &&
        !(typeof answer === "object" && answer !== null && (!answer.amount || !answer.currency))
      ) {
        correctPlaceholders += 1;
      }
    });
    setNdaScore(correctPlaceholders);
    setShowCompassProgressPopup(true);
  };

  const handleRetryCompass = () => {
    // Clear all NDA-related state
    setUserAnswers({});
    setHighlightedTexts([]);
    setSelectedTypes([]);
    setEditedQuestions([]);
    setRequiredQuestions([]);
    // Remove from sessionStorage
    sessionStorage.removeItem("ndaUserAnswers");
    sessionStorage.removeItem("highlightedTexts");
    sessionStorage.removeItem("ndaSelectedQuestionTypes");
    sessionStorage.removeItem("ndaEditedQuestions");
    sessionStorage.removeItem("ndaRequiredQuestions");
    sessionStorage.removeItem("ndaQuestionOrder");
    sessionStorage.removeItem("ndaLevelTwoPartTwoState");
    localStorage.removeItem("ndaLevelTwoPartTwoState");
    // Remove from localStorage to reset placeholder selection
    localStorage.removeItem("ndaQuestionnaireState");
    setShowCompassProgressPopup(false);
    setLevelTwoScore(0);
    resetScore();
    window.location.href = "/NDA_LevelTwoPart_Two";
  };

  const handleContinueCompass = () => {
    setShowCompassProgressPopup(false);
    navigate("/NDA_Finish", { state: { userAnswers } });
  };

  const handleSelectPart = (part: string, isDemo: boolean = false) => {
    setShowCustomDialog(false);
    if (part === "one") {
      navigate("/Level-Two-Part-One");
    } else if (part === "two-demo") {
      navigate("/NDA_LevelTwoPart_Two-Demo", {
        state: {
          startTour: isDemo,
        },
      });
    }
  };

  // Check if user just completed NDA level and show dialog
  useEffect(() => {
    const justCompletedNDA = sessionStorage.getItem("justCompletedNDA");
    if (justCompletedNDA === "true") {
      setShowCustomDialog(true);
      sessionStorage.removeItem("justCompletedNDA");
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("ndaProductTourCompleted")) return;
    const selectedPart = parseInt(localStorage.getItem("selectedPart") || "0", 10);
    if (selectedPart === 1) {
      setTimeout(() => {
        const tour = new Shepherd.Tour({
          defaultStepOptions: {
            cancelIcon: { enabled: true },
            classes: "shadow-md bg-purple-dark",
            scrollTo: { behavior: "smooth", block: "center" },
          },
          useModalOverlay: true,
        });
        tour.addStep({
          id: "welcome-nda-live-gen-1",
          text: `
            <div class="welcome-message">
              <strong>🚀 NDA Live Generation</strong>
              <p>This is where you bring your NDA to life!</p>
              <p>Answer the questions below to customize your NDA agreement.</p>
            </div>
          `,
          attachTo: { element: document.body, on: "bottom-start" },
          buttons: [{ text: "Next", action: tour.next }],
        });
        tour.addStep({
          id: "answer-questions-1",
          text: `Fill out <strong>all the required questions</strong> to ensure your NDA is complete and tailored to your needs. Each answer will update your document in real time!`,
          attachTo: { element: "form, .questionnaire-section, .w-full.flex.flex-col", on: "top" },
          buttons: [{ text: "Next", action: tour.next }],
        });
        tour.addStep({
          id: "get-nda-1",
          text: `Once you've answered all questions, you'll receive a <strong>fully customized NDA document</strong> ready to download or use. Make sure to review your answers before finishing!`,
          attachTo: { element: "button[type='submit'], .download-btn, .finish-btn", on: "top" },
          buttons: [{ text: "Finish", action: () => { localStorage.setItem("ndaProductTourCompleted", "true"); tour.complete(); } }],
        });
        tour.start();
      }, 500);
      return () => {
        Shepherd.activeTour && Shepherd.activeTour.complete();
      };
    }
    if (selectedPart === 2) {
      setTimeout(() => {
        const tour = new Shepherd.Tour({
          defaultStepOptions: {
            cancelIcon: { enabled: true },
            classes: "shadow-md bg-purple-dark",
            scrollTo: { behavior: "smooth", block: "center" },
          },
          useModalOverlay: true,
        });
        tour.addStep({
          id: "welcome-nda-live-gen-2",
          text: `
            <div class='welcome-message'>
              <strong>🎉 Challenge 2: Small Conditions</strong>
              <p>This is where you automate small conditions in your NDA!</p>
              <p>Answer the small condition question to control the appearance of optional clauses.</p>
            </div>
          `,
          attachTo: { element: document.body, on: "bottom-start" },
          buttons: [{ text: "Next", action: tour.next }],
        });
        tour.addStep({
          id: "answer-small-condition",
          text: `This is the <strong>small condition</strong> question. Your answer will determine if the optional clause appears in your NDA.`,
          attachTo: { element: "form, .questionnaire-section, .w-full.flex.flex-col", on: "top" },
          buttons: [{ text: "Next", action: tour.next }],
        });
        tour.addStep({
          id: "get-nda-2",
          text: `Once you've answered all questions, you'll receive a <strong>fully customized NDA document</strong> with your chosen small conditions. Make sure to review your answers before finishing!`,
          attachTo: { element: "button[type='submit'], .download-btn, .finish-btn", on: "top" },
          buttons: [{ text: "Finish", action: () => { localStorage.setItem("ndaProductTourCompleted", "true"); tour.complete(); } }],
        });
        tour.start();
      }, 500);
      return () => {
        Shepherd.activeTour && Shepherd.activeTour.complete();
      };
    }
  }, []);

  return (
    <div className={`min-h-screen flex flex-col font-sans relative transition-all duration-500 ${isDarkMode ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black" : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"}`}>
      <Navbar level="/NDA_LevelTwoPart_Two" questionnaire="/NDA_Questionnaire" live_generation="/NDA_Live_Generation" />
      <div className={`fixed top-14 right-2 p-2 rounded-lg shadow-md z-50 ${isDarkMode ? "bg-gray-700/90 text-teal-300" : "bg-white/90 text-teal-700"}`}>
        <p className="font-bold">Score: {totalScore}</p>
      </div>
      <div className="fixed bottom-6 left-14 transform -translate-x-1/2 z-50 flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
        >
          Back
        </button>
      </div>
      <div className="flex-grow flex items-center justify-center py-12 px-6">
        <div className="flex flex-row w-full max-w-7xl">
          <div className={`flex flex-col w-1/2 pl-4 pr-8 sticky top-12 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl shadow-lg border p-6 ${isDarkMode ? "bg-gradient-to-b from-gray-700/70 to-gray-800/70 border-gray-700/20" : "bg-gradient-to-b from-teal-50/50 to-cyan-50/50 border-teal-100/20"}`}>
            {highlightedTexts.length > 0 ? (
              <>
                <h2 className={`text-2xl font-semibold mb-6 tracking-wide ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>NDA Questions</h2>
                {highlightedTexts.map((_, index) => renderAnswerInput(index))}
                <div className="flex justify-end mt-8">
                  <button className={`px-6 py-3 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ${isDarkMode ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800" : "bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500"}`} onClick={handleFinish}>Finish</button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className={`text-lg font-medium ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>No questions have been generated yet.</p>
                <p className={`text-sm mt-3 ${isDarkMode ? "text-teal-400" : "text-teal-500"}`}>Please go to the NDA Questionnaire tab, create or select questions from the Document tab, and then return here to answer them and generate a live NDA document preview.</p>
              </div>
            )}
          </div>
          <div className={`w-1/2 pl-8 rounded-xl shadow-lg border ${isDarkMode ? "bg-gray-800/90 backdrop-blur-sm border-gray-700/20" : "bg-white/90 backdrop-blur-sm border-teal-100/20"}`}>
            <div className="mt-6 p-6">
              {parse(agreement, {
                replace: (domNode: DOMNode) => {
                  if (domNode instanceof Element && domNode.attribs) {
                    const className = domNode.attribs.className || "";
                    if (className.includes("bg-white")) {
                      domNode.attribs.className = "bg-white rounded-lg shadow-sm border border-black-100 p-8";
                    }
                    if (className.includes("text-blue-600 leading-relaxed")) {
                      domNode.attribs.className = "text-blue-600 leading-relaxed space-y-6";
                    }
                  }
                  return domNode;
                },
              })}
            </div>
          </div>
          <WarningAlert message="Please correct all input errors and answer all required questions before finishing." isVisible={showWarning} isDarkMode={isDarkMode} />
          <NDACustomDialog
            isOpen={showCustomDialog}
            onClose={() => setShowCustomDialog(false)}
            onSelectPart={handleSelectPart}
            isDarkMode={isDarkMode}
          />
          {/* Compass Progress Popup for NDA Placeholders */}
          {showCompassProgressPopup && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
              <NDACompassProgress_SubLevel_1Game
                score={ndaScore}
                onRetry={handleRetryCompass}
                onContinue={handleContinueCompass}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
          {/* Shield Fill Popup for NDA Small Condition (Challenge 2) */}
          {showSmallConditionPopup && (
            <NDA_SmallCondition_SubLevel_2Game
              score={smallConditionScore}
              onRetry={() => {
                setShowSmallConditionPopup(false);
                handleRetryCompass();
              }}
              onContinue={() => {
                setShowSmallConditionPopup(false);
                handleContinueCompass();
              }}
              isDarkMode={isDarkMode}
            />
          )}
          {/* Logic Scale Popup for NDA Big Condition (Challenge 3) */}
          {showBigConditionPopup && (
            <NDA_BigCondition_SubLevel_3Game
              score={bigConditionScore}
              onRetry={() => {
                setShowBigConditionPopup(false);
                handleRetryCompass();
              }}
              onFinish={() => {
                setShowBigConditionPopup(false);
                handleContinueCompass();
              }}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NDA_Live_Generation;