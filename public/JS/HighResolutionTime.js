export class HighResolutionTime {
    constructor() {
      // Calcula o offset entre Date.now() e performance.now()
      this.offset = Date.now() - performance.now();
      this.date = "";
      this.nowISO();
    }
  
    // Retorna o timestamp atual com precisão de microsegundos
    now() {
      return this.offset + performance.now();
    }
  
    // Retorna a data e hora atual como um objeto Date
    nowAsDate() {
      return new Date(this.now());
    }
  
    // Retorna a data e hora atual no formato ISO 8601 com precisão de microsegundos
    nowISO() {
      const date = this.nowAsDate();
      
      // Obtém os milissegundos completos e fracionários
      const milliseconds = date.getMilliseconds();
      const microseconds = Math.floor((this.now() % 1) * 1e6); // Converte fração de ms para µs
      const dateisoString = date.toISOString().slice(0,-1)
      const noMilliseconds = dateisoString.split(".")[0];
      const msString = String(milliseconds).padStart(3, "0");
      const usString = String(microseconds).padStart(6, "0").slice(0, 3);
      
      // Retorna a string formatada no padrão ISO com microsegundos
      this.date = `${noMilliseconds}.${msString}${usString}Z`;
    }

    getIsoFormatString(){
      return this.date;
    }

    isoToMicroseconds(isoString) {
      // 📌 1. Converte a parte principal da data ISO para um timestamp em milissegundos
      const datePart = isoString.split(".")[0] + "Z"; // Remove a fração de segundo e mantém o "Z"
      const baseTimeMs = new Date(datePart).getTime(); // Converte para timestamp em ms
  
      // 📌 2. Obtém os milissegundos e microssegundos da string ISO
      const fractionPart = isoString.split(".")[1]?.replace("Z", ""); // Obtém os milissegundos e microssegundos
      const milliseconds = parseInt(fractionPart?.slice(0, 3) || "0", 10); // Primeiro 3 dígitos são ms
      const microseconds = parseInt(fractionPart?.slice(3, 6) || "0", 10); // Últimos 3 dígitos são µs
  
      // 📌 3. Converte tudo para microssegundos:
      // (ms para µs) + (microssegundos adicionais)
      const totalMicroseconds = (baseTimeMs * 1000) + (milliseconds * 1000) + microseconds;
  
      return totalMicroseconds;
  }

  microsecondsToIso(microseconds) {
    // 📌 1. Separa os componentes: milissegundos e microssegundos
    const baseTimeMs = Math.floor(microseconds / 1000); // Parte inteira → milissegundos
    let remainingUs = Math.trunc(microseconds % 1000);
    
    // 📌 2. Converte timestamp em ms para um objeto Date
    const dateObject = new Date(baseTimeMs);

    // 📌 3. Formata a saída no formato ISO 8601 com precisão de microssegundos
    const dateIsoString = dateObject.toISOString().slice(0, -1); // Remove o "Z" para adicionar microssegundos
    const noMilliseconds = dateIsoString.split(".")[0]; // Parte sem milissegundos
    const milliseconds = String(dateObject.getMilliseconds()).padStart(3, "0");
    
    // 📌 4. Garante que `remainingUs` sempre tenha três dígitos
    const microsecondsString = String(Math.abs(remainingUs)).padStart(3, "0");
    // 📌 5. Retorna o resultado correto
    return `${noMilliseconds}.${milliseconds}${microsecondsString}Z`;
}

  addmicroseconds(microseconds){
      const microsegundosAtual = this.isoToMicroseconds(this.date);
      const microsegundosAtualizado = microsegundosAtual + microseconds;
      this.date = this.microsecondsToIso(microsegundosAtualizado);
    }
  }




  