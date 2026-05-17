import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-[#ffcc00] selection:text-black overflow-hidden flex flex-col">
            {/* Header / Navbar */}
            <header className="absolute top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <img src="/images/eglix-black.png" alt="Eglix Logo" className="h-8 w-auto" />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/login" className="text-sm font-bold text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:text-white px-6 py-2.5 rounded-full transition-all">
                            Se connecter
                        </Link>
                        <Link 
                            to="/register" 
                            className="bg-black text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Digitaliser mon église
                        </Link>
                    </nav>

                    {/* Mobile Menu Button (simplified for landing) */}
                    <div className="md:hidden flex items-center">
                        <Link to="/login" className="text-sm font-bold text-gray-900 border-2 border-gray-900 px-5 py-2 rounded-full hover:bg-gray-900 hover:text-white transition-colors">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center relative pt-24 pb-20">
                {/* Abstract Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffcc00]/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ffdb4d]/20 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

                <div className="max-w-5xl mx-auto px-6 text-center space-y-8 z-10">
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] animate-fade-in-up animation-delay-100">
                        La gestion de votre <span className="font-serif italic text-[#ffcc00]">église</span>,<br className="hidden md:block" />
                        <span className="font-serif italic font-normal text-gray-800">simplifiée</span> et <span className="inline-block px-6 py-2 ml-2 bg-black text-white rounded-full font-sans not-italic text-4xl md:text-6xl align-middle shadow-lg">modernisée</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed animate-fade-in-up animation-delay-200">
                        Eglix est la solution B2B tout-en-un qui aide les églises à gérer leurs membres,
                        finances, événements et annexes avec une fluidité absolue.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-fade-in-up animation-delay-300">
                        <Link 
                            to="/register" 
                            className="w-full sm:w-auto px-8 py-4 bg-[#ffcc00] hover:bg-[#ffdb4d] text-black text-lg font-bold rounded-2xl transition-all shadow-[0_8px_20px_-6px_rgba(255,204,0,0.5)] hover:shadow-[0_12px_24px_-6px_rgba(255,204,0,0.6)] hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                        >
                            Digitaliser mon église
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link 
                            to="/login" 
                            className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 text-lg font-bold rounded-2xl transition-all flex items-center justify-center"
                        >
                            Espace de connexion
                        </Link>
                    </div>
                </div>

                {/* Dashboard Preview mockup */}
                <div className="w-full max-w-6xl mx-auto px-6 mt-20 relative animate-fade-in-up animation-delay-500">
                    <div className="relative rounded-[2rem] bg-white shadow-2xl border border-gray-100 p-2 md:p-4 overflow-hidden transform perspective-1000 rotate-x-2 hover:rotate-x-0 transition-transform duration-700">
                        {/* Browser dots */}
                        <div className="flex items-center gap-2 px-4 pb-3 pt-2 border-b border-gray-50">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        {/* Actual dashboard image */}
                        <div className="bg-gray-50 rounded-xl flex overflow-hidden">
                            <img src="https://i.ibb.co/C3xCCV4L/Frame-5-1-1.png" alt="Aperçu du tableau de bord Eglix" className="w-full h-auto object-cover" />
                        </div>
                        
                        {/* Overlay gradient to fade out bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Tout ce dont vous avez besoin pour gérer votre église</h2>
                        <p className="text-lg text-gray-600">Une suite d'outils puissants conçus spécifiquement pour les églises, simplifiant l'administration quotidienne pour vous laisser vous concentrer sur l'essentiel.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-[2rem] bg-[#fafafa] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Communauté</h3>
                            <p className="text-gray-600 leading-relaxed">Gérez vos membres, suivez les nouveaux invités et organisez vos groupes de maison avec facilité.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-[2rem] bg-[#fafafa] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-[#ffcc00] text-black rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Finances</h3>
                            <p className="text-gray-600 leading-relaxed">Suivi transparent des dîmes, offrandes et dépenses. Gardez un contrôle total sur votre trésorerie.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-[2rem] bg-[#fafafa] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Annexes</h3>
                            <p className="text-gray-600 leading-relaxed">Supervisez plusieurs églises ou annexes depuis un compte central avec une gestion fine des accès.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-8 rounded-[2rem] bg-[#fafafa] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-[#ffcc00] text-black rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Rapports</h3>
                            <p className="text-gray-600 leading-relaxed">Générez des rapports automatiques en temps réel pour prendre des décisions éclairées.</p>
                        </div>

                        {/* Feature 5 */}
                        <div className="p-8 rounded-[2rem] bg-[#fafafa] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Projets & Journal</h3>
                            <p className="text-gray-600 leading-relaxed">Planifiez vos projets, gérez vos tâches et tenez un journal d'administration sécurisé.</p>
                        </div>

                        {/* Feature 6 */}
                        <div className="p-8 rounded-[2rem] bg-[#fafafa] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-[#ffcc00] text-black rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Documents</h3>
                            <p className="text-gray-600 leading-relaxed">Archivez et partagez facilement tous vos documents importants dans un espace de stockage sécurisé.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="border-t border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 font-medium">
                        © {new Date().getFullYear()} Eglix. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                        <Link to="#" className="hover:text-gray-900 transition-colors">Confidentialité</Link>
                        <Link to="#" className="hover:text-gray-900 transition-colors">Conditions</Link>
                        <Link to="#" className="hover:text-gray-900 transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
