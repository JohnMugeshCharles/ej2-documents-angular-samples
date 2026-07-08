import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DefaultPdfComponent } from './default.component';
import { BulletsListsPdfComponent } from './bullets-and-lists.component';
import { JobApplicationComponent } from './job-application.component';
import { HelloPdfComponent } from './hello-world.component';
import { RtlPdfComponent } from './rtl-text.component';
import { TextFlowComponent } from './text-flow.component';
import { ShapesPdfComponent } from './shapes.component';
import { ImagesPdfComponent } from './image-insertion.component';
import { ExtractImagePdfComponent } from './extract-image.component';
import { ExtractTextPdfComponent } from './extract-text.component';
import { PdfSignComponent } from './digital-signature.component';
import { PdfRedactionComponent } from './redaction.component';
import { PdfDocPropertiesComponent } from './document-settings.component';
import { PdfPageSettingsComponent } from './page-settings.component';
import { PdfLayersComponent } from './layer.component';
import { PdfFormFillComponent } from './form-fillings.component';
import { PdfBookmarkComponent } from './bookmark.component';
import { PdfMergeComponent } from './merge-documents.component';
import { RearrangePagesComponent } from './rearrange-pages.component';
import { PdfSplitComponent } from './split-pdf.component';
import { PdfWatermarkComponent } from './watermark-pdf.component';
import { AnnotationsComponent } from './annotations.component';

export const pdfAppRoutes: Object[] = [
    // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/default', component: DefaultPdfComponent, name: 'Default', order: '01', category: 'PDF', description: 'This sample demonstrates how to create a simple PDF document with text and images.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/job-application', component: JobApplicationComponent, name: 'Job Application', order: '02', category: 'PRODUCT SHOWCASE', description: 'This sample demonstrates the creation of job application form from the scratch using form fields. The user can fill the online job application, then download as a PDF document.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/hello-world', component: HelloPdfComponent, name: 'Hello World', order: '03', category: 'GETTING STARTED', description: 'This sample demonstrates how to create a simple PDF document using JavaScript PDF Library.' },
    // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/bullets-and-lists', component: BulletsListsPdfComponent, name: 'Bullets And Lists', order: '04', category: 'DRAWING TEXT', description: 'This sample demonstrates how to list the content in ordered and unordered list. The ordered list can be number or alphabets and the unordered list can be bullets, circles, and images.' },
    // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/rtl-text', component: RtlPdfComponent, name: 'RTL Text', order: '04', category: 'DRAWING TEXT', description: 'This sample demonstrates drawing right-to-left language text in the PDF document. It is possible to draw RTL languages such as Arabic, Hebrew, Persian, Urdu and more.' },
    // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/text-flow', component: TextFlowComponent, name: 'Text Flow', order: '04', type: 'new', category: 'DRAWING TEXT', description: 'This sample demonstrates the creation of PDF document with large text that flows over multiple pages. The user can also draw multiple paragraphs sequentially.' },
    // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/shapes', component: ShapesPdfComponent, name: 'Shapes', order: '05', category: 'GRAPHICS', description: 'This sample demonstrates drawing of shapes such as Ellipse, Arcs, Polygon, Pie, and Rectangle in the PDF document.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/image-insertion', component: ImagesPdfComponent, name: 'Image Insertion', order: '05', category: 'GRAPHICS', description: 'This sample demonstrates insertion of JPEG and PNG images in the PDF document.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/extract-image', component: ExtractImagePdfComponent, name: 'Extract Image', order: '06', category: 'IMPORT AND EXPORT', description: 'This sample demonstrates how to extract images from the PDF document. The extracted images can be saved into any raster image format.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/extract-text', component: ExtractTextPdfComponent, name: 'Extract Text', order: '06', category: 'IMPORT AND EXPORT', description: 'This sample demonstrates how to extract the text from the PDF document.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/digital-signature', component: PdfSignComponent, name: 'Digital Signature', order: '07', category: 'SECURITY', description: 'This sample demonstrates how to digitally sign the PDF document with the PFX certificate file. It is possible to digitally sign with X509 certificates such as .pfx files with private keys.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/redaction', component: PdfRedactionComponent, name: 'Redaction', order: '07', category: 'SECURITY', description: 'This sample demonstrates redacting a text from the PDF document. It is also possible to redact the images. The redaction is a process of removing sensitive or unwanted information from the PDF document.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/document-settings', component: PdfDocPropertiesComponent, name: 'Document Settings', order: '08', category: 'SETTINGS', description: 'This sample demonstrates adding PDF document properties such as title, author, keyword, subject, and producer etc.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/page-settings', component: PdfPageSettingsComponent, name: 'Page Settings', order: '08', category: 'SETTINGS', description: 'This sample demonstrates adding pages with different settings such as rotation, orientation and page size' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/layer', component: PdfLayersComponent, name: 'Layers', order: '08', category: 'SETTINGS', description: 'This sample demonstrates adding layers (Optional Content Group) with different shapes in the PDF document. The Syncfusion JavaScript PDF Library also supports to create, merge, and toggle the layers.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/annotations', component: AnnotationsComponent, name: 'Annotations', order: '09', category: 'USER INTERACTION', description: 'This sample demonstrates the creation of different types of annotations such as ink, free text, pop up, text markup, calibrate annotation and more.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/form-fillings', component: PdfFormFillComponent, name: 'Form Filling', order: '09', category: 'USER INTERACTION', description: 'This sample demonstrates how to fill and flatten the form fields to personalize your PDF document. It is also possible to create, edit, flatten and delete the form fields using the JavaScript PDF Library.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/bookmark', component: PdfBookmarkComponent, name: 'Bookmarks', order: '09', category: 'USER INTERACTION', description: 'This sample demonstrates how to add bookmark with the different style in the document. It is also possible to insert, remove, change text appearance, change destination and more from the PDF document.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/merge-documents', component: PdfMergeComponent, name: 'Merge Documents', order: '10', category: 'MODIFY DOCUMENTS', description: 'This sample demonstrates how to merge two different PDF documents into a single PDF. You can also import selective pages.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/split-pdf', component: PdfSplitComponent, name: 'Split PDF', order: '10', category: 'MODIFY DOCUMENTS', description: 'This sample demonstrates how to split the pages of a PDF into multiple PDF documents.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/watermark-pdf', component: PdfWatermarkComponent, name: 'Watermark PDF', order: '10', category: 'MODIFY DOCUMENTS', description: 'This sample demonstrates how to stamp an existing PDF document using text. The JavaScript PDF Library supports both stamp or watermark with text and images in the PDF document.' },
    // // tslint:disable-next-line:max-line-length
    { path: ':theme/pdf/rearrange-pages', component: RearrangePagesComponent, name: 'Rearrange Pages', order: '10', category: 'MODIFY DOCUMENTS', description: 'This sample demonstrates how to rearrange pages from an existing PDF document to make the document meaningful.' },


];

export const PdfSampleModule: ModuleWithProviders<any> = RouterModule.forChild(pdfAppRoutes);