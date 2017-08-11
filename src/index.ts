import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import {
	Modal,
	ModalContent,
	ModalFooter,
	ModalHeader
} from './modal/modal.component'

export * from "./modal/modal.component";

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [
		Modal, 
		ModalContent, 
		ModalFooter, 
		ModalHeader,
	],
	exports: [
		Modal, 
		ModalContent, 
		ModalFooter, 
		ModalHeader,
	]
})
export class ModalModule {

}