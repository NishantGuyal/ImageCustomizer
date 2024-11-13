// Function to get query parameters from a URL
function getQueryParams(url) {
    const params = new URL(url).searchParams;
    const paramsObj = {};

    for (const [key, value] of params.entries()) {
        paramsObj[key] = value;
    }
    return paramsObj;
}

// Example product URL (can be dynamic)
// const productUrl = "https://www.guyal.com?s=2121&sc=2&a1=pe&a2=am&m=spy&e1=ABCD&e2=ABCD&f=0";
const productUrl = "https://www.guyal.com?s=4740";

// Extract parameters from the URL
const params = getQueryParams(productUrl);
const sku = params.s;

if (sku) {

    const url = `https://main.thepersonalizedbest.com/india_json6.json/?site=in4&s=${sku}`;
    fetch(url)
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
            // Print the entire response for debugging
            // console.log("Full Response:", JSON.stringify(data, null, 2));

            // Extract and print sc_value and max_view separately
            const scValue = data.sc || 'sc_value not found';  // Fallback value if sc is not found
            console.log("sc_value:", scValue);

            const maxView = data.max_view || 'max_view not found'; // Fallback value if max_view is not found
            console.log("max_view:", maxView);

            // Generate options data based on parameters
            const optionsData = imageGenerator(params);

            // Create a container to append images (in HTML)
            const imageContainer = document.getElementById('imageContainer'); // Make sure you have a div with id "imageContainer" in HTML

            // Generate the image URLs once the max_view data is available
            for (let i = 1; i <= maxView; i++) {
                let imageUrl = `https://images.thepersonalizedbest.com/engrave.jpg/?${optionsData}&view=${i}&m=1200`;
                console.log(imageUrl);

                // Create and append image element to the DOM
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = `Image View ${i}`;
                imgElement.style.maxWidth = '200px';  // Optional: Style the image (set a max width for example)

                imageContainer.appendChild(imgElement);  // Append the image to the container
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Function to generate options data for the image URL
function imageGenerator(params) {
    let optionsData = "";

    let sku = params.s;
    console.log(sku);

    const engravingSkus = [2089]; 

    if (params.i) {
        // Get the character for initials (i.e., 'a', 'b', 'c', etc.)
        const initial = params.i.toLowerCase();  // Ensure the character is lowercase

        // Convert 'a' -> 0, 'b' -> 1, 'c' -> 2, etc. by subtracting 97 from the character code
        const charCode = initial.charCodeAt(0) - 97;  // 'a' has charCode 97, 'b' -> 98, etc.

        // Adjust the SKU based on the initial (e.g., 'a' -> no change, 'b' -> increment by 1, etc.)
        sku = parseInt(sku) + charCode;  // Add the character code difference to the SKU

    }
    console.log(`Adjusted SKU based on 'i' parameter: ${sku}`);

    optionsData += `sku=${sku}`

    // Metal Logic
    let metalValue = '';
    if (params.m) {
        switch (params.m) {
            case 'no':
                metalValue = 'no';
                break;
            case 'g10y':
            case 'g14y':
            case 'spy':
                metalValue = 'gold';
                break;
            case 'spr':
            case 'g10r':
            case 'g14r':
                metalValue = 'rose';
                break;
            case 's':
            default:
                metalValue = 'silver';
                break;
        }
        optionsData += `&material=${metalValue}`;
    }

    // Font Logic
    let fontId = 0;
    if (params.f) {
        fontId = params.f;
    }
    optionsData += `&fontid=${fontId}`;

    let engravingIndex = 0;

    //Fix for products that require a default engraving to display images
    if (engravingSkus.includes(parseInt(sku))) {
        if (!params.e1) {
            optionsData += `&text${engravingIndex}=Guyal`;
            engravingIndex++;
        }
    }
    for (const key in params) {
        if (key.startsWith('e')) {
            optionsData += `&text${engravingIndex}=${params[key]}`;
            engravingIndex++;
        }
    }

    // Stones Logic
    const ALL_STONES = ['c', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10'];

    if (params['c']) {
        optionsData += `&center=${params['c']}`;
    }

    for (let j in ALL_STONES) {
        const stoneKey = ALL_STONES[j];

        if (params.hasOwnProperty(stoneKey)) {
            const sideIndex = parseInt(stoneKey.slice(1), 10); // Extract number from 's1', 's2', etc.
            if (stoneKey.startsWith('s') && params[stoneKey]) {
                optionsData += `&side${sideIndex}=${params[stoneKey]}`;
            } else if (stoneKey.startsWith('a') && params[stoneKey]) {
                optionsData += `&accent${sideIndex}=${params[stoneKey]}`;
            }
        }
    }

    return optionsData;
}
