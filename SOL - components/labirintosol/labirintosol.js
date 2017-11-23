
/*
Desenvolvedor: 	    josiel.faria								
Componente: 	    labirintosol
Descrição:		    Componente local, desenvolvido para o AIO-SOL				
Funcionalidades:	Movimentação do persoangem, Animação SVG dos objetos, 
					Testes de colisao, Eventos de click
Última alteração: 07/11/2017
Autor da alteração: josiel.faria
Alteralções: Comentários do código
*/

module.exports = function ($compile, $rootScope, SVGUtils) {
    return {
        restrict: 'AE',
        replace: false,
        // templateUrl: function (elem, attrs) {
        //     return attrs.src;
        // },
        link: function (scope, element, attr) {

			console.log('Labirinto SOl');

			//incialização das matrizes dos objetos SVG
			SVGUtils.initSVGElement($('#personagem')); 
			SVGUtils.initSVGElement($('[id*=parede]'));
			SVGUtils.initSVGElement($('[id*=obj]'));
			SVGUtils.initSVGElement($('#bloqSaida'));

			//adicionando cursor pointer nos botoes
			$('#direita, #esquerda, #cima, #baixo').addClass('btn');

			//declaração de variaveis utilizadass nos jogo
			var andarH,	andarV, //var utlizadas para movimentação da matrix do objeto
			HV = 'HRight',
			numParedeTocada = 0,
			objetosComidos = 0, //var utilizada para contagem de todos os cal's comidos
			intervaloCriado = false, //var booleana para saber se o intervalo ja está sendo executado ou nao
			personagemID = $('#personagem'),
			delayMovimento = 30, //var de delay do movimento do personagem
			delayAnima = 200, //var de delay da animação do personagem
			personagemMatrix, //var que recebera a matrix do personagem
			tecladoClicado = true, //var quer dira se o teclado estara pressionado ou nao
			jogoInciado = false, //quando o jogo estiver iniciado nao podera adicionar novas funcoes de click
			todasParedes = $('[id^=parede]'), 
			todasObjetos = $('[id*=obj]'),
			cont = 1;
			
			//variaveis utilizadas nos intervalos do jogo
			var intervaloMovimento, intervaloColisoes, intervaloAnima,
				funcaoTecladoKeyDown, funcaoTecladoKeyUp;

			$('#feedFinal, [id*=feed]').hide();//evento que apaga todo elemento que contem feed
			$('#direita').parent().hide(); //apaga o elemento pai
			$('#feedErrado').click(function () { $('#feedErrado').hide(300) });//adiciona o evt de click para apagar o feedErrado
			$('#btnPlay').click(function () { //quando clicar no botao Play do jogo
				cont = 1; 
				$('#btnPlay').hide(300); //apaga o bt play 
				jogoInciado = true; tecladoClicado = false; //diz que o jogo está iniciado e que as foram tecladas 
				$('#direita').parent().show(300);//mostra o elemento pai
				funcaoColisaoFinal(); comecarAnimaPersonagem(); //chama as funcoes para testar colisao e iniciar animacao personagem
			});

			//funcao do teclado para quando pressionar a tecla
			funcaoTecladoKeyDown = function (objEvent) {
				if (objEvent.keyCode == 13) { //enter
					$('#btnPlay').click(); $('#feedErrado').click();
				} else if (objEvent.keyCode == 39) { //direita
					$('#direita').click(); $('#feedErrado').click();
					tecladoClicado = true;
				} else if (objEvent.keyCode == 40) { //baixo
					$('#baixo').click(); $('#feedErrado').click();
					tecladoClicado = true;
				} else if (objEvent.keyCode == 37) { //esquerda
					$('#esquerda').click(); $('#feedErrado').click();
					tecladoClicado = true;
				} else if (objEvent.keyCode == 38) { //cima
					$('#cima').click(); $('#feedErrado').click();
					tecladoClicado = true;
				};
			};

		    //funcao do teclado para quando soltar a tecla
			funcaoTecladoKeyUp = function (objEvent) {
				if(jogoInciado){
					tecladoClicado = false;
				}
			};

			$(document).on('keydown', funcaoTecladoKeyDown);
			$(document).on('keyup', funcaoTecladoKeyUp);

			//declara os delay de acordo com o navegador utilizado
			if(GetBrowserInfo() == 'firefox'){
				console.log(GetBrowserInfo())
				delayMovimento = -10; delayAnima = -10;
			}else{//chrome/ie
				console.log(GetBrowserInfo())
				delayMovimento = 30; delayAnima = 200;
			}

			//funcao para saber qual o navegador utilizado
			function GetBrowserInfo() {
				var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
				var isChrome = !!window.chrome;             			 // Chrome 1+
				if (isFirefox) { return 'firefox'; }
				else if (isChrome) { return 'chrome'; }
				else {  return 0; }
			}

			//funcao que testa a colisao de dois elementos SVG
			checkElementsColision = (element1, element2) =>{
				element1 = angular.element(element1);
				element2 = angular.element(element2);
				rect1 = element1[0].getBoundingClientRect();
				rect2 = element2[0].getBoundingClientRect();
				return  rect1.left < rect2.left + rect2.width &&
						rect1.left + rect1.width > rect2.left &&
						rect1.top < rect2.top + rect2.height &&
						rect1.height + rect1.top > rect2.top ;
			 };

			//funcao para receber a posicao atual do personagem
			pegarPosicaoPersonagem = (posicaoXY) =>{//recebe o parametro x ou y
				personagemMatrix = document.getElementById('personagem').transform.animVal[0].matrix;//recebe a matrix do personagem
				switch (posicaoXY) { 
					case 'x': posicPersonagem = personagemMatrix.e; break; //x da matrix
					case 'y': posicPersonagem = personagemMatrix.f; break; //y da matrix
				}
				return posicPersonagem; ;//retorna o valor de x ou y
			};

			//funcao para receber a altura do personagem
			larguraAlturaPersonagem = () =>{
				personagem =  document.getElementById('personagem').getBoundingClientRect(); //recebe as posicoes do personagem
				return personagem;
			};

			//funcao para receber a posicao atual da parede
			pegarPosicaoParede = (numParede) =>{
				parede = document.getElementById('parede'+numParede).transform.animVal[0].matrix; //recebe a matrix da parede
				return parede;
			};

			//funcao para receber a altura da parede
			larguraAlturaParede = (numParede) =>{
				parede = document.getElementById('parede'+numParede).getBoundingClientRect(); //recebe as posicoes da parede
				return parede;
			};

			//funcao para movimentar o personagem recebendo x e y 
			moverPersonagem = (andarH, andarV) =>{
				personagemID.attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${andarV})`);
			};

			//funcao que recebe um sentido e inicia o intervalo de acordo com esse sentido
			andarPersonagem = (sentido) =>{
				switch (sentido) {
					case 'direita':  iniciarIntervalo('direita');  HV = 'HRight'; break;
					case 'esquerda': iniciarIntervalo('esquerda'); HV = 'HLeft'; break;
					case 'cima':  	 iniciarIntervalo('cima');	   HV = 'VUp'; break;
					case 'baixo':    iniciarIntervalo('baixo');    HV = 'VDown'; break;
			 	};
			};

			//funcao para iniciar o intervalo de movimentação
			iniciarIntervalo = (sentido) =>{
				if(!tecladoClicado){//se o teclado não estiver pressionado
					if(intervaloCriado){//se o intervalo já estiver sendo executado
						pararIntervalos()//para os intervalos
					}
					andarH = pegarPosicaoPersonagem('x');//recebe o x do perso
					andarV = pegarPosicaoPersonagem('y');//recebe o y do perso
					if(testarColisao()==false){//se o teste de colisao retornar false
						intervaloMovimento = window.setInterval(function(){
							intervaloCriado = true;//diz que o intervalo foi criado 
							switch (sentido) {//recebe o sentido e chama a funcao moverPersonagem de acordo com o sentido
								case 'direita':
									moverPersonagem(++andarH, andarV)
									break;
								case 'esquerda':
									moverPersonagem(--andarH, andarV)
									break;
								case 'cima':
									moverPersonagem(andarH, --andarV)
									break;
								case 'baixo':
									moverPersonagem(andarH, ++andarV)
									break;
							}
							if(testarColisao()==true){ //testa a colisao quando termina de mover o persona, caso for false, para o intervalo
								clearInterval(intervaloMovimento); //para o intervalo de mocimento do personagem
								switch (sentido) { //pega a posicao do personagem de acordo com o sentido informado por parametro
									case 'direita':
										andarH = pegarPosicaoPersonagem('x') - 2 ;
										break;
									case 'esquerda':
										andarH = pegarPosicaoPersonagem('x') + 2 ;
										break;
									case 'cima':
										andarV = pegarPosicaoPersonagem('y') + 2 ;
										break;
									case 'baixo':
										andarV = pegarPosicaoPersonagem('y') - 2 ;
										break;
								}
								moverPersonagem(andarH, andarV) //chama a funcao mover personagem
							}
						}, delayMovimento)
					}else{
						pararIntervalos();//para todos os intervalos na funcao
					}
					// função para parar os intervalo de movimentação do personagem
					pararIntervalos = () =>{
						clearInterval(intervaloMovimento); //para o intervalos
						intervaloCriado = false; //diz que o intervalo criado nao existe mais
					}
				}
			};

			//funcao que iniciar a animacao do personagem
			comecarAnimaPersonagem = () => {
				animarPersonagem = (sentidoAnima) =>{//funcao para animar o personagem
					$('[id*=personagemV], [id*=personagemH]').hide();
					$('#personagemH'+sentidoAnima+'1, #personagemH'+sentidoAnima+'2').show();
				}
				var x = 0;
				intervaloAnima = window.setInterval(function(){//intervalo de animacao 
					switch (HV) { //recebe um sentido vertical ou horizontal e anima o perso de acordo
						case 'HRight': 	animarPersonagem('Right'); 	break;
						case 'HLeft':	animarPersonagem('Left'); 	break;
						case 'VUp': 	animarPersonagem('Up');		break;
						case 'VDown': 	animarPersonagem('Down');	break;
					};
    
					if(x%2 == 0){//quando for par
						$('#personagem'+HV+'1').hide(); $('#personagem'+HV+'2').show();
					}else{ //quando for impar
						$('#personagem'+HV+'1').show(); $('#personagem'+HV+'2').hide();
					}
					x++;
				}, delayAnima);
			}
			
			//adiciona eventos de click no botoes
			$('#direita')	.click(function () { andarPersonagem('direita');  });
			$('#esquerda')	.click(function () { andarPersonagem('esquerda'); });
			$('#cima')		.click(function () { andarPersonagem('cima');     });
			$('#baixo')		.click(function () { andarPersonagem('baixo');    });
			
			//declarações de variaveis de colisoes
			var colisao, colisaoObj, colisaoFinal, colisaoBloqSaida;

			//funcao que testa a coliscao com paredes e os objetos
			testarColisao = () =>{
				//procura em todas as paredes e testar colisao em cada uma delas
				todasParedes.each((i, e) => {
					colisao = checkElementsColision(personagemID, $('#parede'+(i+cont)));//recebe true ou false
					if(colisao){ numParedeTocada = (i+cont); return false; }
				})

				//testa em cada objeto a coliscao com personagem
				todasObjetos.each((i, e) => { 
					colisaoObj = checkElementsColision(personagemID, $('#obj'+(i+cont)));//recebe true ou false
					if(colisaoObj){//se colidir
						objetosComidos++;//add ao contador de objetos comidos
						$('#obj'+(i+cont)).attr('transform', `matrix( 1, 0, 0, 1, 1000, 1000)`);
						testarObjetosColetados(objetosComidos);//testa se todos os objetos ja foram comidos
						console.log('obj comidos: '+objetosComidos)
						mostrarFeed(objetosComidos);
					}
				})
				return colisao; //retorna true se houver colisao
			}

			//funcao para mostrar os feeds em sequencias
			mostrarFeed = (objComido) =>{
				$('[id^=feed]').addClass('btn');
				$('[id^=feed]').hide();
				$('#feed'+objComido).show(300);
				$('#feed'+objComido).click(function(){
					$('#feed'+objComido).hide(300);		
				});
			}
			
			//funcao que testa a colisao com o ponto de chegada
			funcaoColisaoFinal = () =>{
				intervaloColisoes = window.setInterval(function(){//intervalo para o teste ser continuo, até ter colisao
					colisaoBloqSaida = checkElementsColision(personagemID, $('#bloqSaida'));
					if(colisaoBloqSaida){ //se colidir
						colisao = true; 
						$('#feedErrado').show(300); //mostra o feed que diz que não foram comidos todos os cal's 
						personagemID.attr('transform', 'matrix( 1, 0, 0, 1,'+340+','+pegarPosicaoPersonagem('y')+')');
						clearInterval(intervaloMovimento); //para o intervalo de movimento
					}
					colisaoFinal = checkElementsColision(personagemID, $('#pontoChegada')); //colisao com ponto de chegada
					if(colisaoFinal){ $('[id^=feed]').hide(); $('#feedFinal').show(300); personagemID.hide();  clearInterval(intervaloColisoes);}
				}, -100);
			}
			
			//funcao para testar se todos os objetos (cal's) foram coletados
			testarObjetosColetados = (objetosComidos) =>{
				if(objetosComidos == $('[id*=obj]').length){ // se o contador estiver igual ao tamanho do array
					 $('#bloqSaida').attr('transform', `matrix( 1, 0, 0, 1, 1000, 1000)`);
				}
			};

			//funcao que remove todos os invervalos e evts de teclado
			element.on('$destroy', ()=>{
				clearInterval(intervaloMovimento);
				clearInterval(intervaloColisoes);
				clearInterval(intervaloAnima);
				$(document).off('keydown', funcaoTecladoKeyDown);
				$(document).off('keyup', funcaoTecladoKeyUp);
			});
        }
    }
};
