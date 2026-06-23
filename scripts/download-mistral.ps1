$ErrorActionPreference = "Stop"

$url = $env:MISTRAL_GGUF_URL
if (-not $url) {
  $url = "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf"
}

New-Item -ItemType Directory -Force -Path "models" | Out-Null
Invoke-WebRequest -Uri $url -OutFile "models/mistral-7b-instruct-v0.2.Q4_K_M.gguf"
Write-Output "Downloaded models/mistral-7b-instruct-v0.2.Q4_K_M.gguf"
