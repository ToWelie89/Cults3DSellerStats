import styled from "styled-components";

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ICreationExtended from "../interfaces/ICreationExtended";
import moment from "moment";
import { useEffect, useState } from "react";
import InputCheckbox from "./InputCheckbox";
import { Tooltip } from "@mui/material";

const TooltipContent = styled.div`
    width: auto;
    font-size: 0.8em;
    max-width: 450px;
    gap: 6px;

    .tooltipImageContainer {
        display: flex;

        img {
            max-width: 400px;
            padding: 10px;
            padding-bottom: 0px;
            margin: 0 auto;
        }
    }

    .tooltipRow {
        display: flex;
        width: 100%;
        padding: 10px;
        padding-top: 0px;
        padding-bottom: 0px;

        &:last-child {
            padding-bottom: 10px;
        }

        .leftColumn {
            flex: 2;
            font-weight: bold;
        }
        .rightColumn {
            flex: 4;
            padding-right: 10px;
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

interface IInputCheckboxProps {
    creations: ICreationExtended[]
}

const CreationsContainer = styled.div`
    width: 100%;
`;

enum SortTypes {
    name = "name",
    likesCount = "likesCount",
    viewsCount = "viewsCount",
    downloadsCount = "downloadsCount",
    createdTimestamp = "createdTimestamp",
    totalProfit = "totalProfit",
    price = "price",
}

const CreationsTable = (props: IInputCheckboxProps) => {
    const [creations, setCreations] = useState<ICreationExtended[]>(props.creations);
    const [currentSorting, setCurrentSorting] = useState<SortTypes>(SortTypes.createdTimestamp);
    const [desc, setDesc] = useState<boolean>(true);
    const [showPricesAfterCut, setShowPricesAfterCut] = useState<boolean>(false);

    useEffect(() => {
        const creationsCopy = [...creations];

        if (currentSorting === SortTypes.name) {
            creationsCopy.sort((a, b) => a.name.localeCompare(b.name));
        } else if (
            currentSorting === SortTypes.likesCount ||
            currentSorting === SortTypes.viewsCount ||
            currentSorting === SortTypes.downloadsCount ||
            currentSorting === SortTypes.createdTimestamp
        ) {
            creationsCopy.sort((a, b) => (b as any)[currentSorting] - (a as any)[currentSorting]);
        } else if (currentSorting === SortTypes.totalProfit) {
            creationsCopy.sort((a, b) => b.totalSalesAmount.cents - a.totalSalesAmount.cents);
        } else if (currentSorting === SortTypes.price) {
            creationsCopy.sort((a, b) => b.price.cents - a.price.cents);
        }

        if (!desc) {
            creationsCopy.reverse();
        }
        setCreations([...creationsCopy]);
    }, [desc, currentSorting]);

    const clickRowHeader = (key: SortTypes) => {
        if (currentSorting === key) {
            setDesc(!desc)
        } else {
            setDesc(true)
        }
        setCurrentSorting(key);
    }

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

    return (
        <CreationsContainer>
            <InputCheckbox onChange={() => setShowPricesAfterCut(!showPricesAfterCut)} checked={showPricesAfterCut} label="Show prices and profits after Cults3D 20% cut" />
            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableHeaderRowStyled>
                            <TableCell onClick={() => clickRowHeader(SortTypes.name)}>
                                <Header label="Name" showArrows={currentSorting === SortTypes.name} desc={desc} align="left" />
                            </TableCell>
                            <TableCell onClick={() => clickRowHeader(SortTypes.downloadsCount)} align="right">
                                <Header label="Downloads" showArrows={currentSorting === SortTypes.downloadsCount} desc={desc} align="right" />
                            </TableCell>
                            <TableCell onClick={() => clickRowHeader(SortTypes.price)} align="right">
                                <Header label="Price" showArrows={currentSorting === SortTypes.price} desc={desc} align="right" />
                            </TableCell>
                            <TableCell onClick={() => clickRowHeader(SortTypes.totalProfit)} align="right">
                                <Header label="Total Profit" showArrows={currentSorting === SortTypes.totalProfit} desc={desc} align="right" />
                            </TableCell>
                            <TableCell onClick={() => clickRowHeader(SortTypes.likesCount)} align="right">
                                <Header label="Likes" showArrows={currentSorting === SortTypes.likesCount} desc={desc} align="right" />
                            </TableCell>
                            <TableCell onClick={() => clickRowHeader(SortTypes.viewsCount)} align="right">
                                <Header label="Views" showArrows={currentSorting === SortTypes.viewsCount} desc={desc} align="right" />
                            </TableCell>
                            <TableCell onClick={() => clickRowHeader(SortTypes.createdTimestamp)} align="right">
                                <Header label="Uploaded" showArrows={currentSorting === SortTypes.createdTimestamp} desc={desc} align="right" />
                            </TableCell>
                        </TableHeaderRowStyled>
                    </TableHead>
                    <TableBody>
                        {creations.map((item, index) => (
                            <Tooltip
                                key={`tooltip-${index}`}
                                title={
                                    <TooltipContent>
                                        <div className="tooltipImageContainer">
                                            <img src={item.illustrationImageUrl} />
                                        </div>
                                        <div className="tooltipRow">
                                            <div className="leftColumn">
                                                Category
                                            </div>
                                            <div className="rightColumn">
                                                {item.category.name}
                                            </div>
                                        </div>
                                        <div className="tooltipRow">
                                            <div className="leftColumn">
                                                Subcategories
                                            </div>
                                            <div className="rightColumn">
                                                {item.subCategories.map(x => x.name).join(', ')}
                                            </div>
                                        </div>
                                        <div className="tooltipRow">
                                            <div className="leftColumn">
                                                Tags
                                            </div>
                                            <div className="rightColumn">
                                                {item.tags.join(', ')}
                                            </div>
                                        </div>
                                        <div className="tooltipRow">
                                            <div className="leftColumn">
                                                Description
                                            </div>
                                            <div className="rightColumn">
                                                {item.description}
                                            </div>
                                        </div>
                                    </TooltipContent>
                                }
                                arrow
                                componentsProps={{ tooltip: { sx: { fontSize: '1.2em', maxWidth: '800px', width: 'auto', opacity: '1 !important' } }}}
                                followCursor={true}
                            >
                                <TableRowStyled
                                    key={item.name}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    onClick={() => window.open(item.shortUrl, '_blank')}
                                >
                                    <TableCell component="th" scope="row">
                                        {item.name}
                                    </TableCell>
                                    <TableCell align="right">
                                        {item.downloadsCount}
                                    </TableCell>
                                    <TableCell align="right">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span>
                                                {
                                                    !showPricesAfterCut
                                                        ?
                                                            <>
                                                                {item.price.cents / 100} {item.price.currency}
                                                            </>
                                                        :
                                                            <>
                                                                {item.priceAfterCut.cents / 100} {item.price.currency}
                                                            </>
                                                }
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell align="right">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span>
                                                {
                                                    !showPricesAfterCut
                                                        ?
                                                            <>
                                                                {item.totalSalesAmount.cents / 100} {item.totalSalesAmount.currency}
                                                            </>
                                                        :
                                                            <>
                                                                {item.totalSalesAmountAfterCut.cents / 100} {item.totalSalesAmountAfterCut.currency}
                                                            </>
                                                }
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell align="right">
                                        {item.likesCount}
                                    </TableCell>
                                    <TableCell align="right">
                                        {item.viewsCount}
                                    </TableCell>
                                    <TableCell align="right">
                                        {moment(item.createdTimestamp).format('DD-MM-YYYY')}
                                    </TableCell>
                                </TableRowStyled>
                            </Tooltip>

                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </CreationsContainer>
    )
}

export default CreationsTable
