// =======================================================
// PREMIUM SYSTEM
// =======================================================

let isPremium = localStorage.getItem("premium") === "true";

function unlockPremium() {
  isPremium = true;
  localStorage.setItem("premium", "true");
  alert("🎉 Premium unlocked!");
  location.reload();
}


// =======================================================
// THEME SYSTEM (DEFAULT = DARK MODE)
// =======================================================

const themeBtn = document.getElementById("themeBtn");

// Dark = default. Light = optional.
if (themeBtn) {
  themeBtn.onclick = () => {
    document.body.classList.toggle("light");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("light") ? "light" : "dark"
    );
    themeBtn.textContent = document.body.classList.contains("light")
      ? "🌞"
      : "🌙";
  };

  // Apply saved theme (default = dark)
  let saved = localStorage.getItem("theme");

  if (saved === "light") {
    document.body.classList.add("light");
    themeBtn.textContent = "🌞";
  } else {
    // default dark
    themeBtn.textContent = "🌙";
  }
}


// =======================================================
// GLOBAL VARIABLES
// =======================================================

const API =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=100";

let coinsData = [];

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter((x) => x !== id);
  } else {
    favorites.push(id);
  }
  saveFavorites();
}


// =======================================================
// HOME PAGE
// =======================================================

const cryptoList = document.getElementById("cryptoList");
const search = document.getElementById("search");
const sort = document.getElementById("sort");

if (cryptoList) loadCoins();

async function loadCoins() {
  const res = await fetch(API);
  const data = await res.json();
  coinsData = data;
  displayCoins(data);
}

function displayCoins(list) {
  cryptoList.innerHTML = "";

  list.forEach((coin) => {
    const el = document.createElement("div");
    el.className = "coin";

el.innerHTML = `
  <img src="${coin.image}">
  <div class="coin-info">
    <div><strong>${coin.name}</strong> (${coin.symbol.toUpperCase()})</div>
    <div class="price ${coin.price_change_percentage_24h >= 0 ? "green" : "red"}">
      $${coin.current_price.toLocaleString()}
    </div>
    <div class="info-hint">Tap to view full info →</div>
  </div>

  <div class="favorite-btn active" data-id="${coin.id}">★</div>
`;


    // CLICK IMAGE OR TEXT → INFO PAGE
    el.querySelector(".coin-info").onclick = () =>
      (window.location.href = `info.html?id=${coin.id}`);
    el.querySelector("img").onclick = () =>
      (window.location.href = `info.html?id=${coin.id}`);

    // CLICK STAR → FAVORITE
    el.querySelector(".favorite-btn").onclick = (event) => {
      event.stopPropagation();
      const id = event.target.getAttribute("data-id");
      toggleFavorite(id);
      event.target.classList.toggle("active");
    };

    cryptoList.appendChild(el);
  });
}


// =======================================================
// SEARCH
// =======================================================

if (search) {
  search.addEventListener("input", () => {
    const value = search.value.toLowerCase();
    const filtered = coinsData.filter(
      (c) =>
        c.name.toLowerCase().includes(value) ||
        c.symbol.toLowerCase().includes(value)
    );
    displayCoins(filtered);
  });
}


// =======================================================
// SORTING
// =======================================================

if (sort) {
  sort.addEventListener("change", () => {
    let list = [...coinsData];

    if (sort.value === "price_desc")
      list.sort((a, b) => b.current_price - a.current_price);
    if (sort.value === "price_asc")
      list.sort((a, b) => a.current_price - b.current_price);
    if (sort.value === "gainers")
      list.sort(
        (a, b) =>
          b.price_change_percentage_24h - a.price_change_percentage_24h
      );
    if (sort.value === "losers")
      list.sort(
        (a, b) =>
          a.price_change_percentage_24h - b.price_change_percentage_24h
      );

    displayCoins(list);
  });
}


// =======================================================
// FAVORITES PAGE
// =======================================================

const favoritesList = document.getElementById("favoritesList");

if (favoritesList) loadFavoriteCoins();

async function loadFavoriteCoins() {
  if (favorites.length === 0) {
    favoritesList.innerHTML = `<p class='loading'>No favorites saved.</p>`;
    return;
  }

  const res = await fetch(API);
  const data = await res.json();

  const filtered = data.filter((c) => favorites.includes(c.id));
  displayFavorites(filtered);
}

function displayFavorites(list) {
  favoritesList.innerHTML = "";

  list.forEach((coin) => {
    const el = document.createElement("div");
    el.className = "coin";

    el.innerHTML = `
      <img src="${coin.image}">
      <div class="coin-info">
        <div><strong>${coin.name}</strong> (${coin.symbol.toUpperCase()})</div>
        <div class="price ${
          coin.price_change_percentage_24h >= 0 ? "green" : "red"
        }">
          $${coin.current_price.toLocaleString()}
        </div>
      </div>

      <div class="favorite-btn active" data-id="${coin.id}">★</div>
    `;

    // CLICK → INFO PAGE
    el.onclick = () =>
      (window.location.href = `info.html?id=${coin.id}`);

    // REMOVE ON CLICK
    el.querySelector(".favorite-btn").onclick = (event) => {
      event.stopPropagation();
      toggleFavorite(coin.id);
      loadFavoriteCoins();
    };

    favoritesList.appendChild(el);
  });
}


// =======================================================
// INFO PAGE (New Page)
// =======================================================

const infoBox = document.getElementById("infoBox");
const coinTitle = document.getElementById("coinName");

if (infoBox) loadInfoPage();

async function loadInfoPage() {
  const id = new URLSearchParams(location.search).get("id");
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}`
  );
  const coin = await res.json();

  coinTitle.textContent = coin.name;

  infoBox.innerHTML = `
    <div class="info-header">
      <img src="${coin.image.large}">
      <div>
        <h2>${coin.name} (${coin.symbol.toUpperCase()})</h2>
        <h3>$${coin.market_data.current_price.usd.toLocaleString()}</h3>
        <p>24h Change:
          <span class="${
            coin.market_data.price_change_percentage_24h >= 0
              ? "green"
              : "red"
          }">
            ${coin.market_data.price_change_percentage_24h.toFixed(2)}%
          </span>
        </p>
      </div>
    </div>

    <div class="info-section">
      <div class="info-title">Market Information</div>
      <p>Market Cap: $${coin.market_data.market_cap.usd.toLocaleString()}</p>
      <p>24h Volume: $${coin.market_data.total_volume.usd.toLocaleString()}</p>
      <p>Circulating Supply: ${coin.market_data.circulating_supply.toLocaleString()}</p>
      <p>Total Supply: ${coin.market_data.total_supply?.toLocaleString() || "N/A"}</p>
    </div>

    <div class="info-section">
      <div class="info-title">About</div>
      <p>${coin.description.en.slice(0, 600)}...</p>
    </div>

    <div class="info-section">
      <div class="info-title">Where to Buy</div>
      <div class="buy-links">
        <a href="https://www.coinbase.com/price/${coin.id}" target="_blank">Buy on Coinbase</a>
        <a href="https://www.binance.com/en/price/${coin.id}" target="_blank">Buy on Binance</a>
        <a href="https://www.kraken.com/prices/${coin.id}" target="_blank">Buy on Kraken</a>
        <a href="https://www.bybit.com/en-US/trade/spot/${coin.symbol.toUpperCase()}" target="_blank">Buy on Bybit</a>
      </div>
    </div>
  `;
}


// =======================================================
// PREMIUM NAV DISPLAY
// =======================================================

const premiumNav = document.getElementById("premiumNav");

if (premiumNav && isPremium) {
  premiumNav.innerHTML = "💎 Premium (Active)";
  premiumNav.style.color = "gold";
  premiumNav.style.fontWeight = "bold";
}
