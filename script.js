/* ============================================================
   MAISON VÊTIR — Script Principal
   Módulos: Icons | Header | Nav Mobile | Reveal | Cart
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. INICIALIZAR LUCIDE ICONS ──────────────────────────
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ── 2. HEADER — Scroll shadow ────────────────────────────
  const header = document.getElementById('header');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── 3. MENU MOBILE — Hambúrguer ──────────────────────────
  const hamburger   = document.getElementById('hamburger');
  const nav         = document.getElementById('nav');
  const navClose    = document.getElementById('navClose');
  const navOverlay  = document.getElementById('navOverlay');

  const openNav = () => {
    nav.classList.add('open');
    navOverlay.classList.add('visible');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    nav.classList.remove('open');
    navOverlay.classList.remove('visible');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', openNav);
  navClose.addEventListener('click', closeNav);
  navOverlay.addEventListener('click', closeNav);

  // Fechar ao clicar em links de nav (mobile)
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // ── 4. REVEAL ON SCROLL ──────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target); // one-shot
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  // ── 5. SACOLA DE COMPRAS ─────────────────────────────────

  /**
   * Estado da sacola
   * @type {{ name: string, price: number, qty: number }[]}
   */
  let cartItems = [];

  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartTrigger = document.getElementById('cartTrigger');
  const cartClose   = document.getElementById('cartClose');
  const cartBadge   = document.getElementById('cartBadge');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartBody    = cartSidebar.querySelector('.cart-body');

  // Abrir / fechar sidebar
  const openCart = () => {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  };

  cartTrigger.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // Formatar preço em BRL
  const formatPrice = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

  // Atualizar badge e total
  const updateCartUI = () => {
    const totalQty = cartItems.reduce((acc, i) => acc + i.qty, 0);
    const totalVal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);

    cartTotalEl.textContent = formatPrice(totalVal);

    // Badge
    cartBadge.textContent = totalQty;
    cartBadge.classList.toggle('visible', totalQty > 0);

    // Renderizar itens ou empty state
    renderCartItems();
  };

  // Placeholder de imagem para itens adicionados via "Quick Add"
  const PLACEHOLDER_IMGS = [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=60',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=200&q=60',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=60',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=60',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&q=60',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=200&q=60',
  ];

  const renderCartItems = () => {
    if (cartItems.length === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          <i data-lucide="shopping-bag"></i>
          <p>Sua sacola está vazia.</p>
          <span>Explore nossa curadoria e adicione peças únicas.</span>
        </div>`;
    } else {
      cartBody.innerHTML = cartItems.map((item, idx) => `
        <div class="cart-item" data-index="${idx}">
          <div class="cart-item-img">
            <img src="${PLACEHOLDER_IMGS[idx % PLACEHOLDER_IMGS.length]}" alt="${item.name}" loading="lazy" />
          </div>
          <div>
            <p class="cart-item-name">${item.name}</p>
            <p class="cart-item-price">${formatPrice(item.price)} × ${item.qty}</p>
          </div>
          <button class="cart-item-remove" data-index="${idx}" aria-label="Remover ${item.name}">
            <i data-lucide="x"></i>
          </button>
        </div>`).join('');
    }

    // Re-inicializar ícones Lucide dentro do cart
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Bind: remover item
    cartBody.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        removeItem(idx);
      });
    });
  };

  // Adicionar produto
  const addItem = (name, priceInCents) => {
    const existing = cartItems.find(i => i.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cartItems.push({ name, price: priceInCents, qty: 1 });
    }
    updateCartUI();
    openCart();

    // Feedback visual no botão
    const btns = document.querySelectorAll(`.btn-quick-add[data-name="${name}"]`);
    btns.forEach(btn => {
      const original = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="check"></i> Adicionado';
      btn.style.background = '#4a7c59';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 1800);
    });
  };

  // Remover item
  const removeItem = (idx) => {
    cartItems.splice(idx, 1);
    updateCartUI();
  };

  // Bind: botões "Quick Add"
  document.querySelectorAll('.btn-quick-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const name  = btn.dataset.name;
      const price = parseInt(btn.dataset.price, 10) * 100; // converter para centavos
      addItem(name, price);
    });
  });

  // ── 6. NEWSLETTER — Feedback ─────────────────────────────
  const newsletterBtn = document.querySelector('.newsletter-form button');
  const newsletterInput = document.querySelector('.newsletter-form input');

  if (newsletterBtn && newsletterInput) {
    newsletterBtn.addEventListener('click', () => {
      const email = newsletterInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        newsletterInput.style.outline = '1px solid #dc2626';
        setTimeout(() => { newsletterInput.style.outline = ''; }, 2000);
        return;
      }

      // Sucesso
      newsletterInput.value = '';
      newsletterInput.placeholder = '✓ Inscrição confirmada!';
      newsletterBtn.style.background = '#4a7c59';
      setTimeout(() => {
        newsletterInput.placeholder = 'Seu e-mail';
        newsletterBtn.style.background = '';
      }, 3000);
    });

    // Enter no campo
    newsletterInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') newsletterBtn.click();
    });
  }

  // ── 7. TICKER — Duplicar para loop infinito ───────────────
  const strip = document.querySelector('.curadoria-strip');
  if (strip) {
    const clone = strip.cloneNode(true);
    strip.parentElement.appendChild(clone);
  }

  // ── INICIALIZAÇÃO ─────────────────────────────────────────
  updateCartUI();

}); // end DOMContentLoaded
