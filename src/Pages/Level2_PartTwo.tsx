import { FaPenToSquare } from "react-icons/fa6";
import { TbSettingsMinus, TbSettingsPlus } from "react-icons/tb";
import { useState, useContext, useRef, useEffect } from "react";
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

const icons = [
  { icon: <FaPenToSquare />, label: "Edit PlaceHolder" },
  { icon: <TbSettingsMinus />, label: "Small Condition" },
  { icon: <TbSettingsPlus />, label: "Big Condition" },
];

const LevelTwoPart_Two = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  const [tooltip, setTooltip] = useState<string | null>(null);
  const { highlightedTexts, addHighlightedText } = useHighlightedText();
  const { selectedTypes } = useQuestionType();
  const documentRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Scoring system
  const { totalScore, updateScore, levelTwoScore, setLevelTwoScore } =
    useScore();
  const [score, setScore] = useState<number>(levelTwoScore);
  const [scoreChange, setScoreChange] = useState<number | null>(null);
  const [foundPlaceholders, setFoundPlaceholders] = useState<string[]>([]);
  const [foundSmallConditions, setFoundSmallConditions] = useState<string[]>(
    []
  );
  const [foundBigConditions, setFoundBigConditions] = useState<string[]>([]);

  useEffect(() => {
    setLevelTwoScore(score);
    updateScore(score - totalScore); // Synchronize totalScore with local score changes
  }, [score, setLevelTwoScore, updateScore, totalScore]);

  useEffect(() => {
    console.log("LevelTwoPart_Two - Rendering at:", location.pathname);
    sessionStorage.removeItem("level");
    sessionStorage.setItem("level", location.pathname);
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

  const getDocumentText = () => {
    return documentRef.current?.textContent || "";
  };

  const handleIconClick = (label: string) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    let textWithoutBrackets = selectedText;
    let hasValidBrackets = false;
    let hasValidSpanClass = false;

    // Check for Employer Name specifically, which still has square brackets
    if (selectedText === "[Employer Name]") {
      textWithoutBrackets = selectedText.slice(1, -1); // Remove [ and ]
      hasValidBrackets = true;
      hasValidSpanClass = true;
    } else if (selectedText.startsWith("{") && selectedText.endsWith("}")) {
      textWithoutBrackets = selectedText.slice(1, -1);
      hasValidBrackets = true;
    } else if (selectedText.startsWith("(") && selectedText.endsWith(")")) {
      textWithoutBrackets = selectedText.slice(1, -1);
      hasValidBrackets = true;
    } else {
      // For placeholders without square brackets, rely on the span class
      const node = selection.anchorNode;
      if (node && node.parentElement) {
        const parent = node.parentElement;
        const classList = Array.from(parent.classList);
        const placeholderClass = classList.find((cls) =>
          cls.startsWith("placeholder-")
        );

        if (placeholderClass) {
          hasValidSpanClass = true;
          textWithoutBrackets = parent.textContent || selectedText;
        }
      }
    }

    if (
      (label === "Edit PlaceHolder" && !hasValidSpanClass) ||
      ((label === "Small Condition" || label === "Big Condition") &&
        !hasValidBrackets)
    ) {
      console.log("Selected text does not have valid brackets:", selectedText);
      return;
    }

    // Scoring validation
    const isCorrectButton =
      (label === "Edit PlaceHolder" && hasValidSpanClass) ||
      (label === "Small Condition" && hasValidBrackets) ||
      (label === "Big Condition" && hasValidBrackets);

    // Handle scoring
    if (isCorrectButton) {
      if (
        label === "Edit PlaceHolder" &&
        !foundPlaceholders.includes(textWithoutBrackets)
      ) {
        setScore((prevScore) => {
          const newScore = prevScore + 3;
          updateScore(3); // Update totalScore
          return newScore;
        });
        setScoreChange(3);
        setTimeout(() => setScoreChange(null), 2000);
        setFoundPlaceholders((prev) => [...prev, textWithoutBrackets]);
      } else if (
        label === "Small Condition" &&
        !foundSmallConditions.includes(textWithoutBrackets)
      ) {
        setScore((prevScore) => {
          const newScore = prevScore + 3;
          updateScore(3); // Update totalScore
          return newScore;
        });
        setScoreChange(3);
        setTimeout(() => setScoreChange(null), 2000);
        setFoundSmallConditions((prev) => [...prev, textWithoutBrackets]);
      } else if (
        label === "Big Condition" &&
        !foundBigConditions.includes(textWithoutBrackets)
      ) {
        setScore((prevScore) => {
          const newScore = prevScore + 3;
          updateScore(3); // Update totalScore
          return newScore;
        });
        setScoreChange(3);
        setTimeout(() => setScoreChange(null), 2000);
        setFoundBigConditions((prev) => [...prev, textWithoutBrackets]);
      }
    } else {
      // Wrong button clicked - deduct 2 points
      setScore((prevScore) => {
        const newScore = Math.max(0, prevScore - 2);
        updateScore(-2); // Update totalScore
        return newScore;
      });
      if (score > 0) {
        setScoreChange(-2);
        setTimeout(() => setScoreChange(null), 2000);
      }
      return;
    }

    if (label === "Edit PlaceHolder") {
      if (highlightedTexts.includes(textWithoutBrackets)) {
        console.log("Placeholder already highlighted:", textWithoutBrackets);
        alert("This placeholder has already been added!");
        return;
      }
      console.log("Selected Edit Placeholder:", textWithoutBrackets);
      addHighlightedText(textWithoutBrackets);
      const span = document.createElement("span");
      span.style.backgroundColor = isDarkMode
        ? "rgba(255, 245, 157, 0.5)"
        : "rgba(255, 245, 157, 0.7)";
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);
    } else if (label === "Small Condition") {
      if (
        !(selectedText.startsWith("{") && selectedText.endsWith("}")) ||
        selectedText.length < 35 ||
        selectedText.length > 450
      )
        return;
      if (
        !highlightedTexts.includes(textWithoutBrackets) &&
        !(
          highlightedTexts.includes(
            "The Employee shall not receive additional payment for overtime worked"
          ) &&
          textWithoutBrackets ===
            "The Employee is entitled to overtime pay for authorized overtime work"
        ) &&
        !(
          highlightedTexts.includes(
            "The Employee is entitled to overtime pay for authorized overtime work"
          ) &&
          textWithoutBrackets ===
            "The Employee shall not receive additional payment for overtime worked"
        )
      ) {
        addHighlightedText(textWithoutBrackets);
      }
      const span = document.createElement("span");
      span.style.backgroundColor = isDarkMode
        ? "rgba(129, 236, 236, 0.5)"
        : "rgba(129, 236, 236, 0.7)";
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);
    } else if (label === "Big Condition") {
      if (!(selectedText.startsWith("(") && selectedText.endsWith(")"))) return;
      console.log("Selected Big Condition:", selectedText);

      let clauseContent = textWithoutBrackets;
      const headingsToStrip = ["PROBATIONARY PERIOD", "PENSION"];
      for (const heading of headingsToStrip) {
        if (textWithoutBrackets.startsWith(heading)) {
          clauseContent = textWithoutBrackets.slice(heading.length).trim();
          console.log(
            `Stripped heading '${heading}', clauseContent:`,
            clauseContent
          );
          break;
        }
      }

      addHighlightedText(clauseContent);

      const fragment = document.createDocumentFragment();
      const contents = range.cloneContents();
      const applyHighlight = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const span = document.createElement("span");
          span.style.backgroundColor = isDarkMode
            ? "rgba(186, 220, 88, 0.5)"
            : "rgba(186, 220, 88, 0.7)";
          span.textContent = node.textContent || "";
          return span;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const newElement = document.createElement(element.tagName);
          for (const attr of element.attributes) {
            newElement.setAttribute(attr.name, attr.value);
          }
          element.childNodes.forEach((child) => {
            const newChild = applyHighlight(child);
            if (newChild) newElement.appendChild(newChild);
          });
          return newElement;
        }
        return null;
      };

      contents.childNodes.forEach((node) => {
        const newNode = applyHighlight(node);
        if (newNode) fragment.appendChild(newNode);
      });

      range.deleteContents();
      range.insertNode(fragment);

      const probationClauseContent =
        "The first Probation Period Length of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. Upon successful completion, the Employee will be confirmed in their role.";
      const pensionClauseContent =
        "The Employee will be enrolled in the Company’s pension scheme in accordance with auto-enrolment legislation.";

      const normalizeText = (text: string) => text.replace(/\s+/g, "");
      const normalizedSelectedText = normalizeText(textWithoutBrackets);
      const normalizedProbationClause = normalizeText(probationClauseContent);
      const normalizedPensionClause = normalizeText(pensionClauseContent);

      const probationQuestion =
        "Is the clause of probationary period applicable?";
      const pensionQuestion = "Is the Pension clause applicable?";

      if (normalizedSelectedText === normalizedProbationClause) {
        console.log(
          "Probation Clause matched, checking for duplicate question"
        );
        if (!highlightedTexts.includes(probationQuestion)) {
          console.log(
            "Probation question not found, adding:",
            probationQuestion
          );
          addHighlightedText(probationQuestion);
        } else {
          console.log("Probation question already exists, alerting user");
          alert("Probation clause question already added!");
        }
      } else if (normalizedSelectedText === normalizedPensionClause) {
        console.log("Pension Clause matched, checking for duplicate question");
        if (!highlightedTexts.includes(pensionQuestion)) {
          console.log("Pension question not found, adding:", pensionQuestion);
          addHighlightedText(pensionQuestion);
        } else {
          console.log("Pension question already exists, alerting user");
          alert("Pension clause question already added!");
        }
      } else {
        console.log("No clause matched.");
      }
    }
  };

  const selectedPart = parseInt(
    localStorage.getItem("selectedPart") || "0",
    10
  );

  // Function to process document text for Part 1 by removing round and curly brackets
  const processDocumentTextForPart1 = (html: string) => {
    let updatedHtml = html;

    // Remove round brackets from Probationary Period clause
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>\(PROBATIONARY PERIOD<\/h2>\s*<p>([\s\S]*?)\)\s*<span[^>]*>\(Optional Clause\)<\/span>/i,
      (_match, content) => {
        return `<h2 className="text-2xl font-bold mt-6">PROBATIONARY PERIOD</h2><p className="mt-5">${content}</p><span className="text-black font-bold">(Optional Clause)</span>`;
      }
    );

    // Remove round brackets from Pension clause
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>\(PENSION<\/h2>\s*<p>([\s\S]*?)\)/i,
      (_match, content) => {
        return `<h2 className="text-2xl font-bold mt-6">PENSION</h2><p className="mt-5">${content}</p>`;
      }
    );

    // Remove curly brackets from small conditions globally
    updatedHtml = updatedHtml.replace(
      /\{([\s\S]*?)\}/g,
      (_match, content) => content
    );

    // Remove curly brackets with slashes (e.g., {/The Employee may be required to work at other locations./})
    updatedHtml = updatedHtml.replace(
      /\{\/([\s\S]*?)\/\}/g,
      (_match, content) => content
    );

    return updatedHtml;
  };

  // Conditionally process the EmploymentAgreement content
  const documentContent =
    selectedPart === 1
      ? parse(processDocumentTextForPart1(documentText))
      : <EmploymentAgreement />;

  return (
    <div
      className={`w-full min-h-screen font-sans transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
      }`}
    >
      <Navbar
        level={"/Level-Two-Part-Two"}
        questionnaire={"/Questionnaire"}
        live_generation={"/Live_Generation"}
      />

      {/* Label for current level */}
      {selectedPart === 1 && (
        <h1
          className={`text-center mt-24 text-3xl font-bold tracking-wide ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          LEVEL 1: Automate Placeholders
        </h1>
      )}
      {selectedPart === 2 && (
        <h1
          className={`text-center mt-24 text-3xl font-bold tracking-wide ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          LEVEL 2: Automate Small Conditions
        </h1>
      )}
      {selectedPart === 3 && (
        <h1
          className={`text-center mt-24 text-3xl font-bold tracking-wide ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          LEVEL 3: Automate Big Conditions
        </h1>
      )}

      {/* Score display */}
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
                  className={`absolute -left-10 top-full mt-2 px-3 py-1 text-sm text-white rounded-lg shadow-lg whitespace-nowrap animate-fadeIn ${
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
                  : "text-teal-600 bg-teal-100/50"
              }`}
            >
              Total Placeholders: {[...new Set(highlightedTexts)].length}
            </span>
          </div>
        )}
      </div>
      <div className="max-w-5xl mx-auto mt-10 px-8 pb-20" ref={documentRef}>
        <div
          className={`p-6 rounded-3xl shadow-xl border ${
            isDarkMode
              ? "bg-gray-800/80 backdrop-blur-md border-gray-700/20 bg-gradient-to-br from-gray-700/70 via-gray-800/70 to-gray-900/70"
              : "bg-white/80 backdrop-blur-md border-teal-100/20 bg-gradient-to-br from-teal-50/70 via-cyan-50/70 to-indigo-50/70"
          }`}
        >
          {documentContent}
        </div>
        <AIAnalysisPanel
          documentText={getDocumentText()}
          highlightedTexts={highlightedTexts}
          isDarkMode={isDarkMode}
        />
        <CrispChat websiteId="cf9c462c-73de-461e-badf-ab3a1133bdde" />
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
    </div>
  );
};

export default LevelTwoPart_Two;