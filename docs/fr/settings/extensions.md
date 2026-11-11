# Extensions

Traduction de [docs/settings/extensions.md](../../settings/extensions.md).

La ligne des extensions épinglées à la barre d'outils : emplacement, taille,
disposition, badges.

En-tête du groupe : `zen-fluent.ui.open-extensions` (ouvert par défaut :
`false`).

| Réglage                            | Préférence                          | Valeurs                                                                                                        | Défaut |
| ---------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| WinUI style for the extensions row | `zen-fluent.pinned-extensions`      | `true` / `false`                                                                                               | `true` |
| Place                              | `zen-fluent.extensions.position`    | `top` Above the Essentials<br>`bottom` Bottom of the sidebar<br>`hidden` Hidden                                | `top`  |
| Columns                            | `zen-fluent.extensions.columns`     | `auto` Automatic<br>`3` 3<br>`4` 4<br>`5` 5<br>`6` 6<br>`7` 7<br>`8` 8                                         | `auto` |
| Rows                               | `zen-fluent.extensions.rows`        | `auto` Automatic (toutes les lignes)<br>`1` 1<br>`2` 2<br>`3` 3<br>`4` 4<br>`scroll` One row, scrolls sideways | `auto` |
| Icon size                          | `zen-fluent.extensions.icon-size`   | `auto` Automatic (16 px)<br>`12` 12 px<br>`14` 14 px<br>`16` 16 px<br>`18` 18 px<br>`20` 20 px<br>`24` 24 px   | `auto` |
| Button size                        | `zen-fluent.extensions.button-size` | `auto` Automatic (celle de la densité)<br>`24` 24 px<br>`28` 28 px<br>`32` 32 px<br>`36` 36 px<br>`40` 40 px   | `auto` |
| Space between buttons              | `zen-fluent.extensions.gap`         | `auto` Automatic<br>`0` 0 px<br>`2` 2 px<br>`4` 4 px<br>`6` 6 px<br>`8` 8 px<br>`12` 12 px                     | `auto` |
| Alignment                          | `zen-fluent.extensions.align`       | `auto` Automatic (celui du style)<br>`stretch` Stretch<br>`start` Start<br>`center` Center<br>`end` End        | `auto` |
| Badges                             | `zen-fluent.extensions.badge`       | `show` Count<br>`dot` Dot<br>`hide` Hidden                                                                     | `show` |

## Notes

- **WinUI style for the extensions row** : la barre d'outils unique de Zen
  affiche les extensions épinglées à la barre d'outils dans une ligne sous la
  barre d'adresse (`#zen-overflow-extensions-list`) ; le mod la dispose en
  boutons WinUI. Les colonnes, les lignes, les tailles, l'espacement et
  l'alignement ont besoin que ce réglage soit activé ; l'emplacement et les
  badges fonctionnent dans les deux cas.
  Depuis Zen 1.24, tant que les icônes de la barre d'adresse et les
  extensions prennent moins de 55 % de sa largeur
  (`zen.view.overflow-webext-toolbar-threshold`), elles se placent dans la
  barre d'adresse à la place ; mettez cette préférence à `0` pour toujours
  avoir la ligne.
  Les extensions déplacées dans la barre d'onglets par un mod plus ancien
  (Arc 2.0, Nebula) restent empilées en bas de la barre latérale : dans le
  menu Extensions (icône de puzzle), cliquez sur la roue dentée de chacune,
  **Désépingler de la barre d'outils**, puis **Épingler à la barre
  d'outils**.
- **Place** : au-dessus des Essentials (la place de Zen) ou tout en bas de
  la barre latérale, sous les boutons Bibliothèque et Nouveau. Entre les
  Essentials et les onglets, il faut un script : **Extensions under the
  Essentials** de Zen Fluent Enhanced y déplace la ligne tant que Place est
  au-dessus des Essentials ([enhanced.md](../enhanced.md)). Hidden : les
  extensions restent dans le panneau du site et le menu Extensions.
- **Columns** : Automatic place autant de boutons que la largeur le permet ;
  un nombre fait ce nombre de colonnes, plus étroites qu'un bouton si la
  barre latérale est étroite.
- **Rows** : toutes, ou au plus 1 à 4 lignes, le reste défilant ; One row
  défile sur le côté (Maj + molette) et ignore Columns.
- **Icon size**, **Button size** : aussi pour les boutons d'extension de la
  barre d'outils classique (barre d'outils unique désactivée), pas pour ceux
  qui sont dans la barre d'adresse. 40 px dépasse la barre d'outils classique
  de 2 px.
- **Alignment** : Automatic suit le style (WinUI étire les boutons sur la
  ligne, Edge les garde carrés au début) ; Start, Center et End gardent des
  boutons carrés.
- La surface de la ligne vient de **Variants** : avec **Extension buttons:
  fill and shape for** sur The whole row, le fond et la forme des extensions
  dessinent une seule surface à 4 px autour des boutons au lieu de chaque
  bouton.
- **Badges** : le nombre (dans l'accent), un point comme celui de la barre
  des tâches de Windows, ou rien ; dans la ligne et dans la barre d'outils
  classique.
