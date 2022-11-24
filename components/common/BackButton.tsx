import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const BackButton = (props: any) => (
  <ArrowLeftIcon
    className="my-auto h-5 w-5 hover:text-primary-600 hover:cursor-pointer"
    onClick={props.onClick}
    {...props}
  />
);

export default BackButton;
