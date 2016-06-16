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
      for (i = 0; i < source.length; i++) {
        c = source[i];
        var downgraded = $.wikiword.downgradeMap[c] || c;
        result += downgraded;
        if(downgraded.length != 1) {
          if(i <= selectionStart) {
              selectionStart += downgraded.length -1;
          }
          if(i <= selectionEnd) {
              selectionEnd += downgraded.length -1;
          }
        }
      }
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
