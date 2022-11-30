import { FC, ReactElement } from 'react';
import LogoWrap from './logoWrap';

interface ExtraProps {
  logos: ReactElement[];
  size: number;
}

const StackedLogos: FC<ExtraProps> = (props) => {
  const { size, logos } = props;

  return (
    <div className={`flex`}>
      <div className={`z-20 rounded-full h-${size} w-${size}`}>
        <div className={`h-${size} w-${size}`}>
          <LogoWrap 
            outerTwStyle='bg-slate-900 bg-opacity-90'
            innerTwStyle=''
            logo={logos?.[0]} 
          />
          </div>
      </div>
      {logos?.length > 1 &&
        logos
          .slice(1)
          .map((logo: ReactElement, i:number) => (
            <div
              className={`
              z-10 
              -ml-3
              mt-1
              h-${size} 
              w-${size}  
              p-1
              rounded-full
              opacity-50`}
              key={`${i}`}
            >
              {logo}
            </div>
          ))}
    </div>
  );
};

export default StackedLogos;
