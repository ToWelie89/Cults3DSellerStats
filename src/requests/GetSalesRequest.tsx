import ISale from "../interfaces/ISale";
import { settings } from "../settings";
import GetSalesRequestMock from "./mocks/GetSalesRequestMock";

const GetSalesRequest = async (
  username: string,
  token: string
): Promise<ISale[]> => {
  if (settings.useMocks) {
    const sales = JSON.parse(GetSalesRequestMock);
    return sales;
  }

  const urlencoded = new URLSearchParams();
  urlencoded.append("username", username);
  urlencoded.append("token", token);

  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = 4000;

  //const url = `${protocol}//${hostname}/api/getsales`

  let url;

  if (settings.prod) {
    url = `${protocol}//${hostname}/api/getsales`;
  } else {
    url = `${protocol}//${hostname}:${port}/getsales`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: urlencoded,
    redirect: "follow",
  });
  const json = await res.json();
  return json;
};

export default GetSalesRequest;
