/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityEntry } from './ActivityEntry';
export type OrderActivity = {
	/**
	 * Newest first, by `utcCreatedAt`, then `id`.
	 */
	activity: Array<ActivityEntry>;
};
