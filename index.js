const express = require("express");//express
const bodyParser = require("body-parser");//body-parser
const app = express(); //gerenciador express
const manager = require('./database/manager');//gerenciador do firebase
const net = require('net'); //gerenciador de comunicação TCP
//Controller Services TCP e Arquivo
const controllerTCP = require('./controller/controllerServiceTCP');
const controllerArquivo = require('./controller/controllerServiceArquivo');

//gerenciamento da conexão TCP
var client = new net.Socket();
client.on('close', function() {
	console.log('Connection closed');
});

//configuração do body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//configuração do ejs
app.set('view engine','ejs');
app.use(express.static('public'));

//pegando as rotas dos controllers
app.use('/', controllerTCP);
app.use('/', controllerArquivo);

//rota principal
app.get("/",function(req,res){
    res.render("index");
});


//rota para listagem dos serviços
app.get("/servicos",function(req,res){
    res.render("servicos",{servicos: manager.getServices()});
});


//rota para deletar um serviço
app.post("/servicos/deletar",(req,res) => {
    var id = req.body.id;
    //remoção do firebase
    manager.deletarService(id);
    res.redirect("/servicos");
});

//rota para edição de serviços
app.get("/servicos/editar/:id",(req,res) => {
    var editar;
    var id = req.params.id;
    //achar o serviço pedido
    manager.getServices().forEach(servico => {
        if(servico.val().id == id){
            editar = servico;
        }
    });
    //descobrir qual é o tipo do serviço para redirecionar para a página de edição correta
    if(editar.val().diretorio == ''){
        res.render("editarTCP",{servico: editar});
    }else{
        res.render("editarArquivo",{servico: editar});
    }
});

//rota para pegar a informação de um modulo via TCP
app.get('/enviar/:nome', (req,res) => {
    let nome = req.params.nome;
    let ip;
    let porta;
    //procura pelo serviço TCP e pega as informações dele
    manager.getServices().forEach(servico => {
        if(servico.val().nome == nome){
            ip = servico.val().ip;
            porta= parseInt(servico.val().porta);
        }
    });
    //se conecta ao servidor cadastrado pelo serviço
    client.connect(porta, ip, function() {
        console.log('Connected');
        let json = {value1: 10, value2:110}
        client.write(JSON.stringify(json));//manda o JSON
    });
    //receber as mensagens do servidor
    client.on('data', function(data) {
        console.log('Received: ' + data);
        if(data == 'desligar'){//receber a mensagem de desligamento para poder enviar a informação de volta
            res.redirect('/');
            client.destroy(); // kill client after server's response
        }
    });
});

//start do server
app.listen(8080,() =>{
    console.log("Esta rodando 8080 ");
});

