/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	IndBillitem = "ind_billItem",
	IndFacility = "ind_facility",
	IndJob = "ind_job",
	IndTransaction = "ind_transaction",
	Regionview = "regionview",
	Signature = "signature",
	Sigview = "sigview",
	System = "system",
	WormholeSystems = "wormholeSystems",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
	? { expand?: unknown }
	: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type IndBillitemRecord = {
	created?: IsoDateString
	id: string
	name: string
	quantity: number
	updated?: IsoDateString
}
export type IndBillitemRecordNoId = Omit<IndBillitemRecord, 'id' | 'created' | 'updated'>

export type IndFacilityRecord = {
	created?: IsoDateString
	id: string
	location: string
	name: string
	updated?: IsoDateString
}

export enum IndJobStatusOptions {
	"Planned" = "Planned",
	"Acquisition" = "Acquisition",
	"Running" = "Running",
	"Done" = "Done",
	"Selling" = "Selling",
	"Closed" = "Closed",
	"Tracked" = "Tracked",
}
export type IndJobRecord = {
	billOfMaterials?: RecordIdString[]
	consumedMaterials?: RecordIdString[]
	created?: IsoDateString
	expenditures?: RecordIdString[]
	id: string
	income?: RecordIdString[]
	jobEnd?: IsoDateString
	jobStart?: IsoDateString
	outputItem: string
	outputQuantity: number
	produced?: number
	projectedCost?: number
	projectedRevenue?: number
	saleEnd?: IsoDateString
	saleStart?: IsoDateString
	status: IndJobStatusOptions
	updated?: IsoDateString
}
export type IndJobRecordNoId = Omit<IndJobRecord, 'id' | 'created' | 'updated'>

export type IndTransactionRecord = {
	buyer?: string
	corporation?: string
	created?: IsoDateString
	date: IsoDateString
	id: string
	itemName: string
	job?: RecordIdString
	location?: string
	quantity: number
	totalPrice: number
	unitPrice: number
	updated?: IsoDateString
	wallet?: string
}
export type IndTransactionRecordNoId = Omit<IndTransactionRecord, 'id' | 'created' | 'updated'>

export type RegionviewRecord = {
	id: string
	sigcount?: number
	sysname: string
	sysregion: string
}

export type SignatureRecord = {
	created?: IsoDateString
	dangerous?: boolean
	id: string
	identifier: string
	name?: string
	note?: string
	scanned?: string
	system: RecordIdString
	type?: string
	updated?: IsoDateString
}

export type SigviewRecord = {
	created?: IsoDateString
	dangerous?: boolean
	id: string
	identifier: string
	note?: string
	scanned?: string
	signame?: string
	sysid?: RecordIdString
	system: string
	type?: string
	updated?: IsoDateString
}

export type SystemRecord = {
	connectedTo?: string
	created?: IsoDateString
	id: string
	name: string
	region: string
	updated?: IsoDateString
}

export type WormholeSystemsRecord = {
	connectedSystems?: string
	created?: IsoDateString
	id: string
	solarSystemName: string
	updated?: IsoDateString
	x: number
	y: number
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type IndBillitemResponse<Texpand = unknown> = Required<IndBillitemRecord> & BaseSystemFields<Texpand>
export type IndFacilityResponse<Texpand = unknown> = Required<IndFacilityRecord> & BaseSystemFields<Texpand>
export type IndJobResponse<Texpand = unknown> = Required<IndJobRecord> & BaseSystemFields<Texpand>
export type IndTransactionResponse<Texpand = unknown> = Required<IndTransactionRecord> & BaseSystemFields<Texpand>
export type RegionviewResponse<Texpand = unknown> = Required<RegionviewRecord> & BaseSystemFields<Texpand>
export type SignatureResponse<Texpand = unknown> = Required<SignatureRecord> & BaseSystemFields<Texpand>
export type SigviewResponse<Texpand = unknown> = Required<SigviewRecord> & BaseSystemFields<Texpand>
export type SystemResponse<Texpand = unknown> = Required<SystemRecord> & BaseSystemFields<Texpand>
export type WormholeSystemsResponse<Texpand = unknown> = Required<WormholeSystemsRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	ind_billItem: IndBillitemRecord
	ind_facility: IndFacilityRecord
	ind_job: IndJobRecord
	ind_transaction: IndTransactionRecord
	regionview: RegionviewRecord
	signature: SignatureRecord
	sigview: SigviewRecord
	system: SystemRecord
	wormholeSystems: WormholeSystemsRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	ind_billItem: IndBillitemResponse
	ind_facility: IndFacilityResponse
	ind_job: IndJobResponse
	ind_transaction: IndTransactionResponse
	regionview: RegionviewResponse
	signature: SignatureResponse
	sigview: SigviewResponse
	system: SystemResponse
	wormholeSystems: WormholeSystemsResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'ind_billItem'): RecordService<IndBillitemResponse>
	collection(idOrName: 'ind_facility'): RecordService<IndFacilityResponse>
	collection(idOrName: 'ind_job'): RecordService<IndJobResponse>
	collection(idOrName: 'ind_transaction'): RecordService<IndTransactionResponse>
	collection(idOrName: 'regionview'): RecordService<RegionviewResponse>
	collection(idOrName: 'signature'): RecordService<SignatureResponse>
	collection(idOrName: 'sigview'): RecordService<SigviewResponse>
	collection(idOrName: 'system'): RecordService<SystemResponse>
	collection(idOrName: 'wormholeSystems'): RecordService<WormholeSystemsResponse>
}
