
/*
Desenvolvedor: 	    josiel.faria								
Componente: 	    jogotabuleiro
Descrição:		    Componente local, desenvolvido para o AIO-SOL				
Funcionalidades:	Movimentação do persoangem, Animação SVG dos objetos, 
					Testes de colisao, Eventos de click
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
            console.log('tabuleiro DO SOL');
            
            //bloqueia o botão avançar
			let addObjetivoEvent = new CustomEvent('addObjetivo');
        	document.dispatchEvent(addObjetivoEvent);

            //inicializa matrix do personagem
            SVGUtils.initSVGElement($('#personagem'));		
            
            //esconde os elementos
            $("#teclado,#feedFinal,[id^=balao],[id^=feedCerto],[id^=feedErrado],[id^=questao], [id*=respC],[id*=respE], #janelaInstrucao, #bauAberto").hide();
            
            //seta posic inicial para o personagem
			$('#personagem').attr('transform', `matrix( 1, 0, 0, 1, -18, -6.5)`);
            
            //declaracao de variaveis
            var casaDireita = false,
                casaEsquerda = false;
	
			//funcoes click para botao instrução
			$('#botaoInstrucao').click(function () { 
				$('#janelaInstrucao').show(300);
			});
			$('#janelaInstrucao').click(function () {
				$('#janelaInstrucao').hide(300);
			});
            
            //classe para matriz do jogo labirinto
            class Matriz {
                constructor(horizont, vertical) {
                    this.horizont = horizont;
                    this.vertical = vertical;
                }
                static casa() {
                    return 64;
                }
                get Bau() {
                    return this.rua();
                }
                rua() {
                    return `horizontal:${this.horizont} vertical:${this.vertical}`;
                }
            };
            const myArray = new Matriz([], []);
            const posicao = new Matriz(120, 25);

            //evento de click em comando ou btnIniciar
            $('#btnIniciar, #Comando').click(function () {
				$('#teclado').show(300);
				$('#btnIniciar, #Comando').hide(300);
				andarH = 110;
				andarV = 25;

                $('#personagem').attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${andarV})`);
				
                resete()
            });

            //funcao para deligar todos o evt de click
            function resete() {
                myArray.horizont.splice(0, Number.MAX_VALUE);
                myArray.vertical.splice(0, Number.MAX_VALUE);

                setTimeout(function () {
                    direita();
                }, 500);

                $('#direita_btn').off()
                $('#esquerda_btn').off()
                $('#cima_btn').off()
                $('#baixo_btn').off()
                $('#personagem').each(function () { $(this).children().css({ 'transform': 'rotatey(0deg)', 'transform-origin': '23px' }); });
            }

            // função andar para direita
            function andarDireita() {
                myArray.horizont.push(Matriz.casa());

				if(casaDireita == false){
					andarH = myArray.horizont.reduce((andar, casa) => {
						return andar + casa;
					}, posicao.horizont);
				}else{
					andarH = myArray.horizont.reduce((andar, casa) => {
						return andar + 68;
					}, posicao.horizont);
				}
                $('#personagem').attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${andarV})`);
            }
            // função andar para esquerda
            function andarEsquerda() {
                myArray.horizont.pop(Matriz.casa());

                andarH = myArray.horizont.reduce((andar, casa) => {
                    return andar + casa;
                }, posicao.horizont);
				
                $('#personagem').attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${andarV})`);
            }
            // função andar para baixo
            function andarBaixo(casaBaixo) {
                myArray.vertical.push(Matriz.casa());
				
                andarV = myArray.vertical.reduce((andar, casa) => {
                    return andar + 48;
                }, posicao.vertical);
				
				if(casaBaixo == 1){ andarH = 595; andarV = 73; }
				if(casaBaixo == 2){ andarH = 568; andarV = 125; }
				if(casaBaixo == 3){ andarH = 90; andarV = 195; }
				if(casaBaixo == 4){ andarH = 115; andarV = 250; }

				$('#personagem').attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${andarV})`);
            }
            // função andar para cima
            function andarCima() {
                myArray.vertical.pop(Matriz.casa());

                andarV = myArray.vertical.reduce((andar, casa) => {
                    return andar + casa;
                }, posicao.vertical);

                $('#personagem').attr('transform', `matrix( 1, 0, 0, 1, ${andarH},${andarV})`);
            }
            //botão direita
            function direita() {
				$('#direita_btn').off('click');
                $('#direita_btn').click(function () {
                    const caminho = new Matriz(myArray.horizont.length, myArray.vertical.length);
					
					console.log(caminho);

                    let caminhoBau = caminho.Bau;

                    //testa o caminho e faz o prox movimento de acordo com o parametro recebido
                    switch (caminhoBau) {
						case 'horizontal:0 vertical:0':
                            $(this).off(); $('#questao1').show(300);
							clickRespostaFeeds('direita');
                            break;
                        case 'horizontal:2 vertical:0':
							clickRespostaFeeds('direita');
                            $(this).off(); $('#questao2').show(300);
							$('[id*=questao]').off();//mata a funcao click para chamar o setTimeout denovo
                            break;
						case 'horizontal:6 vertical:0':
                            $(this).off();
							casaBaixo = 1;
							habilitarMovimento('baixo', casaBaixo);
                            break;	
						case 'horizontal:0 vertical:4':
                            $(this).off(); $('#questao7').show(300);
							$('[id*=questao]').off();
							casaDireita = true;
							clickRespostaFeeds('direita');
                            break;
						case 'horizontal:5 vertical:4':
                            $(this).off(); $('#questao8').show(300);
							$('[id*=questao]').off();
							clickRespostaFeeds('direita');
                            break;
						case 'horizontal:6 vertical:4':
							$('[id*=questao]').off();
							habilitarMovimento('semMovimento');
                            $(this).off(); 
							$('#feedFinal').show(300);
							$('#bauFechado').hide(300);
							$('#bauAberto').show(300);
							let removeObjetivoEvent = new CustomEvent('removeObjetivo');
        					document.dispatchEvent(removeObjetivoEvent);
                            break;
                    };
						andarDireita();
                });
            }
            //botão esquerda
            function esquerda() {
				$('#esquerda_btn').off('click');
                $('#esquerda_btn').click(function () {
                    const caminho = new Matriz(myArray.horizont.length, myArray.vertical.length);

                    let caminhoBau = caminho.Bau;

                    switch (caminhoBau) {
                        case 'horizontal:5 vertical:2':
							$(this).off();
							$('[id*=questao]').off();
                            $('#questao4').show(300);
							clickRespostaFeeds('esquerda');
                            break;
						case 'horizontal:3 vertical:2':
							$(this).off();
							$('[id*=questao]').off();
                            $('#questao5').show(300);
							clickRespostaFeeds('esquerda');
                            break;
						case 'horizontal:1 vertical:2':
							$(this).off();
							casaBaixo = 3;
							habilitarMovimento('baixo', casaBaixo);
                            break;
                    };
                    andarEsquerda();
                });
            };
            //botão baixo
            function baixo(casaBaixo) {
				$('#baixo_btn').off('click');
                $('#baixo_btn').click(function () {
                    const caminho = new Matriz(myArray.horizont.length, myArray.vertical.length);

                    let caminhoBau = caminho.Bau;

                    switch (caminhoBau) {
                        case 'horizontal:7 vertical:1':
							casaBaixo = 2;
							$('#personagem').each(function () { $(this).children().css({ 'transform': 'rotatey(180deg)', 'transform-origin': '23px' }); });
                            $(this).off(); 
							$('[id*=questao]').off();
							$('#questao3').show(300);
							clickRespostaFeeds('esquerda');
                            break;
						case 'horizontal:0 vertical:2':
							$('#personagem').each(function () { $(this).children().css({ 'transform': 'rotatey(0deg)', 'transform-origin': '23px' }); });
                            $(this).off(); 
							$('[id*=questao]').off();
							$('#questao6').show(300);
							clickRespostaFeeds('baixo');
                            break;
						case 'horizontal:0 vertical:3':
                            $(this).off(); 
							casaBaixo = 4;
							habilitarMovimento('direita', casaBaixo);
                            break;
                    };
                    andarBaixo(casaBaixo);
                });
            };

            //habilita e desabilita funcoes de click do teclado
			function habilitarMovimento(sentido, casaBaixo){
				if(sentido == 'baixo'){ baixo(casaBaixo); }
				else{ $('#baixo_btn').off(); }

				if(sentido == 'direita'){ direita(); }
				else{ $('#direita_btn').off(); }

				if(sentido == 'esquerda'){ esquerda(); }
				else{ $('#esquerda_btn').off(); }
			}
            
            //funcao para clickar nos feeds e retornar um feed de acordo com o gabarito de cada questao
			function clickRespostaFeeds(sentido) {
				limparRadio();
				for (var index = 1; index <= $('[id*=questao]').length ; index++) {
					
					//se errar
					$("[id^=radio_" + index + "e]").click(function () {
						$('[id*=respE]').show(300);
						$('[id*=respC]').hide(300);
						limparRadio();
					});
					//se acertar
					$("[id^=radio_" + index + "c]").click(function () {
						$('[id*=respC]').show(300);
						$('[id*=respE]').hide(300);
						
						setTimeout(function(){//intervalo para limpar o objeto e habilitar o movimento, o intervalo é usado para só habilitar depois de clicar no evt
							$('[id*=questao]').click(function(){
								$(this).hide();
								limparRadio();
								habilitarMovimento(sentido);
							});
						},50)
						$(this).siblings().remove();//apaga o radio errado
					});
				}
            };
            //funcao para limpar os radios
			function limparRadio(){
				$('[id*=respC],[id*=respE]').hide();
			}
        }
    }
};
