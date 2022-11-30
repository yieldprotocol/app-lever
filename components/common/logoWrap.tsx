import { FC, ReactElement } from 'react';

interface ExtraProps {
  logo: ReactElement;
  outerTwStyle: string;
  innerTwStyle: string
}

const LogoWrap: FC<ExtraProps> = (props) => {
  const { logo, outerTwStyle, innerTwStyle } = props;
  return (
    <div>
      <div className={`p-0.5 rounded-full ${outerTwStyle}`}>
          <div className={`p-0.5 rounded-full ${innerTwStyle}`}> 
           {logo}
          </div>         
      </div>   
    </div>
  );
};

export default LogoWrap;
