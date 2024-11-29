import styled from "styled-components";
import ICreationExtended from "../interfaces/ICreationExtended";
import IProfile from "../interfaces/IProfile";
import ISale from "../interfaces/ISale";
import { round } from "../helpers";
import moment from "moment";
import { useEffect, useState } from "react";

interface IProfileBoxProps {
    sales: ISale[] | null;
    creations: ICreationExtended[];
    profile: IProfile | null;
}

const ProfileImage = styled.img`
    width: 200px;
    border-radius: 50%;
    box-shadow: 0 0 14px rgba(0,0,0, 0.8);
    transform-origin: center;
    transition: transform 600ms;

    &:hover {
        transform: scale(1.2);
    }
`;

const ProfileBoxContainer = styled.div`
    width: 100%;
`;

const ProfileBoxContainerRow = styled.div`
    display: flex;
    width: 100%;
`;

const ProfileTable = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 30px;
    padding-top: 15px;
    gap: 8px;

    &:last-child {
        padding-bottom: 10px;
    }

    div {
        display: flex;

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

const ProfileNickLink = styled.span`
    font-size: 2.5em;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
        color: #666;
    }
`;

const Tag = styled.div`
    background: #888;
    padding: 2px 6px;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 0 4px rgba(0,0,0, 0.5);
    user-select: none;

    transform-origin: center;
    transition: transform 600ms;

    &:hover {
        background: #aaa;
        transform: scale(1.1);
    }
`;

export const ProfileBox = (props: IProfileBoxProps) => {

    const [tags, setTags] = useState<any[]>([]);

    const currency = props.sales ? props.sales[0].income.currency : '';

    let loaded = false;

    useEffect(() => {
        if (!loaded) {
            loaded = true;

            const t : any[] = [];

            props.creations.forEach(c => {
                c.tags.forEach(tag => {
                    if (t.find(x => x.name === tag)) {
                        t.find(x => x.name === tag).count++;
                    } else {
                        t.push({
                            name: tag,
                            count: 1
                        });
                    }
                });
            });

            t.sort((a, b) => b.count - a.count);
            setTags(t);
        }
    }, []);

    const firstSale = props.sales.sort((a, b) => Number(moment(a.createdAt).format('x')) - Number(moment(b.createdAt).format('x')))[0];
    const firstCreation = props.creations.sort((a, b) => Number(moment(a.publishedAt).format('x')) - Number(moment(b.publishedAt).format('x')))[0];

    return (
        <ProfileBoxContainer>
            <ProfileBoxContainerRow style={{ gap: '40px' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <ProfileNickLink onClick={() => {
                        if (props.profile) {
                            window.open(props.profile.shortUrl, '_blank');
                        }
                    }}>
                        {props.profile ? props.profile.nick : '-'}
                    </ProfileNickLink>
                    {
                        props.profile ? <ProfileImage src={props.profile.imageUrl} /> : null
                    }
                </div>
                <ProfileTable>
                    <div>
                        <div className="leftColumn">
                            Bio
                        </div>
                        <div className="rightColumn">
                            {props.profile ? props.profile.bio : '-'}
                        </div>
                    </div>
                    <div>
                        <div className="leftColumn">
                            Creations
                        </div>
                        <div className="rightColumn">
                            {props.creations.length}
                        </div>
                    </div>
                    <div>
                        <div className="leftColumn">
                            Total sales
                        </div>
                        <div className="rightColumn">
                            {props.sales ? props.sales.length : '-'}
                        </div>
                    </div>
                    <div>
                        <div className="leftColumn">
                            Total profit
                        </div>
                        <div className="rightColumn">
                            {props.sales ? round(props.sales.reduce((t, c) => t += (c.income.cents / 100), 0)) : '0'} {currency}
                        </div>
                    </div>
                    <div>
                        <div className="leftColumn">
                            Total commission paid to Cults3D
                        </div>
                        <div className="rightColumn">
                            {props.sales ? round(props.sales.reduce((t, c) => t += (c.commission.cents / 100), 0)) : '0'} {currency}
                        </div>
                    </div>
                    <div>
                        <div className="leftColumn">
                            Started selling at
                        </div>
                        <div className="rightColumn">
                            {props.creations && firstCreation ? moment(firstCreation.publishedAt).format('DD MMMM YYYY') : '-'}
                        </div>
                    </div>
                    <div>
                        <div className="leftColumn">
                            50 most common tags
                        </div>
                        <div className="rightColumn" style={{ flexWrap: 'wrap', gap: '2px' }}>
                            {
                                tags.slice(0, 50).map((tag, index) => (
                                    <Tag key={`tag-${index}`} onClick={() => {
                                        window.open(`https://cults3d.com/en/tags/${tag.name}`, '_blank');
                                    }}>
                                        {tag.name} (x{tag.count})
                                    </Tag>
                                ))
                            }
                        </div>
                    </div>
                </ProfileTable>
            </ProfileBoxContainerRow>
        </ProfileBoxContainer>
    )
}