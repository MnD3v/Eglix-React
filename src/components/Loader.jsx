export default function Loader({ className = "" }) {
    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
        </div>
    );
}
