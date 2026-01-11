# Azure Update Script (Git SHA image tags)
# Builds & pushes Docker images with tag = current git commit SHA, then updates Azure Container App.
# Intended for Azure for Students where ACR Tasks may be restricted.

param(
  [string]$ResourceGroup,
  [string]$ContainerAppName,
  [string]$MigrateJobName,
  [string]$AcrName,
  [string]$Tag,
  [switch]$SkipMigrations,
  [switch]$AlsoTagLatest
)

$ErrorActionPreference = "Stop"

function Assert-LastExitCode {
  param([Parameter(Mandatory = $true)][string]$StepName)
  if ($LASTEXITCODE -ne 0) {
    throw "$StepName failed (exit code $LASTEXITCODE)."
  }
}

function Ensure-DockerRunning {
  try {
    docker info | Out-Null
  } catch {
    throw "Docker is not running. Start Docker Desktop (Linux containers) and retry."
  }
}

function Ensure-AzLoggedIn {
  try {
    az account show -o none 2>$null
    if ($LASTEXITCODE -ne 0) { throw "az account show failed" }
  } catch {
    throw @"
Azure CLI is not logged in (or token cache is broken).

Try:
  az logout
  az cache purge
  az login --use-device-code

Then verify:
  az account show
"@
  }
}

function Try-ReadDeployOutput {
  $path = Join-Path -Path $PSScriptRoot -ChildPath "deploy-output.json"
  if (-not (Test-Path $path)) {
    $path = Join-Path -Path (Get-Location) -ChildPath "deploy-output.json"
  }

  if (Test-Path $path) {
    try {
      return (Get-Content -Raw -Path $path | ConvertFrom-Json)
    } catch {
      return $null
    }
  }

  return $null
}

function Get-GitShortSha {
  try {
    $sha = (git rev-parse --short HEAD).Trim()
    if (-not [string]::IsNullOrWhiteSpace($sha)) { return $sha }
  } catch { }
  throw "Unable to determine git commit SHA. Ensure this folder is a git repo and git is installed."
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "  GAP IS-WA Azure Update (Git SHA tags)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Auto-fill from deploy-output.json if present
$deploy = Try-ReadDeployOutput
if ($deploy) {
  if (-not $ResourceGroup) { $ResourceGroup = $deploy.resourceGroup }
  if (-not $ContainerAppName) { $ContainerAppName = $deploy.containerAppName }
  if (-not $MigrateJobName) { $MigrateJobName = $deploy.migrateJobName }
  if (-not $AcrName) { $AcrName = $deploy.acrName }
}

if (-not $ResourceGroup) { throw "Missing -ResourceGroup (or provide deploy-output.json)." }
if (-not $ContainerAppName) { throw "Missing -ContainerAppName (or provide deploy-output.json)." }
if (-not $MigrateJobName) { throw "Missing -MigrateJobName (or provide deploy-output.json)." }
if (-not $AcrName) { throw "Missing -AcrName (or provide deploy-output.json)." }

if (-not $Tag) { $Tag = Get-GitShortSha }

Ensure-AzLoggedIn

$acrLoginServer = (az acr show -n $AcrName --query loginServer -o tsv 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($acrLoginServer)) {
  throw @"
Unable to resolve ACR login server for '$AcrName'.

If you saw "Decryption failed: [WinError 13]" from Azure CLI, your local token cache likely broke.

Fix (PowerShell):
  az logout
  az cache purge
  Remove-Item -Recurse -Force "$env:USERPROFILE\.azure\msal_token_cache*" -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force "$env:USERPROFILE\.azure\msal_http_cache*" -ErrorAction SilentlyContinue
  az login --use-device-code

Then rerun this script.
"@
}

$acrLoginServer = $acrLoginServer.Trim()

Write-Host "Using:" -ForegroundColor Cyan
Write-Host "  Resource Group   : $ResourceGroup" -ForegroundColor Gray
Write-Host "  Container App    : $ContainerAppName" -ForegroundColor Gray
Write-Host "  Migrate Job      : $MigrateJobName" -ForegroundColor Gray
Write-Host "  ACR              : $AcrName ($acrLoginServer)" -ForegroundColor Gray
Write-Host "  Image Tag        : $Tag" -ForegroundColor Gray
Write-Host "  AlsoTagLatest    : $AlsoTagLatest" -ForegroundColor Gray
Write-Host "  SkipMigrations   : $SkipMigrations" -ForegroundColor Gray
Write-Host ""

Ensure-DockerRunning

Write-Host "Logging into ACR..." -ForegroundColor Yellow
az acr login --name $AcrName | Out-Null
Assert-LastExitCode -StepName "az acr login"

# Build & push app image
$appImageSha = "$acrLoginServer/gap-is-wa:$Tag"
Write-Host "Building app image: $appImageSha" -ForegroundColor Yellow
docker build --platform linux/amd64 -t $appImageSha .
Assert-LastExitCode -StepName "docker build (app)"

Write-Host "Pushing app image: $appImageSha" -ForegroundColor Yellow
docker push $appImageSha
Assert-LastExitCode -StepName "docker push (app)"

if ($AlsoTagLatest) {
  $appImageLatest = "$acrLoginServer/gap-is-wa:latest"
  Write-Host "Tagging/pushing app latest: $appImageLatest" -ForegroundColor Yellow
  docker tag $appImageSha $appImageLatest
  Assert-LastExitCode -StepName "docker tag (app latest)"
  docker push $appImageLatest
  Assert-LastExitCode -StepName "docker push (app latest)"
}

# Build & push migrate image
$migrateImageSha = "$acrLoginServer/gap-is-wa-migrate:$Tag"
Write-Host "Building migrate image: $migrateImageSha" -ForegroundColor Yellow
docker build --platform linux/amd64 -f Dockerfile.migrate -t $migrateImageSha .
Assert-LastExitCode -StepName "docker build (migrate)"

Write-Host "Pushing migrate image: $migrateImageSha" -ForegroundColor Yellow
docker push $migrateImageSha
Assert-LastExitCode -StepName "docker push (migrate)"

if ($AlsoTagLatest) {
  $migrateImageLatest = "$acrLoginServer/gap-is-wa-migrate:latest"
  Write-Host "Tagging/pushing migrate latest: $migrateImageLatest" -ForegroundColor Yellow
  docker tag $migrateImageSha $migrateImageLatest
  Assert-LastExitCode -StepName "docker tag (migrate latest)"
  docker push $migrateImageLatest
  Assert-LastExitCode -StepName "docker push (migrate latest)"
}

Write-Host "Updating Container App image..." -ForegroundColor Yellow
az containerapp update -n $ContainerAppName -g $ResourceGroup --image $appImageSha | Out-Null

Write-Host "Updating migration job image..." -ForegroundColor Yellow
az containerapp job update -n $MigrateJobName -g $ResourceGroup --image $migrateImageSha | Out-Null

if (-not $SkipMigrations) {
  Write-Host "Starting migration job..." -ForegroundColor Yellow
  $exec = (az containerapp job start -n $MigrateJobName -g $ResourceGroup --query name -o tsv).Trim()
  if (-not [string]::IsNullOrWhiteSpace($exec)) {
    Write-Host "Migration execution: $exec" -ForegroundColor Green
    $containerName = (az containerapp job show -n $MigrateJobName -g $ResourceGroup --query "properties.template.containers[0].name" -o tsv).Trim()
    if (-not [string]::IsNullOrWhiteSpace($containerName)) {
      Write-Host "Tip: follow logs (if replica exists):" -ForegroundColor Cyan
      Write-Host "  az containerapp job logs show -n $MigrateJobName -g $ResourceGroup --execution $exec --container $containerName --follow --format text" -ForegroundColor Gray
    }
  }
}

Write-Host "Done." -ForegroundColor Green
Write-Host "Updated app is now live at the same URL (new revision will roll out automatically)." -ForegroundColor Green
