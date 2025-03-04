

export class Terminal{
    constructor(id){
        this.terminal = document.getElementById(id);
    }

    show(texto){
        this.terminal.innerHTML = texto + "<br>"; 
    }

    clear(){
        this.terminal.innerHTML = "";
    }
}