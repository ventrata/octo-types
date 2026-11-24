/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * The sales channel an order came through, such as Backoffice or Web Checkout. An order's channel is its reseller's,
 * shift's, location's or checkout's, and otherwise one named after the order's source.
 */
export type Channel = {
	id: string;
	name: string;
	tags: Array<string>;
};
