/*
 * MySource Matrix Simple Edit Tools (jquery.matrix.js)
 * version: 0.2.4 (FEB-25-2009)
 * Copyright (C) 2009 Nicholas Hubbard
 * @requires jQuery v1.2.6 or later
 * @requires Trigger or Asset configuration in MySource Matrix
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
	 *This Plugin will allow you to submit an asset builder using ajax, including wysiwyg editor fields.
	 */
$.fn.matrixForm = function(options) {
  var defaults = {
    findCreated: '',
    findTarget: '',
    loading: ''
  };

  var options = $.extend(defaults, options);

  return this.each(function() {

    var obj = $(this);
    var itemId = obj.attr('id');
    var itemHref = obj.attr('action');
    obj.removeAttr('onsubmit');
    if ($('input:file').length === 0) {
      $('#sq_commit_button').removeAttr('onclick');

      $('#sq_commit_button').click(function() {
        $('textarea[name^="news_item"], textarea[name^="calendar_event"]').each(function() {
          var textId = $(this).attr('id');
          $(this).val(eval('editor_' + textId + '.getHTML();'));
        });
        var serializeForm = obj.serialize();
        $.ajax({
          type: 'POST',
          url: itemHref,
          data: serializeForm,
          beforeSend: function() {
            if (defaults.findTarget !== '') {
              $(defaults.findTarget).show();
            }
            if (defaults.loading !== '') {
              $('#sq_commit_button').after('<img id="loadingImage" src="' + defaults.loading + '" alt="Loading" />');
            }
          },
          success: function(html) {
            $('#loadingImage').remove();
            if (defaults.findCreated !== '' && defaults.findTarget !== '') {
              $(defaults.findTarget).html($(html).find(defaults.findCreated));
              setTimeout(function() {
                $(defaults.findTarget).fadeOut('slow',
                function() {
                  $(this).html('');
                });
              },
              5000);
            }
          }
        }); //End Ajax
      }); //End Click
    } else {
      //Use iframe if form is uploading a file
      $('body').append('<iframe id="assetBuilderFrame" name="assetBuilderFrame" style="position:absolute; top:-1000px; left:-1000px;"></iframe>');
      $('#assetBuilderFrame').attr('src', 'javascript:false;document.write("")');
	  obj.attr('target', 'assetBuilderFrame');
      $('#sq_commit_button').click(function() {
        obj.submit();
        //obj.html(iframeContent);
      });
	  
    } //End Else
	
  });
  
};
  
  /*
	 *This Plugin filters a list of matched elements.  Great when used with Asset Listings.
	 *Filter searching is similar to iTunes search.
	 *Thanks to Matt Ryall for the idea.
	 */
$.fn.matrixFilter = function(options) {
  var defaults = {
    target: 'body',
    count: true
  };

  var options = $.extend(defaults, options);

  $(defaults.target).append('<input id="filter" type="text" /> <span id="count"></span>');

  var obj = $(this);
  total = obj.length;
  if (defaults.count) {
    $('#count').text(total + ' of ' + total);
  }
  $('#filter').keyup(function() {
    var filter = $('#filter').val(),
    count = 0;
    obj.each(function() {
      if ($(this).text().search(new RegExp(filter, 'i')) < 0) {
        $(this).hide();
      } else {
        $(this).show();
        count++;
      }
    });
    if (defaults.count) {
      $('#count').text(count + ' of ' + total);
    }
	
  }); //End keyup
  
};

  /*
	 *This Plugin is used to stay within the same page while opening Simple Edit pages.  
	 *It creates and iframe, then opens URLs within the iframe.
	 */
  $.fn.matrixFrame = function(options) {
    var defaults = {
      urlSuffix: '',
      target: 'body'
    };

    var options = $.extend(defaults, options);

    $(defaults.target).append('<iframe name="assetEditFrame" id="assetEditFrame" scrolling="no" frameborder="0"></iframe>');

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
    checkboxAfter: true,
    urlSuffix: '?action=delete',
    target: 'body',
    simpleEdit: false,
    removeParent: true,
	onComplete: function() {}
  };
  var options = $.extend(defaults, options); // Add our delete button
  if (defaults.multiple) {
    $(defaults.target).append('<input id="massDelete" type="button" value="Delete Multiple" />');
  }
  return this.each(function() {
    var obj = $(this);
    var itemDesc = obj.attr('rel'); 
	// Remove simple edit url addition for links
    if (!defaults.simpleEdit) {
      var itemHref = obj.attr('href');
    } else {
      var itemHref = obj.attr('href').replace('/_edit', '');
      obj.attr('href', itemHref);
    } 
	// Add our multiple delete checkbox
    if (defaults.multiple) {
      var deleteCheckbox = '<input class="' + defaults.checkboxClass + '" type="checkbox" value="' + itemHref + '" />';
      if (defaults.checkboxAfter) {
        obj.after(deleteCheckbox);
      } else {
        obj.before(deleteCheckbox);
      }
    }
    obj.click(function() { 
		// Be nice with our wording
      if (!itemDesc == '') {
        var question = confirm('Are you sure you want to delete "' + itemDesc + '"?');
      } else {
        var question = confirm('Are you sure you want to delete this?');
      }
      if (question) {
        $.ajax({
          type: 'POST',
          url: itemHref + defaults.urlSuffix
        });
        if (defaults.removeParent) {
          obj.parent().remove();
        }
	  
	  // Run our custom callback
	  defaults.onComplete.apply(obj, []);
	  
      }
      return false;
    }); 
	// Check to see if the user wants to delete multiples
    if (defaults.multiple) {
      $('#massDelete').unbind('click');
      $('#massDelete').click(function() { 
		// Lets count how many items we are going to delete
        var deleteCount = $('.' + defaults.checkboxClass + ':checked').length; 
		// Lets be kind with our wording
        if (deleteCount <= 1) {
          var deleteWord = 'item';
        } else {
          var deleteWord = 'items';
        }
        var answerDelete = confirm('You are about to delete ' + deleteCount + ' ' + deleteWord + ', are you sure you want to do this?'); 
		// If the user confirms, continue
        if (answerDelete) {
          $('input:checked').each(function() { 
			// Loop through each match and run a POST for that URL
            $.ajax({
              type: 'POST',
              url: this.value + defaults.urlSuffix
            });
          }); 
		  // Check to see if we can remove parents
          if (defaults.removeParent) {
            $(this + ':checked').parent().remove();
          }//end removeParent
		  
		  // Run our custom callback
		  defaults.onComplete.apply(obj, []);
		  
        }//end if (answerDelete)
		
      });//end click function
	  
    }//end if (defaults.multiple)
	
  });//end return
  
};

  /*
	 *This Plugin will clone the current asset and link to the same parent
	 */
  $.fn.matrixClone = function(options) {
    var defaults = {
      limit: 10,
      urlSuffix: '?action=duplicate',
      target: 'body',
	  onComplete: function() {}
    };

    var options = $.extend(defaults, options);

    // Add our duplicate field and button
	$(defaults.target).append('<input id="duplicateInput" type="text" value="" /> <input id="duplicateConfirm" type="button" value="Duplicate" />');

    return this.each(function() {

      var obj = $(this);
      obj.click(function() {
        var itemHref = obj.attr('href');
		var itemDesc = obj.attr('rel');
        $('#duplicateConfirm').unbind('click');
        $('#duplicateConfirm').click(function() {
          var duplicateVal = $('#duplicateInput').val();
		  if(isNaN(duplicateVal)) {
			  alert('You have entered a value that is not a number. Please enter a number.');
			  $('#duplicateInput').val('');
			  return false;
		  }
		  var dulicateCheck = parseInt(duplicateVal);
		  // Check our duplication limit
          if (dulicateCheck <= defaults.limit) {
            if (!itemDesc == '') {
				var cloneAnswer = confirm('Are you sure you want duplicate "' + itemDesc + '" ' + dulicateCheck + ' times?');
			} else {
				var cloneAnswer = confirm('Are you sure you want duplicate this ' + dulicateCheck + ' times?');
			}
            if (cloneAnswer) {
              for (i = 1; i <= dulicateCheck; i++) {
                $.ajax({
                  type: 'POST',
                  url: itemHref + defaults.urlSuffix
                });
              } // for
			  
			  // Run our custom callback
			  defaults.onComplete.apply(obj, []);
			  
            }//end if
          } else {
            alert('You are limited to ' + defaults.limit + ' duplicates or less, please adjust your value.');
            $('#duplicateInput').val('');
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
      urlSuffix: '?action=live',
	  onComplete: function() {}
    };

    var options = $.extend(defaults, options);

    return this.each(function() {
      var obj = $(this);
	  var itemDesc = obj.attr('rel');
      var itemId = obj.attr('id');
      var itemHref = obj.attr('href');
      obj.click(function() {
      if (!itemDesc == '') {
		  var question = confirm('Are you sure you want to change the status of "'+itemDesc+'"?');
	  } else {
		  var question = confirm('Are you sure you want to change the status?');
	  }
        if (question) {
          $.ajax({
            type: 'POST',
            url: itemHref + defaults.urlSuffix
          });
		  
		  // Run our custom callback
		  defaults.onComplete.apply(obj, []);
		  
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
      //None yet
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
          type: 'POST',
          url: location.href,
		  data: '?action=change&details=' + saveContent
        });
		
      });
	  
    });
	
  };
  
  //End  
})(jQuery);