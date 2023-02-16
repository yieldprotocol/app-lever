import tw from 'tailwind-styled-components';
import Link from 'next/link';
import Account from './Account';
import { useRouter } from 'next/router';
import { ClickableContainer, Inner } from './styled';

// TODO add in 'sticky'
const NavContainer = tw.div`
  top-0 
  w-full 
  flex-none 
  text-gray-800
  dark:text-gray-50
  border-gray-200
  dark:border-gray-800
`;

type LinkItemProps = {
  $current: boolean;
};

const InnerContainer = tw.div`flex py-4 px-10 align-middle relative items-center justify-between`;
const LinksWrap = tw.div`p-1 flex gap-2 justify-between bg-black bg-opacity-50 rounded-lg `;

// const LinkItem = tw.div<LinkItemProps>`${(p) => (p.$current ? 'bg-primary-600 bg-opacity-50 ' : 'dark:text-gray-100 text-gray-800')}
//   rounded-lg p-2 hover:text-primary-400 dark:hover:text-primary-600 dark:hover:bg-gray-800 bg-opacity-100 `;
const LinkItem = tw.div<LinkItemProps>`${(p) =>
  p.$current
    ? 'bg-primary-600 bg-opacity-50 ring-primary-600 ring-1'
    : ''} rounded-lg py-2 px-6`;

const Navigation = () => {
  const router = useRouter();
  const navigation = [
    { name: 'New Levered Position', href: '/lever' },
    { name: 'My Positions', href: '/positions' },
  ];

  return (
    <NavContainer>
      <InnerContainer>
        <LinksWrap>
          {navigation.map((x) => (
            <Link href={x.href} key={x.name} passHref>
              <ClickableContainer>
                <LinkItem $current={router.pathname.includes(x.href)}>{x.name}</LinkItem>
              </ClickableContainer>
            </Link>
          ))}
        </LinksWrap>

        <Account />
      </InnerContainer>
    </NavContainer>
  );
};

export default Navigation;
