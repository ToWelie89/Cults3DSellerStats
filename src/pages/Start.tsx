import { useState } from "react";

const getData = (username: string, token: string) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", 'Basic ' + btoa(username + ":" + token));
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "_session_id=374a8df751040e9fd2f2fdc02ba439ab");
    fetch('https://cults3d.com/graphql', {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({
            query: `
      creations(limit: 100, offset: 0, creatorNick: "martinsonesson") {
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
    `
        })
    }).then(res => res.json()).then(x => console.log(x));
}

function Start() {
    const [username, setUsername] = useState('');
    const [token, setToken] = useState('');

    return (
        <div>
            <input type="text" onChange={ev => setUsername(ev.target.value)} />
            <input type="password" onChange={ev => setToken(ev.target.value)} />
            <button onClick={() => getData(username, token)}>
              Send
            </button>
        </div>
    );
}

export default Start;