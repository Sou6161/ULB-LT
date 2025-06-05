import { FaPenToSquare } from "react-icons/fa6";
import { TbSettingsMinus, TbSettingsPlus } from "react-icons/tb";
import { useState, useContext, useRef, useEffect, JSX } from "react";
import Navbar from "../components/Navbar";
import { useHighlightedText } from "../context/HighlightedTextContext";
import { useQuestionType } from "../context/QuestionTypeContext";
import EmploymentAgreement, { documentText } from "../utils/EmploymentAgreement";
import { determineQuestionType } from "../utils/questionTypeUtils";
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

const LevelTwoPart_Two = () => {
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

  const processDocumentTextForPart1 = (html: string): string => {
    let updatedHtml = html;
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>\(PROBATIONARY PERIOD<\/h2>\s*<p>([\s\S]*?)\)\s*<span[^>]*>\(Optional Clause\)<\/span>/i,
      (_match, content) => {
        return `<h2 className="text-2xl font-bold mt-6">(PROBATIONARY PERIOD</h2><p className="mt-5">${content})</p><span className="text-black font-medium">(Optional)</span>`;
      }
    );
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>\(PENSION<\/h2>\s*<p>([\s\S]*?)\)/i,
      (_match, content) => {
        return `<h2 className="text-2xl font-bold mt-6">(PENSION</h2><p className="mt-2">${content})</p>`;
      }
    );
    // Preserve curly braces for small conditions
    // Remove only {/ /} placeholders
    updatedHtml = updatedHtml.replace(/\{\/([\s\S]*?)\/\}/g, (_match, content) => content);
    return updatedHtml;
  };

  const selectedPart = parseInt(localStorage.getItem("selectedPart") || "0", 10);
  const documentContent =
    selectedPart === 1
      ? parse(processDocumentTextForPart1(documentText))
      : <EmploymentAgreement />;

  // Log document content for debugging
  useEffect(() => {
    if (documentRef.current) {
      console.log("Processed document content:", documentRef.current.innerHTML);
    }
  }, [documentContent]);

  // Load saved state from sessionStorage (for highlightedTexts and scores only)
  useEffect(() => {
    const savedState = sessionStorage.getItem("levelTwoPartTwoState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (JSON.stringify(parsedState.highlightedTexts || []) !== JSON.stringify(highlightedTexts)) {
          setHighlightedTexts(parsedState.highlightedTexts || []);
        }
        if (JSON.stringify(parsedState.foundPlaceholders || []) !== JSON.stringify(foundPlaceholders)) {
          setFoundPlaceholders(parsedState.foundPlaceholders || []);
        }
        if (JSON.stringify(parsedState.foundSmallConditions || []) !== JSON.stringify(foundSmallConditions)) {
          setFoundSmallConditions(parsedState.foundSmallConditions || []);
        }
        if (JSON.stringify(parsedState.foundBigConditions || []) !== JSON.stringify(foundBigConditions)) {
          setFoundBigConditions(parsedState.foundBigConditions || []);
        }
        if (parsedState.levelTwoScore !== levelTwoScore) {
          setLevelTwoScore(parsedState.levelTwoScore || 0);
        }
      } catch (error) {
        console.error("Error parsing sessionStorage data:", error);
      }
    }
  }, []);

  // Save state to sessionStorage (for highlightedTexts and scores only)
  useEffect(() => {
    const stateToSave = {
      highlightedTexts,
      foundPlaceholders,
      foundSmallConditions,
      foundBigConditions,
      levelTwoScore,
    };
    sessionStorage.setItem("levelTwoPartTwoState", JSON.stringify(stateToSave));
  }, [highlightedTexts, foundPlaceholders, foundSmallConditions, foundBigConditions, levelTwoScore]);

  useEffect(() => {
    if (levelTwoScore !== score) {
      console.log(`levelTwoScore updated to ${levelTwoScore}, syncing local score`);
      setScore(levelTwoScore);
    }
  }, [levelTwoScore, score]);

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
    let hasValidBrackets = false;
    let hasValidSpanClass = false;
    let fullPlaceholderText: string | null = null;

    if (selectedText.startsWith("[") && selectedText.endsWith("]")) {
      textWithoutBrackets = selectedText.slice(1, -1);
      hasValidBrackets = true;
      hasValidSpanClass = true;
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
      (label === "Big Condition" && !selectedText.includes("("))
    ) {
      console.log("Invalid selection for:", label, selectedText);
      isProcessingRef.current = false;
      return;
    }

    const isCorrectButton =
      (label === "Edit PlaceHolder" && hasValidSpanClass) ||
      (label === "Small Condition" && selectedText.startsWith("{") && selectedText.endsWith("}")) ||
      (label === "Big Condition" && selectedText.includes("("));

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
        setFoundPlaceholders((prev) => [...prev, textWithoutBrackets]);
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
        setFoundSmallConditions((prev) => [...prev, textWithoutBrackets]);
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
        setFoundBigConditions((prev) => [...prev, textWithoutBrackets]);
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
        selectedText.length < 35 ||
        selectedText.length > 450
      ) {
        console.log("Invalid Small Condition selection:", selectedText);
        isProcessingRef.current = false;
        return;
      }
      const overtimeNoPay = "The Employee shall not receive additional payment for overtime worked";
      const overtimePay = "The Employee is entitled to overtime pay for authorized overtime work";
      if (
        !highlightedTexts.includes(textWithoutBrackets) &&
        !(highlightedTexts.includes(overtimeNoPay) && textWithoutBrackets === overtimePay) &&
        !(highlightedTexts.includes(overtimePay) && textWithoutBrackets === overtimeNoPay)
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
      const headingsToStrip = ["(PROBATIONARY PERIOD", "(PENSION"];
      let headingUsed = "";
      for (const heading of headingsToStrip) {
        if (textWithoutBrackets.startsWith(heading)) {
          clauseContent = textWithoutBrackets.slice(heading.length).trim();
          if (clauseContent.endsWith(")")) {
            clauseContent = clauseContent.slice(0, -1).trim();
          }
          headingUsed = heading;
          console.log(`Stripped heading '${heading}', clauseContent:`, clauseContent);
          break;
        }
      }

      if (clauseContent.startsWith("The Employee will be enrolled in the Company's")) {
        clauseContent =
          "The Employee will be enrolled in the Company's workplace pension scheme in accordance with the Pensions Act 2008. Contributions will be made as required under auto-enrolment legislation.";
      }

      if (!highlightedTexts.includes(clauseContent)) {
        addHighlightedText(clauseContent);
      }

      const probationClause =
        "The first Probation Period Length of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. Upon successful completion, the Employee will be confirmed in their role.";
      if (clauseContent === probationClause && !highlightedTexts.includes("Probation Period Length")) {
        addHighlightedText("Probation Period Length");
        console.log("Added follow-up question: Probation Period Length");
      }

      const bgColor = isDarkMode ? "rgba(186, 220, 88, 0.5)" : "rgba(186, 220, 88, 0.7)";
      const headingElements = documentRef.current?.querySelectorAll("h2");
      let targetSection: HTMLElement | null = null;
      if (headingElements) {
        for (const h2 of Array.from(headingElements)) {
          const cleanH2Text = h2.textContent?.trim();
          if (cleanH2Text === headingUsed) {
            targetSection = h2 as HTMLElement;
            break;
          }
        }
      }

      if (targetSection && targetSection.parentElement) {
        const elementsToHighlight: HTMLElement[] = [targetSection];
        const siblings = Array.from(targetSection.parentElement.children);
        const h2Index = siblings.indexOf(targetSection);
        if (h2Index + 1 < siblings.length) {
          const nextSibling = siblings[h2Index + 1];
          if (nextSibling instanceof HTMLElement && nextSibling.tagName.toLowerCase() === "p") {
            elementsToHighlight.push(nextSibling);
            if (h2Index + 2 < siblings.length) {
              const secondSibling = siblings[h2Index + 2];
              if (
                secondSibling instanceof HTMLElement &&
                secondSibling.tagName.toLowerCase() === "span" &&
                secondSibling.classList.contains("text-black")
              ) {
                elementsToHighlight.push(secondSibling);
              }
            }
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
        level="/LevelTwoPart_Two"
        questionnaire="/Questionnaire"
        live_generation="/Live_Generation"
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
              const { primaryValue } = determineQuestionType(text);
              const questionType = selectedTypes[index] || "Text";
              return (
                <li key={index} className="flex items-center justify-between">
                  <div>
                    <span
                      className={`text-sm font-medium truncate max-w-xs ${
                        isDarkMode ? "text-teal-200" : "text-teal-900"
                      }`}
                    >
                      {primaryValue || text}
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
            className={`text-center py-8 rounded-xl shadow-inner ${
              isDarkMode
                ? "bg-gradient-to-r from-gray-700/70 via-gray-800/70 to-gray-900/70"
                : "bg-gradient-to-r from-teal-50/70 via-cyan-50/70 to-indigo-50/70"
            }`}
          >
            <p
              className={`italic text-lg ${
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
              className={`text-sm px-3 py-1 rounded-full ${
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

export default LevelTwoPart_Two;


// working