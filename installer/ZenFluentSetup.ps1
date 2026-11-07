<#
.SYNOPSIS
  Zen Fluent setup: installs Sine, Zen Fluent and Zen Fluent Enhanced into a Zen profile.

.DESCRIPTION
  Does what Sine's own installer and Sine itself would do, in one go:
    1. Sine's bootloader (sineorg/bootloader): program.zip into Zen's
       install folder (asks for administrator rights only for that step
       when the folder is protected), profile.zip into <profile>\chrome.
    2. Sine's engine (CosmoCreeper/Sine, engine.zip) into <profile>\chrome.
    3. Zen Fluent and, if picked, Zen Fluent Enhanced, the way Sine
       installs a mod: its files in chrome\sine-mods\<id>\ and its entry in
       chrome\sine-mods\mods.json (other mods are kept, the old file is
       saved next to it).
    4. Preferences in prefs.js: svg.context-properties.content.enabled
       (the mod's icons) and, only with the user's consent,
       sine.allow-unsafe-js (scripts of mods installed outside Sine's store,
       which Zen Fluent Enhanced needs).
    5. Clears the profile's startup cache.
  Zen must not be using the profile. Sine already there is kept
  (-ReinstallSine replaces it). Run without parameters for the window;
  -NoGui for a scripted run. Built into ZenFluentSetup.exe by
  .github/workflows/installer.yml.

.PARAMETER NoGui
  No window: install with the parameters below.
.PARAMETER ZenDir
  Zen's install folder (the one with zen.exe). Default: the first found.
.PARAMETER ProfilePath
  The profile folder. Default: the profile Zen opens by default.
.PARAMETER Enhanced
  Also install Zen Fluent Enhanced (needs -AllowUnsafeJs).
.PARAMETER AllowUnsafeJs
  Consent to set sine.allow-unsafe-js.
.PARAMETER Ref
  Branch or tag of alexisdechiara/zen-fluent to install. Default: main.
.PARAMETER ReinstallSine
  Install Sine's bootloader and engine even when Sine is there.

.EXAMPLE
  .\ZenFluentSetup.ps1
.EXAMPLE
  .\ZenFluentSetup.ps1 -NoGui -Enhanced -AllowUnsafeJs
#>
[CmdletBinding()]
param(
  [switch]$NoGui,
  [string]$ZenDir,
  [string]$ProfilePath,
  [switch]$Enhanced,
  [switch]$AllowUnsafeJs,
  [string]$Ref = "main",
  [switch]$ReinstallSine,
  # Internal: the elevated copy of this script that writes the bootloader
  [string]$BootloaderZip,
  [string]$BootloaderTarget
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# -------- What gets installed --------
$Repo = "alexisdechiara/zen-fluent"
# The Sine release Zen Fluent is tested with (components.json, sine.source)
$SineRepo = "CosmoCreeper/Sine"
$SineTag = "v2.3.4.1c"
$BootloaderRepo = "sineorg/bootloader"
$Prefs = @{ "svg.context-properties.content.enabled" = "true" }

# -------- Elevated step: the bootloader into Zen's folder --------
if ($BootloaderZip -and $BootloaderTarget) {
  Expand-Archive -LiteralPath $BootloaderZip -DestinationPath $BootloaderTarget -Force
  exit 0
}

# -------- Text, in French when Windows is --------
$French = (Get-UICulture).TwoLetterISOLanguageName -eq "fr"
$Text = @{
  Title         = @("Zen Fluent setup", "Installation de Zen Fluent")
  ZenFolder     = @("Zen's folder", "Dossier de Zen")
  Profile       = @("Profile", "Profil")
  Browse        = @("Browse…", "Parcourir…")
  Components    = @("What to install", "À installer")
  Sine          = @("Sine, the mod manager", "Sine, le gestionnaire de mods")
  SineThere     = @("Sine (already installed)", "Sine (déjà installé)")
  Fluent        = @("Zen Fluent: Mica, Acrylic and WinUI 3 for Zen", "Zen Fluent : Mica, Acrylic et WinUI 3 pour Zen")
  EnhancedLabel = @("Zen Fluent Enhanced: settings page, French interface, features", "Zen Fluent Enhanced : page de paramètres, interface en français, fonctions")
  UnsafeJs      = @("Allow the scripts of mods installed outside Sine's store (needed by Zen Fluent Enhanced: sine.allow-unsafe-js)", "Autoriser les scripts des mods installés hors de la boutique de Sine (nécessaire à Zen Fluent Enhanced : sine.allow-unsafe-js)")
  Install       = @("Install", "Installer")
  Close         = @("Close", "Fermer")
  NoZen         = @("Zen was not found. Pick its folder (the one with zen.exe).", "Zen est introuvable. Choisissez son dossier (celui qui contient zen.exe).")
  NoProfile     = @("No Zen profile was found: open Zen once, then close it.", "Aucun profil Zen trouvé : ouvrez Zen une fois, puis fermez-le.")
  ZenRunning    = @("Zen is open on this profile. Close it (every window), then click Install again.", "Zen est ouvert sur ce profil. Fermez-le (toutes les fenêtres), puis cliquez de nouveau sur Installer.")
  NeedConsent   = @("Zen Fluent Enhanced runs scripts: check the box that allows them, or uncheck Zen Fluent Enhanced.", "Zen Fluent Enhanced exécute des scripts : cochez la case qui les autorise, ou décochez Zen Fluent Enhanced.")
  Downloading   = @("Downloading {0}…", "Téléchargement de {0}…")
  Bootloader    = @("Installing Sine's bootloader in {0}", "Installation du chargeur de Sine dans {0}")
  Elevate       = @("Zen's folder is protected: Windows asks for administrator rights for this step.", "Le dossier de Zen est protégé : Windows demande les droits d'administrateur pour cette étape.")
  Engine        = @("Installing Sine in the profile", "Installation de Sine dans le profil")
  SineKept      = @("Sine is already installed: kept.", "Sine est déjà installé : conservé.")
  Mod           = @("Installing {0}", "Installation de {0}")
  PrefsSet      = @("Setting preferences", "Réglage des préférences")
  Cache         = @("Clearing Zen's startup cache", "Vidage du cache de démarrage de Zen")
  Done          = @("Done. Open Zen: Zen Fluent is in Zen's settings.", "Terminé. Ouvrez Zen : Zen Fluent est dans les paramètres de Zen.")
  Failed        = @("The installation failed: {0}", "L'installation a échoué : {0}")
  Backup        = @("Previous mods.json saved as {0}", "Ancien mods.json enregistré sous {0}")
}
function T([string]$Key) { return $Text[$Key][[int]$French] }

# -------- Finding Zen and its profiles --------
function Find-ZenDirs {
  $candidates = @(
    "$env:ProgramFiles\Zen Browser",
    "$env:ProgramFiles\Zen Twilight",
    "${env:ProgramFiles(x86)}\Zen Browser",
    "$env:LOCALAPPDATA\Zen Browser",
    "$env:LOCALAPPDATA\Programs\Zen Browser"
  )
  foreach ($key in @(
      "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\zen.exe",
      "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\zen.exe")) {
    try {
      $exe = (Get-ItemProperty -LiteralPath $key -ErrorAction Stop)."(default)"
      if ($exe) { $candidates = @((Split-Path $exe -Parent)) + $candidates }
    } catch { }
  }
  $candidates | Where-Object { $_ -and (Test-Path (Join-Path $_ "zen.exe")) } |
    Select-Object -Unique
}

# Zen names a channel's first profile after it ("Default (twilight)"): a
# Twilight profile goes with a Twilight folder, the others with the rest
function Select-ZenDirFor($ZenProfile, [string[]]$Dirs) {
  $twilight = "$($ZenProfile.Name) $($ZenProfile.Folder)" -match "twilight"
  $match = $Dirs | Where-Object { ($_ -match "twilight") -eq $twilight } | Select-Object -First 1
  if ($match) { return $match }
  return ($Dirs | Select-Object -First 1)
}

function Get-ZenProfiles {
  $root = Join-Path $env:APPDATA "zen"
  $ini = Join-Path $root "profiles.ini"
  if (-not (Test-Path $ini)) { return @() }
  $sections = [ordered]@{}
  $current = $null
  foreach ($line in Get-Content -LiteralPath $ini -Encoding UTF8) {
    if ($line -match '^\[(.+)\]$') { $current = $Matches[1]; $sections[$current] = @{}; continue }
    if ($current -and $line -match '^([^=]+)=(.*)$') { $sections[$current][$Matches[1]] = $Matches[2] }
  }
  # What Zen opens: an install's default, else the profile marked Default
  $installDefaults = @($sections.Keys | Where-Object { $_ -like "Install*" } |
      ForEach-Object { $sections[$_]["Default"] })
  $profiles = foreach ($name in $sections.Keys) {
    $s = $sections[$name]
    if ($name -notlike "Profile*" -or -not $s["Path"]) { continue }
    $relative = $s["IsRelative"] -ne "0"
    $path = if ($relative) { Join-Path $root ($s["Path"] -replace "/", "\") } else { $s["Path"] }
    [pscustomobject]@{
      Name      = $s["Name"]
      Path      = $path
      Folder    = Split-Path $path -Leaf
      IsMain    = $s["Default"] -eq "1"
      IsDefault = ($installDefaults -contains $s["Path"]) -or ($s["Default"] -eq "1")
    }
  }
  # The profile Zen opens first, then the other installs' defaults
  @($profiles | Sort-Object -Property @{ Expression = { -not $_.IsMain } }, @{ Expression = { -not $_.IsDefault } }, Name)
}

# Zen holds parent.lock open, unshared, while it uses a profile: another
# profile can be set up while Zen runs
function Test-ProfileInUse([string]$ProfileDir) {
  $lock = Join-Path $ProfileDir "parent.lock"
  if (-not (Test-Path -LiteralPath $lock)) { return $false }
  try {
    $stream = [IO.File]::Open($lock, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::None)
    $stream.Close()
    return $false
  } catch { return $true }
}

function Test-SineInstalled([string]$Zen, [string]$ProfileDir) {
  (Test-Path (Join-Path $Zen "config.js")) -and
    (Test-Path (Join-Path $ProfileDir "chrome\JS\sine.sys.mjs"))
}

# -------- Downloads and files --------
function Initialize-Web {
  # Windows PowerShell 5.1 may still default to TLS 1.0
  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
}

function Get-File([string]$Url, [string]$OutFile) {
  Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing -Headers @{ "User-Agent" = "ZenFluentSetup" }
}

function Get-LatestAsset([string]$RepoName, [string]$Asset) {
  $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$RepoName/releases/latest" -UseBasicParsing -Headers @{ "User-Agent" = "ZenFluentSetup" }
  $item = $release.assets | Where-Object { $_.name -eq $Asset } | Select-Object -First 1
  if (-not $item) { throw "$Asset not found in $RepoName's latest release" }
  $item.browser_download_url
}

function Test-Writable([string]$Dir) {
  try {
    $probe = Join-Path $Dir (".zf-write-test-" + [guid]::NewGuid().ToString("N"))
    [IO.File]::WriteAllText($probe, "")
    Remove-Item -LiteralPath $probe -Force
    return $true
  } catch { return $false }
}

function Write-Utf8([string]$Path, [string]$Content) {
  # No byte order mark: Sine and Firefox read these files as plain UTF-8
  [IO.File]::WriteAllText($Path, $Content, (New-Object Text.UTF8Encoding $false))
}

function Get-SelfCommand {
  # The script file, or the .exe ps2exe built from it
  $exe = (Get-Process -Id $PID).Path
  if ($PSCommandPath) {
    return @{ File = $exe; Args = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$PSCommandPath`"") }
  }
  return @{ File = $exe; Args = @() }
}

# -------- Steps --------
function Install-Bootloader([string]$Zen, [string]$ProfileDir, [string]$Temp, [scriptblock]$Log) {
  & $Log ((T "Downloading") -f "Sine bootloader")
  $program = Join-Path $Temp "program.zip"
  $profileZip = Join-Path $Temp "profile.zip"
  Get-File (Get-LatestAsset $BootloaderRepo "program.zip") $program
  Get-File (Get-LatestAsset $BootloaderRepo "profile.zip") $profileZip
  & $Log ((T "Bootloader") -f $Zen)
  if (Test-Writable $Zen) {
    Expand-Archive -LiteralPath $program -DestinationPath $Zen -Force
  } else {
    & $Log (T "Elevate")
    $self = Get-SelfCommand
    $argList = $self.Args + @("-BootloaderZip", "`"$program`"", "-BootloaderTarget", "`"$Zen`"")
    $process = Start-Process -FilePath $self.File -ArgumentList $argList -Verb RunAs -Wait -PassThru -WindowStyle Hidden
    if ($process.ExitCode -ne 0 -or -not (Test-Path (Join-Path $Zen "config.js"))) {
      throw "the bootloader could not be written to $Zen"
    }
  }
  Expand-Archive -LiteralPath $profileZip -DestinationPath (Join-Path $ProfileDir "chrome") -Force
}

function Install-Engine([string]$ProfileDir, [string]$Temp, [scriptblock]$Log) {
  & $Log ((T "Downloading") -f "Sine $SineTag")
  $engine = Join-Path $Temp "engine.zip"
  Get-File "https://github.com/$SineRepo/releases/download/$SineTag/engine.zip" $engine
  & $Log (T "Engine")
  Expand-Archive -LiteralPath $engine -DestinationPath (Join-Path $ProfileDir "chrome") -Force
}

function Get-ModEntry([string]$ModDir, [string]$Homepage, [hashtable]$Files) {
  # As Sine's syncModData writes it: theme.json, the entry points found in
  # the mod folder, "no-updates": false and enabled
  $theme = Get-Content -LiteralPath (Join-Path $ModDir "theme.json") -Raw -Encoding UTF8 | ConvertFrom-Json
  $entry = [ordered]@{}
  foreach ($p in $theme.PSObject.Properties) { $entry[$p.Name] = $p.Value }
  $entry["homepage"] = $Homepage
  $entry.Remove("origin")
  $entry["style"] = [ordered]@{ chrome = $Files.chrome; content = $Files.content }
  $entry["preferences"] = $Files.preferences
  $entry["no-updates"] = $false
  $entry["enabled"] = $true
  return $entry
}

function Install-Mods([string]$ProfileDir, [bool]$WithEnhanced, [string]$Temp, [scriptblock]$Log) {
  & $Log ((T "Downloading") -f "Zen Fluent ($Ref)")
  $zip = Join-Path $Temp "zen-fluent.zip"
  Get-File "https://codeload.github.com/$Repo/zip/$Ref" $zip
  $extract = Join-Path $Temp "zen-fluent"
  Expand-Archive -LiteralPath $zip -DestinationPath $extract -Force
  $source = Get-ChildItem -LiteralPath $extract -Directory | Select-Object -First 1
  $modsDir = Join-Path $ProfileDir "chrome\sine-mods"
  New-Item -ItemType Directory -Force -Path $modsDir | Out-Null

  $listFile = Join-Path $modsDir "mods.json"
  $list = [ordered]@{}
  if (Test-Path $listFile) {
    $backup = "$listFile.zen-fluent-setup.bak"
    Copy-Item -LiteralPath $listFile -Destination $backup -Force
    & $Log ((T "Backup") -f $backup)
    $raw = Get-Content -LiteralPath $listFile -Raw -Encoding UTF8
    if ($raw -and $raw.Trim()) {
      $parsed = $raw | ConvertFrom-Json
      foreach ($p in $parsed.PSObject.Properties) { $list[$p.Name] = $p.Value }
    }
  }

  $mods = @(
    @{ Id = "Zen-Fluent"; Name = "Zen Fluent"; From = $source.FullName
      Homepage = "https://github.com/$Repo"
      Files = @{ chrome = "core/chrome.css"; content = "core/userContent.css"; preferences = "core/preferences.json" } }
  )
  if ($WithEnhanced) {
    $mods += @{ Id = "Zen-Fluent-Enhanced"; Name = "Zen Fluent Enhanced"
      From = (Join-Path $source.FullName "enhanced")
      Homepage = "https://github.com/$Repo/tree/main/enhanced"
      Files = @{ chrome = "chrome.css"; content = ""; preferences = "preferences.json" } }
  }
  foreach ($mod in $mods) {
    & $Log ((T "Mod") -f $mod.Name)
    $target = Join-Path $modsDir $mod.Id
    # A junction (a development checkout) is unlinked, never emptied
    $item = Get-Item -LiteralPath $target -Force -ErrorAction SilentlyContinue
    if ($item -and $item.LinkType) { $item.Delete() }
    elseif ($item) { Remove-Item -LiteralPath $target -Recurse -Force }
    Copy-Item -LiteralPath $mod.From -Destination $target -Recurse -Force
    $list[$mod.Id] = Get-ModEntry $target $mod.Homepage $mod.Files
  }
  Write-Utf8 $listFile ($list | ConvertTo-Json -Depth 32)
}

function Set-ProfilePrefs([string]$ProfileDir, [hashtable]$Values, [scriptblock]$Log) {
  # prefs.js, not user.js: the user can change them afterwards (user.js
  # would set them back at every start)
  & $Log (T "PrefsSet")
  $file = Join-Path $ProfileDir "prefs.js"
  $lines = @()
  if (Test-Path $file) { $lines = @(Get-Content -LiteralPath $file -Encoding UTF8) }
  foreach ($name in $Values.Keys) {
    $line = "user_pref(`"$name`", $($Values[$name]));"
    $pattern = '^user_pref\("' + [regex]::Escape($name) + '",'
    $index = -1
    for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -match $pattern) { $index = $i; break } }
    if ($index -ge 0) { $lines[$index] = $line } else { $lines += $line }
  }
  Write-Utf8 $file (($lines -join "`n") + "`n")
}

function Clear-StartupCache([string]$ProfileDir, [scriptblock]$Log) {
  & $Log (T "Cache")
  $local = Join-Path $env:LOCALAPPDATA ("zen\Profiles\" + (Split-Path $ProfileDir -Leaf) + "\startupCache")
  foreach ($dir in @($local, (Join-Path $ProfileDir "startupCache"))) {
    if (Test-Path $dir) { Remove-Item -LiteralPath $dir -Recurse -Force }
  }
}

function Invoke-Setup {
  param([string]$Zen, [string]$ProfileDir, [bool]$WithEnhanced, [bool]$Consent, [scriptblock]$Log)
  if (Test-ProfileInUse $ProfileDir) { throw (T "ZenRunning") }
  if ($WithEnhanced -and -not $Consent) { throw (T "NeedConsent") }
  Initialize-Web
  $temp = Join-Path ([IO.Path]::GetTempPath()) ("zen-fluent-setup-" + [guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Path $temp | Out-Null
  try {
    if ($ReinstallSine -or -not (Test-SineInstalled $Zen $ProfileDir)) {
      Install-Bootloader $Zen $ProfileDir $temp $Log
      Install-Engine $ProfileDir $temp $Log
    } else {
      & $Log (T "SineKept")
    }
    Install-Mods $ProfileDir $WithEnhanced $temp $Log
    $values = @{} + $Prefs
    if ($Consent) { $values["sine.allow-unsafe-js"] = "true" }
    Set-ProfilePrefs $ProfileDir $values $Log
    Clear-StartupCache $ProfileDir $Log
    & $Log (T "Done")
  } finally {
    Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
  }
}

# -------- Without a window --------
if ($NoGui) {
  $log = { param($message) Write-Host $message }
  $found = Get-ZenProfiles
  if (-not $ProfilePath) { $ProfilePath = ($found | Select-Object -First 1).Path }
  if (-not $ProfilePath) { Write-Error (T "NoProfile"); exit 1 }
  if (-not $ZenDir) {
    $chosen = $found | Where-Object { $_.Path -eq $ProfilePath } | Select-Object -First 1
    if (-not $chosen) { $chosen = [pscustomobject]@{ Name = ""; Folder = (Split-Path $ProfilePath -Leaf) } }
    $ZenDir = Select-ZenDirFor $chosen @(Find-ZenDirs)
  }
  if (-not $ZenDir) { Write-Error (T "NoZen"); exit 1 }
  try {
    Invoke-Setup -Zen $ZenDir -ProfileDir $ProfilePath -WithEnhanced $Enhanced.IsPresent -Consent $AllowUnsafeJs.IsPresent -Log $log
  } catch {
    Write-Error ((T "Failed") -f $_.Exception.Message)
    exit 1
  }
  exit 0
}

# -------- The window --------
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
[Windows.Forms.Application]::EnableVisualStyles()

$form = New-Object Windows.Forms.Form
$form.Text = T "Title"
$form.ClientSize = New-Object Drawing.Size(560, 520)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.Font = New-Object Drawing.Font("Segoe UI", 9.5)
$form.BackColor = [Drawing.Color]::FromArgb(243, 243, 243)

function Add-Label([string]$Caption, [int]$Y, [bool]$Bold = $false) {
  $label = New-Object Windows.Forms.Label
  $label.Text = $Caption
  $label.Location = New-Object Drawing.Point(20, $Y)
  $label.AutoSize = $true
  if ($Bold) { $label.Font = New-Object Drawing.Font("Segoe UI Semibold", 10) }
  $form.Controls.Add($label)
  return $label
}

$header = Add-Label (T "Title") 16
$header.Font = New-Object Drawing.Font("Segoe UI", 16, [Drawing.FontStyle]::Bold)

Add-Label (T "ZenFolder") 64 $true | Out-Null
$zenBox = New-Object Windows.Forms.ComboBox
$zenBox.Location = New-Object Drawing.Point(20, 88)
$zenBox.Size = New-Object Drawing.Size(420, 26)
$zenBox.DropDownStyle = "DropDown"
foreach ($dir in Find-ZenDirs) { [void]$zenBox.Items.Add($dir) }
if ($ZenDir) { $zenBox.Text = $ZenDir } elseif ($zenBox.Items.Count) { $zenBox.SelectedIndex = 0 }
$form.Controls.Add($zenBox)
$browse = New-Object Windows.Forms.Button
$browse.Text = T "Browse"
$browse.Location = New-Object Drawing.Point(450, 87)
$browse.Size = New-Object Drawing.Size(90, 28)
$browse.Add_Click({
    $dialog = New-Object Windows.Forms.FolderBrowserDialog
    if ($dialog.ShowDialog() -eq "OK") { $zenBox.Text = $dialog.SelectedPath }
  })
$form.Controls.Add($browse)

Add-Label (T "Profile") 128 $true | Out-Null
$profiles = @(Get-ZenProfiles)
$profileBox = New-Object Windows.Forms.ComboBox
$profileBox.Location = New-Object Drawing.Point(20, 152)
$profileBox.Size = New-Object Drawing.Size(520, 26)
$profileBox.DropDownStyle = "DropDownList"
foreach ($p in $profiles) { [void]$profileBox.Items.Add("$($p.Name)  ($($p.Folder))") }
if ($profileBox.Items.Count) { $profileBox.SelectedIndex = 0 }
$form.Controls.Add($profileBox)

Add-Label (T "Components") 194 $true | Out-Null
function Add-Check([string]$Caption, [int]$Y, [bool]$Checked, [bool]$Enabled = $true) {
  $box = New-Object Windows.Forms.CheckBox
  $box.Text = $Caption
  $box.Location = New-Object Drawing.Point(24, $Y)
  $box.Size = New-Object Drawing.Size(516, 24)
  $box.Checked = $Checked
  $box.Enabled = $Enabled
  $form.Controls.Add($box)
  return $box
}
$sineCheck = Add-Check (T "Sine") 218 $true $false
$fluentCheck = Add-Check (T "Fluent") 244 $true $false
$enhancedCheck = Add-Check (T "EnhancedLabel") 270 $true
$consentCheck = Add-Check (T "UnsafeJs") 300 $false
$consentCheck.Size = New-Object Drawing.Size(516, 40)

function Update-SineState {
  $index = $profileBox.SelectedIndex
  if ($index -lt 0 -or -not $zenBox.Text) { return }
  $there = Test-SineInstalled $zenBox.Text $profiles[$index].Path
  if ($there) { $sineCheck.Text = T "SineThere" } else { $sineCheck.Text = T "Sine" }
}
$zenDirs = @(Find-ZenDirs)
$profileBox.Add_SelectedIndexChanged({
    if (-not $ZenDir -and $profileBox.SelectedIndex -ge 0 -and $zenDirs.Count) {
      $zenBox.Text = Select-ZenDirFor $profiles[$profileBox.SelectedIndex] $zenDirs
    }
    Update-SineState
  })
if (-not $ZenDir -and $profiles.Count -and $zenDirs.Count) {
  $zenBox.Text = Select-ZenDirFor $profiles[0] $zenDirs
}
$zenBox.Add_TextChanged({ Update-SineState })
$enhancedCheck.Add_CheckedChanged({ $consentCheck.Enabled = $enhancedCheck.Checked })
Update-SineState

$logBox = New-Object Windows.Forms.TextBox
$logBox.Location = New-Object Drawing.Point(20, 350)
$logBox.Size = New-Object Drawing.Size(520, 110)
$logBox.Multiline = $true
$logBox.ReadOnly = $true
$logBox.ScrollBars = "Vertical"
$logBox.BackColor = [Drawing.Color]::White
$form.Controls.Add($logBox)

$installButton = New-Object Windows.Forms.Button
$installButton.Text = T "Install"
$installButton.Location = New-Object Drawing.Point(340, 474)
$installButton.Size = New-Object Drawing.Size(96, 32)
$installButton.BackColor = [Drawing.Color]::FromArgb(0, 95, 184)
$installButton.ForeColor = [Drawing.Color]::White
$installButton.FlatStyle = "Flat"
$form.Controls.Add($installButton)
$form.AcceptButton = $installButton

$closeButton = New-Object Windows.Forms.Button
$closeButton.Text = T "Close"
$closeButton.Location = New-Object Drawing.Point(444, 474)
$closeButton.Size = New-Object Drawing.Size(96, 32)
$closeButton.Add_Click({ $form.Close() })
$form.Controls.Add($closeButton)

$log = {
  param($message)
  $logBox.AppendText($message + [Environment]::NewLine)
  [Windows.Forms.Application]::DoEvents()
}

$installButton.Add_Click({
    $logBox.Clear()
    if (-not $zenBox.Text -or -not (Test-Path (Join-Path $zenBox.Text "zen.exe"))) { & $log (T "NoZen"); return }
    if ($profileBox.SelectedIndex -lt 0) { & $log (T "NoProfile"); return }
    $installButton.Enabled = $false
    $form.UseWaitCursor = $true
    try {
      Invoke-Setup -Zen $zenBox.Text -ProfileDir $profiles[$profileBox.SelectedIndex].Path `
        -WithEnhanced $enhancedCheck.Checked -Consent $consentCheck.Checked -Log $log
      Update-SineState
    } catch {
      & $log ((T "Failed") -f $_.Exception.Message)
    } finally {
      $installButton.Enabled = $true
      $form.UseWaitCursor = $false
    }
  })

if (-not $profiles.Count) { & $log (T "NoProfile") }
if (-not $zenBox.Items.Count -and -not $ZenDir) { & $log (T "NoZen") }
[void]$form.ShowDialog()
