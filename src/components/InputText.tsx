import styled from "styled-components";

interface IInputTextProps {
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    type: string;
    placeholder: string;
}

const InputTextStyled = styled.input`
  padding: 6px 14px;
  font-size: 1.4em;
  outline: none;
  border: none;
  border-radius: 6px;
  filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3));
  min-width: 300px;
`;

const InputText = (props: IInputTextProps) => {
  return (
    <InputTextStyled placeholder={props.placeholder} onChange={props.onChange} type={props.type}>
    </InputTextStyled>
  )
}

export default InputText
