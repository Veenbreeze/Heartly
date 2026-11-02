$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker is required to run the local RLS suite."
  }

  Write-Host "Starting local Supabase..."
  npx supabase start
  if ($LASTEXITCODE -ne 0) {
    throw "supabase start failed."
  }

  Write-Host "Resetting the local database and applying migrations..."
  npx supabase db reset --local
  if ($LASTEXITCODE -ne 0) {
    throw "supabase db reset failed."
  }

  $container = (docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db_*" } | Select-Object -First 1)
  if (-not $container) {
    throw "Could not find the local Supabase database container."
  }

  $testFile = Join-Path $repoRoot "supabase\tests\rls.test.sql"
  if (-not (Test-Path -LiteralPath $testFile)) {
    throw "RLS test file not found at $testFile."
  }

  Write-Host "Running RLS tests against $container..."
  Get-Content -LiteralPath $testFile -Raw | docker exec -i $container psql -U postgres -d postgres -v ON_ERROR_STOP=1
  if ($LASTEXITCODE -ne 0) {
    throw "RLS tests failed."
  }

  Write-Host "RLS tests passed." -ForegroundColor Green
}
finally {
  Pop-Location
}
