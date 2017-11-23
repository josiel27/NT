
/*
Desenvolvedor: 	    josiel.faria						
Componente: 	    jogolupa
Descrição:		    Componente local desenvolvido para o AIO-SOL								
Funcionalidades:	Animação SVG dos objetos, Eventos de click, 
 					Função para objeto SVG seguir o mouse
Última alteração: 08/11/2017
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
			console.log('jogo Lupa2'); 

			
			$('#feedFinal, [id*=feed], [id*=check], #mouse_icone').hide(); //apaga o elementos
			
			//declaracao de variaveis
			var arrayContadorCheck = [false, false, false, false, false, false, false, false],
				contadorChecks = 0,
				questaoMostrada = false,
				intervaloFeed, intervaloHide, intervaloFollowMouse,
				folhaClicada;//var utilizada para o firefox
			
			//start do jogo
			$('#comando').click(function () {
				$('#feedFinal, [id*=feed], [id*=check], #mouse_icone').hide(); //apaga o elementos
				arrayContadorCheck = [false, false, false, false, false, false, false, false],
				contadorChecks = 0,
				questaoMostrada = false,
				$('#lupa').hide(300);
				$('#comando').hide(300);
				$('#mouse_icone').show(300);
				adicionarEvtClickFolhas();//chamando funcao para add evt de click nas folhas
				if(GetBrowserInfo()!='firefox'){
					followMouseStart();//ativa funcao de followmouse
					followMaskStart();//ativa funcao de followmask
				}
			});


			//funcao para saber qual o navegador utilizado
			function GetBrowserInfo() {
				var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
				var isChrome = !!window.chrome;             			 // Chrome 1+
				if (isFirefox) { return 'firefox'; }
				else if (isChrome) { return 'chrome'; }		
				else {  return 0; }
			}

			//funcao que mostra os feeds de acordo com o num passado por parametro
			mostrarFeed = (numFolha) => {
				$('#feed'+numFolha).show(300);
				intervaloFeed = window.setTimeout(function(){
					if(!arrayContadorCheck[numFolha-1]){
						arrayContadorCheck[numFolha-1] = true;
					}
					$('svg').click(function () {
						$('#feed'+numFolha).hide(300);
						$('#check'+numFolha).show(300); 
						testarChecks();
					});
					console.log('criando')
				}, 5);
			};

			//funcao apara add evento de click nas folha e mostrar o respectivo feed
			adicionarEvtClickFolhas = () => {
				$('#botoesFeeds').find('[id*=btnFeed]').each((i, e) => {
					$('#btnFeed'+(i+1)).click(function () { mostrarFeed(i+1); });

				})
			};

			//funcao para testar cada check
			testarChecks = () =>{
				contadorChecks = 0;
				for(var i = 0; i <= 7; i++){
					if(arrayContadorCheck[i]){
						contadorChecks++;
					}
					//se finalizar o jogo
					if(contadorChecks == 8){
						questaoMostrada = true;
						$('#feedFinal').show(300);
						$('#mouse_icone, #mouse_icone, #lupaAtv').hide();
						$('#botoesFeeds').find('[id*=btnFeed]').each((i, e) => {
							$('#btnFeed'+(i+1)).off();
						})
						clearInterval(intervaloFeed);
						clearInterval(intervaloHide);
						clearInterval(intervaloFollowMouse);
					}
				}
			};
			
			//funcao para a mascara seguir o mouse
			followMaskStart = () =>{
				//movimenta a lupaAtv, lupa mask
				let maskLupa = 	$('#Mask_maskLupa');
				maskLupa.attr('id','mouse_icon');

				let lupaAtv = 	$('#lupaAtv');
				lupaAtv.attr('follow-mouse','');
				$compile(lupaAtv)(scope);
			};
			
			//calculo de diferenca do navegador
			var diferencaX = 3, diferencaY = 4, posicFolha, returnPosicFolha;

			if(GetBrowserInfo()=='firefox'){//se o navegador for firefox
				//funcao só utilizada para firefox
				pegarPosicFolha = (xy, folhaClicada) => {
					console.log(folhaClicada)
					posicFolha =  document.getElementById('folhaP'+folhaClicada).transform.animVal[0].matrix;
					if(xy == 'x'){
						returnPosicFolha = posicFolha.e;
					}else{
						returnPosicFolha = posicFolha.f;
					}
					
					return returnPosicFolha;
				};
				$('#botoesFeeds').find('[id*=btnFeed]').each((i, e) => {
					$('#btnFeed'+(i+1)).click(function () {
						 posicX = pegarPosicFolha('x', (1+i));
						 posicY = pegarPosicFolha('y', (1+i));
						 $('#mouse_icone').attr('transform', `matrix( 1, 0, 0, 1, ${posicX+150},${posicY})`);
						 $('#Mask_maskLupa').attr('transform', `matrix( 1, 0, 0, 1, ${posicX+150},${posicY})`);
					});

				})
			}else{//qualquer outro navegador
				//movimenta a lupa
				followMouseStart = () => {
					intervaloFollowMouse = window.setTimeout(function(){
						(function(){
							var mouseAreaEl = element[0].querySelector('#mouse_area');
							if(mouseAreaEl){
								mouseAreaEl = angular.element(mouseAreaEl);
								mouseAreaEl.addClass('invisible');
								SVGUtils.initSVGElement(mouseAreaEl);
							}

							var mouseIconEl = element[0].querySelector('#mouse_icone');
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
										intervaloHide = window.setInterval(function(){
											if(!questaoMostrada){
												viewportElement.addClass('hide-cursor');
											}else{
												viewportElement.removeClass('hide-cursor');
											}
										}, 2)
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
								x = p.x -(Number(elementGlobalXY.x))- (diferencaX+mouseIconRect.width/2);
								y = p.y -(Number(elementGlobalXY.y))- (diferencaY+mouseIconRect.height/2);

								//MOVE O ELEMENTO SVG
								SVGUtils.changePosition (mouseIconEl, x, y, false);
							})

						})()
					});
				};
			}
			element.on('$destroy', ()=>{
				clearInterval(intervaloFeed);
				clearInterval(intervaloHide);
				clearInterval(intervaloFollowMouse);
			});
        }
    }
};
