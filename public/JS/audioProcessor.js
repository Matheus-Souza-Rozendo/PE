import { FrequencyVisualizer } from "./frequencyVisualizer.js";
import { HighResolutionTime } from "./HighResolutionTime.js";
import { Terminal } from "./Terminal.js";

export class AudioProcessor {
    constructor(canvasIdBefore, canvasIdAfter, centerFrequency = 8000, qFactor = 8) {
        this.audioContext = null;
        this.analyserBefore = null;  // Analisador antes do filtro
        this.analyserAfter = null;   // Analisador depois do filtro
        this.visualizerBefore = null;  // Visualizador antes do filtro
        this.visualizerAfter = null;   // Visualizador depois do filtro
        this.bandpassFilter = null;  // Filtro passa-faixa
        this.canvasIdBefore = canvasIdBefore; // ID do canvas para sinal original
        this.canvasIdAfter = canvasIdAfter;   // ID do canvas para sinal filtrado
        this.centerFrequency = centerFrequency;  // Frequência central do filtro
        this.qFactor = qFactor;  // Q define a largura da banda
        this.limite = 0;
        this.equalizado = false;
        this.ativo = false;
        this.microfoneStream = null;
        this.terminal = new Terminal('terminal')
    }
    async sensor() {
        try {
            this.ativo=true;
            // 📡 1. Captura o áudio do microfone
            this.microfoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // 🎛️ 2. Criamos o contexto de áudio e a fonte
            this.criarContexto();
            const source = this.criarFonte(this.microfoneStream);

            // 🎚️ 3. Criamos o filtro passa-faixa (Bandpass)
            this.criarFiltro();

            // 📊 4. Criamos o analisador de frequência
            this.analyserAfter = this.audioContext.createAnalyser();
            this.analyserAfter.fftSize = 2048;

            // 🔗 5. Conectar os nós:
            // Microfone → Filtro → Analisador
            source.connect(this.bandpassFilter);
            this.bandpassFilter.connect(this.analyserAfter);

            // 🏗️ 6. Criar um buffer para armazenar 1 segundo de áudio
            const dataArray = this.criarbuffer();
            const sampleRate = this.audioContext.sampleRate; // Taxa de amostragem em Hz
            
            this.terminal.clear();
            this.terminal.show("📡 Captura de áudio iniciada...");
            console.log("📡 Captura de áudio iniciada...");
            await this.delay(2000);

            while(!this.limite){
                this.analyserAfter.getFloatTimeDomainData(dataArray); // Preenche o buffer com amostras
                this.calcularSomAmbiente(dataArray);
                console.log("maior valor:",this.limite*50);
            }

            this.limite = this.limite*50;
            
            // 🔄 7. Loop infinito para capturar e exibir os dados a cada 2 segundos
            const processarAudio = async () => {
                while (this.ativo) {
                    // Aguarda um pequeno tempo antes de continuar o loop
                    await new Promise(resolve => requestAnimationFrame(resolve));
            
                    this.analyserAfter.getFloatTimeDomainData(dataArray); // Preenche o buffer com amostras
                    
                    // Captura o tempo exato em que os dados do buffer foram coletados
                    const timestamp = new HighResolutionTime()
            
                    // 🔍 8. Verifica se alguma amostra ultrapassa o limite e calcula o tempo exato da amostra
                    const spikeIndex = this.verificaPico(dataArray);
            
                    if (spikeIndex !== null) {
                        // Cálculo do tempo exato da amostra no buffer
                        const spikeTime = this.calcularTempoAmostra(spikeIndex, timestamp, sampleRate);
                        console.log(`⚠️ Pico detectado no índice ${spikeIndex} com valor ${dataArray[spikeIndex]}`);
                        this.terminal.clear();
                        this.terminal.show(`⏱️ Tempo exato da amostra: ${spikeTime}`)
                        console.log(`⏱️ Tempo exato da amostra: ${spikeTime}`);
                        const url = "https://192.168.1.4:3000/api";
                        const endpoint = "/receber_leitura"
                        const id = localStorage.getItem('id');
                        const dados = { "id_sensor":parseInt(id), "hora_de_chegada":spikeTime}
                        const resposta = await this.enviarEventoServidor(url+endpoint,dados);
                        console.log(resposta)
                        await this.delay(5000);
                    } 
                }
            };

            processarAudio();
        } catch (error) {
            this.terminal.show("Erro ao capturar áudio");
            console.error("Erro ao capturar áudio:", error);
        }
    }

    async analisarFiltro() {
        try {
            // 📡 1. Captura o áudio do microfone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // 🎛️ 2. Criamos o contexto de áudio e a fonte
            this.criarContexto()
            const source = this.criarFonte(stream);

            // 🎚️ 3. Criamos o filtro passa-faixa (Bandpass)
            this.criarFiltro();
            
            // 📊 4. Criamos dois analisadores de frequência
            this.analyserBefore = this.audioContext.createAnalyser(); // Antes do filtro
            this.analyserAfter = this.audioContext.createAnalyser();  // Depois do filtro
            this.analyserBefore.fftSize = 1024;
            this.analyserAfter.fftSize = 1024;

            // 🔗 5. Conectar os nós:
            // Microfone → Analisador Antes → Filtro → Analisador Depois
            source.connect(this.analyserBefore);  // Captura o áudio original
            source.connect(this.bandpassFilter);  // Passa pelo filtro
            this.bandpassFilter.connect(this.analyserAfter);  // Captura o áudio filtrado

            // 🎨 6. Criamos dois visualizadores e iniciamos a animação
            this.visualizerBefore = new FrequencyVisualizer(this.canvasIdBefore, this.analyserBefore);
            this.visualizerAfter = new FrequencyVisualizer(this.canvasIdAfter, this.analyserAfter);
            
            this.visualizerBefore.start();
            this.visualizerAfter.start();

            console.log("Captura e análise de áudio iniciadas!");
        } catch (error) {
            console.error("Erro ao capturar áudio:", error);
        }
    }

    calcularSomAmbiente(array){
        var maior = Math.abs(array[0]);
        for(let i = 0;i<array.length;i++){
            if(Math.abs(array[i])>maior){
                maior = Math.abs(array[i])
            }
        }
        this.limite=maior;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    calcularTempoAmostra(index, timestampISO, sampleRate) {
        // Calcula o tempo da amostra no buffer
        const timeOffsetMs = (index / sampleRate) * 1000*1000;
        // Cria um novo timestamp ajustado
        timestampISO.addmicroseconds(timeOffsetMs);
        return timestampISO.getIsoFormatString();
    }

    verificaPico(array){
        for(let i=0;i<array.length;i++){
            if(array[i]>=this.limite){
                return Number(i);
            }
        }
        return null
    }

    criarbuffer(){
        const sampleRate = this.audioContext.sampleRate;  // Taxa de amostragem do sistema
        const bufferLength = sampleRate;  // 1 segundo de áudio
        return new Float32Array(bufferLength);
    }

    criarContexto(){
        this.audioContext = new AudioContext();
    }

    criarFonte(stream){
        return this.audioContext.createMediaStreamSource(stream);
    }

    criarFiltro(){
        this.bandpassFilter = this.audioContext.createBiquadFilter();
        this.bandpassFilter.type = "bandpass";
        this.bandpassFilter.frequency.value = this.centerFrequency; // Define a frequência central
        this.bandpassFilter.Q.value = this.qFactor; // Define a largura da banda
    }

    // 🛑 **Método para parar a captura**
    pararCaptura() {
        this.terminal.clear()
        this.terminal.show("🛑 Parando a captura de áudio...")
        console.log("🛑 Parando a captura de áudio...");
        this.ativo = false; // Para os loops
        
        // 🔥 Parar o microfone
        if (this.microfoneStream) {
            this.microfoneStream.getTracks().forEach(track => track.stop());
            this.microfoneStream = null;
        }

        // 🔥 Fechar o AudioContext para liberar recursos
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.terminal.show("✅ Captura de áudio completamente encerrada.");
        console.log("✅ Captura de áudio completamente encerrada.");
    }

    async enviarEventoServidor(url, dados) {
        try {
            console.log(`📡 Enviando dados para ${url}...`);
    
            const resposta = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });
    
            if (!resposta.ok) {
                throw new Error(`Erro na requisição: ${resposta.status} - ${resposta.statusText}`);
            }
    
            const respostaJson = await resposta.json();
            return respostaJson; // Retorna a resposta da API caso seja necessário usar
        } catch (erro) {
            this.terminal.show("❌ Erro ao enviar dados para o servidor")
            console.error("❌ Erro ao enviar dados para o servidor:", erro.message);
            return null;
        }
    }
    
}


