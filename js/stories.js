"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories(); //Loading message will display while this is waiting to complete.
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * - includeDeleteButton: Boolean indicating whether we are including a delete button next to each story.
 * If we are displaying only the user's own stories, then includeDeleteButton is true. Otherwise, it's false.
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, includeDeleteButton) {
  // console.debug("generateStoryMarkup", story);
  let deleteButtonHTML = includeDeleteButton ? `<button class="delete-button">Delete Story</button>` : ``;

  const hostName = story.getHostName();
  let favoriteButtonText = "";
  if (currentUser) {
    favoriteButtonText = currentUser.isStoryInFavorites(story) ? "Remove from Favorites" : "Add to Favorites";
  }
  let favoriteButtonHTML = currentUser ? `<button class="favorite-button">${favoriteButtonText}</button>` : ``;

  return $(`
      <li id="${story.storyId}">
        ${deleteButtonHTML}
        ${favoriteButtonHTML}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story, false);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//If user clicks on the button that says "Add to Favorites" or "Remove from Favorites", the following function will be executed:
//If the story associated with the button is currently in the User's favorite stories, it will be removed from the User's favorite stories.
//If the story associated with the button is currently not in the User's favorite stories, it will be added to the User's favorite stories.
$allStoriesList.on("click", ".favorite-button", async function(event) {
  console.debug("Add/Remove from Favorites button clicked", event);

  const currentStoryId = $(this).parent().attr("id");
  if (!(currentUser.isStoryIdInFavorites(currentStoryId))) {
    currentUser = await User.addStoryToFavorites(currentUser.loginToken, currentUser.username, currentStoryId);
    $(this).text("Remove from Favorites");
  } else {
    currentUser = await User.removeStoryFromFavorites(currentUser.loginToken, currentUser.username, currentStoryId);
    $(this).text("Add to Favorites");
  }
});

//If user is viewing only their own stories and they click the Delete button next to one of their stories, the story will be deleted from 3 places:
// The API (a call will be made to delete the Story information), the current Story List of all stories to be displayed, and the current logged in user's
// list of own stories. The user's updated list of own stories will then be displayed.
$allStoriesList.on("click", ".delete-button", async function(event) {
  console.debug("Delete button clicked", event);

  const deletedStoryId = $(this).parent().attr("id");
  const deletedStory = await storyList.deleteStory(currentUser, deletedStoryId);
  currentUser.removeStoryFromOwnStories(deletedStory);

  hidePageComponents();
  putOwnStoriesOnPage();
})

//When user submits the add story form, get the data from the form, call storyList's add story method to add the story to its list of stories and the API,
// add the story to the User's list of own stories, and then put the new story onto the page.
async function addStoryToPage(event) {
  console.debug("addStoryToPage", event);
  event.preventDefault();

  const author = $("#add-new-story-author").val();
  const title = $("#add-new-story-title").val();
  const url = $("#add-new-story-url").val();
  const newStory = {author, title, url};

  const storyToAdd = await storyList.addStory(currentUser, newStory);
  currentUser.addStoryToOwnStories(storyToAdd);

  $addStoryForm.trigger("reset");
  hidePageComponents();
  putStoriesOnPage();
}
$addStoryForm.on("submit", addStoryToPage);

//Gets the current logged in user's list of favorited stories, generates their HTML, and displays them on the page.
function putFavoritesOnPage() {
  console.debug("Put Favorites on Page");

  $allStoriesList.empty();

  // loop through all of the user's favorite stories and generate HTML for them
  for (let favoriteStory of currentUser.favorites) {
    const $favoriteStory = generateStoryMarkup(favoriteStory, false);
    $allStoriesList.append($favoriteStory);
  }

  $allStoriesList.show();
}

//Gets the current logged in user's list of stories they uploaded, generates their HTML, and displays them on the page.
function putOwnStoriesOnPage() {
  console.debug("Put Own Stories on Page");

  $allStoriesList.empty();

  // loop through all of the user's own stories from least to most recent and generate HTML for them.
  for (let i = currentUser.ownStories.length-1; i >= 0; i--) {
    const $ownStory = generateStoryMarkup(currentUser.ownStories[i], true);
    $allStoriesList.append($ownStory);
  }

  $allStoriesList.show();
}


