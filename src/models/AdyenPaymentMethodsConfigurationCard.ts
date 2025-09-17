/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AdyenPaymentMethodsConfigurationCard = {
	hasHolderName: boolean;
	billingAddressRequired: boolean;
	billingAddressMode: AdyenPaymentMethodsConfigurationCard.billingAddressMode;
	data: {
		holderName: string;
		billingAddress: {
			street: string;
			postalCode: string;
			city: string;
			country: string;
			stateOrProvince: string;
		};
	};
	clickToPayConfiguration: {
		merchantDisplayName: string;
		shopperEmail: string;
	};
};
export namespace AdyenPaymentMethodsConfigurationCard {
	export enum billingAddressMode {
		FULL = 'full',
		MIN = 'min',
		NONE = 'none',
	}
}
