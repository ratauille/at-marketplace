(() => {
  const productContainer = document.getElementById("products");
  const filterContainer = document.getElementById("filters");

  if (!Array.isArray(P) || !productContainer || !filterContainer) {
    throw new Error("Catalog enhancements could not find the catalog data or containers.");
  }

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "catalog-enhancements.css";
  document.head.appendChild(stylesheet);

  const quotePrice = "Price confirmed in your quote";
  const usedProductIndexes = new Set();
  const itemIds = new Set();
  const openFamilies = new Set();
  const selectedQuantities = new Map();
  const mediaQuery = window.matchMedia("(min-width: 768px)");
  const originalProductCount = P.length;

  // TODO: Cambiar por foto real de la base de datos o almacenamiento
  const provisionFamilies = [
    {
      id: "premium-shrimp",
      category: "Fresh Seafood",
      name: "Premium Shrimp",
      description: "Premium shrimp selected for freshness, size and quality.",
      image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80",
      products: [
        { sourceCategory: "Premium Seafood", sourceName: "Giant Shrimp U-10 / U-12" },
        { id: "shrimp-u15", name: "Jumbo Shrimp U-15", unit: "1 kg" },
        { id: "shrimp-16-20", name: "Large Shrimp 16/20", unit: "1 kg" },
        { id: "shrimp-peeled", name: "Peeled & Deveined Shrimp", unit: "1 kg" },
        { id: "shrimp-local", name: "Fresh Local Shrimp", unit: "1 kg" },
        { id: "shrimp-cooked", name: "Cooked Shrimp", unit: "500 g" },
      ],
    },
    {
      id: "wild-catch",
      category: "Fresh Seafood",
      name: "Wild Catch of the Day",
      description: "Day-caught fish and chef-selected local specialties.",
      image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=900&q=80",
      products: [
        { sourceCategory: "Fresh Fish", sourceName: "Whole Red Snapper (Huachinango)" },
        { sourceCategory: "Fresh Fish", sourceName: "Mahi-Mahi (Dorado)" },
        { sourceCategory: "Fresh Fish", sourceName: "Wild Sea Bass / Lubina" },
        { sourceCategory: "Fresh Fish", sourceName: "Yellowfin Tuna" },
        { sourceCategory: "Fresh Fish", sourceName: "Hiramasa / Amberjack" },
        { sourceCategory: "Fresh Fish", sourceName: "Grouper Fillet (Mero)" },
        { id: "whole-fish-zarandeado", name: "Whole Fish for Zarandeado", unit: "Whole fish" },
        { id: "catch-chef-selection", name: "Catch of the Day — Chef Selection", unit: "Chef selection" },
      ],
    },
    {
      id: "beef-tenderloin",
      category: "USDA Prime & Wagyu",
      name: "Beef Tenderloin",
      description: "A considered selection of tenderloin cuts and premium grades.",
      image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=900&q=80",
      products: [
        { id: "choice-beef-tenderloin", name: "USDA Choice Beef Tenderloin", unit: "1 kg" },
        { id: "prime-beef-tenderloin", name: "USDA Prime Beef Tenderloin", unit: "1 kg" },
        { sourceCategory: "USDA Prime & Wagyu", sourceName: "Filet Mignon / Tenderloin" },
        { id: "whole-center-cut-tenderloin", name: "Whole Center-Cut Tenderloin", unit: "Whole cut" },
        { id: "wagyu-tenderloin", name: "Wagyu Tenderloin", unit: "1 kg" },
      ],
    },
    {
      id: "seasonal-tropical-fruit",
      category: "Fresh Produce",
      name: "Seasonal Tropical Fruit",
      description: "Ripe tropical and seasonal fruit, selected for your stay.",
      image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80",
      products: [
        { sourceCategory: "Fresh & Specialty", sourceName: "Fresh Organic Berries" },
        { sourceCategory: "Fresh & Specialty", sourceName: "Organic Strawberries" },
        { sourceCategory: "Fresh & Specialty", sourceName: "Ataulfo Mangoes" },
        { sourceCategory: "Fresh & Specialty", sourceName: "Tropical Fruit Selection" },
      ],
    },
    {
      id: "fresh-vegetables",
      category: "Fresh Produce",
      name: "Fresh Vegetables",
      description: "Seasonal produce chosen for freshness and villa cooking.",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
      products: [
        { sourceCategory: "Fresh & Specialty", sourceName: "Organic Baby Greens Mix" },
        { sourceCategory: "Fresh & Specialty", sourceName: "Heirloom Cherry Tomatoes" },
        { sourceCategory: "Fresh & Specialty", sourceName: "Fresh Herbs Bundle" },
        { sourceCategory: "Fresh & Specialty", sourceName: "Fresh Green Asparagus" },
        { sourceCategory: "Fresh & Specialty", sourceName: "Baby Potatoes" },
      ],
    },
    {
      id: "artisan-cheese-selection",
      category: "Gourmet",
      name: "Artisan Cheese Selection",
      description: "A refined assortment of cheeses for villa dining and entertaining.",
      image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=900&q=80",
      products: [
        { sourceCategory: "Dairy & Charcuterie", sourceName: "Parmigiano Reggiano PDO" },
        { sourceCategory: "Dairy & Charcuterie", sourceName: "Artisanal Fresh Burrata" },
        { sourceCategory: "Dairy & Charcuterie", sourceName: "Manchego Cheese" },
        { sourceCategory: "Dairy & Charcuterie", sourceName: "Brie de Meaux" },
        { sourceCategory: "Dairy & Charcuterie", sourceName: "Gruyère AOP" },
        { sourceCategory: "Dairy & Charcuterie", sourceName: "Buffalo Mozzarella" },
      ],
    },
    {
      id: "breakfast-essentials",
      category: "Villa Essentials",
      name: "Breakfast Essentials",
      description: "Thoughtful breakfast provisions, ready for relaxed villa mornings.",
      image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=80",
      products: [
        { sourceCategory: "Mixers & Essentials", sourceName: "Organic Gourmet Coffee" },
        { sourceCategory: "Mixers & Essentials", sourceName: "Plant-Based Milk" },
        { sourceCategory: "Mixers & Essentials", sourceName: "Cold-Pressed Juices" },
        { sourceCategory: "Mixers & Essentials", sourceName: "Assorted Organic Teas" },
        { sourceCategory: "Dairy & Charcuterie", sourceName: "Artisanal French Salted Butter" },
        { sourceCategory: "Dairy & Charcuterie", sourceName: "Organic Free-Range Eggs" },
        { sourceCategory: "Bakery & Snacks", sourceName: "Organic Granola with Superfoods" },
        { sourceCategory: "Bakery & Snacks", sourceName: "Artisanal Sourdough Bread" },
        { sourceCategory: "Bakery & Snacks", sourceName: "Butter Croissants" },
      ],
    },
    {
      id: "mexican-pantry",
      category: "Local Selection",
      name: "Mexican Pantry",
      description: "A selection of local flavors and Mexican pantry staples.",
      image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=80",
      products: [
        { sourceCategory: "Fresh & Specialty", sourceName: "Organic Export-Grade Hass Avocados" },
        { sourceCategory: "Mixers & Essentials", sourceName: "Fresh Limes & Lemons" },
        { sourceCategory: "Oils & Condiments", sourceName: "Oaxacan Mole Negro Paste" },
        { sourceCategory: "Bakery & Snacks", sourceName: "Organic Blue Corn Tortilla Chips" },
      ],
    },
    {
      id: "custom-provisioning",
      category: "Personal Request",
      name: "Custom Provisioning",
      description: "Looking for something specific? Add a request and we will source it.",
      image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=80",
      products: [
        { id: "custom-provisioning-request", name: "Custom Provisioning Request", unit: "As requested" },
      ],
    },
  ];

  function addQuoteProduct({ id, name, unit }, category) {
    if (!id || itemIds.has(id)) {
      throw new Error(`Catalog product IDs must be unique: ${id || name}`);
    }
    itemIds.add(id);
    const index = P.push([name, category, unit, quotePrice]) - 1;
    return { id, index, product: P[index] };
  }

  function resolveFamilyProducts(family) {
    return family.products.map((item) => {
      if (item.sourceCategory && item.sourceName) {
        const index = P.findIndex(
          (product, candidate) =>
            candidate < originalProductCount &&
            product[1] === item.sourceCategory &&
            product[0] === item.sourceName
        );
        if (index < 0) {
          throw new Error(`Missing catalog product: ${item.sourceName}`);
        }
        const id = `${family.id}-${index}`;
        if (itemIds.has(id) || usedProductIndexes.has(index)) {
          throw new Error(`Catalog product is assigned more than once: ${item.sourceName}`);
        }
        itemIds.add(id);
        usedProductIndexes.add(index);
        return { id, index, product: P[index] };
      }

      const resolved = addQuoteProduct(item, family.category);
      usedProductIndexes.add(resolved.index);
      return resolved;
    });
  }

  const families = provisionFamilies.map((family) => ({
    ...family,
    items: resolveFamilyProducts(family),
  }));

  const remainingCategories = new Map();
  P.forEach((product, index) => {
    if (usedProductIndexes.has(index)) return;
    const category = product[1];
    if (!remainingCategories.has(category)) remainingCategories.set(category, []);
    remainingCategories.get(category).push({ product, index });
  });

  remainingCategories.forEach((items, category) => {
    const slug = category.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const image = {
      "Dairy & Charcuterie": "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=900&q=80",
      "Fresh Fish": "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=900&q=80",
      "Fresh & Specialty": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80",
      "Mixers & Essentials": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=80",
      "Oils & Condiments": "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=80",
      "Premium Seafood": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80",
      "Poultry Pork & Lamb": "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=900&q=80",
      "USDA Prime & Wagyu": "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=900&q=80",
      "Bakery & Snacks": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=80",
    }[category];
    families.push({
      id: `category-${slug}`,
      category,
      name: category,
      description: "A curated selection for your villa, selected with care.",
      image,
      items: items.map(({ product, index }) => {
        const id = `catalog-product-${index}`;
        if (itemIds.has(id)) throw new Error(`Catalog product IDs must be unique: ${id}`);
        itemIds.add(id);
        usedProductIndexes.add(index);
        return { id, index, product };
      }),
    });
  });

  if (usedProductIndexes.size !== P.length) {
    throw new Error("Every catalog product must belong to exactly one provision family.");
  }

  if (mediaQuery.matches && families.length) openFamilies.add(families[0].id);

  const searchLabel = document.createElement("label");
  searchLabel.className = "catalog-search-wrap";
  searchLabel.htmlFor = "catalog-search";
  searchLabel.textContent = "Search your provisions";

  const searchInput = document.createElement("input");
  searchInput.id = "catalog-search";
  searchInput.type = "search";
  searchInput.className = "catalog-search";
  searchInput.placeholder = "Search families, categories or products";
  searchInput.setAttribute("aria-label", "Search families, categories or products");
  searchLabel.appendChild(searchInput);
  filterContainer.replaceChildren(searchLabel);

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function familyMatches(family, query) {
    return [family.name, family.category, family.description]
      .some((value) => value.toLocaleLowerCase().includes(query)) ||
      family.items.some((item) => item.product[1].toLocaleLowerCase().includes(query));
  }

  function itemMatches(item, query) {
    return item.product.some((value) => String(value).toLocaleLowerCase().includes(query));
  }

  function renderItem(item, familyId) {
    const [name, , unit, price] = item.product;
    const quantity = selectedQuantities.get(item.id) || 1;
    const priceText = price === quotePrice ? quotePrice : `${price} USD`;
    const quantityId = `quantity-${item.id}`;

    return `
      <article class="provision-item">
        <div class="provision-item-copy">
          <h4>${escapeHtml(name)}</h4>
          <p>${escapeHtml(unit)}</p>
          <span class="provision-item-price">${escapeHtml(priceText)}</span>
        </div>
        <div class="provision-item-actions">
          <div class="provision-quantity" aria-label="Quantity for ${escapeHtml(name)}">
            <button type="button" data-quantity-change="-1" data-item-id="${escapeHtml(item.id)}" aria-label="Decrease quantity">−</button>
            <output id="${quantityId}" aria-live="polite">${quantity}</output>
            <button type="button" data-quantity-change="1" data-item-id="${escapeHtml(item.id)}" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="provision-add" data-add-index="${item.index}" data-family-id="${escapeHtml(familyId)}">+ Add to Villa</button>
        </div>
      </article>`;
  }

  function renderFamily(family, matchingItems, isSearchActive) {
    const isOpen = isSearchActive || openFamilies.has(family.id);
    const panelId = `provision-panel-${family.id}`;
    const image = family.image
      ? `<img class="provision-family-image" src="${escapeHtml(family.image)}" alt="${escapeHtml(family.name)}" loading="lazy">`
      : "";
    const itemList = matchingItems.map((item) => renderItem(item, family.id)).join("");

    return `
      <article class="provision-family${isOpen ? " is-open" : ""}">
        ${image}
        <div class="provision-family-content">
          <p class="provision-family-category">${escapeHtml(family.category)}</p>
          <h3 class="provision-family-title">${escapeHtml(family.name)}</h3>
          <p class="provision-family-description">${escapeHtml(family.description)}</p>
          <button type="button" class="provision-family-toggle" aria-expanded="${isOpen}" aria-controls="${panelId}">
            <span>${isOpen ? "Close Selection" : "View Selection"}</span>
            <span class="provision-family-toggle-icon" aria-hidden="true">${isOpen ? "↑" : "↓"}</span>
          </button>
          <div id="${panelId}" class="provision-family-panel" aria-hidden="${!isOpen}"${isOpen ? "" : " inert"}>
            <div class="provision-family-panel-inner">
              <h4 class="provision-selection-title">Select your provisions <span>(${matchingItems.length})</span></h4>
              <div class="provision-items">${itemList}</div>
            </div>
          </div>
        </div>
      </article>`;
  }

  function renderCatalog() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const isSearchActive = Boolean(query);
    const visibleFamilies = families
      .map((family) => {
        const wholeFamilyMatches = isSearchActive && familyMatches(family, query);
        const matchingItems = wholeFamilyMatches || !isSearchActive
          ? family.items
          : family.items.filter((item) => itemMatches(item, query));
        return { family, matchingItems };
      })
      .filter(({ matchingItems }) => matchingItems.length > 0);

    productContainer.innerHTML = visibleFamilies
      .map(({ family, matchingItems }) => renderFamily(family, matchingItems, isSearchActive))
      .join("");

    productContainer.querySelectorAll(".provision-family-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const familyCard = button.closest(".provision-family");
        const panel = document.getElementById(button.getAttribute("aria-controls"));
        const isOpen = button.getAttribute("aria-expanded") === "true";
        const family = families.find((candidate) => `provision-panel-${candidate.id}` === panel.id);

        if (isOpen) openFamilies.delete(family.id);
        else openFamilies.add(family.id);
        button.setAttribute("aria-expanded", String(!isOpen));
        button.firstElementChild.textContent = isOpen ? "View Selection" : "Close Selection";
        button.lastElementChild.textContent = isOpen ? "↓" : "↑";
        familyCard.classList.toggle("is-open", !isOpen);
        panel.setAttribute("aria-hidden", String(isOpen));
        panel.inert = isOpen;
      });
    });

    productContainer.querySelectorAll("[data-quantity-change]").forEach((button) => {
      button.addEventListener("click", () => {
        const itemId = button.dataset.itemId;
        const quantity = Math.max(1, (selectedQuantities.get(itemId) || 1) + Number(button.dataset.quantityChange));
        selectedQuantities.set(itemId, quantity);
        button.parentElement.querySelector("output").textContent = quantity;
      });
    });

    productContainer.querySelectorAll(".provision-add").forEach((button) => {
      button.addEventListener("click", () => {
        const item = families
          .find((family) => family.id === button.dataset.familyId)
          .items.find((candidate) => candidate.index === Number(button.dataset.addIndex));
        const quantity = selectedQuantities.get(item.id) || 1;

        for (let count = 0; count < quantity; count += 1) {
          if (count === 0) add(item.index);
          else qty(item.index, 1);
        }
      });
    });
  }

  searchInput.addEventListener("input", renderCatalog);
  mediaQuery.addEventListener("change", (event) => {
    if (searchInput.value.trim()) return;
    openFamilies.clear();
    if (event.matches && families.length) openFamilies.add(families[0].id);
    renderCatalog();
  });

  const orderForm = document.querySelector("#order form");
  const cartContainer = document.getElementById("cart");
  const receipt = document.createElement("section");
  receipt.id = "order-ticket";
  receipt.className = "order-ticket";
  receipt.hidden = true;
  receipt.setAttribute("aria-live", "polite");
  cartContainer.insertAdjacentElement("afterend", receipt);

  function hiddenField(name) {
    let input = orderForm.querySelector(`[name="${name}"]`);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      orderForm.appendChild(input);
    }
    return input;
  }

  const orderIdField = hiddenField("order_id");
  const receiptField = hiddenField("receipt");
  const subjectField = orderForm.querySelector('[name="_subject"]');
  const baseSubject = subjectField.value;
  let currentOrderId = null;

  function newOrderId() {
    const random = new Uint8Array(2);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(random);
    else {
      random[0] = Math.floor(Math.random() * 256);
      random[1] = Math.floor(Math.random() * 256);
    }
    const date = new Date();
    const dateCode = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    return `CFP-${dateCode}-${Array.from(random, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
  }

  function getReceiptData() {
    const entries = Object.keys(cart).map((index) => {
      const product = P[index];
      const quantity = cart[index];
      const amount = Number(String(product[3]).replace(/[^0-9.]/g, ""));
      const hasPrice = Number.isFinite(amount) && amount > 0;
      return { name: product[0], unit: product[2], quantity, price: product[3], hasPrice, amount };
    });
    const hasAllPrices = entries.every((entry) => entry.hasPrice);
    const subtotal = hasAllPrices
      ? entries.reduce((sum, entry) => sum + entry.amount * entry.quantity, 0)
      : null;
    const formatMoney = (amount) => new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
    const customer = (name) => orderForm.elements.namedItem(name)?.value.trim() || "";
    const lines = entries.map((entry) => {
      const price = entry.hasPrice ? ` | ${entry.price} USD each` : ` | ${entry.price}`;
      return `${entry.name} | ${entry.unit} | Qty ${entry.quantity}${price}`;
    });
    const customerDetails = {
      name: customer("name"),
      email: customer("email"),
      phone: customer("phone"),
      villa: customer("villa"),
      deliveryDate: customer("delivery_date"),
      notes: customer("notes"),
    };

    return {
      entries,
      hasAllPrices,
      subtotal,
      formatMoney,
      customer: customerDetails,
      text: [
        `ORDER ${currentOrderId}`,
        ...lines,
        hasAllPrices ? `Reference subtotal: ${formatMoney(subtotal)} USD` : "Final pricing: confirmed in your quote",
        "Provisioning request only. Final availability and pricing are confirmed personally.",
        `Customer: ${customerDetails.name || "Not provided"}`,
        `Email: ${customerDetails.email || "Not provided"}`,
        `Phone: ${customerDetails.phone || "Not provided"}`,
        `Villa: ${customerDetails.villa || "Not provided"}`,
        `Delivery date: ${customerDetails.deliveryDate || "Not provided"}`,
        `Notes: ${customerDetails.notes || "None"}`,
      ].join("\n"),
    };
  }

  function renderReceipt() {
    const indexes = Object.keys(cart);
    receipt.hidden = indexes.length === 0;
    if (!indexes.length) {
      currentOrderId = null;
      orderIdField.value = "";
      receiptField.value = "";
      subjectField.value = baseSubject;
      receipt.replaceChildren();
      return;
    }

    if (!currentOrderId) currentOrderId = newOrderId();
    const data = getReceiptData();
    const customerRows = [
      ["Name", data.customer.name],
      ["Email", data.customer.email],
      ["Phone", data.customer.phone],
      ["Villa", data.customer.villa],
      ["Delivery date", data.customer.deliveryDate],
      ["Notes", data.customer.notes],
    ].filter(([, value]) => value);
    const customerMarkup = customerRows.length
      ? `<dl class="ticket-customer-details">${customerRows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`
      : "";
    const totalMarkup = data.hasAllPrices
      ? `<div class="ticket-total"><span>Reference subtotal</span><strong>${escapeHtml(data.formatMoney(data.subtotal))} USD</strong></div>`
      : '<div class="ticket-total"><span>Final pricing</span><strong>Confirmed in your quote</strong></div>';

    receipt.innerHTML = `
      <div class="ticket-heading">
        <div>
          <p class="ticket-eyebrow">Chef Franko · Luxury Villa Provisions</p>
          <h3>Provisioning request</h3>
          <p class="ticket-reference">${escapeHtml(currentOrderId)}</p>
        </div>
        <button type="button" class="ticket-print" id="print-order-ticket">Print / Save as PDF</button>
      </div>
      ${customerMarkup}
      <div class="ticket-lines">
        ${data.entries.map((entry) => `
          <div class="ticket-line">
            <div><strong>${escapeHtml(entry.name)}</strong><span>${escapeHtml(entry.unit)} · Qty ${entry.quantity}</span></div>
            <strong>${entry.hasPrice ? `${escapeHtml(data.formatMoney(entry.amount * entry.quantity))}` : escapeHtml(entry.price)}</strong>
          </div>`).join("")}
      </div>
      ${totalMarkup}
      <p class="ticket-disclaimer">This is a provisioning request, not a payment receipt. Availability and final pricing are confirmed personally.</p>
      <p class="ticket-email-note">This ticket is included in the Formspree email notification when notifications are enabled.</p>`;

    orderIdField.value = currentOrderId;
    receiptField.value = data.text;
    subjectField.value = `${currentOrderId} | ${baseSubject}`;
    receipt.querySelector("#print-order-ticket").addEventListener("click", () => window.print());
  }

  const originalRenderCart = window.renderCart;
  window.renderCart = function renderCartWithTicket() {
    originalRenderCart();
    renderReceipt();
  };

  const originalPrepareOrder = window.prepareOrder;
  window.prepareOrder = function prepareOrderWithTicket() {
    const canSubmit = originalPrepareOrder();
    if (canSubmit) renderReceipt();
    return canSubmit;
  };

  orderForm.addEventListener("input", renderReceipt);
  renderReceipt();

  window.renderProducts = renderCatalog;
  renderCatalog();
})();
