import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, useLocation } from "react-router";
import Confetti from "react-confetti";
import parse from "html-react-parser";
import { documentText } from "../utils/EmploymentAgreement";
import { findPlaceholderByValue } from "../utils/questionTypeUtils";
import { ThemeContext } from "../context/ThemeContext";

interface UserAnswers {
  [key: string]: string | boolean | null | { amount: string; currency: string };
}

const processAgreement = (html: string, answers: UserAnswers, isDarkMode: boolean) => {
  let updatedHtml = html;

  console.log("Initial html in processAgreement:", html);
  console.log("userAnswers in processAgreement:", answers);

  // Add font-bold class to h2 tags
  updatedHtml = updatedHtml.replace(/<h2 className="([^"]*)"/g, (className) => {
    const classes = className.split(" ");
    if (!classes.includes("font-bold")) {
      classes.push("font-bold");
    }
    return `<h2 className="${classes.join(" ")}"`;
  });

  // Map small conditions (enclosed in curly brackets) to their corresponding questions
  const smallConditionsMap: { [key: string]: string } = {
    "Does the employee need to work at additional locations besides the normal place of work?":
      "{/The Employee may be required to work at other locations./}",
    "Is the previous service applicable?":
      '{or, if applicable, "on Previous Employment Start Date with previous continuous service taken into account"}',
    "Is the Employee required to perform additional duties as part of their employment?":
      "{The Employee may be required to perform additional duties as reasonably assigned by the Company.}",
  };

  // Step 1: Hide both overtime small conditions by default
  const overtimeYesClause = "{The Employee is entitled to overtime pay for authorized overtime work}";
  const overtimeNoClause = "{The Employee shall not receive additional payment for overtime worked}";
  updatedHtml = updatedHtml.replace(
    new RegExp(overtimeYesClause.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
    ""
  );
  updatedHtml = updatedHtml.replace(
    new RegExp(overtimeNoClause.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
    ""
  );

  // Step 2: Handle overtime conditions based on user answer
  const overtimeAnswer = answers["Is the employee entitled to overtime work?"];
  updatedHtml = updatedHtml.replace(
    /<p className="mt-5" id="employment-agreement-working-hours">([\s\S]*?)<\/p>/i,
    (_match, existingContent) => {
      let replacementText = existingContent.trim();
      replacementText = replacementText
        .replace(
          new RegExp(overtimeYesClause.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          ""
        )
        .replace(
          new RegExp(overtimeNoClause.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          ""
        );
      if (overtimeAnswer === true) {
        replacementText = `${replacementText} The Employee is entitled to overtime pay for authorized overtime work.`.trim();
      } else if (overtimeAnswer === false) {
        replacementText = `${replacementText} The Employee shall not receive additional payment for overtime worked.`.trim();
      }
      return `<p className="mt-5" id="employment-agreement-working-hours">${replacementText}</p>`;
    }
  );

  // Step 3: Handle holiday pay small condition
  const holidayPayCondition = "{Upon termination, unused leave will be paid. For Unused Holiday Days unused days, the holiday pay is Holiday Pay USD.}";
  const holidayPayAnswer = answers["Would unused holidays would be paid for if employee is termination?"];
  const escapedHolidayPayCondition = holidayPayCondition.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  if (holidayPayAnswer !== true) {
    updatedHtml = updatedHtml.replace(
      new RegExp(escapedHolidayPayCondition, "gi"),
      ""
    );
  } else {
    let conditionContent = holidayPayCondition
      .replace(/^\{/, "")
      .replace(/\}$/, "");
    
    const unusedHolidayDaysAnswer = answers["Unused Holiday Days"] as string;
    if (unusedHolidayDaysAnswer && typeof unusedHolidayDaysAnswer === "string") {
      const storedOperationType = localStorage.getItem("operationType");
      const storedOperationValue = localStorage.getItem("operationValue");
      const operationValue = storedOperationValue ? parseFloat(storedOperationValue) : null;
      let calculatedValue: number | null = null;
      const floatAnswer = parseFloat(unusedHolidayDaysAnswer).toFixed(2);
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
      localStorage.setItem(
        "calculatedValue",
        calculatedValue !== null ? String(calculatedValue) : "0"
      );

      conditionContent = conditionContent.replace(
        /Unused Holiday Days/gi,
        `<span class="${
          isDarkMode
            ? "bg-teal-600/70 text-teal-100"
            : "bg-teal-200/70 text-teal-900"
        } px-1 rounded">${unusedHolidayDaysAnswer}</span>`
      );
      conditionContent = conditionContent.replace(
        /Holiday Pay/gi,
        `<span class="${
          isDarkMode
            ? "bg-teal-600/70 text-teal-100"
            : "bg-teal-200/70 text-teal-900"
        } px-1 rounded">${calculatedValue !== null ? calculatedValue : "Holiday Pay"}</span>`
      );
    }

    updatedHtml = updatedHtml.replace(
      new RegExp(escapedHolidayPayCondition, "gi"),
      conditionContent
    );
  }

  // Step 4: Handle sick pay small condition
  const sickPayCondition = "{The Employee may also be entitled to Company sick pay.}";
  const sickPayAnswer = answers["Would the Employee be entitled to Company Sick Pay?"];
  const escapedSickPayCondition = sickPayCondition.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  if (sickPayAnswer !== true) {
    updatedHtml = updatedHtml.replace(
      new RegExp(escapedSickPayCondition, "gi"),
      ""
    );
  } else {
    let conditionContent = sickPayCondition
      .replace(/^\{/, "")
      .replace(/\}$/, "");
    
    const sickPayPolicyAnswer = answers["What's the sick pay policy?"] as string;
    if (sickPayPolicyAnswer && typeof sickPayPolicyAnswer === "string") {
      conditionContent = `${conditionContent} <span class="${
        isDarkMode
          ? "bg-teal-600/70 text-teal-100"
          : "bg-teal-200/70 text-teal-900"
      } px-1 rounded">${sickPayPolicyAnswer}</span>`;
    }

    updatedHtml = updatedHtml.replace(
      new RegExp(escapedSickPayCondition, "gi"),
      conditionContent
    );
  }

  // Step 5: Handle other small conditions (enclosed in curly brackets) dynamically
  Object.entries(smallConditionsMap).forEach(([question, smallCondition]) => {
    if (smallCondition === "{The Employee may also be entitled to Company sick pay.}") {
      return;
    }
    const answer = answers[question];
    const escapedCondition = smallCondition.replace(
      /[.*+?^=!:${}()|\[\]\/\\]/g,
      "\\$&"
    );
    if (answer === false || answer === null || answer === undefined) {
      updatedHtml = updatedHtml.replace(
        new RegExp(escapedCondition, "gi"),
        ""
      );
    } else if (answer === true) {
      let conditionContent = smallCondition
        .replace(/^\{\//, "")
        .replace(/\/\}$/, "")
        .replace(/^\{/, "")
        .replace(/\}$/, "");
      updatedHtml = updatedHtml.replace(
        new RegExp(escapedCondition, "gi"),
        conditionContent
      );
    }
  });

  // Step 6: Handle probationary clause
  const probationAnswer = answers["Is the clause of probationary period applicable?"];
  if (probationAnswer !== true) {
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>\(PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\)\s*(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i,
      ""
    );
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i,
      ""
    );
  } else {
    const probationSectionMatch = updatedHtml.match(
      /<h2[^>]*>\(PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\)\s*(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i
    ) || updatedHtml.match(
      /<h2[^>]*>PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i
    );
    if (!probationSectionMatch) {
      const originalSectionMatch = documentText.match(
        /<h2[^>]*>\(PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\)\s*(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i
      ) || documentText.match(
        /<h2[^>]*>PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i
      );
      if (originalSectionMatch) {
        let probationSection = originalSectionMatch[0];
        // Remove brackets from the <h2> tag
        probationSection = probationSection.replace(
          /<h2[^>]*>\(PROBATIONARY PERIOD([^<]*)<\/h2>/i,
          `<h2 className="text-2xl font-bold mt-6">PROBATIONARY PERIOD$1</h2>`
        );
        // Remove closing bracket from the <p> tag content
        probationSection = probationSection.replace(
          /<p[^>]*>([\s\S]*?)\)\s*(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i,
          `<p className="mt-5">$1</p>`
        );
        // Remove (Optional Clause) span
        probationSection = probationSection.replace(
          /<span[^>]*>\(Optional Clause\)<\/span>/i,
          ""
        );
        updatedHtml = updatedHtml.replace(
          /(<h2[^>]*>[^<]*EMPLOYMENT AGREEMENT[^<]*<\/h2>)/i,
          `$1\n${probationSection}`
        );
      }
    } else {
      updatedHtml = updatedHtml.replace(
        /<h2[^>]*>\(PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\)\s*(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i,
        (match) => {
          let updatedSection = match;
          // Remove brackets from the <h2> tag
          updatedSection = updatedSection.replace(
            /<h2[^>]*>\(PROBATIONARY PERIOD([^<]*)<\/h2>/i,
            `<h2 className="text-2xl font-bold mt-6">PROBATIONARY PERIOD$1</h2>`
          );
          // Remove closing bracket from the <p> tag content
          updatedSection = updatedSection.replace(
            /<p[^>]*>([\s\S]*?)\)\s*(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i,
            `<p className="mt-5">$1</p>`
          );
          // Remove (Optional Clause) span
          updatedSection = updatedSection.replace(
            /<span[^>]*>\(Optional Clause\)<\/span>/i,
            ""
          );
          return updatedSection;
        }
      );
      // Fallback in case the brackets were already removed
      updatedHtml = updatedHtml.replace(
        /<h2[^>]*>PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i,
        (match) => {
          let updatedSection = match;
          updatedSection = updatedSection.replace(
            /<span[^>]*>\(Optional Clause\)<\/span>/i,
            ""
          );
          return updatedSection;
        }
      );
    }
  }

  // Step 7: Handle pension clause
  const pensionAnswer = answers["Is the Pension clause applicable?"];
  if (pensionAnswer !== true) {
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>\(PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\)\s*<\/p>/i,
      ""
    );
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\s*<\/p>/i,
      ""
    );
  } else {
    // Check if the pension section exists in updatedHtml
    const pensionSectionMatch = updatedHtml.match(
      /<h2[^>]*>\(PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\)\s*<\/p>/i
    ) || updatedHtml.match(
      /<h2[^>]*>PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\s*<\/p>/i
    );
    if (!pensionSectionMatch) {
      // If the section doesn't exist, get the original section from documentText
      const originalSectionMatch = documentText.match(
        /<h2[^>]*>\(PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\)\s*<\/p>/i
      ) || documentText.match(
        /<h2[^>]*>PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\s*<\/p>/i
      );
      if (originalSectionMatch) {
        let pensionSection = originalSectionMatch[0];
        // Remove opening bracket from the <h2> tag
        pensionSection = pensionSection.replace(
          /<h2[^>]*>\(PENSION([^<]*)<\/h2>/i,
          `<h2 className="text-2xl font-bold  mt-6">PENSION$1</h2>`
        );
        // Remove closing bracket from the <p> tag content
        pensionSection = pensionSection.replace(
          /<p[^>]*>([\s\S]*?)\)\s*<\/p>/i,
          `<p className="mt-5">$1</p>`
        );
        // Insert the updated pension section after the EMPLOYMENT AGREEMENT header
        updatedHtml = updatedHtml.replace(
          /(<h2[^>]*>[^<]*EMPLOYMENT AGREEMENT[^<]*<\/h2>)/i,
          `$1\n${pensionSection}`
        );
      }
    } else {
      // If the section already exists, remove the brackets
      updatedHtml = updatedHtml.replace(
        /<h2[^>]*>\(PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\)\s*<\/p>/i,
        (match) => {
          let updatedSection = match;
          // Remove opening bracket from the <h2> tag
          updatedSection = updatedSection.replace(
            /<h2[^>]*>\(PENSION([^<]*)<\/h2>/i,
            `<h2 className="text-lg mt-5">PENSION$1</h2>`
          );
          // Remove closing bracket from the <p> tag content
          updatedSection = updatedSection.replace(
            /<p[^>]*>([\s\S]*?)\)\s*<\/p>/i,
            `<p className="mt-2">$1</p>`
          );
          return updatedSection;
        }
      );
      // Fallback in case the brackets were already removed
      updatedHtml = updatedHtml.replace(
        /<h2[^>]*>PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\s*<\/p>/i,
        (match) => {
          return match; // No changes needed if brackets are already removed
        }
      );
    }
  }

  // Step 8: Handle additional locations formatting
  const additionalLocationsAnswer =
    answers[
      "Does the employee need to work at additional locations besides the normal place of work?"
    ];
  if (additionalLocationsAnswer === true) {
    const locationsAnswer = answers[
      "What is the additional work location?"
    ] as string;
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
        formattedLocations = `${locationsArray
          .slice(0, -1)
          .join(", ")}, and ${locationsArray[locationsArray.length - 1]}`;
      }
    } else {
      formattedLocations = "other locations";
    }
    updatedHtml = updatedHtml.replace(
      /other locations/gi,
      `<span class="${
        isDarkMode
          ? "bg-teal-600/70 text-teal-100"
          : "bg-teal-200/70 text-teal-900"
      } px-1 rounded">${formattedLocations}</span>`
    );
  }

  // Step 9: Handle all placeholders
  Object.entries(answers).forEach(([question, answer]) => {
    const placeholder = findPlaceholderByValue(question);

    // Skip small conditions, handled questions, and pension clause question
    if (
      smallConditionsMap[question] ||
      question === "Is the employee entitled to overtime work?" ||
      question === "Would unused holidays would be paid for if employee is termination?" ||
      question === "Would the Employee be entitled to Company Sick Pay?" ||
      question === "What's the sick pay policy?" ||
      question === "Is the Pension clause applicable?"
    ) {
      return;
    }

    // Special handling for Job Title
    if (question === "What's the name of the job title?") {
      const jobTitleAnswer =
        typeof answer === "string" && answer.trim() ? answer : "Job Title";
      updatedHtml = updatedHtml.replace(
        /<h2[^>]*>JOB TITLE AND DUTIES<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/,
        (match, p1) => {
          const updatedContent = p1.replace(
            /Job Title/g,
            `<span class="${
              isDarkMode
                ? "bg-teal-600/70 text-teal-100"
                : "bg-teal-200/70 text-teal-900"
            } px-1 rounded">${jobTitleAnswer}</span>`
          );
          return match.replace(p1, updatedContent);
        }
      );
      return;
    }

    // Special handling for Job Title of the Authorized Representative
    if (question === "What's the job title of the authorized representative?") {
      const jobTitle =
        typeof answer === "string" && answer.trim()
          ? answer
          : "Job Title of the authorized representative";
      updatedHtml = updatedHtml.replace(
        /Job Title of the authorized representative/g,
        `<span class="${
          isDarkMode
            ? "bg-teal-600/70 text-teal-100"
            : "bg-teal-200/70 text-teal-900"
        } px-1 rounded">${jobTitle}</span>`
      );
      return;
    }

    // Special handling for Authorized Representative
    if (question === "What's the name of the representative?") {
      const repName =
        typeof answer === "string" && answer.trim()
          ? answer
          : "Authorized Representative";
      updatedHtml = updatedHtml.replace(
        /Authorized Representative/g,
        `<span class="${
          isDarkMode
            ? "bg-teal-600/70 text-teal-100"
            : "bg-teal-200/70 text-teal-900"
        } px-1 rounded">${repName}</span>`
      );
      return;
    }

    if (placeholder === "Unused Holiday Days" && typeof answer === "string") {
      return;
    }

    if (placeholder) {
      const escapedPlaceholder = placeholder.replace(
        /[.*+?^=!:${}()|\[\]\/\\]/g,
        "\\$&"
      );
      if (question === "What's the annual salary?") {
        const salaryData = answer as
          | { amount: string; currency: string }
          | undefined;
        updatedHtml = updatedHtml.replace(
          new RegExp(`${escapedPlaceholder}`, "gi"),
          `<span class="${
            isDarkMode
              ? "bg-teal-600/70 text-teal-100"
              : "bg-teal-200/70 text-teal-900"
          } px-1 rounded">${salaryData?.amount || "Annual Salary"}</span>`
        );
        updatedHtml = updatedHtml.replace(
          new RegExp(`USD`, "gi"),
          `<span class="${
            isDarkMode
              ? "bg-teal-600/70 text-teal-100"
              : "bg-teal-200/70 text-teal-900"
          } px-1 rounded">${salaryData?.currency || "USD"}</span>`
        );
      } else if (question === "What is the governing country?") {
        const countryAnswer =
          typeof answer === "string" && answer.trim() ? answer : "USA";
        updatedHtml = updatedHtml.replace(
          new RegExp(`USA`, "gi"),
          `<span class="${
            isDarkMode
              ? "bg-teal-600/70 text-teal-100"
              : "bg-teal-200/70 text-teal-900"
          } px-1 rounded">${countryAnswer}</span>`
        );
      } else if (placeholder === "Job Title") {
        return;
      } else if (typeof answer === "boolean" || answer === null) {
        if (!answer && placeholder !== "other locations") {
          updatedHtml = updatedHtml.replace(
            new RegExp(`.*${escapedPlaceholder}.*`, "gi"),
            ""
          );
        } else {
          updatedHtml = updatedHtml.replace(
            new RegExp(`${escapedPlaceholder}`, "gi"),
            answer ? "Yes" : "No"
          );
        }
      } else if (
        typeof answer === "string" &&
        answer.trim() &&
        question !== "What is the additional work location?"
      ) {
        updatedHtml = updatedHtml.replace(
          new RegExp(`${escapedPlaceholder}`, "gi"),
          `<span class="${
            isDarkMode
              ? "bg-teal-600/70 text-teal-100"
              : "bg-teal-200/70 text-teal-900"
          } px-1 rounded">${answer}</span>`
        );
      } else if (question !== "What is the additional work location?") {
        updatedHtml = updatedHtml.replace(
          new RegExp(`${escapedPlaceholder}`, "gi"),
          `${placeholder}`
        );
      }
    } else {
      if (question === "Is the termination clause applicable?") {
        if (answer === false) {
          const terminationSection = updatedHtml.match(
            /<h2[^>]*>TERMINATION CLAUSE<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/i
          );
          if (terminationSection) {
            const sectionWithoutClause = terminationSection[0].replace(
              /Either party may terminate the employment by providing.*?in lieu of notice\./,
              ""
            );
            updatedHtml = updatedHtml.replace(
              terminationSection[0],
              sectionWithoutClause
            );
          }
        } else if (
          answer === true &&
          answers["What's the notice period?"]
        ) {
          updatedHtml = updatedHtml.replace(
            /Notice Period/gi,
            `<span class="${
              isDarkMode
                ? "bg-teal-600/70 text-teal-100"
                : "bg-teal-200/70 text-teal-900"
            } px-1 rounded">${
              answers["What's the notice period?"] as string
            }</span>`
          );
        }
      }
    }
  });

  // Special handling for Employer Name
  const employerNameAnswer = answers["Employer Name"] as string;
  if (employerNameAnswer && employerNameAnswer.trim()) {
    updatedHtml = updatedHtml.replace(
      /\[Employer Name\]/gi,
      `<span class="${
        isDarkMode
          ? "bg-teal-600/70 text-teal-100"
          : "bg-teal-200/70 text-teal-900"
      } px-1 rounded">${employerNameAnswer}</span>`
    );
  }

  // Step 10: Handle probation period length placeholder
  const probationLengthAnswer = answers["What's the probation period length?"] as string;
  if (probationAnswer === true && probationLengthAnswer && typeof probationLengthAnswer === "string" && probationLengthAnswer.trim()) {
    updatedHtml = updatedHtml.replace(
      /Probation Period Length/gi,
      `<span class="${
        isDarkMode
          ? "bg-teal-600/70 text-teal-100"
          : "bg-teal-200/70 text-teal-900"
      } px-1 rounded">${probationLengthAnswer}</span>`
    );
  }

  console.log("Final updatedHtml:", updatedHtml);
  return updatedHtml;
};

const Finish = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [confetti, setConfetti] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [finalAgreement, setFinalAgreement] = useState<React.ReactNode>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: document.body.scrollHeight || window.innerHeight,
  });

  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: Math.max(document.body.scrollHeight, window.innerHeight),
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    setConfetti(true);
    const answers: UserAnswers = location.state?.userAnswers || {};
    console.log("userAnswers in Finish useEffect:", answers);
    const updatedText = processAgreement(documentText, answers, isDarkMode);
    setFinalAgreement(parse(updatedText));

    setTimeout(updateDimensions, 100);

    return () => window.removeEventListener("resize", updateDimensions);
  }, [location.state, isDarkMode]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const storedLevel = sessionStorage.getItem("level") ?? "none";
  return (
    <div
      className={`min-h-screen overflow-hidden flex flex-col font-sans relative transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
      }`}
    >
      {confetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={true}
          numberOfPieces={200}
          gravity={0.1}
          initialVelocityY={5}
          tweenDuration={6000}
          run={true}
          colors={["#5EEAD4", "#A78BFA", "#F9A8D4", "#FBBF24", "#60A5FA"]}
        />
      )}
      <Navbar
        level={storedLevel}
        questionnaire="/Questionnaire"
        live_generation="/Live_Generation"
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
            EMPLOYMENT AGREEMENT
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
          onClick={handleBackClick}
        >
          Back
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
          onClick={handleHomeClick}
        >
          Home
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
          onClick={handleDashboardClick}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Finish;


// latest code