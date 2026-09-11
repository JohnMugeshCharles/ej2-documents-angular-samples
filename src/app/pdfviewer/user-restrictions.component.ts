import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    PdfViewerComponent, LoadEventArgs, LinkAnnotationService, BookmarkViewService,
    MagnificationService, ThumbnailViewService, ToolbarService, NavigationService,
    TextSearchService, TextSelectionService, PrintService, AnnotationService,
    FormFieldsService, FormDesignerService, PageOrganizerService, PdfViewerModule
} from '@syncfusion/ej2-angular-pdfviewer';
import { DropDownListComponent, DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';

interface IRoleInfo {
    badge: string;
    badgeBg: string;
    badgeColor: string;
    text: string;
}

const ROLES: { text: string; value: string }[] = [
    { text: 'Ryan Hodson', value: 'Admin' },
    { text: 'Elton Stoneman', value: 'User' },
    { text: 'Cody Lindley', value: 'ReadOnlyUser' },
];

const ROLE_INFO: { [key: string]: IRoleInfo } = {
    Admin: {
        badge: 'Admin',
        badgeBg: '#dcfce7',
        badgeColor: '#15803d',
        text: 'Full access to create, view, edit, delete, and manage all annotations across the application.',
    },
    User: {
        badge: 'User',
        badgeBg: '#dbeafe',
        badgeColor: '#1d4ed8',
        text: 'Can create annotations, modify their own annotations, and reply to annotations created by others.',
    },
    ReadOnlyUser: {
        badge: 'Read-Only User',
        badgeBg: '#fef3c7',
        badgeColor: '#b45309',
        text: 'Can view annotations and PDFs but cannot create, edit, delete, or reply.',
    },
};

@Component({
    selector: 'user-restrictions',
    templateUrl: 'user-restrictions.html',
    encapsulation: ViewEncapsulation.None,
    providers: [
        LinkAnnotationService, BookmarkViewService, MagnificationService,
        ThumbnailViewService, ToolbarService, NavigationService,
        TextSearchService, TextSelectionService, PrintService, AnnotationService,
        FormFieldsService, FormDesignerService, PageOrganizerService
    ],
    styleUrls: ['pdfviewer.component.css'],
    standalone: true,
    imports: [
        SBActionDescriptionComponent,
        DropDownListModule,
        PdfViewerModule,
        SBDescriptionComponent,
        CommonModule,
    ],
})
export class UserRestrictionsComponent implements OnInit {
    @ViewChild('pdfviewer')
    public pdfviewerControl?: PdfViewerComponent;

    @ViewChild('userDropdown')
    public userDropdown?: DropDownListComponent;

    public document: string = 'https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf';
    public resource: string = 'https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib';

    public selectedRole: string = 'Admin';
    public userOptions: { text: string; value: string }[] = ROLES;
    public userFields: object = { text: 'text', value: 'value' };
    public roleInfo: IRoleInfo = ROLE_INFO['Admin'];

    ngOnInit(): void {
        this.roleInfo = ROLE_INFO[this.selectedRole];
    }

    /**
     * Apply role-based permissions to the live viewer.
     * Mirrors the flow used in the React user-restrictions sample.
     */
    applyRolePermissions(role: string): void {
        const viewer: any = this.pdfviewerControl;
        if (!viewer) {
            return;
        }
        const isAdmin = role === 'Admin';
        const isUser = role === 'User';
        const isReadOnlyUser = role === 'ReadOnlyUser';

        const dropdown: any = this.userDropdown;
        const currentAuthor: string = dropdown && dropdown.text ? dropdown.text : '';

        // Configure default annotation settings
        viewer.annotationSettings = {
            author: currentAuthor,
        };

        if (isReadOnlyUser) {
            const commentPanel: HTMLElement | null = document.querySelector(
                '.e-pv-comment-panel'
            );
            if (commentPanel && commentPanel.style.display === 'block') {
                viewer.isCommandPanelOpen = true;
                viewer.isCommandPanelOpen = false;
            }
        }

        // Handle existing annotations
        if (viewer.annotationCollection) {
            viewer.annotationCollection.forEach((annotation: any) => {
                if (annotation.annotationSettings) {
                    const annotationAuthor: string = annotation.author || '';

                    if (isAdmin) {
                        annotation.annotationSettings = {
                            author: currentAuthor,
                            isLock: false,
                        };
                    } else if (isUser) {
                        // User can only edit own annotations
                        annotation.annotationSettings = {
                            author: currentAuthor,
                            isLock: annotationAuthor !== currentAuthor,
                            allowedInteractions: ['None'],
                        };
                    } else {
                        // ReadOnly User
                        annotation.annotationSettings = {
                            isLock: true,
                            allowedInteractions: ['None'],
                        };
                    }

                    if (viewer.annotation) {
                        viewer.annotation.editAnnotation(annotation);
                    }
                }
            });
        }

        // Form Field Permissions
        if (viewer.formFieldCollections) {
            viewer.formFieldCollections.forEach((field: any) => {
                if (viewer.formDesignerModule) {
                    viewer.formDesignerModule.updateFormField(field, {
                        isReadOnly: !isAdmin,
                    });
                }
            });
        }

        // General Permissions
        if (isAdmin || isUser) {
            viewer.enableTextSelection = true;
            viewer.enableDownload = true;
            viewer.enablePageOrganizer = true;
            viewer.contextMenuOption = 'RightClick';
        } else {
            // ReadOnlyUser
            viewer.enableTextSelection = false;
            viewer.enableDownload = false;
            viewer.enablePageOrganizer = false;
            viewer.contextMenuOption = 'None';

            viewer.isFormDesignerToolbarVisible = false;

            if (viewer.toolbarModule) {
                viewer.toolbarModule.showAnnotationToolbar(false);
            }
        }

        // Toolbar Settings
        if (isAdmin || isUser) {
            viewer.toolbarSettings = {
                showTooltip: false,
                toolbarItems: [
                    'OpenOption',
                    'UndoRedoTool',
                    'PageNavigationTool',
                    'MagnificationTool',
                    'PanTool',
                    'SelectionTool',
                    'CommentTool',
                    'SubmitForm',
                    'AnnotationEditTool',
                    'FormDesignerEditTool',
                    'SearchOption',
                    'PrintOption',
                    'DownloadOption',
                ],
            };
        } else {
            viewer.toolbarSettings = {
                showTooltip: true,
                toolbarItems: [
                    'OpenOption',
                    'PageNavigationTool',
                    'MagnificationTool',
                    'PanTool',
                    'PrintOption',
                ],
            };
        }

        viewer.dataBind();
    }

    /**
     * Handle document load event - apply permissions for current role
     */
    onDocumentLoaded(e: LoadEventArgs): void {
        this.applyRolePermissions(this.selectedRole);
    }

    /**
     * Handle role dropdown change
     */
    onRoleChange(args: any): void {
        const newRole: string = args.value;
        this.selectedRole = newRole;
        this.roleInfo = ROLE_INFO[newRole];
        this.applyRolePermissions(newRole);
    }
}