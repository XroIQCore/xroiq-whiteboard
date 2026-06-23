FROM ghcr.io/ggerganov/llama.cpp:latest

RUN mkdir -p /models \
  && curl -L --fail --retry 3 \
    -o /models/mistral-7b-instruct-v0.2.Q4_K_M.gguf \
    https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf

EXPOSE 8000

CMD /app/server --model /models/mistral-7b-instruct-v0.2.Q4_K_M.gguf --host 0.0.0.0 --port 8000 --threads ${LLAMA_THREADS:-4} --embedding
