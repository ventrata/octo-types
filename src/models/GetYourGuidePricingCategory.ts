/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetYourGuideBookingCategory } from './GetYourGuideBookingCategory';
import type { GetYourGuidePrice } from './GetYourGuidePrice';
import type { GetYourGuidePricingTier } from './GetYourGuidePricingTier';
export type GetYourGuidePricingCategory = {
	category: string;
	minTicketAmount: number | null;
	maxTicketAmount: number | null;
	groupSizeMin: number;
	groupSizeMax: number | null;
	ageFrom: number | null;
	ageTo: number | null;
	bookingCategory: GetYourGuideBookingCategory;
	price: Array<GetYourGuidePrice>;
	tiers: Array<GetYourGuidePricingTier> | null;
};
