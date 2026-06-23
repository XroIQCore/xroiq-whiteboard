$ErrorActionPreference = "Stop"

$base = $env:LLM_URL
if (-not $base) {
  throw "Set LLM_URL first, for example: `$env:LLM_URL='http://localhost:8000'"
}

$response = try {
  Invoke-RestMethod -Method Post -Uri "$base/embed" -ContentType "application/json" -Body '{"text":"Hello"}'
} catch {
  Invoke-RestMethod -Method Post -Uri "$base/embedding" -ContentType "application/json" -Body '{"content":"Hello"}'
}
$embedding = if ($response -is [array]) { $response } elseif ($response.embedding) { $response.embedding } elseif ($response.data) { $response.data[0].embedding } else { @() }

if ($embedding.Count -ne 384) {
  throw "Expected 384 embedding values, got $($embedding.Count)"
}

Write-Output "LLM smoke passed: 384 embedding values"

$completion = Invoke-RestMethod -Method Post -Uri "$base/completion" -ContentType "application/json" -Body '{"prompt":"Reply with exactly: ok","n_predict":8}'
if (-not $completion.content) {
  throw "Expected completion.content"
}

Write-Output "LLM completion smoke passed"
