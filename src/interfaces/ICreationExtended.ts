import ICreation, { IPrice } from "./ICreation";

export default interface ICreationExtended extends ICreation {
    priceAfterCut: IPrice;
    totalSalesAmountAfterCut: IPrice;
    createdTimestamp: number;
    updatedTimestamp: number;
}