#!/bin/sh
ollama serve &
echo "Waiting for Ollama server startup..."
sleep 10

ollama run llama3

tail -f /dev/null