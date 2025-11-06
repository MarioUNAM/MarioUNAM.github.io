$(function () {
// Navigation
    var $navigation = $('.site-navigation');
    var heroHeight = $('.hero').length ? $('.hero').height() : 0;
    if ($navigation.length && typeof $navigation.affix === 'function') {
        $navigation.affix({
          offset: {
            top: heroHeight
                }
        });
    }

    var $window = $(window);
    function checkWidth() {
        var windowsize = $window.width();
        if (windowsize < 768) {
            $('.nav a').on('click', function(){
                $('.navbar-toggle').click() //bootstrap 3.x by Richard
            });
        }
    }
    // Execute on load
    checkWidth();
    // Bind event listener
    $(window).resize(checkWidth);

// Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.site-header',
        offset: 10
    });

//jQuery for page scrolling feature - requires jQuery Easing plugin
    $(document).on('click', '.page-scroll a', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1000, 'easeInOutExpo');
        event.preventDefault();
    });

//Counters 
    if ($(".counter-start").length>0) {
        $(".counter-start").each(function() {
            var stat_item = $(this),
            offset = stat_item.offset().top;
            $(window).scroll(function() {
                if($(window).scrollTop() > (offset - 1000) && !(stat_item.hasClass('counting'))) {
                    stat_item.addClass('counting');
                    stat_item.countTo();
                }
            });
        });
    };


//Team Carousel
    if ($('#services-carousel').length && typeof $.fn.carousel === 'function') {
        $('#services-carousel').carousel({ interval: false });
    }

    // Carousel touch support
    if($(".carousel-inner").length && typeof $.fn.swipe === 'function') {
        $(".carousel-inner").swipe({
            //Generic swipe handler for all directions
            swipeLeft: function (event, direction, distance, duration, fingerCount) {
                $(this).parent().carousel('next');
            },
            swipeRight: function () {
                $(this).parent().carousel('prev');
            },
            //Default is 75px, set to 0 for demo so any distance triggers swipe
            threshold: 50
        });
    }

// Slick.js
    var $testimonialCarousel = $('.review-carousel');
    if ($testimonialCarousel.length && typeof $.fn.slick === 'function') {
        $testimonialCarousel.each(function () {
            var $carousel = $(this);
            var testimonialCount = $carousel.find('.testimonial-card').length;
            if (testimonialCount > 1) {
                var arrowPreference = ($carousel.data('arrows') || 'always').toString().toLowerCase();
                var arrowBreakpoint = window.matchMedia('(min-width: 992px)');

                var shouldShowArrows = function () {
                    switch (arrowPreference) {
                        case 'never':
                            return false;
                        case 'mobile':
                            return !arrowBreakpoint.matches;
                        case 'desktop':
                            return arrowBreakpoint.matches;
                        default:
                            return true;
                    }
                };

                $carousel.slick({
                    dots: true,
                    adaptiveHeight: true,
                    arrows: shouldShowArrows(),
                    autoplay: true,
                    autoplaySpeed: 7000,
                    pauseOnHover: true,
                    pauseOnFocus: true,
                    pauseOnDotsHover: true,
                    nextArrow: '<button class="slick rectangle slick-next" aria-label="Next testimonial"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
                    prevArrow: '<button class="slick rectangle slick-prev" aria-label="Previous testimonial"><i class="fa fa-angle-left" aria-hidden="true"></i></button>'
                });

                if (arrowPreference === 'desktop' || arrowPreference === 'mobile') {
                    var updateArrowVisibility = function () {
                        if ($carousel.hasClass('slick-initialized')) {
                            $carousel.slick('slickSetOption', 'arrows', shouldShowArrows(), true);
                        }
                    };

                    if (typeof arrowBreakpoint.addEventListener === 'function') {
                        arrowBreakpoint.addEventListener('change', updateArrowVisibility);
                    } else if (typeof arrowBreakpoint.addListener === 'function') {
                        arrowBreakpoint.addListener(updateArrowVisibility);
                    }
                }
            }
        });
    }

    if ($('.clients-carousel').length && typeof $.fn.slick === 'function') {
        $('.clients-carousel').slick({
            arrows: false,
            slidesToShow: 5,
            responsive: [ {
                breakpoint : 992,
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint : 480,
                settings: {
                    slidesToShow: 1
                }
          }]
        });
    }

//shuffle.js
    var shuffleme = (function( $ ) {
      'use strict';
          if (typeof $.fn.shuffle !== 'function') {
            return {
              init: function() {}
            };
          }
          var $grid = $('#grid'), //locate what we want to sort
          $filterOptions = $('.portfolio-sorting li'),  //locate the filter categories

      init = function() {

        // None of these need to be executed synchronously
        setTimeout(function() {
          listen();
          setupFilters();
        }, 100);

        // instantiate the plugin
        $grid.shuffle({
          itemSelector: '[class*="col-"]', 
           group: Shuffle.ALL_ITEMS, 
        });
      },

        
      // Set up button clicks
      setupFilters = function() {
        var $btns = $filterOptions.children();
        $btns.on('click', function(e) {
          e.preventDefault();
          var $this = $(this),
              isActive = $this.hasClass( 'active' ),
              group = isActive ? 'all' : $this.data('group');

          // Hide current label, show current label in title
          if ( !isActive ) {
            $('.portfolio-sorting li a').removeClass('active');
          }

          $this.toggleClass('active');

          // Filter elements
          $grid.shuffle( 'shuffle', group );
        });

        $btns = null;
      },

      // Re layout shuffle when images load. This is only needed
      // below 768 pixels because the .picture-item height is auto and therefore
      // the height of the picture-item is dependent on the image
      // I recommend using imagesloaded to determine when an image is loaded
      // but that doesn't support IE7
      listen = function() {
        var debouncedLayout = function() {
          $grid.shuffle('update');
        };
        if (typeof $.throttle === 'function') {
          debouncedLayout = $.throttle( 300, debouncedLayout);
        }

        // Get all images inside shuffle
        $grid.find('img').each(function() {
          var proxyImage;

          // Image already loaded
          if ( this.complete && this.naturalWidth !== undefined ) {
            return;
          }

          // If none of the checks above matched, simulate loading on detached element.
          proxyImage = new Image();
          $( proxyImage ).on('load', function() {
            $(this).off('load');
            debouncedLayout();
          });

          proxyImage.src = this.src;
        });

        // Because this method doesn't seem to be perfect.
        setTimeout(function() {
          debouncedLayout();
        }, 500);
      };      

      return {
        init: init
      };
    }( jQuery ));

    if($('#grid').length >0 ) {
      shuffleme.init(); //filter portfolio
    };

    // Internationalization
    var translations = window.TRANSLATIONS || {};

    function parseContactStatusFromQuery() {
      var search = window.location ? window.location.search : '';
      if (!search) {
        return null;
      }
      try {
        var params = new URLSearchParams(search);
        var status = params.get('status');
        return status === 'success' || status === 'error' ? status : null;
      } catch (error) {
        return null;
      }
    }

    var contactStatus = parseContactStatusFromQuery();

    function updateContactFormAlerts(status) {
      var $form = $('.contact-form');
      if (!$form.length) {
        return;
      }

      var $success = $form.find('.form-alert-success');
      var $error = $form.find('.form-alert-error');
      var $alerts = $form.find('.form-alert');

      $alerts.attr('hidden', true);

      var $visibleAlert = null;
      if (status === 'success' && $success.length) {
        $visibleAlert = $success;
      } else if (status === 'error' && $error.length) {
        $visibleAlert = $error;
      }

      if ($visibleAlert) {
        $visibleAlert.removeAttr('hidden');
        setTimeout(function () {
          $visibleAlert.focus();
        }, 0);
      }
    }

    function applyTranslations(lang) {
      if (!translations[lang]) {
        return;
      }

      document.documentElement.setAttribute('lang', lang);

      $('[data-i18n], [data-i18n-attrs]').each(function () {
        var $element = $(this);
        var key = $element.data('i18n');
        if (key && translations[lang][key] !== undefined) {
          var target = $element.data('i18n-target');
          if (target === 'html') {
            $element.html(translations[lang][key]);
          } else {
            $element.text(translations[lang][key]);
          }
        }

        var attrs = $element.data('i18n-attrs');
        if (attrs && translations[lang]) {
          attrs.split(',').forEach(function (instruction) {
            var parts = instruction.split(':');
            if (parts.length === 2) {
              var attrName = $.trim(parts[0]);
              var attrKey = $.trim(parts[1]);
              if (translations[lang][attrKey] !== undefined) {
                $element.attr(attrName, translations[lang][attrKey]);
              }
            }
          });
        }
      });

      if (typeof window.localStorage !== 'undefined') {
        try {
          window.localStorage.setItem('preferredLanguage', lang);
        } catch (error) {
          // Ignore storage errors
        }
      }

      $('.language-switcher').each(function () {
        if ($(this).val() !== lang) {
          $(this).val(lang);
        }
      });

      updateContactFormAlerts(contactStatus);
    }

    function resolveInitialLanguage() {
      var defaultLang = 'en';
      if (typeof window.localStorage !== 'undefined') {
        try {
          var stored = window.localStorage.getItem('preferredLanguage');
          if (stored && translations[stored]) {
            defaultLang = stored;
          }
        } catch (error) {
          // Ignore storage errors
        }
      }
      return translations[defaultLang] ? defaultLang : 'en';
    }

    var currentLanguage = resolveInitialLanguage();
    applyTranslations(currentLanguage);

    if (contactStatus && window.history && typeof window.history.replaceState === 'function') {
      var newUrl = window.location.pathname + (window.location.hash || '');
      window.history.replaceState({}, document.title, newUrl);
    }

    $(document).on('change', '.language-switcher', function (event) {
      var selectedLang = $(event.target).val();
      if (!translations[selectedLang]) {
        selectedLang = 'en';
      }
      currentLanguage = selectedLang;
      applyTranslations(currentLanguage);
    });
}());
