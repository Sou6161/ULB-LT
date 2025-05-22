import React from "react";
import Navbar from "../components/Navbar";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useQuestionType } from "../context/QuestionTypeContext";
import { useHighlightedText } from "../context/HighlightedTextContext";
import {
  useQuestionEditContext,
  QuestionMaps,
} from "../context/QuestionEditContext.tsx";
import { ThemeContext } from "../context/ThemeContext";
import { useScore } from "../context/ScoreContext";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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
  initialTypeChanged: boolean;
  isFollowUp?: boolean;
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
  initialTypeChanged = false,
  isFollowUp = false,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [questionText, setQuestionText] = useState(
    initialQuestionText || "No text selected"
  );
  const [selectedType, setSelectedType] = useState<string>(
    initialType || "Text"
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isRequired, setIsRequired] = useState(initialRequired);
  const [typeChanged, setTypeChanged] = useState(initialTypeChanged);
  const {
    findPlaceholderByValue,
    updateQuestion,
    determineQuestionType,
    questionMaps,
  } = useQuestionEditContext();
  const { primaryValue, validTypes } = determineQuestionType(textValue);

  const handleTypeSelect = (type: string) => {
    if (typeChanged) return;

    setSelectedType(type);
    onTypeChange(index, type);
    setTypeChanged(true);
    onTypeChanged(index, true);
    setIsOpen(false);

    let newQuestionText = questionText;
    if (questionText === primaryValue || questionText === "No text selected") {
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
    const { primaryType } = determineQuestionType(oldText);
    const placeholder = findPlaceholderByValue(oldText);

    if (placeholder && primaryType !== "Unknown") {
      const typeKey = (primaryType.toLowerCase() + "Types") as string;

      if (
        typeKey === "textTypes" ||
        typeKey === "numberTypes" ||
        typeKey === "dateTypes" ||
        typeKey === "radioTypes"
      ) {
        updateQuestion(typeKey as keyof QuestionMaps, placeholder, newText);
      }
      console.log("Updated question map: ", questionMaps);
    }
  };

  const handleRequiredToggle = () => {
    const newRequired = !isRequired;
    setIsRequired(newRequired);
    onRequiredChange(index, newRequired);
    console.log(`Required status for index ${index} set to: ${newRequired}`);
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
              }`}
              onClick={handleRequiredToggle}
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

const Questionnaire = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { totalScore, updateQuestionnaireScore } = useScore();
  const [leftActive, setLeftActive] = useState(true);
  const [rightActive, setRightActive] = useState(false);
  const { highlightedTexts } = useHighlightedText();
  const {
    selectedTypes,
    setSelectedTypes,
    setEditedQuestions,
    requiredQuestions,
    setRequiredQuestions,
  } = useQuestionType();
  const [uniqueQuestions, setUniqueQuestions] = useState<string[]>([]);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [duplicateDetected, setDuplicateDetected] = useState<boolean>(false);
  const [questionTexts, setQuestionTexts] = useState<string[]>([]);
  const [scoredQuestions, setScoredQuestions] = useState<
    Record<number, { typeScored: boolean; requiredScored: boolean }>
  >({});
  const [bonusAwarded, setBonusAwarded] = useState(false);
  const [scoreFeedback, setScoreFeedback] = useState<{
    points: number;
    id: number;
  } | null>(null);
  const [typeChangedStates, setTypeChangedStates] = useState<boolean[]>([]);
  const feedbackId = useRef(0);
  const { updateQuestion, determineQuestionType, findPlaceholderByValue } =
    useQuestionEditContext();
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
      const correctType = result.primaryType;
      console.log(`Determined correct type for "${text}": ${correctType}`);
      return {
        ...result,
        correctType,
      };
    },
    [determineQuestionType]
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

      setScoredQuestions((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          typeScored: true,
          typeCorrect: isCorrect,
        },
      }));
      console.log(`Scored type selection for index ${index}: ${points} points`);
    },
    [uniqueQuestions, enhancedDetermineQuestionType, scoredQuestions, updateQuestionnaireScore]
  );

  const scoreRequiredStatus = useCallback(
    (index: number, isRequired: boolean) => {
      if (isRequired) {
        if (!scoredQuestions[index]?.requiredScored) {
          updateQuestionnaireScore(2);
          showFeedback(2);
          setScoredQuestions((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              requiredScored: true,
              requiredCorrect: true,
            },
          }));
          console.log(
            `Required status for "${uniqueQuestions[index]}" set to true, scored +2`
          );
        }
      } else {
        if (scoredQuestions[index]?.requiredScored) {
          updateQuestionnaireScore(-2);
          showFeedback(-2);
          setScoredQuestions((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              requiredScored: false,
              requiredCorrect: false,
            },
          }));
          console.log(
            `Required status for "${uniqueQuestions[index]}" set to false, scored -2`
          );
        }
      }
    },
    [updateQuestionnaireScore, scoredQuestions, uniqueQuestions]
  );

  const checkForBonus = useCallback(() => {
    if (uniqueQuestions.length === 0 || bonusAwarded) return;

    const allCorrect = uniqueQuestions.every((text, index) => {
      const { correctType } = enhancedDetermineQuestionType(text);
      const selectedType = selectedTypes[index] ?? "Text"; // Handle null

      const typeCorrect =
        selectedType === correctType ||
        (selectedType === "Text" && correctType === "Paragraph") ||
        (selectedType === "Paragraph" && correctType === "Text");

      const requiredCorrect = requiredQuestions[index];
      return typeCorrect && requiredCorrect;
    });

    if (allCorrect) {
      updateQuestionnaireScore(10);
      showFeedback(10);
      setBonusAwarded(true);
      console.log(
        "Bonus awarded: All question types and required statuses are correct. +10 points"
      );
    }
  }, [
    uniqueQuestions,
    selectedTypes,
    requiredQuestions,
    enhancedDetermineQuestionType,
    bonusAwarded,
    updateQuestionnaireScore,
  ]);

  useEffect(() => {
    const uniqueHighlightedTexts = [...new Set(highlightedTexts)];
    console.log("useEffect triggered with highlightedTexts:", uniqueHighlightedTexts);

    // Check if highlightedTexts has changed
    if (
      JSON.stringify(uniqueHighlightedTexts) ===
      JSON.stringify(prevHighlightedTextsRef.current)
    ) {
      console.log("No change in highlightedTexts, skipping state updates");
      return;
    }

    prevHighlightedTextsRef.current = uniqueHighlightedTexts;

    // Load saved states from sessionStorage
    let savedState: Record<string, {
      type: string;
      typeChanged: boolean;
      questionText: string;
      required: boolean;
      scored: { typeScored: boolean; requiredScored: boolean };
      order: number;
    }> = {};

    const savedStateData = sessionStorage.getItem("questionnaireState");
    if (savedStateData) {
      try {
        savedState = JSON.parse(savedStateData);
        console.log("Loaded saved state from sessionStorage:", savedState);
      } catch (error) {
        console.error("Error parsing sessionStorage data:", error);
      }
    }

    // Process highlighted texts
    const processedTexts: string[] = [];
    const questionMap = new Map();

    const isProbationaryClauseSelected = uniqueHighlightedTexts.some(
      (text) =>
        text.toLowerCase().includes("probationary period") &&
        text.includes("Probation Period Length") &&
        text.length > "Probation Period Length".length
    );

    const isAdditionalLocationsClauseSelected = uniqueHighlightedTexts.some(
      (text) =>
        text.includes(
          "The Employee may be required to work at [other locations]."
        ) ||
        text.includes(
          "/The Employee may be required to work at [other locations]./"
        )
    );

    const filteredQuestions = uniqueHighlightedTexts.filter((text) => {
  const { primaryValue } = enhancedDetermineQuestionType(text);
  const isFollowUp = followUpQuestions.includes(primaryValue || "");

  if (isProbationaryClauseSelected && text === "Probation Period Length") {
    return false;
  }

  const shouldInclude =
    text === "USA" ||
    text === "{/The Employee may be required to work at other locations./}" ||
    text.includes(
      "The Employee may be required to work at [other locations]."
    ) ||
    (text === "other locations" && isAdditionalLocationsClauseSelected) ||
    (primaryValue === "What's the probation period length?" &&
      text === "Probation Period Length" &&
      !isProbationaryClauseSelected) ||
    (!isFollowUp &&
      text !== "other locations" &&
      !text.includes(
        "The Employee may be required to work at [other locations]."
      ) &&
      text !== "{/The Employee may be required to work at other locations./}");

  return shouldInclude;
});

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

    if (
      uniqueHighlightedTexts.includes("USA") &&
      !processedTexts.includes("USA")
    ) {
      processedTexts.push("USA");
    }

    const orderedTexts: string[] = [];
    const smallConditionText =
      "{/The Employee may be required to work at other locations./}";
    const smallConditionTextWithoutBrackets =
      "The Employee may be required to work at [other locations].";
    const followUpText = "other locations";

    filteredQuestions.forEach((text) => {
      if (
        text === smallConditionText ||
        text.includes(smallConditionTextWithoutBrackets)
      ) {
        if (!orderedTexts.includes(text)) {
          orderedTexts.push(text);
        }
        if (
          uniqueHighlightedTexts.includes(followUpText) &&
          !orderedTexts.includes(followUpText)
        ) {
          orderedTexts.push(followUpText);
        }
      } else if (text !== followUpText && !orderedTexts.includes(text)) {
        orderedTexts.push(text);
      }
    });

    // Skip updates if orderedTexts hasn't changed significantly
    const newQuestions = orderedTexts.filter((text) => !uniqueQuestions.includes(text));
    if (orderedTexts.length === uniqueQuestions.length && newQuestions.length === 0) {
      console.log("No new questions or significant changes, skipping state updates");
      return;
    }

    // Merge states
    const newUniqueQuestions = orderedTexts;
    const newQuestionTexts: string[] = [];
    const newSelectedTypes: string[] = [];
    const newTypeChangedStates: boolean[] = [];
    const newRequiredQuestions: boolean[] = [];
    const newScoredQuestions: Record<
      number,
      { typeScored: boolean; requiredScored: boolean }
    > = {};
    const newQuestionOrder: number[] = [];
    const newState: Record<string, {
      type: string;
      typeChanged: boolean;
      questionText: string;
      required: boolean;
      scored: { typeScored: boolean; requiredScored: boolean };
      order: number;
    }> = {};

    orderedTexts.forEach((text, i) => {
      const { primaryValue } = determineQuestionType(text);
      const saved = savedState[text];
      const existingIndex = uniqueQuestions.indexOf(text);
      const existing = existingIndex !== -1;

      if (saved) {
        newQuestionTexts.push(saved.questionText);
        newSelectedTypes.push(saved.type);
        newTypeChangedStates.push(saved.typeChanged);
        newRequiredQuestions.push(saved.required);
        newScoredQuestions[i] = saved.scored;
        newQuestionOrder.push(saved.order);
        newState[text] = {
          type: saved.type,
          typeChanged: saved.typeChanged,
          questionText: saved.questionText,
          required: saved.required,
          scored: saved.scored,
          order: saved.order,
        };
        console.log(
          `Restored saved state for question "${text}": type=${saved.type}, typeChanged=${saved.typeChanged}`
        );
      } else if (existing) {
        const existingType = selectedTypes[existingIndex] ?? "Text";
        newQuestionTexts.push(questionTexts[existingIndex]);
        newSelectedTypes.push(existingType);
        newTypeChangedStates.push(typeChangedStates[existingIndex]);
        newRequiredQuestions.push(requiredQuestions[existingIndex]);
        newScoredQuestions[i] = scoredQuestions[existingIndex] || {
          typeScored: false,
          requiredScored: false,
        };
        newQuestionOrder.push(questionOrder[existingIndex] !== undefined ? questionOrder[existingIndex] : i);
        newState[text] = {
          type: existingType,
          typeChanged: typeChangedStates[existingIndex],
          questionText: questionTexts[existingIndex],
          required: requiredQuestions[existingIndex],
          scored: scoredQuestions[existingIndex] || {
            typeScored: false,
            requiredScored: false,
          },
          order: questionOrder[existingIndex] !== undefined ? questionOrder[existingIndex] : i,
        };
        console.log(
          `Preserved existing state for question "${text}": type=${existingType}, typeChanged=${typeChangedStates[existingIndex]}`
        );
      } else {
        newQuestionTexts.push(primaryValue || "No text selected");
        newSelectedTypes.push("Text");
        newTypeChangedStates.push(false);
        newRequiredQuestions.push(false);
        newScoredQuestions[i] = { typeScored: false, requiredScored: false };
        newQuestionOrder.push(i);
        newState[text] = {
          type: "Text",
          typeChanged: false,
          questionText: primaryValue || "No text selected",
          required: false,
          scored: { typeScored: false, requiredScored: false },
          order: i,
        };
        console.log(
          `Initialized new question "${text}": type=Text, typeChanged=false`
        );
      }
    });

    // Apply state updates
    setUniqueQuestions(newUniqueQuestions);
    setQuestionTexts(newQuestionTexts);
    setSelectedTypes(newSelectedTypes);
    setTypeChangedStates(newTypeChangedStates);
    setRequiredQuestions(newRequiredQuestions);
    setScoredQuestions(newScoredQuestions);
    setQuestionOrder(newQuestionOrder);
    setEditedQuestions(newQuestionTexts);
    setBonusAwarded(false);

    console.log("Final uniqueQuestions:", newUniqueQuestions);
    console.log("Final selectedTypes:", newSelectedTypes);
    console.log("Final typeChangedStates:", newTypeChangedStates);
    console.log("Final questionTexts:", newQuestionTexts);
    console.log("Final questionOrder:", newQuestionOrder);

    // Save to sessionStorage
    sessionStorage.setItem("questionnaireState", JSON.stringify(newState));
  }, [
    highlightedTexts,
    enhancedDetermineQuestionType,
    determineQuestionType,
    setSelectedTypes,
    setEditedQuestions,
    setRequiredQuestions,
    uniqueQuestions,
    selectedTypes,
    typeChangedStates,
    questionTexts,
    requiredQuestions,
    scoredQuestions,
    questionOrder,
  ]);

  useEffect(() => {
    checkForBonus();
  }, [checkForBonus]);

  const handleTypeChange = (index: number, type: string) => {
    const newTypes = [...selectedTypes];
    newTypes[index] = type;
    setSelectedTypes(newTypes);

    const newState = {
      ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}"),
      [uniqueQuestions[index]]: {
        ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}")[uniqueQuestions[index]],
        type,
        typeChanged: true,
      },
    };
    sessionStorage.setItem("questionnaireState", JSON.stringify(newState));
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
      newState[uniqueQuestions[index]] = {
        ...newState[uniqueQuestions[index]],
        questionText: newTexts[index],
      };
      sessionStorage.setItem("questionnaireState", JSON.stringify(newState));
    }
    console.log(`Type changed for index ${index} to: ${type}`);
  };

  const handleTypeChanged = (index: number, changed: boolean) => {
    const newTypeChangedStates = [...typeChangedStates];
    newTypeChangedStates[index] = changed;
    setTypeChangedStates(newTypeChangedStates);

    const newState = {
      ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}"),
      [uniqueQuestions[index]]: {
        ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}")[uniqueQuestions[index]],
        typeChanged: changed,
      },
    };
    sessionStorage.setItem("questionnaireState", JSON.stringify(newState));
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
      ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}"),
      [uniqueQuestions[index]]: {
        ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}")[uniqueQuestions[index]],
        questionText: newText,
      },
    };
    sessionStorage.setItem("questionnaireState", JSON.stringify(newState));

    const placeholder = findPlaceholderByValue(oldText) || "undefined";
    const { primaryType } = determineQuestionType(placeholder);

    if (placeholder) {
      const typeKey = (primaryType.toLowerCase() + "Types") as string;

      if (
        typeKey === "textTypes" ||
        typeKey === "numberTypes" ||
        typeKey === "dateTypes" ||
        typeKey === "radioTypes"
      ) {
        updateQuestion(typeKey as keyof QuestionMaps, placeholder, newText);
      }
    }
    console.log(`Question text changed for index ${index} to: ${newText}`);
  };

  const handleRequiredChange = (index: number, required: boolean) => {
    const newRequired = [...requiredQuestions];
    newRequired[index] = required;
    setRequiredQuestions(newRequired);

    const newState = {
      ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}"),
      [uniqueQuestions[index]]: {
        ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}")[uniqueQuestions[index]],
        required,
      },
    };
    sessionStorage.setItem("questionnaireState", JSON.stringify(newState));

    scoreRequiredStatus(index, required);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const newOrder = [...questionOrder];
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    setQuestionOrder(newOrder);

    const newUniqueQuestions = newOrder.map((index) => uniqueQuestions[index]);
    const newQuestionTexts = newOrder.map((index) => questionTexts[index]);
    const newSelectedTypes = newOrder.map((index) => selectedTypes[index] ?? "Text");
    const newRequiredQuestions = newOrder.map(
      (index) => requiredQuestions[index]
    );
    const newTypeChangedStates = newOrder.map(
      (index) => typeChangedStates[index]
    );
    const newScoredQuestions = Object.fromEntries(
      newOrder.map((originalIndex, newIndex) => [
        newIndex,
        scoredQuestions[originalIndex] || {
          typeScored: false,
          requiredScored: false,
        },
      ])
    );

    setUniqueQuestions(newUniqueQuestions);
    setQuestionTexts(newQuestionTexts);
    setSelectedTypes(newSelectedTypes);
    setRequiredQuestions(newRequiredQuestions);
    setTypeChangedStates(newTypeChangedStates);
    setScoredQuestions(newScoredQuestions);

    const newState: Record<string, {
      type: string;
      typeChanged: boolean;
      questionText: string;
      required: boolean;
      scored: { typeScored: boolean; requiredScored: boolean };
      order: number;
    }> = {};
    newUniqueQuestions.forEach((text, i) => {
      newState[text] = {
        type: newSelectedTypes[i],
        typeChanged: newTypeChangedStates[i],
        questionText: newQuestionTexts[i],
        required: newRequiredQuestions[i],
        scored: newScoredQuestions[i],
        order: newOrder[i],
      };
    });
    sessionStorage.setItem("questionnaireState", JSON.stringify(newState));

    console.log("Questions reordered. New order:", newOrder);
    console.log("Updated typeChangedStates after reorder:", newTypeChangedStates);
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
        <button
          onClick={() => {
            sessionStorage.removeItem("questionnaireState");
            setUniqueQuestions([]);
            setSelectedTypes([]);
            setTypeChangedStates([]);
            setQuestionTexts([]);
            setRequiredQuestions([]);
            setQuestionOrder([]);
            setScoredQuestions({});
            setBonusAwarded(false);
            console.log("Questionnaire state reset");
          }}
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
          className={`absolute top-28 right-6 p-4 rounded-xl shadow-md transition-opacity duration-400 z-10 animate-fadeIn ${
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
                      const { primaryValue } =
                        enhancedDetermineQuestionType(text);
                      return (
                        <Draggable
                          key={primaryValue || `question-${originalIndex}`}
                          draggableId={
                            primaryValue || `question-${originalIndex}`
                          }
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
                                  questionTexts[originalIndex] ||
                                  "No text selected"
                                }
                                initialType={
                                  selectedTypes[originalIndex] ?? "Text"
                                }
                                initialRequired={
                                  requiredQuestions[originalIndex] || false
                                }
                                initialTypeChanged={
                                  typeChangedStates[originalIndex] || false
                                }
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
                  ? "bg-gray-800/80 backdrop-blur-sm border-gray-700/20"
                  : "bg-white/80 backdrop-blur-sm border-teal-100/20"
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
                Go to the Document tab and select text in square brackets to
                generate questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;