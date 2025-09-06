import { makeStyles, Textarea, TextareaProps } from '@fluentui/react-components'

export interface CMakeLogProps extends Partial<TextareaProps> {
  logMessages: string
}

const useStyles = makeStyles({
  field: {
    flexGrow: 1,
  }
})


export default function CMakeLog(props: CMakeLogProps): React.JSX.Element {
  const classes = useStyles()

  return (
    <Textarea
      {...props}
      className={classes.field}
      value={props.logMessages}
      textarea={{
        style: {
          maxHeight: 'unset'
        }
      }}
      readOnly
    />
  )
}
