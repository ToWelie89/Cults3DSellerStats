import styled from "styled-components";
import ICreationExtended from "../interfaces/ICreationExtended";
import { useEffect, useState } from "react";
import moment from "moment";
import { Tooltip } from "@mui/material";

import GetIncomeOverTimeWorker from './../getIncomeOverTimeWorker.ts?worker';
import ISale from "../interfaces/ISale";

import StarIcon from '@mui/icons-material/Star';
import { Loader } from "./Loader";

const incomeOverTimeWorker = new GetIncomeOverTimeWorker();

const TooltipContent = styled.div`
    padding: 10px;
    * {
        padding: 0;
        margin: 0;
    }

    h2 {
        margin-bottom: 10px;
    }
    h3 {
        text-decoration: underline;
        display: flex;
        align-items: center;
        margin-top: 8px;
    }
    p {
        margin-left: 8px;
    }
    ul {
        margin-left: 20px;
    }
`;

const UploadsBoxContainer = styled.div`
    width: 100%;
`;

const YearOuterContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 50px;

    &:first-child {
        margin-top: 0px;
    }

    h2 {
        margin: 0;
    }
`;

const MonthsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 0;

    &.startInFebruary, &.startInAugust {
        > div:first-child {
            grid-column: 2/3;
        }
    }

    &.startInMarch, &.startInSeptember {
        > div:first-child {
            grid-column: 3/3;
        }
    }

    &.startInApril, &.startInOctober {
        > div:first-child {
            grid-column: 4/4;
        }
    }

    &.startInMay, &.startInNovember {
        > div:first-child {
            grid-column: 5/5;
        }
    }

    &.startInJune, &.startInDecember {
        > div:first-child {
            grid-column: 6/6;
        }
    }
`;

const DayContainer = styled.div`
    height: 22px;
    border-radius: 2px;
    //border: 1px solid black;
    background: #eee;
    filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5));

    transform-origin: center;
    transition: transform 600ms; 

    &:hover {
        transform: scale(1.2);
    }

    &.none {
        pointer-events: none;
    }

    &.filler {
        background: gainsboro;
        opacity: 0.4;
        pointer-events: none;
    }

    &.anniversary {
        background: linear-gradient(0deg, #dff01b, #fafdd6);
        box-shadow: 0 0 5px yellow;
    }

    &.created1 {
        background: #6de96d;
    }

    &.created2 {
        background: #5dc85d;
    }

    &.created3 {
        background: #3cad3c;
    }

    &.created4 {
        background: #0ba30b;
    }

    &.updated {
        background: #ffa7cf;
    }
`;

const MonthOuterContainer = styled.div`
`;

const MonthInnerContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0px, 1fr));
    gap: 6px;
`;

interface IUploadsCalendarProps {
    creations: ICreationExtended[];
    sales: ISale[];
}

interface IDayProps {
    creations?: ICreationExtended[];
    month?: number;
    year?: number;
    day?: number;
    isFiller?: boolean;
    anniversaries?: any[];
    currency?: string;
}

interface IMonthProps {
    creations: ICreationExtended[];
    month: number;
    year: number;
    anniversaries: any[];
    currency: string;
}

interface IYearContainerProps {
    creations: ICreationExtended[];
    year: number;
    showAllMonths: boolean;
    anniversaries: any[];
    currency: string;
}

const dayIndexToDWeekday = (dayIndex: number) => {
    switch (dayIndex) {
        case 0:
            return 'Sunday';
        case 1:
            return 'Monday';
        case 2:
            return 'Tuesday';
        case 3:
            return 'Wednesday';
        case 4:
            return 'Thursday';
        case 5:
            return 'Friday';
        case 6:
            return 'Saturday';
    }
}

const Day = (props: IDayProps) => {
    const date = moment(`${props.month}-${props.day}-${props.year}`);

    const publishedThisDay = props.creations ? props.creations.filter(
        x => moment(x.publishedAt).format('DD-MM-YYYY') === date.format('DD-MM-YYYY')
    ) : [];
    const updatedThisDay = props.creations ? props.creations.filter(
        x => moment(x.updatedAt).format('DD-MM-YYYY') === date.format('DD-MM-YYYY')
    ) : [];
    const achievementsThisDay = props.anniversaries ? props.anniversaries.filter(
        x => x.currentDate === date.format('DD-MM-YYYY')
    ) : [];

    const getClass = () => {
        if (props.anniversaries && props.anniversaries.length > 0 && props.anniversaries?.find(x => x.currentDate === date.format('DD-MM-YYYY'))) {
            return 'anniversary';
        } else if (publishedThisDay.length === 1) {
            return 'created1';
        } else if (publishedThisDay.length === 2) {
            return 'created2';
        } else if (publishedThisDay.length === 3) {
            return 'created3';
        } else if (publishedThisDay.length >= 4) {
            return 'created4';
        } else if (updatedThisDay.length > 0) {
            return 'updated';
        } else {
            return 'none';
        }
    }

    return (
        <Tooltip
            title={
                <TooltipContent>
                    <h2>
                        {date.format('DD MMMM YYYY')}
                    </h2>
                    {
                        achievementsThisDay.length > 0 ? (
                            <div>
                                <h3>
                                    <StarIcon /> Achievement(s) unlocked! <StarIcon />
                                </h3>
                                {
                                    achievementsThisDay.map((x, i) => (
                                        <p key={'ptd-' + i}>
                                            {x.levelReach} {props.currency ?? ''} lifetime profit reached!
                                        </p>
                                    ))
                                }
                            </div>
                        ) : null
                    }
                    {
                        publishedThisDay.length > 0 ? (
                            <div>
                                <h3>
                                    Uploaded this day
                                </h3>
                                <ul>
                                    {
                                        publishedThisDay.map((x, i) => (
                                            <li key={'ptd-' + i}>
                                                {x.name}
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        ) : null
                    }
                    {
                        updatedThisDay.length > 0 ? (
                            <div>
                                <h3>
                                    Updated this day
                                </h3>
                                <ul>
                                    {
                                        updatedThisDay.map((x, i) => (
                                            <li key={'ptd-' + i}>
                                                {x.name}
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        ) : null
                    }
                </TooltipContent>
            }
            arrow
            componentsProps={{ tooltip: { sx: { fontSize: '1em', width: 'auto', opacity: '1 !important' } } }}
            followCursor={true}
        >
            <DayContainer className={props.isFiller ? 'filler' : getClass()} />
        </Tooltip>

    )
}

const MonthContainer = (props: IMonthProps) => {
    const firstDayThisMonth = moment(`${props.month}-01-${props.year}`);

    const creationsThisMonth = props.creations.filter(
        x =>
            moment(x.publishedAt).format('MM-YYYY') === firstDayThisMonth.format('MM-YYYY') ||
            moment(x.updatedAt).format('MM-YYYY') === firstDayThisMonth.format('MM-YYYY')
    );


    const daysThisMonth = firstDayThisMonth.daysInMonth();
    const monthName = firstDayThisMonth.format('MMMM');

    const amountOfFillerDays = Number(firstDayThisMonth.format('d')) === 0 ? 6 : Number(firstDayThisMonth.format('d')) - 1;

    return (
        <MonthOuterContainer>
            <h4>
                {monthName}
            </h4>
            <MonthInnerContainer>
                {
                    new Array(amountOfFillerDays).fill(undefined).map((x, i) => (
                        <Day key={'fillerday-' + i} isFiller={true} />
                    ))
                }
                {
                    new Array(daysThisMonth).fill(undefined).map((x, i) => (
                        <Day key={'day-' + i} month={props.month} year={props.year} day={i + 1} creations={creationsThisMonth} anniversaries={props.anniversaries} currency={props.currency} />
                    ))
                }
            </MonthInnerContainer>
        </MonthOuterContainer>
    )
}

const YearContainer = (props: IYearContainerProps) => {
    const creationsThisYear = props.creations.filter(
        x =>
            Number(moment(x.publishedAt).format('YYYY')) === props.year ||
            Number(moment(x.updatedAt).format('YYYY')) === props.year
    );

    const startingMonthIndex = props.showAllMonths ? 1 : moment(creationsThisYear[0].publishedAt).format('MM');
    const monthsToShow = 12 - Number(startingMonthIndex) + 1;

    const startingMonthName = moment(creationsThisYear[0].publishedAt).format('MMMM');

    const className = props.showAllMonths ? 'startInJanuary' : `startIn${startingMonthName}`;

    return (
        <YearOuterContainer>
            <h2>
                {props.year}
            </h2>
            <MonthsContainer className={className}>
                {
                    new Array(monthsToShow).fill(undefined).map((x, i) => (
                        <MonthContainer key={'month-' + i} month={Number(startingMonthIndex) + i} creations={creationsThisYear} year={props.year} anniversaries={props.anniversaries} currency={props.currency} />
                    ))
                }
            </MonthsContainer>
        </YearOuterContainer>
    )
}

export const UploadsCalendar = (props: IUploadsCalendarProps) => {
    const [currency, setCurrency] = useState<string>(props.sales ? props.sales[0].income.currency : '');
    const [years, setYears] = useState<any | null>(null);
    const [anniversaries, setAnniversaries] = useState<any | null>(null);

    const [loading, setLoading] = useState<boolean>(true);

    let loaded = false;

    useEffect(() => {
        if (!loaded) {
            loaded = true;

            let startDate = moment(props.creations.sort((a, b) => a.createdTimestamp - b.createdTimestamp)[0].createdTimestamp).subtract(10, 'days');

            const years = new Array(
                Math.abs(
                    startDate.diff(moment(), 'years')
                ) + 1
            ).fill(null).map((x, i) => x = Number(startDate.format('YYYY')) + i)

            setYears(years);


            incomeOverTimeWorker.onmessage = function (e) {
                console.log('MESSAGE RECEIEVED FROM WORKER 1:');
                console.log(e.data);

                const res: any[] = [];
                [
                    50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
                    1250, 1500, 1750, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000,
                    8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 20000, 25000, 30000, 40000, 50000
                ].forEach(x => {
                    let item = e.data.profitOverTime.find((d: any) => d.moneyMadeSoFar >= x);
                    if (item) {
                        res.push({
                            levelReach: x,
                            ...item
                        })
                    }
                });
                console.log('res', res);
                setAnniversaries(res);
            }

            incomeOverTimeWorker.postMessage({
                msg: 'initProfitOverTime',
                sales: props.sales
            });

            setLoading(false);
        }
    }, []);

    return (
        <UploadsBoxContainer>
            {
                loading ? (
                    <div style={{
                        marginTop: '20px',
                        marginBottom: '20px',
                    }}>
                        <Loader />
                    </div>
                ) : null
            }
            {
                years ? years.map((x: any, i: number) => (
                    <YearContainer key={'year-' + i} year={x} creations={props.creations} showAllMonths={i > 0} anniversaries={anniversaries} currency={currency} />
                )) : null
            }
        </UploadsBoxContainer>
    )
}