/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetYourGuideConnection } from './GetYourGuideConnection';
import type { Partner } from './Partner';
import type { PartnersConnection } from './PartnersConnection';
import type { Reseller } from './Reseller';
import type { Supplier } from './Supplier';
export type WhoIAm = {
	supplier: Supplier;
	connection: GetYourGuideConnection | PartnersConnection;
	partner: Partner;
	reseller: Reseller;
	checkout: any;
	operator: any;
	terminal: any;
};
