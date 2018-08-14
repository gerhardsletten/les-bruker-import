import React from 'react';
import { hot } from 'react-hot-loader'
import App from './App'
import { injectGlobal, ThemeProvider } from 'styled-components'
import reset from 'styled-reset'
import { defaultTheme } from 'smooth-ui'

injectGlobal`
  ${reset}
  html {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
`

const theme = {
  ...defaultTheme,
  primary: 'blue',
}

const Root = () => (
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
  )

export default hot(module)(Root)