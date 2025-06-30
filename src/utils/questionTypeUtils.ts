export type QuestionType = "Radio" | "Text" | "Number" | "Date" | "Paragraph" | "Email" | "Unknown";

export const textTypes: { [key: string]: string } = {
  "Employer Name": "What's the name of the employer?",
  "Registered Address": "What's the registered address of the employer?",
  "Employee Name": "What's the name of the employee?",
  "Employee Address": "What's the employee's address?",
  "Previous Employment Start Date": "What's the previous employment start date?",
  "Job Title": "What's the name of the job title?",
  "Reporting Manager": "What's the name of the reporting manager?",
  "Brief Description of Duties": "What's the description of duties?",
  "Workplace Address": "What's the workplace address?",
  "Days of Work": "What's the days of work?",
  "Start Time": "When is the start time?",
  "End Time": "When is the end time?",
  "Payment Frequency": "What's the payment frequency?",
  "Details of Company Sick Pay Policy": "What's the sick pay policy?",
  "HR/Relevant Contact": "What's the name of HR/relevant contact?",
  "Company Handbook/HR": "What's the company handbook?",
  "Authorized Representative": "What's the name of the representative?",
  "Job Title of the authorized representative": "What's the job title of the authorized representative?",
  "Date of signing by Employee": "What's the date of signing by the employee?",
  "other locations": "What are the other work locations?"
};

export const numberTypes: { [key: string]: string } = {
  "Probation Period Length": "What's the probation period length?",
  "Probation Extension Length": "What's the probation extension length?",
  "one week's": "How many weeks?",
  "Overtime Pay Rate": "What's the overtime pay rate?",
  "Annual Salary": "What's the annual salary?",
  "Holiday Entitlement": "What's the holiday entitlement?",
  "Unused Holiday Days": "Specify the number of unused holidays?",
  "Holiday Pay": "Specify the holiday pay?",
  "Notice Period": "What's the notice period?"
};

export const dateTypes: { [key: string]: string } = {
  "Employment Start Date": "What's the employment start date?",
  "Payment Date": "When is the payment date?",
  "Date": "What's the date?",
  "Date of signature": "What's the date of signature?"
};

export const radioTypes: { [key: string]: string } = {
  "(PROBATIONARY PERIOD The first Probation Period Length months of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. Upon successful completion, the Employee will be confirmed in their role.) (Optional Clause)": "Is the clause of probationary period applicable?",
  "The first Probation Period Length of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. Upon successful completion, the Employee will be confirmed in their role.": "Is the clause of probationary period applicable?",
  "The Employee will be enrolled in the Company’s workplace pension scheme in accordance with the Pensions Act 2008. Contributions will be made as required under auto-enrolment legislation.": "Is the Pension clause applicable?",
  'or, if applicable, "on [Previous Employment Start Date] with previous continuous service taken into account"': "Is the previous service applicable?",
  "The Employee may be required to perform additional duties as reasonably assigned by the Company.": "Is the Employee required to perform additional duties as part of their employment?",
  "The Employee may also be entitled to Company sick pay.": "Would the Employee be entitled to Company Sick Pay?",
  "The Employee shall not receive additional payment for overtime worked": "Is the employee entitled to overtime work?",
  "After the probationary period, either party may terminate the employment by providing [Notice Period] written notice. The Company reserves the right to make a payment in lieu of notice. The Company may summarily dismiss the Employee without notice in cases of gross misconduct.": "Is the termination clause applicable?",
  "The Employee is entitled to overtime pay for authorized overtime work": "Is the employee entitled to overtime work?",
  "Upon termination, unused leave will be paid. For [Unused Holiday Days] unused days, the holiday pay is [Holiday Pay] [USD].": "Would unused holidays would be paid for if employee is termination?",
  "The Employee may be required to work at other locations.": "Does the employee need to work at additional locations besides the normal place of work?",
  "The Employee may also be entitled to Company sick pay": "Is the sick pay policy applicable?",
  "The Employee is entitled to overtime pay at a rate of [Overtime Pay Rate] for authorized overtime work": "Does the employee receive overtime payment?"
};

export const validateQuestionRelevance = (placeholder: string, question: string): boolean => {
  const lowerQuestion = question.toLowerCase().trim();

  if (textTypes.hasOwnProperty(placeholder)) {
    if (placeholder === "Employer Name") {
      return (
        lowerQuestion.includes("employer") &&
        (lowerQuestion.includes("name") || lowerQuestion.includes("company"))
      );
    }
    if (placeholder === "Registered Address") {
      return (
        lowerQuestion.includes("address") &&
        (lowerQuestion.includes("employer") || lowerQuestion.includes("company") || lowerQuestion.includes("registered"))
      );
    }
    if (placeholder === "Employee Name") {
      return (
        lowerQuestion.includes("employee") &&
        (lowerQuestion.includes("name") || lowerQuestion.includes("person"))
      );
    }
    if (placeholder === "Employee Address") {
      return (
        lowerQuestion.includes("employee") &&
        lowerQuestion.includes("address")
      );
    }
    return lowerQuestion.includes(placeholder.toLowerCase().replace(/ /g, " ")) || lowerQuestion.includes(placeholder.toLowerCase());
  }

  if (numberTypes.hasOwnProperty(placeholder)) {
    return (
      lowerQuestion.includes("what") &&
      (lowerQuestion.includes("length") || lowerQuestion.includes("weeks") || lowerQuestion.includes("rate") || lowerQuestion.includes("salary") || lowerQuestion.includes("entitlement") || lowerQuestion.includes("days") || lowerQuestion.includes("amount") || lowerQuestion.includes("period"))
    );
  }

  if (dateTypes.hasOwnProperty(placeholder)) {
    return lowerQuestion.includes("what") && lowerQuestion.includes("date");
  }

  if (radioTypes.hasOwnProperty(placeholder)) {
    return (
      lowerQuestion.includes("is") &&
      (lowerQuestion.includes("applicable") || lowerQuestion.includes("apply") || lowerQuestion.includes("receive"))
    );
  }

  return true;
};

export const findKeyByValue = (obj: { [key: string]: string }, value: string): string | undefined => {
  return Object.keys(obj).find(key => obj[key] === value);
};

export const findPlaceholderByValue = (value: string): string | undefined => {
  return (
    findKeyByValue(textTypes, value) ||
    findKeyByValue(numberTypes, value) ||
    findKeyByValue(dateTypes, value) ||
    findKeyByValue(radioTypes, value)
  );
};

export const determineQuestionType = (text: string): { 
  primaryType: QuestionType, 
  primaryValue: string, 
  validTypes: QuestionType[], 
  alternateType?: QuestionType, 
  alternateValue?: string 
} => {
  // console.log("determineQuestionType called with text:", text);
  // console.log("text length:", text.length);

  let primaryType: QuestionType = "Unknown";
  let primaryValue: string = "";
  let validTypes: QuestionType[] = ["Text", "Paragraph", "Email", "Number", "Date", "Radio"];
  let alternateType: QuestionType | undefined;
  let alternateValue: string | undefined;

  const normalizedText = text
    .replace(/[{}[\]]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();

  // console.log("Original text:", text);
  // console.log("Normalized text for comparison:", normalizedText);
  // console.log("Normalized text length:", normalizedText.length);
  // console.log("Radio types keys:", Object.keys(radioTypes));

  const normalizedRadioTypes: { [key: string]: string } = {};
  Object.keys(radioTypes).forEach((key) => {
    const normalizedKey = key
      .replace(/[{}[\]]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\u00A0/g, " ")
      .trim();
    normalizedRadioTypes[normalizedKey] = radioTypes[key];
    // console.log(`Normalized key: "${normalizedKey}", length: ${normalizedKey.length}, value: ${normalizedRadioTypes[normalizedKey]}`);
  });

  // console.log("Normalized radio types keys:", Object.keys(normalizedRadioTypes));

  const radioQuestionMatch = Object.values(normalizedRadioTypes).find(
    (question) => question === normalizedText
  );
  if (radioQuestionMatch) {
    primaryType = "Radio";
    primaryValue = radioQuestionMatch;
    // console.log("Matched radio question:", radioQuestionMatch);
  }

  const fullProbationClause = "The first Probation Period Length of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. Upon successful completion, the Employee will be confirmed in their role.";
  const fullTerminationClause = "After the probationary period, either party may terminate the employment by providing [Notice Period] written notice. The Company reserves the right to make a payment in lieu of notice. The Company may summarily dismiss the Employee without notice in cases of gross misconduct.";
  const fullSickPayClause = "The Employee may also be entitled to Company sick pay of [Details of Company Sick Pay Policy]";
  const fullPensionClause = "The Employee will be enrolled in the Company’s workplace pension scheme in accordance with the Pensions Act 2008. Contributions will be made as required under auto-enrolment legislation.";

  const normalizedFullProbationClause = fullProbationClause.replace(/[{}[\]]/g, "").replace(/\s+/g, " ").replace(/\u00A0/g, " ").trim();
  const normalizedFullTerminationClause = fullTerminationClause.replace(/[{}[\]]/g, "").replace(/\s+/g, " ").replace(/\u00A0/g, " ").trim();
  const normalizedFullSickPayClause = fullSickPayClause.replace(/[{}[\]]/g, "").replace(/\s+/g, " ").replace(/\u00A0/g, " ").trim();
  const normalizedFullPensionClause = fullPensionClause.replace(/[{}[\]]/g, "").replace(/\s+/g, " ").replace(/\u00A0/g, " ").trim();

  // console.log("Checking normalizedText against normalized radio types keys...");
  // console.log("normalizedText:", normalizedText);
  // console.log("normalizedFullPensionClause:", normalizedFullPensionClause);
  // console.log("Match with normalizedFullPensionClause:", normalizedText === normalizedFullPensionClause);
  // console.log("Has normalizedText in normalizedRadioTypes:", normalizedRadioTypes.hasOwnProperty(normalizedText));

  if (
    !radioQuestionMatch &&
    (
      normalizedRadioTypes.hasOwnProperty(normalizedText) ||
      normalizedText === normalizedFullProbationClause ||
      normalizedText === normalizedFullTerminationClause ||
      normalizedText === normalizedFullSickPayClause ||
      normalizedText === normalizedFullPensionClause
    )
  ) {
    primaryType = "Radio";
    primaryValue =
      normalizedRadioTypes[normalizedText] ||
      normalizedRadioTypes[fullProbationClause] ||
      normalizedRadioTypes[fullSickPayClause] ||
      normalizedRadioTypes[fullTerminationClause] ||
      normalizedRadioTypes[fullPensionClause] ||
      "Is the clause applicable?";
    // console.log("Matched radio type with primaryValue:", primaryValue);
  } else {
    // console.log("No match found in normalizedRadioTypes for:", normalizedText);
  }

  if (textTypes.hasOwnProperty(normalizedText)) {
    primaryType = "Text";
    primaryValue = textTypes[normalizedText];
    // console.log("Matched text type with primaryValue:", primaryValue);
  }

  if (numberTypes.hasOwnProperty(normalizedText)) {
    if (primaryType === "Unknown") {
      primaryType = "Number";
      primaryValue = numberTypes[normalizedText];
    } else {
      alternateType = "Number";
      alternateValue = numberTypes[normalizedText];
    }
    // console.log("Matched number type with primaryValue:", primaryValue);
  }

  if (dateTypes.hasOwnProperty(normalizedText)) {
    if (primaryType === "Unknown") {
      primaryType = "Date";
      primaryValue = dateTypes[normalizedText];
    } else {
      alternateType = "Date";
      alternateValue = dateTypes[normalizedText];
    }
    // console.log("Matched date type with primaryValue:", primaryValue);
  }

  if (primaryType === "Unknown" && primaryValue === "") {
    // console.log("No match found, returning Unknown type with all valid types");
    return { primaryType: "Unknown", primaryValue: "", validTypes: ["Text", "Paragraph", "Email", "Number", "Date", "Radio"] };
  }

  return { primaryType, primaryValue, validTypes, alternateType, alternateValue };
};