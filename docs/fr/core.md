# Zen Fluent

Traduction de [docs/core.md](../core.md).

Le mod en CSS seul : installez-le avec Sine et réglez tout depuis ses
réglages. Pas de JavaScript, pas de fx-autoconfig.

## Ce qu'il habille

Conçu pour Zen 1.23 (testé avec la 1.23.4b sous Windows 11 et Linux) :

- la fenêtre : Mica, Mica Alt ou Acrylic, la carte de la page, les boutons de
  la barre de titre, et dans une fenêtre privée l'étiquette « Navigation
  privée » de Firefox en pastille en haut de la barre latérale, dans le style
  InPrivate d'Edge (l'icône seule quand la barre latérale est repliée) ;
- la barre latérale : onglets, dossiers, Essentials, espaces de travail,
  boutons de barre d'outils, extensions épinglées, mode compact, et la barre
  latérale repliée (icônes seules) en volet compact de NavigationView WinUI ;
- la barre d'adresse et ses résultats, la barre de recherche dans la page, la
  vue scindée et Glance ;
- la carte multimédia et le lecteur Picture-in-Picture ;
- la Bibliothèque, le panneau latéral de Firefox (marque-pages, historique,
  onglets synchronisés) ;
- les menus, les panneaux (panneau du site, permissions, protection contre le
  pistage, téléchargements, extensions), les boîtes de dialogue, les
  infobulles, l'aperçu des onglets ;
- les notifications : barres de notification du site et globales (InfoBar
  WinUI), demandes de permission (un TeachingTip), toasts de Zen et ses cartes de la barre latérale (la carte de mise à
  jour : une carte WinUI avec des lignes de liste et une fine barre de
  progression en accent) ;
- les écrans de Zen : le formulaire de création d'espace, le sélecteur de
  thème, le panneau Ctrl+Tab, la barre de marque-pages ;
- les pages internes : `about:preferences` (les volets de Zen et de Sine, les
  réglages du mod), `about:addons`, `about:config`, la page de nouvel onglet.

Chaque zone peut garder l'apparence de Zen : [Zones](settings/zones.md).

Les couleurs sont des paires `light-dark()` : clair ou sombre suit
`zen.view.window.scheme`. L'accent est dérivé avec `color-mix()` (+45 % de
blanc en sombre, +15 % de noir en clair).

Réglages : [settings/](settings/README.md). Installation :
[installation.md](installation.md).

## Style Edge

**Interface style** › **Microsoft Edge (Fluent 2)** reprend la géométrie
d'Edge :

- la page est une carte à 4 px de la barre latérale, du bord de la fenêtre et
  du bas, avec des coins de 8 px et un filet ;
- des onglets de 36 px aux coins de 8 px, l'onglet sélectionné surélevé (fond
  et ombre), sans pastille d'accent ;
- des boutons de 32 px espacés de 4 px, des Essentials aux coins de 12 px, un
  bouton de fermeture rond, une carte multimédia surélevée ;
- une barre d'adresse en pilule (au repos, ouverte et flottante) ;
- des menus et panneaux à 12 px, des éléments à 8 px, les ombres de Fluent 2 ;
  des infobulles à 8 px.

Les coins sont de vrais arcs, et **Corners and gaps** ne s'applique pas.

## Accessibilité

- Le focus clavier dessine l'indicateur de focus de WinUI : un anneau
  extérieur de 2 px (presque noir en clair, blanc en sombre) autour d'un
  anneau intérieur de 1 px (blanc translucide en clair, noir translucide en
  sombre). Il suit les coins du contrôle, ne prend pas de place et ne
  s'affiche jamais sur un clic. Il couvre les boutons de barre d'outils, les
  onglets, les boutons de la barre d'adresse, les éléments de menu et de
  panneau, les boutons, les cases à cocher, les listes, les boîtes de
  dialogue, la barre de recherche, les barres de notification et les pages de
  réglages. Les champs de texte et la barre d'adresse gardent leur ligne
  d'accent.
- Thèmes de contraste (contraste élevé de Windows) : les couleurs du mod, que
  Firefox ne force pas dans la fenêtre du navigateur, passent toutes aux
  couleurs du système. Mica et Acrylic deviennent la couleur de la fenêtre,
  les bords deviennent visibles, le survol s'affiche comme un contour ou un
  trait Highlight, l'accent devient Highlight, et le focus est un seul anneau
  Highlight. Les couleurs des conteneurs et celles du sélecteur de thème sont
  conservées.
- `prefers-reduced-motion` arrête toutes les animations du mod : les
  pastilles, les chevrons et les interrupteurs changent d'état sans bouger,
  et la barre de chargement devient une ligne fixe.

## Limites connues

- L'icône de robot dans la barre d'adresse (`#remote-control-box`) n'apparaît
  que lorsque le navigateur est piloté à distance (Marionette, WebDriver) :
  ce n'est pas le mod.
- Mise à jour depuis une version ancienne : « Pill bar », « Transparent bar »
  et « Aptos font » ont été remplacés par **URL bar shape** et **Font** ;
  leurs anciennes valeurs ne sont pas reprises, réglez-les de nouveau.
- Autres mods : [compatibility.md](compatibility.md) liste ceux qui ont
  besoin des règles de compatibilité de Zen Fluent (incluses) et ceux qui
  entrent en conflit avec lui.
