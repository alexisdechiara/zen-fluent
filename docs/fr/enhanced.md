# Zen Fluent Enhanced

Traduction de [docs/enhanced.md](../enhanced.md). Les noms des fonctions et
des réglages sont donnés tels que Sine les affiche, en anglais ; la page de
réglages de Zen Fluent Enhanced les traduit quand Zen est en français.

Un second mod Sine, installé par-dessus Zen Fluent, pour ce que le CSS ne
peut pas faire. Chaque fonction est un script avec son propre réglage
activé / désactivé. Le JavaScript reste au strict minimum : tout ce que le
CSS peut faire se trouve dans Zen Fluent.

## Fonctions

La liste des fonctions, avec la préférence et la valeur par défaut de
chacune, se trouve dans
[le tableau anglais](../enhanced.md#features) (une case par fonction, toutes
sous `zen-fluent.enhanced.*`). Ce que fait chacune :

- **Quick Settings** : l'onglet **Quick settings** de la Bibliothèque de Zen
  (voir [Tableaux dans la Bibliothèque](#tableaux-dans-la-bibliothèque)). Il
  contient une galerie de préréglages et les principaux réglages de Zen
  Fluent (style, matériau, teinte, accent, coins, densité, l'Essential
  sélectionné, la ligne des extensions, les variantes, les animations de
  boutons), avec les libellés et les choix des réglages de Zen Fluent. Un
  préréglage fixe plusieurs réglages à la fois, en combinant une apparence,
  un style d'Essentials, une disposition des extensions et une variante :
  - _Windows 11_ : Mica, coins WinUI, le tiret et le halo (les valeurs par
    défaut de Zen Fluent) ;
  - _Microsoft Edge_ : le style Edge sur Mica Alt ;
  - _Taskbar_ : des Essentials centrés avec la pastille de barre des tâches
    dans la couleur de l'icône, des points pour les pages ouvertes, le survol
    lumineux, les extensions en bas, des boutons subtils ;
  - _Arc_ : Acrylic, coins Zen, Essentials Arc dans la couleur de l'icône,
    boutons subtils en pilule ;
  - _Compact_ : la densité compacte, des marques en barre latérale, des
    points pour les pages ouvertes, les extensions en bas, des boutons
    subtils carrés.

  Le préréglage dont tous les réglages correspondent est affiché enfoncé.
  **Undo preset** remet les réglages d'avant le dernier préréglage. **All
  settings** ouvre la page de réglages (la boîte de dialogue de Sine tant que
  la page de réglages est désactivée). La liste se trouve dans
  `enhanced/quick-settings.json`.

- **Settings page** : une page **Zen Fluent** dans les paramètres de Zen, à
  la place de Sine Mods (sa section **Mods** le remplace), avec tous les
  réglages de Zen Fluent et de Zen Fluent Enhanced dans le style des
  Paramètres de Windows (la boîte de dialogue de Sine continue de
  fonctionner). Ses sections se déplient sous elle comme des sous-éléments de
  la navigation de Zen, en icônes seules quand Firefox la replie (à 950 px et
  en dessous). Ouvrez-la depuis **Zen Fluent** dans le menu de l'application
  (sous Paramètres), **Zen Fluent settings** dans le menu Outils,
  Ctrl+Alt+Maj+F ou **All settings** dans Quick Settings ;
  `about:preferences#zenFluent-tabs` ouvre une section, et `about:zen-fluent`
  y mène aussi. **Open Zen's settings on Zen Fluent** (activé par défaut) :
  le bouton des paramètres de Zen, et tout ce qui ouvre les paramètres sans
  nommer un volet, affiche la vue d'ensemble. La page reste sur sa section
  quand Sine relance les scripts (un mod installé, activé ou désactivé).
  - _Recherche_ : le champ **Rechercher dans les paramètres** de Zen trouve
    les réglages de Zen Fluent (titres et descriptions, et tous les réglages
    d'une page dont le nom correspond) : ils s'affichent parmi les résultats
    de Firefox, sous le nom de Zen Fluent, comme de vrais réglages avec les
    mots surlignés. Avec **Settings search as Ctrl+F**, la navigation ne
    garde que les catégories qui ont des correspondances, et un compteur avec
    Précédent / Suivant (Entrée, F3) les parcourt toutes.
  - _Overview_ (vue d'ensemble) : un aperçu en direct de la fenêtre avec
    **Browse themes**, **Customize** et un lien vers la page du projet, puis
    **Recently changed** et **Most used** (les réglages que vous changez ici,
    mémorisés dans `zen-fluent.enhanced.settings-page.activity` ; des
    suggestions d'ici là), le style et le matériau en tuiles illustrées, le
    mode clair ou sombre, les pastilles d'accent, et À propos (versions,
    boîte de dialogue de Sine, liens).
  - _Themes_ : la galerie des préréglages avec un aperçu de chacun, et
    **Your theme** : **Export** et **Import** de vos réglages (un fichier
    JSON ; les valeurs inconnues ou invalides sont ignorées) et **Reset
    everything**.
  - _Une page par groupe_ de réglages de Zen Fluent, avec la description de
    chaque réglage, un point et un bouton de réinitialisation sur ceux que
    vous avez changés, et **Reset this page** (cliquez deux fois ; le toast
    propose d'annuler pendant 10 s). Les pages d'une partie que Zen Fluent
    habille comme une zone portent son interrupteur à côté de Reset
    (**Fluent style** : Sidebar, Essentials, Extensions et Tabs pour la zone
    de la barre latérale, URL bar ; Window and menus en a deux) : désactivé,
    la partie garde l'apparence de Zen, une InfoBar le dit et propose **Turn
    on**, et les cartes de la page s'estompent.
  - _Variants_ : un dessin de la fenêtre avec une épingle numérotée sur
    chaque composant (boutons, barre d'adresse et ses boutons, extensions,
    badges, Essentials, onglets épinglés, dossiers, onglets, espaces, boutons
    de boîte de dialogue) et une épingle **All** sur la fenêtre elle-même.
    Une épingle, ou la partie qu'elle marque, ouvre un TeachingTip avec le
    fond et la forme en pastilles illustrées ; All règle tous les composants
    laissés sur Auto ; l'épingle des extensions a deux onglets, **Each
    button** et **The row**, appliqués tous les deux à la fois. Sur une
    fenêtre large de 1300 px ou plus, le fond et la forme s'affichent dans un
    panneau à droite du dessin au lieu d'un TeachingTip. Le dessin montre le
    résultat sur un élément sélectionné, un élément sous le pointeur et un
    élément au repos. **Your changes** liste ce qui a sa propre apparence.
  - _Enhanced_ : chaque fonction avec son icône ; ses options s'affichent
    tant qu'elle est activée.
  - _Mods_ : la boutique de Sine sur cette page. **Marketplace** liste tous
    les mods de la boutique de Sine (aperçu, étoiles, dernière mise à jour,
    présence de scripts) avec leur compatibilité avec Zen Fluent
    ([compatibility.md](compatibility.md)) : **Works**, **Works with a
    limit**, **Not tested with this version** (la version de Zen Fluent ou du
    mod diffère de la dernière vérification), **Not checked** (pas encore
    dans la liste de Zen Fluent) ou **Incompatible**. Les thèmes entiers qui
    remplacent l'apparence de Zen (Nebula, Arc 2.0, Zia… : **Breaks Zen
    Fluent**) en sont exclus. **Install** passe par Sine ; pour un mod
    incompatible, **Install anyway** demande d'abord confirmation dans une
    boîte de dialogue (Annuler est le choix par défaut), tout comme **Add a
    mod** pour un mod incompatible ou cassant. **Update to vX** s'affiche
    quand la version installée est plus ancienne. **Add a mod** en installe
    un depuis son adresse GitHub. **Installed** liste tous les mods que Sine
    possède, avec leur interrupteur, leur page, **Settings** (les réglages du
    mod dans une boîte de dialogue dessinée comme celles de Zen Fluent, ou le
    volet de Sine quand cette page ne peut pas les dessiner), **Uninstall**
    (un second clic confirme) et **Check for updates**. Chaque section a un
    champ de recherche, des filtres par badge et par étiquette, un tri (plus
    d'étoiles, mis à jour récemment, nom, compatibilité) et un commutateur
    Cartes / Liste, conservés pour les visites suivantes, et des pages (12
    cartes ou 20 lignes chacune) ; une InfoBar avertit quand un mod
    incompatible ou cassant est activé.

  Chaque changement s'applique aussitôt et chaque valeur suit les
  changements faits ailleurs (Sine, Quick Settings, un raccourci). Un réglage
  de texte (accent, rayon, flou, opacité ou police personnalisés) est vérifié
  avant d'être enregistré et demande à Sine de reconstruire sa variable CSS,
  ce que Sine ne fait de lui-même que depuis sa boîte de dialogue. Les
  préréglages, les réinitialisations et les imports peuvent être annulés
  depuis leur toast.

- **Welcome tour** (activé par défaut) : au premier démarrage, une fois
  l'accueil de Zen terminé, la fenêtre s'affiche dans l'apparence de Zen,
  celle de Zen Fluent arrive en balayage, et une visite s'ouvre par-dessus la
  fenêtre assombrie (chaque choix s'affiche aussitôt derrière elle) : un
  thème et le mode, chacun dessiné comme une petite fenêtre, l'accent avec un
  aperçu de ses contrôles, puis les réglages que l'on change le plus, en
  lignes des Paramètres de Windows avec une ComboBox ou un interrupteur : la
  fenêtre (matériau, opacité de la teinte, coins, rayon des coins, densité,
  police), les onglets et la barre latérale (Essential sélectionné,
  alignement des Essentials, ligne des extensions, pastille d'accent, bouton
  de fermeture des onglets), la barre d'adresse et les menus (forme, ligne
  d'accent, barre d'adresse flottante, boutons de la barre de titre, teinte
  des menus) et le mouvement (animations du changement d'onglet, des menus et
  de la barre d'adresse, animations de boutons, icônes animées) ; puis dix
  fonctions à activer (Site color, Adaptive accent, Tab hover cards, Ctrl+Tab
  as Alt+Tab, Tab archiving, Sleeping tabs, Start page, Breadcrumb address,
  Focus sessions, Widgets and shelf), et où tout retrouver. Elle bouge avec
  la bibliothèque de mouvement de Zen (les ressorts et les décalages de
  l'accueil de Zen). Elle attend la fermeture des écrans d'accueil de Zen et
  des autres mods, s'affiche une fois (`zen-fluent.enhanced.welcome.seen`),
  et **Show** dans la section À propos de la page de réglages la rejoue.
  Échap la ferme.
- **Fluent defaults for mods** (activé par défaut) : pour un mod que Zen
  Fluent habille, les réglages les plus proches de Windows 11 tant qu'ils
  n'ont jamais été changés. Zen Calmer Context Menu : des icônes sur chaque
  option dans le jeu Fluent, et les actions rapides en ligne de boutons en
  haut du menu des onglets. Un réglage déjà fixé, ou dont l'autre valeur a
  été choisie, est laissé tel quel.
- **Icon colors** : lit la couleur dominante de l'icône de chaque onglet (la
  couleur la plus saturée qui en couvre une part suffisante, ou la moyenne
  d'une icône sans couleur). Avec **Selected Essential color** de Zen Fluent
  sur _Icon color_, l'Essential sélectionné prend cette couleur exacte : les
  anneaux et les bordures des styles Arc, Outline et Tint la reçoivent aussi,
  là où Zen Fluent seul garde l'accent, et les marques et les fonds sont
  peints avec elle plutôt qu'avec le favicon flouté. Sa luminosité est gardée
  dans une plage moyenne pour qu'une icône blanche ou noire reste visible.
  Une icône illisible garde le favicon flouté de Zen Fluent.
- **Adaptive accent** : l'accent suit le site de l'onglet sélectionné, la
  couleur dominante de son icône. Une icône grise est ignorée et l'accent de
  Zen Fluent reste, comme sur les pages sans icône. Tout ce qui est dessiné
  dans l'accent change avec lui, la teinte Mica aussi. Désactivé par défaut.
  Le `theme-color` d'une page n'est pas lu : il vit dans le processus de la
  page, où Firefox n'exécute que du code livré avec le navigateur.
- **Site color** : la fenêtre (barre latérale, barres d'outils, marges
  autour de la page) prend une teinte du site de l'onglet sélectionné,
  **par-dessus le thème de l'espace** : le dégradé choisi dans le sélecteur
  de thème de Zen s'efface tant qu'un site a une couleur, et revient sur un
  site qui n'en a pas. La couleur est le haut de la page tel que le
  navigateur l'a dessiné, là où l'en-tête d'un site montre en général la
  couleur que nomme son `theme-color` ; un haut blanc, noir ou gris cède la
  place à la couleur dominante de l'icône de l'onglet, et une icône grise au
  thème de l'espace. La page est relue à la fin de son chargement et un
  instant plus tard (pour les en-têtes peints tard). **Site color
  strength** : _Light_ (15 % de la couleur du site, par défaut), _Medium_
  (30 %) ou _Strong_ (50 %) ; la couleur est gardée claire dans une fenêtre
  claire et sombre dans une fenêtre sombre pour que le texte reste lisible.
  Désactivé par défaut ; fonctionne avec **Adaptive accent** (l'accent suit
  l'icône). Jamais dans une fenêtre privée, qui reste noire comme Zen la
  dessine ; **Adaptive accent** et **Window glow** n'y tournent pas non plus.
- **Settings per space** : un espace peut donner sa propre valeur aux
  réglages qui changent toute la fenêtre : le mode (clair, sombre, système),
  le style, le matériau et sa teinte, la couleur de l'espace, l'accent, la
  densité, la couleur de la barre d'adresse flottante, et **Site color** (et
  son intensité), **Adaptive accent** et **Window glow** d'Enhanced.
  Réglez-les sur la page **Spaces** de la page de réglages (tous les espaces
  dans une seule liste, ouverte aussi par **Space settings…** dans le menu
  contextuel d'un espace), ou sur chaque page de réglages : **Settings for**
  dans son en-tête choisit un espace, ses réglages proposent alors **Your
  setting** ou une valeur propre à l'espace, et les réglages que tous les
  espaces partagent sont grisés. Avec **All spaces**, une pastille à côté
  d'un réglage nomme les espaces qui ont leur propre valeur (un clic la
  modifie), et la page modifie vos propres valeurs, même celles que l'espace
  affiché remplace. Passer à l'espace écrit ses valeurs ; les autres espaces
  retrouvent les vôtres. Les réglages sont partagés par toutes les fenêtres :
  avec plusieurs fenêtres ouvertes, c'est l'espace de la dernière fenêtre
  utilisée qui décide. Un réglage changé à la main pendant qu'un espace le
  remplace devient la valeur de cet espace. Désactiver la fonction remet vos
  propres valeurs. Activé par défaut (sans effet tant qu'aucun espace n'a de
  réglage à lui).
- **Extensions under the Essentials** : avec une barre d'outils unique,
  déplace la ligne des extensions épinglées d'au-dessus des Essentials à
  entre les Essentials et les onglets, ce que le CSS ne peut pas faire.
  Seulement tant que **Extensions › Place** de Zen Fluent vaut _Above the
  Essentials_ ; les autres réglages de la ligne de Zen Fluent s'appliquent
  toujours. Désactivé par défaut.
- **Tab numbers while Ctrl is held** : maintenez Ctrl (Cmd sous macOS) seul
  un instant et chaque onglet affiche, sur son icône, le numéro que Ctrl+1 à
  Ctrl+8 sélectionne, et 9 sur le dernier onglet. Ils suivent le décompte de
  Firefox : ils correspondent donc aux raccourcis dans chaque espace.
- **Tab archiving** (désactivé par défaut) : toutes les 5 minutes, les
  onglets inutilisés depuis plus longtemps que **Archive tabs unused for**
  (12 heures par défaut ; de 1 heure à 1 semaine) sont enregistrés dans un
  fichier d'archive du profil (`zen-fluent-archive.json`), puis fermés ; un
  message propose **Undo**. Jamais archivés : l'onglet sélectionné, les
  Essentials, les onglets qui jouent du son ou partagent la caméra, le micro
  ou l'écran, le Picture-in-Picture, les onglets de Glance et de vue
  scindée, les onglets vides, les pages qui demanderaient confirmation avant
  d'être quittées, et les fenêtres privées. Les onglets épinglés et les
  onglets d'un dossier seulement avec leur option. Les onglets en veille sont
  archivés comme les autres.
  - **L'archive** : menu contextuel d'un onglet › **Archived tabs…**, ou
    Ctrl+Alt+Maj+A. Recherchez par titre ou par adresse ; un clic rouvre
    l'onglet dans son espace (l'espace courant si celui-ci n'existe plus) et
    le retire de l'archive ; × supprime une entrée ; **Clear archive**
    (cliquez deux fois) la vide. **Archive tab** dans le même menu archive
    les onglets tout de suite (il ferme une page qui demanderait
    confirmation, en gardant son adresse).
  - **Keep archived tabs** : les entrées de plus de 7, 30, 90 jours (par
    défaut) ou d'un an sont supprimées ; ou gardées pour toujours.
  - L'archive est écrite par un fichier temporaire : un plantage pendant une
    écriture garde l'archive précédente ; une archive illisible est mise de
    côté (`zen-fluent-archive.json.corrupt-<time>`), jamais écrasée.
- **PDF viewer** : le lecteur PDF de Firefox prend les couleurs Fluent :
  barre d'outils et panneau latéral façon Mica, champs et boutons WinUI,
  menus pleins, l'accent sur la barre de progression, des coins de 4 et
  8 px. Les thèmes de contraste gardent ses couleurs système.
- **Fluent controls on websites** (désactivé par défaut) : les boutons et
  les champs de texte qu'un site laisse à l'apparence par défaut du
  navigateur prennent l'apparence WinUI (coins de 4 px, bord inférieur plus
  sombre, ligne d'accent d'un champ qui a le focus), et les cases à cocher,
  boutons radio, curseurs et barres de progression prennent l'accent. Le CSS
  d'un site l'emporte toujours (la feuille se place au niveau du
  navigateur), et seuls les contrôles sans classe ni attribut de style
  changent : un site qui habille un champ en partie (le champ de recherche de
  Google) garde donc son apparence. Seulement sur les pages http, https et
  file ; les thèmes de contraste gardent les contrôles du système.
  - Le CSS de Zen Fluent ne peut pas le faire : la feuille de contenu de
    Sine n'atteint que les pages `about:`. Les deux fonctions enregistrent
    leur feuille auprès du service de feuilles de style de Firefox, qui
    atteint les pages web.
- **Browsing stats** (désactivé par défaut) : menu de l'application ›
  **Browsing stats**, Outils › **Browsing stats** ou Ctrl+Alt+Maj+S. Pour
  aujourd'hui, les 7 ou les 30 derniers jours : le temps passé sur les
  pages, les visites et les sites, une barre par jour (aujourd'hui dans
  l'accent) et les 10 premiers sites. Zen Fluent n'enregistre rien : les
  visites viennent de votre historique et le temps des interactions de page
  de Firefox (`browser.places.interactions.enabled`, activé par défaut dans
  Zen, gardées 60 jours par `browser.places.interactions.expireDays`) ; les
  fenêtres privées n'écrivent ni l'un ni l'autre. Les rechargements, les
  téléchargements et les cadres intégrés ne comptent pas comme des visites.
  - **Compte à partir du jour de l'activation**
    (`zen-fluent.enhanced.browsing-stats.since`, supprimée quand la case est
    décochée). **Clear stats** (cliquez deux fois) recommence à compter à
    partir de maintenant ; l'historique n'est pas touché.
  - **Ignore** sur un site l'exclut
    (`zen-fluent.enhanced.browsing-stats.ignored`) ; **Ignored sites › Count
    again** le ramène. `www.` est fusionné avec le site.
  - Si le temps passé sur les pages est désactivé dans Firefox, le panneau
    le dit et propose de l'activer ; les barres montrent alors les visites.
- **Folder colors** : le menu contextuel d'un dossier reçoit **Folder
  color** : Default (l'accent) ou l'une des couleurs d'accent de Windows
  (rouge, orange, jaune, vert, sarcelle, bleu, violet, rose, gris), dans un
  ton plus clair en mode sombre. La couleur s'applique à l'icône du dossier,
  celle de Zen ou l'icône Fluent de Zen Fluent. Chaque sous-dossier garde sa
  propre couleur. Les couleurs sont gardées par dossier dans
  `zen-fluent.enhanced.folder-colors.map` et reviennent avec la session.
- **Fluent icons in the icon picker** : le sélecteur d'icônes de Zen
  (l'icône d'un espace, d'un dossier, d'un onglet épinglé) reçoit une section
  **Fluent icons** après celles de Zen : 142 icônes des Fluent UI System
  Icons de Microsoft (MIT, `THIRD-PARTY-NOTICES.md`), de la maison et du
  travail à la nourriture, au sport, au voyage, aux médias et aux appareils.
  Une icône choisie est stockée par Zen comme les siennes, et prend la
  couleur du texte. Elles ont besoin de **Allow the mod's icons** de Zen
  Fluent (`svg.context-properties.content.enabled`), comme les icônes de Zen
  Fluent ; sans lui, la section le dit. Une icône choisie ici s'affiche tant
  que Zen Fluent Enhanced est installé.
- **Tab hover cards** (désactivé par défaut) : comme les aperçus de la barre
  des tâches, après un court survol (**Hover card delay** : 0,3, 0,5, 0,8 ou
  1,2 s) une carte s'ouvre à côté de l'onglet : une miniature de la page (la
  capture de Firefox, pas pour l'onglet sélectionné ni pour un onglet en
  veille ; **Page thumbnails in hover cards**), le titre, l'adresse, l'état
  (en veille, en lecture, muet), la note de l'onglet (avec **Tab notes**) et
  des boutons : copier le lien, dupliquer, couper ou rétablir le son,
  décharger, fermer. Passer à un autre onglet change la carte aussitôt ; elle
  se ferme quand le pointeur quitte l'onglet et la carte, sur un clic, un
  glissement, un menu, ou quand la fenêtre perd le focus. L'infobulle
  d'onglet de Firefox et son propre aperçu d'onglet restent masqués pendant
  ce temps.
- **Glance link preview** : maintenez la touche qui ouvre Glance (**Open a
  link in Glance with** de Zen, Alt par défaut ; exposé dans le groupe Zen
  settings de Zen Fluent) au-dessus d'un lien un instant : une carte en bas
  de la page montre l'icône du lien, son titre si votre historique connaît la
  page, son adresse, et le clic qui l'ouvre dans Glance. Elle disparaît quand
  la touche est relâchée ou que le pointeur quitte le lien ; rien ne
  s'affiche tant que Glance est désactivé. La page elle-même n'est jamais
  lue : le lien est celui que Firefox affiche dans sa barre d'état.
- **Breadcrumb address** (désactivé par défaut) : tant que la barre
  d'adresse affiche l'adresse de la page, elle se lit comme la barre
  d'adresse de l'Explorateur de fichiers : le site, chaque dossier du
  chemin, puis la page, avec un chevron entre eux. Un clic sur le site ou sur
  un dossier ouvre ce niveau (Ctrl ou clic du milieu : dans un nouvel onglet,
  Maj : dans une nouvelle fenêtre) ; un clic sur la page ou sur l'espace vide
  modifie l'adresse comme d'habitude, et le fil d'Ariane disparaît pendant la
  saisie. Seules les adresses web et de fichier en ont un. Quand la barre est
  trop étroite, les dossiers intérieurs se replient en un segment **…** qui
  ouvre le dernier d'entre eux.
- **Command Palette actions** : avec le mod
  [Zen Command Palette](https://github.com/Vertex-Mods/Zen-Command-Palette)
  installé, sa palette reçoit les commandes de Zen Fluent : chaque valeur des
  réglages de Quick Settings (_Zen Fluent: Backdrop material: Acrylic_), les
  préréglages, chaque fonction d'Enhanced activée ou désactivée, et les
  panneaux : Quick Settings, onglets archivés, **Archive this tab**,
  statistiques de navigation, la feuille des raccourcis clavier, Snap
  layouts, Performance, Tab notes, AI controls, le chatbot IA, Focus session,
  Widgets and shelf, Quick window et tous les réglages de Zen Fluent. Une
  commande ne s'affiche que si elle change quelque chose (la valeur courante
  et le panneau d'une fonction désactivée sont laissés de côté). Sans le mod,
  elle ne fait rien.
- **Keyboard shortcuts sheet** : Ctrl+Alt+Maj+K, Aide › **Keyboard shortcuts
  sheet** ou la palette de commandes ouvre une carte par-dessus la fenêtre
  avec les principaux raccourcis de Firefox et de Zen (onglets, page, Zen,
  fenêtre), puis ceux de Zen Fluent tant que leur fonction est activée, avec
  un champ de recherche. Chacun est lu dans le navigateur : un raccourci
  changé dans `about:keyboard` s'affiche tel qu'il est maintenant et un
  raccourci supprimé est laissé de côté. Échap, les mêmes touches ou un clic
  à l'extérieur la ferme.
- **Snap layouts** : les dispositions d'ancrage de Windows 11 pour la vue
  scindée de Zen. Survolez le bouton d'agrandissement de la fenêtre une
  demi-seconde (ou Ctrl+Alt+Maj+Z, **Snap layouts…** dans le menu contextuel
  d'un onglet, la palette de commandes) : un menu volant montre six
  dispositions, deux moitiés, deux tiers et un tiers, trois colonnes, une
  zone et deux empilées, quatre quarts, deux moitiés empilées. Un clic sur
  une zone y place l'onglet sélectionné ; **Snap Assist** liste ensuite les
  onglets récents de l'espace (hors Essentials) pour chaque zone restante,
  et la vue scindée s'ouvre une fois que chaque zone a un onglet. Les tailles
  restent redimensionnables avec les poignées de Zen et reviennent avec la
  session. Une disposition qui a plus de zones que d'onglets à proposer est
  grisée ; les onglets déjà dans une vue scindée la quittent pour la
  nouvelle.
- **Ctrl+Tab as Alt+Tab** (désactivé par défaut) : Ctrl+Tab fonctionne comme
  l'Alt+Tab de Windows 11. Maintenez Ctrl et appuyez sur Tab : une bande
  par-dessus la fenêtre montre les onglets de l'espace, le dernier utilisé
  en premier, chacun avec son icône, son titre et une miniature de la page
  (son icône tant qu'il n'y en a pas, comme pour un onglet en veille). Tab
  avance, Maj+Tab ou les flèches déplacent la sélection, relâcher Ctrl (ou
  Entrée) va à l'onglet en surbrillance, Échap annule ; le pointeur peut
  choisir une carte, et **×** sur une carte ferme son onglet. Un Ctrl+Tab
  rapide revient à l'onglet précédent sans afficher la bande. Il remplace le
  Ctrl+Tab de Firefox tant qu'il est activé, y compris les aperçus de
  **Ctrl+Tab fait défiler vos onglets en les classant selon leur dernière
  utilisation**.
- **Boost editor extras** : l'éditeur de Boost de Zen reçoit quatre tuiles
  de plus après **Code** : **Narrow column** (le texte de la page dans une
  colonne de 72 caractères), **No motion** (animations et transitions
  arrêtées), **Hide images** (images, vidéos et images d'arrière-plan) et
  **Sepia**. Chaque tuile ajoute ou retire un bloc de CSS dans le CSS
  personnalisé du boost, entre des commentaires `/* zen-fluent:<tile> */`
  que vous pouvez voir et modifier dans l'éditeur Code : ils sont donc
  enregistrés, partagés et appliqués par site comme le reste du boost, et ne
  demandent aucun changement dans Zen. La fenêtre de l'éditeur grandit de la
  nouvelle ligne.
- **Sleeping tabs and Performance** (désactivé par défaut), comme dans
  Edge :
  - **Sleeping tabs** : les onglets inutilisés depuis plus longtemps que
    **Put inactive tabs to sleep after** (30 minutes par défaut ; de 5
    minutes à 4 heures, ou jamais) sont déchargés avec le mécanisme de
    Firefox : l'onglet reste avec son historique et se recharge quand vous
    le sélectionnez. Jamais mis en veille : l'onglet sélectionné, les
    onglets qui jouent du son ou partagent la caméra, le micro ou l'écran,
    le Picture-in-Picture, Glance et la vue scindée à l'écran, et (règle de
    Firefox) une page qui demanderait confirmation avant d'être quittée ou
    qui affiche une boîte de dialogue. Zen 1.24 n'a pas de minuteur
    d'inactivité à lui, et Firefox ne décharge les onglets que lorsque la
    mémoire vient à manquer.
  - **Performance panel** : menu de l'application › **Performance**, Outils
    › **Performance**, Ctrl+Alt+Maj+P ou la palette de commandes. La mémoire
    que Zen utilise, les onglets actifs et en veille, le délai de mise en
    veille, **Put N other tabs to sleep** en une fois, et les onglets qui
    utilisent le plus de mémoire avec un bouton **Sleep** chacun. La mémoire
    d'un onglet est une estimation : celle de son processus, partagée entre
    les onglets qui s'y trouvent (Firefox ne compte pas par onglet). **Open
    the task manager** ouvre `about:processes`.
- **Tab notes** (désactivé par défaut) : active les notes d'onglet de
  Firefox, que Zen livre désactivées (`browser.tabs.notes.enabled`, remise à
  la valeur par défaut de Zen quand la case est décochée) : menu contextuel
  d'un onglet › **Add note** ou **Edit note**, et l'icône de note sur un
  onglet l'ouvre. Une note appartient à la page (son adresse canonique) :
  elle revient donc quand la page est rouverte. Zen Fluent Enhanced ajoute :
  - **All notes** : Outils › **Tab notes**, **All notes…** dans le menu
    contextuel d'un onglet, Ctrl+Alt+Maj+N ou la palette de commandes :
    toutes les notes, la plus récente en premier, avec leur site et leur
    date, un champ de recherche, et un clic qui va à l'onglet de la page ou
    l'ouvre. Lues dans la base de notes de Firefox, jamais écrites.
  - Avec **Tab hover cards** activé, la carte d'un onglet montre sa note.
- **AI controls page** (désactivé par défaut) : affiche la page **Contrôles
  de l'IA** de Firefox dans les paramètres de Zen, que Zen masque
  (`browser.preferences.aiControls`, remise à la valeur par défaut de Zen
  quand la case est décochée) : chaque fonction d'IA peut être laissée
  disponible, activée ou bloquée (traductions, descriptions d'images des
  PDF, points clés de l'aperçu des liens, le chatbot du panneau latéral, la
  reconnaissance vocale), et un interrupteur les bloque toutes. La page
  règle les interrupteurs de Firefox. Outils › **AI controls** ou la palette
  de commandes l'ouvre.
- **AI chatbot panel** (désactivé par défaut) : le chatbot de Firefox dans
  le panneau latéral, que Zen désactive (`browser.ml.chat.*`, remises aux
  valeurs par défaut de Zen quand la case est décochée). Choisissez Claude,
  ChatGPT, Gemini, HuggingChat ou Mistral dans le panneau ; ouvrez-le ou
  fermez-le avec le nouveau bouton de la ligne du bas de la barre latérale,
  Ctrl+Alt+X ou la palette de commandes. Le menu contextuel de la page
  reçoit **Ask an AI chatbot**, et le texte sélectionné un raccourci vers
  lui.
- **Focus sessions** (désactivé par défaut), comme dans l'application
  Horloge de Windows : l'onglet **Focus** de la Bibliothèque de Zen (ou la
  palette de commandes). Choisissez 15, 25, 45, 60 ou 90 minutes (**Focus
  session length**) et démarrez. Pendant la session, un bouton de minuteur
  s'affiche dans la ligne du bas de la barre latérale et dessine sa
  progression en anneau (un clic ouvre l'onglet Focus), et le tableau montre
  le temps restant avec **+5 min** et **End session**. Selon ce qui est
  choisi dans le panneau ou dans Sine, pendant la session :
  - **Hide the sidebar** : le mode compact dans chaque fenêtre, rétabli
    ensuite ;
  - **Mute tabs playing sound**, sauf l'onglet sélectionné, son rétabli
    ensuite ;
  - **Block distracting sites** (**Distracting sites**, séparés par des
    virgules ; sous-domaines compris) : un onglet qui en ouvre un revient en
    arrière, avec un message qui dit jusqu'à quand.

  Quand le temps est écoulé, un message et une notification du système le
  disent. La session est partagée par toutes les fenêtres et survit à la
  fermeture du panneau.

- **Widgets and shelf** (désactivé par défaut) : l'onglet **Widgets** de la
  Bibliothèque de Zen, Ctrl+Alt+Maj+W ou la palette de commandes ouvre un
  tableau comme les widgets de Windows : l'heure et la date, **Now playing**
  (les onglets qui jouent du son, pour y aller ou les rendre muets), les
  derniers **Downloads** (un clic ouvre un téléchargement terminé), et la
  **Shelf** (l'étagère) : des liens, du texte et des images gardés pour plus
  tard. Déposez-les sur l'étagère ou cliquez sur **Add this page**. Un clic
  ouvre un lien ou une image dans un nouvel onglet et copie un texte ; les
  éléments peuvent être glissés de nouveau au-dehors, vers une page ou la
  barre d'adresse ; × (ou Suppr) en retire un. L'étagère est gardée dans le
  profil (`zen-fluent-shelf.json`, 100 éléments au plus) et partagée par
  toutes les fenêtres.
- **Window glow** (activé par défaut) : quand la fenêtre change de couleur
  (un autre espace ou thème, le mode clair ou sombre), son fond s'éclaire
  doucement dans la nouvelle couleur, sous le contenu de la barre latérale
  et la page, puis s'estompe. Changer d'onglet n'éclaire jamais, même avec
  Site color ou l'accent adaptatif. Rien avec les animations réduites.
- **Start page** (désactivé par défaut) : les nouveaux onglets ouvrent une
  page propre à Zen Fluent, comme celle de Windows 11 et d'Edge : un mot
  d'accueil avec l'heure et la date, un champ de recherche avec votre moteur
  par défaut (une adresse s'ouvre, des mots lancent une recherche, comme
  dans la barre d'adresse), et vos sites les plus visités, la liste de
  Firefox (× en retire un), sur un halo dans l'accent. La barre d'adresse y
  reste vide. Elle prend la place de la page de nouvel onglet de Firefox
  (sauf si une extension l'a déjà remplacée), et désactive **Remplacer le
  nouvel onglet par la barre d'adresse** de Zen
  (`zen.urlbar.replace-newtab`), qui ne l'afficherait jamais ; les deux
  reviennent quand la case est décochée. La page : `enhanced/start/`.
- **Quick window** (désactivé par défaut), comme le Little Arc d'Arc :
  Ctrl+Alt+Maj+O, le menu contextuel d'un lien (**Open link in a quick
  window**) ou la palette de commandes ouvre une petite fenêtre (520 x 720)
  à côté de la fenêtre courante, en mode compact pour que la page la
  remplisse. C'est la fenêtre non synchronisée de Zen : aucun de vos
  espaces, et elle n'est pas restaurée avec la session. Sans lien, sa barre
  d'adresse s'ouvre pour taper une adresse ou une recherche. **Open in main
  window**, en bas de la page, déplace son onglet vers la fenêtre d'où il
  vient et la ferme ; fermer la fenêtre rapide abandonne simplement
  l'onglet.
- **Shortcuts** : Ctrl+Alt+Maj+D change la densité (standard ou compacte),
  Ctrl+Alt+Maj+T le thème de la fenêtre (automatique, clair, sombre :
  Affichage › Apparence de Zen), Ctrl+Alt+Maj+M le matériau (Mica, Mica Alt,
  Acrylic). Les touches sont lues par position : elles restent donc les
  mêmes sur toute disposition de clavier. Un message affiche la nouvelle
  valeur.

### Tableaux dans la Bibliothèque

Widgets, Focus et Quick settings sont des onglets de la Bibliothèque de Zen,
après ceux de Zen (Widgets, Focus, Quick settings) : ils n'ajoutent aucun
bouton à la ligne du bas de la barre latérale. **Choose tabs** de Zen (le
pinceau en bas de la Bibliothèque) masque n'importe lequel d'entre eux. Avec
[ZenLibraryTweaks](compatibility.md#zenlibrarytweaks), ils peuvent être
réordonnés et retirés comme ses propres sections ; un onglet retiré là reste
retiré. Tant que la Bibliothèque est désactivée (`zen.library.enabled`),
chaque tableau s'ouvre dans un panneau depuis un bouton de la ligne du bas,
comme avant la 0.4.2. Les libellés des onglets sont en anglais et en
français (`enhanced/l10n/<locale>/zen-fluent-enhanced.ftl`).

## Langues

Zen Fluent Enhanced parle français quand Zen est en français : la page de
réglages, les entrées Zen Fluent des paramètres de Zen, les menus, les
toasts, les tableaux de la Bibliothèque et les actions de la palette de
commandes. La boîte de dialogue de réglages de Sine garde les libellés
anglais (elle lit un seul `preferences.json`). Les traductions se trouvent
dans `enhanced/l10n/<language>/strings.json`, indexées par le texte anglais.

## Installation

Sine › Mods, installer depuis GitHub :
`alexisdechiara/zen-fluent/tree/main/enhanced`. Il installe aussi Zen Fluent
s'il manque (`modules` dans son `theme.json`).

Sine n'exécute le JavaScript d'un mod hors de sa boutique que si **Enable
installing JS from unofficial sources** est coché (`sine.allow-unsafe-js`).
Pas de fx-autoconfig : Sine livre son propre chargeur, et fx-autoconfig
l'écraserait.

## Écrire un script

Voir [enhanced/scripts/README.md](../../enhanced/scripts/README.md) (en
anglais).
