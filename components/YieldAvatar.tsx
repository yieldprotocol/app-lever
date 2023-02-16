// import styled from 'styled-components';
// import multiavatar from '@multiavatar/multiavatar';
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
  // const { ensAvatarUrl } = useEnsAvatar();
  // const _avatar = multiavatar(props.address.concat(21));
  const _size = props.size.toString().concat('em');

  return (

    <div>
      <img className="rounded-full w-96 h-96" src="/docs/images/examples/image-4@2x.jpg" alt="image description" />
    </div>
  )
}

export default YieldAvatar;
