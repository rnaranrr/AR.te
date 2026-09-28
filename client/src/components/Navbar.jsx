import Logo from '@/assets/logo/icon-logo-small.svg?react'

// Logo no topo do site para telas pequenas
export default function Navbar() {
    return (
        <div className="navbar sm:hidden font-principal sticky top-0 z-50 bg-fundo">
            <div className='flex w-[100%] justify-center flex-row justify-around items-center'>
                <Logo className='w-9 pt-3 text-texto-main' />
                <h1 className='text-3xl font-logo text-texto-main h-fit pt-4'>AR.te</h1>
            </div>
        </div>
    );
}