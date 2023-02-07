import dynamic from 'next/dynamic';

const DynamicPositions = dynamic(() => import('../components/views/position/PositionView'), { ssr: false });

const Position = () => <DynamicPositions/>;

export default Position;