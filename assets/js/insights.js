(function (global) {
  'use strict';

  var translations = global.TRANSLATIONS || {};
  var fallbackLang = 'en';

  /**
   * To add a new insight card:
   * 1. Append an object with base translation key, ISO date, image, url, and tag list to insightsData.
   * 2. Provide matching translation entries (title, description, date, linkLabel, url, imageAlt) in each language inside assets/js/i18n.js.
   * 3. Drop the optimized thumbnail into assets/img/insights/ following the README image specs.
   */
  var insightsData = [
    {
      baseKey: 'insights.items.0',
      imageSrc: 'assets/img/insights/automation-playbook.svg',
      url: 'https://medium.com/@mariohuartenolasco/human-in-the-loop-automation-blueprint',
      dateISO: '2024-03-18',
      tags: [
        { key: 'insights.tags.automation', modifier: 'is-automation' },
        { key: 'insights.tags.data', modifier: 'is-data' }
      ]
    },
    {
      baseKey: 'insights.items.1',
      imageSrc: 'assets/img/insights/data-strategy-talk.svg',
      url: 'https://slides.com/mariohuartenolasco/analytics-adoption-playbook',
      dateISO: '2023-11-10',
      tags: [
        { key: 'insights.tags.data', modifier: 'is-data' },
        { key: 'insights.tags.leadership', modifier: 'is-leadership' }
      ]
    },
    {
      baseKey: 'insights.items.2',
      imageSrc: 'assets/img/insights/open-source-toolkit.svg',
      url: 'https://github.com/MarioUNAM/ebx-quality-toolkit',
      dateISO: '2023-06-05',
      tags: [
        { key: 'insights.tags.automation', modifier: 'is-automation' },
        { key: 'insights.tags.data', modifier: 'is-data' }
      ]
    },
    {
      baseKey: 'insights.items.3',
      imageSrc: 'assets/img/insights/leadership-guide.svg',
      url: 'assets/docs/leadership-automation-guide.pdf',
      dateISO: '2022-09-15',
      tags: [
        { key: 'insights.tags.leadership', modifier: 'is-leadership' },
        { key: 'insights.tags.automation', modifier: 'is-automation' }
      ]
    }
  ];

  function resolveTranslation(key) {
    if (!key) {
      return '';
    }
    if (translations[fallbackLang] && translations[fallbackLang][key] !== undefined) {
      return translations[fallbackLang][key];
    }
    for (var lang in translations) {
      if (Object.prototype.hasOwnProperty.call(translations, lang)) {
        var catalog = translations[lang];
        if (catalog && catalog[key] !== undefined) {
          return catalog[key];
        }
      }
    }
    return '';
  }

  function buildCard(item, template) {
    var fragment = template.content.cloneNode(true);
    var card = fragment.querySelector('.insight-card');
    if (!card) {
      return fragment;
    }

    card.setAttribute('data-insight-key', item.baseKey);

    var image = fragment.querySelector('.insight-thumb-image');
    if (image) {
      image.src = item.imageSrc;
      image.setAttribute('data-i18n-attrs', 'alt:' + item.baseKey + '.imageAlt');
      var altText = resolveTranslation(item.baseKey + '.imageAlt');
      if (altText) {
        image.alt = altText;
      }
    }

    var tagsWrapper = fragment.querySelector('[data-insight-tags]');
    if (tagsWrapper) {
      var ariaLabel = resolveTranslation('insights.tags.ariaLabel');
      if (ariaLabel) {
        tagsWrapper.setAttribute('aria-label', ariaLabel);
      }
      tagsWrapper.innerHTML = '';
      (item.tags || []).forEach(function (tag) {
        var tagNode = document.createElement('span');
        tagNode.className = 'insight-tag' + (tag.modifier ? ' ' + tag.modifier : '');
        tagNode.setAttribute('data-i18n', tag.key);
        tagNode.textContent = resolveTranslation(tag.key);
        tagsWrapper.appendChild(tagNode);
      });
    }

    var titleLink = fragment.querySelector('.insight-title-link');
    if (titleLink) {
      titleLink.setAttribute('data-i18n', item.baseKey + '.title');
      titleLink.setAttribute('data-i18n-attrs', 'href:' + item.baseKey + '.url');
      titleLink.href = item.url || resolveTranslation(item.baseKey + '.url') || '#';
      titleLink.textContent = resolveTranslation(item.baseKey + '.title');
    }

    var description = fragment.querySelector('[data-insight-description]');
    if (description) {
      description.setAttribute('data-i18n', item.baseKey + '.description');
      description.textContent = resolveTranslation(item.baseKey + '.description');
    }

    var date = fragment.querySelector('[data-insight-date]');
    if (date) {
      date.setAttribute('data-i18n', item.baseKey + '.date');
      if (item.dateISO) {
        date.setAttribute('datetime', item.dateISO);
      }
      date.textContent = resolveTranslation(item.baseKey + '.date');
    }

    var cta = fragment.querySelector('[data-insight-cta]');
    if (cta) {
      cta.classList.add('insight-link');
      cta.setAttribute('data-i18n', item.baseKey + '.linkLabel');
      cta.setAttribute('data-i18n-attrs', 'href:' + item.baseKey + '.url');
      cta.href = item.url || resolveTranslation(item.baseKey + '.url') || '#';
      cta.textContent = resolveTranslation(item.baseKey + '.linkLabel');
    }

    return fragment;
  }

  function renderInsights() {
    var container = document.querySelector('[data-insights-grid]');
    var template = document.getElementById('insight-card-template');

    if (!container || !template) {
      return;
    }

    var docFragment = document.createDocumentFragment();
    insightsData.forEach(function (item) {
      docFragment.appendChild(buildCard(item, template));
    });

    container.innerHTML = '';
    container.appendChild(docFragment);
  }

  renderInsights();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderInsights);
  }

  global.renderInsightsCards = renderInsights;
})(window);
