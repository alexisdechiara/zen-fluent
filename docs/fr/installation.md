# Installation

Traduction de [docs/installation.md](../installation.md). Les autres pages
de la documentation sont encore en anglais
([#13](https://github.com/alexisdechiara/zen-fluent/issues/13)). Les noms
des réglages sont donnés tels que Sine les affiche, en anglais ; Zen Fluent
Enhanced les traduit dans sa page de réglages quand Zen est en français.

## Windows : l'installateur

`ZenFluentSetup.exe`, joint à chaque
[version](https://github.com/alexisdechiara/zen-fluent/releases), installe
Sine (s'il manque), Zen Fluent et, si la case reste cochée, Zen Fluent
Enhanced dans le profil Zen choisi ; il ne reste qu'à ouvrir Zen. Fermez Zen
avant de le lancer. Zen Fluent Enhanced a besoin de la case qui autorise les
scripts des mods installés hors de la boutique de Sine
(`sine.allow-unsafe-js`). Windows ne demande les droits d'administrateur que
si le chargeur de Sine doit aller dans le dossier de Zen. Ce que fait
l'installateur, et ses options sans fenêtre :
[installer/README.md](../../installer/README.md) (en anglais).

## Avec Sine

[Sine](https://github.com/CosmoCreeper/Sine) est le gestionnaire de mods de
Zen.

1. Paramètres de Zen › Sine › Mods, installer depuis GitHub :
   `alexisdechiara/zen-fluent`.
2. Ouvrez les réglages du mod (la roue dentée sur sa carte).

Sine écrit les valeurs par défaut de `core/preferences.json`, sauf pour les
préférences de Firefox et de Zen qui existent déjà (**Allow the mod's icons**,
« Autoriser les icônes du mod », et le groupe **Zen settings**) : elles
gardent leur valeur, et **Allow the mod's icons** doit être coché à la main.

Les réglages sont rangés en groupes repliables, comme le SettingsExpander de
WinUI : cliquez sur le titre d'un groupe pour l'ouvrir ou le fermer, et son
état est gardé d'une session à l'autre. **Appearance** est ouvert au départ ;
**Show all settings** ouvre tout. Au clavier, Espace ouvre ou ferme un groupe
pour la session seulement (Sine n'enregistre pas une case changée au
clavier). Les lignes sans effet avec les valeurs choisies sont masquées.

### Zen Fluent Enhanced

Installez-le aussi depuis GitHub, depuis son dossier :
`alexisdechiara/zen-fluent/tree/main/enhanced`. Il installe Zen Fluent s'il
manque. Sine n'exécute le JavaScript des mods hors de sa boutique que si
**Enable installing JS from unofficial sources** est coché dans les réglages
de Sine (`sine.allow-unsafe-js`). Redémarrez Zen après l'installation. Ses
fonctions et leurs interrupteurs : [enhanced.md](../enhanced.md) (en
anglais).

## Icônes Fluent

Le mod remplace les icônes de Zen par des icônes Fluent au trait
(`core/icons/`) : Précédent, Suivant, Actualiser, Nouvel onglet, fermeture
d'onglet, Bibliothèque, mode compact, extensions, menu, dossiers (ouverts et
fermés), chevron de l'espace, copie du lien et réglages du site dans la barre
d'adresse, boutons de Glance et de la vue scindée, carte multimédia (lecture,
pause, pistes, son, Picture-in-Picture), tout le menu ≡, et les icônes
d'espace « briefcase » et « code » (les autres icônes d'espace restent celles
de Zen). Avec **Fluent icons** décoché, Zen garde les siennes.

Ces icônes prennent la couleur du thème par `context-fill`, que Firefox
réserve à ses propres fichiers tant que
`svg.context-properties.content.enabled` vaut `false`. Tant que cette
préférence n'est pas à `true` (**Allow the mod's icons** dans Sine, ou
`about:config`), Zen garde aussi ses icônes.

## Installation manuelle

1. `about:config` : `toolkit.legacyUserProfileCustomizations.stylesheets` =
   `true`.
2. Copiez le dossier `core/` dans le dossier `chrome/` du profil
   (`about:support` › Dossier de profil).
3. Dans `chrome/userChrome.css`, ajoutez `@import url("core/chrome.css");`,
   et dans `chrome/userContent.css`, `@import url("core/userContent.css");`
   (créez les fichiers au besoin ; les imports passent avant toute autre
   règle).
4. Dans `about:config`, créez les préférences `zen-fluent.*` du
   [tableau des réglages](../settings/README.md) avec leurs valeurs par
   défaut : sans Sine, rien ne les écrit. Mettez aussi
   `svg.context-properties.content.enabled` à `true` pour les icônes.
5. Redémarrez Zen.

## Windows 11 : Mica For Everyone

Le vrai fond Mica / Acrylic vient de
[Mica For Everyone](https://github.com/MicaForEveryone/MicaForEveryone) ; Zen
Fluent ne fait que le teinter.

1. Installez Mica For Everyone.
2. **Add rule** › **Process rule** : `zen`.
3. Choisissez le type de fond qui correspond à **Backdrop material**
   (« Matériau d'arrière-plan ») dans Sine :

   | Backdrop material (Sine) | Mica For Everyone |
   | ------------------------ | ----------------- |
   | Mica                     | Mica              |
   | Mica Alt (Tabbed)        | Tabbed            |
   | Acrylic                  | Acrylic           |

4. Paramètres de Windows › Personnalisation › Couleurs : désactivez
   **Afficher la couleur d'accentuation sur les barres de titre et les
   bordures de fenêtres**, sinon la transparence ne se voit pas.
5. Laissez `widget.windows.mica` à `true` (la valeur par défaut de Zen) :
   elle garde la fenêtre transparente.
6. Si Zen et Windows ne sont pas dans le même mode clair / sombre, réglez
   **Title bar color** de la règle sur **Default** : avec **System**, Windows
   dessine le Mica du thème du système sous la teinte du mod (un Zen sombre
   sur un Mica clair donne un fond gris).

Teinte posée sur le fond de Mica For Everyone (une seule couche) : Mica
64 %, Acrylic 80,64 % en clair et 87,04 % en sombre, Mica Alt 0 % ; **Tint
opacity** (« Opacité de la teinte ») la change
([appearance](../settings/appearance.md), en anglais). La Bibliothèque n'a
pas de surface à elle : elle montre le matériau de la fenêtre, comme la barre
latérale qu'elle remplace.

### Mica Alt

Avec **Mica Alt (Tabbed)**, le mod ne teinte rien : c'est le Mica Alt de
Mica For Everyone, sans teinte, comme dans les applications WinUI. La barre
latérale, les barres d'outils, la Bibliothèque et les marges autour de la
page forment un seul fond uniforme. Ce qui flotte au-dessus de la page (barre
d'adresse ouverte, barre latérale et barre du haut du mode compact, barre de
recherche, boîtes de dialogue) prend une couleur Mica Alt opaque, car Firefox
ne floute pas le contenu web.

## Linux : transparence et flou du compositeur

Linux n'a pas de Mica : Zen rend la fenêtre transparente et le compositeur
floute ce qui se trouve derrière.

1. `about:config` : `zen.widget.linux.transparency` = `true`, puis
   redémarrez Zen. Zen Fluent passe alors des teintes pleines aux teintes
   translucides (Mica 64 %, Mica Alt 79,75 %, Acrylic 80,64 % en clair et
   87,04 % en sombre).
2. Activez le flou pour votre bureau :
   - **KDE Plasma** : installez
     [Better Blur DX](https://github.com/xarblu/kwin-effects-better-blur-dx),
     puis Configuration du système › Gestion des fenêtres › Effets de
     bureau : désactivez **Flou**, activez **Better Blur DX**, et ajoutez la
     classe `zen` dans son onglet **Force blur** (`zen-browser` pour le
     paquet AUR `zen-browser-bin`).
   - **GNOME** : l'extension
     [Blur my Shell](https://github.com/aunetx/blur-my-shell), onglet
     **Applications** : activez le flou des applications, désactivez
     **Opaque focused window**, opacité au maximum, ajoutez `zen` à la liste.
   - **Hyprland** : `decoration { blur { enabled = true } }` dans
     `hyprland.conf` ; les fenêtres transparentes sont floutées.

Sans compositeur, la transparence donne un fond noir : laissez la préférence
à `false`, et le mod peint le matériau en plein.

Sur macOS, le mod teinte le fond transparent de la fenêtre avec les mêmes
valeurs que sous Linux transparent.

## Sans accélération matérielle

Avec le rendu logiciel, Zen marque la fenêtre `zen-no-acrylic` et le flou CSS
ne fonctionne pas. Les surfaces Acrylic (menus, panneaux, en-tête de la vue
scindée, boutons de Glance) prennent alors la couleur de repli pleine de
WinUI, comme avec « Réduire la transparence », et le grain de l'Acrylic
disparaît. Ce qui flotte au-dessus de la page (barre d'adresse ouverte, fond
Acrylic de la barre latérale compacte) est toujours plein.
