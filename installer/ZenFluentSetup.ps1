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
.PARAMETER Edition
  The Zen to set up: "Zen Browser" or "Zen Twilight" (a part of the name
  is enough). Default: Zen Browser.
.PARAMETER ZenDir
  Zen's install folder (the one with zen.exe), instead of -Edition.
.PARAMETER ProfilePath
  The profile folder. Default: the one that edition opens by default.
.PARAMETER Enhanced
  Also install Zen Fluent Enhanced (needs -AllowUnsafeJs).
.PARAMETER AllowUnsafeJs
  Consent to set sine.allow-unsafe-js.
.PARAMETER Ref
  Branch or tag of alexisdechiara/zen-fluent to install. Default: main.
.PARAMETER ReinstallSine
  Install Sine's bootloader and engine even when Sine is there.

.PARAMETER Uninstall
  With -NoGui: take Zen Fluent and Zen Fluent Enhanced out of the profile
  (their folders and mods.json entries, the file saved first).
.PARAMETER RemoveSettings
  With -Uninstall: also remove every zen-fluent.* preference.
.PARAMETER RemoveSine
  With -Uninstall: also remove Sine and every mod it installed (the
  profile's chrome\JS, utils and sine-mods, and Sine's loader in Zen's
  folder when it is Sine's).

.EXAMPLE
  .\ZenFluentSetup.ps1
.EXAMPLE
  .\ZenFluentSetup.ps1 -NoGui -Enhanced -AllowUnsafeJs
#>
[CmdletBinding()]
param(
  [switch]$NoGui,
  [string]$Edition,
  [string]$ZenDir,
  [string]$ProfilePath,
  [switch]$Enhanced,
  [switch]$AllowUnsafeJs,
  [string]$Ref = "main",
  [switch]$ReinstallSine,
  [switch]$Uninstall,
  [switch]$RemoveSettings,
  [switch]$RemoveSine,
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

# -------- Elevated step: Sine's loader out of Zen's folder --------
if ($BootloaderTarget -and $Uninstall -and -not $BootloaderZip) {
  $config = Join-Path $BootloaderTarget "config.js"
  if ((Test-Path $config) -and ((Get-Content -LiteralPath $config -Raw) -match "sine\.sys\.mjs")) {
    Remove-Item -LiteralPath $config -Force
    Remove-Item -LiteralPath (Join-Path $BootloaderTarget "defaults\pref\config-prefs.js") -Force -ErrorAction SilentlyContinue
  }
  exit 0
}

# -------- Elevated step: the bootloader into Zen's folder --------
if ($BootloaderZip -and $BootloaderTarget) {
  Expand-Archive -LiteralPath $BootloaderZip -DestinationPath $BootloaderTarget -Force
  exit 0
}

# -------- Text, in French when Windows is --------
$French = (Get-UICulture).TwoLetterISOLanguageName -eq "fr"
$Text = @{
  Title         = @("Zen Fluent setup", "Installation de Zen Fluent")
  Edition       = @("Zen version", "Version de Zen")
  OtherFolder   = @("Other folder…", "Autre dossier…")
  TooOld        = @("Zen Fluent needs Zen 1.23 or later: update {0} first.", "Zen Fluent nécessite Zen 1.23 ou plus récent : mettez d'abord {0} à jour.")
  OpensDefault  = @("opened by default", "ouvert par défaut")
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
  NoProfile     = @("This version of Zen has no profile yet: open it once, then close it.", "Cette version de Zen n'a pas encore de profil : ouvrez-la une fois, puis fermez-la.")
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
  Removing      = @("Removing {0}", "Suppression de {0}")
  RemovingSettings = @("Removing Zen Fluent's settings", "Suppression des réglages de Zen Fluent")
  RemovingLoader = @("Removing Sine's loader from {0}", "Suppression du chargeur de Sine de {0}")
  Uninstalled   = @("Done. Zen Fluent is no longer in this profile.", "Terminé. Zen Fluent n'est plus dans ce profil.")
  Done          = @("Done. Open Zen: Zen Fluent is in Zen's settings.", "Terminé. Ouvrez Zen : Zen Fluent est dans les paramètres de Zen.")
  Failed        = @("The installation failed: {0}", "L'installation a échoué : {0}")
  Backup        = @("Previous mods.json saved as {0}", "Ancien mods.json enregistré sous {0}")
  GitHubDown    = @("{0} does not answer (GitHub may be down): try again in a few minutes.", "{0} ne répond pas (GitHub est peut-être en panne) : réessayez dans quelques minutes.")
  Retry         = @("GitHub did not answer: trying again in {0} s…", "GitHub ne répond pas : nouvel essai dans {0} s…")
}
function T([string]$Key) { return $Text[$Key][[int]$French] }

# -------- Finding Zen and its profiles --------
# Zen's installer registers each edition under Software\Mozilla\<name>
# (Zen Browser, Zen Twilight), with its version and folder; Firefox's
# TaskBarIDs maps that folder to the install's id, the one profiles.ini
# names in [Install<id>] for the profile that edition opens by default.
function Get-ZenEditions {
  $ids = @{}
  foreach ($root in @("HKCU:\Software\Mozilla\Firefox\TaskBarIDs", "HKLM:\SOFTWARE\Mozilla\Firefox\TaskBarIDs")) {
    try {
      $item = Get-ItemProperty -LiteralPath $root -ErrorAction Stop
      foreach ($p in $item.PSObject.Properties) {
        if ($p.Name -notlike "PS*") { $ids[$p.Name.TrimEnd("\")] = [string]$p.Value }
      }
    } catch { }
  }
  $editions = [ordered]@{}
  foreach ($root in @("HKCU:\Software\Mozilla", "HKLM:\SOFTWARE\Mozilla", "HKLM:\SOFTWARE\WOW6432Node\Mozilla")) {
    foreach ($key in @(Get-ChildItem -LiteralPath $root -ErrorAction SilentlyContinue)) {
      # "Zen Browser", "Zen Twilight"; not "Zen Browser 1.24.1b" (one per version)
      if ($key.PSChildName -notmatch '^Zen( [A-Za-z]+)?$') { continue }
      try {
        $current = (Get-ItemProperty -LiteralPath $key.PSPath -ErrorAction Stop).CurrentVersion
        $main = Get-ItemProperty -LiteralPath (Join-Path $key.PSPath "$current\Main") -ErrorAction Stop
        $dir = ([string]$main."Install Directory").TrimEnd("\")
      } catch { continue }
      if (-not $dir -or -not (Test-Path (Join-Path $dir "zen.exe")) -or $editions.Contains($dir)) { continue }
      $editions[$dir] = [pscustomobject]@{
        Name    = $key.PSChildName
        Version = ($current -replace '\s*\(.*$', '')
        Dir     = $dir
        Id      = $ids[$dir]
      }
    }
  }
  # Folders the registry does not know (a portable copy)
  foreach ($dir in @("$env:ProgramFiles\Zen Browser", "$env:ProgramFiles\Zen Twilight", "$env:LOCALAPPDATA\Zen Browser")) {
    if ((Test-Path (Join-Path $dir "zen.exe")) -and -not $editions.Contains($dir)) {
      $editions[$dir] = [pscustomobject]@{ Name = (Split-Path $dir -Leaf); Version = ""; Dir = $dir; Id = $ids[$dir] }
    }
  }
  # Zen Browser before Twilight
  @($editions.Values | Sort-Object -Property @{ Expression = { $_.Name -match "twilight" } }, Name)
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
  # [Install<id>] Default=<path>: the profile each edition opens
  $owners = @{}
  foreach ($name in $sections.Keys) {
    if ($name -match '^Install(.+)$' -and $sections[$name]["Default"]) {
      $path = $sections[$name]["Default"]
      if (-not $owners.ContainsKey($path)) { $owners[$path] = @() }
      $owners[$path] += $Matches[1]
    }
  }
  foreach ($name in $sections.Keys) {
    $s = $sections[$name]
    if ($name -notlike "Profile*" -or -not $s["Path"]) { continue }
    $relative = $s["IsRelative"] -ne "0"
    $path = if ($relative) { Join-Path $root ($s["Path"] -replace "/", "\") } else { $s["Path"] }
    $ownedBy = @()
    if ($owners.ContainsKey($s["Path"])) { $ownedBy = $owners[$s["Path"]] }
    [pscustomobject]@{
      Name    = $s["Name"]
      Path    = $path
      Folder  = Split-Path $path -Leaf
      IsMain  = $s["Default"] -eq "1"
      OwnedBy = $ownedBy
    }
  }
}

# An edition's profiles: the one it opens by default first, then those no
# other edition opens by default (any profile can be opened by any Zen)
function Get-EditionProfiles($Edition, $AllProfiles) {
  $mine = @()
  $free = @()
  foreach ($p in $AllProfiles) {
    if ($Edition.Id -and $p.OwnedBy -contains $Edition.Id) { $mine += $p }
    elseif (-not $p.OwnedBy.Count -or -not $Edition.Id) { $free += $p }
  }
  @($mine) + @($free | Sort-Object -Property @{ Expression = { -not $_.IsMain } }, Name)
}

# Zen Fluent needs Zen 1.23 or later
function Test-ZenTooOld($Edition) {
  if ($Edition.Version -match '^(\d+)\.(\d+)') {
    return ([int]$Matches[1] -lt 1) -or ([int]$Matches[1] -eq 1 -and [int]$Matches[2] -lt 23)
  }
  return $false
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

# GitHub sometimes answers 5xx or times out: each download is tried five
# times over about a minute; a 404 fails at once, and a GitHub outage ends
# with a message saying so
$script:RetryLog = $null
function Get-File([string]$Url, [string]$OutFile) {
  $waits = @(3, 8, 15, 30)
  for ($attempt = 0; ; $attempt++) {
    try {
      Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing -TimeoutSec 60 -Headers @{ "User-Agent" = "ZenFluentSetup" }
      return
    } catch {
      $status = $null
      try { $status = [int]$_.Exception.Response.StatusCode } catch { }
      if ($status -and $status -ge 400 -and $status -lt 500) { throw }
      if ($attempt -ge $waits.Count) { throw ((T "GitHubDown") -f ([uri]$Url).Host) }
      if ($script:RetryLog) { & $script:RetryLog ((T "Retry") -f $waits[$attempt]) }
      Start-Sleep -Seconds $waits[$attempt]
    }
  }
}

# The latest release's file, without GitHub's API (rate limits, timeouts):
# GitHub redirects releases/latest/download to it
function Get-LatestAsset([string]$RepoName, [string]$Asset) {
  "https://github.com/$RepoName/releases/latest/download/$Asset"
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

function Remove-Folder([string]$Dir, [scriptblock]$Log) {
  $item = Get-Item -LiteralPath $Dir -Force -ErrorAction SilentlyContinue
  if (-not $item) { return }
  & $Log ((T "Removing") -f $Dir)
  # A junction (a development checkout) is unlinked, never emptied
  if ($item.LinkType) { $item.Delete() } else { Remove-Item -LiteralPath $Dir -Recurse -Force }
}

function Invoke-Uninstall {
  param([string]$Zen, [string]$ProfileDir, [bool]$Settings, [bool]$Sine, [scriptblock]$Log)
  if (Test-ProfileInUse $ProfileDir) { throw (T "ZenRunning") }
  $chrome = Join-Path $ProfileDir "chrome"
  $modsDir = Join-Path $chrome "sine-mods"
  if ($Sine) {
    foreach ($name in @("JS", "utils", "sine-mods")) { Remove-Folder (Join-Path $chrome $name) $Log }
    $config = Join-Path $Zen "config.js"
    if ((Test-Path $config) -and ((Get-Content -LiteralPath $config -Raw) -match "sine\.sys\.mjs")) {
      & $Log ((T "RemovingLoader") -f $Zen)
      if (Test-Writable $Zen) {
        Remove-Item -LiteralPath $config -Force
        Remove-Item -LiteralPath (Join-Path $Zen "defaults\pref\config-prefs.js") -Force -ErrorAction SilentlyContinue
      } else {
        & $Log (T "Elevate")
        $self = Get-SelfCommand
        $argList = $self.Args + @("-Uninstall", "-BootloaderTarget", "`"$Zen`"")
        $process = Start-Process -FilePath $self.File -ArgumentList $argList -Verb RunAs -Wait -PassThru -WindowStyle Hidden
        if (Test-Path $config) { throw "Sine's loader could not be removed from $Zen" }
      }
    }
  } else {
    foreach ($id in @("Zen-Fluent", "Zen-Fluent-Enhanced")) { Remove-Folder (Join-Path $modsDir $id) $Log }
    $listFile = Join-Path $modsDir "mods.json"
    if (Test-Path $listFile) {
      $backup = "$listFile.zen-fluent-setup.bak"
      Copy-Item -LiteralPath $listFile -Destination $backup -Force
      & $Log ((T "Backup") -f $backup)
      $raw = Get-Content -LiteralPath $listFile -Raw -Encoding UTF8
      if ($raw -and $raw.Trim()) {
        $list = [ordered]@{}
        foreach ($p in ($raw | ConvertFrom-Json).PSObject.Properties) {
          if ($p.Name -notin @("Zen-Fluent", "Zen-Fluent-Enhanced")) { $list[$p.Name] = $p.Value }
        }
        Write-Utf8 $listFile ($list | ConvertTo-Json -Depth 32)
      }
    }
  }
  if ($Settings) {
    & $Log (T "RemovingSettings")
    $prefsFile = Join-Path $ProfileDir "prefs.js"
    if (Test-Path $prefsFile) {
      $kept = @(Get-Content -LiteralPath $prefsFile -Encoding UTF8 | Where-Object { $_ -notlike 'user_pref("zen-fluent.*' })
      Write-Utf8 $prefsFile (($kept -join "`n") + "`n")
    }
  }
  Clear-StartupCache $ProfileDir $Log
  & $Log (T "Uninstalled")
}

function Invoke-Setup {
  param([string]$Zen, [string]$ProfileDir, [bool]$WithEnhanced, [bool]$Consent, [scriptblock]$Log)
  if (Test-ProfileInUse $ProfileDir) { throw (T "ZenRunning") }
  if ($WithEnhanced -and -not $Consent) { throw (T "NeedConsent") }
  Initialize-Web
  $script:RetryLog = $Log
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
  $editions = @(Get-ZenEditions)
  if ($ZenDir) {
    $chosen = $editions | Where-Object { $_.Dir -eq $ZenDir.TrimEnd("\") } | Select-Object -First 1
    if (-not $chosen) { $chosen = [pscustomobject]@{ Name = (Split-Path $ZenDir -Leaf); Version = ""; Dir = $ZenDir; Id = $null } }
  } elseif ($Edition) {
    $chosen = $editions | Where-Object { $_.Name -like "*$Edition*" } | Select-Object -First 1
  } else {
    $chosen = $editions | Select-Object -First 1
  }
  if (-not $chosen) { Write-Error (T "NoZen"); exit 1 }
  if (Test-ZenTooOld $chosen) { Write-Warning ((T "TooOld") -f "$($chosen.Name) $($chosen.Version)") }
  if (-not $ProfilePath) { $ProfilePath = (Get-EditionProfiles $chosen @(Get-ZenProfiles) | Select-Object -First 1).Path }
  if (-not $ProfilePath) { Write-Error (T "NoProfile"); exit 1 }
  try {
    if ($Uninstall) {
      Invoke-Uninstall -Zen $chosen.Dir -ProfileDir $ProfilePath -Settings $RemoveSettings.IsPresent -Sine $RemoveSine.IsPresent -Log $log
    } else {
      Invoke-Setup -Zen $chosen.Dir -ProfileDir $ProfilePath -WithEnhanced $Enhanced.IsPresent -Consent $AllowUnsafeJs.IsPresent -Log $log
    }
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
$form.ClientSize = New-Object Drawing.Size(560, 554)
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

Add-Label (T "Edition") 64 $true | Out-Null
$editions = [System.Collections.ArrayList]@(Get-ZenEditions)
$editionBox = New-Object Windows.Forms.ComboBox
$editionBox.Location = New-Object Drawing.Point(20, 88)
$editionBox.Size = New-Object Drawing.Size(390, 26)
$editionBox.DropDownStyle = "DropDownList"
$form.Controls.Add($editionBox)
$browse = New-Object Windows.Forms.Button
$browse.Text = T "OtherFolder"
$browse.Location = New-Object Drawing.Point(420, 87)
$browse.Size = New-Object Drawing.Size(120, 28)
$form.Controls.Add($browse)
$dirLabel = New-Object Windows.Forms.Label
$dirLabel.Location = New-Object Drawing.Point(20, 118)
$dirLabel.Size = New-Object Drawing.Size(520, 18)
$dirLabel.ForeColor = [Drawing.Color]::FromArgb(96, 96, 96)
$form.Controls.Add($dirLabel)
$warning = New-Object Windows.Forms.Label
$warning.Location = New-Object Drawing.Point(20, 138)
$warning.Size = New-Object Drawing.Size(520, 18)
$warning.ForeColor = [Drawing.Color]::FromArgb(157, 93, 0)
$form.Controls.Add($warning)

Add-Label (T "Profile") 162 $true | Out-Null
$allProfiles = @(Get-ZenProfiles)
$profiles = @()
$profileBox = New-Object Windows.Forms.ComboBox
$profileBox.Location = New-Object Drawing.Point(20, 186)
$profileBox.Size = New-Object Drawing.Size(520, 26)
$profileBox.DropDownStyle = "DropDownList"
$form.Controls.Add($profileBox)

function Get-SelectedEdition {
  if ($editionBox.SelectedIndex -lt 0) { return $null }
  return $editions[$editionBox.SelectedIndex]
}

function Update-Editions([int]$Select = 0) {
  $editionBox.Items.Clear()
  foreach ($e in $editions) {
    $label = if ($e.Version) { "$($e.Name) $($e.Version)" } else { $e.Name }
    [void]$editionBox.Items.Add($label)
  }
  if ($editionBox.Items.Count) { $editionBox.SelectedIndex = [Math]::Min($Select, $editionBox.Items.Count - 1) }
}

# The chosen Zen's profiles, the one it opens by default first
function Update-Profiles {
  $edition = Get-SelectedEdition
  $profileBox.Items.Clear()
  $script:profiles = @()
  if (-not $edition) { $dirLabel.Text = ""; $warning.Text = ""; return }
  $dirLabel.Text = $edition.Dir
  $warning.Text = if (Test-ZenTooOld $edition) { (T "TooOld") -f "$($edition.Name) $($edition.Version)" } else { "" }
  $script:profiles = @(Get-EditionProfiles $edition $allProfiles)
  foreach ($p in $script:profiles) {
    $label = "$($p.Name)  ($($p.Folder))"
    if ($edition.Id -and $p.OwnedBy -contains $edition.Id) { $label += "  — " + (T "OpensDefault") }
    [void]$profileBox.Items.Add($label)
  }
  if ($profileBox.Items.Count) { $profileBox.SelectedIndex = 0 }
}

$browse.Add_Click({
    $dialog = New-Object Windows.Forms.FolderBrowserDialog
    if ($dialog.ShowDialog() -ne "OK") { return }
    $dir = $dialog.SelectedPath.TrimEnd("\")
    if (-not (Test-Path (Join-Path $dir "zen.exe"))) { & $log (T "NoZen"); return }
    $known = -1
    for ($i = 0; $i -lt $editions.Count; $i++) { if ($editions[$i].Dir -eq $dir) { $known = $i } }
    if ($known -lt 0) {
      [void]$editions.Add([pscustomobject]@{ Name = (Split-Path $dir -Leaf); Version = ""; Dir = $dir; Id = $null })
      $known = $editions.Count - 1
    }
    Update-Editions $known
  })

Add-Label (T "Components") 228 $true | Out-Null
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
$sineCheck = Add-Check (T "Sine") 252 $true $false
$fluentCheck = Add-Check (T "Fluent") 278 $true $false
$enhancedCheck = Add-Check (T "EnhancedLabel") 304 $true
$consentCheck = Add-Check (T "UnsafeJs") 334 $false
$consentCheck.Size = New-Object Drawing.Size(516, 40)

function Update-SineState {
  $edition = Get-SelectedEdition
  $index = $profileBox.SelectedIndex
  if (-not $edition -or $index -lt 0) { return }
  $there = Test-SineInstalled $edition.Dir $script:profiles[$index].Path
  if ($there) { $sineCheck.Text = T "SineThere" } else { $sineCheck.Text = T "Sine" }
}
$editionBox.Add_SelectedIndexChanged({ Update-Profiles; Update-SineState })
$profileBox.Add_SelectedIndexChanged({ Update-SineState })
$preferred = 0
if ($Edition) {
  for ($i = $editions.Count - 1; $i -ge 0; $i--) { if ($editions[$i].Name -like "*$Edition*") { $preferred = $i } }
}
Update-Editions $preferred
$enhancedCheck.Add_CheckedChanged({ $consentCheck.Enabled = $enhancedCheck.Checked })
Update-SineState

$logBox = New-Object Windows.Forms.TextBox
$logBox.Location = New-Object Drawing.Point(20, 384)
$logBox.Size = New-Object Drawing.Size(520, 110)
$logBox.Multiline = $true
$logBox.ReadOnly = $true
$logBox.ScrollBars = "Vertical"
$logBox.BackColor = [Drawing.Color]::White
$form.Controls.Add($logBox)

$installButton = New-Object Windows.Forms.Button
$installButton.Text = T "Install"
$installButton.Location = New-Object Drawing.Point(340, 508)
$installButton.Size = New-Object Drawing.Size(96, 32)
$installButton.BackColor = [Drawing.Color]::FromArgb(0, 95, 184)
$installButton.ForeColor = [Drawing.Color]::White
$installButton.FlatStyle = "Flat"
$form.Controls.Add($installButton)
$form.AcceptButton = $installButton

$closeButton = New-Object Windows.Forms.Button
$closeButton.Text = T "Close"
$closeButton.Location = New-Object Drawing.Point(444, 508)
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
    $edition = Get-SelectedEdition
    if (-not $edition) { & $log (T "NoZen"); return }
    if ($profileBox.SelectedIndex -lt 0) { & $log (T "NoProfile"); return }
    $installButton.Enabled = $false
    $form.UseWaitCursor = $true
    try {
      Invoke-Setup -Zen $edition.Dir -ProfileDir $script:profiles[$profileBox.SelectedIndex].Path `
        -WithEnhanced $enhancedCheck.Checked -Consent $consentCheck.Checked -Log $log
      Update-SineState
    } catch {
      & $log ((T "Failed") -f $_.Exception.Message)
    } finally {
      $installButton.Enabled = $true
      $form.UseWaitCursor = $false
    }
  })

if (-not $editions.Count) { & $log (T "NoZen") }
elseif (-not $script:profiles.Count) { & $log (T "NoProfile") }
[void]$form.ShowDialog()
