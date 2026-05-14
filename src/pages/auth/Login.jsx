import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';

export default function Login() {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await signIn({ email, password });
            if (error) throw error;
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-20 px-6 font-sans">
            <div className="w-full max-w-[440px]">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-12">
                    <img src="/images/eglix-black.png" alt="Eglix Logo" className="h-10 w-auto" />
                </div>

                <h1 className="text-[40px] font-bold text-gray-900 leading-tight mb-2">
                    Se connecter
                </h1>
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Adresse email <span className="text-red-500">*</span>
                        </label>
                        <div className="premium-input-container">
                            <span className="premium-input-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="premium-input"
                                placeholder="Votre email"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Mot de passe <span className="text-red-500">*</span>
                        </label>
                        <div className="premium-input-container">
                            <span className="premium-input-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="premium-input"
                                placeholder="Votre mot de passe"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="premium-button-primary mt-4"
                    >
                        {loading ? (
                            <Spinner size="md" className="mx-auto text-black" />
                        ) : 'Se connecter'}
                    </button>
                </form>

                <div className="mt-12 text-center text-sm font-medium text-gray-500">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-[#ff9900] hover:underline">
                        Créer un compte
                    </Link>
                </div>
            </div>
        </div>
    );
}


