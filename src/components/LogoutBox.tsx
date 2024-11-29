import styled from "styled-components";

import LogoutIcon from '@mui/icons-material/Logout';
import { Tooltip } from "@mui/material";

const LogoutBoxContainer = styled.div`
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 5px 10px ;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
    gap: 6px;

    svg {
        width: 20px;
        padding: 0px 6px;
        border: 1px solid black;
        border-radius: 5px;
        cursor: pointer;

        &:hover {
            background: white;
        }
    }
`;

const Logout = () => {
    window.localStorage.removeItem('cults3dstats_username');
    window.localStorage.removeItem('cults3dstats_token');
    location.reload();
}

export const LogoutBox = (props : any) => {
    return (
        <>
            {
                props.isLoggedIn && props.username ? (
                    <LogoutBoxContainer>
                        Logged in as {props.username}
                        <Tooltip
                            title={
                                <div>
                                    Logout, will remove credentials from cache also
                                </div>
                            }
                            arrow
                            componentsProps={{ tooltip: { sx: { fontSize: '0.9em', maxWidth: '400px', width: 'auto', opacity: '1 !important' } } }}
                            enterDelay={0}
                        >
                            <LogoutIcon onClick={() => Logout()} />
                        </Tooltip>
                    </LogoutBoxContainer>
                ) : null
            }
        </>
    )
};