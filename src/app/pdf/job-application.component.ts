import { Component } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import {
    PdfDocument,
    PdfPage,
    PdfBrush,
    PdfFontFamily,
    PdfFontStyle,
    PdfTextBoxField,
    PdfComboBoxField,
    PdfListFieldItem,
    PdfCheckBoxField,
    PdfButtonField,
    PdfForm,
    PdfStandardFont,
    PdfPen,
    PdfSignatureField
} from '@syncfusion/ej2-pdf';
@Component({
  selector: 'control-content',
  templateUrl: './job-application.html',
  standalone: true,
})
export class JobApplicationComponent {

  /**
   * Generates a multi-page job application PDF with interactive form fields.
   * Flow:
   *  1) Fetch background image bytes
   *  2) Create PDF + page settings
   *  3) Build Page 1 (general info + education)
   *  4) Build Page 2 (current position + duties + employment type)
   *  5) Build Page 3 (thank you + submit button)
   *  6) Save and destroy document resources
   */
  ngAfterViewInit(): void {
    const generateBtn = new Button();
    generateBtn.appendTo('#generatebtn');
    generateBtn.element.onclick = async (): Promise<void> => {
      try {
          // Create a new PDF document
          let document: PdfDocument = new PdfDocument();
          let page: PdfPage = document.addPage();
          let form: PdfForm = document.form;
 
          // Set up fonts
          let normalFont = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
          let boldFont = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
          let titleFont = new PdfStandardFont(PdfFontFamily.helvetica, 17, PdfFontStyle.regular);
          let subTitleFont = new PdfStandardFont(PdfFontFamily.helvetica, 9, PdfFontStyle.regular);
 
          let tealBrush = new PdfBrush({r: 0, g: 128, b: 128});
          let blackBrush = new PdfBrush({r: 0, g: 0, b: 0});
          let blackPen = new PdfPen({r: 0, g: 0, b: 0}, 1);
          let grayPen = new PdfPen({r: 102, g: 106, b: 109}, 1);
          let whiteBrush = new PdfBrush({r: 255, g: 255, b: 255});
          let navyBrush = new PdfBrush({r: 19, g: 43, b: 66});
          let navyPen = new PdfPen({r: 19, g: 43, b: 66}, 1);
 
          let graphics = page.graphics;
          let y = 20;
 
          // Title Section
          graphics.drawRoundedRectangle({x: 20, y: y, width: page.graphics.clientSize.width - 40, height: 55}, 5, navyPen, navyBrush);
          y += 10;
          const titleY = y;
          graphics.drawString('Job Application', titleFont, {x: 30, y: titleY, width: 300, height: 30},  whiteBrush);
            
          y += 25;
          graphics.drawString(`We look forward to receiving your application. please fill in all required fields.`, subTitleFont, {x: 30, y: y, width: 400, height: 30},  tealBrush);
          y += 35;
 
          // --- PERSONAL INFORMATION SECTION ---
          graphics.drawRectangle({x: 20, y: y, width: page.graphics.clientSize.width - 40, height: 20},  tealBrush);
          graphics.drawString('Personal Information', boldFont, {x: 25, y: y + 3, width: 500, height: 20},  whiteBrush);
          y += 35;
 
          let pageWidth = page.graphics.clientSize.width;
          const leftMargin = 20;
          const rightMargin = 20;
          const innerWidth = pageWidth - leftMargin - rightMargin;
          const fieldWidth = innerWidth / 2 - 5;
 
          graphics.drawString('First Name *', normalFont, {x: leftMargin, y: y, width: fieldWidth, height: 15}, blackBrush);
          let firstNameField = new PdfTextBoxField(page, 'FirstName', {x: leftMargin, y: y + 15, width: fieldWidth, height: 20});
          firstNameField.setAppearance(true);
          form.add(firstNameField);
 
          graphics.drawString('Last Name *', normalFont, {x: leftMargin + fieldWidth + 10, y: y, width: fieldWidth, height: 15}, blackBrush);
          let lastNameField = new PdfTextBoxField(page, 'LastName', {x: leftMargin + fieldWidth + 10, y: y + 15, width: fieldWidth, height: 20});
          lastNameField.setAppearance(true);
          form.add(lastNameField);
          y += 50;
 
          graphics.drawString('Email Address *', normalFont, {x: leftMargin, y: y, width: fieldWidth, height: 15}, blackBrush);
          let emailField = new PdfTextBoxField(page, 'Email', {x: leftMargin, y: y + 15, width: fieldWidth, height: 20});
          emailField.setAppearance(true);
          form.add(emailField);
 
          graphics.drawString('Business Phone', normalFont, {x: leftMargin + fieldWidth + 10, y: y, width: fieldWidth, height: 15}, blackBrush);
          let phoneField = new PdfTextBoxField(page, 'Phone', {x: leftMargin + fieldWidth + 10, y: y + 15, width: fieldWidth, height: 20});
          phoneField.setAppearance(true);
          form.add(phoneField);
          y += 50;
 
          graphics.drawString('Position Applied For *', normalFont, {x: 20, y: y, width: 430, height: 15}, blackBrush);
          let positionField = new PdfComboBoxField(page, 'Position', {x: 20, y: y + 15, width: fieldWidth, height: 20});
          positionField.addItem(new PdfListFieldItem('-- Select a role --', 'SR'));
          positionField.addItem(new PdfListFieldItem('Software Engineer', 'SE'));
          positionField.addItem(new PdfListFieldItem('Senior Developer', 'SD'));
          positionField.addItem(new PdfListFieldItem('Project Manager', 'PM'));
          positionField.addItem(new PdfListFieldItem('QA Engineer', 'QA'));
          positionField.selectedIndex = 0;
          positionField.editable = true;
          positionField.setAppearance(true);
          form.add(positionField);
          y += 55;
 
          // --- EDUCATION SECTION ---
          graphics.drawLine(grayPen, {x: 20, y: y}, {x: page.graphics.clientSize.width - 20, y: y});
          y += 20;
 
          graphics.drawRectangle({x: 20, y: y, width: page.graphics.clientSize.width - 40, height: 20},  tealBrush);
          graphics.drawString('Education', boldFont, {x: 25, y: y + 3, width: 500, height: 20},  whiteBrush);
          y += 35;
 
          graphics.drawString('Please select the highest level of education you have completed.', normalFont, {x: 20, y: y, width: 520, height: 15}, blackBrush);
          y += 30;
 
          let eduOptions = [
              { name: 'AssociateDegree', label: 'Associate Degree', x: 20 },
              { name: 'BachelorDegree', label: 'Bachelor\'s Degree', x: 210 },
              { name: 'CollegeDiploma', label: 'College / Diploma', x: 390 }
          ];
 
          eduOptions.forEach(option => {
              let checkBox = new PdfCheckBoxField(option.name, {x: option.x, y: y, width: 15, height: 15}, page);
              checkBox.setAppearance(true);
              form.add(checkBox);
              graphics.drawString(option.label, normalFont, {x: option.x + 20, y: y, width: 150, height: 15}, blackBrush);
          });
          y += 35;
 
          let eduOptions2 = [
              { name: 'Postgraduate', label: 'Postgraduate (PG)', x: 20 },
              { name: 'MBA', label: 'MBA', x: 210 }
          ];
 
          eduOptions2.forEach(option => {
              let checkBox = new PdfCheckBoxField(option.name, {x: option.x, y: y, width: 15, height: 15}, page);
              checkBox.checked = false;
              checkBox.setAppearance(true);
              form.add(checkBox);
              graphics.drawString(option.label, normalFont, {x: option.x + 20, y: y, width: 150, height: 15}, blackBrush);
          });
          y += 35;
 
          // --- EMPLOYMENT HISTORY SECTION ---
          graphics.drawLine(grayPen, {x: 20, y: y}, {x: page.graphics.clientSize.width - 20, y: y});
          y += 20;
 
          graphics.drawRectangle({x: 20, y: y, width: page.graphics.clientSize.width - 40, height: 20},  tealBrush);
          graphics.drawString('Employment History', boldFont, {x: 25, y: y + 3, width: 500, height: 20},  whiteBrush);
          y += 35;
 
          graphics.drawString('List your most recent position first.', normalFont, {x: 20, y: y, width: 520, height: 15}, blackBrush);
          y += 25;
 
          let currentlyEmployedCheckbox = new PdfCheckBoxField('CurrentlyEmployed', {x: 20, y: y, width: 15, height: 15}, page);
          currentlyEmployedCheckbox.setAppearance(true);
          form.add(currentlyEmployedCheckbox);
          graphics.drawString('I am currently employed at this company', normalFont, {x: 40, y: y, width: 440, height: 15}, blackBrush);
          y += 35;
 
          graphics.drawString('Job Title *', normalFont, {x: leftMargin, y: y, width: fieldWidth, height: 15}, blackBrush);
          let jobTitleField = new PdfTextBoxField(page, 'JobTitle', {x: leftMargin, y: y + 15, width: fieldWidth, height: 20});
          jobTitleField.setAppearance(true);
          form.add(jobTitleField);
 
          graphics.drawString('Employer *', normalFont, {x: leftMargin + fieldWidth + 10, y: y, width: fieldWidth, height: 15}, blackBrush);
          let employerField = new PdfTextBoxField(page, 'Employer', {x: leftMargin + fieldWidth + 10, y: y + 15, width: fieldWidth, height: 20});
          employerField.setAppearance(true);
          form.add(employerField);
          y += 50;
 
          graphics.drawString('Annual Salary', normalFont, {x: leftMargin, y: y, width: fieldWidth, height: 15}, blackBrush);
          let salaryField = new PdfTextBoxField(page, 'Salary', {x: leftMargin, y: y + 15, width: fieldWidth, height: 20});
          salaryField.setAppearance(true);
          form.add(salaryField);
 
          graphics.drawString('Reason for Leaving', normalFont, {x: leftMargin + fieldWidth + 10, y: y, width: fieldWidth, height: 15}, blackBrush);
          let reasonField = new PdfTextBoxField(page, 'ReasonForLeaving', {x: leftMargin + fieldWidth + 10, y: y + 15, width: fieldWidth, height: 20});
          reasonField.setAppearance(true);
          form.add(reasonField);
          y += 50;
 
          graphics.drawString('Key Duties & Responsibilities *', normalFont, {x: 20, y: y, width: innerWidth, height: 15}, blackBrush);
          let dutiesField = new PdfTextBoxField(page, 'Duties', {x: 20, y: y + 15, width: innerWidth, height: 60});
          dutiesField.multiLine = true;
          dutiesField.setAppearance(true);
          form.add(dutiesField);
          y += 85;
 
          // --- PAGE 2: SIGNATURE & SUBMISSION ---
          let page2: PdfPage = document.addPage();
          let graphics2 = page2.graphics;
          let y2 = 20;
 
          graphics2.drawString('Employment Type', normalFont, {x: 20, y: y2, width: fieldWidth, height: 15}, blackBrush);
          y2 += 25;
          let empTypeField = new PdfComboBoxField(page2, 'EmploymentType', {x: 20, y: y2, width: fieldWidth, height: 20});
          empTypeField.addItem(new PdfListFieldItem('-- Select --', 'Select'));
          empTypeField.addItem(new PdfListFieldItem('Full-Time', 'FT'));
          empTypeField.addItem(new PdfListFieldItem('Part-Time', 'PT'));
          empTypeField.addItem(new PdfListFieldItem('Contract', 'C'));
          empTypeField.addItem(new PdfListFieldItem('Temporary', 'T'));
          empTypeField.selectedIndex = 0;
          empTypeField.editable = true;
          empTypeField.setAppearance(true);
          form.add(empTypeField);
          y2 += 40;
 
          graphics2.drawLine(grayPen, {x: 20, y: y2}, {x: page.graphics.clientSize.width - 20, y: y2});
          y2 += 20;
 
          graphics2.drawRectangle({x: 20, y: y2, width: page2.graphics.clientSize.width - 40, height: 20},  tealBrush);
          graphics2.drawString('Declaration & Signature', boldFont, {x: 25, y: y2 + 3, width: 500, height: 20},  whiteBrush);
          y2 += 35;
 
          graphics2.drawRectangle({x: 20, y: y2, width: page.graphics.clientSize.width - 40, height: 55},  new PdfBrush({r: 220, g: 240, b: 255}));
          graphics2.drawString('I declare that all information provided in this application is true, accurate, and complete. I understand that any misrepresentation or omission of information may result in disqualification from consideration or, if employed, dismissal. I consent to the collection and processing of my personal data for recruitment purposes.', normalFont, {x: 25, y: y2 + 5, width: innerWidth, height: 70}, blackBrush);
          y2 += 75;
 
          graphics2.drawString('Applicant Signature *', boldFont, {x: leftMargin, y: y2, width: fieldWidth, height: 15}, blackBrush);
          let signatureField = new PdfSignatureField(page2, 'ApplicantSignature', {x: leftMargin, y: y2 + 15, width: fieldWidth, height: 40});
          signatureField.setAppearance(true);
          form.add(signatureField);
 
          graphics2.drawString('Date *', boldFont, {x: leftMargin + fieldWidth + 10, y: y2, width: fieldWidth, height: 15}, blackBrush);
          let dateField = new PdfTextBoxField(page2, 'SignatureDate', {x: leftMargin + fieldWidth + 10, y: y2 + 15, width: fieldWidth, height: 40});
          dateField.setAppearance(true);
          form.add(dateField);
          y2 += 75;
 
          graphics2.drawLine(grayPen, {x: 20, y: y2}, {x: page.graphics.clientSize.width - 20, y: y2});
          y2 += 20;
 
          graphics2.drawRectangle({x: 20, y: y2, width: innerWidth, height: 20},  tealBrush);
          graphics2.drawString('Additional Terms & Conditions', boldFont, {x: 25, y: y2 + 3, width: innerWidth, height: 20},  whiteBrush);
          y2 += 40;
 
          let termsCheckbox1 = new PdfCheckBoxField('TermsAgree', {x: 20, y: y2, width: 15, height: 15}, page2);
          termsCheckbox1.setAppearance(true);
          form.add(termsCheckbox1);
          graphics2.drawString('I agree to the terms and conditions of employment', normalFont, {x: 40, y: y2, width: 460, height: 15}, blackBrush);
          y2 += 35;
 
          let termsCheckbox2 = new PdfCheckBoxField('BackgroundCheck', {x: 20, y: y2, width: 15, height: 15}, page2);
          termsCheckbox2.setAppearance(true);
          form.add(termsCheckbox2);
          graphics2.drawString('I authorize background check and reference verification', normalFont, {x: 40, y: y2, width: 460, height: 15}, blackBrush);
          y2 += 35;
 
          let termsCheckbox3 = new PdfCheckBoxField('PrivacyPolicy', {x: 20, y: y2, width: 15, height: 15}, page2);
          termsCheckbox3.setAppearance(true);
          form.add(termsCheckbox3);
          graphics2.drawString('I have read and accepted the Privacy Policy', normalFont, {x: 40, y: y2, width: 460, height: 15}, blackBrush);
          y2 += 35;
 
          graphics2.drawLine(grayPen, {x: 20, y: y2}, {x: page.graphics.clientSize.width - 20, y: y2});
          y2 += 20;
 
          graphics2.drawString('* Required field', normalFont, {x: 20, y: y2, width: 200, height: 15}, blackBrush);
          y2 += 35;
 
          let button: PdfButtonField = new PdfButtonField(page2, 'Submit', {x: 350, y: y2 + 6, width: 130, height: 30});
          button.font = boldFont;
          button.text = 'Submit Application';
          button.color = {r: 255, g: 255, b: 255};
          button.borderColor = {r: 34, g: 139, b: 34};
          button.backColor = {r: 34, g: 139, b: 34};
          button.setAppearance(true);
          form.add(button);
 
          document.save('JobApplication.pdf');
          document.destroy();
      } catch (err) {
        // Centralized error capture to avoid unhandled promise rejection
        console.error('Generate PDF failed:', err);
      }
    }
  }
}
