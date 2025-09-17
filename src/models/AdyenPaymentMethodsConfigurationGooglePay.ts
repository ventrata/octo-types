/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AdyenPaymentMethodsConfigurationGooglePay = {
	billingAddressRequired: boolean;
	billingAddressParameters: AdyenPaymentMethodsConfigurationGooglePay.billingAddressParameters;
};
export namespace AdyenPaymentMethodsConfigurationGooglePay {
	export enum billingAddressParameters {
		FULL = 'FULL',
		MIN = 'MIN',
	}
}
