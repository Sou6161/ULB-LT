import React from "react";

// Raw HTML string for Live_Generation
export const documentText = `
  <div id="document-preview" className="bg-white rounded-lg shadow-sm border border-black-100 p-8">
      <h1 className="text-blue-600 text-3xl font-bold mb-8 tracking-tight">
          ONE-WAY NON-DISCLOSURE AGREEMENT
      </h1>
      <div className="text-blue-600 leading-relaxed space-y-6">
          <div>
              <h2 className="text-2xl font-bold mt-6">DATE</h2>
              <p>
                  Date: <span className="placeholder-agreement-date">[YYYY-DD-MM]</span>
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">PARTIES</h2>
              <p>
                  <strong>Recipient:</strong> 
                  <span className="placeholder-recipient-name">[Name of Individual or Company Receiving Information]</span>, 
                residing at <span className="placeholder-recipient-address">[Address of Individual (Recipient)]</span> 
                  a company registered in <span className="placeholder-recipient-jurisdiction">[England (Recipient)]</span> under company number <span className="placeholder-recipient-company-number">[Number on Register of Companies (Recipient)]</span> whose registered office is at <span className="placeholder-recipient-registered-office">[Address of Office on the Register of Companies (Recipient)]</span>
                  ("Recipient").
              </p>
              <p>
                  <strong>Discloser:</strong> 
                  <span className="placeholder-discloser-name">[Name of Individual or Company Disclosing Information]</span>, 
                  residing at <span className="placeholder-discloser-address">[Address of Individual (Discloser)]</span>
                  a company registered in <span className="placeholder-discloser-jurisdiction">[England (Discloser)]</span> under company number <span className="placeholder-discloser-company-number">[Number on Register of Companies (Discloser)]</span> whose registered office is at <span className="placeholder-discloser-registered-office">[Address of Office on the Register of Companies (Discloser)]</span> 
                  ("Discloser").
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">PURPOSE</h2>
              <p>
                  The Discloser intends to disclose information (the Confidential Information) to the Recipient for the purpose of 
                  <span className="placeholder-purpose">[insert details e.g. discussing the possibility of the Recipient and the Discloser entering into a joint venture]</span> 
                  (the Purpose).
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">USE OF CONFIDENTIAL INFORMATION</h2>
              <p>
                  The Recipient undertakes not to use the Confidential Information for any purpose except the Purpose, without first obtaining the written agreement of the Discloser.
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">NON-DISCLOSURE OBLIGATION</h2>
              <p>
                  The Recipient undertakes to keep the Confidential Information secure and not to disclose it to any third party 
                  <span className="small-condition-highlight">{except to its employees and professional advisers who need to know the same for the Purpose, who know they owe a duty of confidence to the Discloser and who are bound by obligations equivalent to those in this clause 2 above and this clause 3}</span>.
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">EXCEPTIONS TO OBLIGATIONS</h2>
              <p>
                  The undertakings in clauses 2 and 3 above apply to all of the information disclosed by the Discloser to the Recipient, regardless of the way or form in which it is disclosed or recorded but they do not apply to:
              </p>
              <p>
                  a) any information which is or in future comes into the public domain (unless as a result of the breach of this Agreement); or
              </p>
              <p>
                  b) any information which is already known to the Recipient and which was not subject to any obligation of confidence before it was disclosed to the Recipient by the Discloser.
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">DISCLOSURE REQUIRED BY LAW</h2>
              <p>
                  Nothing in this Agreement will prevent the Recipient from making any disclosure of the Confidential Information required by law or by any competent authority.
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">RETURN OF INFORMATION</h2>
              <p>
                  The Recipient will, on request from the Discloser, return all copies and records of the Confidential Information to the Discloser and will not retain any copies or records of the Confidential Information.
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">INTELLECTUAL PROPERTY RIGHTS</h2>
              <p>
                  Neither this Agreement nor the supply of any information grants the Recipient any licence, interest, or right in respect of any intellectual property rights of the Discloser except the right to copy the Confidential Information solely for the Purpose.
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6" id="big-condition-section">(DURATION OF OBLIGATIONS</h2>
              <p>
                  The undertakings above will continue in force ([Indefinitely] [for [Insert number] years from the date of this Agreement]).)
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">GOVERNING LAW AND JURISDICTION</h2>
              <p>
                  This Agreement is governed by, and is to be construed in accordance with, English law. The English Courts will have non-exclusive jurisdiction to deal with any dispute which has arisen or may arise out of, or in connection with, this Agreement.
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">SIGNED</h2>
              <p className="mb-3">
                  <strong>If the Recipient is an individual:</strong>
              </p>
              <p>Signed and Delivered as a Deed by:</p>
              <p>Name: <span className="placeholder-recipient-name-individual">[Name of Recipient (Individual)]</span></p>
              <p>Signature: ___________________________</p>
              <p className="mb-3">In the presence of:</p>
              <p>Signature of witness: ___________________________</p>
              <p>Name of witness: <span className="placeholder-witness-name-individual">[Name of Witness (Individual)]</span></p>
              <p>Address of witness: <span className="placeholder-witness-address-individual">[Address of Witness (Individual)]</span></p>
              <p className="mb-3 mt-6">
                  <strong>If the Recipient is a company:</strong>
              </p>
              <p>Executed and Delivered as a Deed by:</p>
              <p>Name: <span className="placeholder-recipient-name-company">[Name of Recipient (Company)]</span></p>
              <p>Acting by: <span className="placeholder-director-name">[Name of Director]</span>, a Director</p>
              <p>Signature of Director: ___________________________</p>
              <p className="mb-3">In the presence of:</p>
              <p>Signature of witness: ___________________________</p>
              <p>Name of witness: <span className="placeholder-witness-name-company">[Name of Witness (Company)]</span></p>
              <p>Address of witness: <span className="placeholder-witness-address-company">[Address of Witness (Company)]</span></p>
          </div>
      </div>
  </div>
`;

const NDAAgreement: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-black-100 p-8">
      <h1 className="text-blue-600 text-3xl font-bold mb-8 tracking-tight">
        ONE-WAY NON-DISCLOSURE AGREEMENT
      </h1>
      <div className="text-blue-600 leading-relaxed">
        <h2 className="text-2xl font-bold">DATE</h2>
        <p id="agreement-date-placeholder">
          Date: <span className="placeholder-agreement-date">[YYYY-DD-MM]</span>
        </p>

        <h2 className="text-2xl font-bold mt-6">PARTIES</h2>
        <p>
          <strong>Recipient:</strong>{" "}
          <span className="placeholder-recipient-name">[Name of Individual or Company Receiving Information]</span>,{" "}
          residing at <span className="placeholder-recipient-address">[Address of Individual (Recipient)]</span>{" "}
          a company registered in <span className="placeholder-recipient-jurisdiction">[England (Recipient)]</span> under company number <span className="placeholder-recipient-company-number">[Number on Register of Companies (Recipient)]</span> whose registered office is at <span className="placeholder-recipient-registered-office">[Address of Office on the Register of Companies (Recipient)]</span>{" "}
          ("Recipient").
        </p>
        <p>
          <strong>Discloser:</strong>{" "}
          <span className="placeholder-discloser-name">[Name of Individual or Company Disclosing Information]</span>,{" "}
          residing at <span className="placeholder-discloser-address">[Address of Individual (Discloser)]</span>{" "}
          a company registered in <span className="placeholder-discloser-jurisdiction">[England (Discloser)]</span> under company number <span className="placeholder-discloser-company-number">[Number on Register of Companies (Discloser)]</span> whose registered office is at <span className="placeholder-discloser-registered-office">[Address of Office on the Register of Companies (Discloser)]</span>{" "}
          ("Discloser").
        </p>

        <h2 className="text-2xl font-bold mt-6">PURPOSE</h2>
        <p>
          The Discloser intends to disclose information (the Confidential Information) to the Recipient for the purpose of{" "}
          <span className="placeholder-purpose">{"["}insert details e.g. discussing the possibility of the Recipient and the Discloser entering into a joint venture{"]"}</span>{" "}
          (the Purpose).
        </p>

        <h2 className="text-2xl font-bold mt-6">USE OF CONFIDENTIAL INFORMATION</h2>
        <p>
          The Recipient undertakes not to use the Confidential Information for any purpose except the Purpose, without first obtaining the written agreement of the Discloser.
        </p>

        <h2 className="text-2xl font-bold mt-6">NON-DISCLOSURE OBLIGATION</h2>
        <p>
          The Recipient undertakes to keep the Confidential Information secure and not to disclose it to any third party 
          <span className="small-condition-highlight">{"{"}except to its employees and professional advisers who need to know the same for the Purpose, who know they owe a duty of confidence to the Discloser and who are bound by obligations equivalent to those in this clause 2 above and this clause 3{"}"}</span>.
        </p>

        <h2 className="text-2xl font-bold mt-6">EXCEPTIONS TO OBLIGATIONS</h2>
        <p>
          The undertakings above apply to all of the information disclosed by the Discloser to the Recipient, regardless of the way or form in which it is disclosed or recorded but they do not apply to:
        </p>
        <p>
          a) any information which is or in future comes into the public domain (unless as a result of the breach of this Agreement); or
        </p>
        <p>
          b) any information which is already known to the Recipient and which was not subject to any obligation of confidence before it was disclosed to the Recipient by the Discloser.
        </p>

        <h2 className="text-2xl font-bold mt-6">DISCLOSURE REQUIRED BY LAW</h2>
        <p>
          Nothing in this Agreement will prevent the Recipient from making any disclosure of the Confidential Information required by law or by any competent authority.
        </p>

        <h2 className="text-2xl font-bold mt-6">RETURN OF INFORMATION</h2>
        <p>
          The Recipient will, on request from the Discloser, return all copies and records of the Confidential Information to the Discloser and will not retain any copies or records of the Confidential Information.
        </p>

        <h2 className="text-2xl font-bold mt-6">INTELLECTUAL PROPERTY RIGHTS</h2>
        <p>
          Neither this Agreement nor the supply of any information grants the Recipient any licence, interest, or right in respect of any intellectual property rights of the Discloser except the right to copy the Confidential Information solely for the Purpose.
        </p>

        {/* Big Condition Section */}
        <div id="big-condition-section">
          <h2 className="text-2xl font-bold mt-6">(DURATION OF OBLIGATIONS</h2>
          <p>
            The undertakings above will continue in force ([Indefinitely] [for [Insert number] years from the date of this Agreement]).)
          </p>
        </div>

        <h2 className="text-2xl font-bold mt-6">GOVERNING LAW AND JURISDICTION</h2>
        <p>
          This Agreement is governed by, and is to be construed in accordance with, English law. The English Courts will have non-exclusive jurisdiction to deal with any dispute which has arisen or may arise out of, or in connection with, this Agreement.
        </p>

        <h2 className="text-2xl font-bold mt-6">SIGNED</h2>
        <p className="mb-3">
          <strong>If the Recipient is an individual:</strong>
        </p>
        <p>Signed and Delivered as a Deed by:</p>
        <p>Name: <span className="placeholder-recipient-name-individual">[Name of Recipient (Individual)]</span></p>
        <p>Signature: ___________________________</p>
        <p className="mb-3">In the presence of:</p>
        <p>Signature of witness: ___________________________</p>
        <p>Name of witness: <span className="placeholder-witness-name-individual">[Name of Witness (Individual)]</span></p>
        <p>Address of witness: <span className="placeholder-witness-address-individual">[Address of Witness (Individual)]</span></p>
        <p className="mb-3 mt-6">
          <strong>If the Recipient is a company:</strong>
        </p>
        <p>Executed and Delivered as a Deed by:</p>
        <p>Name: <span className="placeholder-recipient-name-company">[Name of Recipient (Company)]</span></p>
        <p>Acting by: <span className="placeholder-director-name">[Name of Director]</span>, a Director</p>
        <p>Signature of Director: ___________________________</p>
        <p className="mb-3">In the presence of:</p>
        <p>Signature of witness: ___________________________</p>
        <p>Name of witness: <span className="placeholder-witness-name-company">[Name of Witness (Company)]</span></p>
        <p>Address of witness: <span className="placeholder-witness-address-company">[Address of Witness (Company)]</span></p>
      </div>
    </div>
  );
};

export default NDAAgreement;


// latest code