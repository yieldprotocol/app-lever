import dynamic from 'next/dynamic';

const DynamicLever = dynamic(() => import('../components/views/lever/LeverView'), { ssr: false });

const Lever = () => <DynamicLever />;

export default Lever;
