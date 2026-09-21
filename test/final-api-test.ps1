$ErrorActionPreference = 'Stop'

$baseUrl = if ($env:PHC_API_BASE_URL) { $env:PHC_API_BASE_URL } else { 'http://localhost:5000/api' }

Write-Host "Testing API at $baseUrl"

function Invoke-ApiGet($path) {
    $response = Invoke-RestMethod -Uri "$baseUrl$path" -Method Get -Headers @{ Authorization = "Bearer $env:PHC_TEST_TOKEN" }
    return $response
}

try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "Health check passed:"
    $health | ConvertTo-Json -Depth 5

    $me = Invoke-ApiGet('/auth/me')
    Write-Host "Current user check passed:"
    $me | ConvertTo-Json -Depth 5

    Write-Host 'All final API checks completed successfully.'
}
catch {
    Write-Error "API validation failed: $($_.Exception.Message)"
    exit 1
}
