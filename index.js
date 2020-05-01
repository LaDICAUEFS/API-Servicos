const express = require("express");//express
const bodyParser = require("body-parser");//body-parser
const app = express(); //gerenciador express
const firebase = require("firebase"); //gerenciador do firebase
const configFirebase = require("./database/firebase");//conexão com o realtime database
const multer = require("multer"); //middleware para salvar arquivo
const path = require("path");//pegar a extensão do arquivo
const fs = require('fs'); //gerenciador de arquivo
//const flash = require("connect-flash"); // warning flash

//configuracao do firebase
//as informações do banco do firebase devem ser adicionadas no arquivo firebase.js no diretorio firebase/database
var config = {
    apiKey: configFirebase.apiKey,
    authDomain: configFirebase.authDomain,
    databaseURL:  configFirebase.databaseURL,
    storageBucket: configFirebase.storageBucket
};

var servicosSalvos = [];

firebase.initializeApp(config);
// Get a reference to the database service
var servicos = firebase.database().ref("servicos");
servicos.on('value',function(data){
    servicosSalvos = data;
});

//configuração do body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//configuração do ejs
app.set('view engine','ejs');
app.use(express.static('public'));

//metodo para verificação de existência de serviços
function jaExiste(nome){
    var cadastrado = false;
    servicosSalvos.forEach(servico => {
        if(servico.val().nome == nome){
            cadastrado = true;
            //req.flash('name_msg', 'Nome já cadastrado');
        }
    });
    return cadastrado;
}

//metodo para verificação de existência de serviços
function jaExisteDir(dir){
    var cadastrado = false;
    servicosSalvos.forEach(servico => {
        if(servico.val().diretorio == dir){
            cadastrado = true;
            //req.flash('name_msg', 'Nome já cadastrado');
        }
    });
    return cadastrado;
}

function validacaoTCP(nome, ip , porta){
    let split = ip.split('.');
    let isRight = true;
    if(jaExiste(nome)){//verificação se já existe um serviço com o mesmo nome cadastrado
        return false;
    }
    if(isNaN(parseInt(porta))){ //verificação se a porta é um inteiro
        return false;
    }
    split.forEach(ip4 => {
        if(isNaN(parseInt(ip4))){ // verificação se os quartetos do ip são inteiro
            isRight = false;
        }
    });
    return isRight;
}

function validacaoArquivo(nome, dir){
    let arquivoExiste = 'nao';
    if(jaExiste(nome)){//verificação se já existe um serviço com o mesmo nome cadastrado
        return false;
    }
    if(jaExisteDir(dir)){
        return false;
    }
    return true;
}

//configuração do multer
const upload = multer({
    // Como deve ser feito o armazenamento dos arquivos?
    storage: multer.diskStorage({     
        destination:function(req,file,cb){ 
            cb(null,"uploads/");
        },
        filename: function(req,file,cb){
            var servico = req.body.name;
            cb(null, servico + path.extname(file.originalname));
        }
    }),
    // Como esses arquivos serão filtrados, quais formatos são aceitos/esperados?
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) !== '.pdf') {
            // Se o arquivo não bateu com nenhum aceito, executamos o callback com o segundo valor false (validação falhouo)
            return cb(null, false);
        }
        // Executamos o callback com o segundo argumento true (validação aceita)
        return cb(null, true);
    }
});

//rota principal
app.get("/",function(req,res){
    res.render("index");
});

//rota para o formularioTCP
app.get("/cadastrarTCP",function(req,res){
    res.render("formularioTCP");
    //{name_msg: req.flash('name_msg')}
});

//rota para o formularioArquivo
app.get("/cadastrarArquivo",function(req,res){
    res.render("formularioArquivo");
});

//rota para o salvamento dos servicos TCP passadas pelo formularioTCP
app.post("/salvarTCP",upload.single("file"),function(req,res){
    var nome = req.body.name;
    var ip = req.body.ipServico;
    var porta = parseInt(req.body.portaServico);
    if(!validacaoTCP(nome,ip,porta)){
        res.redirect("/CadastrarTCP");
    }else{
        // Generate a reference to a new location and add some data using push()
        var servicosRef = servicos.push();
        // Get the unique key generated by push()
        var servicosId = servicosRef.key;     
        //salva a informação no banco de dados no firebase
        servicosRef.set({
            nome: nome,
            ip: ip,
            porta: porta,
            diretorio: '',
            id: servicosId
        });
        res.redirect("/");
    }
});

//rota para o salvamento dos servicos TCP passadas pelo formularioTCP
app.post("/salvarArquivo",upload.single("file"),function(req,res){
    var nome = req.body.name;
    var dir = req.body.dirServico;
    if(!validacaoArquivo(nome,dir)){
        res.redirect("/CadastrarArquivo");
    }else{
        fs.access(dir, fs.constants.F_OK, (err) => {
            if(err){
                res.redirect("/CadastrarArquivo");
            }else{
                // Generate a reference to a new location and add some data using push()
                var servicosRef = servicos.push();
                // Get the unique key generated by push()
                var servicosId = servicosRef.key;     
                //salva a informação no banco de dados no firebase
                servicosRef.set({
                    nome: nome,
                    ip: '',
                    porta: '',
                    diretorio: dir,
                    id: servicosId
                });
                res.redirect("/");
            }
        });
    }
});

//rota para listagem dos serviços
app.get("/servicos",function(req,res){
    res.render("servicos",{servicos: servicosSalvos});
});


//rota para deletar um serviço
app.post("/servicos/deletar",(req,res) => {
    var id = req.body.id;
    var nome = req.body.nome;
    //remoção do arquivo
    /*var diretorioArquivo = "./uploads/"+nome+".pdf";
    fs.unlink(diretorioArquivo, (err) => {
        if (err) throw err;
        console.log('path/file.txt was deleted');
    });*/
    //remoção do firebase
    firebase.database().ref("servicos/" + id).remove();
    res.redirect("/servicos");
});

//rota para edição TCP
app.get("/servicos/editar/:id",(req,res) => {
    var editar;
    var id = req.params.id;
    servicosSalvos.forEach(servico => {
        if(servico.val().id == id){
            editar = servico;
        }
    });
    if(editar.val().diretorio == ''){
        res.render("editarTCP",{servico: editar});
    }else{
        res.render("editarArquivo",{servico: editar});
    }
});

//rota para edição, salvar as informações novas
app.post("/editarTCP",(req,res)=>{
    var nome = req.body.nome;
    var ip = req.body.ipServico;
    var porta = req.body.portaServico;
    var id = req.body.id;
    /*var nomeAntigo = req.body.nomeAntigo;
    //caminho do arquivo ja registrado e o novo diretorio
    var diretorioAntigo = "./uploads/"+ nomeAntigo+".pdf";
    var diretorioNovo = "./uploads/"+nome+".pdf";
    //renomear o arquivo
    fs.rename(diretorioAntigo, diretorioNovo, (err) => {
        if (err) throw err;
        console.log('Rename complete!');
    });*/
    //salva no firebase
    firebase.database().ref("servicos/" + id).set({
        nome: nome,
        ip: ip,
        porta: porta,
        diretorio: '',
        id: id
    });

    res.redirect("/servicos");
});

//rota para edição, salvar as informações novas
app.post("/editarArquivo",(req,res)=>{
    var nome = req.body.nome;
    var dirServico = req.body.dirServico;
    var id = req.body.id;
    /*var nomeAntigo = req.body.nomeAntigo;
    //caminho do arquivo ja registrado e o novo diretorio
    var diretorioAntigo = "./uploads/"+ nomeAntigo+".pdf";
    var diretorioNovo = "./uploads/"+nome+".pdf";
    //renomear o arquivo
    fs.rename(diretorioAntigo, diretorioNovo, (err) => {
        if (err) throw err;
        console.log('Rename complete!');
    });*/
    //salva no firebase
    firebase.database().ref("servicos/" + id).set({
        nome: nome,
        ip: '',
        porta: '',
        diretorio: dirServico,
        id: id
    });

    res.redirect("/servicos");
});

//start do server
app.listen(8080,() =>{
    console.log("Esta rodando");
});

