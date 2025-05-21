import { useNavigate } from "react-router-dom";
import { useState, useRef, useCallback, useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import { documentText } from "../utils/EmploymentAgreement";
import { useHighlightedText } from "../context/HighlightedTextContext";
import { useQuestionType } from "../context/QuestionTypeContext";
import { useQuestionEditContext } from "../context/QuestionEditContext";
import { ThemeContext } from "../context/ThemeContext";
import { useUserAnswers } from "../context/UserAnswersContext";
import parse, { DOMNode, Element } from "html-react-parser";
import PerformanceStar_SubLevel_1Game from "../components/PerformanceStar_SubLevel_1Game";
import CodeCircuit_SubLevel_3Game from "../components/CodeCircuit_SubLevel_3Game";
import { useScore } from "../context/ScoreContext";


// Warning Alert Component
interface WarningAlertProps {
  message: string;
  isVisible: boolean;
  isDarkMode: boolean;
}

const WarningAlert: React.FC<WarningAlertProps> = ({ message, isVisible, isDarkMode }) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-20 right-6 p-4 rounded-xl shadow-md transition-opacity duration-500 z-50 ${
        isDarkMode
          ? "bg-gradient-to-r from-red-800 to-red-900 border-l-4 border-red-500 text-red-200"
          : "bg-gradient-to-r from-red-100 to-red-200 border-l-4 border-red-400 text-red-800"
      } animate-fadeIn`}
    >
      <p className="font-bold">Warning</p>
      <p className="text-sm">{message}</p>
    </div>
  );
};

// Certification Popup Component (for Placeholders - Part 1)
interface CertificationPopupProps {
  message: string;
  isVisible: boolean;
  isDarkMode: boolean;
  onContinue: () => void;
  onReplay: () => void;
  score: number;
}

const CertificationPopup: React.FC<CertificationPopupProps> = ({
  isVisible,
  isDarkMode,
  onContinue,
  onReplay,
  score,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <PerformanceStar_SubLevel_1Game 
        score={score} // Pass the score directly (0–20)
        onRetry={onReplay} 
        onContinue={onContinue} 
        isDarkMode={isDarkMode} 
      />
    </div>
  );
};

// Code Circuit Popup Component (for Big Conditions - Part 3)
interface CodeCircuit_SubLevel_3GamePopupProps {
  isVisible: boolean;
  isDarkMode: boolean;
  highlightedTexts: string[];
  userAnswers: { [key: string]: any };
  onContinue: () => void;
  onReplay: () => void;
}

const CodeCircuit_SubLevel_3GamePopup: React.FC<CodeCircuit_SubLevel_3GamePopupProps> = ({
  isVisible,
  isDarkMode,
  highlightedTexts,
  userAnswers,
  onContinue,
  onReplay,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <CodeCircuit_SubLevel_3Game
        highlightedTexts={highlightedTexts}
        userAnswers={userAnswers}
        isDarkMode={isDarkMode}
        onContinue={onContinue}
        onRetry={onReplay}
      />
    </div>
  );
};

const Live_Generation = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { highlightedTexts: originalHighlightedTexts } = useHighlightedText();
  const { selectedTypes: originalSelectedTypes, editedQuestions: originalEditedQuestions, requiredQuestions: originalRequiredQuestions } = useQuestionType();
  const { determineQuestionType, findPlaceholderByValue } = useQuestionEditContext();
  const [agreement, setAgreement] = useState<string>(documentText);
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string }>({});
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>([]);
  const [additionalLocations, setAdditionalLocations] = useState<string[]>([""]);
  const { userAnswers, setUserAnswers } = useUserAnswers();
  const [highlightedTexts, setHighlightedTexts] = useState<string[]>([]);
  const [selectedTypes, setLocalSelectedTypes] = useState<(string | null)[]>([]);
  const [editedQuestions, setLocalEditedQuestions] = useState<string[]>([]);
  const [requiredQuestions, setLocalRequiredQuestions] = useState<boolean[]>([]);
  const [showCertificationPopup, setShowCertificationPopup] = useState(false);
  const [showCodeCircuit_SubLevel_3GamePopup, setShowCodeCircuit_SubLevel_3GamePopup] = useState(false);
  const [certificationMessage, setCertificationMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState<number>(0);

  // Load userAnswers from sessionStorage on component mount
  useEffect(() => {
    const savedAnswers = sessionStorage.getItem("userAnswers");
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        setUserAnswers(parsedAnswers);
      } catch (error) {
        console.error("Error parsing saved userAnswers:", error);
        sessionStorage.removeItem("userAnswers"); // Clear invalid data
      }
    }
  }, [setUserAnswers]);

  // Save userAnswers to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("userAnswers", JSON.stringify(userAnswers));
  }, [userAnswers]);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem("questionOrder_2");
    let questionOrder: number[] = [];
    if (savedOrder) {
      questionOrder = JSON.parse(savedOrder);
    } else {
      questionOrder = originalHighlightedTexts.map((_, index) => index);
    }

    const savedTypes = sessionStorage.getItem("selectedQuestionTypes");
    let types: string[] = [];
    if (savedTypes) {
      types = JSON.parse(savedTypes);
    } else {
      types = originalHighlightedTexts.map(() => "Text");
    }

    const processedTexts = [...originalHighlightedTexts]; // Keep all placeholders

    const reorderedHighlightedTexts = questionOrder
      .map((index) => processedTexts[index])
      .filter((text) => text !== undefined);
    const reorderedSelectedTypes = questionOrder
      .map((index) => types[index] ?? "Text")
      .filter((type) => type !== undefined);
    const reorderedEditedQuestions = questionOrder
      .map((index) => originalEditedQuestions[index] || determineQuestionType(processedTexts[index]).primaryValue || "No text selected")
      .filter((text) => text !== undefined);
    const reorderedRequiredQuestions = questionOrder
      .map((index) => originalRequiredQuestions[index] ?? false)
      .filter((req) => req !== undefined);

    setHighlightedTexts(reorderedHighlightedTexts);
    setLocalSelectedTypes(reorderedSelectedTypes);
    setLocalEditedQuestions(reorderedEditedQuestions);
    setLocalRequiredQuestions(reorderedRequiredQuestions);

    console.log("Processed placeholders:", reorderedHighlightedTexts.length, reorderedHighlightedTexts);
  }, [originalHighlightedTexts, originalSelectedTypes, originalEditedQuestions, originalRequiredQuestions]);

  useEffect(() => {
    let updatedText = documentText;

    updatedText = updatedText.replace(
      /\(\/The Employee may be required to work at \[other locations\]\.\/\)/gi,
      ""
    );

    // Hide probationary clause by default; only show if explicitly true
    const probationAnswer = userAnswers["Is the clause of probationary period applicable?"];
    if (probationAnswer !== true) {
      updatedText = updatedText.replace(
        /<h2[^>]*>[^<]*PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?<\/p>/i,
        ""
      );
    }

    // Hide pension clause by default; only show if explicitly true
    const pensionAnswer = userAnswers["Is the Pension clause applicable?"];
    if (pensionAnswer !== true) {
      updatedText = updatedText.replace(
        /<h2[^>]*>[^<]*PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?<\/p>/i,
        ""
      );
    }

    const additionalLocationsAnswer = userAnswers["Does the employee need to work at additional locations besides the normal place of work?"];
    if (additionalLocationsAnswer === false) {
      // Condition is already hidden
    } else if (additionalLocationsAnswer === true) {
      const locationsAnswer = userAnswers["What is the additional work location?"] as string;
      let formattedLocations = "";
      if (locationsAnswer) {
        const locationsArray = locationsAnswer
          .split(/\s*,\s*|\s*and\s*|\s*, and\s*/)
          .filter(Boolean);
        if (locationsArray.length === 1) {
          formattedLocations = locationsArray[0];
        } else if (locationsArray.length === 2) {
          formattedLocations = locationsArray.join(" and ");
        } else {
          formattedLocations = `${locationsArray.slice(0, -1).join(", ")}, and ${locationsArray[locationsArray.length - 1]}`;
        }
      } else {
        formattedLocations = "[other locations]";
      }
      updatedText = updatedText.replace(
        /\[other locations\]/gi,
        `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${formattedLocations}</span>`
      );
    }

    Object.entries(userAnswers).forEach(([question, answer]) => {
      const placeholder = findPlaceholderByValue(question);
      if (question === "Is the employee entitled to overtime work?") {
        const overtimeYesClause = "{The Employee is entitled to overtime pay for authorized overtime work.}";
        const overtimeNoClause = "{The Employee shall not receive additional payment for overtime worked.}";

        updatedText = updatedText.replace(
          /<p className="mt-5" id="employment-agreement-working-hours">([\s\S]*?)<\/p>/i,
          () => {
            let replacementText = "";
            if (answer === true) {
              replacementText = `${overtimeYesClause}`;
            } else if (answer === false) {
              replacementText = `${overtimeNoClause}`;
            }
            return `<p className="mt-5" id="employment-agreement-working-hours">${replacementText}</p>`;
          }
        );
        return;
      }
      if (placeholder === "Unused Holiday Days" && typeof answer === "string") {
        const storedOperationType = localStorage.getItem("operationType");
        const storedOperationValue = localStorage.getItem("operationValue");
        const operationValue = storedOperationValue ? parseFloat(storedOperationValue) : null;
        let calculatedValue: number | null = null;
        const floatAnswer = parseFloat(answer).toFixed(2);
        const numericAnswer = parseFloat(floatAnswer);
        if (storedOperationType && operationValue !== null) {
          switch (storedOperationType.toLowerCase()) {
            case "add":
              calculatedValue = numericAnswer + operationValue;
              break;
            case "subtract":
              calculatedValue = numericAnswer - operationValue;
              break;
            case "multiply":
              calculatedValue = numericAnswer * operationValue;
              break;
            case "divide":
              calculatedValue = operationValue !== 0 ? numericAnswer / operationValue : null;
              break;
            default:
              calculatedValue = null;
          }
        }
        localStorage.setItem("calculatedValue", calculatedValue !== null ? String(calculatedValue) : "0");

        updatedText = updatedText.replace(
          new RegExp("\\[Holiday Pay\\]", "gi"),
          `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${calculatedValue}</span>`
        );
      }

      if (placeholder) {
        const escapedPlaceholder = placeholder.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
        if (question === "What's the annual salary?") {
          const salaryData = answer as { amount: string; currency: string } | undefined;
          updatedText = updatedText.replace(
            new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
            `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${salaryData?.amount || "[Annual Salary]"}</span>`
          );
          updatedText = updatedText.replace(
            new RegExp(`\\[USD\\]`, "gi"),
            `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${salaryData?.currency || "[USD]"}</span>`
          );
        } else if (question === "What is the governing country?") {
          const countryAnswer = typeof answer === "string" && answer.trim() ? answer : "[USA]";
          updatedText = updatedText.replace(
            new RegExp(`\\[USA\\]`, "gi"),
            `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${countryAnswer}</span>`
          );
        } else if (typeof answer === "boolean" || answer === null) {
          if (!answer && placeholder !== "other locations") {
            updatedText = updatedText.replace(new RegExp(`.*${escapedPlaceholder}.*`, "gi"), "");
          } else {
            updatedText = updatedText.replace(
              new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
              answer ? "Yes" : "No"
            );
          }
        } else if (typeof answer === "string" && answer.trim() && question !== "What is the additional work location?") {
          updatedText = updatedText.replace(
            new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
            `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${answer}</span>`
          );
        } else if (question !== "What is the additional work location?") {
          updatedText = updatedText.replace(
            new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
            `[${placeholder}]`
          );
        }
      } else {
        if (question === "Is the sick pay policy applicable?") {
          const sickPayClause = "{The Employee may also be entitled to Company sick pay of [Details of Company Sick Pay Policy]}";
          if (answer === false) {
            updatedText = updatedText.replace(sickPayClause, "");
          } else if (answer === true && userAnswers["What's the sick pay policy?"]) {
            updatedText = updatedText.replace(
              "[Details of Company Sick Pay Policy]",
              `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${userAnswers["What's the sick pay policy?"] as string}</span>`
            );
          }
        } else if (question === "Is the termination clause applicable?") {
          if (answer === false) {
            const terminationSection = updatedText.match(/<h2[^>]*>TERMINATION<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/i);
            if (terminationSection) {
              const sectionWithoutClause = terminationSection[0].replace(/\(After the probationary period.*?gross misconduct\.\)/, '');
              updatedText = updatedText.replace(terminationSection[0], sectionWithoutClause);
            }
          } else if (answer === true && userAnswers["What's the notice period?"]) {
            updatedText = updatedText.replace(
              /\[Notice Period\]/gi,
              `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${userAnswers["What's the notice period?"] as string}</span>`
            );
          }
        } else if (question === "Is the previous service applicable?" && answer === false) {
          const prevEmploymentClause = 'or, if applicable, "on [Previous Employment Start Date] with previous continuous service taken into account"';
          updatedText = updatedText.replace(new RegExp(`\\s*${prevEmploymentClause.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&")}\\s*`, "gi"), "");
        }
      }
    });

    setAgreement(updatedText + " ");
  }, [userAnswers, isDarkMode]);

  const validateInput = (type: string, value: string): string => {
    if (!value) return "";
    switch (type) {
      case "Number":
        if (!/^\d*\.?\d*$/.test(value)) {
          return "Please enter a valid number.";
        }
        break;
      case "Date":
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return "Please enter a valid date in YYYY-MM-DD format.";
        }
        break;
      case "Email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address.";
        }
        break;
      case "Text":
      case "Paragraph":
        break;
      default:
        break;
    }
    return "";
  };

  const handleAnswerChange = useCallback(
    (
      index: number,
      value: string | boolean | { amount: string; currency: string },
      followUpQuestion?: string,
      isAdditional?: boolean,
      locationIndex?: number
    ) => {
      const { primaryValue } = determineQuestionType(highlightedTexts[index] || "");
      if (!primaryValue) return;

      const currentType = selectedTypes[index] || "Text";

      if (typeof value === "string" && currentType !== "Radio" && primaryValue !== "What's the annual salary?") {
        const error = validateInput(currentType, value);
        setInputErrors((prev) => ({
          ...prev,
          [primaryValue]: error,
        }));
      }

      if (isAdditional && locationIndex !== undefined) {
        setAdditionalLocations((prev) => {
          const updated = [...prev];
          updated[locationIndex] = value as string;
          return updated;
        });
        setUserAnswers((prev) => {
          const locations = additionalLocations
            .map((loc, idx) => (idx === locationIndex ? (value as string) : loc))
            .filter(Boolean);
          const formattedLocations =
            locations.length === 1
              ? locations[0]
              : locations.length === 2
              ? locations.join(" and ")
              : `${locations.slice(0, -1).join(", ")}, and ${locations[locations.length - 1]}`;
          return {
            ...prev,
            [primaryValue]: formattedLocations,
          };
        });
      } else {
        setUserAnswers((prev) => {
          const newAnswers = {
            ...prev,
            [primaryValue]: value,
          };
          if (followUpQuestion && value === true) {
            newAnswers[followUpQuestion] = "";
          }
          return newAnswers;
        });
      }
    },
    [highlightedTexts, selectedTypes, additionalLocations]
  );

  const handleAddMore = () => {
    setAdditionalLocations((prev) => [...prev, ""]);
  };

  const renderAnswerInput = (index: number) => {
    const questionText = highlightedTexts[index] || "";
    const { primaryValue } = determineQuestionType(questionText);
    if (!primaryValue) return null;

    const currentType = selectedTypes[index] || "Text";
    const answer = userAnswers[primaryValue] !== undefined ? userAnswers[primaryValue] : (currentType === "Radio" ? null : "");
    const error = inputErrors[primaryValue] || "";
    const isRequired = requiredQuestions[index] || false;

    if (primaryValue === "Does the employee need to work at additional locations besides the normal place of work?") {
      return (
        <div key={index} className="mb-12">
          <p className={`text-lg font-medium ${isDarkMode ? "text-teal-200" : "text-teal-900"}`}>
            {editedQuestions[index] || primaryValue}
            {isRequired && <span className="text-red-500 ml-2">*</span>}
          </p>
          <div className="mt-4 flex space-x-6">
            <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
              <input
                type="radio"
                checked={answer === true}
                onChange={() => handleAnswerChange(index, true, "What is the additional work location?")}
                className={`cursor-pointer ${isDarkMode ? "text-teal-500 focus:ring-teal-400" : "text-teal-600 focus:ring-teal-500"}`}
                required={isRequired}
              />
              <span>Yes</span>
            </label>
            <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
              <input
                type="radio"
                checked={answer === false}
                onChange={() => handleAnswerChange(index, false)}
                className={`cursor-pointer ${isDarkMode ? "text-teal-500 focus:ring-teal-400" : "text-teal-600 focus:ring-teal-500"}`}
                required={isRequired}
              />
              <span>No</span>
            </label>
          </div>
          {answer === true && highlightedTexts.some((text) => determineQuestionType(text).primaryValue === "What is the additional work location?") && (
            <div className="mt-6">
              <p className={`text-lg font-medium ${isDarkMode ? "text-teal-200" : "text-teal-900"}`}>
                What is the additional work location?
                {isRequired && <span className="text-red-500 ml-2">*</span>}
              </p>
              {additionalLocations.map((location, locIndex) => (
                <div key={locIndex} className="mt-4">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => handleAnswerChange(index + 1, e.target.value, undefined, true, locIndex)}
                    className={`p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                      isDarkMode
                        ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                        : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                    }`}
                    placeholder={`Enter additional location ${locIndex + 1}`}
                    required={isRequired}
                  />
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <button
                  className={`px-6 py-3 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ${isDarkMode ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800" : "bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500"}`}
                  onClick={handleAddMore}
                >
                  Add More Locations
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (primaryValue === "What's the annual salary?") {
      const answerWithCurrency = typeof answer === "object" && answer !== null && "amount" in answer && "currency" in answer
        ? answer as { amount: string; currency: string }
        : { amount: "", currency: "USD" };

      return (
        <div key={index} className="mb-12">
          <div className="w-full">
            <p className={`text-lg font-medium ${isDarkMode ? "text-teal-200" : "text-teal-900"}`}>
              {editedQuestions[index] || primaryValue}
              {isRequired && <span className="text-red-500 ml-2">*</span>}
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <input
                type="number"
                value={answerWithCurrency.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  const error = validateInput("Number", value);
                  setInputErrors((prev) => ({ ...prev, [primaryValue]: error }));
                  const currentAnswer = userAnswers[primaryValue];
                  const currentCurrency = typeof currentAnswer === "object" && currentAnswer !== null && "currency" in currentAnswer
                    ? (currentAnswer as { amount: string; currency: string }).currency
                    : "USD";
                  handleAnswerChange(index, { amount: value, currency: currentCurrency });
                }}
                ref={(el) => { if (el) inputRefs.current[index] = el; }}
                className={`p-3 w-1/2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter amount"
                required={isRequired}
              />
              <select
                value={answerWithCurrency.currency}
                onChange={(e) => {
                  handleAnswerChange(index, { amount: answerWithCurrency.amount, currency: e.target.value });
                }}
                className={`p-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-700/80 border border-teal-600 focus:ring-teal-400 text-teal-200"
                    : "bg-white/80 border border-teal-200 focus:ring-teal-500 text-teal-800"
                }`}
                required={isRequired}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="SEK">SEK</option>
                <option value="AUD">AUD</option>
                <option value="JPY">JPY</option>
                <option value="CAD">CAD</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      );
    }

    if (primaryValue === "What is the additional work location?") {
      return null; // Handled within the parent radio question
    }

    return (
      <div key={index} className="mb-12">
        <div className="w-full">
          <p className={`text-lg font-medium ${isDarkMode ? "text-teal-200" : "text-teal-900"}`}>
            {editedQuestions[index] || primaryValue}
            {isRequired && <span className="text-red-500 ml-2">*</span>}
          </p>
          {currentType === "Radio" ? (
            primaryValue === "Is the sick pay policy applicable?" ? (
              <>
                <div className="mt-4 flex space-x-6">
                  <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
                    <input
                      type="radio"
                      checked={answer === true}
                      onChange={() => handleAnswerChange(index, true, "What's the sick pay policy?")}
                      className={`cursor-pointer ${isDarkMode ? "text-teal-500 focus:ring-teal-400" : "text-teal-600 focus:ring-teal-500"}`}
                      required={isRequired}
                    />
                    <span>Yes</span>
                  </label>
                  <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
                    <input
                      type="radio"
                      checked={answer === false}
                      onChange={() => handleAnswerChange(index, false)}
                      className={`cursor-pointer ${isDarkMode ? "text-teal-500 focus:ring-teal-400" : "text-teal-600 focus:ring-teal-500"}`}
                      required={isRequired}
                    />
                    <span>No</span>
                  </label>
                </div>
                {answer === true && (
                  <input
                    type="text"
                    value={(userAnswers["What's the sick pay policy?"] as string) || ""}
                    onChange={(e) =>
                      setUserAnswers((prev) => ({
                        ...prev,
                        "What's the sick pay policy?": e.target.value,
                      }))
                    }
                    className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gray-700/80 border border-teal-600 focus:ring-teal-400 text-teal-200 placeholder-teal-300/70"
                        : "bg-white/80 border border-teal-200 focus:ring-teal-500 text-teal-800 placeholder-teal-400/70"
                    }`}
                    placeholder="What's the sick pay policy?"
                    required={isRequired}
                  />
                )}
              </>
            ) : (
              <div className="mt-4 flex space-x-6">
                <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
                  <input
                    type="radio"
                    checked={answer === true}
                    onChange={() => handleAnswerChange(index, true)}
                    className={`cursor-pointer ${isDarkMode ? "text-teal-500 focus:ring-teal-400" : "text-teal-600 focus:ring-teal-500"}`}
                    required={isRequired}
                  />
                  <span>Yes</span>
                </label>
                <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
                  <input
                    type="radio"
                    checked={answer === false}
                    onChange={() => handleAnswerChange(index, false)}
                    className={`cursor-pointer ${isDarkMode ? "text-teal-500 focus:ring-teal-400" : "text-teal-600 focus:ring-teal-500"}`}
                    required={isRequired}
                  />
                  <span>No</span>
                </label>
              </div>
            )
          ) : currentType === "Number" ? (
            <>
              <input
                ref={(el) => { if (el) inputRefs.current[index] = el as HTMLInputElement; }}
                type="number"
                value={(userAnswers[primaryValue] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter a number"
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : currentType === "Date" ? (
            <>
              <input
                ref={(el) => { if (el) inputRefs.current[index] = el as HTMLInputElement; }}
                type="date"
                value={(userAnswers[primaryValue] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200`
                    : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800`
                }`}
                placeholder="Select a date"
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : currentType === "Email" ? (
            <>
              <input
                ref={(el) => { if (el) inputRefs.current[index] = el as HTMLInputElement; }}
                type="email"
                value={(userAnswers[primaryValue] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/ible border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter an email address"
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : currentType === "Text" ? (
            <>
              <input
                ref={(el) => { if (el) inputRefs.current[index] = el as HTMLInputElement; }}
                type="text"
                value={(userAnswers[primaryValue] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter your answer"
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : currentType === "Paragraph" ? (
            <>
              <textarea
                ref={(el) => { if (el) inputRefs.current[index] = el as HTMLTextAreaElement; }}
                value={(userAnswers[primaryValue] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter your answer"
                rows={3}
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  };

  const handleContinueToDocument = () => {
    setShowCertificationPopup(false);
    navigate("/Finish", { state: { userAnswers } });
  };

  const handleFinishCodeCircuit_SubLevel_3Game = () => {
    setShowCodeCircuit_SubLevel_3GamePopup(false);
    navigate("/Finish", { state: { userAnswers } });
  };

  const handleFinish = () => {
    const hasErrors = Object.values(inputErrors).some((error) => error !== "");
    if (hasErrors) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
      return;
    }

    const unansweredRequiredFields = highlightedTexts
      .map((text, index) => {
        const { primaryValue } = determineQuestionType(text);
        const isRequired = requiredQuestions[index] || false;
        if (!primaryValue || !isRequired) return null;

        const answer = userAnswers[primaryValue];
        if (
          answer === null ||
          answer === "" ||
          (typeof answer === "object" && answer !== null && (!answer.amount || !answer.currency))
        ) {
          return primaryValue;
        }
        return null;
      })
      .filter(Boolean);

    if (unansweredRequiredFields.length > 0) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
      return;
    }

    // Calculate score for Part 1 (Placeholders)
    const totalQuestions = highlightedTexts.length; // Should be 20 for Part 1
    let correctAnswers = 0;

    highlightedTexts.forEach((text) => {
      const { primaryValue } = determineQuestionType(text);
      if (!primaryValue) return;

      const answer = userAnswers[primaryValue];
      if (
        answer !== null &&
        answer !== "" &&
        !(typeof answer === "object" && answer !== null && (!answer.amount || !answer.currency))
      ) {
        correctAnswers += 1;
      }
    });

    const calculatedScore = correctAnswers; // Score is the number of correct answers (0–20 for Part 1)
    setCalculatedScore(calculatedScore);

    // Certification message for Part 1
    let message = "";
    if (calculatedScore === 20) {
      message = "Congratulations! You've achieved Document Automation Master certification (Perfect Performance)";
    } else if (calculatedScore >= 15) {
      message = "Congratulations! You've achieved Document Automation Pro certification (Excellent Performance)";
    } else if (calculatedScore >= 10) {
      message = "Congratulations! You've achieved Document Automation Novice certification";
    } else if (calculatedScore >= 5) {
      message = "Congratulations! You've achieved Document Automation Beginner certification";
    } else {
      message = "Please retry the exercise to improve your accuracy.";
    }

    setCertificationMessage(message);

    // Determine which popup to show based on selectedPart
    const selectedPart = localStorage.getItem("selectedPart");
    if (selectedPart === "1") {
      setShowCertificationPopup(true); // Show PerformanceStar_SubLevel_1Game for Part 1
    } else if (selectedPart === "3") {
      setShowCodeCircuit_SubLevel_3GamePopup(true); // Show CodeCircuit_SubLevel_3Game for Part 3
    } else {
      // Default behavior if selectedPart is not set or is invalid
      navigate("/Finish", { state: { userAnswers } });
    }

    // Debugging logs
    console.log("Total Questions:", totalQuestions);
    console.log("Correct Answers:", correctAnswers);
    console.log("Calculated Score:", calculatedScore);
    console.log("User Answers:", userAnswers);
    console.log("Selected Part:", selectedPart);
  };

  const handleReplay = () => {
    // Reset only the necessary state, preserving userAnswers, questionOrder_2, and selectedQuestionTypes
    setCalculatedScore(0);
    setAdditionalLocations([""]);
    console.log("Score and additional locations reset on Replay click, preserving userAnswers and selected placeholders");
    navigate("/Level-Two-Part-Two");
  };

  const selectedPart = localStorage.getItem("selectedPart");
  const levelPath = selectedPart === "4" ? "/Level-Two-Part-Two-Demo" : "/Level-Two-Part-Two";
  const { totalScore, questionnaireScore } = useScore();

  return (
    <div
      className={`min-h-screen flex flex-col font-sans relative transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
      }`}
    >
      <Navbar
        level={levelPath}
        questionnaire="/Questionnaire"
        live_generation="/Live_Generation"
      />
      <div
          className={`fixed top-14 right-2 p-2 rounded-lg shadow-md z-50 ${
          isDarkMode ? "bg-gray-700/90 text-teal-300" : "bg-white/90 text-teal-700"
          }`}
          >
          <p className="font-bold">Score: {totalScore}</p>
      </div>
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 flex gap-4">
        <button
          onClick={() => navigate("/Questionnaire")}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
        >
          ← Back to Questionnaire
        </button>
        <button
          onClick={() => window.location.href = "/dashboard"}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
        >
          Home
        </button>
      </div>
      <div className="flex-grow flex items-center justify-center py-12 px-6">
        <div className="flex flex-row w-full max-w-7xl">
          <div
            className={`flex flex-col w-1/2 pl-4 pr-8 sticky top-12 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl shadow-lg border p-6 ${
              isDarkMode
                ? "bg-gradient-to-b from-gray-700/70 to-gray-800/70 border-gray-700/20"
                : "bg-gradient-to-b from-teal-50/50 to-cyan-50/50 border-teal-100/20"
            }`}
          >
            {highlightedTexts.length > 0 ? (
              <>
                <h2 className={`text-2xl font-semibold mb-6 tracking-wide ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
                  Questions
                </h2>
                {highlightedTexts.map((_, index) => renderAnswerInput(index))}
                <div className="flex justify-end mt-8">
                  <button
                    className={`px-6 py-3 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                        : "bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500"
                    }`}
                    onClick={handleFinish}
                  >
                    Finish
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className={`text-lg font-medium ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
                  No questions have been generated yet.
                </p>
                <p className={`text-sm mt-3 ${isDarkMode ? "text-teal-400" : "text-teal-500"}`}>
                  Please go to the Questionnaire tab, create or select questions from the Document tab, and then return here to answer them and generate a live document preview.
                </p>
              </div>
            )}
          </div>
          <div
            className={`w-1/2 pl-8 rounded-xl shadow-lg border ${
              isDarkMode
                ? "bg-gray-800/90 backdrop-blur-sm border-gray-700/20"
                : "bg-white/90 backdrop-blur-sm border-teal-100/20"
            }`}
          >
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
          <WarningAlert
            message="Please correct all input errors and answer all required questions before finishing."
            isVisible={showWarning}
            isDarkMode={isDarkMode}
          />
          {selectedPart === "1" && (
            <CertificationPopup
              message={certificationMessage}
              isVisible={showCertificationPopup}
              isDarkMode={isDarkMode}
              onContinue={handleContinueToDocument}
              onReplay={handleReplay}
              score={calculatedScore}
            />
          )}
          {selectedPart === "3" && (
            <CodeCircuit_SubLevel_3GamePopup
              isVisible={showCodeCircuit_SubLevel_3GamePopup}
              isDarkMode={isDarkMode}
              highlightedTexts={highlightedTexts}
              userAnswers={userAnswers}
              onContinue={handleFinishCodeCircuit_SubLevel_3Game}
              onReplay={handleReplay}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Live_Generation;