import { FC } from 'react';
import tw from 'tailwind-styled-components';

const StyledButton = tw.button`
h-full 
w-full 
px-4 
py-2.5
flex 
gap-3 
rounded-lg 
items-center 
justify-center 
bg-teal-900
${(p) => (p.disabled 
  ? " bg-opacity-25 dark:text-gray-500 " 
  : "bg-opacity-100 hover:opacity-80 dark:text-gray-50"
)}
`;

const Spinner = tw.div`spinner-border animate-spin inline-block w-6 h-6 border-4 rounded-full border-primary-200 border-t-secondary-400`;

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
