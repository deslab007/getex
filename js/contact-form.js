/* Getex — enquiry form
 *
 * Sends the enquiry straight from the page to help@getex.com.au through
 * Web3Forms (https://web3forms.com), a form-to-email service for static sites.
 * The access key below is created for help@getex.com.au on web3forms.com; it
 * only allows sending to that inbox, so it is safe to have in the page.
 *
 * On the WordPress migration, replace this file with the theme's form handler.
 */
(function () {
  'use strict';

  var WEB3FORMS_ACCESS_KEY = '';           // <-- paste the key from web3forms.com to go live
  var ENDPOINT = 'https://api.web3forms.com/submit';
  var CONTACT_EMAIL = 'help@getex.com.au';
  var CONTACT_PHONE = '(02) 9889 2488';

  var form = document.getElementById('enquiry-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var submit = form.querySelector('.form-submit');
  var sent = document.getElementById('form-sent');
  var sentName = document.getElementById('form-sent-name');
  var again = document.getElementById('form-sent-again');

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

  function showSent(data) {
    form.reset();
    RULES.forEach(clearError);
    if (status) status.hidden = true;
    if (sentName) sentName.textContent = data.first_name ? ', ' + data.first_name : '';
    form.hidden = true;
    sent.hidden = false;
    sent.focus();
  }

  if (again) {
    again.addEventListener('click', function () {
      sent.hidden = true;
      form.hidden = false;
      var first = form.querySelector('input, textarea');
      if (first) first.focus();
    });
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

    if (!WEB3FORMS_ACCESS_KEY) {
      setStatus('Online enquiries are not switched on yet. Please email ' + CONTACT_EMAIL + ' or call ' + CONTACT_PHONE + '.', 'error');
      return;
    }

    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    setStatus('Sending your enquiry…', 'info');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: 'Website enquiry: ' + data.enquiry_type + ' from ' + data.first_name + ' ' + data.last_name,
        from_name: 'Getex website',
        replyto: data.email,
        name: data.first_name + ' ' + data.last_name,
        email: data.email,
        organisation: data.organisation || '-',
        phone: data.phone || '-',
        enquiry_type: data.enquiry_type,
        message: data.message,
        botcheck: ''
      })
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) {
          if (!response.ok || body.success === false) throw new Error(body.message || ('Request failed: ' + response.status));
        });
      })
      .then(function () { showSent(data); })
      .catch(function () {
        setStatus('Sorry, your enquiry could not be sent. Please try again, call ' + CONTACT_PHONE + ' or email ' + CONTACT_EMAIL + '.', 'error');
      })
      .then(function () {
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
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
