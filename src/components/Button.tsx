import { ReactNode } from "react";
import styled from "styled-components";

interface IButtonProps {
    onClick: () => Promise<void> | void;
    children: ReactNode;
    style?: any;
}

const StyledButton = styled.button`
    box-sizing: border-box;
    appearance: none;
    background-color: transparent;
    border: 2px solid #e74c3c;
    border-radius: 0.6em;
    color: #e74c3c;
    cursor: pointer;
    display: flex;
    align-self: center;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1;
    margin: 20px;
    padding: 1.2em 2.8em;
    text-decoration: none;
    text-align: center;
    font-family: "Afacad Flux", sans-serif;
    font-weight: 700;

    &:hover,
    &:focus {
        color: #fff;
        outline: 0;
    }

    border-color: #62066b;
    color: #fff;
    box-shadow: 0 0 40px 40px #62066b inset, 0 0 0 0 #62066b;
    transition: all 150ms ease-in-out;
    
    &:hover {
        box-shadow: 0 0 10px 0 #62066b inset, 0 0 10px 4px #62066b;
    }
`;

const AnimatedButton = (props: IButtonProps) => {
  return (
    <StyledButton onClick={props.onClick} style={props.style}>
        {props.children}
    </StyledButton>
  )
}

export default AnimatedButton
