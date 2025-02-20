async function detectPeaks() {
    const audioContext = new AudioContext();
    
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
  
    // Carregar o módulo do AudioWorklet
    await audioContext.audioWorklet.addModule("/JS/peak-detector-processor.js");
  
    // Criar o AudioWorkletNode
    const peakDetectorNode = new AudioWorkletNode(audioContext, "peak-detector-processor");

    // Capturar o microfone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
  
    // Conectar a fonte ao nó de detecção de pico
    source.connect(peakDetectorNode);
    
    // Receber mensagens do AudioWorkletProcessor
    peakDetectorNode.port.onmessage = (event) => {
      const { peak, time } = event.data;
      console.log(`Pico detectado: ${peak.toFixed(3)} em ${time.toFixed(3)} segundos`);
    };
  }
  

document.getElementById("startAudio").addEventListener("click", () => {
    detectPeaks();
});
