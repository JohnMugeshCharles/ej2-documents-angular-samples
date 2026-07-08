import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { PdfDocument, PdfForm, PdfTextBoxField, PdfCheckBoxField, PdfListFieldItem, PdfComboBoxField, PdfRadioButtonListField } from '@syncfusion/ej2-pdf';

@Component({
    selector: 'control-content',

    // Standalone component: declares Angular module dependencies here
    standalone: true,
    imports: [CommonModule, FormsModule, TextBoxModule, DropDownListModule, DatePickerModule, CheckBoxModule],

    templateUrl: './form-fillings.html'
})
export class PdfFormFillComponent {
    // -------------------- Form Model (UI-bound values) --------------------
    // These values are typically bound to input controls in the template.
    name = 'John Milton';
    gender: 'Male' | 'Female' | 'Other' = 'Male';
    dobRaw = '2012-12-05'; // Stored as YYYY-MM-DD for HTML date inputs
    email = 'john.milton@example.com';
    state = 'Alabama';
    newsletter = false;

    // -------------------- UI/Action Guards --------------------
    // Prevents repeated clicks from running the same async operation in parallel.
    private viewBusy = false;
    private fillBusy = false;

    /**
     * Downloads the original form PDF without changes.
     * Flow:
     * 1) Guard against double-click (viewBusy)
     * 2) Fetch template PDF bytes from CDN
     * 3) Download as-is
     * 4) Reset busy flag in finally (always runs)
     */
    async viewPdf(): Promise<void> {
        if (this.viewBusy) return;
        this.viewBusy = true;

        try {
            const bytes = await this.fetchPdf();
            this.download(new Blob([bytes], { type: 'application/pdf' }), 'FormFillings.pdf');
        } finally {
            // Ensure the flag is cleared even if fetch/download throws
            this.viewBusy = false;
        }
    }

    /**
     * Fills the PDF form fields and downloads the result.
     * mode:
     * - 'fill'    -> keeps fields editable in the output
     * - 'flatten' -> makes fields part of the page content (non-editable)
     *
     * Flow:
     * 1) Guard against double-click (fillBusy)
     * 2) Fetch template PDF bytes
     * 3) Load document and access form
     * 4) Locate each field by name and set values
     * 5) Update field appearance so values are visible in viewers
     * 6) Optionally flatten
     * 7) Save and destroy PDF
     */
    async fillPdf(mode: 'fill' | 'flatten'): Promise<void> {
        if (this.fillBusy) return;
        this.fillBusy = true;

        try {
            // Load the blank form PDF
            const pdfBytes = await this.fetchPdf();
            const pdf = new PdfDocument(pdfBytes);

            // Access interactive form fields
            const form = pdf.form;

            // -------------------- Name (TextBox) --------------------
            const nameField = this.find(form, 'name') as PdfTextBoxField;
            if (nameField) {
                nameField.text = this.name;

                // Ensures the field's visual appearance is regenerated with the new value
                nameField.setAppearance(true);
            }

            // -------------------- Gender (Radio Button List) --------------------
            const genderField = this.find(form, 'gender') as PdfRadioButtonListField;
            if (genderField) {
                // Map union type to the appropriate radio index (based on PDF field item order)
                genderField.selectedIndex =
                    this.gender === 'Male' ? 0 : this.gender === 'Other' ? 1 : 2;

                genderField.setAppearance(true);
            }

            // -------------------- Date of Birth (TextBox) --------------------
            const dobField = this.find(form, 'dob') as PdfTextBoxField;
            if (dobField) {
                // Convert YYYY-MM-DD (HTML date format) to MM/DD/YYYY for PDF display
                const [y, m, d] = this.dobRaw.split('-');
                dobField.text = `${m}/${d}/${y}`;
                dobField.setAppearance(true);
            }

            // -------------------- Email (TextBox) --------------------
            const emailField = this.find(form, 'email') as PdfTextBoxField;
            if (emailField) {
                emailField.text = this.email;
                emailField.setAppearance(true);
            }

            // -------------------- State (ComboBox) --------------------
            const stateField = this.find(form, 'state') as PdfComboBoxField;
            if (stateField) {
                // Find the matching item text and select that index
                for (let i = 0; i < stateField.itemsCount; i++) {
                    const item = stateField._options[i] as any;
                    if (item === this.state) {
                        stateField.selectedIndex = i;
                        break;
                    }
                }
                stateField.setAppearance(true);
            }

            // -------------------- Newsletter (CheckBox) --------------------
            const newsField = this.find(form, 'newsletter') as PdfCheckBoxField;
            if (newsField) {
                newsField.checked = this.newsletter;
                newsField.setAppearance(true);
            }

            // -------------------- Flatten (optional) --------------------
            // Flattening converts interactive fields into static page content.
            if (mode === 'flatten') {
                pdf.flatten = true;
            }

            // Save output with different names depending on mode
            pdf.save(mode === 'flatten' ? 'FormFillFlatten.pdf' : 'FormFillings.pdf');

            // Release internal resources
            pdf.destroy();
        } finally {
            // Always reset the busy flag to re-enable the button/action
            this.fillBusy = false;
        }
    }

    /**
     * Fetches the template PDF from Syncfusion CDN and returns it as raw bytes.
     * Uses no-cache so repeated runs always pull a fresh copy.
     */
    private async fetchPdf(): Promise<Uint8Array> {
        const res = await fetch(
            'https://cdn.syncfusion.com/content/pdf-resources/form-filling-document.pdf',
            { cache: 'no-cache' }
        );

        // Note: no explicit res.ok check here; could be added if you want clearer errors
        return new Uint8Array(await res.arrayBuffer());
    }

    /**
     * Browser download helper for generated files.
     * Creates an object URL and triggers download via an <a> element click.
     */
    private download(blob: Blob, name: string): void {
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = name;

        // Programmatic click triggers download
        a.click();

        // Cleanup object URL to free memory
        URL.revokeObjectURL(url);
    }

    /**
     * Finds a form field by its name in the PDF form collection.
     * Returns the matching field instance (type depends on the field) or undefined.
     */
    private find(form: PdfForm, name: string) {
        // Iterate through all fields in the PDF form
        for (let i = 0; i < form.count; i++) {
            const f = form.fieldAt(i);
            if (f?.name === name) return f;
        }
        return undefined;
    }

    // DatePicker change handler to keep `dobRaw` as YYYY-MM-DD string
    onDobChange(args: any): void {
        const val = args && args.value;
        if (val instanceof Date) {
            const y = val.getFullYear();
            const m = String(val.getMonth() + 1).padStart(2, '0');
            const d = String(val.getDate()).padStart(2, '0');
            this.dobRaw = `${y}-${m}-${d}`;
        } else if (typeof val === 'string') {
            this.dobRaw = val;
        }
    }
}