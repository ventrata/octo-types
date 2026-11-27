/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityActorType } from './ActivityActorType';
/**
 * Who or what made an activity entry.
 */
export type ActivityActor = {
	type: ActivityActorType;
	/**
	 * The actor's ID, such as the user's or the reseller's. Null for `CUSTOMER` and `SYSTEM`.
	 */
	id: string | null;
	/**
	 * The actor's name. Null for `CUSTOMER` and `SYSTEM`.
	 */
	name: string | null;
};
