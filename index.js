$(document).ready(() => {
  // Global variables
  const $feed = $('#feed');
  let lastTweetIndex = 0;

  // Function to format timestamps
  const formatTime = (timestamp) => {
    return moment(timestamp).fromNow();
  };

  // Function to render tweets
  const renderTweets = (tweets) => {
    $feed.empty(); // Clear the feed for a fresh render

    // Loop through tweets in reverse chronological order
    for (let i = tweets.length - 1; i >= 0; i--) {
      const tweet = tweets[i];
      const $tweet = $('<div></div>').addClass('tweet-box');
      const $user = $('<div></div>').addClass('username').text(`@${tweet.user}`);
      const $message = $('<p></p>').text(tweet.message);
      const $time = $('<span></span>').addClass('timestamp').text(formatTime(tweet.created_at));

      // Click event to filter tweets by user
      $user.click(() => showUserTweets(tweet.user));

      // Append tweet details to the tweet-box div
      $tweet.append($user, $message, $time);
      $feed.append($tweet); // Add tweet to the feed
    }
  };

  // Function to display new tweets periodically
  const checkForNewTweets = () => {
    if (streams.home.length > lastTweetIndex) {
      const newTweets = streams.home.slice(lastTweetIndex);
      lastTweetIndex = streams.home.length;
      renderTweets(newTweets);
    }
  };

  // Show specific user tweets
  const showUserTweets = (user) => {
    const userTweets = streams.users[user];
    renderTweets(userTweets);
  };

  // Form for submitting a new tweet
  const setupTweetForm = () => {
    const $form = $('form.tweet-form');
    const $input = $form.find('input');
    const $button = $form.find('button');

    // On form submit, post a new tweet
    $form.submit((event) => {
      event.preventDefault();
      const message = $input.val();
      if (message) {
        writeTweet(message); // Add the tweet to the stream
        $input.val(''); // Clear input field
        checkForNewTweets(); // Immediately show the new tweet
      }
    });
  };

  // Initialize the page
  const init = () => {
    setupTweetForm(); // Set up the tweet form
    checkForNewTweets(); // Show initial tweets
    setInterval(checkForNewTweets, 2000); // Check for new tweets every 2 seconds
  };

  init(); // Start the app
});