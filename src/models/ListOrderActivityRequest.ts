/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityKind } from './ActivityKind';
export type ListOrderActivityRequest = {
	/**
	 * The order's ID.
	 */
	orderId: string;
	/**
	 * Only entries of these kinds. An unknown kind fails with `BAD_REQUEST`.
	 */
	kinds?: Array<ActivityKind>;
	/**
	 * The most entries per response, from 1 to 100. Defaults to 100.
	 */
	limit?: number;
	/**
	 * The cursor from the previous response's Octo-Next-Page header, sent with the same query. A cursor sent with other
	 * `kinds` fails with `BAD_REQUEST`.
	 */
	page?: string;
};
