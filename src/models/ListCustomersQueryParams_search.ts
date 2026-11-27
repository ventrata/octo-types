/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Finds customers by any of:
 *
 * - the start of the first or last name, ignoring case: "Pet" finds Petrakis;
 * - the first and last name together, in either order, from 3 characters: "Eleni Pet" or "Petrakis El";
 * - the email address, exactly, ignoring case;
 * - the mobile number, read with the supplier's country when it has no country code;
 * - part of the company name;
 * - the customer's reference, exactly.
 *
 * Takes at least 2 characters; a shorter one fails with `BAD_REQUEST`. Without `search`, lists the customers of the
 * most recent orders, newest first.
 */
export type ListCustomersQueryParams_search = string;
