const express = require("express");//express
const bodyParser = require("body-parser");//body-parser
const app = express(); //gerenciador express
const manager = require('./database/manager');//gerenciador do firebase
const net = require('net'); //gerenciador de comunicação TCP
const cors = require('cors'); 
//Controller Services TCP e Arquivo
const controllerTCP = require('./controller/controllerServiceTCP');
const controllerArquivo = require('./controller/controllerServiceArquivo');

//gerenciamento da conexão TCP
var client = new net.Socket();
var data = undefined;
client.on('close', function() {
	console.log('Connection closed');
});

//configuração do body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//pegando as rotas dos controllers
app.use('/', controllerTCP);
app.use('/', controllerArquivo);
//cors
app.use(cors());

//rota para listagem dos serviços
app.get("/service",function(req,res){
    let services = manager.getServices();
    res.statusCode = 200;
    res.json({services})
});

//rota para deletar um serviço
app.get("/service/:id",(req,res) => {
    let id = req.params.id;
    var editar = undefined;
    //achar o serviço pedido
    manager.getServices().forEach(servico => {
        if(servico.val().id == id){
            editar = servico;
        }
    });
    if(editar != undefined){
        res.statusCode = 200;
        res.json({editar});
    }else res.sendStatus(200);
});

//rota para deletar um serviço
app.delete("/service/:id",(req,res) => {
    let id = req.params.id;
    //remoção do firebase
    manager.deletarService(id);
    res.sendStatus(200);
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
        if(data.command == 'turnOff'){//receber a mensagem de desligamento para poder enviar a informação de volta
            res.statusCode = 200;
            res.json(data)
            client.destroy(); // kill client after server's response
        }
    });
});

//start do server
app.listen(8080,() =>{
    console.log("Esta rodando 8080 ");
});

