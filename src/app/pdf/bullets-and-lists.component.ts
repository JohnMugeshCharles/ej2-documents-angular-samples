import { Component, OnInit } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfBrush, PdfFontFamily, PdfFontStyle, PdfListItem, PdfListItemCollection, PdfOrderedList, PdfStringFormat, PdfUnorderedList, PdfUnorderedListStyle } from '@syncfusion/ej2-pdf';

@Component({
    selector: 'control-content',
    templateUrl: './bullets-and-lists.html',
    standalone: true,
})
export class BulletsListsPdfComponent implements OnInit {

    /**
     * Angular lifecycle hook.
     * Kept for component initialization if required later (currently no setup needed).
     */
    ngOnInit(): void { }

    /**
     * Creates and downloads a PDF that demonstrates:
     * - Title + introductory paragraph
     * - A main unordered list
     * - An ordered sub-list attached to the first item
     * - An unordered sub-sub-list attached to the second item
     */
    ngAfterViewInit(): void {
        let button: Button = new Button();
        button.appendTo('#successbtn');
        button.element.onclick = (): void => {
            // Create a new PDF document in memory
            const pdf = new PdfDocument();
            // Add a single page where all content will be drawn
            const page = pdf.addPage();
            // ---------------------- Fonts ----------------------
            // Embed fonts once and reuse them across draw/list operations
            const titleFont = pdf.embedFont(PdfFontFamily.helvetica, 14, PdfFontStyle.bold);
            const bodyFont = pdf.embedFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular);
            const listFontBold = pdf.embedFont(PdfFontFamily.timesRoman, 10, PdfFontStyle.bold);
            const listFontItalic = pdf.embedFont(PdfFontFamily.timesRoman, 10, PdfFontStyle.italic);
            const listFont = pdf.embedFont(PdfFontFamily.timesRoman, 10, PdfFontStyle.regular);
            // ---------------------- Title ----------------------
            // Draw the heading near the top center with a dark-blue brush
            page.graphics.drawString(
                'List Features',
                titleFont,
                { x: 225, y: 10, width: 300, height: 50 },
                new PdfBrush({ r: 0, g: 0, b: 139 })
            );
            // ---------------------- Intro text ----------------------
            // Draw a descriptive paragraph below the title.
            // Using page client size to allow text to wrap within the page width.
            page.graphics.drawString(
                'This sample demonstrates various features of bullets and lists. ' +
                'A list can be ordered and unordered. Essential PDF provides support ' +
                'for creating and formatting ordered and unordered lists.',
                bodyFont,
                {
                    x: 0,
                    y: 50,
                    width: page.graphics.clientSize.width,
                    height: page.graphics.clientSize.height - 50
                },
                new PdfBrush({ r: 0, g: 0, b: 0 })
            );
            // ---------------------- String formatting ----------------------
            // Controls how list text is laid out (e.g., spacing between lines)
            const format = new PdfStringFormat();
            format.lineSpacing = 10;
            // ====================== Main unordered list ======================
            // This is the root list with two bullet items
            const mainCollection = new PdfListItemCollection([
                'List of Essential Studio products',
                'IO products'
            ]);
            // Create an unordered list (bulleted) and configure indentation and style
            const mainList = new PdfUnorderedList(mainCollection, {
                font: listFontBold,
                format: format,
                indent: 10,        // overall left indentation for the list block
                textIndent: 10,    // indentation between bullet and text
                style: PdfUnorderedListStyle.disk
            });
            // ====================== Ordered sublist (child of item #1) ======================
            // Create an ordered list that will be attached to the first main list item
            const orderedSubList = new PdfOrderedList(new PdfListItemCollection(), {
                font: listFontItalic,
                format: format,
                indent: 20, // deeper indent to visually nest under the parent item
                brush: new PdfBrush({ r: 0, g: 0, b: 0 })
            });
            // Product names are converted into ordered list items:
            // Essential Tools, Essential Grid, etc.
            const products = [
                'Tools', 'Grid', 'Chart', 'Edit', 'Diagram',
                'XlsIO', 'Grouping', 'Calculate', 'PDF',
                'HTMLUI', 'DocIO'
            ];
            // Add each product as a numbered list entry
            products.forEach(p =>
                orderedSubList.items.add(new PdfListItem('Essential ' + p))
            );
            // Attach the ordered sublist to the first bullet item of the main list
            mainList.items.at(0).subList = orderedSubList;
            // ====================== Unordered sub-sub list (child of item #2) ======================
            // Long descriptions added as nested bullets under the second main list item
            const descriptionCollection = new PdfListItemCollection([
                'Essential PDF: It is a .NET library with the capability to produce Adobe PDF files. It features a full-fledged object model for the easy creation of PDF files from any .NET language. It does not use any external libraries and is built from scratch in C#. It can be used on the server side (ASP.NET or any other environment) or with Windows Forms applications. Essential PDF supports many features for creating a PDF document. Drawing Text, Images, Shapes, etc can be drawn easily in the PDF document.',
                'Essential DocIO: It is a .NET library that can read and write Microsoft Word files. It features a full-fledged object model similar to the Microsoft Office COM libraries. It does not use COM interop and is built from scratch in C#. It can be used on systems that do not have Microsoft Word installed. Here are some of the most common questions that arise regarding the usage and functionality of Essential DocIO.',
                'Essential XlsIO: It is a .NET library that can read and write Microsoft Excel files (BIFF 8 format). It features a full-fledged object model similar to the Microsoft Office COM libraries. It does not use COM interop and is built from scratch in C#. It can be used on systems that do not have Microsoft Excel installed, making it an excellent reporting engine for tabular data. ',
            ]);
            // Create a square-bullet list for descriptions, nested under the second item
            const unorderedSubList = new PdfUnorderedList(descriptionCollection, {
                font: listFont,
                format: format,
                indent: 20,
                style: PdfUnorderedListStyle.square,
                brush: new PdfBrush({ r: 0, g: 0, b: 0 })
            });
            // Attach the unordered sublist to the second bullet item of the main list
            mainList.items.at(1).subList = unorderedSubList;
            // ---------------------- Draw the combined list tree ----------------------
            // This renders mainList along with its nested sublists into the page region below the intro text.
            mainList.draw(page, {
                x: 0,
                y: 130,
                width: page.graphics.clientSize.width,
                height: page.graphics.clientSize.height - 130
            });
            // ---------------------- Save + Cleanup ----------------------
            // Save triggers a download in browser contexts
            pdf.save('BulletsAndLists.pdf');
            // Always destroy to release memory/resources after save
            pdf.destroy();
        }
    }
}