
import { IndJobStatusOptions, IndTransactionRecord } from "./pbtypes"
import { IsoDateString } from "./pbtypes"
import { IndBillitemRecord } from "./pbtypes"

export type IndJob = {
	billOfMaterials?: IndBillitemRecord[]
	consumedMaterials?: IndBillitemRecord[]
	created?: IsoDateString
	expenditures?: IndTransactionRecord[]
	id: string
	income?: IndTransactionRecord[]
	jobEnd?: IsoDateString
	jobStart?: IsoDateString
	outputItem: string
	outputQuantity: number
	produced?: number
	saleEnd?: IsoDateString
	saleStart?: IsoDateString
	status: IndJobStatusOptions
	updated?: IsoDateString
	projectedCost?: number
	projectedRevenue?: number
}

export type IndTransaction = IndTransactionRecord;
