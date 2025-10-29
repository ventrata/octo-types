/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Booking } from './Booking';
import type { Brand } from './Brand';
import type { CardPaymentGateway } from './CardPaymentGateway';
import type { ContactField } from './ContactField';
import type { CustomerContact } from './CustomerContact';
import type { Destination } from './Destination';
import type { Gift } from './Gift';
import type { GiftPayment } from './GiftPayment';
import type { Identity } from './Identity';
import type { Membership } from './Membership';
import type { OfferCombination } from './OfferCombination';
import type { Pricing } from './Pricing';
import type { QuestionAnswer } from './QuestionAnswer';
import type { SettlementMethod } from './SettlementMethod';
import type { Ticket } from './Ticket';
export type Order = {
	id: string;
	testMode: boolean;
	settlementMethod: SettlementMethod;
	settlementMethods: Array<SettlementMethod>;
	supplierReference: string;
	quote: boolean;
	status: string;
	utcCreatedAt: string;
	utcExpiresAt: string | null;
	utcConfirmedAt: string | null;
	utcUpdatedAt: string | null;
	cancellable: boolean;
	confirmable: boolean;
	updatable: boolean;
	contact?: CustomerContact;
	emailReceipt?: boolean;
	bookings: Array<Booking>;
	visibleContactFields: Array<ContactField>;
	requiredContactFields: Array<ContactField>;
	voucher: Ticket | null;
	active: boolean;
	termsAccepted?: boolean;
	destination?: Destination;
	brand?: Brand;
	pricing?: Pricing;
	/**
	 * An array of questions and andswers that will be included in the order.
	 * This field is only present when octo/questions capability is requested.
	 */
	questionAnswers?: Array<QuestionAnswer>;
	identity?: Identity;
	identityId?: string;
	offerCombinations?: Array<OfferCombination>;
	giftPayment?: GiftPayment | null;
	gifts?: Array<Gift>;
	checkinAvailable?: boolean;
	checkinUrl?: string | null;
	membership?: Membership | null;
	cardPayment?: CardPaymentGateway | null;
	returnUrl?: string | null;
};
