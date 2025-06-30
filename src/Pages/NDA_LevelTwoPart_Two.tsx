import { FaPenToSquare } from "react-icons/fa6";
import { TbSettingsMinus, TbSettingsPlus } from "react-icons/tb";
import { useState, useContext, useRef, useEffect, JSX } from "react";
import Navbar from "../components/Navbar";
import { useHighlightedText } from "../context/HighlightedTextContext";
import { useQuestionType } from "../context/QuestionTypeContext";
import NDAAgreement, { documentText } from "../utils/NDA_Agreement";
import { determineNDAQuestionType } from "../utils/NDA_questionTypeUtils";
import { ThemeContext } from "../context/ThemeContext";
import AIAnalysisPanel from "../components/AIAnalysisPanel";
import { useLocation, useNavigate } from "react-router";
import { CrispChat } from "../bot/knowledge";
import { useScore } from "../context/ScoreContext";
import parse from "html-react-parser";

// Define icon type for clarity
interface Icon {
  icon: JSX.Element;
  label: string;
}

const icons: Icon[] = [
  { icon: <FaPenToSquare />, label: "Edit PlaceHolder" },
  { icon: <TbSettingsMinus />, label: "Small Condition" },
  { icon: <TbSettingsPlus />, label: "Big Condition" },
];

// Mapping for small conditions to their corresponding questions
const smallConditionToQuestionMap: { [key: string]: string } = {
  "except to its employees and professional advisers who need to know the same for the Purpose, who know they owe a duty of confidence to the Discloser and who are bound by obligations equivalent to those in this clause 2 above and this clause 3": "Can the Recipient disclose the Confidential Information to employees or advisers?",
  "[Indefinitely]": "How long do the confidentiality obligations last?",
  "for [Insert number] years from the date of this Agreement": "How long do the confidentiality obligations last?"
};

const NDA_LevelTwoPart_Two = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  const [tooltip, setTooltip] = useState<string | null>(null);
  const { highlightedTexts, addHighlightedText, setHighlightedTexts } = useHighlightedText();
  const { selectedTypes } = useQuestionType();
  const documentRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const isProcessingRef = useRef<boolean>(false);
  const { totalScore, levelTwoScore, setLevelTwoScore } = useScore();
  const [score, setScore] = useState<number>(levelTwoScore);
  const [scoreChange, setScoreChange] = useState<number | null>(null);
  const [foundPlaceholders, setFoundPlaceholders] = useState<string[]>([]);
  const [foundSmallConditions, setFoundSmallConditions] = useState<string[]>([]);
  const [foundBigConditions, setFoundBigConditions] = useState<string[]>([]);
  const isInitialMount = useRef(true);

  const processDocumentTextForPart1 = (html: string): string => {
    let updatedHtml = html;
    // Remove curly braces for individual/company placeholders in PARTIES section
    updatedHtml = updatedHtml.replace(
      /\{residing at <span className="placeholder-recipient-address">\[Address of Individual\]<\/span>\}/g,
      "residing at <span className=\"placeholder-recipient-address\">[Address of Individual]</span>"
    );
    updatedHtml = updatedHtml.replace(
      /\{a company registered in <span className="placeholder-recipient-jurisdiction">\[England\]<\/span> under company number <span className="placeholder-recipient-company-number">\[Number on Register of Companies\]<\/span> whose registered office is at <span className="placeholder-recipient-registered-office">\[Address of Office on the Register of Companies\]<\/span>\}/g,
      "a company registered in <span className=\"placeholder-recipient-jurisdiction\">[England]</span> under company number <span className=\"placeholder-recipient-company-number\">[Number on Register of Companies]</span> whose registered office is at <span className=\"placeholder-recipient-registered-office\">[Address of Office on the Register of Companies]</span>"
    );
    updatedHtml = updatedHtml.replace(
      /\{residing at <span className="placeholder-discloser-address">\[Address of Individual\]<\/span>\}/g,
      "residing at <span className=\"placeholder-discloser-address\">[Address of Individual]</span>"
    );
    updatedHtml = updatedHtml.replace(
      /\{a company registered in <span className="placeholder-discloser-jurisdiction">\[England\]<\/span> under company number <span className="placeholder-disclaimer-company-number">\[Number on Register of Companies\]<\/span> whose registered office is at <span className="placeholder-disclaimer-registered-office">\[Address of Office on the Register of Companies\]<\/span>\}/g,
      "a company registered in <span className=\"placeholder-disclaimer-jurisdiction\">[England]</span> under company number <span className=\"placeholder-disclaimer-company-number\">[Number on Register of Companies]</span> whose registered office is at <span className=\"placeholder-disclaimer-registered-office\">[Address of Office on the Register of Companies]</span>"
    );
    // Preserve curly braces for small conditions
    // Remove only {/ /} placeholders if any
    updatedHtml = updatedHtml.replace(/\{\/([\s\S]*?)\/\}/g, (_match, content) => content);
    return updatedHtml;
  };

  const selectedPart = parseInt(localStorage.getItem("selectedPart") || "0", 10);
  const documentContent =
    selectedPart === 1 ? (
      <div>{parse(processDocumentTextForPart1(documentText))}</div>
    ) : (
      <NDAAgreement />
    );

  // Log document content for debugging
  useEffect(() => {
    if (documentRef.current) {
      console.log("Processed document content:", documentRef.current.innerHTML);
    }
  }, [documentContent]);

  // Load saved state from sessionStorage on mount only
  useEffect(() => {
    if (isInitialMount.current) {
      const savedState = sessionStorage.getItem("ndaLevelTwoPartTwoState");
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          const savedHighlightedTexts = parsedState.highlightedTexts || [];
          const savedFoundPlaceholders = parsedState.foundPlaceholders || [];
          const savedFoundSmallConditions = parsedState.foundSmallConditions || [];
          const savedFoundBigConditions = parsedState.foundBigConditions || [];
          const savedLevelTwoScore = parsedState.levelTwoScore || 0;

          // Only update if arrays are different (deep comparison)
          if (JSON.stringify(savedHighlightedTexts.sort()) !== JSON.stringify(highlightedTexts.sort())) {
            setHighlightedTexts(savedHighlightedTexts);
          }
          if (JSON.stringify(savedFoundPlaceholders.sort()) !== JSON.stringify(foundPlaceholders.sort())) {
            setFoundPlaceholders(savedFoundPlaceholders);
          }
          if (JSON.stringify(savedFoundSmallConditions.sort()) !== JSON.stringify(foundSmallConditions.sort())) {
            setFoundSmallConditions(savedFoundSmallConditions);
          }
          if (JSON.stringify(savedFoundBigConditions.sort()) !== JSON.stringify(foundBigConditions.sort())) {
            setFoundBigConditions(savedFoundBigConditions);
          }
          if (savedLevelTwoScore !== levelTwoScore) {
            setLevelTwoScore(savedLevelTwoScore);
            setScore(savedLevelTwoScore);
          }
        } catch (error) {
          console.error("Error parsing sessionStorage data:", error);
        }
      }
      isInitialMount.current = false;
    }
  }, []); // Empty dependency array ensures this runs only on mount

  // Save state to sessionStorage when relevant state changes
  useEffect(() => {
    const stateToSave = {
      highlightedTexts,
      foundPlaceholders,
      foundSmallConditions,
      foundBigConditions,
      levelTwoScore,
    };
    sessionStorage.setItem("ndaLevelTwoPartTwoState", JSON.stringify(stateToSave));
  }, [highlightedTexts, foundPlaceholders, foundSmallConditions, foundBigConditions, levelTwoScore]);

  // Sync local score with levelTwoScore
  useEffect(() => {
    if (levelTwoScore !== score) {
      console.log(`levelTwoScore updated to ${levelTwoScore}, syncing local score`);
      setScore(levelTwoScore);
    }
  }, [levelTwoScore]);

  useEffect(() => {
    console.log("Location changed to:", location.pathname);
    localStorage.setItem("level", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("selectedQuestionTypes_2");
      sessionStorage.removeItem("typeChangedStates_2");
      sessionStorage.removeItem("questionOrder_2");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const getDocumentText = (): string => {
    return documentRef.current?.textContent || "";
  };

  const handleIconClick = (label: string) => {
    if (isProcessingRef.current) {
      console.log("Click ignored: Processing another click");
      return;
    }
    isProcessingRef.current = true;
    console.log(`handleIconClick triggered for label: ${label}`);

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      console.log("No selection or range found");
      isProcessingRef.current = false;
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();
    console.log(`Selected text: "${selectedText}"`);

    let textWithoutBrackets = selectedText;
    let hasValidSpanClass = false;
    let fullPlaceholderText: string | null = null;

    // Process the selected text based on its type
    if (selectedText.startsWith("[") && selectedText.endsWith("]")) {
      textWithoutBrackets = selectedText.slice(1, -1); // Remove [ and ]
      hasValidSpanClass = true;
    } else if (selectedText.startsWith("{") && selectedText.endsWith("}")) {
      // For small conditions, remove curly braces
      textWithoutBrackets = selectedText.slice(1, -1); // Remove { and }
    } else {
      const node = selection.anchorNode;
      if (node && (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE)) {
        const parent = node.parentElement;
        if (parent) {
          const classList = Array.from(parent.classList);
          const placeholderClass = classList.find((cls) => cls.startsWith("placeholder-"));
          if (placeholderClass) {
            hasValidSpanClass = true;
            fullPlaceholderText = parent.textContent || selectedText;
            textWithoutBrackets = fullPlaceholderText;
            console.log(`Full placeholder text: ${fullPlaceholderText}`);
            if (selectedText !== fullPlaceholderText) {
              console.log(`Selected text "${selectedText}" does not match full placeholder "${fullPlaceholderText}". Aborting.`);
              isProcessingRef.current = false;
              return;
            }
          }
        }
      }
    }

    // Relax validation for small and big conditions
    if (
      (label === "Edit PlaceHolder" && !hasValidSpanClass) ||
      (label === "Small Condition" && !(selectedText.startsWith("{") && selectedText.endsWith("}"))) ||
      (label === "Big Condition" &&
        !selectedText.includes("If the Recipient is") &&
        !(selectedText.includes("DURATION OF OBLIGATIONS") && selectedText.includes("The undertakings above will continue in force"))
      )
    ) {
      console.log("Invalid selection for:", label, selectedText);
      isProcessingRef.current = false;
      return;
    }

    const isCorrectButton =
      (label === "Edit PlaceHolder" && hasValidSpanClass) ||
      (label === "Small Condition" && selectedText.startsWith("{") && selectedText.endsWith("}")) ||
      (label === "Big Condition" && selectedText.includes("If the Recipient is"));

    if (isCorrectButton) {
      if (label === "Edit PlaceHolder" && !foundPlaceholders.includes(textWithoutBrackets)) {
        setScore((prevScore) => {
          const newScore = prevScore + 3;
          console.log(`Edit PlaceHolder: Setting score to ${newScore}`);
          setLevelTwoScore(newScore);
          return newScore;
        });
        setScoreChange(3);
        setTimeout(() => {
          console.log("Resetting scoreChange");
          setScoreChange(null);
        }, 1000);
        setFoundPlaceholders((prev) => {
          if (!prev.includes(textWithoutBrackets)) {
            return [...prev, textWithoutBrackets];
          }
          return prev;
        });
      } else if (label === "Small Condition" && !foundSmallConditions.includes(textWithoutBrackets)) {
        setScore((prevScore) => {
          const newScore = prevScore + 3;
          console.log(`Small Condition: Setting score to ${newScore}`);
          setLevelTwoScore(newScore);
          return newScore;
        });
        setScoreChange(3);
        setTimeout(() => {
          console.log("Resetting scoreChange");
          setScoreChange(null);
        }, 1000);
        setFoundSmallConditions((prev) => {
          if (!prev.includes(textWithoutBrackets)) {
            return [...prev, textWithoutBrackets];
          }
          return prev;
        });
      } else if (label === "Big Condition" && !foundBigConditions.includes(textWithoutBrackets)) {
        setScore((prevScore) => {
          const newScore = prevScore + 3;
          console.log(`Big Condition: Setting score to ${newScore}`);
          setLevelTwoScore(newScore);
          return newScore;
        });
        setScoreChange(3);
        setTimeout(() => {
          console.log("Resetting scoreChange");
          setScoreChange(null);
        }, 1000);
        setFoundBigConditions((prev) => {
          if (!prev.includes(textWithoutBrackets)) {
            return [...prev, textWithoutBrackets];
          }
          return prev;
        });
      } else {
        console.log(`Already scored for ${label}: ${textWithoutBrackets}`);
      }
    } else {
      console.log(`Incorrect button for ${label}: Deducting 2 points`);
      setScore((prevScore) => {
        const newScore = Math.max(0, prevScore - 2);
        console.log(`Incorrect selection: Setting score to ${newScore}`);
        setLevelTwoScore(newScore);
        return newScore;
      });
      setScoreChange(-2);
      setTimeout(() => {
        console.log("Resetting scoreChange");
        setScoreChange(null);
      }, 1000);
    }

    if (label === "Edit PlaceHolder") {
      if (highlightedTexts.includes(textWithoutBrackets)) {
        console.log("Placeholder already highlighted:", textWithoutBrackets);
        alert("This placeholder has already been added!");
        isProcessingRef.current = false;
        return;
      }
      console.log("Selected Edit Placeholder:", textWithoutBrackets);
      addHighlightedText(textWithoutBrackets);
      const bgColor = isDarkMode ? "rgba(255, 245, 157, 0.5)" : "rgba(255, 235, 157, 0.7)";
      const span = document.createElement("span");
      span.style.backgroundColor = bgColor;
      span.textContent = selectedText;
      span.className = `placeholder placeholder-${textWithoutBrackets.toLowerCase().replace(/\s+/g, '-')}`;
      range.deleteContents();
      range.insertNode(span);
    } else if (label === "Small Condition") {
      if (
        !(selectedText.startsWith("{") && selectedText.endsWith("}")) ||
        selectedText.length < 10 ||
        selectedText.length > 450
      ) {
        console.log("Invalid Small Condition selection:", selectedText);
        isProcessingRef.current = false;
        return;
      }
      const durationIndefinite = "[Indefinitely]";
      const durationYears = "for [Insert number] years from the date of this Agreement";
      if (
        !highlightedTexts.includes(textWithoutBrackets) &&
        !(highlightedTexts.includes(durationIndefinite) && textWithoutBrackets === durationYears) &&
        !(highlightedTexts.includes(durationYears) && textWithoutBrackets === durationIndefinite)
      ) {
        addHighlightedText(textWithoutBrackets);
      }
      const bgColor = isDarkMode ? "rgba(129, 236, 236, 0.5)" : "rgba(129, 236, 236, 0.7)";
      const span = document.createElement("span");
      span.style.backgroundColor = bgColor;
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);
    } else if (label === "Big Condition") {
      console.log("Processing Big Condition:", selectedText);
      let clauseContent = textWithoutBrackets;
      const headingsToStrip = ["If the Recipient is an individual:", "If the Recipient is a company:"];
      let headingUsed = "";
      for (const heading of headingsToStrip) {
        if (textWithoutBrackets.startsWith(heading)) {
          clauseContent = textWithoutBrackets.slice(heading.length).trim();
          headingUsed = heading;
          console.log(`Stripped heading '${heading}', clauseContent:`, clauseContent);
          break;
        }
      }

      // Flexible match: if selection contains both key phrases, add only the question, not the clause
      if (
        clauseContent.includes("DURATION OF OBLIGATIONS") &&
        clauseContent.includes("The undertakings above will continue in force")
      ) {
        // Find the <h2> and <p> for DURATION OF OBLIGATIONS and highlight both
        const allHeadings = documentRef.current?.querySelectorAll("h2");
        let durationHeading: HTMLElement | null = null;
        let durationContent: HTMLElement | null = null;
        if (allHeadings) {
          for (const h2 of Array.from(allHeadings)) {
            if (h2.textContent?.replace(/\s+/g, " ").trim().includes("DURATION OF OBLIGATIONS")) {
              durationHeading = h2 as HTMLElement;
              // The next sibling <p> is the content
              let next = h2.nextElementSibling;
              while (next && next.tagName.toLowerCase() !== "p") {
                next = next.nextElementSibling;
              }
              if (next && next.tagName.toLowerCase() === "p") {
                durationContent = next as HTMLElement;
              }
              break;
            }
          }
        }
        const bgColor = isDarkMode ? "rgba(186, 220, 88, 0.5)" : "rgba(186, 220, 88, 0.7)";
        if (durationHeading) durationHeading.style.backgroundColor = bgColor;
        if (durationContent) durationContent.style.backgroundColor = bgColor;
        // Add only the question to placeholders
        const indefiniteQuestion = "Should the confidentiality obligations apply?";
        if (!highlightedTexts.includes(indefiniteQuestion)) {
          addHighlightedText(indefiniteQuestion);
        }
        // Award +3 points for this selection
        setScore((prevScore) => {
          const newScore = prevScore + 3;
          setLevelTwoScore(newScore);
          return newScore;
        });
        setScoreChange(3);
        setTimeout(() => {
          setScoreChange(null);
        }, 1000);
        isProcessingRef.current = false;
        return;
      }

      if (!highlightedTexts.includes(clauseContent)) {
        addHighlightedText(clauseContent);
      }

      // Add follow-up placeholders if applicable
      if (headingUsed === "If the Recipient is an individual:") {
        const placeholders = ["Name of Recipient", "Name of Witness", "Address of Witness"];
        placeholders.forEach((ph) => {
          if (!highlightedTexts.includes(ph)) {
            addHighlightedText(ph);
            console.log(`Added follow-up question: ${ph}`);
          }
        });
      } else if (headingUsed === "If the Recipient is a company:") {
        const placeholders = ["Name of Recipient", "Name of Director", "Name of Witness", "Address of Witness"];
        placeholders.forEach((ph) => {
          if (!highlightedTexts.includes(ph)) {
            addHighlightedText(ph);
            console.log(`Added follow-up question: ${ph}`);
          }
        });
      }

      const bgColor = isDarkMode ? "rgba(186, 220, 88, 0.5)" : "rgba(186, 220, 88, 0.7)";
      const headingElements = documentRef.current?.querySelectorAll("p");
      let targetSection: HTMLElement | null = null;
      if (headingElements) {
        for (const p of Array.from(headingElements)) {
          const cleanPText = p.textContent?.trim();
          if (cleanPText?.startsWith(headingUsed)) {
            targetSection = p as HTMLElement;
            break;
          }
        }
      }

      if (targetSection && targetSection.parentElement) {
        const elementsToHighlight: HTMLElement[] = [targetSection];
        const siblings = Array.from(targetSection.parentElement.children);
        const pIndex = siblings.indexOf(targetSection);
        // Highlight all subsequent elements until the next section or end
        for (let i = pIndex + 1; i < siblings.length; i++) {
          const sibling = siblings[i];
          if (sibling instanceof HTMLElement) {
            if (sibling.textContent?.startsWith("If the Recipient is")) {
              break; // Stop at the next condition
            }
            elementsToHighlight.push(sibling);
          }
        }
        elementsToHighlight.forEach((el) => {
          el.style.backgroundColor = bgColor;
        });
      } else {
        console.warn(`Could not find section or parent for highlighting: ${selectedText}`);
        isProcessingRef.current = false;
        return;
      }
      selection.removeAllRanges();
    }

    isProcessingRef.current = false;
  };

  return (
    <div
      className={`w-full min-h-screen font-sans transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
      }`}
    >
      <Navbar
        level="/NDA_LevelTwoPart_Two"
        questionnaire="/NDA_Questionnaire"
        live_generation="/NDA_Live_Generation"
      />
      <div className="text-center mt-24">
        {selectedPart === 1 && (
          <h1
            className={`text-3xl font-bold tracking-wide ${
              isDarkMode ? "text-white" : "text-gray-700"
            }`}
          >
            LEVEL 1: Automate Placeholders
          </h1>
        )}
        {selectedPart === 2 && (
          <h1
            className={`text-3xl font-bold tracking-wide ${
              isDarkMode ? "text-white" : "text-gray-700"
            }`}
          >
            LEVEL 2: Automate Small Conditions
          </h1>
        )}
        {selectedPart === 3 && (
          <h1
            className={`text-3xl font-bold tracking-wide ${
              isDarkMode ? "text-white" : "text-gray-700"
            }`}
          >
            LEVEL 3: Automate Big Conditions
          </h1>
        )}
      </div>
      <div className="fixed top-16 left-6 z-50 px-6 py-3">
        <div
          className={`p-3 rounded-full shadow-lg flex items-center ${
            isDarkMode ? "bg-gray-700 text-white" : "bg-teal-500 text-white"
          }`}
        >
          <span className="font-bold mr-2">Score:</span> {totalScore}
          {scoreChange !== null && (
            <span
              className={`ml-2 text-sm font-bold ${
                scoreChange > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
            </span>
          )}
        </div>
      </div>
      <div className="fixed flex top-16 right-0 z-50 px-6 py-3 space-x-6">
        {icons.map(({ icon, label }, index) => {
          const shouldRender =
            (label === "Edit PlaceHolder" && selectedPart === 1) ||
            (label === "Small Condition" && selectedPart === 2) ||
            (label === "Big Condition" && selectedPart === 3) ||
            selectedPart === 4;
          if (!shouldRender) return null;
          return (
            <div key={index} className="relative flex items-center">
              <button
                id={
                  label === "Edit PlaceHolder"
                    ? "edit-placeholder"
                    : `icon-${label.toLowerCase().replace(" ", "-")}`
                }
                className={`p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 ease-in-out flex items-center justify-center text-2xl ${
                  isDarkMode
                    ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800"
                    : "bg-gradient-to-r from-teal-400 to-cyan-400 text-white hover:from-teal-500 hover:to-cyan-500"
                }`}
                onMouseEnter={() => setTooltip(label)}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => handleIconClick(label)}
              >
                {icon}
              </button>
              {tooltip === label && (
                <div
                  className={`absolute -left top-full mt-2 px-3 py-1 text-sm font-medium text-white rounded-lg shadow-lg whitespace-nowrap ${
                    isDarkMode
                      ? "bg-gradient-to-r from-gray-700 to-gray-800"
                      : "bg-gradient-to-r from-gray-800 to-gray-900"
                  }`}
                >
                  {label}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div
        className={`max-w-5xl mx-auto p-8 rounded-3xl shadow-2xl border mt-24 transform transition-all duration-500 hover:shadow-3xl ${
          isDarkMode
            ? "bg-gray-800/90 backdrop-blur-lg border-gray-700/50"
            : "bg-white/90 backdrop-blur-lg border-teal-100/30"
        }`}
      >
        <h2
          className={`text-2xl font-semibold mb-6 tracking-wide ${
            isDarkMode ? "text-teal-300" : "text-teal-700"
          }`}
        >
          ☑️ Selected Placeholders
        </h2>
        {highlightedTexts.length > 0 ? (
          <ul
            className={`space-y-3 p-5 rounded-xl shadow-inner ${
              isDarkMode
                ? "bg-gradient-to-r from-gray-700/70 via-gray-800/70 to-gray-900/70"
                : "bg-gradient-to-r from-teal-50/70 via-cyan-50/70 to-indigo-50/70"
            }`}
          >
            {[...new Set(highlightedTexts)].map((text, index) => {
              const { primaryType, primaryValue } = determineNDAQuestionType(text);
              // First try to get the question from determineNDAQuestionType
              let displayText = primaryValue;
              
              // If no primaryValue, check the smallConditionToQuestionMap
              if (!displayText && smallConditionToQuestionMap[text]) {
                displayText = smallConditionToQuestionMap[text];
              }
              
              // If still no mapping found, use the original text
              if (!displayText) {
                displayText = text;
              }

              const questionType = selectedTypes[index] || "Text";
              return (
                <li key={index} className="flex items-center justify-between">
                  <div>
                    <span
                      className={`text-sm font-medium truncate max-w-xs ${
                        isDarkMode ? "text-teal-200" : "text-teal-900"
                      }`}
                    >
                      {displayText}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode
                        ? "text-gray-300 bg-gray-500/50"
                        : "text-gray-600 bg-teal-100/50"
                    }`}
                  >
                    Type: {questionType}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div
            className={`text-center py-8 rounded-xl shadow-sm ${
              isDarkMode
                ? "bg-gradient-to-r from-gray-700/70 via-gray-800/70 to-gray-900/70"
              : "bg-gradient-to-r from-teal-50/20 via-gray-50 to-indigo-50/20"
            }`}
          >
            <p
              className={`italic text-lg font-semibold ${
                isDarkMode ? "text-teal-400" : "text-teal-600"
              }`}
            >
              No placeholders selected yet
            </p>
          </div>
        )}
        {highlightedTexts.length > 0 && (
          <div className="mt-5 text-right">
            <span
              className={`text-sm px-3 py-1 rounded-full shadow-sm ${
                isDarkMode
                  ? "text-teal-300 bg-gray-600/50"
                  : "text-teal-600 bg-teal-200/50"
              }`}
            >
              Total Placeholders: {[...new Set(highlightedTexts)].length}
            </span>
          </div>
        )}
      </div>
      <div className="max-w-5xl mx-auto mt-10 px-8 pb-20" ref={documentRef}>
        <div
          className={`p-6 rounded-xl shadow-xl border ${
            isDarkMode
              ? "bg-gray-800/70 backdrop-blur-md border-gray-900/20 bg-gradient-to-br from-gray-700/70 via-gray-800/70 to-gray-900/70"
              : "bg-white/80 backdrop-blur-md border-gray-100/20 bg-gradient-to-br from-teal-50/50 via-cyan-50/50 to-indigo-50/50"
          }`}
        >
          {documentContent}
        </div>
        <AIAnalysisPanel
          documentText={getDocumentText()}
          highlightedTexts={highlightedTexts}
          isDarkMode={isDarkMode}
        />
        <CrispChat websiteId={""} />
      </div>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200 ${
              isDarkMode
                ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                : "bg-teal-200 text-teal-900 hover:bg-teal-300"
            }`}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NDA_LevelTwoPart_Two;


// latest code