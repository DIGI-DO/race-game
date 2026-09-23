# 🏎️ Race Game - Guide d'installation

## Prérequis

- **Node.js** 16+ (https://nodejs.org)
- **Git** (optionnel mais recommandé)
- Un compte **Firebase** gratuit

---

## 🚀 Installation rapide

### 1️⃣ Créer un projet Firebase

**Allez sur https://console.firebase.google.com/**

#### 1.1 Créer le projet
- Cliquez **"Créer un projet"**
- Nom: `race-game-test`
- Pas besoin de Google Analytics
- Cliquez **"Créer un projet"** → attendez 30 sec

#### 1.2 Activer Realtime Database
- Menu gauche → **Realtime Database**
- **Créer une base de données**
- Region: `europe-west1`
- Mode: **Mode test** (pour les tests)
- **Activer**

#### 1.3 Récupérer les credentials

Dans **Paramètres du projet** (⚙️) → onglet **"Général"** :

Vous verrez une boîte JavaScript, cherchez un objet ressemblant à:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "race-game-test.firebaseapp.com",
  databaseURL: "https://race-game-test.firebaseio.com",
  projectId: "race-game-test",
  storageBucket: "race-game-test.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234..."
};
```

**Copiez ces 7 valeurs** → vous en aurez besoin.

---

### 2️⃣ Cloner et configurer le projet

```bash
# Option A : Cloner du ZIP (si vous avez le ZIP)
unzip race-game.zip
cd race-game

# Option B : Créer à partir de zéro
git clone <votre-repo> race-game
cd race-game
```

### 3️⃣ Installer les dépendances

```bash
npm install
```

### 4️⃣ Configurer Firebase

Créez un fichier `.env.local` à la racine du projet:

```bash
cp .env.example .env.local
```

Puis ouvrez `.env.local` et **remplacez les valeurs** par celles de Firebase:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=race-game-test.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://race-game-test.firebaseio.com
VITE_FIREBASE_PROJECT_ID=race-game-test
VITE_FIREBASE_STORAGE_BUCKET=race-game-test.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234
```

### 5️⃣ Tester en local

```bash
npm run dev
```

Ouvrez votre navigateur sur **http://localhost:5173**

✅ Vous devriez voir le menu du jeu!

---

## 📱 Tester sur votre téléphone (même wifi)

Depuis votre ordinateur, trouvez votre adresse IP locale:

**Windows:**
```bash
ipconfig
```
Cherchez `IPv4 Address` type `192.168.x.x`

**Mac/Linux:**
```bash
ifconfig
```

Puis sur votre téléphone, ouvrez:
```
http://192.168.x.x:5173
```

---

## 🌐 Déployer sur Vercel (gratuit)

### 1. Créer un repo GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/race-game.git
git push -u origin main
```

### 2. Déployer sur Vercel

1. Allez sur **https://vercel.com/new**
2. Connectez votre GitHub
3. Sélectionnez votre repo `race-game`
4. Cliquez **Import**
5. Dans **Environment Variables**, ajoutez les 7 variables Firebase:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - etc...

6. Cliquez **Deploy**

✅ Votre app sera en ligne en 2 minutes!

Vercel vous donnera une URL type: `https://race-game-xyz.vercel.app`

---

## 📲 Installer comme PWA

Depuis votre téléphone (sur Vercel ou en local):

**iOS (Safari):**
- Appuyez sur le bouton **Partage**
- Sélectionnez **Sur l'écran d'accueil**

**Android (Chrome):**
- Appuyez sur **⋮** (menu)
- Sélectionnez **Installer l'application**

L'app apparaît alors comme une vraie app sur votre téléphone!

---

## 🎮 Modes de jeu

### Mode Local (Joueur vs IA)
- Sélectionnez une distance
- Cliquez **"Jouer contre l'IA"**
- L'IA joue automatiquement
- Testable immédiatement

### Mode Multijoueur (En ligne)
- Créez une partie avec un code
- Partager le code avec un ami
- Vous jouez en temps réel via Firebase

---

## 🐛 Troubleshooting

### Firebase ne se connecte pas
- Vérifiez que les variables `.env.local` sont correctes
- Vérifiez que Realtime Database est activée

### Le jeu ne charge pas sur téléphone
- Vérifiez que vous êtes sur le même wifi
- Essayez `npm run build` puis `npm run preview`

### L'IA ne joue pas
- C'est normal, attendez 500ms entre les tours
- Vérifiez la console pour les erreurs

---

## 📊 Tester avec votre simulateur Python

Pour comparer les résultats:

```python
python3 simulateur_course.py --games 1000 --distance 700
```

Et vérifier que le jeu mobile produit les mêmes statistiques!

---

## 📝 Notes pour les testeurs

Merci de tester:

1. **Mode local** sur plusieurs distances (300-1500 km)
2. **Durée des parties** (noter le nombre de tours)
3. **Fréquence des éliminations** (cartes casse moteur)
4. **Équilibre** entre hasard et stratégie

Feedback attendu:
- Les parties sont-elles trop courtes/longues?
- L'interface est-elle claire?
- Y a-t-il des bugs?

---

## 🚀 Prochaines étapes

- [ ] Implémenter le multijoueur Firebase complet
- [ ] Ajouter des bots intelligents (pas juste aléatoire)
- [ ] Animations améliorées
- [ ] Statistiques de partie
- [ ] Mode 3-4 joueurs

---

**Questions?** Ouvrez une issue sur GitHub ou contactez l'auteur.
