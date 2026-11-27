/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A customer of the supplier: the person an order is sold to.
 */
export type Customer = {
	/**
	 * Unique identifier for the customer. Send it as `customerId` when creating an order, to sell the order to this customer.
	 */
	id: string;
	/**
	 * The customer's first name.
	 */
	firstName: string | null;
	/**
	 * The customer's last name.
	 */
	lastName: string | null;
	/**
	 * The customer's full name.
	 */
	fullName: string | null;
	/**
	 * The customer's email address.
	 */
	emailAddress: string | null;
	/**
	 * The customer's mobile number, in E.164 format.
	 */
	phoneNumber: string | null;
	/**
	 * The customer's country, as an ISO 3166-1 alpha-2 code.
	 */
	country: string | null;
	/**
	 * Whether the customer agreed to receive marketing.
	 */
	allowMarketing: boolean;
};
