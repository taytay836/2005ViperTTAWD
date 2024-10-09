$(document).ready(() => {
  // Global variables
  const $feed = $('#feed');
  const $tweetForm = $('form.tweet-form');
  const $usernameInput = $tweetForm.find('.username-input');
  const $tweetInput = $tweetForm.find('.tweet-input');
  const $filterIndicator = $('#filter-indicator');
  const $filterText = $('#filter-text');
  const $clearFilterBtn = $('#clear-filter');
  const $refreshFeedBtn = $('#refresh-feed');

  let lastTweetIndex = 0;
  let activeUserFilter = null; // Track active user filter
  let activeHashtagFilter = null; // Track active hashtag filter

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
      const $tweet = $('<div></div>').addClass('tweet-box d-flex align-items-center');
      const $user = $('<div></div>').addClass('username').text(`@${tweet.user}`);
      const $message = $('<p></p>').html(parseHashtags(tweet.message));
      const $time = $('<span></span>').addClass('timestamp').text(formatTime(tweet.created_at));

      // Click event to filter tweets by user
      $user.click(() => {
        activeUserFilter = tweet.user; // Set the active user filter
        activeHashtagFilter = null; // Clear hashtag filter when showing user tweets
        showUserTweets(tweet.user);
        showFilterIndicator(`Showing tweets by @${tweet.user}`);
      });

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

      // Check if an active user or hashtag filter exists
      if (activeUserFilter) {
        showUserTweets(activeUserFilter);
      } else if (activeHashtagFilter) {
        showHashtagTweets(activeHashtagFilter);
      } else {
        renderTweets(newTweets); // Default: Show all new tweets
      }
    }
  };

  // Parse and make hashtags clickable
  const parseHashtags = (message) => {
    return message.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
  };

  // Show specific user tweets
  const showUserTweets = (user) => {
    const userTweets = streams.users[user];
    renderTweets(userTweets);
  };

  // Show tweets by hashtag
  const showHashtagTweets = (hashtag) => {
    const hashtagTweets = streams.home.filter(tweet => tweet.message.includes(hashtag));
    renderTweets(hashtagTweets);
  };

  // Show the filter indicator
  const showFilterIndicator = (message) => {
    $filterText.text(message);
    $filterIndicator.show(); // Make the filter indicator visible
  };

  // Clear filter and reset the view
  const clearFilter = () => {
    activeUserFilter = null;
    activeHashtagFilter = null;
    $filterIndicator.hide(); // Hide the filter indicator
    renderTweets(streams.home); // Show all tweets
  };

  // Refresh feed and reset view (same as clearing the filter)
  const refreshFeed = () => {
    clearFilter(); // Same behavior as clear filter
  };

  // Filter by hashtag
  $feed.on('click', '.hashtag', function () {
    const hashtag = $(this).text();
    activeUserFilter = null; // Clear user filter
    activeHashtagFilter = hashtag; // Set active hashtag filter
    showHashtagTweets(hashtag);
    showFilterIndicator(`Showing tweets with ${hashtag}`);
  });

  // Handle clear filter button
  $clearFilterBtn.click(() => clearFilter());

  // Handle refresh feed button
  $refreshFeedBtn.click(() => refreshFeed());

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
    setInterval(checkForNewTweets, 5000); // Slowed down to 5 seconds
  };

  init(); // Start the app
});
