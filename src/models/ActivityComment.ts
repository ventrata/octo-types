/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityActor } from './ActivityActor';
import type { ActivityAmount } from './ActivityAmount';
import type { CommentAttachment } from './CommentAttachment';
import type { CommentEdit } from './CommentEdit';
import type { CommentField } from './CommentField';
import type { CommentMessage } from './CommentMessage';
import type { CommentNote } from './CommentNote';
import type { CommentType } from './CommentType';
import type { CommentUpdate } from './CommentUpdate';
/**
 * An entry from the order's log and comment thread.
 */
export type ActivityComment = {
	id: string;
	type: CommentType;
	/**
	 * The dashboard's action, such as `create_booking`, `reschedule_booking`, `relabel_booking`, `sent_mail` or
	 * `user_comment`.
	 */
	action: string;
	/**
	 * The comment's or note's text, or null.
	 */
	body: string | null;
	updates: Array<CommentUpdate>;
	fields: Array<CommentField>;
	/**
	 * How much the entry changed the order's total, negative for a decrease, or null when it didn't.
	 */
	orderTotalChange: ActivityAmount | null;
	/**
	 * Who a `NOTE` entry's note is for; null for other kinds.
	 */
	note: CommentNote | null;
	/**
	 * The message a `MESSAGE` entry sent; null for other kinds.
	 */
	message: CommentMessage | null;
	attachments: Array<CommentAttachment>;
	/**
	 * The comment's earlier texts, oldest first.
	 */
	edits: Array<CommentEdit>;
	/**
	 * When the comment was last edited, or null.
	 */
	utcEditedAt: string | null;
	/**
	 * Who last edited the comment, or null.
	 */
	editedBy: ActivityActor | null;
};
