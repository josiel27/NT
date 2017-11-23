
/*
  Desenvolvedor: 	  josiel.faria						
  Componente: 	    certoerrado
  Descrição:		    Componente local desenvolvido para o AIO-SOL					
  Funcionalidades:  Questionário, Eventos de click
  Última alteração: 07/11/2017
  Autor da alteração: josiel.faria
  Alteralções: Comentários do código
*/

module.exports = function ($rootScope) {
    this.filter = function (parent, callbackFinal) {
      var controle = true,
      svg = $(parent),
			btnIniciar = $('#btnIniciar'), btn,
			windows = $('[certoErrado] [id^=_]').hide(),
			targets = new Map(),
			feedFinal = $('#feedFinal'),
			aguaContador = 0, posicAgua = 0,
			bgAgua = $('#aguaCaixa'),
			paredeCaixa = $('#paredeCaixa'),
			pararAgua = 35,
			animaRodando = false;
		
      //testa se o jogo vai poder passar a questao se errar ou so quando acertar
      if(btnIniciar.id == 'btnIniciar'){
          btn = svg.find('#btnIniciar');
      }else{
        btn = svg.find('#btnIniciarFeedCerto');
      }
      
      //se feedFinal existir no svg, escondera o mesmo, quando clicado
      if(feedFinal) feedFinal.hide();
      
      var qtId = (function(){
        var qtdElementos = $('[certoErrado] [id^=_]').length;
        return qtdElementos;
      })();

        //procura em todos os elementos os id's
        windows.each(function (i, e) {
            var btnCerto  = $(e).find('[id^=certo]').css('cursor', 'pointer');
            var btnErrado = $(e).find('[id^=errado]').css('cursor', 'pointer');
            var feedCerto  = $(e).find('[id^=feedCerto]').hide();
            var feedErrado = $(e).find('[id^=feedErrado]').hide();
            var window = $(e);

            //add evt de click em todos os botoes certos
            btnCerto.click(function () {
              if(!animaRodando){// so anima de novo, se a variavel estiver false
                btnErrado.unbind('click');
                feedErrado.fadeOut();//apaga o feed errado
                btnCerto.hide();
              
                feedCerto.fadeIn('fast', function() {
                  //mostra o feed Certo
                  getStatus(window);
                });

                aguaContador++; 
                funcaoAnimarAgua = () => {
                  paredeCaixa.hide(300);//esconde agua da caixa
                  pararAgua = 30;
                  var intervaloAgua = setInterval(function(){
                    animaRodando = true;
                    bgAgua.attr('transform', `matrix( 1, 0, 0, 1, 0, ${--posicAgua})`);
                    pararAgua--;
                    console.log(pararAgua)
                    if(pararAgua==0){ animaRodando = false; clearInterval(intervaloAgua) }
                  }, 40);

                }
                //sobe a agua de acordo com o numero do contador de questoes fechadas, chamando a funcao de anima da agua
                switch (aguaContador) {
                  case 1: posicAgua = 170; funcaoAnimarAgua(); break;
                  case 2: posicAgua = 140; funcaoAnimarAgua(); break;
                  case 3: posicAgua = 110; funcaoAnimarAgua(); break;
                  case 4: posicAgua = 80; funcaoAnimarAgua(); break;
                  case 5: posicAgua = 50; funcaoAnimarAgua(); break;
                  case 6: posicAgua = 30; funcaoAnimarAgua(); break;
                }
              }
            });

            //add evt de click em todos os botoes errados
            btnErrado.click(function () {
              //se o btnIniciar tiver um id diferente, os feeds só passaram se acertar as resposta
              if(btn[0].id == 'btnIniciar'){
                btnCerto.unbind('click');
                feedErrado.fadeIn('fast', function() {
                  getStatus(window);
                });
              }else if(btn[0].id == 'btnIniciarFeedCerto'){
                feedErrado.fadeIn('fast', function() {});
              }
            });

            targets.set(i, {window, feedCerto, feedErrado, btnCerto, btnErrado});
        });

        var currentIndex = 0;

        targets.get(0).window.fadeIn('slow');

        if (btn) {
            btn.css('cursor', 'pointer');
            btn.click (() => pushView());
        }


        var getStatus = function(window) {
            if (currentIndex == qtId - 1) {
              if(feedFinal){
                $('[certoErrado] svg').click(function(){
                 $('[certoErrado] [id^=_]').hide();
				  feedFinal.fadeIn('fast');
                  if(controle){
                    let removeObjetivoEvent = new CustomEvent('removeObjetivo');
                    document.dispatchEvent(removeObjetivoEvent);
                    controle = false;
                  }
                });
              } else{
                if(controle){
                  let removeObjetivoEvent = new CustomEvent('removeObjetivo');
                  document.dispatchEvent(removeObjetivoEvent);
                  controle = false;
                }
              }
              $(parent).off();
              callbackFinal();
            } else {
              window.click(pushView);
            }
        }

        var pushView = function() {
          if(currentIndex < qtId - 1){
            targets.get(currentIndex).window.hide();
            targets.get(++currentIndex).window.fadeIn('slow');
          }
        }

        var svgClick = function (event) {
            event.stopPropagation();

            svg.click(null);
            pushView();
        }

        return targets;
    }

}