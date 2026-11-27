/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Card } from './Card';
import type { PaymentSource } from './PaymentSource';
export type Payment = {
	id: string;
	source: PaymentSource;
	gateway: string | null;
	gatewayReference: string | null;
	card: Card | null;
};
