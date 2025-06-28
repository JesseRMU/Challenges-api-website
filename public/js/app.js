/**
 * In this code I deliberately are not using
 * any form of error handling.
 * This is to keep the code simple and focused on the main functionality.
 * In a production environment, you should always handle errors properly.
 */
// Self-invoking function to ensure the code runs after the DOM is fully loaded
(function () {
    document.addEventListener('DOMContentLoaded', init);
})();

// setting up the javascript code to run after the page is loaded
async function init() {
    console.log('Page loaded and self-invoking function executed.');
    
    // const tags = await getTags();
    
    // tags.forEach(tag => {
    //     addTagToDocument(tag);
    // });
};

async function getData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Netwerk fout');
    return await response.json();
  } catch (error) {
    console.error('Fout bij ophalen data:', error);
    return null;
  }
}


/**
 * Function to add a tag to the document
 * @param {*} tag 
 */
const addTagToDocument = (tag) => {
    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.innerText = tag.data.name;
    console.log('Adding tag:', tagElement);
    document.getElementById('tags-list').appendChild(tagElement);
};

/**
 * Function to get the tag data (names) from the server
 * @returns the tagData
 */
// const getTags = async () => {
//     // first step - get the tag information / urls
//     const tags = await getData('http://localhost:3012/tags');
//     console.log('Tags fetched:', tags.data);
//     const tagUrls = tags.data;
//     // second step - get the data from the urls. In this case the name of the tag
//     const tagsData = await getAllDataFromDifferentUrls(tagUrls);
//     return tagsData;
// };

document.getElementById('spinBtn').addEventListener('click', async () => {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = 'Laden...';

  try {
    const res = await fetch('/random');
    const data = await res.json();

    if (data.error) {
      resultDiv.innerHTML = 'Er is een fout opgetreden.';
      return;
    }

    resultDiv.innerHTML = `
      <h2>${data.title} (${data.year})</h2>
      <img src="${data.image}" alt="Poster" style="max-width:200px;" />
      <p><strong>Rating:</strong> ${data.rating || 'Onbekend'}</p>
      ${data.number_of_seasons ? `<p><strong>Aantal seizoenen:</strong> ${data.number_of_seasons}</p>` : ''}
      <p>${data.description}</p>
    `;
  } catch (err) {
    resultDiv.innerHTML = 'Kon geen data ophalen.';
  }
});
