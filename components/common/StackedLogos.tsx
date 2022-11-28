import { FC, ReactElement } from 'react';

interface ExtraProps {
  stackedLogos: ReactElement[];
  size: number;
}

const StackedLogos: FC<ExtraProps> = (props) => {
  const { size, stackedLogos } = props;

  return (
    <div className={` flex flex-row`}>
      {/* <div className={`h-${size} w-${size} bg-white bg-opacity-5 p-0.5 rounded-full`} /> */}
      <div className={`z-20 bg-black rounded-full h-${size} w-${size}`}>
        <div className={`h-${size} w-${size} p-0.5 rounded-full`}>{stackedLogos?.[0]}</div>
      </div>
      {stackedLogos?.length > 1 &&
        stackedLogos
          .slice(1)
          .map((logo: ReactElement) => (
            <div
              className={`
              z-10 
              -ml-2
              h-${size} 
              w-${size}  
              p-1
              rounded-full
              opacity-50`}
              key={logo.key}
            >
              {logo}
            </div>
          ))}
    </div>
  );
};

export default StackedLogos;
