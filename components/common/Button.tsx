import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { Spinner } from '../styled';

const StyledButton = tw.button`
h-full 
w-full 
px-4 
py-2.5
flex 
rounded-lg 
items-center 
justify-center 
bg-primary-600
${(p) => (p.disabled 
  ? " bg-opacity-25 dark:text-gray-500 " 
  : "bg-opacity-100 hover:opacity-80 dark:text-gray-50"
)}
`;

interface IButton {
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const Button: FC<IButton> = ({ action, disabled, loading, children }) => (
  <StyledButton onClick={action} disabled={disabled}>
    {loading ? <Spinner /> : children}
  </StyledButton>
);

export default Button;
