import { CircularProgress } from "@mui/material"
import styled from "styled-components";

const LoaderContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-content: center;
    align-items: center;
`;

export const Loader = () => {
    return (
        <LoaderContainer>
            <CircularProgress color="secondary" size={200} />
            <h2>
                Loading, please be patient
            </h2>
        </LoaderContainer>
    )
}