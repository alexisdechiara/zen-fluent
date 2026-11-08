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
    private bool running;

    public MainWindow()
    {
        InitializeComponent();

        // Windows 11: Mica behind the window, the title bar drawn in it
        if (MicaController.IsSupported())
        {
            SystemBackdrop = new MicaBackdrop();
        }
        else
        {
            SystemBackdrop = new DesktopAcrylicBackdrop();
        }
        ExtendsContentIntoTitleBar = true;
        SetTitleBar(AppTitleBar);
        AppWindow.Resize(new SizeInt32(720, 860));
        Title = S.Get("Title");

        TitleText.Text = S.Get("Title");
        LeadText.Text = S.Get("Lead");
        EditionHeader.Text = S.Get("Edition");
        BrowseButton.Content = S.Get("OtherFolder");
        ProfileHeader.Text = S.Get("Profile");
        ComponentsHeader.Text = S.Get("Components");
        SineCheck.Content = S.Get("Sine");
        FluentCheck.Content = S.Get("Fluent");
        EnhancedCheck.Content = S.Get("Enhanced");
        ConsentText.Text = S.Get("UnsafeJs");
        DetailsExpander.Header = S.Get("Details");
        CloseButton.Content = S.Get("Close");
        InstallButton.Content = S.Get("Install");
        SourceText.Text = string.Format(S.Get("Source"), Installer.SourceRef);
        EnhancedCheck.IsChecked = true;

        editions = Zen.GetEditions();
        allProfiles = Zen.GetProfiles();
        FillEditions(0);
        if (editions.Count == 0)
        {
            ShowResult(InfoBarSeverity.Warning, S.Get("NoZen"), "");
        }
    }

    /// <summary>What the window found, for --selftest.</summary>
    public string SelfTestSummary =>
        $"editions={editions.Count} profiles={allProfiles.Count} source={Installer.SourceRef}";

    private ZenEdition? Edition =>
        EditionBox.SelectedIndex >= 0 && EditionBox.SelectedIndex < editions.Count ? editions[EditionBox.SelectedIndex] : null;

    private ZenProfile? Profile =>
        ProfileBox.SelectedIndex >= 0 && ProfileBox.SelectedIndex < profiles.Count ? profiles[ProfileBox.SelectedIndex] : null;

    private void FillEditions(int select)
    {
        EditionBox.Items.Clear();
        foreach (var edition in editions)
        {
            EditionBox.Items.Add(edition.Label);
        }
        if (editions.Count > 0)
        {
            EditionBox.SelectedIndex = Math.Min(select, editions.Count - 1);
        }
    }

    /// <summary>The chosen Zen's profiles, the one it opens by default first.</summary>
    private void FillProfiles()
    {
        ProfileBox.Items.Clear();
        profiles = new();
        var edition = Edition;
        if (edition is null)
        {
            DirText.Text = "";
            VersionWarning.IsOpen = false;
            return;
        }
        DirText.Text = edition.Dir;
        VersionWarning.Message = string.Format(S.Get("TooOld"), edition.Label);
        VersionWarning.IsOpen = edition.TooOld;
        profiles = Zen.ProfilesOf(edition, allProfiles);
        foreach (var profile in profiles)
        {
            var label = $"{profile.Name}  ({profile.Folder})";
            if (Zen.OpensByDefault(edition, profile))
            {
                label += "  — " + S.Get("OpensDefault");
            }
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

    private void UpdateSineState()
    {
        var edition = Edition;
        var profile = Profile;
        if (edition is null || profile is null) return;
        SineCheck.Content = Zen.SineInstalled(edition.Dir, profile.Path) ? S.Get("SineThere") : S.Get("Sine");
    }

    private void EditionBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        ResultBar.IsOpen = false;
        FillProfiles();
    }

    private void ProfileBox_SelectionChanged(object sender, SelectionChangedEventArgs e) => UpdateSineState();

    // Checked in code, after InitializeComponent: set in XAML, it fired
    // before ConsentCheck existed and the window failed to load
    private void EnhancedCheck_Changed(object sender, RoutedEventArgs e)
    {
        if (ConsentCheck is not null) ConsentCheck.IsEnabled = EnhancedCheck.IsChecked == true;
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
        var edition = Zen.EditionFromFolder(folder.Path);
        var index = editions.FindIndex(x => string.Equals(x.Dir, edition.Dir, StringComparison.OrdinalIgnoreCase));
        if (index < 0)
        {
            editions.Add(edition);
            index = editions.Count - 1;
        }
        FillEditions(index);
    }

    private void CloseButton_Click(object sender, RoutedEventArgs e) => Close();

    private async void InstallButton_Click(object sender, RoutedEventArgs e)
    {
        var edition = Edition;
        var profile = Profile;
        if (running) return;
        if (edition is null)
        {
            ShowResult(InfoBarSeverity.Warning, S.Get("NoZen"), "");
            return;
        }
        if (profile is null)
        {
            ShowResult(InfoBarSeverity.Warning, S.Get("NoProfile"), "");
            return;
        }

        running = true;
        ResultBar.IsOpen = false;
        LogText.Text = "";
        InstallButton.IsEnabled = false;
        InstallButton.Content = S.Get("Installing");
        Progress.Visibility = Visibility.Visible;
        var enhanced = EnhancedCheck.IsChecked == true;
        var consent = ConsentCheck.IsChecked == true;
        var queue = DispatcherQueue;
        var installer = new Installer(message => queue.TryEnqueue(() =>
        {
            LogText.Text += (LogText.Text.Length > 0 ? "\n" : "") + message;
        }));
        try
        {
            await Task.Run(() => installer.RunAsync(edition, profile, enhanced, consent));
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
