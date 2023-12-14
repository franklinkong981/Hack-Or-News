"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

/*Event delegation: If user clicks on the Hack or News logo on top left of nav bar, run function navAllStories. */
$body.on("click", "#nav-all", navAllStories);

//When user clicks on the "Add Story" navbar link, show the form above the story list that allows the user to add a story to the list.
function navAddStoryClick(event) {
  console.log("navAddStoryClick", event);
  $addStoryForm.show();
}

$navAddStory.on("click", navAddStoryClick);

/** Show login/signup form when user clicks on "login" on upper right of navbar. */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show(); //Things you'll add like add story form link, favorite story list, stories you uploaded list.
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}
