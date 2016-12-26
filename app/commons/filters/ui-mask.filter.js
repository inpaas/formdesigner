/*
  This code is a gist from issue below:
  ui mask filter
  https://github.com/angular-ui/ui-mask/issues/31  
   
  Gist href
  https://gist.github.com/hahn-kev/b3e74a07b53c26ddee1b
*/  
angular.module('ui.mask').filter('mask', function () {
    var cache = {};
    var maskDefinitions = {
      '9': /\d/,
        'A': /[a-zA-Z]/,
        '*': /[a-zA-Z0-9]/
    };

    function getPlaceholderChar(i) {
      return '_';
    }

    function processRawMask(mask) {
      if (cache[mask]) return cache[mask];
      var characterCount = 0;

      var maskCaretMap = [];
      var maskPatterns = [];
      var maskPlaceholder = '';
      var minRequiredLength = 0;

      if (angular.isString(mask)) {
        
        var isOptional = false,
          numberOfOptionalCharacters = 0,
          splitMask = mask.split('');

        angular.forEach(splitMask, function(chr, i) {
          if (maskDefinitions[chr]) {

            maskCaretMap.push(characterCount);

            maskPlaceholder += getPlaceholderChar(i - numberOfOptionalCharacters);
            maskPatterns.push(maskDefinitions[chr]);

            characterCount++;
            if (!isOptional) {
              minRequiredLength++;
            }

            isOptional = false;
          }
          else if (chr === '?') {
            isOptional = true;
            numberOfOptionalCharacters++;
          }
          else {
            maskPlaceholder += chr;
            characterCount++;
          }
        });
      }
      // Caret position immediately following last position is valid.
      maskCaretMap.push(maskCaretMap.slice().pop() + 1);
      return cache[mask] = {maskCaretMap: maskCaretMap, maskPlaceholder: maskPlaceholder};
    }

    function maskValue(unmaskedValue, maskDef) {
      unmaskedValue = unmaskedValue || '';
      var valueMasked = '',
        maskCaretMapCopy = maskDef.maskCaretMap.slice();

      angular.forEach(maskDef.maskPlaceholder.split(''), function (chr, i) {
        if (unmaskedValue.length && i === maskCaretMapCopy[0]) {
          valueMasked += unmaskedValue.charAt(0) || '_';
          unmaskedValue = unmaskedValue.substr(1);
          maskCaretMapCopy.shift();
        }
        else {
          valueMasked += chr;
        }
      });
      return valueMasked;

    }

    return function (value, mask) {
      var maskDef = processRawMask(mask);
      var maskedValue = maskValue(value, maskDef);
      return maskedValue;
    };
  });