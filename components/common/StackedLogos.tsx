import { FC, ReactElement } from 'react';

interface ExtraProps {
  logos: ReactElement[];
  size: number;
}

const StackedLogos: FC<ExtraProps> = (props) => {
  const { size, logos } = props;

  return (
    <div className={`flex`}>
      <div className={`z-20 bg-slate-900 rounded-full h-${size} w-${size}`}>
        <div className={`h-${size} w-${size} p-1 rounded-full`}>{logos?.[0]}</div>
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
              opacity-30`}
              key={`${i}`}
            >
              {logo}
            </div>
          ))}
    </div>
  );
};

export default StackedLogos;
