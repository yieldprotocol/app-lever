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

export const InfoBlock = tw.div`grid grid-cols-2 gap-3 my-6`;

export const Label = tw.div`text-slate-700 dark:text-slate-400 text-left`;
export const Value = tw.div<any>`text-black dark:text-white text-right`;

export const Divider = tw.div`border-0.5 border-[teal] dark:border-[teal]`;
export const NotShown = tw.div`invisible`;
export const Spinner = tw.div`spinner-grow inline-block w-8 h-8 bg-current rounded-full opacity-0" role="status`;

export const ClearButton = tw.button`text-sm`;
