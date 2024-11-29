import styled from "styled-components";

interface IInputCheckboxProps {
    onChange: (ev: any) => void;
    checked: boolean;
    label: string;
}

const CheckboxLabel = styled.span`
    margin-left: 6px;
`;

const InputCheckboxStyled = styled.input`
    height: 18px;
    width: 18px;
`;

const CheckboxContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: center;
`;

const InputCheckbox = (props: IInputCheckboxProps) => {
  return (
    <CheckboxContainer>
        <InputCheckboxStyled onChange={props.onChange} type="checkbox" />
        <CheckboxLabel>{props.label}</CheckboxLabel>
    </CheckboxContainer>
  )
}

export default InputCheckbox
