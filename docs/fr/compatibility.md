# Compatibilité avec les autres mods

Traduction de [docs/compatibility.md](../compatibility.md).

Zen Fluent rhabille presque tout Zen : un mod qui habille les mêmes parties
rencontre donc ses règles. Cette page liste les mods vérifiés jusqu'ici, ce
qui se passe avec chacun, et ce que Zen Fluent fait.

| Mod                                                         | État                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| [Advanced Tab Groups](#advanced-tab-groups)                 | Fonctionne, avec les règles de compatibilité de Zen Fluent |
| [ZenLibraryTweaks](#zenlibrarytweaks)                       | Fonctionne, avec les règles de compatibilité de Zen Fluent |
| [Glance Plus](#glance-plus)                                 | Fonctionne, avec les règles de compatibilité de Zen Fluent |
| [Zen Second Sidebar Enhanced](#zen-second-sidebar-enhanced) | Fonctionne, avec les règles de compatibilité de Zen Fluent |
| [Zen Command Palette](#zen-command-palette)                 | Fonctionne, avec les règles de compatibilité de Zen Fluent |
| [Zen Calmer Context Menu](#zen-calmer-context-menu)         | Fonctionne, avec les règles de compatibilité de Zen Fluent |
| [BetterZenGradientPicker](#betterzengradientpicker)         | Fonctionne, avec les règles de compatibilité de Zen Fluent |
| [Zen Easel](#zen-easel)                                     | Fonctionne, avec les règles de compatibilité de Zen Fluent |
| [Vertex Mods](#vertex-mods)                                 | Fonctionne, avec les règles de compatibilité de Zen Fluent |
| [Zen Page Tint](#zen-page-tint)                             | Conflit : n'utilisez pas les deux                          |
| [Blended Addressbar](#blended-addressbar)                   | Conflit : n'utilisez pas les deux                          |
| [Better Find Bar](#better-find-bar)                         | Conflit : n'utilisez pas les deux                          |
| [SuperPins](#superpins)                                     | Conflit : n'utilisez pas les deux                          |
| [Thèmes entiers](#thèmes-entiers)                           | Cassent Zen Fluent : jamais les deux                       |

Les règles de compatibilité font partie de Zen Fluent (`core/src/compat/` et
quelques fichiers de composants) et ne demandent aucun réglage : elles ne
ciblent que ce que ces mods ajoutent.

La page de réglages de Zen Fluent Enhanced (**Mods**, la boutique de Sine
avec ces verdicts) lit la même liste dans
`enhanced/settings/compatible-mods.json`, où chaque mod note la version de
Zen Fluent et la version du mod de sa dernière vérification (`tested`). Son
badge indique **Works** (ou **Works with a limit**) seulement tant que les
deux correspondent encore : Zen Fluent par majeure.mineure, le mod par sa
version exacte (celle qui est installée, ou dans la boutique la dernière sur
GitHub) ; sinon **Not tested with this version**. Les mods en conflit
indiquent **Incompatible** quelle que soit leur version. Une vérification
met `tested` à jour dans le même commit.
Ils ont été vérifiés dans Zen 1.23.4b avec le CSS de chaque mod à la version
indiquée plus bas, les éléments que créent leurs scripts étant construits à
la main. Les Vertex Mods et les mods de **Featured** ont été vérifiés de
nouveau sur Zen 1.24b avec Zen Fluent 0.4.3, tous installés ensemble par
Sine, et tous les mods pris en charge sauf Zen Easel (lu, jamais exécuté)
sur Zen 1.24.1b avec Zen Fluent 0.5.0.

**Featured**, en haut de la page Mods, liste les mods que Zen Fluent
recommande, dans l'ordre de `featured` dans le même fichier.

Une nouvelle version de Zen Fluent (un tag `vX.Y.Z`) ouvre une issue pour
vérifier de nouveau chaque mod (`.github/workflows/mods-review.yml`), avec
les versions actuelles des mods ; avec un secret Claude sur le dépôt
(`ANTHROPIC_API_KEY` ou `CLAUDE_CODE_OAUTH_TOKEN`), Claude relit aussi le CSS
de chaque mod et le commente. La vérification complète se lance dans Claude
Code avec `/check-mods` (`.claude/commands/check-mods.md`) : chaque mod
installé avec Sine dans un Zen sans fenêtre, à côté de Zen Fluent. La liste
Featured ne nomme que des mods pris en charge avec une version testée
(`npm run check`).

Une tâche de CI hebdomadaire (`.github/workflows/mods.yml`,
`npm run check:mods`) lit le dépôt de chaque mod : une version plus récente
que `tested` est signalée avec les sélecteurs de son CSS qui touchent un
identifiant que Zen Fluent habille (ce qu'il faut regarder de nouveau), de
même qu'un dépôt archivé ou disparu, et qu'un dépôt Vertex Mods actif (non
archivé, poussé cette année) absent de la liste.

## Comment les mods se partagent la page

- Sine charge chaque mod comme une feuille **utilisateur**, dans l'ordre des
  identifiants des mods : `Zen-Fluent` commence par une majuscule, donc un
  mod dont l'identifiant est en minuscules (la plupart) vient après lui et
  l'emporte à égalité entre deux règles `!important` de même spécificité. Les
  règles de compatibilité utilisent donc un sélecteur plus spécifique que
  celui du mod.
- Un mod qui applique ses styles depuis un script avec des `!important` en
  ligne (origine auteur) perd face aux `!important` utilisateur de Zen
  Fluent, quel que soit le sélecteur.
- Un mod qui enveloppe ses règles dans `@layer` l'emporte sur toutes les
  règles `!important` hors couche de Zen Fluent.

## Advanced Tab Groups

[Vertex-Mods/Advanced-Tab-Groups](https://github.com/Vertex-Mods/Advanced-Tab-Groups)
(vérifié : 3.11.1). Active les groupes d'onglets de Firefox et les habille.

- **Les en-têtes de groupe** prennent la ligne d'un dossier Zen dans Zen
  Fluent : la hauteur de la ligne de dossier, le rayon des contrôles, le fond
  de survol WinUI (celui d'Edge dans le style Edge) et un libellé semi-gras
  dans la couleur de texte principale. Cela vaut pour l'apparence « dossier »
  (activée par défaut) et pour l'apparence propre à Advanced Tab Groups ; son
  style façon Arc garde son libellé de section.
- **Icônes de dossier** : les icônes de dossier Fluent (**Fluent icons**) ne
  remplacent l'icône de dossier de Zen que sur les dossiers Zen. Avec
  l'apparence dossier, un groupe garde la copie de l'icône de dossier de Zen
  que fait Advanced Tab Groups, teintée de la couleur du groupe, et son
  animation d'ouverture et de fermeture.
- Un groupe d'onglets de Firefox sans Advanced Tab Groups garde l'apparence
  de Firefox.

Fichiers : `core/src/compat/advanced-tab-groups.css`,
`core/src/features/fluent-icons/folders.css`.

## ZenLibraryTweaks

[JustAdumbPrsn/ZenLibraryTweaks](https://github.com/JustAdumbPrsn/ZenLibraryTweaks)
(vérifié : 1.5.1). Ajoute des sections à la Bibliothèque et permet de
réordonner ses onglets.

- Sa section **History** remplace celle de Zen par une sous-classe : elle
  reçoit les mêmes lignes sur une seule ligne que celle de Zen. Sa touche
  propre (l'heure affichée à la place de l'adresse au survol) est conservée.
- **Réordonner les onglets de la Bibliothèque** les fait de nouveau glisser :
  les animations de boutons (**Button animations**) ne remplacent plus la
  transition des onglets ; le fond de survol et l'appui d'un onglet de la
  Bibliothèque s'animent sur la pastille dessinée derrière lui.
- En mode édition, le contour en tirets suit le rayon de la pastille de
  l'onglet, et le badge de suppression reste sur son coin.
- Les onglets **Widgets**, **Focus** et **Quick settings** de Zen Fluent
  Enhanced sont des sections qu'il peut réordonner et retirer ; une section
  retirée dans son mode édition reste retirée
  (`enhanced/scripts/lib/zf-library.sys.mjs`).
- Ses icônes et contours colorés de la Bibliothèque utilisent la teinte de
  dossier de Zen Fluent (l'accent), ses dossiers de marque-pages prennent les
  icônes de dossier Fluent, et la ligne sur laquelle un menu contextuel a été
  ouvert garde le fond de survol.
- Son onglet **Bookmarks** a un identifiant de libellé qu'aucun fichier de
  traduction ne définit ; à côté des onglets de Zen Fluent Enhanced, il
  affichait « Quick settings ». Zen Fluent Enhanced fournit maintenant ce
  libellé (`enhanced/l10n/`).

Fichiers : `core/src/compat/zen-library-tweaks.css`,
`core/src/components/library/history.css`,
`core/src/features/animations/button-animations.css`,
`core/src/features/fluent-icons/folders.css`.

## Glance Plus

[apoapostolov/Zen-Glance-Plus](https://github.com/apoapostolov/Zen-Glance-Plus)
(vérifié : 1.1.0). Ouvre des pages dans un Glance selon des règles, et ajoute
deux boutons à la bande de Glance.

- Ses boutons **Copy link** et **Bookmark** prennent déjà les boutons ronds
  en Acrylic de la bande. Avec **Fluent icons**, ils prennent aussi les
  icônes Fluent de lien et d'étoile, comme fermer, ouvrir et scinder à côté
  d'eux. En mode Raindrop, le bouton de marque-page garde le glyphe de
  Raindrop.

Fichier : `core/src/features/fluent-icons/glance-split.css`.

## Zen Second Sidebar Enhanced

[sinazadeh/zen-second-sidebar-enhanced](https://github.com/sinazadeh/zen-second-sidebar-enhanced)
(vérifié : 1.13.12). Des panneaux web dans une seconde barre latérale.

- Le panneau web prend le rayon et l'ombre de la carte de la page (Edge :
  8 px et le filet), sa barre d'outils la couche WinUI du panneau latéral de
  Firefox, son texte la couleur de ce panneau.
- Les boutons du lanceur prennent le fond de survol WinUI, et le bouton d'un
  panneau ouvert le fond de sélection.
- Ce qui flotte au-dessus de la page (un panneau non épinglé, le lanceur à
  masquage automatique) est en Acrylic plein, comme tout ce que Zen Fluent
  pose sur la page : Firefox ne floute pas la page derrière une surface
  translucide. Un panneau épinglé reste transparent sur le matériau de la
  fenêtre, comme la barre latérale de Zen. Depuis la 1.13.12, le lanceur à
  masquage automatique est translucide avec l'option **Acrylic sidebar** de
  Zen : il reste plein lui aussi.

Fichiers : `core/src/compat/second-sidebar.css`,
`core/src/components/firefox-sidebar/panel.css`.

## Vertex Mods

Les [Vertex Mods](https://github.com/orgs/Vertex-Mods/repositories) partagent
un petit système de design : chaque panneau, popup et boîte de dialogue est
dessiné à partir de jetons `--zenux-*`. Zen Fluent donne à ces jetons ses
propres valeurs (Segoe UI Variable, fonds et traits WinUI, l'accent, les
rayons de contrôle, de carte et de superposition, les ombres de menu volant
et de boîte de dialogue) ; ce qui flotte au-dessus de la page prend la
surface pleine, puisque Firefox ne floute pas le contenu web. Un thème choisi
dans les réglages d'un mod (le clair ou l'AMOLED de Search Engine Select)
l'emporte toujours. Fichier : `core/src/compat/zenux.css`. Vérifiés (Zen
1.24.1b, Zen Fluent 0.5.0) :

- **Advanced Tab Groups** 3.12.1, **Zen Command Palette** 2.0.0 : voir leurs
  sections.
- **Zen Tidy Tabs** 2.0.1 : son bouton de tri et sa ligne ondulée se placent
  tels quels dans la liste des onglets.
- **Tidy Downloads** 4.2.3 : ses cartes et son infobulle, près du bouton de
  la Bibliothèque.
- **Reopen Closed Tabs Menu** 1.1.9 et **Search Engine Select** 1.1.33 :
  leurs panneaux prennent les jetons ci-dessus.
- **Browse Bot** 3.0.0 : avec sa barre de recherche par IA, Ctrl+F est une
  carte qui flotte dans un coin de la page ; la bande de la barre de
  recherche de Zen Fluent lui donnait un fond de couche transparent et un
  séparateur en haut. La carte prend la surface pleine, les coins d'une
  superposition, un trait et l'ombre de menu volant. Fichier :
  `core/src/compat/browse-bot.css`.
- **Compact Settings** 1.1.4 : il replie la navigation des paramètres en une
  bande d'icônes qui s'ouvre au survol, et ses règles l'emportent sur le
  volet de 320 px de Zen Fluent. Zen Fluent gardait le champ de recherche
  sous le titre du volet, où il flottait au-dessus de la page, et affichait
  la première lettre du titre dans la bande : tant que le mod est actif, le
  champ de recherche va en haut de la page, le titre reste masqué comme le
  mod le dessine, et les sections de Zen Fluent restent repliées jusqu'à
  l'ouverture de la bande. Fichiers :
  `core/src/compat/compact-settings.css`,
  `enhanced/settings/preferences-nav.css`.
- **Floating Sidebar** 1.1.3 : non épinglé, le panneau latéral de Firefox
  flotte au-dessus de la page et la laissait voir à travers le fond de barre
  latérale de Zen Fluent ; il devient une carte avec la surface pleine et
  l'ombre de boîte de dialogue. Épinglé, il garde l'apparence ancrée de Zen
  Fluent. Fichier : `core/src/compat/floating-sidebar.css`.
- **Zen Auto Wallpaper** 0.2.2 : son bouton se place dans le sélecteur de
  dégradé.
- **Search Keyboard Shortcuts** 1.1.6 : sa recherche et ses filtres sur la
  page des raccourcis clavier de Zen.

## Zen Command Palette

[Vertex-Mods/Zen-Command-Palette](https://github.com/Vertex-Mods/Zen-Command-Palette)
(vérifié : 2.0.0). Des commandes dans la barre d'adresse. Ses résultats sont
des lignes de la barre d'adresse et ressemblent déjà à celles de Zen Fluent.

- Ses accents suivent l'accent de Zen Fluent (**Accent color**) au lieu de la
  couleur de l'espace.
- La pastille **Commands** affichée dans son mode préfixe est une pastille
  d'accent, avec la couleur de texte prévue pour l'accent, comme les boutons
  d'accent de Zen Fluent.

Fichier : `core/src/compat/command-palette.css`.

## Zen Calmer Context Menu

[sinazadeh/zen-calmer-context-menu](https://github.com/sinazadeh/zen-calmer-context-menu)
(vérifié : 5.5.3). Masque, replie et réordonne les entrées des menus
contextuels.

- **Apply the Zen space accent color** teinte les menus et les panneaux à la
  place de l'Acrylic : c'est un choix que vous faites dans ses réglages, et
  Zen Fluent le laisse faire.
- **Apply the Zen space gradient** peindrait le dégradé de Zen dans les
  menus, mais Zen Fluent affiche Mica à la place de ce dégradé : il n'y a
  rien à peindre, et les menus ne feraient que virer au gris uni de Zen. Zen
  Fluent garde alors l'Acrylic.
- La ligne d'**actions rapides** (Actualiser, Épingler…) réagit au survol
  comme les lignes de menu autour d'elle, et les **icônes restaurées**
  s'alignent sur les lignes de menu de Zen Fluent (retrait de 12 px, 12 px
  avant le libellé).

Fichier : `core/src/compat/calmer-context-menu.css`.

Sa page de réglages (une page dans un onglet) prend l'apparence de Zen
Fluent : le fond des Paramètres, les cartes, traits et coins WinUI, Segoe UI
Variable, l'accent. Son choix **Menu color** (le dégradé ou la couleur de
l'espace, qui rendait les menus bleus avec un espace bleu) y est masqué :
c'est **Menu tint** de Zen Fluent qui décide, neutre par défaut. **Fluent
defaults for mods** de Zen Fluent Enhanced donne aux options jamais modifiées
les valeurs les plus proches de Windows 11 : des icônes sur chaque option
dans le jeu Fluent, et la ligne d'actions rapides.
Fichiers : `core/src/compat/calmer-settings.css`,
`core/src/features/menu-tint.css`, `enhanced/scripts/mod-defaults.uc.js`.

## BetterZenGradientPicker

[JustAdumbPrsn/BetterZenGradientPicker](https://github.com/JustAdumbPrsn/BetterZenGradientPicker)
(vérifié : 2.1 pour Zen 1.23b, sur Zen 1.24b). Il redessine le sélecteur de
dégradé de Zen. Sine charge sa feuille avant celle de Zen Fluent
(`BetterZenGradientPicker` se trie avant `Zen-Fluent`), donc les règles de
Zen Fluent pour le sélecteur l'emportaient sur la moitié de son design et les
deux se mélangeaient. Tant que son sélecteur est là (son onde de luminosité,
`#zen-picker-lightness-wrapper`, le signale), l'apparence que Zen Fluent
donne au sélecteur s'efface ; le panneau garde la surface de Zen Fluent et le
padding de 10 px de Zen. Depuis Zen Fluent 0.4, le dégradé d'un espace teinte
la fenêtre (**Space color**, activé par défaut), donc le dégradé qu'il écrit
s'affiche sur le fond, comme dans Zen ; ses couleurs atteignent l'accent par
**Accent color** › **Zen workspace color**. Son premier lancement ouvre un
écran d'accueil par-dessus la fenêtre. Fichier :
`core/src/components/panels/gradient-picker.css`.

## Zen Easel

[trashshii007/zen-easel](https://github.com/trashshii007/zen-easel)
(vérifié : 0.9.0, son code lu, pas exécuté). Un canevas infini à
`about:easel`.

- Les panneaux de la page (barre du haut, barre d'outils, menus, popups)
  prennent l'accent, l'Acrylic, les traits, les couleurs de texte, l'ombre et
  la police de Zen Fluent : Easel les déclare comme jetons sur son élément
  `<zen-easel>`, qu'une règle utilisateur remplace. Le tableau et ses
  poignées gardent les couleurs d'Easel : ce sont le canevas.
- Son menu **Send to Easel** garde les couleurs de la barre d'Easel plutôt
  que l'Acrylic, volontairement.

Vérifié sur un `<zen-easel>` construit à la main avec les règles de jetons
d'Easel, pas dans un Easel en fonctionnement.

Fichier : `core/src/compat/easel.css`.

## Zen Page Tint

[caezium/zen-page-tint](https://github.com/caezium/zen-page-tint) (vérifié :
2.0.0). **Conflit.** Il colore la fenêtre d'après la page, ce que fait le
matériau de Zen Fluent : ses règles sont dans une couche de cascade et
l'emportent sur toutes celles de Zen Fluent, donc la barre d'outils et la
barre latérale prennent la couleur de la page par-dessus Mica (et perdent la
barre latérale en Acrylic en mode compact). Avec plusieurs barres d'outils,
il supprime aussi les marges de 4 px du style Edge autour de la page.
Utilisez l'un ou l'autre.

## Blended Addressbar

[kkugot/blended-addressbar](https://github.com/kkugot/blended-addressbar)
(vérifié : 1.7.27). **Conflit.** Il recolore la barre d'adresse et la barre
du haut d'après la page et encadre la page avec sa propre marge, son rayon et
son ombre, par-dessus la barre d'adresse et la carte de page de Zen Fluent.
Il force aussi les menus des dossiers de marque-pages aux couleurs de menu du
système (sans Acrylic) et, avec plusieurs barres d'outils, supprime les
marges du style Edge autour de la page. Utilisez l'un ou l'autre.

## Better Find Bar

[RobotoSkunk/ff-better-findbar](https://github.com/RobotoSkunk/ff-better-findbar)
(vérifié : 1.7.1). **Conflit.** Il transforme la barre de recherche en carte
flottante alors que Zen Fluent la dessine comme une bande le long de la
page : le résultat est une barre flottante avec le fond et les tailles de la
bande. Utilisez l'un ou l'autre.

## SuperPins

[CosmoCreeper/Zen-Themes › SuperPins](https://github.com/CosmoCreeper/Zen-Themes/tree/main/SuperPins)
(vérifié : 1.7.2). **Conflit.** Sa grille d'Essentials et son espacement
remplacent ceux de Zen Fluent, et ses options d'indicateur d'espace de
travail recouvrent celles de Zen Fluent (**Workspace indicator**). Certaines
de ses règles ciblent des éléments et des attributs que Zen 1.23 n'a plus :
elles ne font rien. Utilisez l'un ou l'autre.

## Thèmes entiers

Les thèmes qui rhabillent toute la fenêtre remplacent Zen Fluent au lieu de
s'y ajouter : avec les deux, la barre latérale, les onglets, la barre
d'adresse et le cadre de la page reçoivent deux apparences à la fois et la
fenêtre est inutilisable. La page **Mods** de Zen Fluent Enhanced les laisse
hors de sa boutique, demande confirmation avant d'en installer un depuis son
adresse GitHub, et avertit tant que l'un d'eux est actif (**Breaks Zen
Fluent**). Désactivez le thème ou Zen Fluent.

| Thème                                                                    | Vérifié (version) |
| ------------------------------------------------------------------------ | ----------------- |
| [Nebula](https://github.com/JustADumbPrsn/Zen-Nebula)                    | 3.3.3             |
| [Arc 2.0](https://github.com/YashjitPal/Arc-2.0)                         | 3.4               |
| [Zia](https://github.com/z1n-k/zia)                                      | 2.122.2           |
| [Neo Zen](https://github.com/JustVibingWhileCoding/Neo-Zen)              | 1.21.3-neo.1      |
| [Livs Theme](https://github.com/designlivs/livstheme)                    | 1.0.0             |
| [macaron](https://github.com/SehajveerSingh2005/macaron)                 | 1.5.6             |
| [Wireframe 2.0](https://github.com/SehajveerSingh2005/zen-wireframe-2.0) | 3.0.0             |

## Signaler un problème

Si un mod s'affiche mal avec Zen Fluent, ouvrez une issue avec le nom et la
version du mod, une capture d'écran, et les réglages de Zen Fluent que vous
avez changés. Les règles de compatibilité ne ciblent que ce qu'un mod ajoute,
jamais les réglages du mod lui-même.
