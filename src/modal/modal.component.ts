import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from "@angular/core";
	
@Component({
    selector: 'modal-header',
    template: `<ng-content></ng-content>`
})
export class ModalHeader { }

@Component({
    selector: 'modal-body',
    template: `<ng-content></ng-content>`
})
export class ModalContent { }

@Component({
    selector: 'modal-footer',
    template: `<ng-content></ng-content>`
})
export class ModalFooter { }

@Component({
	selector: 'modal',
	styles: [`
.modal .modal-header.modal-header-success h4,
.modal .modal-header.modal-header-warning h4,
.modal .modal-header.modal-header-danger h4,
.modal .modal-header.modal-header-primary h4,
.modal .modal-header.modal-header-info h4 { color: #fff; }

.modal .modal-header.modal-header-success { background-color: rgba(76,175,80,1); }
.modal .modal-header.modal-header-warning { background-color: rgba(255,152,0,1); }
.modal .modal-header.modal-header-danger  { background-color: rgba(229,28,35,1); }
.modal .modal-header.modal-header-info    { background-color: rgba(156,39,176,1); }
.modal .modal-header.modal-header-primary { background-color: rgba(33,150,243,1); }

.modal .modal-dialog.loading .modal-content .modal-header,
.modal .modal-dialog.loading .modal-content .modal-body,
.modal .modal-dialog.loading .modal-content .modal-footer {
	-webkit-filter: blur(1px);
	-moz-filter: blur(1px);
	-o-filter: blur(1px);
	-ms-filter: blur(1px);
	filter: blur(1px);
}
.modal .modal-dialog.loading .modal-overlay { opacity: 1; z-index: 30; }
.modal .modal-dialog .modal-overlay {
	-webkit-transition: opacity .5s ease-in-out;
	-moz-transition: opacity .5s ease-in-out;
	-o-transition: opacity .5s ease-in-out;
	transition: opacity .5s ease-in-out;
	background-color: rgba(255,255,255,0.5);
	background-image: url('/assets/images/loading.svg');
	background-repeat: no-repeat;
	background-size: 20%;
	background-position: center center;
	position: absolute;
	cursor: progress;
	top: 0px;
	bottom: 0px;
	left: 0px;
	right: 0px;
	z-index: -1;
	opacity: 0;
}
	`],
	template: `
<div 
	#modalRoot

	class="modal fade" 
	tabindex="-1"
	role="dialog"

	(click)="closeOnOutsideClick ? closeCheckClick($event) : 0"
	(keydown.esc)="closeOnEscape ? close() : 0"
	[class.in]="isOpened"
	[style.display]="isBlock ? 'block' : 'none'"
>
	<div class="modal-dialog {{modalClass}} {{isLoading ? 'loading' : ''}}">

		<div class="modal-content" tabindex="0" *ngIf="isOpened">

			<!-- Loading state item -->
			<div class="modal-overlay"></div>
		
			<div *ngIf="!hideModalHeader" class="modal-header">
			
				<button 
					*ngIf="!hideCloseButton" 
					type="button" 
					class="close" 
					data-dismiss="modal" 
					[attr.aria-label]="cancelButtonLabel || 'Close'" 
					(click)="close()"
				><span aria-hidden="true">&times;</span></button>

                <h4 class="modal-title" *ngIf="title">{{ title }}</h4>
                <ng-content select="modal-header"></ng-content>
			</div>
			
            <div *ngIf="!hideModalBody" class="modal-body">
                <ng-content select="modal-body"></ng-content>
			</div>
			
            <div *ngIf="!hideModalFooter" class="modal-footer">
                <ng-content select="modal-footer"></ng-content>
                <button *ngIf="cancelButtonLabel" type="button" class="btn btn-default" data-dismiss="modal" (click)="close()">{{ cancelButtonLabel }}</button>
                <button *ngIf="submitButtonLabel" type="button" class="btn btn-primary" (click)="onSubmit.emit(undefined)">{{ submitButtonLabel }}</button>
			</div>
			
        </div>
    </div>
</div>`
})

export class Modal {

    // -------------------------------------------------------------------------
    // Inputs
    // -------------------------------------------------------------------------

	@Input() public modalClass: string;

    @Input() public closeOnEscape: boolean = true;

    @Input() public closeOnOutsideClick: boolean = true;

    @Input() public title: string;

    @Input() public hideCloseButton = false;
    @Input() public hideModalHeader = false;
    @Input() public hideModalBody = false;
    @Input() public hideModalFooter = false;

    @Input() public cancelButtonLabel: string;

    @Input() public submitButtonLabel: string;

    @Input() public backdrop:boolean = true;

    // -------------------------------------------------------------------------
    // Outputs
    // -------------------------------------------------------------------------

    @Output()
    public onOpen = new EventEmitter(false);

    @Output()
    public onClose = new EventEmitter(false);

    @Output()
    public onSubmit = new EventEmitter(false);

    // -------------------------------------------------------------------------
    // Public properties
    // -------------------------------------------------------------------------

	public isOpened = false;
	public isBlock = false;
	public isLoading = false;

    // -------------------------------------------------------------------------
    // Private properties
    // -------------------------------------------------------------------------

    @ViewChild("modalRoot")
    public modalRoot: ElementRef;

    private backdropElement: HTMLElement;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        this.createBackDrop();
    }

    // -------------------------------------------------------------------------
    // Lifecycle Methods
    // -------------------------------------------------------------------------

    ngOnDestroy() {
        document.body.className = document.body.className.replace(/modal-open\b/, "");
        if (this.backdropElement && this.backdropElement.parentNode === document.body)
            document.body.removeChild(this.backdropElement);
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    open(...args: any[]) {

		// If already opened
		if (this.isOpened) return;

		// Set element to block state
		this.isBlock = true;

		// Add the backdrop but wait with activation
		document.body.appendChild(this.backdropElement);
		document.body.className += " modal-open";

		// Actual init of the window
		window.setTimeout(() => {
			
			this.backdropElement.classList.add("in");		// At fade class
			this.isOpened = true;							// Set it to open
			this.onOpen.emit(args);							// Call all listeners
			this.modalRoot.nativeElement.focus()			// Focus

		}, 0);
    }


    close(...args: any[]) {

		// If not open do not continue
        if (!this.isOpened) return;
		
		// Remove loading state
		this.complete()

		this.isOpened = false;
		this.isBlock = false;
		this.onClose.emit(args);
		this.backdropElement.classList.remove("in")

		// Set listeners for removing
		this.addEventListenerOnce(this.backdropElement, "transitionend", () => removeElement.bind(this)())
		
		// Remove element if it still exists
		function removeElement() {

			let elementPresent = document.body.contains(this.backdropElement);
			
			if(elementPresent) {
				document.body.removeChild(this.backdropElement);
				document.body.className = document.body.className.replace(/modal-open\b/, "");
			}
		}
	}

	loading() {
		this.isLoading = true;
	}
	complete() {
		this.isLoading = false;
	}
	
    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    public closeCheckClick(event: MouseEvent) {

		// Check origin of the click to determine if close
		// Only close if clicked on the faded element
		if(this.modalRoot.nativeElement === event.target) this.close()
    }

    private createBackDrop() {
		
        this.backdropElement = document.createElement("div");
		this.backdropElement.classList.add("fade");
        
        if(this.backdrop) {
            this.backdropElement.classList.add("modal-backdrop");
		}
	}
	
	private addEventListenerOnce(target:any, type:any, listener: any) {
		target.addEventListener(type, function fn(event: any) {
			target.removeEventListener(type, fn);
			listener(event);
		})
	}
}
