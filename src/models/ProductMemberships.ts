/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GiftExpiryUnit } from './GiftExpiryUnit';
import type { MembershipRenewalPaymentMethod } from './MembershipRenewalPaymentMethod';
export type ProductMemberships = {
	isMembership?: boolean;
	/**
	 * Whether a membership renews automatically unless the member turns it off.
	 */
	membershipAutoRenew?: boolean;
	/**
	 * How long a membership lasts, in `membershipDurationUnit`s: 12 for 12 months. Null when the product isn't a
	 * membership. The length in days stays in `freesaleDurationAmount`.
	 */
	membershipDurationAmount?: number | null;
	/**
	 * The calendar unit of `membershipDurationAmount`, so the end date follows the calendar. Null when the product isn't
	 * a membership.
	 */
	membershipDurationUnit?: GiftExpiryUnit | null;
	/**
	 * Whether a membership can be renewed.
	 */
	membershipRenewable?: boolean;
	/**
	 * How a renewal can be paid. Empty when the membership can't be renewed.
	 */
	membershipRenewalPaymentMethods?: Array<MembershipRenewalPaymentMethod>;
	/**
	 * How many days before a renewal the member gets a reminder. Null when no reminder is sent.
	 */
	membershipRenewalReminderDays?: number | null;
};
