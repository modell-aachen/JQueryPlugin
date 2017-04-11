/*
 * jQuery WikiWord plugin 3.10
 *
 * Copyright (c) 2008-2015 Foswiki Contributors http://foswiki.org
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */

/***************************************************************************
 * plugin definition 
 */
(function($) {
$.wikiword = {

  downgradeMap: {},

  /***********************************************************************
   * constructor
   */
  build: function(options) {
    var opts;

    // call build either with an options object or with a source string
    if (typeof(options) === 'string') {
      options = {
        source: options
      };
    }

    // build main options before element iteration
    opts = $.extend({}, $.wikiword.defaults, options);

    // iterate and reformat each matched element
    return this.each(function() {
      var $this = $(this),
          thisOpts = $.extend({}, opts, $this.data(), $this.metadata()),
          $source;

      // either a string or a jQuery object
      if (typeof(thisOpts.source) === 'string') {
        $source = $(thisOpts.source);
      } else {
        $source = thisOpts.source;
      }

      $.wikiword.buildRegex(thisOpts);

      $source.change(function() {
        $.wikiword.handleChange($source, $this, thisOpts);
      }).keyup(function() {
        $.wikiword.handleChange($source, $this, thisOpts);
      }).change();
    });
  },

  // generate RegExp for filtered chars
  buildRegex: function (thisOpts) {
      if (typeof(thisOpts.allow) !== 'undefined') {
        thisOpts.allowedRegex = new RegExp('['+thisOpts.allow+']+', "g");
        thisOpts.forbiddenRegex = new RegExp('[^'+thisOpts.allow+']+', "g");
      }
      if (typeof(thisOpts.allowedRegex) === 'string') {
        thisOpts.allowedRegex = new RegExp(thisOpts.allowedRegex, "g");
      }
      if (typeof(thisOpts.forbiddenRegex) === 'string') {
        thisOpts.forbiddenRegex = new RegExp(thisOpts.forbiddenRegex, "g");
      }
  },

  // gets the start/end of the selection, even in IE8
  // taken from here: http://stackoverflow.com/questions/235411/is-there-an-internet-explorer-approved-substitute-for-selectionstart-and-selecti
  getStartEnd: function (el) {
    var start = 0, end = 0, normalizedValue, range,
        textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
    } else {
        range = document.selection.createRange();

        if (range && range.parentElement() == el) {
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = end = len;
            } else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                    end = len;
                } else {
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }

    return {
        start: start,
        end: end
    };
  },

  // sets the start/end of the selection,
  setStartEnd: function (el, start, end) {
    var range;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        el.selectionStart = start;
        el.selectionEnd = end;
    } else {
        // Most likely IE8 or older
        var length = $(el).val().length;
        range = document.selection.createRange();
        range.collapse(true);
        range.moveStart('character', -length);
        range.moveEnd('character', -length);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
    }
  },

  /***************************************************************************
   * handler for source changes
   */
  handleChange: function(source, target, opts) {
    var result = []

    // gather all sources
    source.each(function() {
      result.push($(this).is(':input')?$(this).val():$(this).text());
    });
    result = result.join(" ");

    // see if source and target are identical;
    // if that is the case: update caret position
    var sourceTargetElement;
    target.each(function() {
      if($(this).is(source)) sourceTargetElement = this;
    });
    var selectionStart, selectionEnd;
    if(sourceTargetElement) try {
      var startEnd = $.wikiword.getStartEnd(sourceTargetElement);
      selectionStart = startEnd.start;
      selectionEnd = startEnd.end;
    } catch(e) {
      // we have to do a try-catch, because accessing selectionStart on an
      // input of type hidden will throw an exception (on firefox at least)
        sourceTargetElement = null;
    }

    if (result || !opts.initial) {
      var wikify = $.wikiword.wikifySelection(result, opts, selectionStart, selectionEnd);
      result = wikify.result;
      selectionStart = wikify.selectionStart;
      selectionEnd = wikify.selectionEnd;

      if (opts.suffix && result.indexOf(opts.suffix, result.length - opts.suffix.length) == -1) {
        if(selectionStart == result.length) selectionStart += opts.suffix.length;
        if(selectionEnd == result.length) selectionEnd += opts.suffix.length;
        result += opts.suffix;
      }
      if (opts.prefix && result.indexOf(opts.prefix) !== 0) {
        result = opts.prefix+result;
        selectionStart += opts.prefix.length;
        selectionEnd += opts.prefix.length;
      }
    } else {
      result = opts.initial;
      selectionStart = selectionEnd = opts.initial.length;
    }

    target.each(function() {
      if ($(this).is(':input')) {
        $(this).val(result);
      } else {
        $(this).text(result);
      }
    });
    if(sourceTargetElement) {
      $.wikiword.setStartEnd(sourceTargetElement, selectionStart, selectionEnd);
    }
  },

  /***************************************************************************
   * convert a source string to a valid WikiWord
   */
  wikify: function (source, opts) {
      var thisOpts = $.extend({}, $.wikiword.defaults, opts);
      $.wikiword.buildRegex(thisOpts);

      return $.wikiword.wikifySelection(source, thisOpts).result;
  },

  /***************************************************************************
   * convert a source string to a valid WikiWord, keep the current selection
   */
  wikifySelection: function (source, opts, selectionStart, selectionEnd) {

    var result = '', c, i;

    opts = opts || $.wikiword.defaults;

    if(typeof selectionStart === 'undefined') selectionStart = source.length;
    if(typeof selectionEnd === 'undefined') selectionEnd = selectionStart;

    // transliterate unicode chars
    if (opts.transliterate) {
      result = transl(source);

      /* Unfortunately the transliteration module does not provide any
         function to map selection indices for transliterations.
         Therefore we have to update the indices ourselves
      */
      var preSelectionString = source.substr(0, selectionStart);
      var preSelectionDiff = transl(preSelectionString).length - preSelectionString.length;

      var selectionString = source.substring(selectionStart, selectionEnd);
      var selectionDiff = transl(selectionString).length - selectionString.length;

      // Start shifts by the growth of the preselection string
      selectionStart += preSelectionDiff;
      // End shifts by the growth of the preselection + selection strings
      selectionEnd += preSelectionDiff + selectionDiff;
    } else {
      result = source;
    }

    // capitalize each individual word
    result = result.replace(opts.allowedRegex, function(a) {
        return a.charAt(0).toLocaleUpperCase() + a.substr(1);
    });

    // split into [before selection, selected, after selection], so I can
    // place the caret after applying the regexes
    var sliced = [
        result.substr(0, selectionStart),
        result.substr(selectionStart, selectionEnd - selectionStart),
        result.substr(selectionEnd)
    ];

    $.each(sliced, function(idx, slice) {
        // remove all forbidden chars
        slice = slice.replace(opts.forbiddenRegex, "");

        // remove all spaces
        slice = slice.replace(/\s/g, "");

        sliced[idx] = slice;
    });

    selectionStart = sliced[0].length;
    selectionEnd = sliced[0].length + sliced[1].length;
    result = sliced.join('');

    return {
        result: result,
        selectionStart: selectionStart,
        selectionEnd: selectionEnd
    };
  },

  /***************************************************************************
   * plugin defaults
   */
  defaults: {
    suffix: '',
    prefix: '',
    initial: '',
    transliterate: false,
    allowedRegex: '[' + foswiki.RE.alnum + ']+',
    forbiddenRegex: '[^' + foswiki.RE.alnum + ']+'
  }
};

/* register by extending jquery */
$.fn.wikiword = $.wikiword.build;

/* init */
$(function() {
  $(".jqWikiWord:not(.jqInitedWikiWord)").livequery(function() {
    $(this).addClass("jqInitedWikiWord").wikiword();
  });
});

})(jQuery);
jQuery.wikiword.downgradeMap = {
      // LATIN
      'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'Ae', 'Å': 'A', 'Æ': 'AE', 'Ç':
      'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I',
      'Ï': 'I', 'Ð': 'D', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö':
      'Oe', 'Ő': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'Ue', 'Ű': 'U',
      'Ý': 'Y', 'Þ': 'TH', 'ß': 'ss', 'à':'a', 'á':'a', 'â': 'a', 'ã': 'a', 'ä':
      'ae', 'å': 'a', 'æ': 'ae', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
      'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ð': 'd', 'ñ': 'n', 'ò': 'o', 'ó':
      'o', 'ô': 'o', 'õ': 'o', 'ö': 'oe', 'ő': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u',
      'û': 'u', 'ü': 'ue', 'ű': 'u', 'ý': 'y', 'þ': 'th', 'ÿ': 'y',

      // GREEK
      'α':'a', 'β':'b', 'γ':'g', 'δ':'d', 'ε':'e', 'ζ':'z', 'η':'h', 'θ':'8',
      'ι':'i', 'κ':'k', 'λ':'l', 'μ':'m', 'ν':'n', 'ξ':'3', 'ο':'o', 'π':'p',
      'ρ':'r', 'σ':'s', 'τ':'t', 'υ':'y', 'φ':'f', 'χ':'x', 'ψ':'ps', 'ω':'w',
      'ά':'a', 'έ':'e', 'ί':'i', 'ό':'o', 'ύ':'y', 'ή':'h', 'ώ':'w', 'ς':'s',
      'ϊ':'i', 'ΰ':'y', 'ϋ':'y', 'ΐ':'i',
      'Α':'A', 'Β':'B', 'Γ':'G', 'Δ':'D', 'Ε':'E', 'Ζ':'Z', 'Η':'H', 'Θ':'8',
      'Ι':'I', 'Κ':'K', 'Λ':'L', 'Μ':'M', 'Ν':'N', 'Ξ':'3', 'Ο':'O', 'Π':'P',
      'Ρ':'R', 'Σ':'S', 'Τ':'T', 'Υ':'Y', 'Φ':'F', 'Χ':'X', 'Ψ':'PS', 'Ω':'W',
      'Ά':'A', 'Έ':'E', 'Ί':'I', 'Ό':'O', 'Ύ':'Y', 'Ή':'H', 'Ώ':'W', 'Ϊ':'I',
      'Ϋ':'Y',

      // TURKISH
      'ş':'s', 'Ş':'S', 'ı':'i', 'İ':'I', 'ç':'c', 'Ç':'C', 'ü':'ue', 'Ü':'Ue',
      'ö':'oe', 'Ö':'Oe', 'ğ':'g', 'Ğ':'G',

      // RUSSIAN
      'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ё':'yo', 'ж':'zh',
      'з':'z', 'и':'i', 'й':'j', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o',
      'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'х':'h', 'ц':'c',
      'ч':'ch', 'ш':'sh', 'щ':'sh', 'ъ':'', 'ы':'y', 'ь':'', 'э':'e', 'ю':'yu',
      'я':'ya',
      'А':'A', 'Б':'B', 'В':'V', 'Г':'G', 'Д':'D', 'Е':'E', 'Ё':'Yo', 'Ж':'Zh',
      'З':'Z', 'И':'I', 'Й':'J', 'К':'K', 'Л':'L', 'М':'M', 'Н':'N', 'О':'O',
      'П':'P', 'Р':'R', 'С':'S', 'Т':'T', 'У':'U', 'Ф':'F', 'Х':'H', 'Ц':'C',
      'Ч':'Ch', 'Ш':'Sh', 'Щ':'Sh', 'Ъ':'', 'Ы':'Y', 'Ь':'', 'Э':'E', 'Ю':'Yu',
      'Я':'Ya',

      // UKRAINIAN
      'Є':'Ye', 'І':'I', 'Ї':'Yi', 'Ґ':'G', 'є':'ye', 'і':'i', 'ї':'yi', 'ґ':'g',

      // CZECH
      'č':'c', 'ď':'d', 'ě':'e', 'ň': 'n', 'ř':'r', 'š':'s', 'ť':'t', 'ů':'u',
      'ž':'z', 'Č':'C', 'Ď':'D', 'Ě':'E', 'Ň': 'N', 'Ř':'R', 'Š':'S', 'Ť':'T',
      'Ů':'U', 'Ž':'Z',

      // POLISH
      'ą':'a', 'ć':'c', 'ę':'e', 'ł':'l', 'ń':'n', 'ó':'o', 'ś':'s', 'ź':'z',
      'ż':'z', 'Ą':'A', 'Ć':'C', 'Ę':'e', 'Ł':'L', 'Ń':'N', 'Ó':'o', 'Ś':'S',
      'Ź':'Z', 'Ż':'Z',

      // LATVIAN
      'ā':'a', 'č':'c', 'ē':'e', 'ģ':'g', 'ī':'i', 'ķ':'k', 'ļ':'l', 'ņ':'n',
      'š':'s', 'ū':'u', 'ž':'z', 'Ā':'A', 'Č':'C', 'Ē':'E', 'Ģ':'G', 'Ī':'i',
      'Ķ':'k', 'Ļ':'L', 'Ņ':'N', 'Š':'S', 'Ū':'u', 'Ž':'Z',

      // Symbols
      '©':'c',
      '®':'r'
};
