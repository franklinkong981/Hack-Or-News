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
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
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
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//When user submits the add story form, get the data from the form, call storyList's add story method to add the story to its list of stories and the API,
// and then put the new story onto the page.
async function addStoryToPage(event) {
  console.debug("addStoryToPage", event);
  event.preventDefault();

  const author = $("#add-new-story-author").val();
  const title = $("#add-new-story-title").val();
  const url = $("#add-new-story-url").val();
  const newStory = {author, title, url};

  await storyList.addStory(currentUser, newStory);

  hidePageComponents();
  putStoriesOnPage();


}
$addStoryForm.on("submit", addStoryToPage);
