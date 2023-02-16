// import styled from 'styled-components';
import multiavatar from '@multiavatar/multiavatar';
import { useEnsAvatar } from 'wagmi';

// import { useColorScheme } from '../hooks/useColorScheme';


// const StyledBox = styled(Box)`
//   -webkit-transition: transform 0.3s ease-in-out;
//   -moz-transition: transform 0.3s ease-in-out;
//   transition: transform 0.3s ease-in-out;
//   :hover {
//     transform: scale(1.5);
//   }
// `;

function YieldAvatar(props: any) {
  // const colorScheme = useColorScheme();
  const { data } = useEnsAvatar();
  const avatar = multiavatar(props.address.concat(21));
  const size = props.size.toString().concat('em');

  return (
    <div className="rounded-full w-24 h-24">   
        <span dangerouslySetInnerHTML={{ __html: avatar }} />
    </div>
  )
}

export default YieldAvatar;
