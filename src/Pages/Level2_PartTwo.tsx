import { FaPenToSquare } from "react-icons/fa6";
import { TbSettingsMinus, TbSettingsPlus } from "react-icons/tb";
import { useState, useContext, useRef, useEffect, JSX } from "react";
import Navbar from "../components/Navbar";
import { useHighlightedText } from "../context/HighlightedTextContext";
import { useQuestionType } from "../context/QuestionTypeContext";
import EmploymentAgreement from "../utils/EmploymentAgreement";
import { determineQuestionType } from "../utils/questionTypeUtils";
import { ThemeContext } from "../context/ThemeContext";
import AIAnalysisPanel from "../components/AIAnalysisPanel";
import { useLocation, useNavigate } from "react-router";
import { CrispChat } from "../bot/knowledge";
import { useScore } from "../context/ScoreContext";
import Shepherd, { Tour } from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

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
  "The Employee may be required to work at other locations.": "Does the employee need to work at additional locations besides the normal place of work?",
  "The Employee shall not receive additional payment for overtime worked": "Is the employee entitled to overtime pay?",
  "The Employee is entitled to overtime pay for authorized overtime work": "Is the employee entitled to overtime pay?",
};

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

  

  const selectedPart = parseInt(localStorage.getItem("selectedPart") || "0", 10);
  const documentContent = <EmploymentAgreement />;

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
  let tour: Tour; //
  useEffect(() => {

    if (selectedPart === 1) {
      tour = new Shepherd.Tour({
        defaultStepOptions: { cancelIcon: { enabled: true }, classes: "shadow-md bg-purple-dark", scrollTo: { behavior: "smooth", block: "center" } },
        useModalOverlay: true,
      });

      tour.addStep({
        id: "welcome-level-1",
        text: `
          <div class="welcome-message">
            <strong>🚀 Welcome to Level 1: Automate Placeholders!</strong>
            <p>Learn to identify and automate placeholders in employment agreements.</p>
            <p><strong>Your mission:</strong> Find placeholders wrapped in [square brackets] and use the Edit Placeholder button to automate them!</p>
          </div>
        `,
        attachTo: { element: document.body, on: "bottom-start" },
        buttons: [{ text: "Start Learning →", action: tour.next }],
      });
      tour.addStep({
        id: "placeholders-explanation",
        text: "Look for text wrapped in <strong>[square brackets]</strong> like <strong>[Employer Name]</strong>. Select them and click the 'Edit Placeholder' button!",
        attachTo: { element: document.body, on: "bottom-start" },
        buttons: [{ text: "Next →", action: tour.next }],
      });
      tour.addStep({
        id: "edit-placeholder-button",
        text: "This is your <strong>Edit Placeholder</strong> button. Click it after selecting a placeholder!",
        attachTo: { element: "#edit-placeholder", on: "bottom" },
        buttons: [{ text: "Got it!", action: tour.complete }],
      });
    }

    else if (selectedPart === 2) {
      tour = new Shepherd.Tour({
        defaultStepOptions: { cancelIcon: { enabled: true }, classes: "shadow-md bg-purple-dark", scrollTo: { behavior: "smooth", block: "center" } },
        useModalOverlay: true,
      });

      tour.addStep({
        id: "intro-sub-level-2",
        text: `
          <div class="welcome-message">
            <strong>🎉 Welcome to Sub Level 2!</strong>
            <p>You've conquered placeholders—now it's time to master <strong>Small Conditions</strong>.</p>
            <p>Your mission: Automate the overtime pay clause using curly braces <code>{ }</code>. Let's unlock this power!</p>
          </div>
        `,
        attachTo: { element: document.body, on: "left-end" },
        buttons: [{ text: "Let's go!", action: tour.next }],
      });

      tour.addStep({
        id: "identify-small-conditions",
        text: `
          <p>Look at the <strong>JOB TITLE AND DUTIES</strong> section.</p>
          <p>See text wrapped in curly braces like:</p>
          <blockquote>{The Employee may be required to perform additional duties as reasonably assigned by the Company}</blockquote>
          <p>These are <strong>Small Conditions</strong> that dynamically appear or disappear.</p>
        `,
        attachTo: { element: "#job-title-and-duties", on: "top" },
        buttons: [{ text: "Next", action: tour.next }],
      });

      tour.addStep({
        id: "select-create-small-condition",
        text: `
          <p><strong>Action time!</strong> Highlight the entire overtime pay clause wrapped in curly braces.</p>
          <p>Now click the <strong>'Condition'</strong> button to automate it. 🎯</p>
        `,
        attachTo: { element: "#icon-small-condition", on: "bottom" },
        buttons: [{ text: "Done", action: tour.next }],
      });

      tour.addStep({
        id: "navigate-to-questionnaire",
        text: `
          <p>Time to power up this condition!</p>
          <p>Click <strong>'Questionnaire'</strong> in the menu bar to set up when this clause appears.</p>
        `,
        attachTo: { element: ".menu-bar-questionnaire", on: "bottom" },
        buttons: [
          {
            text: "Go now →",
            action: () => {
              tour.complete();
              navigate("/Questionnaire");
            },
          },
        ],
      });

      tour.addStep({
        id: "configure-small-condition-question",
        text: `
          <p>Welcome to the <strong>Small Conditions</strong> section.</p>
          <p>See the default question:</p>
          <blockquote>Is the Employee required to perform additional duties as part of their employment?</blockquote>
          <p>This is a <strong>Yes/No Radio</strong> button that controls whether the clause appears in the document.</p>
          <ul>
            <li>✅ <strong>Yes</strong> → Clause appears</li>
            <li>🚫 <strong>No</strong> → Clause disappears</li>
          </ul>
        `,
        attachTo: { element: ".questionnaire-small-conditions", on: "top" },
        buttons: [{ text: "Next", action: tour.next }],
      });

      tour.addStep({
        id: "test-small-condition",
        text: `
          <p>Go to the <strong>'Live Preview'</strong> tab. Select <strong>Yes</strong> to see the clause appear. Select <strong>No</strong> and watch it vanish!</p>
          <p>🎉 You've created dynamic content that adapts to user choices!</p>
        `,
        attachTo: { element: ".live-preview-section", on: "top" },
        buttons: [{ text: "Finish Tour", action: tour.complete }],
      });
    }

    else if (selectedPart === 3) {
      tour = new Shepherd.Tour({
        defaultStepOptions: { cancelIcon: { enabled: true }, classes: "shadow-md bg-purple-dark", scrollTo: { behavior: "smooth", block: "center" }},
        useModalOverlay: true,
      });
    
      tour.addStep({
        id: "intro-sub-level-3",
        text: `
          <div class="welcome-message">
            <strong>🎯 Welcome to Sub Level 3!</strong>
            <p>Excellent work conquering Small Conditions. Now it's time to master <strong>Big Conditions</strong>—the powerhouse of automation!</p>
            <p>Your mission: Automate the probationary period clause using round brackets <code>( )</code>. Ready to unlock advanced logic?</p>
          </div>
        `,
        attachTo: { element: document.body, on: "left-end" },
        buttons: [{ text: "Let's go!", action: tour.next }],
      });
    
      tour.addStep({
        id: "identify-big-conditions",
        text: `
          <p>Look at the <strong>PROBATIONARY PERIOD</strong> section near the top.</p>
          <p>See the paragraph wrapped in round brackets like:</p>
          <blockquote>(The first [Probation Period Length] months of employment...)</blockquote>
          <p>These are <strong>Big Conditions</strong> that can include or exclude entire clauses, making your document truly adaptive.</p>
        `,
        attachTo: { element: "#probationary-period-clause", on: "top" },
        buttons: [{ text: "Next", action: tour.next }],
      });
    
      tour.addStep({
        id: "select-create-big-condition",
        text: `
          <p><strong>Action time!</strong> Highlight the entire probationary period clause wrapped in round brackets.</p>
          <p>Then click the <strong>'Big Condition'</strong> button to automate it. Outstanding!</p>
        `,
        attachTo: { element: "#icon-big-condition", on: "bottom" },
        buttons: [{ text: "Done", action: tour.next }],
      });
    
      tour.addStep({
        id: "navigate-to-questionnaire-big",
        text: `
          <p>Time to bring this Big Condition to life!</p>
          <p>Click <strong>'Questionnaire'</strong> in the menu bar. This is where you'll create the controlling <strong>Yes/No</strong> question.</p>
        `,
        attachTo: { element: ".menu-bar-questionnaire", on: "bottom" },
        buttons: [
          {
            text: "Go now →",
            action: () => {
              tour.complete();
              navigate("/Questionnaire");
            },
          },
        ],
      });
    
      tour.addStep({
        id: "configure-big-condition-question",
        text: `
          <p>Welcome to the <strong>Big Conditions</strong> section in the Questionnaire.</p>
          <p>See the default question:</p>
          <blockquote>Should a probationary period apply to this employment contract?</blockquote>
          <ul>
            <li>✅ <strong>Yes</strong> → The entire probationary clause (and its placeholders) appear.</li>
            <li>🚫 <strong>No</strong> → The section disappears, streamlining the contract.</li>
          </ul>
          <p>By default, big conditions stay hidden unless selected. Notice how this also reveals additional placeholders when 'Yes' is chosen!</p>
        `,
        attachTo: { element: ".questionnaire-big-conditions", on: "top" },
        buttons: [{ text: "Next", action: tour.next }],
      });
    
      tour.addStep({
        id: "test-big-condition",
        text: `
          <p>Let's see it in action!</p>
          <p>Switch to the <strong>'Live Preview'</strong> tab. Select <strong>Yes</strong> and watch the probationary section appear along with [Probation Period Length].</p>
          <p>Select <strong>No</strong> and see it vanish. 🎉 You've mastered advanced conditional document structures!</p>
        `,
        attachTo: { element: ".live-preview-section", on: "top" },
        buttons: [{ text: "Finish Tour", action: tour.complete }],
      });
    }
    

    // Universal scoring step
    if (tour) {

      tour.start();
    }

    return () => {
      if (tour) tour.complete();
    };
  }, [selectedPart, navigate]);


  // Add tour styles
  useEffect(() => {
    const tourStyles = `
      .welcome-message {
        padding: 1rem;
      }
      .welcome-title {
        display: block;
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
        color: #2563eb;
      }
      .welcome-text {
        margin-bottom: 0.5rem;
        color: #374151;
      }
      .mission-text {
        color: #059669;
        font-size: 0.95rem;
      }
      .shepherd-theme-custom {
        max-width: 400px;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = tourStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
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
      // For small conditions, remove curly braces and slashes
      textWithoutBrackets = selectedText
        .slice(1, -1) // Remove { and }
        .replace(/^\/|\/$/g, ""); // Remove leading and trailing slashes
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
        // Always add the follow-up placeholder when the probationary clause is added
        if (
          clauseContent.toLowerCase().includes("probation period length") &&
          !highlightedTexts.includes("Probation Period Length")
        ) {
          addHighlightedText("Probation Period Length");
          console.log("Added follow-up question: Probation Period Length");
        }
      }

      const probationClause =
        "The first Probation Period Length of employment will be a probationary period. The Company shall assess the Employee's performance and suitability during this time. Upon successful completion, the Employee will be confirmed in their role.";
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
      className={`w-full min-h-screen font-sans transition-all duration-500 ${isDarkMode
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
            className={`text-3xl font-bold tracking-wide ${isDarkMode ? "text-white" : "text-gray-700"
              }`}
          >
            LEVEL 1: Automate Placeholders
          </h1>
        )}
        {selectedPart === 2 && (
          <h1
            className={`text-3xl font-bold tracking-wide ${isDarkMode ? "text-white" : "text-gray-700"
              }`}
          >
            LEVEL 2: Automate Small Conditions
          </h1>
        )}
        {selectedPart === 3 && (
          <h1
            className={`text-3xl font-bold tracking-wide ${isDarkMode ? "text-white" : "text-gray-700"
              }`}
          >
            LEVEL 3: Automate Big Conditions
          </h1>
        )}
      </div>
      <div className="fixed top-16 left-6 z-50 px-6 py-3">
        <div
          className={`p-3 rounded-full shadow-lg flex items-center ${isDarkMode ? "bg-gray-700 text-white" : "bg-teal-500 text-white"
            }`}
        >
          <span className="font-bold mr-2">Score:</span> {totalScore}
          {scoreChange !== null && (
            <span
              className={`ml-2 text-sm font-bold ${scoreChange > 0 ? "text-green-400" : "text-red-400"
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
                className={`p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 ease-in-out flex items-center justify-center text-2xl ${isDarkMode
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
                  className={`absolute -left top-full mt-2 px-3 py-1 text-sm font-medium text-white rounded-lg shadow-lg whitespace-nowrap ${isDarkMode
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
        className={`max-w-5xl mx-auto p-8 rounded-3xl shadow-2xl border mt-24 transform transition-all duration-500 hover:shadow-3xl ${isDarkMode
          ? "bg-gray-800/90 backdrop-blur-lg border-gray-700/50"
          : "bg-white/90 backdrop-blur-lg border-teal-100/30"
          }`}
      >
        <h2
          className={`text-2xl font-semibold mb-6 tracking-wide ${isDarkMode ? "text-teal-300" : "text-teal-700"
            }`}
        >
          ☑️ Selected Placeholders
        </h2>
        {highlightedTexts.length > 0 ? (
          <ul
            className={`space-y-3 p-5 rounded-xl shadow-inner ${isDarkMode
              ? "bg-gradient-to-r from-gray-700/70 via-gray-800/70 to-gray-900/70"
              : "bg-gradient-to-r from-teal-50/70 via-cyan-50/70 to-indigo-50/70"
              }`}
          >
            {[...new Set(highlightedTexts)].map((text, index) => {
              const { primaryValue } = determineQuestionType(text);
              // Fallback to explicit mapping if determineQuestionType doesn't provide a primaryValue
              const displayText = primaryValue || smallConditionToQuestionMap[text] || text;
              const questionType = selectedTypes[index] || "Text";
              return (
                <li key={index} className="flex items-center justify-between">
                  <div>
                    <span
                      className={`text-sm font-medium truncate max-w-xs ${isDarkMode ? "text-teal-200" : "text-teal-900"
                        }`}
                    >
                      {displayText}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${isDarkMode
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
            className={`text-center py-8 rounded-xl shadow-inner ${isDarkMode
              ? "bg-gradient-to-r from-gray-700/70 via-gray-800/70 to-gray-900/70"
              : "bg-gradient-to-r from-teal-50/70 via-cyan-50/70 to-indigo-50/70"
              }`}
          >
            <p
              className={`italic text-lg ${isDarkMode ? "text-teal-400" : "text-teal-600"
                }`}
            >
              No placeholders selected yet
            </p>
          </div>
        )}
        {highlightedTexts.length > 0 && (
          <div className="mt-5 text-right">
            <span
              className={`text-sm px-3 py-1 rounded-full ${isDarkMode
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
          className={`p-6 rounded-xl shadow-xl border ${isDarkMode
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
            className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200 ${isDarkMode
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