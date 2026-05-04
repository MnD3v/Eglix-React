# Section Dîmes - Eglix

## Vue d'ensemble

La section **Dîmes** permet de gérer les contributions financières des membres de votre église. Cette fonctionnalité a été créée en s'inspirant de la structure existante d'Egliox.

## Fichiers créés

### 1. Service (`src/services/titheService.js`)
Service pour gérer toutes les opérations CRUD des dîmes :
- `getAll()` - Récupérer toutes les dîmes avec filtres
- `getById()` - Récupérer une dîme spécifique
- `create()` - Créer une nouvelle dîme
- `update()` - Modifier une dîme existante
- `delete()` - Supprimer une dîme
- `getStats()` - Obtenir les statistiques (total, ce mois, par mode de paiement)
- `getMembers()` - Récupérer la liste des membres actifs

### 2. Page de liste (`src/pages/tithes/TithesList.jsx`)
Interface utilisateur complète avec :
- **Statistiques** : Total, ce mois, par mode de paiement (espèces, mobile money, virement)
- **Filtres** : Recherche et filtrage par mode de paiement
- **Vue responsive** : Cards pour mobile, tableau pour desktop
- **Actions** : Modifier et supprimer avec confirmation
- **Design moderne** : Inspiré de MembersList avec un design épuré

### 3. Script SQL (`supabase_tithes_table.sql`)
Création de la table dans Supabase avec :
- Structure de la table `tithes`
- Index pour optimiser les performances
- Row Level Security (RLS) pour la sécurité
- Triggers pour `updated_at`
- Politiques d'accès basées sur les églises

### 4. Navigation (`src/components/Layout.jsx`)
- Ajout de l'icône "Dîmes" dans la sidebar
- Élément de navigation entre "Invités" et "Finances"

### 5. Routes (`src/App.jsx`)
- Route `/tithes` pour la liste des dîmes

## Installation

### 1. Exécuter le script SQL
1. Ouvrez Supabase SQL Editor
2. Copiez le contenu de `supabase_tithes_table.sql`
3. Exécutez le script pour créer la table et les politiques

### 2. Structure de la table `tithes`
```sql
- id (BIGSERIAL PRIMARY KEY)
- church_id (BIGINT, référence à churches)
- member_id (BIGINT, référence à members, nullable)
- amount (DECIMAL, montant de la dîme)
- date (DATE, date de la contribution)
- payment_method (VARCHAR, mode de paiement: cash, mobile, bank, check)
- description (TEXT, description optionnelle)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 3. Modes de paiement disponibles
- `cash` - Espèces
- `mobile` - Mobile Money
- `bank` - Virement bancaire
- `check` - Chèque

## Utilisation

### Accéder à la section Dîmes
1. Connectez-vous à votre compte
2. Cliquez sur "Dîmes" dans la sidebar
3. Vous verrez la liste de toutes les dîmes avec les statistiques

### Ajouter une dîme
1. Cliquez sur le bouton flottant "Ajouter une dîme"
2. Remplissez le formulaire (à créer)
3. Sélectionnez le membre (optionnel pour les dîmes anonymes)
4. Choisissez le mode de paiement
5. Enregistrez

### Filtrer les dîmes
- Utilisez la barre de recherche pour chercher par description ou membre
- Cliquez sur les cartes de statistiques pour filtrer par mode de paiement
- Utilisez le menu déroulant pour filtrer par mode de paiement

### Statistiques disponibles
- **Total** : Nombre total de dîmes et montant total
- **Ce mois** : Montant des dîmes du mois en cours
- **Espèces** : Montant total des dîmes en espèces
- **Mobile Money** : Montant total des dîmes par mobile money
- **Virement** : Montant total des dîmes par virement

## Prochaines étapes

Pour compléter la fonctionnalité, vous devrez créer :

1. **TitheForm.jsx** - Formulaire pour ajouter/modifier une dîme
   - Champs : membre, montant, date, mode de paiement, description
   - Validation des données
   - Gestion des erreurs

2. **TitheDetails.jsx** - Page de détails d'une dîme
   - Affichage complet des informations
   - Historique des modifications
   - Actions (modifier, supprimer)

3. **Routes supplémentaires** dans App.jsx :
   ```javascript
   <Route path="tithes/new" element={<TitheForm />} />
   <Route path="tithes/:id" element={<TitheDetails />} />
   <Route path="tithes/:id/edit" element={<TitheForm />} />
   ```

4. **Rapports et exports**
   - Export Excel/PDF des dîmes
   - Rapports mensuels/annuels
   - Graphiques de tendances

## Sécurité

- Les politiques RLS garantissent que les utilisateurs ne peuvent voir que les dîmes de leurs églises
- Toutes les opérations sont validées côté serveur
- Les montants sont stockés en DECIMAL pour éviter les erreurs d'arrondi

## Support

Pour toute question ou problème, consultez la documentation de Supabase ou contactez l'équipe de développement.
