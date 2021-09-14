import React, { useState, useEffect } from 'react'
import mockUser from './mockData.js/mockUser'
import mockRepos from './mockData.js/mockRepos'
import mockFollowers from './mockData.js/mockFollowers'
import axios from 'axios'

const rootUrl = 'https://api.github.com'

const GithubContext = React.createContext()

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser)
  const [repos, setRepos] = useState(mockRepos)
  const [followers, setFollowers] = useState(mockFollowers)

  //request loading
  const [requests, setRequests] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({ type: false, msg: '' })

  function toggleError(type = false, msg) {
    setError({ type, msg })
  }
  //check rate
  const checkRequests = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data
        console.log(remaining)
        setRequests(remaining)
        if (remaining === 0) {
          //throw error
          toggleError(true, 'soory u have excceded the limit')
        }
      })
      .catch((err) => console.log(err))
  }

  useEffect(checkRequests, [])

  const searchUsers = async (user) => {
    toggleError()
    setLoading(true)
    const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
      console.log(err)
    )

    if (response) {
      setGithubUser(response.data)

      const { repos_url, followers_url } = response.data

      await axios(`${rootUrl}/users/${user}/repos?per_page=100`).then(
        ({ data }) => setRepos(data)
      )
      await axios(`${followers_url}?per_page=100`).then(({ data }) =>
        setFollowers(data)
      )
    } else {
      toggleError(true, 'there is no such username')
    }
    setLoading(false)
    checkRequests()
  }

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchUsers,
        loading,
      }}
    >
      {children}
    </GithubContext.Provider>
  )
}

export { GithubProvider, GithubContext }
