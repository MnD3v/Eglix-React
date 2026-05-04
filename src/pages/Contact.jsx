import React from 'react'

const Contact = () => {
    return (
        <body>
            <header class="appbar">
                <h1>Blobli</h1>
            </header>

            <section class="landing">
                <h2>Bienvenue dans votre bibliothèque en ligne</h2>
                <p>Recherchez et découvrez vos livres préférés en toute simplicité.</p>
            </section>

            <section class="search-section">
                <input type="text" placeholder="Rechercher un livre..." />
            </section>

            <section class="books">
                <div class="book">📘 Le Petit Prince</div>
                <div class="book">📗 L’Alchimiste</div>
                <div class="book">📕 Les Misérables</div>
                <div class="book">📙 Une si longue lettre</div>
            </section>

        </body>
    )
}

export default Contact
