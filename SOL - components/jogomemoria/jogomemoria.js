/*
  Componente: Jogo da Memória.
  Funcionalidade: Componente responsável por implementar o Jogo da Memória
  Desenvolvedor: francis.leal e joao.rodrigues

  Última alteração: 07/11/2017.
*/

module.exports = function () {
  return {
    restrict: 'AE',
    replace: false,
    link: function (scope, element, attr) {

      // adiciona os objetivos para fazer o bloqueio do botão de avançar
      let addObjetivoEvent = new CustomEvent('addObjetivo');
      document.dispatchEvent(addObjetivoEvent);

      // esconde os feedfinal e respostas
      $('#_feedCertoFinal,[id*=resposta],#feedCerto,#feedErrado').hide();

      // conta o número de pares de cartas
      var qtId = $('[memoria] #cartas [id^=carta]').length / 2;

      // inicializa as variáveis
      var cartasAtuais = {
        cartaA: null,
        cartaB: null
      }
      var cartasFalsas = {
        falsaA: null,
        falsaB: null
      }
      var reset = () => {
        cartasAtuais.cartaA = null;
        cartasAtuais.cartaB = null;
        cartasFalsas.falsaA = null;
        cartasFalsas.falsaB = null;
      }
      var arrFeed = [];

      // função principal que faz o controle do jogo
      var block = () => {

        // adiciona a classe de css as áreas clicaveis
        $('[id^=frente], [id^=btCloseResp]').addClass('btn');

        // toda interatividade parte do momento que o usuário clica na parte da frente das cartas
        $('#cartas').find('[id^=frent]').each(function () {
          $(this).click(function () {

            // interrompe animação de outras cartas, usada para controle da validação
            $(this).stop(true,true).hide();

            // compara as cartas se forem diferentes
            cartasFalsas.falsaA == null ? cartasFalsas.falsaA = this.id : cartasFalsas.falsaB = this.id;

            // adicona valor a cartaA se ela estiver null, quando o valor for preenchido adiciona valor na cartaB
            if (cartasAtuais.cartaA == null) {
              cartasAtuais.cartaA = this.id.substring(0, 7);
            } else {
              cartasAtuais.cartaB = this.id.substring(0, 7)

              // compara as cartas de mesmo valor
              if (cartasAtuais.cartaB == cartasAtuais.cartaA) {

                // se possuir um feedback de acerto para cada par de cartas, eles são exibidos
                if($('#containerFeedsRespostas').length > 0){
                  // mostra janela dinamicamente de acordo com IDs das cartas
                  var thisModal = this.id.substring(6, 7);
                  $(`#_resposta_${thisModal}`).show(400);
                  $('[id^=frente]').off().css('cursor', 'default');

                  // fechar janela dinamicamente e compara as quantidades de feed para mostra o feedfinal
                  $(`#btCloseResp${thisModal}`).click(function () {
                    block();

                    $(`#_resposta_${thisModal}`).hide();
                    arrFeed.push(0);

                    // mostra feed final e remove o objetivo
                    if (arrFeed.length == qtId) {
                      $('#_feedCertoFinal').show(400);
                      let removeObjetivoEvent = new CustomEvent('removeObjetivo');
                      document.dispatchEvent(removeObjetivoEvent);
                    }
                  });

                } else {
                  // se não possuir um feedback de acerto para cada par de cartas, um feedback de acerto geral é exibido
                  if($('#containerFeeds').length > 0){
                    $('[id^=frente]').off().css('cursor', 'default');
                    $('#feedCerto').show(400);
                    setTimeout(function(){
                      $('#feedCerto').hide(400);
                      block();
                      arrFeed.push(0);
                      // mostra feed final
                      if (arrFeed.length == qtId) {
                        $('#_feedCertoFinal').show(400);
                        let removeObjetivoEvent = new CustomEvent('removeObjetivo');
                        document.dispatchEvent(removeObjetivoEvent);
                      }
                    }, 2000);
                  }
                }
              } else {
                // fecha as cartas se elas forem diferentes
                var idErroA = cartasFalsas.falsaA;
                var idErroB = cartasFalsas.falsaB;

                // exibe o feedback de erro
                $('[id^=frente]').off().css('cursor', 'default');
                $('#feedErrado').show(400);
                setTimeout(function(){
                  $(`#${idErroA}`).show(500);
                  $(`#${idErroB}`).show(500);
                }, 1000);
                setTimeout(function(){
                  $('#feedErrado').hide(400);
                  block();
                }, 2000);

              }

              // reseta os "Objetos" deixando null depois das comparações
              reset();
            }
          });
        });

      }; block();

    }
  }

}

/*

  // efeitos visuais

    $('#frente1a').css({
      "-webkit-transition": ".5s",
      "-webkit-transform": "rotateY(0deg)",
      "transform-origin": "50px 50px"
    });

    setTimeout(function () {
      $('#frente1a').css({
        "-webkit-transition": ".5s",
        "-webkit-transform": "rotateY(90deg)"
      });
    }, 5);

    $('#carta1a').css({
      "-webkit-transition": ".2s",
      "-webkit-transform": "rotateY(90deg)",
      "transform-origin": "50px 50px"
    });

    setTimeout(function () {
      $('#carta1a').css({
        "-webkit-transition": ".2s",
        "-webkit-transform": "rotateY(180deg)"
      });
    }, 400);

*/
