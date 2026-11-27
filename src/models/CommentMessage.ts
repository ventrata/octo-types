/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CommentMessageMedium } from './CommentMessageMedium';
import type { CommentMessageStatus } from './CommentMessageStatus';
/**
 * A message sent to the customer.
 */
export type CommentMessage = {
	medium: CommentMessageMedium;
	/**
	 * The email address or phone number it was sent to.
	 */
	to: string;
	/**
	 * What was sent, such as `CONFIRMATION` or `TICKETS`.
	 */
	document: string;
	status: CommentMessageStatus;
	utcDeliveredAt: string | null;
	utcOpenedAt: string | null;
	/**
	 * Why sending failed, for a `FAILED` message; otherwise null.
	 */
	error: string | null;
};
