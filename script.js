const apiURL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=50&page=1";

const cryptoList = document.getElementById("cryptoList");
const searchInput = document.getElementById("search");

let coinsData = [];

// Fetch crypto data
async function loadCrypto() {
  try {
    const response = await fetch(apiURL);
    const data = await response.json();
    coinsData = data;
    displayCoins(data);
  } catch (err) {
    cryptoList.innerHTML = "<p style='text-align:center;'>Failed to load data.</p>";
  }
}

// Display coins
function displayCoins(coins) {
  cryptoList.innerHTML = "";

  coins.forEach((coin) => {
    const card = document.createElement("div");
    card.className = "coin";

    card.innerHTML = `
      <img src="${coin.image}" alt="${coin.name}">
      <div class="coin-info">
        <div class="coin-name">${coin.name}</div>
        <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
      </div>
      <div class="coin-price ${coin.price_change_percentage_24h >= 0 ? "green" : "red"}">
        $${coin.current_price.toLocaleString()}
      </div>
    `;

    cryptoList.appendChild(card);
  });
}

// Search coins
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  const filtered = coinsData.filter((coin) =>
    coin.name.toLowerCase().includes(value) ||
    coin.symbol.toLowerCase().includes(value)
  );
  displayCoins(filtered);
});

loadCrypto();
