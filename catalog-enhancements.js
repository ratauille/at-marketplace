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
      image: null,
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
      image: null,
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
      image: null,
      products: [
        { id: "choice-beef-tenderloin", name: "USDA Choice Beef Tenderloin", unit: "1 kg" },
        { id: "prime-beef-tenderloin", name: "USDA Prime Beef Tenderloin", unit: "1 kg" },
        { sourceCategory: "USDA Prime & Wagyu", sourceName: "Filet Mignon / Tenderloin" },
        { id: "whole-center-cut-tenderloin", name: "Whole Center-Cut Tenderloin", unit: "Whole cut" },
        { id: "wagyu-tenderloin", name: "Wagyu Tenderloin", unit: "1 kg" },
      ],
    },
  ];

  function addQuoteProduct({ id, name, unit }) {
    if (!id || itemIds.has(id)) {
      throw new Error(`Catalog product IDs must be unique: ${id || name}`);
    }
    itemIds.add(id);
    const index = P.push([name, "Price confirmed in your quote", unit, quotePrice]) - 1;
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

      const resolved = addQuoteProduct(item);
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
    families.push({
      id: `category-${slug}`,
      category,
      name: category,
      description: "A curated selection for your villa, selected with care.",
      // TODO: Cambiar por foto real de la base de datos o almacenamiento
      image: null,
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
      .some((value) => value.toLocaleLowerCase().includes(query));
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
      ? `<img class="provision-family-image" src="${escapeHtml(family.image)}" alt="" loading="lazy">`
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

  window.renderProducts = renderCatalog;
  renderCatalog();
})();
