
// public/javascripts/tweets.js

function toggleDropdown(tweetId) {
    const dropdownMenu = document.getElementById(`dropdownMenu${tweetId}`);
    dropdownMenu.classList.toggle('show');
}

function deleteTweet(tweetId) {
    // Implement the delete tweet functionality here
    console.log(`Delete tweet with ID: ${tweetId}`);
}

function addTweetToFolder(tweetId) {
    // Implement the add tweet to folder functionality here
    console.log(`Add tweet with ID: ${tweetId} to folder`);
}