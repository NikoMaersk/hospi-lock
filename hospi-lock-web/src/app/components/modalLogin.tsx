'use client'

export const ModalLogin = ({ show }: any) => {

    if (!show) {
        return null;
    }

    return (
        <div className="hidden overflow-x-hidden overflow-y-auto 
        fixed h-modal md:h-full top-4 left-0 right-0 
        md:inset-0 z-50 justify-center items-center">
            <div className="relative w-full max-w-md px-4 h-full md:h-auto">
                <div className="bg-white rounded-lg shadow relative dark:bg-gray-700">
                    <form >
                        <h3 className=" text-stone-800">Sign in</h3>
                        <div>
                            <label htmlFor="email" />
                            <input type="email" />
                        </div>
                        <div>
                            <label htmlFor="password" />
                            <input type="password" placeholder="•••••" className="bg-gray-50 border
                             border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                             dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"/>
                        </div>
                    </form >
                </div>
            </div>
        </div>
    );
};

export default ModalLogin;