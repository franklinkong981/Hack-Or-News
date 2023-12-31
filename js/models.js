"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    let hostname = $('<a>').prop('href', this.url).prop('hostname'); //Creates <a> element, sets href attribute to this.url, and gets its hostname property value.
    return hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - newStory - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    const {title, author, url} = newStory;
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data: { token: user.loginToken, story: { author, title, url } },
    });
    let { story } = response.data;

    let newStoryAdded = new Story(story);
    this.addStoryToStoryList(newStoryAdded);
    return newStoryAdded;
  }

  addStoryToStoryList(newStory) {
    this.stories.unshift(newStory);
  }

  //Deletes the story with id of storyId from the Hack or Snooze API and deletes this story from the curent story list.
  async deleteStory(user, storyId) {
    const response = await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken},
    });
    let { story } = response.data;

    let storyDeleted = new Story(story);
    this.removeStoryFromStoryList(storyDeleted);
    return storyDeleted;
  }

  removeStoryFromStoryList(storyToDelete) {
    for (let i = 0; i < this.stories.length; i++) {
      if (storyToDelete.storyId === this.stories[i].storyId) {
        this.stories.splice(i, 1);
        break;
      }
    }
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;
    let userFavorites = user.favorites.map(s => new Story(s));
    let userOwnStories = user.stories.map(s => new Story(s));

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: userFavorites,
        ownStories: userOwnStories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;
    let userFavorites = user.favorites.map(s => new Story(s));
    let userOwnStories = user.stories.map(s => new Story(s));

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: userFavorites,
        ownStories: userOwnStories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });
  
      let { user } = response.data;
      let userFavorites = user.favorites.map(s => new Story(s));
      let userOwnStories = user.stories.map(s => new Story(s));
      

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: userFavorites,
          ownStories: userOwnStories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  //When user creates a new story, add it to the user's ownStories list.
  addStoryToOwnStories(uploadedStory) {
    this.ownStories.push(uploadedStory);
  }

  //When user deletes a story, remove it from the user's ownStories list.
  removeStoryFromOwnStories(deletedStory) {
    for (let i = 0; i < this.ownStories.length; i++) {
      if (deletedStory.storyId === this.ownStories[i].storyId) {
        this.ownStories.splice(i, 1);
        break;
      }
    }
  }

  //calls the Hack or Snooze API to add the Story with the specific StoryId to the user's favorite stories, then make user instance of updated User and return it.
  static async addStoryToFavorites(token, username, storyId) {
    console.debug("addStoryToFavorites");

    const response = await axios({
      url: `${BASE_URL}/users/${username}/favorites/${storyId}`,
      method: "POST",
      data: { token },
    });

    let { user } = response.data;
    let userFavorites = user.favorites.map(s => new Story(s));
    let userOwnStories = user.stories.map(s => new Story(s));

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: userFavorites,
        ownStories: userOwnStories
      },
      token
    );
  }

  //calls the Hack or Snooze API to remove the Story with the specific StoryId to the user's favorite stories, then make user instance of updated User and return it.
  static async removeStoryFromFavorites(token, username, storyId) {
    console.debug("removeStoryFromFavorites");

    const response = await axios({
      url: `${BASE_URL}/users/${username}/favorites/${storyId}`,
      method: "DELETE",
      data: { token },
    });

    let { user } = response.data;
    let userFavorites = user.favorites.map(s => new Story(s));
    let userOwnStories = user.stories.map(s => new Story(s));

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: userFavorites,
        ownStories: userOwnStories
      },
      token
    );
  }

  //Checks to see whether a Story is found in one of the Story objects in the User's favorites.
  isStoryInFavorites(story) {
    for (let favoriteStory of this.favorites) {
      if (story.storyId === favoriteStory.storyId) {
        return true;
      }
    }
    return false;
  }

  //Checks to see whether a story ID is found as the story ID in one of the Story objects in the User's favorites.
  isStoryIdInFavorites(storyId) {
    for (let favoriteStory of this.favorites) {
      if (storyId === favoriteStory.storyId) {
        return true;
      }
    }
    return false;
  }
}
