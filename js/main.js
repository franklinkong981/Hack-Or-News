"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $addStoryForm = $("#add-new-story-form");

const $navAddStory = $("#nav-add-story");
const $navFavorites = $("#nav-favorites");
const $navMyStories = $("#nav-my-stories");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

//ALSO: We have the global variables storyList (initialized in getAndShowStoriesOnStart) as well as currentUser(initalized in checkForRememberedUser)

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $addStoryForm,
  ];
  components.forEach(c => c.hide()); //Hide everything except the navbar, then re-display what we need.
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser(); //If there was already a logged in user before, currentUser will be assigned to that user. Otherwise, currentUser is null.
  await getAndShowStoriesOnStart(); //Calls API to get all existing stories and displays them on the page.

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
