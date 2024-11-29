export interface ICategory {
    name: string;
}

export interface ICreator {
    nick: string;
}

export interface IIllustration {
    imageUrl: string;
}

export interface ILicense {
    name: string;
}

export interface IComment {
    creator: ICreator;
    text: string;
}

export interface IPrice {
    cents: number;
    currency: string;
}

export default interface ICreation {
    category: ICategory;
    collections?: any[];
    comments: IComment[];
    description: string;
    details: string;
    downloadsCount: number;
    id: string;
    identifier: string;
    illustrationImageUrl: string;
    illustrations: IIllustration[];
    license: ILicense;
    likesCount: number;
    name: string;
    price: IPrice;
    publishedAt: string;
    shortUrl: string;
    slug: string;
    subCategories: ICategory[];
    tags: string[];
    totalSalesAmount: IPrice;
    updatedAt: string;
    url: string;
    viewsCount: number;
    visibility: string;
};