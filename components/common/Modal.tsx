import { Dialog, Transition } from '@headlessui/react';
import { Fragment, FC, ReactNode } from 'react';

export interface IModal {
  isOpen: boolean;
  setIsOpen: (open:boolean) => void;
  children: ReactNode;
}

const Modal: FC<IModal> = ({ isOpen, setIsOpen, children }) => (
    <Transition appear show={isOpen} as={Fragment}>

      <Dialog open={isOpen} as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => setIsOpen(false)}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 dark:bg-gray-800 bg-gray-400 opacity-70" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-300 shadow-xl rounded-2xl dark:bg-gray-900">
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );

export default Modal;
