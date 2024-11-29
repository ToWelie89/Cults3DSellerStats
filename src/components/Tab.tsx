import styled from "styled-components";

export const Tab = styled.div`
    background-color: green;
    height: 100%;
    display: flex;
    padding: 5px 20px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    cursor: pointer;
    transition: box-shadow 500ms;

    &:hover {
        box-shadow: 0 0 10px #323d9a;
    }

    &.selected {
        background-color: #19ca19;
        font-size: 1.3em;
    }
`;