import { useState } from "react";
import styled from "styled-components";

interface ISelectProps {
    options: string[] | number[];
    onChange: (ev: any) => void;
    defaultValue: string | number;
}

const StyledSelect = styled.select`
    width: auto;
    padding: 5px;
    outline: none;
    border: 1px solid black;
    border-radius: 8px;

    option {
        border: none;
        outline: none;
        
        &.selected {
            background: #ddd;
        }
    }
`;

export const Select = (props: ISelectProps) => {
    const [selectedOption, setSelectedOption] = useState(props.defaultValue)

    return (
        <StyledSelect onChange={ev => {
            props.onChange(ev.target.value);
            setSelectedOption(ev.target.value);
        }} value={selectedOption}>
            {
                props.options.map((x, index) => (
                    <option key={`option-${index}`} className={(selectedOption + '') === (x + '') ? 'selected' : ''}>
                        {x}
                    </option>
                ))
            }
        </StyledSelect>
    )
};