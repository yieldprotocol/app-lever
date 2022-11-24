import tw from 'tailwind-styled-components';
import Link from 'next/link';
import Account from './Account';
import { useRouter } from 'next/router';

const Container = tw.div`
  sticky
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
const LinksWrap = tw.div`flex space-x-8`;
const LinkItem = tw.div<LinkItemProps>`${(p) =>
  p.$current
    ? 'text-primary-600'
    : 'dark:text-gray-100 text-gray-800'} hover:text-primary-400 dark:hover:text-primary-600`;

const Navigation = () => {
  const router = useRouter();
  const navigation = [
    { name: 'New Levered Position', href: '/lever' },
    { name: 'My Positions', href: '/positions' },
  ];

  return (
    <Container>
      <InnerContainer>
        <LinksWrap>
          {navigation.map((x) => (
            <Link href={x.href} key={x.name} passHref>
              <LinkItem $current={router.pathname.includes(x.href)}>{x.name}</LinkItem>
            </Link>
          ))}
        </LinksWrap>
        <Account />
      </InnerContainer>
    </Container>
  );
};

export default Navigation;
