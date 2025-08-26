/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Seat } from './Seat';
export type Resource = {
	/**
	 * Unique identifier for the resource.
	 */
	id: string;
	/**
	 * Display name of the resource.
	 */
	title: string;
	/**
	 * Indicates whether the resource has seating.
	 */
	seating: boolean;
	/**
	 * List of seats available in this resource.
	 */
	seats: Array<Seat>;
};
