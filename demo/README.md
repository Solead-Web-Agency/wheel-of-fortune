# 🎡 Roue des Gagnants - Festivals

Application web de roue de la fortune pour les festivals Francofolies et Golden Coast.

## 🎪 Fonctionnalités

- **2 festivals distincts** avec leurs propres lots et couleurs
- **Gestion des stocks** par jour et par festival
- **Système de probabilités** : 33% pour chaque lot principal + 1% pour le bonus
- **Sauvegarde automatique** des données par festival
- **Interface tactile** optimisée pour tablettes

## 🎵 Festivals

### Francofolies
- 🎶 T-shirt Francos
- 🎤 Tote bag  
- 🎵 Badge collector
- ✨ Bonus VIP (question bonus)

### Golden Coast
- 🏖️ Casquette GC
- 🌊 Serviette plage
- ☀️ Crème solaire
- 🎁 Surprise (question bonus)

## 🚀 Déploiement sur Vercel

### Méthode 1 : Interface Vercel
1. Connectez-vous sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Sélectionnez le dossier `demo/` comme répertoire racine
5. Vérifiez que les paramètres de build sont corrects :
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Cliquez sur "Deploy"

### Méthode 2 : CLI Vercel
```bash
cd demo/
npm install -g vercel
vercel --prod
```

## 🛠️ Développement local

```bash
cd demo/
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 📱 Utilisation

1. **Sélectionnez le festival** avec les boutons en haut
2. **Choisissez le jour** (Jour 1 ou Jour 2)
3. **Lancez la roue** avec le bouton principal
4. **Suivez les statistiques** dans le panneau admin en bas à droite

## 🎯 Administration

- **Statistiques en temps réel** : Voir les lots distribués par jour
- **Reset complet** : Bouton de remise à zéro (accessible via le panneau admin)
- **Sauvegarde automatique** : Les données sont sauvegardées séparément pour chaque festival

## 🎨 Personnalisation

Les configurations des festivals se trouvent dans `src/App.tsx` :
- Couleurs thématiques
- Lots disponibles
- Stocks par jour
- Emojis et textes

## 📊 Probabilités

- **33%** pour chaque lot principal (si en stock)
- **1%** pour le bonus rare
- **Répartition automatique** si certains lots sont épuisés

---

*Application développée pour les festivals Francofolies et Golden Coast* 🎪
