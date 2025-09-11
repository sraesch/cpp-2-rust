import { makeStyles } from '@fluentui/react-components'
import CMakeConfiguration from './components/CMakeConfiguration'

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  }
})

function App(): React.JSX.Element {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <CMakeConfiguration />
    </div>
  )
}

export default App
