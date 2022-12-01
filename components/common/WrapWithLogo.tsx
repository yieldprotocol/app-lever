import { FC, ReactElement, ReactNode } from 'react';

export interface IWrapWithLogo {
    logo: ReactElement;
    size?: number;
    logoAfter?: boolean;
    children: ReactNode;
  }

const WrapWithLogo: FC<IWrapWithLogo> = (props) => {
    const size = props.size || 4;
    const logoAfter = props.logoAfter|| false; 
    const Logo = () => <div className={`h-${size} w-${size}`}> {props.logo}</div>;

    return (
      <div className={`flex items-center gap-${size/2}`}>
        {!logoAfter && <Logo />}
        {props.children}
        {logoAfter && <Logo />}
    </div>
    )
}

export default WrapWithLogo;