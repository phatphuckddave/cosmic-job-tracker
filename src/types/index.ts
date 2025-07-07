export type IsoDateString = string;
export type RecordIdString = string;

export enum IndJobStatusOptions {
  "Planned" = "Planned",
  "Acquisition" = "Acquisition", 
  "Running" = "Running",
  "Done" = "Done",
  "Selling" = "Selling",
  "Closed" = "Closed",
  "Tracked" = "Tracked",
}

export type IndBillitemRecord = {
  created?: IsoDateString;
  id: string;
  name: string;
  quantity: number;
  updated?: IsoDateString;
};

export type IndTransactionRecord = {
  buyer?: string;
  corporation?: string;
  created?: IsoDateString;
  date: IsoDateString;
  id: string;
  itemName: string;
  job?: RecordIdString;
  location?: string;
  quantity: number;
  totalPrice: number;
  unitPrice: number;
  updated?: IsoDateString;
  wallet?: string;
};

export type IndJob = {
  billOfMaterials?: IndBillitemRecord[];
  consumedMaterials?: IndBillitemRecord[];
  created?: IsoDateString;
  expenditures?: IndTransactionRecord[];
  id: string;
  income?: IndTransactionRecord[];
  jobEnd?: IsoDateString;
  jobStart?: IsoDateString;
  outputItem: string;
  outputQuantity: number;
  produced?: number;
  saleEnd?: IsoDateString;
  saleStart?: IsoDateString;
  status: IndJobStatusOptions;
  updated?: IsoDateString;
  projectedCost?: number;
  projectedRevenue?: number;
};

export interface CollapsedSections {
  [key: string]: boolean;
}