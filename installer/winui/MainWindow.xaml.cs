// Zen Fluent setup: the window, a wizard.
//
// Install:    Zen (version + profile) -> What (Zen Fluent or Enhanced) -> Work -> Done
// Uninstall:  Zen -> Uninstall (what to remove)                        -> Work -> Done
//
// Each page is a panel of MainWindow.xaml, kept out of the tree and put in
// PageHost when shown: PageHost's EntranceThemeTransition slides it in.
// Picking uses GridView tiles (WinUI's own selection: an accent outline,
// keyboard arrows), not radio buttons.
using System.Diagnostics;
using System.Runtime.InteropServices;
using Microsoft.UI.Composition.SystemBackdrops;
using Microsoft.UI.Windowing;
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
    private readonly List<FrameworkElement> pages;
    private FrameworkElement? page;
    private bool uninstalling;
    private bool running;
    private bool succeeded;

    [DllImport("user32.dll")]
    private static extern uint GetDpiForWindow(IntPtr hwnd);

    public MainWindow()
    {
        InitializeComponent();

        // Windows 11: Mica behind the window, the title bar drawn in it
        SystemBackdrop = MicaController.IsSupported() ? new MicaBackdrop() : new DesktopAcrylicBackdrop();
        ExtendsContentIntoTitleBar = true;
        SetTitleBar(AppTitleBar);
        var scale = GetDpiForWindow(WinRT.Interop.WindowNative.GetWindowHandle(this)) / 96.0;
        if (scale <= 0) scale = 1;
        AppWindow.Resize(new SizeInt32((int)(760 * scale), (int)(700 * scale)));
        if (AppWindow.Presenter is OverlappedPresenter presenter) presenter.IsMaximizable = false;
        // No closing halfway through: the profile would be left half done
        AppWindow.Closing += (_, args) => args.Cancel = running;

        Title = S.Get("Title");
        TitleText.Text = Installer.SourceRef == "main" ? S.Get("Title") : $"{S.Get("Title")} · {Installer.SourceRef}";
        BrowseButton.Content = S.Get("OtherFolder");
        ProfileHeader.Text = S.Get("Profile");
        ConsentText.Text = S.Get("UnsafeJs");
        ConsentErrorText.Text = S.Get("ConsentNeeded");
        DetailsExpander.Header = S.Get("Details");
        DoneDetails.Header = S.Get("Details");
        ModeButton.Content = S.Get("UninstallMode");
        BackButton.Content = S.Get("Back");
        DangerButton.Content = S.Get("Uninstall");
        RemoveModsCheck.Content = S.Get("RemoveMods");
        RemoveModsCheck.IsChecked = true;
        RemoveSettingsCheck.Content = S.Get("RemoveSettings");
        RemoveSineCheck.Content = S.Get("RemoveSine");
        RemoveSineWarning.Message = S.Get("RemoveSineWarning");

        // The pages leave their store; one at a time goes into PageHost
        pages = new() { ZenPage, WhatPage, UninstallPage, WorkPage, DonePage };
        PageStore.Children.Clear();

        BuildComponentTiles();
        editions = Zen.GetEditions();
        allProfiles = Zen.GetProfiles();
        BuildEditionTiles(0);
        ShowPage(ZenPage);
    }

    /// <summary>What the window found, for --selftest. It also shows every
    /// page once, so a page that fails to build fails the test.</summary>
    public string SelfTestSummary
    {
        get
        {
            foreach (var p in pages) ShowPage(p);
            uninstalling = true;
            ShowPage(UninstallPage);
            uninstalling = false;
            ShowPage(ZenPage);
            return $"editions={editions.Count} profiles={allProfiles.Count} tiles={EditionGrid.Items.Count}+{ComponentGrid.Items.Count} pages={pages.Count} source={Installer.SourceRef}";
        }
    }

    private ZenEdition? Edition =>
        EditionGrid.SelectedIndex >= 0 && EditionGrid.SelectedIndex < editions.Count ? editions[EditionGrid.SelectedIndex] : null;

    private ZenProfile? Profile =>
        ProfileBox.SelectedIndex >= 0 && ProfileBox.SelectedIndex < profiles.Count ? profiles[ProfileBox.SelectedIndex] : null;

    private bool Enhanced => ComponentGrid.SelectedIndex != 0;

    // -------- Pages --------

    private void ShowPage(FrameworkElement next)
    {
        page = next;
        PageHost.Children.Clear();
        PageHost.Children.Add(next);
        UpdateChrome();
    }

    /// <summary>The header and the footer of the page shown.</summary>
    private void UpdateChrome()
    {
        var step = page == ZenPage ? 1 : page == WhatPage || page == UninstallPage ? 2 : 0;
        StepRow.Visibility = step > 0 ? Visibility.Visible : Visibility.Collapsed;
        if (step > 0)
        {
            StepText.Text = string.Format(S.Get("Step"), step, 2);
            StepPips.SelectedPageIndex = step - 1;
        }

        (string title, string lead) = page switch
        {
            _ when page == ZenPage => (S.Get("ZenTitle"), S.Get("ZenLead")),
            _ when page == WhatPage => (S.Get("WhatTitle"), S.Get("WhatLead")),
            _ when page == UninstallPage => (S.Get("UninstallTitle"), S.Get("UninstallLead")),
            _ when page == WorkPage => (S.Get(uninstalling ? "WorkUninstall" : "WorkInstall"), S.Get("WorkLead")),
            _ => ("", ""),
        };
        PageTitle.Text = title;
        PageLead.Text = lead;
        PageTitle.Visibility = title.Length > 0 ? Visibility.Visible : Visibility.Collapsed;
        PageLead.Visibility = lead.Length > 0 ? Visibility.Visible : Visibility.Collapsed;

        // Footer: a link on the first page; Back, the main action, Close
        ModeButton.Visibility = page == ZenPage ? Visibility.Visible : Visibility.Collapsed;
        BackButton.Visibility = page == WhatPage || page == UninstallPage ? Visibility.Visible : Visibility.Collapsed;
        DangerButton.Visibility = page == UninstallPage ? Visibility.Visible : Visibility.Collapsed;
        NextButton.Visibility = page == UninstallPage || page == WorkPage || (page == DonePage && uninstalling && succeeded)
            ? Visibility.Collapsed
            : Visibility.Visible;
        NextButton.Content = page switch
        {
            _ when page == WhatPage => S.Get("Install"),
            _ when page == DonePage => S.Get(succeeded ? "OpenZen" : "TryAgain"),
            _ => S.Get("Next"),
        };
        CloseButton.Content = S.Get(page == DonePage ? "Close" : "Cancel");
        CloseButton.IsEnabled = !running;
        CloseButton.Visibility = page == WorkPage ? Visibility.Collapsed : Visibility.Visible;
        UpdateNext();
    }

    /// <summary>The first page goes on once a Zen recent enough and one of
    /// its profiles are picked.</summary>
    private void UpdateNext()
    {
        if (page != ZenPage)
        {
            NextButton.IsEnabled = !running;
            ModeButton.IsEnabled = !running;
            return;
        }
        var ready = Edition is { TooOld: false } && Profile is not null;
        NextButton.IsEnabled = ready;
        ModeButton.IsEnabled = ready;
    }

    private void NextButton_Click(object sender, RoutedEventArgs e)
    {
        if (running) return;
        if (page == ZenPage)
        {
            if (!CheckClosed()) return;
            uninstalling = false;
            ShowPage(WhatPage);
        }
        else if (page == WhatPage)
        {
            _ = InstallAsync();
        }
        else if (page == DonePage)
        {
            if (succeeded) OpenZen();
            else ShowPage(uninstalling ? UninstallPage : WhatPage);
        }
    }

    private void BackButton_Click(object sender, RoutedEventArgs e)
    {
        if (running) return;
        uninstalling = false;
        ShowPage(ZenPage);
    }

    private void ModeButton_Click(object sender, RoutedEventArgs e)
    {
        if (running || Edition is null || Profile is not { } profile) return;
        if (!CheckClosed()) return;
        uninstalling = true;
        UninstallTarget.Text = profile.Name;
        UninstallTargetLine.Text = $"{Edition.Label} · {string.Format(S.Get("ProfileFolder"), profile.Folder)}";
        ShowPage(UninstallPage);
    }

    private void CloseButton_Click(object sender, RoutedEventArgs e)
    {
        if (!running) Close();
    }

    /// <summary>Zen must be closed on the profile: said on the first page,
    /// before anything is chosen for nothing.</summary>
    private bool CheckClosed()
    {
        if (Profile is { } profile && Zen.ProfileInUse(profile.Path))
        {
            ShowZenInfo(InfoBarSeverity.Error, S.Get("ZenRunning"));
            return false;
        }
        return true;
    }

    private void ShowZenInfo(InfoBarSeverity severity, string message)
    {
        ZenInfo.Severity = severity;
        ZenInfo.Message = message;
        ZenInfo.IsOpen = message.Length > 0;
    }

    // -------- Tiles --------

    private static Brush Brush(string key) => (Brush)Application.Current.Resources[key];

    private static TextBlock Line(string text, string style = "CaptionTextBlockStyle", string brush = "TextFillColorSecondaryBrush") =>
        new()
        {
            Text = text,
            TextWrapping = TextWrapping.Wrap,
            Style = (Style)Application.Current.Resources[style],
            Foreground = Brush(brush),
        };

    /// <summary>A tile: an icon in a tinted square, a title (with an
    /// optional badge) and its lines. The GridViewItem around it draws the
    /// card, the hover and the accent outline of the picked tile.</summary>
    private static FrameworkElement Tile(string glyph, string title, string? badge, IEnumerable<UIElement> lines)
    {
        var panel = new StackPanel { Spacing = 4, Padding = new Thickness(16), Width = 328, MinHeight = 156 };
        var icon = new Border { Style = (Style)Application.Current.Resources["TileIconBox"], Margin = new Thickness(0, 0, 0, 8) };
        icon.Child = new FontIcon { Glyph = glyph, FontSize = 24, Foreground = Brush("AccentTextFillColorPrimaryBrush") };
        panel.Children.Add(icon);

        var head = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 8 };
        head.Children.Add(new TextBlock
        {
            Text = title,
            Style = (Style)Application.Current.Resources["BodyStrongTextBlockStyle"],
            FontSize = 16,
            VerticalAlignment = VerticalAlignment.Center,
        });
        if (badge is not null)
        {
            head.Children.Add(new Border
            {
                Background = Brush("AccentFillColorDefaultBrush"),
                CornerRadius = new CornerRadius(4),
                Padding = new Thickness(6, 1, 6, 2),
                VerticalAlignment = VerticalAlignment.Center,
                Child = new TextBlock
                {
                    Text = badge,
                    Style = (Style)Application.Current.Resources["CaptionTextBlockStyle"],
                    Foreground = Brush("TextOnAccentFillColorPrimaryBrush"),
                },
            });
        }
        panel.Children.Add(head);
        foreach (var line in lines) panel.Children.Add(line);
        Microsoft.UI.Xaml.Automation.AutomationProperties.SetName(panel, title);
        return panel;
    }

    // -------- Step 1: Zen version and profile --------

    private void BuildEditionTiles(int select)
    {
        EditionGrid.Items.Clear();
        foreach (var e in editions)
        {
            var lines = new List<UIElement>();
            if (!string.IsNullOrEmpty(e.Version)) lines.Add(Line(e.Version, "BodyTextBlockStyle"));
            lines.Add(Line(e.Dir, "CaptionTextBlockStyle", "TextFillColorTertiaryBrush"));
            if (e.TooOld)
            {
                var warning = Line(string.Format(S.Get("TooOld"), e.Label), "CaptionTextBlockStyle", "SystemFillColorCautionBrush");
                warning.Margin = new Thickness(0, 4, 0, 0);
                lines.Add(warning);
            }
            var twilight = e.Name.Contains("twilight", StringComparison.OrdinalIgnoreCase);
            // a moon for Twilight, a globe for Zen Browser
            EditionGrid.Items.Add(Tile(twilight ? "" : "", e.Name, null, lines));
        }
        if (editions.Count == 0)
        {
            ShowZenInfo(InfoBarSeverity.Warning, S.Get("NoZen"));
            FillProfiles();
            return;
        }
        EditionGrid.SelectedIndex = Math.Min(select, editions.Count - 1);
    }

    private void EditionGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        // Keeps a tile picked: clicking the picked one again does not unpick it
        if (EditionGrid.SelectedIndex < 0 && editions.Count > 0 && e.RemovedItems.Count > 0)
        {
            EditionGrid.SelectedItem = e.RemovedItems[0];
            return;
        }
        FillProfiles();
    }

    /// <summary>The chosen Zen's profiles, the one it opens by default first.</summary>
    private void FillProfiles()
    {
        ProfileBox.Items.Clear();
        profiles = new();
        var edition = Edition;
        if (edition is not null)
        {
            profiles = Zen.ProfilesOf(edition, allProfiles);
            foreach (var profile in profiles)
            {
                var label = profile.Name;
                if (Zen.OpensByDefault(edition, profile)) label += " — " + S.Get("OpensDefault");
                ProfileBox.Items.Add(label);
            }
        }
        ProfileBox.IsEnabled = profiles.Count > 0;
        if (profiles.Count > 0) ProfileBox.SelectedIndex = 0;

        if (edition is null) return;
        if (edition.TooOld) ShowZenInfo(InfoBarSeverity.Warning, string.Format(S.Get("TooOld"), edition.Label));
        else if (profiles.Count == 0) ShowZenInfo(InfoBarSeverity.Warning, S.Get("NoProfile"));
        else ShowZenInfo(InfoBarSeverity.Informational, "");
        UpdateProfile();
    }

    private void ProfileBox_SelectionChanged(object sender, SelectionChangedEventArgs e) => UpdateProfile();

    private void UpdateProfile()
    {
        if (ProfileLine is null) return;
        var profile = Profile;
        ProfileLine.Text = profile is null ? "" : string.Format(S.Get("ProfileFolder"), profile.Folder);
        if (ZenInfo.Severity == InfoBarSeverity.Error) ShowZenInfo(InfoBarSeverity.Informational, "");
        var edition = Edition;
        SineText.Text = edition is null || profile is null
            ? ""
            : S.Get(Zen.SineInstalled(edition.Dir, profile.Path) ? "SineKeptNote" : "SineNote");
        UpdateNext();
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
            ShowZenInfo(InfoBarSeverity.Warning, S.Get("NotZen"));
            return;
        }
        var found = Zen.EditionFromFolder(folder.Path);
        var index = editions.FindIndex(x => string.Equals(x.Dir, found.Dir, StringComparison.OrdinalIgnoreCase));
        if (index < 0)
        {
            editions.Add(found);
            index = editions.Count - 1;
        }
        BuildEditionTiles(index);
    }

    // -------- Step 2: Zen Fluent or Zen Fluent Enhanced --------

    private void BuildComponentTiles()
    {
        ComponentGrid.Items.Add(Tile("", "Zen Fluent", null, new UIElement[]
        {
            Line(S.Get("CoreLine"), "BodyTextBlockStyle"),
            Line(S.Get("CoreTag"), "CaptionTextBlockStyle", "TextFillColorTertiaryBrush"),
        }));
        ComponentGrid.Items.Add(Tile("", "Zen Fluent Enhanced", S.Get("Recommended"), new UIElement[]
        {
            Line(S.Get("EnhancedLine"), "BodyTextBlockStyle"),
            Line(S.Get("EnhancedTag"), "CaptionTextBlockStyle", "TextFillColorTertiaryBrush"),
        }));
        ComponentGrid.SelectedIndex = 1;
    }

    private void ComponentGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (ComponentGrid.SelectedIndex < 0 && e.RemovedItems.Count > 0)
        {
            ComponentGrid.SelectedItem = e.RemovedItems[0];
            return;
        }
        if (ConsentCard is null) return;
        ConsentCard.Visibility = Enhanced ? Visibility.Visible : Visibility.Collapsed;
        SetConsentError(false);
    }

    private void ConsentCheck_Changed(object sender, RoutedEventArgs e)
    {
        if (ConsentCheck.IsChecked == true) SetConsentError(false);
    }

    /// <summary>Install was clicked with Enhanced picked and the box left
    /// unchecked: the card turns red, with what to do.</summary>
    private void SetConsentError(bool error)
    {
        if (ConsentError is null || ConsentCard is null) return;
        ConsentError.Visibility = error ? Visibility.Visible : Visibility.Collapsed;
        ConsentCard.BorderBrush = Brush(error ? "SystemFillColorCriticalBrush" : "CardStrokeColorDefaultBrush");
        ConsentCard.Background = Brush(error ? "SystemFillColorCriticalBackgroundBrush" : "CardBackgroundFillColorDefaultBrush");
        ConsentText.Foreground = Brush(error ? "SystemFillColorCriticalBrush" : "TextFillColorPrimaryBrush");
    }

    // -------- Uninstall --------

    private void RemoveSineCheck_Changed(object sender, RoutedEventArgs e)
    {
        if (RemoveSineWarning is not null) RemoveSineWarning.IsOpen = RemoveSineCheck.IsChecked == true;
    }

    private void DangerButton_Click(object sender, RoutedEventArgs e)
    {
        if (running || Edition is not { } zen || Profile is not { } profile) return;
        var removeSettings = RemoveSettingsCheck.IsChecked == true;
        var removeSine = RemoveSineCheck.IsChecked == true;
        _ = RunAsync(installer => installer.UninstallAsync(zen, profile, removeSettings, removeSine));
    }

    // -------- Install, progress and result --------

    private Task InstallAsync()
    {
        if (Edition is not { } zen || Profile is not { } profile) return Task.CompletedTask;
        var enhanced = Enhanced;
        var consent = ConsentCheck.IsChecked == true;
        if (enhanced && !consent)
        {
            SetConsentError(true);
            ConsentCheck.Focus(FocusState.Programmatic);
            return Task.CompletedTask;
        }
        return RunAsync(installer => installer.RunAsync(zen, profile, enhanced, enhanced && consent));
    }

    /// <summary>Shows the progress page, runs the work off the UI thread
    /// with each step written to the page, then shows the result.</summary>
    private async Task RunAsync(Func<Installer, Task> work)
    {
        running = true;
        LogText.Text = "";
        WorkStep.Text = "";
        DetailsExpander.IsExpanded = false;
        ShowPage(WorkPage);
        var queue = DispatcherQueue;
        var installer = new Installer(message => queue.TryEnqueue(() =>
        {
            LogText.Text += (LogText.Text.Length > 0 ? "\n" : "") + message;
            WorkStep.Text = message;
        }));
        string? failure = null;
        try
        {
            await Task.Run(() => work(installer));
        }
        catch (Exception error)
        {
            failure = error.Message;
        }
        // Lets the last log lines in before the result copies them
        await Task.Yield();
        running = false;
        ShowDone(failure);
    }

    private void ShowDone(string? failure)
    {
        succeeded = failure is null;
        DoneBadge.Background = Brush(succeeded ? "AccentFillColorDefaultBrush" : "SystemFillColorCriticalBrush");
        DoneGlyph.Glyph = succeeded ? "" : "";
        DoneTitle.Text = S.Get(succeeded
            ? (uninstalling ? "UninstalledTitle" : "DoneTitle")
            : (uninstalling ? "UninstallFailed" : "Failed"));
        DoneText.Text = failure ?? S.Get(uninstalling ? "UninstalledText" : "DoneText");
        DoneLog.Text = LogText.Text;
        DoneDetails.IsExpanded = !succeeded;
        ShowPage(DonePage);
        if (succeeded) UpdateProfile();
    }

    /// <summary>Starts the chosen Zen on the chosen profile, then closes.</summary>
    private void OpenZen()
    {
        if (Edition is not { } zen || Profile is not { } profile) return;
        try
        {
            Process.Start(new ProcessStartInfo(Path.Combine(zen.Dir, "zen.exe"))
            {
                ArgumentList = { "-profile", profile.Path },
                UseShellExecute = false,
            });
            Close();
        }
        catch (Exception error)
        {
            DoneText.Text = error.Message;
        }
    }
}
