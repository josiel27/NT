module.exports = function ($document, $compile, $rootScope, certoerradoService) {
  return {
    restrict: 'AE',
    replace: false,
    link: function(scope, element, attr){
      let addObjetivoEvent = new CustomEvent('addObjetivo');
      document.dispatchEvent(addObjetivoEvent);

      var targets = null;
      var doc = $document[0].querySelector('[certoErrado]');
      var callbackFinal = () => { };

      var res = certoerradoService.filter(doc, callbackFinal);
    }
  }
}
