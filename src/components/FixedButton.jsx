import { Link } from 'react-router-dom';

export default function FixedButton({ text, icon, to, onClick }) {
    const baseClasses = "fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 inline-flex items-center justify-center px-5 py-3 md:px-6 md:py-4 bg-black text-white font-medium text-sm md:text-base rounded-xl shadow-2xl hover:bg-gray-900 hover:scale-105 transition-all duration-300 hover:shadow-black/25 active:scale-95";

    const content = (
        <>
            {icon && <span className="mr-2">{icon}</span>}
            <span>{text}</span>
        </>
    );

    if (to) {
        return (
            <Link to={to} className={baseClasses}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={baseClasses}>
            {content}
        </button>
    );
}
