import moment from "moment";
import GetCreationsRequestMock from "./mocks/GetCreationsRequestMock";
import ICreationExtended from "../interfaces/ICreationExtended";
import ICreation, { IPrice } from "../interfaces/ICreation";
import { settings } from "../settings";

const formatCreations = (creations: ICreation[]) => {
  const newList: ICreationExtended[] = [];

  creations.forEach((c) => {
    const priceAfterCut: IPrice = {
      cents: c.price.cents * 0.8,
      currency: c.price.currency,
    };

    const totalSalesAmountAfterCut: IPrice = {
      cents: c.totalSalesAmount.cents * 0.8,
      currency: c.price.currency,
    };

    const createdTimestamp = Number(moment(c.publishedAt).format("x"));
    const updatedTimestamp = Number(moment(c.updatedAt).format("x"));

    const formattedItem: ICreationExtended = {
      ...c,
      priceAfterCut,
      totalSalesAmountAfterCut,
      createdTimestamp,
      updatedTimestamp,
    };

    newList.push(formattedItem);
  });

  return newList;
};

const GetCreationsRequest = async (
  username: string,
  token: string
): Promise<ICreationExtended[]> => {
  if (settings.useMocks) {
    const creations = JSON.parse(GetCreationsRequestMock);
    const formattedCreations = formatCreations(creations);
    return formattedCreations;
  }

  const urlencoded = new URLSearchParams();
  urlencoded.append("username", username);
  urlencoded.append("token", token);

  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = 4000;

  let url;
  if (settings.prod) {
    url = `${protocol}//${hostname}/api/getdata`;
  } else {
    url = `${protocol}//${hostname}:${port}/getdata`;
  }
  //	const url = "http://sti-starcraft.org:4000/getdata";

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: urlencoded,
    redirect: "follow",
  });
  const json = await res.json();
  if (!json.error) {
    const formattedCreations = formatCreations(json);
    return formattedCreations;
  } else {
    throw json.error;
  }
};

export default GetCreationsRequest;
