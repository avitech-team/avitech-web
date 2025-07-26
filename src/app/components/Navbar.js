'use client';

import React from 'react'
import Image from 'next/image'

const menuItems = {
    th: [
        { href: '/th', label: 'หน้าแรก' },
        { href: '/th/about', label: 'เกี่ยวกับฉัน' },
        { href: '/th/product', label: 'สินค้า' }, 
        { href: '/th/course', label: 'คอร์สเรียน' },
        { href: '/th/event', label: 'กิจกรรม' },
        { href: '/th/faqs', label: 'คำถามที่พบบ่อย' },
        { href: '/th/contact', label: 'ติดต่อ' },
        { 
            href: '/th/cart', 
            label: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart-icon lucide-shopping-cart">
                    <circle cx="8" cy="21" r="1"/>
                    <circle cx="19" cy="21" r="1"/>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
            ), 
            isCart: true 
        },
    ],
    en: [
        { href: '/en', label: 'Home' },
        { href: '/en/about', label: 'About' },
        { href: '/en/product', label: 'Products' },
        { href: '/en/course', label: 'Courses' },
        { href: '/en/event', label: 'Events' },
        { href: '/en/faqs', label: 'FAQs' },
        { href: '/en/contact', label: 'Contact' },
        { 
            href: '/en/cart', 
            label: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart-icon lucide-shopping-cart">
                    <circle cx="8" cy="21" r="1"/>
                    <circle cx="19" cy="21" r="1"/>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
            ), 
            isCart: true 
        },
    ]
};

function getLangFromPath() {
    if (typeof window === 'undefined') return 'th';
    if (window.location.pathname.startsWith('/en')) return 'en';
    return 'th';
}

// Helper to switch language prefix, keeping the rest of the path (e.g. /th/cart <-> /en/cart)
function switchLangPath(currentPath, targetLang) {
    // Remove any double slashes
    let path = currentPath.replace(/\/+$/, '');
    if (targetLang === 'th') {
        if (path.startsWith('/en')) {
            return '/th' + path.slice(3);
        } else if (!path.startsWith('/th')) {
            // If not starting with /th or /en, just add /th
            return '/th' + (path === '' ? '' : path);
        }
        return path;
    } else if (targetLang === 'en') {
        if (path.startsWith('/th')) {
            return '/en' + path.slice(3);
        } else if (!path.startsWith('/en')) {
            // If not starting with /th or /en, just add /en
            return '/en' + (path === '' ? '' : path);
        }
        return path;
    }
    return path;
}

function Navbar() {
    const [lang, setLang] = React.useState('th');
    const [showLangDropdown, setShowLangDropdown] = React.useState(false);
    const [currentPath, setCurrentPath] = React.useState('/th');

    React.useEffect(() => {
        const detectedLang = getLangFromPath();
        setLang(detectedLang);
        if (typeof window !== 'undefined') {
            setCurrentPath(window.location.pathname);
        }
    }, []);

    const currentMenu = menuItems[lang];

    // For logo: keep the current path, but switch only the language prefix to the selected lang
    function getLogoHref(lang) {
        if (typeof window !== 'undefined') {
            // If on /en/xxx or /th/xxx, go to /en or /th root
            if (window.location.pathname.startsWith('/en')) return '/en';
            if (window.location.pathname.startsWith('/th')) return '/th';
        }
        return lang === 'en' ? '/en' : '/th';
    }

    // For language switch: keep the rest of the path, just switch the prefix
    const langSwitchHref = (targetLang) => switchLangPath(currentPath, targetLang);

    return (
        <nav className="w-full bg-white border-b border-gray-200 shadow-sm top-0 left-0 z-50">
            <div className="mx-auto flex items-center justify-between px-4 py-2">
                {/* Logo and Brand */}
                <a href={getLogoHref(lang)} className="flex items-center space-x-2">
                    <figure className="flex items-center">
                        <Image src="/Logo ie-01.png" alt="Real Software Logo" width={1920} height={1080} className="h-15 w-full" />
                        <figcaption className="sr-only">Real Software Logo</figcaption>
                    </figure>
                </a>
                {/* Menu */}
                <div className="flex items-center space-x-6 text-xl font-medium text-gray-700">
                    {currentMenu.map(item => (
                        <a
                            key={item.href}
                            href={item.href}
                            className={`hover:text-green-700 hover:underline underline-offset-8 decoration-2 hover:decoration-green-700${item.isCart ? ' flex items-center' : ''}`}
                            aria-label={item.isCart ? (lang === 'en' ? 'Cart' : 'ตะกร้าสินค้า') : undefined}
                        >
                            {item.isCart ? (
                                <figure className="flex items-center">
                                    {item.label}
                                    <figcaption className="sr-only">{lang === 'en' ? 'Cart' : 'ตะกร้าสินค้า'}</figcaption>
                                </figure>
                            ) : (
                                item.label
                            )}
                        </a>
                    ))}
                    <div className="relative flex items-center">
                        <button
                            className="flex items-center space-x-1 hover:text-green-700 focus:outline-none px-2 py-1 rounded"
                            onClick={() => setShowLangDropdown(v => !v)}
                            aria-haspopup="listbox"
                            aria-expanded={!!showLangDropdown}
                            type="button"
                        >
                            <figure className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe-icon lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                                <figcaption className="sr-only">Language</figcaption>
                            </figure>
                            <span className="text-sm font-bold">{lang === 'en' ? 'EN' : 'TH'}</span>
                        </button>
                        {typeof window !== 'undefined' && (
                            <React.Fragment>
                                {showLangDropdown && (
                                    <div className="absolute right-0 mt-30 w-24 bg-white border border-gray-200 rounded shadow-lg z-50">
                                        <a
                                            href={langSwitchHref('th')}
                                            className={`block px-4 py-2 text-sm hover:bg-gray-100 ${lang === 'th' ? 'font-bold text-green-700' : ''}`}
                                            onClick={() => setShowLangDropdown(false)}
                                        >
                                            ไทย
                                        </a>
                                        <a
                                            href={langSwitchHref('en')}
                                            className={`block px-4 py-2 text-sm hover:bg-gray-100 ${lang === 'en' ? 'font-bold text-green-700' : ''}`}
                                            onClick={() => setShowLangDropdown(false)}
                                        >
                                            English
                                        </a>
                                    </div>
                                )}
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
