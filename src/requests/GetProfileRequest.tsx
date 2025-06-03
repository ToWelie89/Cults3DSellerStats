//const USE_MOCK = false;

import IProfile from "../interfaces/IProfile";
import { settings } from "../settings";

const GetProfileRequest = async (
  username: string,
  token: string
): Promise<IProfile> => {
  /* if (USE_MOCK) {
        const sales = JSON.parse(GetSalesRequestMock);
        return sales;
    } */

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
    url = `${protocol}//${hostname}/api/getprofile`;
  } else {
    url = `${protocol}//${hostname}:${port}/getprofile`;
  }

  //const url = `${protocol}//${hostname}/api/getprofile`

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: urlencoded,
    redirect: "follow",
  });
  const json = await res.json();
  return json.data.myself.user;
};

export default GetProfileRequest;
