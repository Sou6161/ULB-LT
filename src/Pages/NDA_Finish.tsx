import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, useLocation } from "react-router";
import Confetti from "react-confetti";
import parse from "html-react-parser";
import { documentText } from "../utils/NDA_Agreement";
import { findNDAPlaceholderByValue } from "../utils/NDA_questionTypeUtils";
import { ThemeContext } from "../context/ThemeContext";



const NDA_Finish = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [confetti] = useState(true);
  const [, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [finalAgreement, setFinalAgreement] = useState<ReturnType<typeof parse> | null>(null);
  const storedLevel = sessionStorage.getItem("level") || "/Level-One-Quiz";

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Debug: log navigation state
    console.log("NDA_Finish location.state:", location.state);
    // If agreement is passed from navigation, use it
    if (location.state && location.state.agreement) {
      setFinalAgreement(parse(location.state.agreement));
    } else {
      // fallback: re-process as before
      const savedAnswers = sessionStorage.getItem("ndaUserAnswers");
      if (savedAnswers) {
        try {
          const parsedAnswers = JSON.parse(savedAnswers);
          let processedHtml = documentText;

          // Handle NDA-specific placeholders
          Object.entries(parsedAnswers).forEach(([question, answer]) => {
            const placeholder = findNDAPlaceholderByValue(question);
            if (placeholder) {
              const escapedPlaceholder = placeholder.replace(/[.*+?^=!:${}()|[\]\/\\]/g, "\\$&");
              if (typeof answer === "string" && answer.trim()) {
                // Handle placeholders that already contain brackets (like "201[ ]")
                if (placeholder.includes("[") && placeholder.includes("]")) {
                  // For placeholders with brackets, replace the entire placeholder
                  processedHtml = processedHtml.replace(
                    new RegExp(escapedPlaceholder, "gi"),
                    `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${answer}</span>`
                  );
                } else {
                  // For regular placeholders, add brackets around them
                  processedHtml = processedHtml.replace(
                    new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
                    `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${answer}</span>`
                  );
                }
              } else if (typeof answer === "boolean") {
                // Handle placeholders that already contain brackets (like "201[ ]")
                if (placeholder.includes("[") && placeholder.includes("]")) {
                  // For placeholders with brackets, replace the entire placeholder
                  processedHtml = processedHtml.replace(
                    new RegExp(escapedPlaceholder, "gi"),
                    answer ? "Yes" : "No"
                  );
                } else {
                  // For regular placeholders, add brackets around them
                  processedHtml = processedHtml.replace(
                    new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
                    answer ? "Yes" : "No"
                  );
                }
              }
            }
          });

          // Copy the small condition logic from NDA_Live_Generation
          const smallConditionQuestion = "Can the Recipient disclose the Confidential Information to employees or advisers?";
          const userSmallConditionAnswer = parsedAnswers[smallConditionQuestion];
          processedHtml = processedHtml.replace(
            /\{except to its employees and professional advisers who need to know the same for the Purpose, who know they owe a duty of confidence to the Discloser and who are bound by obligations equivalent to those in this clause 2 above and this clause 3\}/g,
            userSmallConditionAnswer === true
              ? '{except to its employees and professional advisers who need to know the same for the Purpose, who know they owe a duty of confidence to the Discloser and who are bound by obligations equivalent to those in this clause 2 above and this clause 3}'
              : ""
          );

          // Handle duration of obligations section visibility based on "Should the confidentiality obligations apply?" answer
          const indefinitelyQuestion = "Should the confidentiality obligations apply?";
          const followupIndefinite = parsedAnswers["Should they apply indefinitely?"];
          const yearsValue = parsedAnswers["How many years should the obligations last?"];
          const userIndefinitelyAnswer = parsedAnswers[indefinitelyQuestion];
          if (userIndefinitelyAnswer === true) {
            // Show the duration section, but update the clause based on follow-up
            if (followupIndefinite === true) {
              // Insert "indefinitely"
              processedHtml = processedHtml.replace(
                /\(\[Indefinitely\] \[for \[Insert number\] years from the date of this Agreement\]\)\./g,
                "(indefinitely)."
              );
            } else if (followupIndefinite === false && yearsValue) {
              // Insert number of years
              processedHtml = processedHtml.replace(
                /\(\[Indefinitely\] \[for \[Insert number\] years from the date of this Agreement\]\)\./g,
                `(for ${yearsValue} years from the date of this Agreement).`
              );
            }
          } else {
            // Remove the entire duration of obligations section
            processedHtml = processedHtml.replace(
              /<div>\s*<h2 className="text-2xl font-bold mt-6">\(DURATION OF OBLIGATIONS<\/h2>\s*<p>\s*The undertakings above will continue in force \(\[Indefinitely\] \[for \[Insert number\] years from the date of this Agreement\]\)\.\)\s*<\/p>\s*<\/div>/g,
              ""
            );
          }

          setFinalAgreement(parse(processedHtml));
        } catch (error) {
          console.error("Error processing NDA agreement:", error);
        }
      }
    }
  }, [isDarkMode, location.state]);

  return (
    <>
      {confetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={true}
            numberOfPieces={150}
            gravity={0.1}
            initialVelocityY={5}
            tweenDuration={6000}
            run={true}
            colors={["#5EEAD4", "#A78BFA", "#F9A8D4", "#FBBF24", "#60A5FA"]}
          />
        </div>
      )}
      <div
        className={`min-h-screen overflow-hidden flex flex-col font-sans relative transition-all duration-500 ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
            : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
        }`}
      >
        <Navbar
          level={storedLevel}
          questionnaire="/NDA_Questionnaire"
          live_generation="/NDA_Live_Generation"
          {...(storedLevel === "/Level-Three-Quiz"
            ? { calculations: "/Calculations" }
            : {})}
        />
        <div className="flex justify-center mt-20 mb-12">
          <div
            className={`rounded-xl shadow-xl border p-12 w-4/5 max-w-5xl ${
              isDarkMode
                ? "bg-gray-800/90 backdrop-blur-sm border-gray-700/20"
                : "bg-white/90 backdrop-blur-sm border-teal-100/20"
            }`}
          >
            <h1
              className={`text-4xl font-bold mb-12 tracking-wide text-center border-b-2 pb-4 ${
                isDarkMode
                  ? "text-teal-300 border-teal-600"
                  : "text-teal-700 border-teal-200"
              }`}
            >
              ONE-WAY NON-DISCLOSURE AGREEMENT
            </h1>
            <div
              className={`${
                isDarkMode ? "text-teal-200" : "text-teal-900"
              } leading-relaxed`}
            >
              {finalAgreement}
            </div>
          </div>
        </div>
        <div className="flex justify-center mb-12 space-x-8">
          <button
            className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
              isDarkMode
                ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
                : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
            }`}
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
              isDarkMode
                ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
                : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
            }`}
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
              isDarkMode
                ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
                : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
            }`}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </>
  );
};

export default NDA_Finish;