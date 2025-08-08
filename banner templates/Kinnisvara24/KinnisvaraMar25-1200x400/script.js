// ✅ Configuration: Choose which XML fields to use
const PROPERTY_FIELDS = {
  url: "url",
  image: "image_medium",
  title: "short_address",
  description: "slogan",
  price: "price",
  location: "province",
};

// ✅ Fetch XML Data from URL
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

// ✅ Parse XML Data
function parseXML(xmlString) {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, "application/xml");
}

// ✅ Extract Data from XML based on Configuration
function extractProperties(xml) {
  const items = xml.getElementsByTagName("item");
  console.log(`Found ${items.length} properties.`);

  if (items.length === 0) return [];

  return Array.from(items).map((item) => ({
    url: item.querySelector(PROPERTY_FIELDS.url)?.textContent?.trim() || "#",
    image: item.querySelector(PROPERTY_FIELDS.image)?.textContent?.trim() || "https://via.placeholder.com/300",
    title: item.querySelector(PROPERTY_FIELDS.title)?.textContent?.trim() || "Unknown Address",
    description: item.querySelector(PROPERTY_FIELDS.description)?.textContent?.trim() || "No description available",
    price: item.querySelector(PROPERTY_FIELDS.price)?.textContent?.trim() || "Price not listed",
    location: item.querySelector(PROPERTY_FIELDS.location)?.textContent?.trim() || "Unknown location",
  }));
}

// ✅ Generate HTML for Swiper Slides
function generateHTML(properties) {
  return properties
    .map(
      ({ url, image, title, description, price, location }) => `
                <div class="swiper-slide slide">
                    <a href="${url}" class="property-url" target="_blank" rel="noopener noreferrer">
                        <div class="img-wrap">
                            <img class="property-img" src="${image}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300'">
                        </div>
                        <div class="info-wrap">
                            <p class="property-name">${title}</p>
                            <p class="property-description">${description}</p>
                            <p class="property-price">${price}</p>
                            <p class="property-location">${location}</p>
                        </div>
                    </a>
                </div>
            `
    )
    .join("");
}

// ✅ Main Function to Fetch & Display Properties
async function fetchProperties() {
  const proxyUrl = "https://corsproxy.io/?";
  const targetUrl = "https://kinnisvara24.ee/dxml-ads?placement=ohtuleht_developments";
  const fullUrl = "https://s.ohtuleht.ee/ads/kinnisvara24/xml";

  const xmlString = await fetchXML(fullUrl);
  if (!xmlString) {
    document.getElementById("property-container").innerHTML = "<p>Failed to load properties.</p>";
    return;
  }

  const xml = parseXML(xmlString);
  const properties = extractProperties(xml);
  document.getElementById("property-container").innerHTML = generateHTML(properties);
}

// ✅ Call the function to fetch and display properties
fetchProperties();
