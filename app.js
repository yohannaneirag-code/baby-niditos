const COLORS = [
  {id:"rosado", name:"Rosado"},
  {id:"blanco", name:"Blanco"},
  {id:"celeste", name:"Celeste"},
  {id:"lila", name:"Lila"},
  {id:"amarillo", name:"Amarillo"}
];

const PRODUCTS = [
  {id:"ajuar", name:"Ajuar completo"},
  {id:"estrella", name:"Cojín de apego Estrella"},
  {id:"luna", name:"Cojín de apego Luna"},
  {id:"nube", name:"Cojín de apego Nube"},
  {id:"cuna", name:"Cuna colecho"},
  {id:"pulpo", name:"Pulpo de apego"},
  {id:"trenza", name:"Trenza para cuna"}
];

const $ = selector => document.querySelector(selector);
const state = { product: PRODUCTS[0], color: COLORS[0], name: "", withName: true };

function imageFor(product = state.product, color = state.color) {
  return `assets/variantes/${product.id}_${color.id}.png`;
}

function paintProductImage(img, alt) {
  if (!img) return;
  img.src = imageFor();
  img.alt = alt || `${state.product.name} en color ${state.color.name}`;
}

function paint() {
  $("#chosen").value = state.product.name;
  $("#caption").textContent = `${state.product.name} · ${state.color.name}`;
  paintProductImage($("#previewProductImage"));
  const name = state.withName ? state.name : "";
  $("#previewName")?.replaceChildren(document.createTextNode(name));
  document.querySelectorAll(".swatch").forEach(button => {
    button.classList.toggle("selected", button.dataset.color === state.color.id);
    button.setAttribute("aria-pressed", String(button.dataset.color === state.color.id));
  });
}

function go(id) {
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === id));
  window.scrollTo({top:0, behavior:"smooth"});
  $("#mobile")?.classList.remove("open");
}

function showOutOfScope() { $("#modal").hidden = false; }

function chooseProduct(id) {
  const product = PRODUCTS.find(item => item.id === id);
  if (!product) return;
  state.product = product;
  state.color = COLORS[0];
  paint();
  go("personalize");
}

function updateSummary() {
  $("#sumProduct").textContent = state.product.name;
  $("#sumColor").textContent = state.color.name;
  $("#sumName").textContent = state.withName && state.name ? state.name : "No personalizado";
  $("#sumPrice").textContent = "Por cotizar";
  paintProductImage($("#summaryProductImage"), `Resumen: ${state.product.name} color ${state.color.name}`);
}

document.addEventListener("click", event => {
  const nav = event.target.closest("[data-go]");
  if (nav) go(nav.dataset.go);

  if (event.target.closest("[data-out]")) showOutOfScope();

  const productButton = event.target.closest("[data-product-id]");
  if (productButton) chooseProduct(productButton.dataset.productId);

  const swatch = event.target.closest(".swatch[data-color]");
  if (swatch) {
    state.color = COLORS.find(color => color.id === swatch.dataset.color) || COLORS[0];
    paint();
  }

  const filter = event.target.closest("[data-filter]");
  if (filter) {
    document.querySelectorAll(".filter").forEach(button => button.classList.toggle("active", button === filter));
    document.querySelectorAll(".product").forEach(card => {
      card.hidden = filter.dataset.filter !== "Todos" && !card.dataset.category.includes(filter.dataset.filter);
    });
  }
});

$("#menu")?.addEventListener("click", () => $("#mobile").classList.toggle("open"));

document.querySelectorAll('input[name="addName"]').forEach(radio => {
  radio.addEventListener("change", () => {
    state.withName = radio.value === "yes";
    $("#nameWrap").hidden = !state.withName;
    paint();
  });
});

$("#babyName").addEventListener("input", event => {
  state.name = event.target.value.trim();
  paint();
});
$("#nameColor")?.addEventListener("change", paint);

$("#add").addEventListener("click", () => {
  if (state.withName && !state.name) {
    $("#personalError").textContent = "Escribe el nombre del bebé o selecciona “No” para continuar sin personalización.";
    $("#babyName").focus();
    return;
  }
  $("#personalError").textContent = "";
  updateSummary();
  go("summary");
});

$("#customer").addEventListener("submit", event => {
  event.preventDefault();
  const email = $("#email").value.trim();
  const phone = $("#phone").value.trim();

  if (!event.currentTarget.reportValidity()) {
    $("#customerError").textContent = "Completa los campos obligatorios para continuar.";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    $("#customerError").textContent = "Ingresa un correo electrónico válido.";
    $("#email").focus();
    return;
  }
  if (phone.replace(/\D/g, "").length < 8) {
    $("#customerError").textContent = "Ingresa un teléfono válido.";
    $("#phone").focus();
    return;
  }

  $("#customerError").textContent = "";
  $("#successInfo").textContent = `${state.product.name}, color ${state.color.name}${state.withName && state.name ? " · Nombre: " + state.name : ""}. Solicitante: ${$("#fullName").value}.`;
  go("success");
});

$("#close").addEventListener("click", () => $("#modal").hidden = true);
$("#ok").addEventListener("click", () => $("#modal").hidden = true);
$("#modal").addEventListener("click", event => {
  if (event.target.id === "modal") $("#modal").hidden = true;
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") $("#modal").hidden = true;
});

paint();
