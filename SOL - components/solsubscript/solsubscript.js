
/*
Desenvolvedor: 	    josiel.faria						
Componente: 	    solsubscript
Descrição:		    Componente local desenvolvido para os scripts auxiliares do AIO-SOL									
Funcionalidades:	Eventos de click
Última alteração: 07/11/2017
Autor da alteração: josiel.faria
Alteralções: Comentários do código
*/

module.exports = function ($compile, $rootScope, SVGUtils) {
    return {
        restrict: 'AE',
        replace: false,
        link: function (scope, element, attr) {
		    console.log('Scripts Auxiliares SOL');
            
            //componente de abas 5/2/40
            //adiciona os eventos de click para mostras os checks de cada tabCrontrol
            $('#botao_0').click(function(){//add o evt de click no botao_0
                $('#checks').find('[id*=cheInfo]').each((i, e) => {//procura todos os elemento dentro de checks 
                    $('#cheInfo_'+(i+1)).hide();//esconde o check de cada tabCrontrol
                    $('#tabControl'+(i+1)).click(function(){//add o evt de click em cada tabControl
                        $('#cheInfo_'+(i+1)).show();//mostra o check de cada tabCrontrol
                    });
                });
            });
        }
    }
};
