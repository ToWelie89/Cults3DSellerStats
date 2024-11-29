import { IPrice } from "./ICreation";

interface IOrderCountry {
    code: string;
    flag: string;
    name: string;
}

interface IUser {
    nick: string;
    url: string;
    imageUrl: string;
}

interface ICreationShort {
    identifier: string;
    name: string;
    shortUrl: string;
}

export default interface ISale {
    commission: IPrice;
    commissionPercent: number;
    createdAt: string;
    creation: ICreationShort;
    id: string;
    income: IPrice;
    orderCountry: IOrderCountry;
    payedOutAt: string;
    user: IUser;
};