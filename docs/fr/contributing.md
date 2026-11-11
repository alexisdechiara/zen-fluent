# Contribuer

Traduction de [docs/contributing.md](../contributing.md). Le code, ses
commentaires et les libellés des réglages restent en anglais.

## Organisation

```
theme.json               manifeste Sine de Zen Fluent (id Zen-Fluent), pointe dans core/
core/
  chrome.css             @import des fichiers du chrome, dans l'ordre de la cascade
  userContent.css        @import des fichiers des pages internes
  preferences.json       réglages Sine
  icons/                 icônes Fluent au trait (stroke="context-fill")
  src/
    tokens/              valeurs --zf-* (paires light-dark()), accent, rayons, polices
    base/                plomberie de toute la fenêtre : texte, forme des coins, fond
    components/<zone>/   l'apparence par défaut de chaque zone
    features/            un fichier par option (features/<pref>.css)
    content/             pages about:, réglages de Zen et de Sine
    compat/              règles pour les mods tiers (docs/compatibility.md)
enhanced/                Zen Fluent Enhanced (id Zen-Fluent-Enhanced)
  theme.json · chrome.css · scripts/
components.json          composants que connaît l'installateur (installer/README.md)
scripts/                 check.mjs, release.mjs
docs/
```

Sine installe Zen Fluent depuis la racine du dépôt (le dépôt entier) et
Enhanced depuis `tree/main/enhanced` (ce dossier seulement). Sine repère les
points d'entrée par leur nom : aucun fichier sous `src/` ne doit se terminer
par `chrome.css` ou `userContent.css`.

## Règles

- **L'ordre des imports est l'ordre de la cascade.** `core/chrome.css` liste
  les fichiers dans l'ordre où leurs règles doivent s'appliquer ; déplacer un
  import peut changer la règle qui l'emporte à égalité. Ajoutez un fichier à
  côté de ceux qu'il remplace.
- **Un sujet par fichier**, qui commence par cet en-tête :

  ```css
  /* Zen Fluent: <subject>.
     User sheet: declarations take !important to win over Zen's own CSS. */
  ```

  Sine charge le mod comme une feuille utilisateur : une déclaration sans
  `!important` perd face au CSS de Zen, variables comprises. La ligne
  d'en-tête justifie tous les `!important` du fichier ; n'ajoutez un
  commentaire que si un `!important` est là pour une autre raison.

- **Zones** : l'import du fichier d'une zone dans `core/chrome.css` (ou
  `core/userContent.css`) porte
  `not (-moz-pref("zen-fluent.fluent-<zone>", false))` ; les jetons, la
  plomberie de base et les options globales sont importés sans condition
  ([zones](settings/zones.md)). Prettier coupe un import conditionné sur
  plusieurs lignes.
- **Règles de compatibilité** : un fichier par mod dans `core/src/compat/`,
  importé en dernier. Elles ne ciblent que ce que le mod ajoute et n'ont
  besoin d'aucun réglage.
- **Noms** : préférences `zen-fluent.*` (Enhanced : `zen-fluent.enhanced.*`),
  variables `--zf-*`, identifiants, classes, attributs et keyframes `zf-`.
- **Chaque réglage** passe par
  `@media (-moz-pref("zen-fluent.xxx", "value"))`. Un réglage activé par
  défaut se lit `not (-moz-pref(name, false))` (et son apparence désactivée
  `(-moz-pref(name, false))`) : Sine n'écrit la valeur par défaut qu'à
  l'ouverture des réglages du mod, donc d'ici là la préférence manque et un
  simple `-moz-pref(name)` la lit comme désactivée. `npm run check` refuse
  cette forme.
- Commentaires du code en anglais ; documentation d'abord en anglais.
- Le code source de Zen
  ([zen-browser/desktop](https://github.com/zen-browser/desktop), `src/zen`)
  est la référence pour les sélecteurs ; vérifiez-les en direct
  (Ctrl+Maj+Alt+I › Éditeur de style) avant de vous y fier.

## Ajouter un réglage

1. Une ligne dans `core/preferences.json` : des valeurs ASCII sans espace
   (Sine les refuse), `"placeholder": false` sur chaque liste déroulante.
2. Le CSS, dans `core/src/features/<pref>.css` quand c'est un bloc à part.
3. Une ligne dans le tableau des réglages
   ([docs/settings/README.md](../settings/README.md)) avec sa valeur par
   défaut, et dans `docs/settings/<group>.md`.

Groupes repliables : chaque groupe commence par une case
`zen-fluent.ui.open-<group>` (l'en-tête). Un nouveau groupe demande un
en-tête, une ligne dans la règle de masquage de
`core/src/content/sine/settings-groups.css` et une icône dans
`core/src/content/sine/group-icons.css`. Une ligne conditionnelle ne doit pas
terminer un groupe (les coins du bas vont à la dernière ligne). Sine
n'applique les `conditions` d'une ligne qu'après le premier changement de
préférence : masquez aussi les lignes conditionnelles en CSS.

## Vérifications

```sh
npm install
npm run lint       # prettier + stylelint
npm run lint:fix
npm run check      # imports, urls, en-têtes, manifestes, réglages, docs, versions
```

La CI lance `lint` et `check` à chaque push.

## Tester dans Zen

Zen piloté par Marionette (`--marionette --remote-allow-system-access`) sur
un profil de test, avec Sine copié depuis un profil existant et le dépôt lié
dans `chrome/sine-mods/Zen-Fluent` (une jonction), déclaré dans
`sine-mods/mods.json`. Appliquez chaque valeur de chaque réglage en direct,
puis vérifiez le style calculé de l'élément à l'écran (pas de son conteneur).
Les feuilles du chrome et les feuilles utilisateur ne signalent aucune erreur
CSS dans la console : stylelint valide les valeurs.

## Versions

Zen Fluent suit Zen, donc sa version suit aussi l'état de Zen :

- **1.0.0** viendra quand Zen sortira de bêta. D'ici là, les versions
  restent en `0.x.y`.
- **Mineure** (`0.5.0` → `0.6.0`) : un changement de Zen qui casse quelque
  chose dans le mod, en général une fonction majeure de Zen (une nouvelle
  Bibliothèque, une barre d'adresse redessinée, un élément renommé), et un
  changement du mod lui-même qui casse quelque chose pour ses utilisateurs
  (un réglage renommé ou supprimé, une apparence par défaut différente).
- **Correctif** (`0.5.0` → `0.5.1`) : chaque mise à jour de Zen que le mod
  suit, et tout ce qui ne casse rien : corrections, compatibilité, nouvelles
  fonctions et nouveaux réglages.

## Publication

```sh
npm run release -- 0.5.1
```

La commande écrit la version dans `package.json`, les deux `theme.json` et
`components.json`, met à jour `updatedAt` (Sine ne met un mod à jour que si
cette date avance) et transforme la section **Unreleased** du CHANGELOG en
version publiée. Ensuite, commitez, posez le tag `v0.5.1` et poussez.
