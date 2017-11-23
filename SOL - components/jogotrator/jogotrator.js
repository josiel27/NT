
/*
Desenvolvedor: 	    josiel.faria								
Componente: 	    jogotrator
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
        link: function (scope, element, attr) {
			console.log('JOGO DO TRATOR')

			//inicializa a matrix do Milharal
			SVGUtils.initSVGElement($('#milharal'));

			//código para bloquear o botao avançar e só permitir depois de concluir o jogo
			let addObjetivoEvent = new CustomEvent('addObjetivo');
        	document.dispatchEvent(addObjetivoEvent);
			
			//variaveis utlizadas em todos os setInterval's do código
			var animacaoRoda, intervaloMilharal, 
			intervaloMilharalDois, intervaloAnimaPulando, 
			intervaloAnimaCaindo, intervaloMilho, 
			intervaloPedra, intervaloTronco;
			
			//esconde os elementos no svg
			$('[id*=feed], #teclado, [id*=milho], [id*=cestaMilho], [id*=pedra], [id^=tronco]').hide();
			
			//declaracao de variaveis
				var andarH, andarV,  //var utlizadas para movimentação da matrix do objeto
					andarMilharalH, andarMilharalV, //var utlizadas para movimentação da matrix do milharal
					tratorID = $('#trator'), tratorColisao = $('#tratorColisao1'), tratorColisaoCima = $('#tratorColisao2'), //var que recebem os elemtentos svg 
					chaoColisaoID = $('#chaoColisao'),
					milharalID = $('#milharal'),
					resetaAnimaMilharal = false, //variavel que dirá quando a animação do milharal será resetada
					pulando = false, //para saber se o trato está pulando
					arrayMilhos = [], arrayPedras = [],	arrayTroncos = [], arrayMilhosCesta = [], //array de objetos
					milhosPegados = 0,	pedrasPassadas = 0,	troncosPassados = 0, //var que serao utilizadas para saber se todos os objetos foram pegados ou passados
					numFeed = 0, colisaoComTrator = false, 
					pararIntervalos = false,
					comecarQueda = false, //var que dirá quando o trator estara caindo
					delayPulando = 1, delayMilharal = 1, delayAnima = 1, //var de delays de animacoes
					roda = 0, //var para dar start na anima da rota no svg
					obstaculosCriados = false,
					funcaoTecladoKeyDown; //var para funcao do teclado

				//add os elementos no arrays correspondentes
				arrayMilhosCesta.push( $('#cestaMilho1'), $('#cestaMilho2'), $('#cestaMilho3'));
				arrayMilhos.push( $('#milho1'), $('#milho2'), $('#milho3'));
				arrayPedras.push( $('#pedra1'), $('#pedra2'), $('#pedra3'));
				arrayTroncos.push( $('#tronco1'), $('#tronco2'), $('#tronco3'));
			
			
			//declara os delay de acordo com o navegador utilizado
			if(GetBrowserInfo() == 'firefox'){
				delayPulando = 17;  delayMilharal = 5; delayAnima = 1;
			}else{//chrome/ie
				delayPulando = 20; delayMilharal = 15; delayAnima = 15;
			};
			
			//funcao de colisao
			checkElementsColision = (element1, element2) =>{
				element1 = angular.element(element1);
				element2 = angular.element(element2);
				rect1 = element1[0].getBoundingClientRect();
				rect2 = element2[0].getBoundingClientRect();
				return  rect1.left < rect2.left + rect2.width &&
						rect1.left + rect1.width > rect2.left &&
						rect1.top < rect2.top + rect2.height &&
						rect1.height + rect1.top > rect2.top ;
			  }
			
			//funcao que recebe a posicao do milharal de acordo com o parametro passado
			pegarPosicaoMilharal = (posicaoXY) =>{
				matrixTransformMilharal = document.getElementById('milharal').transform.animVal[0].matrix;
				switch (posicaoXY) {
					case 'x': posicMatrixMilharal = matrixTransformMilharal.e; break;
					case 'y': posicMatrixMilharal = matrixTransformMilharal.f; break;
				}
				return posicMatrixMilharal
			};
			
			//funcao que recebe a posicao do trator de acordo com o parametro passado
			pegarPosicaoTrator = (posicaoXY) =>{
				matrixTransform = document.getElementById('trator').transform.animVal[0].matrix;
				switch (posicaoXY) {
					case 'x': posicMatrix = matrixTransform.e; break;
					case 'y': posicMatrix = matrixTransform.f; break;
					case 'bottom': posicMatrix = document.getElementById('trator').getBoundingClientRect().bottom; break;
				}
				return posicMatrix;
			};
			
			//funcao para iniciar a animacao do milharal
			começarAnimacaoMilharal = () =>{
				animaMilharal = () =>{
					resetaAnimaMilharal = false; 
					andarMilharalH = pegarPosicaoMilharal('x', 'milharal');
					andarMilharalV = pegarPosicaoMilharal('y', 'milharal');

					//inicia intervalo de movimento do svg
					intervaloMilharal = window.setInterval(function(){
						if(resetaAnimaMilharal == false){
							--andarMilharalH;
							--andarMilharalH;
							milharalID.attr('transform', `matrix( 1, 0, 0, 1, ${--andarMilharalH},${andarMilharalV})`);
							if(andarMilharalH == -1500){ clearInterval(intervaloMilharal); resetaAnimaMilharal = true; };//reseta a animacao
						}
					}, delayMilharal);
				}; 
				animaMilharal();//chama a funcao de animar milharal

				//chama o intervalo pela segunda vez
				intervaloMilharalDois = window.setInterval(function(){
					if(resetaAnimaMilharal){
						andarMilharalH = 0;
						andarMilharalV = 0;
						milharalID.attr('transform', `matrix( 1, 0, 0, 1, ${andarMilharalH},${andarMilharalV})`);
						resetaAnimaMilharal = false;
						animaMilharal();
					}
				}, 1);
			};
			
			//funcao para dar movimento de pulo ao trator
			pularPersonagem = () => {
				var y = 0;
				andarH = pegarPosicaoTrator('x');
				andarV = pegarPosicaoTrator('y');
				if(!pulando){//se nao estiver pulando
					pulando = true;//diz que esta pulando

					intervaloAnimaPulando = window.setInterval(function(){//inicia animacao de pulo
						y++; andarV = andarV - 2;
						tratorID.attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${--andarV})`);//incrementa na posicao y do trator

						if(y == 40){//quando y for 40, ira para  a anima de pulo e iniciara a de caida
							clearInterval(intervaloAnimaPulando);//para animacao de pulo 
							var segurarPulo = window.setInterval(function(){
								comecarQueda = true; //diz que estara caindo
								clearInterval(segurarPulo); // para a animacao de segurar pulo
							}, 400);
							intervaloAnimaCaindo = window.setInterval(function(){ //inicia a animacao de caida do trator
								if(comecarQueda){ //se for verdade
									y--; andarV = andarV + 3;
									tratorID.attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${++andarV})`); //incrementa na posicao y a queda do trator
									if(testarColisaoCaindo()){ //quando tiver colisao para de cair
										pulando = false; //diz que nao esta mais pulando
										comecarQueda = false;
										clearInterval(intervaloAnimaCaindo);
									}
								}
							}, delayPulando);
						}
					}, delayPulando);	
				}
				//funcao para testar colisao quando o personagem estiver caindo
				testarColisaoCaindo = () =>{
					var colisaoChao = checkElementsColision(tratorColisao, chaoColisaoID);
					return colisaoChao;
				};
			};
			
			//funcao para add movimentacao dos objetos
			adiocinarObstaculo = () =>{
				var arrayMilhoH = [1000, 4000, 7000], //posicao x do milho no svg	
					arrayPedraH = [2000, 5000, 8000], //posicao x da pedra no svg
					arrayTroncoH = [3000, 6000, 9000];//posicao x do tronco no svg
				
				milhoV = 120; pedraV = 310; troncoV = 300; //posicao y dos objetos
				 
				$('[id^=milho], [id^=pedra], [id^=tronco]').show(); //mostra todos os elementos
				
				intervaloMilho = window.setInterval(function(){ //inicia intervalo para animar milho
					if(pararIntervalos == false){
						if(testarColisaoObsMilho()){ //testa a coliscao com cada milho
							milhosPegados++; //add +1 no contador
							arrayMilhos[milhoColidido].hide(); //esconde o objeto que foi pegado ou passado
							arrayMilhosCesta[milhoColidido].show(); //add na cesta o milho
							if(milhosPegados >= 3){ clearInterval(intervaloMilho); } // se o objeto for = a 3, para o intervalo de movimentacao do milho
							mostraFeed(); // mostra o feed
						}
						for(var i = 0; i <= 2; i++){
							arrayMilhoH[i] = arrayMilhoH[i]- 5;
							arrayMilhos[i].attr('transform', `matrix( 1, 0, 0, 1, ${arrayMilhoH[i]},${milhoV})`);
						}
					}
				}, delayAnima);
				
				intervaloPedra = window.setInterval(function(){ //inicia intervalo para animar pedra
					if(pararIntervalos == false){
						if(testarColisaoObsPedra()){//testa a coliscao com cada pedra
							if(colisaoComTrator == true){ //se houver colisao, ira adicionar o efeito de shake no svg
								$('svg').addClass('animated shake');//efeito do animate para colisoes
								var inteShake = setInterval(function(){ $('svg').removeClass('shake'); clearInterval(inteShake ); }, 3000); //depois de um intervalo, remove o efeito de colisao
							}
							pedrasPassadas++;  //add +1 no contador
							arrayPedras[pedraColidido].hide();  //esconde o objeto que foi pegado ou passado
							if(pedrasPassadas >= 3){ clearInterval(intervaloPedra); } // se o objeto for = a 3, para o intervalo de movimentacao do milho
							mostraFeed();
						}
						for(var i = 0; i <= 2; i++){
							arrayPedraH[i] = arrayPedraH[i]- 5;
							arrayPedras[i].attr('transform', `matrix( 1, 0, 0, 1, ${arrayPedraH[i]},${pedraV})`);
						}
					}
				}, delayAnima);
				
				intervaloTronco = window.setInterval(function(){ //inicia intervalo para animar tronco
					if(pararIntervalos == false){
						if(testarColisaoObsTronco()){ //testa a coliscao com cada tronco
							if(colisaoComTrator == true){ //se houver colisao, ira adicionar o efeito de shake no svg
								$('svg').addClass('animated shake'); //efeito do animate para colisoes
								var inteShake = setInterval(function(){ $('svg').removeClass('shake'); clearInterval(inteShake ); }, 3000); //depois de um intervalo, remove o efeito de colisao
							}
							troncosPassados++; //add +1 no contador
							arrayTroncos[troncoColidido].hide();  //esconde o objeto que foi pegado ou passado
							if(troncosPassados >= 3){ clearInterval(intervaloTronco); } // se o objeto for = a 3, para o intervalo de movimentacao do milho
							mostraFeed();
						}
						for(var i = 0; i <= 2; i++){
							arrayTroncoH[i] = arrayTroncoH[i]- 5;
							arrayTroncos[i].attr('transform', `matrix( 1, 0, 0, 1, ${arrayTroncoH[i]},${troncoV})`);
						}
					}
				}, delayAnima);
				
				//funcao para testar colisacao com o trator ou com a colisao da parede
				testarColisaoObsMilho = () =>{
					for(var i = 0; i <= 2; i++){
						var colisaoMilho = checkElementsColision(tratorColisao, arrayMilhos[i]); //colisao com o trator
						if(colisaoMilho){ milhoColidido=i; break; };
						colisaoMilho = checkElementsColision(tratorColisaoCima, arrayMilhos[i]); //colisao com a parede		
						if(colisaoMilho){ milhoColidido=i; break; };
					}
					return colisaoMilho;
				};
				
				//funcao para testar colisacao com o trator ou com a colisao da parede
				testarColisaoObsPedra = () =>{
					for(var i = 0; i <= 2; i++){
						var colisaoPedra = checkElementsColision(tratorColisao, arrayPedras[i]); //colisao com o trator
						if(colisaoPedra){ pedraColidido=i; colisaoComTrator = true; break;}
						colisaoPedra = checkElementsColision(tratorColisaoCima, arrayPedras[i]); //colisao com a parede	
						if(colisaoPedra){ pedraColidido=i; colisaoComTrator = false; break;}
					}
					return colisaoPedra;
				}
				
				//funcao para testar colisacao com o trator ou com a colisao da parede
				testarColisaoObsTronco = () =>{
					for(var i = 0; i <= 2; i++){
						var colisaoTronco = checkElementsColision(tratorColisao, arrayTroncos[i]); //colisao com o trator
						if(colisaoTronco){ troncoColidido=i; colisaoComTrator = true; break;}
						colisaoTronco = checkElementsColision(tratorColisaoCima, arrayTroncos[i]); //colisao com a parede	
						if(colisaoTronco){ troncoColidido=i; colisaoComTrator = false; break;}
					}
					return colisaoTronco;
				}
				
				//funcao que mostra o feed correspondente ao item coletado ou passado
				mostraFeed = () =>{
					pararIntervalos = true; //para o intervalo, para nao aparece mais os objetos enquanto o feed estiver sendo mostrado
					numFeed++; //add +1 ao contador para depois testar a qtd de feeds vistos
					$('#Janelas').show(); 
					$('#feed'+numFeed).show(300); //mostra o feed
					$('#feed'+(numFeed-1)).hide();//esconde o ultimo
					$('#Janelas').click(function () {  //add o evt de click nas janelas
						$('#Janelas').hide(); pararIntervalos = false;
						if(milhosPegados >= 3 && pedrasPassadas >= 3 && troncosPassados >= 3){ //se todos forem coletados
							$('#feedFinal').show(300); //mostra o feedFinal
							$('#teclado').hide(); //apaga o teclado
							
							//funcao que desbloqueia o botao avançãr
							let removeObjetivoEvent = new CustomEvent('removeObjetivo');
        					document.dispatchEvent(removeObjetivoEvent);
						}
					});
					
				};
			};
			
			//funcao para saber qual o navegador utilizado
			function GetBrowserInfo() {
				var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
				var isChrome = !!window.chrome;             			 // Chrome 1+
				if (isFirefox) { return 'firefox'; }
				else if (isChrome) { return 'chrome'; }		
				else {  return 0; }
			}
			
			//funcao para animar roda de acordo com navegador utilizado
			animarRoda = () =>{
				if(GetBrowserInfo() == 'firefox'){
					transfOrigin = '0% 0%';
				}else{
					transfOrigin = '50% 50%';
				}
				animacaoRoda = window.setInterval(function(){	//intervalo de animacao	
					$('#roda1').attr('style', `-webkit-transform-origin: ${transfOrigin}; -webkit-transform: rotate(${++roda}deg); transform: rotate(${++roda}deg);`);//incrementa na animcao uma rotacao
					$('#roda2').attr('style', `-webkit-transform-origin: ${transfOrigin}; -webkit-transform: rotate(${++roda}deg); transform: rotate(${++roda}deg);`);//incrementa na animcao uma rotacao
				}, 30);
			};

			//ESSES DUAS FUNCOES ESTAO SEPARADAS, PORQUE A TECLA UP SÒ PODE SER ATIVADA DEPOIS DE DAR START NO JOGO
			//funcao para pressionar a tecla Up
			funcaoTecladoKeyDown = function (objEvent) { 
				if (objEvent.keyCode == 38) {
					$('#cima').click();
				}
			}
			//funcao para pressionar o Enter
			funcaoTecladEnter = function (objEvent) { 
				if(objEvent.keyCode == 13){
					$('#comando').hide(200);
					começarJogo();
				}
				$(document).off('keydown', funcaoTecladEnter); //remove a funcao de teclado pressionado do Enter
			}

			//chama a funcao para usar o ENTER
			$(document).on('keydown', funcaoTecladEnter); 
			
			//funcao que da start no jogo
			começarJogo = () =>{
					numFeed = 0; //inicializa cont
					$('#teclado').show(300); //mostra o teclado
					
					//chama a funcao para usar o teclado (UP)
					$(document).on('keydown', funcaoTecladoKeyDown); 
 
					adiocinarObstaculo(); //chama a funcao
					começarAnimacaoMilharal(); //chama a funcao
					animarRoda(); //chama a funcao
			};	

			//funcao para resetar a anima das rodas
			resetarJogo = () =>{
				$('#roda1').attr('style', `-webkit-transform: rotate(${roda}deg); transform: rotate(${roda}deg);`);
				$('#roda2').attr('style', `-webkit-transform: rotate(${roda}deg); transform: rotate(${roda}deg);`);
			}
			resetarJogo(); // chama a funcao
			
			//eventos de click
			$('#cima')		.click(function () { pularPersonagem('cima');  });
			$('#comando')	.click(function () { $('#comando').hide(); começarJogo(); });
			
			
			
			// função executada quando o elemento é removido da tela
			element.on('$destroy', ()=>{
				clearInterval(intervaloMilho)
				clearInterval(intervaloMilharal)
				clearInterval(intervaloPedra)
				clearInterval(intervaloTronco)
				clearInterval(animacaoRoda)
				numFeed = 0;
				arrayMilhos = [], arrayPedras = [],	arrayTroncos = [], arrayMilhosCesta = [],
				milhosPegados = 0,	pedrasPassadas = 0,	troncosPassados = 0;
				$(document).off('keydown', funcaoTecladoKeyDown); //remove a funcao de teclado pressionado do Up
			});
        }
    }
};
