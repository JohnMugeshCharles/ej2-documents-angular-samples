import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import {
  PdfDocument, PdfPageSettings, PdfMargins, PdfPage, PdfGraphics, PdfBrush, PdfFont, PdfFontFamily, PdfFontStyle, PdfEncryptionType
} from '@syncfusion/ej2-pdf';

@Component({
  selector: 'control-content',
  templateUrl: './encryption.html',
  standalone: true,
  imports: [FormsModule, ButtonModule, RadioButtonModule, TextBoxModule]
})
export class EncryptionComponent implements OnInit {

  /**
   * Angular lifecycle hook.
   * Initializes default password values.
   */
  ngOnInit(): void {
    this.setDefaultPasswords();
  }

  /**
   * Sets default values for password inputs.
   */
  private setDefaultPasswords(): void {
    const userPasswordEl = document.getElementById('userPassword') as any;
    const ownerPasswordEl = document.getElementById('ownerPassword') as any;

    // Try to set Syncfusion TextBox value first
    if (userPasswordEl?.ej2_instances?.[0]) {
      userPasswordEl.ej2_instances[0].value = 'password';
    } else if (userPasswordEl) {
      userPasswordEl.value = 'password';
    }

    if (ownerPasswordEl?.ej2_instances?.[0]) {
      ownerPasswordEl.ej2_instances[0].value = 'syncfusion';
    } else if (ownerPasswordEl) {
      ownerPasswordEl.value = 'syncfusion';
    }
  }

  /**
   * Gets the selected radio button value.
   */
  private getSelectedRadio(name: string): string | null {
    const el = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null;
    return el ? el.value : null;
  }

  /**
   * Helper function to get value from Syncfusion TextBox component (<ejs-textbox>).
   * These components store their value in the ej2_instances array, not directly on the element.
   */
  private getSyncfusionTextBoxValue(elementId: string): string {
    const el = document.getElementById(elementId) as any;
    if (!el) return '';
    
    // Try to access Syncfusion component instance
    const instance = el.ej2_instances && el.ej2_instances[0];
    if (instance && typeof instance.value !== 'undefined') {
      return String(instance.value || '').trim();
    }
    
    // Fallback to native value property (for plain inputs)
    return String(el.value || '').trim();
  }

  /**
   * Encrypts PDF with selected encryption settings.
   */
  async encryptPdf(): Promise<void> {
    const encryptionType = this.getSelectedRadio('encryptionType');
    const userPassword = this.getSyncfusionTextBoxValue('userPassword') || 'password';
    const ownerPassword = this.getSyncfusionTextBoxValue('ownerPassword') || 'syncfusion';

    // Create PDF document
    const pdf: PdfDocument = new PdfDocument();
    const settings: PdfPageSettings = new PdfPageSettings({ margins: new PdfMargins(0) });
    const page: PdfPage = pdf.addPage(settings);
    const graphics: PdfGraphics = page.graphics;

    // Set up fonts and brushes
    const black: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
    const font: PdfFont = pdf.embedFont(PdfFontFamily.timesRoman, 14, PdfFontStyle.bold);
    const smallFont: PdfFont = pdf.embedFont(PdfFontFamily.timesRoman, 11, PdfFontStyle.bold);

    // Map encryption type to PdfEncryptionType enum
    let encType: PdfEncryptionType = PdfEncryptionType.aesBit128;

    switch (encryptionType) {
      case "40_RC4":
        encType = PdfEncryptionType.rc4Bit40;
        break;
      case "128_RC4":
        encType = PdfEncryptionType.rc4Bit128;
        break;
      case "128_AES":
        encType = PdfEncryptionType.aesBit128;
        break;
      case "256_AES":
        encType = PdfEncryptionType.aesBit256Rev5;
        break;
      case "256_AES_Revision_6":
        encType = PdfEncryptionType.aesBit256Rev6;
        break;
    }

    // Set security with setSecurity method
    pdf.setSecurity({
      userPassword: userPassword,
      ownerPassword: ownerPassword,
      encryptionType: encType
    });

    // Extract key size and algorithm from encryption type
    let keySize = '';
    let algorithm = '';

    if (encryptionType) {
      // Extract key size: 40, 128, or 256
      const keySizeMatch = encryptionType.match(/(\d+)/);
      keySize = keySizeMatch ? keySizeMatch[1] : '';

      // Extract algorithm: RC4 or AES
      if (encryptionType.includes('RC4')) {
        algorithm = 'RC4';
      } else if (encryptionType.includes('AES')) {
        algorithm = 'AES';
      }
    }

    // Create content text
    const text = "Security options:\n\n" +
      `KeySize: ${keySize}\n\n` +
      `Encryption Algorithm: ${algorithm}\n\n` +
      `Owner Password: ${ownerPassword}\n\n` +
      `Permissions: Print, FullQualityPrint\n\n` +
      `User Password: ${userPassword}`;

    // Draw text on page
    graphics.drawString("Document is Encrypted with following settings", font, { x: 10, y: 20, width: 500, height: 100 }, black);
    graphics.drawString(text, smallFont, { x: 40, y: 80, width: 500, height: 400 }, black);

    // Save and download PDF
    pdf.save('Secure.pdf');
    pdf.destroy();

    this.showNote('PDF encrypted and downloaded successfully!');
  }

  /**
   * Ensures the note host element exists.
   */
  private ensureNoteHost(): HTMLDivElement {
    let host = document.getElementById('noteMessage') as HTMLDivElement | null;
    if (!host) {
      host = document.createElement('div');
      host.id = 'noteMessage';
      host.style.display = 'none';
      host.style.position = 'fixed';
      host.style.top = '20px';
      host.style.right = '20px';
      host.style.backgroundColor = '#4caf50';
      host.style.color = 'white';
      host.style.padding = '16px';
      host.style.borderRadius = '4px';
      host.style.zIndex = '10000';
      host.style.maxWidth = '300px';
      document.body.appendChild(host);
    }
    return host;
  }

  /**
   * Shows a notification message.
   */
  private showNote(msg: string): void {
    const noteEl = this.ensureNoteHost();
    noteEl.textContent = msg;
    noteEl.style.display = 'block';
    try {
      setTimeout(() => this.hideNote(), 5000);
    } catch { }
  }

  /**
   * Hides the notification message.
   */
  private hideNote(): void {
    const noteEl = document.getElementById('noteMessage') as HTMLDivElement | null;
    if (noteEl) noteEl.style.display = 'none';
  }
}
