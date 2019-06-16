import { Component, OnInit, ViewChild } from '@angular/core';
import { Aluno } from './aluno';
import { AlunoService } from './aluno.service';


@Component({
  selector: 'import',
  templateUrl: './importMetas.html',
  styleUrls: ['./importMetas.css']
})

export class ImportMetas implements OnInit{
  constructor(private alunoService: AlunoService) {}

    public csvRecordsArray: any[] = [];
    public fileSelected: boolean = false;
    public alunos: any[]=[];
    public aluno: Aluno = new Aluno();
    public csvRecords: any[] = [];
    public option:string="MP1"; //apagar
    public override = false;
    public alunosImportados:Aluno[] = [];

    @ViewChild("fileImportInput") fileImportInput: any;
      fileChangeListener($event: any): void {
        var files = $event.srcElement.files;
        if (files[0].name.endsWith(".csv")) {
          var input = $event.target;
          var reader = new FileReader();

          reader.readAsText(input.files[0]);
          reader.onload = (data) => {
            let csvData = reader.result;
            let csvRecordsArray = (csvData as string).split(/\r\n|\n/);
              for(let i=0;i<csvRecordsArray.length;i++){
              let rowdata = csvRecordsArray[i].match(/("[^"]*")|[^,]+/g);
              this.csvRecords.push(rowdata);
              }
          }
          this.fileSelected = true;
          console.log(this.csvRecords);
        reader.onerror = function() {
            alert("Unable to read " + input.files[0]);
          };
        } else {
          alert("Selecione um arquivo .csv, por favor");
          this.fileImportInput.nativeElement.value = "";
          this.csvRecords = [];
          this.fileSelected = false;
        }
    }

    importarPlanilha(){

      if(!this.fileSelected){
        return alert("Selecione um arquivo CSV")
      }
      if(this.csvRecords.length < 1){
        return alert("Verifique os dados da planilha importada! Ou atualize o arquivo enviado!");
      }
     
      console.log("Importing...");
      var conceitos = this.getConceitosFromCSV(this.csvRecords);

      for(var i=1;i<this.csvRecords.length;i++){
        var alunoNome = this.csvRecords[i][0];
        var aluno:Aluno = this.getAlunoFromName(alunoNome);

        this.checkOverridingMetas(aluno,conceitos);
        for(var j=0;j<conceitos.length;j++){
          aluno.metas[conceitos[j]] = this.csvRecords[i][j+1];
        }
        this.alunosImportados.push(aluno);
      }

      console.log(this.alunosImportados);
      if(!this.override){
        this.atualizaAlunosImportadosServidor(this.alunosImportados);
        alert("Alunos atualizados! cheque a tabela de Metas!");
      }else{
        if(confirm("Você tem certeza que quer sobrescrever?")){
          this.atualizaAlunosImportadosServidor(this.alunosImportados);
          alert("Alunos atualizados! cheque a tabela de Metas!");
        }else{
          this.alunoService.getAlunos()
          .then(as => this.alunos = as)
          .catch(erro => alert(erro));
        }
      }
      this.resetImport();
    }

    resetImport(){
      this.alunosImportados = [];
      this.csvRecords = [];
      this.override = false;
    }

    atualizaAlunosImportadosServidor(alunosImportados:Aluno[]){
      for(var i=0;i<alunosImportados.length;i++){
        this.atualizarAluno(alunosImportados[i]);
      }
    }

    atualizarAluno(aluno: Aluno): void {
      this.alunoService.atualizar(aluno)
         .catch(erro => alert(erro));
    }

    checkOverridingMetas(aluno:Aluno, conceitos:string[]):void{
      
      var metas = aluno.metas;
      var metasAmount = [];
      for(var i=0;i<conceitos.length;i++){
        if(metas[conceitos[i]] != undefined){
          metasAmount.push(metas[conceitos[i]]);
        }  
      }

      if(metasAmount.length > 0){
        this.override = true;
      }

    }
    

    getAlunoFromName(nome:string):Aluno{
      var alunoProcurado:Aluno;
      for(var i=0;i<this.alunos.length;i++){
        if(this.alunos[i].nome == nome){
          alunoProcurado = this.alunos[i];
          return alunoProcurado
        }
      }
        return null
    }

    getConceitosFromCSV(data:any):string[]{
      var conceitos:string[] = [];
      var tamanhoConceitos = data[0].length;
      for(var i=1;i<tamanhoConceitos;i++){
        conceitos.push(data[0][i]);
      }

      return conceitos;
    }
    
    ngOnInit(){
      this.alunoService.getAlunos()
      .then(as => this.alunos = as)
      .catch(erro => alert(erro));
    }
}