import { Button, Text, makeStyles } from '@fluentui/react-components'

export interface CMakeControlsProps {
  generator?: string
  onGenerate?: () => void
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px'
  },
})


export default function CMakeControls({
  generator,
  onGenerate
}: CMakeControlsProps): React.JSX.Element {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <Button
        onClick={onGenerate}
        appearance="primary"
      >
        Generate
      </Button>
      <Text>
        Generator: {generator || 'None'}
      </Text>
    </div >
  )
}
