/* Getex — enquiry form
 *
 * A static site has no server to post to. Set FORM_ENDPOINT below to a form
 * service (Formspree, Web3Forms, Netlify Forms) and the form will POST there
 * as JSON. While it is empty, the form validates and then opens a pre-filled
 * email to help@getex.com.au so enquiries still reach Getex.
 *
 * On the WordPress migration, replace this file with the theme's form handler.
 */
(function () {
  'use strict';

  var FORM_ENDPOINT = '';                  // <-- set this to go live
  var FALLBACK_EMAIL = 'help@getex.com.au';

  var form = document.getElementById('enquiry-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var submit = form.querySelector('.form-submit');

  var RULES = [
    { name: 'first_name',   error: 'e-first-name', message: 'Please enter your first name.' },
    { name: 'last_name',    error: 'e-last-name',  message: 'Please enter your last name.' },
    { name: 'email',        error: 'e-email',   message: 'Please enter your email address.' },
    { name: 'enquiry_type', error: 'e-type',    message: 'Please choose what you need help with.' },
    { name: 'message',      error: 'e-message', message: 'Please tell us about your project.' }
  ];

  function showError(rule, message) {
    var el = document.getElementById(rule.error);
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    var input = form.querySelector('[name="' + rule.name + '"]');
    if (input && input.type !== 'radio') input.setAttribute('aria-invalid', 'true');
  }

  function clearError(rule) {
    var el = document.getElementById(rule.error);
    if (el) { el.hidden = true; el.textContent = ''; }
    var input = form.querySelector('[name="' + rule.name + '"]');
    if (input) input.removeAttribute('aria-invalid');
  }

  function valueOf(name) {
    var fields = form.querySelectorAll('[name="' + name + '"]');
    if (!fields.length) return '';
    if (fields[0].type === 'radio') {
      for (var i = 0; i < fields.length; i++) if (fields[i].checked) return fields[i].value;
      return '';
    }
    return (fields[0].value || '').trim();
  }

  function validate() {
    var firstInvalid = null;

    RULES.forEach(function (rule) {
      clearError(rule);
      var value = valueOf(rule.name);

      if (!value) {
        showError(rule, rule.message);
        firstInvalid = firstInvalid || rule;
        return;
      }
      // Shape check only — the server/mail client is the real authority
      if (rule.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        showError(rule, 'Please enter a valid email address.');
        firstInvalid = firstInvalid || rule;
      }
    });

    if (firstInvalid) {
      var focusTarget = form.querySelector('[name="' + firstInvalid.name + '"]');
      if (focusTarget) focusTarget.focus();
    }
    return !firstInvalid;
  }

  function setStatus(message, kind) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status' + (kind ? ' is-' + kind : '');
    status.hidden = false;
  }

  function payload() {
    return {
      first_name: valueOf('first_name'),
      last_name: valueOf('last_name'),
      organisation: valueOf('organisation'),
      email: valueOf('email'),
      phone: valueOf('phone'),
      enquiry_type: valueOf('enquiry_type'),
      message: valueOf('message')
    };
  }

  function mailtoFallback(data) {
    var body = [
      'Name: ' + data.first_name + ' ' + data.last_name,
      'Organisation: ' + (data.organisation || '-'),
      'Email: ' + data.email,
      'Phone: ' + (data.phone || '-'),
      'Enquiry type: ' + data.enquiry_type,
      '',
      data.message
    ].join('\n');

    window.location.href = 'mailto:' + FALLBACK_EMAIL +
      '?subject=' + encodeURIComponent('Website enquiry: ' + data.enquiry_type) +
      '&body=' + encodeURIComponent(body);

    setStatus('Your email app should now open with your enquiry ready to send. If it does not, email us directly at ' + FALLBACK_EMAIL + '.', 'info');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Honeypot: a filled hidden field means a bot. Fail silently.
    if (valueOf('website')) return;

    if (!validate()) {
      setStatus('Please check the highlighted fields.', 'error');
      return;
    }

    var data = payload();

    if (!FORM_ENDPOINT) {
      mailtoFallback(data);
      return;
    }

    submit.disabled = true;
    setStatus('Sending your enquiry…', 'info');

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Request failed: ' + response.status);
        form.reset();
        RULES.forEach(clearError);
        setStatus('Thank you — your enquiry has been sent. We will be in touch shortly.', 'success');
      })
      .catch(function () {
        setStatus('Sorry, something went wrong sending your enquiry. Please call (02) 9889 2488 or email ' + FALLBACK_EMAIL + '.', 'error');
      })
      .then(function () {
        submit.disabled = false;
      });
  });

  // Clear a field's error as soon as the person starts fixing it
  RULES.forEach(function (rule) {
    var fields = form.querySelectorAll('[name="' + rule.name + '"]');
    Array.prototype.forEach.call(fields, function (field) {
      field.addEventListener(field.type === 'radio' ? 'change' : 'input', function () {
        clearError(rule);
      });
    });
  });
})();
