import { Chart } from "react-google-charts";

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import ReactCountryFlag from "react-country-flag";

import { useEffect, useState } from "react";
import ISale from "../interfaces/ISale";
import styled from "styled-components";
import { TabsContainer } from "./TabContainer";
import { Tab } from "./Tab";
import { Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@mui/material";
import { PieChart } from "@mui/x-charts";
import { round } from "../helpers";
import moment from 'moment';
import { Loader } from "./Loader";

interface IBuyersDataProps {
    sales: ISale[];
}

const TooltipContent = styled.div`
    width: auto;
    font-size: 0.8em;
    max-width: 750px;
    min-width: 700px;
    padding-top: 10px;
    gap: 6px;

    .tooltipRow {
        display: flex;
        width: 100%;
        padding: 10px;
        padding-top: 0px;
        padding-bottom: 0px;
        justify-content: space-evenly;
        align-items: flex-start;


        &:last-child {
            padding-bottom: 15px;
        }

        div:nth-child(1) {
            flex: 4
        }
        div:nth-child(2) {
            flex: 2
        }
        div:nth-child(3) {
            flex: 1
        }
    }
`;

const TableHeaderRowStyled = styled(TableRow)`
    th, td {
        cursor: pointer;
        border-bottom-color: black;
        font-weight: 900;

        &:hover {
            background: #9f62ba;
        }
    }
`;

const TableRowStyled = styled(TableRow)`
    cursor: pointer;

    th, td {
        border-bottom-color: black;
        cursor: default;
        transition: background 600ms;
        cursor: pointer;
    }

    &:hover {
        //background: #9f62ba;
        th, td {
            background: #9f62ba;
        }
    }
`;

const BuyersDataContainer = styled.div`
    width: 100%;
`;

const WhiteTab = styled(Tab)`
    background: white;
    &.selected {
        background: white;
        text-decoration: underline;
    }
`;

const TabContentContainer = styled.div`
    background: white;
    width: calc(100% - 40px);
    border-radius: 10px;
    padding: 20px;
    position: relative;
`;

enum Tabs {
    TopBuyers = 'Top Buyers',
    Countries = 'Buyer Origins',
    Map = 'Map',
}

interface IUser {
    nick: string;
    url: string;
    buys: ISale[];
    totalAmountOfBuys: number;
    totalMoneyPaid: number;
    country: string;
    countryCode: string;
}

const tabs: Tabs[] = [
    Tabs.TopBuyers,
    Tabs.Countries,
    Tabs.Map
];

enum SortTypes {
    nick = "nick",
    totalAmountOfBuys = "totalAmountOfBuys",
    totalMoneyPaid = "totalMoneyPaid",
    country = "country"
}

export const BuyersData = (props: IBuyersDataProps) => {
    const [loading, setLoading] = useState<boolean>(true);

    const [selectedTab, setSelectedTab] = useState<Tabs>(Tabs.TopBuyers);
    const [users, setUsers] = useState<IUser[]>([]);

    const [currentSorting, setCurrentSorting] = useState<SortTypes>(SortTypes.totalMoneyPaid);
    const [desc, setDesc] = useState<boolean>(true);

    const [countriesChartSeries, setCountriesChartSeries] = useState<any>(null);

    const [mapData, setMapData] = useState<any>(null);

    let loaded = false;

    useEffect(() => {
        if (!loaded) {
            loaded = true;

            const users: any[] = [];
            props.sales.forEach(sale => {
                const currentUser = users.find(x => x.nick === sale.user.nick);
                if (currentUser) {
                    currentUser.buys.push(sale)
                } else {
                    users.push({
                        nick: sale.user.nick,
                        url: sale.user.url,
                        buys: [
                            sale
                        ]
                    })
                }
            });

            users.forEach(user => {
                user.totalAmountOfBuys = user.buys.length;
                user.totalMoneyPaid = user.buys.reduce((t: number, c: ISale) => {
                    t += c.income.cents;
                    t += c.commission.cents;
                    return t;
                }, 0);
                user.country = (user.buys[0] as ISale).orderCountry.name ?? 'N/A';
                user.countryCode = (user.buys[0] as ISale).orderCountry.code ?? null;
            });

            users.sort((a, b) => b.totalMoneyPaid - a.totalMoneyPaid);

            console.log('users', users);

            const countries: any[] = [];
            users.forEach((user: IUser) => {
                const c = countries.find(x => x.name === user.country);
                if (c) {
                    c.objectsSold += user.totalAmountOfBuys;
                } else {
                    countries.push({
                        name: user.country,
                        objectsSold: user.totalAmountOfBuys
                    });
                }
            })

            const profitPerItemData = countries.sort((a: any, b: any) => b.objectsSold - a.objectsSold).map((c, index) => ({
                id: index,
                value: c.objectsSold,
                label: c.name
            }));

            setCountriesChartSeries([{
                data: profitPerItemData,
                innerRadius: 0,
                paddingAngle: 0.1,
                cornerRadius: 10,
                valueFormatter: (v: any) => (v === null ? '' : `${v.value} sales`),
                arcLabel: (item: any) => `${round((item.value / props.sales.length) * 100)}%`,
                arcLabelMinAngle: 15,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            }]);

            setMapData([
                ['Country', 'Objects sold here'],
                ...countries.map(c => ([
                    c.name,
                    c.objectsSold
                ]))
            ]);

            setUsers(users);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (users.length > 0) {
            const usersCopy = [...users];

            if (currentSorting === SortTypes.nick) {
                usersCopy.sort((a: IUser, b: IUser) => a.nick.localeCompare(b.nick));
            } else if (currentSorting === SortTypes.country) {
                usersCopy.sort((a: IUser, b: IUser) => a.country.localeCompare(b.country));
            } else if (
                currentSorting === SortTypes.totalAmountOfBuys ||
                currentSorting === SortTypes.totalMoneyPaid
            ) {
                usersCopy.sort((a, b) => (b as any)[currentSorting] - (a as any)[currentSorting]);
            }

            if (!desc) {
                usersCopy.reverse();
            }
            setUsers([...usersCopy]);
        }
    }, [desc, currentSorting]);

    interface IHeaderProps {
        label: string;
        showArrows: boolean;
        desc: boolean;
        align: 'right' | 'left';
    }

    const Header = (props: IHeaderProps) => {
        return (
            <div style={{
                display: 'flex',
                justifyContent: props.align === 'left' ? 'flex-start' : 'flex-end',
                textDecoration: props.showArrows ? 'underline' : 'none'
            }}>
                <span>
                    {props.label}
                </span>
                {
                    props.showArrows ? (
                        <>
                            {props.desc ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                        </>
                    ) : null
                }
            </div>
        );
    }

    const clickRowHeader = (key: string) => {
        if (currentSorting === key) {
            setDesc(!desc)
        } else {
            setDesc(true)
        }
        setCurrentSorting(key as SortTypes);
    }

    return (
        <BuyersDataContainer>
            {
                loading ? (<Loader />) : (
                    <>
                        <TabsContainer style={{ marginTop: '0px', padding: '0', width: '100%', justifyContent: 'flex-start', paddingLeft: '30px' }}>
                            {
                                tabs.map((t, i) => (
                                    <WhiteTab key={`whitetab-${i}`} className={selectedTab === t ? 'selected' : ''} onClick={() => setSelectedTab(t)}>
                                        {t}
                                    </WhiteTab>
                                ))
                            }
                        </TabsContainer>
                        {
                            selectedTab === Tabs.TopBuyers ? (
                                <TabContentContainer>
                                    <div style={{
                                        padding: '20px 0 35px 10px',
                                        fontSize: '1.3em'
                                    }}>
                                        Table limited to the top 500 results, for performance reasons
                                    </div>
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                        <TableHead>
                                            <TableHeaderRowStyled>
                                                <TableCell onClick={() => clickRowHeader(SortTypes.nick)}>
                                                    <Header label="Username" showArrows={currentSorting === SortTypes.nick} desc={desc} align="left" />
                                                </TableCell>
                                                <TableCell onClick={() => clickRowHeader(SortTypes.country)}>
                                                    <Header label="From" showArrows={currentSorting === SortTypes.country} desc={desc} align="left" />
                                                </TableCell>
                                                <TableCell onClick={() => clickRowHeader(SortTypes.totalAmountOfBuys)}>
                                                    <Header label="Total buys" showArrows={currentSorting === SortTypes.totalAmountOfBuys} desc={desc} align="left" />
                                                </TableCell>
                                                <TableCell onClick={() => clickRowHeader(SortTypes.totalMoneyPaid)}>
                                                    <Header label="Total money spent" showArrows={currentSorting === SortTypes.totalMoneyPaid} desc={desc} align="left" />
                                                </TableCell>
                                            </TableHeaderRowStyled>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                users.slice(0, 500).map((user, index) => (
                                                    <Tooltip
                                                        key={`tooltip-${index}`}
                                                        title={
                                                            <TooltipContent>
                                                                <div className="tooltipRow" style={{
                                                                    paddingTop: '10px',
                                                                    paddingBottom: '10px',
                                                                    fontSize: '1.2em',
                                                                    textAlign: 'left',
                                                                    display: 'flex',
                                                                    width: '100%',
                                                                    alignItems: 'flex-start'
                                                                }}>
                                                                    Items bought by this user
                                                                </div>
                                                                {
                                                                    user.buys.sort((a: ISale, b: ISale) => Number(moment(a.createdAt).format('x')) - Number(moment(b.createdAt).format('x'))).map((sale: ISale, index: number) => (
                                                                        <div className="tooltipRow" key={`buy-row-${index}`}>
                                                                            <div>
                                                                                {sale.creation.name}
                                                                            </div>
                                                                            <div>
                                                                                {moment(sale.createdAt).format('DD MMMM YYYY')}
                                                                            </div>
                                                                            <div>
                                                                                {round(sale.income.cents / 100)} {sale.income.currency}
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                                <div className="tooltipRow" style={{
                                                                    paddingTop: '15px',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    <div>
                                                                        TOTAL MONEY PAID
                                                                    </div>
                                                                    <div></div>
                                                                    <div>
                                                                        {round(
                                                                            user.buys.reduce((t: number, c: ISale) => {
                                                                                t += ((c.income.cents / 100) + (c.commission.cents / 100));
                                                                                return t;
                                                                            }, 0)
                                                                        )} {user.buys[0].income.currency}
                                                                    </div>
                                                                </div>
                                                                <div className="tooltipRow" style={{
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    <div>
                                                                        TOTAL INCOME AFTER 20% CULTS CUT
                                                                    </div>
                                                                    <div></div>
                                                                    <div>
                                                                        {round(
                                                                            user.buys.reduce((t: number, c: ISale) => {
                                                                                t += ((c.income.cents / 100) + (c.commission.cents / 100));
                                                                                return t;
                                                                            }, 0) * 0.8
                                                                        )} {user.buys[0].income.currency}
                                                                    </div>
                                                                </div>

                                                            </TooltipContent>
                                                        }
                                                        arrow
                                                        componentsProps={{ tooltip: { sx: { fontSize: '1.2em', maxWidth: '800px', width: 'auto', opacity: '1 !important' } } }}
                                                        followCursor={true}
                                                    >
                                                        <TableRowStyled key={`user-row-${index}`} onClick={() => {
                                                            window.open(user.url, '_blank');
                                                        }}>
                                                            <TableCell component="th" scope="row">
                                                                {user.nick}
                                                            </TableCell>
                                                            <TableCell>
                                                                {user.country}
                                                                <ReactCountryFlag
                                                                    className="emojiFlag"
                                                                    countryCode={user.countryCode.toUpperCase()}
                                                                    style={{
                                                                        fontSize: '1.3em',
                                                                        lineHeight: '1.3em',
                                                                        marginLeft: '10px'
                                                                    }}
                                                                    svg
                                                                    aria-label="United States"
                                                                />

                                                            </TableCell>
                                                            <TableCell>
                                                                {user.totalAmountOfBuys}
                                                            </TableCell>
                                                            <TableCell>
                                                                {round(user.totalMoneyPaid / 100)} {user.buys[0].income.currency}
                                                            </TableCell>
                                                        </TableRowStyled>
                                                    </Tooltip>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TabContentContainer>
                            ) : null
                        }
                        {
                            selectedTab === Tabs.Countries ? (
                                <TabContentContainer>
                                    <PieChart
                                        series={countriesChartSeries}
                                        height={700}
                                        slotProps={{
                                            legend: {
                                                hidden: true
                                            },
                                        }}
                                    />
                                </TabContentContainer>
                            ) : null
                        }
                        {
                            selectedTab === Tabs.Map ? (
                                <TabContentContainer>
                                    <Chart
                                        chartEvents={[
                                            {
                                                eventName: "select",
                                                callback: ({ chartWrapper }) => {
                                                    if (chartWrapper) {
                                                        const chart = chartWrapper.getChart();
                                                        const selection = chart.getSelection();
                                                        if (selection.length === 0) return;
                                                        const region = mapData[selection[0].row + 1];
                                                        console.log("Selected : " + region);
                                                    }
                                                },
                                            },
                                        ]}
                                        chartType="GeoChart"
                                        width="100%"
                                        height="100%"
                                        data={mapData}
                                    />
                                </TabContentContainer>
                            ) : null
                        }
                    </>
                )
            }

        </BuyersDataContainer>
    )
}