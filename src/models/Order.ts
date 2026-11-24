/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Agent } from './Agent';
import type { Booking } from './Booking';
import type { Brand } from './Brand';
import type { CardPaymentGateway } from './CardPaymentGateway';
import type { Channel } from './Channel';
import type { ContactField } from './ContactField';
import type { CustomerContact } from './CustomerContact';
import type { Destination } from './Destination';
import type { Gift } from './Gift';
import type { GiftPayment } from './GiftPayment';
import type { GiftVoucher } from './GiftVoucher';
import type { Identity } from './Identity';
import type { Membership } from './Membership';
import type { OfferCombination } from './OfferCombination';
import type { Pricing } from './Pricing';
import type { QuestionAnswer } from './QuestionAnswer';
import type { SettlementMethod } from './SettlementMethod';
import type { User } from './User';
import type { Via } from './Via';
export type Order = {
	id: string;
	testMode: boolean;
	settlementMethod: SettlementMethod;
	settlementMethods: Array<SettlementMethod>;
	supplierReference: string;
	quote: boolean;
	status: string;
	internalStatus: string;
	utcCreatedAt: string;
	utcExpiresAt: string | null;
	utcConfirmedAt: string | null;
	utcUpdatedAt: string | null;
	cancellable: boolean;
	confirmable: boolean;
	updatable: boolean;
	agent?: Agent;
	contact?: CustomerContact;
	emailReceipt?: boolean;
	notes?: string | null;
	bookings: Array<Booking>;
	visibleContactFields: Array<ContactField>;
	requiredContactFields: Array<ContactField>;
	voucher: GiftVoucher | null;
	active: boolean;
	/**
	 * The sales channel the order came through. Planned: the dashboard serves it under `ventrata/dashboard` only today.
	 */
	channel?: Channel | null;
	/**
	 * How a staff member's sale reached them. Null when the order wasn't made by staff, or the way isn't known. Planned:
	 * the dashboard doesn't record it yet.
	 */
	via?: Via | null;
	/**
	 * The staff member who created the order. Null for orders no staff member created, such as online and API sales.
	 * Planned: the dashboard serves it under `ventrata/dashboard` only today.
	 */
	user?: User | null;
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
	fingerprintLinkedId?: string | null;
	fingerprintReceived?: boolean;
	recaptchaEnterpriseReceived?: string | null;
	recoveryUrl?: string | null;
	segmentAnonymousId?: string | null;
	utmCampaign?: string | null;
	utmContent?: string | null;
	utmMedium?: string | null;
	utmSource?: string | null;
};
