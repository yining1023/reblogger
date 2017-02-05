const url = require('url')
const tumblr = require('tumblr.js')
const _ = require('lodash')

const client = tumblr.createClient({
  credentials: {
    consumer_key: process.env.TUMBLR_CONSUMER_KEY,
    consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,
    token: process.env.TUMBLR_TOKEN,
    token_secret: process.env.TUMBLR_TOKEN_SECRET,
  },
  // this option makes the tumblr api library return promises instead of request objects
  returnPromises: true,
})

const destinationBlogName = '100daysitp2017.tumblr.com'

/**
 * fetchPostByUrl
 * @param  {string} postUrl  Valid tumblr blog post url
 * @return {Promise}         Promise returned by the API call to get the blog post from the url
 */
const fetchPostByUrl = (postUrl = '') => {
  if (postUrl.indexOf('http') !== 0) {
    postUrl = `http://${postUrl}`
  }

  const parsedUrl = url.parse(postUrl)
  const blogName = parsedUrl.host

  let id = 0
  if (parsedUrl.path) {
    id = _.get(parsedUrl.path.split('/'), 2)
  }

  return client.blogPosts(blogName, { id })
}

/**
 * Reblogs a Post
 * @param  {string} postUrl  Valid tumblr blog post url
 * @return {Promise}         Promise returned by the API call to reblog
 */
const reblogPost = (postUrl = '') => {
  return fetchPostByUrl(postUrl).then(res => {
    const post = _.get(res, 'posts[0]', {})

    const options = {
      id: post.id,
      reblog_key: post.reblog_key
    }
    return client.reblogPost(destinationBlogName, options)
  })
}

module.exports = {
  fetchPostByUrl,
  reblogPost,
}
