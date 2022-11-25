import { FC,  ReactElement } from 'react';
import AssetLogo from './AssetLogo';

interface IStackedLogos {
    logos: ReactElement[],
    size: number
}

const StackLogos: FC<IStackedLogos> = ( props ) => (
  <div  className={`flex flex-row`}>
    <div className={`z-20 relative h-${props.size} rounded-full bg-white bg-opacity-5`}>
      {props.logos[0]}
    </div>
    { props.logos.length > 1 && props.logos.slice(1)?.map((logo: ReactElement)=>{
        return (
            <div className={`z-10 -ml-2 h-${props.size} rounded-full bg-white bg-opacity-5 `}>
            {logo}
          </div>
        )
    })}
  </div>
);

export default StackLogos;