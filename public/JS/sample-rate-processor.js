class SampleRateProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        // Enviar a taxa de amostragem para a thread principal
        this.port.postMessage({ sampleRate: sampleRate });
    }

    process(inputs, outputs, parameters) {
        return true; // Continua processando o áudio
    }
}

// Registrar o processador
registerProcessor("sample-rate-processor", SampleRateProcessor);