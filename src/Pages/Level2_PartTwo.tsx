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
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

// Define icon type for clarity
interface Icon {
  icon: JSX.Element;
  label: string;
}

// Interface for highlighted element state
interface HighlightedElement {
  text: string;
  type: "placeholder" | "smallCondition" | "bigCondition";
  bgColor: string;
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
  "The Employee may be required to perform additional duties as reasonably assigned by the Company": "Is the Employee required to perform additional duties as part of their employment?", 
};

const LevelTwoPart_Two = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  const [tooltip, setTooltip] = useState<string | null>(null);
  const { highlightedTexts, addHighlightedText } = useHighlightedText();
  const { selectedTypes, setSelectedTypes } = useQuestionType();
  const documentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isProcessingRef = useRef<boolean>(false);
  const { totalScore, levelTwoScore, setLevelTwoScore } = useScore();
  const [score, setScore] = useState<number>(levelTwoScore);
  const [scoreChange, setScoreChange] = useState<number | null>(null);
  const [foundPlaceholders, setFoundPlaceholders] = useState<string[]>([]);
  const [foundSmallConditions, setFoundSmallConditions] = useState<string[]>([]);
  const [foundBigConditions, setFoundBigConditions] = useState<string[]>([]);
  const [highlightedElements, setHighlightedElements] = useState<HighlightedElement[]>([]);

  // Function to find and spotlight specific text in the document
  const spotlightTextInDocument = (searchText: string) => {
    if (!documentRef.current) return null;

    const walker = document.createTreeWalker(
      documentRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    let targetElement: HTMLElement | null = null;

    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.includes(searchText)) {
        targetElement = node.parentElement;
        break;
      }
    }

    if (targetElement) {
      // Add spotlight effect
      targetElement.style.position = 'relative';
      targetElement.style.zIndex = '9999';
      targetElement.style.backgroundColor = isDarkMode ? 'rgba(255, 245, 157, 0.3)' : 'rgba(255, 245, 157, 0.5)';
      targetElement.style.boxShadow = '0 0 20px rgba(255, 245, 157, 0.8)';
      targetElement.style.borderRadius = '8px';
      targetElement.style.padding = '8px';
      targetElement.style.transition = 'all 0.3s ease-in-out';
      
      // Create pulsing animation
      const pulseAnimation = targetElement.animate([
        { boxShadow: '0 0 20px rgba(255, 245, 157, 0.8)' },
        { boxShadow: '0 0 30px rgba(255, 245, 157, 1)' },
        { boxShadow: '0 0 20px rgba(255, 245, 157, 0.8)' }
      ], {
        duration: 2000,
        iterations: Infinity
      });

      // Store animation reference for cleanup
      (targetElement as any)._pulseAnimation = pulseAnimation;
      
      // Scroll into view
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      return targetElement;
    }

    return null;
  };

  // Function to remove spotlight highlighting
  const removeSpotlightHighlight = (element: HTMLElement | null) => {
    if (element) {
      element.style.backgroundColor = '';
      element.style.boxShadow = '';
      element.style.zIndex = '';
      element.style.borderRadius = '';
      element.style.padding = '';
      
      // Stop pulsing animation
      if ((element as any)._pulseAnimation) {
        (element as any)._pulseAnimation.cancel();
        delete (element as any)._pulseAnimation;
      }
    }
  };

  let currentSpotlightElement: HTMLElement | null = null;

  // Restore highlighted elements
  useEffect(() => {
    const savedHighlights = sessionStorage.getItem("highlightedElements");
    if (savedHighlights && documentRef.current) {
      try {
        const restoredElements: HighlightedElement[] = JSON.parse(savedHighlights);
        setHighlightedElements(restoredElements);
        restoredElements.forEach(({ text, type, bgColor }) => {
          if (type === "placeholder" && !foundPlaceholders.includes(text)) {
            setFoundPlaceholders((prev) => [...prev, text]);
            addHighlightedText(text);
          } else if (type === "smallCondition" && !foundSmallConditions.includes(text)) {
            setFoundSmallConditions((prev) => [...prev, text]);
            addHighlightedText(text);
          } else if (type === "bigCondition" && !foundBigConditions.includes(text)) {
            setFoundBigConditions((prev) => [...prev, text]);
            addHighlightedText(text);
          }
          highlightTextInDOM(text, bgColor, type);
        });
      } catch (error) {
        console.error("Error restoring highlighted elements:", error);
      }
    }
  }, []);

  // Save highlighted element to sessionStorage
  const saveHighlightedElement = (text: string, type: "placeholder" | "smallCondition" | "bigCondition", bgColor: string) => {
    const savedHighlights = sessionStorage.getItem("highlightedElements");
    let highlightedElements: HighlightedElement[] = savedHighlights ? JSON.parse(savedHighlights) : [];
    highlightedElements = highlightedElements.filter((el) => el.text !== text);
    const newElement: HighlightedElement = { text, type, bgColor };
    highlightedElements.push(newElement);
    sessionStorage.setItem("highlightedElements", JSON.stringify(highlightedElements));
    setHighlightedElements(highlightedElements);
    console.log("Saved highlighted element:", newElement);
  };

  const highlightTextInDOM = (text: string, bgColor: string, type: "placeholder" | "smallCondition" | "bigCondition") => {
    if (documentRef.current) {
      const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedText})`, "gi");
      const walker = document.createTreeWalker(documentRef.current, NodeFilter.SHOW_TEXT, null);
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
              const span = document.createElement("span");
              span.style.backgroundColor = bgColor;
              span.textContent = part;
              span.id = `${type}-highlight-${index}`;
              fragment.appendChild(span);
            } else {
              fragment.appendChild(document.createTextNode(part));
            }
          });
          parent.replaceChild(fragment, textNode);
        }
      });
    }
  };

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
    updatedHtml = updatedHtml.replace(/\{\/([\s\S]*?)\/\}/g, (_match, content) => content);
    return updatedHtml;
  };

  const selectedPart = parseInt(localStorage.getItem("selectedPart") || "0", 10);
  const documentContent =
    selectedPart === 1
      ? parse(processDocumentTextForPart1(documentText))
      : <EmploymentAgreement />;

  // Initialize selectedTypes if not already set
  useEffect(() => {
    const savedTypes = sessionStorage.getItem("selectedQuestionTypes_2");
    if (!savedTypes && highlightedTexts.length > 0) {
      const initialTypes = highlightedTexts.map(() => "Text");
      setSelectedTypes(initialTypes);
      sessionStorage.setItem("selectedQuestionTypes_2", JSON.stringify(initialTypes));
    }
  }, [highlightedTexts, setSelectedTypes]);

  // Load saved state from sessionStorage
  useEffect(() => {
    const savedState = sessionStorage.getItem("levelTwoPartTwoState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (JSON.stringify(parsedState.highlightedTexts || []) !== JSON.stringify(highlightedTexts)) {
          addHighlightedText(parsedState.highlightedTexts || []);
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

  // Save state to sessionStorage
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
      setScore(levelTwoScore);
    }
  }, [levelTwoScore]);

  useEffect(() => {
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

  // Product Tour: Sub Level 2 (Automating Small Conditions)
  useEffect(() => {
    if (selectedPart !== 2) return;

    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: "shadow-md bg-purple-dark",
        scrollTo: { behavior: "smooth", block: "center" },
      },
      useModalOverlay: true,
      confirmCancel: false,
      tourName: `level-two-part-two-sublevel2-${Date.now()}`,
    });

    tour.addStep({
      id: "introduction",
      text: `
        <div class="welcome-message">
          <strong class="welcome-title">🚀 Welcome to Sub Level 2, automation champion!</strong>
          <p class="welcome-text">You've conquered placeholders in Sub Level 1—now it's time to master Small Conditions. These are conditional clauses that appear or disappear based on user choices.</p>
          <p class="mission-text"><strong>Your mission:</strong> Automate the clause using curly braces { }. Let's unlock this power!</p>
        </div>
      `,
      attachTo: { element: document.body, on: "bottom-start" },
      classes: "shepherd-theme-custom animate__animated animate__fadeIn",
      buttons: [{ text: "Start Tour →", action: tour.next }],
    });

    tour.addStep({
      id: "identify-small-conditions",
      text: `
        Look at the <strong>JOB TITLE AND DUTIES</strong> section. See that text wrapped in curly braces like <strong>{The Employee may be required to perform additional duties as reasonably assigned by the Company}</strong>. 
        Curly brackets mark Small Conditions—text that only appears when certain criteria are met. Small conditions are your tool for creating dynamic, personalized documents!
      `,
      attachTo: { element: document.body, on: "center" },
      beforeShowPromise: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            // Spotlight the specific clause
            currentSpotlightElement = spotlightTextInDocument("{The Employee may be required to perform additional duties as reasonably assigned by the Company}");
            resolve();
          }, 500);
        });
      },
      buttons: [{ text: "Next →", action: tour.next }],
    });

    tour.addStep({
      id: "select-small-condition",
      text: "Click and highlight the entire clause wrapped in curly braces: <strong>{The Employee may be required to perform additional duties as reasonably assigned by the Company}</strong>. Notice how the entire conditional text gets selected? Then click the <strong>Verify Selection</strong> button to proceed.",
      attachTo: { element: document.body, on: "center" },
      buttons: [
        {
          text: "Verify Selection ✅",
          action: function () {
            const selection = window.getSelection();
            const selectedText = selection ? selection.toString().trim() : "";
            const targetText = "{The Employee may be required to perform additional duties as reasonably assigned by the Company}";

            if (selectedText === targetText) {
              // Remove spotlight highlighting
              removeSpotlightHighlight(currentSpotlightElement);
              currentSpotlightElement = null;
              tour.next();
            } else {
              alert("⚠️ Please select the entire clause exactly as shown: {The Employee may be required to perform additional duties as reasonably assigned by the Company}, including the curly braces.");
            }
          },
        },
      ],
    });

    tour.addStep({
      id: "click-small-condition-button",
      text: "Now click the <strong>Small Condition</strong> button. Congratulations! You've identified your first small condition.",
      attachTo: { element: "#icon-small-condition", on: "bottom" },
      buttons: [{ text: "Next →", action: tour.next }],
    });

    tour.addStep({
      id: "navigate-questionnaire",
      text: `
        Time to power up this condition! Head to the <strong>Questionnaire</strong> page by clicking <strong>Questionnaire</strong> in the menu bar. 
        This is where you'll create the yes/no question by choosing the 'Radio button' that controls when this clause appears in the final document.
      `,
      attachTo: { element: "#Questionnaire-button", on: "right" },
      buttons: [
        {
          text: "Go to Questionnaire →",
          action: function () {
            navigate('/Questionnaire');
            tour.complete();
          }
        }
      ],
    });

    tour.addStep({
      id: "configure-question",
      text: `
        Perfect! You're now in the Small Conditions section of the questionnaire. See the default question: <strong>'Is the Employee required to perform additional duties as part of their employment?'</strong> 
        This is a Radio button question with Yes/No options. Here's the magic:
        <ul>
          <li>If user selects <strong>YES</strong> → The clause appears in the document</li>
          <li>If user selects <strong>NO</strong> → The clause disappears entirely</li>
        </ul>
        By DEFAULT, the condition would remain hidden unless selected to be displayed. Feel free to customize this question text to make it clearer for your users!
      `,
      attachTo: { element: document.body, on: "center" },
      buttons: [{ text: "Next →", action: tour.next }],
    });

    tour.addStep({
      id: "test-condition",
      text: `
        Let's see your small condition in action! Switch to the <strong>Live Preview</strong> tab. 
        Try selecting <strong>Yes</strong> for the 'Is the Employee required to perform additional duties as part of their employment?' question—watch the clause appear in the right hand side of the document! 
        Now select <strong>No</strong>—see how it vanishes? You've just created dynamic document content that adapts to user needs!
      `,
      attachTo: { element: "#live_generation-button", on: "right" },
      buttons: [
        {
          text: "Go to Live Preview →",
          action: function () {
            navigate('/Live_Generation');
            tour.complete();
          }
        }
      ],
    });

    tour.start();
    window.history.replaceState({}, document.title, location.pathname);

    return () => {
      tour.complete();
      // Clean up spotlight
      removeSpotlightHighlight(currentSpotlightElement);
      currentSpotlightElement = null;
    };
  }, [selectedPart, navigate, isDarkMode]);

  // Product Tour: Sub Level 3 (Automating Big Conditions)
  useEffect(() => {
    if (selectedPart !== 3) return;

    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: "shadow-md bg-purple-dark",
        scrollTo: { behavior: "smooth", block: "center" },
      },
      useModalOverlay: true,
      confirmCancel: false,
      tourName: `level-two-part-two-sublevel3-${Date.now()}`,
    });

    tour.addStep({
      id: "introduction",
      text: `
        <div class="welcome-message">
          <strong class="welcome-title">🎉 Excellent work conquering Small Conditions!</strong>
          <p class="welcome-text">Welcome to Sub Level 3, where you'll master Big Conditions—the powerhouse of document automation! Big Conditions control entire sections or clauses that can completely transform your document structure.</p>
          <p class="mission-text"><strong>Your mission:</strong> Automate the probationary period clause using round brackets ( ). Ready to unlock advanced conditional logic?</p>
        </div>
      `,
      attachTo: { element: document.body, on: "bottom-start" },
      classes: "shepherd-theme-custom animate__animated animate__fadeIn",
      buttons: [{ text: "Start Tour →", action: tour.next }],
    });

    tour.addStep({
      id: "identify-big-conditions",
      text: `
        Look at the <strong>PROBATIONARY PERIOD</strong> section near the top of your document. See that entire paragraph wrapped in round brackets like <strong>(The first [Probation Period Length] months of employment will be a probationary period...)</strong>? 
        Round brackets mark Big Conditions—substantial sections of text that only appear when specific criteria are met. Big conditions give you the power to include or exclude entire clauses, making your documents truly adaptive!
      `,
      attachTo: { element: document.body, on: "center" },
      beforeShowPromise: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            // Spotlight the probationary period section
            currentSpotlightElement = spotlightTextInDocument("(PROBATIONARY PERIOD");
            resolve();
          }, 500);
        });
      },
      buttons: [{ text: "Next →", action: tour.next }],
    });

    tour.addStep({
      id: "select-big-condition",
      text: "Click and highlight the entire probationary period clause wrapped in round brackets. Notice how this selects a much larger block of text than small conditions? Then click the <strong>Verify Selection</strong> button to proceed.",
      attachTo: { element: document.body, on: "center" },
      buttons: [
        {
          text: "Verify Selection ✅",
          action: function () {
            const selection = window.getSelection();
            const selectedText = selection ? selection.toString().trim() : "";
            
            // Check if the selection contains the probationary period content
            if (selectedText.includes("probationary period") && selectedText.startsWith("(") && selectedText.endsWith(")")) {
              // Remove spotlight highlighting
              removeSpotlightHighlight(currentSpotlightElement);
              currentSpotlightElement = null;
              tour.next();
            } else {
              alert("⚠️ Please select the entire probationary period clause wrapped in round brackets, starting with '(' and ending with ')'.");
            }
          },
        },
      ],
    });

    tour.addStep({
      id: "click-big-condition-button",
      text: "Now click the <strong>Big Condition</strong> button. Outstanding! You've identified your first major conditional section.",
      attachTo: { element: "#icon-big-condition", on: "bottom" },
      buttons: [{ text: "Next →", action: tour.next }],
    });

    tour.addStep({
      id: "navigate-questionnaire",
      text: `
        Time to bring this big condition to life! Head to the <strong>Questionnaire</strong> page by clicking <strong>Questionnaire</strong> in the menu bar. 
        This is where you'll create the controlling question using 'Radio button' options that determines when this entire probationary period section appears in the final document.
      `,
      attachTo: { element: "#Questionnaire-button", on: "right" },
      buttons: [
        {
          text: "Go to Questionnaire →",
          action: function () {
            navigate('/Questionnaire');
            tour.complete();
          }
        }
      ],
    });

    tour.addStep({
      id: "configure-question",
      text: `
        Perfect! You're now in the Big Conditions section of the questionnaire. See the default question: <strong>'Should a probationary period apply to this employment contract?'</strong> 
        This is a Radio button question with Yes/No options. Here's where the real power shows:
        <ul>
          <li>If user selects <strong>YES</strong> → The entire probationary period clause (including all nested placeholders like [Probation Period Length]) appears in the document</li>
          <li>If user selects <strong>NO</strong> → The entire section disappears, creating a cleaner contract without probationary terms</li>
        </ul>
        By DEFAULT, big conditions remain hidden unless explicitly selected to be displayed. Notice how this question controls not just text, but also reveals additional placeholders that users will need to fill when they choose 'Yes'. Feel free to customize this question text for maximum clarity!
      `,
      attachTo: { element: document.body, on: "center" },
      buttons: [{ text: "Next →", action: tour.next }],
    });

    tour.addStep({
      id: "test-condition",
      text: `
        Let's witness your big condition in action! Switch to the <strong>Live Preview</strong> tab. 
        Try selecting <strong>Yes</strong> for the 'Should a probationary period apply to this employment contract?' question—watch the entire probationary section materialize in the document on the right! 
        Notice how it also reveals the [Probation Period Length] placeholder for users to fill. Now select <strong>No</strong>—see how the whole section vanishes, creating a streamlined contract? You've just mastered conditional document architecture that adapts entire contract structures to user needs!
      `,
      attachTo: { element: "#live_generation-button", on: "right" },
      buttons: [
        {
          text: "Go to Live Preview →",
          action: function () {
            navigate('/Live_Generation');
            tour.complete();
          }
        }
      ],
    });

    tour.start();
    window.history.replaceState({}, document.title, location.pathname);

    return () => {
      tour.complete();
      // Clean up spotlight
      removeSpotlightHighlight(currentSpotlightElement);
      currentSpotlightElement = null;
    };
  }, [selectedPart, navigate, isDarkMode]);

  const getDocumentText = () => {
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

    if (selectedText.startsWith("[") && selectedText.endsWith("]")) {
      textWithoutBrackets = selectedText.slice(1, -1);
      hasValidBrackets = true;
      hasValidSpanClass = true;
    } else if (selectedText.startsWith("{") && selectedText.endsWith("}")) {
      textWithoutBrackets = selectedText.slice(1, -1);
      hasValidBrackets = true;
    } else if (selectedText.startsWith("(") && selectedText.endsWith(")")) {
      textWithoutBrackets = selectedText.slice(1, -1);
      hasValidBrackets = true;
    } else {
      const node = selection.anchorNode;
      if (node && node.parentElement) {
        const parent = node.parentElement;
        const classList = Array.from(parent.classList);
        const placeholderClass = classList.find((cls) => cls.startsWith("placeholder-"));
        if (placeholderClass) {
          hasValidSpanClass = true;
          textWithoutBrackets = parent.textContent || selectedText;
        }
      }
    }

    if (
      (label === "Edit PlaceHolder" && !hasValidSpanClass) ||
      (label === "Small Condition" && !(selectedText.startsWith("{") && selectedText.endsWith("}"))) ||
      (label === "Big Condition" && !(selectedText.startsWith("(") && selectedText.endsWith(")")))
    ) {
      console.log("Invalid selection for:", label, selectedText);
      isProcessingRef.current = false;
      return;
    }

    const isCorrectButton =
      (label === "Edit PlaceHolder" && hasValidSpanClass) ||
      (label === "Small Condition" && selectedText.startsWith("{") && selectedText.endsWith("}")) ||
      (label === "Big Condition" && selectedText.startsWith("(") && selectedText.endsWith(")"));

    if (isCorrectButton) {
      if (label === "Edit PlaceHolder" && !foundPlaceholders.includes(textWithoutBrackets)) {
        setScore((prevScore) => {
          const newScore = prevScore + 3;
          setLevelTwoScore(newScore);
          return newScore;
        });
        setScoreChange(3);
        setTimeout(() => setScoreChange(null), 1000);
        setFoundPlaceholders((prev) => [...prev, textWithoutBrackets]);
      } else if (label === "Small Condition" && !foundSmallConditions.includes(textWithoutBrackets)) {
        setScore((prevScore) => {
          const newScore = prevScore + 3;
          setLevelTwoScore(newScore);
          return newScore;
        });
        setScoreChange(3);
        setTimeout(() => setScoreChange(null), 1000);
        setFoundSmallConditions((prev) => [...prev, textWithoutBrackets]);
      } else if (label === "Big Condition" && !foundBigConditions.includes(textWithoutBrackets)) {
        setScore((prevScore) => {
          const newScore = prevScore + 3;
          setLevelTwoScore(newScore);
          return newScore;
        });
        setScoreChange(3);
        setTimeout(() => setScoreChange(null), 1000);
        setFoundBigConditions((prev) => [...prev, textWithoutBrackets]);
      }
    } else {
      setScore((prevScore) => {
        const newScore = Math.max(0, prevScore - 2);
        setLevelTwoScore(newScore);
        return newScore;
      });
      setScoreChange(-2);
      setTimeout(() => setScoreChange(null), 1000);
    }

    if (label === "Edit PlaceHolder") {
      if (highlightedTexts.includes(textWithoutBrackets)) {
        alert("This placeholder has already been added!");
        isProcessingRef.current = false;
        return;
      }
      addHighlightedText(textWithoutBrackets);
      const bgColor = isDarkMode ? "rgba(255, 245, 157, 0.5)" : "rgba(255, 245, 157, 0.7)";
      const span = document.createElement("span");
      span.style.backgroundColor = bgColor;
      span.textContent = selectedText;
      span.className = `placeholder placeholder-${textWithoutBrackets.toLowerCase().replace(/\s+/g, '-')}`;
      range.deleteContents();
      range.insertNode(span);
      saveHighlightedElement(selectedText, "placeholder", bgColor);
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
        const newTypes = [...selectedTypes, "Radio"];
        setSelectedTypes(newTypes);
        sessionStorage.setItem("selectedQuestionTypes_2", JSON.stringify(newTypes));
      }
      const bgColor = isDarkMode ? "rgba(129, 236, 236, 0.5)" : "rgba(129, 236, 236, 0.7)";
      const span = document.createElement("span");
      span.style.backgroundColor = bgColor;
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);
      saveHighlightedElement(selectedText, "smallCondition", bgColor);
    } else if (label === "Big Condition") {
      if (!(selectedText.startsWith("(") && selectedText.endsWith(")"))) {
        console.log("Invalid Big Condition selection:", selectedText);
        isProcessingRef.current = false;
        return;
      }
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
          break;
        }
      }

      if (clauseContent.startsWith("The Employee will be enrolled in the Company's")) {
        clauseContent = "The Employee is enrolled in the Company's workplace pension scheme in accordance with the Pensions Act 2008. Contributions will be made as required under auto-enrolment legislation.";
      }

      if (!highlightedTexts.includes(clauseContent)) {
        addHighlightedText(clauseContent);
      }

      const probationClause = "The first [Probation Period Length] months of employment will be a probationary period. The Company shall assess the Employee's performance and suitability during this time. Upon successful completion, the Employee will be confirmed in their role.";
      if (clauseContent === probationClause && !highlightedTexts.includes("[Probation Period Length]")) {
        addHighlightedText("[Probation Period Length]");
        const newTypes = [...selectedTypes, "Text"];
        setSelectedTypes(newTypes);
        sessionStorage.setItem("selectedQuestionTypes_2", JSON.stringify(newTypes));
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
      saveHighlightedElement(selectedText, "bigCondition", bgColor);
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
              const displayText = primaryValue || smallConditionToQuestionMap[text] || text;
              const questionType = selectedTypes[index] || "Text";
              return (
                <li
                  id={`selected-placeholder${index}`}
                  key={`${text}-${index}`}
                  className={`flex items-center justify-between p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
                    isDarkMode
                      ? "text-teal-200 bg-gray-600/80 hover:bg-gray-500/70"
                      : "text-teal-800 bg-white/80 hover:bg-teal-100/70"
                  }`}
                >
                  <div className="flex items-center">
                    <span
                      className={`mr-3 text-lg ${
                        isDarkMode ? "text-cyan-400" : "text-cyan-500"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="text-sm font-medium truncate max-w-xs">
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
                isDarkMode ? "text-teal-300 bg-gray-600/50" : "text-teal-600 bg-teal-200/50"
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
        <CrispChat websiteId="" />
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
