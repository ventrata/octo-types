/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExpediaTicketType } from './ExpediaTicketType';
export type ExpediaTicketTypePrice = {
	ticketType: ExpediaTicketType;
	minimumAge: number;
	maximumAge: number;
	minimumGroupSize: number;
	maximumGroupSize: number;
	partnerTicketTypeId: string;
	basePrice?: string;
	netPrice?: string;
};
