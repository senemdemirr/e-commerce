"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';


export default function Navbar() {

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories");
                const data = await res.json();
                setCategories(data);
            } catch (error) {
                console.log("Category route error: ", error);
            }
        }
        fetchCategories();
    }, []);
    return (
        <nav className="lg-block border-t border-b border-[#f1f3f2]">
            <div className='container mx-auto'>
                <ul className="flex gap-8 items-bottom text-sm font-medium">
                    {categories.map((category) => (
                        <li key={category.id} className='relative group py-4'>
                            <Link href={`/${category.slug}`} className='uppercase text-sm font-medium tracking-wide hover:underline cursor-pointer transition-colors duration-200'>
                                {category.name}
                            </Link>
                            {category.subcategories?.length > 0 && (
                                <ul className='invisible absolute left-0 top-full z-50 w-48 rounded-md bg-white shadow-xl/30 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100'>
                                    {category.subcategories.map((subcategory) => (
                                        <li key={subcategory.id}>
                                            <Link href={`/${category.slug}/${subcategory.slug}`} className='block px-4 py-2 text-sm hover:bg-gray-100'>
                                                {subcategory.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}

                </ul>
            </div>

        </nav>
    )
}