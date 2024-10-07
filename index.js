$(document).ready(() => {
  // Global variables
  const $feed = $('#feed');
  const $tweetForm = $('form.tweet-form');
  const $usernameInput = $tweetForm.find('.username-input');
  const $tweetInput = $tweetForm.find('.tweet-input');
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

  // Function to handle form submission (post a tweet)
  const handleTweetSubmission = () => {
    $tweetForm.submit((event) => {
      event.preventDefault();
      const username = $usernameInput.val().trim();
      const message = $tweetInput.val().trim();

      if (username && message) {
        const tweet = {
          user: username,
          message: message,
          created_at: new Date(),
        };

        // Add tweet to both the user's stream and home stream
        if (!streams.users[username]) {
          streams.users[username] = [];
        }
        streams.users[username].push(tweet);
        streams.home.push(tweet);

        // Clear input fields
        $usernameInput.val('');
        $tweetInput.val('');

        // Display the new tweet immediately
        checkForNewTweets();
      }
    });
  };

  // Initialize the page
  const init = () => {
    handleTweetSubmission(); // Handle tweet form submission
    checkForNewTweets(); // Show initial tweets
    setInterval(checkForNewTweets, 2000); // Check for new tweets every 2 seconds
  };

  init(); // Start the app
});
