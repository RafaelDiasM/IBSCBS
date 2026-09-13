export class SdkGeneratorService {
  public static generateSnippets(endpoint: string, method: string, payload?: any, baseUrl: string = 'http://localhost:3001') {
    const fullUrl = `${baseUrl}${endpoint}`;
    const jsonBody = payload ? JSON.stringify(payload, null, 2) : '';

    return {
      curl: this.generateCurl(fullUrl, method, jsonBody),
      javascript: this.generateJavascript(fullUrl, method, payload),
      typescript: this.generateTypescript(fullUrl, method, payload),
      python: this.generatePython(fullUrl, method, payload),
      csharp: this.generateCSharp(fullUrl, method, jsonBody),
      php: this.generatePhp(fullUrl, method, jsonBody),
      go: this.generateGo(fullUrl, method, jsonBody),
    };
  }

  private static generateCurl(url: string, method: string, jsonBody: string): string {
    if (method === 'GET') {
      return `curl -X GET "${url}" \\
  -H "Accept: application/json"`;
    }
    return `curl -X ${method} "${url}" \\
  -H "Content-Type: application/json" \\
  -d '${jsonBody}'`;
  }

  private static generateJavascript(url: string, method: string, payload?: any): string {
    if (method === 'GET') {
      return `// JavaScript (Fetch API)
const response = await fetch("${url}", {
  method: "GET",
  headers: { "Accept": "application/json" }
});

const data = await response.json();
console.log(data);`;
    }

    return `// JavaScript (Fetch API)
const payload = ${JSON.stringify(payload, null, 2)};

const response = await fetch("${url}", {
  method: "${method}",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});

const data = await response.json();
console.log("Resultado IBS/CBS:", data);`;
  }

  private static generateTypescript(url: string, method: string, payload?: any): string {
    if (method === 'GET') {
      return `import axios from "axios";

async function consultarDados() {
  const { data } = await axios.get("${url}");
  return data;
}`;
    }

    return `import axios from "axios";

interface CalculoInput {
  valor: number;
  ncm?: string;
  ufDestino: string;
  municipioDestino: number;
  data?: string;
}

async function calcularImpostos(input: CalculoInput) {
  const { data } = await axios.post("${url}", input);
  console.log("Total Tributos:", data.resumo.totalTributos);
  return data;
}

// Exemplo de uso:
calcularImpostos(${JSON.stringify(payload || { valor: 1000, ncm: '24021000', ufDestino: 'SP', municipioDestino: 3550308 }, null, 2)});`;
  }

  private static generatePython(url: string, method: string, payload?: any): string {
    if (method === 'GET') {
      return `import requests

response = requests.get("${url}")
data = response.json()
print(data)`;
    }

    return `import requests

payload = ${JSON.stringify(payload || {}, null, 4)}

response = requests.post(
    "${url}",
    json=payload,
    headers={"Content-Type": "application/json"}
)

resultado = response.json()
print("Status:", response.status_code)
print("Total IBS/CBS/IS:", resultado.get("resumo", {}).get("totalTributos"))`;
  }

  private static generateCSharp(url: string, method: string, jsonBody: string): string {
    return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using var client = new HttpClient();
        var content = new StringContent(@"${jsonBody.replace(/"/g, '""')}", Encoding.UTF8, "application/json");
        var response = await client.PostAsync("${url}", content);
        var result = await response.Content.ReadAsStringAsync();
        Console.WriteLine(result);
    }
}`;
  }

  private static generatePhp(url: string, method: string, jsonBody: string): string {
    return `<?php
$ch = curl_init("${url}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, '${jsonBody.replace(/'/g, "\\'")}');

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
?>`;
  }

  private static generateGo(url: string, method: string, jsonBody: string): string {
    return `package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
)

func main() {
	jsonData := []byte(\`${jsonBody}\`)
	req, _ := http.NewRequest("${method}", "${url}", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}`;
  }
}
