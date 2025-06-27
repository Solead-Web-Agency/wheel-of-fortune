#!/bin/bash

# Script de déploiement pour Vercel
# Usage: ./deploy.sh

echo "🎡 Déploiement de la Roue des Gagnants sur Vercel"
echo "================================================"

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le dossier demo/"
    exit 1
fi

# Installer Vercel CLI si nécessaire
if ! command -v vercel &> /dev/null; then
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

# Build l'application
echo "🔨 Construction de l'application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi !"
    
    # Déployer sur Vercel
    echo "🚀 Déploiement sur Vercel..."
    vercel --prod
    
    echo "🎉 Déploiement terminé !"
    echo ""
    echo "🎪 Votre roue de la fortune est maintenant en ligne !"
    echo "📱 Accessible sur tablettes et mobiles"
    echo "🎵 Festival Francofolies et 🏖️ Golden Coast disponibles"
else
    echo "❌ Erreur lors du build"
    exit 1
fi 