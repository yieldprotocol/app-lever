import dynamic from 'next/dynamic';

const DynamicPositions = dynamic(() => import('../components/position/PositionView'), { ssr: false });

const Position = () => <DynamicPositions/>;

export default Position;