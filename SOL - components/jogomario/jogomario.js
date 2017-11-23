
/*
Desenvolvedor: 	    josiel.faria								
Componente: 	    jogomario
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
			console.log('jogo Mario CAL');
			
			//inicializa matrix do personagem
			SVGUtils.initSVGElement($('#personagem'));
			
			//funcao para bloquear botao avançar
			let addObjetivoEvent = new CustomEvent('addObjetivo');
        	document.dispatchEvent(addObjetivoEvent);
			
			//esconde elementos svg
			$('#feedFinal, [id*=feed], [id*=personagemA], [id*=personagemPulando], #personagemParadoE').hide();
			
			//declaração de variaveis
			var personagemID = $('#personagem'),
				personagemColisao = $('#personagemColisao'),
				calColisao = $('#calColisao'),
				intervaloAnimaCriado = false,
				andarH, andarV,
				AnimaSentido = false,
				qtdFeedFinal = 0,
				sentidoMov = 'direita',
				pulando = false,
				andandoAnima = false,
				andando = false,
				posicObstaculosColisao,
				gravidade = false,
				gravidadeAnima = false,
				delayCaindo = 15,
				delayAnima = 70,
				delayMovimento = 10,
				delayPulando = 7;
			
			//variaveis para contagem de cal's colhetados para apresentar o feed corresponde a cada conjunto de cal
			var numCalA = 0,numCalB = 0,numCalC = 0,numCalD = 0,numCalE = 0,numCalF = 0,numCalG = 0,numCalH = 0,numCalI = 0,numCalJ = 0;
			
			
			//declara os delay de acordo com o navegador utilizado
			console.log(GetBrowserInfo())
			if(GetBrowserInfo() == 'firefox'){
				delayCaindo = 5; delayPulando = 3; delayAnima = 100; delayMovimento = 2;
			}else{//chrome/ie
				delayCaindo = 15; delayPulando = 10; delayAnima = 120; delayMovimento = 15;
			}
			
			//funcao para saber qual o navegador utilizado
			function GetBrowserInfo() {
				var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
				var isChrome = !!window.chrome;             			 // Chrome 1+
				if (isFirefox) { return 'firefox'; }
				else if (isChrome) { return 'chrome'; }		
				else {  return 0; }
			}
			
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
			
			//funcao que retorna a posicao de cada objetaculo colidido
			pegarposicObstaculosColisao = (obs) =>{
				posicObstaculosColisao =  document.getElementById('obstaculo'+obs).getBoundingClientRect().top;
				return posicObstaculosColisao;
			};
			
			//funcao que retorna a posicao atual do personagem de acordo com o parametro informado
			pegarPosicaoPersonagem = (posicaoXY) =>{
				personagemMatrix = document.getElementById('personagem').transform.animVal[0].matrix;
				switch (posicaoXY) {
					case 'x': posicPersonagem = personagemMatrix.e; break;
					case 'y': posicPersonagem = personagemMatrix.f; break;
					case 'bottom': posicPersonagem = document.getElementById('personagemColisao').getBoundingClientRect().bottom; break;
				}
				return posicPersonagem;
			}
			
			//funcao para dizer qual sentido o intervalo ira iniciar
			andarPersonagem = (sentido) =>{
				switch (sentido) {
					case 'direita':  iniciarIntervaloMovimento('direita');  break;
					case 'esquerda': iniciarIntervaloMovimento('esquerda'); break;
			 	}
			};
			
			//funcao para iniciar o intervalo de acordo com o sentido passado por parametro
			iniciarIntervaloMovimento = (sentido) =>{
				
				//var que recebe as posic x/y do personagem
				andarH = pegarPosicaoPersonagem('x');
				andarV = pegarPosicaoPersonagem('y');
				//var que recebe o valor do movimento
				var posicFinalAndadoDir = andarH+40,
					 posicFinalAndadoEsq = andarH-40;
				//flag pra sabe se o personagem já está andando ou nao
				if(andando){
					clearInterval(intervalo);
				}else{
					//seta todas as var para não poder repetir funcoes e intervalos de movimento
					andandoAnima = true; andando = true; pulando = true;
					var intervalo = window.setInterval(function(){ 
						testarColisaoCal();//chamada da funcao de teste de colisao com cal's
						if(gravidade){ gravidade = false; clearInterval(intervalo)}//verifica se colidiu com a gravidade, se sim, nao pode mover
						switch (sentido) {
							case 'direita':  
								if(testarColisaoParede()){
									andando = false; pulando = false;
									clearInterval(intervalo);
								}else{
									if(andarH <= posicFinalAndadoDir){
										++andarH;
										personagemID.attr('transform', `matrix( 1, 0, 0, 1, ${++andarH},${andarV})`);
									}else{ 
										andando = false; pulando = false;
										clearInterval(intervalo);
									}
								}
								break;
							case 'esquerda': 
								if(testarColisaoParede()){
									andando = false; pulando = false;
									clearInterval(intervalo);
								}else{
									if(andarH >= posicFinalAndadoEsq){
										--andarH;
										personagemID.attr('transform', `matrix( 1, 0, 0, 1, ${--andarH},${andarV})`);
									}else{ 
										andando = false; pulando = false;
										clearInterval(intervalo);
									}
								}
								break;
						}
					}, delayMovimento)
				}

				//funcao para testar colisao com cada parede
				testarColisaoParede = () =>{
					for(var i = 1; i <= 2	; i++){
						var colisaoParede = checkElementsColision(personagemColisao, $('#parede'+i));
						if(colisaoParede){ 
							if(i == 1){ value = 1 }else{ value = -1 }
							andarHAtual = pegarPosicaoPersonagem('x')+value;
							andarVAtual = pegarPosicaoPersonagem('y');
							personagemID.attr('transform', `matrix( 1, 0, 0, 1, ${(andarHAtual)},${andarVAtual})`);
							break; 
						};
					}
					return colisaoParede;
				};
			};
			
			//funcao para o personagem poder descer de cada objeto ao teclar ou clicar no botar: 'BAIXO'
			cairPersonagem = () =>{
			 	var y = 0;
				if(pulando==false){
					var intervaloAnimaCaindo = window.setInterval(function(){
						y--;
						++andarV;
						andandoAnima = true; andando = true;	pulando = true;
						$('[id*=personagemParado]').hide()
						if(sentidoMov == 'direita'){
							$('#personagemPulandoD').show(); $('#personagemPulandoE').hide()
						 }else{
							$('#personagemPulandoE').show(); $('#personagemPulandoD').hide()
						 }
						if(pegarPosicaoPersonagem('bottom') < pegarposicObstaculosColisao('7')){
						++andarV;
						personagemID.attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${++andarV})`);
							if(y < -20){
								for(var i  = 1; i <= 7; i++){
									if(pegarposicObstaculosColisao(''+i+'') < pegarPosicaoPersonagem('bottom')){
										r = ''+i+'';
										if(testarColisaoCaindo(r)){
											$('#personagemParadoD, #personagemParadoE, #personagemPulandoD, #personagemPulandoE').hide();
											if(sentidoMov == 'direita'){
												$('#personagemParadoD').show(); 
											 }else{
												$('#personagemParadoE').show(); 
											 }
											pulando = false; andandoAnima = false; andando = false;
											clearInterval(intervaloAnimaCaindo);
										}
									}
								}
							}
						}else{ 
							$('#personagemParadoD, #personagemParadoE, #personagemPulandoD, #personagemPulandoE').hide();
							if(sentidoMov == 'direita'){
								$('#personagemParadoD').show(); 
							 }else{
								$('#personagemParadoE').show(); 
							 }
							pulando = false; andandoAnima = false; andando = false;
							--andarV;
							personagemID.attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${--andarV})`);
							clearInterval(intervaloAnimaCaindo);
						}
					}, delayCaindo);
				}
			}
			
			//funcao para fazer o movimento de pulo do personagem
			pularPersonagem = () => {
				var y = 0;
				andarH = pegarPosicaoPersonagem('x');
				andarV = pegarPosicaoPersonagem('y');
				if(pulando){
					clearInterval(intervaloAnimaPulando);
				}else{
					andandoAnima = true; pulando = true;
					var intervaloAnimaPulando = window.setInterval(function(){
						testarColisaoCal();
						$('[id*=personagemParado]').hide()
						if(sentidoMov == 'direita'){
							$('#personagemPulandoD').show(); $('#personagemPulandoE').hide()
						 }else{
							$('#personagemPulandoE').show(); $('#personagemPulandoD').hide()
						 }
						y++;
						--andarV;
						personagemID.attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${--andarV})`);
						if(y == 80){
							clearInterval(intervaloAnimaPulando);
							var intervaloAnimaCaindo = window.setInterval(function(){
								y--;
								if(y == 100){ andando = true; }//corrigindo bug de movimento quando cai no chão
								++andarV;
								personagemID.attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${++andarV})`);

								for(var i  = 1; i <= 7; i++){
									if(pegarposicObstaculosColisao(''+i+'') < pegarPosicaoPersonagem('bottom')){
										r = ''+i+'';
										if(testarColisaoCaindo(r)){
											$('#personagemParadoD, #personagemParadoE, #personagemPulandoD, #personagemPulandoE').hide();
											if(sentidoMov == 'direita'){
												$('#personagemParadoD').show(); 
											 }else{
												$('#personagemParadoE').show(); 
											 }
											pulando = false; andandoAnima = false;	andando = false;
											clearInterval(intervaloAnimaCaindo);
										}
									}
								}
							}, delayCaindo);
						}
					}, delayPulando);	
				}
				//funcao que testa a colisao qd o personagem estiver e movimento de queda
				testarColisaoCaindo = (r) =>{
					var colisaoObstaculos = checkElementsColision(personagemColisao, $('#obstaculo'+r));
					return colisaoObstaculos;
				};
			};
			
			//funcao que dar o start na animacao
			iniciarAnima = () =>{
				clearInterval(intervaloAnima); 
				var x = 0;
				switch (AnimaSentido) {//recebe um sentido
					case 'direita': 
						if(andandoAnima){
							clearInterval(intervaloAnima);
						}else{
							andandoAnima = true;
							var intervaloAnima = window.setInterval(function(){
								testarColisaoGravidade();
								if(gravidadeAnima){ gravidade = false; clearInterval(intervaloAnima)}//verifica se colidiu com a gravidade, se sim, nao pode mover
								$('[id*=personagemParado]').hide()
								x++;
								$('#personagemAnimaD'+x).show()
								$('#personagemAnimaD'+(x-1)).hide()

								if(x == 6){//num de animações
									$('#personagemParadoD').show()
									$('[id*=personagemAnima]').hide()
									andandoAnima = false;
									clearInterval(intervaloAnima);
								}
							}, delayAnima);
						}
						break;
					case 'esquerda': 
						if(andandoAnima){
							clearInterval(intervaloAnima);
						}else{
							andandoAnima = true;
							var intervaloAnima = window.setInterval(function(){
								testarColisaoGravidade();
								if(gravidadeAnima){ gravidade = false; clearInterval(intervaloAnima)}//verifica se colidiu com a gravidade, se sim, nao pode mover
								$('[id*=personagemParado]').hide()
								x++;
								$('#personagemAnimaE'+x).show()
								$('#personagemAnimaE'+(x-1)).hide()

								if(x == 6){//num de animações
									$('#personagemParadoE').show()
									$('[id*=personagemAnima]').hide()
									andandoAnima = false;
									clearInterval(intervaloAnima);
								}
							}, delayAnima);
						}
						break;
				}

				//funcao para testar colisao com obstaculos de colisoes para gravidade
				testarColisaoGravidade=()=>{
					//recebe as posicoes do personagem
					andarH = pegarPosicaoPersonagem('x');
					andarV = pegarPosicaoPersonagem('y');
					for(var i = 1; i <= 10; i++){
						var colisaoObstaculos = checkElementsColision(personagemColisao, $('#colisaoCaida'+i));
						if(colisaoObstaculos){
							gravidade = true; gravidadeAnima = true;
							var y = 0;
							var intervaloAnimaCaindo = window.setInterval(function(){
								$('[id*=personagemParado], [id*=personagemAnima]').hide()
								if(sentidoMov == 'direita'){
									$('#personagemPulandoD').show(); $('#personagemPulandoE').hide()
								 }else{
									$('#personagemPulandoE').show(); $('#personagemPulandoD').hide()
								 }
								y--;
								++andarV;
								personagemID.attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${++andarV})`);

								for(var i  = 1; i <= 7; i++){
									if(pegarposicObstaculosColisao(''+i+'') < pegarPosicaoPersonagem('bottom')){
										r = ''+i+'';
										if(testarColisaoCaindo(r)){
											$('#personagemParadoD, #personagemParadoE, #personagemPulandoD, #personagemPulandoE').hide();
											if(sentidoMov == 'direita'){
												$('#personagemParadoD').show(); 
											 }else{
												$('#personagemParadoE').show(); 
											 }
											pulando = false; andandoAnima = false; andando = false;
											gravidade = false; gravidadeAnima = false;
											clearInterval(intervaloAnimaCaindo);
										}
									}
								}
							}, delayCaindo);
						}
					}
				}
			}
			iniciarAnima();
			
			//funcao para testar colisao com cada grupo de cal
			testarColisaoCal = () =>{
				for(var i = 1; i <= 4; i++){
					var colisaoCalA = checkElementsColision(calColisao, $('#calA'+i));
					if(colisaoCalA){ $('#calA'+i).hide(); numCalA++; if (numCalA == 4){ $('[id*=feed]').hide(); $('#feed1, #feed').show(); qtdFeedFinal++;  } break; };
					var colisaoCalB = checkElementsColision(calColisao, $('#calB'+i));
					if(colisaoCalB){ $('#calB'+i).hide(); numCalB++; if (numCalB == 4){ $('[id*=feed]').hide(); $('#feed2, #feed').show(); qtdFeedFinal++; } break; };
					var colisaoCalC = checkElementsColision(calColisao, $('#calC'+i));
					if(colisaoCalC){ $('#calC'+i).hide(); numCalC++; if (numCalC == 4){ $('[id*=feed]').hide(); $('#feed3, #feed').show(); qtdFeedFinal++; } break; };
					var colisaoCalD = checkElementsColision(calColisao, $('#calD'+i));
					if(colisaoCalD){ $('#calD'+i).hide(); numCalD++; if (numCalD == 4){ $('[id*=feed]').hide(); $('#feed4, #feed').show(); qtdFeedFinal++; } break; };
					var colisaoCalE = checkElementsColision(calColisao, $('#calE'+i));
					if(colisaoCalE){ $('#calE'+i).hide(); numCalE++; if (numCalE == 4){ $('[id*=feed]').hide(); $('#feed5, #feed').show(); qtdFeedFinal++; } break; };
					var colisaoCalF = checkElementsColision(calColisao, $('#calF'+i));
					if(colisaoCalF){ $('#calF'+i).hide(); numCalF++; if (numCalF == 4){ $('[id*=feed]').hide(); $('#feed6, #feed').show(); qtdFeedFinal++; } break; };
					var colisaoCalG = checkElementsColision(calColisao, $('#calG'+i));
					if(colisaoCalG){ $('#calG'+i).hide(); numCalG++; if (numCalG == 4){ $('[id*=feed]').hide(); $('#feed7, #feed').show(); qtdFeedFinal++; } break; };
					var colisaoCalH = checkElementsColision(calColisao, $('#calH'+i));
					if(colisaoCalH){ $('#calH'+i).hide(); numCalH++; if (numCalH == 4){ $('[id*=feed]').hide(); $('#feed8, #feed').show(); qtdFeedFinal++; } break; };
					var colisaoCalI = checkElementsColision(calColisao, $('#calI'+i));
					if(colisaoCalI){ $('#calI'+i).hide(); numCalI++; if (numCalI == 4){ $('[id*=feed]').hide(); $('#feed9, #feed').show(); qtdFeedFinal++; } break; };
					var colisaoCalJ = checkElementsColision(calColisao, $('#calJ'+i));
					if(colisaoCalJ){ $('#calJ'+i).hide(); numCalJ++; if (numCalJ == 4){ $('[id*=feed]').hide(); $('#feed10, #feed').show(); qtdFeedFinal++; } break; };
				}
			};
			
			//funcao para testar se todos os feeds foram mostrados, se sim, terminara o jogo
			testarQtdFeeds = () =>{
				if(qtdFeedFinal == 10){
					$('#personagem').hide();   
					$('#feedFinal').show(300); 
					//funcao quer desbloqueia o botao de avançar para o prox slide
					let removeObjetivoEvent = new CustomEvent('removeObjetivo');
        			document.dispatchEvent(removeObjetivoEvent);
				}
			}
			
			//iniciaMatrix personagem
			andarH = pegarPosicaoPersonagem('x');
			andarV = pegarPosicaoPersonagem('y');
			personagemID.attr('transform', `matrix( 1, 0, 0, 1, ${(andarH)},${andarV})`);
			
			
			//adiciona eventos de click no botoes
			$('#direita')	.click(function () { AnimaSentido = 'direita';  sentidoMov = 'direita'; iniciarAnima(); });
			$('#esquerda')	.click(function () { AnimaSentido = 'esquerda'; sentidoMov = 'esquerda'; iniciarAnima(); });
			//duplica o evt de click para poder chamar a funcao em paralelo
			$('#direita')	.click(function () {  andarPersonagem('direita'); });
			$('#esquerda')	.click(function () { andarPersonagem('esquerda'); });
			$('#cima')		.click(function () { pularPersonagem('cima');     });
			$('#baixo')		.click(function () { cairPersonagem('baixo');     });
			$('#comando')	.click(function () { $('#comando').hide(300) });//apaga o comando Iniciar
			
			//evt que faz com que cada click em qualquer feed fechara o mesmo e testara se foi o ultim feed mostrado, se sim, terminara o jogo
			$('#feed')		.click(function () { $('#feed').hide(); testarQtdFeeds(); });

			//eventos de teclado chamando a funcoes de evt declarados no codigo
			$(document).keydown(function (objEvent) {
				if (objEvent.keyCode == 13) {
					$('#comando').click();
					$('#feed').hide(); testarQtdFeeds(); 
				} else if (objEvent.keyCode == 39) {
					$('#direita').click();
				} else if (objEvent.keyCode == 40) {
					$('#baixo').click();
				} else if (objEvent.keyCode == 37) {
					$('#esquerda').click();
				} else if (objEvent.keyCode == 38) {
					$('#cima').click();
				}
			});
			
			
			
        }
    }
};
