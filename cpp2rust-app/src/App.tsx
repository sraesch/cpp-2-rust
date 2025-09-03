import CMakeConfiguration from './components/CMakeConfiguration'

function App(): React.JSX.Element {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CMakeConfiguration />
    </div>
  )
}

export default App
