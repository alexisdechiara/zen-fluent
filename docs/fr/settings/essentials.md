# Essentials

Traduction de [docs/settings/essentials.md](../../settings/essentials.md).

Les tuiles des Essentials, avec des choix calqués sur la barre des tâches de
Windows : la façon de marquer la tuile sélectionnée, la taille, la
disposition et les indicateurs.

En-tête du groupe : `zen-fluent.ui.open-essentials` (ouvert par défaut :
`false`).

| Réglage                                         | Préférence                              | Valeurs                                                                                                                                                                                                                                               | Défaut   |
| ----------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Selected Essential                              | `zen-fluent.essentials.selected-style`  | `glow` Dash and favicon glow<br>`glow-only` Glow only<br>`arc` Arc (bordure colorée, bord en relief)<br>`fill` Fill<br>`indicator` Taskbar indicator<br>`outline` Outline<br>`lift` Lift<br>`tint` Tint<br>`side` Side bar<br>`none` None (fond seul) | `glow`   |
| Selected Essential color                        | `zen-fluent.essentials.selected-color`  | `accent` Accent<br>`space` Space color<br>`icon` Icon color                                                                                                                                                                                           | `accent` |
| Open page indicator                             | `zen-fluent.essentials.running`         | `none` None<br>`dot` Dot                                                                                                                                                                                                                              | `none`   |
| Hover                                           | `zen-fluent.essentials.hover`           | `fill` Fill<br>`reveal` Fill and soft light                                                                                                                                                                                                           | `fill`   |
| Tile border                                     | `zen-fluent.essentials.border`          | `auto` Automatic (celle du fond)<br>`none` None<br>`subtle` Subtle line<br>`strong` Strong line<br>`color` Icon color<br>`gap` Ring with a gap<br>`gap-color` Colored ring with a gap                                                                 | `auto`   |
| Selected tile border                            | `zen-fluent.essentials.selected-border` | `auto` Automatic (celle des tuiles et du style)<br>`none` None<br>`subtle` Subtle line<br>`strong` Strong line<br>`color` Selected Essential color<br>`gap` Ring with a gap<br>`gap-color` Colored ring with a gap                                    | `auto`   |
| Border width                                    | `zen-fluent.essentials.border-width`    | `auto` Automatic (celle de la bordure)<br>`thin` Thin (1 px)<br>`medium` Medium (2 px)<br>`thick` Thick (3 px)                                                                                                                                        | `auto`   |
| Labels                                          | `zen-fluent.essentials.labels`          | `hide` Icons only<br>`show` Icon and title                                                                                                                                                                                                            | `hide`   |
| Essentials per row                              | `zen-fluent.essentials-per-row`         | `auto` Automatic<br>`2` 2<br>`3` 3<br>`4` 4<br>`5` 5<br>`6` 6                                                                                                                                                                                         | `auto`   |
| Essentials width (nombre par ligne automatique) | `zen-fluent.essentials.width`           | `auto` Automatic (remplit la ligne)<br>`40` 40 px<br>`48` 48 px<br>`56` 56 px<br>`64` 64 px<br>`72` 72 px<br>`80` 80 px                                                                                                                               | `auto`   |
| Icon size                                       | `zen-fluent.essentials.icon-size`       | `small` Small (16 px)<br>`medium` Medium (20 px)<br>`large` Large (24 px)                                                                                                                                                                             | `medium` |
| Essentials height                               | `zen-fluent.essentials.height`          | `auto` Automatic (celle de la densité)<br>`32` 32 px<br>`36` 36 px<br>`42` 42 px<br>`48` 48 px<br>`56` 56 px                                                                                                                                          | `auto`   |
| Space between Essentials                        | `zen-fluent.essentials.gap`             | `auto` Automatic (celui de la densité)<br>`0` 0 px<br>`2` 2 px<br>`4` 4 px<br>`6` 6 px<br>`8` 8 px<br>`12` 12 px                                                                                                                                      | `auto`   |
| Alignment                                       | `zen-fluent.essentials.align`           | `start` Left<br>`center` Center                                                                                                                                                                                                                       | `start`  |
| Grey Essentials icons                           | `zen-fluent.essentials-gray`            | `true` / `false`                                                                                                                                                                                                                                      | `false`  |

## Notes

- **Tile border** remplace le bord propre au fond sur chaque tuile. Icon
  color et Colored ring with a gap prennent la couleur de l'icône de chaque
  tuile quand **Icon colors** de Zen Fluent Enhanced est activé, sinon la
  couleur de Selected Essential color. L'espace de l'anneau est dessiné à
  l'intérieur de la tuile : les tuiles gardent leur taille et leur
  espacement. Sur la tuile sélectionnée, Arc, Outline et Tint gardent leur
  propre bordure. **Selected tile border** distingue la bordure de la tuile
  sélectionnée, et l'emporte sur celle du style sélectionné (Arc, Outline,
  Tint) ; sa couleur est celle de Selected Essential color. **Border width**
  (les deux bordures) s'affiche avec une bordure qui a une épaisseur ;
  Automatic vaut 1 px pour les lignes et 1,5 px pour la couleur de l'icône et
  les anneaux. En mode expert, Custom accepte toute épaisseur en px
  (`zen-fluent.essentials.border-width-custom`, 8 px au plus) ; la bordure
  grossit vers l'intérieur et la tuile garde sa taille.
- **Essentials per row** : Automatic garde autant de colonnes de 36 px
  qu'il en tient, une ligne seule étant étirée sur toute la largeur. Un
  nombre fixe 2 à 6 colonnes égales : les tuiles gardent leur hauteur et leur
  espacement, et gardent leur largeur quand leur ligne n'est pas pleine. Une
  barre latérale trop étroite pour ce nombre garde autant de colonnes de
  36 px qu'il en tient ; la barre latérale repliée reste sur une colonne.
- **Essentials width** : avec Essentials per row sur Automatic, les tuiles
  s'étirent pour remplir chaque ligne. Une largeur les garde à cette
  largeur, autant par ligne qu'il en tient, depuis le début de la ligne
  (jamais plus larges que la barre latérale). Masqué quand Essentials per row
  est un nombre, qui fixe lui-même la largeur.
- **Essentials height** et **Space between Essentials** : Automatic suit la
  densité (tuiles de 42 px espacées de 6 px, 36 px et 4 px en compact). La
  largeur reste celle de la grille : voir Essentials per row.
- **Selected Essential** : la façon de marquer la tuile sélectionnée. Tous
  les styles restent à l'intérieur de la tuile.
  - _Dash and favicon glow_ (par défaut) : la tuile en carte avec un tiret
    sous l'icône (le style Edge surélève la tuile à la place), et le halo
    flou du favicon de Zen derrière elle, à la moitié de l'intensité de Zen,
    tant que `zen.theme.essentials-favicon-bg` est activé.
  - _Glow only_ : le halo du favicon seul, sur la tuile au repos, sans le
    tiret ; dessiné par Zen Fluent, donc visible même si le réglage de halo
    de Zen est désactivé.
  - _Arc_ : une bordure de 2 px dans la couleur, un bord supérieur clair et
    un bord inférieur sombre de 3 px (la lèvre est dessinée à l'intérieur de
    la tuile : la grille couperait une lèvre extérieure).
  - _Fill_ : la tuile dans la couleur ; les icônes en glyphe deviennent
    noires ou blanches, selon ce qui se lit dessus, et un favicon reçoit un
    fin contour de cette couleur.
  - _Taskbar indicator_ : un fond neutre et une barre arrondie de 16 px sous
    l'icône, comme l'application en cours dans la barre des tâches de
    Windows.
  - _Outline_ : un anneau de 2 px à l'intérieur de la tuile, sans fond
    (l'apparence du focus WinUI).
  - _Lift_ : un fond plus clair, une ombre douce, 1 px plus haut.
  - _Tint_ : 25 % de la couleur avec une bordure de 1 px de cette couleur.
- **Selected Essential color** : l'accent, la couleur de l'espace courant
  (`--zen-primary-color` de Zen, la couleur dominante du thème de l'espace),
  ou la couleur de l'icône : le favicon flouté jusqu'à ce qu'il n'en reste
  que la couleur, comme le fait le halo de Zen, pour les fonds (Fill, Tint,
  la teinte d'Arc) et les marques (tiret, pastille de barre des tâches, barre
  latérale). Les anneaux et les bordures (Arc, Outline, la bordure de Tint)
  gardent l'accent, sauf si **Icon colors** de Zen Fluent Enhanced est
  activé : il lit la couleur exacte de l'icône, qui les peint alors, ainsi
  que les fonds et les marques ([enhanced.md](../enhanced.md)). Les thèmes de
  contraste gardent les couleurs du système quel que soit le choix. Masqué
  avec Lift et Glow only, qui n'utilisent aucune couleur.
- **Alignment** : Left garde la grille. Center centre chaque ligne, la
  dernière aussi, comme la barre des tâches centrée de Windows ; les tuiles
  gardent la largeur fixée plus haut (ou la colonne d'un nombre par ligne),
  sinon elles sont presque carrées (la hauteur moins 4 px). La ligne des
  extensions a son propre Alignment (groupe Extensions).
- **Icon size** : le favicon, 16, 20 ou 24 px comme les petites, moyennes
  et grandes icônes de la barre des tâches ; la tuile garde sa hauteur.
- **Open page indicator** : Dot place un point gris de 4 px sous chaque
  Essential chargé qui n'est pas sélectionné, comme une application en cours
  dans la barre des tâches de Windows ; les tuiles déchargées n'en ont pas.
  Avec **Selected Essential** sur Taskbar indicator, les tuiles se lisent
  comme la barre des tâches : une pastille pour l'application sélectionnée,
  des points pour celles qui sont ouvertes.
- **Hover** : le fond de survol seul, ou avec une lumière douce qui monte du
  bord inférieur sous l'icône, comme la barre des tâches éclaire une
  application sous le pointeur.
- **Labels** : les icônes seules, ou le titre de la page sous chaque icône
  en texte de 10 px (coupé par des points de suspension) ; les tuiles
  gagnent 14 px de hauteur. Une tuile plus large (Essentials width, ou moins
  de tuiles par ligne) montre une plus grande part du titre. La barre
  latérale repliée garde les icônes seules.

## Réglages de la barre des tâches rangés ailleurs

- Matériau et transparence : **Backdrop material** et **Tint opacity**
  (Appearance).
- Couleur de l'indicateur : **Selected Essential color** (accent, espace ou
  icône) ; un accent personnalisé est le réglage **Accent color** du groupe
  Appearance. La couleur propre au site demande un script : c'est **Icon
  colors** de Zen Fluent Enhanced.
- Badges (nombre, point, aucun) : **Badges** du groupe Extensions.
