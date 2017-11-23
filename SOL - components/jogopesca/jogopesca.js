
/*
Desenvolvedor: 		josiel.faria							
Componente: 		jogopesca
Descrição:			Componente local desenvolvido para o AIO-SOL									
Funcionalidades:	Animação SVG dos objetos, Eventos de click, 
 					Função para objeto SVG seguir o mouse
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
			console.log('Jogo Pesca')
			
			$('[id*=feed], [id*=objFinal]').hide()
			
			//declaração de variaveis utilizadass nos jogo
			var andarH = 0, andarV = 0, //var utlizadas para movimentação da matrix do objeto
				svg = $(element).find('svg'),//var de todo svg
				inicioLinha = $('#linhaInicio'),//elemento svg onde começa o desenho da linha
				fimLinha = $('#mouse_icon'),//elemento svg onde termina o desenho da linha
				feedMostrada = false, // variavel utilizada no follow mouse, se estiver false o follow mouse funcionara
				contFeedFinal = [false, false, false, false, false, false],	//array para mostrar o feed final	
				contadorFeeds = 0, // contador de feed para mostrar o feed final			
				cont = 0, delay = 200;//delay dos setInverval

			//variaveis utilizadas nos intervalos do jogo
			var animaCima = true, animaBaixo = false,  
				animaDireita = false, animaEsquerda = false, 
				movimentoAnima =0, animaIndo = true,
				intervaloAnimaObj;
			
			//funcao para saber qual o navegador utilizado
			function GetBrowserInfo() {
				var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
				var isChrome = !!window.chrome;             			 // Chrome 1+
				if (isFirefox) { return 'firefox'; }
				else if (isChrome) { return 'chrome'; }		
				else {  return 0; }
			}
			
			//inicializa matrix de todos os 6 objetos
			for(var i = 1; i <=6; i++){
				SVGUtils.initSVGElement($('#obj'+i));
			}
			
			//inicializa mtriz
			SVGUtils.initSVGElement(inicioLinha);
			SVGUtils.initSVGElement(fimLinha);
			
			//funcao para desenhar linha
			iniciarLinha = () => {
				var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');//cria elemento e guarda na line
				line.setAttribute("id", "line");//add atributo
				line.setAttribute("stroke", "white");//add atributo
				line.setAttribute("stroke-width", "1");//add atributo
				svg.append(line);//add a linha no svg

				line.setAttribute("x1", inicioLinha[0].transform.baseVal[0].matrix.e);//add atributo para definir o x e y inicial da linha
				line.setAttribute("y1", inicioLinha[0].transform.baseVal[0].matrix.f);

				//funcao para pegar a posicao  xy do objeto mouse-icon
				var pegarposicMouseIcon = () =>{
					posicMouse =  fimLinha[0].transform.baseVal[0].matrix; 
					line.setAttribute("x2", posicMouse.e);
					line.setAttribute("y2", posicMouse.f);
				}
				window.setInterval(pegarposicMouseIcon, 5);//intervalo para ficar redesenhando o final da lina de acordo com a movimentação do mouse-icon
			}

			//funcao para bloquear o botao avançar, até terminar o jogo
			bloquearBotaoAvancar = () => { 
				let addObjetivoEvent = new CustomEvent('addObjetivo');
				document.dispatchEvent(addObjetivoEvent);
			}

			//funcao para desbloquear o botao avançar, quando terminar o jogo
			desbloquearBotaoAvancar = () => { 
				let removeObjetivoEvent = new CustomEvent('removeObjetivo');
				document.dispatchEvent(removeObjetivoEvent);
			}
				
			var arryTeste = [];
			//funcao para animar objetos
			animarObjetos = (numObjeto) => {
				posicObj = pegarposicObjeto(numObjeto);//pega a posicao atual do objeto
				andarH = posicObj.e;//var recebe a posicao x do objeto
				andarV = posicObj.f;//var recebe a posicao y do objeto
				cont=0;
				
				//inicia intervalo de animação dos objetos, controla a animação de todos os objetos que seram pescados
				intervaloAnimaObj = window.setInterval(function () {
					if(animaIndo){//se a animacao estiver indo
						if(animaCima){//se a animacao estiver em cima
							cont++;
							$('#obj'+numObjeto).attr('transform', `matrix( 1, 0, 0, 1, ${++andarH},${--andarV})`);
							if(cont >= 30){ animaCima = false; animaBaixo = true; }//quando o cont chegar a 30 muda o sentido da animação
						}
						if(animaBaixo){//se a animacao estiver em baixo
							cont--;
							$('#obj'+numObjeto).attr('transform', `matrix( 1, 0, 0, 1, ${++andarH},${++andarV})`);
							if(cont <= 0){ animaBaixo = false; animaCima = true; movimentoAnima++ }
							if(movimentoAnima == 1){ animaIndo=false }//quando o cont chegar a 1 muda o sentido da animação			
						}
					}else{
						if(animaCima){//se a animacao estiver em cima
							cont++;
							$('#obj'+numObjeto).attr('transform', `matrix( 1, 0, 0, 1, ${--andarH},${++andarV})`);
							if(cont >= 30){ animaCima = false; animaBaixo = true; }//quando o cont chegar a 30 muda o sentido da animação
						}
						if(animaBaixo){//se a animacao estiver em baixo
							cont--;
							$('#obj'+numObjeto).attr('transform', `matrix( 1, 0, 0, 1, ${--andarH},${--andarV})`);
							if(cont <= 0){ animaBaixo = false; animaCima = true; movimentoAnima-- }
							if(movimentoAnima == 0){ animaIndo=true }//quando o cont chegar a 0 muda o sentido da animação
						}
					}
				}, delay)	
				arryTeste.push(intervaloAnimaObj)
			}
			
			//funcao para pegar a posicao do objeto
			pegarposicObjeto = (numObjeto) =>{
				posicObjeto =  document.getElementById('obj'+numObjeto).transform.animVal[0].matrix;
				return posicObjeto;
			}
			
			//procura entre todos os objetos todo id que comecao com obj
			$('#objetos').find('[id^=obj]').each((i, e) => {
				
				$('#obj'+(i+1)).click(function(){//adiciona evt de click em cada obj
					$('#obj'+(i+1)).off();
					if(!contFeedFinal[i]){ contFeedFinal[i]=true; }//verifica para cada posic do array se esta false
					$('[id*=feed],#mouse_icon, #line, #obj'+(i+1)).hide(300)//esconde esse elementos para usar o mouse icon normal
					$('#objFinal'+(i+1)).show(300)//mostra o objeto no barco
					$('#anzolEnfeite, #feed'+(i+1)).show(300)//mostra o feed correspondente ao objeto pescado
					feedMostrada = true;
					
					$('#feed'+(i+1)).click(function(){
						contadorFeeds++; 
						$('#feed'+(i+1)).off();//para nao repetir a funcao e contar duas vezes o contadorFeeds
						$('[id*=feed]').hide(300)
						$('#anzolEnfeite').hide();
						$('#mouse_icon, #line').show(300)
						feedMostrada = false;
						if(contadorFeeds == 6){
							feedMostrada = true;
							$('#mouse_icon, #line').hide(200);//some com o mouse-icon e a linha quando terminar o jogo
							$('#feedFinal, #anzolEnfeite').show(300);//mostra o feedFinal e termina o jogo
							desbloquearBotaoAvancar();//desbloqueia o botao avançar
						}
					})
				})							 
			});
			
			//funcao inciar o jogo
			$('#comando').click(function(){
				$('#comando, #anzolEnfeite').hide(300);//esconde o play

				iniciarLinha();//incia o desenho da linha
				if(GetBrowserInfo()!='firefox'){ //se não for firefox
					ativarFollowMouse(); //ativa o followMouse 
				}else{
					$('#mouse_icon').attr('transform', `matrix( 1, 0, 0, 1, ${320},${250})`);
				}
				for(var i = 1; i <=6; i++){
					animarObjetos(i);//chama a funcao animar objeto, passando como parametro cada um dos 6 objetos de pesca do svg
				}
			});	

			//funcao do followMouse para o mouse-icon seguir o mouse
			ativarFollowMouse = () =>{
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
							if(!feedMostrada){
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
					  SVGUtils.changePosition (mouseIconEl, x, y);
					})

				})()
			}
			
			// função executada quando o elemento é removido da tela
			element.on('$destroy', ()=>{
				for(var i = 0; i <= 6; i++){//apaga o intervalo de animação de cada objeto
					clearInterval(arryTeste[i]);
				}
			});

			bloquearBotaoAvancar();//bloqueia o botao avancar
			
        }
    }
};
