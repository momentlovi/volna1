document.addEventListener('DOMContentLoaded', () => {
  // 1. Reveal Animations on Scroll
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

  // 2. Modal Management
  const modal = document.getElementById('lead-modal');
  const modalTriggers = document.querySelectorAll('.modal-trigger');
  const modalClose = document.querySelector('.modal-close-v3');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      modal.showModal();
    });
  });

  modalClose?.addEventListener('click', () => modal.close());
  
  // Close modal on outside click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  // 3. Simple Phone Masking (Input helper)
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
      if (!x[2]) {
        e.target.value = x[1] === '7' || x[1] === '8' ? '+7 (' : x[1] ? '+7 (' + x[1] : '';
      } else {
        e.target.value = !x[3] ? '+7 (' + x[2] : '+7 (' + x[2] + ') ' + x[3] + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
      }
    });
  });

  // 4. Form Submission & Toast
  const forms = document.querySelectorAll('.lead-gen-form');
  const toast = document.getElementById('toast-message');

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
  };

  forms.forEach(form => {
    if (!form.querySelector('input[name="hp"], input[name="website"], input[name="company"], input[name="hidden"]')) {
      const hpInput = document.createElement('input');
      hpInput.type = 'text';
      hpInput.name = 'hp';
      hpInput.tabIndex = -1;
      hpInput.autocomplete = 'off';
      hpInput.setAttribute('aria-hidden', 'true');
      hpInput.style.display = 'none';
      form.appendChild(hpInput);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"], button');
      if (!submitBtn) {
        return;
      }

      if (typeof window.sendLead !== 'function') {
        console.error('sendLead is not available');
        showToast('Ошибка отправки. Попробуйте позже.');
        return;
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const source = form.dataset.goal || 'lead';
      const originalText = submitBtn.textContent || '';

      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';

      try {
        await window.sendLead({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          source: source,
          message: [
            `Форма: ${source}`,
            data.messenger ? `Канал: ${data.messenger}` : '',
            data.budget ? `Бюджет: ${data.budget}` : '',
            data.service ? `Запрос: ${data.service}` : ''
          ].filter(Boolean).join('\n'),
          hp: data.hp || data.website || data.company || data.hidden || ''
        });

        if (modal.open) modal.close();
        form.reset();
        showToast('Спасибо! Мы получили ваш запрос и свяжемся с вами в ближайшее время.');
      } catch (error) {
        console.error('Lead submit failed:', error);
        showToast('Ошибка отправки. Попробуйте позже.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  });

  // 5. Header Scroll Effect & Mobile Menu
  const header = document.getElementById('header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');
  const mobileActions = document.querySelector('.mobile-actions-v3');

  const updateHeaderUi = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (mobileActions) {
      if (window.scrollY > 220) {
        mobileActions.classList.add('is-visible');
      } else {
        mobileActions.classList.remove('is-visible');
      }
    }
  };

  updateHeaderUi();
  window.addEventListener('scroll', updateHeaderUi);

  mobileToggle?.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    mainNav.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });

  // Close mobile menu on link click
  mainNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      mainNav.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  });
});
