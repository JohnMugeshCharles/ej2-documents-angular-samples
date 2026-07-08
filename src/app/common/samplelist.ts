import { documentEditorAppRoutes } from '../document-editor/document-editor.module';
import { pdfViewerAppRoutes } from '../pdfviewer/pdfviewer.module';
import { spreadsheetAppRoutes } from '../spreadsheet/spreadsheet.module';
import { pdfAppRoutes } from "../pdf/pdf.module";

export let samplesList: any = [
    {
        'name': 'Spreadsheet', 'category': 'Grids', 'order': '04', 'path': 'spreadsheet', 'samples': spreadsheetAppRoutes, 'ftName': 'spreadsheet'
    },
    {
        'name': "PDF Viewer", 'type':'update','category': "File Viewers & Editors", 'order': '11', 'path': "pdfviewer", 'samples': pdfViewerAppRoutes, 'ftName': "pdfviewer"
    },
    {
        'name': 'Word Processor', 'category': 'File Viewers & Editors', 'order': '03', 'path': 'document-editor', 'samples': documentEditorAppRoutes, 'ftName': 'document-editor'
    },
    {
        'name': "PDF", 'type':'preview','category': "Document Processing Library", 'order': '12', 'path': "pdf", 'samples': pdfAppRoutes, 'ftName': "pdf"
    }
];
