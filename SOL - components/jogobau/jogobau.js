
/*
	Desenvolvedor: 	    josiel.faria				
	Componente: 	    jogobau
	Descrição:		    Componente local desenvolvido para o AIO-SOL					
	Funcionalidades:	Animação SVG dos objetos, Eventos de click, Questionário, 
						Função para objeto SVG seguir mouse
	Última alteração: 07/11/2017
	Autor da alteração: josiel.faria
	Alteralções: Comentários do código
*/

module.exports = function ($compile, $rootScope, SVGUtils) {
    return {
		restrict: 'AE',
        replace: false,
        link: function (scope, element, attr) {
			console.log('JOGO DO BAU')


			let addObjetivoEvent = new CustomEvent('addObjetivo');
        	document.dispatchEvent(addObjetivoEvent);
			
			$('[id*=feed], [id*=questao], [id*=bauAberto], #picareta').hide();
			
			//declaração de variaveis que serão utilizadas no jogo
			var arrayQuestoesRespondidas = [false, false, false, false, false, false], //array de questoes respondidas
				questaoMostrada = false, //diz que a questao nao esta sendo mostrada
				browserFirefox = false, 
				girar = 0,
				picaretaAnima = $('#picaretaAnima'),
				picaretaID = $('#picareta'),
				mouseIconID = $('#mouse_icon'),
				booleanPicareta = false,
				transfOrigin = '50% 50%';

			//funcao para saber qual o navegador utilizado e setar as porcentagens correspondentes ao navegador
			function GetBrowserInfo() {
				var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
				var isChrome = !!window.chrome;             			 // Chrome 1+
				if (isFirefox) { 
					browserFirefox = true;//se for true não irá esconder o mouse-icon
					transfOrigin = '20% 20%'; //porcertagem do transformOrigin do firefox


				}else if (isChrome) {  
					transfOrigin = '50% 50%'; //porcertagem do transformOrigin do chrome
				}else {  
					transfOrigin = '50% 50%';  //porcertagem do transformOrigin de qqr navegador
				}
			};
			GetBrowserInfo(); //chamando funcao para testar qual navegador está sendo utilizado

			//funcao para pegar posicao de cada bau
			pegarposicBau = (numBau) =>{
				posicBau =  document.getElementById('bau'+numBau).transform.animVal[0].matrix;//recebe a matrix de cada bau
				return posicBau; //retorna matrix
			};
			
			//funcao para mostrar a questao de acordo com o parametro mostrado
			mostraQuestao = (numQuestao) => {
				picaretaID.show(); //mostra a picareta
				$('[id*=marcado]').hide(); //esconde todos os marcados dos radios
				$('#questao'+numQuestao).show(300); // mostra cada questao referente ao numero da questao passado por parametro
				
				picaretaID.attr('transform', `matrix( 1, 0, 0, 1, ${pegarposicBau(numQuestao).e+20},${pegarposicBau(numQuestao).f+2})`); //seta uma posicao à picareta
				
				contadorPicareta = 0;
				var intervaloPicareta = window.setInterval(function(){//intevalo de animacao da picareta
					if(booleanPicareta){//se a var booleana for true iniciar a anima para cima
						picaretaAnima.attr('style', `-webkit-transform-origin: ${transfOrigin}; -webkit-transform: rotate(${++girar}deg); transform: rotate(${++girar}deg);`); //incrementando a animacao da picareta
						if(girar>=90){ booleanPicareta = false; } //quando girar for igual a 90, para a animacao de cima da picareta e iniciara a de descida
					}else{
						picaretaAnima.attr('style', `-webkit-transform-origin: ${transfOrigin}; -webkit-transform: rotate(${-girar}deg); transform: rotate(${--girar}deg);`); //incrementando a animacao da picareta
						if(girar<=0){ contadorPicareta++; booleanPicareta = true; } //quando girar for igual a 0, para a animacao de descida da picareta e iniciara a de subida
						if(contadorPicareta == 3){ //quando incrementar a anima 3x, parara a animacao da picareta
							picaretaID.hide(); //apaga a picareta
							$('#bauAberto'+numQuestao).show(); //mostra o bau aberto
							$('#bau'+numQuestao).hide(); //some com o bau fechado
							clearInterval(intervaloPicareta); // para a animacao
						}
					}
				}, 1);
				
				mouseIconID.hide();//some com a picareta
				questaoMostrada = true; //questao está mostrada
				
				questao = $('#questao'+numQuestao); //recebe a questao
				radioCerto  = questao.children('[id*=certo]');  //recebe o filho da questao com id que começa com certo
				radioErrado = questao.children('[id*=errado]');  //recebe o filho da questao com id que começa com errado
				
				//funcao de click no radio que esta errado
				radioErrado.click(function () { 
					$('[id*=marcado]').hide();//some com todos os marcados dos radios
					$('#feedErrado').show(); //mosta o feedErrado
					radioErrado.children('[id*=marcado]').show(); //mostra o marcado correspondente ao radio
				});
				
				//funcao de click no radio que esta certo
				radioCerto .click(function () {	
					radioErrado.off();//tira o evt de click do radioErrado
					$('[id*=feed], [id*=marcado]').hide();//some com todos os feed e os marcados
					$('#feedCerto'+numQuestao).show();//mostra o feed correspondento a questao
					radioCerto.children('[id*=marcado]').show(); //mostra o marcado certo respectivo a questao
					
					if(!arrayQuestoesRespondidas[numQuestao]){//se array estiver false, virara true. Para dizer que a questao ja foi respondida
						arrayQuestoesRespondidas[numQuestao] = true;
					}
					
					var intervaloQuestao = window.setInterval(function(){//inicia o intervalo para add evt de click na questao
						questao.click(function () { 
							questaoMostrada = false; //diz que a questao nao esta sendo mostrada
							mouseIconID.show(); //mostra a picareta do mousefollow
							$('#questao'+numQuestao).hide(200); //some com a questao respondida
							$('[id*=feed]').hide();  //some com todos os feeds
							questao.off();	//desabilita a funcao de click da questao
							testarFim();  //testa se todas as questoes foram respondidas
						});
						clearInterval(intervaloQuestao);
					}, 5)
					
					//funcao para testar se todas as questoes foram respondidas
					testarFim = () => {
						contadorQuestoes = 0;
						for(var num = 1; num <= 5; num++){
							if(arrayQuestoesRespondidas[num]){ contadorQuestoes++; }
						}
						
						if(contadorQuestoes == 5){ //se todas forem respondidas
							mouseIconID.hide(); //some com a picareta
							questaoMostrada = true; //diz q a questao esta sendo mostrada
							$('#feedFinal').show(300); //mostra o feedFinal
							//desbloqueia o botao de avançar
							let removeObjetivoEvent = new CustomEvent('removeObjetivo');
        					document.dispatchEvent(removeObjetivoEvent);
						}
					};
					
				});
			};
			
			//Eventos de click 
			$('#comando').click(function () { $('#comando').hide(); followMouseStart(); });
			$('#bau1').click(function () { mostraQuestao('1'); });
			$('#bau2').click(function () { mostraQuestao('2'); });
			$('#bau3').click(function () { mostraQuestao('3'); });
			$('#bau4').click(function () { mostraQuestao('4'); });
			$('#bau5').click(function () { mostraQuestao('5'); });
			
			//funcao para a picarete seguir o mouse
			followMouseStart = () => {
				(function(){
				var mouseAreaEl = element[0].querySelector('#mouse_area');
				if(mouseAreaEl){
					mouseAreaEl = angular.element(mouseAreaEl);
					mouseAreaEl.addClass('invisible');
					SVGUtils.initSVGElement(mouseAreaEl);
				}

				var mouseIconEl = element[0].querySelector('#mouse_icon');
				if(mouseIconEl){
					mouseIconEl = angular.element(mouseIconEl);
					mouseIconEl.addClass('mouse-icon');
					SVGUtils.initSVGElement(mouseIconEl);
				}
				var viewportElement = mouseIconEl[0].viewportElement;
					viewportElement = angular.element(viewportElement);

				viewportElement.on('mousemove touchmove', function (event){
					if (event.type == "mousemove") {
						mouseX = event.pageX;
						mouseY = event.pageY;

					} else if(event.type == "touchmove" ){
						mouseX = event.changedTouches[0].pageX;
						mouseY = event.changedTouches[0].pageY;
					}
					if(mouseAreaEl){
						mouseAreaRect = mouseAreaEl[0].getBoundingClientRect();
						onArea = mouseX > mouseAreaRect.left && mouseX < mouseAreaRect.right &&
						mouseY > mouseAreaRect.top && mouseY < mouseAreaRect.bottom;

						if(onArea){
							if(!questaoMostrada && !browserFirefox){//se for true não irá esconder o mouse-icon
								viewportElement.addClass('hide-cursor');
							}else{
								viewportElement.removeClass('hide-cursor');
							}
						}
						else {
							viewportElement.removeClass('hide-cursor');
							return;
						}
					}

					p = SVGUtils.pagePointToSVGPoint(mouseIconEl[0].viewportElement, mouseX, mouseY);
					elementGlobalXY = SVGUtils.getGlobalXY(mouseIconEl);
					elementLocalXY = SVGUtils.getLocalXY(mouseIconEl);
					viewportRect = mouseIconEl[0].getBoundingClientRect();

					mouseIconRect = mouseIconEl[0].getBoundingClientRect();
					x = p.x -(Number(elementGlobalXY.x))- (mouseIconRect.width/2);
					y = p.y -(Number(elementGlobalXY.y))- (mouseIconRect.height/2);

					//MOVE O ELEMENTO SVG
					SVGUtils.changePosition (mouseIconEl, x, y, false);
				})

				})()
			};
			
        }
    }
};
