import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {Tooltip} from "./Tooltip";
import {TooltipContent} from "./TooltipContent";

import { Modal, ModalContent, ModalFooter, ModalHeader } from './modal/modal.component'

export * from "./Tooltip";
export * from "./TooltipContent";
export * from "./modal/modal.component";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        Tooltip,
		TooltipContent,
		Modal, ModalContent, ModalFooter, ModalHeader,
    ],
    exports: [
        Tooltip,
		TooltipContent,
		Modal, ModalContent, ModalFooter, ModalHeader,
    ],
    entryComponents: [
        TooltipContent
    ]
})
export class TooltipModule {

}