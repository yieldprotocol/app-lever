import { FC } from 'react';

interface ExtraProps {
  size: number;
}

const LogoWrap: FC<ExtraProps> = (props) => {
  const { size } = props;

  return <div className={`h-${size} w-${size} bg-white bg-opacity-5 p-0.5 rounded-full`}>{props.children}</div>;
};

export default LogoWrap;
