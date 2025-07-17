// Configuration for XML field mapping
const PROPERTY_FIELDS = {
  url: "url",
  image: "image_medium",
  short_address: "short_address",
  address: "address",
  price: "price",
  floor: "floor",
  rooms: "rooms",
};

// Fetch XML data from a URL and return as text
async function fetchXML(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error("Error fetching XML data:", error);
    return null;
  }
}

// Parse XML string into a DOM document
function parseXML(xmlString) {
  return new DOMParser().parseFromString(xmlString, "application/xml");
}

// Extract relevant property data from the XML DOM
function extractProperties(xml) {
  const items = xml.getElementsByTagName("item");
  if (!items.length) return [];

  return Array.from(items, (item) => {
    const getField = (field, fallback = "") => item.querySelector(PROPERTY_FIELDS[field])?.textContent?.trim() || fallback;

    const address = getField("address");
    const addressParts = address.split(",").map((s) => s.trim());
    const address_part = addressParts.length >= 2 ? addressParts.slice(-2).join(", ") : address;

    return {
      url: getField("url", "#"),
      image: getField("image", "https://placehold.co/400"),
      short_address: getField("short_address", "Unknown Address"),
      address_part,
      price: getField("price"),
      floor: getField("floor"),
      rooms: getField("rooms"),
    };
  });
}

// Fisher-Yates shuffle for array randomization
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate banner HTML for slides with CTA after every 3 flats
function generateHTMLWithCTA(allSlides, ctaImageUrl) {
  const CTA_URL = "https://kinnisvara24.ee/kuulutus/lisa-uus?utm_campaign=lisa_kuulutus&utm_medium=display&utm_source=ohtuleht";
  let html = "";
  for (let i = 0; i < allSlides.length; i++) {
    const slide = allSlides[i];
    html += `
      <div class="swiper-slide slide">
        <div onclick="window.open(olBanner.getClickTag('${slide.url}'), '_blank')" class="property-url">
          <div class="img-wrap">
            <p class="property-price">${slide.price}</p>
            <img class="property-img" src="${slide.image}" loading="lazy" onerror="this.src='https://placehold.co/400'">
          </div>
          <div class="info-wrap">
            <p class="property-short-address">${slide.short_address}</p>
            <div class="info-wrap-sm">
              <p class="property-address-part">${slide.address_part}</p>
              <p class="property-info"><span class="floor">${slide.floor}</span> korrus • <span class="rooms">${slide.rooms}</span> tuba</p>
            </div>
          </div>
        </div>
      </div>
    `;
    // Insert CTA after every 3 flats, but not after last flat
    if ((i + 1) % 3 === 0 || i === allSlides.length - 1) {
      html += `
        <div class="swiper-slide slide-cta" style="background-image: url('${ctaImageUrl}');">
          <div onclick="window.open(olBanner.getClickTag('${CTA_URL}'), '_blank')" class="slide-cta-a">
            <p class="slide-cta-btn">Lisa oma<br>üüripakkumine</p>
          </div>
        </div>
      `;
    }
  }
  return html;
}

// Main function: fetch, parse, shuffle, and display slides with 3 CTA slides
async function fetchProperties() {
  const proxyUrl = "https://s.ohtuleht.ee/ads/kinnisvara24/xml";
  const xmlString = await fetchXML(proxyUrl);
  if (!xmlString) {
    document.getElementById("property-container").innerHTML = "<p>Failed to load properties.</p>";
    return;
  }

  const xml = parseXML(xmlString);
  let properties = extractProperties(xml);
  properties = properties.slice(0, 8); // Use only first 8 flats

  if (properties.length === 0) {
    document.getElementById("property-container").innerHTML = "<p>No properties found.</p>";
    return;
  }

  const shuffled = shuffle(properties);
  const ctaImageUrl = shuffled[0]?.image || "https://placehold.co/400";
  document.getElementById("property-container").innerHTML = generateHTMLWithCTA(shuffled, ctaImageUrl);
}

// Initialize property slider on page load
fetchProperties();

var olBanner = {
  getQueryStringValue: function (key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&?]" + encodeURIComponent(key).replace(/[.+*]/g, "$&") + "(?:=([^&]*))?)?.*$", "i"), "$1"));
  },
  getClickTag: function (customDestinationUrl) {
    this.clickMacro = this.getQueryStringValue("clickMacro");
    this.clickTag = this.getQueryStringValue("clickTag");

    if (customDestinationUrl !== undefined && customDestinationUrl.length > 0) {
      return this.clickMacro + customDestinationUrl;
    } else {
      return this.clickTag;
    }
  },
};
var clickTag = "";
