export type QuestionType = "Radio" | "Text" | "Number" | "Date" | "Paragraph" | "Email" | "Unknown";

// NDA-specific question mappings
export const ndaTextTypes: { [key: string]: string } = {
  "Name of Individual or Company Receiving Information": "What's the name of the recipient?",
  "England": "What's the jurisdiction of registration?",
  "Number on Register of Companies": "What's the company registration number?",
  "Address of Office on the Register of Companies (Recipient)": "What's the registered office address of the recipient company?",
  "Address of Office on the Register of Companies (Discloser)": "What's the registered office address of the discloser company?",
  "Name of Individual or Company Disclosing Information": "What's the name of the discloser?",
  "Discussing the possibility of the Recipient and the Discloser entering into a joint venture": "What's the purpose of the disclosure?",
  "insert details e.g. discussing the possibility of the Recipient and the Discloser entering into a joint venture": "What is the purpose of the disclosure?",
  "Name of Recipient": "What's the name of the recipient?",
  "Name of Witness": "What's the name of the witness?",
  "Address of Witness": "What's the address of the witness?",
  "Name of Director": "What's the name of the director?",
  "Address of Individual": "What's the recipient's address?",
  // Additional specific questions for text fields
  "Name of Company": "What's the name of the company?",
  "Name of Individual": "What's the name of the individual?",
  "Position in Company": "What's the position of the individual in the company?",
  "Business Address": "What's the business address?",
  "Email Address": "What's the email address?",
  "Phone Number": "What's the phone number?",
  "Company Registration Number": "What's the company registration number?",
  "Jurisdiction": "What's the jurisdiction of registration?",
  "Purpose of Disclosure": "What's the specific purpose of the disclosure?",
  "Nature of Business": "What's the nature of the business?",
  "Project Name": "What's the name of the project?",
  "Confidential Information Description": "What's the description of the confidential information?",
  "Authorized Representatives": "Who are the authorized representatives?",
  "Registered Office": "What's the registered office address?",
  "Principal Place of Business": "What's the principal place of business?",
  "Name of Recipient (Individual)": "What's the name of the individual recipient?",
  "Name of Witness (Individual)": "What's the name of the witness for the individual recipient?",
  "Address of Witness (Individual)": "What's the address of the witness for the individual recipient?",
  "Name of Recipient (Company)": "What's the name of the company recipient?",
  "Name of Witness (Company)": "What's the name of the witness for the company recipient?",
  "Address of Witness (Company)": "What's the address of the witness for the company recipient?",
  "Address of Individual (Recipient)": "What's the address of the individual recipient?",
  "Number on Register of Companies (Recipient)": "What's the company registration number for the recipient?",
  "England (Recipient)": "What's the jurisdiction of registration for the recipient?",
  "Address of Individual (Discloser)": "What's the address of the individual discloser?",
  "Number on Register of Companies (Discloser)": "What's the company registration number for the discloser?",
  "England (Discloser)": "What's the jurisdiction of registration for the discloser?"
};

export const ndaNumberTypes: { [key: string]: string } = {
  "Insert number": "How many years do the confidentiality obligations last?",
  // Additional specific questions for number fields
  "Duration in Years": "How many years should the agreement be valid?",
  "Notice Period": "How many days notice is required for termination?",
  "Maximum Penalty Amount": "What's the maximum penalty amount in case of breach?",
  "Number of Copies": "How many copies of the agreement are needed?",
  "Number of Witnesses": "How many witnesses are required?",
  "Number of Directors": "How many directors are involved?",
  "Number of Employees": "How many employees will have access to the information?",
  "Number of Advisers": "How many professional advisers will be involved?",
  "Number of Projects": "How many projects are covered by this agreement?",
  "Number of Territories": "How many territories are covered by this agreement?"
};

export const ndaDateTypes: { [key: string]: string } = {
  '[2010]': "What's the date of the agreement?",
  '2010': "What's the date of the agreement?", // Added for normalized placeholder
  '[YYYY-DD-MM]': "What's the date of the agreement?", // Added for new placeholder format
  // Additional specific questions for date fields
  "Effective Date": "When should the agreement become effective?",
  "Expiration Date": "When should the agreement expire?",
  "Notice Date": "When was the notice given?",
  "Termination Date": "When is the termination date?",
  "Review Date": "When is the next review date?",
  "Disclosure Date": "When was the information first disclosed?",
  "Registration Date": "When was the company registered?",
  "Meeting Date": "When was the meeting held?",
  "Execution Date": "When was the agreement executed?",
  "Renewal Date": "When is the renewal date?"
};

export const ndaRadioTypes: { [key: string]: string } = {
  "except to its employees and professional advisers who need to know the same for the Purpose, who know they owe a duty of confidence to the Discloser and who are bound by obligations equivalent to those in this clause 2 above and this clause 3": "Can the Recipient disclose the Confidential Information to employees or advisers?",
  "[Indefinitely]": "How long do the confidentiality obligations last?",
  "for [Insert number] years from the date of this Agreement": "How long do the confidentiality obligations last?",
  "If the Recipient is an individual:": "Is the Recipient an individual?",
  "If the Recipient is a company:": "Is the Recipient a company?",
  // Additional specific questions for radio fields
  "Is the information already public?": "Is any of the confidential information already in the public domain?",
  "Is the information required by law?": "Is the disclosure required by law or regulation?",
  "Is the information independently developed?": "Was the information independently developed?",
  "Is the information received from a third party?": "Was the information received from a third party?",
  "Is the information subject to prior obligations?": "Is the information subject to any prior confidentiality obligations?",
  "Is the Recipient bound by other agreements?": "Is the Recipient bound by other confidentiality agreements?",
  "Is the information marked as confidential?": "Is the information clearly marked as confidential?",
  "Is the disclosure for a specific purpose?": "Is the disclosure limited to a specific purpose?",
  "Is the Recipient authorized to make copies?": "Is the Recipient authorized to make copies of the information?",
  "Is the Recipient required to return materials?": "Is the Recipient required to return or destroy materials?",
  "Is the agreement binding on successors?": "Is the agreement binding on successors and assigns?",
  "Is the agreement subject to governing law?": "Is the agreement subject to a specific governing law?",
  "Is the agreement subject to jurisdiction?": "Is the agreement subject to a specific jurisdiction?",
  "Is the agreement subject to arbitration?": "Is the agreement subject to arbitration?",
  "Is the agreement subject to injunctive relief?": "Is the agreement subject to injunctive relief?"
};

export const validateNDAQuestionRelevance = (placeholder: string, question: string): boolean => {
  const lowerQuestion = question.toLowerCase().trim();

  if (ndaTextTypes.hasOwnProperty(placeholder)) {
    if (placeholder === "Name of Individual or Company Receiving Information" || placeholder === "Name of Recipient") {
      return (
        lowerQuestion.includes("recipient") &&
        (lowerQuestion.includes("name") || lowerQuestion.includes("company") || lowerQuestion.includes("individual"))
      );
    }
    if (placeholder === "Address of Individual" || placeholder === "Address of Witness") {
      return (
        lowerQuestion.includes("address") &&
        (lowerQuestion.includes("recipient") || lowerQuestion.includes("witness") || lowerQuestion.includes("individual"))
      );
    }
    if (placeholder === "Address of Office on the Register of Companies (Recipient)") {
      return (
        lowerQuestion.includes("address") &&
        (lowerQuestion.includes("registered") || lowerQuestion.includes("office") || lowerQuestion.includes("company")) &&
        lowerQuestion.includes("recipient")
      );
    }
    if (placeholder === "Address of Office on the Register of Companies (Discloser)") {
      return (
        lowerQuestion.includes("address") &&
        (lowerQuestion.includes("registered") || lowerQuestion.includes("office") || lowerQuestion.includes("company")) &&
        lowerQuestion.includes("discloser")
      );
    }
    if (placeholder === "Name of Individual or Company Disclosing Information") {
      return (
        lowerQuestion.includes("discloser") &&
        (lowerQuestion.includes("name") || lowerQuestion.includes("company") || lowerQuestion.includes("individual"))
      );
    }
    return lowerQuestion.includes(placeholder.toLowerCase().replace(/ /g, " ")) || lowerQuestion.includes(placeholder.toLowerCase());
  }

  if (ndaNumberTypes.hasOwnProperty(placeholder)) {
    return (
      lowerQuestion.includes("how") &&
      (lowerQuestion.includes("years") || lowerQuestion.includes("duration") || lowerQuestion.includes("last"))
    );
  }

  if (ndaDateTypes.hasOwnProperty(placeholder)) {
    return lowerQuestion.includes("what") && lowerQuestion.includes("date");
  }

  if (ndaRadioTypes.hasOwnProperty(placeholder)) {
    return (
      lowerQuestion.includes("is") ||
      lowerQuestion.includes("can") ||
      lowerQuestion.includes("how") &&
      (lowerQuestion.includes("applicable") || lowerQuestion.includes("disclose") || lowerQuestion.includes("last"))
    );
  }

  return true;
};

export const findNDAKeyByValue = (obj: { [key: string]: string }, value: string): string | undefined => {
  return Object.keys(obj).find(key => obj[key] === value);
};

export const findNDAPlaceholderByValue = (value: string): string | undefined => {
  return (
    findNDAKeyByValue(ndaTextTypes, value) ||
    findNDAKeyByValue(ndaNumberTypes, value) ||
    findNDAKeyByValue(ndaDateTypes, value) ||
    findNDAKeyByValue(ndaRadioTypes, value)
  );
};

export const determineNDAQuestionType = (text: string): { 
  primaryType: QuestionType, 
  primaryValue: string, 
  validTypes: QuestionType[], 
  alternateType?: QuestionType, 
  alternateValue?: string 
} => {
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

  const normalizedRadioTypes: { [key: string]: string } = {};
  Object.keys(ndaRadioTypes).forEach((key) => {
    const normalizedKey = key
      .replace(/[{}[\]]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\u00A0/g, " ")
      .trim();
    normalizedRadioTypes[normalizedKey] = ndaRadioTypes[key];
  });

  const radioQuestionMatch = Object.values(normalizedRadioTypes).find(
    (question) => question === normalizedText
  );
  if (radioQuestionMatch) {
    primaryType = "Radio";
    primaryValue = radioQuestionMatch;
  } else {
    // Check if the original text matches any radio type questions
    const originalRadioQuestionMatch = Object.values(ndaRadioTypes).find(
      (question) => question === text
    );
    if (originalRadioQuestionMatch) {
      primaryType = "Radio";
      primaryValue = originalRadioQuestionMatch;
    }
  }

  if (ndaTextTypes.hasOwnProperty(normalizedText)) {
    if (primaryType === "Unknown") {
      primaryType = "Text";
      primaryValue = ndaTextTypes[normalizedText];
    } else {
      alternateType = "Text";
      alternateValue = ndaTextTypes[normalizedText];
    }
  } else if (ndaTextTypes.hasOwnProperty(text)) {
    // Check the original text (with brackets) for text types
    if (primaryType === "Unknown") {
      primaryType = "Text";
      primaryValue = ndaTextTypes[text];
    } else {
      alternateType = "Text";
      alternateValue = ndaTextTypes[text];
    }
  }

  if (ndaNumberTypes.hasOwnProperty(normalizedText)) {
    if (primaryType === "Unknown") {
      primaryType = "Number";
      primaryValue = ndaNumberTypes[normalizedText];
    } else {
      alternateType = "Number";
      alternateValue = ndaNumberTypes[normalizedText];
    }
  } else if (ndaNumberTypes.hasOwnProperty(text)) {
    // Check the original text (with brackets) for number types
    if (primaryType === "Unknown") {
      primaryType = "Number";
      primaryValue = ndaNumberTypes[text];
    } else {
      alternateType = "Number";
      alternateValue = ndaNumberTypes[text];
    }
  }

  if (ndaDateTypes.hasOwnProperty(normalizedText)) {
    if (primaryType === "Unknown") {
      primaryType = "Date";
      primaryValue = ndaDateTypes[normalizedText];
    } else {
      alternateType = "Date";
      alternateValue = ndaDateTypes[normalizedText];
    }
  } else if (ndaDateTypes.hasOwnProperty(text)) {
    // Check the original text (with brackets) for date types
    if (primaryType === "Unknown") {
      primaryType = "Date";
      primaryValue = ndaDateTypes[text];
    } else {
      alternateType = "Date";
      alternateValue = ndaDateTypes[text];
    }
  }

  if (primaryType === "Unknown" && primaryValue === "") {
    return { primaryType: "Unknown", primaryValue: "", validTypes: ["Text", "Paragraph", "Email", "Number", "Date", "Radio"] };
  }

  return { primaryType, primaryValue, validTypes, alternateType, alternateValue };
};



// latest code