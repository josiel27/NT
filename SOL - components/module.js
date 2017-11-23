let componentsModuleLocal = angular.module('componentsModuleLocal', []);

var tabuleirosol = require('./jogotabuleiro/jogotabuleiro');
componentsModuleLocal.directive('tabuleirosol', ['$compile', '$rootScope', 'SVGUtils',  tabuleirosol]);

var jogolupa = require('./jogolupa/jogolupa');
componentsModuleLocal.directive('jogolupa', ['$compile', '$rootScope', 'SVGUtils',  jogolupa]);

var labirintosol = require('./labirintosol/labirintosol');
componentsModuleLocal.directive('labirintosol', ['$compile', '$rootScope', 'SVGUtils',  labirintosol]);

var solsubscript = require('./solsubscript/solsubscript');
componentsModuleLocal.directive('solsubscript', ['$compile', '$rootScope', 'SVGUtils',  solsubscript]);

var jogomario = require('./jogomario/jogomario');
componentsModuleLocal.directive('jogomario', ['$compile', '$rootScope', 'SVGUtils',  jogomario]);

var jogotrator = require('./jogotrator/jogotrator');
componentsModuleLocal.directive('jogotrator', ['$compile', '$rootScope', 'SVGUtils',  jogotrator]);

var jogobau = require('./jogobau/jogobau');
componentsModuleLocal.directive('jogobau', ['$compile', '$rootScope', 'SVGUtils',  jogobau]);

var jogopesca = require('./jogopesca/jogopesca');
componentsModuleLocal.directive('jogopesca', ['$compile', '$rootScope', 'SVGUtils',  jogopesca]);

var certoerrado = require('./certoerrado/certoerrado');
var certoerradoService = require('./certoerrado/certoerradoService');
componentsModuleLocal.directive('certoerrado', ['$document', '$compile', '$rootScope', 'certoerradoService',  certoerrado]);
componentsModuleLocal.service('certoerradoService', ['$rootScope',  certoerradoService]);

module.exports = componentsModuleLocal;
