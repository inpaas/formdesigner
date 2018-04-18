//Inspirado em https://gist.github.com/marioluan/6923123 
(function(){
  angular
    .module('studio-v2')
    .service('HelpersService', HelpersService);

  function HelpersService() {
    this.replaceAccentChars = replaceAccentChars;
    this.removeSpace = removeSpace;
    this.removeSpecialChars = removeSpecialChars;

    function replaceAccentChars(string) {
      var mapaAcentosHex = {
        a : /[\xE0-\xE6]/g,
        A : /[\xC0-\xC6]/g,
        e : /[\xE8-\xEB]/g,
        E : /[\xC8-\xCB]/g,
        i : /[\xEC-\xEF]/g,
        I : /[\xCC-\xCF]/g,
        o : /[\xF2-\xF6]/g,
        O : /[\xD2-\xD6]/g,
        u : /[\xF9-\xFC]/g,
        U : /[\xD9-\xDC]/g,
        c : /\xE7/g,
        C : /\xC7/g,
        n : /\xF1/g,
        N : /\xD1/g
      };

      for ( var letra in mapaAcentosHex ) {
          var expressaoRegular = mapaAcentosHex[letra];
          string = string.replace( expressaoRegular, letra );
      }

      return string;
    }

    function removeSpace(string){
      var regex = /\s+|\s$/g;
      return string.replace(regex, '');
    }

    function removeSpecialChars(string){
      var regex_notDigits = /[\W+]/g;

      string = string.replace(/_/g, '');
      string = string.replace(/\./g, '_');
      string = string.replace(regex_notDigits, '');
      string = string.replace(/_/g, '.');

      return string;
    }
  }
})();