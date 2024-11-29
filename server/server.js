import express from "express";
const app = express();
import cors from 'cors';

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;

const getTotalNumberOfCreations = async (username, token) => {
    const query =
        `
        {
            myself {
                creationsBatch {
                    total
                }
            }
        }
    `;
    const authorization = 'Basic ' + btoa(username + ":" + token);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", authorization);
    myHeaders.append("Content-Type", "application/json");
    const result = await fetch('https://cults3d.com/graphql', {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({
            query
        })
    });

    if (result.status !== 200) {
        console.log('Something went wrong with the request for getTotalNumberOfCreations');
        console.log(result);
        console.log(JSON.stringify(result, null, 4));
    }

    if (result.status === 429) {
        throw 'TOO_MANY_REQUESTS';
    } else {
        const json = await result.json();
        return json;
    }
}

const getTotalNumberOfSales = async (username, token) => {
    const query =
        `
        {
            myself {
                salesBatch {
                total
                }
            }
        }
    `;
    const authorization = 'Basic ' + btoa(username + ":" + token);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", authorization);
    myHeaders.append("Content-Type", "application/json");
    const result = await fetch('https://cults3d.com/graphql', {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({
            query
        })
    });

    if (result.status !== 200) {
        console.log('Something went wrong with the request for getTotalNumberOfSales');
        console.log(JSON.stringify(result, null, 4));
    }

    if (result.status === 429) {
        throw 'TOO_MANY_REQUESTS';
    } else {
        const json = await result.json();
        return json;
    }
}

app.post("/getsales", async (req, res) => {
    console.log("req.body", req.body);
    var myHeaders = new Headers();

    const username = req.body.username;
    const token = req.body.token;
    const authorization = 'Basic ' + btoa(username + ":" + token);

    myHeaders.append("Authorization", authorization);
    myHeaders.append("Content-Type", "application/json");

    const getSalesQuery = (limit, offset) => {
        return `
            {
                myself {
                    salesBatch(limit: ${limit}, offset: ${offset}) {
                        total
                        results {
                            user {
                                nick
                                url
                                imageUrl
                            }
                            commission {
                                cents
                                currency
                            }
                            commissionPercent
                            createdAt
                            creation {
                                name
                                identifier
                                shortUrl
                            }
                            id
                            income {
                                cents
                                currency
                            }
                            orderCountry {
                                code
                                flag
                                name
                            }
                            payedOutAt
                        }
                    }
                }
            }
        `;
    }

    try {
        const totalAmountOfSalesResponse = await getTotalNumberOfSales(username, token);
        const totalAmountOfSales = totalAmountOfSalesResponse.data.myself.salesBatch.total;
        const totalAmountOfRequests = Math.ceil(totalAmountOfSales / 100);

        const requests = [];
        let allSales = [];

        for (let i = 0; i < totalAmountOfRequests; i++) {
            const query = getSalesQuery(100, i * 100);

            const promise = new Promise(async (resolve, reject) => {
                const result = await fetch('https://cults3d.com/graphql', {
                    method: 'POST',
                    headers: myHeaders,
                    body: JSON.stringify({
                        query
                    })
                });
                if (result.status === 429) {
                    reject('TOO_MANY_REQUESTS');
                } else {
                    const json = await result.json();
                    allSales = [
                        ...allSales,
                        ...json.data.myself.salesBatch.results
                    ];
                    resolve();
                }
            });
            requests.push(promise);
        }
        await Promise.all(requests);
        res.send(allSales);
    } catch (err) {
        console.log('the error:')
        console.log(err);
        res.send({
            error: err
        });
    }
});

app.post("/getdata", async (req, res) => {
    console.log("req.body", req.body);
    var myHeaders = new Headers();

    const username = req.body.username;
    const token = req.body.token;
    const authorization = 'Basic ' + btoa(username + ":" + token);

    console.log('authorization', authorization)

    myHeaders.append("Authorization", authorization);
    myHeaders.append("Content-Type", "application/json");

    try {
        const totalAmountOfCreationsResponse = await getTotalNumberOfCreations(username, token);
        const totalAmountOfCreations = totalAmountOfCreationsResponse.data.myself.creationsBatch.total;
        const totalAmountOfRequests = Math.ceil(totalAmountOfCreations / 100);

        const requests = [];
        let allCreations = [];

        const getCreationsQuery = (limit, offset, username) => {
            return `
            {
                creations(limit: ${limit}, offset: ${offset}, creatorNick: "${username}") {
                    id
                    name
                    description
                    details
                    category {
                        name
                    }
                    subCategories {
                        name
                    }
                    comments {
                        creator {
                            nick
                        }
                        text
                    }
                    collections {
                        name
                        url
                    }
                    downloadsCount
                    identifier
                    illustrationImageUrl
                    illustrations {
                        imageUrl
                    }
                    license {
                        name
                    }
                    likesCount
                    price {
                        cents
                        currency
                    }
                    publishedAt
                    updatedAt
                    shortUrl
                    slug
                    tags
                    totalSalesAmount {
                        cents
                        currency
                    }
                    url
                    viewsCount
                    visibility
                }
            }
        `;
        };

        for (let i = 0; i < totalAmountOfRequests; i++) {
            const query = getCreationsQuery(100, i * 100, username);

            const promise = new Promise(async (resolve, reject) => {
                const result = await fetch('https://cults3d.com/graphql', {
                    method: 'POST',
                    headers: myHeaders,
                    body: JSON.stringify({
                        query
                    })
                });

                if (result.status === 429) {
                    reject('TOO_MANY_REQUESTS');
                } else {
                    const json = await result.json();
                    allCreations = [
                        ...allCreations,
                        ...json.data.creations
                    ];
                    resolve();
                }
            });
            requests.push(promise);
        }

        await Promise.all(requests);
        res.send(allCreations);
    } catch (err) {
        console.log('the error:')
        console.log(err);
        res.send({
            error: err
        });
    }
});

app.post("/getprofile", async (req, res) => {
    console.log("req.body", req.body);
    var myHeaders = new Headers();

    const username = req.body.username;
    const token = req.body.token;
    const authorization = 'Basic ' + btoa(username + ":" + token);

    console.log('authorization', authorization)

    myHeaders.append("Authorization", authorization);
    myHeaders.append("Content-Type", "application/json");

    const query =
        `
        {
            myself {
                user {
                    bio
                    nick
                    imageUrl
                    shortUrl
                }
            }
        }
    `;

    const result = await fetch('https://cults3d.com/graphql', {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({
            query
        })
    });

    if (result.status === 200) {
        const json = await result.json();
        res.send(json);
    } else {
        res.send({
            error: result.status
        })
    }
});

app.listen(PORT, () => {
    console.log("Listening on http://127.0.0.1:" + PORT);
});
