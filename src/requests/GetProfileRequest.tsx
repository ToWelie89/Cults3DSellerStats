//const USE_MOCK = false;

import IProfile from "../interfaces/IProfile";

const GetProfileRequest = async (username: string, token: string) : Promise<IProfile> => {
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

    const url = `${protocol}//${hostname}:${port}/getprofile`

    const res = await fetch(url, {
        method: 'POST',
        headers,
        body: urlencoded,
        redirect: 'follow'
    });
    const json = await res.json();
    return json.data.myself.user;
};

export default GetProfileRequest;