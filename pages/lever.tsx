import dynamic from 'next/dynamic';

const DynamicLever = dynamic(() => import('../components/lever/Lever'), { ssr: false });

const Lever = () => <DynamicLever />;

export default Lever;
