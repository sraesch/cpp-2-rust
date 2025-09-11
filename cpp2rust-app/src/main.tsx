import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import { FluentProvider, webLightTheme } from '@fluentui/react-components';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FluentProvider theme={webLightTheme} style={{ width: '100vw', height: '100%', padding: 0, margin: 0 }}>
      <App />
    </FluentProvider>
  </StrictMode>,
)
