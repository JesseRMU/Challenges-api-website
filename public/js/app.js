
// Self-invoking function to ensure the code runs after the DOM is fully loaded
(function () {
    document.addEventListener('DOMContentLoaded', init);
})();

// setting up the javascript code to run after the page is loaded
async function init() {
    console.log('Page loaded and self-invoking function executed.');
};

document.getElementById('spinBtn').addEventListener('click', async (event) => {
  event.preventDefault(); // Anders refreshed de page na het klikken op de spin button
  const resultDiv = document.getElementById('result');
  
  // Maak resultaat  zichtbaar en laat zien als die aan het laden is
  resultDiv.classList.remove('hidden');
  resultDiv.className = 'bg-gray-800 rounded-lg p-6';
  resultDiv.innerHTML = `
    <div class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      <span class="ml-3 text-gray-300">Loading...</span>
    </div>
  `;

  // Genre ID ophalen als die er is
  const genreSelect = document.getElementById('genreSelect');
  const genreId = genreSelect ? genreSelect.value : null;

  // IMDB Score filter ophalen
  const imdbScoreSelect = document.getElementById('imdbScore');
  const imdbScore = imdbScoreSelect ? imdbScoreSelect.value : null;

  // Filter opties ophalen
  const filterMovie = document.getElementById('filterMovie').checked;
  const filterTV = document.getElementById('filterTV').checked;

  // Controleer of er een type is geselecteerd
  if (!filterMovie && !filterTV) {
    resultDiv.innerHTML = `
      <div class="text-yellow-400 text-center py-8">
        <p class="font-semibold">⚠️ Please select at least one type (Movie or TV Show)</p>
      </div>
    `;
    return;
  }

  let url = '/random';
  const params = new URLSearchParams();
  
  if (genreId) {
    params.append('genre', genreId);
  }
  
  if (imdbScore) {
    params.append('imdbScore', imdbScore);
  }
  
  // Voegt  filters toe die filteren op film of serie
  if (filterMovie && !filterTV) {
    params.append('type', 'movie');
  } else if (filterTV && !filterMovie) {
    params.append('type', 'tv');
  }

  // Als ze allebei aangevinkt zijn, geeft hij geen parameter mee
  if (params.toString()) {
    url += `?${params.toString()}`;

  }// errors voor als er iets mis gaat, bijv iets kan niet gefetched worden
  try {
    const res = await fetch(url);
    if (!res.ok) {
      resultDiv.innerHTML = `
        <div class="text-red-400 text-center py-8">
          <p class="font-semibold">❌ Error fetching data</p>
        </div>
      `;
      return;
    }
    const data = await res.json();

    if (data.error) {
      resultDiv.innerHTML = `
        <div class="text-red-400 text-center py-8">
          <p class="font-semibold">❌ An error occurred</p>
        </div>
      `;
      return;
    }

    // Als er gespinned is, toont data die uit api is gehaald op het scherm
    resultDiv.className = 'bg-gray-800 rounded-lg p-6';
    resultDiv.innerHTML = `
      <div class="flex flex-col md:flex-row md:space-x-6">
        <div class="flex-shrink-0 mb-4 md:mb-0">
          <img src="${data.image}" alt="Poster" class="w-32 h-48 md:w-40 md:h-60 rounded-lg shadow-md mx-auto md:mx-0" />
        </div>
        <div class="flex-grow">
          <h2 class="text-xl md:text-2xl font-bold text-white mb-2">${data.title}</h2>
          <div class="text-gray-400 text-sm mb-2">
            <span>${data.year}</span>
            ${data.rating ? `<span class="ml-4">RG: ${data.rating}</span>` : ''}
            ${data.numberOfSeasons && data.numberOfSeasons !== 'N/A' ? `<span class="ml-4">${data.numberOfSeasons} Season${data.numberOfSeasons > 1 ? 's' : ''}</span>` : ''}
          </div>
          <p class="text-gray-300 text-sm leading-relaxed mb-4">${data.description}</p>
          <button 
            class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition duration-300"
            onclick="window.open('https://www.imdb.com/find?q=${encodeURIComponent(data.title)}&ref_=nv_sr_sm', '_blank')"
          >
            Search on IMDB
          </button>
        </div>
      </div>
    `;
  } catch (err) {
    resultDiv.innerHTML = `
      <div class="text-red-400 text-center py-8">
        <p class="font-semibold">❌ Could not fetch data</p>
        <p class="text-sm text-gray-400 mt-2">Check your internet connection</p>
      </div>
    `;
  }
});




