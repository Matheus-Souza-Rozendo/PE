### **📡 Capturando Áudio do Microfone e Exibindo um Gráfico de Frequência com Web Audio API** 🎛️🎤🎶

Usaremos a **Web Audio API** para:  
✅ **Capturar o áudio do microfone** usando `getUserMedia()`.  
✅ **Processar o áudio em tempo real** com `AnalyserNode`.  
✅ **Exibir um gráfico de frequência (espectrograma)** usando `<canvas>`.  

---

## **1️⃣ Passos para Capturar e Exibir o Espectro de Frequência**  

1. **Capturar o áudio do microfone** (`MediaStreamAudioSourceNode`).  
2. **Passar o áudio para um `AnalyserNode`** (para analisar as frequências).  
3. **Pegar os dados do `AnalyserNode`** e desenhar o gráfico no `<canvas>`.  
4. **Atualizar o gráfico continuamente** usando `requestAnimationFrame()`.  

---

## **2️⃣ Código Completo** 📝  

```html
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analisador de Frequência</title>
    <style>
        body { text-align: center; font-family: Arial, sans-serif; }
        canvas { width: 100%; height: 300px; background: black; }
    </style>
</head>
<body>
    <h2>Espectrograma em Tempo Real 🎤📊</h2>
    <canvas id="freqCanvas"></canvas>
    <script>
        async function startAudioProcessing() {
            // 📡 1. Captura o áudio do microfone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // 🎛️ 2. Criamos o contexto de áudio
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            
            // 📊 3. Criamos um AnalyserNode para análise de frequência
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;  // Tamanho do FFT (pode ser 512, 1024, 2048...)
            const bufferLength = analyser.frequencyBinCount;  // Metade do fftSize
            const dataArray = new Uint8Array(bufferLength);   // Array de dados
            
            // 🔗 Conectamos o nó de áudio ao analisador
            source.connect(analyser);

            // 🖼️ 4. Configuração do Canvas para exibição
            const canvas = document.getElementById("freqCanvas");
            const canvasCtx = canvas.getContext("2d");
            canvas.width = window.innerWidth;
            canvas.height = 300;

            function draw() {
                requestAnimationFrame(draw); // Atualiza continuamente o gráfico
                
                analyser.getByteFrequencyData(dataArray);  // Obtém os dados de frequência
                
                // 🎨 Limpa o Canvas
                canvasCtx.fillStyle = "black";
                canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

                // 🏗️ Desenha as barras do espectrograma
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i];

                    // 🎨 Definindo cores baseadas na altura das frequências
                    const red = (barHeight * 2) % 255;
                    const green = 255 - barHeight;
                    const blue = barHeight / 2;

                    canvasCtx.fillStyle = `rgb(${red},${green},${blue})`;
                    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                    x += barWidth + 1;
                }
            }

            draw(); // 🎬 Inicia a animação
        }

        startAudioProcessing().catch(console.error);
    </script>
</body>
</html>
```

---

## **3️⃣ Explicação do Código**  

### **🎤 Captura do Áudio do Microfone**  
```js
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioContext = new AudioContext();
const source = audioContext.createMediaStreamSource(stream);
```
📌 **`getUserMedia({ audio: true })`** → Captura o áudio do microfone.  
📌 **`createMediaStreamSource()`** → Converte a captura para um nó de áudio.  

---

### **📊 Processamento com `AnalyserNode`**  
```js
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;  // Define a resolução do FFT
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
```
📌 **O `AnalyserNode` divide o som em frequências** usando **Fast Fourier Transform (FFT)**.  
📌 **`fftSize = 2048`** → Controla a precisão da análise de frequência.  
📌 **`getByteFrequencyData(dataArray)`** → Obtém os valores das frequências em tempo real.  

---

### **🖼️ Desenhando o Gráfico no `Canvas`**  
```js
const canvas = document.getElementById("freqCanvas");
const canvasCtx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = 300;
```
📌 Criamos um **canvas dinâmico** para visualizar o espectro de áudio.  

---

### **🎬 Loop para Atualizar o Gráfico**  
```js
function draw() {
    requestAnimationFrame(draw);  // Continua animando

    analyser.getByteFrequencyData(dataArray); // Obtém os dados de frequência

    canvasCtx.fillStyle = "black";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    let x = 0;
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        // Define a cor baseada na altura das barras
        const red = (barHeight * 2) % 255;
        const green = 255 - barHeight;
        const blue = barHeight / 2;

        canvasCtx.fillStyle = `rgb(${red},${green},${blue})`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
}

draw();  // Inicia o loop da animação
```
📌 **O `requestAnimationFrame(draw)` mantém o gráfico atualizado** em tempo real.  
📌 **O `getByteFrequencyData(dataArray)` lê os dados de frequência do áudio.**  
📌 **Cada barra representa uma faixa de frequência**, onde:  
  - **Altas frequências** → Barras à direita.  
  - **Baixas frequências** → Barras à esquerda.  
📌 **As cores mudam conforme a intensidade do som**.  

---

## **🎵 Resultado:**
✅ **O microfone captura o áudio**.  
✅ **A Web Audio API analisa as frequências**.  
✅ **O `<canvas>` exibe o espectro de frequência em tempo real**.  

🚀 **Agora você tem um visualizador de espectro dinâmico para áudio capturado do microfone!** 🎤📊✨