import dynamic from 'next/dynamic';

const DynamicPositions = dynamic(() => import('../components/position/positionView'), { ssr: false });

const Position = () => <DynamicPositions/>;

export default Position;