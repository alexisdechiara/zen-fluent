// Zen Fluent setup: the window.
using Microsoft.UI.Composition.SystemBackdrops;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Windows.Graphics;

namespace ZenFluentSetup;

public sealed partial class MainWindow : Window
{
    private readonly List<ZenEdition> editions;
    private readonly List<ZenProfile> allProfiles;
    private List<ZenProfile> profiles = new();
    private readonly List<OptionCard> editionCards = new();
    private readonly List<OptionCard> componentCards = new();
    private int edition = -1;
    private bool enhanced = true;
    private bool running;
    private bool uninstalling;

    public MainWindow()
    {
        InitializeComponent();

        // Windows 11: Mica behind the window, the title bar drawn in it
        SystemBackdrop = MicaController.IsSupported() ? new MicaBackdrop() : new DesktopAcrylicBackdrop();
        ExtendsContentIntoTitleBar = true;
        SetTitleBar(AppTitleBar);
        AppWindow.Resize(new SizeInt32(820, 940));
        Title = S.Get("Title");

        TitleText.Text = S.Get("Title");
        LeadText.Text = S.Get("Lead");
        EditionHeader.Text = S.Get("Edition");
        BrowseButton.Content = S.Get("OtherFolder");
        ProfileBox.Header = S.Get("Profile");
        ComponentsHeader.Text = S.Get("Components");
        ConsentText.Text = S.Get("UnsafeJs");
        ConsentErrorText.Text = S.Get("ConsentNeeded");
        DetailsExpander.Header = S.Get("Details");
        CloseButton.Content = S.Get("Close");
        InstallButton.Content = S.Get("Install");
        SourceText.Text = string.Format(S.Get("Source"), Installer.SourceRef);
        ModeButton.Content = S.Get("UninstallMode");
        UninstallHeader.Text = S.Get("UninstallHeader");
        RemoveModsCheck.Content = S.Get("RemoveMods");
        RemoveModsCheck.IsChecked = true;
        RemoveSettingsCheck.Content = S.Get("RemoveSettings");
        RemoveSineCheck.Content = S.Get("RemoveSine");
        RemoveSineWarning.Message = S.Get("RemoveSineWarning");

        BuildComponentCards();
        editions = Zen.GetEditions();
        allProfiles = Zen.GetProfiles();
        BuildEditionCards(0);
        if (editions.Count == 0)
        {
            ShowResult(InfoBarSeverity.Warning, S.Get("NoZen"), "");
        }
    }

    /// <summary>What the window found, for --selftest.</summary>
    public string SelfTestSummary =>
        $"editions={editions.Count} profiles={allProfiles.Count} cards={editionCards.Count}+{componentCards.Count} source={Installer.SourceRef}";

    private ZenEdition? Edition => edition >= 0 && edition < editions.Count ? editions[edition] : null;

    private ZenProfile? Profile =>
        ProfileBox.SelectedIndex >= 0 && ProfileBox.SelectedIndex < profiles.Count ? profiles[ProfileBox.SelectedIndex] : null;

    // -------- Option cards --------

    /// <summary>A card to pick, as in Zen's welcome screens: a radio, a
    /// title and its lines, an illustration; outlined in the accent when
    /// picked, a click anywhere on it picks it.</summary>
    private sealed class OptionCard
    {
        public required Border Root { get; init; }
        public required RadioButton Radio { get; init; }

        public void SetSelected(bool selected)
        {
            Radio.IsChecked = selected;
            Root.BorderBrush = Brush(selected ? "AccentFillColorDefaultBrush" : "CardStrokeColorDefaultBrush");
            Root.BorderThickness = new Thickness(selected ? 2 : 1);
            // Keeps the content in place when the border thickens
            Root.Padding = selected ? new Thickness(19) : new Thickness(20);
        }
    }

    private static Brush Brush(string key) => (Brush)Application.Current.Resources[key];

    private static TextBlock Line(string text, string style = "CaptionTextBlockStyle", string brush = "TextFillColorSecondaryBrush") =>
        new()
        {
            Text = text,
            TextWrapping = TextWrapping.Wrap,
            Style = (Style)Application.Current.Resources[style],
            Foreground = Brush(brush),
        };

    private static OptionCard MakeCard(string group, string glyph, string title, IEnumerable<UIElement> lines, Action pick)
    {
        var radio = new RadioButton { GroupName = group, MinWidth = 0, Padding = new Thickness(0), VerticalAlignment = VerticalAlignment.Top };
        Microsoft.UI.Xaml.Automation.AutomationProperties.SetName(radio, title);
        var text = new StackPanel { Spacing = 2 };
        text.Children.Add(new TextBlock
        {
            Text = title,
            TextWrapping = TextWrapping.Wrap,
            Style = (Style)Application.Current.Resources["BodyStrongTextBlockStyle"],
            FontSize = 16,
            Margin = new Thickness(0, 4, 0, 2),
        });
        foreach (var line in lines) text.Children.Add(line);
        var art = new FontIcon
        {
            Glyph = glyph,
            FontSize = 36,
            Foreground = Brush("AccentTextFillColorPrimaryBrush"),
            VerticalAlignment = VerticalAlignment.Top,
            Margin = new Thickness(8, 4, 0, 0),
        };
        var grid = new Grid { ColumnSpacing = 4 };
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        grid.Children.Add(radio);
        Grid.SetColumn(text, 1);
        grid.Children.Add(text);
        Grid.SetColumn(art, 2);
        grid.Children.Add(art);

        var root = new Border
        {
            Child = grid,
            CornerRadius = new CornerRadius(8),
            Background = Brush("CardBackgroundFillColorDefaultBrush"),
            MinHeight = 124,
        };
        var card = new OptionCard { Root = root, Radio = radio };
        card.SetSelected(false);
        root.Tapped += (_, _) => pick();
        radio.Checked += (_, _) => pick();
        root.PointerEntered += (_, _) => root.Background = Brush("CardBackgroundFillColorSecondaryBrush");
        root.PointerExited += (_, _) => root.Background = Brush("CardBackgroundFillColorDefaultBrush");
        return card;
    }

    /// <summary>Lays cards out two by row.</summary>
    private static void Place(Grid grid, IReadOnlyList<OptionCard> cards)
    {
        grid.Children.Clear();
        grid.ColumnDefinitions.Clear();
        grid.RowDefinitions.Clear();
        var columns = cards.Count == 1 ? 1 : 2;
        for (var c = 0; c < columns; c++) grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        for (var i = 0; i < cards.Count; i++)
        {
            if (i % columns == 0) grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            Grid.SetColumn(cards[i].Root, i % columns);
            Grid.SetRow(cards[i].Root, i / columns);
            grid.Children.Add(cards[i].Root);
        }
    }

    // -------- Zen version --------

    private void BuildEditionCards(int select)
    {
        editionCards.Clear();
        for (var i = 0; i < editions.Count; i++)
        {
            var index = i;
            var e = editions[i];
            var lines = new List<UIElement>();
            if (!string.IsNullOrEmpty(e.Version)) lines.Add(Line(e.Version, "BodyTextBlockStyle"));
            lines.Add(Line(e.Dir, "CaptionTextBlockStyle", "TextFillColorTertiaryBrush"));
            if (e.TooOld)
            {
                var warning = Line(string.Format(S.Get("TooOld"), e.Label), "CaptionTextBlockStyle", "SystemFillColorCautionBrush");
                warning.Margin = new Thickness(0, 6, 0, 0);
                lines.Add(warning);
            }
            var twilight = e.Name.Contains("twilight", StringComparison.OrdinalIgnoreCase);
            // a moon for Twilight, a globe for Zen Browser
            editionCards.Add(MakeCard("edition", twilight ? "" : "", e.Name, lines, () => SelectEdition(index)));
        }
        Place(EditionCards, editionCards);
        if (editions.Count > 0) SelectEdition(Math.Min(select, editions.Count - 1));
    }

    private void SelectEdition(int index)
    {
        if (index == edition) return;
        edition = index;
        for (var i = 0; i < editionCards.Count; i++) editionCards[i].SetSelected(i == index);
        ResultBar.IsOpen = false;
        FillProfiles();
    }

    /// <summary>The chosen Zen's profiles, the one it opens by default first.</summary>
    private void FillProfiles()
    {
        ProfileBox.Items.Clear();
        profiles = new();
        var e = Edition;
        if (e is null) return;
        profiles = Zen.ProfilesOf(e, allProfiles);
        foreach (var profile in profiles)
        {
            var label = $"{profile.Name}  ({profile.Folder})";
            if (Zen.OpensByDefault(e, profile)) label += "  — " + S.Get("OpensDefault");
            ProfileBox.Items.Add(label);
        }
        if (profiles.Count > 0)
        {
            ProfileBox.SelectedIndex = 0;
        }
        else
        {
            ShowResult(InfoBarSeverity.Warning, S.Get("NoProfile"), "");
        }
        UpdateSineState();
    }

    private void ProfileBox_SelectionChanged(object sender, SelectionChangedEventArgs e) => UpdateSineState();

    private void UpdateSineState()
    {
        if (SineText is null) return;
        var e = Edition;
        var profile = Profile;
        if (e is null || profile is null)
        {
            SineText.Text = "";
            return;
        }
        SineText.Text = Zen.SineInstalled(e.Dir, profile.Path) ? S.Get("SineKeptNote") : S.Get("SineNote");
    }

    private async void BrowseButton_Click(object sender, RoutedEventArgs e)
    {
        var picker = new Windows.Storage.Pickers.FolderPicker();
        picker.FileTypeFilter.Add("*");
        WinRT.Interop.InitializeWithWindow.Initialize(picker, WinRT.Interop.WindowNative.GetWindowHandle(this));
        var folder = await picker.PickSingleFolderAsync();
        if (folder is null) return;
        if (!File.Exists(Path.Combine(folder.Path, "zen.exe")))
        {
            ShowResult(InfoBarSeverity.Warning, S.Get("NotZen"), "");
            return;
        }
        var found = Zen.EditionFromFolder(folder.Path);
        var index = editions.FindIndex(x => string.Equals(x.Dir, found.Dir, StringComparison.OrdinalIgnoreCase));
        if (index < 0)
        {
            editions.Add(found);
            index = editions.Count - 1;
        }
        edition = -1;
        BuildEditionCards(index);
    }

    // -------- Zen Fluent or Zen Fluent Enhanced --------

    private void BuildComponentCards()
    {
        componentCards.Add(MakeCard("component", "", "Zen Fluent", new UIElement[]
        {
            Line(S.Get("CoreLine")),
            Line(S.Get("CoreTag"), "CaptionTextBlockStyle", "TextFillColorTertiaryBrush"),
        }, () => SelectComponent(false)));
        componentCards.Add(MakeCard("component", "", "Zen Fluent Enhanced", new UIElement[]
        {
            Line(S.Get("EnhancedLine")),
            Line(S.Get("EnhancedTag"), "CaptionTextBlockStyle", "TextFillColorTertiaryBrush"),
        }, () => SelectComponent(true)));
        for (var i = 0; i < componentCards.Count; i++)
        {
            Grid.SetColumn(componentCards[i].Root, i);
            ComponentCards.Children.Add(componentCards[i].Root);
        }
        SelectComponent(true);
    }

    private void SelectComponent(bool withEnhanced)
    {
        enhanced = withEnhanced;
        componentCards[0].SetSelected(!withEnhanced);
        componentCards[1].SetSelected(withEnhanced);
        ConsentBorder.Visibility = withEnhanced ? Visibility.Visible : Visibility.Collapsed;
        SetConsentError(false);
    }

    private void ConsentCheck_Changed(object sender, RoutedEventArgs e)
    {
        if (ConsentCheck.IsChecked == true) SetConsentError(false);
    }

    /// <summary>Install was clicked with Enhanced picked and the box left
    /// unchecked: the box turns red, with what to do.</summary>
    private void SetConsentError(bool error)
    {
        if (ConsentError is null) return;
        ConsentError.Visibility = error ? Visibility.Visible : Visibility.Collapsed;
        ConsentBorder.BorderBrush = Brush(error ? "SystemFillColorCriticalBrush" : "CardStrokeColorDefaultBrush");
        ConsentBorder.Background = Brush(error ? "SystemFillColorCriticalBackgroundBrush" : "CardBackgroundFillColorDefaultBrush");
        ConsentText.Foreground = Brush(error ? "SystemFillColorCriticalBrush" : "TextFillColorPrimaryBrush");
    }

    // -------- Uninstall --------

    /// <summary>Install or uninstall: the same Zen version and profile, then
    /// either what to install or what to remove.</summary>
    private void ModeButton_Click(object sender, RoutedEventArgs e)
    {
        if (running) return;
        uninstalling = !uninstalling;
        InstallPanel.Visibility = uninstalling ? Visibility.Collapsed : Visibility.Visible;
        UninstallPanel.Visibility = uninstalling ? Visibility.Visible : Visibility.Collapsed;
        ModeButton.Content = S.Get(uninstalling ? "BackToInstall" : "UninstallMode");
        InstallButton.Content = S.Get(uninstalling ? "Uninstall" : "Install");
        ResultBar.IsOpen = false;
    }

    private void RemoveSineCheck_Changed(object sender, RoutedEventArgs e)
    {
        if (RemoveSineWarning is not null) RemoveSineWarning.IsOpen = RemoveSineCheck.IsChecked == true;
    }

    private async Task RunUninstallAsync(ZenEdition zen, ZenProfile profile)
    {
        running = true;
        ResultBar.IsOpen = false;
        LogText.Text = "";
        InstallButton.IsEnabled = false;
        ModeButton.IsEnabled = false;
        InstallButton.Content = S.Get("Uninstalling");
        Progress.Visibility = Visibility.Visible;
        var removeSettings = RemoveSettingsCheck.IsChecked == true;
        var removeSine = RemoveSineCheck.IsChecked == true;
        var queue = DispatcherQueue;
        var installer = new Installer(message => queue.TryEnqueue(() =>
        {
            LogText.Text += (LogText.Text.Length > 0 ? "\n" : "") + message;
        }));
        try
        {
            await Task.Run(() => installer.UninstallAsync(zen, profile, removeSettings, removeSine));
            ShowResult(InfoBarSeverity.Success, S.Get("Uninstalled"), S.Get("UninstalledTitle"));
            UpdateSineState();
        }
        catch (Exception error)
        {
            ShowResult(InfoBarSeverity.Error, error.Message, S.Get("UninstallFailed"));
            DetailsExpander.IsExpanded = true;
        }
        finally
        {
            running = false;
            InstallButton.IsEnabled = true;
            ModeButton.IsEnabled = true;
            InstallButton.Content = S.Get("Uninstall");
            Progress.Visibility = Visibility.Collapsed;
        }
    }

    // -------- Actions --------

    private void CloseButton_Click(object sender, RoutedEventArgs e) => Close();

    private async void InstallButton_Click(object sender, RoutedEventArgs e)
    {
        if (running) return;
        var zen = Edition;
        var profile = Profile;
        if (zen is null)
        {
            ShowResult(InfoBarSeverity.Warning, S.Get("NoZen"), "");
            return;
        }
        if (profile is null)
        {
            ShowResult(InfoBarSeverity.Warning, S.Get("NoProfile"), "");
            return;
        }
        if (uninstalling)
        {
            await RunUninstallAsync(zen, profile);
            return;
        }
        var consent = ConsentCheck.IsChecked == true;
        if (enhanced && !consent)
        {
            SetConsentError(true);
            ConsentCheck.Focus(FocusState.Programmatic);
            return;
        }

        running = true;
        ResultBar.IsOpen = false;
        LogText.Text = "";
        InstallButton.IsEnabled = false;
        InstallButton.Content = S.Get("Installing");
        Progress.Visibility = Visibility.Visible;
        var withEnhanced = enhanced;
        var queue = DispatcherQueue;
        var installer = new Installer(message => queue.TryEnqueue(() =>
        {
            LogText.Text += (LogText.Text.Length > 0 ? "\n" : "") + message;
        }));
        try
        {
            await Task.Run(() => installer.RunAsync(zen, profile, withEnhanced, withEnhanced && consent));
            ShowResult(InfoBarSeverity.Success, S.Get("Done"), S.Get("DoneTitle"));
            UpdateSineState();
        }
        catch (Exception error)
        {
            ShowResult(InfoBarSeverity.Error, error.Message, S.Get("Failed"));
            DetailsExpander.IsExpanded = true;
        }
        finally
        {
            running = false;
            InstallButton.IsEnabled = true;
            InstallButton.Content = S.Get("Install");
            Progress.Visibility = Visibility.Collapsed;
        }
    }

    private void ShowResult(InfoBarSeverity severity, string message, string title)
    {
        ResultBar.Severity = severity;
        ResultBar.Title = title;
        ResultBar.Message = message;
        ResultBar.IsOpen = true;
    }
}
