class PeakDetectorProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.threshold = 0.7; // Limiar para detecção de pico
    }
  
    process(inputs) {
      const input = inputs[0];
      console.log(inputs);
      if (input.length > 0) {
        const samples = input[0];
        for (let i = 0; i < samples.length; i++) {
          if (Math.abs(samples[i]) > this.threshold) {
            this.port.postMessage({ peak: samples[i], time: currentTime });
            break; // Opcional: sair do loop após o primeiro pico detectado
          }
        }
      }
      return true; // Continua processando
    }
  }
  
  registerProcessor("peak-detector-processor", PeakDetectorProcessor);