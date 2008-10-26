/*
 * MySource Matrix Simple Edit Tools (jquery.matrix.js)
 * version: 0.9.1 (OCT-25-2008)
 * Copyright (C) 2008 Nicholas Hubbard
 * @requires jQuery v1.2.6 or later
 * @requires Trigger configuration in MySource Matrix
 *
 * Examples and documentation at: http://www.zedsaid.com/projects/simple-edit-tools
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */

//Overwrite limbo_outputter.inc function so that we can open frames
function page_on_load() {
  SQ_DOCUMENT_LOADED = true;
};

(function($) {
  /*
	 *This Plugin is used to stay within the same page while opening Simple Edit pages.  
	 *It creates and iframe, then opens URLs within the iframe.
	 */
  $.fn.matrixFrame = function(options) {
    var defaults = {
      urlSuffix: '?test'
    };

    $('body').append('<iframe name="assetEditFrame" id="assetEditFrame" scrolling="no" frameborder="0"></iframe>');

    var options = $.extend(defaults, options);

    return this.each(function() {

      var obj = $(this);
      var itemId = obj.attr('id');
      var itemHref = obj.attr('href');

      obj.attr('target', 'assetEditFrame');
      obj.attr('href', itemHref + defaults.urlSuffix);
    });
  };

  /*
	 *This Plugin will delete single or multiple assets
	 */
  $.fn.matrixDelete = function(options) {
    var defaults = {
      multiple: false,
      checkboxClass: 'delete',
      urlSuffix: 'action=delete'
    };

    var options = $.extend(defaults, options);

    if (defaults.multiple == true) {
      $('body').append('<p><input id="massDelete" type="button" value="Delete Multiple" />');
    }

    return this.each(function() {

      var obj = $(this);
      var itemId = obj.attr('id');
      var itemHref = obj.attr('href');
      obj.wrap('<span class="deleteHolder"></span>');
      if (defaults.multiple == true) {
        obj.after('<input id="' + itemId + '" class="' + defaults.checkboxClass + '" name="' + itemId + '" type="checkbox" value="' + itemHref + '" />');
      }
      obj.click(function() {
        var question = confirm('Are you sure you want to delete asset #' + itemId);
        if (question) {
          $.ajax({
            type: 'POST',
            url: itemHref + '?' + defaults.urlSuffix
          });
          obj.parent('.deleteHolder').hide();
          obj.parent().parent().hide();
        }
        return false;
      });
      $('#massDelete').unbind('click');
      $('#massDelete').click(function() {
        var answerDelete = confirm('Are you sure you want to delete multiple assets?');
        if (answerDelete) {
          $(':checkbox:checked').each(function() {
            $.ajax({
              type: 'POST',
              url: itemHref + '?' + defaults.urlSuffix
            });
          });
          $('input:checked').parent('.deleteHolder').hide();
          $('input:checked').parent().parent().hide();
          $("#assetEditFrame").contents().html("");
        }
      });
    });
  };

  /*
	 *This Plugin will clone the current asset and link to the same parent
	 */
  $.fn.matrixClone = function(options) {
    var defaults = {
      limit: 10
    };

    var options = $.extend(defaults, options);

    $('body').append('<p><input id="duplicateInput" type="text" value="" /> <input id="duplicateConfirm" type="button" value="Duplicate" />');

    return this.each(function() {
      var obj = $(this);

      obj.click(function() {
        var itemId = obj.attr('id');
        var itemHref = obj.attr('href');
        $('#duplicateConfirm').unbind('click');
        $('#duplicateConfirm').click(function() {
          var dulicateCheck = parseInt($('#duplicateInput').val());
          if (dulicateCheck <= defaults.limit) {
            var cloneAnswer = confirm('Are you sure you want duplicate asset #' + itemId + ' ' + dulicateCheck + ' times?');
            if (cloneAnswer) {
              //Loop through number value, posting to the trigger each time
              for (i = 1; i <= dulicateCheck; i++) {
                $.ajax({
                  type: "POST",
                  url: itemHref + "?action=duplicate"
                });
              } // for
            }
          } else {
            alert('You are limited to ' + defaults.limit + ' duplicates or less, please adjust your value.');
            $("#duplicateInput").val("");
          }
        }); //end DuplicateConfirm
        return false;
      }); //end obj.click
    });
  };

  /*
	 *This Plugin will change the status of an asset
	 */
  $.fn.matrixStatus = function(options) {
    var defaults = {
      status: 'live'
    };

    var options = $.extend(defaults, options);

    return this.each(function() {

      var obj = $(this);

      var itemId = obj.attr('id');
      var itemHref = obj.attr('href');
      obj.click(function() {
        var question = confirm('Are you sure you want set the status of asset #' + itemId + ' to ' + defaults.status + '?');
        if (question) {
          $.ajax({
            type: 'POST',
            url: itemHref + '?action=' + defaults.status
          });
        }
        return false;
      });

    });

  };

  /*
	 *This Plugin is VERY experimental and hardly even functional.  
	 *It is used to edit text inline and POST back using ajax.
	 *Current page URL, %asset_url% must be passed to function
	 *Work in progress!!
	 */
  $.fn.matrixEdit = function(options) {
    var defaults = {
      currentPage: ''
    };

    var options = $.extend(defaults, options);

    return this.each(function() {

      var obj = $(this);

      obj.click(function() {
        obj.attr('contentEditable', 'true').css('background-color', '#ccc');
      });
      obj.blur(function() {
        obj.attr('contentEditable', 'false').css('background-color', '#fff');
      });
      $('#save').click(function() {
        var saveContent = obj.html();
        var currentHref = defaults.currentPage;
        $.ajax({
          type: 'GET',
          url: currentHref + '?action=change&details=' + saveContent
        });
      });

    });
  };
  //End  
})(jQuery);