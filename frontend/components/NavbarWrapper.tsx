'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
    const pathname = usePathname();

    // Do not render the consumer Navbar on admin routes
    if (pathname && pathname.startsWith('/admin')) {
        return null;
    }

    return <Navbar />;
}
