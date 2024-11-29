import { useEffect, useState } from "react";
import styled from "styled-components";
import InputText from "../components/InputText";
import InputCheckbox from "../components/InputCheckbox";
import CreationsTable from "../components/CreationsTable";
import ICreationExtended from "../interfaces/ICreationExtended";
import GetCreationsRequest from "../requests/GetCreationsRequest";
import GetSalesRequest from "../requests/GetSalesRequest";
import SalesCharts from "../components/SalesCharts";
import AnimatedButton from "../components/Button";
import { TabsContainer } from "../components/TabContainer";
import { Tab } from "../components/Tab";
import { ProfileBox } from "../components/ProfileBox";
import GetProfileRequest from "../requests/GetProfileRequest";
import IProfile from "../interfaces/IProfile";
import ISale from "../interfaces/ISale";
import { UploadsCalendar } from "../components/UploadsCalendar";
import { BuyersData } from "../components/BuyersData";

import InfoIcon from '@mui/icons-material/Info';
import { Tooltip } from "@mui/material";

import tokengif from '../assets/gettoken.gif';
import { Loader } from "../components/Loader";
import { LogoutBox } from "../components/LogoutBox";

const InfoBox = styled.div`
  width: 80%;
  background: #7ea8f9;
  padding: 20px;
  border-radius: 15px;
  border: 3px solid #3068d4;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: flex-start;
  align-items: flex-start;
  gap: 10px;

  p {
    margin: 0;
  }

  a {
    color: black;
    text-decoration: underline;

    &:hover {
      color: #666;
    }
  }

  img {
    max-width: 400px;
    border-radius: 10px;
    transform-origin: center;
    transition: transform 400ms;
    box-shadow: 0 0 8px black;

    &:hover {
      transform: scale(1.5);
    }
  }
`;

const Logo = styled.div`
  position: absolute;
  right: 20px;
  top: -2.1em;
  z-index: 999;
  font-family: "Exo", sans-serif !important;
  font-size: 2.8em;
  line-height: 2.8em;
  filter: none;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px BLACK;
  transform: rotate(-2deg);
  pointer-events: none;
`;

const OutsideContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  align-items: center;

  box-shadow: inset 0 0 120px #200e0ead;
  min-height: 100%;
  justify-content: flex-start;
`;

const MainContainer = styled.div`
  padding: 50px;
  margin-top: 50px;
  margin-bottom: 50px;
  border-radius: 10px;
  background-color: rgb(207 128 241);
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-content: center;
  gap: 8px;
`;

const LoginBox = styled(MainContainer)`
  margin-top: 88px;
  gap: 10px;
  position: relative;
  filter: drop-shadow(2px 4px 6px black);
`;
const LoggedInBox = styled(MainContainer)`
  margin-top: 0;
  gap: 0px;
  position: relative;
  filter: drop-shadow(2px 4px 6px black);
`;

const LoggedInTabsContainer = (props: any) => {
  return <TabsContainer>
    {props.children}
  </TabsContainer>
}

enum Tabs {
  Profile = 'Profile',
  MyItems = 'My Items',
  Sales = 'Sales',
  Calendar = 'Calendar',
  Buyers = 'Buyers',
}

function Start() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [username, setUsername] = useState(window.localStorage.getItem('cults3dstats_username') ?? '');
  const [token, setToken] = useState(window.localStorage.getItem('cults3dstats_token') ?? '');
  const [rememberCredentials, setRememberCredentials] = useState(false);
  const [creations, setCreations] = useState<ICreationExtended[] | null>(null);
  const [sales, setSales] = useState<ISale[] | null>(null);
  const [profile, setProfile] = useState<IProfile | null>(null);

  const tabs: Tabs[] = [
    Tabs.Profile,
    Tabs.MyItems,
    Tabs.Sales,
    Tabs.Calendar,
    Tabs.Buyers
  ];

  const [selectedTab, setSelectedTab] = useState<Tabs>(Tabs.Profile);

  const sendCredentials = async () => {
    if (!username || !token) {
      return;
    }

    setLoading(true);
    setIsLoggedIn(true);

    if (rememberCredentials) {
      window.localStorage.setItem('cults3dstats_username', username);
      window.localStorage.setItem('cults3dstats_token', token);
    }

    try {
      const creations = await GetCreationsRequest(username, token);
      console.log('creations', creations);
  
      const sales = await GetSalesRequest(username, token);
      console.log('sales', sales);
  
      const profile = await GetProfileRequest(username, token);
      console.log('profile', profile);
  
      setCreations(creations);
      setSales(sales);
      setProfile(profile);
  
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(err);
    }
  };

  let loaded = false;

  useEffect(() => {
    if (!loaded) {
      loaded = true;

      if (username && username !== '' && token && token !== '') {
        sendCredentials();
      }
    }
  }, []);

  const getErrorText = () => {
    if ((error as string) === 'TOO_MANY_REQUESTS') {
      return 'Too many requests has been made to the Cults3D API. Please try again at a later time.'
    } else {
      return 'Something went wrong, please try again later'
    }
  }

  return (
    <OutsideContainer>
      {
        loading ? (
          <LoginBox>
            <Logo>
              Cults3D Analyzer
            </Logo>
            <Loader />
          </LoginBox>
        ) : null
      }
      {
        !loading && error ? (
          <LoginBox>
            <Logo>
              Cults3D Analyzer
            </Logo>
            <LogoutBox isLoggedIn={isLoggedIn} username={username} />
            <div style={{
              padding: '20px'
            }}>
            {getErrorText()}
            </div>
          </LoginBox>
        ) : null
      }
      {
        !isLoggedIn && !loading ? (
          <LoginBox>
            <Logo>
              Cults3D Analyzer
            </Logo>

            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              alignContent: 'center',
              flexDirection: 'row',
            }}>
              <InputText placeholder="Cults3D username" type="text" onChange={ev => setUsername(ev.target.value)} />
              <Tooltip
                title={
                  <div>
                    The username of your Cults3D account
                  </div>
                }
                arrow
                componentsProps={{ tooltip: { sx: { fontSize: '0.9em', maxWidth: '400px', width: 'auto', opacity: '1 !important' } } }}
                followCursor={true}
              >
                <InfoIcon />
              </Tooltip>
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              alignContent: 'center',
              flexDirection: 'row',
            }}>
              <InputText placeholder="Cults3D token" type="password" onChange={ev => setToken(ev.target.value)} />
              <Tooltip
                title={
                  <div>
                    A generated token for your account. See description below on how to generate a token.
                  </div>
                }
                arrow
                componentsProps={{ tooltip: { sx: { fontSize: '0.9em', maxWidth: '400px', width: 'auto', opacity: '1 !important' } } }}
                followCursor={true}
              >
                <InfoIcon />
              </Tooltip>
            </div>



            <InfoBox>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px'
              }}>
                <InfoIcon />
                <div>
                  The Cults3D token is not the same as your account password. A token is basically a key that can be used
                  to access data via <a href="https://cults3d.com/en/pages/graphql" target="_blank">the official Cults3D GraphQL-API</a>, which is a service they themselves provide.
                  Using this API, this tool can read data related to your account, such as sales and objects, but it cannot perform any other actions.
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px'
              }}>
                <div>
                  <h3 style={{
                    margin: '0'
                  }}>
                    How to get a token?
                  </h3>
                  <ol>
                    <li>Go to <a href="https://cults3d.com" target="_blank">Cults3D</a></li>
                    <li>Login to your account</li>
                    <li>Go to Settings and then click the API tab (<a href="https://cults3d.com/en/api/keys" target="_blank">direct link</a>)</li>
                    <li>Click "Create API Key"</li>
                    <li>Once created, copy the key and use it to authenticate in this site. Store it somewhere safe. You can always remove the API key from Cults at any time if you want.</li>
                  </ol>
                </div>
                <div>
                  <img src={tokengif} />
                </div>
              </div>
            </InfoBox>

            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              alignContent: 'center',
              flexDirection: 'row',
            }}>
              <InputCheckbox onChange={() => setRememberCredentials(!rememberCredentials)} checked={rememberCredentials} label="Remember Credentials" />
              <Tooltip
                title={
                  <div>
                    Check this if you want this site to remember your username and token until next time. It will be stored in your browsers cache and can be cleared at any time.
                  </div>
                }
                arrow
                componentsProps={{ tooltip: { sx: { fontSize: '0.9em', maxWidth: '400px', width: 'auto', opacity: '1 !important' } } }}
                followCursor={true}
              >
                <InfoIcon />
              </Tooltip>
            </div>
            <AnimatedButton onClick={() => sendCredentials()}>
              Analyze account
            </AnimatedButton>
          </LoginBox>
        ) : null
      }
      {
        (isLoggedIn && creations && sales && !loading) ? (
          <>
            <LoggedInTabsContainer>
              {
                tabs.map(t => (
                  <Tab key={t} className={selectedTab === t ? 'selected' : ''} onClick={() => setSelectedTab(t)}>
                    {t}
                  </Tab>
                ))
              }
            </LoggedInTabsContainer>
            <LoggedInBox>
              <Logo>
                Cults3D Analyzer
              </Logo>
              {
                selectedTab === Tabs.Profile ? (<ProfileBox profile={profile} sales={sales} creations={creations} />) : null
              }
              {
                selectedTab === Tabs.MyItems ? (<CreationsTable creations={creations} />) : null
              }
              {
                selectedTab === Tabs.Sales ? (<>
                  <SalesCharts sales={sales} creations={creations} />
                </>) : null
              }
              {
                selectedTab === Tabs.Calendar ? (<UploadsCalendar creations={creations} sales={sales} />) : null
              }
              {
                selectedTab === Tabs.Buyers ? (<BuyersData sales={sales} />) : null
              }
            </LoggedInBox>
          </>
        ) : null
      }
    </OutsideContainer>
  );
}

export default Start;