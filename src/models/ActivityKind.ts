/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * What an activity entry tells. More kinds join as more sources do, such as approvals; treat an unknown kind as a
 * system line.
 */
export enum ActivityKind {
	CREATED = 'CREATED',
	CHANGED = 'CHANGED',
	ATTENDANCE = 'ATTENDANCE',
	NOTE = 'NOTE',
	MESSAGE = 'MESSAGE',
	COMMENT = 'COMMENT',
	MONEY = 'MONEY',
	SYSTEM = 'SYSTEM',
}
