(function ($) {
    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }
    $.fn.customSelect = function (options) {
        $(this).each(function (i, el) {
            var thisElm = $(el);
            //removing already styled select
            if (thisElm.attr('styled')) {
                thisElm.prev('div.custom-select').remove();
            }

            //start
            thisElm.hide();
            var sIndex = thisElm[0].selectedIndex;
            var sValue = thisElm.val();
            var oElm = thisElm.find('option');
            var sText = oElm.eq(sIndex).html();
            var sElm = $('<div/>').addClass('custom-select').attr('tabindex', '-1');
            var sItem = $('<div/>').addClass('selected-item').html(sText);
            var sArrow = $('<div/>').addClass('select-arrow');
            var sInput = $('<input type="text"/>').addClass('custom-select-search');
            var sOption = $('<div class="soption"/>');

            //form reset handler
            var form = thisElm.parents('form');
            var reset = form.find(':reset');
            reset.off('click.customSelectEvent');
            reset.on('click.customSelectEvent', function () {
                thisElm.val(sValue);
            });

            // creating options
            var oStr = '<ul>';
            var optionAry = [];
            var imgStr = "";

            oElm.each(function (ind, elm) {
                if ($(elm).attr('image') && $(elm).attr('image').trim() !== "") {
                    imgStr = '<img src="' + $(elm).attr('image') + '" />';
                } else {
                    imgStr = "";
                }
                oStr = oStr + '<li>' + imgStr + $(elm).html() + '</li>';
                optionAry.push($(elm).html());
            });
            oStr = oStr + '</ul>';

            var sOptions = $(oStr);
            var sLi = sOptions.find('li');

            //Select Element Formation
            sItem.appendTo(sElm);
            sArrow.appendTo(sElm);
            sInput.appendTo(sOption);
            sOptions.appendTo(sOption);
            sOption.appendTo(sElm);
            //mark selected value
            sLi.eq(sIndex).addClass('selected');

            //Select Element Click handler
            var selectClickHandler = function (e) {
                e.stopPropagation();
                $('.custom-select .soption').not(sOption).hide('fast');
                sOption.slideToggle('fast', function () {
                    if (sOption.is(':visible')) {
                        sInput.val('').focus();
                        sLi.show().removeClass('nav-select').filter('.selected').addClass('nav-select');
                        sOptions.scrollTop((sOptions[0].scrollHeight / sLi.length) * sLi.filter('.nav-select').index());
                        //positioning option vertically within space
                        var top = sElm.offset().top;
                        if ((sOptions.height() + top) > $('body').height()) {
                            sOption.css({
                                'bottom': '0',
                                    'top': 'auto'
                            });
                        } else {
                            sOption.css({
                                'bottom': 'auto',
                                    'top': '0'
                            });
                        }
                        //positioning option vertically within space
                        var left = sElm.offset().left;
                        if ((sOptions.width() + left) > $('body').width()) {
                            sOption.css({
                                'right': '0',
                                    'left': 'auto'
                            });
                        } else {
                            sOption.css({
                                'right': 'auto',
                                    'left': '0'
                            });
                        }
                    }
                });
            };
            $(sElm).on('click', selectClickHandler);

            //Option Click handler
            var optionClickHandler = function (e) {
                e.stopPropagation();
                sOption.hide('fast');
                sOptions.find('.selected').removeClass('selected');
                $(this).addClass('selected');
                var cElm = oElm.eq($(this).index());
                sItem.html(cElm.html());
                cElm.prop("selected", 'selected');
                sOption.hide('fast', function () {
                    thisElm.trigger('click');
                    thisElm.trigger('change');
                });
            };
            sLi.on('click', optionClickHandler);

            // to hide option items on click outside
            $(document).on('click', function () {
                sOption.hide('fast');
            });

            //override parent click event (event bubling)
            sInput.on('click', function (e) {
                e.stopPropagation();
            });

            //text search
            var keyUpHandler = function (e) {
                e.stopPropagation();
                var value = sInput.val();
                if (value === "") {
                    sLi.show();
                }
                $.each(optionAry, function (k, v) {
                    if ((new RegExp(value, 'gi')).test(v)) {
                        sLi.eq(k).show();
                    } else {
                        sLi.eq(k).hide();
                    }
                });
            };
            sInput.on('keyup', keyUpHandler);

            //keyboard navigation
            var keyDownHandler = function (e) {
                e.stopPropagation();
                var code = e.keyCode ? e.keyCode : e.which;
                var telm = sLi.filter('.nav-select:visible');
                switch (code) {
                    //esc
                    case 27:
                        sOption.hide('fast');
                        break;
                        //down arrow
                    case 40:

                        if (telm.nextAll(':visible').length) {
                            telm.removeClass('nav-select').nextAll(':visible').first().addClass('nav-select');
                        } else {
                            sLi.removeClass('nav-select').filter(':visible').first().addClass('nav-select');
                        }
                        break;
                        //up arrow
                    case 38:
                        if (telm.prevAll(':visible').length) {
                            telm.removeClass('nav-select').prevAll(':visible').first().addClass('nav-select');
                        } else {
                            sLi.removeClass('nav-select').filter(':visible').last().addClass('nav-select');
                        }
                        break;
                        //enter key
                    case 13:
                        e.preventDefault();
                        telm.trigger('click');
                        break;
                }
                sOptions.scrollTop((sOptions[0].scrollHeight / sLi.filter(':visible').length) * sLi.filter('.nav-select').prevAll(':visible').length);
            };
            sInput.on('keydown', keyDownHandler);

            //placing styled select element
            sElm.insertBefore(el);
            $(el).attr('styled', 'styled');

        });

        return $(this);
    };
    
    //jquery val override
    var oVal = $.fn.val;
    $.fn.val = function (value) {
        var elm = $(this);
        if (typeof value !== 'undefined') {
            var r = oVal.call(elm, value);
            switch (elm[0].tagName.toLowerCase()) {
                case 'select':
                    if (elm.attr('styled')) {
                        var txt = elm.find('option').eq(elm[0].selectedIndex).html();
                        var sElm = elm.prev('.custom-select');
                        sElm.find('.selected-item').html(txt);
                        sElm.find('li').removeClass('selected').eq(elm[0].selectedIndex).addClass('selected');
                    }
                    break;
            }
            return r;
        } else {
            return oVal.call(this);
        }

    };
})(jQuery);
