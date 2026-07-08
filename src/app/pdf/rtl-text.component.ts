import { Component, OnInit } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPageSettings, PdfMargins, PdfPage, PdfGraphics, PdfBrush, PdfStringFormat, PdfTextDirection, PdfTextAlignment, PdfTrueTypeFont } from '@syncfusion/ej2-pdf';

@Component({
  selector: 'control-content',
  templateUrl: './rtl-text.html',
  standalone: true,
})
export class RtlPdfComponent implements OnInit {

  // Remote font URL for Arabic (TrueType). Required for proper Arabic glyph shaping/rendering.
  private arabicFontUrl =
    'https://cdn.syncfusion.com/content/pdf-resources/noto-naskh-arabic-regular.ttf';

  // Remote font URL for Hebrew (TrueType). Ensures the PDF can render Hebrew characters correctly.
  private hebrewFontUrl =
    'https://cdn.syncfusion.com/content/pdf-resources/noto-sans-hebrew-medium.ttf';

  // Angular lifecycle hook (kept empty here since PDF generation is triggered manually via UI action)
  ngOnInit(): void { }

  /**
   * Creates a PDF and draws Right-to-Left (RTL) text blocks (Arabic + Hebrew).
   *
   * Flow:
   *  1) Create PdfDocument and add a page with margins
   *  2) Fetch Arabic and Hebrew TTF font bytes in parallel
   *  3) Create a shared text format configured for RTL direction and right alignment
   *  4) Define two drawing rectangles (top for Arabic, bottom for Hebrew)
   *  5) Draw Arabic and Hebrew text using their respective TrueType fonts
   *  6) Save and destroy document resources
   */
  ngAfterViewInit(): void {
    const btn = new Button({}, '#normalbtn');
    const createPdf = async (): Promise<void> => {

      // Create a new PDF document in memory
      const pdf = new PdfDocument();
      // Configure page margins to provide padding around the text content
      const pageSettings = new PdfPageSettings({
        margins: new PdfMargins(40)
      });
      // Add a page with the above settings
      const page: PdfPage = pdf.addPage(pageSettings);
      // Graphics context used to draw text/shapes on the page
      const graphics: PdfGraphics = page.graphics;
      // ---------- Load fonts (Arabic + Hebrew) ----------
      // Fetch both font files concurrently for better performance
      const [arabicBytes, hebrewBytes] = await Promise.all([
        this.fetchAsUint8Array(this.arabicFontUrl),
        this.fetchAsUint8Array(this.hebrewFontUrl)
      ]);
      // Brush used to render the text color (black)
      const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
      // Read drawable size from graphics to calculate layout rectangles dynamically
      const clientBounds = graphics.clientSize;
      // Rectangle for Arabic paragraph at the top portion of the page
      const rectArabic = {
        x: 0,
        y: 0,
        width: clientBounds.width,
        height: 180
      };
      // Rectangle for Hebrew paragraph in the bottom portion of the page
      // Starts at y=200 to create spacing after the Arabic block
      const rectHebrew = {
        x: 0,
        y: 200,
        width: clientBounds.width,
        height: clientBounds.height - 200
      };
      // ---------- Shared RTL text formatting ----------
      // Configure a string format that renders text Right-to-Left and aligns to the right edge.
      // This is important for Arabic/Hebrew scripts.
      const format = new PdfStringFormat();
      format.textDirection = PdfTextDirection.rightToLeft;
      format.alignment = PdfTextAlignment.right;
      // ---------- Arabic text ----------
      // Create a TrueType font instance from Arabic font bytes
      const arabicFont = new PdfTrueTypeFont(arabicBytes, 13);
      // Draw Arabic paragraph in the top rectangle using RTL format
      graphics.drawString(
        `سنبدأ بنظرة عامة مفاهيمية على مستند PDF بسيط. تم تصميم هذا الفصل ليكون توجيهًا مختصرًا قبل الغوص في مستند حقيقي وإنشاءه من البداية.
يمكن تقسيم ملف PDF إلى أربعة أجزاء: الرأس والجسم والجدول الإسناد الترافقي والمقطورة. يضع الرأس الملف كملف PDF ، حيث يحدد النص المستند المرئي ، ويسرد جدول الإسناد الترافقي موقع كل شيء في الملف ، ويوفر المقطع الدعائي تعليمات حول كيفية بدء قراءة الملف.
رأس الصفحة هو ببساطة رقم إصدار PDF وتسلسل عشوائي للبيانات الثنائية. البيانات الثنائية تمنع التطبيقات الساذجة من معالجة ملف PDF كملف نصي. سيؤدي ذلك إلى ملف تالف ، لأن ملف PDF يتكون عادةً من نص عادي وبيانات ثنائية (على سبيل المثال ، يمكن تضمين ملف خط ثنائي بشكل مباشر في ملف PDF).`,
        arabicFont,
        rectArabic,
        brush,
        format
      );
      // ---------- Hebrew text ----------
      // Create a TrueType font instance from Hebrew font bytes
      const hebrewFont = new PdfTrueTypeFont(hebrewBytes, 13);
      // Draw Hebrew paragraph in the bottom rectangle using the same RTL format
      graphics.drawString(
        `לאחר הכותרת והגוף מגיע טבלת הפניה המקושרת. הוא מתעדת את מיקום הבית של כל אובייקט בגוף הקובץ. זה מאפשר גישה אקראית של המסמך, ולכן בעת עיבוד דף, רק את האובייקטים הנדרשים עבור דף זה נקראים מתוך הקובץ. זה עושה מסמכי PDF הרבה יותר מהר מאשר קודמיו PostScript, אשר היה צריך לקרוא את כל הקובץ לפני עיבוד זה.`,
        hebrewFont,
        rectHebrew,
        brush,
        format
      );
      // Save the generated PDF (usually triggers a download in the browser)
      pdf.save('RTLText.pdf');
      // Release resources used by PdfDocument to avoid memory leaks
      pdf.destroy();
    };
    btn.element.onclick = createPdf;
  }

  /**
   * Fetches a remote file and returns its contents as Uint8Array.
   * Used to download TTF font files so they can be embedded into the PDF.
   */
  private async fetchAsUint8Array(url: string): Promise<Uint8Array> {
    // no-cache helps avoid stale font files during development
    const res = await fetch(url, { cache: 'no-cache' });

    // Fail fast when the resource cannot be fetched
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }

    // Convert response bytes into Uint8Array (expected by PdfTrueTypeFont)
    return new Uint8Array(await res.arrayBuffer());
  }
}