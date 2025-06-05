import React from "react";
import Navbar from "../components/Navbar";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useQuestionType } from "../context/QuestionTypeContext";
import { useHighlightedText } from "../context/HighlightedTextContext";
import {
  useQuestionEditContext,
} from "../context/QuestionEditContext";
import { ThemeContext } from "../context/ThemeContext";
import { useScore } from "../context/ScoreContext";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { determineQuestionType } from "../utils/questionTypeUtils";
import { useUserAnswers } from "../context/UserAnswersContext";

// Define interfaces for contexts
interface ThemeContextType {
  isDarkMode: boolean;
}

interface ScoreContextType {
  totalScore: number;
  updateQuestionnaireScore: (points: number) => void;
  resetAllScores: () => void;
}

interface HighlightedTextContextType {
  highlightedTexts: string[];
  setHighlightedTexts: React.Dispatch<React.SetStateAction<string[]>>;
}

interface QuestionTypeContextType {
  selectedTypes: string[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
  setEditedQuestions: React.Dispatch<React.SetStateAction<string[]>>;
  requiredQuestions: boolean[];
  setRequiredQuestions: React.Dispatch<React.SetStateAction<boolean[]>>;
}

interface QuestionMaps {
  textTypes: Record<string, string>;
  numberTypes: Record<string, string>;
  dateTypes: Record<string, string>;
  radioTypes: Record<string, string>;
}

interface QuestionEditContextType {
  findPlaceholderByValue: (value: string) => string | undefined;
  updateQuestion: (typeKey: keyof QuestionMaps, placeholder: string, newText: string) => void;
  determineQuestionType: (text: string) => { primaryType: string };
  questionMaps: QuestionMaps;
}

interface UserAnswersContextType {
  setUserAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

// Define interfaces for component props and state
interface DivWithDropdownProps {
  textValue: string;
  index: number;
  onTypeChange: (index: number, type: string) => void;
  onTypeChanged: (index: number, changed: boolean) => void;
  onQuestionTextChange: (index: number, newText: string) => void;
  onRequiredChange: (index: number, required: boolean) => void;
  initialQuestionText: string;
  initialType: string;
  initialRequired: boolean;
  initialRequiredChanged: boolean;
  initialTypeChanged: boolean;
  isFollowUp?: boolean;
}

interface QuestionnaireState {
  uniqueQuestions: string[];
  questionOrder: number[];
  questionTexts: string[];
  selectedTypes: string[];
  typeChangedStates: boolean[];
  requiredQuestions: boolean[];
  requiredChangedStates: boolean[];
  scoredQuestions: Record<number, { typeScored: boolean; requiredScored: boolean; requiredCorrect?: boolean }>;
}

const DivWithDropdown: React.FC<DivWithDropdownProps> = ({
  textValue,
  index,
  onTypeChange,
  onTypeChanged,
  onQuestionTextChange,
  onRequiredChange,
  initialQuestionText,
  initialType,
  initialRequired = false,
  initialRequiredChanged = false,
  initialTypeChanged = false,
  isFollowUp = false,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { primaryValue, validTypes } = determineQuestionType(textValue);
  console.log(`DivWithDropdown for index ${index}: textValue="${textValue}", initialQuestionText="${initialQuestionText}", primaryValue="${primaryValue}"`);

  const [questionText, setQuestionText] = useState<string>(initialQuestionText || "No text selected");
  const [selectedType, setSelectedType] = useState<string>(initialType || "Text");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRequired, setIsRequired] = useState<boolean>(initialRequired);
  const [requiredChanged, setRequiredChanged] = useState<boolean>(initialRequiredChanged);
  const [typeChanged, setTypeChanged] = useState<boolean>(initialTypeChanged);
  const {
    findPlaceholderByValue,
    updateQuestion,
    determineQuestionType: contextDetermineQuestionType,
    questionMaps,
  } = useQuestionEditContext();

  const handleTypeSelect = (type: string) => {
    if (typeChanged) return;

    setSelectedType(type);
    onTypeChange(index, type);
    setTypeChanged(true);
    onTypeChanged(index, true);
    setIsOpen(false);

    let newQuestionText = questionText;
    if (questionText === "No text selected") {
      if (type.toLowerCase() === "radio" && primaryValue) {
        newQuestionText = primaryValue;
      } else if (type.toLowerCase() === "text" && primaryValue) {
        newQuestionText = primaryValue;
      } else if (type.toLowerCase() === "number" && primaryValue) {
        newQuestionText = primaryValue;
      } else if (type.toLowerCase() === "date" && primaryValue) {
        newQuestionText = primaryValue;
      }
      setQuestionText(newQuestionText);
      onQuestionTextChange(index, newQuestionText);
    }
    console.log(`Dropdown at index ${index} disabled after selecting type: ${type}`);
  };

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const oldText = textValue;
    const newText = e.target.value;
    setQuestionText(newText);
    onQuestionTextChange(index, newText);
    const { primaryType } = contextDetermineQuestionType(oldText);
    const placeholder = findPlaceholderByValue(oldText);

    if (placeholder && primaryType !== "Unknown") {
      const typeKey = primaryType.toLowerCase() + "Types" as keyof QuestionMaps;

      updateQuestion(typeKey, placeholder, newText);
      console.log("Updated question map: ", questionMaps);
    }
  };

  const handleRequiredToggle = () => {
    if (requiredChanged) return;

    const newRequired = !isRequired;
    setIsRequired(newRequired);
    setRequiredChanged(true);
    onRequiredChange(index, newRequired);
    console.log(`Required status for index ${index} set to: ${newRequired}, toggle disabled`);
  };

  return (
    <div
      className={`flex items-center space-x-8 w-full relative ${
        isFollowUp ? "ml-0" : ""
      }`}
    >
      <button className="flex flex-col justify-between h-10 w-12 p-1 transform hover:scale-105 transition-all duration-300">
        <span
          className={`block h-1 w-full rounded-full ${
            isDarkMode ? "bg-teal-400" : "bg-teal-600"
          }`}
        ></span>
        <span
          className={`block h-1 w-full rounded-full ${
            isDarkMode ? "bg-teal-400" : "bg-teal-600"
          }`}
        ></span>
        <span
          className={`block h-1 w-full rounded-full ${
            isDarkMode ? "bg-teal-400" : "bg-teal-600"
          }`}
        ></span>
      </button>
      <div
        className={`relative w-full mt-5 max-w-lg h-36 rounded-xl shadow-lg flex flex-col items-center justify-center text-lg font-semibold p-6 z-10 transform transition-all duration-300 hover:shadow-xl ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-700 to-gray-800 text-teal-200"
            : "bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-900"
        }`}
      >
        <div className="relative w-full flex items-center">
          <div
            className={`h-0.5 w-1/2 absolute left-0 opacity-50 ${
              isDarkMode ? "bg-teal-400" : "bg-teal-500"
            }`}
          ></div>
          <input
            type="text"
            value={questionText}
            onChange={handleQuestionTextChange}
            className={`px-3 py-2 text-sm bg-transparent w-1/2 relative z-10 top-[-10px] max-w-full focus:outline-none transition-all duration-300 ${
              isDarkMode
                ? "border-b border-teal-400 text-teal-200 placeholder-teal-300/70 focus:border-cyan-400"
                : "border-b border-teal-400 text-teal-800 placeholder-teal-400/70 focus:border-cyan-500"
            }`}
            placeholder="Edit question text"
          />
          {isRequired && <span className="text-red-500 ml-2">*</span>}
        </div>

        <div className="absolute top-1/2 right-6 transform -translate-y-1/2 flex items-center space-x-2">
          <div className="relative">
            <button
              className={`flex items-center space-x-2 text-sm px-3 py-1 rounded-lg shadow-md transition-all duration-300 ${
                isDarkMode
                  ? "bg-gray-600/80 text-teal-200 hover:bg-gray-500"
                  : "bg-white/80 text-teal-900 hover:bg-white"
              } ${typeChanged ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !typeChanged && setIsOpen(!isOpen)}
              disabled={typeChanged}
            >
              <span>{selectedType}</span>
              {!typeChanged && (
                <FaChevronDown
                  className={isDarkMode ? "text-teal-400" : "text-teal-600"}
                />
              )}
            </button>
            {isOpen && !typeChanged && (
              <div
                className={`absolute right-0 mt-1 w-40 h-[12vh] rounded-lg shadow-lg z-50 ${
                  isDarkMode
                    ? "bg-gray-700/90 backdrop-blur-sm border-gray-600"
                    : "bg-white/90 backdrop-blur-sm border-teal-100"
                }`}
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <div className="hide-scrollbar">
                  {validTypes.map((type) => (
                    <div
                      key={type}
                      className={`px-4 py-2 cursor-pointer transition-all duration-200 ${
                        isDarkMode
                          ? "text-teal-200 hover:bg-gray-600"
                          : "text-teal-800 hover:bg-teal-50"
                      }`}
                      onClick={() => handleTypeSelect(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <span
              className={`text-sm ${
                isDarkMode ? "text-teal-300" : "text-teal-700"
              }`}
            >
              Required
            </span>
            <div
              className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                isRequired
                  ? "bg-green-500"
                  : isDarkMode
                  ? "bg-gray-600"
                  : "bg-gray-300"
              } ${requiredChanged ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={requiredChanged ? undefined : handleRequiredToggle}
            >
              <span
                className={`absolute w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${
                  isRequired ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

const Questionnaire: React.FC<{}> = () => {
  const { isDarkMode } = useContext(ThemeContext) as ThemeContextType;
  const { totalScore, updateQuestionnaireScore, resetAllScores } = useScore() as ScoreContextType;
  const [leftActive, setLeftActive] = useState<boolean>(true);
  const [rightActive, setRightActive] = useState<boolean>(false);
  const { highlightedTexts, setHighlightedTexts } = useHighlightedText() as HighlightedTextContextType;
  const {
    selectedTypes,
    setSelectedTypes,
    setEditedQuestions,
    requiredQuestions,
    setRequiredQuestions,
  } = useQuestionType() as QuestionTypeContextType;
  const [uniqueQuestions, setUniqueQuestions] = useState<string[]>([]);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [duplicateDetected, setDuplicateDetected] = useState<boolean>(false);
  const [questionTexts, setQuestionTexts] = useState<string[]>([]);
  const [scoredQuestions, setScoredQuestions] = useState<
    Record<number, { typeScored: boolean; requiredScored: boolean; requiredCorrect?: boolean }>
  >({});
  const [requiredChangedStates, setRequiredChangedStates] = useState<boolean[]>([]);
  const [scoreFeedback, setScoreFeedback] = useState<{
    points: number;
    id: number;
  } | null>(null);
  const [typeChangedStates, setTypeChangedStates] = useState<boolean[]>([]);
  const feedbackId = useRef<number>(0);
  const { updateQuestion, findPlaceholderByValue } = useQuestionEditContext() as QuestionEditContextType;
  const { setUserAnswers } = useUserAnswers() as UserAnswersContextType;
  const navigate = useNavigate();
  const prevHighlightedTextsRef = useRef<string[]>([]);

  const followUpQuestions = [
    "What's the probation period length?",
    "What's the probation extension length?",
    "How many weeks?",
    "Who is the HR/Relevant Contact?",
    "What is the additional work location?",
  ];

  const showFeedback = (points: number) => {
    feedbackId.current += 1;
    setScoreFeedback({ points, id: feedbackId.current });
    setTimeout(() => setScoreFeedback(null), 1500);
  };

  const enhancedDetermineQuestionType = useCallback(
    (text: string) => {
      const result = determineQuestionType(text);
      console.log(`enhancedDetermineQuestionType for "${text}":`, result);
      const correctType = result.primaryType;
      console.log(`Determined correct type for "${text}": ${correctType}`);
      return {
        ...result,
        correctType,
      };
    },
    []
  );

  const scoreTypeSelection = useCallback(
    (index: number, selectedType: string) => {
      if (scoredQuestions[index]?.typeScored) return;

      const textValue = uniqueQuestions[index];
      const { correctType } = enhancedDetermineQuestionType(textValue);

      const isEquivalent =
        (selectedType === "Text" && correctType === "Paragraph") ||
        (selectedType === "Paragraph" && correctType === "Text");

      const isCorrect = selectedType === correctType || isEquivalent;
      const points = isCorrect ? 2 : -2;

      updateQuestionnaireScore(points);
      showFeedback(points);

      setScoredQuestions((prev) => {
        const newScoredQuestions = {
          ...prev,
          [index]: {
            ...prev[index],
            typeScored: true,
            typeCorrect: isCorrect,
          },
        };
        localStorage.setItem("scoredQuestions", JSON.stringify(newScoredQuestions));
        return newScoredQuestions;
      });
      console.log(`Scored type selection for index ${index}: ${points} points`);
    },
    [uniqueQuestions, enhancedDetermineQuestionType, updateQuestionnaireScore]
  );

  const scoreRequiredStatus = useCallback(
    (index: number, isRequired: boolean) => {
      if (scoredQuestions[index]?.requiredScored) return;

      if (isRequired) {
        updateQuestionnaireScore(10);
        showFeedback(10);
        setScoredQuestions((prev) => {
          const newScoredQuestions = {
            ...prev,
            [index]: {
              ...prev[index],
              requiredScored: true,
              requiredCorrect: true,
            },
          };
          localStorage.setItem("scoredQuestions", JSON.stringify(newScoredQuestions));
          return newScoredQuestions;
        });
        console.log(
          `Required status for "${uniqueQuestions[index]}" set to true, scored +10`
        );
      } else {
        setScoredQuestions((prev) => {
          const newScoredQuestions = {
            ...prev,
            [index]: {
              ...prev[index],
              requiredScored: true,
              requiredCorrect: false,
            },
          };
          localStorage.setItem("scoredQuestions", JSON.stringify(newScoredQuestions));
          return newScoredQuestions;
        });
        console.log(
          `Required status for "${uniqueQuestions[index]}" set to false, no score change`
        );
      }
    },
    [updateQuestionnaireScore, uniqueQuestions]
  );

  // Validate saved state integrity to prevent tampering
  const validateSavedState = (savedState: any): boolean => {
    if (!savedState || typeof savedState !== "object") return false;
    for (const key in savedState) {
      const entry = savedState[key];
      if (
        !entry ||
        typeof entry.type !== "string" ||
        typeof entry.typeChanged !== "boolean" ||
        typeof entry.questionText !== "string" ||
        typeof entry.required !== "boolean" ||
        typeof entry.requiredChanged !== "boolean" ||
        typeof entry.order !== "number" ||
        !entry.scored ||
        typeof entry.scored.typeScored !== "boolean" ||
        typeof entry.scored.requiredScored !== "boolean"
      ) {
        console.warn(`Invalid saved state detected for key "${key}":`, entry);
        return false;
      }
    }
    return true;
  };

  // Main useEffect for processing highlightedTexts
  useEffect(() => {
    const uniqueHighlightedTexts = [...new Set(highlightedTexts)];
    console.log("useEffect triggered with highlightedTexts:", uniqueHighlightedTexts);

    if (
      JSON.stringify(uniqueHighlightedTexts) ===
      JSON.stringify(prevHighlightedTextsRef.current)
    ) {
      console.log("No change in highlightedTexts, skipping state updates");
      return;
    }

    prevHighlightedTextsRef.current = uniqueHighlightedTexts;

    let savedState: Record<string, {
      type: string;
      typeChanged: boolean;
      questionText: string;
      required: boolean;
      requiredChanged: boolean;
      scored: { typeScored: boolean; requiredScored: boolean; requiredCorrect?: boolean };
      order: number;
    }> = {};

    const savedStateData = localStorage.getItem("questionnaireState");
    if (savedStateData) {
      try {
        savedState = JSON.parse(savedStateData);
        if (!validateSavedState(savedState)) {
          console.error("Saved state validation failed. Resetting state.");
          localStorage.removeItem("questionnaireState");
          localStorage.removeItem("scoredQuestions");
          savedState = {};
        } else {
          console.log("Loaded and validated saved state from localStorage:", savedState);
        }
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
        localStorage.removeItem("questionnaireState");
        localStorage.removeItem("scoredQuestions");
        savedState = {};
      }
    }

    const isProbationaryClauseSelected = uniqueHighlightedTexts.some(
      (text) =>
        text ===
        "The first Probation Period Length of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. Upon successful completion, the Employee will be confirmed in their role."
    );

    const isAdditionalLocationsClauseSelected = uniqueHighlightedTexts.some(
      (text) =>
        text === "The Employee may be required to work at other locations." ||
        text.includes("The Employee may be required to work at [other locations].") ||
        text.includes("/The Employee may be required to work at [other locations]./")
    );

    const filteredQuestions = uniqueHighlightedTexts.filter((text) => {
      const { primaryValue, primaryType } = enhancedDetermineQuestionType(text);
      const isFollowUp = followUpQuestions.includes(primaryValue || "");

      if (isProbationaryClauseSelected && text === "Probation Period Length") {
        return true;
      }

      const isRadioQuestion = primaryType === "Radio" && primaryValue === text;

      const shouldInclude =
        isRadioQuestion ||
        text === "USA" ||
        text === "{/The Employee may be required to work at other locations./}" ||
        text.includes("The Employee may be required to work at [other locations].") ||
        (text === "other locations" && isAdditionalLocationsClauseSelected) ||
        (!isFollowUp &&
          text !== "other locations" &&
          !text.includes("The Employee may be required to work at [other locations].") &&
          text !== "{/The Employee may be required to work at other locations./}");

      return shouldInclude;
    });

    const processedTexts: string[] = [];
    const questionMap = new Map<string, string>();

    for (const text of filteredQuestions) {
      const { primaryValue } = enhancedDetermineQuestionType(text);
      const displayValue = primaryValue || text;
      if (displayValue && !questionMap.has(displayValue)) {
        questionMap.set(displayValue, text);
        processedTexts.push(text);
      } else {
        console.log(`Duplicate detected: "${displayValue}"`);
        setDuplicateDetected(true);
        setTimeout(() => setDuplicateDetected(false), 3000);
      }
    }

    if (uniqueHighlightedTexts.includes("USA") && !processedTexts.includes("USA")) {
      processedTexts.push("USA");
    }

    const orderedTexts: string[] = [];
    const smallConditionText = "{/The Employee may be required to work at other locations./}";
    const smallConditionTextWithoutBrackets = "The Employee may be required to work at [other locations].";
    const followUpText = "other locations";
    const probationClause =
      "The first Probation Period Length of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. Upon successful completion, the Employee will be confirmed in their role.";
    const probationFollowUp = "Probation Period Length";

    filteredQuestions.forEach((text) => {
      if (
        text === smallConditionText ||
        text.includes(smallConditionTextWithoutBrackets) ||
        text === "The Employee may be required to work at other locations."
      ) {
        if (!orderedTexts.includes(text)) {
          orderedTexts.push(text);
        }
        if (uniqueHighlightedTexts.includes(followUpText) && !orderedTexts.includes(followUpText)) {
          orderedTexts.push(followUpText);
        }
      } else if (text === probationClause) {
        if (!orderedTexts.includes(text)) {
          orderedTexts.push(text);
        }
        if (uniqueHighlightedTexts.includes(probationFollowUp) && !orderedTexts.includes(probationFollowUp)) {
          orderedTexts.push(probationFollowUp);
        }
      } else if (text !== followUpText && text !== probationFollowUp && !orderedTexts.includes(text)) {
        orderedTexts.push(text);
      }
    });

    const newUniqueQuestions = orderedTexts;
    const newQuestionTexts: string[] = [];
    const newSelectedTypes: string[] = [];
    const newTypeChangedStates: boolean[] = [];
    const newRequiredQuestions: boolean[] = [];
    const newRequiredChangedStates: boolean[] = [];
    const newScoredQuestions: Record<
      number,
      { typeScored: boolean; requiredScored: boolean; requiredCorrect?: boolean }
    > = {};
    const newQuestionOrder: number[] = [];
    const newState: Record<string, {
      type: string;
      typeChanged: boolean;
      questionText: string;
      required: boolean;
      requiredChanged: boolean;
      scored: { typeScored: boolean; requiredScored: boolean; requiredCorrect?: boolean };
      order: number;
    }> = {};

    const allQuestionsMap = new Map<string, number>();
    orderedTexts.forEach((text, i) => {
      allQuestionsMap.set(text, i);
    });

    uniqueQuestions.forEach((text, oldIndex) => {
      const newIndex = allQuestionsMap.get(text);
      if (newIndex !== undefined) {
        newQuestionTexts[newIndex] = questionTexts[oldIndex] || "";
        newSelectedTypes[newIndex] = selectedTypes[oldIndex] ?? "Text";
        newTypeChangedStates[newIndex] = typeChangedStates[oldIndex] ?? true;
        newRequiredQuestions[newIndex] = requiredQuestions[oldIndex] || false;
        newRequiredChangedStates[newIndex] = requiredChangedStates[oldIndex] ?? true;
        newScoredQuestions[newIndex] = scoredQuestions[oldIndex] || {
          typeScored: false,
          requiredScored: false,
        };
        newQuestionOrder[newIndex] = newIndex;
      }
    });

    orderedTexts.forEach((text, i) => {
      const { primaryValue, primaryType } = enhancedDetermineQuestionType(text);
      const saved = savedState[text];
      const existingIndex = uniqueQuestions.indexOf(text);
      const existing = existingIndex !== -1;

      const initialQuestionText = primaryValue || text;
      const initialType = text === "Probation Period Length" ? "Number" : "Text";

      console.log(
        `Processing text "${text}": primaryType=${primaryType}, primaryValue=${primaryValue}, initialType=${initialType}, initialQuestionText=${initialQuestionText}`
      );

      if (saved) {
        newQuestionTexts[i] = saved.questionText || initialQuestionText;
        newSelectedTypes[i] = saved.type || initialType;
        newTypeChangedStates[i] = saved.typeChanged;
        newRequiredQuestions[i] = saved.required;
        newRequiredChangedStates[i] = saved.requiredChanged;
        newScoredQuestions[i] = saved.scored;
        newQuestionOrder[i] = saved.order;
        newState[text] = {
          type: saved.type || initialType,
          typeChanged: saved.typeChanged,
          questionText: saved.questionText || initialQuestionText,
          required: saved.required,
          requiredChanged: saved.requiredChanged,
          scored: saved.scored,
          order: saved.order,
        };
        console.log(
          `Restored saved state for question "${text}": type=${saved.type || initialType}, typeChanged=${saved.typeChanged}, questionText=${saved.questionText || initialQuestionText}, required=${saved.required}, requiredChanged=${saved.requiredChanged}`
        );
      } else if (existing) {
        newState[text] = {
          type: newSelectedTypes[i],
          typeChanged: newTypeChangedStates[i],
          questionText: newQuestionTexts[i] || initialQuestionText,
          required: newRequiredQuestions[i],
          requiredChanged: newRequiredChangedStates[i],
          scored: newScoredQuestions[i] || {
            typeScored: false,
            requiredScored: false,
          },
          order: newQuestionOrder[i],
        };
        console.log(
          `Preserved existing state for question "${text}": type=${newSelectedTypes[i]}, typeChanged=${newTypeChangedStates[i]}, questionText=${newQuestionTexts[i] || initialQuestionText}, required=${newRequiredQuestions[i]}, requiredChanged=${newRequiredChangedStates[i]}`
        );
      } else {
        newQuestionTexts[i] = newQuestionTexts[i] || initialQuestionText;
        newSelectedTypes[i] = newSelectedTypes[i] || initialType;
        newTypeChangedStates[i] = newTypeChangedStates[i] ?? false;
        newRequiredQuestions[i] = newRequiredQuestions[i] || false;
        newRequiredChangedStates[i] = newRequiredChangedStates[i] ?? false;
        newScoredQuestions[i] = newScoredQuestions[i] || { typeScored: false, requiredScored: false };
        newQuestionOrder[i] = newQuestionOrder[i] !== undefined ? newQuestionOrder[i] : i;
        newState[text] = {
          type: initialType,
          typeChanged: false,
          questionText: initialQuestionText,
          required: false,
          requiredChanged: false,
          scored: { typeScored: false, requiredScored: false },
          order: i,
        };
        console.log(
          `Initialized new question "${text}": type=${initialType}, typeChanged=false, questionText=${initialQuestionText}, required=false, requiredChanged=false`
        );
      }
    });

    setUniqueQuestions(newUniqueQuestions);
    setQuestionTexts(newQuestionTexts);
    setSelectedTypes(newSelectedTypes);
    setTypeChangedStates(newTypeChangedStates);
    setRequiredQuestions(newRequiredQuestions);
    setRequiredChangedStates(newRequiredChangedStates);
    setScoredQuestions(newScoredQuestions);
    setQuestionOrder(newQuestionOrder);
    setEditedQuestions(newQuestionTexts);

    localStorage.setItem("questionnaireState", JSON.stringify(newState));
    console.log("Final uniqueQuestions:", newUniqueQuestions);
    console.log("Final selectedTypes:", newSelectedTypes);
    console.log("Final typeChangedStates:", newTypeChangedStates);
    console.log("Final questionTexts:", newQuestionTexts);
    console.log("Final questionOrder:", newQuestionOrder);
    console.log("Final requiredQuestions:", newRequiredQuestions);
    console.log("Final requiredChangedStates:", newRequiredChangedStates);
  }, [
    highlightedTexts,
    enhancedDetermineQuestionType,
    setSelectedTypes,
    setEditedQuestions,
    setRequiredQuestions,
    uniqueQuestions,
    selectedTypes,
    typeChangedStates,
    questionTexts,
    requiredQuestions,
    requiredChangedStates,
    questionOrder,
  ]);

  const handleTypeChange = (index: number, type: string) => {
    const newTypes = [...selectedTypes];
    newTypes[index] = type;
    setSelectedTypes(newTypes);
    scoreTypeSelection(index, type);

    const textValue = uniqueQuestions[index];
    const { primaryValue } = enhancedDetermineQuestionType(textValue);
    const newTexts = [...questionTexts];

    if (
      newTexts[index] === primaryValue ||
      newTexts[index] === "No text selected"
    ) {
      if (type.toLowerCase() === "radio" && primaryValue) {
        newTexts[index] = primaryValue;
      } else if (type.toLowerCase() === "text" && primaryValue) {
        newTexts[index] = primaryValue;
      } else if (type.toLowerCase() === "number" && primaryValue) {
        newTexts[index] = primaryValue;
      } else if (type.toLowerCase() === "date" && primaryValue) {
        newTexts[index] = primaryValue;
      }
      setQuestionTexts(newTexts);
      setEditedQuestions(newTexts);
    }

    const newState = {
      ...JSON.parse(localStorage.getItem("questionnaireState") || "{}"),
      [uniqueQuestions[index]]: {
        ...JSON.parse(localStorage.getItem("questionnaireState") || "{}")[uniqueQuestions[index]],
        type,
        typeChanged: true,
        questionText: newTexts[index],
      },
    };
    localStorage.setItem("questionnaireState", JSON.stringify(newState));
    console.log(`Type changed for index ${index} to: ${type}`);
  };

  const handleTypeChanged = (index: number, changed: boolean) => {
    const newTypeChangedStates = [...typeChangedStates];
    newTypeChangedStates[index] = changed;
    setTypeChangedStates(newTypeChangedStates);

    const newState = {
      ...JSON.parse(localStorage.getItem("questionnaireState") || "{}"),
      [uniqueQuestions[index]]: {
        ...JSON.parse(localStorage.getItem("questionnaireState") || "{}")[uniqueQuestions[index]],
        typeChanged: changed,
      },
    };
    localStorage.setItem("questionnaireState", JSON.stringify(newState));
    console.log(
      `Updated typeChangedStates after change at index ${index}:`,
      newTypeChangedStates
    );
  };

  const handleQuestionTextChange = (index: number, newText: string) => {
    const oldText = questionTexts[index];
    const newTexts = [...questionTexts];
    newTexts[index] = newText;
    setQuestionTexts(newTexts);
    setEditedQuestions(newTexts);

    const newState = {
      ...JSON.parse(localStorage.getItem("questionnaireState") || "{}"),
      [uniqueQuestions[index]]: {
        ...JSON.parse(localStorage.getItem("questionnaireState") || "{}")[uniqueQuestions[index]],
        questionText: newText,
      },
    };
    localStorage.setItem("questionnaireState", JSON.stringify(newState));

    const placeholder = findPlaceholderByValue(oldText);
    if (placeholder) {
      const { primaryType } = enhancedDetermineQuestionType(placeholder);
      const typeKey = primaryType.toLowerCase() + "Types" as keyof QuestionMaps;
      updateQuestion(typeKey, placeholder, newText);
    }
    console.log(`Question text changed for index ${index} to: ${newText}`);
  };

  const handleRequiredChange = (index: number, required: boolean) => {
    const newRequired = [...requiredQuestions];
    newRequired[index] = required;
    setRequiredQuestions(newRequired);

    const newRequiredChanged = [...requiredChangedStates];
    newRequiredChanged[index] = true;
    setRequiredChangedStates(newRequiredChanged);

    const newState = {
      ...JSON.parse(localStorage.getItem("questionnaireState") || "{}"),
      [uniqueQuestions[index]]: {
        ...JSON.parse(localStorage.getItem("questionnaireState") || "{}")[uniqueQuestions[index]],
        required,
        requiredChanged: true,
      },
    };
    localStorage.setItem("questionnaireState", JSON.stringify(newState));

    scoreRequiredStatus(index, required);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newOrder = [...questionOrder];
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    setQuestionOrder(newOrder);

    const newUniqueQuestions = newOrder.map((index: number) => uniqueQuestions[index]);
    const newQuestionTexts = newOrder.map((index: number) => questionTexts[index]);
    const newSelectedTypes = newOrder.map((index: number) => selectedTypes[index] ?? "Text");
    const newRequiredQuestions = newOrder.map(
      (index: number) => requiredQuestions[index]
    );
    const newTypeChangedStates = newOrder.map(
      (index: number) => typeChangedStates[index]
    );
    const newRequiredChangedStates = newOrder.map(
      (index: number) => requiredChangedStates[index]
    );
    const newScoredQuestions = Object.fromEntries(
      newOrder.map((originalIndex: number, newIndex: number) => [
        newIndex,
        scoredQuestions[originalIndex] || { typeScored: false, requiredScored: false },
      ])
    );

    setUniqueQuestions(newUniqueQuestions);
    setQuestionTexts(newQuestionTexts);
    setSelectedTypes(newSelectedTypes);
    setRequiredQuestions(newRequiredQuestions);
    setTypeChangedStates(newTypeChangedStates);
    setRequiredChangedStates(newRequiredChangedStates);
    setScoredQuestions(newScoredQuestions);

    const newState: Record<string, {
      type: string;
      typeChanged: boolean;
      questionText: string;
      required: boolean;
      requiredChanged: boolean;
      scored: { typeScored: boolean; requiredScored: boolean; requiredCorrect?: boolean };
      order: number;
    }> = {};
    newUniqueQuestions.forEach((text, i) => {
      const { primaryValue } = enhancedDetermineQuestionType(text);
      newState[text] = {
        type: newSelectedTypes[i],
        typeChanged: newTypeChangedStates[i],
        questionText: newQuestionTexts[i] || primaryValue || "No text selected",
        required: newRequiredQuestions[i],
        requiredChanged: newRequiredChangedStates[i],
        scored: newScoredQuestions[i],
        order: newOrder[i],
      };
    });
    localStorage.setItem("questionnaireState", JSON.stringify(newState));

    console.log("Questions reordered. New order:", newOrder);
    console.log("Updated typeChangedStates after reorder:", newTypeChangedStates);
  };

  const handleReset = () => {
    // Clear local component states
    setUniqueQuestions([]);
    setQuestionOrder([]);
    setQuestionTexts([]);
    setSelectedTypes([]);
    setTypeChangedStates([]);
    setRequiredQuestions([]);
    setRequiredChangedStates([]);
    setScoredQuestions({});

    // Clear contexts
    setHighlightedTexts([]);
    setEditedQuestions([]);
    setSelectedTypes([]);
    setRequiredQuestions([]);
    setUserAnswers({});

    // Reset scores
    resetAllScores();

    // Clear all relevant storage keys, preserving selectedPart
    localStorage.removeItem("questionnaireState");
    localStorage.removeItem("scoredQuestions");
    sessionStorage.removeItem("selectedQuestionTypes");
    sessionStorage.removeItem("questionOrder_2");
    sessionStorage.removeItem("userAnswers");
    sessionStorage.removeItem("level");
    sessionStorage.removeItem("selectedQuestionTypes_2");
    sessionStorage.removeItem("typeChangedStates_2");
    sessionStorage.removeItem("levelTwoPartTwoState");
    console.log("All states, storage, and scores reset successfully, selectedPart preserved.");
  };

  const selectedPart = localStorage.getItem("selectedPart");
  const levelPath =
    selectedPart === "4" ? "/Level-Two-Part-Two-Demo" : "/Level-Two-Part-Two";

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
      <div className="fixed bottom-6 left-28 transform -translate-x-1/2 z-50 flex gap-4">
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
        <button
          onClick={handleReset}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-red-700 text-teal-200 hover:bg-red-600"
              : "bg-red-200 text-teal-900 hover:bg-red-300"
          }`}
        >
          Reset
        </button>
      </div>

      <div
        className={`absolute top-16 left-6 w-40 h-12 rounded-xl shadow-lg flex items-center justify-center text-sm font-semibold z-20 ${
          isDarkMode
            ? "bg-gradient-to-r from-gray-700 to-gray-800 text-teal-200"
            : "bg-gradient-to-r from-teal-200 to-cyan-200 text-teal-900"
        }`}
      >
        <div className="relative">
          Score: {totalScore}
          {scoreFeedback && (
            <div
              key={scoreFeedback.id}
              className={`absolute -top-6 right-0 font-bold text-lg ${
                scoreFeedback.points > 0 ? "text-emerald-400" : "text-rose-500"
              } animate-[float-up_1.5s_ease-out_forwards]`}
            >
              {scoreFeedback.points > 0
                ? `+${scoreFeedback.points}`
                : scoreFeedback.points}
            </div>
          )}
        </div>
      </div>
      <div
        className={`absolute top-16 right-6 w-80 h-12 rounded-xl shadow-lg flex items-center justify-center text-sm font-semibold z-20 ${
          isDarkMode
            ? "bg-gradient-to-r from-gray-700 to-gray-800 text-teal-200"
            : "bg-gradient-to-r from-teal-200 to-cyan-200 text-teal-900"
        }`}
      >
        <div className="flex items-center space-x-6">
          <div
            className={`flex items-center space-x-2 ${
              leftActive
                ? isDarkMode
                  ? "text-teal-400"
                  : "text-teal-600"
                : isDarkMode
                ? "text-cyan-400"
                : "text-cyan-500"
            } transition-all duration-300`}
          >
            <span>Employer</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setLeftActive(true);
                setRightActive(false);
              }}
              className={`${
                isDarkMode
                  ? "text-teal-400 hover:text-cyan-400"
                  : "text-teal-600 hover:text-cyan-500"
              } transform hover:scale-110 transition-all duration-300`}
            >
              <FaChevronLeft className="text-xl" />
            </button>
            <button
              onClick={() => {
                setRightActive(true);
                setLeftActive(false);
              }}
              className={`${
                isDarkMode
                  ? "text-teal-400 hover:text-cyan-400"
                  : "text-teal-600 hover:text-cyan-500"
              } transform hover:scale-110 transition-all duration-300`}
            >
              <FaChevronRight className="text-xl" />
            </button>
          </div>
          <div
            className={`flex items-center space-x-2 ${
              rightActive
                ? isDarkMode
                  ? "text-teal-400"
                  : "text-teal-600"
                : isDarkMode
                ? "text-cyan-400"
                : "text-cyan-500"
            } transition-all duration-300`}
          >
            <span>Employee</span>
          </div>
        </div>
      </div>

      {duplicateDetected && (
        <div
          className={`absolute top-28 right-6 p-4 rounded-xl shadow-md transition-opacity duration-400 z-1 animate-fadeIn ${
            isDarkMode
              ? "bg-gradient-to-r from-yellow-800 to-yellow-900 border-l-4 border-yellow-500 text-yellow-200"
              : "bg-gradient-to-r from-yellow-100 to-yellow-200 border-l-4 border-yellow-400 text-yellow-800"
          }`}
        >
          <p className="font-bold">Duplicate Question</p>
          <p className="text-sm">
            This question already exists in the questionnaire.
          </p>
        </div>
      )}

      <div className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-y-auto">
        <div className="space-y-12 w-full max-w-4xl">
          {uniqueQuestions.length > 0 ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {questionOrder.map((originalIndex, displayIndex) => {
                      const text = uniqueQuestions[originalIndex];
                      const { primaryValue } = enhancedDetermineQuestionType(text);
                      const isFollowUpQuestion = text === "Probation Period Length";
                      return (
                        <Draggable
                          key={primaryValue || `question-${originalIndex}`}
                          draggableId={primaryValue || `question-${originalIndex}`}
                          index={displayIndex}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <DivWithDropdown
                                textValue={text}
                                index={originalIndex}
                                onTypeChange={handleTypeChange}
                                onTypeChanged={handleTypeChanged}
                                onQuestionTextChange={handleQuestionTextChange}
                                onRequiredChange={handleRequiredChange}
                                initialQuestionText={
                                  questionTexts[originalIndex] || primaryValue || "No text selected"
                                }
                                initialType={selectedTypes[originalIndex] ?? (text === "Probation Period Length" ? "Number" : "Text")}
                                initialRequired={requiredQuestions[originalIndex] || false}
                                initialRequiredChanged={requiredChangedStates[originalIndex] || false}
                                initialTypeChanged={typeChangedStates[originalIndex] || false}
                                isFollowUp={isFollowUpQuestion}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div
              className={`text-center py-12 rounded-xl shadow-lg border ${
                isDarkMode
                ? "bg-gray-800/80 backdrop-blur-sm border-gray-600"
                : "bg-white/80 backdrop-blur-sm border-teal-900"
              }`}
            >
              <p
                className={`text-lg font-medium ${
                  isDarkMode ? "text-teal-300" : "text-teal-700"
                }`}
              >
                No text has been selected yet.
              </p>
              <p
                className={`text-sm mt-2 ${
                  isDarkMode ? "text-teal-400" : "text-teal-500"
                }`}
              >
                Go to the document tab and select text in square brackets to
                generate your questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;