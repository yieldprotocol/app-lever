import tw from 'tailwind-styled-components';

export const Inner = tw.div`m-4 text-center`;
export const TopRow = tw.div`p-4 flex justify-between align-middle text-center items-center rounded-t-lg dark:bg-gray-900 
bg-gray-100
bg-opacity-25
dark:text-gray-50 
dark:bg-opacity-25 
`;

export const Header = tw.div`text-lg font-bold justify-items-start align-middle`;
export const BorderWrap = tw.div`
w-full
mx-2
shadow-md 
rounded-xl 
dark:bg-gray-900 
bg-gray-100
bg-opacity-75
dark:text-gray-50 
dark:bg-opacity-75
text-gray
`;

export const SectionHead = tw.div`text-left m-2`
export const Section = tw.div`
w-full
my-2
p-2
rounded-lg 
dark:bg-gray-900 
bg-gray-100
bg-opacity-25
dark:text-gray-50 
dark:bg-opacity-25
`;

export const InfoBlock = tw.div`grid grid-cols-2 gap-4 my-8`;
export const Label = tw.div`text-[grey] dark:text-[grey] text-left`;
export const Value = tw.div`text-black dark:text-white text-right`;

export const Divider = tw.div`border-0.5 border-[teal] dark:border-[teal]`;
export const NotShown = tw.div`invisible`;

export const ClearButton = tw.button`text-sm`;
