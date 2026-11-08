// Zen Fluent setup: the application. Started with --bootloader <zip> <folder>
// (by itself, with administrator rights), it only unpacks Sine's bootloader
// into Zen's protected folder and quits, before any window.
using System.IO.Compression;
using Microsoft.UI.Xaml;

namespace ZenFluentSetup;

public partial class App : Application
{
    private Window? window;

    public App()
    {
        var args = Environment.GetCommandLineArgs();
        var index = Array.IndexOf(args, "--bootloader");
        if (index >= 0 && index + 2 < args.Length)
        {
            try
            {
                ZipFile.ExtractToDirectory(args[index + 1], args[index + 2], overwriteFiles: true);
                Environment.Exit(0);
            }
            catch
            {
                Environment.Exit(1);
            }
        }
        InitializeComponent();
    }

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        window = new MainWindow();
        window.Activate();
    }
}
